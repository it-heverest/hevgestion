import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

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
  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [dsfId, setDsfId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load DSF data
  useEffect(() => {
    if (selectedFolder?.id) {
      loadDSFData();
    }
  }, [selectedFolder?.id]);

  const loadDSFData = async () => {
    if (!selectedFolder?.id) return;

    try {
      setLoading(true);
      const response = await dsfService.getDSF(selectedFolder.id);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      if (dsf.notes && dsf.notes.note13) {
        const note13Data = dsf.notes.note13;

        if (note13Data.headerInfo) {
          setHeaderInfo(note13Data.headerInfo);
        }

        if (note13Data.shareholders) {
          setShareholders(note13Data.shareholders);
        }

        if (note13Data.unpaidCapital !== undefined) {
          setUnpaidCapital(note13Data.unpaidCapital);
        }

        if (note13Data.comment !== undefined) {
          setComment(note13Data.comment);
        }
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

      const note13Data = {
        headerInfo,
        shareholders,
        unpaidCapital,
        comment,
      };

      const notes = { note13: note13Data };

      await dsfService.updateDSF(dsfId, { notes });
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
            className="w-full bg-blue-50"
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
            className="w-full text-center bg-blue-50"
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
            className="w-full bg-blue-50"
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.number.toLocaleString("fr-FR")
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.totalAmount.toLocaleString("fr-FR")
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
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.repayments.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 13 - Capital : Valeur Nominale des Actions ou Parts
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
        <div className="text-center font-bold mb-2 text-lg">26</div>

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
                    className="w-full text-right bg-blue-50"
                  />
                ) : (
                  unpaidCapital.toLocaleString("fr-FR")
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
                {totalNumber.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(totalAmount + unpaidCapital).toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalRepayments.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
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
