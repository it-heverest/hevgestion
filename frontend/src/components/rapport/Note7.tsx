import React, { useState, useRef, useMemo } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Interfaces ---

interface ClientRow {
  id: string;
  label: string;
  yearN: number; // Année N
  yearNMinus1: number; // Année N-1
  oneYearOrLess: number; // Créances à un an au plus
  oneToTwoYears: number; // Créances à plus d'un an et à deux ans au plus
  moreThanTwoYears: number; // Créances à plus de deux ans
}

interface CreditorRow {
  id: string;
  label: string;
  amount: number;
}

interface HeaderData {
  entityName: string;
  idNumber: string;
  fiscalYear: string;
  duration: string;
}

// --- Composant Principal ---

const Note7Clients: React.FC = () => {
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

  // --- Données (État initial basé sur l'image Note 7) ---

  // Section Créances Clients (Lignes 14 à 21)
  const [clientReceivables, setClientReceivables] = useState<ClientRow[]>([
    {
      id: "14",
      label: "Clients (hors réserves de propriété Groupe)",
      yearN: 150000,
      yearNMinus1: 140000,
      oneYearOrLess: 80000,
      oneToTwoYears: 50000,
      moreThanTwoYears: 20000,
    },
    {
      id: "15",
      label: "Clients effets à recevoir (hors réserves de propriété Groupe)",
      yearN: 50000,
      yearNMinus1: 45000,
      oneYearOrLess: 30000,
      oneToTwoYears: 15000,
      moreThanTwoYears: 5000,
    },
    {
      id: "16",
      label: "Clients et effets à recevoir avec réserves de propriété",
      yearN: 20000,
      yearNMinus1: 18000,
      oneYearOrLess: 10000,
      oneToTwoYears: 8000,
      moreThanTwoYears: 2000,
    },
    {
      id: "17",
      label: "Clients et effets à recevoir Groupe",
      yearN: 10000,
      yearNMinus1: 12000,
      oneYearOrLess: 6000,
      oneToTwoYears: 3000,
      moreThanTwoYears: 1000,
    },
    {
      id: "18",
      label: "Créances sur cession d'immobilisations",
      yearN: 5000,
      yearNMinus1: 6000,
      oneYearOrLess: 5000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "19",
      label: "Clients effets escomptés et non échus",
      yearN: 10000,
      yearNMinus1: 8000,
      oneYearOrLess: 10000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "20",
      label: "Créances litigieuses ou douteuses",
      yearN: 8000,
      yearNMinus1: 7000,
      oneYearOrLess: 8000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
    {
      id: "21",
      label: "Clients produits à recevoir",
      yearN: 12000,
      yearNMinus1: 10000,
      oneYearOrLess: 12000,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    },
  ]);

  // Dépréciations et Total Net
  const [depreciations, setDepreciations] = useState<number>(15000); // Ligne 24

  // Créanciers Clients (Lignes 28 à 30)
  const [clientCreditors, setClientCreditors] = useState<CreditorRow[]>([
    {
      id: "28",
      label: "Clients, avances reçues hors groupe",
      amount: 10000,
    },
    {
      id: "29",
      label: "Clients, avances reçues groupe",
      amount: 5000,
    },
    {
      id: "30",
      label: "Autres clients créditeurs",
      amount: 3000,
    },
  ]);

  // --- Helpers de calcul ---

  const calculateTotal = (data: ClientRow[], field: keyof ClientRow) => {
    return data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
  };

  const calculateCreditorTotal = (data: CreditorRow[]) => {
    return data.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
  };

  // Totaux calculés
  const totalBrutClients = useMemo(
    () => calculateTotal(clientReceivables, "yearN"),
    [clientReceivables]
  );
  const totalNetDepreciation = useMemo(
    () => totalBrutClients - depreciations,
    [totalBrutClients, depreciations]
  );
  const totalYearNMinus1 = useMemo(
    () => calculateTotal(clientReceivables, "yearNMinus1"),
    [clientReceivables]
  );
  const totalOneYearOrLess = useMemo(
    () => calculateTotal(clientReceivables, "oneYearOrLess"),
    [clientReceivables]
  );
  const totalOneToTwoYears = useMemo(
    () => calculateTotal(clientReceivables, "oneToTwoYears"),
    [clientReceivables]
  );
  const totalMoreThanTwoYears = useMemo(
    () => calculateTotal(clientReceivables, "moreThanTwoYears"),
    [clientReceivables]
  );
  const totalClientsCrediteurs = useMemo(
    () => calculateCreditorTotal(clientCreditors),
    [clientCreditors]
  );

  // --- Handlers ---

  const handleClientChange = (
    id: string,
    field: keyof ClientRow,
    value: string
  ) => {
    setClientReceivables((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "label" ? value : Number(value) || 0, // Gérer le cas où la valeur est vide
            }
          : row
      )
    );
  };

  const handleCreditorChange = (
    id: string,
    field: keyof CreditorRow,
    value: string
  ) => {
    setClientCreditors((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, [field]: field === "label" ? value : Number(value) || 0 }
          : row
      )
    );
  };

  const handleDepreciationChange = (value: string) => {
    setDepreciations(Number(value) || 0);
  };

  const calculateVariationPercentage = (n: number, nMinus1: number): string => {
    if (nMinus1 === 0) return n === 0 ? "0.00%" : "N/A";
    const variation = ((n - nMinus1) / nMinus1) * 100;
    return `${variation.toFixed(2)}%`;
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        // Optionnel: ajouter une petite attente pour s'assurer que le rendu n'est plus en mode édition
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("rapport_note_7_clients.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu des Lignes ---

  const renderClientRow = (row: ClientRow) => {
    const variation = calculateVariationPercentage(row.yearN, row.yearNMinus1);
    return (
      <tr key={row.id}>
        {/* Libellés */}
        <td className="border border-gray-400 p-1 pl-2 font-medium bg-gray-50/50">
          {row.label}
        </td>

        {/* Année N */}
        <td className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row.yearN}
              onChange={(e) =>
                handleClientChange(row.id, "yearN", e.target.value)
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
                handleClientChange(row.id, "yearNMinus1", e.target.value)
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
                handleClientChange(row.id, "oneYearOrLess", e.target.value)
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
                handleClientChange(row.id, "oneToTwoYears", e.target.value)
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
                handleClientChange(row.id, "moreThanTwoYears", e.target.value)
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

  const renderCreditorRow = (row: CreditorRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2" colSpan={3}>
        {row.label}
      </td>
      <td
        className="border border-gray-400 p-1 text-right font-bold"
        colSpan={4}
      >
        {isEditing ? (
          <input
            type="number"
            value={row.amount}
            onChange={(e) =>
              handleCreditorChange(row.id, "amount", e.target.value)
            }
            className="w-full text-right bg-blue-50 focus:outline-none"
          />
        ) : (
          row.amount.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-yellow-600" />
          Note 7 - Clients (Prévisualisation Rapport)
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
          NOTE 7 <br /> CLIENTS
        </div>

        {/* Tableau Principal des Créances Clients */}
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
            {/* Lignes de Créances Clients */}
            {clientReceivables.map(renderClientRow)}

            {/* TOTAL BRUT CLIENTS */}
            <tr className="bg-gray-400 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL BRUT CLIENTS
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalBrutClients.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalYearNMinus1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-center">
                {calculateVariationPercentage(
                  totalBrutClients,
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

            {/* Dépréciations des comptes clients */}
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Dépréciations des comptes clients
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
              <td className="border border-gray-400 p-1 text-right bg-white"></td>
              <td
                className="border border-gray-400 p-1 text-right bg-white"
                colSpan={4}
              ></td>
            </tr>

            {/* TOTAL NET DE DEPRECIATION */}
            <tr className="bg-gray-500 font-bold text-white">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalNetDepreciation.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td
                className="border border-gray-400 p-1 text-right"
                colSpan={4}
              ></td>
            </tr>

            {/* Ligne vide pour l'espacement */}
            <tr>
              <td className="p-1" colSpan={7}></td>
            </tr>

            {/* Clients Créditeurs (Regroupement visuel) */}
            <tr>
              <td className="font-bold underline p-1 pt-2" colSpan={7}>
                Clients Créditeurs:
              </td>
            </tr>
            {clientCreditors.map(renderCreditorRow)}

            {/* TOTAL CLIENTS CREDITEURS */}
            <tr className="bg-gray-400 font-bold">
              <td className="border border-gray-400 p-1 pl-2" colSpan={3}>
                TOTAL CLIENTS CREDITEURS
              </td>
              <td className="border border-gray-400 p-1 text-right" colSpan={4}>
                {totalClientsCrediteurs.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire Footer */}
        <div className="border border-gray-400 border-t-0 p-2 bg-white flex flex-col gap-1 mt-0">
          <div className="font-bold underline">Commentaire:</div>
          {isEditing ? (
            <textarea
              className="w-full h-16 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note7Clients;
