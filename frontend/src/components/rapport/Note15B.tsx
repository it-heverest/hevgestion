import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

// --- Interfaces ---
interface OtherEquityRow {
  id: string;
  label: string;
  note: string;
  yearN: number;
  yearN1: number;
  echeancier: string;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note15B: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const { hasFormula } = useFormulaPanel();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  // Load DSF data
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "15B") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.rows) {
          setRows(noteData.rows);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Note 15B data:", error);
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
        rows,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "15B", noteData as any);
      if (success) {
        alert("Données Note 15B sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 15B data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Header
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Lignes exactement comme dans l'image
  const [rows, setRows] = useState<OtherEquityRow[]>([
    {
      id: "1",
      label: "Titres participatifs",
      note: "",
      yearN: 0,
      yearN1: 0,
      echeancier: "",
    },
    {
      id: "2",
      label: "Avances conditionnées",
      note: "",
      yearN: 0,
      yearN1: 0,
      echeancier: "",
    },
    {
      id: "3",
      label: "Titres subordonnés à durée indéterminée (T.S.D.I)",
      note: "",
      yearN: 0,
      yearN1: 0,
      echeancier: "",
    },
    {
      id: "4",
      label: "Obligations remboursables en actions (O.R.A)",
      note: "",
      yearN: 0,
      yearN1: 0,
      echeancier: "",
    },
    { id: "5", label: "Autres", note: "", yearN: 0, yearN1: 0, echeancier: "" },
  ]);

  // Calculs totaux
  const totalYearN = rows.reduce((acc, r) => acc + r.yearN, 0);
  const totalYearN1 = rows.reduce((acc, r) => acc + r.yearN1, 0);
  const variationAbs = totalYearN - totalYearN1;
  const variationPercent =
    totalYearN1 === 0
      ? "-"
      : (((totalYearN - totalYearN1) / totalYearN1) * 100).toFixed(0) + "%";

  // Handler
  const handleChange = (
    id: string,
    field: "note" | "yearN" | "yearN1" | "echeancier",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]:
              field === "note" || field === "echeancier"
                ? value
                : Number(value) || 0,
          }
          : row
      )
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

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_15B_autres_fonds_propres.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: OtherEquityRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-center w-16">
        {isEditing ? (
          <input
            value={row.note}
            onChange={(e) => handleChange(row.id, "note", e.target.value)}
            className="w-full text-center bg-orange-50"
          />
        ) : (
          row.note
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing && !hasFormula(`note15b.rows.${row.id}`) ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) => handleChange(row.id, "yearN", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue formulaKey={`note15b.rows.${row.id}`} label={row.label}>
            {row.yearN.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
          </FormulaValue>
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing && !hasFormula(`note15b.rows.${row.id}`) ? (
          <input
            type="number"
            value={row.yearN1}
            onChange={(e) => handleChange(row.id, "yearN1", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue formulaKey={`note15b.rows.${row.id}`} label={row.label}>
            {row.yearN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
          </FormulaValue>
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(row.yearN - row.yearN1).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {row.yearN1 === 0
          ? "-"
          : (((row.yearN - row.yearN1) / row.yearN1) * 100).toFixed(0) + "%"}
      </td>
      <td className="border border-gray-400 p-1 text-center">
        {isEditing ? (
          <input
            value={row.echeancier}
            onChange={(e) => handleChange(row.id, "echeancier", e.target.value)}
            className="w-full text-center bg-orange-50"
          />
        ) : (
          row.echeancier
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 15B - Autres Fonds Propres
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
            disabled={isSaving}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} className={isSaving ? "animate-pulse" : ""} /> : <Pencil size={18} />}
          </button>
          {isEditing && (
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
            onClick={downloadPDF}
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            29
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          NOTE 15 B
          <br />
          AUTRES FONDS PROPRES (*)
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[35%] text-left"
              >
                Libellés
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[8%]">
                NOTE
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Année N
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Variation
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Échéances
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
              <th className="border border-gray-400 p-1">en valeur absolue</th>
              <th className="border border-gray-400 p-1">en %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => renderRow(row))}

            {/* Total */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL AUTRES FONDS PROPRES
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearN.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationAbs.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent}
              </td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
          </tbody>
        </table>

        {/* Note explicative */}
        <div className="mt-4 text-[10px] text-gray-700 italic">
          (*) Le cas échéant, une rubrique "autres fonds propres" (montant des
          émissions de titres participatifs, avances conditionnées, ...) sur une
          ligne séparée est intercalée entre les rubriques "TOTAL CAPITAUX
          PROPRES ET RESSOURCES ASSIMILEES" et "emprunts et dettes financières"
          si le montant des autres fonds propres est significatif.
        </div>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-40 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[10rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>

        {/* Instructions en bas */}
        <div className="mt-6 text-[10px] text-gray-600 space-y-1">
          <p>
            • Justifier l'inscription de ces dettes dans une rubrique spécifique
            du passif du bilan "autres fonds propres" (faible probabilité de
            remboursement, absence d'échéancier, ...).
          </p>
          <p>
            • Justifier le caractère significatif du montant total de cette
            rubrique.
          </p>
          <p>• Commenter toute variation significative.</p>
        </div>
      </div>
    </div>
  );
};

export default Note15B;



