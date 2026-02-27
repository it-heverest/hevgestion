import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface DotationRow {
  id: string;
  label: string;
  exploitationDeductible: number;
  exploitationNonDeductible: number;
  financieresDeductible: number;
  financieresNonDeductible: number;
  horsActivitesDeductible: number;
  horsActivitesNonDeductible: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const C2Note28: React.FC = () => {
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

      if (dsf.notes && dsf.notes.c2note28) {
        const data = dsf.notes.c2note28;

        if (data.headerInfo) {
          setHeaderInfo(data.headerInfo);
        }

        if (data.rows) {
          setRows(data.rows);
        }

        if (data.comment !== undefined) {
          setComment(data.comment);
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

      const c2note28Data = {
        headerInfo,
        rows,
        comment,
      };

      const notes = { c2note28: c2note28Data };

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

  // Lignes exactement comme dans l'image
  const [rows, setRows] = useState<DotationRow[]>([
    {
      id: "1",
      label: "Provisions réglementées",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "2",
      label: "Provisions financières pour risques et charges",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "3",
      label: "Dépréciation des immobilisations",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "4",
      label: "Dépréciation des stocks",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "5",
      label: "Dépréciation actif circulant HAO",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "6",
      label: "Dépréciations fournisseurs",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "7",
      label: "Dépréciations clients",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "8",
      label: "Dépréciations autres créances",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "9",
      label: "Dépréciations titres de placement",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "10",
      label: "Dépréciations disponibilité",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "11",
      label:
        "Dépréciations et provisions pour risques à court terme exploitation",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
    {
      id: "12",
      label:
        "Dépréciations et provisions pour risques à court terme à caractère financier",
      exploitationDeductible: 0,
      exploitationNonDeductible: 0,
      financieresDeductible: 0,
      financieresNonDeductible: 0,
      horsActivitesDeductible: 0,
      horsActivitesNonDeductible: 0,
    },
  ]);

  // Calculs des totaux
  const calcColumn = (field: keyof DotationRow) =>
    rows.reduce((acc, r) => acc + r[field], 0);

  const exploitationDeductibleTotal = calcColumn("exploitationDeductible");
  const exploitationNonDeductibleTotal = calcColumn(
    "exploitationNonDeductible"
  );
  const financieresDeductibleTotal = calcColumn("financieresDeductible");
  const financieresNonDeductibleTotal = calcColumn("financieresNonDeductible");
  const horsActivitesDeductibleTotal = calcColumn("horsActivitesDeductible");
  const horsActivitesNonDeductibleTotal = calcColumn(
    "horsActivitesNonDeductible"
  );

  const totalDeductible =
    exploitationDeductibleTotal +
    financieresDeductibleTotal +
    horsActivitesDeductibleTotal;
  const totalNonDeductible =
    exploitationNonDeductibleTotal +
    financieresNonDeductibleTotal +
    horsActivitesNonDeductibleTotal;

  // Handler
  const handleChange = (
    id: string,
    field: keyof DotationRow,
    value: string
  ) => {
    setRows((prev) =>
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
        pdf.save("c2note_28_traitement_fiscal_dotations.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: DotationRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.exploitationDeductible}
            onChange={(e) =>
              handleChange(row.id, "exploitationDeductible", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.exploitationDeductible.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.exploitationNonDeductible}
            onChange={(e) =>
              handleChange(row.id, "exploitationNonDeductible", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.exploitationNonDeductible.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.financieresDeductible}
            onChange={(e) =>
              handleChange(row.id, "financieresDeductible", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.financieresDeductible.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.financieresNonDeductible}
            onChange={(e) =>
              handleChange(row.id, "financieresNonDeductible", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.financieresNonDeductible.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.horsActivitesDeductible}
            onChange={(e) =>
              handleChange(row.id, "horsActivitesDeductible", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.horsActivitesDeductible.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.horsActivitesNonDeductible}
            onChange={(e) =>
              handleChange(row.id, "horsActivitesNonDeductible", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.horsActivitesNonDeductible.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {(
          row.exploitationDeductible +
          row.financieresDeductible +
          row.horsActivitesDeductible
        ).toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {(
          row.exploitationNonDeductible +
          row.financieresNonDeductible +
          row.horsActivitesNonDeductible
        ).toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  const renderTotal = (
    label: string,
    deductibles: number,
    nonDeductibles: number,
    bgClass: string
  ) => (
    <tr className={`${bgClass} font-bold`}>
      <td className="border border-gray-400 p-1 pl-2">{label}</td>
      <td colSpan={3} className="border border-gray-400 p-1 text-right">
        {deductibles.toLocaleString("fr-FR")}
      </td>
      <td colSpan={3} className="border border-gray-400 p-1 text-right">
        {nonDeductibles.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {deductibles.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {nonDeductibles.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          C2'Note 28 - Tableau Récapitulatif du Traitement Fiscal des Provisions
          : Les Dotations
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
        <div className="text-center font-bold mb-2 text-lg">43</div>

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
          C2'NOTE 28
          <br />
          TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE
          L'EXERCICE : LES DOTATIONS
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={3} className="border border-gray-400 p-1 pl-2">
                Libellés
              </th>
              <th colSpan={6} className="border border-gray-400 p-1">
                AUGMENTATIONS : DOTATIONS
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                TOTAUX
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th colSpan={2} className="border border-gray-400 p-1">
                D'EXPLOITATION
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                FINANCIERES
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                HORS ACTIVITES ORDINAIRES
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Déductibles
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Non déductibles
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Déductibles</th>
              <th className="border border-gray-400 p-1">Non déductibles</th>
              <th className="border border-gray-400 p-1">Déductibles</th>
              <th className="border border-gray-400 p-1">Non déductibles</th>
              <th className="border border-gray-400 p-1">Déductibles</th>
              <th className="border border-gray-400 p-1">Non déductibles</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 3).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL 1 : DOTATIONS",
              totalDeductible,
              totalNonDeductible,
              "bg-gray-300"
            )}
            {rows.slice(3).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL 2 : CHARGES POUR DEPRECIATIONS ET PROVISIONS A COURT TERME",
              totalDeductible,
              totalNonDeductible,
              "bg-gray-300"
            )}
            {renderTotal(
              "TOTAL (1+2) : PROVISIONS ET DEPRECIATIONS",
              totalDeductible,
              totalNonDeductible,
              "bg-gray-500 text-white"
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default C2Note28;
