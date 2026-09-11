import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";

// --- Interfaces ---
interface ShareholderRow {
  id: string;
  name: string;
  nationality: string;
  shareType: string;
  number: number;
  totalAmount: number;
  repayments: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note13: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  // Load DSF data
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "13") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.shareholders) {
          setShareholders(noteData.shareholders);
        }

        if (noteData.unpaidCapital !== undefined) {
          setUnpaidCapital(noteData.unpaidCapital);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Note 13 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;

    try {
      setIsSaving(true);

      const noteData = {
        entete: headerInfo,
        shareholders,
        unpaidCapital,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "13", noteData as any);
      if (success) {
        alert("Données Note 13 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 13 data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Header
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Lignes actionnaires (10 lignes vides comme dans l'image)
  const [shareholders, setShareholders] = useState<ShareholderRow[]>([
    {
      id: "1",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "2",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "3",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "4",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "5",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "6",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "7",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "8",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "9",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
    {
      id: "10",
      name: "",
      nationality: "",
      shareType: "",
      number: 0,
      totalAmount: 0,
      repayments: 0,
    },
  ]);

  // Apports non appelés (capital non appelé)
  const [unpaidCapital, setUnpaidCapital] = useState<number>(0);

  // Calculs totaux
  const totalNumber = shareholders.reduce((acc, row) => acc + row.number, 0);
  const totalAmount = shareholders.reduce(
    (acc, row) => acc + row.totalAmount,
    0
  );
  const totalRepayments = shareholders.reduce(
    (acc, row) => acc + row.repayments,
    0
  );

  // Handlers
  const handleShareholderChange = (
    id: string,
    field: keyof ShareholderRow,
    value: string
  ) => {
    setShareholders((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]:
              field === "name" ||
                field === "nationality" ||
                field === "shareType"
                ? value
                : Number(value) || 0,
          }
          : row
      )
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
        pdf.save("note_13_capital.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: ShareholderRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 text-left">
        {isEditing ? (
          <input
            value={row.name}
            onChange={(e) =>
              handleShareholderChange(row.id, "name", e.target.value)
            }
            className="w-full bg-orange-50"
          />
        ) : (
          row.name
        )}
      </td>
      <td className="border border-gray-400 p-1 text-center">
        {isEditing ? (
          <input
            value={row.nationality}
            onChange={(e) =>
              handleShareholderChange(row.id, "nationality", e.target.value)
            }
            className="w-full text-center bg-orange-50"
          />
        ) : (
          row.nationality
        )}
      </td>
      <td className="border border-gray-400 p-1 text-left">
        {isEditing ? (
          <input
            value={row.shareType}
            onChange={(e) =>
              handleShareholderChange(row.id, "shareType", e.target.value)
            }
            className="w-full bg-orange-50"
          />
        ) : (
          row.shareType
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.number}
            onChange={(e) =>
              handleShareholderChange(row.id, "number", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.number.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.totalAmount}
            onChange={(e) =>
              handleShareholderChange(row.id, "totalAmount", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.totalAmount.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.repayments}
            onChange={(e) =>
              handleShareholderChange(row.id, "repayments", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.repayments.toLocaleString("fr-FR").replace(/\u202F/g, " ")
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 13 - Capital : Valeur Nominale des Actions ou Parts
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) {
                saveNoteData();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} className={isSaving ? "animate-pulse" : ""} /> : <Pencil size={18} />}
          </button>
          {isEditing && (
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
            onClick={downloadPDF}
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            26
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
          NOTE 13
          <br />
          CAPITAL : VALEUR NOMINALE DES ACTIONS OU PARTS
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[25%] text-left"
              >
                Noms et prénoms
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[15%]">
                Nationalité
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 w-[25%] text-left"
              >
                Nature des actions ou parts
                <br />
                (ordinaires ou préférences)
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[10%]">
                Nombre
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[15%]">
                Montant total
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-[10%]">
                Cessions ou remboursements en cours d'exercice
              </th>
            </tr>
          </thead>
          <tbody>
            {shareholders.map((row) => renderRow(row))}

            {/* Ligne Apporteurs, capital non appelé */}
            <tr className="bg-gray-300">
              <td
                colSpan={4}
                className="border border-gray-400 p-1 pl-2 font-bold"
              >
                Apporteurs, capital non appelé
              </td>
              <td className="border border-gray-400 p-1 text-right font-bold">
                {isEditing ? (
                  <input
                    type="number"
                    value={unpaidCapital}
                    onChange={(e) =>
                      setUnpaidCapital(Number(e.target.value) || 0)
                    }
                    className="w-full text-right bg-orange-50"
                  />
                ) : (
                  unpaidCapital.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">-</td>
            </tr>

            {/* Ligne TOTAL */}
            <tr className="bg-gray-400 font-bold text-black">
              <td colSpan={3} className="border border-gray-400 p-1 pl-2">
                TOTAL
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalNumber.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(totalAmount + unpaidCapital).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalRepayments.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[8rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>

        {/* Notes de bas de page */}
        <div className="mt-6 text-[10px] text-gray-600 space-y-1">
          <p>• Indiquer si possible le montant du capital à la constitution</p>
          <p>
            • Indiquer si possible les dates des AGE et le montant du capital
            augmenté en cas d'augmentation de capital
          </p>
          <p>
            • Indiquer si possible les dates des AGE et le montant du capital
            diminué en cas de réduction de capital
          </p>
          <p>• Indiquer les avantages accordés aux actions de préférence</p>
        </div>
      </div>
    </div>
  );
};

export default Note13;



