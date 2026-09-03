// src/routes/dsf-template.routes.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../middleware/auth.middleware";
import { config } from "../config";
import {
    saveTemplate,
    getTemplateStatus,
    deleteTemplate,
    getTemplateBuffer,
    resolveTemplatePath,
} from "../services/dsf-template.service";
import { dsfFillerService } from "../services/dsf-filler.service";
import { NotesService } from "../services/notes.service";
import { prisma } from "../lib/prisma";
import { userHasFolderAccess } from "../utils/folder-access";

const notesService = new NotesService();

// Multer storage for template uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const templatesDir = path.join(config.upload.directory, config.upload.subDirectories.templates);
        cb(null, templatesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            "dsf-template-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,
    limits: { fileSize: config.upload.maxSize },
    fileFilter: (req, file, cb) => {
        if (config.upload.allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Format invalide. Seuls les fichiers Excel (.xlsx, .xls) sont acceptés."));
        }
    },
});

const router = Router();

// Helper function to get folder info
async function getFolderInfo(folderId: string) {
    const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: {
            client: true
        }
    });
    return folder;
}

// POST /api/dsf-template/upload — Upload DSF Excel template (user-level for backward compatibility)
// OR /api/dsf-template/upload/:folderId (folder-level)
router.post(
    "/upload/:folderId?",
    authenticate,
    upload.single("file"),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Non authentifié" });
            }

            if (!req.file) {
                return res
                    .status(400)
                    .json({ success: false, message: "Aucun fichier fourni" });
            }

            // Use folderId if provided, otherwise use userId for backward compatibility
            const folderId = req.params.folderId;
            if (folderId && !(await userHasFolderAccess(userId, folderId, (req as any).user?.role))) {
                return res.status(403).json({ success: false, message: "Accès refusé à ce dossier" });
            }
            const identifier = folderId || userId;

            // Save template
            saveTemplate(identifier, req.file.path);

            return res.json({
                success: true,
                message: "Template DSF importé avec succès",
                data: getTemplateStatus(identifier),
            });
        } catch (error: any) {
            console.error("Error uploading DSF template:", error);
            return res
                .status(500)
                .json({ success: false, message: error.message || "Erreur interne" });
        }
    }
);

// GET /api/dsf-template/status — Check user-level template (backward compatibility)
// OR /api/dsf-template/status/:folderId (folder-level)
router.get("/status/:folderId?", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Non authentifié" });
        }

        // Use folderId if provided, otherwise use userId for backward compatibility
        const folderId = req.params.folderId;
        if (folderId && !(await userHasFolderAccess(userId, folderId, (req as any).user?.role))) {
            return res.status(403).json({ success: false, message: "Accès refusé à ce dossier" });
        }

        // Au niveau d'un dossier, on renvoie le template réellement utilisé à
        // l'export: celui du dossier s'il existe, sinon celui des Paramètres.
        // Sans ce repli, l'écran affiche "aucun template" alors que l'export en
        // trouverait un.
        if (folderId) {
            const folder = await prisma.folder.findUnique({
                where: { id: folderId },
                select: { ownerId: true },
            });
            const resolved = resolveTemplatePath(folderId, [folder?.ownerId, userId]);
            if (!resolved) {
                return res.json({ success: true, data: { hasTemplate: false } });
            }
            return res.json({
                success: true,
                data: {
                    ...getTemplateStatus(resolved.identifier),
                    source: resolved.source,
                },
            });
        }

        return res.json({
            success: true,
            data: { ...getTemplateStatus(userId), source: "settings" },
        });
    } catch (error: any) {
        console.error("Error getting template status:", error);
        return res
            .status(500)
            .json({ success: false, message: error.message || "Erreur interne" });
    }
});

// DELETE /api/dsf-template — Remove user template (backward compatibility)
// OR /api/dsf-template/:folderId (folder-level)
router.delete("/:folderId?", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Non authentifié" });
        }

        // Use folderId if provided, otherwise use userId for backward compatibility
        const folderId = req.params.folderId;
        if (folderId && !(await userHasFolderAccess(userId, folderId, (req as any).user?.role))) {
            return res.status(403).json({ success: false, message: "Accès refusé à ce dossier" });
        }
        const identifier = folderId || userId;

        const deleted = deleteTemplate(identifier);
        return res.json({
            success: true,
            message: deleted
                ? "Template supprimé avec succès"
                : "Aucun template à supprimer",
        });
    } catch (error: any) {
        console.error("Error deleting template:", error);
        return res
            .status(500)
            .json({ success: false, message: error.message || "Erreur interne" });
    }
});

// GET /api/dsf-template/download — Download user template (backward compatibility)
// OR /api/dsf-template/download/:folderId (folder-level)
router.get("/download/:folderId?", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Non authentifié" });
        }

        // Use folderId if provided, otherwise use userId for backward compatibility
        const folderId = req.params.folderId;
        if (folderId && !(await userHasFolderAccess(userId, folderId, (req as any).user?.role))) {
            return res.status(403).json({ success: false, message: "Accès refusé à ce dossier" });
        }

        // Même résolution que l'export: dossier puis Paramètres.
        let identifier = userId;
        if (folderId) {
            const folder = await prisma.folder.findUnique({
                where: { id: folderId },
                select: { ownerId: true },
            });
            const resolved = resolveTemplatePath(folderId, [folder?.ownerId, userId]);
            identifier = resolved ? resolved.identifier : folderId;
        }

        const buffer = getTemplateBuffer(identifier);
        if (!buffer) {
            return res.status(404).json({
                success: false,
                message: "Aucun template DSF trouvé.",
            });
        }

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", 'attachment; filename="template.xlsx"');
        return res.send(buffer);
    } catch (error: any) {
        console.error("Error downloading template:", error);
        return res
            .status(500)
            .json({ success: false, message: error.message || "Erreur interne" });
    }
});

// GET /api/dsf-template/export-data/:folderId — Get all notes data for export
router.get(
    "/export-data/:folderId",
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Non authentifié" });
            }

            const { folderId } = req.params;
            if (!folderId) {
                return res
                    .status(400)
                    .json({ success: false, message: "folderId requis" });
            }
            if (!(await userHasFolderAccess(userId, folderId, (req as any).user?.role))) {
                return res.status(403).json({ success: false, message: "Accès refusé à ce dossier" });
            }

            // Fetch all notes for the folder
            const notes = await notesService.getNotesForFolder(folderId);

            // Build a map of noteNumber → data
            const notesMap: Record<string, any> = {};
            for (const note of notes) {
                notesMap[note.noteNumber] = note.data;
            }

            return res.json({
                success: true,
                data: notesMap,
            });
        } catch (error: any) {
            console.error("Error getting export data:", error);
            return res
                .status(500)
                .json({ success: false, message: error.message || "Erreur interne" });
        }
    }
);

// GET /api/dsf-template/export/:folderId — Export filled Excel template with client name
router.get(
    "/export/:folderId",
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Non authentifié" });
            }

            const { folderId } = req.params;
            if (!folderId) {
                return res.status(400).json({ success: false, message: "folderId requis" });
            }
            if (!(await userHasFolderAccess(userId, folderId, (req as any).user?.role))) {
                return res.status(403).json({ success: false, message: "Accès refusé à ce dossier" });
            }

            // Get folder and client info
            const folder = await getFolderInfo(folderId);
            if (!folder) {
                return res.status(404).json({ success: false, message: "Dossier non trouvé" });
            }

            // Use client name for the export file
            const clientName = folder.client?.name || "Client";

            // Fill template - this creates a copy and fills it.
            // Le template des Paramètres (stocké sous l'identifiant
            // utilisateur) sert de repli quand le dossier n'en a pas.
            const { buffer, filePath } = await dsfFillerService.fillTemplate(
                folderId,
                clientName,
                [folder.ownerId, userId]
            );

            // Get the filename from the created file
            const fileName = path.basename(filePath);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${fileName}"`
            );

            return res.send(buffer);
        } catch (error: any) {
            console.error("Error exporting DSF template:", error);
            return res
                .status(500)
                .json({ success: false, message: error.message || "Erreur interne" });
        }
    }
);

export default router;
