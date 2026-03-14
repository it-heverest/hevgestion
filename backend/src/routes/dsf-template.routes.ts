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
} from "../services/dsf-template.service";
import { dsfFillerService } from "../services/dsf-filler.service";
import { NotesService } from "../services/notes.service";
import { prisma } from "../lib/prisma";

const notesService = new NotesService();

// Multer storage for template uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.upload.directory);
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
        const identifier = folderId || userId;

        return res.json({
            success: true,
            data: getTemplateStatus(identifier),
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
        const identifier = folderId || userId;

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

            // Get folder and client info
            const folder = await getFolderInfo(folderId);
            if (!folder) {
                return res.status(404).json({ success: false, message: "Dossier non trouvé" });
            }

            // Use client name for the export file
            const clientName = folder.client?.name || "Client";

            // Fill template - this creates a copy and fills it
            const { buffer, filePath } = await dsfFillerService.fillTemplate(folderId, clientName);

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
