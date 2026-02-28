import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";

// --- Interfaces ---

interface LeaseAssetRow {
  id: string;
  label: string;
  isSubHeader?: boolean; // Pour les titres (Immobilisations Incorporelles)

  // Colonnes de données
  contractType: string; // Nature du contrat
  openingGross: number; // Montant brut à l'ouverture (A)

  // Augmentations (B)
  acquisitions: number;
  transfersIn: number; // Virements de poste (Entrée)
  revaluation: number;

  // Diminutions (C)
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

const Note3B: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");

  const { selectedFolder, selectedClient } = useApp();
  const folderId = selectedFolder?.id;

  // État de l'en-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État des données
  const [assetsData, setAssetsData] = useState<LeaseAssetRow[]>([]);

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) {
      console.warn("No folderId provided");
      return;
    }

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3B")) as any;

      if (!noteData) {
        console.log("No saved data found for Note 3B");
        return;
      }

      console.log("✅ Note 3B data loaded successfully", noteData);

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      const buildSection = (data: any[], prefix: string, headerLabel: string): LeaseAssetRow[] => {
        if (!data || data.length === 0) return [];
        const rows: LeaseAssetRow[] = [];
        if (headerLabel) {
          rows.push({
            id: `${prefix}_HEADER`,
            label: headerLabel,
            isSubHeader: true,
            contractType: "",
            openingGross: 0, acquisitions: 0, transfersIn: 0, revaluation: 0, disposals: 0, transfersOut: 0
          });
        }
        data.forEach((row: any, i: number) => {
          rows.push({
            id: `${prefix}_${i + 1}`,
            label: row.libelle || "",
            contractType: row.natureContrat || "",
            openingGross: Number(row.montantBrutOuverture) || 0,
            acquisitions: Number(row.acquisitions) || 0,
            transfersIn: Number(row.virementsPosteAPoste) || 0,
            revaluation: Number(row.reevaluation) || 0,
            disposals: Number(row.cessions) || 0,
            transfersOut: Number(row.virementsSortie) || 0,
          });
        });
        return rows;
      };

      const newData = [
        ...buildSection(noteData.immobilisationsIncorporelles, "I", "IMMOBILISATIONS INCORPORELLES"),
        ...buildSection(noteData.immobilisationsCorporelles, "C", "IMMOBILISATIONS CORPORELLES"),
      ];

      setAssetsData(newData);
      if (noteData.comment) {
        setComment(noteData.comment);
      }
    } catch (error) {
      console.error("❌ Error loading Note 3B data:", error);
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

      const toApiFormat = (row: LeaseAssetRow) => ({
        libelle: row.label,
        natureContrat: row.contractType,
        montantBrutOuverture: row.openingGross,
        acquisitions: row.acquisitions,
        virementsPosteAPoste: row.transfersIn,
        reevaluation: row.revaluation,
        cessions: row.disposals,
        virementsSortie: row.transfersOut,
        montantBrutCloture: calculateClosingGross(row)
      });

      const extractSection = (prefix: string) =>
        assetsData.filter(r => r.id.startsWith(`${prefix}_`) && !r.isSubHeader);

      const noteData = {
        entete: headerInfo,
        comment,
        immobilisationsIncorporelles: extractSection("I").map(toApiFormat),
        immobilisationsCorporelles: extractSection("C").map(toApiFormat),
      };

      console.log("📤 Sending Note 3B data:", noteData);

      const saved = await notesService.saveNoteData(
        folderId,
        "3B",
        noteData as any,
      );

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving Note 3B:", error);
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

  const calculateTotal = (
    data: LeaseAssetRow[],
    field: keyof LeaseAssetRow
  ): number => {
    return data.reduce((acc, row) => {
      if (!row.isSubHeader) {
        return acc + (Number(row[field]) || 0);
      }
      return acc;
    }, 0);
  };

  // Calcul pour la colonne D = A + B - C
  const calculateClosingGross = (row: LeaseAssetRow): number => {
    if (row.isSubHeader) return 0;

    const opening = Number(row.openingGross);
    const augmentations =
      Number(row.acquisitions) +
      Number(row.transfersIn) +
      Number(row.revaluation);
    const diminutions = Number(row.disposals) + Number(row.transfersOut);

    return opening + augmentations - diminutions;
  };

  // Handler pour la mise à jour des chiffres
  const handleValueChange = (
    id: string,
    field: keyof LeaseAssetRow,
    value: string
  ) => {
    setAssetsData((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]: field === "contractType" ? value : Number(value) || 0,
          }
          : row
      )
    );
  };

  // Découper les données en sections
  const incorporealAssets = assetsData.filter(
    (row) => row.id.startsWith("I_") && row.id !== "I_HEADER"
  );
  const corporealAssets = assetsData.filter(
    (row) => row.id.startsWith("C_") && row.id !== "C_HEADER"
  );

  const totalIncorporealOpening = calculateTotal(
    incorporealAssets,
    "openingGross"
  );
  const totalCorporealOpening = calculateTotal(corporealAssets, "openingGross");
  const totalGeneralOpening = totalIncorporealOpening + totalCorporealOpening;

  // Les totaux des mouvements doivent être calculés pour le TOTAL GENERAL également
  const totalGeneralClosing = calculateClosingGross({
    id: "T",
    label: "T",
    contractType: "",
    isSubHeader: false,
    openingGross: totalGeneralOpening,
    acquisitions: calculateTotal(assetsData, "acquisitions"),
    transfersIn: calculateTotal(assetsData, "transfersIn"),
    revaluation: calculateTotal(assetsData, "revaluation"),
    disposals: calculateTotal(assetsData, "disposals"),
    transfersOut: calculateTotal(assetsData, "transfersOut"),
  } as LeaseAssetRow);

  // --- Actions ---

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
        pdf.save("rapport_note_3B_location_acquisition.pdf");

        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu des Lignes ---

  const renderDataCell = (row: LeaseAssetRow, field: keyof LeaseAssetRow | "closingGross") => {
    const value = field !== "closingGross" ? row[field] : null;

    if (row.isSubHeader) {
      return null;
    }

    // Montant brut à la clôture (D = A + B - C)
    if (field === "closingGross") {
      return (
        <td
          className={`border border-gray-400 p-1 text-right font-bold bg-gray-100`}
        >
          {calculateClosingGross(row).toLocaleString("fr-FR")}
        </td>
      );
    }

    // Type de contrat (input texte court)
    if (field === "contractType") {
      return (
        <td className={`border border-gray-400 p-1 text-center bg-gray-100`}>
          {isEditing ? (
            <input
              value={value as string}
              onChange={(e) => handleValueChange(row.id, field, e.target.value)}
              className="w-full text-center bg-blue-50 focus:outline-none"
            />
          ) : (
            value
          )}
        </td>
      );
    }

    // Champs numériques
    return (
      <td className={`border border-gray-400 p-1 text-right`}>
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={value as number}
            onChange={(e) => handleValueChange(row.id, field, e.target.value)}
            className="w-full text-right bg-blue-50 px-1 focus:outline-none"
          />
        ) : (
          (value as number).toLocaleString("fr-FR")
        )}
      </td>
    );
  };

  const renderRow = (row: LeaseAssetRow) => {
    if (row.isSubHeader) {
      return (
        <tr key={row.id}>
          <td
            colSpan={10}
            className="font-bold p-1 pl-2 bg-gray-100 border-x border-gray-400"
          >
            {row.label}
          </td>
        </tr>
      );
    }

    // Colonnes à rendre (dans l'ordre du tableau)
    const fields: (keyof LeaseAssetRow | "closingGross")[] = [
      "contractType",
      "openingGross",
      "acquisitions",
      "transfersIn",
      "revaluation",
      "disposals",
      "transfersOut",
      "closingGross",
    ];

    return (
      <tr key={row.id}>
        <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
        {fields.map((field) =>
          renderDataCell(row, field as keyof LeaseAssetRow)
        )}
      </tr>
    );
  };

  const renderSubTotalRow = (
    title: string,
    data: LeaseAssetRow[],
    openingTotal: number,
    totalClosing: number
  ) => {
    return (
      <tr className="bg-gray-300 font-bold border-t-2 border-black">
        <td colSpan={3} className="border border-gray-400 p-1 pl-2 uppercase">
          {title}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {openingTotal.toLocaleString("fr-FR")}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {calculateTotal(data, "acquisitions").toLocaleString("fr-FR")}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {calculateTotal(data, "transfersIn").toLocaleString("fr-FR")}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {calculateTotal(data, "revaluation").toLocaleString("fr-FR")}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {calculateTotal(data, "disposals").toLocaleString("fr-FR")}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {calculateTotal(data, "transfersOut").toLocaleString("fr-FR")}
        </td>
        <td className="border border-gray-400 p-1 text-right">
          {totalClosing.toLocaleString("fr-FR")}
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
            Veuillez sélectionner un dossier pour voir la Note 3B.
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
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Note 3B - Biens Pris en Location Acquisition
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
        className={`max-w-[297mm] mx-auto min-h-[210mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-blue-500" : "border-gray-200"
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

        {/* En-tête */}
        <div className="text-center font-bold text-lg mb-2">11</div>
        <div className="mb-4 grid grid-cols-2 gap-x-12 gap-y-2 border-b-2 border-transparent pb-4">
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
                className="border-b border-blue-500 bg-blue-50 w-24 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-24 text-center px-1">
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
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-0 text-sm">
          NOTE 3B <br /> BIENS PRIS EN LOCATION ACQUISITION
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[9px] table-fixed">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={4} className="border border-gray-400 p-1 w-[15%]">
                SITUATIONS ET MOUVEMENTS
              </th>
              <th colSpan={3} className="border border-gray-400 p-1"></th>
              <th colSpan={3} className="border border-gray-400 p-1">
                AUGMENTATIONS B
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                DIMINUTIONS C
              </th>
              <th rowSpan={4} className="border border-gray-400 p-1 w-[10%]">
                D = A + B - C<br />
                MONTANT BRUT À LA CLÔTURE DE L'EXERCICE
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th rowSpan={3} className="border border-gray-400 p-1 w-[5%]">
                NATURE DU CONTRAT (L, M, A) (*)
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1 w-[10%]">
                MONTANT BRUT A L'OUVERTURE DE L'EXERCICE
              </th>
              <th colSpan={3} className="border border-gray-400 p-1"></th>
              <th rowSpan={3} className="border border-gray-400 p-1 w-[8%]">
                CESSIONS ET MIS HORS SERVICES
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1 w-[6%]">
                VIREMENT DE POSTE A POSTE
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th colSpan={3} className="border border-gray-400 p-1"></th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 w-[8%]">
                ACQUISITIONS, APPORTS, CREATIONS
              </th>
              <th className="border border-gray-400 p-1 w-[6%]">
                VIREMENTS DE POSTE A POSTE
              </th>
              <th className="border border-gray-400 p-1 w-[10%]">
                SUITE A UNE REEVALUATION PRATIQUEE AU COURS DE L'EXERCICE
              </th>
            </tr>
          </thead>
          <tbody>
            {assetsData.filter((row) => row.id.startsWith("I")).map(renderRow)}
            {renderSubTotalRow(
              "SOUS TOTAL : IMMOBILISATIONS INCORPORELLES",
              incorporealAssets,
              totalIncorporealOpening,
              calculateClosingGross({
                openingGross: totalIncorporealOpening,
                acquisitions: calculateTotal(incorporealAssets, "acquisitions"),
                transfersIn: calculateTotal(incorporealAssets, "transfersIn"),
                revaluation: calculateTotal(incorporealAssets, "revaluation"),
                disposals: calculateTotal(incorporealAssets, "disposals"),
                transfersOut: calculateTotal(incorporealAssets, "transfersOut"),
              } as LeaseAssetRow)
            )}

            {assetsData.filter((row) => row.id.startsWith("C")).map(renderRow)}
            {renderSubTotalRow(
              "SOUS TOTAL : IMMOBILISATIONS CORPORELLES",
              corporealAssets,
              totalCorporealOpening,
              calculateClosingGross({
                openingGross: totalCorporealOpening,
                acquisitions: calculateTotal(corporealAssets, "acquisitions"),
                transfersIn: calculateTotal(corporealAssets, "transfersIn"),
                revaluation: calculateTotal(corporealAssets, "revaluation"),
                disposals: calculateTotal(corporealAssets, "disposals"),
                transfersOut: calculateTotal(corporealAssets, "transfersOut"),
              } as LeaseAssetRow)
            )}

            {/* TOTAL GENERAL */}
            <tr className="bg-gray-500 text-black font-bold border-t-2 border-black">
              <td
                colSpan={3}
                className="border border-gray-400 p-1 pl-2 uppercase text-center"
              >
                TOTAL GENERAL
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalGeneralOpening.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateTotal(assetsData, "acquisitions").toLocaleString(
                  "fr-FR"
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateTotal(assetsData, "transfersIn").toLocaleString(
                  "fr-FR"
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateTotal(assetsData, "revaluation").toLocaleString(
                  "fr-FR"
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateTotal(assetsData, "disposals").toLocaleString(
                  "fr-FR"
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateTotal(assetsData, "transfersOut").toLocaleString(
                  "fr-FR"
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right font-bold">
                {totalGeneralClosing.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Légende et Commentaires */}
        <div className="p-2 pt-4 flex flex-col gap-1 border-t-0 border border-gray-400">
          <div className="text-[10px] italic">
            (*) L : Crédit-bail immobilier; M : Crédit-bail mobilier; A : Autres
            contrats (détailler le poste si montants significatifs).
          </div>
          <div className="font-bold underline text-sm mt-2">Commentaires:</div>
          <ul className="list-disc pl-5 italic text-[10px] text-gray-600 mb-2">
            <li>
              Commentaire: indiquer la nature du bien, le nom du bailleur et la
              durée du bail.
            </li>
          </ul>
          {isEditing ? (
            <textarea
              className="w-full h-16 p-2 border border-blue-300 bg-blue-50 text-xs focus:outline-none resize-none"
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

        {/* Footer Numéro de page simulé */}
        <div className="mt-auto text-center text-sm pt-4">
          <span className="font-bold">Feuille : </span> 17
        </div>
      </div>
    </div>
  );
};

export default Note3B;
