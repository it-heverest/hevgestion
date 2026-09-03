import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface MonthRow {
  id: string;
  label: string;
  precomptesAchats: number;
  principal: number;
  ccx: number;
  retenuesSource: number;
  autresPrelevements: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const MONTHS = [
  "Janvier",
  "Février",
  "Mars(ou 1ᵉʳ trimestre)",
  "Avril",
  "Mai",
  "Juin (ou 2ᵉ trimestre)",
  "Juillet",
  "Août",
  "Septembre (ou 3ᵉ trimestre)",
  "Octobre",
  "Novembre",
  "Décembre (ou 4ᵉ trimestre)",
];

const NUMERIC_FIELDS: (keyof Omit<MonthRow, "id" | "label">)[] = [
  "precomptesAchats",
  "principal",
  "ccx",
  "retenuesSource",
  "autresPrelevements",
];

// --- Composant Principal ---
const CF1Quater: React.FC = () => {
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

  const [rows, setRows] = useState<MonthRow[]>(
    MONTHS.map((label, i) => ({
      id: String(i + 1),
      label,
      precomptesAchats: 0,
      principal: 0,
      ccx: 0,
      retenuesSource: 0,
      autresPrelevements: 0,
    })),
  );

  useEffect(() => {
    if (folderId) loadDSFData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadDSFData = async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      const data = (await notesService.getNoteData(folderId, "cf1quater")) as any;
      if (data) {
        if (data.headerInfo) setHeaderInfo(data.headerInfo);
        if (Array.isArray(data.rows)) setRows(data.rows);
      }
    } catch (error) {
      console.error("Error loading CF1 Quater data:", error);
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
        "cf1quater",
        { headerInfo, rows } as any,
      );
      if (!success) alert("Erreur lors de la sauvegarde");
    } catch (error) {
      console.error("Error saving CF1 Quater data:", error);
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
  const grandTotal =
    totals.precomptesAchats +
    totals.principal +
    totals.ccx +
    totals.retenuesSource +
    totals.autresPrelevements;

  const rowTotal = (row: MonthRow) =>
    row.precomptesAchats + row.principal + row.ccx + row.retenuesSource + row.autresPrelevements;

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
        pdf.save("cf1_quater_acomptes_impot.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderCell = (row: MonthRow, field: (typeof NUMERIC_FIELDS)[number]) => (
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
          CF1 Quater - Récapitulatif des Versements d'Acomptes et Retenues
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
        <div className="text-center font-bold mb-4 text-lg">63</div>

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
          CF1 QUATER
          <br />
          TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT : RECAPITULATIF
          DES VERSEMENTS D'ACOMPTES ET DE RETENUES
          <br />
          SUBIES D'IMPOT SUR LES SOCIETES DE L'EXERCICE
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th rowSpan={2} className="border border-gray-400 p-1">MOIS</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">Ligne</th>
              <th colSpan={3} className="border border-gray-400 p-1 text-center">
                Acomptes versés au titre de l'impôt
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">
                Retenues à la<br />source sur le CA<br />subies
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">
                Autres prélèvements
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">
                TOTAL<br />6=1+2+3+4+5
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">Précomptes sur achats<br />1</th>
              <th className="border border-gray-400 p-1 text-center">Principal<br />2</th>
              <th className="border border-gray-400 p-1 text-center">CCX<br />3</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">{index + 1}</td>
                {renderCell(row, "precomptesAchats")}
                {renderCell(row, "principal")}
                {renderCell(row, "ccx")}
                {renderCell(row, "retenuesSource")}
                {renderCell(row, "autresPrelevements")}
                <td className="border border-gray-400 p-1 text-right font-medium">
                  {rowTotal(row).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-300">
              <td className="border border-gray-400 p-1 pl-2">Totaux (ligne 1 à 12)</td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right">{totals.precomptesAchats.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.principal.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.ccx.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.retenuesSource.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totals.autresPrelevements.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{grandTotal.toLocaleString("fr-FR")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF1Quater;
