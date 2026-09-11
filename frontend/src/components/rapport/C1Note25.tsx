import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";

// --- Interfaces ---
interface TaxSynthesisRow {
  id: string;
  label: string | React.ReactNode;
  yearN: number;
  regularizations: number;
  yearN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const CNote25: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "C1/25") as any;

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
      console.error("Error loading Note C1/25 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "C1/25", noteData as any);
      if (success) {
        alert("Données Note C1/25 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note C1/25 data:", error);
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
  const [rows, setRows] = useState<TaxSynthesisRow[]>([
    {
      id: "1",
      label: "Impôts sur les Sociétés",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "2",
      label: "Impôt sur le Revenu des Personnes",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "3",
      label: "Traitements, salaires, rentes viagères",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "4",
      label: "Revenu des Capitaux Mobiliers (IRCM)",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "5",
      label: "Revenus fonciers",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "6",
      label: "Bénéfices artisanaux, industriels, et agricoles",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "7",
      label: "Bénéfice des professions non commerciales",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "8",
      label: "Taxe sur la Valeur Ajoutée",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "9",
      label: "Droits d'accises",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "10",
      label: "Au taux de 25%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "11",
      label: "Au taux de 15%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "12",
      label: "Au taux de 5%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "13",
      label: "Au taux de 2%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    { id: "14", label: "Spécifiques", yearN: 0, regularizations: 0, yearN1: 0 },
    {
      id: "15",
      label: "Boissons alcoolisées",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "16",
      label: "Emballages non retournables (boissons alcoolisées et sucrées)",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "17",
      label: "Autres emballages*",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "18",
      label: "Taxe sur les jeux",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "19",
      label: "Taxe de séjour",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "20",
      label: "Taxe Spéciale sur les Revenus",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "21",
      label: "Au taux général de 15%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "22",
      label: "Au taux moyen de 10%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "23",
      label: "Au taux réduit de 5%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "24",
      label: "Au taux super-réduit de 2%",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "25",
      label: "Taxe Spéciale sur les Produits",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "26",
      label: "Taxes minières",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "27",
      label: "Taxe à l'extraction",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "28",
      label: "Taxe ad valorem",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "29",
      label: "Autres taxes minières",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "30",
      label: "Recette des forêts",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "31",
      label: "Taxe d'abattage",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "32",
      label: "Redevance Forestière Annuelle (RFA)",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "33",
      label: "Autres taxes forestières",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "34",
      label: "Droit de timbre automobile",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "35",
      label: "Droits d'enregistrement",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "36",
      label: "Taxe à l'essieu",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "37",
      label: "Taxe foncière",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "38",
      label: "Droit de timbre d'aéroport",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "39",
      label: "Timbre sur la publicité",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
    {
      id: "40",
      label: "Autres impôts et taxes",
      yearN: 0,
      regularizations: 0,
      yearN1: 0,
    },
  ]);

  // Calculs totaux
  const totalYearN = rows.reduce((acc, r) => acc + r.yearN, 0);
  const totalRegularizations = rows.reduce(
    (acc, r) => acc + r.regularizations,
    0
  );
  const totalYearN1 = rows.reduce((acc, r) => acc + r.yearN1, 0);

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / n1) * 100).toFixed(0) + "%";

  // Handler
  const handleChange = (
    id: string,
    field: "yearN" | "regularizations" | "yearN1",
    value: string
  ) => {
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
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("cnote_25_synthese_impots.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: TaxSynthesisRow, bgClass = "") => (
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
          row.yearN.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.regularizations}
            onChange={(e) =>
              handleChange(row.id, "regularizations", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.regularizations.toLocaleString("fr-FR").replace(/\u202F/g, " ")
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
          row.yearN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")
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
          C'Note 25 - Synthèse des Impôts et Taxes Versés
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
            38
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
          C'NOTE 25
          <br />
          SYNTHESE DES IMPOTS ET TAXES VERSES
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[50%] text-left"
              >
                Libellés
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Année N
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Année N-1
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Variation en %
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1"></th>
              <th className="border border-gray-400 p-1">Régularisations</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => renderRow(row))}

            {/* Total */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">Total</td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearN.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalRegularizations.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
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
              className="w-full h-32 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[8rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>

        {/* Note de bas de page */}
        <div className="mt-4 text-[10px] text-gray-600 italic">
          * Emballages non retournables (boissons alcoolisées et sucrées)
        </div>
      </div>
    </div>
  );
};

export default CNote25;



