import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";

// --- Interfaces ---

interface AssetRow {
  id: string;
  label: string;
  grossAmount: number; // Montant Brut (A)
  amortizations: number; // Amortissements Pratiques
  netValue: number; // Valeur Comptable Nette (C = A - B)
  sellingPrice: number; // Prix de Cession (D)
  gainsLosses: number; // Plus-Values ou Moins-Values (E = D - C)
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note3D: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [justification, setJustification] = useState(
    "Mentionner la justification de la cession ainsi que la date d'acquisition et la date de sortie."
  );

  // En-tête
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

  const [assetData, setAssetData] = useState<AssetRow[]>([]);

  // Les IDs pour chaque sous-total
  const incorporelIds = ["1", "2", "3", "4"];
  const corporelIds = ["5", "6", "7", "8", "9"];
  const financierIds = ["10", "11"];

  // --- Helpers de calcul ---

  const calculateSectionSum = (
    sectionIds: string[],
    field: keyof AssetRow
  ): number => {
    return assetData
      .filter((row) => sectionIds.includes(row.id))
      .reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
  };

  const calculateGrandTotal = (field: keyof AssetRow): number => {
    return assetData.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
  };

  // Calculs des sous-totaux
  const subTotalIncorporel = {
    grossAmount: calculateSectionSum(incorporelIds, "grossAmount"),
    amortizations: calculateSectionSum(incorporelIds, "amortizations"),
    netValue: calculateSectionSum(incorporelIds, "netValue"),
    sellingPrice: calculateSectionSum(incorporelIds, "sellingPrice"),
    gainsLosses: calculateSectionSum(incorporelIds, "gainsLosses"),
  };

  const subTotalCorporel = {
    grossAmount: calculateSectionSum(corporelIds, "grossAmount"),
    amortizations: calculateSectionSum(corporelIds, "amortizations"),
    netValue: calculateSectionSum(corporelIds, "netValue"),
    sellingPrice: calculateSectionSum(corporelIds, "sellingPrice"),
    gainsLosses: calculateSectionSum(corporelIds, "gainsLosses"),
  };

  const subTotalFinancier = {
    grossAmount: calculateSectionSum(financierIds, "grossAmount"),
    amortizations: calculateSectionSum(financierIds, "amortizations"),
    netValue: calculateSectionSum(financierIds, "netValue"),
    sellingPrice: calculateSectionSum(financierIds, "sellingPrice"),
    gainsLosses: calculateSectionSum(financierIds, "gainsLosses"),
  };

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3D")) as any;

      if (!noteData) {
        console.log("No saved data found for Note 3D");
        return;
      }

      console.log("✅ Note 3D data loaded successfully", noteData);

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      if (noteData.comment) setComment(noteData.comment);
      if (noteData.justification) setJustification(noteData.justification);

      const data = noteData.immobilisations || [];
      const rows: AssetRow[] = [];
      const filterLabels = [
        "SOUS TOTAL : IMMOBILISATIONS INCORPORELLES",
        "SOUS TOTAL : IMMOBILISATIONS CORPORELLES",
        "SOUS TOTAL : IMMOBILISATIONS FINANCIERES"
      ];

      data.forEach((row: any) => {
        if (!filterLabels.includes(row.libelle)) {
          rows.push({
            id: (rows.length + 1).toString(),
            label: row.libelle || "",
            grossAmount: Number(row.montantBrut) || 0,
            amortizations: Number(row.amortissementsPratiques) || 0,
            netValue: Number(row.valeurComptableNette) || 0,
            sellingPrice: Number(row.prixCessions) || 0,
            gainsLosses: Number(row.plusOuMoinsValues) || 0,
          });
        }
      });

      setAssetData(rows);
    } catch (error) {
      console.error("❌ Error loading Note 3D data:", error);
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
      const toApiFormat = (row: AssetRow) => ({
        libelle: row.label,
        montantBrut: row.grossAmount,
        amortissementsPratiques: row.amortizations,
        valeurComptableNette: row.netValue,
        prixCessions: row.sellingPrice,
        plusOuMoinsValues: row.gainsLosses,
      });

      const noteData = {
        entete: headerInfo,
        comment,
        justification,
        immobilisations: [
          ...assetData.filter(r => incorporelIds.includes(r.id)).map(toApiFormat),
          { libelle: "SOUS TOTAL : IMMOBILISATIONS INCORPORELLES", montantBrut: subTotalIncorporel.grossAmount, amortissementsPratiques: subTotalIncorporel.amortizations, valeurComptableNette: subTotalIncorporel.netValue, prixCessions: subTotalIncorporel.sellingPrice, plusOuMoinsValues: subTotalIncorporel.gainsLosses },
          ...assetData.filter(r => corporelIds.includes(r.id)).map(toApiFormat),
          { libelle: "SOUS TOTAL : IMMOBILISATIONS CORPORELLES", montantBrut: subTotalCorporel.grossAmount, amortissementsPratiques: subTotalCorporel.amortizations, valeurComptableNette: subTotalCorporel.netValue, prixCessions: subTotalCorporel.sellingPrice, plusOuMoinsValues: subTotalCorporel.gainsLosses },
          ...assetData.filter(r => financierIds.includes(r.id)).map(toApiFormat),
          { libelle: "SOUS TOTAL : IMMOBILISATIONS FINANCIERES", montantBrut: subTotalFinancier.grossAmount, amortissementsPratiques: subTotalFinancier.amortizations, valeurComptableNette: subTotalFinancier.netValue, prixCessions: subTotalFinancier.sellingPrice, plusOuMoinsValues: subTotalFinancier.gainsLosses },
        ]
      };

      console.log("📤 Sending Note 3D data:", noteData);

      const saved = await notesService.saveNoteData(
        folderId,
        "3D",
        noteData as any,
      );

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving Note 3D:", error);
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

  // Calculs du Total Général
  const totalGeneral = {
    grossAmount: calculateGrandTotal("grossAmount"),
    amortizations: calculateGrandTotal("amortizations"),
    netValue: calculateGrandTotal("netValue"),
    sellingPrice: calculateGrandTotal("sellingPrice"),
    gainsLosses: calculateGrandTotal("gainsLosses"),
  };

  // --- Handlers ---

  const handleAssetChange = (
    id: string,
    field: keyof AssetRow,
    value: string
  ) => {
    setAssetData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const newRow = {
            ...row,
            [field]: Number(value) || 0,
          };

          // Recalculer Valeur Nette et Plus/Moins-Values après un changement
          const newGross =
            field === "grossAmount" ? Number(value) || 0 : newRow.grossAmount;
          const newAmort =
            field === "amortizations"
              ? Number(value) || 0
              : newRow.amortizations;
          const newSell =
            field === "sellingPrice" ? Number(value) || 0 : newRow.sellingPrice;

          const calculatedNetValue = newGross - newAmort;
          const calculatedGainsLosses = newSell - calculatedNetValue;

          return {
            ...newRow,
            grossAmount: newGross,
            amortizations: newAmort,
            sellingPrice: newSell,
            netValue: calculatedNetValue,
            gainsLosses: calculatedGainsLosses,
          };
        }
        return row;
      })
    );
  };

  // --- Actions ---

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
        pdf.save("rapport_note_3D_immobilisations.pdf");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            Veuillez sélectionner un dossier pour voir la Note 3D.
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

  const renderAssetRow = (row: AssetRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2 font-bold text-xs text-center bg-gray-50">
        {row.id}
      </td>
      <td className="border border-gray-400 p-1 pl-2 text-xs">{row.label}</td>
      {/* Montant Brut (A) */}
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.grossAmount}
            onChange={(e) =>
              handleAssetChange(row.id, "grossAmount", e.target.value)
            }
            className="w-full text-right bg-blue-50 focus:outline-none"
          />
        ) : (
          row.grossAmount.toLocaleString("fr-FR")
        )}
      </td>
      {/* Amortissements Pratiques */}
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.amortizations}
            onChange={(e) =>
              handleAssetChange(row.id, "amortizations", e.target.value)
            }
            className="w-full text-right bg-blue-50 focus:outline-none"
          />
        ) : (
          row.amortizations.toLocaleString("fr-FR")
        )}
      </td>
      {/* Valeur Comptable Nette (C = A - B) */}
      <td className="border border-gray-400 p-1 text-right bg-gray-100 font-medium">
        {row.netValue.toLocaleString("fr-FR")}
      </td>
      {/* Prix de Cession (D) */}
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.sellingPrice}
            onChange={(e) =>
              handleAssetChange(row.id, "sellingPrice", e.target.value)
            }
            className="w-full text-right bg-blue-50 focus:outline-none"
          />
        ) : (
          row.sellingPrice.toLocaleString("fr-FR")
        )}
      </td>
      {/* Plus-Values ou Moins-Values (E = D - C) */}
      <td
        className={`border border-gray-400 p-1 text-right font-bold ${row.gainsLosses > 0
          ? "text-green-700 bg-green-50"
          : row.gainsLosses < 0
            ? "text-red-700 bg-red-50"
            : ""
          }`}
      >
        {row.gainsLosses.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  const renderSubTotalRow = (
    title: string,
    data: { [key in keyof AssetRow]?: number }
  ) => (
    <tr className="bg-gray-300 font-bold h-7 border-t border-black">
      <td colSpan={2} className="border border-gray-400 p-1 pl-2 text-[10px] uppercase">
        {title}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {data.grossAmount?.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {data.amortizations?.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right bg-gray-400">
        {data.netValue?.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {data.sellingPrice?.toLocaleString("fr-FR")}
      </td>
      <td
        className={`border border-gray-400 p-1 text-right ${(data.gainsLosses || 0) > 0 ? "text-green-800" : ""
          }`}
      >
        {data.gainsLosses?.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Note 3D - Cessions d'Immobilisations
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
                  loadNoteData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-height-[297mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-blue-500" : "border-gray-200"
          }`}
      >
        {isEditing && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
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
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-20 focus:outline-none px-1 text-center"
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
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {headerInfo.duration || "-"}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold text-xs mb-1">
          NOTE 3D <br /> IMMOBILISATIONS : PLUS-VALUES ET MOINS-VALUES DE
          CESSION
        </div>

        {/* Tableau Principal */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-1 w-[5%]"
                ></th>
                <th rowSpan={2} className="border border-gray-600 p-1 w-[25%] font-bold">
                  Désignation
                </th>
                <th rowSpan={2} className="border border-gray-600 p-1 w-[14%] font-bold">
                  MONTANT BRUT <br /> A
                </th>
                <th rowSpan={2} className="border border-gray-600 p-1 w-[14%] font-bold">
                  AMORTISSEMENTS PRATIQUES <br /> B
                </th>
                <th rowSpan={2} className="border border-gray-600 p-1 w-[14%] font-bold">
                  VALEUR COMPTABLE NETTE <br /> C = A - B
                </th>
                <th rowSpan={2} className="border border-gray-600 p-1 w-[14%] font-bold">
                  PRIX DE CESSION <br /> D
                </th>
                <th rowSpan={2} className="border border-gray-600 p-1 w-[14%] font-bold">
                  PLUS-VALUES OU MOINS-VALUES <br /> E = D - C
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 1. IMMOBILISATIONS INCORPORELLES */}
              <tr className="bg-gray-100 font-bold border-t border-black">
                <td colSpan={7} className="border border-gray-400 p-1 pl-2 uppercase">
                  IMMOBILISATIONS INCORPORELLES
                </td>
              </tr>
              {assetData
                .filter((row) => incorporelIds.includes(row.id))
                .map(renderAssetRow)}
              {renderSubTotalRow(
                "SOUS TOTAL : IMMOBILISATIONS INCORPORELLES",
                subTotalIncorporel
              )}

              {/* Ligne vide de séparation */}
              <tr>
                <td colSpan={7} className="h-2 border-x border-gray-400"></td>
              </tr>

              {/* 2. IMMOBILISATIONS CORPORELLES */}
              <tr className="bg-gray-100 font-bold border-t border-gray-400">
                <td colSpan={7} className="border border-gray-400 p-1 pl-2 uppercase">
                  IMMOBILISATIONS CORPORELLES
                </td>
              </tr>
              {assetData
                .filter((row) => corporelIds.includes(row.id))
                .map(renderAssetRow)}
              {renderSubTotalRow(
                "SOUS TOTAL : IMMOBILISATIONS CORPORELLES",
                subTotalCorporel
              )}

              {/* Ligne vide de séparation */}
              <tr>
                <td colSpan={7} className="h-2 border-x border-gray-400"></td>
              </tr>

              {/* 3. IMMOBILISATIONS FINANCIÈRES */}
              <tr className="bg-gray-100 font-bold border-t border-gray-400">
                <td colSpan={7} className="border border-gray-400 p-1 pl-2 uppercase">
                  IMMOBILISATIONS FINANCIÈRES
                </td>
              </tr>
              {assetData
                .filter((row) => financierIds.includes(row.id))
                .map(renderAssetRow)}
              {renderSubTotalRow(
                "SOUS TOTAL : IMMOBILISATIONS FINANCIÈRES",
                subTotalFinancier
              )}

              {/* TOTAL GÉNÉRAL */}
              <tr className="bg-gray-700 text-white font-extrabold text-[11px] h-8 border-t-2 border-black">
                <td
                  colSpan={2}
                  className="border border-gray-600 p-2 text-center uppercase"
                >
                  TOTAL GENERAL
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {totalGeneral.grossAmount.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {totalGeneral.amortizations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right bg-gray-600">
                  {totalGeneral.netValue.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {totalGeneral.sellingPrice.toLocaleString("fr-FR")}
                </td>
                <td
                  className={`border border-gray-600 p-2 text-right ${totalGeneral.gainsLosses > 0
                    ? "text-green-400"
                    : "text-red-400"
                    }`}
                >
                  {totalGeneral.gainsLosses.toLocaleString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commentaire Footer */}
        <div className="border border-gray-400 p-3 bg-white mt-4">
          <div className="font-bold underline text-xs mb-2 uppercase">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-16 p-2 border border-blue-300 bg-blue-50 focus:outline-none resize-none text-xs"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap text-xs">
              {comment || "Aucun commentaire."}
            </div>
          )}
        </div>

        {/* Justification Footer */}
        <div className="border border-gray-400 p-3 bg-gray-50 mt-2">
          <div className="font-bold text-[10px] text-gray-700 mb-1 italic uppercase">Justification des cessions :</div>
          {isEditing ? (
            <textarea
              className="w-full h-16 p-2 border border-blue-300 bg-blue-100 focus:outline-none resize-none text-xs"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap text-[10px] text-gray-700 italic">
              {justification || "Aucune justification fournie."}
            </div>
          )}
        </div>

        {/* Footer Numéro de page simulé */}
        <div className="mt-auto text-center text-sm pt-6">
          <span className="font-bold">Feuille : </span> 19
        </div>
      </div>
    </div>
  );
};

export default Note3D;
