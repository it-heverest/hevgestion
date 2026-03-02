import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Types et Interfaces ---

interface StockRow {
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

const Note6: React.FC = () => {
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

  // État pour les stocks
  const [stocks, setStocks] = useState<StockRow[]>([
    { id: "1", label: "Marchandises", yearN: "", yearN1: "" },
    { id: "2", label: "Matières premières et fournitures liées", yearN: "", yearN1: "" },
    { id: "3", label: "Autres approvisionnements", yearN: "", yearN1: "" },
    { id: "4", label: "Produits en cours", yearN: "", yearN1: "" },
    { id: "5", label: "Services en cours", yearN: "", yearN1: "" },
    { id: "6", label: "Produits finis", yearN: "", yearN1: "" },
    { id: "7", label: "Produits intermédiaires", yearN: "", yearN1: "" },
    { id: "8", label: "Stocks en cours de route, en consignation ou en dépôt", yearN: "", yearN1: "" },
  ]);

  const [totalBrut, setTotalBrut] = useState({ yearN: "", yearN1: "" });
  const [depreciations, setDepreciations] = useState({ yearN: "", yearN1: "" });
  const [totalNet, setTotalNet] = useState({ yearN: "", yearN1: "" });

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
      const noteData = await notesService.getNoteData(folderId, "NOTE6") as any;
      if (noteData) {
        setEntete(noteData.entete || entete);
        // Map backend keys → frontend state
        if (noteData.stocksEnCours) {
          setStocks(
            noteData.stocksEnCours.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.libelle || stocks[i]?.label || "",
              yearN: String(r.anneeN ?? ""),
              yearN1: String(r.anneeN1 ?? ""),
            }))
          );
        } else if (noteData.stocks) {
          setStocks(noteData.stocks);
        }
        if (noteData.totalBrut) setTotalBrut(noteData.totalBrut);
        if (noteData.depreciations) setDepreciations(noteData.depreciations);
        if (noteData.totalNet) setTotalNet(noteData.totalNet);
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading Note 6 data:", error);
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
        stocksEnCours: stocks.map((r) => ({
          libelle: r.label,
          anneeN: parseFloat(r.yearN) || null,
          anneeN1: parseFloat(r.yearN1) || null,
          variationPourcentage: null,
        })),
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "NOTE6", noteData as any);
      if (success) {
        alert("Données Note 6 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 6 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 6");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStockChange = (id: string, field: "yearN" | "yearN1", value: string) => {
    setStocks((prev) =>
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
        pdf.save("note_6_stocks.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 6:", error);
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

  const calculateVariation = (n: string, n1: string) => {
    const valN = parseFloat(n.replace(/\s/g, "")) || 0;
    const valN1 = parseFloat(n1.replace(/\s/g, "")) || 0;
    if (valN1 === 0) return "-";
    const variation = ((valN - valN1) / valN1) * 100;
    return variation.toFixed(2) + "%";
  };

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
            Note 6 - Stocks et en cours
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Standardization en cours...
          </p>
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
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Sauvegarder
                  </>
                )}
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
        {isEditing && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-blue-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center text-sm">
            <div className="text-orange-800">
              <span className="font-bold">Attention :</span> Certains champs de l'en-tête sont vides.
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-orange-800 underline font-bold"
              >
                Mettre à jour l'en-tête
              </button>
            )}
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            19
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4">
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
          NOTE 6 <br /> STOCKS ET EN COURS (*)
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-center w-[40%]">Libellés</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Année N-1</th>
              <th className="border border-gray-600 p-2 text-center w-[20%]">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) => handleStockChange(row.id, "yearN", val))}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) => handleStockChange(row.id, "yearN1", val))}
                </td>
                <td className="border border-gray-600 p-2 text-center bg-gray-50">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-[#e6e6e6] font-bold">
              <td className="border border-gray-600 p-2">TOTAL BRUT STOCKS ET EN COURS</td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(totalBrut.yearN, (val) => setTotalBrut({ ...totalBrut, yearN: val }))}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(totalBrut.yearN1, (val) => setTotalBrut({ ...totalBrut, yearN1: val }))}
              </td>
              <td className="border border-gray-600 p-2 text-center bg-gray-200">
                {calculateVariation(totalBrut.yearN, totalBrut.yearN1)}
              </td>
            </tr>

            <tr className="h-4">
              <td colSpan={4} className="border border-gray-600"></td>
            </tr>

            {/* DEPRECIATIONS */}
            <tr>
              <td className="border border-gray-600 p-2">Dépréciation stocks</td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(depreciations.yearN, (val) => setDepreciations({ ...depreciations, yearN: val }))}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(depreciations.yearN1, (val) => setDepreciations({ ...depreciations, yearN1: val }))}
              </td>
              <td className="border border-gray-600 p-2 text-center bg-gray-50">
                {calculateVariation(depreciations.yearN, depreciations.yearN1)}
              </td>
            </tr>

            <tr className="h-4">
              <td colSpan={4} className="border border-gray-600"></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-[#e6e6e6] font-bold">
              <td className="border border-gray-600 p-2">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(totalNet.yearN, (val) => setTotalNet({ ...totalNet, yearN: val }))}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(totalNet.yearN1, (val) => setTotalNet({ ...totalNet, yearN1: val }))}
              </td>
              <td className="border border-gray-600 p-2 text-center bg-gray-200">
                {calculateVariation(totalNet.yearN, totalNet.yearN1)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Note explicative bas de tableau */}
        <div className="text-[9px] italic mb-4">
          (*) Les stocks HAO seront inscrits dans l'actif circulant H.AO que lorsque leur montant total est significatif (supérieur à 5% du total de l'actif circulant).
        </div>

        {/* Section Commentaire */}
        <div className="border border-gray-600 p-3 mb-4 bg-white min-h-[120px]">
          <div className="font-bold underline mb-2">Commentaire :</div>
          <div className="text-[9px] text-gray-600 mb-3 space-y-1">
            <p>• Indiquer la date de prise d'inventaire et décrire brièvement la procédure, les méthodes comptables adaptées pour évaluer le stock.</p>
            <p>• Commenter toute variation significative de stocks.</p>
            <p>• Indiquer le détail des stocks dépréciés et les évènements et circonstances qui ont conduit à la dépréciation et à la reprise.</p>
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-blue-300 bg-blue-50 text-[11px] focus:outline-none resize-none"
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

export default Note6;
