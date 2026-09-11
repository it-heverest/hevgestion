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

type OperationSource = 'OD' | 'OC' | 'MD' | 'MC' | 'SD' | 'SC';
const OPERATION_SOURCES: OperationSource[] = ['OD', 'OC', 'MD', 'MC', 'SD', 'SC'];

function parseOperation(
  op: string
): { sign: 1 | -1; account: string; source: OperationSource } | null {
  const sign: 1 | -1 = op.startsWith('-') ? -1 : 1;
  const rest = op.replace(/^[+-]/, '');
  const source = rest.slice(-2) as OperationSource;
  const account = rest.slice(0, -2);
  if (!account || !OPERATION_SOURCES.includes(source)) return null;
  return { sign, account, source };
}

/**
 * Somme des opérations signées au format `DSFComptableConfig.operations`
 * (ex. "+211SD", "-2742SD") — généralisation de `sumBySide`/`sumMovement`
 * aux configurations éditables en base.
 *
 * Reproduit EXACTEMENT `sumBySide` quand toutes les opérations d'un même
 * groupe SD (ou SC) sont de simples inclusions ("+compteSD") avec
 * d'éventuelles exclusions ("-sousCompteSD") : le débit et le crédit
 * matchés sont accumulés côté SD/SC séparément, le floor à 0 s'applique une
 * seule fois sur le net agrégé — jamais opération par opération. Une
 * exclusion ("-2742SD" sur un mapping dont "274" est inclus) s'annule donc
 * exactement comme le `exclude` de `sumBySide` (le sous-compte matche les
 * deux opérations, contribution nette nulle), sans jamais faire diverger
 * silencieusement une valeur déjà correcte pour un mapping par défaut non
 * modifié. Les sources MD/MC/OD/OC (mouvements/ouverture) sont un total
 * signé direct, sans floor : la config indique déjà sans ambiguïté quoi
 * additionner ou soustraire.
 */
export function sumOperations(rows: any[], operations: string[]): number {
  if (!rows || rows.length === 0 || !operations || operations.length === 0) return 0;

  let sdDebit = 0;
  let sdCredit = 0;
  let scDebit = 0;
  let scCredit = 0;
  let flatTotal = 0;

  for (const opStr of operations) {
    const parsed = parseOperation(opStr);
    if (!parsed) continue;
    const { sign, account, source } = parsed;

    for (const row of rows) {
      const accountNumber = String(row.accountNumber || '');
      if (!accountNumber.startsWith(account)) continue;

      switch (source) {
        case 'SD':
          sdDebit += sign * parseFloat(row.closingDebit || 0);
          sdCredit += sign * parseFloat(row.closingCredit || 0);
          break;
        case 'SC':
          scDebit += sign * parseFloat(row.closingDebit || 0);
          scCredit += sign * parseFloat(row.closingCredit || 0);
          break;
        case 'MD':
          flatTotal += sign * parseFloat(row.movementDebit || 0);
          break;
        case 'MC':
          flatTotal += sign * parseFloat(row.movementCredit || 0);
          break;
        case 'OD':
          flatTotal += sign * parseFloat(row.openingDebit || 0);
          break;
        case 'OC':
          flatTotal += sign * parseFloat(row.openingCredit || 0);
          break;
      }
    }
  }

  const sdNet = Math.max(sdDebit - sdCredit, 0);
  const scNet = Math.max(scCredit - scDebit, 0);

  return sdNet + scNet + flatTotal;
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
