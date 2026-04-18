import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface ActifPassifRow {
  id: string;
  label: string;
  yearN: number;
  yearN1: number;
}

interface ActifRegimeRow {
  id: string;
  label: string;
  rendementYearN: number;
  justeValeurYearN: number;
  rendementYearN1: number;
  justeValeurYearN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note16Bbis: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment1, setComment1] = useState("");
  const [comment2, setComment2] = useState("");
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
      const noteData = await notesService.getNoteData(folderId, "16B bis") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.actifPassif) {
          setActifPassif(noteData.actifPassif);
        }

        if (noteData.actifRegime) {
          setActifRegime(noteData.actifRegime);
        }

        if (noteData.comment1 !== undefined) setComment1(noteData.comment1);
        if (noteData.comment2 !== undefined) setComment2(noteData.comment2);
      }
    } catch (error) {
      console.error("Error loading Note 16B bis data:", error);
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
        actifPassif,
        actifRegime,
        comment1,
        comment2,
      };

      const success = await notesService.saveNoteData(folderId, "16B bis", noteData as any);
      if (success) {
        alert("Données Note 16B bis sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 16B bis data:", error);
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

  // Actif / Passif net comptabilisé
  const [actifPassif, setActifPassif] = useState<ActifPassifRow[]>([
    {
      id: "1",
      label: "Valeur actuelle de l'obligation résultant de régimes financés",
      yearN: 0,
      yearN1: 0,
    },
    {
      id: "2",
      label: "Valeur actuelle des actifs affectés aux plans de retraite",
      yearN: 0,
      yearN1: 0,
    },
    { id: "3", label: "Excédent/Déficit de régime", yearN: 0, yearN1: 0 },
  ]);

  // Valeur actuelle des actifs du régime
  const [actifRegime, setActifRegime] = useState<ActifRegimeRow[]>([
    {
      id: "1",
      label: "Actions",
      rendementYearN: 0,
      justeValeurYearN: 0,
      rendementYearN1: 0,
      justeValeurYearN1: 0,
    },
    {
      id: "2",
      label: "Obligations",
      rendementYearN: 0,
      justeValeurYearN: 0,
      rendementYearN1: 0,
      justeValeurYearN1: 0,
    },
    {
      id: "3",
      label: "Autres",
      rendementYearN: 0,
      justeValeurYearN: 0,
      rendementYearN1: 0,
      justeValeurYearN1: 0,
    },
  ]);

  // Handlers
  const handleActifPassifChange = (
    id: string,
    field: "yearN" | "yearN1",
    value: string
  ) => {
    setActifPassif((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const handleActifRegimeChange = (
    id: string,
    field: keyof ActifRegimeRow,
    value: string
  ) => {
    setActifRegime((prev) =>
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
        pdf.save("note_16B_bis_engagements_retraite.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderActifPassifRow = (row: ActifPassifRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN}
            onChange={(e) =>
              handleActifPassifChange(row.id, "yearN", e.target.value)
            }
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
            onChange={(e) =>
              handleActifPassifChange(row.id, "yearN1", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN1.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  const renderActifRegimeRow = (row: ActifRegimeRow) => (
    <tr key={row.id}>
      <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.rendementYearN}
            onChange={(e) =>
              handleActifRegimeChange(row.id, "rendementYearN", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.rendementYearN.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.justeValeurYearN}
            onChange={(e) =>
              handleActifRegimeChange(
                row.id,
                "justeValeurYearN",
                e.target.value
              )
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.justeValeurYearN.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.rendementYearN1}
            onChange={(e) =>
              handleActifRegimeChange(row.id, "rendementYearN1", e.target.value)
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.rendementYearN1.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.justeValeurYearN1}
            onChange={(e) =>
              handleActifRegimeChange(
                row.id,
                "justeValeurYearN1",
                e.target.value
              )
            }
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.justeValeurYearN1.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  const totalRendementYearN = actifRegime.reduce(
    (acc, r) => acc + r.rendementYearN,
    0
  );
  const totalJusteValeurYearN = actifRegime.reduce(
    (acc, r) => acc + r.justeValeurYearN,
    0
  );
  const totalRendementYearN1 = actifRegime.reduce(
    (acc, r) => acc + r.rendementYearN1,
    0
  );
  const totalJusteValeurYearN1 = actifRegime.reduce(
    (acc, r) => acc + r.justeValeurYearN1,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 16B bis - Engagements de Retraite et Avantages Assimilés
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
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSaving ? (
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
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                loadNoteData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          )}
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
        <div className="text-center font-bold mb-2 text-lg">51</div>

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
          NOTE 16B bis
          <br />
          ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES
        </div>

        {/* Actif / Passif net comptabilisé */}
        <div className="font-bold mb-2">
          ACTIF / PASSIF NET COMPTABILISE AU TITRE DES REGIMES FINANCES
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1 pl-2 w-[60%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-1">Année N</th>
              <th className="border border-gray-400 p-1">Année N-1</th>
            </tr>
          </thead>
          <tbody>{actifPassif.map((row) => renderActifPassifRow(row))}</tbody>
        </table>

        {/* Commentaire 1 */}
        <div className="mb-6 italic text-[10px]">
          Indiquer le montant comptabilisé au passif (ou actif) à la clôture de
          l'exercice(s)
        </div>

        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2 mb-6">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={comment1}
              onChange={(e) => setComment1(e.target.value)}
            />
          ) : (
            <div className="min-h-[6rem] whitespace-pre-wrap">{comment1}</div>
          )}
        </div>

        {/* Valeur actuelle des actifs du régime */}
        <div className="font-bold mb-2">
          VALEUR ACTUELLE DES ACTIFS DU REGIME
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="bg-gray-500 text-white">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[40%]"
              >
                Libellés
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Année N
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Année N-1
              </th>
            </tr>
            <tr className="bg-gray-500 text-white">
              <th className="border border-gray-400 p-1">Rendement attendu</th>
              <th className="border border-gray-400 p-1">
                Juste valeur des actifs
              </th>
              <th className="border border-gray-400 p-1">Rendement attendu</th>
              <th className="border border-gray-400 p-1">
                Juste valeur des actifs
              </th>
            </tr>
          </thead>
          <tbody>
            {actifRegime.map((row) => renderActifRegimeRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL</td>
              <td className="border border-gray-400 p-1 text-right">
                {totalRendementYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalJusteValeurYearN.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalRendementYearN1.toLocaleString("fr-FR")}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {totalJusteValeurYearN1.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire 2 */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-32 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={comment2}
              onChange={(e) => setComment2(e.target.value)}
            />
          ) : (
            <div className="min-h-[8rem] whitespace-pre-wrap">{comment2}</div>
          )}
        </div>

        <div className="mt-4 italic text-[10px] space-y-1">
          <p>
            • Expliquer comment les taux de rendement par catégorie d'actifs et
            global ont été déterminés
          </p>
          <p>
            • Indiquer le montant des rendements réels des actifs affectés aux
            plans en N et N-1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Note16Bbis;



