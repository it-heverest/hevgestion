import * as XLSX from "xlsx";

// ==================== TYPE DEFINITIONS ====================

export interface MappingCellule {
  [key: string]: string; // e.g., grossAmount: "C10"
}

export interface ConfigurationMapping {
  entete: MappingCellule;
  sections: {
    [sectionName: string]: {
      libelles: string[];
      lignes: MappingCellule[];
    };
  };
}

export interface DonneesExtraites {
  entete: {
    [key: string]: any;
  };
  sections: {
    [sectionName: string]: {
      libelles: string[];
      lignes: Array<{
        [fieldName: string]: any;
      }>;
    };
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse Excel cell reference (e.g., "A2") to { row, col }
 */
function analyserReferenceCellule(refCellule: string): {
  ligne: number;
  colonne: number;
} {
  const match = refCellule.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Référence de cellule invalide: ${refCellule}`);
  }

  const lettresColonne = match[1];
  const numeroLigne = parseInt(match[2], 10);

  // Convert column letters to index (A=0, B=1, ..., Z=25, AA=26, etc.)
  let colonne = 0;
  for (let i = 0; i < lettresColonne.length; i++) {
    colonne = colonne * 26 + (lettresColonne.charCodeAt(i) - 65 + 1);
  }
  colonne -= 1; // Convert to 0-based index

  const ligne = numeroLigne - 1; // Convert to 0-based index

  return { ligne, colonne };
}

/**
 * Get cell value from worksheet
 */
function obtenirValeurCellule(
  feuille: XLSX.WorkSheet,
  refCellule: string,
): any {
  const cellule = feuille[refCellule];
  if (!cellule) {
    return null;
  }

  // Return the value, handling different cell types
  if (cellule.t === "n") {
    return cellule.v; // Number
  } else if (cellule.t === "s") {
    return cellule.v; // String
  } else if (cellule.t === "b") {
    return cellule.v; // Boolean
  } else if (cellule.t === "d") {
    return cellule.v; // Date
  } else if (cellule.t === "e") {
    return null; // Error
  }

  return cellule.v;
}

/**
 * Clean numeric value (remove spaces, convert to number)
 */
function nettoyerValeurNumerique(valeur: any): number | null {
  if (valeur === null || valeur === undefined || valeur === "") {
    return null;
  }

  if (typeof valeur === "number") {
    return valeur;
  }

  if (typeof valeur === "string") {
    // Remove spaces and replace comma with dot
    const nettoye = valeur.replace(/\s/g, "").replace(",", ".");
    const parse = parseFloat(nettoye);
    return isNaN(parse) ? null : parse;
  }

  return null;
}

/**
 * Clean string value (trim whitespace)
 */
function nettoyerValeurTexte(valeur: any): string | null {
  if (valeur === null || valeur === undefined || valeur === "") {
    return null;
  }

  return String(valeur).trim();
}

/**
 * Determine if a field should be treated as numeric
 */
function estChampNumerique(nomChamp: string): boolean {
  const motsClesNumeriques = [
    "montant",
    "amount",
    "valeur",
    "value",
    "prix",
    "price",
    "total",
    "brut",
    "net",
    "depreciation",
    "amortissement",
    "acquisition",
    "cession",
    "reevaluation",
    "virement",
    "pourcentage",
    "percentage",
    "creances",
    "dettes",
    "pledges",
    "mortgages",
    "engagement",
    "apport",
    "capitaux",
    "resultat",
  ];

  const nomChampMinuscule = nomChamp.toLowerCase();
  return motsClesNumeriques.some((motCle) =>
    nomChampMinuscule.includes(motCle),
  );
}

// ==================== MAIN EXTRACTION FUNCTIONS ====================

/**
 * Lire un fichier Excel et retourner le workbook
 */
export async function lireFichierExcel(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();

    lecteur.onload = (e) => {
      try {
        const donnees = e.target?.result;
        const workbook = XLSX.read(donnees, { type: "array" });
        resolve(workbook);
      } catch (erreur) {
        reject(new Error(`Erreur lors de la lecture du fichier: ${erreur}`));
      }
    };

    lecteur.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };

    lecteur.readAsArrayBuffer(file);
  });
}

/**
 * Extraire les données d'une feuille Excel selon la configuration
 */
export function extraireDonneesGeneriques(
  workbook: XLSX.WorkBook,
  config: ConfigurationMapping,
  nomFeuille?: string,
): DonneesExtraites {
  // Sélectionner la feuille
  let feuille: XLSX.WorkSheet;
  if (nomFeuille) {
    feuille = workbook.Sheets[nomFeuille];
    if (!feuille) {
      throw new Error(`Feuille "${nomFeuille}" introuvable`);
    }
  } else {
    // Utiliser la première feuille par défaut
    const premiereFeuille = workbook.SheetNames[0];
    feuille = workbook.Sheets[premiereFeuille];
  }

  const resultat: DonneesExtraites = {
    entete: {},
    sections: {},
  };

  // Extraire les données d'en-tête
  for (const [cle, refCellule] of Object.entries(config.entete)) {
    const valeur = obtenirValeurCellule(feuille, refCellule);
    resultat.entete[cle] = nettoyerValeurTexte(valeur);
  }

  // Extraire les données des sections
  for (const [nomSection, configSection] of Object.entries(config.sections)) {
    resultat.sections[nomSection] = {
      libelles: configSection.libelles,
      lignes: [],
    };

    // Extraire chaque ligne de la section
    for (let i = 0; i < configSection.lignes.length; i++) {
      const configLigne = configSection.lignes[i];
      const donneesLigne: { [key: string]: any } = {};

      for (const [nomChamp, refCellule] of Object.entries(configLigne)) {
        const valeur = obtenirValeurCellule(feuille, refCellule);

        // Déterminer si le champ doit être numérique ou texte
        if (estChampNumerique(nomChamp)) {
          donneesLigne[nomChamp] = nettoyerValeurNumerique(valeur);
        } else {
          donneesLigne[nomChamp] = nettoyerValeurTexte(valeur);
        }
      }

      resultat.sections[nomSection].lignes.push(donneesLigne);
    }
  }

  return resultat;
}

/**
 * Extraire directement depuis un fichier File
 */
export async function extraireDepuisFichier(
  file: File,
  config: ConfigurationMapping,
  nomFeuille?: string,
): Promise<DonneesExtraites> {
  const workbook = await lireFichierExcel(file);
  return extraireDonneesGeneriques(workbook, config, nomFeuille);
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Obtenir la liste des noms de feuilles
 */
export function obtenirNomsFeuillesDepuisFichier(
  file: File,
): Promise<string[]> {
  return lireFichierExcel(file).then((workbook) => workbook.SheetNames);
}

/**
 * Valider les données extraites
 */
export function validerDonneesExtraites(
  donnees: DonneesExtraites,
  config: ConfigurationMapping,
): {
  valide: boolean;
  erreurs: string[];
} {
  const erreurs: string[] = [];

  // Valider l'en-tête
  for (const cle of Object.keys(config.entete)) {
    if (!(cle in donnees.entete)) {
      erreurs.push(`Champ d'en-tête manquant: ${cle}`);
    }
  }

  // Valider les sections
  for (const [nomSection, configSection] of Object.entries(config.sections)) {
    if (!(nomSection in donnees.sections)) {
      erreurs.push(`Section manquante: ${nomSection}`);
      continue;
    }

    const sectionDonnees = donnees.sections[nomSection];

    // Vérifier si le nombre de lignes correspond
    if (sectionDonnees.lignes.length !== configSection.lignes.length) {
      erreurs.push(
        `Section ${nomSection}: Attendu ${configSection.lignes.length} lignes, obtenu ${sectionDonnees.lignes.length}`,
      );
    }

    // Valider chaque ligne
    for (let i = 0; i < configSection.lignes.length; i++) {
      const configLigne = configSection.lignes[i];
      const donneesLigne = sectionDonnees.lignes[i];

      if (!donneesLigne) {
        erreurs.push(`Section ${nomSection}, ligne ${i}: Données manquantes`);
        continue;
      }

      for (const nomChamp of Object.keys(configLigne)) {
        if (!(nomChamp in donneesLigne)) {
          erreurs.push(
            `Section ${nomSection}, ligne ${i}: Champ manquant ${nomChamp}`,
          );
        }
      }
    }
  }

  return {
    valide: erreurs.length === 0,
    erreurs,
  };
}

/**
 * Calculer les totaux d'une section
 */
export function calculerTotauxSection(
  donnees: DonneesExtraites,
  nomSection: string,
  champsASommer: string[],
): { [nomChamp: string]: number } {
  if (!(nomSection in donnees.sections)) {
    throw new Error(
      `Section ${nomSection} introuvable dans les données extraites`,
    );
  }

  const section = donnees.sections[nomSection];
  const totaux: { [nomChamp: string]: number } = {};

  for (const nomChamp of champsASommer) {
    totaux[nomChamp] = 0;
    for (const ligne of section.lignes) {
      const valeur = ligne[nomChamp];
      if (typeof valeur === "number") {
        totaux[nomChamp] += valeur;
      }
    }
  }

  return totaux;
}

/**
 * Exporter vers JSON
 */
export function versJSON(donnees: DonneesExtraites): string {
  return JSON.stringify(donnees, null, 2);
}

/**
 * Obtenir des statistiques résumées
 */
export function obtenirStatistiquesResume(donnees: DonneesExtraites): {
  totalSections: number;
  totalLignes: number;
  statsParSection: {
    [nomSection: string]: { nombreLignes: number; nombreChamps: number };
  };
} {
  const statsParSection: {
    [nomSection: string]: { nombreLignes: number; nombreChamps: number };
  } = {};
  let totalLignes = 0;

  for (const [nomSection, section] of Object.entries(donnees.sections)) {
    const nombreLignes = section.lignes.length;
    const nombreChamps =
      nombreLignes > 0 ? Object.keys(section.lignes[0]).length : 0;

    statsParSection[nomSection] = { nombreLignes, nombreChamps };
    totalLignes += nombreLignes;
  }

  return {
    totalSections: Object.keys(donnees.sections).length,
    totalLignes,
    statsParSection,
  };
}

/**
 * Fusionner plusieurs notes extraites
 */
export function fusionnerNotesExtraites(notes: {
  [nomNote: string]: DonneesExtraites;
}): {
  entetes: { [nomNote: string]: any };
  toutesLesSections: { [nomNote: string]: DonneesExtraites["sections"] };
} {
  const entetes: { [nomNote: string]: any } = {};
  const toutesLesSections: { [nomNote: string]: DonneesExtraites["sections"] } =
    {};

  for (const [nomNote, donneesNote] of Object.entries(notes)) {
    entetes[nomNote] = donneesNote.entete;
    toutesLesSections[nomNote] = donneesNote.sections;
  }

  return { entetes, toutesLesSections };
}

// ==================== EXAMPLE USAGE ====================

/*
// Exemple 1: Extraction simple
import { extraireDepuisFichier } from './excelExtractor';
import { CONFIG_NOTE1 } from './noteConfigs';

const handleFileUpload = async (file: File) => {
  try {
    const donnees = await extraireDepuisFichier(file, CONFIG_NOTE1, 'NOTE 1');
    console.log(donnees.entete.entityName);
    console.log(donnees.sections.financialDebts.lignes[0].grossAmount);
  } catch (erreur) {
    console.error('Erreur:', erreur);
  }
};

// Exemple 2: Validation
const validation = validerDonneesExtraites(donnees, CONFIG_NOTE1);
if (!validation.valide) {
  console.error('Erreurs de validation:', validation.erreurs);
}

// Exemple 3: Calcul des totaux
const totaux = calculerTotauxSection(
  donnees,
  'financialDebts',
  ['grossAmount', 'mortgages', 'pledges', 'others']
);
console.log('Montant brut total:', totaux.grossAmount);
*/
