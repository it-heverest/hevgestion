// excelReportConfig.service.ts
import * as XLSX from "xlsx";

export interface ExcelElement {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface ExcelValidationResult {
  success: boolean;
  data: ExcelElement[];
  errors: string[];
  fileName?: string;
  totalRows: number;
  validRows: number;
}

/**
 * Lit et valide un fichier Excel depuis le dossier public/upload/
 */
export async function loadExcelFromPublic(): Promise<ExcelValidationResult> {
  const result: ExcelValidationResult = {
    success: false,
    data: [],
    errors: [],
    fileName: "reportconfig.xlsx",
    totalRows: 0,
    validRows: 0,
  };

  try {
    // 1. Charger le fichier depuis public/upload/
    const response = await fetch("/upload/reportconfig.xlsx");

    if (!response.ok) {
      throw new Error(`Fichier non trouvé: /upload/reportconfig.xlsx`);
    }

    // 2. Lire le fichier Excel
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // 3. Vérifier qu'il y a des feuilles
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Le fichier Excel ne contient aucune feuille");
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. Vérifier que la feuille existe
    if (!worksheet) {
      throw new Error(`Impossible de lire la feuille "${sheetName}"`);
    }

    // 5. Vérifier les en-têtes
    const headers = getHeadersFromWorksheet(worksheet);
    const headerValidation = validateHeaders(headers);

    if (!headerValidation.isValid) {
      throw new Error(
        `En-têtes manquants: ${headerValidation.missingHeaders.join(
          ", "
        )}. En-têtes requis: id, name, description, icon`
      );
    }

    // 6. Lire les données
    let rawData: any[];
    try {
      rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    } catch (e) {
      throw new Error("Impossible de convertir les données Excel");
    }

    result.totalRows = rawData.length;

    if (rawData.length === 0) {
      result.errors.push("Le fichier est vide (aucune donnée)");
      return result;
    }

    // 7. Valider et transformer chaque ligne
    const validData: ExcelElement[] = [];
    const uniqueIds = new Set<number>();

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 2; // +2 car ligne 1 = en-têtes, et index 0-based

      try {
        const element = validateAndTransformRow(row, rowNumber);

        // Vérifier les doublons d'ID
        if (uniqueIds.has(element.id)) {
          result.errors.push(`Ligne ${rowNumber}: ID ${element.id} en doublon`);
          continue;
        }

        uniqueIds.add(element.id);
        validData.push(element);
      } catch (error) {
        result.errors.push(
          `Ligne ${rowNumber}: ${
            error instanceof Error ? error.message : "Erreur de validation"
          }`
        );
      }
    }

    // 8. Préparer le résultat final
    result.data = validData;
    result.validRows = validData.length;
    result.success = validData.length > 0;

    // Log pour débogage
    console.log("📊 Résultat de lecture Excel:", {
      fileName: result.fileName,
      totalRows: result.totalRows,
      validRows: result.validRows,
      errors: result.errors.length,
    });

    return result;
  } catch (error) {
    // Capture toutes les erreurs
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la lecture du fichier";
    result.errors.push(errorMessage);

    console.error("❌ Erreur dans loadExcelFromPublic:", error);

    return result;
  }
}

/**
 * Version simplifiée qui retourne seulement les données valides depuis public/
 */
export async function getExcelElementsFromPublic(): Promise<ExcelElement[]> {
  const result = await loadExcelFromPublic();

  if (!result.success) {
    // Créer un message d'erreur détaillé
    let errorMessage = "Échec de lecture du fichier Excel";

    if (result.errors.length > 0) {
      errorMessage += `: ${result.errors[0]}`;
      if (result.errors.length > 1) {
        errorMessage += ` (+ ${result.errors.length - 1} autres erreurs)`;
      }
    }

    throw new Error(errorMessage);
  }

  return result.data;
}

// ============ FONCTIONS UTILITAIRES ============

interface HeaderValidation {
  isValid: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
}

function getHeadersFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
  try {
    const headers: string[] = [];

    // Obtenir la plage de la feuille
    const range = worksheet["!ref"]
      ? XLSX.utils.decode_range(worksheet["!ref"])
      : { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    // Lire la première ligne (ligne des en-têtes)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];

      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== "") {
        headers.push(String(cell.v).trim());
      } else {
        headers.push(`Colonne_${col + 1}`);
      }
    }

    return headers;
  } catch (error) {
    console.error("Erreur lors de la lecture des en-têtes:", error);
    return [];
  }
}

function validateHeaders(headers: string[]): HeaderValidation {
  const REQUIRED_HEADERS = ["id", "name", "description", "icon"];
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

  const missingHeaders = REQUIRED_HEADERS.filter(
    (required) => !normalizedHeaders.includes(required.toLowerCase())
  );

  const extraHeaders = headers.filter(
    (header) =>
      header &&
      !REQUIRED_HEADERS.some(
        (req) => req.toLowerCase() === header.toLowerCase().trim()
      )
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
    extraHeaders,
  };
}

function validateAndTransformRow(row: any, rowNumber: number): ExcelElement {
  if (!row || typeof row !== "object") {
    throw new Error("Ligne invalide ou vide");
  }

  // Vérifier les champs requis
  const requiredFields = ["id", "name"];
  const missingFields = requiredFields.filter(
    (field) =>
      row[field] === undefined ||
      row[field] === null ||
      String(row[field]).trim() === ""
  );

  if (missingFields.length > 0) {
    throw new Error(`Champs manquants: ${missingFields.join(", ")}`);
  }

  // ID
  const idStr = String(row.id).trim();
  if (!idStr) throw new Error("ID est vide");

  const id = parseInt(idStr, 10);
  if (isNaN(id)) throw new Error(`ID doit être un nombre: "${idStr}"`);
  if (id <= 0) throw new Error(`ID doit être positif: ${id}`);
  if (id > 999999) throw new Error(`ID trop grand: ${id}`);

  // Name
  const name = String(row.name).trim();
  if (!name) throw new Error("Nom est vide");
  if (name.length > 100)
    throw new Error(`Nom trop long (max 100 caractères): ${name.length}`);

  // Description (optionnelle)
  const description = String(row.description || "").trim();
  if (description.length > 500)
    throw new Error(
      `Description trop longue (max 500 caractères): ${description.length}`
    );

  // Icon (avec valeur par défaut)
  let icon = String(row.icon || "📄").trim();
  if (!icon) icon = "📄";

  // Liste d'icônes autorisées
  const validIcons = [
    "📁",
    "📄",
    "📷",
    "🎵",
    "🎬",
    "🔗",
    "📊",
    "📈",
    "📉",
    "⭐",
    "🔒",
    "🚀",
    "📎",
    "🔔",
    "🏷️",
  ];

  // Vérifier si c'est un emoji (support Unicode)
  const isEmoji = (text: string): boolean => {
    // Regex pour détecter les emojis
    const emojiRegex = /\p{Emoji}/u;
    return emojiRegex.test(text);
  };

  if (!validIcons.includes(icon) && !isEmoji(icon)) {
    console.warn(
      `Ligne ${rowNumber}: Icône "${icon}" non valide, utilisation de "📄" par défaut`
    );
    icon = "📄";
  }

  return {
    id,
    name,
    description,
    icon,
  };
}

/**
 * Fonction pour lire un fichier Excel depuis un input file (pour upload manuel)
 */
export async function readExcelFile(
  file: File
): Promise<ExcelValidationResult> {
  const result: ExcelValidationResult = {
    success: false,
    data: [],
    errors: [],
    fileName: file.name,
    totalRows: 0,
    validRows: 0,
  };

  try {
    if (!file) {
      throw new Error("Aucun fichier sélectionné");
    }

    // Lire le fichier
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Le fichier Excel ne contient aucune feuille");
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Impossible de lire la feuille "${sheetName}"`);
    }

    // Le reste du code est identique à loadExcelFromPublic...
    const headers = getHeadersFromWorksheet(worksheet);
    const headerValidation = validateHeaders(headers);

    if (!headerValidation.isValid) {
      throw new Error(
        `En-têtes manquants: ${headerValidation.missingHeaders.join(", ")}`
      );
    }

    let rawData: any[];
    try {
      rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    } catch (e) {
      throw new Error("Impossible de convertir les données Excel");
    }

    result.totalRows = rawData.length;

    if (rawData.length === 0) {
      result.errors.push("Le fichier est vide");
      return result;
    }

    const validData: ExcelElement[] = [];
    const uniqueIds = new Set<number>();

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 2;

      try {
        const element = validateAndTransformRow(row, rowNumber);

        if (uniqueIds.has(element.id)) {
          result.errors.push(`Ligne ${rowNumber}: ID ${element.id} en doublon`);
          continue;
        }

        uniqueIds.add(element.id);
        validData.push(element);
      } catch (error) {
        result.errors.push(
          `Ligne ${rowNumber}: ${
            error instanceof Error ? error.message : "Erreur de validation"
          }`
        );
      }
    }

    result.data = validData;
    result.validRows = validData.length;
    result.success = validData.length > 0;

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Erreur inconnue"
    );
    return result;
  }
}

/**
 * Fonction ultra-simple qui retourne directement les éléments
 */
export async function simpleExcelReader(file: File): Promise<ExcelElement[]> {
  const result = await readExcelFile(file);

  if (!result.success) {
    throw new Error(
      `Échec de lecture: ${result.errors[0] || "Erreur inconnue"}`
    );
  }

  return result.data;
}
