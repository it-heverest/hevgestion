// backend/src/services/dsf-filler.service.ts
import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { NOTE_EXPORT_MAP } from "./excel/export-map";

export class DsfFillerService {
    /**
     * Get the template path for a user
     */
    private getTemplatePath(userId: string): string {
        return path.join(config.upload.directory, "dsf-templates", userId, "template.xlsx");
    }

    /**
     * Map note identifier to DSF model field name
     */
    private getFieldName(noteId: string): string {
        // Handle special cases
        if (noteId === "3C_C01") return "note3c_co1";
        if (noteId === "16B bis") return "note16b_bis";
        if (noteId === "C1/17") return "note17_c1";
        if (noteId === "C1/25") return "note25_c1";
        if (noteId === "C2/25") return "note25_c2";
        if (noteId === "C1/28") return "note28_c1";
        if (noteId === "C2/28") return "note28_c2";

        // Default: "note" + lowercase noteId
        return `note${noteId.toLowerCase()}`;
    }

    /**
     * Fill the template with folder data and return a buffer
     */
    async fillTemplate(userId: string, folderId: string): Promise<Buffer> {
        const templatePath = this.getTemplatePath(userId);
        if (!fs.existsSync(templatePath)) {
            throw new Error("Aucun template DSF trouvé. Veuillez en importer un dans les paramètres.");
        }

        // Fetch report data
        const dsf = await prisma.dSF.findUnique({
            where: { folderId },
        });

        if (!dsf) {
            throw new Error("Données DSF introuvables pour ce dossier. Veuillez d'abord générer ou importer les rapports.");
        }

        // Load workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);

        let filledCount = 0;

        // Fill each note
        for (const [noteId, { config: mapping, sheetName }] of Object.entries(NOTE_EXPORT_MAP)) {
            const fieldName = this.getFieldName(noteId);
            const noteData = (dsf as any)[fieldName];

            if (!noteData) continue;

            // Find sheet (case-insensitive)
            const worksheet = workbook.worksheets.find(
                (ws) => ws.name.trim().toLowerCase() === sheetName.trim().toLowerCase()
            );

            if (!worksheet) {
                // Log but don't fail, maybe the template is missing some sheets
                console.warn(`Sheet "${sheetName}" (Note ${noteId}) not found in template.`);
                continue;
            }

            // Fill Header (Entête)
            if (mapping.entete && noteData.entete) {
                for (const [field, cellRef] of Object.entries(mapping.entete)) {
                    if (typeof cellRef !== "string") continue;
                    const val = noteData.entete[field];
                    if (val !== undefined && val !== null) {
                        const cell = worksheet.getCell(cellRef);
                        cell.value = val;
                    }
                }
            }

            // Fill Sections
            if (mapping.sections) {
                for (const [sectionName, sectionConfig] of Object.entries(mapping.sections as any)) {
                    const sectionData = noteData[sectionName];
                    if (!sectionData || !Array.isArray(sectionData)) continue;

                    const configLignes = (sectionConfig as any).lignes;
                    if (!configLignes || !Array.isArray(configLignes)) continue;

                    for (let i = 0; i < Math.min(sectionData.length, configLignes.length); i++) {
                        const rowData = sectionData[i];
                        const cellMapping = configLignes[i];

                        for (const [fieldName, cellRef] of Object.entries(cellMapping)) {
                            if (typeof cellRef !== "string" || fieldName.startsWith("//")) continue;

                            let value = rowData[fieldName];
                            // Try camelCase if direct match fails (some fields might be inconsistent)
                            if (value === undefined || value === null) {
                                const camelField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                                value = rowData[camelField];
                            }

                            if (value !== undefined && value !== null) {
                                const cell = worksheet.getCell(cellRef);
                                cell.value = value;
                            }
                        }
                    }
                }
            }
            filledCount++;
        }

        // Fill Global Entête if available
        if (dsf.entete) {
            // We could fill company name, etc. globally if needed, 
            // but usually it's already in the sheet-specific entetes.
        }

        console.log(`📊 Export DSF: Filled ${filledCount} notes into template for user ${userId}, folder ${folderId}`);

        // Return as buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}

export const dsfFillerService = new DsfFillerService();
