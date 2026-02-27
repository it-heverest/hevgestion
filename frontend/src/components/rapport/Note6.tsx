import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface StockRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  variation: string;
}

const Note6: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  const [stocks, setStocks] = useState<StockRow[]>([
    { id: "1", label: "Marchandises", yearN: "", yearN1: "", variation: "" },
    {
      id: "2",
      label: "Matières premières et fournitures liées",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "3",
      label: "Autres approvisionnements",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "4",
      label: "Produits en cours",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "5",
      label: "Services en cours",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    { id: "6", label: "Produits finis", yearN: "", yearN1: "", variation: "" },
    {
      id: "7",
      label: "Produits intermédiaires",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "8",
      label: "Stocks en cours de route, en consignation ou en dépôt",
      yearN: "",
      yearN1: "",
      variation: "",
    },
  ]);

  const [totalBrut, setTotalBrut] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
  });
  const [depreciations, setDepreciations] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
  });
  const [totalNet, setTotalNet] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
  });
  const [comment, setComment] = useState("");

  const handleStockChange = (
    id: string,
    field: keyof StockRow,
    value: string
  ) => {
    setStocks((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);

      setTimeout(async () => {
        try {
          const html2canvas = (
            await import(
              "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" as any
            )
          ).default;
          const { jsPDF } = await import(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" as any
          );

          const canvas = await html2canvas(reportRef.current!, { scale: 2 });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("note_6_stocks.pdf");
        } catch (error) {
          console.error("Erreur lors de la génération du PDF:", error);
          alert("Erreur lors de la génération du PDF");
        } finally {
          setIsEditing(wasEditing);
        }
      }, 100);
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = ""
  ) => {
    return isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-blue-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span>{value}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Prévisualiser Rapport - Note 6
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
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-300"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-3 text-base">19</div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 pb-3">
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
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold mb-0">
          <div>NOTE 6</div>
          <div>STOCKS ET EN COURS (*)</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left w-[50%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-2 w-[20%]">Année N</th>
              <th className="border border-gray-400 p-2 w-[20%]">Année N-1</th>
              <th className="border border-gray-400 p-2 w-[10%]">
                Variation
                <br />
                en %
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) =>
                    handleStockChange(row.id, "yearN", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleStockChange(row.id, "yearN1", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.variation, (val) =>
                    handleStockChange(row.id, "variation", val)
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT STOCKS ET EN COURS */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL BRUT STOCKS ET EN COURS
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.yearN, (val) =>
                  setTotalBrut({ ...totalBrut, yearN: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.yearN1, (val) =>
                  setTotalBrut({ ...totalBrut, yearN1: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.variation, (val) =>
                  setTotalBrut({ ...totalBrut, variation: val })
                )}
              </td>
            </tr>

            {/* Ligne vide */}
            <tr className="bg-white">
              <td className="border border-gray-400 p-1" colSpan={4}></td>
            </tr>

            {/* Dépréciations stocks */}
            <tr className="bg-white">
              <td className="border border-gray-400 p-1 pl-2">
                Dépréciations stocks
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(depreciations.yearN, (val) =>
                  setDepreciations({ ...depreciations, yearN: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(depreciations.yearN1, (val) =>
                  setDepreciations({ ...depreciations, yearN1: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(depreciations.variation, (val) =>
                  setDepreciations({ ...depreciations, variation: val })
                )}
              </td>
            </tr>

            {/* Ligne vide */}
            <tr className="bg-white">
              <td className="border border-gray-400 p-1" colSpan={4}></td>
            </tr>

            {/* TOTAL NET DE DEPRECIATION */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.yearN, (val) =>
                  setTotalNet({ ...totalNet, yearN: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.yearN1, (val) =>
                  setTotalNet({ ...totalNet, yearN1: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.variation, (val) =>
                  setTotalNet({ ...totalNet, variation: val })
                )}
              </td>
            </tr>

            {/* Ligne vide */}
            <tr className="bg-white">
              <td className="border border-gray-400 p-1" colSpan={4}></td>
            </tr>

            {/* Note explicative */}
            <tr className="bg-white">
              <td
                className="border border-gray-400 p-1 text-[9px] italic"
                colSpan={4}
              >
                (*) Les stocks HAO seront inscrits dans l'actif circulant H.AO.
                Que lorsque leur montant total est significatif (supérieur à 5%
                du total de l'actif circulant).
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border-l border-r border-b border-gray-400 bg-white">
          <div className="p-2">
            <div className="font-bold mb-1">Commentaire:</div>
            {isEditing ? (
              <textarea
                className="w-full h-32 p-2 border border-blue-300 bg-blue-50 focus:outline-none resize-none text-[10px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            ) : (
              <div className="min-h-[8rem] whitespace-pre-wrap text-[10px]">
                {comment}
              </div>
            )}
          </div>

          {/* Instructions en bas */}
          <div className="border-t border-gray-400 p-2 text-[9px] space-y-1">
            <div>
              • Indiquer la date de prise d'inventaire et décrire brièvement la
              procédure, les méthodes comptables adaptées pour évaluer le stock.
            </div>
            <div>• Commenter toute variation significative de stocks.</div>
            <div>
              • Indiquer le détail des stocks dépréciés et les évènements et
              circonstances qui ont conduit à la dépréciation et à la reprise.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note6;
