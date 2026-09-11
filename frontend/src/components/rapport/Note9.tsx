import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

// --- Types et Interfaces ---

interface TitreRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  isTotal?: boolean;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note9: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
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

  // État pour les Titres de placement
  const [rows, setRows] = useState<TitreRow[]>([
    { id: "1", label: "Titres de trésor et bons de caisse à court terme", yearN: "", yearN1: "" },
    { id: "2", label: "Actions", yearN: "", yearN1: "" },
    { id: "3", label: "Obligations", yearN: "", yearN1: "" },
    { id: "4", label: "Bons de souscription", yearN: "", yearN1: "" },
    { id: "5", label: "Titres négociables hors régions", yearN: "", yearN1: "" },
    { id: "6", label: "Intérêts courus", yearN: "", yearN1: "" },
    { id: "7", label: "Autres valeurs assimilées", yearN: "", yearN1: "" },
  ]);

  const [depreciations, setDepreciations] = useState({ yearN: "", yearN1: "" });

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
      const noteData = await notesService.getNoteData(folderId, "9") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // generateNote9 (backend) renvoie `titresPlacement`/`rows` (mêmes
        // données, buildNoteRows) avec les clés yearN/yearN1 — pas anneeN.
        const titres = noteData.titresPlacement ?? noteData.rows;
        if (Array.isArray(titres) && titres.length > 0) {
          setRows(
            titres.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.label ?? rows[i]?.label ?? "",
              yearN: r.yearN != null ? String(r.yearN) : "",
              yearN1: r.yearN1 != null ? String(r.yearN1) : "",
            }))
          );
        }
        // `depreciations` est un tableau d'une ligne (buildNoteRows), pas un
        // objet scalaire — la valeur est dans depreciations[0].
        const depRow = Array.isArray(noteData.depreciations) ? noteData.depreciations[0] : undefined;
        setDepreciations({
          yearN: depRow?.yearN != null ? String(depRow.yearN) : "",
          yearN1: depRow?.yearN1 != null ? String(depRow.yearN1) : "",
        });
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading Note 9 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Mêmes clés qu'à la génération (buildNoteRows: id/label/yearN/yearN1),
      // pour que loadNoteData relise correctement ce qui vient d'être
      // sauvegardé.
      const titres = rows.map((r) => ({
        id: r.id,
        label: r.label,
        yearN: parseFloat(r.yearN) || 0,
        yearN1: parseFloat(r.yearN1) || 0,
      }));
      const noteData = {
        entete,
        rows: titres,
        titresPlacement: titres,
        depreciations: [
          {
            id: "1",
            label: "Dépréciations",
            yearN: parseFloat(depreciations.yearN) || 0,
            yearN1: parseFloat(depreciations.yearN1) || 0,
          },
        ],
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "9", noteData as any);
      if (success) {
        alert("Données Note 9 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 9 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 9");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowChange = (id: string, field: "yearN" | "yearN1", value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

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
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_9_titres_placement.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 9:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = "",
    formulaKey?: string,
    label?: string
  ) => {
    const display = (
      <span className="px-1">
        {value === "" || value === null || value === undefined
          ? ""
          : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </span>
    );

    return isEditing && !(formulaKey && hasFormula(formulaKey)) ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : formulaKey && hasFormula(formulaKey) ? (
      <FormulaValue formulaKey={formulaKey} label={label || ""}>
        {display}
      </FormulaValue>
    ) : (
      display
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

  const totalBrut = useMemo(() => calculateTotal(rows, "yearN"), [rows]);
  const totalN1 = useMemo(() => calculateTotal(rows, "yearN1"), [rows]);
  const totalNet = useMemo(() => totalBrut - (parseFloat(String(depreciations.yearN ?? "").replace(/\s/g, "")) || 0), [totalBrut, depreciations.yearN]);
  const totalNetN1 = useMemo(() => totalN1 - (parseFloat(String(depreciations.yearN1 ?? "").replace(/\s/g, "")) || 0), [totalN1, depreciations.yearN1]);

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
            Note 9 - Titres de placement
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
            22
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 pb-4">
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
          NOTE 9 <br /> TITRES DE PLACEMENT
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-center w-[45%]">Libellés</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N-1</th>
              <th className="border border-gray-600 p-2 text-center w-[15%]">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2 text-blue-700">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) => handleRowChange(row.id, "yearN", val), "", `note9.rows.${row.id}`, row.label)}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) => handleRowChange(row.id, "yearN1", val), "", `note9.rows.${row.id}`, row.label)}
                </td>
                <td className="border border-gray-600 p-1 text-center bg-gray-50 font-bold">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL BRUT TITRES</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-center">
                {calculateVariation(totalBrut, totalN1)}
              </td>
            </tr>

            {/* DEPRECIATIONS */}
            <tr>
              <td className="border border-gray-600 p-2 text-blue-700 italic">Dépréciations des titres</td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(depreciations.yearN, (val) => setDepreciations({ ...depreciations, yearN: val }), "", "note9.depreciations.1", "Dépréciations des titres")}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(depreciations.yearN1, (val) => setDepreciations({ ...depreciations, yearN1: val }), "", "note9.depreciations.1", "Dépréciations des titres")}
              </td>
              <td className="border border-gray-600"></td>
            </tr>

            {/* Ligne vide de séparation */}
            <tr>
              <td colSpan={4} className="border border-gray-600 h-4"></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalNetN1.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-center">
                {calculateVariation(totalNet, totalNetN1)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border border-gray-600 p-3 bg-white min-h-[150px]">
          <div className="font-bold mb-2 text-[11px]">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-2 border border-orange-300 bg-orange-50 text-[11px] focus:outline-none resize-none"
              placeholder="Saisir votre commentaire ici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-[11px] min-h-[6rem]">
              {comment || ""}
            </div>
          )}
        </div>
        <div className="text-[9px] text-gray-600 mt-2 space-y-1">
          <p>- Justifier toute variation significative.</p>
          <p>- Pour les titres cotés à une bourse de valeur : indiquer le nombre, le prix unitaire d'acquisition et le cours de la bourse au 31 décembre.</p>
          <p>- Faire ressortir les actions ou parts propres et indiquer la date d'acquisition et le nombre de titres détenus.</p>
          <p>- Indiquer les événements et circonstances qui ont conduit à la dépréciation et à la reprise.</p>
        </div>
      </div>
    </div>
  );
};

export default Note9;




