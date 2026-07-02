import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface HAORow {
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
const Note30: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "30") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.charges) {
          setCharges(noteData.charges);
        }

        if (noteData.produits) {
          setProduits(noteData.produits);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Note 30 data:", error);
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
        produits,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "30", noteData as any);
      if (success) {
        alert("Données Note 30 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 30 data:", error);
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

  // Charges HAO
  const [charges, setCharges] = useState<HAORow[]>([
    {
      id: "c1",
      label: "Charges HAO constatées (1) à détailler",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "c2",
      label: "(1) ....................................",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "c3",
      label: "(1) ....................................",
      yearN: 0,
      yearN1: 0,
    },
    { id: "c4", label: "Pertes sur créances HAO", yearN: 0, yearN1: 0 },
    { id: "c5", label: "Dons et libéralités accordés", yearN: 0, yearN1: 0 },
    { id: "c6", label: "Abandons de créances consentis", yearN: 0, yearN1: 0 },
    { id: "c7", label: "Charges provisionnées HAO", yearN: 0, yearN1: 0 },
    {
      id: "c8",
      label: "Dotations hors activités ordinaires",
      yearN: 0,
      yearN1: 0,
    },
    { id: "c9", label: "Participation des travailleurs", yearN: 0, yearN1: 0 },
  ]);

  // Produits HAO
  const [produits, setProduits] = useState<HAORow[]>([
    {
      id: "p1",
      label: "Produits HAO constatés (1) à détailler",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "p2",
      label: "(1) ....................................",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "p3",
      label: "(1) ....................................",
      yearN: 0,
      yearN1: 0,
    },
    { id: "p4", label: "Dons et libéralités obtenus", yearN: 0, yearN1: 0 },
    { id: "p5", label: "Abandons de créances obtenus", yearN: 0, yearN1: 0 },
    { id: "p6", label: "Transfert de charges HAO", yearN: 0, yearN1: 0 },
    {
      id: "p7",
      label:
        "Reprise des charges pour dépréciations et provisions à court terme HAO",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "p8",
      label: "Reprises hors activités ordinaire",
      yearN: 0,
      yearN1: 0,
    },
  ]);

  // Calculs
  const chargesYearN = charges.reduce((acc, r) => acc + r.yearN, 0);
  const chargesYearN1 = charges.reduce((acc, r) => acc + r.yearN1, 0);

  const produitsYearN = produits.reduce((acc, r) => acc + r.yearN, 0);
  const produitsYearN1 = produits.reduce((acc, r) => acc + r.yearN1, 0);

  const totalYearN = produitsYearN - chargesYearN;
  const totalYearN1 = produitsYearN1 - chargesYearN1;

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / Math.abs(n1)) * 100).toFixed(2) + "%";

  // Handler
  const handleChange = (
    list: "charges" | "produits",
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
      setProduits((prev) =>
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
        pdf.save("note_30_autres_charges_produits_hao.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: HAORow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) =>
              handleChange(
                row.id.startsWith("c") ? "charges" : "produits",
                row.id,
                "yearN",
                e.target.value
              )
            }
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
            onChange={(e) =>
              handleChange(
                row.id.startsWith("c") ? "charges" : "produits",
                row.id,
                "yearN1",
                e.target.value
              )
            }
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 30 - Autres Charges et Produits HAO
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
        <div className="text-center font-bold mb-2 text-lg">45</div>

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
          NOTE 30
          <br />
          AUTRES CHARGES ET PRODUITS HAO
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
            {/* Charges HAO */}
            {charges.map((row) => renderRow(row))}

            {/* Sous-total charges HAO */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                SOUS TOTAL : CHARGES HAO
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

            {/* Produits HAO */}
            {produits.map((row) => renderRow(row))}

            {/* Sous-total produits HAO */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                SOUS TOTAL : AUTRES PRODUITS HAO
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {produitsYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {produitsYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {variationPercent(produitsYearN, produitsYearN1)}
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
      </div>
    </div>
  );
};

export default Note30;



