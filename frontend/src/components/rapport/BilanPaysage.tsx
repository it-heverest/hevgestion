import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

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
  // Passif side
  isPassif?: boolean;
  passifBrutN?: number; // Not used, but for structure
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
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [dsfId, setDsfId] = useState<string | null>(null);
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
      const response = await dsfService.getDSF(folderId);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      if (dsf.bilan && dsf.bilan.rows) {
        setRows(dsf.bilan.rows);
      }

      if (dsf.bilan && dsf.bilan.headerInfo) {
        setHeaderInfo(dsf.bilan.headerInfo);
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

      const bilanData = {
        headerInfo,
        rows,
      };

      await dsfService.updateDSF(dsfId, { bilan: bilanData });
      alert("Données Bilan sauvegardées avec succès");
      setIsEditing(false);
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

  // All rows - Actif and Passif combined for simplicity
  const [rows, setRows] = useState<BalanceRow[]>([
    // ACTIF
    {
      id: "ad",
      label: "IMMOBILISATIONS INCORPORELLES",
      note: "3",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AD",
    },
    {
      id: "ae",
      label: "Frais de développement et de prospection",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AE",
    },
    {
      id: "af",
      label: "Brevet, licences, logiciels et droits similaires",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AF",
    },
    {
      id: "ag",
      label: "Fond commercial et droit au bail",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AG",
    },
    {
      id: "ah",
      label: "Autres immobilisations incorporelles",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AH",
    },
    {
      id: "ai",
      label: "IMMOBILISATIONS CORPORELLES",
      note: "3",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AI",
    },
    {
      id: "aj",
      label: "Terrains (1)",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AJ",
    },
    {
      id: "ak",
      label: "(1) dont placement en net ................ / ............",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AK",
    },
    {
      id: "al",
      label: "Aménagements, agencements et installations",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AL",
    },
    {
      id: "am",
      label: "Matériel, mobilier et actifs biologiques",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AM",
    },
    {
      id: "an",
      label: "Matériel de transport",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AN",
    },
    {
      id: "ao",
      label: "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATION",
      note: "3",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AO",
    },
    {
      id: "ap",
      label: "IMMOBILISATION FINANCIERES",
      note: "4",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AP",
    },
    {
      id: "aq",
      label: "Titres de participation",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AQ",
    },
    {
      id: "ar",
      label: "Autres immobilisations financières",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AR",
    },
    {
      id: "as",
      label: "TOTAL ACTIF IMMOBILISE",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "AS",
    },
    {
      id: "ba",
      label: "Actif circulant HAO",
      note: "5",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BA",
    },
    {
      id: "bb",
      label: "Stocks et encours",
      note: "6",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BB",
    },
    {
      id: "bc",
      label: "Créances et emplois assimilés",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BC",
    },
    {
      id: "bd",
      label: "Fournisseurs avances versées",
      note: "17",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BD",
    },
    {
      id: "be",
      label: "Clients",
      note: "7",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BE",
    },
    {
      id: "bf",
      label: "Autres créances",
      note: "8",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BF",
    },
    {
      id: "bg",
      label: "TOTAL ACTIF CIRCULANT",
      note: "9",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BG",
    },
    {
      id: "bh",
      label: "Titres de placement",
      note: "9",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BH",
    },
    {
      id: "bi",
      label: "Valeurs à encaisser",
      note: "10",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BI",
    },
    {
      id: "bj",
      label: "Banques, chèques postaux, caisse et assimilés",
      note: "11",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BJ",
    },
    {
      id: "bk",
      label: "TOTAL TRESORERIE - ACTIF",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BK",
    },
    {
      id: "bl",
      label: "Ecart de conversion - Actif",
      note: "12",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BL",
    },
    {
      id: "bm",
      label: "TOTAL GENERAL",
      note: "12",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "BM",
    },

    // PASSIF
    {
      id: "ca",
      label: "Capital",
      note: "13",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CA",
      isPassif: true,
    },
    {
      id: "cb",
      label: "Apporteurs capital non appelé (-)",
      note: "13",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CB",
      isPassif: true,
    },
    {
      id: "cc",
      label: "Primes liées au capital social",
      note: "14",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CC",
      isPassif: true,
    },
    {
      id: "cd",
      label: "Ecart de réévaluation",
      note: "3a",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CD",
      isPassif: true,
    },
    {
      id: "ce",
      label: "Réserves indisponibles",
      note: "14",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CE",
      isPassif: true,
    },
    {
      id: "cf",
      label: "Réserves libres",
      note: "14",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CF",
      isPassif: true,
    },
    {
      id: "cg",
      label: "Report à nouveau (+ ou -)",
      note: "14",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CG",
      isPassif: true,
    },
    {
      id: "ch",
      label: "Résultat net de l'exercice (bénéfice + ou perte -)",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CH",
      isPassif: true,
    },
    {
      id: "ci",
      label: "Subventions d'investissement",
      note: "15",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CI",
      isPassif: true,
    },
    {
      id: "cj",
      label: "Provisions réglementées",
      note: "15",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CJ",
      isPassif: true,
    },
    {
      id: "ck",
      label: "TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "CK",
      isPassif: true,
    },
    {
      id: "da",
      label: "Emprunts et dettes financières diverses",
      note: "16",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DA",
      isPassif: true,
    },
    {
      id: "db",
      label: "Dettes de location acquisition",
      note: "16",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DB",
      isPassif: true,
    },
    {
      id: "dc",
      label: "Provisions pour risques et charges",
      note: "16",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DC",
      isPassif: true,
    },
    {
      id: "dd",
      label: "TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DD",
      isPassif: true,
    },
    {
      id: "de",
      label: "TOTAL RESSOURCES STABLES",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DE",
      isPassif: true,
    },
    {
      id: "df",
      label: "Dettes circulantes HAO",
      note: "5",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DF",
      isPassif: true,
    },
    {
      id: "dg",
      label: "Clients, avances reçues",
      note: "7",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DG",
      isPassif: true,
    },
    {
      id: "dh",
      label: "Fournisseurs d'exploitation",
      note: "17",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DH",
      isPassif: true,
    },
    {
      id: "di",
      label: "Dettes fiscales et sociales",
      note: "18",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DI",
      isPassif: true,
    },
    {
      id: "dj",
      label: "Autres dettes",
      note: "19",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DJ",
      isPassif: true,
    },
    {
      id: "dk",
      label: "Provisions pour risques à court terme",
      note: "19",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DK",
      isPassif: true,
    },
    {
      id: "dl",
      label: "TOTAL PASSIF CIRCULANT",
      note: "20",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DL",
      isPassif: true,
    },
    {
      id: "dm",
      label: "Banques, crédits d'escompte",
      note: "20",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DM",
      isPassif: true,
    },
    {
      id: "dn",
      label: "Banques, établissements financiers et crédits de trésorerie",
      note: "20",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DN",
      isPassif: true,
    },
    {
      id: "do",
      label: "TOTAL TRESORERIE - PASSIF",
      note: null,
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DO",
      isPassif: true,
    },
    {
      id: "dp",
      label: "Ecart de conversion - Passif",
      note: "12",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DP",
      isPassif: true,
    },
    {
      id: "dq",
      label: "TOTAL GENERAL",
      note: "12",
      brutN: 0,
      amortN: 0,
      netN: 0,
      netN1: 0,
      ref: "DQ",
      isPassif: true,
    },
  ]);

  const handleChange = (
    id: string,
    field: "brutN" | "amortN" | "netN" | "netN1",
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
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("bilan_paysage.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderActifRow = (row: BalanceRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 text-center font-bold">
        {row.ref}
      </td>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-center">
        {row.note || ""}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.brutN}
            onChange={(e) => handleChange(row.id, "brutN", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.brutN.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.amortN}
            onChange={(e) => handleChange(row.id, "amortN", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.amortN.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {isEditing ? (
          <input
            type="number"
            value={row.netN}
            onChange={(e) => handleChange(row.id, "netN", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.netN.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {isEditing ? (
          <input
            type="number"
            value={row.netN1}
            onChange={(e) => handleChange(row.id, "netN1", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.netN1.toLocaleString("fr-FR")
        )}
      </td>
      <td colSpan={5}></td>
    </tr>
  );

  const renderPassifRow = (row: BalanceRow) => (
    <tr key={row.id}>
      <td colSpan={7}></td>
      <td className="border border-gray-400 p-1 text-center font-bold">
        {row.ref}
      </td>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-center">
        {row.note || ""}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {isEditing ? (
          <input
            type="number"
            value={row.netN}
            onChange={(e) => handleChange(row.id, "netN", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.netN.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {isEditing ? (
          <input
            type="number"
            value={row.netN1}
            onChange={(e) => handleChange(row.id, "netN1", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.netN1.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Bilan Paysage
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
              setIsEditing(!isEditing);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
              isEditing ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {isEditing ? (
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <div className="text-center font-bold mb-2 text-lg">5</div>

        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            <span className="border-b border-dotted border-gray-400 flex-1">
              {headerInfo.entityName}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            <span className="border-b border-dotted border-gray-400 w-32 text-center">
              {headerInfo.fiscalYear}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            <span className="border-b border-dotted border-gray-400 flex-1">
              {headerInfo.idNumber}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="border-b border-dotted border-gray-400 w-16 text-center">
              {headerInfo.duration}
            </span>
          </div>
        </div>

        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          BILAN PAYSAGE
          <br />
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
                className="border border-gray-400 p-1 pl-2 w-[25%]"
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
                className="border border-gray-400 p-1 pl-2 w-[25%]"
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
            {rows.map((row) =>
              row.isPassif ? renderPassifRow(row) : renderActifRow(row)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BilanPaysage;
 



