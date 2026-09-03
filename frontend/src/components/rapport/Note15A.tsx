import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface Row {
  id: string;
  label: string;
  yearN: number;
  yearN1: number;
  fiscalAdjustment: number;
  echeancier: string;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note15A: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "15A") as any;

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
      console.error("Error loading Note 15A data:", error);
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

      const success = await notesService.saveNoteData(folderId, "15A", noteData as any);
      if (success) {
        alert("Données Note 15A sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 15A data:", error);
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
  const [rows, setRows] = useState<Row[]>([
    {
      id: "1",
      label: "Etat",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "2",
      label: "Régions",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "3",
      label: "Départements",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "4",
      label: "Communes et collectivités publiques décentralisées",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "5",
      label: "Entités publiques ou mixtes",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "6",
      label: "Entités et organismes privés",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "7",
      label: "Organismes internationaux",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "8",
      label: "Autres",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    // Provisions réglementées
    {
      id: "9",
      label: "Amortissements dérogatoires",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "10",
      label: "Plus-value de cession à réinvestir",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "11",
      label: "Provisions spéciales de réévaluation",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "12",
      label: "Provisions réglementées relatives aux immobilisations",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "13",
      label: "Provisions réglementées relatives aux stocks",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "14",
      label: "Provisions pour investissement",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
    {
      id: "15",
      label: "Autres provisions et fonds réglementés",
      yearN: 0,
      yearN1: 0,
      fiscalAdjustment: 0,
      echeancier: "",
    },
  ]);

  // Calculs
  const subventionsSum = rows.slice(0, 8).reduce(
    (acc, r) => ({
      yearN: acc.yearN + r.yearN,
      yearN1: acc.yearN1 + r.yearN1,
    }),
    { yearN: 0, yearN1: 0 }
  );

  const provisionsSum = rows.slice(8, 15).reduce(
    (acc, r) => ({
      yearN: acc.yearN + r.yearN,
      yearN1: acc.yearN1 + r.yearN1,
    }),
    { yearN: 0, yearN1: 0 }
  );

  const total = {
    yearN: subventionsSum.yearN + provisionsSum.yearN,
    yearN1: subventionsSum.yearN1 + provisionsSum.yearN1,
  };

  const variationAbs = (n: number, n1: number) => n - n1;
  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / n1) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (
    id: string,
    field: "yearN" | "yearN1" | "fiscalAdjustment" | "echeancier",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]: field === "echeancier" ? value : Number(value) || 0,
          }
          : row
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
        pdf.save("note_15A_subventions_provisions.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: Row, bgClass = "") => (
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
        {variationAbs(row.yearN, row.yearN1).toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationPercent(row.yearN, row.yearN1)}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.fiscalAdjustment}
            onChange={(e) =>
              handleChange(row.id, "fiscalAdjustment", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.fiscalAdjustment.toLocaleString("fr-FR")
        )}
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
          Note 15A - Total Subventions et Provisions Réglementées
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
        <div className="text-center font-bold mb-2 text-lg">28</div>

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
          NOTE 15 A
          <br />
          TOTAL SUBVENTIONS ET PROVISIONS REGLEMENTEES
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
              <th rowSpan={2} className="border border-gray-400 p-1">
                Régiste fiscal
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Échéancier
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
            {/* Subventions */}
            {rows.slice(0, 8).map((row) => renderRow(row))}

            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL SUBVENTIONS
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {subventionsSum.yearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {subventionsSum.yearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationAbs(
                  subventionsSum.yearN,
                  subventionsSum.yearN1
                ).toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(subventionsSum.yearN, subventionsSum.yearN1)}
              </td>
              <td className="border border-gray-400 p-1 text-right">-</td>
              <td className="border border-gray-400 p-1 text-center">-</td>
            </tr>

            {/* Provisions réglementées */}
            {rows.slice(8, 15).map((row) => renderRow(row))}

            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL PROVISIONS REGLEMENTEES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {provisionsSum.yearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {provisionsSum.yearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationAbs(
                  provisionsSum.yearN,
                  provisionsSum.yearN1
                ).toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(provisionsSum.yearN, provisionsSum.yearN1)}
              </td>
              <td className="border border-gray-400 p-1 text-right">-</td>
              <td className="border border-gray-400 p-1 text-center">-</td>
            </tr>

            {/* TOTAL GENERAL */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL SUBVENTIONS ET PROVISIONS REGLEMENTEES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {total.yearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {total.yearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationAbs(total.yearN, total.yearN1).toLocaleString(
                  "fr-FR"
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(total.yearN, total.yearN1)}
              </td>
              <td className="border border-gray-400 p-1 text-right">-</td>
              <td className="border border-gray-400 p-1 text-center">-</td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
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

        {/* Notes de bas de page */}
        <div className="mt-4 text-[10px] text-gray-600 space-y-1">
          <p>
            • Indiquer pour la subvention la date d'octroi, la nature, les
            obligations éventuelles.
          </p>
          <p>
            • Pour les provisions réglementées, indiquer le texte de référence,
            les obligations.
          </p>
          <p>• Commenter toute variation significative.</p>
        </div>
      </div>
    </div>
  );
};

export default Note15A;



