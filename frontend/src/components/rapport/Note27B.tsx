import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface StaffRow {
  id: string;
  category: string;
  isTotal?: boolean;
  isSubTotal?: boolean;
  nationalsM: number;
  nationalsF: number;
  ohadaM: number;
  ohadaF: number;
  horsOhadaM: number;
  horsOhadaF: number;
  totalM: number;
  totalF: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note27B: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const folderId = selectedFolder?.id;

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
      const noteData = await notesService.getNoteData(folderId, "27B") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.rows) {
          setRows(noteData.rows);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Note 27B data:", error);
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
        rows,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "27B", noteData as any);
      if (success) {
        alert("Données Note 27B sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 27B data:", error);
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

  // Lignes du tableau (personnel interne + externe)
  const [rows, setRows] = useState<StaffRow[]>([
    // Personnel interne
    {
      id: "ya",
      category: "YA 1. Cadres supérieurs",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yb",
      category: "YB 2. Techniciens supérieurs et cadres moyens",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yc",
      category: "YC 3. Techniciens, agents de maîtrise et ouvriers qualifiés",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yd",
      category: "YD 4. Employés, manœuvres, ouvriers et apprentis",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "ye",
      category: "YE TOTAL (1)",
      isSubTotal: true,
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yf",
      category: "YF Permanents",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yg",
      category: "YG Saisonniers",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    // Personnel extérieur
    {
      id: "yh",
      category: "YH 1. Cadres supérieurs",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yi",
      category: "YI 2. Techniciens supérieurs et cadres moyens",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yj",
      category: "YJ 3. Techniciens, agents de maîtrise et ouvriers qualifiés",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yk",
      category: "YK 4. Employés, manœuvres, ouvriers et apprentis",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yl",
      category: "YL TOTAL (2)",
      isSubTotal: true,
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "ym",
      category: "YM Permanents",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yn",
      category: "YN Saisonniers",
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
    {
      id: "yo",
      category: "YO TOTAL (1+2)",
      isTotal: true,
      nationalsM: 0,
      nationalsF: 0,
      ohadaM: 0,
      ohadaF: 0,
      horsOhadaM: 0,
      horsOhadaF: 0,
      totalM: 0,
      totalF: 0,
    },
  ]);

  // Handler
  const handleChange = (id: string, field: keyof StaffRow, value: string) => {
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour le tableau large
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_27B_effectifs_masse_salariale.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: StaffRow) => (
    <tr
      key={row.id}
      className={
        row.isTotal
          ? "bg-gray-500 text-white font-bold"
          : row.isSubTotal
            ? "bg-gray-300 font-bold"
            : ""
      }
    >
      <td className="border border-gray-400 p-1 pl-2">{row.category}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.nationalsM}
            onChange={(e) => handleChange(row.id, "nationalsM", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.nationalsM.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.nationalsF}
            onChange={(e) => handleChange(row.id, "nationalsF", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.nationalsF.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.ohadaM}
            onChange={(e) => handleChange(row.id, "ohadaM", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.ohadaM.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.ohadaF}
            onChange={(e) => handleChange(row.id, "ohadaF", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.ohadaF.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.horsOhadaM}
            onChange={(e) => handleChange(row.id, "horsOhadaM", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.horsOhadaM.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.horsOhadaF}
            onChange={(e) => handleChange(row.id, "horsOhadaF", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.horsOhadaF.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {(row.nationalsM + row.ohadaM + row.horsOhadaM).toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right font-bold">
        {(row.nationalsF + row.ohadaF + row.horsOhadaF).toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 27B - Effectifs, Masse Salariale et Personnel Extérieur
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
        <div className="text-center font-bold mb-2 text-lg">56</div>

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
          NOTE 27B
          <br />
          EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 rotate-45 text-left"
              >
                EFFECTIF ET MASSE SALARIALE ET QUALIFICATIONS
              </th>
              <th
                colSpan={6}
                className="border border-gray-400 p-1 text-center"
              >
                EFFECTIFS
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                MASSE SALARIALE
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th colSpan={2} className="border border-gray-400 p-1">
                Nationaux
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Autres Etats de l'OHADA
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Hors OHADA
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                TOTAL
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1"></th>
              <th className="border border-gray-400 p-1">M</th>
              <th className="border border-gray-400 p-1">F</th>
              <th className="border border-gray-400 p-1">M</th>
              <th className="border border-gray-400 p-1">F</th>
              <th className="border border-gray-400 p-1">M</th>
              <th className="border border-gray-400 p-1">F</th>
              <th className="border border-gray-400 p-1">M</th>
              <th className="border border-gray-400 p-1">F</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Personnel interne */}
            <tr className="bg-gray-300 font-bold">
              <td colSpan={9} className="border border-gray-400 p-1 pl-2">
                1. personnel interne
              </td>
            </tr>
            {rows.slice(0, 7).map((row) => renderRow(row))}
            {/* 2. Personnel extérieur */}
            <tr className="bg-gray-300 font-bold">
              <td colSpan={7} className="border border-gray-400 p-1 pl-2">
                2. personnel extérieur
              </td>
              <td
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Facturation à l'entité
              </td>
            </tr>
            {rows.slice(7).map((row) => renderRow(row))}
          </tbody>
        </table>

        {/* Légende */}
        <div className="mt-4 text-right italic text-[10px] mr-8">
          F : Féminin
          <br />M : Masculin
        </div>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          <div className="italic text-[10px]">
            • Faire un commentaire si nécessaire en cas de mouvement
            significatif du personnel
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-40 p-1 border border-blue-300 bg-blue-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[10rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note27B;
