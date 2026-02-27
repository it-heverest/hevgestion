import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    "Les amortissements sont calculés selon la méthode linéaire sur la durée d'utilisation estimée des immobilisations."
  );

  // État de l'en-tête
  const [headerInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  // État des données
  const [amortizationData, setAmortizationData] = useState<AmortizationRow[]>([
    // IMMOBILISATIONS INCORPORELLES
    {
      id: "I_HEADER",
      label: "IMMOBILISATIONS INCORPORELLES",
      isSubHeader: true,
      openingCumulative: 0,
      augmentations: 0,
      diminutions: 0,
    },
    {
      id: "I_1",
      label: "Frais de développement et de prospection",
      openingCumulative: 500,
      augmentations: 100,
      diminutions: 0,
    },
    {
      id: "I_2",
      label: "Brevets, licences, logiciels et droits similaires",
      openingCumulative: 1500,
      augmentations: 300,
      diminutions: 0,
    },
    {
      id: "I_3",
      label: "Fonds commercial et droit de bail",
      openingCumulative: 0,
      augmentations: 0,
      diminutions: 0,
    },
    {
      id: "I_4",
      label: "Autres immobilisations incorporelles",
      openingCumulative: 200,
      augmentations: 40,
      diminutions: 0,
    },

    // IMMOBILISATIONS CORPORELLES
    {
      id: "C_HEADER",
      label: "IMMOBILISATIONS CORPORELLES",
      isSubHeader: true,
      openingCumulative: 0,
      augmentations: 0,
      diminutions: 0,
    },
    {
      id: "C_1",
      label: "Terrains hors immeubles de placement",
      openingCumulative: 0,
      augmentations: 0,
      diminutions: 0,
    },
    {
      id: "C_2",
      label: "Terrains - immeubles de placement",
      openingCumulative: 0,
      augmentations: 0,
      diminutions: 0,
    },
    {
      id: "C_3",
      label: "Bâtiments hors immeubles de placement",
      openingCumulative: 10000,
      augmentations: 2000,
      diminutions: 0,
    },
    {
      id: "C_4",
      label: "Bâtiments - immeubles de placement",
      openingCumulative: 0,
      augmentations: 0,
      diminutions: 0,
    },
    {
      id: "C_5",
      label: "Aménagements, agencements et installations",
      openingCumulative: 5000,
      augmentations: 500,
      diminutions: 0,
    },
    {
      id: "C_6",
      label: "Matériel, mobilier et actif biologiques",
      openingCumulative: 12000,
      augmentations: 1200,
      diminutions: 0,
    },
    {
      id: "C_7",
      label: "Matériel de transport",
      openingCumulative: 8000,
      augmentations: 1600,
      diminutions: 0,
    },
  ]);

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
    field: keyof AmortizationRow
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
    (row) => row.id.startsWith("I_") && !row.isSubHeader
  );
  const corporeal = amortizationData.filter(
    (row) => row.id.startsWith("C_") && !row.isSubHeader
  );

  // Calcul des totaux
  const incorporealOpening = calculateSectionTotal(
    incorporeal,
    "openingCumulative"
  );
  const incorporealAugmentations = calculateSectionTotal(
    incorporeal,
    "augmentations"
  );
  const incorporealDiminutions = calculateSectionTotal(
    incorporeal,
    "diminutions"
  );
  const incorporealClosing =
    incorporealOpening + incorporealAugmentations - incorporealDiminutions;

  const corporealOpening = calculateSectionTotal(
    corporeal,
    "openingCumulative"
  );
  const corporealAugmentations = calculateSectionTotal(
    corporeal,
    "augmentations"
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
    value: string
  ) => {
    setAmortizationData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  // Handler PDF
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

  const renderDataCell = (
    row: AmortizationRow,
    field: keyof AmortizationRow
  ) => {
    const value = row[field] as number;

    if (row.isSubHeader) {
      return (
        <td
          className="border border-gray-400 p-1 text-center bg-gray-100 font-bold"
          colSpan={5}
        >
          {row.label}
        </td>
      );
    }

    return (
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => handleValueChange(row.id, field, e.target.value)}
            className="w-full text-right bg-blue-50 px-1 focus:outline-none border border-gray-300 rounded"
          />
        ) : (
          value.toLocaleString("fr-FR")
        )}
      </td>
    );
  };

  const renderRow = (row: AmortizationRow, index: number) => {
    if (row.isSubHeader) {
      return (
        <tr
          key={row.id}
          className={index === 0 ? "" : "border-t-2 border-gray-400"}
        >
          <td
            colSpan={5}
            className="font-bold p-1 pl-2 bg-gray-100 border border-gray-400"
          >
            {row.label}
          </td>
        </tr>
      );
    }

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
              className="w-full text-right bg-blue-50 px-1 focus:outline-none border border-gray-300 rounded"
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
              className="w-full text-right bg-blue-50 px-1 focus:outline-none border border-gray-300 rounded"
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
              className="w-full text-right bg-blue-50 px-1 focus:outline-none border border-gray-300 rounded"
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-xs">
      {/* Barre d'outils */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center bg-white p-3 rounded shadow">
        <h1 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Note 3C - Immobilisation (Amortissements)
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-white transition text-sm ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={16} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={16} /> Éditer
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          >
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-lg p-5 border border-gray-300"
      >
        {/* Numéro de page (en haut à droite) */}
        <div className="text-right font-bold text-sm mb-1">18</div>

        {/* En-tête informations */}
        <div className="mb-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center">
              <span className="font-medium whitespace-nowrap mr-2">
                Désignation entité :
              </span>
              <span className="border-b border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium whitespace-nowrap mr-2">
                Exercice clos le 31-12-
              </span>
              <span className="border-b border-gray-400 flex-1">
                {headerInfo.fiscalYear}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium whitespace-nowrap mr-2">
                Numéro d'identification :
              </span>
              <span className="border-b border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium whitespace-nowrap mr-2">
                Durée (en mois) :
              </span>
              <span className="border-b border-gray-400 flex-1">
                {headerInfo.duration}
              </span>
            </div>
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
              {/* En-tête avec cellule diagonale */}
              <tr className="bg-gray-700 text-white">
                {/* Cellule diagonale */}
                <th
                  className="border border-gray-600 p-0 align-bottom relative"
                  style={{ width: "200px" }}
                >
                  <div className="relative h-16 w-full">
                    <div className="absolute bottom-0 left-0 w-full h-16 flex items-end">
                      <div className="w-full text-left pl-1 pb-1">
                        RUBRIQUES
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 h-full w-16 flex items-start justify-end">
                      <div className="transform -rotate-90 origin-top-right whitespace-nowrap pr-1 pt-1">
                        SITUATION ET MOUVEMENTS
                      </div>
                    </div>
                    {/* Ligne diagonale */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 right-0 w-0.5 h-full bg-gray-600 transform rotate-45 origin-top"></div>
                    </div>
                  </div>
                </th>

                {/* Colonne A */}
                <th
                  className="border border-gray-600 p-1 text-center align-top"
                  style={{ width: "80px" }}
                >
                  <div className="font-bold">A</div>
                  <div className="text-[7px] leading-tight mt-1">
                    AMORTISSEMENTS CUMULES À L'OUVERTURE DE L'EXERCICE
                  </div>
                </th>

                {/* Colonne B */}
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

                {/* Colonne C */}
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

                {/* Colonne D */}
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
              {/* Rendu des données */}
              {amortizationData.map((row, index) => renderRow(row, index))}

              {/* SOUS TOTAL : IMMOBILISATIONS INCORPORELLES */}
              <tr className="bg-gray-200 font-bold">
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

              {/* SOUS TOTAL : IMMOBILISATIONS CORPORELLES */}
              <tr className="bg-gray-200 font-bold">
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

              {/* TOTAL GENERAL */}
              <tr className="bg-gray-700 text-white font-bold">
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
                <td className="border border-gray-600 p-1 text-right">
                  {grandTotalClosing.toLocaleString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commentaires */}
        <div className="mt-3">
          <div className="font-bold text-xs border-b border-gray-400 pb-1">
            Commentaires :
          </div>
          <div className="mt-1">
            {isEditing ? (
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Saisir vos commentaires ici..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            ) : (
              <div className="border border-gray-300 rounded p-2 min-h-20 text-xs bg-gray-50">
                {comment}
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-600">
            <div className="font-semibold mb-1">Indiquer :</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Les modes d'amortissement utilisés</li>
              <li>Le calendrier et l'échéancier des amortissements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationReport;
