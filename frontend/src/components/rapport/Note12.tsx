import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface ConversionRow {
  id: string;
  label: string | React.ReactNode;
  currency: string;
  amountInCurrency: number;
  acquisitionRate: number;
  closingRate: number;
}

interface TransferRow {
  id: string;
  label: string | React.ReactNode;
  yearN: number;
  yearN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note12: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [commentConversion, setCommentConversion] = useState("");
  const [commentTransfer, setCommentTransfer] = useState("");
  const [dsfId, setDsfId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load DSF data
  useEffect(() => {
    if (selectedFolder?.id) {
      loadDSFData();
    }
  }, [selectedFolder?.id]);

  const loadDSFData = async () => {
    if (!selectedFolder?.id) return;

    try {
      setLoading(true);
      const response = await dsfService.getDSF(selectedFolder.id);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      if (dsf.notes && dsf.notes.note12) {
        const note12Data = dsf.notes.note12;

        if (note12Data.headerInfo) {
          setHeaderInfo(note12Data.headerInfo);
        }

        if (note12Data.conversionRows) {
          setConversionRows(note12Data.conversionRows);
        }

        if (note12Data.transferRows) {
          setTransferRows(note12Data.transferRows);
        }

        if (note12Data.commentConversion !== undefined) {
          setCommentConversion(note12Data.commentConversion);
        }

        if (note12Data.commentTransfer !== undefined) {
          setCommentTransfer(note12Data.commentTransfer);
        }
      }
    } catch (error) {
      console.error("Error loading DSF data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!dsfId) return;

    try {
      setSaving(true);

      const note12Data = {
        headerInfo,
        conversionRows,
        transferRows,
        commentConversion,
        commentTransfer,
      };

      const notes = { note12: note12Data };

      await dsfService.updateDSF(dsfId, { notes });
    } catch (error) {
      console.error("Error saving to backend:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Header
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Écarts de conversion
  const [conversionRows, setConversionRows] = useState<ConversionRow[]>([
    {
      id: "1",
      label: (
        <>
          Ecarts de conversion actif : détailler les créances et dettes
          concernées <span className="text-red-600">(1)</span>
        </>
      ),
      currency: "",
      amountInCurrency: 0,
      acquisitionRate: 0,
      closingRate: 0,
    },
    {
      id: "2",
      label: (
        <>
          Ecart de conversion passif : détailler les créances et dettes
          concernées <span className="text-red-600">(2)</span>
        </>
      ),
      currency: "",
      amountInCurrency: 0,
      acquisitionRate: 0,
      closingRate: 0,
    },
  ]);

  // Transferts de charges
  const [transferRows, setTransferRows] = useState<TransferRow[]>([
    {
      id: "3",
      label: (
        <>
          Transfert de charges d'exploitation :{" "}
          <span className="text-red-600">
            détailler la nature des charges transférées
          </span>
        </>
      ),
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "4",
      label: (
        <>
          Transferts de charges financières :{" "}
          <span className="text-red-600">
            détailler la nature des charges transférées
          </span>
        </>
      ),
      yearN: 0,
      yearN1: 0,
    },
  ]);

  // Calculs variation %
  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return "-";
    return (((current - previous) / previous) * 100).toFixed(2) + "%";
  };

  // Handlers
  const handleConversionChange = (
    id: string,
    field: keyof ConversionRow,
    value: string
  ) => {
    setConversionRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "label"
                  ? value
                  : field === "currency"
                  ? value
                  : Number(value) || 0,
            }
          : row
      )
    );
  };

  const handleTransferChange = (
    id: string,
    field: "yearN" | "yearN1",
    value: string
  ) => {
    setTransferRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
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
        pdf.save("note_12_ecarts_conversion.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 12 - Ecarts de Conversion & Transferts de Charges
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) {
                saveToBackend();
              }
              setIsEditing(!isEditing);
            }}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarde...{" "}
              </>
            ) : isEditing ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarder{" "}
              </>
            ) : (
              <>
                {" "}
                <Pencil size={18} /> Éditer{" "}
              </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">25</div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
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
                className="border-b border-blue-500 bg-blue-50 w-20 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center">
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

        {/* Titre Principal - Écarts de conversion */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          NOTE 12
          <br />
          ECARTS DE CONVERSION
        </div>

        {/* Tableau Écarts de conversion */}
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[35%] text-left"
              >
                Libellés
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Devises
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Montant en devises
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Cours UML acquisition
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Cours UML 31-déc
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Variation en valeur absolue
              </th>
            </tr>
          </thead>
          <tbody>
            {conversionRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      value={row.currency}
                      onChange={(e) =>
                        handleConversionChange(
                          row.id,
                          "currency",
                          e.target.value
                        )
                      }
                      className="w-full text-center bg-blue-50"
                    />
                  ) : (
                    row.currency
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.amountInCurrency}
                      onChange={(e) =>
                        handleConversionChange(
                          row.id,
                          "amountInCurrency",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.amountInCurrency.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={row.acquisitionRate}
                      onChange={(e) =>
                        handleConversionChange(
                          row.id,
                          "acquisitionRate",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.acquisitionRate.toLocaleString("fr-FR", {
                      minimumFractionDigits: 4,
                    })
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={row.closingRate}
                      onChange={(e) =>
                        handleConversionChange(
                          row.id,
                          "closingRate",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.closingRate.toLocaleString("fr-FR", {
                      minimumFractionDigits: 4,
                    })
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(
                    row.amountInCurrency *
                    (row.closingRate - row.acquisitionRate)
                  ).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
            <tr className="bg-green-200 font-bold">
              <td
                colSpan={5}
                className="border border-gray-400 p-1 pl-2 text-right"
              >
                (1) - (2)
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {conversionRows
                  .reduce(
                    (acc, row) =>
                      acc +
                      row.amountInCurrency *
                        (row.closingRate - row.acquisitionRate),
                    0
                  )
                  .toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire Écarts de conversion */}
        <div className="border border-gray-400 p-2 bg-white mb-12">
          <div className="font-bold">Commentaire :</div>
          <div className="italic text-gray-600 mb-2">Faire un commentaire.</div>
          {isEditing ? (
            <textarea
              className="w-full h-20 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={commentConversion}
              onChange={(e) => setCommentConversion(e.target.value)}
            />
          ) : (
            <div className="min-h-[5rem] whitespace-pre-wrap">
              {commentConversion}
            </div>
          )}
        </div>

        {/* Titre Transferts de charges */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          TRANSFERTS DE CHARGES
        </div>

        {/* Tableau Transferts de charges */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 pl-2 w-[50%] text-left">
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
              <th className="border border-gray-400 p-1">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {transferRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.yearN}
                      onChange={(e) =>
                        handleTransferChange(row.id, "yearN", e.target.value)
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.yearN.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.yearN1}
                      onChange={(e) =>
                        handleTransferChange(row.id, "yearN1", e.target.value)
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.yearN1.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Commentaire Transferts de charges */}
        <div className="mt-8 border border-gray-400 p-2 bg-white">
          <div className="font-bold">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={commentTransfer}
              onChange={(e) => setCommentTransfer(e.target.value)}
            />
          ) : (
            <div className="min-h-[6rem] whitespace-pre-wrap">
              {commentTransfer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note12;
