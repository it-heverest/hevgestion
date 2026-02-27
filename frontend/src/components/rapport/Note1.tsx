import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";

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
  const folderId = searchParams.get("folderId");

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

  // Load data on mount
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

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
            className="w-full text-center bg-blue-50"
          />
        ) : (
          row.note
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.grossAmount}
            onChange={(e) =>
              handleDebtChange(setter, row.id, "grossAmount", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.grossAmount.toLocaleString("fr-FR")
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.mortgages.toLocaleString("fr-FR")
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.pledges.toLocaleString("fr-FR")
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.others.toLocaleString("fr-FR")
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
        {calculateSum(data, "grossAmount").toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "mortgages").toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "pledges").toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {calculateSum(data, "others").toLocaleString("fr-FR")}
      </td>
    </tr>
  );

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

  if (!folderId) {
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 1 - Dettes Garanties
        </h1>
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
                    <Save size={18} /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Sauvegarder
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border-2 ${
          isEditing ? "border-blue-500" : "border-gray-200"
        }`}
      >
        {isEditing && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        <div className="text-center font-bold mb-2 text-lg">8</div>

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
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
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

        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-0">
          NOTE 1 <br /> DETTES GARANTIES PAR DES SURETES REELLES
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1 w-[35%]">
                LIBELLES
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[5%]">
                Note
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[15%]">
                Montant brut
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                SURETES REELLES
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 w-[15%]">
                Hypothèques
              </th>
              <th className="border border-gray-400 p-1 w-[15%]">
                Nantissements
              </th>
              <th className="border border-gray-400 p-1 w-[15%]">
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
            {financialDebts.map((row) => renderDebtRow(row, setFinancialDebts))}
            {renderSubTotal("SOUS TOTAL (1)", financialDebts)}

            <tr>
              <td colSpan={6} className="font-bold underline p-1 pt-2">
                Dettes de location-acquisition:
              </td>
            </tr>
            {leasingDebts.map((row) => renderDebtRow(row, setLeasingDebts))}
            {renderSubTotal("SOUS TOTAL (2)", leasingDebts)}

            <tr>
              <td colSpan={6} className="font-bold underline p-1 pt-2">
                Dettes du passif circulant:
              </td>
            </tr>
            {currentLiabilities.map((row) =>
              renderDebtRow(row, setCurrentLiabilities),
            )}
            {renderSubTotal("SOUS TOTAL (3)", currentLiabilities)}

            <tr className="bg-gray-500 text-black font-bold border-t-2 border-black">
              <td colSpan={2} className="border border-gray-400 p-2">
                TOTAL (1)+(2)+(3)
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalGross.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalMortgages.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalPledges.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {totalOthers.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Engagements */}
        <table className="w-full border-collapse border border-gray-400 text-[11px] mt-0 border-t-0">
          <thead>
            <tr className="bg-gray-300">
              <th
                colSpan={4}
                className="border border-gray-400 p-2 text-center w-[70%]"
              >
                ENGAGEMENTS FINANCIERS
              </th>
              <th className="border border-gray-400 p-2 text-center w-[15%]">
                Engagements donnés
              </th>
              <th className="border border-gray-400 p-2 text-center w-[15%]">
                Engagements reçus
              </th>
            </tr>
          </thead>
          <tbody>
            {commitments.map((row) => (
              <tr key={row.id}>
                <td colSpan={4} className="border border-gray-400 p-1 pl-2">
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
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.given.toLocaleString("fr-FR")
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
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.received.toLocaleString("fr-FR")
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold">
              <td
                colSpan={4}
                className="border border-gray-400 p-1 text-center uppercase"
              >
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
              className="w-full h-16 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
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
