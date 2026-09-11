import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

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

// generateNote7 (backend) renvoie 3 champs SÉPARÉS — `clientReceivables`
// (9 lignes, yearN/yearN1/oneYearOrLess/oneToTwoYears/moreThanTwoYears),
// `depreciations` (1 ligne, même forme) et `clientCreditors` (3 lignes,
// {id,label,amount}) — pas un tableau fusionné de 15 lignes avec des clés
// françaises (anneeN...). Les libellés ci-dessous ne servent plus qu'à
// initialiser l'état par défaut avant chargement.
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

// --- Composant Principal ---

const Note7: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const { hasFormula } = useFormulaPanel();

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
      id: String(i + 1),
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
    CREDITOR_LABELS.map((label, i) => ({ id: String(i + 1), label, amount: "" })),
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

        const receivables = noteData.clientReceivables ?? noteData.creancesClients;
        if (Array.isArray(receivables) && receivables.length > 0) {
          setClientReceivables(
            receivables.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r?.label ?? CLIENT_LABELS[i] ?? `Ligne ${i + 1}`,
              yearN: r?.yearN != null ? String(r.yearN) : "",
              yearN1: r?.yearN1 != null ? String(r.yearN1) : "",
              oneYearOrLess: r?.oneYearOrLess != null ? String(r.oneYearOrLess) : "",
              oneToTwoYears: r?.oneToTwoYears != null ? String(r.oneToTwoYears) : "",
              moreThanTwoYears: r?.moreThanTwoYears != null ? String(r.moreThanTwoYears) : "",
            })),
          );
        }

        const depRow = Array.isArray(noteData.depreciations) ? noteData.depreciations[0] : undefined;
        setDepreciations(depRow?.yearN != null ? String(depRow.yearN) : "");

        if (Array.isArray(noteData.clientCreditors) && noteData.clientCreditors.length > 0) {
          setClientCreditors(
            noteData.clientCreditors.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r?.label ?? CREDITOR_LABELS[i] ?? `Ligne ${i + 1}`,
              amount: r?.amount != null ? String(r.amount) : "",
            })),
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
      // generateNote7 (backend) attend 3 champs séparés — voir loadNoteData
      // ci-dessus pour la forme exacte (yearN/yearN1/... par ligne).
      const toRow = (
        id: string,
        label: string,
        r: {
          yearN?: string | number;
          yearN1?: string | number;
          oneYearOrLess?: string | number;
          oneToTwoYears?: string | number;
          moreThanTwoYears?: string | number;
        },
      ) => ({
        id,
        label,
        yearN: parseFloat(String(r.yearN ?? "")) || 0,
        yearN1: parseFloat(String(r.yearN1 ?? "")) || 0,
        oneYearOrLess: parseFloat(String(r.oneYearOrLess ?? "")) || 0,
        oneToTwoYears: parseFloat(String(r.oneToTwoYears ?? "")) || 0,
        moreThanTwoYears: parseFloat(String(r.moreThanTwoYears ?? "")) || 0,
      });

      const receivables = clientReceivables.map((r) => toRow(r.id, r.label, r));
      const noteData = {
        entete,
        clientReceivables: receivables,
        creancesClients: receivables,
        depreciations: [toRow("1", "Dépréciations des comptes clients", { yearN: depreciations })],
        clientCreditors: clientCreditors.map((r) => ({
          id: r.id,
          label: r.label,
          amount: parseFloat(String(r.amount ?? "")) || 0,
        })),
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

  const [isRegeneratingDSF, setIsRegeneratingDSF] = useState(false);

  // Régénère la DSF côté backend (relance dsf-generator.service.ts avec le
  // mapping comptable / les formules actuelles), puis recharge cette note
  // pour refléter les nouvelles valeurs.
  const regenerateDSF = async () => {
    if (!folderId) return;
    try {
      setIsRegeneratingDSF(true);
      await dsfService.generateDSF(folderId);
      await loadNoteData();
    } catch (error) {
      console.error("Error regenerating DSF:", error);
      alert("Erreur lors de la régénération de la DSF");
    } finally {
      setIsRegeneratingDSF(false);
    }
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
    className: string = "",
    formulaKey?: string,
    label?: string
  ) => {
    const display = (
      <span className="px-1">
        {value === "" || value === null || value === undefined
          ? ""
          : Number(value).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </span>
    );

    return isEditing && !(formulaKey && hasFormula(formulaKey)) ? (
      <input
        value={
          value === "" || value === null || value === undefined
            ? ""
            : Number(value).toLocaleString("fr-FR").replace(/ /g, " ")
        }
        onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : formulaKey && hasFormula(formulaKey) ? (
      <FormulaValue formulaKey={formulaKey} label={label || ""}>
        {display}
      </FormulaValue>
    ) : (
      display
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
    return variation.toFixed(0) + "%";
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
            title="Éditer"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil size={18} />
          </button>
          ) : (
            <>
              <button
            onClick={saveNoteData}
            disabled={isSaving}
            title="Sauvegarder"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className={isSaving ? "animate-pulse" : ""} />
          </button>
              <button
            onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
            title="Annuler"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
            </>
          )}
          <button
            onClick={regenerateDSF}
            disabled={isRegeneratingDSF}
            title="Recalculer la DSF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isRegeneratingDSF ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleDownloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
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
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            20
          </span>
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
                  {renderEditableCell(row.yearN, (val) => handleClientChange(row.id, "yearN", val), "", `note7.clientReceivables.${row.id}`, row.label)}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) => handleClientChange(row.id, "yearN1", val), "", `note7.clientReceivables.${row.id}`, row.label)}
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
              <td className="border border-gray-600 p-1 text-right">{totalBrut.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalN1.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-center">
                {calculateVariation(totalBrut, totalN1)}
              </td>
              <td className="border border-gray-600 p-1 text-right">{totalOneYear.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalOneTwoYears.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalMoreTwoYears.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
            </tr>

            {/* DEPRECIATIONS */}
            <tr>
              <td className="border border-gray-600 p-2 text-blue-700 italic">Dépréciations des comptes clients</td>
              <td className="border border-gray-600 p-1 text-right">
                {renderEditableCell(depreciations, (val) => setDepreciations(val), "", "note7.depreciations.1", "Dépréciations des comptes clients")}
              </td>
              <td colSpan={5} className="border border-gray-600"></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
              <td colSpan={5} className="border border-gray-600"></td>
            </tr>

            {/* CLIENTS CRÉDITEURS — continuent dans la même table/grille */}
            {clientCreditors.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2 text-blue-700">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.amount, (val) => handleCreditorChange(row.id, "amount", val), "", `note7.clientCreditors.${row.id}`, row.label)}
                </td>
                <td colSpan={5} className="border border-gray-600"></td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold text-[11px]">
              <td className="border border-gray-600 p-2">TOTAL CLIENTS CREDITEURS</td>
              <td className="border border-gray-600 p-1 text-right">{totalCreditors.toLocaleString("fr-FR").replace(/ /g, " ")}</td>
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




