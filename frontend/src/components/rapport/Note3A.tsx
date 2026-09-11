import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { dsfConfigService, DSFConfig } from "../../services/dsf-config.service";
import {
  DSFCalculationService,
  ReportData,
} from "../../services/dsf-calculation.service";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { FormulaValue } from "./shared/FormulaValue";

// --- Interfaces ---

interface AssetMovementRow {
  id: string;
  label: string;
  isSubHeader?: boolean; // Pour les titres (Immobilisations Incorporelles)
  isTotal?: boolean; // Pour la ligne TOTAL GENERAL

  // Colonnes de mouvements
  openingGross: number; // Montant brut à l'ouverture de l'exercice
  acquisitions: number;
  transfersIn: number; // Virements de poste (Entrée)
  revaluation: number;
  disposals: number; // Cessions
  transfersOut: number; // Virements de poste (Sortie)
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note3A: React.FC = () => {
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");

  // État de l'en-tête (standard) - now with context integration
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  // Auto-populate header from context when available
  useEffect(() => {
    if (selectedClient && selectedFolder) {
      setHeaderInfo({
        entityName: selectedClient.name || "",
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: "12",
      });
    }
  }, [selectedClient, selectedFolder]);
  // État des données
  const [assetsData, setAssetsData] = useState<AssetMovementRow[]>([]);

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) {
      console.warn("No folderId provided");
      return;
    }

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3A")) as any;

      if (!noteData) {
        console.log("No saved data found for Note 3A");
        return;
      }

      console.log("✅ Note 3A data loaded successfully", noteData);

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      const buildSection = (data: any[], prefix: string, headerLabel: string, totalLabel: string): AssetMovementRow[] => {
        if (!data || data.length === 0) return [];
        const rows: AssetMovementRow[] = [];
        if (headerLabel) {
          rows.push({
            id: `${prefix}_HEADER`,
            label: headerLabel,
            isSubHeader: true,
            openingGross: 0, acquisitions: 0, transfersIn: 0, revaluation: 0, disposals: 0, transfersOut: 0
          });
        }
        data.forEach((row: any, i: number) => {
          rows.push({
            id: `${prefix}_${i + 1}`,
            label: row.libelle || "",
            openingGross: Number(row.montantBrutOuverture) || 0,
            acquisitions: Number(row.acquisitions) || 0,
            transfersIn: Number(row.virementsPosteAPoste) || 0,
            revaluation: Number(row.reevaluation) || 0,
            disposals: Number(row.cessions) || 0,
            transfersOut: Number(row.virementsSortie) || 0,
          });
        });
        if (totalLabel) {
          rows.push({
            id: `${prefix}_TOTAL`,
            label: totalLabel,
            isTotal: true,
            openingGross: 0, acquisitions: 0, transfersIn: 0, revaluation: 0, disposals: 0, transfersOut: 0
          });
        }
        return rows;
      };

      const newData = [
        ...buildSection(noteData.immobilisationsIncorporelles, "I", "IMMOBILISATIONS INCORPORELLES", "TOTAL I"),
        ...buildSection(noteData.immobilisationsCorporelles, "C", "IMMOBILISATIONS CORPORELLES", "TOTAL II"),
        ...buildSection(noteData.avancesAcomptes, "ADV", "AVANCES ET ACOMPTES VERSEES SUR IMMOBILISATIONS", "TOTAL III"),
        ...buildSection(noteData.immobilisationsFinancieres, "F", "IMMOBILISATIONS FINANCIÈRES", "TOTAL IV"),
        {
          id: "GRAND_TOTAL",
          label: "TOTAL GÉNÉRAL (I + II + III + IV)",
          isSubHeader: false,
          isTotal: true,
          openingGross: 0,
          acquisitions: 0,
          transfersIn: 0,
          revaluation: 0,
          disposals: 0,
          transfersOut: 0,
        }
      ];

      setAssetsData(newData);
      if (noteData.comment) {
        setComment(noteData.comment);
      }

    } catch (error) {
      console.error("❌ Error loading Note 3A data:", error);
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

      const toApiFormat = (row: AssetMovementRow) => ({
        libelle: row.label,
        montantBrutOuverture: row.openingGross,
        acquisitions: row.acquisitions,
        virementsPosteAPoste: row.transfersIn,
        reevaluation: row.revaluation,
        cessions: row.disposals,
        virementsSortie: row.transfersOut,
        montantBrutCloture: calculateClosingGross(row)
      });

      const extractSection = (prefix: string) =>
        assetsData.filter(r => r.id.startsWith(`${prefix}_`) && !r.isSubHeader && !r.isTotal);

      const noteData = {
        entete: headerInfo,
        comment,
        immobilisationsIncorporelles: extractSection("I").map(toApiFormat),
        immobilisationsCorporelles: extractSection("C").map(toApiFormat),
        avancesAcomptes: extractSection("ADV").map(toApiFormat),
        immobilisationsFinancieres: extractSection("F").map(toApiFormat),
      };

      console.log("📤 Sending Note 3A data:", noteData);

      const saved = await notesService.saveNoteData(
        folderId,
        "3A",
        noteData as any,
      );

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving Note 3A:", error);
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

  // Fonction de calcul de la Clôture
  const calculateClosingGross = (row: AssetMovementRow): number => {
    return (
      Number(row.openingGross) +
      Number(row.acquisitions) +
      Number(row.transfersIn) +
      Number(row.revaluation) -
      Number(row.disposals) -
      Number(row.transfersOut)
    );
  };

  // Fonction de Somme pour une colonne
  const calculateColumnSum = (
    data: AssetMovementRow[],
    field: keyof AssetMovementRow,
    excludeTotals: boolean = true,
  ): number => {
    return data.reduce((acc, row) => {
      if (excludeTotals && (row.isTotal || row.isSubHeader)) {
        return acc;
      }
      return acc + (Number(row[field]) || 0);
    }, 0);
  };

  // Handler pour la mise à jour des chiffres
  const handleValueChange = (
    id: string,
    field: keyof AssetMovementRow,
    value: string,
  ) => {
    setAssetsData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row,
      ),
    );
  };

  // Add a blank data row to the given prefix section
  const addRow = (prefix: string) => {
    const existing = assetsData.filter(r => r.id.startsWith(`${prefix}_`) && !r.isSubHeader && !r.isTotal);
    const newId = `${prefix}_${Date.now()}`;
    const newRow: AssetMovementRow = {
      id: newId,
      label: "",
      openingGross: 0, acquisitions: 0, transfersIn: 0,
      revaluation: 0, disposals: 0, transfersOut: 0,
    };
    // Insert before the TOTAL row for this prefix if it exists
    setAssetsData(prev => {
      const totalIdx = prev.findIndex(r => r.id === `${prefix}_TOTAL`);
      if (totalIdx === -1) {
        return [...prev, newRow];
      }
      const next = [...prev];
      next.splice(totalIdx, 0, newRow);
      return next;
    });
  };

  // Remove a row by id
  const deleteRow = (id: string) => {
    setAssetsData(prev => prev.filter(r => r.id !== id));
  };

  // Recalcule chaque sous-total de section (I_TOTAL, C_TOTAL, ADV_TOTAL,
  // F_TOTAL) à partir des lignes de données de sa propre section, et le
  // TOTAL GÉNÉRAL à partir de toutes les lignes de données — les ids réels
  // ("I_TOTAL", "GRAND_TOTAL", ...) ne valaient jamais l'ancien
  // `row.id === "TOTAL"`, donc aucun total ne se mettait jamais à jour.
  const SECTION_PREFIXES = ["I", "C", "ADV", "F"];
  React.useEffect(() => {
    setAssetsData((prev) =>
      prev.map((row) => {
        const sectionPrefix = SECTION_PREFIXES.find(
          (p) => row.id === `${p}_TOTAL`,
        );
        const sectionRows = sectionPrefix
          ? prev.filter((r) => r.id.startsWith(`${sectionPrefix}_`))
          : row.id === "GRAND_TOTAL"
            ? prev
            : null;
        if (!sectionRows) return row;
        return {
          ...row,
          openingGross: calculateColumnSum(sectionRows, "openingGross"),
          acquisitions: calculateColumnSum(sectionRows, "acquisitions"),
          transfersIn: calculateColumnSum(sectionRows, "transfersIn"),
          revaluation: calculateColumnSum(sectionRows, "revaluation"),
          disposals: calculateColumnSum(sectionRows, "disposals"),
          transfersOut: calculateColumnSum(sectionRows, "transfersOut"),
        };
      }),
    );
  }, [
    assetsData.map((r) => r.openingGross).join(),
    assetsData.map((r) => r.acquisitions).join(),
    assetsData.map((r) => r.transfersIn).join(),
    assetsData.map((r) => r.revaluation).join(),
    assetsData.map((r) => r.disposals).join(),
    assetsData.map((r) => r.transfersOut).join(),
  ]);

  // Handler PDF (réutilisation du code précédent)
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour le tableau large
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("rapport_immobilisations_brutes.pdf");

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
            Veuillez sélectionner un dossier pour voir la Note 3A.
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

  // --- Rendu des Lignes ---

  const renderDataCell = (
    row: AssetMovementRow,
    field: keyof AssetMovementRow | "closingGross",
  ) => {
    const value = row[field as keyof AssetMovementRow] as number;
    const isCalculated = row.isTotal;

    if (row.isSubHeader) {
      return (
        <td colSpan={1} className="hidden"></td> // Colonne cachée pour les SubHeaders
      );
    }

    // Le montant brut à la clôture est toujours calculé
    if (field === "closingGross") {
      return (
        <td
          className={`border border-gray-400 p-1 text-right font-bold ${row.isTotal ? "bg-gray-300" : "bg-gray-100"
            }`}
        >
          <FormulaValue
            formula="Montant brut à l'ouverture + Acquisitions + Virements de poste à poste (entrées) + Réévaluation − Cessions − Virements de poste à poste (sorties)"
            label={typeof row.label === "string" ? row.label : row.id}
          >
            {calculateClosingGross(row).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
          </FormulaValue>
        </td>
      );
    }

    // Les autres montants sont éditables ou calculés si c'est la ligne Total
    return (
      <td
        className={`border border-gray-400 p-1 text-right ${isCalculated ? "bg-gray-300 font-bold" : ""
          }`}
      >
        {isEditing && !isCalculated ? (
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => handleValueChange(row.id, field, e.target.value)}
            className="w-full text-right bg-orange-50 px-1 focus:outline-none"
          />
        ) : (
          value.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
    );
  };

  const renderRow = (row: AssetMovementRow) => {
    if (row.isSubHeader) {
      return (
        <tr key={row.id}>
          <td
            colSpan={isEditing ? 9 : 8}
            className="font-bold underline p-1 pl-2 border border-gray-400 border-t-2"
          >
            {row.label}
          </td>
        </tr>
      );
    }

    const fields: (keyof AssetMovementRow | "closingGross")[] = [
      "openingGross",
      "acquisitions",
      "transfersIn",
      "revaluation",
      "disposals",
      "transfersOut",
      "closingGross",
    ];

    return (
      <tr key={row.id} className={row.isTotal ? "bg-gray-300 font-bold" : ""}>
        <td
          className={`border border-gray-400 p-1 pl-2 ${row.isTotal ? "bg-gray-300 uppercase" : ""
            }`}
        >
          {isEditing && !row.isTotal ? (
            <input
              value={row.label}
              onChange={(e) =>
                setAssetsData(prev =>
                  prev.map(r => r.id === row.id ? { ...r, label: e.target.value } : r)
                )
              }
              className="w-full bg-orange-50 px-1 focus:outline-none border-b border-orange-300"
              placeholder="Libellé..."
            />
          ) : (
            row.label
          )}
        </td>
        {fields.map((field) =>
          renderDataCell(row, field as keyof AssetMovementRow),
        )}
        {isEditing && !row.isTotal && (
          <td className="border border-gray-400 p-1 text-center w-6">
            <button
              onClick={() => deleteRow(row.id)}
              className="text-red-500 hover:text-red-700 font-bold leading-none"
              title="Supprimer cette ligne"
            >
              ×
            </button>
          </td>
        )}
        {isEditing && row.isTotal && <td className="border border-gray-400 p-1 w-6" />}
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="max-w-[1600px] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 3A - Tableau des Immobilisations
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
                  loadNoteData(); // Reload original data
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

      {/* Feuille A4 Landscape */}
      <div
        ref={reportRef}
        className={`max-w-[1600px] mx-auto bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
          }`}
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            10
          </span>
        </div>

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
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold text-xs">
          NOTE 3A <br /> TABLEAU DES IMMOBILISATIONS
        </div>
        <div className="border border-gray-400 border-t-0 py-1 text-center font-bold mb-1 text-xs uppercase">
          Immobilisations brutes
        </div>

        {/* Tableau Principal */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className={`border border-gray-600 p-0 relative h-16 ${isEditing ? "w-[22%]" : "w-[25%]"}`}
                  style={{
                    background:
                      "linear-gradient(to top right, transparent calc(50% - 1px), #4b5563 calc(50% - 1px), #4b5563 calc(50% + 1px), transparent calc(50% + 1px))",
                  }}
                >
                  <span className="absolute top-0.5 right-1 text-[8px] font-bold text-black text-right leading-tight">
                    SITUATIONS ET MOUVEMENTS
                  </span>
                  <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-black">
                    RUBRIQUES
                  </span>
                </th>
                <th className="border border-gray-600 p-1 w-[11%] font-bold text-black align-bottom">
                  MONTANT BRUT
                  <br />
                  À L'OUVERTURE
                  <br />
                  DE L'EXERCICE
                </th>
                <th className="border border-gray-600 p-1 w-[10%] font-bold text-black align-bottom">
                  ACQUISITIONS,
                  <br />
                  APPORTS,
                  <br />
                  CRÉATIONS
                </th>
                <th className="border border-gray-600 p-1 w-[9%] font-bold text-black align-bottom">
                  VIREMENTS DE
                  <br />
                  POSTE À POSTE
                  <br />
                  (ENTRÉES)
                </th>
                <th className="border border-gray-600 p-1 w-[13%] font-bold text-black align-bottom">
                  SUITE À UNE
                  <br />
                  RÉÉVALUATION
                  <br />
                  PRATIQUÉE AU
                  <br />
                  COURS DE
                  <br />
                  L'EXERCICE
                </th>
                <th className="border border-gray-600 p-1 w-[11%] font-bold text-black align-bottom">
                  CESSIONS,
                  <br />
                  SCISSIONS,
                  <br />
                  HORS SERVICE
                </th>
                <th className="border border-gray-600 p-1 w-[9%] font-bold text-black align-bottom">
                  VIREMENTS DE
                  <br />
                  POSTE À POSTE
                  <br />
                  (SORTIES)
                </th>
                <th className="border border-gray-600 p-1 w-[11%] font-bold text-black align-bottom">
                  MONTANT BRUT
                  <br />
                  À LA CLÔTURE
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Section I – Immobilisations Incorporelles */}
              {assetsData.filter(r => r.id.startsWith("I_") || r.id === "GRAND_TOTAL").length > 0 &&
                assetsData.filter(r => r.id.startsWith("I_")).map(renderRow)}
              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 9 : 8} className="border border-gray-400 p-1">
                    <button
                      onClick={() => addRow("I")}
                      className="text-orange-600 hover:text-orange-800 text-[10px] font-medium"
                    >
                      + Ajouter une ligne (Incorporelles)
                    </button>
                  </td>
                </tr>
              )}
              {/* Section C – Immobilisations Corporelles */}
              {assetsData.filter(r => r.id.startsWith("C_")).map(renderRow)}
              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 9 : 8} className="border border-gray-400 p-1">
                    <button
                      onClick={() => addRow("C")}
                      className="text-orange-600 hover:text-orange-800 text-[10px] font-medium"
                    >
                      + Ajouter une ligne (Corporelles)
                    </button>
                  </td>
                </tr>
              )}
              {/* Section ADV – Avances et Acomptes */}
              {assetsData.filter(r => r.id.startsWith("ADV_")).map(renderRow)}
              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 9 : 8} className="border border-gray-400 p-1">
                    <button
                      onClick={() => addRow("ADV")}
                      className="text-orange-600 hover:text-orange-800 text-[10px] font-medium"
                    >
                      + Ajouter une ligne (Avances)
                    </button>
                  </td>
                </tr>
              )}
              {/* Section F – Immobilisations Financières */}
              {assetsData.filter(r => r.id.startsWith("F_")).map(renderRow)}
              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 9 : 8} className="border border-gray-400 p-1">
                    <button
                      onClick={() => addRow("F")}
                      className="text-orange-600 hover:text-orange-800 text-[10px] font-medium"
                    >
                      + Ajouter une ligne (Financières)
                    </button>
                  </td>
                </tr>
              )}
              {/* Grand Total */}
              {assetsData.filter(r => r.id === "GRAND_TOTAL").map(renderRow)}
            </tbody>
          </table>
        </div>

        {/* Commentaires */}
        <div className="border border-gray-400 p-3 bg-white mt-4">
          <div className="font-bold underline text-xs mb-2 uppercase">Commentaires :</div>
          <ul className="list-disc pl-5 italic text-[9px] text-gray-500 mb-2">
            <li>Toute variation significative doit être commentée.</li>
            <li>
              Détailler les éléments constructifs du fonds commercial et
              indiquer la date d'acquisition.
            </li>
            <li>
              Pour l'immobilisation incorporelle relative à la concession, faire
              un descriptif de l'accord.
            </li>
            <li>
              Indiquer :
              <ul className="list-disc pl-5">
                <li>La nature de la créance</li>
                <li>La durée de la concession</li>
                <li>L'échéance</li>
              </ul>
            </li>
            <li>
              Indiquer les créances du groupe avec la nature et la date
              d'échéance.
            </li>
            <li>
              Pour les banques DAT, indiquer le nom de la banque, le montant et
              la date d'échéance.
            </li>
          </ul>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-orange-300 bg-orange-50 text-xs focus:outline-none resize-none"
              placeholder="Saisir vos commentaires ici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-xs min-h-[2rem]">
              {comment || "Aucun commentaire."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto text-center text-sm pt-6">
          <span className="font-bold">Feuille : </span> 16
        </div>
      </div>
    </div>
  );
};

export default Note3A;


