// services/fileValidationService.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any[][];
}

export interface ValidationRule {
  name: string;
  validate: (data: any[][]) => { isValid: boolean; message: string };
}

export const balanceValidationRules: ValidationRule[] = [
  {
    name: "FILE_NOT_EMPTY",
    validate: (data: any[][]) => ({
      isValid: !!(data && data.length > 1),
      message: "Le fichier est vide ou ne contient pas assez de lignes",
    }),
  },
  {
    name: "HEADERS_PRESENT",
    validate: (data: any[][]) => {
      const headers = data[0];
      const hasHeaders = headers && headers.length >= 8 && headers.some(h => h);

      return {
        isValid: !!hasHeaders,
        message: hasHeaders
          ? "En-têtes détectés"
          : "Aucun en-tête trouvé - le fichier doit contenir au moins 8 colonnes avec des en-têtes",
      };
    },
  },
  {
    name: "ACCOUNT_NUMBER_FORMAT",
    validate: (data: any[][]) => {
      const errors: string[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.every((cell) => !cell)) continue;

        const compte = String(row[0] || "").trim();
        if (!compte) {
          errors.push(`Ligne ${i + 1}: Numéro de compte manquant`);
          continue;
        }

        if (!/^\d{6}$/.test(compte)) {
          errors.push(
            `Ligne ${
              i + 1
            }: Numéro de compte "${compte}" invalide (format attendu: 6 chiffres)`
          );
        }
      }

      return {
        isValid: errors.length === 0,
        message:
          errors.length > 0 ? errors.join("; ") : "Format des comptes correct",
      };
    },
  },
  {
    name: "REQUIRED_FIELDS",
    validate: (data: any[][]) => {
      const errors: string[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.every((cell) => !cell)) continue;

        const compte = String(row[0] || "").trim();
        if (!row[1]) {
          errors.push(
            `Ligne ${i + 1}: Libellé manquant pour le compte ${compte}`
          );
        }
      }

      return {
        isValid: errors.length === 0,
        message:
          errors.length > 0 ? errors.join("; ") : "Champs requis présents",
      };
    },
  },
  {
    name: "NUMERIC_VALUES",
    validate: (data: any[][]) => {
      const errors: string[] = [];
      const amountColumns = [2, 3, 4, 5, 6, 7]; // Index des colonnes de montants (colonnes 3-8, 0-indexed)

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.every((cell) => !cell)) continue;

        for (const colIndex of amountColumns) {
          const value = row[colIndex];
          if (value !== null && value !== undefined && value !== "") {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors.push(
                `Ligne ${i + 1}, Colonne ${
                  colIndex + 1
                }: "${value}" n'est pas un nombre valide`
              );
            } else if (numValue < 0) {
              errors.push(
                `Ligne ${i + 1}, Colonne ${
                  colIndex + 1
                }: Les montants négatifs ne sont pas autorisés`
              );
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        message:
          errors.length > 0 ? errors.join("; ") : "Valeurs numériques valides",
      };
    },
  },
  {
    name: "DATA_CONSISTENCY",
    validate: (data: any[][]) => {
      const warnings: string[] = [];
      let totalLines = 0;
      let emptyLines = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row.some((cell) => cell)) {
          totalLines++;
        } else {
          emptyLines++;
        }
      }

      if (emptyLines > 0) {
        warnings.push(`${emptyLines} ligne(s) vide(s) détectée(s)`);
      }

      if (totalLines === 0) {
        warnings.push("Aucune donnée valide trouvée dans le fichier");
      }

      return {
        isValid: totalLines > 0,
        message:
          warnings.length > 0 ? warnings.join("; ") : "Données cohérentes",
      };
    },
  },
];

export class FileValidationService {
  static validateBalanceFile(data: any[][]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      data,
    };

    for (const rule of balanceValidationRules) {
      const validation = rule.validate(data);

      if (!validation.isValid) {
        result.isValid = false;
        if (validation.message.includes("Ligne")) {
          // C'est une erreur détaillée
          result.errors.push(validation.message);
        } else {
          // C'est un message d'erreur général
          result.errors.push(`${rule.name}: ${validation.message}`);
        }
      } else if (
        validation.message.includes("détectée") ||
        validation.message.includes("Aucune")
      ) {
        // C'est un avertissement
        result.warnings.push(validation.message);
      }
    }

    return result;
  }

  static formatValidationResult(result: ValidationResult): string {
    const messages: string[] = [];

    if (!result.isValid && result.errors.length > 0) {
      messages.push("❌ ERREURS DE VALIDATION:");
      result.errors.forEach((error) => messages.push(`• ${error}`));
    }

    if (result.warnings.length > 0) {
      messages.push("\n⚠️ AVERTISSEMENTS:");
      result.warnings.forEach((warning) => messages.push(`• ${warning}`));
    }

    if (result.isValid && result.errors.length === 0) {
      messages.push(
        "✅ Fichier valide! Toutes les vérifications sont passées."
      );
    }

    return messages.join("\n");
  }
}
