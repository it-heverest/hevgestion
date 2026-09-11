import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";

// --- Interfaces ---
interface BalanceRow {
  id: string;
  ref: string;
  label: string | React.ReactNode;
  note: string | null;
  brutN: number;
  amortN: number;
  netN: number;
  netN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const BilanPaysage: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const { hasFormula } = useFormulaPanel();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load DSF data
  useEffect(() => {
    if (folderId) {
      loadDSFData();
    }
  }, [folderId]);

  const loadDSFData = async () => {
    if (!folderId) return;

    try {
      setLoading(true);
      const data = await notesService.getNoteData(folderId, "bilan-paysage") as any;

      if (data) {
        // Merge saved numeric values into the built-in row templates by id,
        // rather than replacing the arrays outright — ref/label/note are
        // defined locally (some labels are JSX, e.g. the Terrains/Bâtiments
        // footnotes) and must survive a load.
        const mergeValues = (prev: BalanceRow[], saved: any[]) =>
          prev.map((row) => {
            const match = saved.find((r: any) => r.id === row.id);
            return match
              ? {
                  ...row,
                  brutN: match.brutN ?? row.brutN,
                  amortN: match.amortN ?? row.amortN,
                  netN: match.netN ?? row.netN,
                  netN1: match.netN1 ?? row.netN1,
                }
              : row;
          });

        if (Array.isArray(data.actifRows)) {
          setActifRows((prev) => mergeValues(prev, data.actifRows));
        }

        if (Array.isArray(data.passifRows)) {
          setPassifRows((prev) => mergeValues(prev, data.passifRows));
        }

        if (data.headerInfo) {
          setHeaderInfo(data.headerInfo);
        }
      }
    } catch (error) {
      console.error("Error loading DSF data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!folderId) return;

    try {
      setSaving(true);

      const bilanData = {
        headerInfo,
        actifRows,
        passifRows,
      };

      const success = await notesService.saveNoteData(folderId, "bilan-paysage", bilanData as any);
      if (success) {
        alert("Données Bilan sauvegardées avec succès");
        setIsEditing(false);
      } else {
        alert("Erreur lors de la sauvegarde");
      }
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

  // ACTIF — colonne gauche du bilan paysage
  const [actifRows, setActifRows] = useState<BalanceRow[]>([
    { id: "ad", ref: "AD", label: "IMMOBILISATIONS INCORPORELLES", note: "3", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ae", ref: "AE", label: "Frais de développement et de prospection", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "af", ref: "AF", label: "Brevet, licences, logiciels et droits similaires", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ag", ref: "AG", label: "Fond commercial et droit au bail", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ah", ref: "AH", label: "Autres immobilisations incorporelles", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ai", ref: "AI", label: "IMMOBILISATIONS CORPORELLES", note: "3", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    {
      id: "aj",
      ref: "AJ",
      label: (
        <>
          Terrains (1)
          <br />
          <span className="text-[9px] italic">
            (1) dont placement en net ................ / ............
          </span>
        </>
      ),
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
    },
    {
      id: "ak",
      ref: "AK",
      label: (
        <>
          Bâtiments
          <br />
          <span className="text-[9px] italic">
            (1) dont placement net ................ / ............
          </span>
        </>
      ),
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
    },
    { id: "al", ref: "AL", label: "Aménagements, agencements et installations", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "am", ref: "AM", label: "Matériel, mobilier et actifs biologiques", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "an", ref: "AN", label: "Matériel de transport", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ap", ref: "AP", label: "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATION", note: "3", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "aq", ref: "AQ", label: "IMMOBILISATIONS FINANCIERES", note: "4", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ar", ref: "AR", label: "Titres de participation", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "as", ref: "AS", label: "Autres immobilisations financières", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "az", ref: "AZ", label: "TOTAL ACTIF IMMOBILISE", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ba", ref: "BA", label: "Actif circulant HAO", note: "5", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bb", ref: "BB", label: "Stocks et encours", note: "6", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bc", ref: "BC", label: "Créances et emplois assimilés", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bh", ref: "BH", label: "Fournisseurs avances versées", note: "17", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bi", ref: "BI", label: "Clients", note: "7", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bj", ref: "BJ", label: "Autres créances", note: "8", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bk", ref: "BK", label: "TOTAL ACTIF CIRCULANT", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bq", ref: "BQ", label: "Titres de placement", note: "9", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "br", ref: "BR", label: "Valeurs à encaisser", note: "10", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bs", ref: "BS", label: "Banques, chèques postaux, caisse et assimilés", note: "11", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bt", ref: "BT", label: "TOTAL TRESORERIE - ACTIF", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bu", ref: "BU", label: "Ecart de conversion - Actif", note: "12", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "bz", ref: "BZ", label: "TOTAL GENERAL", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
  ]);

  // PASSIF — colonne droite du bilan paysage
  const [passifRows, setPassifRows] = useState<BalanceRow[]>([
    { id: "ca", ref: "CA", label: "Capital", note: "13", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cb", ref: "CB", label: "Apporteurs capital non appelé (-)", note: "13", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cd", ref: "CD", label: "Primes liées au capital social", note: "14", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ce", ref: "CE", label: "Ecarts de réévaluations", note: "3e", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cf", ref: "CF", label: "Réserves indisponibles", note: "14", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cg", ref: "CG", label: "Réserves libres", note: "14", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "ch", ref: "CH", label: "Report à nouveau (+ ou -)", note: "14", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cj", ref: "CJ", label: "Résultat net de l'exercice (entrées + ou perte -)", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cl", ref: "CL", label: "Subventions d'investissement", note: "15", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cm", ref: "CM", label: "Provisions réglementées", note: "15", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "cp", ref: "CP", label: "TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "da", ref: "DA", label: "Emprunts et dettes financières diverses", note: "16", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "db", ref: "DB", label: "Dettes de location acquisition", note: "16", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dc", ref: "DC", label: "Provisions pour risques et charges", note: "16", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dd", ref: "DD", label: "TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "df", ref: "DF", label: "TOTAL RESSOURCES STABLES", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dh", ref: "DH", label: "Dettes circulantes HAO", note: "5", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "di", ref: "DI", label: "Clients, avances reçues", note: "7", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dj", ref: "DJ", label: "Fournisseurs d'exploitation", note: "17", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dk", ref: "DK", label: "Dettes fiscales et sociales", note: "18", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dm", ref: "DM", label: "Autres dettes", note: "19", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dn", ref: "DN", label: "Provisions pour risques à court terme", note: "19", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dp", ref: "DP", label: "TOTAL PASSIF CIRCULANT", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dq", ref: "DQ", label: "Banques, crédits d'escompte", note: "20", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dr", ref: "DR", label: "Banques, établissements financiers et crédits de trésorerie", note: "20", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dt", ref: "DT", label: "TOTAL TRESORERIE - PASSIF", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dy", ref: "DY", label: "Ecart de conversion - Passif", note: "12", brutN: 0, amortN: 0, netN: 0, netN1: 0 },
    { id: "dz", ref: "DZ", label: "TOTAL GENERAL", note: null, brutN: 0, amortN: 0, netN: 0, netN1: 0 },
  ]);

  const handleChange = (
    side: "actif" | "passif",
    id: string,
    field: "brutN" | "amortN" | "netN" | "netN1",
    value: string
  ) => {
    const updater = (prev: BalanceRow[]) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: Number(value) || 0 } : row));

    if (side === "actif") {
      setActifRows(updater);
    } else {
      setPassifRows(updater);
    }
  };

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
        pdf.save("bilan_paysage.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rowCount = Math.max(actifRows.length, passifRows.length);

  // Les libellés de rubriques (ex: "IMMOBILISATIONS INCORPORELLES") sont en
  // MAJUSCULES dans les données — sert à distinguer visuellement les
  // en-têtes de section (gras) et les totaux (gras + fond gris) des lignes
  // de détail normales (bleu), comme dans le vrai template.
  const isCaption = (label: BalanceRow["label"]): boolean =>
    typeof label === "string" && label === label.toUpperCase() && /[A-ZÀ-Ü]/.test(label);
  const isTotal = (label: BalanceRow["label"]): boolean =>
    isCaption(label) && (label as string).includes("TOTAL");

  const renderNumberCell = (
    side: "actif" | "passif",
    row: BalanceRow,
    field: "brutN" | "amortN" | "netN" | "netN1",
    extraClassName = ""
  ) => (
    <td className={`border border-gray-400 p-1 text-right whitespace-nowrap ${extraClassName}`}>
      {isEditing && !hasFormula(`bilan_paysage.${side}Rows.${row.id}`) ? (
        <input
          type="number"
          value={row[field]}
          onChange={(e) => handleChange(side, row.id, field, e.target.value)}
          className="w-full text-right bg-orange-50"
        />
      ) : (
        <FormulaValue
          formulaKey={`bilan_paysage.${side}Rows.${row.id}`}
          label={typeof row.label === "string" ? row.label : row.ref}
        >
          {row[field].toLocaleString("fr-FR").replace(/\u202F/g, " ")}
        </FormulaValue>
      )}
    </td>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-full max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Bilan Paysage
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
              setIsEditing(!isEditing);
            }}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} /> : <Pencil size={18} />}
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
        className="w-full max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            5
          </span>
        </div>

        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold mb-4 text-xl">
          BILAN PAYSAGE
        </div>

        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold whitespace-nowrap">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) => setHeaderInfo({ ...headerInfo, entityName: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 flex-1 focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold whitespace-nowrap">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) => setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-32 text-center focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-32 text-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="font-bold whitespace-nowrap">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) => setHeaderInfo({ ...headerInfo, idNumber: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 flex-1 focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold whitespace-nowrap">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) => setHeaderInfo({ ...headerInfo, duration: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-16 text-center focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        <div className="text-center font-bold mb-4">
          BILAN AU 31 DECEMBRE N
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1">
                REF
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[18%]"
              >
                ACTIF
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Note
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE au 31/12/N
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE au 31/12/N-1
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                REF
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[18%]"
              >
                PASSIF
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Note
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE au 31/12/N
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE au 31/12/N-1
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">BRUT</th>
              <th className="border border-gray-400 p-1">AMORT et DEPREC.</th>
              <th className="border border-gray-400 p-1">NET</th>
              <th className="border border-gray-400 p-1">NET</th>
              <th className="border border-gray-400 p-1">NET</th>
              <th className="border border-gray-400 p-1">NET</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, i) => {
              const a = actifRows[i];
              const p = passifRows[i];
              const aTotal = a ? isTotal(a.label) : false;
              const aCaption = a ? isCaption(a.label) : false;
              const aBg = aTotal ? "bg-gray-300" : "";
              const aLabelCls = aCaption ? "font-bold" : "text-blue-700";
              const pTotal = p ? isTotal(p.label) : false;
              const pCaption = p ? isCaption(p.label) : false;
              const pBg = pTotal ? "bg-gray-300" : "";
              const pLabelCls = pCaption ? "font-bold" : "text-blue-700";
              return (
                <tr key={a?.id || p?.id || i}>
                  {a ? (
                    <>
                      <td className={`border border-gray-400 p-1 text-center font-bold ${aBg}`}>
                        {a.ref}
                      </td>
                      <td className={`border border-gray-400 p-1 pl-2 ${aLabelCls} ${aBg}`}>
                        {a.label}
                      </td>
                      <td className={`border border-gray-400 p-1 text-center ${aBg}`}>
                        {a.note || ""}
                      </td>
                      {renderNumberCell("actif", a, "brutN", `${aCaption ? "font-bold" : ""} ${aBg}`)}
                      {renderNumberCell("actif", a, "amortN", `${aCaption ? "font-bold" : ""} ${aBg}`)}
                      {renderNumberCell("actif", a, "netN", `font-bold ${aBg}`)}
                      {renderNumberCell("actif", a, "netN1", `font-bold ${aBg}`)}
                    </>
                  ) : (
                    <td colSpan={7}></td>
                  )}
                  {p ? (
                    <>
                      <td className={`border border-gray-400 p-1 text-center font-bold ${pBg}`}>
                        {p.ref}
                      </td>
                      <td className={`border border-gray-400 p-1 pl-2 ${pLabelCls} ${pBg}`}>
                        {p.label}
                      </td>
                      <td className={`border border-gray-400 p-1 text-center ${pBg}`}>
                        {p.note || ""}
                      </td>
                      {renderNumberCell("passif", p, "netN", `font-bold ${pBg}`)}
                      {renderNumberCell("passif", p, "netN1", `font-bold ${pBg}`)}
                    </>
                  ) : (
                    <td colSpan={5}></td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BilanPaysage;
