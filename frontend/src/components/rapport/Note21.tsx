import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface TurnoverRow {
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
const Note21: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "21") as any;

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
      console.error("Error loading Note 21 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "21", noteData as any);
      if (success) {
        alert("Données Note 21 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 21 data:", error);
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
  const [rows, setRows] = useState<TurnoverRow[]>([
    // Ventes marchandises
    { id: "1", label: "Ventes dans la région", yearN: 0, yearN1: 0 },
    { id: "2", label: "Ventes hors région", yearN: 0, yearN1: 0 },
    { id: "3", label: "Ventes groupe", yearN: 0, yearN1: 0 },
    { id: "4", label: "Ventes sur internet", yearN: 0, yearN1: 0 },
    // Ventes produits fabriqués
    { id: "5", label: "Ventes dans la région", yearN: 0, yearN1: 0 },
    { id: "6", label: "Ventes hors région", yearN: 0, yearN1: 0 },
    { id: "7", label: "Ventes groupe", yearN: 0, yearN1: 0 },
    { id: "8", label: "Ventes sur internet", yearN: 0, yearN1: 0 },
    // Ventes travaux et services
    { id: "9", label: "Ventes dans la région", yearN: 0, yearN1: 0 },
    { id: "10", label: "Ventes hors région", yearN: 0, yearN1: 0 },
    { id: "11", label: "Ventes groupe", yearN: 0, yearN1: 0 },
    { id: "12", label: "Ventes sur internet", yearN: 0, yearN1: 0 },
    // Autres produits
    { id: "13", label: "Produits accessoires", yearN: 0, yearN1: 0 },
    { id: "14", label: "Production immobilisée", yearN: 0, yearN1: 0 },
    { id: "15", label: "Subventions d'exploitation", yearN: 0, yearN1: 0 },
    { id: "16", label: "Autres produits", yearN: 0, yearN1: 0 },
  ]);

  // Calculs des totaux
  const marchandisesYearN = rows
    .slice(0, 4)
    .reduce((acc, r) => acc + r.yearN, 0);
  const marchandisesYearN1 = rows
    .slice(0, 4)
    .reduce((acc, r) => acc + r.yearN1, 0);

  const fabriquesYearN = rows.slice(4, 8).reduce((acc, r) => acc + r.yearN, 0);
  const fabriquesYearN1 = rows
    .slice(4, 8)
    .reduce((acc, r) => acc + r.yearN1, 0);

  const servicesYearN = rows.slice(8, 12).reduce((acc, r) => acc + r.yearN, 0);
  const servicesYearN1 = rows
    .slice(8, 12)
    .reduce((acc, r) => acc + r.yearN1, 0);

  const autresYearN = rows.slice(12).reduce((acc, r) => acc + r.yearN, 0);
  const autresYearN1 = rows.slice(12).reduce((acc, r) => acc + r.yearN1, 0);

  const totalYearN =
    marchandisesYearN + fabriquesYearN + servicesYearN + autresYearN;
  const totalYearN1 =
    marchandisesYearN1 + fabriquesYearN1 + servicesYearN1 + autresYearN1;

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
        pdf.save("note_21_chiffre_affaires.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: TurnoverRow, bgClass = "") => (
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
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 21 - Chiffre d'Affaires et Autres Produits
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
        <div className="text-center font-bold mb-2 text-lg">58</div>

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
          NOTE 21
          <br />
          CHIFFRE D'AFFAIRES ET AUTRES PRODUITS
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
            {/* Ventes marchandises */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL : VENTES MARCHANDISES
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(0, 4).map((row) => renderRow(row))}

            {/* Ventes produits fabriqués */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL : VENTES DE PRODUITS FABRIQUES
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(4, 8).map((row) => renderRow(row))}

            {/* Ventes travaux et services */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL : VENTES DE TRAVAUX ET SERVICES VENDUS
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(8, 12).map((row) => renderRow(row))}

            {/* Chiffre d'affaires total */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL CHIFFRES D'AFFAIRES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(
                  marchandisesYearN +
                  fabriquesYearN +
                  servicesYearN
                ).toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(
                  marchandisesYearN1 +
                  fabriquesYearN1 +
                  servicesYearN1
                ).toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(
                  marchandisesYearN + fabriquesYearN + servicesYearN,
                  marchandisesYearN1 + fabriquesYearN1 + servicesYearN1
                )}
              </td>
            </tr>

            {/* Autres produits */}
            {rows.slice(12).map((row) => renderRow(row))}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL: AUTRES PRODUITS
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

export default Note21;



