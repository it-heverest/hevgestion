import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";
import { dsfService } from "../../services/dsf.service";

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface ExerciceNRow {
  compte: string;
  montant: number;
}

interface ChargeCategory {
  key: string;
  label: string;
  montantGlobal: number;
  dureeEtalement: string;
  exerciceNRows: ExerciceNRow[];
  totalExerciceN1: number;
  totalExerciceN2: number;
  totalExerciceN3: number;
  totalExerciceN4: number;
}

// Comptes indicatifs pré-remplis dans le modèle Excel (60..., 61..., 62...,
// 63..., ...) — de simples repères de plan comptable, modifiables par
// l'utilisateur, pas des valeurs figées.
const DEFAULT_ROWS = (): ExerciceNRow[] => [
  { compte: "60...", montant: 0 },
  { compte: "61...", montant: 0 },
  { compte: "62...", montant: 0 },
  { compte: "63...", montant: 0 },
  { compte: "...", montant: 0 },
];

const EMPTY_CATEGORIES: ChargeCategory[] = [
  { key: "fraisEtablissement", label: "Frais d'établissement", montantGlobal: 0, dureeEtalement: "", exerciceNRows: DEFAULT_ROWS(), totalExerciceN1: 0, totalExerciceN2: 0, totalExerciceN3: 0, totalExerciceN4: 0 },
  { key: "chargesARepartir", label: "Charges à répartir sur plusieurs exercice", montantGlobal: 0, dureeEtalement: "", exerciceNRows: DEFAULT_ROWS(), totalExerciceN1: 0, totalExerciceN2: 0, totalExerciceN3: 0, totalExerciceN4: 0 },
  { key: "primesRemboursement", label: "Primes de remboursement des obligations", montantGlobal: 0, dureeEtalement: "", exerciceNRows: DEFAULT_ROWS(), totalExerciceN1: 0, totalExerciceN2: 0, totalExerciceN3: 0, totalExerciceN4: 0 },
];

const Note3F: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder, selectedClient } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  const [categories, setCategories] = useState<ChargeCategory[]>(EMPTY_CATEGORIES);

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  useEffect(() => {
    if (selectedClient && selectedFolder && !headerInfo.entityName) {
      setHeaderInfo({
        entityName: selectedClient.name || "",
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: "12",
      });
    }
  }, [selectedClient, selectedFolder]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3F")) as any;
      if (!noteData) return;

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      if (Array.isArray(noteData.categories)) {
        setCategories(
          noteData.categories.map((c: any, i: number) => ({
            key: c.key || EMPTY_CATEGORIES[i]?.key || `cat${i}`,
            label: c.label || EMPTY_CATEGORIES[i]?.label || "",
            montantGlobal: Number(c.montantGlobal) || 0,
            dureeEtalement: c.dureeEtalement || "",
            exerciceNRows: Array.isArray(c.exerciceNRows)
              ? c.exerciceNRows.map((r: any) => ({
                  compte: r.compte || "",
                  montant: Number(r.montant) || 0,
                }))
              : [],
            totalExerciceN1: Number(c.totalExerciceN1) || 0,
            totalExerciceN2: Number(c.totalExerciceN2) || 0,
            totalExerciceN3: Number(c.totalExerciceN3) || 0,
            totalExerciceN4: Number(c.totalExerciceN4) || 0,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading Note 3F:", error);
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
        categories,
      };

      await notesService.saveNoteData(folderId, "3F", noteData as any);
      alert("Données sauvegardées avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving Note 3F:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Calculs ---

  const rowCount = Math.max(0, ...categories.map((c) => c.exerciceNRows.length));

  const totalExerciceN = (c: ChargeCategory) =>
    c.exerciceNRows.reduce((sum, r) => sum + (Number(r.montant) || 0), 0);

  const totalGeneral = (c: ChargeCategory) =>
    totalExerciceN(c) +
    c.totalExerciceN1 +
    c.totalExerciceN2 +
    c.totalExerciceN3 +
    c.totalExerciceN4;

  // --- Handlers ---

  const updateCategory = (key: string, patch: Partial<ChargeCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    );
  };

  const updateExerciceNRow = (
    key: string,
    index: number,
    field: keyof ExerciceNRow,
    value: string,
  ) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.key !== key) return c;
        const rows = [...c.exerciceNRows];
        rows[index] = {
          ...rows[index],
          [field]: field === "montant" ? Number(value) || 0 : value,
        };
        return { ...c, exerciceNRows: rows };
      }),
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
        try {
          const canvas = await html2canvas(reportRef.current!, { scale: 2 });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("note_3f_charges.pdf");
        } catch (error) {
          console.error("Erreur lors de la génération du PDF:", error);
          alert("Erreur lors de la génération du PDF");
        } finally {
          setIsEditing(wasEditing);
        }
      }, 100);
    }
  };

  const isHeaderIncomplete =
    !headerInfo.entityName ||
    !headerInfo.fiscalYear ||
    !headerInfo.idNumber ||
    !headerInfo.duration;

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

  if (!folderId || !selectedFolder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Aucun dossier sélectionné
          </h2>
          <p className="text-gray-600">
            Veuillez sélectionner un dossier pour voir la Note 3F.
          </p>
          {selectedClient && (
            <p className="text-sm text-gray-500 mt-2">
              Client: {selectedClient.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Champ texte simple (compte, durée...)
  const editableText = (value: string, onChange: (v: string) => void, className = "") =>
    isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span>{value}</span>
    );

  // Champ montant
  const editableAmount = (value: number, onChange: (v: string) => void) =>
    isEditing ? (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-1 text-right bg-orange-50 border-none focus:outline-none"
      />
    ) : (
      <span>{value.toLocaleString("fr-FR").replace(/\u202F/g, " ")}</span>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 3F - Étalement des Charges
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
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
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-8 border-2 ${
          isEditing ? "border-orange-500" : "border-gray-200"
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

        {/* En-tête du document */}
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            16
          </span>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4 text-[10px]">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.entityName || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">
                {headerInfo.fiscalYear || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.idNumber || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {headerInfo.duration || "-"}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold mb-0">
          <div>NOTE 3F</div>
          <div>TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES</div>
        </div>

        {/*
          7 colonnes de contenu au total sur chaque ligne (Libellés + 3
          catégories × [Comptes, Montants]) — vérifié explicitement pour
          chaque ligne afin d'éviter la colonne fantôme déjà rencontrée sur
          les notes 3B/3D quand les colSpan d'un tableau HTML ne totalisent
          pas la même largeur sur chaque ligne.
        */}
        <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-2 text-left font-bold w-[22%]">
                Libellés
              </th>
              {categories.map((c) => (
                <th key={c.key} colSpan={2} className="border border-gray-400 p-2 font-bold w-[26%]">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Montant global à étaler */}
            <tr>
              <td className="border border-gray-400 p-1 font-bold">
                Montant global à étaler au 1er janvier
              </td>
              {categories.map((c) => (
                <td key={c.key} colSpan={2} className="border border-gray-400 p-1 text-center">
                  {editableAmount(c.montantGlobal, (v) =>
                    updateCategory(c.key, { montantGlobal: Number(v) || 0 }),
                  )}
                </td>
              ))}
            </tr>

            {/* Durée d'étalement retenue */}
            <tr className="bg-gray-100">
              <td className="border border-gray-400 p-1 font-bold">
                Durée d'étalement retenue
              </td>
              {categories.map((c) => (
                <td key={c.key} colSpan={2} className="border border-gray-400 p-1 text-center">
                  {editableText(c.dureeEtalement, (v) =>
                    updateCategory(c.key, { dureeEtalement: v }),
                    "text-center",
                  )}
                </td>
              ))}
            </tr>

            {/* Sous-en-tête Comptes/Montants, juste avant le détail par compte */}
            <tr className="bg-gray-300">
              <td className="border border-gray-400 p-1" />
              {categories.map((c) => (
                <React.Fragment key={c.key}>
                  <td className="border border-gray-400 p-1 font-bold text-center">Comptes</td>
                  <td className="border border-gray-400 p-1 font-bold text-center">Montants</td>
                </React.Fragment>
              ))}
            </tr>

            {/* Exercice N: détail par compte, une ligne par catégorie */}
            {Array.from({ length: rowCount }).map((_, i) => (
              <tr key={`ex-n-${i}`}>
                {i === 0 && (
                  <td rowSpan={rowCount} className="border border-gray-400 p-1 font-bold align-top">
                    Exercice N
                  </td>
                )}
                {categories.map((c) => {
                  const row = c.exerciceNRows[i];
                  if (!row) return <React.Fragment key={c.key}><td className="border border-gray-400 p-1" /><td className="border border-gray-400 p-1" /></React.Fragment>;
                  return (
                    <React.Fragment key={c.key}>
                      <td className="border border-gray-400 p-1 text-center">
                        {editableText(row.compte, (v) => updateExerciceNRow(c.key, i, "compte", v), "text-center")}
                      </td>
                      <td className="border border-gray-400 p-1 text-right">
                        {editableAmount(row.montant, (v) => updateExerciceNRow(c.key, i, "montant", v))}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}

            {/* Total exercice N (calculé, non éditable) */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1">Total exercice N</td>
              {categories.map((c) => (
                <td key={c.key} colSpan={2} className="border border-gray-400 p-1 text-right">
                  {totalExerciceN(c).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
                </td>
              ))}
            </tr>

            {/* Total exercice N-1 à N-4 */}
            {(["totalExerciceN1", "totalExerciceN2", "totalExerciceN3", "totalExerciceN4"] as const).map(
              (field, idx) => (
                <tr key={field} className="font-bold">
                  <td className="border border-gray-400 p-1">Total exercice N-{idx + 1}</td>
                  {categories.map((c) => (
                    <td key={c.key} colSpan={2} className="border border-gray-400 p-1 text-right">
                      {editableAmount(c[field], (v) =>
                        updateCategory(c.key, { [field]: Number(v) || 0 } as Partial<ChargeCategory>),
                      )}
                    </td>
                  ))}
                </tr>
              ),
            )}

            {/* TOTAL GENERAL (calculé, non éditable) */}
            <tr className="font-bold">
              <td className="border border-gray-400 p-2">TOTAL GENERAL</td>
              {categories.map((c) => (
                <td key={c.key} colSpan={2} className="border border-gray-400 p-2 text-right">
                  {totalGeneral(c).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note3F;
