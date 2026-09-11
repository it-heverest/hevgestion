import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
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
  // Couleur de fond exacte du vrai template (dsf_complet.xlsx), ex. "#DCE6F1"
  // pour "ANALYSE DE ..." ou "#AEAAAA" pour les jalons de la CAFG. `null`/
  // absent = pas de fond (ligne de détail normale).
  bg?: string | null;
  // Ligne de titre pure (aucune saisie, aucune colonne N/N-1/Variation).
  header?: boolean;
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

  // Couleurs de fond exactes du vrai template (dsf_complet.xlsx, feuille
  // "NOTE 34") — voir generateNote34 côté backend, source de vérité une
  // fois les données chargées. Cet état n'est qu'un aperçu avant chargement.
  const BLUE = "#DCE6F1";
  const GRAY_MEDIUM = "#AEAAAA";
  const GRAY_LIGHT = "#D0CECE";

  const [rows, setRows] = useState<IndicatorRow[]>([
    { id: "1", label: "ANALYSE DE L'ACTIVITE", bold: true, bg: BLUE, header: true, yearN: 0, yearN1: 0 },
    { id: "2", label: "SOLDE INTERMEDIAIRES DE GESTION", bold: true, header: true, yearN: 0, yearN1: 0 },
    { id: "3", label: "CHIFFRE D'AFFAIRES", bold: true, yearN: 0, yearN1: 0 },
    { id: "4", label: "MARGE COMMERCIALE", yearN: 0, yearN1: 0 },
    { id: "5", label: "VALEUR AJOUTEE", yearN: 0, yearN1: 0 },
    { id: "6", label: "EXCEDENT BRUT D'EXPLOITATION (E.B.E)", yearN: 0, yearN1: 0 },
    { id: "7", label: "RESULTAT D'EXPLOITATION", yearN: 0, yearN1: 0 },
    { id: "8", label: "RESULTAT FINANCIER", yearN: 0, yearN1: 0 },
    { id: "9", label: "RESULTAT DES ACTIVITES ORDINAIRES", yearN: 0, yearN1: 0 },
    { id: "10", label: "RESULTAT HORS ACTIVITES ORDINAIRES", yearN: 0, yearN1: 0 },
    { id: "11", label: "RESULTAT NET", bold: true, yearN: 0, yearN1: 0 },
    { id: "12", label: "DETERMINATION DE LA CAPACITE D'AUTOFINANCEMENT", bold: true, bg: GRAY_MEDIUM, header: true, yearN: 0, yearN1: 0 },
    { id: "13", label: "EBE", bold: true, yearN: 0, yearN1: 0 },
    { id: "14", label: "+ Valeurs comptables des cessions courantes d'immobilisation (comptes 654)", yearN: 0, yearN1: 0 },
    { id: "15", label: "- Produits des cessions courantes d'immobilisation (comptes 754)", yearN: 0, yearN1: 0 },
    { id: "16", label: "CAPACITE D'AUTOFINANCEMENT D'EXPLOITATION", bold: true, bg: GRAY_MEDIUM, yearN: 0, yearN1: 0 },
    { id: "17", label: "+ Revenus financiers", yearN: 0, yearN1: 0 },
    { id: "18", label: "+ Gains de change", yearN: 0, yearN1: 0 },
    { id: "19", label: "+ Transferts de charges financières", yearN: 0, yearN1: 0 },
    { id: "20", label: "+ Produits H.A.O.", yearN: 0, yearN1: 0 },
    { id: "21", label: "+ Transferts de charges H.A.O.", yearN: 0, yearN1: 0 },
    { id: "22", label: "- Frais financiers", yearN: 0, yearN1: 0 },
    { id: "23", label: "- Pertes de change", yearN: 0, yearN1: 0 },
    { id: "24", label: "- Charges H.A.O.", yearN: 0, yearN1: 0 },
    { id: "25", label: "- Participation", yearN: 0, yearN1: 0 },
    { id: "26", label: "- Impôts sur le résultat", yearN: 0, yearN1: 0 },
    { id: "27", label: "CAPACITE D'AUTOFINANCEMENT GLOBAL", bold: true, bg: GRAY_MEDIUM, yearN: 0, yearN1: 0 },
    { id: "28", label: "Distributions de dividendes opérées au cours de l'exercice", yearN: 0, yearN1: 0 },
    { id: "29", label: "AUTOFINANCEMENT", bold: true, bg: GRAY_MEDIUM, yearN: 0, yearN1: 0 },
    { id: "30", label: "ANALYSE DE LA RENTABILITE", bold: true, bg: GRAY_LIGHT, header: true, yearN: 0, yearN1: 0 },
    { id: "31", label: "Rentabilité économique = résultat d'exploitation / (capitaux propres + dettes financières)", yearN: 0, yearN1: 0 },
    { id: "32", label: "Rentabilité financière = résultat net / capitaux propres", yearN: 0, yearN1: 0 },
    { id: "33", label: "ANALYSE DE LA STRUCTURE FINANCIERE", bold: true, bg: GRAY_LIGHT, header: true, yearN: 0, yearN1: 0 },
    { id: "34", label: "Capitaux propres et ressources assimilées", yearN: 0, yearN1: 0 },
    { id: "35", label: "+ Dettes financières et autres ressources assimilées", yearN: 0, yearN1: 0 },
    { id: "36", label: "= Ressources stables", yearN: 0, yearN1: 0 },
    { id: "37", label: "- Actif immobilisé", yearN: 0, yearN1: 0 },
    { id: "38", label: "= FONDS DE ROULEMENT (1)", bold: true, bg: GRAY_LIGHT, yearN: 0, yearN1: 0 },
    { id: "39", label: "Actif circulant d'exploitation", yearN: 0, yearN1: 0 },
    { id: "40", label: "- Passif circulant d'exploitation", yearN: 0, yearN1: 0 },
    { id: "41", label: "= BESOIN DE FINANCEMENT D'EXPLOITATION (2)", bold: true, yearN: 0, yearN1: 0 },
    { id: "42", label: "Actif circulant H.A.O.", yearN: 0, yearN1: 0 },
    { id: "43", label: "- Passif circulant H.A.O.", yearN: 0, yearN1: 0 },
    { id: "44", label: "= BESOIN DE FINANCEMENT H.A.O. (3)", yearN: 0, yearN1: 0 },
    { id: "45", label: "BESOIN DE FINANCEMENT GLOBAL (4) = (2) + (3)", bold: true, bg: GRAY_LIGHT, yearN: 0, yearN1: 0 },
    { id: "46", label: "TRESORERIE NETTE (5) = (1) - (4)", bold: true, bg: GRAY_LIGHT, yearN: 0, yearN1: 0 },
    { id: "47", label: "CONTROLE TRESORERIE NETTE = (TRESORERIE-ACTIF) - (TRESORERIE-PASSIF)", yearN: 0, yearN1: 0 },
    { id: "48", label: "ANALYSE DE LA VARIATION DE LA TRESORERIE", bg: GRAY_LIGHT, header: true, yearN: 0, yearN1: 0 },
    { id: "49", label: "Flux de trésorerie des activités opérationnelles", bold: true, yearN: 0, yearN1: 0 },
    { id: "50", label: "- Flux de trésorerie des activités d'investissement", bold: true, yearN: 0, yearN1: 0 },
    { id: "51", label: "+ Flux de trésorerie des activités de financement", bold: true, yearN: 0, yearN1: 0 },
    { id: "52", label: "= VARIATION DE LA TRESORERIE NETTE DE LA PERIODE", bold: true, bg: GRAY_LIGHT, yearN: 0, yearN1: 0 },
    { id: "53", label: "ANALYSE DE LA VARIATION DE L'ENDETTEMENT FINANCIERE NET", bold: true, bg: GRAY_LIGHT, header: true, yearN: 0, yearN1: 0 },
    { id: "54", label: "Endettement financier brut", bold: true, yearN: 0, yearN1: 0 },
    { id: "55", label: "- Trésorerie Actif", bold: true, yearN: 0, yearN1: 0 },
    { id: "56", label: "= ENDETTEMENT FINANCIER NET", bold: true, yearN: 0, yearN1: 0 },
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
    n1 === 0 ? "-" : (((n - n1) / Math.abs(n1)) * 100).toFixed(0) + "%";

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
      <div className="w-full max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
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
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-full max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            49
          </span>
        </div>

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
        <div className="bg-[#bfbfbf] py-2 text-center font-bold mb-6">
          NOTE 34:
          <br />
          FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS
        </div>

        <div className="text-center mb-4">(EN MILLIERS DE FRANC)</div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-[#bfbfbf]">
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
            {rows.map((row) => (
              <tr
                key={row.id}
                style={row.bg ? { backgroundColor: row.bg } : undefined}
                className={row.bold ? "font-bold" : ""}
              >
                <td className="border border-gray-400 p-1 pl-4">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {row.header ? (
                    ""
                  ) : isEditing ? (
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
                  {row.header ? (
                    ""
                  ) : isEditing ? (
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
                  {row.header ? "" : variationPercent(row.yearN, row.yearN1)}
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




