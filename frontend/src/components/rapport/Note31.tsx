import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface MultiYearRow {
  id: string;
  label: string | React.ReactNode;
  yearN: number;
  yearN1: number;
  yearN2: number;
  yearN3: number;
  yearN4: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note31: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "31") as any;

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
      console.error("Error loading Note 31 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "31", noteData as any);
      if (success) {
        alert("Données Note 31 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 31 data:", error);
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

  // Lignes exactement comme dans l'image
  const [rows, setRows] = useState<MultiYearRow[]>([
    {
      id: "1",
      label: "Capital social",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "2",
      label: "Actions ordinaires",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "3",
      label: "Actions à dividendes prioritaires (A.D.P) sans droit de vote",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "4",
      label: "Actions nouvelles à émettre",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "5",
      label: "- Par conversion d'obligations",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "6",
      label: "- Par exercice de droits de souscription",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "7",
      label: "Chiffre d'affaires hors taxes",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "8",
      label:
        "Résultat des activités ordinaires (RAO) hors dotations et reprises (exploitation et financières)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "9",
      label: "Participation des travailleurs aux bénéfices",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "10",
      label: "Impôts sur le résultat",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "11",
      label: "Résultat net(4)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "12",
      label: "Résultat distribué(5)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "13",
      label: "Dividende attribués à chaque action",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "14",
      label: "Effectif moyen des travailleurs au cours de l'exercice (6)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "15",
      label: "Effectif moyen de personnel extérieur",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "16",
      label: "Masse salariale distribuée au cours de l'exercice (7)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "17",
      label:
        "Avantage sociaux versés au cours de l'exercice (8) sécurité sociale, œuvres sociales)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
    {
      id: "18",
      label: "Personnel extérieur facturé à l'entité(9)",
      yearN: 0,
      yearN1: 0,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    },
  ]);

  // Handler
  const handleChange = (id: string, year: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [year]: Number(value) || 0 } : row
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour les 5 colonnes
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_31_repartition_resultat.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: MultiYearRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2 text-left">{row.label}</td>
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
        {isEditing ? (
          <input
            type="number"
            value={row.yearN2}
            onChange={(e) => handleChange(row.id, "yearN2", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN2.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN3}
            onChange={(e) => handleChange(row.id, "yearN3", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN3.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.yearN4}
            onChange={(e) => handleChange(row.id, "yearN4", e.target.value)}
            className="w-full text-right bg-blue-50"
          />
        ) : (
          row.yearN4.toLocaleString("fr-FR")
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 31 - Répartition du Résultat et Autres Éléments Caractéristiques
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
        <div className="text-center font-bold mb-2 text-lg">46</div>

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
          NOTE 31
          <br />
          REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ
          DERNIERS EXERCICES
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[40%] text-left"
              >
                NATURE DES INDICATIONS
              </th>
              <th
                colSpan={5}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICES CONCERNES (1)
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">N</th>
              <th className="border border-gray-400 p-1">N-1</th>
              <th className="border border-gray-400 p-1">N-2</th>
              <th className="border border-gray-400 p-1">N-3</th>
              <th className="border border-gray-400 p-1">N-4</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                STRUCTURE DU CAPITAL A LA CLOTURE DE L'EXERCICE (2)
              </td>
              <td colSpan={5} className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(0, 7).map((row) => renderRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                OPERATIONS ET RESULTAT DE L'EXERCICE(3)
              </td>
              <td colSpan={5} className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(7, 12).map((row) => renderRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                RESULTAT PAR ACTION
              </td>
              <td colSpan={5} className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(12, 14).map((row) => renderRow(row))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                PERSONNEL ET POLITIQUE SALARIALE
              </td>
              <td colSpan={5} className="border border-gray-400 p-1"></td>
            </tr>
            {rows.slice(14).map((row) => renderRow(row))}
          </tbody>
        </table>

        {/* Notes de bas de page */}
        <div className="mt-6 text-[10px] text-gray-600 space-y-1">
          <p>
            (1) Y compris l'exercice dont les états financiers sont soumis à
            l'approbation de l'Assemblée Générale
          </p>
          <p>
            (2) Indication, en cas de libération partielle du capital, du
            montant du capital non appelé
          </p>
          <p>
            (3) Les éléments de cette rubrique sont ceux figurant au compte de
            résultat
          </p>
          <p>
            (4) Le résultat lorsqu'il est négatif, doit être mis entre
            parenthèses
          </p>
          <p>
            (5) L'exercice N correspond aux dividendes proposés du dernier
            exercice
          </p>
          <p>(6) Personnel propre</p>
          <p>(7) Total des comptes 661, 662, 663</p>
          <p>(8) Total des comptes 664, 668</p>
          <p>(9) Compte 667</p>
        </div>
      </div>
    </div>
  );
};

export default Note31;



