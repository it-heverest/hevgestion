import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

// --- Types et Interfaces ---

interface RowData {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  isTotal?: boolean;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note5: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedFolder } = useApp();
  const { hasFormula } = useFormulaPanel();

  // État pour l'en-tête (Standardized)
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  // État pour le commentaire
  const [comment, setComment] = useState("");

  // État pour le Tableau 1 (Actifs)
  const [assetsData, setAssetsData] = useState<RowData[]>([
    {
      id: "1",
      label: "Créances sur cessions d'immobilisations",
      yearN: "",
      yearN1: "",
    },
    {
      id: "2",
      label: "Autres créances hors activités ordinaires",
      yearN: "",
      yearN1: "",
    },
    { id: "3", label: "TOTAL BRUT", yearN: "", yearN1: "", isTotal: true },
    { id: "4", label: "Dépréciation des créances HAO", yearN: "", yearN1: "" },
    {
      id: "5",
      label: "TOTAL NET DE DEPRECIATION",
      yearN: "",
      yearN1: "",
      isTotal: true,
    },
  ]);

  // État pour le Tableau 2 (Dettes)
  const [liabilitiesData, setLiabilitiesData] = useState<RowData[]>([
    { id: "6", label: "Fournisseurs d'investissements", yearN: "", yearN1: "" },
    {
      id: "7",
      label: "Fournisseurs d'investissements effets à payer",
      yearN: "",
      yearN1: "",
    },
    {
      id: "8",
      label: "Versements restant à effectuer sur titres",
      yearN: "",
      yearN1: "",
    },
    {
      id: "9",
      label: "Autres dettes hors activités ordinaires",
      yearN: "",
      yearN1: "",
    },
  ]);

  const folderId = selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  // generateNote5 (backend) construit `assetsData`/`actifCirculantHAO` (même
  // données, buildNoteRows) et `liabilitiesData`/`dettesHAO` — toujours avec
  // les clés yearN/yearN1, jamais anneeN/anneeN1 malgré les noms de champs à
  // consonance française. `actifCirculantHAO`/`dettesHAO` sont toujours
  // présents dans une note fraîchement générée: les préférer sans passer par
  // un parseur anneeN qui ne correspondrait à aucune donnée réelle.
  const coerceRows = (rows: any[] | undefined, defaultRows: RowData[]): RowData[] =>
    !rows || rows.length === 0
      ? defaultRows
      : rows.map((r, i) => ({
          id: r.id ?? String(i + 1),
          label: r.label ?? defaultRows[i]?.label ?? "",
          yearN: r.yearN != null ? String(r.yearN) : "",
          yearN1: r.yearN1 != null ? String(r.yearN1) : "",
          isTotal: defaultRows[i]?.isTotal,
        }));

  const toBackendRows = (rows: RowData[]) =>
    rows.map((r) => ({
      id: r.id,
      label: r.label,
      yearN: parseFloat(r.yearN) || 0,
      yearN1: parseFloat(r.yearN1) || 0,
    }));

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "5")) as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        setAssetsData(
          coerceRows(noteData.assetsData ?? noteData.actifCirculantHAO, assetsData),
        );
        setLiabilitiesData(
          coerceRows(noteData.liabilitiesData ?? noteData.dettesHAO, liabilitiesData),
        );
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading Note 5 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      const noteData = {
        entete,
        assetsData: toBackendRows(assetsData),
        actifCirculantHAO: toBackendRows(assetsData),
        liabilitiesData: toBackendRows(liabilitiesData),
        dettesHAO: toBackendRows(liabilitiesData),
        comment,
      };
      const success = await notesService.saveNoteData(
        folderId,
        "5",
        noteData as any,
      );
      if (success) {
        alert("Données Note 5 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 5 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 5");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    id: string,
    field: "yearN" | "yearN1",
    value: string,
    isAssetTable: boolean,
  ) => {
    const updateFn = isAssetTable ? setAssetsData : setLiabilitiesData;
    updateFn((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
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

  const handleDownloadPDF = async () => {
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
        pdf.save("note_5_hao.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 5:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    formulaKey: string,
    label: string,
    className: string = "",
  ) => {
    return isEditing && !hasFormula(formulaKey) ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <FormulaValue formulaKey={formulaKey} label={label}>
        <span className="px-1">
          {value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
        </span>
      </FormulaValue>
    );
  };

  const calculateVariation = (n: string | number, n1: string | number) => {
    const valN =
      typeof n === "string" ? parseFloat(n.replace(/\s/g, "")) || 0 : n;
    const valN1 =
      typeof n1 === "string" ? parseFloat(n1.replace(/\s/g, "")) || 0 : n1;
    if (valN1 === 0) return "-";
    const variation = ((valN - valN1) / valN1) * 100;
    return variation.toFixed(0) + "%";
  };

  const isHeaderIncomplete =
    !entete.entityName ||
    !entete.fiscalYear ||
    !entete.idNumber ||
    !entete.duration;

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
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 5 - Actif Circulant HAO
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
            onClick={handleDownloadPDF}
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
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-8 border-2 ${
          isEditing ? "border-orange-500" : "border-gray-200"
        }`}
      >
        {isEditing && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-orange-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center text-sm">
            <div className="text-orange-800">
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
            18
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

        {/* Titre du Tableau */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-2 text-center font-bold mb-4 text-[12px]">
          NOTE 5 <br /> ACTIF CIRCULANT HAO
        </div>

        {/* Tableau 1 : Actifs */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-center w-[40%]">
                Libellés
              </th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">
                Année N
              </th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">
                Année N-1
              </th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            {assetsData.map((row) => (
              <tr
                key={row.id}
                className={
                  row.isTotal ? "bg-[#e6e6e6] font-bold" : "hover:bg-gray-50"
                }
              >
                <td className="border border-gray-600 p-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) =>
                    handleInputChange(row.id, "yearN", val, true),
                    `note5.assetsData.${row.id}`,
                    row.label,
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleInputChange(row.id, "yearN1", val, true),
                    `note5.assetsData.${row.id}`,
                    row.label,
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-center bg-gray-50">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border border-gray-600 p-3 mb-4 bg-white min-h-[120px]">
          <div className="font-bold underline mb-2">Commentaire :</div>
          <ul className="list-disc pl-5 italic text-[10px] text-gray-600 mb-3">
            <li>Commenter toute variation significative.</li>
            <li>
              Dépréciation : indiquer les événements et les circonstances qui
              ont motivé la dépréciation ou la reprise
            </li>
          </ul>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-orange-300 bg-orange-50 text-[11px] focus:outline-none resize-none"
              placeholder="Saisir votre commentaire ici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-[11px] min-h-[2rem]">
              {comment || "Aucun commentaire."}
            </div>
          )}
        </div>

        {/* Tableau 2 : Dettes */}
        <div className="bg-[#d9d9d9] border border-gray-600 py-1 text-center font-bold mb-0 text-[11px]">
          DETTES HAO
        </div>
        <table className="w-full border-collapse border border-gray-600 text-[10px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-center w-[40%]">
                Libellés
              </th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">
                Année N
              </th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">
                Année N-1
              </th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            {liabilitiesData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) =>
                    handleInputChange(row.id, "yearN", val, false),
                    `note5.liabilitiesData.${row.id}`,
                    row.label,
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleInputChange(row.id, "yearN1", val, false),
                    `note5.liabilitiesData.${row.id}`,
                    row.label,
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-center bg-gray-50">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note5;
