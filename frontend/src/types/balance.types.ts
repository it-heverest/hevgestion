// frontend/src/types/balance.types.ts
export interface BalanceRow {
  accountNumber: string;
  accountName: string;
  openingDebit?: number;
  openingCredit?: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit?: number;
  closingCredit?: number;
}

export function normalizeRow(row: any): BalanceRow {
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