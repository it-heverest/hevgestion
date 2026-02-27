import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface PurchaseRow {
  id: string;
  designation: string;
  unit: string;
  localQty: number;
  localVal: number;
  importedQty: number;
  importedVal: number;
  stockVariation: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note33: React.FC = () => {
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

      if (dsf.notes && dsf.notes.note33) {
        const note33Data = dsf.notes.note33;

        if (note33Data.headerInfo) {
          setHeaderInfo(note33Data.headerInfo);
        }

        if (note33Data.rows) {
          setRows(note33Data.rows);
        }

        if (note33Data.comment !== undefined) {
          setComment(note33Data.comment);
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

      const note33Data = {
        headerInfo,
        rows,
        comment,
      };

      const notes = { note33: note33Data };

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

  // 20 lignes vides pour saisie
  const [rows, setRows] = useState<PurchaseRow[]>(
    Array(20)
      .fill(null)
      .map((_, i) => ({
        id: `${i + 1}`,
        designation: "",
        unit: "",
        localQty: 0,
        localVal: 0,
        importedQty: 0,
        importedVal: 0,
        stockVariation: 0,
      }))
  );

  // Calculs totaux
  const calcTotal = (field: keyof PurchaseRow) =>
    rows.reduce((acc, r) => acc + (r[field] as number), 0);

  // Handler
  const handleChange = (
    id: string,
    field: keyof PurchaseRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "designation" || field === "unit"
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour les colonnes
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_33_achats_production.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: PurchaseRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">
        {isEditing ? (
          <input
            value={row.designation}
            onChange={(e) =>
              handleChange(row.id, "designation", e.target.value)
            }
            className="w-full bg-blue-50"
          />
        ) : (
          row.designation
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
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.localQty}
            onChange={(e) => handleChange(row.id, "localQty", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.localQty.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.localVal}
            onChange={(e) => handleChange(row.id, "localVal", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.localVal.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.importedQty}
            onChange={(e) =>
              handleChange(row.id, "importedQty", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.importedQty.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.importedVal}
            onChange={(e) =>
              handleChange(row.id, "importedVal", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.importedVal.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.stockVariation}
            onChange={(e) =>
              handleChange(row.id, "stockVariation", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.stockVariation.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 33 - Achats Destinés à la Production
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
        <div className="text-center font-bold mb-2 text-lg">48</div>

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
          NOTE 33
          <br />
          ACHATS DESTINES A LA PRODUCTION
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[25%]"
              >
                DÉSIGNATION DES MATIERES ET PRODUITS
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                UNITÉ DE QUANTITÉ CHOISIE
              </th>
              <th
                colSpan={4}
                className="border border-gray-400 p-1 text-center"
              >
                ACHATS EFFECTUES AU COURS DE L'EXERCICE
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                VARIATION DES STOCKS
                <br />
                (en valeur)
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th colSpan={2} className="border border-gray-400 p-1">
                PRODUITS DE L'ETAT
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                PRODUITS IMPORTES
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1"></th>
              <th className="border border-gray-400 p-1"></th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Valeur</th>
              <th className="border border-gray-400 p-1"></th>
            </tr>
          </thead>
          <tbody>
            {/* Lignes vides */}
            {rows.map((row) => renderRow(row))}

            {/* Non ventilés */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">NON VENTILES</td>
              <td colSpan={6} className="border border-gray-400 p-1"></td>
            </tr>

            {/* Total */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL</td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("localQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("localVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("importedQty").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("importedVal").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("stockVariation").toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note33;
