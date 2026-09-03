import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Types et Interfaces ---

interface ClientRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  oneYearOrLess: string;
  oneToTwoYears: string;
  moreThanTwoYears: string;
}

interface CreditorRow {
  id: string;
  label: string;
  amount: string;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// Le backend (CONFIG_NOTE7) stocke tout dans UN SEUL tableau `creancesClients`
// de 15 lignes, dans cet ordre exact : 8 créances clients, TOTAL BRUT
// CLIENTS, Dépréciations, TOTAL NET DE DEPRECIATION, 3 créditeurs, TOTAL
// CLIENTS CREDITEURS. Les index ci-dessous servent à découper/reconstituer
// ce tableau au chargement/à la sauvegarde.
const CLIENT_LABELS = [
  "Clients (hors réserves de propriété Groupe)",
  "Clients effets à recevoir (hors réserves de propriété Groupe)",
  "Clients et effets à recevoir avec réserves de propriété",
  "Clients et effets à recevoir Groupe",
  "Créances sur cession d'immobilisations",
  "Clients effets escomptés et non échus",
  "Créances litigieuses ou douteuses",
  "Clients produits à recevoir",
];
const CREDITOR_LABELS = [
  "Clients, avances reçues hors groupe",
  "Clients, avances reçues groupe",
  "Autres clients créditeurs",
];
const DEPRECIATION_INDEX = CLIENT_LABELS.length + 1; // après TOTAL BRUT CLIENTS
const CREDITORS_START_INDEX = DEPRECIATION_INDEX + 2; // après TOTAL NET DE DEPRECIATION

// --- Composant Principal ---

const Note7: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();

  // État pour l'en-tête (Standardized)
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  // État pour le commentaire
  const [comment, setComment] = useState("");

  // État pour les Créances Clients
  const [clientReceivables, setClientReceivables] = useState<ClientRow[]>(
    CLIENT_LABELS.map((label, i) => ({
      id: String(14 + i),
      label,
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    })),
  );

  // Dépréciations
  const [depreciations, setDepreciations] = useState("");

  // Clients Créditeurs
  const [clientCreditors, setClientCreditors] = useState<CreditorRow[]>(
    CREDITOR_LABELS.map((label, i) => ({ id: `c${i + 1}`, label, amount: "" })),
  );

  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "7") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Le backend stocke les 15 lignes (8 créances + TOTAL BRUT +
        // Dépréciations + TOTAL NET + 3 créditeurs + TOTAL CREDITEURS) dans
        // un seul tableau, dans cet ordre exact (cf. CONFIG_NOTE7) — les
        // lignes TOTAL sont ignorées ici car recalculées côté client.
        const rows = noteData.creancesClients;
        if (Array.isArray(rows) && rows.length > 0) {
          setClientReceivables(
            CLIENT_LABELS.map((label, i) => {
              const r = rows[i];
              return {
                id: String(14 + i),
                label,
                yearN: String(r?.anneeN ?? ""),
                yearN1: String(r?.anneeN1 ?? ""),
                oneYearOrLess: String(r?.creancesUnAnAuPlus ?? ""),
                oneToTwoYears: String(r?.creancesPlusUnAnDeuxAns ?? ""),
                moreThanTwoYears: String(r?.creancesPlusDeuxAns ?? ""),
              };
            }),
          );
          const depRow = rows[DEPRECIATION_INDEX];
          setDepreciations(depRow?.anneeN != null ? String(depRow.anneeN) : "");
          setClientCreditors(
            CREDITOR_LABELS.map((label, i) => {
              const r = rows[CREDITORS_START_INDEX + i];
              return {
                id: `c${i + 1}`,
                label,
                amount: r?.anneeN != null ? String(r.anneeN) : "",
              };
            }),
          );
        }
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading Note 7 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Le backend attend un seul tableau de 15 lignes, dans l'ordre exact
      // du template (8 créances + TOTAL BRUT + Dépréciations + TOTAL NET +
      // 3 créditeurs + TOTAL CREDITEURS), cf. CONFIG_NOTE7 côté backend.
      const toApiRow = (
        label: string,
        r: {
          yearN?: string | number;
          yearN1?: string | number;
          oneYearOrLess?: string | number;
          oneToTwoYears?: string | number;
          moreThanTwoYears?: string | number;
        },
      ) => ({
        libelle: label,
        anneeN: parseFloat(String(r.yearN ?? "")) || null,
        anneeN1: parseFloat(String(r.yearN1 ?? "")) || null,
        variationPourcentage: calculateVariationNumber(r.yearN ?? "", r.yearN1 ?? ""),
        creancesUnAnAuPlus: parseFloat(String(r.oneYearOrLess ?? "")) || null,
        creancesPlusUnAnDeuxAns: parseFloat(String(r.oneToTwoYears ?? "")) || null,
        creancesPlusDeuxAns: parseFloat(String(r.moreThanTwoYears ?? "")) || null,
      });

      const noteData = {
        entete,
        creancesClients: [
          ...clientReceivables.map((r) => toApiRow(r.label, r)),
          toApiRow("TOTAL BRUT CLIENTS", { yearN: totalBrut, yearN1: totalN1, oneYearOrLess: totalOneYear, oneToTwoYears: totalOneTwoYears, moreThanTwoYears: totalMoreTwoYears }),
          toApiRow("Dépréciations des comptes clients", { yearN: depreciations }),
          toApiRow("TOTAL NET DE DEPRECIATION", { yearN: totalNet }),
          ...clientCreditors.map((r) => toApiRow(r.label, { yearN: r.amount })),
          toApiRow("TOTAL CLIENTS CREDITEURS", { yearN: totalCreditors }),
        ],
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "7", noteData as any);
      if (success) {
        alert("Données Note 7 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 7 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 7");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientChange = (id: string, field: keyof ClientRow, value: string) => {
    setClientReceivables((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleCreditorChange = (id: string, field: keyof CreditorRow, value: string) => {
    setClientCreditors((prev) =>
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
        pdf.save("note_7_clients.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 7:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string | number,
    onChange: (val: string) => void,
    className: string = ""
  ) => {
    return isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span className="px-1">{value?.toLocaleString() || ""}</span>
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

  const calculateVariationNumber = (
    n: string | number,
    n1: string | number,
  ): number | null => {
    const valN = typeof n === "string" ? parseFloat(n.replace(/\s/g, "")) || 0 : n;
    const valN1 = typeof n1 === "string" ? parseFloat(n1.replace(/\s/g, "")) || 0 : n1;
    if (!valN1) return null;
    return Number((((valN - valN1) / valN1) * 100).toFixed(2));
  };

  const totalBrut = useMemo(() => calculateTotal(clientReceivables, "yearN"), [clientReceivables]);
  const totalN1 = useMemo(() => calculateTotal(clientReceivables, "yearN1"), [clientReceivables]);
  const totalOneYear = useMemo(() => calculateTotal(clientReceivables, "oneYearOrLess"), [clientReceivables]);
  const totalOneTwoYears = useMemo(() => calculateTotal(clientReceivables, "oneToTwoYears"), [clientReceivables]);
  const totalMoreTwoYears = useMemo(() => calculateTotal(clientReceivables, "moreThanTwoYears"), [clientReceivables]);
  const totalCreditors = useMemo(() => calculateTotal(clientCreditors, "amount"), [clientCreditors]);
  const totalNet = useMemo(() => totalBrut - (parseFloat(String(depreciations ?? "").replace(/\s/g, "")) || 0), [totalBrut, depreciations]);

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 7 - Clients
          </h1>
          <p className="text-sm text-gray-600 mt-1">Standardization en cours...</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
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
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
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
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
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
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">20</span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 pb-4">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Désignation entité :</span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) => setEntete({ ...entete, entityName: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
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
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
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
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
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
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">{entete.duration || "-"}</span>
            )}
          </div>
        </div>

        {/* Titre du Tableau */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-2 text-center font-bold mb-4 text-[12px]">
          NOTE 7 <br /> CLIENTS
        </div>

        {/* Tableau Principal — une seule table continue, comme dans le vrai
            template (Créances Clients + Dépréciations + Clients Créditeurs
            partagent la même grille de colonnes) */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 w-[25%]">Libellés</th>
              <th className="border border-gray-600 p-2 w-[12%]">Année N</th>
              <th className="border border-gray-600 p-2 w-[12%]">Année N-1</th>
              <th className="border border-gray-600 p-2 w-[8%]">Variation en %</th>
              <th className="border border-gray-600 p-2 w-[14%]">Créances à un an au plus</th>
              <th className="border border-gray-600 p-2 w-[15%]">Créances à plus d'un an et à deux ans au plus</th>
              <th className="border border-gray-600 p-2 w-[14%]">Créances à plus de deux ans</th>
            </tr>
          </thead>
          <tbody>
            {clientReceivables.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2 text-blue-700">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) => handleClientChange(row.id, "yearN", val))}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) => handleClientChange(row.id, "yearN1", val))}
                </td>
                <td className="border border-gray-600 p-1 text-center bg-gray-50 font-bold">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.oneYearOrLess, (val) => handleClientChange(row.id, "oneYearOrLess", val))}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.oneToTwoYears, (val) => handleClientChange(row.id, "oneToTwoYears", val))}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.moreThanTwoYears, (val) => handleClientChange(row.id, "moreThanTwoYears", val))}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL BRUT CLIENTS</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-center">
                {calculateVariation(totalBrut, totalN1)}
              </td>
              <td className="border border-gray-600 p-1 text-right">{totalOneYear.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalOneTwoYears.toLocaleString()}</td>
              <td className="border border-gray-600 p-1 text-right">{totalMoreTwoYears.toLocaleString()}</td>
            </tr>

            {/* DEPRECIATIONS */}
            <tr>
              <td className="border border-gray-600 p-2 text-blue-700 italic">Dépréciations des comptes clients</td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(depreciations, (val) => setDepreciations(val))}
              </td>
              <td colSpan={5} className="border border-gray-600"></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.toLocaleString()}</td>
              <td colSpan={5} className="border border-gray-600"></td>
            </tr>

            {/* CLIENTS CRÉDITEURS — continuent dans la même table/grille */}
            {clientCreditors.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2 text-blue-700">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.amount, (val) => handleCreditorChange(row.id, "amount", val))}
                </td>
                <td colSpan={5} className="border border-gray-600"></td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL CLIENTS CREDITEURS</td>
              <td className="border border-gray-600 p-1 text-right">{totalCreditors.toLocaleString()}</td>
              <td colSpan={5} className="border border-gray-600"></td>
            </tr>
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border border-gray-600 p-3 bg-white min-h-[120px]">
          <div className="font-bold underline mb-2">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-orange-300 bg-orange-50 text-[11px] focus:outline-none resize-none"
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

export default Note7;




