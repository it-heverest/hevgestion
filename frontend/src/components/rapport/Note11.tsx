import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import {
  reportCalculationsService,
  BalanceData,
} from "../../services/report-calculations.service";
import { clientService } from "../../services/client.service";
import { dsfConfigService } from "../../services/dsf-config.service";
import { dsfService } from "../../services/dsf.service";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

// --- Types et Interfaces ---

interface AvailabilityRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note11: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingDSF, setIsRegeneratingDSF] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  const { hasFormula } = useFormulaPanel();

  // État pour l'en-tête
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  // État pour le commentaire
  const [comment, setComment] = useState("");

  // État pour les Disponibilités
  const [availabilities, setAvailabilities] = useState<AvailabilityRow[]>([
    { id: "1", label: "Banques locales", yearN: "", yearN1: "" },
    { id: "2", label: "Banques autres états région", yearN: "", yearN1: "" },
    { id: "3", label: "Banques, dépôt à terme", yearN: "", yearN1: "" },
    { id: "4", label: "Autres Banques", yearN: "", yearN1: "" },
    { id: "5", label: "Banques intérêts courus", yearN: "", yearN1: "" },
    { id: "6", label: "Chèques postaux", yearN: "", yearN1: "" },
    { id: "7", label: "Autres établissement financiers", yearN: "", yearN1: "" },
    { id: "8", label: "Etablissement financiers intérêts courus", yearN: "", yearN1: "" },
    { id: "9", label: "Instrument de trésorerie", yearN: "", yearN1: "" },
    { id: "10", label: "Caisse", yearN: "", yearN1: "" },
    { id: "11", label: "Caisse électronique mobile", yearN: "", yearN1: "" },
    { id: "12", label: "Régies d'avances et virements accréditifs", yearN: "", yearN1: "" },
  ]);

  // Dépréciations: ligne à part, affichée après TOTAL BRUT (pas dans la
  // liste de détail) — même convention que la note 8.
  const [depreciations, setDepreciations] = useState("");

  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "11") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Le backend (buildNoteRows) renvoie {label, yearN, yearN1} — mêmes
        // noms de champs que l'état interne.
        if (Array.isArray(noteData.disponibilites)) {
          setAvailabilities(
            noteData.disponibilites.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.label || availabilities[i]?.label || "",
              yearN: String(r.yearN ?? ""),
              yearN1: String(r.yearN1 ?? ""),
            }))
          );
        }
        setDepreciations(
          noteData.depreciations != null ? String(noteData.depreciations) : "",
        );
        setComment(noteData.comment || "");
      } else {
        // Fallback or Initial calculation if no saved data
        await refreshCalculations();
      }
    } catch (error) {
      console.error("Error loading Note 11 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCalculations = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const balancesResponse = await clientService.getBalancesByFolder(folderId);
      const currentBalance = balancesResponse.balances?.find((b: any) => b.type === "CURRENT_YEAR");
      const previousBalance = balancesResponse.balances?.find((b: any) => b.type === "PREVIOUS_YEAR");

      if (currentBalance?.originalData) {
        const dsfConfigs = await dsfConfigService.getConfigsByFolder(folderId, "note11");
        reportCalculationsService.updateInput({
          balanceData: currentBalance.originalData as BalanceData,
          previousBalanceData: previousBalance?.originalData as BalanceData,
          dsfConfigs: dsfConfigs || [],
        });
        const calculated = reportCalculationsService.calculateNote11();

        // Map calculated data to our state
        const mapped = calculated.availabilities.map((a: any) => ({
          id: a.id,
          label: a.label,
          yearN: a.yearN.toString(),
          yearN1: a.yearN1.toString(),
        }));
        setAvailabilities(mapped);

        setEntete({
          entityName: selectedClient?.name || "",
          fiscalYear: selectedFolder?.fiscalYear?.toString() || "",
          idNumber: selectedClient?.taxNumber || "",
          duration: "12",
        });
      }
    } catch (error) {
      console.error("Error refreshing calculations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Régénère la DSF côté backend (relance dsf-generator.service.ts avec le
  // mapping comptable / les formules actuelles), puis recharge cette note
  // pour refléter les nouvelles valeurs — utile après une modification des
  // formules dans "Mapping comptable", contrairement à "Actualiser" qui ne
  // recalcule que cette note à partir de la balance déjà chargée côté client.
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

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Mêmes noms de champs qu'à la génération, pour un rechargement fidèle.
      const noteData = {
        entete,
        disponibilites: availabilities.map((r) => ({
          id: r.id,
          label: r.label,
          yearN: parseFloat(r.yearN) || 0,
          yearN1: parseFloat(r.yearN1) || 0,
        })),
        depreciations: parseFloat(depreciations) || 0,
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "11", noteData as any);
      if (success) {
        alert("Données Note 11 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 11 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 11");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvailabilityChange = (id: string, field: "yearN" | "yearN1", value: string) => {
    setAvailabilities((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_11_disponibilites.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 11:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = ""
  ) => {
    return isEditing ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span className="px-1">
        {value === "" || value === null || value === undefined
          ? ""
          : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </span>
    );
  };

  // Comme renderEditableCell, mais pour les cases pilotées par le catalogue
  // de formules (note11.disponibilites / note11.depreciations): verrouillée
  // en édition et cliquable dès que le catalogue expose une formule.
  const renderFormulaCell = (
    value: string,
    onChange: (val: string) => void,
    formulaKey: string,
    label: string,
    className: string = ""
  ) => {
    return isEditing && !hasFormula(formulaKey) ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <FormulaValue formulaKey={formulaKey} label={label}>
        {value === "" || value === null || value === undefined
          ? ""
          : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </FormulaValue>
    );
  };

  const calculateTotal = (data: any[], field: string) => {
    return data.reduce((acc, row) => acc + (parseFloat(row[field]?.toString().replace(/\s/g, "")) || 0), 0);
  };

  const calculateVariation = (n: string | number, n1: string | number) => {
    const valN = typeof n === "string" ? parseFloat(n.replace(/\s/g, "")) || 0 : n;
    const valN1 = typeof n1 === "string" ? parseFloat(n1.replace(/\s/g, "")) || 0 : n1;
    if (valN1 === 0) return "-";
    const variation = ((valN - valN1) / valN1) * 100;
    return variation.toFixed(0) + "%";
  };

  const totalN = useMemo(() => calculateTotal(availabilities, "yearN"), [availabilities]);
  const totalN1 = useMemo(() => calculateTotal(availabilities, "yearN1"), [availabilities]);
  const totalNet = useMemo(
    () => totalN - (parseFloat(depreciations.replace(/\s/g, "")) || 0),
    [totalN, depreciations],
  );

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 11 - Disponibilités
          </h1>
          <p className="text-sm text-gray-600 mt-1">Standardization en cours...</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
            onClick={() => setIsEditing(true)}
            title="Éditer"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil size={18} />
          </button>
          ) : (
            <>
              <button
            onClick={saveNoteData}
            disabled={isSaving}
            title="Sauvegarder"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className={isSaving ? "animate-pulse" : ""} />
          </button>
              <button
            onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
            title="Annuler"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
            </>
          )}
          <button
            onClick={refreshCalculations}
            disabled={isLoading}
            className="flex items-center justify-center p-2.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50"
            title="Recalculer à partir de la balance"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
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
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
          }`}
      >
        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center text-sm">
            <div className="text-orange-800">
              <span className="font-bold">Attention :</span> Certains champs de l'en-tête sont vides.
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-orange-800 underline font-bold">
                Mettre à jour l'en-tête
              </button>
            )}
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            24
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 pb-4 text-sm">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Désignation entité :</span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) => setEntete({ ...entete, entityName: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">{entete.entityName || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={entete.fiscalYear}
                onChange={(e) => setEntete({ ...entete, fiscalYear: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">{entete.fiscalYear || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={entete.idNumber}
                onChange={(e) => setEntete({ ...entete, idNumber: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">{entete.idNumber || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={entete.duration}
                onChange={(e) => setEntete({ ...entete, duration: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">{entete.duration || "-"}</span>
            )}
          </div>
        </div>

        {/* Titre du Tableau */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-2 text-center font-bold mb-4 text-[12px]">
          NOTE 11 <br /> DISPONIBILITES
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[11px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-center w-[45%]">Libellés</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N-1</th>
              <th className="border border-gray-600 p-2 text-center w-[15%]">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderFormulaCell(
                    row.yearN,
                    (val) => handleAvailabilityChange(row.id, "yearN", val),
                    `note11.disponibilites.${row.id}`,
                    row.label
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderFormulaCell(
                    row.yearN1,
                    (val) => handleAvailabilityChange(row.id, "yearN1", val),
                    `note11.disponibilites.${row.id}`,
                    row.label
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-center bg-gray-50 font-bold">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-[#e6e6e6] font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL BRUT DISPONIBILITES</td>
              <td className="border border-gray-600 p-1 text-right">{totalN.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-center bg-gray-200">
                {calculateVariation(totalN, totalN1)}
              </td>
            </tr>

            {/* Dépréciations: ligne à part, avant le total net */}
            <tr>
              <td className="border border-gray-600 p-2 italic">Dépréciations</td>
              <td className="border border-gray-600 p-1 text-right bg-red-50">
                {renderFormulaCell(depreciations, setDepreciations, "note11.depreciations", "Dépréciations")}
              </td>
              <td colSpan={2} className="border border-gray-600 bg-gray-100"></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-[#bfbfbf] font-bold text-[11px]">
              <td className="border border-gray-600 p-2 font-bold">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td colSpan={2} className="border border-gray-600 bg-gray-200"></td>
            </tr>
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border border-gray-600 p-3 bg-white min-h-[150px]">
          <div className="font-bold underline mb-3 text-[11px]">Commentaire :</div>
          <div className="text-[9px] text-gray-600 mb-4 space-y-1 italic">
            <p>• Indiquer la date de rapprochement des comptes bancaires.</p>
            <p>• Indiquer la date d'inventaire de la caisse et des instruments de monnaie électronique.</p>
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-2 border border-orange-300 bg-orange-50 text-[11px] focus:outline-none resize-none"
              placeholder="Saisir votre commentaire ici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-[11px] min-h-[2rem]">
              {comment || "Aucun commentaire."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note11;




