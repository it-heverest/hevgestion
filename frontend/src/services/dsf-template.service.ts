// services/dsf-template.service.ts
import axios from "axios";
import * as XLSX from "xlsx";
import {
    CONFIG_NOTE1,
    CONFIG_NOTE2,
    CONFIG_NOTE3A,
    CONFIG_NOTE3B,
    CONFIG_NOTE3C,
    CONFIG_C01_NOTE3C,
    CONFIG_NOTE3D,
    CONFIG_NOTE3E,
    CONFIG_NOTE3F,
    CONFIG_NOTE4,
    CONFIG_NOTE5,
    CONFIG_NOTE6,
    CONFIG_NOTE7,
    CONFIG_NOTE8,
    CONFIG_NOTE9,
    CONFIG_NOTE10,
    CONFIG_NOTE11,
    CONFIG_NOTE12,
    CONFIG_NOTE13,
    CONFIG_NOTE14,
    CONFIG_NOTE15A,
    CONFIG_NOTE15B,
    CONFIG_NOTE16A,
    CONFIG_NOTE16B,
    CONFIG_NOTE16B_BIS,
    CONFIG_NOTE16C,
    CONFIG_NOTE17,
    CONFIG_NOTE17_C1,
    CONFIG_NOTE18,
    CONFIG_NOTE19,
    CONFIG_NOTE20,
    CONFIG_NOTE23,
    CONFIG_NOTE24,
    CONFIG_NOTE25,
    CONFIG_NOTE25_C1,
    CONFIG_NOTE25_C2,
    CONFIG_NOTE26,
    CONFIG_NOTE28,
    CONFIG_NOTE28_C1,
    CONFIG_NOTE28_C2,
    CONFIG_NOTE29,
    CONFIG_NOTE30,
    CONFIG_NOTE31,
    CONFIG_NOTE32,
    CONFIG_NOTE33,
    CONFIG_NOTE34,
} from "./excel/noteConfigs";

interface TemplateStatus {
    hasTemplate: boolean;
    fileName?: string;
    uploadDate?: string;
    fileSize?: number;
}

// Map note numbers → config mapping + expected sheet name
const NOTE_EXPORT_MAP: Record<
    string,
    { config: any; sheetName: string }
> = {
    "1": { config: CONFIG_NOTE1, sheetName: "Note 1 " },
    "2": { config: CONFIG_NOTE2, sheetName: "NOTE 2" },
    "3A": { config: CONFIG_NOTE3A, sheetName: "NOTE 3A" },
    "3B": { config: CONFIG_NOTE3B, sheetName: "NOTE 3B" },
    "3C": { config: CONFIG_NOTE3C, sheetName: "NOTE 3C" },
    "3C_C01": { config: CONFIG_C01_NOTE3C, sheetName: "C01-NOTE 3C" },
    "3D": { config: CONFIG_NOTE3D, sheetName: "NOTE 3D" },
    "3E": { config: CONFIG_NOTE3E, sheetName: "NOTE 3E" },
    "3F": { config: CONFIG_NOTE3F, sheetName: "NOTE 3F" },
    "4": { config: CONFIG_NOTE4, sheetName: "NOTE 4" },
    "5": { config: CONFIG_NOTE5, sheetName: "NOTE 5 " },
    "6": { config: CONFIG_NOTE6, sheetName: "NOTE 6 " },
    "7": { config: CONFIG_NOTE7, sheetName: "NOTE 7 " },
    "8": { config: CONFIG_NOTE8, sheetName: "NOTE 8 " },
    "9": { config: CONFIG_NOTE9, sheetName: "NOTE 9" },
    "10": { config: CONFIG_NOTE10, sheetName: "NOTE 10" },
    "11": { config: CONFIG_NOTE11, sheetName: "NOTE 11" },
    "12": { config: CONFIG_NOTE12, sheetName: "NOTE 12" },
    "13": { config: CONFIG_NOTE13, sheetName: "NOTE 13" },
    "14": { config: CONFIG_NOTE14, sheetName: "NOTE 14" },
    "15A": { config: CONFIG_NOTE15A, sheetName: "NOTE 15A" },
    "15B": { config: CONFIG_NOTE15B, sheetName: "NOTE 15B" },
    "16A": { config: CONFIG_NOTE16A, sheetName: "NOTE 16A " },
    "16B": { config: CONFIG_NOTE16B, sheetName: "NOTE 16B" },
    "16B bis": { config: CONFIG_NOTE16B_BIS, sheetName: "NOTE 16B BIS" },
    "16C": { config: CONFIG_NOTE16C, sheetName: "NOTE 16C" },
    "17": { config: CONFIG_NOTE17, sheetName: "NOTE 17" },
    "C1/17": { config: CONFIG_NOTE17_C1, sheetName: "C1-NOTE 17" },
    "18": { config: CONFIG_NOTE18, sheetName: "NOTE 18" },
    "19": { config: CONFIG_NOTE19, sheetName: "NOTE 19" },
    "20": { config: CONFIG_NOTE20, sheetName: "NOTE 20" },
    "23": { config: CONFIG_NOTE23, sheetName: "NOTE 23" },
    "24": { config: CONFIG_NOTE24, sheetName: "NOTE 24" },
    "25": { config: CONFIG_NOTE25, sheetName: "NOTE 25" },
    "C1/25": { config: CONFIG_NOTE25_C1, sheetName: "C1-NOTE 25" },
    "C2/25": { config: CONFIG_NOTE25_C2, sheetName: "C2-NOTE 25" },
    "26": { config: CONFIG_NOTE26, sheetName: "NOTE 26" },
    "28": { config: CONFIG_NOTE28, sheetName: "NOTE 28" },
    "C1/28": { config: CONFIG_NOTE28_C1, sheetName: "C1-NOTE 28" },
    "C2/28": { config: CONFIG_NOTE28_C2, sheetName: "C2-NOTE 28" },
    "29": { config: CONFIG_NOTE29, sheetName: "NOTE 29" },
    "30": { config: CONFIG_NOTE30, sheetName: "NOTE 30" },
    "31": { config: CONFIG_NOTE31, sheetName: "NOTE 31" },
    "32": { config: CONFIG_NOTE32, sheetName: "NOTE 32" },
    "33": { config: CONFIG_NOTE33, sheetName: "NOTE 33" },
    "34": { config: CONFIG_NOTE34, sheetName: "NOTE 34" },
};

// ==================== CELL WRITING HELPERS ====================

function setCellValue(
    worksheet: XLSX.WorkSheet,
    cellRef: string,
    value: any
): void {
    if (value === null || value === undefined || value === "") return;
    worksheet[cellRef] =
        typeof value === "number"
            ? { t: "n" as const, v: value }
            : { t: "s" as const, v: String(value) };
}

function writeEntete(
    worksheet: XLSX.WorkSheet,
    entete: any,
    configEntete: Record<string, string>
): void {
    if (!entete || !configEntete) return;
    for (const [field, cellRef] of Object.entries(configEntete)) {
        if (entete[field] !== undefined && entete[field] !== null) {
            setCellValue(worksheet, cellRef, entete[field]);
        }
    }
}

function writeSections(
    worksheet: XLSX.WorkSheet,
    noteData: any,
    configSections: Record<string, { libelles: string[]; lignes: any[] }>
): void {
    if (!noteData || !configSections) return;
    for (const [sectionName, sectionConfig] of Object.entries(configSections)) {
        const sectionData = noteData[sectionName];
        if (!sectionData || !Array.isArray(sectionData)) continue;
        const { lignes: configLignes } = sectionConfig;
        if (!configLignes) continue;

        for (
            let i = 0;
            i < Math.min(sectionData.length, configLignes.length);
            i++
        ) {
            const rowData = sectionData[i];
            const cellMapping = configLignes[i];
            if (!rowData || !cellMapping) continue;

            for (const [fieldName, cellRef] of Object.entries(cellMapping)) {
                if (typeof cellRef !== "string") continue;
                if (fieldName.startsWith("//")) continue;

                let value = rowData[fieldName];
                if (value === undefined || value === null) {
                    const lowerField =
                        fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                    value = rowData[lowerField];
                }
                if (value !== undefined && value !== null) {
                    setCellValue(worksheet, cellRef as string, value);
                }
            }
        }
    }
}

// ==================== SERVICE CLASS ====================

class DsfTemplateService {
    private baseURL = "http://localhost:5000/api/dsf-template";

    /**
     * Upload a DSF Excel template
     */
    async uploadTemplate(file: File): Promise<TemplateStatus> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`${this.baseURL}/upload`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Échec de l'import");
    }

    /**
     * Get template status (uploaded or not)
     */
    async getTemplateStatus(): Promise<TemplateStatus> {
        const response = await axios.get(`${this.baseURL}/status`, {
            withCredentials: true,
        });

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur");
    }

    /**
     * Delete the uploaded template
     */
    async deleteTemplate(): Promise<void> {
        const response = await axios.delete(this.baseURL, {
            withCredentials: true,
        });

        if (!response.data.success) {
            throw new Error(response.data.message || "Erreur");
        }
    }

    /**
     * Export filled Excel:
     * 1. Download the raw template from backend
     * 2. Fetch all notes data for the folder
     * 3. Fill template cells using noteConfigs (client-side)
     * 4. Trigger browser download
     */
    async exportFilledExcel(folderId: string): Promise<void> {
        // Step 1: Download the raw template
        const templateResponse = await axios.get(`${this.baseURL}/download`, {
            withCredentials: true,
            responseType: "arraybuffer",
        });

        // Step 2: Fetch all notes data
        const dataResponse = await axios.get(
            `${this.baseURL}/export-data/${folderId}`,
            { withCredentials: true }
        );

        if (!dataResponse.data.success) {
            throw new Error(dataResponse.data.message || "Erreur de récupération des données");
        }

        const allNotesData: Record<string, any> = dataResponse.data.data;

        // Step 3: Parse the template workbook
        const workbook = XLSX.read(new Uint8Array(templateResponse.data), {
            type: "array",
        });
        const availableSheets = workbook.SheetNames;

        let filledCount = 0;

        // Fill each note into its sheet
        for (const [noteNumber, { config, sheetName }] of Object.entries(
            NOTE_EXPORT_MAP
        )) {
            const noteData = allNotesData[noteNumber];
            if (!noteData) continue;

            // Find matching sheet (case-insensitive, trimmed)
            const matchingSheet = availableSheets.find(
                (s) => s.trim().toLowerCase() === sheetName.trim().toLowerCase()
            );
            if (!matchingSheet) continue;

            const worksheet = workbook.Sheets[matchingSheet];
            if (!worksheet) continue;

            // Write header
            if (config.entete && noteData.entete) {
                writeEntete(worksheet, noteData.entete, config.entete);
            }

            // Write sections
            if (config.sections) {
                writeSections(worksheet, noteData, config.sections);
            }

            filledCount++;
        }

        console.log(`📊 Filled ${filledCount} notes into template`);

        // Step 4: Write workbook and trigger download
        const output = XLSX.write(workbook, {
            type: "array",
            bookType: "xlsx",
        });
        const blob = new Blob([output], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `DSF_Notes_Export.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

export const dsfTemplateService = new DsfTemplateService();
