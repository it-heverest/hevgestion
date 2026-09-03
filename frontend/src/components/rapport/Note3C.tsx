import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";

// --- Interfaces ---

interface AmortizationRow {
  id: string;
  label: string;
  isSubHeader?: boolean;
  openingCumulative: number;
  augmentations: number;
  diminutions: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const AmortizationReport: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(
    "Les amortissements sont calculés selon la méthode linéaire sur la durée d'utilisation estimée des immobilisations.",
  );

  // État de l'en-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  const { selectedFolder, selectedClient } = useApp();
  const folderId = selectedFolder?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État des données
  const [amortizationData, setAmortizationData] = useState<AmortizationRow[]>(
    [],
  );

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) {
      console.warn("No folderId provided");
      return;
    }

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3C")) as any;

      if (!noteData) {
        console.log("No saved data found for Note 3C");
        return;
      }

      console.log("✅ Note 3C data loaded successfully", noteData);

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      const buildSection = (
        data: any[],
        prefix: string,
        headerLabel: string,
      ): AmortizationRow[] => {
        if (!data || data.length === 0) return [];
        const rows: AmortizationRow[] = [];
        if (headerLabel) {
          rows.push({
            id: `${prefix}_HEADER`,
            label: headerLabel,
            isSubHeader: true,
            openingCumulative: 0,
            augmentations: 0,
            diminutions: 0,
          });
        }
        data.forEach((row: any, i: number) => {
          rows.push({
            id: `${prefix}_${i + 1}`,
            label: row.libelle || "",
            openingCumulative: Number(row.amortissementsCumulesOuverture) || 0,
            augmentations: Number(row.augmentationsDotationsExercice) || 0,
            diminutions: Number(row.diminutionsSorties) || 0,
          });
        });
        return rows;
      };

      const newData = [
        ...buildSection(
          noteData.immobilisationsIncorporelles,
          "I",
          "IMMOBILISATIONS INCORPORELLES",
        ),
        ...buildSection(
          noteData.immobilisationsCorporelles,
          "C",
          "IMMOBILISATIONS CORPORELLES",
        ),
      ];

      setAmortizationData(newData);
      if (noteData.comment) {
        setComment(noteData.comment);
      }
    } catch (error) {
      console.error("❌ Error loading Note 3C data:", error);
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

      const toApiFormat = (row: AmortizationRow) => ({
        libelle: row.label,
        amortissementsCumulesOuverture: row.openingCumulative,
        augmentationsDotationsExercice: row.augmentations,
        diminutionsSorties: row.diminutions,
        cumulAmortissementsCloture: calculateClosingCumulative(row),
      });

      const extractSection = (prefix: string) =>
        amortizationData.filter(
          (r) => r.id.startsWith(`${prefix}_`) && !r.isSubHeader,
        );

      const noteData = {
        entete: headerInfo,
        comment,
        immobilisationsIncorporelles: extractSection("I").map(toApiFormat),
        immobilisationsCorporelles: extractSection("C").map(toApiFormat),
      };

      console.log("📤 Sending Note 3C data:", noteData);

      const saved = await notesService.saveNoteData(
        folderId,
        "3C",
        noteData as any,
      );

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving Note 3C:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Load data when folder changes
  React.useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  // Auto-populate header
  React.useEffect(() => {
    if (selectedClient && selectedFolder && !headerInfo.entityName) {
      setHeaderInfo({
        entityName: selectedClient.name || "",
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: "12",
      });
    }
  }, [selectedClient, selectedFolder]);

  // --- Fonctions de Calcul ---

  const calculateClosingCumulative = (row: AmortizationRow): number => {
    return (
      Number(row.openingCumulative) +
      Number(row.augmentations) -
      Number(row.diminutions)
    );
  };

  const calculateSectionTotal = (
    section: AmortizationRow[],
    field: keyof AmortizationRow,
  ): number => {
    return section.reduce((acc, row) => {
      if (!row.isSubHeader) {
        return acc + (Number(row[field]) || 0);
      }
      return acc;
    }, 0);
  };

  // Découpage des sections
  const incorporeal = amortizationData.filter(
    (row) => row.id.startsWith("I_") && !row.isSubHeader,
  );
  const corporeal = amortizationData.filter(
    (row) => row.id.startsWith("C_") && !row.isSubHeader,
  );

  // Calcul des totaux
  const incorporealOpening = calculateSectionTotal(
    incorporeal,
    "openingCumulative",
  );
  const incorporealAugmentations = calculateSectionTotal(
    incorporeal,
    "augmentations",
  );
  const incorporealDiminutions = calculateSectionTotal(
    incorporeal,
    "diminutions",
  );
  const incorporealClosing =
    incorporealOpening + incorporealAugmentations - incorporealDiminutions;

  const corporealOpening = calculateSectionTotal(
    corporeal,
    "openingCumulative",
  );
  const corporealAugmentations = calculateSectionTotal(
    corporeal,
    "augmentations",
  );
  const corporealDiminutions = calculateSectionTotal(corporeal, "diminutions");
  const corporealClosing =
    corporealOpening + corporealAugmentations - corporealDiminutions;

  const grandTotalOpening = incorporealOpening + corporealOpening;
  const grandTotalAugmentations =
    incorporealAugmentations + corporealAugmentations;
  const grandTotalDiminutions = incorporealDiminutions + corporealDiminutions;
  const grandTotalClosing =
    grandTotalOpening + grandTotalAugmentations - grandTotalDiminutions;

  // Handler pour la mise à jour des chiffres
  const handleValueChange = (
    id: string,
    field: keyof AmortizationRow,
    value: string,
  ) => {
    setAmortizationData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row,
      ),
    );
  };

  // --- Actions ---

  const handleDownloadPDF = async () => {
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
        pdf.save("rapport_note_3C_amortissements.pdf");

        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu des Lignes ---

  const renderRow = (row: AmortizationRow) => {
    const closing = calculateClosingCumulative(row);

    return (
      <tr key={row.id}>
        <td className="border border-gray-400 p-1 pl-4">{row.label}</td>
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={row.openingCumulative}
              onChange={(e) =>
                handleValueChange(row.id, "openingCumulative", e.target.value)
              }
              className="w-full text-right bg-orange-50 px-1 focus:outline-none border border-gray-300 rounded"
            />
          ) : (
            row.openingCumulative.toLocaleString("fr-FR")
          )}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={row.augmentations}
              onChange={(e) =>
                handleValueChange(row.id, "augmentations", e.target.value)
              }
              className="w-full text-right bg-orange-50 px-1 focus:outline-none border border-gray-300 rounded"
            />
          ) : (
            row.augmentations.toLocaleString("fr-FR")
          )}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={row.diminutions}
              onChange={(e) =>
                handleValueChange(row.id, "diminutions", e.target.value)
              }
              className="w-full text-right bg-orange-50 px-1 focus:outline-none border border-gray-300 rounded"
            />
          ) : (
            row.diminutions.toLocaleString("fr-FR")
          )}
        </td>
        <td className="border border-gray-400 p-1 text-right font-semibold bg-gray-50">
          {closing.toLocaleString("fr-FR")}
        </td>
      </tr>
    );
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
            Veuillez sélectionner un dossier pour voir la Note 3C.
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 3C - Immobilisation (Amortissements)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              <Pencil size={18} /> Éditer
            </button>
          ) : (
            <>
              <button
                onClick={saveNoteData}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {isSaving ? (
                  <>
                    <Save size={18} /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Sauvegarder
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
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

        {/* Numéro de page (en haut à droite) */}
        <div className="text-right font-bold text-sm mb-1">18</div>

        {/* En-tête informations */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4">
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
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-1 text-xs">
          NOTE 3C <br /> IMMOBILISATION (AMORTISSEMENTS)
        </div>

        {/* Tableau Principal */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400 text-[9px]">
            <thead>
              <tr className="bg-gray-300">
                <th
                  className="border border-gray-600 p-0 relative h-16"
                  style={{ width: "200px" }}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top right, transparent calc(50% - 1px), #4b5563 calc(50% - 1px), #4b5563 calc(50% + 1px), transparent calc(50% + 1px))",
                    }}
                  />
                  <span className="absolute top-0.5 right-1 text-[8px] font-bold text-black text-right leading-tight">
                    SITUATION ET MOUVEMENTS
                  </span>
                  <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-black">
                    RUBRIQUES
                  </span>
                </th>
                <th
                  className="border border-gray-600 p-1 text-center align-top"
                  style={{ width: "80px" }}
                >
                  <div className="font-bold">A</div>
                  <div className="text-[7px] leading-tight mt-1">
                    AMORTISSEMENTS CUMULES À L'OUVERTURE DE L'EXERCICE
                  </div>
                </th>
                <th
                  className="border border-gray-600 p-1 text-center align-top"
                  style={{ width: "80px" }}
                >
                  <div className="font-bold">B</div>
                  <div className="text-[7px] leading-tight mt-1">
                    AUGMENTATIONS :<br />
                    DOTATIONS DE L'EXERCICE
                  </div>
                </th>
                <th
                  className="border border-gray-600 p-1 text-center align-top"
                  style={{ width: "80px" }}
                >
                  <div className="font-bold">C</div>
                  <div className="text-[7px] leading-tight mt-1">
                    DIMINUTIONS :<br />
                    AMORTISSEMENTS RELATIFS AUX ÉLÉMENTS SORTIS DE L'ACTIF
                  </div>
                </th>
                <th
                  className="border border-gray-600 p-1 text-center align-top"
                  style={{ width: "80px" }}
                >
                  <div className="font-bold">D = A + B - C</div>
                  <div className="text-[7px] leading-tight mt-1">
                    CUMUL DES AMORTISSEMENTS À LA CLOTURE DE L'EXERCICE
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {amortizationData.filter((row) => !row.isSubHeader).map(renderRow)}
              <tr className="bg-gray-300 font-bold border-t-2 border-black">
                <td className="border border-gray-400 p-1 pl-2">
                  SOUS TOTAL : IMMOBILISATIONS INCORPORELLES
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {incorporealOpening.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {incorporealAugmentations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {incorporealDiminutions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {incorporealClosing.toLocaleString("fr-FR")}
                </td>
              </tr>
              <tr className="bg-gray-300 font-bold">
                <td className="border border-gray-400 p-1 pl-2">
                  SOUS TOTAL : IMMOBILISATIONS CORPORELLES
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {corporealOpening.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {corporealAugmentations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {corporealDiminutions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {corporealClosing.toLocaleString("fr-FR")}
                </td>
              </tr>
              <tr className="bg-gray-500 text-black font-bold border-t-2 border-black">
                <td className="border border-gray-600 p-1 text-center">
                  TOTAL GÉNÉRAL
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {grandTotalOpening.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {grandTotalAugmentations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {grandTotalDiminutions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-1 text-right font-bold">
                  {grandTotalClosing.toLocaleString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commentaires */}
        <div className="mt-4 border border-gray-400 p-3 bg-white">
          <div className="font-bold text-xs underline mb-2">Commentaires :</div>
          <div className="mt-1">
            {isEditing ? (
              <textarea
                className="w-full h-20 p-2 border border-orange-300 bg-orange-50 text-xs focus:outline-none resize-none"
                placeholder="Saisir vos commentaires ici..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            ) : (
              <div className="min-h-[4rem] text-xs whitespace-pre-wrap">
                {comment || "Aucun commentaire."}
              </div>
            )}
          </div>
          <div className="mt-2 text-[10px] text-gray-600 italic">
            <div className="font-semibold mb-1">Indiquer :</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Les modes d'amortissement utilisés</li>
              <li>Le calendrier et l'échéancier des amortissements</li>
            </ul>
          </div>
        </div>

        {/* Footer Numéro de page simulé */}
        <div className="mt-auto text-center text-sm pt-4">
          <span className="font-bold">Feuille : </span> 18
        </div>
      </div>
    </div>
  );
};

export default AmortizationReport;
