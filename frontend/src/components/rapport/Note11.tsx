import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import {
  reportCalculationsService,
  BalanceData,
} from "../../services/report-calculations.service";
import { clientService } from "../../services/client.service";
import { dsfConfigService } from "../../services/dsf-config.service";

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
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();

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
    { id: "1", label: "Banques, chèques postaux et caisse / Siège", yearN: "", yearN1: "" },
    { id: "2", label: "Banques, chèques postaux et caisse / Succursales", yearN: "", yearN1: "" },
    { id: "3", label: "Caisse", yearN: "", yearN1: "" },
    { id: "4", label: "Instruments de monnaie électronique", yearN: "", yearN1: "" },
    { id: "5", label: "Autres disponibilités", yearN: "", yearN1: "" },
  ]);

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
        // Map backend keys → frontend state
        if (noteData.disponibilites) {
          setAvailabilities(
            noteData.disponibilites.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.libelle || availabilities[i]?.label || "",
              yearN: String(r.anneeN ?? ""),
              yearN1: String(r.anneeN1 ?? ""),
            }))
          );
        } else if (noteData.availabilities) {
          setAvailabilities(noteData.availabilities);
        }
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

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Map frontend state → backend keys
      const noteData = {
        entete,
        disponibilites: availabilities.map((r) => ({
          libelle: r.label,
          anneeN: parseFloat(r.yearN) || null,
          anneeN1: parseFloat(r.yearN1) || null,
          variationPourcentage: null,
        })),
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-blue-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span className="px-1">{value || ""}</span>
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
    return variation.toFixed(2) + "%";
  };

  const totalN = useMemo(() => calculateTotal(availabilities, "yearN"), [availabilities]);
  const totalN1 = useMemo(() => calculateTotal(availabilities, "yearN1"), [availabilities]);

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <FileText className="w-6 h-6 text-blue-600" />
            Note 11 - Disponibilités
          </h1>
          <p className="text-sm text-gray-600 mt-1">Standardization en cours...</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <Pencil size={18} /> Éditer
            </button>
          ) : (
            <>
              <button
                onClick={saveNoteData}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={refreshCalculations}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            title="Recalculer à partir de la balance"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> Actualiser
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-blue-500" : "border-gray-200"
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
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">24</span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 pb-4 text-sm">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Désignation entité :</span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) => setEntete({ ...entete, entityName: e.target.value })}
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-20 focus:outline-none px-1 text-center"
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
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-16 focus:outline-none px-1 text-center"
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
                  {renderEditableCell(row.yearN, (val) => handleAvailabilityChange(row.id, "yearN", val))}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) => handleAvailabilityChange(row.id, "yearN1", val))}
                </td>
                <td className="border border-gray-600 p-1 text-center bg-gray-50 font-bold">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-[#e6e6e6] font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL BRUT DISPONIBILITES</td>
              <td className="border border-gray-600 p-1 text-right">{totalN.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-center bg-gray-200">
                {calculateVariation(totalN, totalN1)}
              </td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-[#bfbfbf] font-bold text-[11px]">
              <td className="border border-gray-600 p-2 font-bold">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalN.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-center bg-gray-200">
                {calculateVariation(totalN, totalN1)}
              </td>
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
              className="w-full h-32 p-2 border border-blue-300 bg-blue-50 text-[11px] focus:outline-none resize-none"
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




