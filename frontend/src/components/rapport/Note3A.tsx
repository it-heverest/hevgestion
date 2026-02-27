import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { dsfConfigService, DSFConfig } from "../../services/dsf-config.service";
import {
  DSFCalculationService,
  ReportData,
} from "../../services/dsf-calculation.service";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

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
  const { selectedFolder, selectedClient } = useApp();
  const folderId = selectedFolder?.id;

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

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) {
      console.warn("No folderId provided");
      return;
    }

    console.log("🔍 Loading Note 3A data for folderId:", folderId);

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3A")) as any;

      console.log("📥 Loaded Note 3A data:", noteData);

      if (!noteData) {
        console.log("No saved data found for Note 3A");
        return;
      }

      // Apply data to state if saved data exists
      console.log("✅ Note 3A data loaded successfully");
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

    console.log("💾 Saving Note 3A data for folderId:", folderId);

    try {
      setIsSaving(true);

      // Prepare data in the format expected by backend
      const noteData = {
        entete: headerInfo,
        // Add asset data serialization here when needed
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

  // État des données
  const [assetsData, setAssetsData] = useState<AssetMovementRow[]>([
    // IMMOBILISATIONS INCORPORELLES
    {
      id: "I_HEADER",
      label: "IMMOBILISATIONS INCORPORELLES",
      isSubHeader: true,
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "I_1",
      label: "Frais de développement et de prospection",
      openingGross: 10000,
      acquisitions: 2000,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "I_2",
      label: "Brevets, licences, logiciels et droits similaires",
      openingGross: 5000,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 500,
      transfersOut: 0,
    },
    {
      id: "I_3",
      label: "Fonds commercial et droit de bail",
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "I_4",
      label: "Autres immobilisations incorporelles",
      openingGross: 2000,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },

    // IMMOBILISATIONS CORPORELLES
    {
      id: "C_HEADER",
      label: "IMMOBILISATIONS CORPORELLES",
      isSubHeader: true,
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "C_1",
      label: "Terrains hors immeubles de placement",
      openingGross: 50000,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 5000,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "C_2",
      label: "Terrains - immeubles de placement",
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "C_3",
      label: "Bâtiments hors immeubles de placement",
      openingGross: 80000,
      acquisitions: 10000,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "C_4",
      label: "Bâtiments - immeubles de placement",
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "C_5",
      label: "Aménagements, agencements et installations",
      openingGross: 15000,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 1000,
      transfersOut: 0,
    },
    {
      id: "C_6",
      label: "Matériel, mobilier et actif biologiques",
      openingGross: 30000,
      acquisitions: 5000,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "C_7",
      label: "Matériel de transport",
      openingGross: 25000,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 2000,
      transfersOut: 0,
    },

    // AVANCES ET ACOMPTES VERSEES SUR IMMOBILISATIONS
    {
      id: "ADV_HEADER",
      label: "AVANCES ET ACOMPTES VERSEES SUR IMMOBILISATIONS",
      isSubHeader: true,
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "ADV_1",
      label: "Immobilisations incorporelles",
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "ADV_2",
      label: "Immobilisations corporelles",
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },

    // IMMOBILISATIONS FINANCIÈRES
    {
      id: "F_HEADER",
      label: "IMMOBILISATIONS FINANCIÈRES",
      isSubHeader: true,
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "F_1",
      label: "Titres de participation",
      openingGross: 5000,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
    {
      id: "F_2",
      label: "Autres immobilisations financières",
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },

    // TOTAL GENERAL
    {
      id: "TOTAL",
      label: "TOTAL GENERAL",
      isTotal: true,
      openingGross: 0,
      acquisitions: 0,
      transfersIn: 0,
      revaluation: 0,
      disposals: 0,
      transfersOut: 0,
    },
  ]);

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

  // Calcul du TOTAL GENERAL
  const grandTotalRow = assetsData.find((row) => row.id === "TOTAL")!;

  // Utiliser useEffect pour mettre à jour la ligne de total général à chaque changement
  React.useEffect(() => {
    const totalRow = assetsData.find((row) => row.id === "TOTAL");
    if (totalRow) {
      setAssetsData((prev) =>
        prev.map((row) => {
          if (row.id === "TOTAL") {
            return {
              ...row,
              openingGross: calculateColumnSum(prev, "openingGross"),
              acquisitions: calculateColumnSum(prev, "acquisitions"),
              transfersIn: calculateColumnSum(prev, "transfersIn"),
              revaluation: calculateColumnSum(prev, "revaluation"),
              disposals: calculateColumnSum(prev, "disposals"),
              transfersOut: calculateColumnSum(prev, "transfersOut"),
            };
          }
          return row;
        }),
      );
    }
  }, [
    assetsData.map((r) => r.openingGross).join(),
    assetsData.map((r) => r.acquisitions).join(),
    assetsData.map((r) => r.transfersIn).join(),
    assetsData.map((r) => r.revaluation).join(),
    assetsData.map((r) => r.disposals).join(),
    assetsData.map((r) => r.transfersOut).join(),
  ]);

  // Handler PDF (réutilisation du code précédent)
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
          className={`border border-gray-400 p-1 text-right font-bold ${
            row.isTotal ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          {calculateClosingGross(row).toLocaleString("fr-FR")}
        </td>
      );
    }

    // Les autres montants sont éditables ou calculés si c'est la ligne Total
    return (
      <td
        className={`border border-gray-400 p-1 text-right ${
          isCalculated ? "bg-gray-300 font-bold" : ""
        }`}
      >
        {isEditing && !isCalculated ? (
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => handleValueChange(row.id, field, e.target.value)}
            className="w-full text-right bg-blue-50 px-1 focus:outline-none"
          />
        ) : (
          value.toLocaleString("fr-FR")
        )}
      </td>
    );
  };

  const renderRow = (row: AssetMovementRow) => {
    if (row.isSubHeader) {
      return (
        <tr key={row.id}>
          <td
            colSpan={9}
            className="font-bold p-1 pl-2 bg-gray-200 border border-gray-400 border-t-2"
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
          className={`border border-gray-400 p-1 pl-2 ${
            row.isTotal ? "bg-gray-300 uppercase" : ""
          }`}
        >
          {row.label}
        </td>
        {fields.map((field) =>
          renderDataCell(row, field as keyof AssetMovementRow),
        )}
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                  loadNoteData(); // Reload original data
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

      {/* Feuille A4 Landscape */}
      <div
        ref={reportRef}
        className="max-w-[297mm] mx-auto min-h-[210mm] bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* En-tête (simple pour ce rapport) */}
        <div className="text-right text-sm mb-4">
          <span className="font-bold">Désignation entité :</span>{" "}
          {headerInfo.entityName} |
          <span className="font-bold"> Exercice clos le 31-12-</span>{" "}
          {headerInfo.fiscalYear}
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-0 text-sm">
          IMMOBILISATIONS BRUTES
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1 w-[28%]">
                RUBRIQUES
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[12%]">
                MONTANT BRUT À L'OUVERTURE DE L'EXERCICE
              </th>
              <th colSpan={4} className="border border-gray-400 p-1">
                SITUATIONS ET MOUVEMENTS
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                DIMINUTIONS
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[12%]">
                MONTANT BRUT À LA CLÔTURE
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 w-[9%]">
                ACQUISITIONS/APPORTS/CREATIONS
              </th>
              <th className="border border-gray-400 p-1 w-[7%]">
                VIREMENTS DE POSTE A POSTE (ENTRÉES)
              </th>
              <th className="border border-gray-400 p-1 w-[11%]">
                SUITE A UNE REEVALUATION PRATIQUEE AU COURS DE L'EXERCICE
              </th>
              <th className="border border-gray-400 p-1 w-[9%]">CESSIONS</th>
              <th className="border border-gray-400 p-1 w-[7%]">
                VIREMENTS DE POSTE A POSTE (SORTIES)
              </th>
            </tr>
          </thead>
          <tbody>{assetsData.map(renderRow)}</tbody>
        </table>

        {/* Commentaires */}
        <div className="border border-gray-400 border-t-0 p-2 bg-white flex flex-col mt-4">
          <div className="font-bold underline text-sm mb-1">Commentaires:</div>
          <ul className="list-disc pl-5 italic text-[10px] text-gray-600 mb-2">
            <li>Toute variation significative doit être commentée.</li>
            <li>
              Détailler les éléments constitutifs de fonds commercial et
              indiquer la date d'acquisition.
            </li>
            <li>
              Pour l'immobilisation incorporelle relative à la concession, faire
              un descriptif de l'accord.
            </li>
          </ul>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-blue-300 bg-blue-50 text-xs focus:outline-none resize-none"
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
        <div className="mt-auto text-center text-sm pt-2">
          <span className="font-bold">Feuille : </span> 16
        </div>
      </div>
    </div>
  );
};

export default Note3A;
