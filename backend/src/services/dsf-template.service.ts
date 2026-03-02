// backend/src/services/dsf-template.service.ts
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";

/**
 * Get the templates directory for a user
 */
function getTemplateDir(userId: string): string {
    return path.join(config.upload.directory, "dsf-templates", userId);
}

/**
 * Get the path to the user's template file
 */
function getTemplatePath(userId: string): string {
    return path.join(getTemplateDir(userId), "template.xlsx");
}

/**
 * Check if user has an uploaded template
 */
export function hasTemplate(userId: string): boolean {
    return fs.existsSync(getTemplatePath(userId));
}

/**
 * Get template status info
 */
export function getTemplateStatus(userId: string): {
    hasTemplate: boolean;
    fileName?: string;
    uploadDate?: string;
    fileSize?: number;
} {
    const templatePath = getTemplatePath(userId);
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
 * Save uploaded template file
 */
export function saveTemplate(userId: string, filePath: string): void {
    const templateDir = getTemplateDir(userId);

    // Create directory if needed
    if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
    }

    const destPath = getTemplatePath(userId);

    // Copy the uploaded file to the template location
    fs.copyFileSync(filePath, destPath);

    // Remove the temp upload file
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

/**
 * Delete user's template
 */
export function deleteTemplate(userId: string): boolean {
    const templatePath = getTemplatePath(userId);
    if (fs.existsSync(templatePath)) {
        fs.unlinkSync(templatePath);
        return true;
    }
    return false;
}

/**
 * Get the raw template file as a Buffer (for downloading)
 */
export function getTemplateBuffer(userId: string): Buffer | null {
    const templatePath = getTemplatePath(userId);
    if (!fs.existsSync(templatePath)) {
        return null;
    }
    return fs.readFileSync(templatePath);
}
