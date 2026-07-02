import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface DebtRow {
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
const Note16A: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "16A") as any;

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
      console.error("Error loading Note 16A data:", error);
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

      const success = await notesService.saveNoteData(folderId, "16A", noteData as any);
      if (success) {
        alert("Données Note 16A sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 16A data:", error);
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

  // Toutes les lignes exactement comme dans l'image
  const [rows, setRows] = useState<DebtRow[]>([
    {
      id: "1",
      label: "Emprunts obligataires",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "2",
      label: "Emprunts et dettes auprès des établissements de crédit",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "3",
      label: "Avances reçues de l'Etat",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "4",
      label: "Avances reçues et comptes courants bloqués",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "5",
      label: "Dépôts et cautionnement reçus",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "6",
      label: "Intérêts courus",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "7",
      label: "Avances associées de conditions particulières",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "8",
      label: "Autres emprunts et dettes",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "9",
      label: "Dettes liées à des participations",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "10",
      label: "Comptes permanents bloqués des établissements et succ.",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    // Crédit-bail
    {
      id: "11",
      label: "Crédit bail immobilier",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "12",
      label: "Crédit bail mobilier",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "13",
      label: "Location vente",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "14",
      label: "Intérêts courus",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "15",
      label: "Autres dettes de location acquisition",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    // Provisions
    {
      id: "16",
      label: "Provisions pour litiges",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "17",
      label: "Provisions pour garantie donnée aux clients",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "18",
      label: "Provisions pour pertes sur marchés à achèvement futur",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "19",
      label: "Provisions pour pertes de change",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "20",
      label: "Provisions pour impôts",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "21",
      label: "Provisions pour pensions et obligations assimilées",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "22",
      label: "Act du régime du retraite",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "23",
      label: "Provisions pour restructuration",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "24",
      label: "Provisions pour amendes et pénalités",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "25",
      label: "Provisions de propre assureur",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "26",
      label: "Provisions pour démantèlement et remise en état",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "27",
      label: "Provisions de droits à déduction",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
    {
      id: "28",
      label: "Autres provisions",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToFiveYears: 0,
      moreThanFiveYears: 0,
    },
  ]);

  // Calculs des sections
  const financialDebts = rows.slice(0, 10);
  const leasingDebts = rows.slice(10, 15);
  const provisions = rows.slice(15, 28);

  const calcSum = (section: DebtRow[]) => ({
    yearN: section.reduce((acc, r) => acc + r.yearN, 0),
    yearN1: section.reduce((acc, r) => acc + r.yearN1, 0),
    lessThan1Year: section.reduce((acc, r) => acc + r.lessThan1Year, 0),
    oneToFiveYears: section.reduce((acc, r) => acc + r.oneToFiveYears, 0),
    moreThanFiveYears: section.reduce((acc, r) => acc + r.moreThanFiveYears, 0),
  });

  const sumFinancial = calcSum(financialDebts);
  const sumLeasing = calcSum(leasingDebts);
  const sumProvisions = calcSum(provisions);

  const totalYearN =
    sumFinancial.yearN + sumLeasing.yearN + sumProvisions.yearN;
  const totalYearN1 =
    sumFinancial.yearN1 + sumLeasing.yearN1 + sumProvisions.yearN1;

  const variationAbs = totalYearN - totalYearN1;
  const variationPercent =
    totalYearN1 === 0
      ? "-"
      : (((totalYearN - totalYearN1) / totalYearN1) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (id: string, field: keyof DebtRow, value: string) => {
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
        pdf.save("note_16A_dettes_financieres.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: DebtRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2 text-left">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) => handleChange(row.id, "yearN", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.yearN.toLocaleString("fr-FR")
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
          row.yearN1.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(((row.yearN - row.yearN1) / (row.yearN1 || 1)) * 100).toFixed(2)}%
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(row.yearN - row.yearN1).toLocaleString("fr-FR")}
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
    <tr className={bgClass + " font-bold"}>
      <td className="border border-gray-400 p-1 pl-2">{label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN1.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(((sum.yearN - sum.yearN1) / (sum.yearN1 || 1)) * 100).toFixed(2)}%
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(sum.yearN - sum.yearN1).toLocaleString("fr-FR")}
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
          Note 16A - Dettes Financières et Ressources Assimilées
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
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">30</div>

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
          NOTE 16A
          <br />
          DETTES FINANCIERES ET RESSOURCES ASSIMILEES
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[30%] text-left"
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
              <th className="border border-gray-400 p-1">en %</th>
              <th className="border border-gray-400 p-1">en valeur absolue</th>
              <th className="border border-gray-400 p-1">
                Dettes à un an au plus
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
            {/* Emprunts et dettes financières */}
            {rows.slice(0, 10).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL EMPRUNTS ET DETTES FINANCIERES",
              sumFinancial,
              "bg-gray-300"
            )}

            {/* Dettes de location acquisition */}
            {rows.slice(10, 15).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL DETTES DE LOCATION ACQUISITION",
              sumLeasing,
              "bg-gray-300"
            )}

            {/* Provisions pour risques et charges */}
            {rows.slice(15, 28).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL PROVISIONS POUR RISQUES ET CHARGES",
              sumProvisions,
              "bg-gray-500 text-white"
            )}
          </tbody>
        </table>

        {/* Commentaire (optionnel, non visible dans l'image mais ajouté pour cohérence) */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[8rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note16A;



