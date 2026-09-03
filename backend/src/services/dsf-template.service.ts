// backend/src/services/dsf-template.service.ts
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";

// Folder/user identifiers are always UUIDs (Prisma cuid/uuid ids). Reject
// anything else before it reaches a filesystem path — this identifier is
// attacker-controlled (comes straight from a URL param) and without this
// check a value like "../../../etc" would escape the templates directory.
const SAFE_IDENTIFIER = /^[a-zA-Z0-9_-]+$/;

function assertSafeIdentifier(identifier: string): void {
    if (!identifier || !SAFE_IDENTIFIER.test(identifier)) {
        throw new Error("Identifiant de dossier invalide");
    }
}

/**
 * Get the templates directory for a folder (or user for backward compatibility)
 */
function getTemplateDir(identifier: string, isUserId: boolean = false): string {
    assertSafeIdentifier(identifier);
    if (isUserId) {
        // Backward compatibility: store per user
        return path.join(config.upload.directory, config.upload.subDirectories.templates, identifier);
    }
    // New: store per folder
    return path.join(config.upload.directory, config.upload.subDirectories.templates, identifier);
}

/**
 * Get the path to the template file (folder or user)
 */
function getTemplatePath(identifier: string): string {
    return path.join(getTemplateDir(identifier), "template.xlsx");
}

/**
 * Check if folder/user has an uploaded template
 */
export function hasTemplate(identifier: string): boolean {
    return fs.existsSync(getTemplatePath(identifier));
}

/**
 * Get template status info
 */
export function getTemplateStatus(identifier: string): {
    hasTemplate: boolean;
    fileName?: string;
    uploadDate?: string;
    fileSize?: number;
} {
    const templatePath = getTemplatePath(identifier);
    if (!fs.existsSync(templatePath)) {
        return { hasTemplate: false };
    }

    const stats = fs.statSync(templatePath);
    return {
        hasTemplate: true,
        fileName: "template.xlsx",
        uploadDate: stats.mtime.toISOString(),
        fileSize: stats.size,
    };
}

/**
 * Save uploaded template file for a specific folder (or user for backward compatibility)
 */
export function saveTemplate(identifier: string, filePath: string): void {
    const templateDir = getTemplateDir(identifier);

    // Create directory if needed
    if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
    }

    const destPath = getTemplatePath(identifier);

    // Copy the uploaded file to the template location
    fs.copyFileSync(filePath, destPath);

    // Remove the temp upload file
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

/**
 * Delete template for folder/user
 */
export function deleteTemplate(identifier: string): boolean {
    const templatePath = getTemplatePath(identifier);
    if (fs.existsSync(templatePath)) {
        fs.unlinkSync(templatePath);
        return true;
    }
    return false;
}

/**
 * Get the raw template file as a Buffer (for downloading)
 */
export function getTemplateBuffer(identifier: string): Buffer | null {
    const templatePath = getTemplatePath(identifier);
    if (!fs.existsSync(templatePath)) {
        return null;
    }
    return fs.readFileSync(templatePath);
}

/**
 * Résout le template applicable à un dossier.
 *
 * Deux niveaux coexistent et doivent désigner le même fichier du point de vue
 * de l'utilisateur: le template importé depuis l'écran Paramètres est stocké
 * sous l'identifiant de l'utilisateur, alors qu'un template importé depuis un
 * dossier est stocké sous l'identifiant du dossier. L'export doit donc
 * chercher d'abord un template propre au dossier, puis retomber sur celui des
 * Paramètres du propriétaire — sinon un template configuré dans les Paramètres
 * reste invisible à l'export.
 *
 * @param ownerIds identifiants utilisateur à essayer en repli (propriétaire du
 *                 dossier, puis utilisateur courant)
 */
export function resolveTemplatePath(
    folderId: string,
    ownerIds: (string | null | undefined)[] = []
): { path: string; source: "folder" | "settings"; identifier: string } | null {
    const folderTemplate = getTemplatePath(folderId);
    if (fs.existsSync(folderTemplate)) {
        return { path: folderTemplate, source: "folder", identifier: folderId };
    }

    for (const ownerId of ownerIds) {
        if (!ownerId) continue;
        const userTemplate = getTemplatePath(ownerId);
        if (fs.existsSync(userTemplate)) {
            return { path: userTemplate, source: "settings", identifier: ownerId };
        }
    }

    return null;
}

/**
 * Create a copy of the template for export with client name
 * Returns the path to the copy
 */
export function createTemplateCopy(
    folderId: string,
    clientName: string,
    ownerIds: (string | null | undefined)[] = []
): string {
    const resolved = resolveTemplatePath(folderId, ownerIds);
    if (!resolved) {
        throw new Error(
            "Aucun template DSF trouvé. Importez-en un depuis les Paramètres, ou depuis le dossier."
        );
    }
    const templatePath = resolved.path;

    // Create exports directory if needed
    const exportsDir = path.join(config.upload.directory, config.upload.subDirectories.exports);
    if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Create sanitized client name for filename
    const sanitizedName = clientName
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const copyFileName = `DSF_${sanitizedName}_${timestamp}.xlsx`;
    const copyPath = path.join(exportsDir, copyFileName);

    // Copy the template to the export location
    fs.copyFileSync(templatePath, copyPath);

    return copyPath;
}
