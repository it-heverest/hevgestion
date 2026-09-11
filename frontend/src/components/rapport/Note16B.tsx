import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

// --- Interfaces ---
interface HypothesisRow {
  id: string;
  label: string;
  yearN: number;
  yearN1: number;
}

interface ObligationRow {
  id: string;
  label: string;
  yearN: number;
  yearN1: number;
}

interface SensitivityRow {
  id: string;
  label: string;
  increaseN: number;
  decreaseN: number;
  increaseN1: number;
  decreaseN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note16B: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const { hasFormula } = useFormulaPanel();
  const [isEditing, setIsEditing] = useState(false);
  const [hypothesisComment, setHypothesisComment] = useState("");
  const [obligationComment, setObligationComment] = useState("");
  const [sensitivityComment, setSensitivityComment] = useState("");
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
      const noteData = await notesService.getNoteData(folderId, "16B") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.hypotheses) setHypotheses(noteData.hypotheses);
        if (noteData.obligations) setObligations(noteData.obligations);
        if (noteData.sensitivity) setSensitivity(noteData.sensitivity);
        if (noteData.comments) {
          setHypothesisComment(noteData.comments.hypothesis || "");
          setObligationComment(noteData.comments.obligation || "");
          setSensitivityComment(noteData.comments.sensitivity || "");
        } else if (noteData.comment !== undefined) {
          // Fallback if needed
          setHypothesisComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Note 16B data:", error);
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
        hypotheses,
        obligations,
        sensitivity,
        comments: {
          hypothesis: hypothesisComment,
          obligation: obligationComment,
          sensitivity: sensitivityComment,
        },
      };

      const success = await notesService.saveNoteData(folderId, "16B", noteData as any);
      if (success) {
        alert("Données Note 16B sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 16B data:", error);
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

  // Hypothèses actuarielles
  const [hypotheses, setHypotheses] = useState<HypothesisRow[]>([
    { id: "1", label: "Taux d'augmentation des salaires", yearN: 0, yearN1: 0 },
    { id: "2", label: "Taux d'actualisation", yearN: 0, yearN1: 0 },
    { id: "3", label: "Taux d'inflation", yearN: 0, yearN1: 0 },
    {
      id: "4",
      label:
        "Probabilité d'être présent dans l'entité à la date de départ à la retraite (expérience passée)",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "5",
      label:
        "Probabilité d'être en vie à l'âge de départ à la retraite (table de mortalité)",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "6",
      label: "Taux de rendement effectif des actifs des régimes",
      yearN: 0,
      yearN1: 0,
    },
  ]);

  // Obligations
  const [obligations, setObligations] = useState<ObligationRow[]>([
    {
      id: "1",
      label: "Coût des services rendus au cours de l'exercice",
      yearN: 0,
      yearN1: 0,
    },
    { id: "2", label: "Coût financier", yearN: 0, yearN1: 0 },
    { id: "3", label: "Béné actuariels/(gain)", yearN: 0, yearN1: 0 },
    {
      id: "4",
      label: "Prestation payées au cours de l'exercice",
      yearN: 0,
      yearN1: 0,
    },
    { id: "5", label: "Coût des services passés", yearN: 0, yearN1: 0 },
  ]);

  // Analyse de sensibilité
  const [sensitivity, setSensitivity] = useState<SensitivityRow[]>([
    {
      id: "1",
      label: "Taux d'actualisation (variable de %)",
      increaseN: 0,
      decreaseN: 0,
      increaseN1: 0,
      decreaseN1: 0,
    },
    {
      id: "2",
      label: "Taux de progression des salaires (variation de ... %)",
      increaseN: 0,
      decreaseN: 0,
      increaseN1: 0,
      decreaseN1: 0,
    },
    {
      id: "3",
      label: "Taux de départ du personnel (variation de ... %)",
      increaseN: 0,
      decreaseN: 0,
      increaseN1: 0,
      decreaseN1: 0,
    },
  ]);

  const handleHypothesisChange = (
    id: string,
    field: "yearN" | "yearN1",
    value: string
  ) => {
    setHypotheses((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const handleObligationChange = (
    id: string,
    field: "yearN" | "yearN1",
    value: string
  ) => {
    setObligations((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  // Seule la ligne id "5" (obligation à la clôture) est calculée côté
  // backend (comptes 1961/1962) — toutes les autres lignes de `obligations`
  // restent entièrement manuelles, catalog key littérale (pas de template).
  const renderObligationCell = (row: ObligationRow, field: "yearN" | "yearN1") => {
    if (row.id === "5") {
      return isEditing && !hasFormula("note16b.obligations.5") ? (
        <input
          type="number"
          value={row[field]}
          onChange={(e) => handleObligationChange(row.id, field, e.target.value)}
          className="w-full text-right bg-orange-50"
        />
      ) : (
        <FormulaValue formulaKey="note16b.obligations.5" label={row.label}>
          {row[field].toLocaleString("fr-FR").replace(/ /g, " ")}
        </FormulaValue>
      );
    }

    return isEditing ? (
      <input
        type="number"
        value={row[field]}
        onChange={(e) => handleObligationChange(row.id, field, e.target.value)}
        className="w-full text-right bg-orange-50"
      />
    ) : (
      row[field].toLocaleString("fr-FR").replace(/ /g, " ")
    );
  };

  const handleSensitivityChange = (
    id: string,
    field: keyof SensitivityRow,
    value: string
  ) => {
    setSensitivity((prev) =>
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
        pdf.save("note_16B_engagements_retraite.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 16B - Engagements de Retraite et Avantages Assimilés
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
            50
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
          NOTE 16 B
          <br />
          ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES (METHODES ACTUARIELLES)
        </div>

        {/* Hypothèses actuarielles */}
        <div className="font-bold mb-2">HYPOTHESES ACTUARIELLES</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 pl-2 w-[60%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
            </tr>
          </thead>
          <tbody>
            {hypotheses.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.yearN}
                      onChange={(e) =>
                        handleHypothesisChange(row.id, "yearN", e.target.value)
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.yearN.toFixed(0) + "%"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.yearN1}
                      onChange={(e) =>
                        handleHypothesisChange(row.id, "yearN1", e.target.value)
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.yearN1.toFixed(0) + "%"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Commentaire hypothèses */}
        <div className="mb-6">
          <div className="font-bold">Commentaire :</div>
          <div className="italic text-[10px]">
            Commenter les variations d'hypothèses actuarielles utilisées pour le
            calcul des engagements de retraite et avantages assimilés
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-1 border border-orange-300 bg-orange-50 resize-none"
              value={hypothesisComment}
              onChange={(e) => setHypothesisComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[6rem] border border-gray-400 p-2 whitespace-pre-wrap">
              {hypothesisComment}
            </div>
          )}
        </div>

        {/* Variation de la valeur de l'engagement */}
        <div className="font-bold mb-2">
          VARIATION DE LA VALEUR DE L'ENGAGEMENT DE RETRAITE AU COURS DE
          L'EXERCICE
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 pl-2 w-[60%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
            </tr>
          </thead>
          <tbody>
            {/* Obligations ouverture et clôture */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Obligation au titre des engagements de retraite à l'ouverture
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            {obligations.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderObligationCell(row, "yearN")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderObligationCell(row, "yearN1")}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Obligation au titre des engagements de retraite à la clôture
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire obligations */}
        <div className="mb-6">
          <div className="font-bold">Commentaire :</div>
          <div className="italic text-[10px]">
            Indiquer le montant de la charge par nature comptabilisée au cours
            de l'exercice
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-1 border border-orange-300 bg-orange-50 resize-none"
              value={obligationComment}
              onChange={(e) => setObligationComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[6rem] border border-gray-400 p-2 whitespace-pre-wrap">
              {obligationComment}
            </div>
          )}
        </div>

        {/* Analyse de sensibilité */}
        <div className="font-bold mb-2">
          ANALYSE DE SENSIBILITE DES HYPOTHESE ACTUARIELLES
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[40%]"
              >
                Libellés
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Année N
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Année N-1
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Augmentation</th>
              <th className="border border-gray-400 p-1">Diminution</th>
              <th className="border border-gray-400 p-1">Augmentation</th>
              <th className="border border-gray-400 p-1">Diminution</th>
            </tr>
          </thead>
          <tbody>
            {sensitivity.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.increaseN}
                      onChange={(e) =>
                        handleSensitivityChange(
                          row.id,
                          "increaseN",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.increaseN.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.decreaseN}
                      onChange={(e) =>
                        handleSensitivityChange(
                          row.id,
                          "decreaseN",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.decreaseN.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.increaseN1}
                      onChange={(e) =>
                        handleSensitivityChange(
                          row.id,
                          "increaseN1",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.increaseN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.decreaseN1}
                      onChange={(e) =>
                        handleSensitivityChange(
                          row.id,
                          "decreaseN1",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.decreaseN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Commentaire sensibilité */}
        <div className="mt-6">
          <div className="font-bold">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-1 border border-orange-300 bg-orange-50 resize-none"
              value={sensitivityComment}
              onChange={(e) => setSensitivityComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[6rem] border border-gray-400 p-2 whitespace-pre-wrap">
              {sensitivityComment}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note16B;



