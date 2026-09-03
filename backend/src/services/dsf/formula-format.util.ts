import { MappingLine } from "./account-mapping.data";

/**
 * Texte lisible d'une ligne de correspondance OHADA, ex:
 * "Solde débiteur des comptes 401, 408 (hors 419)".
 * Utilisé pour le panneau "voir la formule" du rapport DSF — décrit la
 * règle appliquée, pas les lignes de balance réellement associées.
 */
export function formatMappingLine(line: MappingLine): string {
  const sideText = line.side === "SD" ? "Solde débiteur" : "Solde créditeur";
  const accounts = `compte${line.accounts.length > 1 ? "s" : ""} ${line.accounts.join(", ")}`;
  const excl = line.excludedAccounts?.length
    ? ` (hors ${line.excludedAccounts.join(", ")})`
    : "";
  return `${sideText} des ${accounts}${excl}`;
}

/** Même formulation, pour une liste de comptes assemblée à la main (pas une MappingLine issue de la table). */
export function formatAccounts(
  accounts: string[],
  side: "SD" | "SC",
  excludedAccounts?: string[]
): string {
  return formatMappingLine({ label: "", accounts, side, excludedAccounts });
}

/** Note ancien style: `sumAccounts`/`getAccountBalance` renvoient un solde net signé (débit − crédit), sans notion de SD/SC. */
export function formatNetBalance(accounts: string[]): string {
  const accountsText = `compte${accounts.length > 1 ? "s" : ""} ${accounts.join(", ")}`;
  return `Solde net (débit − crédit) des ${accountsText}`;
}

/** Ligne de TOTAL/SOUS-TOTAL: somme d'autres lignes déjà affichées (identifiées par leur ref/id). */
export function formatSumOfRows(refs: string[]): string {
  return `Somme des lignes ${refs.map((r) => r.toUpperCase()).join(" + ")}`;
}
