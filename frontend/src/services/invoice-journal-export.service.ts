// services/invoice-journal-export.service.ts
//
// Export des écritures proposées vers un classeur Excel.
//
// Le format retenu est celui d'un brouillard de saisie: une ligne par ligne
// d'écriture, avec les colonnes attendues par les logiciels comptables
// (date, journal, pièce, compte, libellé, débit, crédit). Un fichier de ce
// type se réimporte tel quel dans Sage ou équivalent.
import * as XLSX from "xlsx";
import { InvoiceAnalysis } from "./invoice-scan.service";

/** Une facture analysée, conservée en vue de l'export. */
export interface JournalItem {
  id: string;
  fileName: string;
  analysis: InvoiceAnalysis;
}

interface JournalRow {
  Date: string;
  Journal: string;
  "N° pièce": string;
  Compte: string;
  "Libellé compte": string;
  "Libellé écriture": string;
  Débit: number | "";
  Crédit: number | "";
  Fournisseur: string;
  "NIU fournisseur": string;
  Conformité: string;
  "TVA récupérable": string;
  Observations: string;
}

const txt = (v: string | null | undefined) => v ?? "";

/** Construit les lignes du brouillard à partir des factures retenues. */
function buildRows(items: JournalItem[]): JournalRow[] {
  const rows: JournalRow[] = [];

  for (const item of items) {
    const { extraction: ex, conformity: cf, proposedEntry: pe } = item.analysis;

    // Les réserves sont portées sur la première ligne de chaque écriture:
    // répétées sur toutes, elles rendraient le fichier illisible.
    const observations = pe.reserves.join(" | ");

    pe.lines.forEach((line, index) => {
      rows.push({
        Date: txt(pe.date),
        Journal: pe.journal,
        "N° pièce": txt(ex.numeroFacture),
        Compte: line.compte,
        "Libellé compte": line.libelleCompte,
        "Libellé écriture": pe.libelle,
        Débit: line.debit || "",
        Crédit: line.credit || "",
        Fournisseur: txt(ex.direction === "VENTE" ? ex.clientNom : ex.fournisseurNom),
        "NIU fournisseur": txt(
          ex.direction === "VENTE" ? ex.clientNiu : ex.fournisseurNiu,
        ),
        Conformité: cf.conforme ? "Conforme" : `Non conforme (${cf.blockingCount})`,
        "TVA récupérable": cf.tvaDeductible ? "Oui" : "Non",
        Observations: index === 0 ? observations : "",
      });
    });
  }

  return rows;
}

/** Feuille de synthèse: une ligne par facture, pour le contrôle global. */
function buildSummary(items: JournalItem[]) {
  return items.map((item) => {
    const { extraction: ex, conformity: cf, proposedEntry: pe } = item.analysis;
    return {
      Fichier: item.fileName,
      Sens: ex.direction === "VENTE" ? "Vente" : "Achat",
      "N° pièce": txt(ex.numeroFacture),
      Date: txt(ex.dateFacture),
      Tiers: txt(ex.direction === "VENTE" ? ex.clientNom : ex.fournisseurNom),
      "Montant HT": ex.montantHT ?? "",
      TVA: ex.montantTVA ?? "",
      "Montant TTC": ex.montantTTC ?? "",
      Conformité: cf.conforme ? "Conforme" : "Non conforme",
      "Contrôles bloquants": cf.blockingCount,
      Avertissements: cf.warningCount,
      "TVA récupérable": cf.tvaDeductible ? "Oui" : "Non",
      "Écriture équilibrée": pe.equilibree ? "Oui" : "Non",
    };
  });
}

/** Feuille de détail des contrôles non satisfaits, pièce par pièce. */
function buildChecks(items: JournalItem[]) {
  const rows: Record<string, string>[] = [];
  for (const item of items) {
    const { extraction: ex, conformity: cf } = item.analysis;
    cf.checks
      .filter((c) => !c.passed)
      .forEach((c) => {
        rows.push({
          "N° pièce": txt(ex.numeroFacture) || item.fileName,
          Tiers: txt(ex.fournisseurNom),
          Gravité: c.severity,
          Contrôle: c.label,
          Détail: c.detail ?? "",
        });
      });
  }
  return rows;
}

/** Largeurs de colonnes, pour que le fichier soit lisible à l'ouverture. */
function autoWidth(rows: readonly Record<string, any>[]) {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]).map((key) => {
    const longest = rows.reduce((max: number, row) => {
      const len = String(row[key] ?? "").length;
      return len > max ? len : max;
    }, key.length);
    return { wch: Math.min(Math.max(longest + 2, 10), 60) };
  });
}

export function exportJournalToExcel(items: JournalItem[], fileNameHint?: string) {
  if (items.length === 0) return;

  const workbook = XLSX.utils.book_new();

  const journalRows = buildRows(items);
  const journalSheet = XLSX.utils.json_to_sheet(journalRows);
  journalSheet["!cols"] = autoWidth(journalRows);
  XLSX.utils.book_append_sheet(workbook, journalSheet, "Journal");

  const summaryRows = buildSummary(items);
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet["!cols"] = autoWidth(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Synthese");

  const checkRows = buildChecks(items);
  if (checkRows.length > 0) {
    const checkSheet = XLSX.utils.json_to_sheet(checkRows);
    checkSheet["!cols"] = autoWidth(checkRows);
    XLSX.utils.book_append_sheet(workbook, checkSheet, "Anomalies");
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = fileNameHint ? `_${fileNameHint}` : "";
  XLSX.writeFile(workbook, `ecritures${suffix}_${stamp}.xlsx`);
}
