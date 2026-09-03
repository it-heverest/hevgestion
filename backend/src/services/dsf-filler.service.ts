// backend/src/services/dsf-filler.service.ts
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { NOTE_EXPORT_MAP } from "./excel/export-map";
import { createTemplateCopy, resolveTemplatePath } from "./dsf-template.service";
import { patchXlsx, CellWrite } from "./excel/xlsx-patcher";

/** Résout "a.b.c" dans un objet imbriqué; undefined si un maillon manque. */
function getByPath(obj: any, dotPath: string): unknown {
    let current = obj;
    for (const key of dotPath.split(".")) {
        if (current === null || current === undefined) return undefined;
        current = current[key];
    }
    return current;
}

export class DsfFillerService {
    /**
     * Rassemble toutes les cellules à écrire, à partir des données DSF et de la
     * table de correspondance champ -> cellule (`note-configs.ts`).
     */
    private collectWrites(dsf: any): { writes: CellWrite[]; notesFilled: number } {
        const writes: CellWrite[] = [];
        let notesFilled = 0;

        for (const [, { config: mapping, sheetName, dsfField }] of Object.entries(NOTE_EXPORT_MAP)) {
            const noteData = dsf[dsfField];
            if (!noteData) continue;

            const before = writes.length;

            // En-tête. Le nom de l'entité n'est jamais écrasé: il est déjà mis
            // en forme dans le template.
            if (mapping.entete && noteData.entete) {
                for (const [field, cellRef] of Object.entries(mapping.entete)) {
                    if (typeof cellRef !== "string") continue;

                    const lower = field.toLowerCase();
                    if (
                        lower.includes("entity") ||
                        lower.includes("company") ||
                        (lower.includes("nom") && lower.includes("entreprise"))
                    ) {
                        continue;
                    }

                    const val = noteData.entete[field];
                    if (val !== undefined && val !== null) {
                        writes.push({ sheetName, ref: cellRef, value: val });
                    }
                }
            }

            // Sections tabulaires
            if (mapping.sections) {
                for (const [sectionName, sectionConfig] of Object.entries(mapping.sections as any)) {
                    const sectionData = noteData[sectionName];
                    if (!sectionData || !Array.isArray(sectionData)) continue;

                    const configLignes = (sectionConfig as any).lignes;
                    if (!configLignes || !Array.isArray(configLignes)) continue;

                    for (let i = 0; i < Math.min(sectionData.length, configLignes.length); i++) {
                        const rowData = sectionData[i];
                        const cellMapping = configLignes[i];
                        if (!rowData || !cellMapping) continue;

                        for (const [rowField, cellRef] of Object.entries(cellMapping)) {
                            if (typeof cellRef !== "string" || rowField.startsWith("//")) continue;

                            let value = rowData[rowField];
                            // Certains champs sont déclarés en PascalCase dans la
                            // config et en camelCase dans les données.
                            if (value === undefined || value === null) {
                                const camelField = rowField.charAt(0).toLowerCase() + rowField.slice(1);
                                value = rowData[camelField];
                            }

                            if (value !== undefined && value !== null) {
                                writes.push({ sheetName, ref: cellRef, value });
                            }
                        }
                    }
                }
            }

            // Champs scalaires imbriqués (ex: Fiche R2/R3), en plus des
            // sections tabulaires ci-dessus — les deux peuvent coexister dans
            // une même config.
            if (mapping.flat) {
                for (const [dotPath, cellRef] of Object.entries(mapping.flat)) {
                    if (typeof cellRef !== "string") continue;
                    const value = getByPath(noteData, dotPath);
                    // Un chemin qui pointe encore vers un objet/tableau est une
                    // erreur de config (chemin trop court) — on l'ignore plutôt
                    // que d'écrire "[object Object]" dans la cellule.
                    if (
                        typeof value === "string" ||
                        typeof value === "number" ||
                        typeof value === "boolean"
                    ) {
                        if (value !== "") writes.push({ sheetName, ref: cellRef, value });
                    }
                }
            }

            // Sections indexées par clé métier (code SYSCOHADA, référence…)
            // plutôt que par position — voir ConfigurationMapping.byKey.
            if (mapping.byKey) {
                for (const sectionConfig of Object.values(mapping.byKey) as any[]) {
                    const array = getByPath(noteData, sectionConfig.arrayField);
                    if (!Array.isArray(array)) continue;

                    const byKey = new Map<string, any>();
                    for (const item of array) {
                        const key = item?.[sectionConfig.keyField];
                        if (typeof key === "string") byKey.set(key.toLowerCase(), item);
                    }

                    for (const [key, cellMapping] of Object.entries(sectionConfig.rows)) {
                        const rowData = byKey.get(key.toLowerCase());
                        if (!rowData) continue;

                        for (const [rowField, cellRef] of Object.entries(cellMapping as any)) {
                            if (typeof cellRef !== "string") continue;
                            const value = rowData[rowField];
                            if (value !== undefined && value !== null && value !== "") {
                                writes.push({ sheetName, ref: cellRef, value });
                            }
                        }
                    }
                }
            }

            if (writes.length > before) notesFilled++;
        }

        return { writes, notesFilled };
    }

    /**
     * Remplit le template avec les données du dossier et renvoie le fichier.
     *
     * Le classeur n'est jamais reconstruit: seules les cellules de données sont
     * réécrites dans l'archive d'origine (voir `xlsx-patcher.ts`). Le format du
     * template — graphiques, images, mises en forme, validations — est donc
     * conservé à l'identique.
     */
    async fillTemplate(
        folderId: string,
        clientName: string,
        ownerIds: (string | null | undefined)[] = []
    ): Promise<{ buffer: Buffer; filePath: string; templateSource: "folder" | "settings" }> {
        const resolved = resolveTemplatePath(folderId, ownerIds);
        if (!resolved) {
            throw new Error(
                "Aucun template DSF trouvé. Importez-en un depuis les Paramètres, ou depuis le dossier."
            );
        }

        // Fetch report data
        const dsf = await prisma.dSF.findUnique({
            where: { folderId },
        });

        if (!dsf) {
            throw new Error(
                "Données DSF introuvables pour ce dossier. Veuillez d'abord générer ou importer les rapports."
            );
        }

        const { writes, notesFilled } = this.collectWrites(dsf as any);

        const templateBuffer = fs.readFileSync(resolved.path);
        const { buffer, written, missingSheets } = await patchXlsx(templateBuffer, writes);

        if (missingSheets.length > 0) {
            console.warn(
                `Export DSF: onglets absents du template (ignorés): ${missingSheets.join(", ")}`
            );
        }

        // Contrôle de non-régression: le fichier produit ne doit pas être plus
        // petit que le template. Une perte de volume signalerait que le format
        // d'origine n'a pas été préservé.
        if (buffer.length < templateBuffer.length * 0.95) {
            console.warn(
                `Export DSF: taille suspecte (template ${templateBuffer.length} o -> export ${buffer.length} o).`
            );
        }

        // Écriture de la copie horodatée destinée au téléchargement.
        const copyPath = createTemplateCopy(folderId, clientName, ownerIds);
        fs.writeFileSync(copyPath, buffer);

        console.log(
            `📊 Export DSF: ${notesFilled} note(s), ${written} cellule(s) écrite(s) — ` +
            `template ${resolved.source === "folder" ? "du dossier" : "des Paramètres"} ` +
            `(${templateBuffer.length} o -> ${buffer.length} o) — dossier ${folderId}, client ${clientName}`
        );

        return { buffer, filePath: copyPath, templateSource: resolved.source };
    }
}

export const dsfFillerService = new DsfFillerService();
