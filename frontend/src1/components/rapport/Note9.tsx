import React, { useState, useRef, useMemo } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Interfaces pour la Note 9 (TITRES DE PLACEMENT) ---

interface HeaderDataNote9 {
  entityName: string;
  idNumber: string;
  fiscalYearEnd: string; // Ex: 2024
  duration: string; // Ex: 12
}

interface TitreRow {
  id: number;
  label: string; // Libellés
  anneeN: number | null; // Année N
  anneeN_1: number | null; // Année N-1
  variation: number | null; // Variation en % (Calculated)
  isTotal?: boolean; // To style total lines differently
}

// --- Composant Principal (Note 9) ---

const Note9: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête (Pre-filled for example)
  const [headerInfo, setHeaderInfo] = useState<HeaderDataNote9>({
    entityName: "Désignation entité B",
    idNumber: "N° ID B456",
    fiscalYearEnd: "2024",
    duration: "12",
  });

  // Données
  const initialData: Omit<TitreRow, "variation">[] = [
    {
      id: 1,
      label: "Titres de trésor et bons de caisse à court terme",
      anneeN: 500000,
      anneeN_1: 450000,
    },
    { id: 2, label: "Actions", anneeN: 150000, anneeN_1: 100000 },
    { id: 3, label: "Obligations", anneeN: 200000, anneeN_1: 200000 },
    { id: 4, label: "Bons de souscription", anneeN: 0, anneeN_1: 0 },
    {
      id: 5,
      label: "Titres négociables hors régions",
      anneeN: 50000,
      anneeN_1: 0,
    },
    { id: 6, label: "Intérêts courus", anneeN: 5000, anneeN_1: 2000 },
    {
      id: 7,
      label: "Autres valeurs assimilées",
      anneeN: 10000,
      anneeN_1: 5000,
    },
  ];

  const [rows, setRows] = useState<Omit<TitreRow, "variation">[]>(initialData);
  const [depreciations, setDepreciations] = useState<{
    anneeN: number | null;
    anneeN_1: number | null;
  }>({
    anneeN: 20000, // Dépréciations des titres
    anneeN_1: 15000,
  });

  const [comment, setComment] = useState<string>("");

  // --- Calculs automatiques des totaux et variations ---

  const calculatedData: TitreRow[] = useMemo(() => {
    const dataWithVariation: TitreRow[] = rows.map((row) => {
      let variation: number | null = null;
      if (row.anneeN !== null && row.anneeN_1 !== null && row.anneeN_1 !== 0) {
        variation = ((row.anneeN - row.anneeN_1) / row.anneeN_1) * 100;
      }
      return { ...row, variation };
    });

    const totalBrutN = dataWithVariation.reduce(
      (sum, row) => sum + (row.anneeN || 0),
      0
    );
    const totalBrutN_1 = dataWithVariation.reduce(
      (sum, row) => sum + (row.anneeN_1 || 0),
      0
    );

    let variationBrut: number | null = null;
    if (totalBrutN_1 !== 0) {
      variationBrut = ((totalBrutN - totalBrutN_1) / totalBrutN_1) * 100;
    }

    const totalDepreciationN = depreciations.anneeN || 0;
    const totalDepreciationN_1 = depreciations.anneeN_1 || 0;

    const totalNetN = totalBrutN - totalDepreciationN;
    const totalNetN_1 = totalBrutN_1 - totalDepreciationN_1;

    let variationNet: number | null = null;
    if (totalNetN_1 !== 0) {
      variationNet = ((totalNetN - totalNetN_1) / totalNetN_1) * 100;
    }

    // Combine data with Totals and Depreciations
    return [
      ...dataWithVariation,
      // TOTAL BRUT TITRES
      {
        id: 100,
        label: "TOTAL BRUT TITRES",
        anneeN: totalBrutN,
        anneeN_1: totalBrutN_1,
        variation: variationBrut,
        isTotal: true,
      },
      // DÉPRÉCIATIONS
      {
        id: 101,
        label: "Dépréciations des titres",
        anneeN: totalDepreciationN,
        anneeN_1: totalDepreciationN_1,
        variation: null,
      },
      // TOTAL NET
      {
        id: 102,
        label: "TOTAL NET DE DEPRECIATION",
        anneeN: totalNetN,
        anneeN_1: totalNetN_1,
        variation: variationNet,
        isTotal: true,
      },
    ];
  }, [rows, depreciations]);

  // --- Handlers de changement ---

  const handleRowChange = (
    id: number,
    field: "anneeN" | "anneeN_1",
    value: string
  ) => {
    const numValue = value === "" ? null : parseFloat(value);
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: numValue } : row))
    );
  };

  const handleDepreciationChange = (
    field: "anneeN" | "anneeN_1",
    value: string
  ) => {
    const numValue = value === "" ? null : parseFloat(value);
    setDepreciations((prev) => ({ ...prev, [field]: numValue }));
  };

  const formatValue = (value: number | null): string => {
    if (value === null || isNaN(value)) return isEditing ? "" : "";
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null || isNaN(value)) return "";
    return `${value.toFixed(2)} %`;
  };

  // --- Fonction de téléchargement PDF (réutilisée du template) ---

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false); // Disable editing for clean capture

      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("Note9_Titres_Placement.pdf");

        setIsEditing(wasEditing); // Restore editing state
      }, 100);
    }
  };

  // --- Rendu d'une ligne de tableau ---

  const renderRow = (row: TitreRow) => {
    const isTotalBrut = row.label === "TOTAL BRUT TITRES";
    const isTotalNet = row.label === "TOTAL NET DE DEPRECIATION";
    const isDepreciation = row.label === "Dépréciations des titres";
    const isNormalRow = !isTotalBrut && !isTotalNet && !isDepreciation;

    const rowData = isNormalRow
      ? rows.find((r) => r.id === row.id)
      : isDepreciation
      ? depreciations
      : null;

    const bgColorClass = isTotalNet
      ? "bg-gray-700 text-white font-bold" // Darker gray for FINAL total
      : isTotalBrut
      ? "bg-gray-500 text-white font-bold" // Medium gray for BRUT total
      : isDepreciation
      ? "bg-gray-100" // Light gray for depreciation
      : "hover:bg-blue-50";

    return (
      <tr key={row.id} className={bgColorClass}>
        {/* Libellés */}
        <td className={`border border-black p-1 text-left`}>{row.label}</td>

        {/* Année N */}
        <td className="border border-black p-1 text-right w-[20%]">
          {isEditing && rowData && !isTotalBrut && !isTotalNet ? (
            <input
              type="number"
              value={
                (rowData as any).anneeN === null
                  ? ""
                  : (rowData as any).anneeN.toString()
              }
              onChange={(e) =>
                isNormalRow
                  ? handleRowChange(row.id, "anneeN", e.target.value)
                  : handleDepreciationChange("anneeN", e.target.value)
              }
              className="w-full bg-blue-100 focus:outline-none text-right px-1"
            />
          ) : (
            formatValue(row.anneeN)
          )}
        </td>

        {/* Année N-1 */}
        <td className="border border-black p-1 text-right w-[20%]">
          {isEditing && rowData && !isTotalBrut && !isTotalNet ? (
            <input
              type="number"
              value={
                (rowData as any).anneeN_1 === null
                  ? ""
                  : (rowData as any).anneeN_1.toString()
              }
              onChange={(e) =>
                isNormalRow
                  ? handleRowChange(row.id, "anneeN_1", e.target.value)
                  : handleDepreciationChange("anneeN_1", e.target.value)
              }
              className="w-full bg-blue-100 focus:outline-none text-right px-1"
            />
          ) : (
            formatValue(row.anneeN_1)
          )}
        </td>

        {/* Variation en % */}
        <td
          className={`border border-black p-1 text-right w-[15%] ${
            row.variation !== null && row.variation > 0
              ? "text-green-600 font-semibold"
              : row.variation !== null && row.variation < 0
              ? "text-red-600 font-semibold"
              : ""
          } ${isTotalNet || isTotalBrut ? "text-white" : ""}`}
        >
          {formatPercentage(row.variation)}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-yellow-600" />
          NOTE 9 - TITRES DE PLACEMENT
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing ? "bg-green-600" : "bg-blue-600"
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
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 text-[11px] border border-black"
      >
        {/* En-tête (Lignes 1-4) */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex w-[60%]">
              <span className="font-bold w-[30%] shrink-0">
                1. Désignation entité :
              </span>
              <div
                className={`flex-1 ${isEditing ? "" : "border-b border-black"}`}
              >
                {isEditing ? (
                  <input
                    value={headerInfo.entityName}
                    onChange={(e) =>
                      setHeaderInfo({
                        ...headerInfo,
                        entityName: e.target.value,
                      })
                    }
                    className="w-full border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
                  />
                ) : (
                  headerInfo.entityName
                )}
              </div>
            </div>
            <div className="flex w-[40%] pl-4">
              <span className="font-bold shrink-0">
                Exercice clos le 31-12-
              </span>
              <div
                className={`w-16 ml-2 ${
                  isEditing ? "" : "border-b border-black"
                }`}
              >
                {isEditing ? (
                  <input
                    value={headerInfo.fiscalYearEnd}
                    onChange={(e) =>
                      setHeaderInfo({
                        ...headerInfo,
                        fiscalYearEnd: e.target.value,
                      })
                    }
                    className="w-full text-center border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
                  />
                ) : (
                  headerInfo.fiscalYearEnd
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex w-[60%]">
              <span className="font-bold w-[30%] shrink-0">
                2. Numéro d'identification :
              </span>
              <div
                className={`flex-1 ${isEditing ? "" : "border-b border-black"}`}
              >
                {isEditing ? (
                  <input
                    value={headerInfo.idNumber}
                    onChange={(e) =>
                      setHeaderInfo({
                        ...headerInfo,
                        idNumber: e.target.value,
                      })
                    }
                    className="w-full border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
                  />
                ) : (
                  headerInfo.idNumber
                )}
              </div>
            </div>
            <div className="flex w-[40%] pl-4">
              <span className="font-bold shrink-0">Durée (en mois) :</span>
              <div
                className={`w-16 ml-2 ${
                  isEditing ? "" : "border-b border-black"
                }`}
              >
                {isEditing ? (
                  <input
                    value={headerInfo.duration}
                    onChange={(e) =>
                      setHeaderInfo({ ...headerInfo, duration: e.target.value })
                    }
                    className="w-full text-center border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
                  />
                ) : (
                  headerInfo.duration
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Titre Note (Lignes 5-7) */}
        <div className="text-center bg-gray-200 border border-black p-2 my-2">
          <div className="font-bold text-sm">NOTE 9</div>
          <div className="font-bold text-lg">TITRES DE PLACEMENT</div>
        </div>

        {/* Tableau (Lignes 8-19) */}
        <table className="w-full border-collapse border border-black text-[11px] my-1">
          <thead>
            <tr className="bg-gray-400 text-white h-8">
              <th className="border border-black p-1 text-center w-[45%]">
                Libellés
              </th>
              <th className="border border-black p-1 text-center w-[20%]">
                Année N
              </th>
              <th className="border border-black p-1 text-center w-[20%]">
                Année N-1
              </th>
              <th className="border border-black p-1 text-center w-[15%]">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Lignes de données 9-15 */}
            {calculatedData.slice(0, 7).map(renderRow)}
            {/* Ligne 16: TOTAL BRUT TITRES */}
            {renderRow(calculatedData[7])}
            {/* Ligne 17: Dépréciations des titres */}
            {renderRow(calculatedData[8])}
            {/* Ligne 18: TOTAL NET DE DEPRECIATION */}
            {renderRow(calculatedData[9])}
          </tbody>
        </table>

        {/* Commentaire (Lignes 20-26) */}
        <div className="mt-4 border border-black min-h-[150px] p-2 flex flex-col">
          <div className="font-bold mb-1">20. Commentaire :</div>
          <div className="text-xs space-y-2 flex-grow">
            <div>
              <span className="font-semibold">
                22. Justifier toute variation significative:
              </span>
              {isEditing ? (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full h-8 border border-blue-300 bg-blue-50 focus:outline-none p-1 resize-none"
                />
              ) : (
                <p className="border-b border-gray-400 min-h-[1.5em]">
                  {comment}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-semibold block">
                24. Pour les titres cotés à une bourse de valeur : indiquer le
                nombre, le prix unitaire d’acquisition et le cours de la bourse
                au 31 décembre.
              </span>
              <span className="font-semibold block">
                25. Faire ressortir les actions ou parts propres et indiquer la
                date d'acquisition et le nombre de titres détenus.
              </span>
              <span className="font-semibold block">
                26. Indiquer les événements et circonstances qui ont conduit à
                la dépréciation et à la reprise.
              </span>
            </div>
            {isEditing ? (
              <textarea
                value={""} // Combined text area for points 24, 25, 26
                onChange={(e) => {}}
                className="w-full h-12 border border-blue-300 bg-blue-50 focus:outline-none p-1 resize-none"
              />
            ) : (
              <p className="border-b border-gray-400 min-h-[1.5em] text-gray-600 italic">
                (Renseignements supplémentaires à fournir ici)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note9;
