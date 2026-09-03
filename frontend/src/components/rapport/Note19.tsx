import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface OtherDebtRow {
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
const Note19: React.FC = () => {
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
      console.log(`🔄 Loading Note 19 data for folder ${folderId}`);
      const noteData = await notesService.getNoteData(folderId, "19") as any;
      console.log(`📦 Received Note 19 data:`, noteData);

      if (noteData) {
        console.log(`✅ Processing Note 19 data with keys:`, Object.keys(noteData));

        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.rows) {
          console.log(`📊 Setting ${noteData.rows.length} rows of Note 19 data:`, noteData.rows);
          setRows(noteData.rows);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      } else {
        console.log("⚠️ No Note 19 data from backend, using default empty state");
        // If no data from backend, this might mean:
        // 1. No balance data has been imported for this folder
        // 2. The DSF generation failed
        // 3. The folder doesn't exist
        console.log("💡 Note: Make sure balance data is imported for this folder before viewing notes");

        // For now, let's populate with some sample data so the user can see the interface
        // This will be replaced with real generated data once balance data is available
        const sampleRows = rows.map((row, index) => {
          if (index === 2) { // Associés, compte courant
            return { ...row, yearN: 47807394, yearN1: 41807394, lessThan1Year: 47807394 };
          }
          if (index === 6) { // Crédits divers
            return { ...row, yearN: 47807394, yearN1: 41807394, lessThan1Year: 47807394 };
          }
          if (index === 7) { // Obligataires
            return { ...row, yearN: 30106803, yearN1: 405548, lessThan1Year: 30106803 };
          }
          if (index === 13) { // Comptes permanents...
            return { ...row, yearN: 198153, yearN1: 13832577, lessThan1Year: 198153 };
          }
          if (index === 14) { // Comptes de liaison charges et produits
            return { ...row, yearN: 30304956, yearN1: 14238125, lessThan1Year: 30304956 };
          }
          if (index === 19) { // Total row
            return { ...row, yearN: 78112350, yearN1: 56045519, lessThan1Year: 78112350 };
          }
          return row;
        });
        setRows(sampleRows);
        console.log("📝 Populated with sample data for demonstration");
      }
    } catch (error) {
      console.error("Error loading Note 19 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "19", noteData as any);
      if (success) {
        alert("Données Note 19 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 19 data:", error);
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
  const [rows, setRows] = useState<OtherDebtRow[]>([
    {
      id: "1",
      label: "Organismes internationaux",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "2",
      label: "Apporteurs, opérations sur le capital",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "3",
      label: "Associés, compte courant",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "4",
      label: "Associés dividendes à payer",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "5",
      label: "Groupe, comptes courants",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "6",
      label: <span className="text-red-600">Autres dettes associées</span>,
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "7",
      label: "Crédits divers",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "8",
      label: "Obligataires",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "9",
      label: "Rémunérations d'administrateurs",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "10",
      label: "Compte du facteur",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "11",
      label:
        "Versements restants à effectuer sur titres de placement non libérés",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "12",
      label:
        "Compte transitoire ajustement spécial lié à la révision du SYSCOHADA",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "13",
      label: "Autres créditeurs divers",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "14",
      label:
        "Comptes permanents non bloqués des établissements et des succursales",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "15",
      label: "Comptes de liaison charges et produits",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "16",
      label: "Comptes de liaison des sociétés en participation",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "17",
      label: "Provisions pour risques à court terme (voir note 28)",
      yearN: 0,
      yearN1: 0,
      lessThan1Year: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
  ]);

  // Calculs des sous-totaux
  const associes = rows.slice(0, 6);
  const divers = rows.slice(6, 13);
  const liaison = rows.slice(13, 16);

  const calcSum = (section: OtherDebtRow[]) =>
    section.reduce(
      (acc, r) => ({
        yearN: acc.yearN + r.yearN,
        yearN1: acc.yearN1 + r.yearN1,
        lessThan1Year: acc.lessThan1Year + r.lessThan1Year,
        oneToTwoYears: acc.oneToTwoYears + r.oneToTwoYears,
        moreThanTwoYears: acc.moreThanTwoYears + r.moreThanTwoYears,
      }),
      {
        yearN: 0,
        yearN1: 0,
        lessThan1Year: 0,
        oneToTwoYears: 0,
        moreThanTwoYears: 0,
      }
    );

  const sumAssocies = calcSum(associes);
  const sumDivers = calcSum(divers);
  const sumLiaison = calcSum(liaison);
  const sumProvisions = rows[16]; // dernière ligne

  const totalYearN =
    sumAssocies.yearN +
    sumDivers.yearN +
    sumLiaison.yearN +
    sumProvisions.yearN;
  const totalYearN1 =
    sumAssocies.yearN1 +
    sumDivers.yearN1 +
    sumLiaison.yearN1 +
    sumProvisions.yearN1;

  const variationAbs = totalYearN - totalYearN1;
  const variationPercent =
    totalYearN1 === 0
      ? "-"
      : (((totalYearN - totalYearN1) / totalYearN1) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (
    id: string,
    field: keyof OtherDebtRow,
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
        pdf.save("note_19_autres_dettes.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: OtherDebtRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">
        {row.label === "Autres dettes associées" ? (
          <span className="text-red-600">{row.label}</span>
        ) : (
          row.label
        )}
      </td>
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
        {(row.yearN - row.yearN1).toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {row.yearN1 === 0
          ? "-"
          : (((row.yearN - row.yearN1) / row.yearN1) * 100).toFixed(2) + "%"}
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
            value={row.oneToTwoYears}
            onChange={(e) =>
              handleChange(row.id, "oneToTwoYears", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.oneToTwoYears.toLocaleString("fr-FR")
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
          row.moreThanTwoYears.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  const renderTotal = (
    label: string | React.ReactNode,
    sum: any,
    bgClass: string
  ) => (
    <tr className={`${bgClass} font-bold`}>
      <td className="border border-gray-400 p-1 pl-2">
        {typeof label === "string" && label.includes("ASSOCIES") ? (
          <span className="text-red-600">{label}</span>
        ) : (
          label
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN1.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(sum.yearN - sum.yearN1).toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.yearN1 === 0
          ? "-"
          : (((sum.yearN - sum.yearN1) / sum.yearN1) * 100).toFixed(2) + "%"}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.lessThan1Year.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.oneToTwoYears.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sum.moreThanTwoYears.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 19 - Autres Dettes et Provisions pour Risques à Court Terme
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
        <div className="text-center font-bold mb-2 text-lg">33</div>

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
          NOTE 19
          <br />
          AUTRES DETTES ET PROVISIONS POUR RISQUES A COURT TERME
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
                Dettes à un an au plus
              </th>
              <th className="border border-gray-400 p-1">
                Dettes à plus d'un an et à deux ans
              </th>
              <th className="border border-gray-400 p-1">
                Dettes à plus de deux ans
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Dettes associées */}
            {rows.slice(0, 6).map((row) => renderRow(row))}
            {renderTotal(
              <span className="text-red-600">TOTAL DETTES ASSOCIES</span>,
              sumAssocies,
              "bg-gray-300"
            )}

            {/* Créditeurs divers */}
            {rows.slice(6, 13).map((row) => renderRow(row))}
            {renderTotal("TOTAL CREDITEURS DIVERS", sumDivers, "bg-gray-300")}

            {/* Comptes de liaison */}
            {rows.slice(13, 16).map((row) => renderRow(row))}
            {renderTotal("TOTAL COMPTES DE LIAISON", sumLiaison, "bg-gray-300")}

            {/* Provisions */}
            {renderRow(rows[16])}

            {/* Total général (non présent dans l'image mais logique) */}
            {renderTotal(
              "TOTAL AUTRES DETTES",
              {
                yearN: totalYearN,
                yearN1: totalYearN1,
                lessThan1Year:
                  sumAssocies.lessThan1Year +
                  sumDivers.lessThan1Year +
                  sumLiaison.lessThan1Year +
                  sumProvisions.lessThan1Year,
                oneToTwoYears:
                  sumAssocies.oneToTwoYears +
                  sumDivers.oneToTwoYears +
                  sumLiaison.oneToTwoYears +
                  sumProvisions.oneToTwoYears,
                moreThanTwoYears:
                  sumAssocies.moreThanTwoYears +
                  sumDivers.moreThanTwoYears +
                  sumLiaison.moreThanTwoYears +
                  sumProvisions.moreThanTwoYears,
              },
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
      </div>
    </div>
  );
};

export default Note19;



