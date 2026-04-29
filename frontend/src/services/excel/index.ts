// ==================== EXPORTS DE L'EXTRACTEUR ====================
export {
  lireFichierExcel,
  extraireDonneesGeneriques,
  extraireDepuisFichier,
  obtenirNomsFeuillesDepuisFichier,
  validerDonneesExtraites,
  calculerTotauxSection,
  versJSON,
  obtenirStatistiquesResume,
  fusionnerNotesExtraites,
} from "./excelExtractor";

// ==================== EXPORTS DES CONFIGURATIONS ====================
export {
  CONFIG_GRILLE_ANALYSE_NOTES,
  CONFIG_BILAN_PAYSAGE,
  CONFIG_COMPTE_RESULTAT,
  CONFIG_TABLEAU_FLUX_TRESORERIE,
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
  CONFIG_NOTE21,
  CONFIG_NOTE23,
  CONFIG_NOTE24,
  CONFIG_NOTE25,
  CONFIG_NOTE25_C1,
  CONFIG_NOTE25_C2,
  CONFIG_NOTE26,
  CONFIG_NOTE27A,
  CONFIG_C1_NOTE27A,
  CONFIG_NOTE27B,
  CONFIG_NOTE28,
  CONFIG_NOTE28_C1,
  CONFIG_NOTE28_C2,
  CONFIG_NOTE29,
  CONFIG_NOTE30,
  CONFIG_NOTE31,
  CONFIG_NOTE32,
  CONFIG_NOTE33,
  CONFIG_NOTE34,
  validateNoteData,
  calculateNoteTotals,
} from "./noteConfigs";

// ==================== IMPORTS POUR FONCTIONS HELPER ====================
import { extraireDepuisFichier } from "./excelExtractor";
import {
  CONFIG_GRILLE_ANALYSE_NOTES,
  CONFIG_BILAN_PAYSAGE,
  CONFIG_COMPTE_RESULTAT,
  CONFIG_TABLEAU_FLUX_TRESORERIE,
  CONFIG_NOTE1,
  CONFIG_NOTE2,
  CONFIG_NOTE3A,
  CONFIG_NOTE3B,
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
  CONFIG_NOTE21,
  CONFIG_NOTE23,
  CONFIG_NOTE24,
  CONFIG_NOTE25,
  CONFIG_NOTE25_C1,
  CONFIG_NOTE25_C2,
  CONFIG_NOTE26,
  CONFIG_NOTE27A,
  CONFIG_C1_NOTE27A,
  CONFIG_NOTE27B,
  CONFIG_NOTE28,
  CONFIG_NOTE28_C1,
  CONFIG_NOTE28_C2,
  CONFIG_NOTE29,
  CONFIG_NOTE30,
  CONFIG_NOTE31,
  CONFIG_NOTE32,
  CONFIG_NOTE33,
  CONFIG_NOTE34,
} from "./noteConfigs";

// ==================== FONCTIONS HELPER POUR CHAQUE NOTE ====================

/**
 * Extraire NOTE 1 - Dettes financières et ressources assimilées
 */
export const extraireNote1 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE1, nomFeuille || "NOTE 1");
};

/**
 * Extraire NOTE 2 - Déclaration de conformité au SYSCOHADA
 */
export const extraireNote2 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE2, nomFeuille || "NOTE 2");
};

/**
 * Extraire NOTE 3A - Tableau de variation des immobilisations
 */
export const extraireNote3A = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE3A, nomFeuille || "NOTE 3A");
};

/**
 * Extraire NOTE 3B - Biens pris en location acquisition
 */
export const extraireNote3B = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE3B, nomFeuille || "NOTE 3B");
};

/**
 * Extraire NOTE 3C - Amortissements différés en période déficitaire
 */
export const extraireCO1Note3C = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_C01_NOTE3C,
    nomFeuille || "NOTE 3C",
  );
};

export const extraireNote3C = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_C01_NOTE3C,
    nomFeuille || "NOTE 3C",
  );
};

/**
 * Extraire NOTE 3D - Plus-values et moins-values de cession
 */
export const extraireNote3D = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE3D, nomFeuille || "NOTE 3D");
};

/**
 * Extraire NOTE 3E - Informations sur les réévaluations
 */
export const extraireNote3E = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE3E, nomFeuille || "NOTE 3E");
};

/**
 * Extraire NOTE 3F - Étalement des charges immobilisées
 */
export const extraireNote3F = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE3F, nomFeuille || "NOTE 3F");
};

/**
 * Extraire NOTE 4 - Immobilisations financières
 */
export const extraireNote4 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE4, nomFeuille || "NOTE 4");
};

/**
 * Extraire NOTE 5 - Actif circulant HAO
 */
export const extraireNote5 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE5, nomFeuille || "NOTE 5");
};

/**
 * Extraire NOTE 6 - Stocks et en-cours
 */
export const extraireNote6 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE6, nomFeuille || "NOTE 6");
};

/**
 * Extraire NOTE 7 - Clients
 */
export const extraireNote7 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE7, nomFeuille || "NOTE 7");
};

/**
 * Extraire NOTE 8 - Autres créances
 */
export const extraireNote8 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE8, nomFeuille || "NOTE 8");
};

/**
 * Extraire NOTE 9 - Titres de placement
 */
export const extraireNote9 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE9, nomFeuille || "NOTE 9");
};

/**
 * Extraire NOTE 10 - Valeurs à encaisser
 */
export const extraireNote10 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE10, nomFeuille || "NOTE 10");
};

/**
 * Extraire NOTE 11 - Disponibilités
 */
export const extraireNote11 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE11, nomFeuille || "NOTE 11");
};

/**
 * Extraire NOTE 12 - Écarts de conversion
 */
export const extraireNote12 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE12, nomFeuille || "NOTE 12");
};

/**
 * Extraire NOTE 13 - Capital : Valeur nominale des actions ou parts
 */
export const extraireNote13 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE13, nomFeuille || "NOTE 13");
};

/**
 * Extraire NOTE 14 - Primes et réserves
 */
export const extraireNote14 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE14, nomFeuille || "NOTE 14");
};

/**
 * Extraire NOTE 15A - Total subventions et provisions réglementées
 */
export const extraireNote15A = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE15A, nomFeuille || "NOTE 15A");
};

/**
 * Extraire NOTE 15B - Autres fonds propres
 */
export const extraireNote15B = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE15B, nomFeuille || "NOTE 15B");
};

/**
 * Extraire NOTE 16A - Dettes financières et ressources assimilées
 */
export const extraireNote16A = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE16A, nomFeuille || "NOTE 16A");
};

/**
 * Extraire NOTE 16B - Engagements de retraite et avantages assimilés
 */
export const extraireNote16B = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE16B, nomFeuille || "NOTE 16B");
};

/**
 * Extraire NOTE 16B bis - Engagements de retraite et avantages assimilés (suite)
 */
export const extraireNote16BBis = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_NOTE16B_BIS,
    nomFeuille || "NOTE 16B bis",
  );
};

/**
 * Extraire NOTE 16C - Actifs et passifs éventuels
 */
export const extraireNote16C = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE16C, nomFeuille || "NOTE 16C");
};

/**
 * Extraire NOTE 17 - Fournisseurs d'exploitation
 */
export const extraireNote17 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE17, nomFeuille || "NOTE 17");
};

/**
 * Extraire C1/NOTE 17 - Extrait de la balance générale fournisseurs
 */
export const extraireNote17C1 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_NOTE17_C1,
    nomFeuille || "C1/NOTE 17",
  );
};

/**
 * Extraire NOTE 18 - Dettes fiscales et sociales
 */
export const extraireNote18 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE18, nomFeuille || "NOTE 18");
};

/**
 * Extraire NOTE 19 - Autres dettes et provisions pour risques à court terme
 */
export const extraireNote19 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE19, nomFeuille || "NOTE 19");
};

/**
 * Extraire NOTE 20 - Banques, crédit d'escompte et de trésorerie
 */
export const extraireNote20 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE20, nomFeuille || "NOTE 20");
};

/**
 * Extraire NOTE 23 - Transports
 */
export const extraireNote23 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE23, nomFeuille || "NOTE 23");
};

/**
 * Extraire NOTE 24 - Services extérieurs
 */
export const extraireNote24 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE24, nomFeuille || "NOTE 24");
};

/**
 * Extraire NOTE 25 - Impôts et taxes
 */
export const extraireNote25 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE25, nomFeuille || "NOTE 25");
};

/**
 * Extraire C1/NOTE 25 - Synthèse des impôts et taxes versés
 */
export const extraireNote25C1 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_NOTE25_C1,
    nomFeuille || "C1/NOTE 25",
  );
};

/**
 * Extraire C2/NOTE 25 - Tableau de régularisation annuelle des droits d'accises
 */
export const extraireNote25C2 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_NOTE25_C2,
    nomFeuille || "C2/NOTE 25",
  );
};

/**
 * Extraire NOTE 26 - Autres charges
 */
export const extraireNote26 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE26, nomFeuille || "NOTE 26");
};

/**
 * Extraire NOTE 28 - Provisions et dépréciations inscrites au bilan
 */
export const extraireNote28 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE28, nomFeuille || "NOTE 28");
};

/**
 * Extraire C1/NOTE 28 - Tableau récapitulatif du traitement fiscal des provisions (Reprises)
 */
export const extraireNote28C1 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_NOTE28_C1,
    nomFeuille || "C1/NOTE 28",
  );
};

/**
 * Extraire C2/NOTE 28 - Tableau récapitulatif du traitement fiscal des provisions (Dotations)
 */
export const extraireNote28C2 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_NOTE28_C2,
    nomFeuille || "C2/NOTE 28",
  );
};

/**
 * Extraire NOTE 29 - Charges et revenus financiers
 */
export const extraireNote29 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE29, nomFeuille || "NOTE 29");
};

/**
 * Extraire NOTE 30 - Autres charges et produits HAO
 */
export const extraireNote30 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE30, nomFeuille || "NOTE 30");
};

/**
 * Extraire NOTE 31 - Répartition du résultat et autres éléments caractéristiques des cinq derniers exercices
 */
export const extraireNote31 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE31, nomFeuille || "NOTE 31");
};

/**
 * Extraire NOTE 32 - Production de l'exercice
 */
export const extraireNote32 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE32, nomFeuille || "NOTE 32");
};

/**
 * Extraire NOTE 33 - Achats destinés à la production
 */
export const extraireNote33 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE33, nomFeuille || "NOTE 33");
};

/**
 * Extraire NOTE 34 - Fiche de synthèse des principaux indicateurs financiers
 */
export const extraireNote34 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE34, nomFeuille || "NOTE 34");
};

/**
 * Extraire NOTE 21 - Production vendue de biens et services
 */
export const extraireNote21 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE21, nomFeuille || "NOTE 21");
};

/**
 * Extraire NOTE 27A - Charges de personnel
 */
export const extraireNote27A = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE27A, nomFeuille || "NOTE 27A");
};

/**
 * Extraire C1/NOTE 27A - Tableau de régularisation annuelle des impôts et taxes sur salaires
 */
export const extraireNote27AC1 = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(
    file,
    CONFIG_C1_NOTE27A,
    nomFeuille || "C1/NOTE 27A",
  );
};

/**
 * Extraire NOTE 27B - Effectifs, masse salariale et personnel extérieur
 */
export const extraireNote27B = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_NOTE27B, nomFeuille || "NOTE 27B");
};

/**
 * Extraire Grille d'analyse des notes
 */
export const extraireGrilleAnalyseNotes = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_GRILLE_ANALYSE_NOTES, nomFeuille || "GRILLE ANALYSE NOTES");
};

/**
 * Extraire Bilan paysage
 */
export const extraireBilanPaysage = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_BILAN_PAYSAGE, nomFeuille || "BILAN PAYSAGE");
};

/**
 * Extraire Compte de résultat
 */
export const extraireCompteResultat = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_COMPTE_RESULTAT, nomFeuille || "COMPTE RESULTAT");
};

/**
 * Extraire Tableau des flux de trésorerie
 */
export const extraireTableauFluxTresorerie = async (file: File, nomFeuille?: string) => {
  return extraireDepuisFichier(file, CONFIG_TABLEAU_FLUX_TRESORERIE, nomFeuille || "TABLEAU FLUX TRESORERIE");
};

// ==================== FONCTION D'EXTRACTION MULTIPLE ====================

/**
 * Extraire toutes les notes d'un fichier Excel
 * @param file Fichier Excel à analyser
 * @param noteNames Tableau des notes à extraire (par défaut toutes les notes)
 * @returns Objet contenant toutes les données extraites par note
 */
export const extraireToutesLesNotes = async (
  file: File,
  noteNames: string[] = [
    "GRILLE ANALYSE NOTES",
    "BILAN PAYSAGE",
    "COMPTE RESULTAT",
    "TABLEAU FLUX TRESORERIE",
    "NOTE 1",
    "NOTE 2",
    "NOTE 3A",
    "NOTE 3B",
    "NOTE 3C",
    "NOTE 3D",
    "NOTE 3E",
    "NOTE 3F",
    "NOTE 4",
    "NOTE 5",
    "NOTE 6",
    "NOTE 7",
    "NOTE 8",
    "NOTE 9",
    "NOTE 10",
    "NOTE 11",
    "NOTE 12",
    "NOTE 13",
    "NOTE 14",
    "NOTE 15A",
    "NOTE 15B",
    "NOTE 16A",
    "NOTE 16B",
    "NOTE 16B bis",
    "NOTE 16C",
    "NOTE 17",
    "C1/NOTE 17",
    "NOTE 18",
    "NOTE 19",
    "NOTE 20",
    "NOTE 21",
    "NOTE 23",
    "NOTE 24",
    "NOTE 25",
    "C1/NOTE 25",
    "C2/NOTE 25",
    "NOTE 26",
    "NOTE 27A",
    "C1/NOTE 27A",
    "NOTE 27B",
    "NOTE 28",
    "C1/NOTE 28",
    "C2/NOTE 28",
    "NOTE 29",
    "NOTE 30",
    "NOTE 31",
    "NOTE 32",
    "NOTE 33",
    "NOTE 34",
  ],
) => {
  const extracteurs: {
    [key: string]: (file: File, sheet?: string) => Promise<any>;
  } = {
    "GRILLE ANALYSE NOTES": extraireGrilleAnalyseNotes,
    "BILAN PAYSAGE": extraireBilanPaysage,
    "COMPTE RESULTAT": extraireCompteResultat,
    "TABLEAU FLUX TRESORERIE": extraireTableauFluxTresorerie,
    "NOTE 1": extraireNote1,
    "NOTE 2": extraireNote2,
    "NOTE 3A": extraireNote3A,
    "NOTE 3B": extraireNote3B,
    "NOTE 3C": extraireNote3C,
    "NOTE 3D": extraireNote3D,
    "NOTE 3E": extraireNote3E,
    "NOTE 3F": extraireNote3F,
    "NOTE 4": extraireNote4,
    "NOTE 5": extraireNote5,
    "NOTE 6": extraireNote6,
    "NOTE 7": extraireNote7,
    "NOTE 8": extraireNote8,
    "NOTE 9": extraireNote9,
    "NOTE 10": extraireNote10,
    "NOTE 11": extraireNote11,
    "NOTE 12": extraireNote12,
    "NOTE 13": extraireNote13,
    "NOTE 14": extraireNote14,
    "NOTE 15A": extraireNote15A,
    "NOTE 15B": extraireNote15B,
    "NOTE 16A": extraireNote16A,
    "NOTE 16B": extraireNote16B,
    "NOTE 16B bis": extraireNote16BBis,
    "NOTE 16C": extraireNote16C,
    "NOTE 17": extraireNote17,
    "C1/NOTE 17": extraireNote17C1,
    "NOTE 18": extraireNote18,
    "NOTE 19": extraireNote19,
    "NOTE 20": extraireNote20,
    "NOTE 21": extraireNote21,
    "NOTE 23": extraireNote23,
    "NOTE 24": extraireNote24,
    "NOTE 25": extraireNote25,
    "C1/NOTE 25": extraireNote25C1,
    "C2/NOTE 25": extraireNote25C2,
    "NOTE 26": extraireNote26,
    "NOTE 27A": extraireNote27A,
    "C1/NOTE 27A": extraireNote27AC1,
    "NOTE 27B": extraireNote27B,
    "NOTE 28": extraireNote28,
    "C1/NOTE 28": extraireNote28C1,
    "C2/NOTE 28": extraireNote28C2,
    "NOTE 29": extraireNote29,
    "NOTE 30": extraireNote30,
    "NOTE 31": extraireNote31,
    "NOTE 32": extraireNote32,
    "NOTE 33": extraireNote33,
    "NOTE 34": extraireNote34,
  };

  const resultats: { [key: string]: any } = {};
  const erreurs: { [key: string]: string } = {};

  for (const noteName of noteNames) {
    try {
      const extracteur = extracteurs[noteName];
      if (extracteur) {
        resultats[noteName] = await extracteur(file);
      } else {
        erreurs[noteName] = `Extracteur non trouvé pour ${noteName}`;
      }
    } catch (erreur) {
      erreurs[noteName] = `Erreur lors de l'extraction: ${erreur}`;
    }
  }

  return {
    donnees: resultats,
    erreurs: Object.keys(erreurs).length > 0 ? erreurs : null,
  };
};

// ==================== TYPES EXPORTS ====================

export type {
  // Types d'extraction
  DonneesExtraites,
  ConfigurationMapping,
  MappingCellule,
} from "./excelExtractor";

// ==================== CONSTANTES UTILES ====================

/**
 * Liste de toutes les notes disponibles
 */
export const NOTES_DISPONIBLES = [
  "GRILLE ANALYSE NOTES",
  "BILAN PAYSAGE",
  "COMPTE RESULTAT",
  "TABLEAU FLUX TRESORERIE",
  "NOTE 1",
  "NOTE 2",
  "NOTE 3A",
  "NOTE 3B",
  "NOTE 3C",
  "NOTE 3D",
  "NOTE 3E",
  "NOTE 3F",
  "NOTE 4",
  "NOTE 5",
  "NOTE 6",
  "NOTE 7",
  "NOTE 8",
  "NOTE 9",
  "NOTE 10",
  "NOTE 11",
  "NOTE 12",
  "NOTE 13",
  "NOTE 14",
  "NOTE 15A",
  "NOTE 15B",
  "NOTE 16A",
  "NOTE 16B",
  "NOTE 16B bis",
  "NOTE 16C",
  "NOTE 17",
  "C1/NOTE 17",
  "NOTE 18",
  "NOTE 19",
  "NOTE 20",
  "NOTE 21",
  "NOTE 23",
  "NOTE 24",
  "NOTE 25",
  "C1/NOTE 25",
  "C2/NOTE 25",
  "NOTE 26",
  "NOTE 27A",
  "C1/NOTE 27A",
  "NOTE 27B",
  "NOTE 28",
  "C1/NOTE 28",
  "C2/NOTE 28",
  "NOTE 29",
  "NOTE 30",
  "NOTE 31",
  "NOTE 32",
  "NOTE 33",
  "NOTE 34",
] as const;

/**
 * Descriptions des notes
 */
export const DESCRIPTIONS_NOTES: { [key: string]: string } = {
  "GRILLE ANALYSE NOTES": "Grille d'analyse des notes du DSF",
  "BILAN PAYSAGE": "Bilan en format paysage",
  "COMPTE RESULTAT": "Compte de résultat",
  "TABLEAU FLUX TRESORERIE": "Tableau des flux de trésorerie",
  "NOTE 1": "Dettes financières et ressources assimilées",
  "NOTE 2": "Déclaration de conformité au SYSCOHADA",
  "NOTE 3A": "Tableau de variation des immobilisations",
  "NOTE 3B": "Biens pris en location acquisition",
  "NOTE 3C": "Amortissements différés en période déficitaire",
  "NOTE 3D": "Plus-values et moins-values de cession",
  "NOTE 3E": "Informations sur les réévaluations",
  "NOTE 3F": "Étalement des charges immobilisées",
  "NOTE 4": "Immobilisations financières",
  "NOTE 5": "Actif circulant HAO",
  "NOTE 6": "Stocks et en-cours",
  "NOTE 7": "Clients",
  "NOTE 8": "Autres créances",
  "NOTE 9": "Titres de placement",
  "NOTE 10": "Valeurs à encaisser",
  "NOTE 11": "Disponibilités",
  "NOTE 12": "Écarts de conversion",
  "NOTE 13": "Capital : Valeur nominale des actions ou parts",
  "NOTE 14": "Primes et réserves",
  "NOTE 15A": "Total subventions et provisions réglementées",
  "NOTE 15B": "Autres fonds propres",
  "NOTE 16A": "Dettes financières et ressources assimilées",
  "NOTE 16B":
    "Engagements de retraite et avantages assimilés (méthodes actuarielles)",
  "NOTE 16B bis": "Engagements de retraite et avantages assimilés (suite)",
  "NOTE 16C": "Actifs et passifs éventuels",
  "NOTE 17": "Fournisseurs d'exploitation",
  "C1/NOTE 17": "Extrait de la balance générale fournisseurs",
  "NOTE 18": "Dettes fiscales et sociales",
  "NOTE 19": "Autres dettes et provisions pour risques à court terme",
  "NOTE 20": "Banques, crédit d'escompte et de trésorerie",
  "NOTE 21": "Production vendue de biens et services",
  "NOTE 23": "Transports",
  "NOTE 24": "Services extérieurs",
  "NOTE 25": "Impôts et taxes",
  "C1/NOTE 25": "Synthèse des impôts et taxes versés",
  "C2/NOTE 25": "Tableau de régularisation annuelle des droits d'accises",
  "NOTE 26": "Autres charges",
  "NOTE 27A": "Charges de personnel",
  "C1/NOTE 27A": "Tableau de régularisation annuelle des impôts et taxes sur salaires",
  "NOTE 27B": "Effectifs, masse salariale et personnel extérieur",
  "NOTE 28": "Provisions et dépréciations inscrites au bilan",
  "C1/NOTE 28":
    "Tableau récapitulatif du traitement fiscal des provisions : les reprises",
  "C2/NOTE 28":
    "Tableau récapitulatif du traitement fiscal des provisions : les dotations",
  "NOTE 29": "Charges et revenus financiers",
  "NOTE 30": "Autres charges et produits HAO",
  "NOTE 31":
    "Répartition du résultat et autres éléments caractéristiques des cinq derniers exercices",
  "NOTE 32": "Production de l'exercice",
  "NOTE 33": "Achats destinés à la production",
  "NOTE 34": "Fiche de synthèse des principaux indicateurs financiers",
};

/**
 * Catégories de notes pour une meilleure organisation
 */
export const CATEGORIES_NOTES = {
  RAPPORTS_GENERAUX: [
    "GRILLE ANALYSE NOTES",
    "BILAN PAYSAGE",
    "COMPTE RESULTAT",
    "TABLEAU FLUX TRESORERIE",
  ],
  ACTIF_IMMOBILISE: [
    "NOTE 3A",
    "NOTE 3B",
    "NOTE 3C",
    "NOTE 3D",
    "NOTE 3E",
    "NOTE 3F",
    "NOTE 4",
  ],
  ACTIF_CIRCULANT: [
    "NOTE 5",
    "NOTE 6",
    "NOTE 7",
    "NOTE 8",
    "NOTE 9",
    "NOTE 10",
    "NOTE 11",
  ],
  CAPITAUX_PROPRES: ["NOTE 13", "NOTE 14", "NOTE 15A", "NOTE 15B"],
  DETTES: [
    "NOTE 1",
    "NOTE 16A",
    "NOTE 16B",
    "NOTE 16B bis",
    "NOTE 16C",
    "NOTE 17",
    "C1/NOTE 17",
    "NOTE 18",
    "NOTE 19",
    "NOTE 20",
  ],
  CHARGES: [
    "NOTE 21",
    "NOTE 23",
    "NOTE 24",
    "NOTE 25",
    "C1/NOTE 25",
    "C2/NOTE 25",
    "NOTE 26",
  ],
  PERSONNEL: ["NOTE 27A", "C1/NOTE 27A", "NOTE 27B"],
  PROVISIONS: ["NOTE 28", "C1/NOTE 28", "C2/NOTE 28"],
  RESULTATS: ["NOTE 29", "NOTE 30", "NOTE 31"],
  PRODUCTION: ["NOTE 32", "NOTE 33"],
  SYNTHESE: ["NOTE 2", "NOTE 12", "NOTE 34"],
} as const;

// ==================== EXEMPLE D'UTILISATION ====================

/*
// Exemple 1: Extraire une seule note
import { extraireNote1 } from './index';

const handleFileUpload = async (file: File) => {
  try {
    const donneesNote1 = await extraireNote1(file);
    console.log('Nom de l\'entité:', donneesNote1.entete.entityName);
    console.log('Première dette financière:', donneesNote1.sections.financialDebts.lignes[0]);
  } catch (erreur) {
    console.error('Erreur:', erreur);
  }
};

// Exemple 2: Extraire toutes les notes
import { extraireToutesLesNotes } from './index';

const handleFileUploadAll = async (file: File) => {
  try {
    const { donnees, erreurs } = await extraireToutesLesNotes(file);
    
    if (erreurs) {
      console.warn('Certaines notes ont échoué:', erreurs);
    }
    
    console.log('NOTE 1:', donnees['NOTE 1']);
    console.log('NOTE 4:', donnees['NOTE 4']);
    console.log('NOTE 34:', donnees['NOTE 34']);
  } catch (erreur) {
    console.error('Erreur:', erreur);
  }
};

// Exemple 3: Extraire des notes spécifiques
import { extraireToutesLesNotes } from './index';

const handleFileUploadSpecific = async (file: File) => {
  const notesAExtraire = ['NOTE 1', 'NOTE 3A', 'NOTE 4', 'NOTE 34'];
  const { donnees, erreurs } = await extraireToutesLesNotes(file, notesAExtraire);
  
  console.log('Données extraites:', donnees);
};

// Exemple 4: Extraire par catégorie
import { extraireToutesLesNotes, CATEGORIES_NOTES } from './index';

const extraireNotesActifImmobilise = async (file: File) => {
  const { donnees, erreurs } = await extraireToutesLesNotes(
    file,
    CATEGORIES_NOTES.ACTIF_IMMOBILISE
  );
  
  console.log('Données actif immobilisé:', donnees);
};

// Exemple 5: Utiliser les fonctions utilitaires
import { 
  extraireNote1, 
  validerDonneesExtraites, 
  calculerTotauxSection,
  CONFIG_NOTE1 
} from './index';

const analyserNote1 = async (file: File) => {
  const donnees = await extraireNote1(file);
  
  // Valider les données
  const validation = validerDonneesExtraites(donnees, CONFIG_NOTE1);
  if (!validation.valide) {
    console.error('Erreurs de validation:', validation.erreurs);
    return;
  }
  
  // Calculer les totaux
  const totaux = calculerTotauxSection(
    donnees,
    'financialDebts',
    ['grossAmount', 'mortgages', 'pledges', 'others']
  );
  
  console.log('Totaux:', totaux);
};

// Exemple 6: Extraire les notes de provisions
import { extraireToutesLesNotes, CATEGORIES_NOTES } from './index';

const analyserProvisions = async (file: File) => {
  const { donnees } = await extraireToutesLesNotes(
    file,
    CATEGORIES_NOTES.PROVISIONS
  );
  
  console.log('NOTE 28:', donnees['NOTE 28']);
  console.log('C1/NOTE 28 (Reprises):', donnees['C1/NOTE 28']);
  console.log('C2/NOTE 28 (Dotations):', donnees['C2/NOTE 28']);
};

// Exemple 7: Extraire et analyser les indicateurs financiers
import { extraireNote34 } from './index';

const analyserIndicateursFinanciers = async (file: File) => {
  const donnees = await extraireNote34(file);
  
  console.log('EBE Année N:', donnees.sections.indicateursFinanciers.lignes[6].anneeN);
  console.log('Résultat net Année N:', donnees.sections.indicateursFinanciers.lignes[11].anneeN);
  console.log('Fonds de roulement:', donnees.sections.indicateursFinanciers.lignes[37].anneeN);
};

// Exemple 8: Traitement en lot avec gestion d'erreurs
import { extraireToutesLesNotes, NOTES_DISPONIBLES } from './index';

const traiterFichierComplet = async (file: File) => {
  const { donnees, erreurs } = await extraireToutesLesNotes(file, NOTES_DISPONIBLES);
  
  if (erreurs) {
    console.error('Erreurs détectées:');
    Object.entries(erreurs).forEach(([note, erreur]) => {
      console.error(`- ${note}: ${erreur}`);
    });
  }
  
  // Traiter les données extraites avec succès
  const notesReussies = Object.keys(donnees);
  console.log(`${notesReussies.length} notes extraites avec succès`);
  
  return {
    succes: notesReussies,
    echecs: Object.keys(erreurs || {}),
    donnees,
  };
};
*/
