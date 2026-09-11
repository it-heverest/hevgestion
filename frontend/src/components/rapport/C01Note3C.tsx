import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";
import { dsfService } from "../../services/dsf.service";

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
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

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
  const [isRegeneratingDSF, setIsRegeneratingDSF] = useState(false);

  // Régénère la DSF côté backend (relance dsf-generator.service.ts avec le
  // mapping comptable / les formules actuelles), puis recharge cette note
  // pour refléter les nouvelles valeurs.
  const regenerateDSF = async () => {
    if (!folderId) return;
    try {
      setIsRegeneratingDSF(true);
      await dsfService.generateDSF(folderId);
      await loadNoteData();
    } catch (error) {
      console.error("Error regenerating DSF:", error);
      alert("Erreur lors de la régénération de la DSF");
    } finally {
      setIsRegeneratingDSF(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);

      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
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
      <td className="border border-gray-400 p-1 text-right w-[20%]">
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => handleValueChange(row.id, field, e.target.value)}
            className="w-full text-right bg-orange-50 px-1 focus:outline-none"
          />
        ) : (
          value.toLocaleString("fr-FR").replace(/\u202F/g, " ")
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
        <td className="border border-gray-400 p-1 pl-2 w-[20%]">
          {row.label}
        </td>
        {fields.map((field) => renderDataCell(row, field))}
        {/* Colonne Total Calculée */}
        <td className="border border-gray-400 p-1 text-right w-[20%]">
          {calculateTotalClosing(row).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
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
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} className={isSaving || isLoading ? "animate-pulse" : ""} /> : <Pencil size={18} />}
          </button>
          <button
            onClick={regenerateDSF}
            disabled={isRegeneratingDSF}
            title="Recalculer la DSF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isRegeneratingDSF ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isSaving || isLoading}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="max-w-[297mm] mx-auto mb-6 bg-orange-50 p-4 rounded border border-orange-200 text-orange-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Chargement des données...
        </div>
      )}

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* En-tête */}
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            13
          </span>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre et Sous-titre */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4 text-sm">
          <div>C01/NOTE 3C</div>
          <div>
            TABLEAU DE SUIVI DES AMORTISSEMENTS DEDUCTIBLES REPUTES DIFFERES EN
            PERIODE DEFICITAIRE
          </div>
        </div>

        {/* Titre répété, en clair (comme dans le vrai template) */}
        <div className="border border-gray-400 text-center font-bold text-sm py-1 mb-3">
          TABLEAU DE SUIVI DES AMORTISSEMENTS DEDUCTIBLES REPUTES DIFFERES EN
          PERIODE DEFICITAIRE
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
          <thead>
            <tr className="bg-gray-300 font-bold">
              <th rowSpan={2} className="border border-gray-400 p-2 w-[20%]">
                Rubriques
              </th>
              <th className="border border-gray-400 p-1 w-[20%]">
                Report des amortissements antérieurement différés à l'ouverture
              </th>
              <th className="border border-gray-400 p-1 w-[20%]">
                Amortissements différés de l'exercice
              </th>
              <th className="border border-gray-400 p-1 w-[20%]">
                Imputation sur l'exercice d'amortissements antérieurement
                différés
              </th>
              <th className="border border-gray-400 p-1 w-[20%]">
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
                {totalReportOpening.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalDeferredAmortization.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalImputation.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalClosing.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
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



