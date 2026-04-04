// src/services/excel.service.ts
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";

export class ExcelService {
  static async parseBalanceFile(filePath: string): Promise<any> {
    try {
      console.log("ExcelService: Reading file:", filePath);

      // Check if file exists
      if (!require("fs").existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const workbook = XLSX.readFile(filePath);

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("Excel file has no sheets");
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        throw new Error(`Sheet '${sheetName}' not found in Excel file`);
      }

      console.log("ExcelService: Sheet name:", sheetName);
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("ExcelService: Raw data rows:", data.length);

      if (!data || data.length === 0) {
        throw new Error("Excel file is empty or invalid");
      }

      // Find the first non-empty row as headers
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(data.length, 10); i++) {
        const row = data[i];
        if (
          row &&
          row.some(
            (cell: any) =>
              cell !== null && cell !== undefined && String(cell).trim() !== ""
          )
        ) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = data[headerRowIndex] as string[];
      console.log(
        "ExcelService: Headers found at row",
        headerRowIndex,
        ":",
        headers
      );

      if (!headers || headers.length === 0) {
        throw new Error("No headers found in Excel file");
      }

      // Skip the header row for data processing
      const dataStartIndex = headerRowIndex + 1;
      const rows: any[] = [];

      for (let i = dataStartIndex; i < data.length; i++) {
        const row = data[i] as any[];
        if (!row || row.length === 0) continue;

        console.log(
          `ExcelService: Processing row ${i}, row length:`,
          row.length
        );

        const rowObj: any = {};
        headers.forEach((header, index) => {
          const normalizedHeader = ExcelService.normalizeHeader(header);
          rowObj[normalizedHeader] = row[index];
          console.log(
            `ExcelService: Header ${header} -> ${normalizedHeader} = ${row[index]}`
          );
        });

        console.log(`ExcelService: Processed row ${i}:`, rowObj);

        const processedRow = {
          accountNumber: String(rowObj.accountNumber || "").trim(),
          accountName: String(rowObj.accountName || "").trim(),
          openingDebit: parseFloat(rowObj.openingDebit || "0") || 0,
          openingCredit: parseFloat(rowObj.openingCredit || "0") || 0,
          movementDebit: parseFloat(rowObj.movementDebit || "0") || 0,
          movementCredit: parseFloat(rowObj.movementCredit || "0") || 0,
          closingDebit: parseFloat(rowObj.closingDebit || "0") || 0,
          closingCredit: parseFloat(rowObj.closingCredit || "0") || 0,
        };

        rows.push(processedRow);
      }

      console.log("ExcelService: Final processed rows:", rows.length);
      return { rows };
    } catch (error) {
      console.error("ExcelService: Error parsing file:", error);
      throw error;
    }
  }

  static async getBalanceTemplate(): Promise<any> {
    // In production, this would come from database
    return {
      headers: [
        "Numéro de Compte",
        "Intitulé du Compte",
        "Solde Débiteur Ouverture",
        "Solde Créditeur Ouverture",
        "Mouvement Débit",
        "Mouvement Crédit",
        "Solde Débiteur Clôture",
        "Solde Créditeur Clôture",
      ],
      sampleAccounts: [
        // Classe 1 - Capitaux
        { account: "101000", name: "Capital social", class: "1", debit: 0, credit: 500000 },
        { account: "106100", name: "Réserve légale", class: "1", debit: 0, credit: 50000 },
        { account: "120000", name: "Report à nouveau", class: "1", debit: 25000, credit: 0 },
        
        // Classe 2 - Immobilisations
        { account: "211000", name: "Terrains", class: "2", debit: 150000, credit: 0 },
        { account: "213000", name: "Constructions", class: "2", debit: 300000, credit: 0 },
        { account: "218300", name: "Matériel de transport", class: "2", debit: 80000, credit: 0 },
        { account: "281100", name: "Amortissements terrains", class: "2", debit: 0, credit: 15000 },
        { account: "281300", name: "Amortissements constructions", class: "2", debit: 0, credit: 30000 },
        
        // Classe 3 - Stocks
        { account: "311000", name: "Marchandises A", class: "3", debit: 120000, credit: 0 },
        { account: "350000", name: "Produits finis", class: "3", debit: 85000, credit: 0 },
        
        // Classe 4 - Créances et dette
        { account: "401000", name: "Fournisseurs", class: "4", debit: 0, credit: 95000 },
        { account: "411000", name: "Clients", class: "4", debit: 180000, credit: 0 },
        { account: "440000", name: "Organismes sociaux", class: "4", debit: 0, credit: 15000 },
        
        // Classe 5 - Disponibilités
        { account: "521000", name: "Banque", class: "5", debit: 450000, credit: 0 },
        { account: "530000", name: "Caisse", class: "5", debit: 25000, credit: 0 },
        
        // Classe 6 - Charges
        { account: "601000", name: "Achats de marchandises", class: "6", debit: 200000, credit: 0 },
        { account: "604000", name: "Achats de fournitures", class: "6", debit: 35000, credit: 0 },
        { account: "622000", name: "Locations", class: "6", debit: 48000, credit: 0 },
        { account: "623000", name: "Publicité", class: "6", debit: 25000, credit: 0 },
        { account: "626000", name: "Frais postaux", class: "6", debit: 8000, credit: 0 },
        { account: "641000", name: "Salaires", class: "6", debit: 180000, credit: 0 },
        { account: "645000", name: "Charges sociales", class: "6", debit: 72000, credit: 0 },
        { account: "661000", name: "Intérêts bancaires", class: "6", debit: 12000, credit: 0 },
        
        // Classe 7 - Produits
        { account: "701000", name: "Ventes de marchandises", class: "7", debit: 0, credit: 450000 },
        { account: "706000", name: "Prestations de services", class: "7", debit: 0, credit: 120000 },
        { account: "752000", name: "Revenus des placements", class: "7", debit: 0, credit: 8000 },
        
        // Classe 8 - Autres
        { account: "801000", name: "Charges constatées d'avance", class: "8", debit: 5000, credit: 0 },
        { account: "802000", name: "Produits à recevoir", class: "8", debit: 15000, credit: 0 },
      ],
    };
  }

  static async createBalanceFromTemplate(
    template: any,
    fiscalYear: number
  ): Promise<string> {
    const workbook = XLSX.utils.book_new();
    const data: any[][] = [];

    // Add headers
    data.push(template.headers);

    // Add sample rows with calculated values
    template.sampleAccounts.forEach((acc: any) => {
      // Calculate closing balance
      const openingDebit = acc.debit || 0;
      const openingCredit = acc.credit || 0;
      const movementDebit = Math.floor(Math.random() * 50000); // Random movement for demo
      const movementCredit = Math.floor(Math.random() * 40000);
      const closingDebit = Math.max(0, openingDebit + movementDebit - movementCredit);
      const closingCredit = Math.max(0, openingCredit + movementCredit - movementDebit);
      
      data.push([
        acc.account, 
        acc.name, 
        openingDebit, 
        openingCredit, 
        movementDebit, 
        movementCredit, 
        closingDebit, 
        closingCredit
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Balance");

    // Save file
    const fileName = `balance_modele_${fiscalYear}_${Date.now()}.xlsx`;
    const filePath = path.join(config.upload.directory, fileName);

    XLSX.writeFile(workbook, filePath);

    return filePath;
  }

  private static normalizeHeader(header: string): string {
    const mapping: { [key: string]: string } = {
      // Headers français simplifiés du template
      comptes: "accountNumber",
      compte: "accountNumber",
      libelle: "accountName",
      libellé: "accountName",
      "nom du compte": "accountName",
      "nom du compte ": "accountName",
      "ouverture debit": "openingDebit",
      "ouverture credit": "openingCredit",
      "mouvement debit": "movementDebit",
      "mouvement credit": "movementCredit",
      "solde debit": "closingDebit",
      "solde credit": "closingCredit",

      // Headers français détaillés (pour compatibilité)
      "numéro de compte": "accountNumber",
      "numero de compte": "accountNumber",
      libellés: "accountName",
      "intitulé du compte": "accountName",
      "intitule du compte": "accountName",
      "entrée débit": "openingDebit",
      "entrée debit": "openingDebit",
      "solde débiteur ouverture": "openingDebit",
      "solde debiteur ouverture": "openingDebit",
      "sd ouverture": "openingDebit",
      "entrée crédit": "openingCredit",
      "entrée credit": "openingCredit",
      "solde créditeur ouverture": "openingCredit",
      "solde crediteur ouverture": "openingCredit",
      "sc ouverture": "openingCredit",
      "mouvement débit": "movementDebit",
      "mvt debit": "movementDebit",
      "mouvement crédit": "movementCredit",
      "mvt credit": "movementCredit",
      "sortie débit": "closingDebit",
      "sortie debit": "closingDebit",
      "solde débiteur clôture": "closingDebit",
      "solde debiteur cloture": "closingDebit",
      "sd cloture": "closingDebit",
      "sortie crédit": "closingCredit",
      "sortie credit": "closingCredit",
      "solde créditeur clôture": "closingCredit",
      "solde crediteur cloture": "closingCredit",
      "sc cloture": "closingCredit",

      // Headers with accents - debit opening
      "débit ouverture": "openingDebit",
      "debit ouverture": "openingDebit",
      "débits ouverture": "openingDebit",
      "debits ouverture": "openingDebit",
      
      // Headers with accents - credit opening
      "crédit ouverture": "openingCredit",
      "credit ouverture": "openingCredit",
      "crédits ouverture": "openingCredit",
      "credits ouverture": "openingCredit",

      // Headers with accents - debit movement
      "débit mouvement": "movementDebit",
      "debit mouvement": "movementDebit",
      "débits mouvement": "movementDebit",
      "debits mouvement": "movementDebit",

      // Headers with accents - credit movement
      "crédit mouvement": "movementCredit",
      "credit mouvement": "movementCredit",
      "crédits mouvement": "movementCredit",
      "credits mouvement": "movementCredit",

      // Headers with accents - debit closing
      "débit clôture": "closingDebit",
      "debit cloture": "closingDebit",
      "débits clôture": "closingDebit",
      "debits cloture": "closingDebit",

      // Headers with accents - credit closing
      "crédit clôture": "closingCredit",
      "credit cloture": "closingCredit",
      "crédits clôture": "closingCredit",
      "credits cloture": "closingCredit",
    };

    const normalized = header.toLowerCase().trim();
    const result = mapping[normalized] || header;
    console.log(
      `ExcelService: Header "${header}" -> normalized "${normalized}" -> mapped to "${result}"`
    );
    return result;
  }
}
