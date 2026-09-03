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
  // generateNote1 — pick([0,1,2,3]) / pick([4,5,6,7]) / pick([8..15])
  { noteKey: "note1", arrayField: "financialDebts", mappingCode: "1", indexes: [0, 1, 2, 3] },
  { noteKey: "note1", arrayField: "leasingDebts", mappingCode: "1", indexes: [4, 5, 6, 7] },
  { noteKey: "note1", arrayField: "currentLiabilities", mappingCode: "1", indexes: [8, 9, 10, 11, 12, 13, 14, 15] },

  // generateNote4 — immobilisations financières brutes (0-7) / dépréciations (8-9)
  { noteKey: "note4", arrayField: "immobilisations", mappingCode: "4", indexes: [0, 1, 2, 3, 4, 5, 6, 7] },
  { noteKey: "note4", arrayField: "depreciations", mappingCode: "4", indexes: [8, 9] },

  // generateNote5 — assetsData/liabilitiesData et leurs alias actifCirculantHAO/dettesHAO (mêmes lignes)
  { noteKey: "note5", arrayField: "assetsData", mappingCode: "5", indexes: [0, 1, 2] },
  { noteKey: "note5", arrayField: "liabilitiesData", mappingCode: "5", indexes: [3, 4, 5, 6] },
  { noteKey: "note5", arrayField: "actifCirculantHAO", mappingCode: "5", indexes: [0, 1, 2] },
  { noteKey: "note5", arrayField: "dettesHAO", mappingCode: "5", indexes: [3, 4, 5, 6] },

  // generateNote6 — stocks (0-7) / dépréciations (8). `stocksEnCours` (alias
  // sans id) volontairement omis: pas de clé stable pour l'y rattacher.
  { noteKey: "note6", arrayField: "stocks", mappingCode: "6", indexes: [0, 1, 2, 3, 4, 5, 6, 7] },
  { noteKey: "note6", arrayField: "depreciations", mappingCode: "6", indexes: [8] },

  // generateNote7 — créances clients (0-8, + alias creancesClients) / dépréciations (9) / clients créditeurs (10-12)
  { noteKey: "note7", arrayField: "clientReceivables", mappingCode: "7", indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { noteKey: "note7", arrayField: "creancesClients", mappingCode: "7", indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { noteKey: "note7", arrayField: "depreciations", mappingCode: "7", indexes: [9] },
  { noteKey: "note7", arrayField: "clientCreditors", mappingCode: "7", indexes: [10, 11, 12] },

  // generateNote8 — autres créances (0-9). La ligne 10 (dépréciations) est
  // un champ scalaire séparé, catalogué dans formula-catalog.legacy.ts.
  { noteKey: "note8", arrayField: "autresCreances", mappingCode: "8", indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },

  // generateNote9 — titres de placement (0-6, + alias titresPlacement) / dépréciations (7)
  { noteKey: "note9", arrayField: "rows", mappingCode: "9", indexes: [0, 1, 2, 3, 4, 5, 6] },
  { noteKey: "note9", arrayField: "titresPlacement", mappingCode: "9", indexes: [0, 1, 2, 3, 4, 5, 6] },
  { noteKey: "note9", arrayField: "depreciations", mappingCode: "9", indexes: [7] },

  // generateNote10 — valeurs à encaisser (0-5) / dépréciations (6)
  { noteKey: "note10", arrayField: "valeursAEncaisser", mappingCode: "10", indexes: [0, 1, 2, 3, 4, 5] },
  { noteKey: "note10", arrayField: "depreciations", mappingCode: "10", indexes: [6] },

  // generateNote11 — banques d'abord (7-12), puis autres disponibilités
  // (0-5). La ligne 6 (dépréciations) est un champ scalaire séparé.
  { noteKey: "note11", arrayField: "disponibilites", mappingCode: "11", indexes: [7, 8, 9, 10, 11, 12, 0, 1, 2, 3, 4, 5] },

  // generateNote14 — toutes les lignes, dans l'ordre
  { noteKey: "note14", arrayField: "rows", mappingCode: "14" },

  // generateNote15A — toutes les lignes
  { noteKey: "note15a", arrayField: "rows", mappingCode: "15A" },

  // generateNote15B — bascule sur ACCOUNT_MAPPING["16A"][5..9] (pas de code
  // "15B" propre, voir le commentaire de generateNote15B)
  { noteKey: "note15b", arrayField: "rows", mappingCode: "16A", indexes: [5, 6, 7, 8, 9] },

  // generateNote16A — toutes les lignes
  { noteKey: "note16a", arrayField: "rows", mappingCode: "16A" },

  // generateNote18 — toutes les lignes
  { noteKey: "note18", arrayField: "rows", mappingCode: "18" },

  // generateNote19 — lignes 0-15 (la 17e ligne, "voir note 28", n'a pas de
  // MappingLine associée: pas de formule pour elle)
  { noteKey: "note19", arrayField: "rows", mappingCode: "19", indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },

  // generateNote20 à generateNote27A — toutes les lignes, dans l'ordre
  { noteKey: "note20", arrayField: "rows", mappingCode: "20" },
  { noteKey: "note21", arrayField: "rows", mappingCode: "21" },
  { noteKey: "note22", arrayField: "rows", mappingCode: "22" },
  { noteKey: "note23", arrayField: "rows", mappingCode: "23" },
  { noteKey: "note24", arrayField: "rows", mappingCode: "24" },
  { noteKey: "note25", arrayField: "rows", mappingCode: "25" },
  { noteKey: "note26", arrayField: "rows", mappingCode: "26" },
  { noteKey: "note27a", arrayField: "rows", mappingCode: "27A" },

  // generateNote28 — toutes les lignes (13), une formule par nature de
  // provision/dépréciation, indépendamment de la colonne cliquée
  // (ouverture/dotation/reprise/clôture — voir formula-format.util.ts)
  { noteKey: "note28", arrayField: "rows", mappingCode: "28" },

  // generateNote29 — charges financières (0-9) / revenus financiers (10-18)
  { noteKey: "note29", arrayField: "charges", mappingCode: "29", indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { noteKey: "note29", arrayField: "revenus", mappingCode: "29", indexes: [10, 11, 12, 13, 14, 15, 16, 17, 18] },

  // generateNote30 — charges H.A.O. + participation/impôts rattachés (0-5,13,14) / produits H.A.O. (6-12)
  { noteKey: "note30", arrayField: "charges", mappingCode: "30", indexes: [0, 1, 2, 3, 4, 5, 13, 14] },
  { noteKey: "note30", arrayField: "produits", mappingCode: "30", indexes: [6, 7, 8, 9, 10, 11, 12] },

  // generateNote17 — toutes les lignes
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
