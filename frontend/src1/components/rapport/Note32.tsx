import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface ProductionRow {
  id: string;
  productDesignation: string;
  unit: string;
  soldInCountryQty: number;
  soldInCountryVal: number;
  soldOtherOHADAQty: number;
  soldOtherOHADAVal: number;
  soldOutsideOHADAQty: number;
  soldOutsideOHADAVal: number;
  immobilizedQty: number;
  immobilizedVal: number;
  openingStockQty: number;
  openingStockVal: number;
  closingStockQty: number;
  closingStockVal: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note32: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
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

      if (dsf.notes && dsf.notes.note32) {
        const note32Data = dsf.notes.note32;

        if (note32Data.headerInfo) {
          setHeaderInfo(note32Data.headerInfo);
        }

        if (note32Data.rows) {
          setRows(note32Data.rows);
        }

        if (note32Data.comment !== undefined) {
          setComment(note32Data.comment);
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

      const note32Data = {
        headerInfo,
        rows,
        comment,
      };

      const notes = { note32: note32Data };

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

  // Lignes de production (20 lignes vides + non ventilé + total)
  const [rows, setRows] = useState<ProductionRow[]>(
    Array(20)
      .fill(null)
      .map((_, i) => ({
        id: `${i + 1}`,
        productDesignation: "",
        unit: "",
        soldInCountryQty: 0,
        soldInCountryVal: 0,
        soldOtherOHADAQty: 0,
        soldOtherOHADAVal: 0,
        soldOutsideOHADAQty: 0,
        soldOutsideOHADAVal: 0,
        immobilizedQty: 0,
        immobilizedVal: 0,
        openingStockQty: 0,
        openingStockVal: 0,
        closingStockQty: 0,
        closingStockVal: 0,
      }))
  );

  // Handler
  const handleChange = (
    id: string,
    field: keyof ProductionRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "productDesignation" || field === "unit"
                  ? value
                  : Number(value) || 0,
            }
          : row
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour les nombreuses colonnes
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_32_production_exercice.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: ProductionRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">
        {isEditing ? (
          <input
            value={row.productDesignation}
            onChange={(e) =>
              handleChange(row.id, "productDesignation", e.target.value)
            }
            className="w-full bg-blue-50"
          />
        ) : (
          row.productDesignation
        )}
      </td>
      <td className="border border-gray-400 p-1 text-center">
        {isEditing ? (
          <input
            value={row.unit}
            onChange={(e) => handleChange(row.id, "unit", e.target.value)}
            className="w-full text-center bg-blue-50"
          />
        ) : (
          row.unit
        )}
      </td>
      {[
        "soldInCountryQty",
        "soldInCountryVal",
        "soldOtherOHADAQty",
        "soldOtherOHADAVal",
        "soldOutsideOHADAQty",
        "soldOutsideOHADAVal",
        "immobilizedQty",
        "immobilizedVal",
        "openingStockQty",
        "openingStockVal",
        "closingStockQty",
        "closingStockVal",
      ].map((field) => (
        <td key={field} className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row[field as keyof ProductionRow]}
              onChange={(e) =>
                handleChange(
                  row.id,
                  field as keyof ProductionRow,
                  e.target.value
                )
              }
              className="w-full text-right bg-blue-50"
            />
          ) : (
            (row[field as keyof ProductionRow] as number).toLocaleString(
              "fr-FR"
            )
          )}
        </td>
      ))}
    </tr>
  );

  // Calculs des totaux (simples sommes)
  const calcTotal = (field: keyof ProductionRow) =>
    rows.reduce((acc, r) => acc + (r[field] as number), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 32 - Production de l'Exercice
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
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
        <div className="text-center font-bold mb-2 text-lg">47</div>

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

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          NOTE 32
          <br />
          PRODUCTION DE L'EXERCICE
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[20%]"
              >
                DÉSIGNATION DE PRODUITS
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                UNITÉ DE QUANTITÉ CHOISIE
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                PRODUCTION VENDU DANS LE PAYS
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                PRODUCTION VENDUE DANS LES AUTRES PAYS DE L'OHADA
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                PRODUCTION VENDUE HORS OHADA
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                PRODUCTION IMMOBILISÉE
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                STOCK OUVERTURE DE L'EXERCICE
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                STOCK CLOTURE DE L'EXERCICE
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
            </tr>
          </thead>
          <tbody>
            {/* Lignes vides pour saisie */}
            {rows.map((row) => renderRow(row))}

            {/* Non ventilé */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">NON VENTILE</td>
              <td colSpan={13} className="border border-gray-400 p-1"></td>
            </tr>

            {/* Total */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL</td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("soldInCountryQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("soldInCountryVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("soldOtherOHADAQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("soldOtherOHADAVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("soldOutsideOHADAQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("soldOutsideOHADAVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("immobilizedQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("immobilizedVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("openingStockQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("openingStockVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("closingStockQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("closingStockVal").toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note32;
