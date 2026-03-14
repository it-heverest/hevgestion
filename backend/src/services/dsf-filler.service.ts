// backend/src/services/dsf-filler.service.ts
import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { NOTE_EXPORT_MAP } from "./excel/export-map";
import { createTemplateCopy } from "./dsf-template.service";

export class DsfFillerService {
    /**
     * Get the template path for a folder
     */
    private getTemplatePath(folderId: string): string {
        return path.join(config.upload.directory, "dsf-templates", folderId, "template.xlsx");
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
     * Creates a copy of the template first, then fills it
     */
    async fillTemplate(folderId: string, clientName: string): Promise<{ buffer: Buffer; filePath: string }> {
        // First, create a copy of the template with client name
        const copyPath = createTemplateCopy(folderId, clientName);
        
        // Fetch report data
        const dsf = await prisma.dSF.findUnique({
            where: { folderId },
        });

        if (!dsf) {
            // Clean up the copy if DSF not found
            if (fs.existsSync(copyPath)) {
                fs.unlinkSync(copyPath);
            }
            throw new Error("Données DSF introuvables pour ce dossier. Veuillez d'abord générer ou importer les rapports.");
        }

        // Load the COPY (not the original template)
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(copyPath);

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

            // Fill Header (Entête) - but NOT the entity/company name
            if (mapping.entete && noteData.entete) {
                for (const [field, cellRef] of Object.entries(mapping.entete)) {
                    if (typeof cellRef !== "string") continue;
                    
                    // Skip entity name fields - don't overwrite them in the template
                    if (field.toLowerCase().includes("entity") || 
                        field.toLowerCase().includes("company") ||
                        field.toLowerCase().includes("nom") && field.toLowerCase().includes("entreprise")) {
                        continue;
                    }
                    
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

        console.log(`📊 Export DSF: Filled ${filledCount} notes into template for folder ${folderId}, client: ${clientName}`);

        // Save the filled workbook to the copy
        await workbook.xlsx.writeFile(copyPath);

        // Read the filled file and return as buffer
        const buffer = fs.readFileSync(copyPath);
        
        // Clean up the temporary copy after reading
        // (Optional: keep it if you want to keep history)
        // fs.unlinkSync(copyPath);

        return { buffer, filePath: copyPath };
    }
}

export const dsfFillerService = new DsfFillerService();
