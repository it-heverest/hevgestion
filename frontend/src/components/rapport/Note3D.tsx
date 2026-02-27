import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  // --- Données (État initial basé sur l'image Note3D.png) ---

  const initialAssetData: AssetRow[] = [
    // 1. IMMOBILISATIONS INCORPORELLES
    {
      id: "1",
      label: "Frais de développement et de prospection",
      grossAmount: 150000,
      amortizations: 50000,
      netValue: 100000,
      sellingPrice: 120000,
      gainsLosses: 20000,
    },
    {
      id: "2",
      label: "Brevets, licencees, logiciels et droits similaires",
      grossAmount: 80000,
      amortizations: 20000,
      netValue: 60000,
      sellingPrice: 50000,
      gainsLosses: -10000,
    },
    {
      id: "3",
      label: "Fonds commercial et droit au bail",
      grossAmount: 0,
      amortizations: 0,
      netValue: 0,
      sellingPrice: 0,
      gainsLosses: 0,
    },
    {
      id: "4",
      label: "Autres immobilisations incorporelles",
      grossAmount: 10000,
      amortizations: 1000,
      netValue: 9000,
      sellingPrice: 10000,
      gainsLosses: 1000,
    },

    // 2. IMMOBILISATIONS CORPORELLES
    {
      id: "5",
      label: "Terrains",
      grossAmount: 500000,
      amortizations: 0,
      netValue: 500000,
      sellingPrice: 550000,
      gainsLosses: 50000,
    },
    {
      id: "6",
      label: "Bâtiments",
      grossAmount: 300000,
      amortizations: 100000,
      netValue: 200000,
      sellingPrice: 220000,
      gainsLosses: 20000,
    },
    {
      id: "7",
      label: "Aménagements, agencements",
      grossAmount: 20000,
      amortizations: 5000,
      netValue: 15000,
      sellingPrice: 10000,
      gainsLosses: -5000,
    },
    {
      id: "8",
      label: "Matériel, boblier et actifs biologiques",
      grossAmount: 40000,
      amortizations: 15000,
      netValue: 25000,
      sellingPrice: 30000,
      gainsLosses: 5000,
    },
    {
      id: "9",
      label: "Matériel de transport",
      grossAmount: 70000,
      amortizations: 30000,
      netValue: 40000,
      sellingPrice: 35000,
      gainsLosses: -5000,
    },

    // 3. IMMOBILISATIONS FINANCIÈRES
    {
      id: "10",
      label: "Titres de participations",
      grossAmount: 100000,
      amortizations: 0,
      netValue: 100000,
      sellingPrice: 100000,
      gainsLosses: 0,
    },
    {
      id: "11",
      label: "Autres immobilisations financières",
      grossAmount: 5000,
      amortizations: 0,
      netValue: 5000,
      sellingPrice: 5000,
      gainsLosses: 0,
    },
  ];

  const [assetData, setAssetData] = useState<AssetRow[]>(initialAssetData);

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

  // Les IDs pour chaque sous-total (basé sur initialAssetData)
  const incorporelIds = ["1", "2", "3", "4"];
  const corporelIds = ["5", "6", "7", "8", "9"];
  const financierIds = ["10", "11"];

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

  // --- Rendu des Lignes ---

  const renderAssetRow = (row: AssetRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2 font-bold text-xs">
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
      <td className="border border-gray-400 p-1 text-right bg-gray-100">
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
        className={`border border-gray-400 p-1 text-right font-bold ${
          row.gainsLosses > 0
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
    <tr className="bg-gray-300 font-bold h-7">
      <td colSpan={2} className="border border-gray-400 p-1 pl-2 text-sm">
        {title}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {data.grossAmount?.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {data.amortizations?.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right bg-gray-200">
        {data.netValue?.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {data.sellingPrice?.toLocaleString("fr-FR")}
      </td>
      <td
        className={`border border-gray-400 p-1 text-right ${
          (data.gainsLosses || 0) > 0 ? "text-green-800" : ""
        }`}
      >
        {data.gainsLosses?.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow-lg">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Prévisualiser Rapport : Note 3D
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white font-medium transition duration-200 shadow-md ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={18} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
              </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition duration-200 shadow-md"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-300"
      >
        {/* En-tête du document */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b border-gray-300 pb-2">
          <div className="flex gap-2 items-center">
            <span className="font-bold w-32">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1 focus:outline-none"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end items-center">
            <span className="font-bold">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1 text-center focus:outline-none"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold w-32">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1 focus:outline-none"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end items-center">
            <span className="font-bold">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1 text-center focus:outline-none"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-200 border border-gray-400 py-1 text-center font-bold text-sm mb-0">
          NOTE 3D <br /> IMMOBILISATIONS : PLUS-VALUES ET MOINS-VALUES DE
          CESSION
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[10px] table-fixed">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 w-[5%]"
              ></th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[25%]">
                Désignation
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[14%]">
                MONTANT BRUT <br /> A
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[14%]">
                AMORTISSEMENTS PRATIQUES <br /> B
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[14%]">
                VALEUR COMPTABLE NETTE <br /> C = A - B
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[14%]">
                PRIX DE CESSION <br /> D
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[14%]">
                PLUS-VALUES OU MOINS-VALUES <br /> E = D - C
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 1. IMMOBILISATIONS INCORPORELLES */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={7} className="border border-gray-400 p-1 pl-2">
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
              <td colSpan={7} className="h-2"></td>
            </tr>

            {/* 2. IMMOBILISATIONS CORPORELLES */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={7} className="border border-gray-400 p-1 pl-2">
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
              <td colSpan={7} className="h-2"></td>
            </tr>

            {/* 3. IMMOBILISATIONS FINANCIÈRES */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={7} className="border border-gray-400 p-1 pl-2">
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

            {/* Ligne vide de séparation */}
            <tr>
              <td colSpan={7} className="h-2"></td>
            </tr>

            {/* TOTAL GÉNÉRAL */}
            <tr className="bg-gray-400 text-black font-extrabold text-sm h-8 border-t-2 border-black">
              <td
                colSpan={2}
                className="border border-gray-400 p-2 text-center"
              >
                TOTAL GENERAL
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalGeneral.grossAmount.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalGeneral.amortizations.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right bg-gray-300">
                {totalGeneral.netValue.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalGeneral.sellingPrice.toLocaleString("fr-FR")}
              </td>
              <td
                className={`border border-gray-400 p-2 text-right ${
                  totalGeneral.gainsLosses > 0
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {totalGeneral.gainsLosses.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire Footer */}
        <div className="border border-gray-400 border-t-0 p-2 bg-white flex flex-col gap-1 mt-4">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-12 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none text-xs"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap text-xs">
              {comment}
            </div>
          )}
        </div>

        {/* Justification Footer */}
        <div className="border border-gray-400 p-2 bg-gray-50 flex flex-col gap-1 mt-2">
          {isEditing ? (
            <textarea
              className="w-full h-12 p-1 border border-blue-300 bg-blue-100 focus:outline-none resize-none text-xs italic"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap text-xs italic">
              {justification}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note3D;
