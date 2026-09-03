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
  montantVersement: number;
  noQuittance: string;
  tvaRetenueSource: number;
  montantVersementRetenue: number;
  referenceQuittance: string;
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
  "Mars(ou 1er trimestre)",
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

// --- Composant Principal ---
const CF2Bis: React.FC = () => {
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
      montantVersement: 0,
      noQuittance: "",
      tvaRetenueSource: 0,
      montantVersementRetenue: 0,
      referenceQuittance: "",
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
      const data = (await notesService.getNoteData(folderId, "cf2bis")) as any;
      if (data) {
        if (data.headerInfo) setHeaderInfo(data.headerInfo);
        if (Array.isArray(data.rows)) setRows(data.rows);
      }
    } catch (error) {
      console.error("Error loading CF2 Bis data:", error);
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
        "cf2bis",
        { headerInfo, rows } as any,
      );
      if (!success) alert("Erreur lors de la sauvegarde");
    } catch (error) {
      console.error("Error saving CF2 Bis data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleNumberChange = (
    id: string,
    field: "montantVersement" | "tvaRetenueSource" | "montantVersementRetenue",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row,
      ),
    );
  };

  const handleTextChange = (
    id: string,
    field: "noQuittance" | "referenceQuittance",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const totalMontantVersement = rows.reduce((s, r) => s + r.montantVersement, 0);
  const totalTvaRetenueSource = rows.reduce((s, r) => s + r.tvaRetenueSource, 0);
  const totalMontantVersementRetenue = rows.reduce((s, r) => s + r.montantVersementRetenue, 0);
  const totalGeneral = totalMontantVersement + totalTvaRetenueSource;

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
        pdf.save("cf2_bis_recap_tva.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          CF2 Bis - Récapitulatif des Versements Effectués et Retenues Subies
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
          .dark-gray { background-color: #a9a9a9; }
          .medium-gray { background-color: #c0c0c0; }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">65</div>

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
          CF2 BIS
          <br />
          TABLEAU DE REGULATION ANNUELLE DE LA TVA :<br />
          RECAPITULATIF DES VERSEMENTS EFFECTUES ET RETENUS SUBIES
        </div>

        {/* Sub headers */}
        <div className="grid grid-cols-2 mb-4">
          <div className="medium-gray py-1 text-center font-bold border border-black">
            TVA - Déclaration annuelle VERSEMENT EFFECTUES ET RETENUES SUBIES AU
            COURS DE L'EXERCICE
          </div>
          <div className="medium-gray py-1 text-center font-bold border border-black">
            DECLARATION ANNUELLE DES RETENUES
            <br />
            OPEREES SUR FOURNISSEURS
          </div>
        </div>

        {/* Main table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th rowSpan={2} className="border border-gray-400 p-1">Période de référence</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">Ligne</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">Montant du versement</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">No Quittance</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">TVA retenues à la source</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">TOTAL<br />6=2+5</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">MONTANT DU<br />VERSEMENT</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center">REFERENCE<br />QUITTANCE</th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">1</th>
              <th className="border border-gray-400 p-1 text-center">2</th>
              <th className="border border-gray-400 p-1 text-center">4</th>
              <th className="border border-gray-400 p-1 text-center">5</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">{index + 1}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.montantVersement}
                      onChange={(e) => handleNumberChange(row.id, "montantVersement", e.target.value)}
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.montantVersement.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.noQuittance}
                      onChange={(e) => handleTextChange(row.id, "noQuittance", e.target.value)}
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.noQuittance
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.tvaRetenueSource}
                      onChange={(e) => handleNumberChange(row.id, "tvaRetenueSource", e.target.value)}
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.tvaRetenueSource.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right font-medium">
                  {(row.montantVersement + row.tvaRetenueSource).toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.montantVersementRetenue}
                      onChange={(e) => handleNumberChange(row.id, "montantVersementRetenue", e.target.value)}
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.montantVersementRetenue.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.referenceQuittance}
                      onChange={(e) => handleTextChange(row.id, "referenceQuittance", e.target.value)}
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.referenceQuittance
                  )}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-300">
              <td className="border border-gray-400 p-1 pl-2">TOTAL lignes 1 à 12</td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right">{totalMontantVersement.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-right">{totalTvaRetenueSource.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totalGeneral.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1 text-right">{totalMontantVersementRetenue.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF2Bis;
