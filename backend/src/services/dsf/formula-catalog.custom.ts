import { getMappingLines } from "./account-mapping.data";
import { formatAccounts, formatMappingLine } from "./formula-format.util";
import { FormulaCatalog } from "./formula-catalog.types";

/**
 * Notes dont le calcul mélange plusieurs styles au sein d'une même ligne
 * (compte isolé + MappingLine + valeur dérivée) — pas assez uniformes pour
 * tenir dans la table déclarative de formula-catalog.mapping.ts. Chaque
 * entrée ci-dessous reproduit fidèlement — sans jamais l'appeler — la
 * méthode `generateNoteX` correspondante (voir dsf-generator.service.ts).
 */
export function buildCustomCatalog(): FormulaCatalog {
  const catalog: FormulaCatalog = {};

  // ── generateNote31 ────────────────────────────────────────────────────
  // Répartition du résultat: 6 lignes, chacune avec sa propre source
  // (compte isolé, MappingLine "31", ou compte isolé encore).
  const lines31 = getMappingLines("31");
  catalog.note31 = {
    rows: {
      "1": formatAccounts(["10"], "SC", ["109"]), // Capital social
      "2": formatMappingLine(lines31[0]), // Chiffre d'affaires hors taxes
      "3": formatAccounts(["13"], "SC"), // Résultat net de l'exercice
      "4": formatMappingLine(lines31[1]), // Participation des travailleurs aux bénéfices
      "5": formatMappingLine(lines31[2]), // Impôt sur le résultat
      "6": formatAccounts(["12"], "SC"), // Report à nouveau
    },
  };

  // ── generateNote16B ──────────────────────────────────────────────────
  // Engagements de retraite (méthode actuarielle): tout est à 0/manuel sauf
  // la 5e ligne "obligations" (obligation à la clôture), tirée des comptes
  // 1961/1962.
  catalog.note16b = {
    obligations: {
      "5": formatAccounts(["1961", "1962"], "SC"),
    },
  };

  // ── generateNote16BBis ───────────────────────────────────────────────
  catalog.note16b_bis = {
    actifPassif: {
      "1": formatAccounts(["1961"], "SC"), // Valeur actuelle de l'obligation
      "2": formatAccounts(["1962"], "SC"), // Juste valeur des actifs du régime
      "3": "Ligne 1 (valeur actuelle de l'obligation) moins ligne 2 (juste valeur des actifs du régime)",
    },
  };

  return catalog;
}

/**
 * Tableau des flux de trésorerie: 4 lignes (FA, FF, FG, FH) calculées hors
 * du moteur de formules générique — voir tft-mapping.data.ts et
 * generateTFT. Les autres lignes du TFT sont couvertes ailleurs, en
 * réutilisant directement la formule brute déjà stockée dans TFT_LINES.
 */
export function buildTftCustomOverrides(): Record<string, string> {
  return {
    FA: "Capacité d'autofinancement globale (voir note 34, ligne CAFG)",
    FF: "− [Variation de la valeur brute des immobilisations incorporelles (compte 21) + Solde créditeur d'ouverture des comptes 4041, 4046, 4811 moins solde créditeur de clôture]",
    FG: "− [Variation de la valeur brute des immobilisations corporelles (comptes 22, 23, 24, 25) + Solde créditeur d'ouverture des comptes 4042, 4046, 4812 moins solde créditeur de clôture]",
    FH: "− [Variation de la valeur brute des immobilisations financières (comptes 26, 27) + Solde créditeur d'ouverture du compte 4813 moins solde créditeur de clôture]",
  };
}
