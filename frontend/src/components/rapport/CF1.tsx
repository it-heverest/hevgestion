import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface CF1Row {
  id: string;
  label: string | React.ReactNode;
  line: number;
  amount: number;
}

interface RubriqueRow {
  id: string;
  label: string;
  line: number;
  minimum: string;
  base: string;
  rate: string;
  principal: string;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const CF1: React.FC = () => {
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

      if (dsf.notes && dsf.notes.cf1) {
        const data = dsf.notes.cf1;

        if (data.headerInfo) {
          setHeaderInfo(data.headerInfo);
        }

        if (data.rows) {
          setRows(data.rows);
        }

        if (data.rubriques) {
          setRubriques(data.rubriques);
        }
      }
    } catch (error: any) {
      console.error("Error loading DSF data:", error);
      // If DSF doesn't exist, try to generate it
      if (error.response?.status === 404) {
        try {
          console.log("DSF not found, attempting to generate...");
          await dsfService.generateDSF(selectedFolder.id);
          // Retry loading after generation
          const response = await dsfService.getDSF(selectedFolder.id);
          const dsf = response.dsf;
          setDsfId(dsf.id);

          if (dsf.notes && dsf.notes.cf1) {
            const data = dsf.notes.cf1;
            if (data.headerInfo) setHeaderInfo(data.headerInfo);
            if (data.rows) setRows(data.rows);
            if (data.rubriques) setRubriques(data.rubriques);
          }
        } catch (genError) {
          console.error("Error generating DSF:", genError);
          alert("Erreur: Impossible de charger ou générer le DSF. Veuillez vérifier que des bilans sont disponibles pour ce dossier.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!selectedFolder?.id) return;

    try {
      setSaving(true);

      // If no DSF exists, try to generate it first
      let currentDsfId = dsfId;
      if (!currentDsfId) {
        try {
          await dsfService.generateDSF(selectedFolder.id);
          const response = await dsfService.getDSF(selectedFolder.id);
          currentDsfId = response.dsf.id;
          setDsfId(currentDsfId);
        } catch (genError) {
          console.error("Error generating DSF for save:", genError);
          alert("Erreur: Impossible de sauvegarder. Veuillez vérifier que des bilans sont disponibles.");
          return;
        }
      }

      const cf1Data = {
        headerInfo,
        rows,
        rubriques,
      };

      const notes = { cf1: cf1Data };

      await dsfService.updateDSF(currentDsfId, { notes });
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

  // Lignes du tableau principal
  const [rows, setRows] = useState<CF1Row[]>([
    {
      id: "1",
      label: "Bénéfice net comptable avant impôt",
      line: 1,
      amount: 0,
    },
    { id: "2", label: "Amortissement non déductible", line: 3, amount: 0 },
    {
      id: "3",
      label:
        "Amortissement comptable mais réputes différés en période déficitaire",
      line: 4,
      amount: 0,
    },
    { id: "4", label: "Provisions non déductibles", line: 5, amount: 0 },
    {
      id: "5",
      label: "Intérêt excédentaires des comptes courants d'associés",
      line: 6,
      amount: 0,
    },
    {
      id: "6",
      label: "Frais de siège et d'assistance technique",
      line: 7,
      amount: 0,
    },
    {
      id: "7",
      label: "Impôt non déductibles autres qu'impôt sur le résultat",
      line: 8,
      amount: 0,
    },
    {
      id: "8",
      label: "Amendes et pénalités non déductibles",
      line: 9,
      amount: 0,
    },
    {
      id: "9",
      label: (
        <span className="text-red-600">Pourboires et dons non déductibles</span>
      ),
      line: 10,
      amount: 0,
    },
    {
      id: "10",
      label: "Revenu à la source(IRMC) sur revenus des capitaux mobiliers",
      line: 12,
      amount: 0,
    },
    { id: "11", label: "Divers 1", line: 13, amount: 0 },
    { id: "12", label: "Divers 2", line: 14, amount: 0 },
    { id: "13", label: "Divers 3", line: 15, amount: 0 },
    {
      id: "14",
      label: "Total intermédiaire POSITIF : ligne 15=lignes1ou ligne15ligne2",
      line: 16,
      amount: 0,
    },
    {
      id: "15",
      label: "Total intermédiaire NEGATIF : ligne2=lignes 15",
      line: 17,
      amount: 0,
    },
    {
      id: "16",
      label: "Amortissement antérieur différés et imputés sur l'exercice",
      line: 18,
      amount: 0,
    },
    {
      id: "17",
      label:
        "Provisions antérieurement taxées ou définitivement exonérées réintégrées dans",
      line: 19,
      amount: 0,
    },
    {
      id: "18",
      label:
        "Fraction non imposable des plus-values réalisées en fin d'explication",
      line: 20,
      amount: 0,
    },
    {
      id: "19",
      label:
        "Produit net des filiales (après déduction de la quote-part de frais et charges)",
      line: 21,
      amount: 0,
    },
    {
      id: "20",
      label: "Autres revenus mobiliers déductibles",
      line: 22,
      amount: 0,
    },
    {
      id: "21",
      label: "Frais de siège et d'assistance technique déductible",
      line: 23,
      amount: 0,
    },
    { id: "22", label: "Divers 1", line: 24, amount: 0 },
    { id: "23", label: "Divers 2", line: 25, amount: 0 },
    { id: "24", label: "Total lignes 18 à 26", line: 27, amount: 0 },
    {
      id: "25",
      label: "BÉNÉFICE FISCAL DE L'EXERCICE : ligne 16 - ligne 27",
      line: 28,
      amount: 0,
    },
    {
      id: "26",
      label: "PERTE FISCALE DE L'EXERCICE : ligne 27 - ligne 16 ou ligne 17 +",
      line: 29,
      amount: 0,
    },
  ]);

  // Calculate totals when rows change
  useEffect(() => {
    const reintegrationsSum = rows
      .slice(1, 13)
      .reduce((sum, row) => sum + row.amount, 0); // ids 2-12
    const deductionsSum = rows
      .slice(15, 24)
      .reduce((sum, row) => sum + row.amount, 0); // ids 16-23
    const line16 = rows[13].amount; // id "14"
    const beneficeFiscal = line16 - deductionsSum;
    const perteFiscal = deductionsSum - line16;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id === "13") return { ...row, amount: reintegrationsSum };
        if (row.id === "24") return { ...row, amount: deductionsSum };
        if (row.id === "25") return { ...row, amount: beneficeFiscal };
        if (row.id === "26") return { ...row, amount: perteFiscal };
        return row;
      })
    );
  }, [rows.map((r) => r.amount).join(",")]); // Depend on all amounts

  // Rubriques
  const [rubriques, setRubriques] = useState<RubriqueRow[]>([
    {
      id: "1",
      label: "Impôt sur les sociétés",
      line: 31,
      minimum: "Minimum de perception",
      base: "30%",
      rate: "30%",
      principal: "",
    },
    {
      id: "2",
      label: "BIC et BNC",
      line: 32,
      minimum: "",
      base: "",
      rate: "22%",
      principal: "",
    },
    {
      id: "3",
      label: "",
      line: 33,
      minimum: "",
      base: "",
      rate: "",
      principal: "",
    },
    {
      id: "4",
      label: "Bénéfice artisanaux",
      line: 34,
      minimum: "",
      base: "",
      rate: "11%",
      principal: "",
    },
    {
      id: "5",
      label: "",
      line: 35,
      minimum: "",
      base: "",
      rate: "",
      principal: "",
    },
    {
      id: "6",
      label: "Bénéfices agricoles",
      line: 36,
      minimum: "",
      base: "",
      rate: "15%",
      principal: "",
    },
    {
      id: "7",
      label: "",
      line: 37,
      minimum: "",
      base: "",
      rate: "",
      principal: "",
    },
    {
      id: "8",
      label: "TOTAL lignes 32 à 38",
      line: 39,
      minimum: "",
      base: "",
      rate: "",
      principal: "",
    },
  ]);

  // Handler
  const handleRowChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, amount: Number(value) || 0 } : row
      )
    );
  };

  const handleRubriqueChange = (
    id: string,
    field: keyof RubriqueRow,
    value: string
  ) => {
    setRubriques((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
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
        pdf.save("cf1_passage_resultat_comptable_fiscal.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: CF1Row, bgClass = "") => {
    const isCalculated = ["13", "24", "25", "26"].includes(row.id);
    return (
      <tr key={row.id} className={bgClass}>
        <td className="border border-gray-400 p-1 pl-2 text-right">
          {row.line}
        </td>
        <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
        <td className="border border-gray-400 p-1 text-right">
          {isEditing && !isCalculated ? (
            <input
              type="number"
              value={row.amount}
              onChange={(e) => handleRowChange(row.id, e.target.value)}
              className="w-full text-right bg-orange-50"
            />
          ) : (
            row.amount.toLocaleString("fr-FR")
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          CF1 - Tableau de Passage du Résultat Comptable Avant Impôt au Résultat
          Fiscal
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
                : "bg-orange-600 hover:bg-orange-700"
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-red-700 transition"
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
        <div className="text-center font-bold mb-2 text-lg">60</div>

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
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
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
                className="border-b border-orange-500 bg-orange-50 w-20 px-1"
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
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
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
                className="border-b border-orange-500 bg-orange-50 w-16 px-1"
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
          CF1
          <br />
          TABLEAU DE PASSAGE DU RESULTAT COMPTABLE AVANT IMPOT AU RESULTAT
          FISCAL
        </div>

        {/* Tableau principal */}
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                BÉNÉFICE NET COMPTABLE AVANT IMPÔT
              </th>
              <th className="border border-gray-400 p-1 text-center">Ligne</th>
              <th className="border border-gray-400 p-1 text-center">
                Montants
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 14).map((row) => renderRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td colSpan={2} className="border border-gray-400 p-1 pl-2">
                REINTEGRATIONS : totalux lignes 3 à 14
              </td>
              <td className="border border-gray-400 p-1 text-center">15</td>
              <td className="border border-gray-400 p-1 text-right">
                {rows[12].amount.toLocaleString("fr-FR")}
              </td>
            </tr>
            {rows.slice(14, 24).map((row) => renderRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td colSpan={2} className="border border-gray-400 p-1 pl-2">
                DEDUCTIONS : total lignes 18 à 26
              </td>
              <td className="border border-gray-400 p-1 text-center">27</td>
              <td className="border border-gray-400 p-1 text-right">
                {rows[23].amount.toLocaleString("fr-FR")}
              </td>
            </tr>
            {rows.slice(24).map((row) => renderRow(row))}
          </tbody>
        </table>

        {/* Rubriques */}
        <div className="font-bold mb-2">RUBRIQUES</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 pl-2">Libellés</th>
              <th className="border border-gray-400 p-1 text-center">Ligne</th>
              <th className="border border-gray-400 p-1 text-center">
                Minimum de perception
              </th>
              <th className="border border-gray-400 p-1 text-center">Bases</th>
              <th className="border border-gray-400 p-1 text-center">taux</th>
              <th className="border border-gray-400 p-1 text-center">
                Principal de l'impôt
              </th>
            </tr>
          </thead>
          <tbody>
            {rubriques.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.line}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.minimum}
                      onChange={(e) =>
                        handleRubriqueChange(row.id, "minimum", e.target.value)
                      }
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.minimum
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.base}
                      onChange={(e) =>
                        handleRubriqueChange(row.id, "base", e.target.value)
                      }
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.base
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.rate}
                      onChange={(e) =>
                        handleRubriqueChange(row.id, "rate", e.target.value)
                      }
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.rate
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.principal}
                      onChange={(e) =>
                        handleRubriqueChange(
                          row.id,
                          "principal",
                          e.target.value
                        )
                      }
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.principal
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF1;



