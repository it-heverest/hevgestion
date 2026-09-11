import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, FileSpreadsheet, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { FormulaValue } from "./shared/FormulaValue";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";
import { dsfService } from "../../services/dsf.service";
import { dsfTemplateService } from "../../services/dsf-template.service";
import { Modal } from "../ui/modal";

// --- Interfaces ---
interface DebtRow {
  id: string;
  label: string | React.ReactNode;
  note: string;
  grossAmount: number;
  mortgages: number;
  pledges: number;
  others: number;
}

interface CommitmentRow {
  id: string;
  label: string;
  given: number;
  received: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const Note1: React.FC = () => {
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  const { hasFormula } = useFormulaPanel();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  const [financialDebts, setFinancialDebts] = useState<DebtRow[]>([]);
  const [leasingDebts, setLeasingDebts] = useState<DebtRow[]>([]);
  const [currentLiabilities, setCurrentLiabilities] = useState<DebtRow[]>([]);
  const [commitments, setCommitments] = useState<CommitmentRow[]>([]);

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) {
      console.warn("No folderId provided");
      return;
    }

    console.log("🔍 Loading note data for folderId:", folderId);

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "1")) as any;

      console.log("📥 Loaded note data:", noteData);

      if (!noteData) {
        console.log("No saved data found");
        return;
      }

      // Apply data to state
      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      // Map financial debts
      if (noteData.financialDebts && Array.isArray(noteData.financialDebts)) {
        setFinancialDebts(
          noteData.financialDebts.map((debt: any, index: number) => ({
            id: String(index + 1),
            label: debt.libelle || "",
            note: debt.note || "",
            grossAmount: debt.grossAmount || 0,
            mortgages: debt.mortgages || 0,
            pledges: debt.pledges || 0,
            others: debt.others || 0,
          })),
        );
      }

      // Map leasing debts
      if (noteData.leasingDebts && Array.isArray(noteData.leasingDebts)) {
        setLeasingDebts(
          noteData.leasingDebts.map((debt: any, index: number) => ({
            id: String(index + 1),
            label: debt.libelle || "",
            note: debt.note || "",
            grossAmount: debt.grossAmount || 0,
            mortgages: debt.mortgages || 0,
            pledges: debt.pledges || 0,
            others: debt.others || 0,
          })),
        );
      }

      // Map current liabilities
      if (
        noteData.currentLiabilities &&
        Array.isArray(noteData.currentLiabilities)
      ) {
        setCurrentLiabilities(
          noteData.currentLiabilities.map((debt: any, index: number) => ({
            id: String(index + 1),
            label: debt.libelle || "",
            note: debt.note || "",
            grossAmount: debt.grossAmount || 0,
            mortgages: debt.mortgages || 0,
            pledges: debt.pledges || 0,
            others: debt.others || 0,
          })),
        );
      }

      // Map commitments
      if (noteData.commitments && Array.isArray(noteData.commitments)) {
        setCommitments(
          noteData.commitments.map((commitment: any, index: number) => ({
            id: String(index + 1),
            label: commitment.libelle || "",
            given: commitment.engagementsGiven || 0,
            received: commitment.engagementsReceived || 0,
          })),
        );
      }

      // Set comment if exists
      if (noteData.comment) {
        setComment(noteData.comment);
      }

      console.log("✅ Data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading note data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Save data to backend
  const saveNoteData = async () => {
    if (!folderId) {
      alert("Veuillez sélectionner un dossier");
      return;
    }

    console.log("💾 Saving note data for folderId:", folderId);

    try {
      setIsSaving(true);

      // Prepare data in the format expected by backend
      const noteData = {
        entete: headerInfo,
        financialDebts: financialDebts.map((debt) => ({
          libelle:
            typeof debt.label === "string" ? debt.label : String(debt.label),
          note: debt.note,
          grossAmount: debt.grossAmount,
          mortgages: debt.mortgages,
          pledges: debt.pledges,
          others: debt.others,
        })),
        leasingDebts: leasingDebts.map((debt) => ({
          libelle:
            typeof debt.label === "string" ? debt.label : String(debt.label),
          note: debt.note,
          grossAmount: debt.grossAmount,
          mortgages: debt.mortgages,
          pledges: debt.pledges,
          others: debt.others,
        })),
        currentLiabilities: currentLiabilities.map((debt) => ({
          libelle:
            typeof debt.label === "string" ? debt.label : String(debt.label),
          note: debt.note,
          grossAmount: debt.grossAmount,
          mortgages: debt.mortgages,
          pledges: debt.pledges,
          others: debt.others,
        })),
        commitments: commitments.map((commitment) => ({
          libelle: commitment.label,
          engagementsGiven: commitment.given,
          engagementsReceived: commitment.received,
        })),
        comment,
      };

      console.log("📤 Sending note data:", noteData);

      const saved = await notesService.saveNoteData(folderId, "1", noteData);

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Load data when folder changes
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  // Auto-populate header from context when available
  useEffect(() => {
    if (selectedClient && selectedFolder && !headerInfo.entityName) {
      setHeaderInfo({
        entityName: selectedClient.name || "",
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: "12",
      });
    }
  }, [selectedClient, selectedFolder]);

  // Calculations
  const calculateSum = (data: DebtRow[], field: keyof DebtRow) =>
    data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);

  const calculateCommitmentSum = (
    data: CommitmentRow[],
    field: keyof CommitmentRow,
  ) => data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);

  const totalGross =
    calculateSum(financialDebts, "grossAmount") +
    calculateSum(leasingDebts, "grossAmount") +
    calculateSum(currentLiabilities, "grossAmount");
  const totalMortgages =
    calculateSum(financialDebts, "mortgages") +
    calculateSum(leasingDebts, "mortgages") +
    calculateSum(currentLiabilities, "mortgages");
  const totalPledges =
    calculateSum(financialDebts, "pledges") +
    calculateSum(leasingDebts, "pledges") +
    calculateSum(currentLiabilities, "pledges");
  const totalOthers =
    calculateSum(financialDebts, "others") +
    calculateSum(leasingDebts, "others") +
    calculateSum(currentLiabilities, "others");

  // Handlers
  const handleDebtChange = (
    setter: React.Dispatch<React.SetStateAction<DebtRow[]>>,
    id: string,
    field: keyof DebtRow,
    value: string,
  ) => {
    setter((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "label" || field === "note" ? value : Number(value),
            }
          : row,
      ),
    );
  };

  const handleCommitmentChange = (
    id: string,
    field: keyof CommitmentRow,
    value: string,
  ) => {
    setCommitments((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "label" ? value : Number(value),
            }
          : row,
      ),
    );
  };

  const [isRegeneratingDSF, setIsRegeneratingDSF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Télécharge UNIQUEMENT la feuille Excel de cette note (pas tout le
  // classeur DSF) — voir NOTE_EXPORT_MAP côté backend.
  const downloadExcel = async () => {
    if (!folderId) return;
    try {
      setIsExportingExcel(true);
      await dsfTemplateService.exportNoteSheet(folderId, "1");
    } catch (error: any) {
      alert(error?.message || "Erreur lors de l'export Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

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
        pdf.save("note_1_dettes_garanties.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderDebtRow = (
    row: DebtRow,
    setter: React.Dispatch<React.SetStateAction<DebtRow[]>>,
    arrayField: "financialDebts" | "leasingDebts" | "currentLiabilities",
  ) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-center w-12">
        {isEditing ? (
          <input
            value={row.note}
            onChange={(e) =>
              handleDebtChange(setter, row.id, "note", e.target.value)
            }
            className="w-full text-center bg-orange-50"
          />
        ) : (
          row.note
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing && !hasFormula(`note1.${arrayField}.${row.id}`) ? (
          <input
            type="number"
            value={row.grossAmount}
            onChange={(e) =>
              handleDebtChange(setter, row.id, "grossAmount", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          <FormulaValue
            formulaKey={`note1.${arrayField}.${row.id}`}
            label={typeof row.label === "string" ? row.label : String(row.label)}
          >
            {row.grossAmount.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
          </FormulaValue>
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.mortgages}
            onChange={(e) =>
              handleDebtChange(setter, row.id, "mortgages", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.mortgages.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.pledges}
            onChange={(e) =>
              handleDebtChange(setter, row.id, "pledges", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.pledges.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.others}
            onChange={(e) =>
              handleDebtChange(setter, row.id, "others", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.others.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
    </tr>
  );

  const renderSubTotal = (title: string, data: DebtRow[]) => (
    <tr className="bg-gray-300 font-bold">
      <td colSpan={2} className="border border-gray-400 p-1 pl-2 uppercase">
        {title}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "grossAmount").toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "mortgages").toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "pledges").toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "others").toLocaleString("fr-FR").replace(/\u202F/g, " ")}
      </td>
    </tr>
  );

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

  if (!folderId || !selectedFolder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Aucun dossier sélectionné
          </h2>
          <p className="text-gray-600">
            Veuillez sélectionner un dossier pour voir la Note 1.
          </p>
          {selectedClient && (
            <p className="text-sm text-gray-500 mt-2">
              Client: {selectedClient.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 1 - Dettes Garanties
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
          </p>
        </div>
        <div className="flex gap-1">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              title="Éditer"
              className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
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
                onClick={() => setIsEditing(false)}
                title="Annuler"
                className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </>
          )}
          <button
            onClick={() => setShowExportMenu(true)}
            disabled={isExportingExcel}
            title="Exporter"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} className={isExportingExcel ? "animate-pulse" : ""} />
          </button>
          <button
            onClick={regenerateDSF}
            disabled={isRegeneratingDSF}
            title="Recalculer la DSF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isRegeneratingDSF ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <Modal
        open={showExportMenu}
        onClose={() => setShowExportMenu(false)}
        size="sm"
        title="Exporter"
        description="Choisissez un format"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setShowExportMenu(false);
              downloadPDF();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <Download size={20} className="text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">PDF</div>
              <div className="text-xs text-gray-500">Cette note, mise en page pour impression</div>
            </div>
          </button>
          <button
            onClick={() => {
              setShowExportMenu(false);
              downloadExcel();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <FileSpreadsheet size={20} className="text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Excel</div>
              <div className="text-xs text-gray-500">Feuille de cette note uniquement</div>
            </div>
          </button>
        </div>
      </Modal>

      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border-2 ${
          isEditing ? "border-orange-500" : "border-gray-200"
        }`}
      >
        {isEditing && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            8
          </span>
        </div>

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
                className="border-b border-orange-500 bg-orange-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
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

        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-0">
          NOTE 1 <br /> DETTES GARANTIES PAR DES SURETES REELLES
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1 w-[35%] text-black">
                LIBELLES
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[5%] text-black">
                Note
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[15%] text-black">
                Montant brut
              </th>
              <th colSpan={3} className="border border-gray-400 p-1 text-black">
                SURETES REELLES
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 w-[15%] text-black">
                Hypothèques
              </th>
              <th className="border border-gray-400 p-1 w-[15%] text-black">
                Nantissements
              </th>
              <th className="border border-gray-400 p-1 w-[15%] text-black">
                Gages/autres
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="font-bold underline p-1">
                Dettes financières et ressources assimilées:
              </td>
            </tr>
            {financialDebts.map((row) =>
              renderDebtRow(row, setFinancialDebts, "financialDebts"),
            )}
            {renderSubTotal("SOUS TOTAL (1)", financialDebts)}

            <tr>
              <td colSpan={6} className="font-bold underline p-1 pt-2">
                Dettes de location-acquisition:
              </td>
            </tr>
            {leasingDebts.map((row) =>
              renderDebtRow(row, setLeasingDebts, "leasingDebts"),
            )}
            {renderSubTotal("SOUS TOTAL (2)", leasingDebts)}

            <tr>
              <td colSpan={6} className="font-bold underline p-1 pt-2">
                Dettes du passif circulant:
              </td>
            </tr>
            {currentLiabilities.map((row) =>
              renderDebtRow(row, setCurrentLiabilities, "currentLiabilities"),
            )}
            {renderSubTotal("SOUS TOTAL (3)", currentLiabilities)}

            <tr className="bg-gray-500 text-black font-bold border-t-2 border-black">
              <td colSpan={2} className="border border-gray-400 p-2">
                TOTAL (1)+(2)+(3)
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalGross.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalMortgages.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalPledges.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalOthers.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Engagements financiers */}
        <div className="bg-gray-300 border border-gray-400 border-t-0 py-1 text-center font-bold">
          ENGAGEMENTS FINANCIERS
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mt-0 border-t-0">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-2 text-left pl-2 w-[70%] text-black">
                &nbsp;
              </th>
              <th className="border border-gray-400 p-2 text-center w-[15%] text-black">
                Engagements donnés
              </th>
              <th className="border border-gray-400 p-2 text-center w-[15%] text-black">
                Engagements reçus
              </th>
            </tr>
          </thead>
          <tbody>
            {commitments.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">
                  {row.label}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.given}
                      onChange={(e) =>
                        handleCommitmentChange(row.id, "given", e.target.value)
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.given.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.received}
                      onChange={(e) =>
                        handleCommitmentChange(
                          row.id,
                          "received",
                          e.target.value,
                        )
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.received.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 text-center uppercase">
                TOTAL
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateCommitmentSum(commitments, "given").toLocaleString(
                  "fr-FR",
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {calculateCommitmentSum(commitments, "received").toLocaleString(
                  "fr-FR",
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="border border-gray-400 border-t-0 p-2 bg-white flex flex-col gap-1">
          <div className="font-bold underline">Commentaire:</div>
          {isEditing ? (
            <textarea
              className="w-full h-16 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note1;

