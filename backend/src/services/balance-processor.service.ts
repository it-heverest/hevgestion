// src/services/balance-processor.service.ts
import { prisma } from "../lib/prisma";
import {
  Balance,
  BalanceStatus,
  IssueType,
  Severity,
  AssetMovementType,
  ActivityType,
} from "@prisma/client";
import { BadRequestError } from "../lib/errors";
import { planComptableService } from "./plan-comptable.service";

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

interface EquilibriumResult {
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
  isBalanced: boolean;
  anomalies?: string;
}

export class BalanceProcessor {
  // Account classification rules
  private readonly ASSET_ACCOUNTS = ["1", "2", "3", "4", "5"];
  private readonly LIABILITY_ACCOUNTS = ["1", "4"];
  private readonly EQUITY_ACCOUNTS = ["1"];
  private readonly FIXED_ASSET_ACCOUNTS = ["2"];

  async processBalance(balanceId: string): Promise<void> {
    const balance = await prisma.balance.findUnique({
      where: { id: balanceId },
    });

    if (!balance) {
      throw new BadRequestError("Balance not found");
    }

    // Update status to validating
    await prisma.balance.update({
      where: { id: balanceId },
      data: { status: BalanceStatus.VALIDATING },
    });

    try {
      // 1. Validate syntax and structure
      const validationErrors = await this.validateBalance(balance);

      if (validationErrors.length > 0) {
        await prisma.balance.update({
          where: { id: balanceId },
          data: {
            status: BalanceStatus.INVALID,
            validationErrors: JSON.stringify(validationErrors),
          },
        });
        return;
      }

      // 2. Check equilibrium
      const equilibrium = await this.checkEquilibrium(balance);

      // 3. Detect account issues
      const issues = await this.detectAccountIssues(balance);

      // 3b. Compare with previous year's balance (opening vs previous closing)
      const openingIssues = await this.compareWithPrevious(balance);
      if (openingIssues && openingIssues.length > 0) {
        issues.push(...openingIssues);
      }

      // 4. Extract fixed assets
      const fixedAssets = await this.extractFixedAssets(balance);

      // 5. Update balance with results
      await prisma.balance.update({
        where: { id: balanceId },
        data: {
          status: BalanceStatus.PROCESSED,
          processedAt: new Date(),
          equilibrium: {
            create: equilibrium,
          },
          accountIssues: {
            createMany: {
              data: issues,
            },
          },
          fixedAssets: {
            createMany: {
              data: fixedAssets,
            },
          },
        },
      });

      console.log(`Balance ${balanceId} processed successfully`);
    } catch (error) {
      console.error("Balance processing error:", error);
      await prisma.balance.update({
        where: { id: balanceId },
        data: {
          status: BalanceStatus.INVALID,
          validationErrors:
            error instanceof Error ? error.message : "Processing failed",
        },
      });
      throw error;
    }
  }

  async validateBalance(balance: Balance): Promise<string[]> {
    const errors: string[] = [];
    const data = balance.originalData as any;

    if (!data || !Array.isArray(data.rows)) {
      errors.push("Invalid balance data structure");
      return errors;
    }

    const rows = data.rows as BalanceRow[];

    // Check required columns (opening balances are optional)
    const requiredFields = [
      "accountNumber",
      "accountName",
      "movementDebit",
      "movementCredit",
      "closingDebit",
      "closingCredit",
    ];

    const optionalFields = [
      "openingDebit",
      "openingCredit",
    ];

    rows.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (
          row[field as keyof BalanceRow] === undefined ||
          row[field as keyof BalanceRow] === null
        ) {
          errors.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });

      // Optional fields should default to 0 if missing
      optionalFields.forEach((field) => {
        if (
          row[field as keyof BalanceRow] === undefined ||
          row[field as keyof BalanceRow] === null
        ) {
          (row as any)[field] = 0;
        }
      });

      // Validate account number format (should be numeric)
      if (row.accountNumber && !/^\d+$/.test(row.accountNumber)) {
        errors.push(
          `Row ${index + 1}: Invalid account number format '${row.accountNumber}'`,
        );
      }

      // Validate numeric values
      const numericFields = [
        "openingDebit",
        "openingCredit",
        "movementDebit",
        "movementCredit",
        "closingDebit",
        "closingCredit",
      ];

      numericFields.forEach((field) => {
        const value = row[field as keyof BalanceRow];
        // Allow undefined/null for optional fields
        if (value !== undefined && value !== null) {
          if (typeof value !== "number" || isNaN(value) || value < 0) {
            errors.push(`Row ${index + 1}: Invalid value for '${field}'`);
          }
        }
      });
    });

    return errors;
  }

  async checkEquilibrium(balance: Balance): Promise<EquilibriumResult> {
    console.log("checkEquilibrium called with balance:", balance.id);

    if (!balance.originalData) {
      throw new Error("Balance has no original data");
    }

    const data = balance.originalData as any;
    if (!data.rows || !Array.isArray(data.rows)) {
      throw new Error("Balance data has no valid rows array");
    }

    const rows = data.rows as BalanceRow[];

    // Variables for each type (opening, movement, closing)
    let openingDebit15 = 0;
    let openingCredit15 = 0;
    let openingDebit68 = 0;
    let openingCredit68 = 0;

    let movementDebit15 = 0;
    let movementCredit15 = 0;
    let movementDebit68 = 0;
    let movementCredit68 = 0;

    let closingDebit15 = 0;
    let closingCredit15 = 0;
    let closingDebit68 = 0;
    let closingCredit68 = 0;

    rows.forEach((row) => {
      const accountClass = row.accountNumber?.charAt(0) || "";
      const isClass15 = ["1", "2", "3", "4", "5"].includes(accountClass);
      const isClass68 = ["6", "7", "8"].includes(accountClass);

      const openingDebit = Number(row.openingDebit) || 0;
      const openingCredit = Number(row.openingCredit) || 0;
      const movementDebit = Number(row.movementDebit) || 0;
      const movementCredit = Number(row.movementCredit) || 0;
      const closingDebit = Number(row.closingDebit) || 0;
      const closingCredit = Number(row.closingCredit) || 0;

      if (isClass15) {
        openingDebit15 += openingDebit;
        openingCredit15 += openingCredit;
        movementDebit15 += movementDebit;
        movementCredit15 += movementCredit;
        closingDebit15 += closingDebit;
        closingCredit15 += closingCredit;
      } else if (isClass68) {
        openingDebit68 += openingDebit;
        openingCredit68 += openingCredit;
        movementDebit68 += movementDebit;
        movementCredit68 += movementCredit;
        closingDebit68 += closingDebit;
        closingCredit68 += closingCredit;
      }
    });

    // Calculate equilibrium for each type
    // x = total debit (classes 1-5) - total credit (classes 1-5)
    // y = total credit (classes 6-8) - total debit (classes 6-8)
    // Balanced if x = y (meaning total debits = total credits across all classes)

    const tolerance = 0.01;

    // Opening equilibrium
    const openingX = openingDebit15 - openingCredit15;
    const openingY = openingCredit68 - openingDebit68;
    const openingBalanced = Math.abs(openingX - openingY) < tolerance;

    // Movement equilibrium
    const movementX = movementDebit15 - movementCredit15;
    const movementY = movementCredit68 - movementDebit68;
    const movementBalanced = Math.abs(movementX - movementY) < tolerance;

    // Closing equilibrium
    const closingX = closingDebit15 - closingCredit15;
    const closingY = closingCredit68 - closingDebit68;
    const closingBalanced = Math.abs(closingX - closingY) < tolerance;

    const isBalanced = openingBalanced && movementBalanced && closingBalanced;

    const anomalies: string[] = [];
    if (!openingBalanced) {
      anomalies.push(
        `Opening: Débits(1-5) - Crédits(1-5) = ${openingX.toFixed(2)} ≠ Crédits(6-8) - Débits(6-8) = ${openingY.toFixed(2)}`,
      );
    }
    if (!movementBalanced) {
      anomalies.push(
        `Mouvement: Débits(1-5) - Crédits(1-5) = ${movementX.toFixed(2)} ≠ Crédits(6-8) - Débits(6-8) = ${movementY.toFixed(2)}`,
      );
    }
    if (!closingBalanced) {
      anomalies.push(
        `Clôture: Débits(1-5) - Crédits(1-5) = ${closingX.toFixed(2)} ≠ Crédits(6-8) - Débits(6-8) = ${closingY.toFixed(2)}`,
      );
    }

    const totalDebit = closingDebit15 + closingDebit68;
    const totalCredit = closingCredit15 + closingCredit68;

    const result = {
      openingDebit: openingDebit15 + openingDebit68,
      openingCredit: openingCredit15 + openingCredit68,
      movementDebit: movementDebit15 + movementDebit68,
      movementCredit: movementCredit15 + movementCredit68,
      closingDebit: totalDebit,
      closingCredit: totalCredit,
      isBalanced,
      anomalies: anomalies.length > 0 ? anomalies.join("; ") : undefined,
    };

    console.log("Equilibrium result:", result);
    return result;
  }

  async detectAccountIssues(balance: Balance): Promise<any[]> {
    const data = balance.originalData as any;
    const rows = data.rows as BalanceRow[];
    const issues: any[] = [];

    rows.forEach((row) => {
      // Use planComptableService to validate account existence and position
      const accValidation = planComptableService.validateAccount(
        row.accountNumber,
        row.accountName || "",
      );
      if (!accValidation.valid && accValidation.error) {
        issues.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          issueType: IssueType.NON_COMPLIANT_ACCOUNT,
          description: accValidation.error,
          severity: Severity.ERROR,
        });
      }

      // Validate position using plan comptable (closing position)
      const posValidation = planComptableService.validatePosition(
        row.accountNumber,
        row.closingDebit || 0,
        row.closingCredit || 0,
      );
      if (!posValidation.valid && posValidation.error) {
        issues.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          issueType: IssueType.WRONG_BALANCE_POSITION,
          description: posValidation.error,
          severity: Severity.WARNING,
        });
      }

      // Check for specific account specifications needed
      if (this.requiresSpecification(row.accountNumber)) {
        issues.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          issueType: IssueType.MISSING_SPECIFICATION,
          description: "Account requires additional specifications for DSF",
          severity: Severity.INFO,
        });
      }
    });

    return issues;
  }

  async extractFixedAssets(balance: Balance): Promise<any[]> {
    const data = balance.originalData as any;
    const rows = data.rows as BalanceRow[];
    const fixedAssets: any[] = [];

    rows.forEach((row) => {
      const accountClass = row.accountNumber.substring(0, 2);

      // Extract fixed assets (class 2x accounts)
      if (this.FIXED_ASSET_ACCOUNTS.includes(row.accountNumber.charAt(0))) {
        const grossValue = row.closingDebit || 0;
        const movement = row.movementDebit - row.movementCredit;

        let movementType: AssetMovementType | undefined;
        if (movement > 0) movementType = AssetMovementType.ACQUISITION;
        if (movement < 0) movementType = AssetMovementType.DISPOSAL;

        fixedAssets.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          grossValue,
          netValue: (row.closingDebit || 0) - (row.closingCredit || 0),
          depreciation: this.calculateDepreciation(row),
          movementType,
          activityType: ActivityType.ORDINARY,
        });
      }
    });

    return fixedAssets;
  }

  async performVentilation(balance: Balance): Promise<any> {
    const data = balance.originalData as any;
    const rows = data.rows as BalanceRow[];

    const ventilation = {
      assets: {
        current: 0,
        fixed: 0,
        total: 0,
      },
      liabilities: {
        current: 0,
        longTerm: 0,
        equity: 0,
        total: 0,
      },
      income: 0,
      expenses: 0,
    };

    rows.forEach((row) => {
      const accountClass = row.accountNumber.charAt(0);
      const netBalance = (row.closingDebit || 0) - (row.closingCredit || 0);

      switch (accountClass) {
        case "2": // Fixed assets
          ventilation.assets.fixed += Math.abs(netBalance);
          break;
        case "3": // Inventory
        case "4": // Receivables (if debit)
        case "5": // Cash
          if (netBalance > 0) {
            ventilation.assets.current += netBalance;
          }
          break;
        case "1": // Capital and reserves
          if (netBalance < 0) {
            ventilation.liabilities.equity += Math.abs(netBalance);
          }
          break;
        case "4": // Payables (if credit)
          if (netBalance < 0) {
            ventilation.liabilities.current += Math.abs(netBalance);
          }
          break;
        case "6": // Expenses
          ventilation.expenses += Math.abs(netBalance);
          break;
        case "7": // Income
          ventilation.income += Math.abs(netBalance);
          break;
      }
    });

    ventilation.assets.total =
      ventilation.assets.current + ventilation.assets.fixed;
    ventilation.liabilities.total =
      ventilation.liabilities.current +
      ventilation.liabilities.longTerm +
      ventilation.liabilities.equity;

    return ventilation;
  }

  // Helper methods
  private isValidAccountNumber(accountNumber: string): boolean {
    // OHADA accounts are typically 6-8 digits
    return /^\d{6,8}$/.test(accountNumber);
  }

  private requiresSpecification(accountNumber: string): boolean {
    // Accounts that require specifications (e.g., bank accounts, specific liabilities)
    const needsSpec = [
      "10",
      "11",
      "16",
      "17",
      "40",
      "41",
      "42",
      "50",
      "51",
      "52",
    ];
    const prefix = accountNumber.substring(0, 2);
    return needsSpec.includes(prefix);
  }

  private calculateDepreciation(row: BalanceRow): number {
    // Simple depreciation calculation (can be enhanced)
    const grossValue = row.closingDebit || 0;
    const netValue = (row.closingDebit || 0) - (row.closingCredit || 0);
    return grossValue - netValue;
  }

  // Compare current balance openings with previous balance closings aggregated by root (first 3 digits)
  private async compareWithPrevious(balance: Balance): Promise<any[]> {
    const issues: any[] = [];
    try {
      const folderId = balance.folderId;
      const periodNum = parseInt(balance.period || "0");
      if (!folderId || !periodNum) return [];

      const prevPeriod = (periodNum - 1).toString();
      const previous = await prisma.balance.findFirst({
        where: { folderId, period: prevPeriod },
      });

      if (!previous || !previous.originalData) return [];

      const currRows = (balance.originalData as any).rows || [];
      const prevRows = (previous.originalData as any).rows || [];

      // Aggregate by root (first 3 digits)
      const agg = (rows: any[], keyField: string) => {
        const map: Record<string, number> = {};
        rows.forEach((r) => {
          const root = (r.accountNumber || "").substring(0, 3);
          const val = Number(r[keyField] || 0);
          if (!map[root]) map[root] = 0;
          map[root] += val;
        });
        return map;
      };

      const prevClosingByRootDebit = agg(prevRows, "closingDebit");
      const prevClosingByRootCredit = agg(prevRows, "closingCredit");

      const currOpeningByRootDebit = agg(currRows, "openingDebit");
      const currOpeningByRootCredit = agg(currRows, "openingCredit");

      const tolerance = 0.01;

      const roots = new Set<string>([
        ...Object.keys(prevClosingByRootDebit),
        ...Object.keys(prevClosingByRootCredit),
        ...Object.keys(currOpeningByRootDebit),
        ...Object.keys(currOpeningByRootCredit),
      ]);

      roots.forEach((root) => {
        const prevNet =
          (prevClosingByRootDebit[root] || 0) -
          (prevClosingByRootCredit[root] || 0);
        const currNet =
          (currOpeningByRootDebit[root] || 0) -
          (currOpeningByRootCredit[root] || 0);
        if (Math.abs(prevNet - currNet) > tolerance) {
          issues.push({
            accountNumber: root,
            accountName: `Root ${root} mismatch between N-1 closing and N opening`,
            issueType: IssueType.EQUILIBRIUM_ERROR,
            description: `Mismatch for root ${root}: previous closing net=${prevNet.toFixed(2)}, current opening net=${currNet.toFixed(2)}`,
            severity: Severity.WARNING,
          });
        }
      });
    } catch (err) {
      console.error("Error comparing with previous balance:", err);
    }

    return issues;
  }
}
