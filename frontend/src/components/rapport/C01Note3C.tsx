import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";

// --- Interfaces ---

interface DeferredAmortizationRow {
  id: string;
  label: string;
  reportOpening: number; // Report des amortissements antérieurement différés à l'ouverture (B)
  deferredAmortization: number; // Amortissements différés de l'exercice (C)
  imputation: number; // Imputation sur l'exercice d'amortissements antérieurement différés (D)
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const C01Note3C: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { selectedFolder, selectedClient } = useApp();
  const folderId = selectedFolder?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État de l'en-tête (standard)
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  // État des données
  const [amortizationData, setAmortizationData] = useState<
    DeferredAmortizationRow[]
  >([]);

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  useEffect(() => {
    if (selectedClient && selectedFolder && !headerInfo.entityName) {
      setHeaderInfo({
        entityName: selectedClient.name || "",
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: "12",
      });
    }
  }, [selectedClient, selectedFolder]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3C_C01")) as any;
      if (!noteData) return;

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      const rawData = noteData.amortissementsDifferes || [];
      const rows: DeferredAmortizationRow[] = rawData.map((row: any, i: number) => ({
        id: (i + 1).toString(),
        label: row.libelle || "",
        reportOpening: Number(row.reportAmortissementsAnterieurs) || 0,
        deferredAmortization: Number(row.amortissementsDifferesExercice) || 0,
        imputation: Number(row.imputationExercice) || 0,
      }));
      setAmortizationData(rows);
    } catch (error) {
      console.error("Error loading C01Note3C:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      const noteData = {
        entete: headerInfo,
        amortissementsDifferes: amortizationData.map((row) => ({
          libelle: row.label,
          reportAmortissementsAnterieurs: row.reportOpening,
          amortissementsDifferesExercice: row.deferredAmortization,
          imputationExercice: row.imputation,
          totalReportNonImputes: calculateTotalClosing(row),
        })),
      };

      await notesService.saveNoteData(folderId, "3C_C01", noteData as any);
      alert("Données sauvegardées avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving C01Note3C:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Fonctions de Calcul ---

  // Total du report non imputé = (Report à l'ouverture + Amortissements différés de l'exercice) - Imputation
  const calculateTotalClosing = (row: DeferredAmortizationRow): number => {
    return (
      Number(row.reportOpening) +
      Number(row.deferredAmortization) -
      Number(row.imputation)
    );
  };

  // Fonction de Somme pour une colonne
  const calculateTotal = (
    field: keyof Omit<DeferredAmortizationRow, "id" | "label">
  ): number => {
    return amortizationData.reduce(
      (acc, row) => acc + (Number(row[field]) || 0),
      0
    );
  };

  // Calcul des totaux généraux
  const totalReportOpening = calculateTotal("reportOpening");
  const totalDeferredAmortization = calculateTotal("deferredAmortization");
  const totalImputation = calculateTotal("imputation");
  const totalClosing =
    totalReportOpening + totalDeferredAmortization - totalImputation;

  // Handler pour la mise à jour des chiffres
  const handleValueChange = (
    id: string,
    field: keyof Omit<DeferredAmortizationRow, "id" | "label">,
    value: string
  ) => {
    setAmortizationData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  // Handler PDF (réutilisation du code précédent)
  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);

      setTimeout(async () => {
        // Le tableau est petit, on peut rester en portrait
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("rapport_suivi_amortissements_differes.pdf");

        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu des Lignes ---

  const renderDataCell = (
    row: DeferredAmortizationRow,
    field: keyof Omit<DeferredAmortizationRow, "id" | "label">
  ) => {
    const value = row[field] as number;

    // Champs numériques éditables
    return (
      <td className={`border border-gray-400 p-1 text-right`}>
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => handleValueChange(row.id, field, e.target.value)}
            className="w-full text-right bg-blue-50 px-1 focus:outline-none"
          />
        ) : (
          value.toLocaleString("fr-FR")
        )}
      </td>
    );
  };

  const renderRow = (row: DeferredAmortizationRow) => {
    const fields: (keyof Omit<DeferredAmortizationRow, "id" | "label">)[] = [
      "reportOpening",
      "deferredAmortization",
      "imputation",
    ];

    return (
      <tr key={row.id}>
        <td className="border border-gray-400 p-1 pl-2 font-bold w-[25%]">
          {row.label}
        </td>
        {fields.map((field) => renderDataCell(row, field))}
        {/* Colonne Total Calculée */}
        <td className="border border-gray-400 p-1 text-right font-bold bg-gray-100 w-[25%]">
          {calculateTotalClosing(row).toLocaleString("fr-FR")}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          C01/NOTE 3C - Amortissements Différés
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) {
                saveNoteData();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
              } ${(isSaving || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
              </>
            ) : isEditing ? (
              <>
                <Save size={18} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="max-w-[210mm] mx-auto mb-6 bg-blue-50 p-4 rounded border border-blue-200 text-blue-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Chargement des données...
        </div>
      )}

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* En-tête */}
        <div className="text-center font-bold text-lg mb-2">13</div>
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>{" "}
            <span className="border-b border-dotted border-gray-400 w-full px-1">
              {headerInfo.entityName}
            </span>
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>{" "}
            <span className="border-b border-dotted border-gray-400 w-full px-1">
              {headerInfo.fiscalYear}
            </span>
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>{" "}
            <span className="border-b border-dotted border-gray-400 w-full px-1">
              {headerInfo.idNumber}
            </span>
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>{" "}
            <span className="border-b border-dotted border-gray-400 w-full px-1">
              {headerInfo.duration}
            </span>
          </div>
        </div>

        {/* Titre et Sous-titre */}
        <div className="bg-gray-200 border border-gray-400 py-1 text-center font-bold mb-0 text-sm">
          C01/NOTE 3C
        </div>
        <div className="bg-gray-300 border border-gray-400 border-t-0 py-1 text-center font-bold mb-4 text-sm">
          TABLEAU DE SUIVI DES AMORTISSEMENTS DEDUCTIBLES REPUTES DIFFERES EN
          PERIODE DEFICITAIRE
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
          <thead>
            <tr className="bg-gray-300 font-bold">
              <th rowSpan={2} className="border border-gray-400 p-2 w-[25%]">
                Rubriques
              </th>
              <th className="border border-gray-400 p-1 w-[25%]">
                Report des amortissements antérieurement différés à l'ouverture
              </th>
              <th className="border border-gray-400 p-1 w-[25%]">
                Amortissements différés de l'exercice
              </th>
              <th className="border border-gray-400 p-1 w-[25%]">
                Imputation sur l'exercice d'amortissements antérieurement
                différés
              </th>
              <th className="border border-gray-400 p-1 w-[25%]">
                Total du report des amortissements antérieurement différés non
                imputés
              </th>
            </tr>
          </thead>
          <tbody>
            {amortizationData.map(renderRow)}

            {/* TOTAL */}
            <tr className="bg-gray-400 font-bold text-black">
              <td className="border border-gray-400 p-2 uppercase text-center">
                TOTAL
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalReportOpening.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalDeferredAmortization.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalImputation.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalClosing.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 p-2">
          <div className="font-bold underline text-sm">Note:</div>
          <p className="text-xs italic text-gray-600">
            Ce tableau permet de suivre l'utilisation des amortissements
            fiscalement différés lorsque l'entreprise était en période
            déficitaire, et qui sont imputables sur les bénéfices futurs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default C01Note3C;
