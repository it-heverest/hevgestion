// services/dsf-calculation.service.ts
import { DSFConfig } from "./dsf-config.service";
import { FormulaEngine } from "../utils/formula-engine";

export interface ReportEntry {
  key: string;
  value: number | string;
  formula?: string;
}

export interface ReportData {
  [key: string]: number | string;
}

export interface BalanceData {
  [accountNumber: string]: {
    openingDebit: number;
    openingCredit: number;
    movementDebit: number;
    movementCredit: number;
    closingDebit: number;
    closingCredit: number;
  };
}

export class DSFCalculationService {
  /**
   * Calculate report data from DSF configs using balance data
   * Maps configs by destinationCell to report entries
   */
  static calculateReportData(
    configs: DSFConfig[],
    balanceData: BalanceData = {},
    baseData: ReportData = {}
  ): ReportData {
    const result: ReportData = { ...baseData };

    // Add balance data to context
    Object.keys(balanceData).forEach((account) => {
      const balance = balanceData[account];
      result[`BAL_${account}_OPENING_DEBIT`] = balance.openingDebit;
      result[`BAL_${account}_OPENING_CREDIT`] = balance.openingCredit;
      result[`BAL_${account}_MOVEMENT_DEBIT`] = balance.movementDebit;
      result[`BAL_${account}_MOVEMENT_CREDIT`] = balance.movementCredit;
      result[`BAL_${account}_CLOSING_DEBIT`] = balance.closingDebit;
      result[`BAL_${account}_CLOSING_CREDIT`] = balance.closingCredit;

      // Calculate net balances
      result[`BAL_${account}_OPENING_NET`] =
        balance.openingDebit - balance.openingCredit;
      result[`BAL_${account}_MOVEMENT_NET`] =
        balance.movementDebit - balance.movementCredit;
      result[`BAL_${account}_CLOSING_NET`] =
        balance.closingDebit - balance.closingCredit;
    });

    // Group configs by destination
    const configsByDestination: { [destination: string]: DSFConfig[] } = {};

    configs.forEach((config) => {
      const destination = config.destinationCell || config.codeDsf;
      if (!configsByDestination[destination]) {
        configsByDestination[destination] = [];
      }
      configsByDestination[destination].push(config);
    });

    // Calculate values for each destination
    Object.keys(configsByDestination).forEach((destination) => {
      const destConfigs = configsByDestination[destination];

      // Use the first config with operations for this destination
      const configWithFormula = destConfigs.find(
        (config) => config.operations && config.operations.length > 0
      );

      if (configWithFormula) {
        const value = FormulaEngine.evaluate(
          configWithFormula.operations[0],
          result
        );

        if (!value.error) {
          result[destination] = value.value;
        } else {
          // If formula fails, set to 0
          result[destination] = 0;
        }
      } else {
        // No formula provided, default to 0
        result[destination] = 0;
      }
    });

    return result;
  }

  /**
   * Get calculated value for a specific destination
   */
  static getValueForDestination(
    destination: string,
    configs: DSFConfig[],
    context: ReportData = {}
  ): number | string {
    const matchingConfigs = configs.filter(
      (config) =>
        config.destinationCell === destination || config.codeDsf === destination
    );

    if (matchingConfigs.length === 0) {
      return 0; // Default to 0 if no config found
    }

    // Use the first config with operations
    const configWithFormula = matchingConfigs.find(
      (config) => config.operations && config.operations.length > 0
    );

    if (configWithFormula) {
      const result = FormulaEngine.evaluate(
        configWithFormula.operations[0],
        context
      );

      return result.error ? 0 : result.value;
    }

    return 0; // No formula provided
  }

  /**
   * Build context from existing report data for formula evaluation
   */
  static buildContextFromReportData(reportData: ReportData): ReportData {
    return { ...reportData };
  }

  /**
   * Calculate all entries for a specific report type
   */
  static calculateReportEntries(
    reportType: string,
    configs: DSFConfig[]
  ): ReportEntry[] {
    const entries: ReportEntry[] = [];

    configs.forEach((config) => {
      if (
        config.libelle.toLowerCase().includes(reportType.toLowerCase()) ||
        config.codeDsf.toLowerCase().includes(reportType.toLowerCase())
      ) {
        const destination = config.destinationCell || config.codeDsf;
        const value = this.getValueForDestination(destination, configs);

        entries.push({
          key: destination,
          value: value,
          formula: config.operations?.[0] || undefined,
        });
      }
    });

    return entries;
  }
}
