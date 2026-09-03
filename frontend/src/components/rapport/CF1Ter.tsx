import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface PeriodRow {
  id: string;
  label: string;
  line: number;
  reinvestissement: number;
  base60: number;
  baseEffective: number;
  reductionsReportables: number;
  montant: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const NUMERIC_FIELDS: (keyof Omit<PeriodRow, "id" | "label" | "line">)[] = [
  "reinvestissement",
  "base60",
  "baseEffective",
  "reductionsReportables",
  "montant",
];

// --- Composant Principal ---
const CF1Ter: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  const [rows, setRows] = useState<PeriodRow[]>([
    { id: "1", label: "Année N-3 (3ᵉ Antérieure)", line: 2, reinvestissement: 0, base60: 0, baseEffective: 0, reductionsReportables: 0, montant: 0 },
    { id: "2", label: "Année N-2", line: 3, reinvestissement: 0, base60: 0, baseEffective: 0, reductionsReportables: 0, montant: 0 },
    { id: "3", label: "Année N-1", line: 4, reinvestissement: 0, base60: 0, baseEffective: 0, reductionsReportables: 0, montant: 0 },
  ]);

  useEffect(() => {
    if (folderId) loadDSFData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadDSFData = async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      const data = (await notesService.getNoteData(folderId, "cf1ter")) as any;
      if (data) {
        if (data.headerInfo) setHeaderInfo(data.headerInfo);
        if (Array.isArray(data.rows)) setRows(data.rows);
      }
    } catch (error) {
      console.error("Error loading CF1 Ter data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!folderId) return;
    try {
      setSaving(true);
      const success = await notesService.saveNoteData(
        folderId,
        "cf1ter",
        { headerInfo, rows } as any,
      );
      if (!success) alert("Erreur lors de la sauvegarde");
    } catch (error) {
      console.error("Error saving CF1 Ter data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleRowChange = (
    id: string,
    field: (typeof NUMERIC_FIELDS)[number],
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row,
      ),
    );
  };

  const totals = NUMERIC_FIELDS.reduce(
    (acc, field) => {
      acc[field] = rows.reduce((sum, row) => sum + row[field], 0);
      return acc;
    },
    {} as Record<(typeof NUMERIC_FIELDS)[number], number>,
  );

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("cf1_ter_minimum_perception.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderCell = (row: PeriodRow, field: (typeof NUMERIC_FIELDS)[number]) => (
    <td className="border border-gray-400 p-1 text-right">
      {isEditing ? (
        <input
          type="number"
          value={row[field]}
          onChange={(e) => handleRowChange(row.id, field, e.target.value)}
          className="w-full text-right bg-orange-50"
        />
      ) : (
        row[field].toLocaleString("fr-FR")
      )}
    </td>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          CF1 Ter - Minimum de Perception
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
              setIsEditing(!isEditing);
            }}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? (
              <> <Save size={18} /> Sauvegarde... </>
            ) : isEditing ? (
              <> <Save size={18} /> Sauvegarder </>
            ) : (
              <> <Pencil size={18} /> Éditer </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style>{`
          .light-gray { background-color: #d3d3d3; }
          .medium-gray { background-color: #c0c0c0; }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">62</div>

        {/* Standard header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) => setHeaderInfo({ ...headerInfo, entityName: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">{headerInfo.entityName}</span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) => setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-32 text-center px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-32 text-center">{headerInfo.fiscalYear}</span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) => setHeaderInfo({ ...headerInfo, idNumber: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">{headerInfo.idNumber}</span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) => setHeaderInfo({ ...headerInfo, duration: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-16 text-center px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">{headerInfo.duration}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="light-gray py-2 text-center font-bold mb-6">
          CF1 TER
          <br />
          TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT: MINIMUM DE
          PERCEPTION
        </div>

        {/* First section - Rubriques */}
        <div className="medium-gray py-1 text-center font-bold mb-4">
          RUBRIQUES
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th colSpan={5} className="border border-gray-400 p-1 text-center">
                REPORT MINIMUM DE PERCEPTION ANTERIEUR
              </th>
              <th className="border border-gray-400 p-1 text-center">MONTANTS</th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1">PERIODE</th>
              <th className="border border-gray-400 p-1">Réinvestissement admis</th>
              <th className="border border-gray-400 p-1">Base 60%</th>
              <th className="border border-gray-400 p-1">Base effective de la réduction</th>
              <th className="border border-gray-400 p-1">Réductions reportables</th>
              <th className="border border-gray-400 p-1"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">{row.line}</td>
                {renderCell(row, "reinvestissement")}
                {renderCell(row, "base60")}
                {renderCell(row, "baseEffective")}
                {renderCell(row, "reductionsReportables")}
                {renderCell(row, "montant")}
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL TAUX</td>
              <td className="border border-gray-400 p-1 text-center">5</td>
              <td className="border border-gray-400 p-1 text-right">{totals.reinvestissement.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.base60.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.baseEffective.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.reductionsReportables.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.montant.toLocaleString("fr-FR")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF1Ter;
