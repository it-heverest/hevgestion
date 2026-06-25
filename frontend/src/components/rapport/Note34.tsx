import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface IndicatorRow {
  id: string;
  label: string;
  yearN: number;
  yearN1: number;
  bold?: boolean;
  gray?: boolean;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const Note34: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  const [comment, setComment] = useState("");

  const [rows, setRows] = useState<IndicatorRow[]>([
    { id: "1", label: "SOLDE INTERMEDIAIRES DE GESTION", bold: true, gray: true, yearN: 0, yearN1: 0 },
    { id: "2", label: "CHIFFRE D'AFFAIRES", yearN: 0, yearN1: 0 },
    { id: "3", label: "MARGE COMMERCIALE", yearN: 0, yearN1: 0 },
    { id: "4", label: "VALEUR AJOUTEE", yearN: 0, yearN1: 0 },
    { id: "5", label: "EXCEDENT BRUT D'EXPLOITATION (EBE)", yearN: 0, yearN1: 0 },
    { id: "6", label: "RESULTAT D'EXPLOITATION", yearN: 0, yearN1: 0 },
    { id: "7", label: "RESULTAT FINANCIER", yearN: 0, yearN1: 0 },
    { id: "8", label: "RESULTAT DES ACTIVITES ORDINAIRES", yearN: 0, yearN1: 0 },
    { id: "9", label: "RESULTAT HORS ACTIVITES ORDINAIRES", yearN: 0, yearN1: 0 },
    { id: "10", label: "RESULTAT NET", yearN: 0, yearN1: 0 },
    { id: "11", label: "DETERMINATION DE LA CAPACITE D'AUTOFINANCEMENT", bold: true, gray: true, yearN: 0, yearN1: 0 },
    { id: "12", label: "EBE", yearN: 0, yearN1: 0 },
    { id: "13", label: "+ Reprises comptables des cessions courantes d'immobilisation (compte 654)", yearN: 0, yearN1: 0 },
    { id: "14", label: "- Produits des cessions courantes d'immobilisation (compte 754)", yearN: 0, yearN1: 0 },
    { id: "15", label: "CAPACITE D'AUTOFINANCEMENT D'EXPLOITATION", yearN: 0, yearN1: 0 },
    { id: "16", label: "+ Revenus financiers", yearN: 0, yearN1: 0 },
    { id: "17", label: "- Frais de change", yearN: 0, yearN1: 0 },
    { id: "18", label: "+ Transfert de charges financières", yearN: 0, yearN1: 0 },
    { id: "19", label: "+ Produits HAO", yearN: 0, yearN1: 0 },
    { id: "20", label: "- Transfert de charges HAO", yearN: 0, yearN1: 0 },
    { id: "21", label: "- Frais financiers", yearN: 0, yearN1: 0 },
    { id: "22", label: "- Perte de change", yearN: 0, yearN1: 0 },
    { id: "23", label: "- Impôts sur les résultats", yearN: 0, yearN1: 0 },
    { id: "24", label: "CAPACITE D'AUTOFINANCEMENT GLOBAL", bold: true, gray: true, yearN: 0, yearN1: 0 },
    { id: "25", label: "- Distribution de dividendes opérés durant l'exercice", yearN: 0, yearN1: 0 },
    { id: "26", label: "AUTOFINANCEMENT", yearN: 0, yearN1: 0 },
    { id: "27", label: "ANALYSE DE LA RENTABILITE", bold: true, gray: true, yearN: 0, yearN1: 0 },
    { id: "28", label: "Rentabilité économique/ressultat d'exploitation (a) (capitaux propres + dettes)", yearN: 0, yearN1: 0 },
    { id: "29", label: "Rentabilité financière/ressultat (capitaux propres)", yearN: 0, yearN1: 0 },
    { id: "30", label: "ANALYSE DE LA STRUCTURE FINANCIERE", bold: true, gray: true, yearN: 0, yearN1: 0 },
    { id: "31", label: "Capitaux propres et ressources assimilées", yearN: 0, yearN1: 0 },
    { id: "32", label: "- Dettes financières et autres ressources assimilées (b)", yearN: 0, yearN1: 0 },
    { id: "33", label: "Ressources stables", yearN: 0, yearN1: 0 },
    { id: "34", label: "- Actifs immobilisés (b)", yearN: 0, yearN1: 0 },
    { id: "35", label: "FONDS DE ROULEMENT (1)", yearN: 0, yearN1: 0 },
    { id: "36", label: "Actif circulant d'exploitation (b)", yearN: 0, yearN1: 0 },
    { id: "37", label: "- Passif circulant d'exploitation (b)", yearN: 0, yearN1: 0 },
    { id: "38", label: "BESOIN DE FINANCEMENT D'EXPLOITATION (2)", yearN: 0, yearN1: 0 },
    { id: "39", label: "Actif circulant HAO (b)", yearN: 0, yearN1: 0 },
    { id: "40", label: "- Passif circulant HAO (b)", yearN: 0, yearN1: 0 },
    { id: "41", label: "BESOIN DE FINANCEMENT HAO (3)", yearN: 0, yearN1: 0 },
    { id: "42", label: "BESOIN DE FINANCEMENT GLOBAL (1) = (2) + (3)", yearN: 0, yearN1: 0 },
    { id: "43", label: "TRESORERIE NETTE (5) = (1) - (4)", yearN: 0, yearN1: 0 },
    { id: "44", label: "CONTROLE TRESORERIE NETTE (TRESORERIE ACTIF - TRESORERIE PASSIF) = TRESORERIE NETTE", bold: true, yearN: 0, yearN1: 0 },
    { id: "45", label: "ANALYSE DU FINANCEMENT DE L'EXPLOITATION", bold: true, gray: true, yearN: 0, yearN1: 0 },
    { id: "46", label: "+ Flux de trésorerie des activités opérationnelles", yearN: 0, yearN1: 0 },
    { id: "47", label: "+ Flux de trésorerie des activités d'investissement", yearN: 0, yearN1: 0 },
    { id: "48", label: "+ Flux de trésorerie des activités de financement", yearN: 0, yearN1: 0 },
    { id: "49", label: "= VARIATION DE LA TRESORERIE NETTE DE LA PERIODE", yearN: 0, yearN1: 0 },
    { id: "50", label: "Endettement financières brut (Dettes financières + Trésorerie passif)", yearN: 0, yearN1: 0 },
    { id: "51", label: "- Trésorerie actif", yearN: 0, yearN1: 0 },
    { id: "52", label: "= ENDETTEMENT FINANCIERE NET", bold: true, yearN: 0, yearN1: 0 },
  ]);

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "34") as any;

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
      console.error("Error loading Note 34 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "34", noteData as any);
      if (success) {
        alert("Données Note 34 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 34 data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (id: string, field: "yearN" | "yearN1", value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / Math.abs(n1)) * 100).toFixed(2) + "%";

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_34_indicateurs.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 34:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 34 - Indicateurs Financiers
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
                <Save size={18} /> Sauvegarde...
              </>
            ) : isEditing ? (
              <>
                <Save size={18} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
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
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg"></div>

        {/* Standard header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
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
                className="border-b border-orange-500 bg-orange-50 w-32 text-center px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-32 text-center">
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
                className="border-b border-orange-500 bg-orange-50 w-16 text-center px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="bg-[#c0c0c0] py-2 text-center font-bold mb-6">
          NOTE 34:
          <br />
          FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS
        </div>

        <div className="text-center mb-4">(EN MILLIERS DE FRANC)</div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-[#d3d3d3]">
              <th className="border border-gray-400 p-1 w-[60%]">
                NATURE DES INDICATIONS
              </th>
              <th className="border border-gray-400 p-1 text-center">N</th>
              <th className="border border-gray-400 p-1 text-center">N-1</th>
              <th className="border border-gray-400 p-1 text-center">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#c0c0c0] font-bold">
              <td className="border border-gray-400 p-1 pl-4">
                SOLDE INTERMEDIAIRES DE GESTION
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`${row.gray ? "bg-[#c0c0c0]" : ""} ${row.bold ? "font-bold" : ""
                  }`}
              >
                <td className="border border-gray-400 p-1 pl-4">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing && !row.gray ? (
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
                  {isEditing && !row.gray ? (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note34;




