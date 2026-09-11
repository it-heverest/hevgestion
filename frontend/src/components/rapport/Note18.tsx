import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";
import { dsfService } from "../../services/dsf.service";

// --- Interfaces ---
interface DebtRow {
  id: string;
  label: string | React.ReactNode;
  yearN: number;
  yearN1: number;
  lessThan1Year: number;
  oneToTwoYears: number;
  moreThanTwoYears: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note18: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "18") as any;

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
      console.error("Error loading Note 18 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "18", noteData as any);
      if (success) {
        alert("Données Note 18 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 18 data:", error);
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
  const [rows, setRows] = useState<DebtRow[]>([
    {
      id: "1",
      label: "Personnel avances et acomptes",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "2",
      label: "Personnel rémunérations dues",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "3",
      label: "Autres personnel",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "4",
      label: "Caisse de sécurité sociale",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "5",
      label: <span className="text-red-600">Caisse de retraite</span>,
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "6",
      label: "Autres organismes sociaux",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "7",
      label: "Etat, impôts sur les bénéfices",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "8",
      label: "Etat, impôt et taxes",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "9",
      label: "Etat, TVA",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "10",
      label: "Etat, impôts retenus à la source",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "11",
      label: "Autres dettes Etat",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
  ]);

  // Calculs
  const socialYearN = rows.slice(0, 6).reduce((acc, r) => acc + r.yearN, 0);
  const socialYearN1 = rows.slice(0, 6).reduce((acc, r) => acc + r.yearN1, 0);

  const fiscalYearN = rows.slice(6).reduce((acc, r) => acc + r.yearN, 0);
  const fiscalYearN1 = rows.slice(6).reduce((acc, r) => acc + r.yearN1, 0);

  const totalYearN = socialYearN + fiscalYearN;
  const totalYearN1 = socialYearN1 + fiscalYearN1;

  const variationAbs = (n: number, n1: number) => n - n1;
  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / n1) * 100).toFixed(0) + "%";

  // Handler
  const handleChange = (id: string, field: keyof DebtRow, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour les colonnes
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_18_dettes_fiscales_sociales.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: DebtRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing && !hasFormula(`note18.rows.${row.id}`) ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) => handleChange(row.id, "yearN", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue
            formulaKey={`note18.rows.${row.id}`}
            label={typeof row.label === "string" ? row.label : row.id}
          >
            {row.yearN.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
          </FormulaValue>
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing && !hasFormula(`note18.rows.${row.id}`) ? (
          <input
            type="number"
            value={row.yearN1}
            onChange={(e) => handleChange(row.id, "yearN1", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue
            formulaKey={`note18.rows.${row.id}`}
            label={typeof row.label === "string" ? row.label : row.id}
          >
            {row.yearN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
          </FormulaValue>
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationAbs(row.yearN, row.yearN1).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationPercent(row.yearN, row.yearN1)}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.lessThan1Year}
            onChange={(e) =>
              handleChange(row.id, "lessThan1Year", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.lessThan1Year.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.oneToTwoYears}
            onChange={(e) =>
              handleChange(row.id, "oneToTwoYears", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.oneToTwoYears.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.moreThanTwoYears}
            onChange={(e) =>
              handleChange(row.id, "moreThanTwoYears", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.moreThanTwoYears.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
    </tr>
  );

  const renderTotal = (
    label: string,
    yearN: number,
    yearN1: number,
    bgClass: string
  ) => (
    <tr className={`${bgClass} font-bold`}>
      <td className="border border-gray-400 p-1 pl-2">{label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {yearN.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {yearN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationAbs(yearN, yearN1).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationPercent(yearN, yearN1)}
      </td>
      <td colSpan={3} className="border border-gray-400 p-1"></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 18 - Dettes Fiscales et Sociales
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
            53
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
          NOTE 18
          <br />
          DETTES FISCALES ET SOCIALES
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[30%]"
              >
                Libellés
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Année N
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Variation
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                Dettes à ...
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
              <th className="border border-gray-400 p-1">en valeur absolue</th>
              <th className="border border-gray-400 p-1">en %</th>
              <th className="border border-gray-400 p-1">
                Dette à un a au plus
              </th>
              <th className="border border-gray-400 p-1">
                Dettes à plus d'un an et à deux ans au plus
              </th>
              <th className="border border-gray-400 p-1">
                Dettes à plus de deux ans
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Dettes sociales */}
            {rows.slice(0, 6).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL DETTES SOCIALES",
              socialYearN,
              socialYearN1,
              "bg-gray-300"
            )}

            {/* Dettes fiscales */}
            {rows.slice(6).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL DETTES FISCALES",
              fiscalYearN,
              fiscalYearN1,
              "bg-gray-300"
            )}

            {/* Total général */}
            {renderTotal(
              "TOTAL DETTES SOCIALES ET FISCALES",
              totalYearN,
              totalYearN1,
              "bg-gray-500 text-white"
            )}
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          <div className="italic text-[10px]">
            • Commenter toute variation significative
            <br />• Commenter les dettes anciennes
          </div>
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
      </div>
    </div>
  );
};

export default Note18;



