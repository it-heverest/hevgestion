import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { FormulaValue } from "./shared/FormulaValue";

// --- Interfaces ---
interface SupplierRow {
  id: string;
  label: string;
  yearN: number;
  yearN1: number;
  lessThan1Year: number;
  oneToFiveYears: number;
  moreThanFiveYears: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note17: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
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
      const noteData = await notesService.getNoteData(folderId, "17") as any;

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
      console.error("Error loading Note 17 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "17", noteData as any);
      if (success) {
        alert("Données Note 17 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 17 data:", error);
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
  const [rows, setRows] = useState<SupplierRow[]>([
    {
      id: "1",
      label: "Fournisseurs dettes en compte (hors groupe)",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "2",
      label: "Fournisseurs effets à payer (hors groupe)",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "3",
      label: "Fournisseur, dettes et effets à payer groupe",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "4",
      label: "Fournisseurs factures non parvenues (hors groupe)",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "5",
      label: "Fournisseurs factures non parvenues groupe",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "6",
      label: "Fournisseurs, avances et acomptes (hors groupe)",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "7",
      label: "Fournisseurs, avances et acomptes groupe",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "8",
      label: "Autres fournisseurs débiteurs",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
  ]);

  // Calculs des totaux
  const calcSum = (ids: string[]) => {
    return rows
      .filter((r) => ids.includes(r.id))
      .reduce(
        (acc, r) => ({
          yearN: acc.yearN + r.yearN,
          yearN1: acc.yearN1 + r.yearN1,
          lessThan1Year: acc.lessThan1Year + r.lessThan1Year,
          oneToFiveYears: acc.oneToFiveYears + r.oneToFiveYears,
          moreThanFiveYears: acc.moreThanFiveYears + r.moreThanFiveYears,
        }),
        {
          yearN: 0,
          yearN1: 0,
          lessThan1Year: 0,
          oneToFiveYears: 0,
          moreThanFiveYears: 0,
        }
      );
  };

  const totalFournisseurs = calcSum(["1", "2", "3", "4", "5"]);
  const totalDebiteurs = calcSum(["6", "7", "8"]);

  const totalYearN = totalFournisseurs.yearN + totalDebiteurs.yearN;
  const totalYearN1 = totalFournisseurs.yearN1 + totalDebiteurs.yearN1;

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / n1) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (
    id: string,
    field: keyof SupplierRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
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
        pdf.save("note_17_fournisseurs.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: SupplierRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) => handleChange(row.id, "yearN", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue formulaKey={`note17.rows.${row.id}`} label={row.label}>
            {row.yearN.toLocaleString("fr-FR")}
          </FormulaValue>
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN1}
            onChange={(e) => handleChange(row.id, "yearN1", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue formulaKey={`note17.rows.${row.id}`} label={row.label}>
            {row.yearN1.toLocaleString("fr-FR")}
          </FormulaValue>
        )}
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
          row.lessThan1Year.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.oneToFiveYears}
            onChange={(e) =>
              handleChange(row.id, "oneToFiveYears", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.oneToFiveYears.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.moreThanFiveYears}
            onChange={(e) =>
              handleChange(row.id, "moreThanFiveYears", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.moreThanFiveYears.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  const renderTotal = (label: string, sum: any, bgClass: string) => (
    <tr className={`${bgClass} font-bold`}>
      <td className="border border-gray-400 p-1 pl-2">{label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN1.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationPercent(sum.yearN, sum.yearN1)}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.lessThan1Year.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.oneToFiveYears.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.moreThanFiveYears.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 17 - Fournisseurs d'Exploitation
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
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSaving ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarde...{" "}
              </>
            ) : isEditing ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarder{" "}
              </>
            ) : (
              <>
                {" "}
                <Pencil size={18} /> Éditer{" "}
              </>
            )}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                loadNoteData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">31</div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité (s) :</span>
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
          NOTE 17
          <br />
          FOURNISSEURS D'EXPLOITATION
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
              <th colSpan={2} className="border border-gray-400 p-1">
                Année N
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Variation en %
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                Dettes à ...
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
              <th className="border border-gray-400 p-1">
                Dettes à un an ou plus
              </th>
              <th className="border border-gray-400 p-1">
                Dettes à plus d'un an et à deux ans ou plus
              </th>
              <th className="border border-gray-400 p-1">
                Dettes à plus de deux ans
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Fournisseurs */}
            {rows.slice(0, 5).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL FOURNISSEURS",
              totalFournisseurs,
              "bg-gray-300"
            )}

            {/* Fournisseurs débiteurs */}
            {rows.slice(5, 8).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL FOURNISSEURS DEBITEURS",
              totalDebiteurs,
              "bg-gray-500 text-white"
            )}
          </tbody>
        </table>

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
          <p>• Commenter toutes variations significatives.</p>
          <p>
            • Indiquer pour les dettes du groupe le nom de la société du groupe
            et le % de titres détenus.
          </p>
          <p>• Commenter les dettes anciennes.</p>
        </div>
      </div>
    </div>
  );
};

export default Note17;



