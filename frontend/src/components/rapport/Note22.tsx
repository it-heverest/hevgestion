import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface PurchaseRow {
  id: string;
  label: string | React.ReactNode;
  yearN: number;
  yearN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note22: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const folderId = selectedFolder?.id;

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
      const noteData = await notesService.getNoteData(folderId, "22") as any;

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
      console.error("Error loading Note 22 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "22", noteData as any);
      if (success) {
        alert("Données Note 22 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 22 data:", error);
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
  const [rows, setRows] = useState<PurchaseRow[]>([
    // Achats de marchandises
    { id: "1", label: "Achats dans la régions", yearN: 0, yearN1: 0 },
    { id: "2", label: "Achats hors régions", yearN: 0, yearN1: 0 },
    { id: "3", label: "Achat groupe", yearN: 0, yearN1: 0 },
    // Achats matières premières et fournitures liées
    { id: "4", label: "Achat dans la région", yearN: 0, yearN1: 0 },
    { id: "5", label: "Achat hors région", yearN: 0, yearN1: 0 },
    { id: "6", label: "Achat groupe", yearN: 0, yearN1: 0 },
    // Autres achats
    { id: "7", label: "Matières consommables", yearN: 0, yearN1: 0 },
    { id: "8", label: "Matières combustibles", yearN: 0, yearN1: 0 },
    { id: "9", label: "Produits d'entretien", yearN: 0, yearN1: 0 },
    {
      id: "10",
      label: "Fournitures d'atelier, d'usine et de magasin",
      yearN: 0,
      yearN1: 0,
    },
    { id: "11", label: "Eau", yearN: 0, yearN1: 0 },
    { id: "12", label: "Electricité", yearN: 0, yearN1: 0 },
    { id: "13", label: "Autres énergies", yearN: 0, yearN1: 0 },
    {
      id: "14",
      label: <span className="text-red-600">Fourniture d'entretien</span>,
      yearN: 0,
      yearN1: 0,
    },
    { id: "15", label: "Fournitures de bureau", yearN: 0, yearN1: 0 },
    { id: "16", label: "Petit matériel et outillages", yearN: 0, yearN1: 0 },
    {
      id: "17",
      label:
        "Achats études, prestations de services, de travaux matériels et emballages",
      yearN: 0,
      yearN1: 0,
    },
    { id: "18", label: "Frais sur achats", yearN: 0, yearN1: 0 },
    {
      id: "19",
      label: "Remises rabais, remises et ristournes",
      yearN: 0,
      yearN1: 0,
    },
  ]);

  // Calculs totaux
  const marchandisesYearN = rows
    .slice(0, 3)
    .reduce((acc, r) => acc + r.yearN, 0);
  const marchandisesYearN1 = rows
    .slice(0, 3)
    .reduce((acc, r) => acc + r.yearN1, 0);

  const matieresYearN = rows.slice(3, 6).reduce((acc, r) => acc + r.yearN, 0);
  const matieresYearN1 = rows.slice(3, 6).reduce((acc, r) => acc + r.yearN1, 0);

  const autresYearN = rows.slice(6).reduce((acc, r) => acc + r.yearN, 0);
  const autresYearN1 = rows.slice(6).reduce((acc, r) => acc + r.yearN1, 0);

  const totalYearN = marchandisesYearN + matieresYearN + autresYearN;
  const totalYearN1 = marchandisesYearN1 + matieresYearN1 + autresYearN1;

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / n1) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (
    id: string,
    field: "yearN" | "yearN1",
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
        pdf.save("note_22_achats.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: PurchaseRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) => handleChange(row.id, "yearN", e.target.value)}
            className="w-full text-right bg-blue-50"
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN1.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {variationPercent(row.yearN, row.yearN1)}
      </td>
    </tr>
  );

  const renderTotal = (
    label: string,
    yearN: number,
    yearN1: number,
    bgClass: string
  ) => (
    <tr className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2 font-bold">{label}</td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {yearN.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {yearN1.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {variationPercent(yearN, yearN1)}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 22 - Achats
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
                : "bg-blue-600 hover:bg-blue-700"
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 transition"
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
        <div className="text-center font-bold mb-2 text-lg">59</div>

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
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-20 px-1"
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
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
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
          NOTE 22
          <br />
          ACHATS
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-500 text-white">
              <th className="border border-gray-400 p-1 pl-2 w-[55%] text-left">
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
              <th className="border border-gray-400 p-1">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {/* Achats de marchandises */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL : ACHATS DE MARCHANDISES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {marchandisesYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {marchandisesYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(marchandisesYearN, marchandisesYearN1)}
              </td>
            </tr>
            {rows.slice(0, 3).map((row) => renderRow(row))}

            {/* Achats matières premières */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL: ACHATS MATIERES PREMIERES ET FOURNITURES LIEES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {matieresYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {matieresYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(matieresYearN, matieresYearN1)}
              </td>
            </tr>
            {rows.slice(3, 6).map((row) => renderRow(row))}

            {/* Autres achats */}
            {rows.slice(6).map((row) => renderRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL : AUTRES ACHATS
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {autresYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {autresYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(autresYearN, autresYearN1)}
              </td>
            </tr>

            {/* Total général */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL</td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(totalYearN, totalYearN1)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-40 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
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

export default Note22;
