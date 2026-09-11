import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface TvaRow {
  id: string;
  line: number;
  label: string;
  bold?: boolean;
  amount: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const ROW_DEFS: Array<{ line: number; label: string; bold?: boolean }> = [
  { line: 1, label: "Crédit de TVA à l'ouverture de l'exercice" },
  { line: 2, label: "Reversement TVA à effectuer" },
  { line: 3, label: "TVA brute" },
  { line: 4, label: "TVA déductible" },
  { line: 5, label: "TVA nette", bold: true },
  { line: 6, label: "TVA versé au cours de l'exercice" },
  { line: 7, label: "Remboursement demandés sur les crédits de TVA validés de l'exercice" },
  { line: 8, label: "TVA nette à payer (ligne 5 - ligne 6 - ligne 7 >0)" },
  { line: 9, label: "Crédit de TVA net à reporter (ligne 6 + ligne 7 - ligne 5 > 0)" },
];

// --- Composant Principal ---
const CF2Ter: React.FC = () => {
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

  const [rows, setRows] = useState<TvaRow[]>(
    ROW_DEFS.map((def, i) => ({ id: String(i + 1), ...def, amount: 0 })),
  );

  useEffect(() => {
    if (folderId) loadDSFData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadDSFData = async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      const data = (await notesService.getNoteData(folderId, "cf2ter")) as any;
      if (data) {
        if (data.headerInfo) setHeaderInfo(data.headerInfo);
        if (Array.isArray(data.rows)) setRows(data.rows);
      }
    } catch (error) {
      console.error("Error loading CF2 Ter data:", error);
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
        "cf2ter",
        { headerInfo, rows } as any,
      );
      if (!success) alert("Erreur lors de la sauvegarde");
    } catch (error) {
      console.error("Error saving CF2 Ter data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, amount: Number(value) || 0 } : row)),
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
        pdf.save("cf2_ter_situation_tva.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          CF2 Ter - Situation Nette de TVA
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
              setIsEditing(!isEditing);
            }}
            disabled={saving}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} className={saving ? "animate-pulse" : ""} /> : <Pencil size={18} />}
          </button>
          <button
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style>{`
          .gray-header { background-color: #d3d3d3; }
          .dark-gray-header { background-color: #a9a9a9; }
        `}</style>

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            66
          </span>
        </div>

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
        <div className="gray-header py-2 text-center font-bold mb-6">
          CF2 TER
          <br />
          SITUATION NETTE DE TVA
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="dark-gray-header">
              <th className="border border-gray-400 p-2 w-[70%]">INTITULES</th>
              <th className="border border-gray-400 p-2 text-center">Lignes</th>
              <th className="border border-gray-400 p-2 text-center">MONTANTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.bold ? "font-bold" : ""}>
                <td className="border border-gray-400 p-2 pl-4">{row.label}</td>
                <td className="border border-gray-400 p-2 text-center">{row.line}</td>
                <td className="border border-gray-400 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleChange(row.id, e.target.value)}
                      className="w-full text-right bg-orange-50 border border-orange-300"
                    />
                  ) : (
                    row.amount.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF2Ter;
