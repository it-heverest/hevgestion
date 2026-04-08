// backend/src/services/plan-comptable.service.ts
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";

export interface PlanCompteRecord {
  numero: string;
  libelle: string;
  classe: number;
  type: "actif" | "passif" | "charge" | "produit" | "mixte";
  positionDebit: boolean;
  positionCredit: boolean;
}

interface PlanComptableData {
  version: string;
  lastUpdated: string;
  accounts: PlanCompteRecord[];
}

class PlanComptableService {
  private data: PlanComptableData | null = null;
  private accountsMap: Map<string, PlanCompteRecord> = new Map();
  private jsonPath: string;

  constructor() {
    this.jsonPath = path.join(config.rootDir, "assets", "data", "plan-comptable.json");
  }

  private loadData(): PlanComptableData {
    if (this.data) return this.data;

    try {
      if (fs.existsSync(this.jsonPath)) {
        const raw = fs.readFileSync(this.jsonPath, "utf-8");
        this.data = JSON.parse(raw) as PlanComptableData;
        this.buildMap();
        console.log(`✅ Loaded ${this.data.accounts.length} accounts from JSON`);
        return this.data;
      }
    } catch (error) {
      console.error("Error loading JSON plan comptable:", error);
    }

    // Fallback: return empty data
    this.data = { version: "1.0.0", lastUpdated: new Date().toISOString(), accounts: [] };
    return this.data;
  }

  private buildMap(): void {
    if (!this.data) return;
    this.accountsMap.clear();
    this.data.accounts.forEach((acc) => {
      this.accountsMap.set(acc.numero, acc);
    });
  }

  getAccount(numero: string): PlanCompteRecord | undefined {
    this.loadData();
    return this.accountsMap.get(numero);
  }

  getAccountByClass(classe: number): PlanCompteRecord[] {
    const data = this.loadData();
    return data.accounts.filter((acc) => acc.classe === classe);
  }

  validateAccount(
    accountNumber: string,
    accountName: string
  ): { valid: boolean; error?: string } {
    const data = this.loadData();

    if (!accountNumber || accountNumber.length < 3) {
      return { valid: false, error: `Numéro de compte invalide: ${accountNumber}` };
    }

    if (data.accounts.length === 0) {
      return { valid: true }; // Skip validation if no plan comptable loaded
    }

    const rootAccount = accountNumber.substring(0, 3);
    const found = this.accountsMap.get(rootAccount);

    if (!found) {
      return {
        valid: false,
        error: `Compte "${accountNumber}" n'existe pas dans le plan comptable OHADA (racine: ${rootAccount})`,
      };
    }

    return { valid: true };
  }

  validatePosition(
    accountNumber: string,
    debit: number,
    credit: number
  ): { valid: boolean; error?: string } {
    const data = this.loadData();

    if (!accountNumber || accountNumber.length < 3) {
      return { valid: true };
    }

    if (data.accounts.length === 0) {
      return { valid: true }; // Skip if no plan comptable loaded
    }

    const rootAccount = accountNumber.substring(0, 3);
    const found = this.accountsMap.get(rootAccount);

    if (!found) {
      return { valid: true }; // Skip if not found (handled by validateAccount)
    }

    // Check if debit is allowed
    if (debit > 0 && !found.positionDebit) {
      return {
        valid: false,
        error: `Le compte ${accountNumber} (${found.libelle}) ne peut pas avoir de débit. Position: ${found.positionCredit ? "Crédit uniquement" : "Mixte"}`,
      };
    }

    // Check if credit is allowed
    if (credit > 0 && !found.positionCredit) {
      return {
        valid: false,
        error: `Le compte ${accountNumber} (${found.libelle}) ne peut pas avoir de crédit. Position: ${found.positionDebit ? "Débit uniquement" : "Mixte"}`,
      };
    }

    return { valid: true };
  }

  validateBalanceRows(
    rows: { accountNumber: string; accountName: string; debit: number; credit: number }[]
  ): { valid: boolean; errors: string[] } {
    this.loadData();
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.accountNumber) continue;

      // Validate account existence
      const accountValidation = this.validateAccount(row.accountNumber, row.accountName || "");
      if (!accountValidation.valid && accountValidation.error) {
        errors.push(accountValidation.error);
        continue;
      }

      // Validate position (debit/credit)
      const positionValidation = this.validatePosition(
        row.accountNumber,
        row.debit || 0,
        row.credit || 0
      );
      if (!positionValidation.valid && positionValidation.error) {
        errors.push(positionValidation.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  generateJsonFromExcel(excelPath: string): PlanComptableData {
    const XLSX = require("xlsx");
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const accounts: PlanCompteRecord[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (row && row[0]) {
        const numero = String(row[0]).trim();
        const libelle = row[1] ? String(row[1]).trim() : "";

        if (numero && /^1[0-9]0\d{2}$/.test(numero)) {
          const classe = parseInt(numero.charAt(0));
          const { type, positionDebit, positionCredit } = this.getAccountTypeProperties(classe);

          accounts.push({
            numero,
            libelle,
            classe,
            type,
            positionDebit,
            positionCredit,
          });
        }
      }
    }

    const planData: PlanComptableData = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      accounts,
    };

    // Save to JSON
    const dir = path.dirname(this.jsonPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.jsonPath, JSON.stringify(planData, null, 2), "utf-8");
    console.log(`✅ Generated JSON plan comptable at ${this.jsonPath}`);

    this.data = planData;
    this.buildMap();

    return planData;
  }

  private getAccountTypeProperties(
    classe: number
  ): { type: "actif" | "passif" | "charge" | "produit" | "mixte"; positionDebit: boolean; positionCredit: boolean } {
    switch (classe) {
      case 1: // Capitaux propres et assimilés - passif
        return { type: "passif", positionDebit: true, positionCredit: true };
      case 2: // Immobilisations - actif
        return { type: "actif", positionDebit: true, positionCredit: false };
      case 3: // Stocks - actif
        return { type: "actif", positionDebit: true, positionCredit: false };
      case 4: // Tiers - mixte
        return { type: "mixte", positionDebit: true, positionCredit: true };
      case 5: // Trésorerie - actif
        return { type: "actif", positionDebit: true, positionCredit: false };
      case 6: // Charges - charge
        return { type: "charge", positionDebit: true, positionCredit: false };
      case 7: // Produits - produit
        return { type: "produit", positionDebit: false, positionCredit: true };
      case 8: // Résultats et assimilés - mixte
        return { type: "mixte", positionDebit: true, positionCredit: true };
      default:
        return { type: "mixte", positionDebit: true, positionCredit: true };
    }
  }

  exportJson(): PlanComptableData {
    return this.loadData();
  }
}

export const planComptableService = new PlanComptableService();