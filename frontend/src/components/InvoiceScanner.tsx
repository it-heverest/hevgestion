import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Upload,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  FileText,
  RotateCcw,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  invoiceScanService,
  InvoiceAnalysis,
  ConformityCheck,
} from "../services/invoice-scan.service";
import {
  exportJournalToExcel,
  JournalItem,
} from "../services/invoice-journal-export.service";

/**
 * Scanner de factures.
 *
 * Écran en lecture seule et sans effet comptable: il affiche ce qui a été lu
 * sur la pièce, le verdict de conformité, et une proposition d'écriture.
 * Rien n'est enregistré ni comptabilisé — le comptable reste seul décideur.
 */
export function InvoiceScanner() {
  const { selectedFolder, selectedClient } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<InvoiceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Factures retenues en vue de l'export: le comptable en scanne plusieurs,
  // puis exporte un brouillard unique.
  const [journal, setJournal] = useState<JournalItem[]>([]);

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    setAnalysis(null);
    setError(null);
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(
      selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null,
    );
  };

  const runAnalysis = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      setAnalysis(await invoiceScanService.analyze(file, selectedFolder?.id));
    } catch (e: any) {
      // Un depassement de delai n'a rien a voir avec la qualite de l'image:
      // conseiller de verifier la nettete serait trompeur.
      const isTimeout =
        e?.code === "ECONNABORTED" || /timeout/i.test(e?.message ?? "");
      setError(
        e?.response?.data?.message ||
          (isTimeout
            ? "La lecture a depasse le delai imparti (2 minutes). Le document est peut-etre trop lourd ou le service momentanement lent : reessayez, ou deposez une photo plutot qu'un PDF volumineux."
            : "L'analyse a echoue. Verifiez la nettete du document et reessayez."),
      );
    } finally {
      setLoading(false);
    }
  };

  const addToJournal = () => {
    if (!analysis || !file) return;
    setJournal((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, fileName: file.name, analysis },
    ]);
    reset();
  };

  const removeFromJournal = (id: string) =>
    setJournal((prev) => prev.filter((i) => i.id !== id));

  const exportJournal = () =>
    exportJournalToExcel(journal, selectedClient?.name?.replace(/\s+/g, "_"));

  const journalTotals = journal.reduce(
    (acc, i) => {
      acc.debit += i.analysis.proposedEntry.totalDebit;
      acc.credit += i.analysis.proposedEntry.totalCredit;
      if (!i.analysis.conformity.conforme) acc.nonConformes += 1;
      return acc;
    },
    { debit: 0, credit: 0, nonConformes: 0 },
  );

  const fmt = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : v.toLocaleString("fr-FR").replace(/\u202F/g, " ");

  const field = (label: string, value: React.ReactNode, missing?: boolean) => (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600 shrink-0">{label}</span>
      <span
        className={`text-sm text-right ${missing ? "italic text-amber-600" : "font-medium text-gray-900"}`}
      >
        {missing ? "non lu" : value}
      </span>
    </div>
  );

  const severityIcon = (c: ConformityCheck) => {
    if (c.passed) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (c.severity === "BLOQUANT") return <XCircle className="h-4 w-4 text-red-600" />;
    if (c.severity === "AVERTISSEMENT")
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    return <Info className="h-4 w-4 text-gray-400" />;
  };

  const ex = analysis?.extraction;
  const cf = analysis?.conformity;
  const pe = analysis?.proposedEntry;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-orange-600" />
          Scanner de factures
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Déposez une facture : l'application en extrait les données, vérifie sa
          conformité et propose une écriture.{" "}
          <span className="font-medium">
            Rien n'est enregistré ni comptabilisé automatiquement.
          </span>
        </p>
        {selectedClient && selectedFolder && (
          <p className="text-xs text-gray-500 mt-1">
            Dossier : {selectedClient.name} — exercice {selectedFolder.fiscalYear}
          </p>
        )}
      </div>

      {/* Journal en cours de constitution */}
      {journal.length > 0 && (
        <Card className="border-orange-300 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Journal à exporter ({journal.length} pièce
                {journal.length > 1 ? "s" : ""})
              </span>
              <Button size="sm" onClick={exportJournal}>
                <Download className="h-4 w-4 mr-2" />
                Exporter en Excel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {journal.map((item) => {
                const jex = item.analysis.extraction;
                const jcf = item.analysis.conformity;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-sm bg-white border border-gray-200 rounded px-3 py-2"
                  >
                    {jcf.conforme ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-medium truncate flex-1">
                      {jex.numeroFacture || item.fileName}
                    </span>
                    <span className="text-gray-600 truncate hidden sm:block">
                      {jex.direction === "VENTE" ? jex.clientNom : jex.fournisseurNom}
                    </span>
                    <span className="font-medium shrink-0">
                      {fmt(jex.montantTTC)}
                    </span>
                    <button
                      onClick={() => removeFromJournal(item.id)}
                      className="text-gray-400 hover:text-red-600 shrink-0"
                      title="Retirer du journal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-orange-200 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>
                Total débit :{" "}
                <strong>{journalTotals.debit.toLocaleString("fr-FR").replace(/\u202F/g, " ")}</strong>
              </span>
              <span>
                Total crédit :{" "}
                <strong>{journalTotals.credit.toLocaleString("fr-FR").replace(/\u202F/g, " ")}</strong>
              </span>
              {journalTotals.nonConformes > 0 && (
                <span className="text-red-700">
                  {journalTotals.nonConformes} pièce(s) non conforme(s)
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Le classeur contient trois feuilles : le brouillard des écritures
              (débit/crédit par compte), une synthèse par pièce, et le détail des
              anomalies relevées.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dépôt du document */}
      <Card>
        <CardContent className="pt-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            {file ? (
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900">
                  Cliquer ou déposer une facture
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Photo ou PDF — 15 Mo maximum
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <div className="flex gap-3 mt-4">
              <Button onClick={runAnalysis} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Lecture en cours…
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4 mr-2" />
                    Analyser
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
            </div>
          )}

          {loading && (
            <p className="mt-3 text-xs text-gray-500">
              La lecture prend generalement 30 a 90 secondes selon la piece,
              parfois plus si le premier modele est occupe (bascule automatique).
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {analysis && ex && cf && pe && (
        <>
          {/* Verdict */}
          <Card
            className={
              cf.conforme
                ? "border-green-300 bg-green-50/40"
                : "border-red-300 bg-red-50/40"
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {cf.conforme ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {cf.conforme
                      ? "Facture conforme"
                      : `Facture non conforme — ${cf.blockingCount} mention(s) obligatoire(s) manquante(s)`}
                  </p>
                  <p className="text-sm mt-1 text-gray-700">
                    {cf.tvaDeductible ? (
                      <>
                        TVA récupérable
                        {ex.montantTVA !== null && (
                          <>
                            {" : "}
                            <strong>{fmt(ex.montantTVA)}</strong>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-red-700 font-medium">
                        TVA non récupérable en l'état
                        {ex.montantTVA !== null && <> — {fmt(ex.montantTVA)} en jeu</>}
                      </span>
                    )}
                  </p>
                  {cf.warningCount > 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      {cf.warningCount} point(s) de vigilance
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Données extraites */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Données lues sur la pièce
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Badge variant="outline">
                    {ex.direction === "VENTE"
                      ? "Facture de vente"
                      : "Facture d'achat"}
                  </Badge>
                </div>

                {field("Fournisseur", ex.fournisseurNom, !ex.fournisseurNom)}
                {field("NIU fournisseur", ex.fournisseurNiu, !ex.fournisseurNiu)}
                {field("RCCM", ex.fournisseurRccm, !ex.fournisseurRccm)}
                {field("Régime fiscal", ex.regimeFiscal, !ex.regimeFiscal)}
                {field("Client", ex.clientNom, !ex.clientNom)}
                {field("NIU client", ex.clientNiu, !ex.clientNiu)}
                {field("N° facture", ex.numeroFacture, !ex.numeroFacture)}
                {field("Date", ex.dateFacture, !ex.dateFacture)}
                {field("Montant HT", fmt(ex.montantHT), ex.montantHT === null)}
                {field(
                  "TVA",
                  `${fmt(ex.montantTVA)}${ex.tauxTVA ? ` (${ex.tauxTVA} %)` : ""}`,
                  ex.montantTVA === null,
                )}
                {field("Montant TTC", fmt(ex.montantTTC), ex.montantTTC === null)}
                {ex.droitTimbre !== null &&
                  field("Droit de timbre", fmt(ex.droitTimbre))}

                {ex.lignes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Lignes ({ex.lignes.length})
                    </p>
                    <div className="space-y-1">
                      {ex.lignes.map((l, i) => (
                        <div
                          key={i}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-gray-700 truncate">
                            {l.designation}
                          </span>
                          <span className="font-medium shrink-0">
                            {fmt(l.montantHT)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ex.remarques && (
                  <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    <strong>Remarques de lecture :</strong> {ex.remarques}
                  </p>
                )}

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Facture déposée"
                    className="mt-4 w-full rounded border border-gray-200"
                  />
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Contrôles de conformité */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Contrôles de conformité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cf.checks.map((c) => (
                      <div key={c.code} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">{severityIcon(c)}</span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${c.passed ? "text-gray-700" : "font-medium text-gray-900"}`}
                          >
                            {c.label}
                          </p>
                          {!c.passed && c.detail && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {c.detail}
                            </p>
                          )}
                        </div>
                        {!c.passed && c.severity === "BLOQUANT" && (
                          <Badge className="bg-red-100 text-red-700 shrink-0">
                            bloquant
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Écriture proposée */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Écriture proposée</span>
                    <Badge variant="outline">journal {pe.journal}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{pe.libelle}</p>

                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
                        <th className="text-left py-1.5">Compte</th>
                        <th className="text-right py-1.5">Débit</th>
                        <th className="text-right py-1.5">Crédit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pe.lines.map((l, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-1.5">
                            <span className="font-mono text-xs">{l.compte}</span>
                            <span className="block text-xs text-gray-600">
                              {l.libelleCompte}
                            </span>
                          </td>
                          <td className="text-right py-1.5">
                            {l.debit ? fmt(l.debit) : ""}
                          </td>
                          <td className="text-right py-1.5">
                            {l.credit ? fmt(l.credit) : ""}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-1.5">TOTAL</td>
                        <td className="text-right py-1.5">{fmt(pe.totalDebit)}</td>
                        <td className="text-right py-1.5">{fmt(pe.totalCredit)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {!pe.equilibree && (
                    <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5">
                      Écriture déséquilibrée : les montants lus sont incohérents.
                    </p>
                  )}

                  {pe.reserves.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        À arbitrer avant comptabilisation
                      </p>
                      <ul className="space-y-1">
                        {pe.reserves.map((r, i) => (
                          <li
                            key={i}
                            className="text-xs text-amber-800 flex gap-1.5"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 border-t border-gray-200 pt-3 space-y-3">
                    <Button onClick={addToJournal} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter au journal à exporter
                    </Button>
                    <p className="text-xs text-gray-500">
                      Proposition indicative. Aucune écriture n'a été enregistrée :
                      la comptabilisation reste manuelle.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InvoiceScanner;
