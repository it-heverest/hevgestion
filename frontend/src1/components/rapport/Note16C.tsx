import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface ContingentItem {
  id: string;
  description: string;
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
const Note16C: React.FC = () => {
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

      if (dsf.notes && dsf.notes.note16C) {
        const note16CData = dsf.notes.note16C;

        if (note16CData.headerInfo) {
          setHeaderInfo(note16CData.headerInfo);
        }

        if (note16CData.actifs) {
          setActifs(note16CData.actifs);
        }

        if (note16CData.passifs) {
          setPassifs(note16CData.passifs);
        }

        if (note16CData.comment !== undefined) {
          setComment(note16CData.comment);
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

      const note16CData = {
        headerInfo,
        actifs,
        passifs,
        comment,
      };

      const notes = { note16C: note16CData };

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

  // Actifs éventuels (5 lignes vides)
  const [actifs, setActifs] = useState<ContingentItem[]>(
    Array(5)
      .fill(null)
      .map((_, i) => ({
        id: `a${i + 1}`,
        description: "",
        yearN: 0,
        yearN1: 0,
      }))
  );

  // Passifs éventuels (5 lignes vides)
  const [passifs, setPassifs] = useState<ContingentItem[]>(
    Array(5)
      .fill(null)
      .map((_, i) => ({
        id: `p${i + 1}`,
        description: "",
        yearN: 0,
        yearN1: 0,
      }))
  );

  // Handler
  const handleChange = (
    list: "actifs" | "passifs",
    id: string,
    field: "description" | "yearN" | "yearN1",
    value: string
  ) => {
    if (list === "actifs") {
      setActifs((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: field === "description" ? value : Number(value) || 0,
              }
            : row
        )
      );
    } else {
      setPassifs((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: field === "description" ? value : Number(value) || 0,
              }
            : row
        )
      );
    }
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
        pdf.save("note_16C_actifs_passifs_eventuels.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderItemRow = (row: ContingentItem, list: "actifs" | "passifs") => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2">
        {isEditing ? (
          <input
            value={row.description}
            onChange={(e) =>
              handleChange(list, row.id, "description", e.target.value)
            }
            className="w-full bg-blue-50"
          />
        ) : (
          row.description
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) =>
              handleChange(list, row.id, "yearN", e.target.value)
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
              handleChange(list, row.id, "yearN1", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN1.toLocaleString("fr-FR")
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
          Note 16C - Actifs et Passifs Éventuels
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
        <div className="text-center font-bold mb-2 text-lg">52</div>

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
          NOTE 16 C
          <br />
          ACTIFS ET PASSIFS EVENTUELS
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-500 text-white">
              <th className="border border-gray-400 p-1 pl-2 w-[60%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
            </tr>
          </thead>
          <tbody>
            {/* Actifs éventuels */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Actifs éventuels
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            <tr className="bg-gray-300">
              <td className="border border-gray-400 p-1 pl-2">Litiges</td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {actifs.map((row) => renderItemRow(row, "actifs"))}

            {/* Passifs éventuels */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Passif éventuels
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            <tr className="bg-gray-300">
              <td className="border border-gray-400 p-1 pl-2">Litiges</td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {passifs.map((row) => renderItemRow(row, "passifs"))}
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          <div className="italic text-[10px]">
            Décrire les principales caractéristiques des actifs / passif
            éventuels, l'horizon de temps auquel les encaissements /
            décaissements sont attendus et les éventuels remboursements à
            percevoir.
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-40 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[10rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note16C;
