import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";
import {
  reportCalculationsService,
  BalanceData,
} from "../../services/report-calculations.service";
import { clientService } from "../../services/client.service";
import { dsfConfigService } from "../../services/dsf-config.service";

// --- Interfaces ---
interface AvailabilityRow {
  id: string;
  label: string;
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
const Note11: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { selectedFolder, selectedClient } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [dsfId, setDsfId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalBrut, setTotalBrut] = useState(0);
  const [totalDepreciation, setTotalDepreciation] = useState(0);
  const [totalNet, setTotalNet] = useState(0);

  // Load DSF data and balance data on component mount
  useEffect(() => {
    if (selectedFolder?.id) {
      loadData();
    }
  }, [selectedFolder?.id]);

  const loadData = async () => {
    if (!selectedFolder?.id) return;

    try {
      setLoading(true);

      // Load DSF data
      const response = await dsfService.getDSF(selectedFolder.id);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      // Load balance data
      const balancesResponse = await clientService.getBalancesByFolder(
        selectedFolder.id
      );
      const currentBalance = balancesResponse.balances?.find(
        (b: any) => b.type === "CURRENT_YEAR"
      );
      const previousBalance = balancesResponse.balances?.find(
        (b: any) => b.type === "PREVIOUS_YEAR"
      );

      if (currentBalance?.originalData) {
        // Get DSF configs for note11
        const dsfConfigs = await dsfConfigService.getConfigsByFolder(
          selectedFolder.id,
          "note11"
        );

        // Update calculation service with input data
        reportCalculationsService.updateInput({
          balanceData: currentBalance.originalData as BalanceData,
          previousBalanceData: previousBalance?.originalData as BalanceData,
          dsfConfigs: dsfConfigs || [],
        });

        // Calculate note 11 data
        const calculatedData = reportCalculationsService.calculateNote11();

        // Update header info with real data
        setHeaderInfo({
          entityName: selectedClient?.name || "Company Name",
          fiscalYear: selectedFolder?.fiscalYear?.toString() || "2024",
          idNumber: selectedClient?.taxNumber || "Tax Number",
          duration: "12",
        });

        // Set calculated availabilities
        setAvailabilities(calculatedData.availabilities);

        // Update totals from calculated data
        setTotalBrut(calculatedData.totals.totalBrut);
        setTotalDepreciation(calculatedData.totals.totalDepreciation);
        setTotalNet(calculatedData.totals.totalNet);
      }

      // Load saved comment from DSF if exists
      if (dsf.notes && dsf.notes.note11?.comment !== undefined) {
        setComment(dsf.notes.note11.comment);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!dsfId) return;

    try {
      setSaving(true);

      const note11Data = {
        headerInfo,
        availabilities,
        totals: {
          totalBrut,
          totalDepreciation,
          totalNet,
        },
        comment,
      };

      const notes = { note11: note11Data };

      await dsfService.updateDSF(dsfId, { notes });
    } catch (error) {
      console.error("Error saving to backend:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // En-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Données Disponibilités (calculées depuis les données comptables)
  const [availabilities, setAvailabilities] = useState<AvailabilityRow[]>([]);

  // Helper function to calculate sum
  const calculateSum = (field: "yearN" | "yearN1") => {
    return availabilities.reduce(
      (acc, row) => acc + (Number(row[field]) || 0),
      0
    );
  };

  // Handlers
  const handleChange = (
    id: string,
    field: "yearN" | "yearN1",
    value: string
  ) => {
    setAvailabilities((prev) =>
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
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_11_disponibilites.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: AvailabilityRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) => handleChange(row.id, "yearN", e.target.value)}
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
            onChange={(e) => handleChange(row.id, "yearN1", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN1.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {(((row.yearN - row.yearN1) / (row.yearN1 || 1)) * 100).toFixed(2)}%
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 11 - Disponibilités
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) {
                saveToBackend();
              }
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
                <Save size={18} /> Sauvegarde...
              </>
            ) : isEditing ? (
              <>
                <Save size={18} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
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
        <div className="text-center font-bold mb-2 text-lg">24</div>

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
          NOTE 11
          <br />
          DISPONIBILITES
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[50%] text-left"
              >
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((row) => renderRow(row))}

            {/* Total Brut */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2 uppercase">
                TOTAL BRUT DISPONIBILITES
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalBrut.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateSum("yearN1").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(
                  ((totalBrut - calculateSum("yearN1")) /
                    (calculateSum("yearN1") || 1)) *
                  100
                ).toFixed(2)}
                %
              </td>
            </tr>

            {/* Dépréciations (vide pour cette note) */}
            <tr>
              <td className="border border-gray-400 p-1 pl-2">Dépréciations</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">-</td>
            </tr>

            {/* Total Net */}
            <tr className="bg-gray-500 text-white font-bold">
              <td className="border border-gray-400 p-2 pl-2">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalNet.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {calculateSum("yearN1").toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {(
                  ((totalNet - calculateSum("yearN1")) /
                    (calculateSum("yearN1") || 1)) *
                  100
                ).toFixed(2)}
                %
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-1">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[8rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>

        {/* Notes de bas de page (optionnel) */}
        <div className="mt-4 text-[10px] text-gray-600">
          <p>Indiquer la date de rapprochement des comptes bancaires.</p>
          <p>
            Indiquer la date d'inventaire de la caisse et des instruments de
            monnaie électronique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Note11;
