// src/services/excel.service.ts
import * as XLSX from "xlsx";
import * as fs from "fs";
import { config } from "../config";
import { planComptableService } from "./plan-comptable.service";

const path = require("path");

interface PlanComptableCompte {
  numero: string;
  libelle: string;
  classe: number;
}

const PLAN_COMPTABLE_PATH = path.join(config.rootDir, "frontend", "plan_comptable", "PLAN COMPTABLE UNIQUE.xlsx");

let planComptableCache: PlanComptableCompte[] | null = null;

export class ExcelService {
  static async loadPlanComptable(): Promise<PlanComptableCompte[]> {
    if (planComptableCache) {
      return planComptableCache;
    }

    try {
      if (!fs.existsSync(PLAN_COMPTABLE_PATH)) {
        console.warn("Plan comptable file not found, skipping validation");
        return [];
      }

      const workbook = XLSX.readFile(PLAN_COMPTABLE_PATH);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const accounts: PlanComptableCompte[] = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        if (row && row[0]) {
          const numero = String(row[0]).trim();
          const libelle = row[1] ? String(row[1]).trim() : "";
          const classe = numero ? parseInt(numero.charAt(0)) : 0;
          if (numero && /^1[0-9]0\d{2}$/.test(numero)) {
            accounts.push({ numero, libelle, classe });
          }
        }
      }

      planComptableCache = accounts;
      console.log(`Loaded ${accounts.length} accounts from plan comptable`);
      return accounts;
    } catch (error) {
      console.error("Error loading plan comptable:", error);
      return [];
    }
  }

  static async validateAccount(
    accountNumber: string,
    accountName: string
  ): Promise<{ valid: boolean; error?: string }> {
    const result = planComptableService.validateAccount(accountNumber, accountName);
    if (!result.valid) return result;

    const planComptable = await ExcelService.loadPlanComptable();
    
    if (planComptable.length === 0) {
      return { valid: true };
    }

    if (!accountNumber || accountNumber.length < 3) {
      return { valid: false, error: `Numéro de compte invalide: ${accountNumber}` };
    }

    const rootAccount = accountNumber.substring(0, 3);
    const found = planComptable.find(c => c.numero === rootAccount);

    if (!found) {
      return { 
        valid: false, 
        error: `Compte "${accountNumber}" n'existe pas dans le plan comptable OHADA (racine: ${rootAccount})` 
      };
    }

    return { valid: true };
  }

  static async validateBalanceAccounts(
    rows: { accountNumber: string; accountName: string }[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.accountNumber) continue;

      const validation = await ExcelService.validateAccount(row.accountNumber, row.accountName || "");
      if (!validation.valid && validation.error) {
        errors.push(validation.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateBalanceWithPosition(
    rows: { accountNumber: string; accountName: string; debit?: number; credit?: number }[]
  ): { valid: boolean; errors: string[] } {
    const normalizedRows = rows.map(r => ({
      accountNumber: r.accountNumber,
      accountName: r.accountName,
      debit: r.debit || 0,
      credit: r.credit || 0,
    }));
    return planComptableService.validateBalanceRows(normalizedRows);
  }

  // ============ BALANCE TEMPLATE METHODS ============

  static async getBalanceTemplate() {
    return {
      headers: ["Compte", "Libellé", "Opening Debit", "Opening Credit", "Movement Debit", "Movement Credit", "Closing Debit", "Closing Credit"],
      sampleAccounts: [
        { account: "101000", name: "Capital social", class: "1", debit: 0, credit: 10000000 },
        { account: "109000", name: "Capital souscrit non appelé", class: "1", debit: 0, credit: 0 },
        { account: "110000", name: "Report à nouveau (solde créditeur)", class: "1", debit: 0, credit: 0 },
        { account: "120000", name: "Résultat net de l'exercice", class: "1", debit: 0, credit: 0 },
        { account: "201000", name: "Frais d'établissement", class: "2", debit: 0, credit: 0 },
        { account: "203000", name: "Frais de recherche et développement", class: "2", debit: 0, credit: 0 },
        { account: "205000", name: "Concessions et droits similaires", class: "2", debit: 0, credit: 0 },
        { account: "211000", name: "Terrains", class: "2", debit: 0, credit: 0 },
        { account: "213000", name: "Constructions", class: "2", debit: 0, credit: 0 },
        { account: "215000", name: "Installations techniques", class: "2", debit: 0, credit: 0 },
        { account: "218100", name: "Matériel de transport", class: "2", debit: 0, credit: 0 },
        { account: "218200", name: "Matériel informatique", class: "2", debit: 0, credit: 0 },
        { account: "218300", name: "Mobilier de bureau", class: "2", debit: 0, credit: 0 },
        { account: "281100", name: "Amortissements constructions", class: "2", debit: 0, credit: 0 },
        { account: "301000", name: "Marchandises", class: "3", debit: 0, credit: 0 },
        { account: "311000", name: "Matières premières", class: "3", debit: 0, credit: 0 },
        { account: "331000", name: "Produits finis", class: "3", debit: 0, credit: 0 },
        { account: "401000", name: "Fournisseurs - Achats de biens", class: "4", debit: 0, credit: 0 },
        { account: "411000", name: "Clients", class: "4", debit: 0, credit: 0 },
        { account: "421000", name: "Personnel - Rémunérations dues", class: "4", debit: 0, credit: 0 },
        { account: "431000", name: "Sécurité sociale", class: "4", debit: 0, credit: 0 },
        { account: "441100", name: "État - TVA due", class: "4", debit: 0, credit: 0 },
        { account: "445200", name: "État - TVA récupérer", class: "4", debit: 0, credit: 0 },
        { account: "521000", name: "Banques", class: "5", debit: 0, credit: 0 },
        { account: "531000", name: "Caisse", class: "5", debit: 0, credit: 0 },
        { account: "601000", name: "Achats de marchandises", class: "6", debit: 0, credit: 0 },
        { account: "602000", name: "Achats de matières premières", class: "6", debit: 0, credit: 0 },
        { account: "604000", name: "Achats de fournitures", class: "6", debit: 0, credit: 0 },
        { account: "605000", name: "Achats d'études et prestations", class: "6", debit: 0, credit: 0 },
        { account: "622000", name: "Rémunérations d'intermédiaires", class: "6", debit: 0, credit: 0 },
        { account: "623000", name: "Publicité, publications", class: "6", debit: 0, credit: 0 },
        { account: "624000", name: "Transports", class: "6", debit: 0, credit: 0 },
        { account: "625000", name: "Déplacements, missions", class: "6", debit: 0, credit: 0 },
        { account: "626000", name: "Frais postaux", class: "6", debit: 0, credit: 0 },
        { account: "627000", name: "Services bancaires", class: "6", debit: 0, credit: 0 },
        { account: "628000", name: "Autres services extérieurs", class: "6", debit: 0, credit: 0 },
        { account: "631000", name: "Impôts et taxes", class: "6", debit: 0, credit: 0 },
        { account: "641000", name: "Salaires et appointements", class: "6", debit: 0, credit: 0 },
        { account: "645000", name: "Charges de sécurité sociale", class: "6", debit: 0, credit: 0 },
        { account: "661000", name: "Charges d'intérêt", class: "6", debit: 0, credit: 0 },
        { account: "671000", name: "Pénalités et amendes", class: "6", debit: 0, credit: 0 },
        { account: "681000", name: "Dotations aux amortissements", class: "6", debit: 0, credit: 0 },
        { account: "691000", name: "Impôts sur les bénéfices", class: "6", debit: 0, credit: 0 },
        { account: "701000", name: "Ventes de marchandises", class: "7", debit: 0, credit: 0 },
        { account: "702000", name: "Ventes de produits finis", class: "7", debit: 0, credit: 0 },
        { account: "706000", name: "Prestations de services", class: "7", debit: 0, credit: 0 },
        { account: "707000", name: "Ventes de fournitures", class: "7", debit: 0, credit: 0 },
        { account: "708000", name: "Produits des activités annexes", class: "7", debit: 0, credit: 0 },
        { account: "709000", name: "Rabais, remises et ristournes accordés", class: "7", debit: 0, credit: 0 },
        { account: "741000", name: "Subventions d'exploitation", class: "7", debit: 0, credit: 0 },
        { account: "751000", name: "Revenus des immeubles", class: "7", debit: 0, credit: 0 },
        { account: "761000", name: "Produits financiers", class: "7", debit: 0, credit: 0 },
        { account: "771000", name: "Subventions d'équilibre", class: "7", debit: 0, credit: 0 },
        { account: "781000", name: "Reprises sur provisions", class: "7", debit: 0, credit: 0 },
        { account: "791000", name: "Transferts de charges", class: "7", debit: 0, credit: 0 },
        // Classe 8 - Résultats
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

    data.push(template.headers);

    template.sampleAccounts.forEach((acc: any) => {
      const openingDebit = acc.debit || 0;
      const openingCredit = acc.credit || 0;
      const movementDebit = Math.floor(Math.random() * 50000);
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

    const fileName = `balance_modele_${fiscalYear}_${Date.now()}.xlsx`;
    const filePath = path.join(config.upload.directory, config.upload.subDirectories.balance, fileName);

    XLSX.writeFile(workbook, filePath);

    return filePath;
  }

  private static normalizeHeader(header: string): string {
    const mapping: { [key: string]: string } = {
      // Account number
      comptes: "accountNumber",
      compte: "accountNumber",
      "n° compte": "accountNumber",
      "numéro compte": "accountNumber",
      "n° de compte": "accountNumber",
      "numero de compte": "accountNumber",
      "account number": "accountNumber",
      account: "accountNumber",
      // Account name
      libelle: "accountName",
      libellé: "accountName",
      "nom du compte": "accountName",
      "nom du compte ": "accountName",
      "intitulé du compte": "accountName",
      nom: "accountName",
      // Opening balance
      "débit initial": "openingDebit",
      "crédit initial": "openingCredit",
      "debit initial": "openingDebit",
      "credit initial": "openingCredit",
      // Movement
      débit: "movementDebit",
      crédit: "movementCredit",
      "débit mouvement": "movementDebit",
      "crédit mouvement": "movementCredit",
      // Closing balance
      "solde débiteur": "closingDebit",
      "solde créditeur": "closingCredit",
      "solde": "balance",
    };

    const normalized = header.toLowerCase().trim();
    return mapping[normalized] || normalized;
  }

  static async parseBalanceFile(filePath: string): Promise<any> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const rows: any[] = [];
    const headers = (jsonData[0] as string[]).map((h, idx) => ({
      index: idx,
      original: h,
      normalized: this.normalizeHeader(h || ""),
    }));

    const accountCol = headers.find(h => 
      h.normalized === "accountNumber" || 
      h.original?.toLowerCase().includes("compte") ||
      h.original?.toLowerCase().includes("account")
    );
    if (!accountCol) {
      console.error("Headers found:", headers.map(h => ({ original: h.original, normalized: h.normalized })));
      throw new Error("Colonne 'Compte' non trouvée dans le fichier Excel");
    }
    
    const colMatches = (h: any, keywords: string[]) => {
      const orig = h.original?.toLowerCase() || "";
      const norm = h.normalized?.toLowerCase() || "";
      return keywords.some(k => orig.includes(k) || norm.includes(k));
    };

    const nameCol = headers.find(h => colMatches(h, ["libell", "nom", "intitul"]));
    const openDebitCol = headers.find(h => colMatches(h, ["débit initial", "debit initial", "debiteur initial", "débiteur initial"]));
    const openCreditCol = headers.find(h => colMatches(h, ["crédit initial", "credit initial", "crediteur initial", "créditeur initial"]));
    const moveDebitCol = headers.find(h => colMatches(h, ["débit", "debit"]));
    const moveCreditCol = headers.find(h => colMatches(h, ["crédit", "credit"]));
    const closeDebitCol = headers.find(h => colMatches(h, ["solde débiteur", "solde debiteur", "solde final"]));
    const closeCreditCol = headers.find(h => colMatches(h, ["solde créditeur", "solde crediteur"]));

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || !row[accountCol?.index || 0]) continue;

      const accountNumber = String(row[accountCol.index] || "").trim();
      if (!accountNumber || accountNumber.length < 3) continue;

      const hasNumericValue = (val: any) => {
        if (typeof val === "number") return true;
        if (typeof val === "string") {
          const cleaned = val.replace(/[<>,]/g, "").trim();
          return cleaned !== "" && !isNaN(parseFloat(cleaned));
        }
        return false;
      };

      const getNumericValue = (val: any): number => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const cleaned = val.replace(/[<>,]/g, "").trim();
          return parseFloat(cleaned) || 0;
        }
        return 0;
      };

      const rowData: any = {
        accountNumber,
        accountName: nameCol ? String(row[nameCol.index] || "").trim() : "",
      };

      if (openDebitCol && hasNumericValue(row[openDebitCol.index])) {
        rowData.openingDebit = getNumericValue(row[openDebitCol.index]);
      }
      if (openCreditCol && hasNumericValue(row[openCreditCol.index])) {
        rowData.openingCredit = getNumericValue(row[openCreditCol.index]);
      }
      if (moveDebitCol && hasNumericValue(row[moveDebitCol.index])) {
        rowData.movementDebit = getNumericValue(row[moveDebitCol.index]);
      }
      if (moveCreditCol && hasNumericValue(row[moveCreditCol.index])) {
        rowData.movementCredit = getNumericValue(row[moveCreditCol.index]);
      }
      if (closeDebitCol && hasNumericValue(row[closeDebitCol.index])) {
        rowData.closingDebit = getNumericValue(row[closeDebitCol.index]);
      }
      if (closeCreditCol && hasNumericValue(row[closeCreditCol.index])) {
        rowData.closingCredit = getNumericValue(row[closeCreditCol.index]);
      }

      if (!rowData.closingDebit && !rowData.closingCredit) {
        rowData.closingDebit = Math.max(0, (rowData.openingDebit || 0) + (rowData.movementDebit || 0) - (rowData.movementCredit || 0));
        rowData.closingCredit = Math.max(0, (rowData.openingCredit || 0) + (rowData.movementCredit || 0) - (rowData.movementDebit || 0));
      }

      rows.push(rowData);
    }

    return {
      rows,
      meta: {
        sheetName,
        totalRows: rows.length,
      },
    };
  }
}