// utils/fileValidation.ts - File validation utilities

export const VALID_EXCEL_EXTENSIONS = [".xlsx", ".xls"] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateExcelFile = (file: File): FileValidationResult => {
  const fileExtension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!VALID_EXCEL_EXTENSIONS.includes(fileExtension as any)) {
    return {
      isValid: false,
      error:
        "Format de fichier invalide. Veuillez sélectionner un fichier Excel (.xlsx ou .xls)",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "Le fichier ne doit pas dépasser 10MB",
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(2)} KB`;
};
