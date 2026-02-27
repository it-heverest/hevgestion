// Validation rules and utilities for DSF Config imports
import * as XLSX from "xlsx";

// Expected column structure - UPDATED WITH NEW HEADERS
export const EXPECTED_COLUMNS = [
  "codeDsf",
  "libelle",
  "destinationCell",
  "operations",
  "category",
  "scope",
  "ownerType",
  "isActive",
  "isLocked",
];

// Valid sources for operations
export const SOURCES = ["MD", "MC", "OD", "OC", "SD", "SC"];

// Valid scopes
export const SCOPES = ["GLOBAL", "CLIENT", "EXERCISE", "USER"];

// Valid owner types
export const OWNER_TYPES = ["SYSTEM", "ADMIN", "ACCOUNTANT", "ASSISTANT"];

// Valid categories
export const CATEGORIES = [
  "note1",
  "note2",
  "note3",
  "note4",
  "note5",
  "note6",
  "note7",
  "note8",
  "note9",
  "note10",
  "note11",
  "note12",
  "note13",
  "note14",
  "note15",
  "note16",
  "note17",
  "note18",
  "note19",
  "note20",
  "note21",
  "note22",
  "note23",
  "note24",
  "note25",
  "note26",
  "note27",
  "note28",
  "note29",
  "note30",
  "note31",
  "note32",
  "note33",
  "note34",
  "note35",
  "note36",
  "note37",
  "note38",
  "note39",
  "note40",
  "ficheR1",
  "ficheR2",
  "ficheR3",
  "ficheR4",
  "ficheR4bis",
  "tableauFluxTresorerie",
  "tableauVariationCapitaux",
  "tableauInvestissement",
  "tableauFinancement",
  "bilanActif",
  "bilanPassif",
  "compteResultat",
  "resultatDetail",
  "annexeImmobilisations",
  "annexeStocks",
  "annexeCreances",
  "annexeDettes",
  "annexeProvisions",
  "annexeEngagements",
  "calculIS",
  "calculTVA",
  "calculCNPS",
  "calculIRPP",
  "calculAutresImpot",
  "ratiosFinanciers",
  "indicateursPerformance",
  "analyseSolvabilite",
  "analyseRentabilite",
  "infoJuridique",
  "infoFiscale",
  "infoSociale",
  "infoEnvironnementale",
  "rapportAudit",
  "rapportCommissaireComptes",
  "rapportDirection",
  "analyseSectorielle",
  "parametresGeneraux",
  "formatage",
  "validations",
  "calculsAutomatiques",
];

// Validation rules - UPDATED WITH NEW FIELDS
export const VALIDATION_RULES = {
  codeDsf: {
    required: true,
    pattern: /^[A-Z0-9_]+$/,
    maxLength: 50,
    message:
      "Doit contenir uniquement des lettres majuscules, chiffres et underscores",
  },
  libelle: {
    required: true,
    maxLength: 200,
    message: "Doit avoir maximum 200 caractères",
  },
  destinationCell: {
    required: true,
    pattern: /^[A-Z]+\d+$/,
    message: "Doit suivre le format Excel (ex: A1, B2, C3)",
  },
  operations: {
    required: false,
    pattern: /^([+-]\d+[A-Z]{2})(,\s*[+-]\d+[A-Z]{2})*$/,
    message:
      "Doit suivre le format: +20MD,+30MC,-40OD (séparé par des virgules)",
  },
  category: {
    required: true,
    pattern: new RegExp(`^(${CATEGORIES.join("|")})$`),
    message: `Doit être une catégorie valide: ${CATEGORIES.slice(0, 5).join(
      ", "
    )}...`,
  },
  scope: {
    required: true,
    pattern: new RegExp(`^(${SCOPES.join("|")})$`),
    message: `Doit être: ${SCOPES.join(", ")}`,
  },
  ownerType: {
    required: true,
    pattern: new RegExp(`^(${OWNER_TYPES.join("|")})$`),
    message: `Doit être: ${OWNER_TYPES.join(", ")}`,
  },
  isActive: {
    required: true,
    pattern: /^(true|false|TRUE|FALSE|1|0|oui|non|OUI|NON)$/,
    message: "Doit être: true, false, 1, 0, oui ou non",
  },
  isLocked: {
    required: true,
    pattern: /^(true|false|TRUE|FALSE|1|0|oui|non|OUI|NON)$/,
    message: "Doit être: true, false, 1, 0, oui ou non",
  },
};

export interface ValidationError {
  [key: string]: string;
}

export interface ValidationResult {
  fileStructureValid: boolean;
  headerErrors: string[];
  rowErrors: { [key: number]: ValidationError };
}

/**
 * Validate Excel file headers - UPDATED FOR NEW HEADERS
 */
export const validateHeaders = (headers: string[]): string[] => {
  const errors: string[] = [];
  const expectedHeaders = EXPECTED_COLUMNS;
  const actualHeaders = headers.map((h) => h.toString().toLowerCase().trim());

  // Map des en-têtes français vers anglais
  const headerMapping: { [key: string]: string } = {
    "code dsf": "codeDsf",
    libellé: "libelle",
    "note de référence": "noteRef",
    "cellule destination": "destinationCell",
    formule: "operations",
    catégorie: "category",
    portée: "scope",
    propriétaire: "ownerType",
    actif: "isActive",
    verrouillé: "isLocked",
  };

  // Check for missing headers - avec mapping français/anglais
  expectedHeaders.forEach((expectedHeader) => {
    const expectedHeaderLower = expectedHeader.toLowerCase();
    const frenchHeader = Object.keys(headerMapping).find(
      (key) => headerMapping[key] === expectedHeader
    );

    const found =
      actualHeaders.includes(expectedHeaderLower) ||
      (frenchHeader && actualHeaders.includes(frenchHeader.toLowerCase()));

    if (!found) {
      errors.push(
        `Colonne manquante: "${expectedHeader}" ou "${frenchHeader}"`
      );
    }
  });

  return errors;
};

/**
 * Validate a single row of data - UPDATED FOR NEW FIELDS
 */
export const validateRow = (
  row: any[],
  rowIndex: number,
  headers: string[]
): ValidationError => {
  const errors: ValidationError = {};
  const rowData: any = {};

  // Map des en-têtes français vers anglais
  const headerMapping: { [key: string]: string } = {
    "code dsf": "codeDsf",
    libellé: "libelle",
    "cellule destination": "destinationCell",
    formule: "operations",
    catégorie: "category",
    portée: "scope",
    propriétaire: "ownerType",
    actif: "isActive",
    verrouillé: "isLocked",
  };

  // Map data to expected columns - avec support français/anglais
  EXPECTED_COLUMNS.forEach((column) => {
    const columnLower = column.toLowerCase();

    // Chercher d'abord en anglais, puis en français
    let headerIndex = headers.findIndex(
      (h: string) => h.toLowerCase().trim() === columnLower
    );

    if (headerIndex === -1) {
      // Chercher l'équivalent français
      const frenchHeader = Object.keys(headerMapping).find(
        (key) => headerMapping[key] === column
      );
      if (frenchHeader) {
        headerIndex = headers.findIndex(
          (h: string) => h.toLowerCase().trim() === frenchHeader.toLowerCase()
        );
      }
    }

    rowData[column] = headerIndex >= 0 ? row[headerIndex] : "";
  });

  // Validate each field
  EXPECTED_COLUMNS.forEach((column) => {
    const value = rowData[column];
    const rules = VALIDATION_RULES[column as keyof typeof VALIDATION_RULES];

    if (!rules) return;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === "")) {
      errors[column] = "Ce champ est obligatoire";
      return;
    }

    // Skip further validation if empty and not required
    if (!value || value.toString().trim() === "") {
      return;
    }

    // Special handling for boolean fields
    if (column === "isActive" || column === "isLocked") {
      const boolValue = value.toString().toLowerCase().trim();
      const validBooleans = ["true", "false", "1", "0", "oui", "non"];

      if (!validBooleans.includes(boolValue)) {
        errors[column] = rules.message;
        return;
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value.toString().trim())) {
      errors[column] = rules.message;
      return;
    }

    // Max length validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      errors[column] = `Maximum ${rules.maxLength} caractères autorisés`;
      return;
    }

    // Special validation for operations
    if (column === "operations" && value) {
      const operations = value
        .toString()
        .split(",")
        .map((op: string) => op.trim());
      const invalidOps = operations.filter(
        (op: string) => !/^[+-]\d+[A-Z]{2}$/.test(op)
      );

      if (invalidOps.length > 0) {
        errors[column] = `Opérations invalides: ${invalidOps.join(
          ", "
        )}. Format: +20MD, -30MC`;
        return;
      }

      // Validate source codes
      const invalidSources = operations.filter((op: string) => {
        const source = op.slice(-2);
        return !SOURCES.includes(source);
      });

      if (invalidSources.length > 0) {
        errors[column] = `Sources invalides dans: ${invalidSources.join(
          ", "
        )}. Sources valides: ${SOURCES.join(", ")}`;
      }
    }

    // Special validation for destinationCell
    if (column === "destinationCell" && value) {
      const cell = value.toString().toUpperCase();
      if (!/^[A-Z]+\d+$/.test(cell)) {
        errors[column] = "Format de cellule invalide. Exemple: A1, B2, C3";
      }
    }
  });

  return errors;
};

/**
 * Parse Excel data into DSF config format - UPDATED FOR NEW FIELDS
 */
export const parseExcelData = (data: any[][]): any[] => {
  const configs: any[] = [];
  const headers = data[0].map((h) => h.toString().toLowerCase().trim());

  // Map des en-têtes français vers anglais
  const headerMapping: { [key: string]: string } = {
    "code dsf": "codeDsf",
    libellé: "libelle",
    "cellule destination": "destinationCell",
    formule: "operations",
    catégorie: "category",
    portée: "scope",
    propriétaire: "ownerType",
    actif: "isActive",
    verrouillé: "isLocked",
  };

  // Skip header row and process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length > 0) {
      const rowData: any = {};

      // Map data based on header positions - avec support français/anglais
      EXPECTED_COLUMNS.forEach((column) => {
        const columnLower = column.toLowerCase();

        // Chercher d'abord en anglais, puis en français
        let headerIndex = headers.findIndex((h: string) => h === columnLower);

        if (headerIndex === -1) {
          // Chercher l'équivalent français
          const frenchHeader = Object.keys(headerMapping).find(
            (key) => headerMapping[key] === column
          );
          if (frenchHeader) {
            headerIndex = headers.findIndex(
              (h: string) => h === frenchHeader.toLowerCase()
            );
          }
        }

        rowData[column] = headerIndex >= 0 ? row[headerIndex] : "";
      });

      // Convert boolean values
      const isActive = convertToBoolean(rowData.isActive);
      const isLocked = convertToBoolean(rowData.isLocked);

      const config = {
        codeDsf: rowData.codeDsf || `DSF_${i}`,
        libelle: rowData.libelle || `Configuration ${i}`,
        destinationCell: rowData.destinationCell || `B${i}`,
        operations: rowData.operations
          ? rowData.operations
              .toString()
              .split(",")
              .map((op: string) => op.trim())
          : [],
        category: rowData.category || `note${i}`,
        scope: rowData.scope || "EXERCISE",
        ownerType: rowData.ownerType || "SYSTEM",
        isActive: isActive !== null ? isActive : true,
        isLocked: isLocked !== null ? isLocked : false,
        _rowIndex: i - 1, // Store original row index for error mapping
      };
      configs.push(config);
    }
  }

  return configs;
};

/**
 * Helper function to convert various boolean representations
 */
const convertToBoolean = (value: any): boolean | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const strValue = value.toString().toLowerCase().trim();

  if (strValue === "true" || strValue === "1" || strValue === "oui") {
    return true;
  }

  if (strValue === "false" || strValue === "0" || strValue === "non") {
    return false;
  }

  return null;
};

/**
 * Validate entire Excel file - UPDATED FOR NEW FIELDS
 */
export const validateExcelFile = (data: any[][]): ValidationResult => {
  const result: ValidationResult = {
    fileStructureValid: false,
    headerErrors: [],
    rowErrors: {},
  };

  // Check if file is empty
  if (data.length === 0) {
    result.headerErrors = ["Le fichier est vide"];
    return result;
  }

  // Validate headers
  const headers = data[0];
  const headerErrors = validateHeaders(headers);

  // If there are missing column errors, consider structure invalid
  const hasMissingColumns = headerErrors.some((error) =>
    error.includes("manquante")
  );

  if (hasMissingColumns) {
    result.headerErrors = headerErrors;
    return result;
  }

  result.fileStructureValid = true;

  // Validate data rows
  const normalizedHeaders = headers.map((h) =>
    h.toString().toLowerCase().trim()
  );
  data.slice(1).forEach((row, index) => {
    const rowErrors = validateRow(row, index, normalizedHeaders);
    if (Object.keys(rowErrors).length > 0) {
      result.rowErrors[index] = rowErrors;
    }
  });

  return result;
};

/**
 * Check if there are any validation errors
 */
export const hasValidationErrors = (
  validationResult: ValidationResult
): boolean => {
  return (
    !validationResult.fileStructureValid ||
    Object.keys(validationResult.rowErrors).length > 0
  );
};

/**
 * Get file structure requirements description - UPDATED
 */
export const getFileRequirements = () => {
  return {
    expectedColumns: EXPECTED_COLUMNS,
    sources: SOURCES,
    scopes: SCOPES,
    ownerTypes: OWNER_TYPES,
    categories: CATEGORIES.slice(0, 10), // Show first 10 categories
    description: `Structure du fichier requis:
• Colonnes attendues: ${EXPECTED_COLUMNS.join(", ")} (ou équivalents français)
• Code DSF: Lettres majuscules, chiffres et underscores uniquement
• Destination: Format Excel (A1, B2, C3, etc.)
• Formule: Format: +20MD,+30MC,-40OD (séparé par des virgules)
• Sources valides: ${SOURCES.join(", ")}
• Portées valides: ${SCOPES.join(", ")}
• Types de propriétaire: ${OWNER_TYPES.join(", ")}
• Catégories: ${CATEGORIES.slice(0, 5).join(", ")}... (${
      CATEGORIES.length
    } au total)`,
  };
};

/**
 * Generate and download Excel template file - UPDATED WITH NEW HEADERS
 */
export const downloadTemplate = () => {
  // Sample data for the template avec les nouveaux champs
  const templateData = [
    {
      codeDsf: "DSF_IMMO_001",
      libelle: "Acquisition d'immobilisations",
      destinationCell: "B5",
      operations: "+20MD,+30MC",
      category: "note1",
      scope: "EXERCISE",
      ownerType: "SYSTEM",
      isActive: "true",
      isLocked: "false",
    },
    {
      codeDsf: "DSF_STOCK_001",
      libelle: "Variation de stocks",
      destinationCell: "C10",
      operations: "+40OD,-50OC",
      category: "note2",
      scope: "CLIENT",
      ownerType: "ADMIN",
      isActive: "true",
      isLocked: "true",
    },
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create worksheet with proper headers
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for better readability
  const colWidths = [
    { wch: 15 }, // codeDsf
    { wch: 30 }, // libelle
    { wch: 15 }, // destinationCell
    { wch: 25 }, // operations
    { wch: 15 }, // category
    { wch: 12 }, // scope
    { wch: 12 }, // ownerType
    { wch: 8 }, // isActive
    { wch: 10 }, // isLocked
  ];
  worksheet["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template_DSF");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `template_dsf_config_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Generate template with validation rules and examples - UPDATED WITH NEW HEADERS
 */
export const downloadDetailedTemplate = () => {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Main data sheet avec en-têtes français
  const templateData = [
    // Headers en français
    [
      "Code DSF",
      "Libellé",
      "Cellule destination",
      "Formule",
      "Catégorie",
      "Portée",
      "Propriétaire",
      "Actif",
      "Verrouillé",
    ],
    // Example data
    [
      "DSF_IMMO_001",
      "Acquisition d'immobilisations",
      "B5",
      "+20MD,+30MC",
      "note1",
      "EXERCISE",
      "SYSTEM",
      "true",
      "false",
    ],
    [
      "DSF_STOCK_001",
      "Variation de stocks",
      "C10",
      "+40OD,-50OC",
      "note2",
      "CLIENT",
      "ADMIN",
      "true",
      "true",
    ],
    [
      "DSF_CREANCE_001",
      "Créances clients",
      "D15",
      "+60SD,-70SC",
      "note3",
      "GLOBAL",
      "ACCOUNTANT",
      "false",
      "false",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Code DSF
    { wch: 35 }, // Libellé
    { wch: 18 }, // Cellule destination
    { wch: 25 }, // Formule
    { wch: 15 }, // Catégorie
    { wch: 12 }, // Portée
    { wch: 12 }, // Propriétaire
    { wch: 8 }, // Actif
    { wch: 10 }, // Verrouillé
  ];
  worksheet["!cols"] = colWidths;

  // Instructions sheet - STRUCTURE MISE À JOUR
  const instructionsData = [
    // Titre
    ["GUIDE D'UTILISATION - TEMPLATE DSF CONFIG"],
    [""],

    // En-têtes obligatoires
    ["EN-TÊTES OBLIGATOIRES (français ou anglais)"],
    [
      "Code DSF / codeDsf",
      "Libellé / libelle",
      "Cellule destination / destinationCell",
      "Formule / operations",
    ],
    [
      "Catégorie / category",
      "Portée / scope",
      "Propriétaire / ownerType",
      "Actif / isActive",
      "Verrouillé / isLocked",
    ],
    [""],

    // Règles par colonne
    ["REGLES DE VALIDATION PAR COLONNE"],
    ["Colonne", "Règles", "Exemple"],
    [
      "Code DSF",
      "Majuscules, chiffres, underscores uniquement. 50 caractères max",
      "DSF_IMMO_001",
    ],
    [
      "Libellé",
      "Texte descriptif. 200 caractères max",
      "Acquisition d'immobilisations",
    ],
    ["Cellule destination", "Format cellule Excel: A1, B2, C3...", "B5"],
    [
      "Formule",
      "Format: +20MD,+30MC,-40OD. Séparé par des virgules",
      "+20MD,+30MC",
    ],
    [
      "Catégorie",
      `Doit être une catégorie valide (${CATEGORIES.length} disponibles)`,
      "note1, ficheR1, bilanActif",
    ],
    ["Portée", `Doit être: ${SCOPES.join(", ")}`, "EXERCISE, CLIENT, GLOBAL"],
    [
      "Propriétaire",
      `Doit être: ${OWNER_TYPES.join(", ")}`,
      "SYSTEM, ADMIN, ACCOUNTANT",
    ],
    ["Actif", "true, false, 1, 0, oui, non", "true, oui, 1"],
    ["Verrouillé", "true, false, 1, 0, oui, non", "false, non, 0"],
    [""],

    // Sources valides
    ["SOURCES VALIDES POUR LES FORMULES"],
    ["MD = Mouvement Débit", "MC = Mouvement Crédit"],
    ["OD = Ouverture Débit", "OC = Ouverture Crédit"],
    ["SD = Solde Débit", "SC = Solde Crédit"],
    [""],

    // Exemples de formules
    ["EXEMPLES DE FORMULES VALIDES"],
    ["+20MD,+30MC", "Ajoute MD20 et MC30"],
    ["-40OD,-50OC", "Soustrait OD40 et OC50"],
    ["+60SD,-70SC", "Ajoute SD60 et soustrait SC70"],
    [""],

    // Instructions importantes
    ["INSTRUCTIONS IMPORTANTES"],
    ["- Utiliser les en-têtes français ou anglais"],
    ["- Respecter les formats indiqués"],
    ["- Les formules sont séparées par des virgules"],
    ["- Pas d'espaces dans les codes DSF"],
    ["- Les booléens acceptent: true/false, 1/0, oui/non"],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);

  // Largeurs de colonnes optimisées
  const instructionsColWidths = [
    { wch: 25 }, // Colonne 1
    { wch: 40 }, // Colonne 2
    { wch: 30 }, // Colonne 3
  ];
  instructionsSheet["!cols"] = instructionsColWidths;

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template_DSF");
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `template_dsf_config_detailed_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};
