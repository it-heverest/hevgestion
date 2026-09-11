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

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface ValeurRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
}

const Note10: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const { hasFormula } = useFormulaPanel();

  // Standardized entete state
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  const [valeurs, setValeurs] = useState<ValeurRow[]>([
    { id: "1", label: "Effets à encaisser", yearN: "", yearN1: "" },
    { id: "2", label: "Effets à l'encaissement", yearN: "", yearN1: "" },
    { id: "3", label: "Chèques à encaisser", yearN: "", yearN1: "" },
    { id: "4", label: "Chèques à l'encaissement", yearN: "", yearN1: "" },
    { id: "5", label: "Cartes de crédit à encaisser", yearN: "", yearN1: "" },
    { id: "6", label: "Autres valeurs à encaisser", yearN: "", yearN1: "" },
  ]);

  const [totalBrut, setTotalBrut] = useState({ yearN: "", yearN1: "" });
  const [depreciations, setDepreciations] = useState<ValeurRow[]>([
    { id: "1", label: "Dépréciations des valeurs à encaisser", yearN: "", yearN1: "" },
  ]);
  const [totalNet, setTotalNet] = useState({ yearN: "", yearN1: "" });
  const [comment, setComment] = useState("");

  // Calculée à l'affichage, jamais stockée: "Variation en %" n'a de sens que
  // comme pourcentage — un écart absolu envoyé par erreur sous cette
  // étiquette (comme c'était le cas ici) affiche un nombre qui n'est
  // manifestement pas un pourcentage.
  const calculateVariation = (yearN: string, yearN1: string) => {
    const n = parseFloat(yearN) || 0;
    const n1 = parseFloat(yearN1) || 0;
    if (n1 === 0) return "-";
    return (((n - n1) / n1) * 100).toFixed(0) + "%";
  };

  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "10") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Le backend (buildNoteRows) renvoie {label, yearN, yearN1} — mêmes
        // noms de champs que l'état interne.
        if (Array.isArray(noteData.valeursAEncaisser)) {
          setValeurs(
            noteData.valeursAEncaisser.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.label || valeurs[i]?.label || "",
              yearN: String(r.yearN ?? ""),
              yearN1: String(r.yearN1 ?? ""),
            }))
          );
        }
        if (noteData.totalBrut) {
          setTotalBrut({
            yearN: String(noteData.totalBrut.yearN ?? ""),
            yearN1: String(noteData.totalBrut.yearN1 ?? ""),
          });
        }
        if (Array.isArray(noteData.depreciations) && noteData.depreciations[0]) {
          setDepreciations([
            {
              id: "1",
              label: noteData.depreciations[0].label || depreciations[0].label,
              yearN: String(noteData.depreciations[0].yearN ?? ""),
              yearN1: String(noteData.depreciations[0].yearN1 ?? ""),
            },
          ]);
        }
        if (noteData.totalNet) {
          setTotalNet({
            yearN: String(noteData.totalNet.yearN ?? ""),
            yearN1: String(noteData.totalNet.yearN1 ?? ""),
          });
        }
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading note data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Mêmes noms de champs qu'à la génération, pour un rechargement fidèle.
      const noteData = {
        entete,
        valeursAEncaisser: valeurs.map((r) => ({
          id: r.id,
          label: r.label,
          yearN: parseFloat(r.yearN) || 0,
          yearN1: parseFloat(r.yearN1) || 0,
        })),
        totalBrut: {
          yearN: parseFloat(totalBrut.yearN) || 0,
          yearN1: parseFloat(totalBrut.yearN1) || 0,
        },
        depreciations: depreciations.map((r) => ({
          id: r.id,
          label: r.label,
          yearN: parseFloat(r.yearN) || 0,
          yearN1: parseFloat(r.yearN1) || 0,
        })),
        totalNet: {
          yearN: parseFloat(totalNet.yearN) || 0,
          yearN1: parseFloat(totalNet.yearN1) || 0,
        },
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "10", noteData as any);
      if (success) {
        alert("Données sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving note data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValeurChange = (id: string, field: keyof ValeurRow, value: string) => {
    setValeurs((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDepreciationChange = (id: string, field: keyof ValeurRow, value: string) => {
    setDepreciations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
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
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_10_valeurs_a_encaisser.pdf");
      } catch (error) {
        console.error("Erreur PDF:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = "",
    readOnly?: boolean
  ) => {
    return isEditing && !readOnly ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span>
        {value === "" || value === null || value === undefined
          ? ""
          : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </span>
    );
  };

  // Comme renderEditableCell, mais pour les cases pilotées par le catalogue
  // de formules (note10.valeursAEncaisser / note10.depreciations): verrouillée
  // en édition et cliquable dès que le catalogue expose une formule.
  const renderFormulaCell = (
    value: string,
    onChange: (val: string) => void,
    formulaKey: string,
    label: string,
    className: string = ""
  ) => {
    return isEditing && !hasFormula(formulaKey) ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <FormulaValue formulaKey={formulaKey} label={label}>
        {value === "" || value === null || value === undefined
          ? ""
          : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </FormulaValue>
    );
  };

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 10 - Valeurs à Encaisser
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Standardization en cours...
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
            onClick={() => setIsEditing(true)}
            title="Éditer"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil size={18} />
          </button>
          ) : (
            <>
              <button
            onClick={saveNoteData}
            disabled={isSaving}
            title="Sauvegarder"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className={isSaving ? "animate-pulse" : ""} />
          </button>
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
            </>
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
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
          }`}
      >
        {isEditing && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center">
            <div className="text-orange-800 text-[11px]">
              <span className="font-bold">Attention :</span> Certains champs de
              l'en-tête sont vides.
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-orange-800 underline font-bold"
              >
                Mettre à jour l'en-tête
              </button>
            )}
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            23
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) =>
                  setEntete({ ...entete, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.entityName || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={entete.fiscalYear}
                onChange={(e) =>
                  setEntete({ ...entete, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">
                {entete.fiscalYear || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={entete.idNumber}
                onChange={(e) =>
                  setEntete({ ...entete, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.idNumber || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={entete.duration}
                onChange={(e) =>
                  setEntete({ ...entete, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {entete.duration || "-"}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-3 text-center font-bold mb-6 text-[12px]">
          <div>NOTE 10</div>
          <div>VALEURS A ENCAISSER</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[11px] mb-8">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-left w-[55%]">
                Libellés
              </th>
              <th className="border border-gray-600 p-1 text-center w-[15%]">
                Année N
              </th>
              <th className="border border-gray-600 p-1 text-center w-[15%]">
                Année N-1
              </th>
              <th className="border border-gray-600 p-1 text-center w-[15%]">
                Variation
                <br />
                en %
              </th>
            </tr>
          </thead>
          <tbody>
            {valeurs.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-2 pl-4 font-medium">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderFormulaCell(
                    row.yearN,
                    (val) => handleValeurChange(row.id, "yearN", val),
                    `note10.valeursAEncaisser.${row.id}`,
                    row.label,
                    "pr-2"
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderFormulaCell(
                    row.yearN1,
                    (val) => handleValeurChange(row.id, "yearN1", val),
                    `note10.valeursAEncaisser.${row.id}`,
                    row.label,
                    "pr-2"
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-center">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT VALEURS A ENCAISSER */}
            <tr className="bg-[#e6e6e6] font-bold">
              <td className="border border-gray-600 p-2 pl-4">
                TOTAL BRUT VALEURS A ENCAISSER
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalBrut.yearN, (val) =>
                  setTotalBrut({ ...totalBrut, yearN: val }), "", true
                )}
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalBrut.yearN1, (val) =>
                  setTotalBrut({ ...totalBrut, yearN1: val }), "", true
                )}
              </td>
              <td className="border border-gray-600 p-1 text-center">
                {calculateVariation(totalBrut.yearN, totalBrut.yearN1)}
              </td>
            </tr>

            {/* Dépréciations */}
            {depreciations.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-2 pl-4 italic">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right pr-2">
                  {renderFormulaCell(
                    row.yearN,
                    (val) => handleDepreciationChange(row.id, "yearN", val),
                    `note10.depreciations.${row.id}`,
                    row.label
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right pr-2">
                  {renderFormulaCell(
                    row.yearN1,
                    (val) => handleDepreciationChange(row.id, "yearN1", val),
                    `note10.depreciations.${row.id}`,
                    row.label
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-center">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL NET DE DEPRECIATION */}
            <tr className="bg-[#e6e6e6] font-bold">
              <td className="border border-gray-600 p-2 pl-4">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalNet.yearN, (val) =>
                  setTotalNet({ ...totalNet, yearN: val }), "", true
                )}
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalNet.yearN1, (val) =>
                  setTotalNet({ ...totalNet, yearN1: val }), "", true
                )}
              </td>
              <td className="border border-gray-600 p-1 text-center">
                {calculateVariation(totalNet.yearN, totalNet.yearN1)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-gray-500" />
            <span className="font-bold text-gray-700">Commentaire :</span>
          </div>
          <div className={`p-4 rounded border-2 transition-all ${isEditing ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-gray-50"
            }`}>
            {isEditing ? (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 bg-transparent border-none focus:outline-none resize-none text-[11px]"
                placeholder="Saisir un commentaire..."
              />
            ) : (
              <div className="min-h-[60px] text-[11px] text-gray-700 whitespace-pre-wrap">
                {comment || "Aucun commentaire"}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Note10;



