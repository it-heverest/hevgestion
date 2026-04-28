import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface MonthlyRow {
  id: string;
  period: string;
  line: number;
  irpp: number;
  cfcs: number;
  cfcp: number;
  fne: number;
  tc: number;
  rav: number;
}

interface AnnualRegulationRow {
  id: string;
  label: string;
  line: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const C1Note27A: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [dsfId, setDsfId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load DSF data
  useEffect(() => {
    if (folderId) {
      loadDSFData();
    }
  }, [folderId]);

  const loadDSFData = async () => {
    if (!folderId) return;

    try {
      setLoading(true);
      const response = await dsfService.getDSF(folderId);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      if (dsf.notes && dsf.notes.c1note27A) {
        const data = dsf.notes.c1note27A;

        if (data.headerInfo) {
          setHeaderInfo(data.headerInfo);
        }

        if (data.monthlyRows) {
          setMonthlyRows(data.monthlyRows);
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

      const c1note27AData = {
        headerInfo,
        monthlyRows,
      };

      const notes = { c1note27A: c1note27AData };

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

  // Lignes mensuelles
  const months = [
    "Janvier",
    "Février",
    "Mars (ou 1er trimestre)",
    "Avril",
    "Mai",
    "Juin (ou 2ème trimestre)",
    "Juillet",
    "Août",
    "Septembre (ou 3ème trimestre)",
    "Octobre",
    "Novembre",
    "Décembre (ou 4ème trimestre)",
  ];

  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(
    months.map((period, i) => ({
      id: `${i + 1}`,
      period,
      line: i + 1,
      irpp: 0,
      cfcs: 0,
      cfcp: 0,
      fne: 0,
      tc: 0,
      rav: 0,
    }))
  );

  // Lignes de régulation annuelle (statiques)
  const annualRows: AnnualRegulationRow[] = [
    { id: "14", label: "Régulation IRPP", line: 14 },
    { id: "15", label: "Régulation CFC/S", line: 15 },
    { id: "16", label: "Régulation CFC/P", line: 16 },
    { id: "17", label: "Régulation FNE", line: 17 },
    { id: "18", label: "Régulation TC", line: 18 },
    { id: "19", label: "Régulation RAV", line: 19 },
  ];

  // Calculs totaux mensuels
  const calcTotal = (field: keyof MonthlyRow) =>
    monthlyRows.reduce((acc, r) => acc + (r[field] as number), 0);

  // Handler
  const handleMonthlyChange = (
    id: string,
    field: keyof MonthlyRow,
    value: string
  ) => {
    setMonthlyRows((prev) =>
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour le tableau large
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("c1note_27A_retenues_salaires.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderMonthlyRow = (row: MonthlyRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.period}</td>
      <td className="border border-gray-400 p-1 text-center">{row.line}</td>
      {["irpp", "cfcs", "cfcp", "fne", "tc", "rav"].map((field) => (
        <td key={field} className="border border-gray-400 p-1 text-right">
          {isEditing ? (
            <input
              type="number"
              value={row[field as keyof MonthlyRow]}
              onChange={(e) =>
                handleMonthlyChange(
                  row.id,
                  field as keyof MonthlyRow,
                  e.target.value
                )
              }
              className="w-full text-right bg-blue-50"
            />
          ) : (
            (row[field as keyof MonthlyRow] as number).toLocaleString("fr-FR")
          )}
        </td>
      ))}
      <td className="border border-gray-400 p-1 text-right font-bold">
        {(
          row.irpp +
          row.cfcs +
          row.cfcp +
          row.fne +
          row.tc +
          row.rav
        ).toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          C1/Note 27A - Tableau de Régularisation Annuelle des Impôts et Taxes
          sur Salaires
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
        <div className="text-center font-bold mb-2 text-lg">55</div>

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
          C1/NOTE 27A
          <br />
          TABLEAU DE REGULARISATION ANNUELLE DES IMPOTS ET TAXES SUR SALAIRES
        </div>

        {/* Tableau des retenues mensuelles */}
        <div className="font-bold mb-2">
          TABLEAU DES RETENUES SUR SALAIRES MENSUELLES
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1 pl-2">
                Période de référence
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Ligne
              </th>
              <th
                colSpan={6}
                className="border border-gray-400 p-1 text-center"
              >
                ACHATS EFFECTUES AU COURS DE L'EXERCICE
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TOTAL
                <br />
                8=2 à 7
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">IRPP</th>
              <th className="border border-gray-400 p-1">CFC/S</th>
              <th className="border border-gray-400 p-1">CFC/P</th>
              <th className="border border-gray-400 p-1">FNE</th>
              <th className="border border-gray-400 p-1">TC</th>
              <th className="border border-gray-400 p-1">RAV</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRows.map((row) => renderMonthlyRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Total Lignes 1 à 12
              </td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("irpp").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("cfcs").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("cfcp").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("fne").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("tc").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calcTotal("rav").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(
                  calcTotal("irpp") +
                  calcTotal("cfcs") +
                  calcTotal("cfcp") +
                  calcTotal("fne") +
                  calcTotal("tc") +
                  calcTotal("rav")
                ).toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Régulation annuelle */}
        <div className="font-bold mb-2">REGULATION ANNUELLE</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <tbody>
            {annualRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.line}
                </td>
                <td colSpan={7} className="border border-gray-400 p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default C1Note27A;



