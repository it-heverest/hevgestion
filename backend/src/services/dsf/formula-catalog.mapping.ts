import { getMappingLines } from "./account-mapping.data";
import { formatMappingLine } from "./formula-format.util";
import { FormulaCatalog } from "./formula-catalog.types";

/**
 * Une entrée par champ-tableau d'une note pilotée par `ACCOUNT_MAPPING`
 * (buildNoteRows / getMappingLines direct). Chaque entrée reproduit
 * fidèlement — sans jamais l'appeler — le point d'appel réel dans
 * dsf-generator.service.ts: mêmes `indexes`, même ordre. Si le générateur
 * change ses `indexes` pour une note, cette table doit être mise à jour en
 * miroir (voir le commentaire au-dessus de chaque entrée, qui pointe vers la
 * méthode source).
 *
 * Rempli progressivement, note par note, en relisant chaque `generateNoteX`
 * une fois — pas généré automatiquement, pour rester vérifiable ligne à
 * ligne. Une note absente de cette table n'a simplement aucune formule
 * disponible (dégradation silencieuse côté frontend).
 */
interface MappingCatalogEntry {
  /** Nom de champ Prisma exact (voir NOTE_KEY_MAP dans dsf.controller.ts). */
  noteKey: string;
  /** Champ contenant les lignes dans le JSON de la note. */
  arrayField: string;
  /** Clé dans ACCOUNT_MAPPING. */
  mappingCode: string;
  /** Reproduit l'option `indexes` du generateNoteX correspondant. Absent = toutes les lignes, dans l'ordre. */
  indexes?: number[];
}

const MAPPING_CATALOG_SOURCES: MappingCatalogEntry[] = [
  // generateNote1 (dsf-generator.service.ts:1510) — pick([0,1,2,3]) / pick([4,5,6,7]) / pick([8..15])
  { noteKey: "note1", arrayField: "financialDebts", mappingCode: "1", indexes: [0, 1, 2, 3] },
  { noteKey: "note1", arrayField: "leasingDebts", mappingCode: "1", indexes: [4, 5, 6, 7] },
  { noteKey: "note1", arrayField: "currentLiabilities", mappingCode: "1", indexes: [8, 9, 10, 11, 12, 13, 14, 15] },

  // generateNote17 (dsf-generator.service.ts:2343) — buildNoteRows("17", ...), pas d'indexes = toutes les lignes.
  { noteKey: "note17", arrayField: "rows", mappingCode: "17" },
];

export function buildMappingCatalog(): FormulaCatalog {
  const out: FormulaCatalog = {};
  for (const src of MAPPING_CATALOG_SOURCES) {
    const lines = getMappingLines(src.mappingCode);
    const picked = src.indexes ? src.indexes.map((i) => lines[i]).filter(Boolean) : lines;
    out[src.noteKey] ??= {};
    out[src.noteKey][src.arrayField] = Object.fromEntries(
      picked.map((line, i) => [String(i + 1), formatMappingLine(line)])
    );
  }
  return out;
}
