// src/services/excelLoader.service.ts
import * as XLSX from "xlsx";
import { extraireDonneesGeneriques, ConfigurationMapping } from "./excel";

/**
 * Service pour charger et lire des fichiers Excel depuis le dossier public
 */
export class ExcelLoaderService {
  /**
   * Charge un fichier Excel depuis une URL publique
   * @param filePath Chemin relatif depuis /public (ex: "uploads/note1_data.xlsx")
   * @returns WorkBook Excel
   */
  static async loadExcelFromPublic(filePath: string): Promise<XLSX.WorkBook> {
    try {
      // Construire l'URL complète
      const url = `${window.location.origin}/${filePath}`;
      console.log("📥 Loading Excel from:", url);

      // Télécharger le fichier
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      // Lire le contenu en ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Convertir en WorkBook
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      console.log("✅ Excel loaded successfully. Sheets:", workbook.SheetNames);
      return workbook;
    } catch (error) {
      console.error("❌ Error loading Excel file:", error);
      throw new Error(`Impossible de charger le fichier Excel: ${filePath}`);
    }
  }

  /**
   * Extrait les données d'un fichier Excel public avec une configuration
   * @param filePath Chemin vers le fichier Excel dans /public
   * @param configuration Configuration de mapping
   * @param sheetName Nom de la feuille (optionnel)
   * @returns Données extraites
   */
  static async extractDataFromPublic(
    filePath: string,
    configuration: ConfigurationMapping,
    sheetName?: string
  ): Promise<any> {
    try {
      // Charger le fichier
      const workbook = await this.loadExcelFromPublic(filePath);

      // Extraire les données
      const data = extraireDonneesGeneriques(
        workbook,
        configuration,
        sheetName
      );

      console.log("✅ Data extracted successfully");
      return data;
    } catch (error) {
      console.error("❌ Error extracting data:", error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier Excel existe dans le dossier public
   * @param filePath Chemin vers le fichier
   * @returns true si le fichier existe
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const url = `${window.location.origin}/${filePath}`;
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Liste les feuilles d'un fichier Excel public
   * @param filePath Chemin vers le fichier
   * @returns Liste des noms de feuilles
   */
  static async listSheets(filePath: string): Promise<string[]> {
    const workbook = await this.loadExcelFromPublic(filePath);
    return workbook.SheetNames;
  }

  /**
   * Prévisualise les données brutes d'une plage de cellules
   * @param filePath Chemin vers le fichier
   * @param sheetName Nom de la feuille
   * @param range Plage de cellules (ex: "A1:D10")
   * @returns Données sous forme de tableau 2D
   */
  static async previewRange(
    filePath: string,
    sheetName: string,
    range?: string
  ): Promise<any[][]> {
    const workbook = await this.loadExcelFromPublic(filePath);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Feuille "${sheetName}" introuvable`);
    }

    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      range: range,
      defval: null,
    });

    return data as any[][];
  }
}

// Export d'instance singleton pour faciliter l'utilisation
export const excelLoader = ExcelLoaderService;
