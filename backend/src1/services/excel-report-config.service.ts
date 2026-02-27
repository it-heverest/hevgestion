// backend/src/services/excel-report-config.service.ts
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

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
 * Load and validate Excel report config from public/upload/
 */
export async function loadExcelReportConfig(): Promise<ExcelValidationResult> {
  const result: ExcelValidationResult = {
    success: false,
    data: [],
    errors: [],
    fileName: "reportconfig.xlsx",
    totalRows: 0,
    validRows: 0,
  };

  try {
    // Path to the Excel file
    const filePath = path.join(process.cwd(), "../frontend/public/upload/reportconfig.xlsx");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${filePath}`);
    }

    // Read the Excel file
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Check sheets
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Le fichier Excel ne contient aucune feuille");
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Impossible de lire la feuille "${sheetName}"`);
    }

    // Validate headers
    const headers = getHeadersFromWorksheet(worksheet);
    const headerValidation = validateHeaders(headers);

    if (!headerValidation.isValid) {
      throw new Error(
        `En-têtes manquants: ${headerValidation.missingHeaders.join(
          ", "
        )}. En-têtes requis: id, name, description, icon`
      );
    }

    // Read data
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

    // Validate and transform each row
    const validData: ExcelElement[] = [];
    const uniqueIds = new Set<number>();

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 2; // +2 for header row and 0-based index

      try {
        const element = validateAndTransformRow(row, rowNumber);

        // Check for duplicate IDs
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

    // Final result
    result.data = validData;
    result.validRows = validData.length;
    result.success = validData.length > 0;

    console.log("📊 Résultat de lecture Excel:", {
      fileName: result.fileName,
      totalRows: result.totalRows,
      validRows: result.validRows,
      errors: result.errors.length,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la lecture du fichier";
    result.errors.push(errorMessage);

    console.error("❌ Erreur dans loadExcelReportConfig:", error);

    return result;
  }
}

/**
 * Simplified version that returns only valid data
 */
export async function getExcelReportElements(): Promise<ExcelElement[]> {
  const result = await loadExcelReportConfig();

  if (!result.success) {
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

// ============ UTILITY FUNCTIONS ============

interface HeaderValidation {
  isValid: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
}

function getHeadersFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
  try {
    const headers: string[] = [];

    const range = worksheet["!ref"]
      ? XLSX.utils.decode_range(worksheet["!ref"])
      : { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    // Read first row (headers)
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

  // Required fields
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

  // Description (optional)
  const description = String(row.description || "").trim();
  if (description.length > 500)
    throw new Error(
      `Description trop longue (max 500 caractères): ${description.length}`
    );

  // Icon (default)
  let icon = String(row.icon || "📄").trim();
  if (!icon) icon = "📄";

  // Valid icons
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

  const isEmoji = (text: string): boolean => {
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