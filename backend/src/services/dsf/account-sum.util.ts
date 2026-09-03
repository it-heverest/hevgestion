import { BalanceSide, MappingLine } from './account-mapping.data';

/**
 * Somme les comptes d'une balance selon le sens du solde attendu.
 * SD (solde débiteur) = Σdébit − Σcrédit ; SC (solde créditeur) = Σcrédit − Σdébit.
 * Matching par préfixe sur accountNumber, cohérent avec la convention déjà en
 * place dans dsf-generator.service.ts (sumAccounts/getBalanceValue).
 *
 * Le résultat est plafonné à 0 (jamais négatif): un "solde débiteur" est par
 * définition la portion du groupe de comptes en position débitrice, pas le
 * net signé du groupe. C'est indispensable pour les formules qui lisent le
 * même groupe de comptes des deux côtés (ex. TFT "SD(5)-SC(5)" pour isoler
 * trésorerie actif vs passif) — sans ce plafond, un groupe purement débiteur
 * ferait remonter un SC négatif et la soustraction doublerait le montant au
 * lieu de donner le net attendu.
 */
export function sumBySide(
  rows: any[],
  accounts: string[],
  side: BalanceSide,
  exclude: string[] = []
): number {
  if (!rows || rows.length === 0 || accounts.length === 0) return 0;

  let debit = 0;
  let credit = 0;

  for (const row of rows) {
    const accountNumber = String(row.accountNumber || '');
    const matches = accounts.some((prefix) => accountNumber.startsWith(prefix));
    if (!matches) continue;
    const isExcluded = exclude.some((prefix) => accountNumber.startsWith(prefix));
    if (isExcluded) continue;

    debit += parseFloat(row.closingDebit || 0);
    credit += parseFloat(row.closingCredit || 0);
  }

  const net = side === 'SD' ? debit - credit : credit - debit;
  return Math.max(net, 0);
}

/** Applique une MappingLine (comptes + exclusions + sens) à une balance. */
export function sumMappingLine(rows: any[], line: MappingLine): number {
  return sumBySide(rows, line.accounts, line.side, line.excludedAccounts || []);
}

/** Somme les mouvements (débit ou crédit) de la période sur une liste de comptes. */
export function sumMovement(
  rows: any[],
  accounts: string[],
  direction: 'MD' | 'MC',
  exclude: string[] = []
): number {
  if (!rows || rows.length === 0 || accounts.length === 0) return 0;

  let total = 0;
  const field = direction === 'MD' ? 'movementDebit' : 'movementCredit';

  for (const row of rows) {
    const accountNumber = String(row.accountNumber || '');
    const matches = accounts.some((prefix) => accountNumber.startsWith(prefix));
    if (!matches) continue;
    const isExcluded = exclude.some((prefix) => accountNumber.startsWith(prefix));
    if (isExcluded) continue;

    total += parseFloat(row[field] || 0);
  }

  return total;
}
