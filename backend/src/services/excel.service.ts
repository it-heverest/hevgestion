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

interface BalanceRow {
  accountNumber: string;
  accountName: string;
  openingDebit?: number;
  openingCredit?: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit?: number;
  closingCredit?: number;
}

function normalizeRow(row: any): BalanceRow {
  return {
    accountNumber: String(row.accountNumber ?? row.compte ?? row.comptes ?? row["n° compte"] ?? "").trim(),
    accountName: String(row.accountName ?? row.libelle ?? row.libellé ?? "").trim(),
    openingDebit: Number(row.openingDebit ?? row["déb. ouv."] ?? row.ouverture_debit ?? row.entre_debit) || 0,
    openingCredit: Number(row.openingCredit ?? row["créd. ouv."] ?? row.ouverture_credit ?? row.entre_credit) || 0,
    movementDebit: Number(row.movementDebit ?? row["déb. mvt"] ?? row.mouvement_debit) || 0,
    movementCredit: Number(row.movementCredit ?? row["créd. mvt"] ?? row.mouvement_credit) || 0,
    closingDebit: Number(row.closingDebit ?? row["déb. clôt"] ?? row.solde_debit) || 0,
    closingCredit: Number(row.closingCredit ?? row["créd. clôt"] ?? row.solde_credit) || 0,
  };
}

const PLAN_COMPTABLE_PATH = path.join(
  config.rootDir,
  "frontend",
  "plan_comptable",
  "PLAN COMPTABLE UNIQUE.xlsx",
);

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
    accountName: string,
  ): Promise<{ valid: boolean; error?: string }> {
    const result = planComptableService.validateAccount(
      accountNumber,
      accountName,
    );
    if (!result.valid) return result;

    const planComptable = await ExcelService.loadPlanComptable();

    if (planComptable.length === 0) {
      return { valid: true };
    }

    if (!accountNumber || accountNumber.length < 3) {
      return {
        valid: false,
        error: `Numéro de compte invalide: ${accountNumber}`,
      };
    }

    const rootAccount = accountNumber.substring(0, 3);
    const found = planComptable.find((c) => c.numero === rootAccount);

    if (!found) {
      return {
        valid: false,
        error: `Compte "${accountNumber}" n'existe pas dans le plan comptable OHADA (racine: ${rootAccount})`,
      };
    }

    return { valid: true };
  }

  static async validateBalanceAccounts(
    rows: { accountNumber: string; accountName: string }[],
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.accountNumber) continue;

      const validation = await ExcelService.validateAccount(
        row.accountNumber,
        row.accountName || "",
      );
      if (!validation.valid && validation.error) {
        errors.push(validation.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateBalanceWithPosition(
    rows: {
      accountNumber: string;
      accountName: string;
      debit?: number;
      credit?: number;
    }[],
  ): { valid: boolean; errors: string[] } {
    const normalizedRows = rows.map((r) => ({
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
      headers: [
        "N° Compte",
        "Libellé",
        "Déb. Ouv.",
        "Créd. Ouv.",
        "Déb. Mvt",
        "Créd. Mvt",
        "Déb. Clôt",
        "Créd. Clôt",
      ],
      sampleAccounts: [
        {
          account: "101000",
          name: "Capital social",
          class: "1",
          debit: 0,
          credit: 10000000,
        },
        {
          account: "109000",
          name: "Capital souscrit non appelé",
          class: "1",
          debit: 0,
          credit: 0,
        },
        {
          account: "110000",
          name: "Report à nouveau (solde créditeur)",
          class: "1",
          debit: 0,
          credit: 0,
        },
        {
          account: "120000",
          name: "Résultat net de l'exercice",
          class: "1",
          debit: 0,
          credit: 0,
        },
        {
          account: "201000",
          name: "Frais d'établissement",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "203000",
          name: "Frais de recherche et développement",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "205000",
          name: "Concessions et droits similaires",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "211000",
          name: "Terrains",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "213000",
          name: "Constructions",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "215000",
          name: "Installations techniques",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "218100",
          name: "Matériel de transport",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "218200",
          name: "Matériel informatique",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "218300",
          name: "Mobilier de bureau",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "281100",
          name: "Amortissements constructions",
          class: "2",
          debit: 0,
          credit: 0,
        },
        {
          account: "301000",
          name: "Marchandises",
          class: "3",
          debit: 0,
          credit: 0,
        },
        {
          account: "311000",
          name: "Matières premières",
          class: "3",
          debit: 0,
          credit: 0,
        },
        {
          account: "331000",
          name: "Produits finis",
          class: "3",
          debit: 0,
          credit: 0,
        },
        {
          account: "401000",
          name: "Fournisseurs - Achats de biens",
          class: "4",
          debit: 0,
          credit: 0,
        },
        { account: "411000", name: "Clients", class: "4", debit: 0, credit: 0 },
        {
          account: "421000",
          name: "Personnel - Rémunérations dues",
          class: "4",
          debit: 0,
          credit: 0,
        },
        {
          account: "431000",
          name: "Sécurité sociale",
          class: "4",
          debit: 0,
          credit: 0,
        },
        {
          account: "441100",
          name: "État - TVA due",
          class: "4",
          debit: 0,
          credit: 0,
        },
        {
          account: "445200",
          name: "État - TVA récupérer",
          class: "4",
          debit: 0,
          credit: 0,
        },
        { account: "521000", name: "Banques", class: "5", debit: 0, credit: 0 },
        { account: "531000", name: "Caisse", class: "5", debit: 0, credit: 0 },
        {
          account: "601000",
          name: "Achats de marchandises",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "602000",
          name: "Achats de matières premières",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "604000",
          name: "Achats de fournitures",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "605000",
          name: "Achats d'études et prestations",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "622000",
          name: "Rémunérations d'intermédiaires",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "623000",
          name: "Publicité, publications",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "624000",
          name: "Transports",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "625000",
          name: "Déplacements, missions",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "626000",
          name: "Frais postaux",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "627000",
          name: "Services bancaires",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "628000",
          name: "Autres services extérieurs",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "631000",
          name: "Impôts et taxes",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "641000",
          name: "Salaires et appointements",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "645000",
          name: "Charges de sécurité sociale",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "661000",
          name: "Charges d'intérêt",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "671000",
          name: "Pénalités et amendes",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "681000",
          name: "Dotations aux amortissements",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "691000",
          name: "Impôts sur les bénéfices",
          class: "6",
          debit: 0,
          credit: 0,
        },
        {
          account: "701000",
          name: "Ventes de marchandises",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "702000",
          name: "Ventes de produits finis",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "706000",
          name: "Prestations de services",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "707000",
          name: "Ventes de fournitures",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "708000",
          name: "Produits des activités annexes",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "709000",
          name: "Rabais, remises et ristournes accordés",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "741000",
          name: "Subventions d'exploitation",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "751000",
          name: "Revenus des immeubles",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "761000",
          name: "Produits financiers",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "771000",
          name: "Subventions d'équilibre",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "781000",
          name: "Reprises sur provisions",
          class: "7",
          debit: 0,
          credit: 0,
        },
        {
          account: "791000",
          name: "Transferts de charges",
          class: "7",
          debit: 0,
          credit: 0,
        },
        // Classe 8 - Résultats
        {
          account: "801000",
          name: "Charges constatées d'avance",
          class: "8",
          debit: 5000,
          credit: 0,
        },
        {
          account: "802000",
          name: "Produits à recevoir",
          class: "8",
          debit: 15000,
          credit: 0,
        },
      ],
    };
  }

  static async createBalanceFromTemplate(
    template: any,
    fiscalYear: number,
  ): Promise<string> {
    const workbook = XLSX.utils.book_new();
    const data: any[][] = [];

    data.push(template.headers);

    template.sampleAccounts.forEach((acc: any) => {
      const openingDebit = acc.debit || 0;
      const openingCredit = acc.credit || 0;
      const movementDebit = Math.floor(Math.random() * 50000);
      const movementCredit = Math.floor(Math.random() * 40000);
      const closingDebit = Math.max(
        0,
        openingDebit + movementDebit - movementCredit,
      );
      const closingCredit = Math.max(
        0,
        openingCredit + movementCredit - movementDebit,
      );

      data.push([
        acc.account,
        acc.name,
        openingDebit,
        openingCredit,
        movementDebit,
        movementCredit,
        closingDebit,
        closingCredit,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Balance");

    const fileName = `balance_modele_${fiscalYear}_${Date.now()}.xlsx`;
    const filePath = path.join(
      config.upload.directory,
      config.upload.subDirectories.balance,
      fileName,
    );

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
      "ouverture débit": "openingDebit",
      "ouverture crédit": "openingCredit",
      "ouverture debit": "openingDebit",
      "ouverture credit": "openingCredit",
      ouverture_debit: "openingDebit",
      ouverture_credit: "openingCredit",
      // Movement
      débit: "movementDebit",
      crédit: "movementCredit",
      "débit mouvement": "movementDebit",
      "crédit mouvement": "movementCredit",
      // Closing balance
      solde: "balance",
      // Additional French abbreviations
      "déb. ouv": "openingDebit",
      "créd. ouv": "openingCredit",
      "déb. mvt": "movementDebit",
      "créd. mvt": "movementCredit",
      "déb. clôt": "closingDebit",
      "créd. clôt": "closingCredit",
      // Past-participle / alternative forms
      "solde débité": "closingDebit",
      "solde crédité": "closingCredit",
      mouvement: "movement",
      // English variants
      "opening debit": "openingDebit",
      "opening deb": "openingDebit",
      "opening credit": "openingCredit",
      "opening cre": "openingCredit",
      "movement debit": "movementDebit",
      "movement deb": "movementDebit",
      "movement credit": "movementCredit",
      "movement cre": "movementCredit",
      "closing debit": "closingDebit",
      "closing deb": "closingDebit",
      "closing credit": "closingCredit",
      "closing cre": "closingCredit",
      movement: "movement",
      opening: "opening",
      closing: "closing",
    };

    // Normalize: lowercase, trim, remove diacritics and punctuation
    const stripped = header
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[\u2011\u00A0]/g, " ") // NBSP and non-breaking hyphen -> space
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return mapping[stripped] || stripped;
  }

  static async parseBalanceFile(
    filePath: string,
    mapping?: { [key: string]: number | string },
    options?: { useIndexMapping?: boolean },
  ): Promise<any> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const rows: any[] = [];
    // Try to detect the header row: scan the first few rows for a header that looks
    // like it contains accounting columns (handles files with extra top rows).
    const isHeaderCell = (val: any) => {
      if (!val) return false;
      const s = String(val)
        .replace(/\uFEFF|\u200B/g, "")
        .toLowerCase()
        .trim();

      // Check for account-related headers
      if (/compte|n\s*compte|account|n\u00B0|n\u00BA|n°|numero|numéro/.test(s)) {
        return true;
      }

      // Check for amount-related headers
      if (/débit|debit|crédit|credit|ouv|ouverture|opening|mvt|mouvement|movement|solde|closing|clôture|cloture/.test(s)) {
        return true;
      }

      return false;
    };

    let headerRowIndex = 0;
    let bestScore = 0;

    // Scan first 10 rows for the best header candidate
    for (let r = 0; r < Math.min(10, jsonData.length); r++) {
      const row = jsonData[r] as any[];
      if (!row) continue;

      const score = row.reduce((acc, cell) => {
        return acc + (isHeaderCell(cell) ? 1 : 0);
      }, 0);

      // Prefer rows with multiple accounting headers
      if (score > bestScore && score >= 3) {
        bestScore = score;
        headerRowIndex = r;
      }
    }

    const headers = (jsonData[headerRowIndex] as any[]).map((h, idx) => ({
      index: idx,
      original: h ?? "",
      normalized: this.normalizeHeader((h ?? "").toString()),
    }));

    // If user provided explicit mapping, try to resolve mapping into column references early
    const resolveMappingToCol = (mapVal: number | string | undefined) => {
      if (mapVal === undefined || mapVal === null) return undefined;
      if (typeof mapVal === "number")
        return headers.find((h) => h.index === mapVal);
      // Try to match provided header string against normalized and original
      const norm = this.normalizeHeader(mapVal.toString());
      return headers.find(
        (h) =>
          h.normalized === norm ||
          (h.original || "")
            .toString()
            .toLowerCase()
            .includes(mapVal.toString().toLowerCase()),
      );
    };

    if (mapping) {
      // allow mapping keys: accountNumber, accountName, openingDebit, openingCredit,
      // movementDebit, movementCredit, closingDebit, closingCredit
      const mappedCols: { [k: string]: any } = {};
      for (const key of Object.keys(mapping)) {
        mappedCols[key] = resolveMappingToCol(mapping[key]);
      }
      // merge mappedCols into headers lookup by replacing detected variables below where appropriate
      // We'll set variables below to these if present.
      // Attach to a temporary object for later use
      (headers as any)._mapped = mappedCols;
    }

    console.log(
      "📥 Parsed headers:",
      headers.map((h) => ({ original: h.original, normalized: h.normalized })),
    );

    console.log("🔍 Column detection starting...");

    // Declare all column variables
    let accountCol: any = null;
    let nameCol: any = null;
    let openDebitCol: any = null;
    let openCreditCol: any = null;
    let moveDebitCol: any = null;
    let moveCreditCol: any = null;
    let closeDebitCol: any = null;
    let closeCreditCol: any = null;

    const mapped = (headers as any)._mapped || {};

    // Use index-based mapping if requested
    if (options?.useIndexMapping && headers.length >= 8) {
      console.log("🔢 Using index-based mapping");
      accountCol = headers[0]; // Column 0: Account number
      nameCol = headers[1];    // Column 1: Account name
      openDebitCol = headers[2];   // Column 2: Opening debit
      openCreditCol = headers[3];  // Column 3: Opening credit
      moveDebitCol = headers[4];   // Column 4: Movement debit
      moveCreditCol = headers[5];  // Column 5: Movement credit
      closeDebitCol = headers[6];  // Column 6: Closing debit
      closeCreditCol = headers[7];  // Column 7: Closing credit
    } else {
      console.log("🔤 Using keyword-based mapping");
      // Try keyword-based mapping first

      const colMatches = (header: any, patterns: string[]): boolean => {
        if (!header) return false;
        const normalized = this.normalizeHeader(header.original || "").toLowerCase();
        return patterns.some(pattern => {
          const re = new RegExp(pattern.replace(/\s+/g, '\\s*').toLowerCase());
          return re.test(normalized) || re.test((header.original || "").toLowerCase());
        });
      };

      accountCol =
        mapped.accountNumber ||
        headers.find((h) =>
          colMatches(h, [
            "compte",
            "comptes",
            "n compte",
            "n° compte",
            "numero",
            "num",
            "numéro",
            "account",
            "accountnumber",
            "compte général",
            "code compte",
            "ref compte",
            "numero compte",
            "numéro compte",
          ]),
        );
      if (!accountCol) {
        console.warn(
          "Colonne 'Compte' non trouvée via en-têtes — will attempt fallback detection",
        );
        console.debug(
          "Headers found:",

        );
      }
      nameCol =
        mapped.accountName ||
        headers.find((h) =>
          colMatches(h, [
            "libell",
            "libellé",
            "libelle",
            "nom",
            "intitul",
            "intitulé",
            "intitule",
            "designation",
            "désignation",
            "label",
            "description",
            "account name",
            "nom compte",
            "intitulé compte",
          ]),
        );
      openDebitCol =
        mapped.openingDebit ||
        headers.find((h) =>
          colMatches(h, [
            "deb ouv",
            "debit ouv",
            "ouv deb",
            "ouv debit",
            "debit initial",
            "ouverture",
            "ouverture debit",
            "opening",
            "opening debit",
            "débit ouv",
            "débit ouverture",
            "ouv débit",
            "ouv débits",
            "débit initial",
            "débit d'ouverture",
            "débit ouverture",
            "débit ouvr",
            "initial debit",
            "debit ouverture",
            "debit ouv",
            "ouv debit",
            "debit opening",
            "opening deb",
            "deb opening",
          ]),
        );
      openCreditCol =
        mapped.openingCredit ||
        headers.find((h) =>
          colMatches(h, [
            "cred ouv",
            "credit ouv",
            "ouv cred",
            "ouv credit",
            "ouv cre",
            "credit initial",
            "ouverture",
            "ouverture credit",
            "opening",
            "opening credit",
            "crédit ouv",
            "crédit ouverture",
            "ouv crédit",
            "ouv crédits",
            "crédit initial",
            "crédit d'ouverture",
            "crédit ouverture",
            "crédit ouvr",
            "initial credit",
            "credit ouverture",
            "credit ouv",
            "ouv credit",
            "credit opening",
            "opening cred",
            "cred opening",
            "cre ouv",
            "ouv cre",
          ]),
        );
      moveDebitCol =
        mapped.movementDebit ||
        headers.find((h) =>
          colMatches(h, [
            "mvt deb",
            "mvt debit",
            "deb mvt",
            "debit mvt",
            "movement debit",
            "mouvement debit",
            "debit",
            "deb",
            "movement d",
            "débit mvt",
            "débit mouvement",
            "mvt débit",
            "mouvement débit",
            "mvt débits",
            "débit de mouvement",
            "mouvement déb",
            "deb mouvement",
            "debit movement",
            "movement deb",
            "mvt deb",
          ]),
        );
      moveCreditCol =
        mapped.movementCredit ||
        headers.find((h) =>
          colMatches(h, [
            "mvt cre",
            "mvt credit",
            "cre mvt",
            "credit mvt",
            "cred mvt",
            "movement credit",
            "mouvement credit",
            "credit",
            "cre",
            "movement c",
            "crédit mvt",
            "crédit mouvement",
            "mvt crédit",
            "mouvement crédit",
            "mvt crédits",
            "crédit de mouvement",
            "mouvement créd",
            "cred mouvement",
            "credit movement",
            "movement cred",
            "mvt cred",
            "cre mvt",
          ]),
        );
      closeDebitCol =
        mapped.closingDebit ||
        headers.find((h) =>
          colMatches(h, [
            "clot",
            "cloture",
            "closing",
            "closing debit",
            "solde deb",
            "solde debiteur",
            "deb clot",
            "debit clot",
            "deb solde",
            "debit solde",
            "clôture",
            "clôt",
            "solde clôture",
            "clôture débit",
            "débit clôture",
            "débit solde",
            "solde débit",
            "débit de clôture",
            "clôture déb",
            "deb cloture",
            "debit closing",
            "closing deb",
            "deb closing",
            "final debit",
            "solde finale deb",
          ]),
        );
      closeCreditCol =
        mapped.closingCredit ||
        headers.find((h) =>
          colMatches(h, [
            "clot",
            "cloture",
            "closing",
            "closing credit",
            "solde cre",
            "solde crediteur",
            "solde cred",
            "cre clot",
            "credit clot",
            "cre solde",
            "credit solde",
            "cred solde",
            "clôture",
            "clôt",
            "solde clôture",
            "clôture crédit",
            "crédit clôture",
            "crédit solde",
            "solde crédit",
            "crédit de clôture",
            "clôture créd",
            "cred cloture",
            "credit closing",
            "closing cred",
            "cred closing",
            "final credit",
            "solde finale cred",
          ]),
        );
    }

    console.log("📊 Final column mapping results:");
    console.log("Account:", accountCol ? `✓ ${accountCol.original} (col ${accountCol.index})` : "✗ Not found");
    console.log("Name:", nameCol ? `✓ ${nameCol.original} (col ${nameCol.index})` : "✗ Not found");
    console.log("Opening Debit:", openDebitCol ? `✓ ${openDebitCol.original} (col ${openDebitCol.index})` : "✗ Not found");
    console.log("Opening Credit:", openCreditCol ? `✓ ${openCreditCol.original} (col ${openCreditCol.index})` : "✗ Not found");
    console.log("Movement Debit:", moveDebitCol ? `✓ ${moveDebitCol.original} (col ${moveDebitCol.index})` : "✗ Not found");
    console.log("Movement Credit:", moveCreditCol ? `✓ ${moveCreditCol.original} (col ${moveCreditCol.index})` : "✗ Not found");
    console.log("Closing Debit:", closeDebitCol ? `✓ ${closeDebitCol.original} (col ${closeDebitCol.index})` : "✗ Not found");
    console.log("Closing Credit:", closeCreditCol ? `✓ ${closeCreditCol.original} (col ${closeCreditCol.index})` : "✗ Not found");

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row) continue;

      const rawAccount = String(row[accountCol.index] || "").trim();
      const accountDigits = rawAccount.replace(/[^0-9]/g, "");
      if (!accountDigits || accountDigits.length < 3) continue;

      const normalizeNumericString = (val: string) => {
        if (!val && val !== "0") return "";
        // Normalize unicode minus, non-breaking spaces, thin spaces and common thousands separators
        let s = String(val)
          .replace(/[\u2012\u2013\u2014\u2212]/g, "-") // various minus/dash
          .replace(/[\u00A0\u202F\u2009]/g, "") // NBSP, narrow no-break space, thin space
          .replace(/\s+/g, "")
          .replace(/,/g, "")
          .trim();
        // Convert lone dash or hyphen to empty
        if (s === "-" || s === "—") return "";
        return s;
      };

      const hasNumericValue = (val: any) => {
        if (typeof val === "number") return true;
        if (typeof val === "string") {
          const cleaned = normalizeNumericString(val);
          return cleaned !== "" && !isNaN(parseFloat(cleaned));
        }
        return false;
      };

      const getNumericValue = (val: any): number => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const cleaned = normalizeNumericString(val);
          return cleaned === "" ? 0 : parseFloat(cleaned) || 0;
        }
        return 0;
      };

      // Fallback: if account column not found via headers, scan columns to find one
      // that contains account-like values (mostly numeric, length >= 3)
      if (!accountCol) {
        const sampleRows = jsonData.slice(1, 20);
        const colScores: { idx: number; score: number }[] = [];
        const maxCols = Math.max(...jsonData.map((r) => (r as any[]).length || 0));
        for (let c = 0; c < maxCols; c++) {
          let matches = 0;
          let total = 0;
          for (const r of sampleRows) {
            total++;
            const cell = (r as any[])[c];
            if (!cell) continue;
            const s = String(cell).replace(/\s+/g, "").replace(/\D/g, "");
            if (s.length >= 3) matches++;
          }
          colScores.push({ idx: c, score: total ? matches / total : 0 });
        }
        colScores.sort((a, b) => b.score - a.score);
        const best = colScores[0];
        if (best && best.score >= 0.5) {
          accountCol = headers[best.idx] || {
            index: best.idx,
            original: null,
            normalized: null,
          };
          console.log(
            `📥 Fallback detected account column at index ${best.idx} (score=${best.score})`,
          );
        }
      }

      // If still no account column found, fail fast to surface the issue
      if (!accountCol) {
        console.error(
          "Could not detect account column after fallback. Headers:",
          headers,
        );
        throw new Error(
          "Colonne 'Compte' non trouvée dans le fichier Excel (après tentative de détection)",
        );
      }

      // Build raw row object with detected column values
      const rawRow: any = {
        accountNumber: rawAccount.replace(/[^0-9]/g, "").trim(),
        accountName: nameCol ? String(row[nameCol.index] || "").trim() : "",
      };

      if (openDebitCol) {
        rawRow.openingDebit = hasNumericValue(row[openDebitCol.index]) ? getNumericValue(row[openDebitCol.index]) : 0;
      }
      if (openCreditCol) {
        rawRow.openingCredit = hasNumericValue(row[openCreditCol.index]) ? getNumericValue(row[openCreditCol.index]) : 0;
      }
      if (moveDebitCol) {
        rawRow.movementDebit = hasNumericValue(row[moveDebitCol.index]) ? getNumericValue(row[moveDebitCol.index]) : 0;
      }
      if (moveCreditCol) {
        rawRow.movementCredit = hasNumericValue(row[moveCreditCol.index]) ? getNumericValue(row[moveCreditCol.index]) : 0;
      }
      if (closeDebitCol) {
        rawRow.closingDebit = hasNumericValue(row[closeDebitCol.index]) ? getNumericValue(row[closeDebitCol.index]) : 0;
      }
      if (closeCreditCol) {
        rawRow.closingCredit = hasNumericValue(row[closeCreditCol.index]) ? getNumericValue(row[closeCreditCol.index]) : 0;
      }

      // Normalize the row using the shared function
      const rowData = normalizeRow(rawRow);

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
