import React, { useState, useRef, useMemo } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Interfaces ---

interface ReceivableRow {
  id: string;
  label: string;
  yearN: number; // Année N
  yearNMinus1: number; // Année N-1
  oneYearOrLess: number; // Créances à un an au plus
  oneToTwoYears: number; // Créances à plus d'un an et à deux ans au plus
  moreThanTwoYears: number; // Créances à plus de deux ans
}

interface HeaderData {
  entityName: string;
  idNumber: string;
  fiscalYear: string;
  duration: string;
}

// --- Composant Principal ---

const Note8AutresCreances: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");

  // En-tête (Initialisation par défaut)
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2025",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  // --- Données (État initial basé sur l'image Note 8) ---

  // Section Créances (Lignes 9 à 18)
  const [otherReceivables, setOtherReceivables] = useState<ReceivableRow[]>([
    {
      id: "9",
      label: "Personnel",
      yearN: 5000,
      yearNMinus1: 4500,
      oneYearOrLess: 5000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "10",
      label: "Organismes sociaux",
      yearN: 12000,
      yearNMinus1: 10000,
      oneYearOrLess: 10000,
      oneToTwoYears: 2000,
      moreThanTwoYears: 0,
    },
    {
      id: "11",
      label: "État et Collectivités publiques",
      yearN: 25000,
      yearNMinus1: 20000,
      oneYearOrLess: 15000,
      oneToTwoYears: 8000,
      moreThanTwoYears: 2000,
    },
    {
      id: "12",
      label: "Organismes internationaux",
      yearN: 3000,
      yearNMinus1: 3500,
      oneYearOrLess: 3000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "13",
      label: "Apporteurs, associés et groupe",
      yearN: 1500,
      yearNMinus1: 1800,
      oneYearOrLess: 1500,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "14",
      label:
        "Compte transitoire ajustement spécial lié à la révision du SYSCOHADA",
      yearN: 0,
      yearNMinus1: 0,
      oneYearOrLess: 0,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "15",
      label: "Autres débiteurs divers",
      yearN: 8000,
      yearNMinus1: 7500,
      oneYearOrLess: 6000,
      oneToTwoYears: 1000,
      moreThanTwoYears: 1000,
    },
    {
      id: "16",
      label:
        "Comptes permanents non bloqués des établissements et des succursales",
      yearN: 4000,
      yearNMinus1: 4200,
      oneYearOrLess: 4000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "17",
      label: "Comptes de liaison charges et produits",
      yearN: 2000,
      yearNMinus1: 1900,
      oneYearOrLess: 2000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "18",
      label: "Comptes de liaison des sociétés en participation",
      yearN: 1000,
      yearNMinus1: 1000,
      oneYearOrLess: 1000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
  ]);

  // Dépréciations
  const [depreciations, setDepreciations] = useState<number>(500); // Ligne 21

  // Commentaire sur les justifications
  const [justifications, setJustifications] = useState({
    justificationVariation: "",
    justificationMontant: "",
    justificationAnciennes: "",
    justificationDepreciation: "",
    justificationCompteTransitoire: "",
  });

  // --- Helpers de calcul ---

  const calculateTotal = (
    data: ReceivableRow[],
    field: keyof ReceivableRow
  ) => {
    return data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
  };

  // Totaux calculés
  const totalBrutAutresCreances = useMemo(
    () => calculateTotal(otherReceivables, "yearN"),
    [otherReceivables]
  );
  const totalYearNMinus1 = useMemo(
    () => calculateTotal(otherReceivables, "yearNMinus1"),
    [otherReceivables]
  );
  const totalNetDepreciation = useMemo(
    () => totalBrutAutresCreances - depreciations,
    [totalBrutAutresCreances, depreciations]
  );
  const totalOneYearOrLess = useMemo(
    () => calculateTotal(otherReceivables, "oneYearOrLess"),
    [otherReceivables]
  );
  const totalOneToTwoYears = useMemo(
    () => calculateTotal(otherReceivables, "oneToTwoYears"),
    [otherReceivables]
  );
  const totalMoreThanTwoYears = useMemo(
    () => calculateTotal(otherReceivables, "moreThanTwoYears"),
    [otherReceivables]
  );

  const calculateVariationPercentage = (n: number, nMinus1: number): string => {
    if (nMinus1 === 0) return n === 0 ? "0.00%" : "N/A";
    const variation = ((n - nMinus1) / nMinus1) * 100;
    return `${variation.toFixed(2)}%`;
  };

  // --- Handlers ---

  const handleReceivableChange = (
    id: string,
    field: keyof ReceivableRow,
    value: string
  ) => {
    setOtherReceivables((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "label" ? value : Number(value) || 0,
            }
          : row
      )
    );
  };

  const handleDepreciationChange = (value: string) => {
    setDepreciations(Number(value) || 0);
  };

  const handleJustificationChange = (
    field: keyof typeof justifications,
    value: string
  ) => {
    setJustifications((prev) => ({ ...prev, [field]: value }));
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
        pdf.save("rapport_note_8_autres_creances.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu des Lignes ---

  const renderReceivableRow = (row: ReceivableRow) => {
    const variation = calculateVariationPercentage(row.yearN, row.yearNMinus1);
    return (
      <tr key={row.id}>
        {/* Libellés */}
        <td className="border border-gray-400 p-1 pl-2 font-medium">
          {row.label}
        </td>

        {/* Année N */}
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row.yearN}
              onChange={(e) =>
                handleReceivableChange(row.id, "yearN", e.target.value)
              }
              className="w-full text-right bg-blue-50 focus:outline-none"
            />
          ) : (
            row.yearN.toLocaleString("fr-FR")
          )}
        </td>

        {/* Année N-1 */}
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row.yearNMinus1}
              onChange={(e) =>
                handleReceivableChange(row.id, "yearNMinus1", e.target.value)
              }
              className="w-full text-right bg-blue-50 focus:outline-none"
            />
          ) : (
            row.yearNMinus1.toLocaleString("fr-FR")
          )}
        </td>

        {/* Variation en % (Calculée) */}
        <td className="border border-gray-400 p-1 text-center font-bold text-gray-700 bg-gray-100">
          {variation}
        </td>

        {/* Créances à un an au plus */}
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row.oneYearOrLess}
              onChange={(e) =>
                handleReceivableChange(row.id, "oneYearOrLess", e.target.value)
              }
              className="w-full text-right bg-blue-50 focus:outline-none"
            />
          ) : (
            row.oneYearOrLess.toLocaleString("fr-FR")
          )}
        </td>

        {/* Créances à plus d'un an et à deux ans au plus */}
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row.oneToTwoYears}
              onChange={(e) =>
                handleReceivableChange(row.id, "oneToTwoYears", e.target.value)
              }
              className="w-full text-right bg-blue-50 focus:outline-none"
            />
          ) : (
            row.oneToTwoYears.toLocaleString("fr-FR")
          )}
        </td>

        {/* Créances à plus de deux ans */}
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row.moreThanTwoYears}
              onChange={(e) =>
                handleReceivableChange(
                  row.id,
                  "moreThanTwoYears",
                  e.target.value
                )
              }
              className="w-full text-right bg-blue-50 focus:outline-none"
            />
          ) : (
            row.moreThanTwoYears.toLocaleString("fr-FR")
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          Note 8 - Autres Créances (Prévisualisation Rapport)
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">21</div>

        {/* En-tête de la note */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 pb-2 text-sm">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold text-sm mb-0">
          NOTE 8 <br /> AUTRES CRÉANCES
        </div>

        {/* Tableau Principal des Autres Créances */}
        <table className="w-full border-collapse border border-gray-400 text-[10px]">
          <thead>
            <tr className="bg-gray-200">
              <th rowSpan={2} className="border border-gray-400 p-1 w-[25%]">
                Libellés
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[12%]">
                Année N
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[12%]">
                Année N-1
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[8%]">
                Variation en %
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-1 text-center bg-gray-300"
              >
                ÉCHÉANCIER (Année N)
              </th>
            </tr>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-1 w-[14%]">
                Créances à un an au plus
              </th>
              <th className="border border-gray-400 p-1 w-[14%]">
                Créances à plus d'un an et à deux ans au plus
              </th>
              <th className="border border-gray-400 p-1 w-[14%]">
                Créances à plus de deux ans
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Lignes de Créances */}
            {otherReceivables.map(renderReceivableRow)}

            {/* TOTAL BRUT AUTRES CREANCES (Ligne 19) */}
            <tr className="bg-gray-400 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL BRUT AUTRES CRÉANCES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalBrutAutresCreances.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearNMinus1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-center">
                {calculateVariationPercentage(
                  totalBrutAutresCreances,
                  totalYearNMinus1
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalOneYearOrLess.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalOneToTwoYears.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalMoreThanTwoYears.toLocaleString("fr-FR")}
              </td>
            </tr>

            {/* Dépréciations des autres créances (Ligne 21) */}
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Dépréciations des autres créances
              </td>
              <td className="border border-gray-400 p-1 text-right bg-red-50/50">
                {isEditing ? (
                  <input
                    type="number"
                    value={depreciations}
                    onChange={(e) => handleDepreciationChange(e.target.value)}
                    className="w-full text-right bg-blue-50 focus:outline-none"
                  />
                ) : (
                  depreciations.toLocaleString("fr-FR")
                )}
              </td>
              <td
                className="border border-gray-400 p-1 text-right bg-white"
                colSpan={5}
              ></td>
            </tr>

            {/* TOTAL NET DE DEPRECIATION (Ligne 23) */}
            <tr className="bg-gray-500 font-bold text-white">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalNetDepreciation.toLocaleString("fr-FR")}
              </td>
              <td
                className="border border-gray-400 p-1 text-right"
                colSpan={5}
              ></td>
            </tr>
          </tbody>
        </table>

        {/* Section Commentaires (Lignes 25 à 31) */}
        <div className="mt-4 border border-gray-400 border-t-0 p-2 bg-white flex flex-col gap-1">
          <div className="font-bold underline text-sm mb-1">Commentaire:</div>

          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1 border-r border-gray-300 pr-2">
              <p className="font-semibold text-gray-700">
                Justifications détaillées (Éléments Lignes 26-31):
              </p>
            </div>
            <div className="col-span-3">
              {/* Ligne 26: Justifier toute variation significative. */}
              <div className="flex items-start mb-1">
                <span className="w-1/3 font-medium text-gray-600">
                  Justifier toute variation significative.
                </span>
                {isEditing ? (
                  <textarea
                    rows={1}
                    value={justifications.justificationVariation}
                    onChange={(e) =>
                      handleJustificationChange(
                        "justificationVariation",
                        e.target.value
                      )
                    }
                    className="flex-1 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
                  />
                ) : (
                  <span className="flex-1 min-h-[1.5rem] p-1 border-b border-dotted border-gray-400 whitespace-pre-wrap">
                    {justifications.justificationVariation}
                  </span>
                )}
              </div>

              {/* Ligne 28: Détailler les créances dont le montant est significatif. */}
              <div className="flex items-start mb-1">
                <span className="w-1/3 font-medium text-gray-600">
                  Détailler les créances dont le montant est significatif.
                </span>
                {isEditing ? (
                  <textarea
                    rows={1}
                    value={justifications.justificationMontant}
                    onChange={(e) =>
                      handleJustificationChange(
                        "justificationMontant",
                        e.target.value
                      )
                    }
                    className="flex-1 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
                  />
                ) : (
                  <span className="flex-1 min-h-[1.5rem] p-1 border-b border-dotted border-gray-400 whitespace-pre-wrap">
                    {justifications.justificationMontant}
                  </span>
                )}
              </div>

              {/* Ligne 29: Justifier les créances anciennes. */}
              <div className="flex items-start mb-1">
                <span className="w-1/3 font-medium text-gray-600">
                  Justifier les créances anciennes.
                </span>
                {isEditing ? (
                  <textarea
                    rows={1}
                    value={justifications.justificationAnciennes}
                    onChange={(e) =>
                      handleJustificationChange(
                        "justificationAnciennes",
                        e.target.value
                      )
                    }
                    className="flex-1 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
                  />
                ) : (
                  <span className="flex-1 min-h-[1.5rem] p-1 border-b border-dotted border-gray-400 whitespace-pre-wrap">
                    {justifications.justificationAnciennes}
                  </span>
                )}
              </div>

              {/* Ligne 30: Indiquer les événements et circonstances qui ont conduit à la dépréciation et à la reprise. */}
              <div className="flex items-start mb-1">
                <span className="w-1/3 font-medium text-gray-600">
                  Dépréciation et reprise (Événements).
                </span>
                {isEditing ? (
                  <textarea
                    rows={1}
                    value={justifications.justificationDepreciation}
                    onChange={(e) =>
                      handleJustificationChange(
                        "justificationDepreciation",
                        e.target.value
                      )
                    }
                    className="flex-1 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
                  />
                ) : (
                  <span className="flex-1 min-h-[1.5rem] p-1 border-b border-dotted border-gray-400 whitespace-pre-wrap">
                    {justifications.justificationDepreciation}
                  </span>
                )}
              </div>

              {/* Ligne 31: Compte transitoire ajustement spécial, indiquer le détail du compte et la durée restant pour l'apurement. */}
              <div className="flex items-start mb-1">
                <span className="w-1/3 font-medium text-gray-600">
                  Détail Compte transitoire ajustement spécial.
                </span>
                {isEditing ? (
                  <textarea
                    rows={1}
                    value={justifications.justificationCompteTransitoire}
                    onChange={(e) =>
                      handleJustificationChange(
                        "justificationCompteTransitoire",
                        e.target.value
                      )
                    }
                    className="flex-1 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
                  />
                ) : (
                  <span className="flex-1 min-h-[1.5rem] p-1 border-b border-dotted border-gray-400 whitespace-pre-wrap">
                    {justifications.justificationCompteTransitoire}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note8AutresCreances;
