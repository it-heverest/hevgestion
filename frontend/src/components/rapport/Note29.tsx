import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface FinancialRow {
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
const Note29: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "29") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.charges) {
          setCharges(noteData.charges);
        }

        if (noteData.revenus) {
          setRevenus(noteData.revenus);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Note 29 data:", error);
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
        charges,
        revenus,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "29", noteData as any);
      if (success) {
        alert("Données Note 29 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 29 data:", error);
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

  // Charges financières
  const [charges, setCharges] = useState<FinancialRow[]>([
    { id: "c1", label: "Intérêt des emprunts", yearN: 0, yearN1: 0 },
    {
      id: "c2",
      label: "Intérêts dans loyers de location acquisition",
      yearN: 0,
      yearN1: 0,
    },
    { id: "c3", label: "Escomptes accordés", yearN: 0, yearN1: 0 },
    { id: "c4", label: "Autres intérêts", yearN: 0, yearN1: 0 },
    {
      id: "c5",
      label: "Escomptes des effets de commerce",
      yearN: 0,
      yearN1: 0,
    },
    { id: "c6", label: "Perte de change", yearN: 0, yearN1: 0 },
    {
      id: "c7",
      label: "Pertes sur cessions de titres de placement",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "c8",
      label:
        "Mails provenant d'attribution gratuite d'actions au personnel salarié et aux dirigeants",
      yearN: 0,
      yearN1: 0,
    },
    { id: "c9", label: "Pertes sur risques financiers", yearN: 0, yearN1: 0 },
    {
      id: "c10",
      label:
        "Charges pour dépréciation et provisions à court terme à caractère financier (voir note 28)",
      yearN: 0,
      yearN1: 0,
    },
  ]);

  // Revenus financiers
  const [revenus, setRevenus] = useState<FinancialRow[]>([
    {
      id: "r1",
      label: "Intérêts de prêts et créances diverses",
      yearN: 0,
      yearN1: 0,
    },
    { id: "r2", label: "Revenus de participations", yearN: 0, yearN1: 0 },
    { id: "r3", label: "Escomptes obtenus", yearN: 0, yearN1: 0 },
    { id: "r4", label: "Revenus de placement", yearN: 0, yearN1: 0 },
    { id: "r5", label: "Gains de change", yearN: 0, yearN1: 0 },
    {
      id: "r6",
      label: "Gains sur cessions de titres de placement",
      yearN: 0,
      yearN1: 0,
    },
    { id: "r7", label: "Gains risques financiers", yearN: 0, yearN1: 0 },
    {
      id: "r8",
      label:
        "Reprises de charges pour dépréciation et provision à court terme à caractère financier (voir note 28)",
      yearN: 0,
      yearN1: 0,
    },
  ]);

  // Calculs
  const chargesYearN = charges.reduce((acc, r) => acc + r.yearN, 0);
  const chargesYearN1 = charges.reduce((acc, r) => acc + r.yearN1, 0);

  const revenusYearN = revenus.reduce((acc, r) => acc + r.yearN, 0);
  const revenusYearN1 = revenus.reduce((acc, r) => acc + r.yearN1, 0);

  const totalYearN = revenusYearN - chargesYearN;
  const totalYearN1 = revenusYearN1 - chargesYearN1;

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / Math.abs(n1)) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (
    list: "charges" | "revenus",
    id: string,
    field: "yearN" | "yearN1",
    value: string
  ) => {
    if (list === "charges") {
      setCharges((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, [field]: Number(value) || 0 } : row
        )
      );
    } else {
      setRevenus((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, [field]: Number(value) || 0 } : row
        )
      );
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
        pdf.save("note_29_charges_revenus_financiers.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: FinancialRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) =>
              handleChange(
                row.id.startsWith("c") ? "charges" : "revenus",
                row.id,
                "yearN",
                e.target.value
              )
            }
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
            onChange={(e) =>
              handleChange(
                row.id.startsWith("c") ? "charges" : "revenus",
                row.id,
                "yearN1",
                e.target.value
              )
            }
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 29 - Charges et Revenus Financiers
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
        <div className="text-center font-bold mb-2 text-lg">44</div>

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
          NOTE 29
          <br />
          CHARGES ET REVENUS FINANCIER
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
            {/* Charges financières */}
            {charges.map((row) => renderRow(row))}

            {/* Sous-total charges */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                SOUS TOTAL : FRAIS FINANCIERS
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {chargesYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {chargesYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(chargesYearN, chargesYearN1)}
              </td>
            </tr>

            {/* Revenus financiers */}
            {revenus.map((row) => renderRow(row))}

            {/* Sous-total revenus */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                SOUS TOTAL : REVENUS FINANCIER
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {revenusYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {revenusYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(revenusYearN, revenusYearN1)}
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

        {/* Instructions en bas */}
        <div className="mt-6 text-[10px] text-gray-600 space-y-1">
          <p>• Commenter toute variation significative.</p>
          <p>
            • En cas de paiement à terme, indiquer le montant des intérêts non
            comptabilisés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Note29;



