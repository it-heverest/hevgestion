import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";
import { dsfService } from "../../services/dsf.service";

// --- Interfaces ---

interface ElementRow {
  id: string;
  label: string;
  historicalCost: number; // Montants coûts historiques
  additionalAmortization: number; // Amortissements supplémentaires
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note3E: React.FC = () => {
  const { selectedFolder, selectedClient } = useApp();
  const folderId = selectedFolder?.id;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  // Les 4 zones de texte libre du formulaire
  const [natureReevaluations, setNatureReevaluations] = useState("");
  const [methodeReevaluation, setMethodeReevaluation] = useState("");
  const [traitementFiscal, setTraitementFiscal] = useState("");
  const [montantEcartCapital, setMontantEcartCapital] = useState("");

  const [elementsData, setElementsData] = useState<ElementRow[]>([]);

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3E")) as any;

      if (!noteData) {
        console.log("No saved data found for Note 3E");
        return;
      }

      console.log("✅ Note 3E data loaded successfully", noteData);

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      // Aligné sur Note3EData (notes.service.ts) — utilisé aussi par le
      // pipeline d'import DSF (transformNote3EData), pour que les données
      // importées depuis un Excel DSF apparaissent bien dans ces champs.
      const infoGenerales = noteData.informationsGenerales || [];
      setNatureReevaluations(infoGenerales[0]?.valeur || "");
      setMethodeReevaluation(infoGenerales[1]?.valeur || "");
      setTraitementFiscal(infoGenerales[2]?.valeur || "");
      setMontantEcartCapital(infoGenerales[3]?.valeur || "");

      const data = noteData.elementsReevalues || [];
      setElementsData(
        data.map((row: any, i: number) => ({
          id: String(i + 1),
          label: row.element || "",
          historicalCost: Number(row.montantCoutsHistoriques) || 0,
          additionalAmortization: Number(row.amortissementsSupplementaires) || 0,
        })),
      );
    } catch (error) {
      console.error("❌ Error loading Note 3E data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Save data to backend
  const saveNoteData = async () => {
    if (!folderId) {
      alert("Veuillez sélectionner un dossier");
      return;
    }

    try {
      setIsSaving(true);

      const noteData = {
        entete: headerInfo,
        informationsGenerales: [
          { nature: "Nature et date des réévaluations", valeur: natureReevaluations },
          { nature: "Méthode de réévaluation utilisée", valeur: methodeReevaluation },
          {
            nature:
              "Traitement fiscal de l'écart de réévaluation et des amortissements supplémentaires",
            valeur: traitementFiscal,
          },
          { nature: "Montant de l'écart incorporé au capital", valeur: montantEcartCapital },
        ],
        elementsReevalues: elementsData.map((row) => ({
          element: row.label,
          montantCoutsHistoriques: row.historicalCost,
          amortissementsSupplementaires: row.additionalAmortization,
        })),
      };

      console.log("📤 Sending Note 3E data:", noteData);

      const saved = await notesService.saveNoteData(folderId, "3E", noteData as any);

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving Note 3E:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Load data when folder changes
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  // Auto-populate header
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

  // --- Handlers tableau ---

  const handleElementChange = (
    id: string,
    field: keyof Omit<ElementRow, "id">,
    value: string,
  ) => {
    setElementsData((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "label" ? value : Number(value) || 0,
            }
          : row,
      ),
    );
  };

  const addElementRow = () => {
    setElementsData((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        label: "",
        historicalCost: 0,
        additionalAmortization: 0,
      },
    ]);
  };

  const deleteElementRow = (id: string) => {
    setElementsData((prev) => prev.filter((row) => row.id !== id));
  };

  // --- Actions ---

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

      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("rapport_note_3E_reevaluations.pdf");

        setIsEditing(wasEditing);
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
            Veuillez sélectionner un dossier pour voir la Note 3E.
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

  // Helper pour une section "label + zone de texte libre"
  const renderTextSection = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    heightClass: string,
  ) => (
    <div className="mb-0">
      <div className="font-bold p-1 border border-gray-400 border-b-0">
        {label} :
      </div>
      <div className={`border border-gray-400 p-2 bg-white ${heightClass}`}>
        {isEditing ? (
          <textarea
            className="w-full h-full p-1 bg-orange-50 focus:outline-none resize-none text-xs font-sans"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Saisir le texte ici..."
          />
        ) : (
          <div className="whitespace-pre-wrap text-xs h-full font-sans">
            {value}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 3E - Informations sur les Réévaluations
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
        className={`max-w-[297mm] mx-auto bg-white shadow-2xl p-8 border-2 ${
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

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            15
          </span>
        </div>

        {/* En-tête du document */}
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
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold text-xs mb-3">
          NOTE 3E
          <br />
          INFORMATIONS SUR LES RÉÉVALUATIONS EFFECTUÉES PAR L'ENTITÉ
        </div>

        {/* Section 1 - Nature et date des réévaluations */}
        {renderTextSection(
          "Nature et date des réévaluations",
          natureReevaluations,
          setNatureReevaluations,
          "min-h-[70px]",
        )}

        {/* Tableau des éléments réévalués */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 p-1 w-[44%] font-bold text-black">
                  Éléments réévalués par postes du bilan
                </th>
                <th className="border border-gray-400 p-1 w-[27%] font-bold text-black">
                  Montants coûts historiques
                </th>
                <th className="border border-gray-400 p-1 w-[27%] font-bold text-black">
                  Amortissements supplémentaires
                </th>
                {isEditing && (
                  <th className="border border-gray-400 p-1 w-[2%]"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {elementsData.map((row) => (
                <tr key={row.id}>
                  <td className="border border-gray-400 p-1">
                    {isEditing ? (
                      <input
                        value={row.label}
                        onChange={(e) =>
                          handleElementChange(row.id, "label", e.target.value)
                        }
                        className="w-full bg-orange-50 px-1 focus:outline-none"
                        placeholder="Libellé..."
                      />
                    ) : (
                      row.label
                    )}
                  </td>
                  <td className="border border-gray-400 p-1 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={row.historicalCost}
                        onChange={(e) =>
                          handleElementChange(
                            row.id,
                            "historicalCost",
                            e.target.value,
                          )
                        }
                        className="w-full text-right bg-orange-50 px-1 focus:outline-none"
                      />
                    ) : (
                      row.historicalCost.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                    )}
                  </td>
                  <td className="border border-gray-400 p-1 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={row.additionalAmortization}
                        onChange={(e) =>
                          handleElementChange(
                            row.id,
                            "additionalAmortization",
                            e.target.value,
                          )
                        }
                        className="w-full text-right bg-orange-50 px-1 focus:outline-none"
                      />
                    ) : (
                      row.additionalAmortization.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                    )}
                  </td>
                  {isEditing && (
                    <td className="border border-gray-400 p-1 text-center">
                      <button
                        onClick={() => deleteElementRow(row.id)}
                        className="text-red-500 hover:text-red-700 font-bold leading-none"
                        title="Supprimer cette ligne"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {elementsData.length === 0 && !isEditing && (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-gray-400 p-1 h-6"
                  ></td>
                </tr>
              )}
            </tbody>
          </table>
          {isEditing && (
            <button
              onClick={addElementRow}
              className="mt-1 text-orange-600 hover:text-orange-800 text-[10px] font-medium"
            >
              + Ajouter une ligne
            </button>
          )}
        </div>

        {/* Section 2 - Méthode de réévaluation utilisée */}
        <div className="mt-3">
          {renderTextSection(
            "Méthode de réévaluation utilisée",
            methodeReevaluation,
            setMethodeReevaluation,
            "min-h-[70px]",
          )}
        </div>

        {/* Section 3 - Traitement fiscal */}
        <div className="mt-3">
          {renderTextSection(
            "Traitement fiscal de l'écart de réévaluation et des amortissements supplémentaires",
            traitementFiscal,
            setTraitementFiscal,
            "min-h-[90px]",
          )}
        </div>

        {/* Section 4 - Montant de l'écart incorporé au capital */}
        <div className="mt-3">
          {renderTextSection(
            "Montant de l'écart incorporé au capital",
            montantEcartCapital,
            setMontantEcartCapital,
            "min-h-[50px]",
          )}
        </div>

        {/* Footer Numéro de page simulé */}
        <div className="mt-auto text-center text-sm pt-6">
          <span className="font-bold">Feuille : </span> 15
        </div>
      </div>
    </div>
  );
};

export default Note3E;
