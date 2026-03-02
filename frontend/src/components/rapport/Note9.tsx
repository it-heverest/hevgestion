import React, { useState, useRef, useEffect, useMemo } from "react";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Types et Interfaces ---

interface TitreRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  isTotal?: boolean;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note9: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedFolder } = useApp();

  // État pour l'en-tête
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  // État pour le commentaire
  const [comment, setComment] = useState("");

  // État pour les Titres de placement
  const [rows, setRows] = useState<TitreRow[]>([
    { id: "1", label: "Titres de trésor et bons de caisse à court terme", yearN: "", yearN1: "" },
    { id: "2", label: "Actions", yearN: "", yearN1: "" },
    { id: "3", label: "Obligations", yearN: "", yearN1: "" },
    { id: "4", label: "Bons de souscription", yearN: "", yearN1: "" },
    { id: "5", label: "Titres négociables hors régions", yearN: "", yearN1: "" },
    { id: "6", label: "Intérêts courus", yearN: "", yearN1: "" },
    { id: "7", label: "Autres valeurs assimilées", yearN: "", yearN1: "" },
  ]);

  const [depreciations, setDepreciations] = useState({ yearN: "", yearN1: "" });

  const folderId = selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "NOTE9") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Map backend keys → frontend state
        if (noteData.titresPlacement) {
          setRows(
            noteData.titresPlacement.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.libelle || rows[i]?.label || "",
              yearN: String(r.anneeN ?? ""),
              yearN1: String(r.anneeN1 ?? ""),
            }))
          );
        } else if (noteData.rows) {
          setRows(noteData.rows);
        }
        if (noteData.depreciations) setDepreciations(noteData.depreciations);
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading Note 9 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Map frontend state → backend keys
      const noteData = {
        entete,
        titresPlacement: rows.map((r) => ({
          libelle: r.label,
          anneeN: parseFloat(r.yearN) || null,
          anneeN1: parseFloat(r.yearN1) || null,
          variationPourcentage: null,
        })),
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "NOTE9", noteData as any);
      if (success) {
        alert("Données Note 9 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 9 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 9");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowChange = (id: string, field: "yearN" | "yearN1", value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_9_titres_placement.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 9:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = ""
  ) => {
    return isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-blue-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span className="px-1">{value || ""}</span>
    );
  };

  const calculateTotal = (data: any[], field: string) => {
    return data.reduce((acc, row) => acc + (parseFloat(row[field]?.toString().replace(/\s/g, "")) || 0), 0);
  };

  const calculateVariation = (n: string | number, n1: string | number) => {
    const valN = typeof n === "string" ? parseFloat(n.replace(/\s/g, "")) || 0 : n;
    const valN1 = typeof n1 === "string" ? parseFloat(n1.replace(/\s/g, "")) || 0 : n1;
    if (valN1 === 0) return "-";
    const variation = ((valN - valN1) / valN1) * 100;
    return variation.toFixed(2) + "%";
  };

  const totalBrut = useMemo(() => calculateTotal(rows, "yearN"), [rows]);
  const totalN1 = useMemo(() => calculateTotal(rows, "yearN1"), [rows]);
  const totalNet = useMemo(() => totalBrut - (parseFloat(depreciations.yearN.replace(/\s/g, "")) || 0), [totalBrut, depreciations.yearN]);
  const totalNetN1 = useMemo(() => totalN1 - (parseFloat(depreciations.yearN1.replace(/\s/g, "")) || 0), [totalN1, depreciations.yearN1]);

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Note 9 - Titres de placement
          </h1>
          <p className="text-sm text-gray-600 mt-1">Standardization en cours...</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <Pencil size={18} /> Éditer
            </button>
          ) : (
            <>
              <button
                onClick={saveNoteData}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-blue-500" : "border-gray-200"
          }`}
      >
        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center text-sm">
            <div className="text-orange-800">
              <span className="font-bold">Attention :</span> Certains champs de l'en-tête sont vides.
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-orange-800 underline font-bold">
                Mettre à jour l'en-tête
              </button>
            )}
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">22</span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 pb-4">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Désignation entité :</span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) => setEntete({ ...entete, entityName: e.target.value })}
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">{entete.entityName || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={entete.fiscalYear}
                onChange={(e) => setEntete({ ...entete, fiscalYear: e.target.value })}
                className="border-b border-blue-500 bg-blue-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">{entete.fiscalYear || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={entete.idNumber}
                onChange={(e) => setEntete({ ...entete, idNumber: e.target.value })}
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">{entete.idNumber || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={entete.duration}
                onChange={(e) => setEntete({ ...entete, duration: e.target.value })}
                className="border-b border-blue-500 bg-blue-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">{entete.duration || "-"}</span>
            )}
          </div>
        </div>

        {/* Titre du Tableau */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-2 text-center font-bold mb-4 text-[12px]">
          NOTE 9 <br /> TITRES DE PLACEMENT
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-center w-[45%]">Libellés</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N-1</th>
              <th className="border border-gray-600 p-2 text-center w-[15%]">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) => handleRowChange(row.id, "yearN", val))}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) => handleRowChange(row.id, "yearN1", val))}
                </td>
                <td className="border border-gray-600 p-1 text-center bg-gray-50 font-bold">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-[#e6e6e6] font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL BRUT TITRES</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-center bg-gray-200">
                {calculateVariation(totalBrut, totalN1)}
              </td>
            </tr>

            {/* DEPRECIATIONS */}
            <tr>
              <td className="border border-gray-600 p-2 italic">Dépréciations des titres</td>
              <td className="border border-gray-600 p-1 text-right bg-red-50">
                {renderEditableCell(depreciations.yearN, (val) => setDepreciations({ ...depreciations, yearN: val }))}
              </td>
              <td className="border border-gray-600 p-1 text-right bg-red-50">
                {renderEditableCell(depreciations.yearN1, (val) => setDepreciations({ ...depreciations, yearN1: val }))}
              </td>
              <td className="border border-gray-600 bg-gray-100"></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-[#bfbfbf] font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalNetN1.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-center bg-gray-200">
                {calculateVariation(totalNet, totalNetN1)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border border-gray-600 p-3 bg-white min-h-[150px]">
          <div className="font-bold underline mb-3 text-[11px]">Commentaire :</div>
          <div className="text-[9px] text-gray-600 mb-4 space-y-1">
            <p>• Justifier toute variation significative.</p>
            <p>• Pour les titres cotés à une bourse de valeur : indiquer le nombre, le prix unitaire d'acquisition et le cours de la bourse au 31 décembre.</p>
            <p>• Faire ressortir les actions ou parts propres et indiquer la date d'acquisition et le nombre de titres détenus.</p>
            <p>• Indiquer les événements et circonstances qui ont conduit à la dépréciation et à la reprise.</p>
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-2 border border-blue-300 bg-blue-50 text-[11px] focus:outline-none resize-none"
              placeholder="Saisir votre commentaire ici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-[11px] min-h-[2rem]">
              {comment || "Aucun commentaire."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note9;
