import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface ProvisionRow {
  id: string;
  nature: string;
  opening: number;
  dotationExploitation: number;
  dotationFinancieres: number;
  dotationHorsActivites: number;
  repriseExploitation: number;
  repriseFinancieres: number;
  repriseHorsActivites: number;
  closing: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note28: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "28") as any;

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
      console.error("Error loading Note 28 data:", error);
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

      const success = await notesService.saveNoteData(folderId, "28", noteData as any);
      if (success) {
        alert("Données Note 28 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 28 data:", error);
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
  const [rows, setRows] = useState<ProvisionRow[]>([
    {
      id: "1",
      nature: "Provisions réglementées",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "2",
      nature: "Provisions financières pour risques et charges",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "3",
      nature: "Dépréciation des immobilisations",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "4",
      nature: "Dépréciations des stocks",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "5",
      nature: "Dépréciations actif circulant HAO",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "6",
      nature: "Dépréciations fournisseurs",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "7",
      nature: "Dépréciations clients",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "8",
      nature: "Dépréciations fournisseurs",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "9",
      nature: "Dépréciations autres créances",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "10",
      nature: "Dépréciations titres de placement",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "11",
      nature: "Dépréciations valeurs à encaisser",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "12",
      nature: "Dépréciations disponibilité",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "13",
      nature:
        "Dépréciations et provisions pour risques à court terme exploitation",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
    {
      id: "14",
      nature:
        "Dépréciations et provisions pour risques à court terme à caractère financier",
      opening: 0,
      dotationExploitation: 0,
      dotationFinancieres: 0,
      dotationHorsActivites: 0,
      repriseExploitation: 0,
      repriseFinancieres: 0,
      repriseHorsActivites: 0,
      closing: 0,
    },
  ]);

  // Calculs des totaux
  const calcColumn = (field: keyof ProvisionRow) =>
    rows.reduce((acc, r) => acc + r[field], 0);

  const openingTotal = calcColumn("opening");
  const dotationExploitationTotal = calcColumn("dotationExploitation");
  const dotationFinancieresTotal = calcColumn("dotationFinancieres");
  const dotationHorsActivitesTotal = calcColumn("dotationHorsActivites");
  const repriseExploitationTotal = calcColumn("repriseExploitation");
  const repriseFinancieresTotal = calcColumn("repriseFinancieres");
  const repriseHorsActivitesTotal = calcColumn("repriseHorsActivites");
  const closingTotal = calcColumn("closing");

  // Handler
  const handleChange = (
    id: string,
    field: keyof ProvisionRow,
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour le tableau large
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_28_provisions_depreciations.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderRow = (row: ProvisionRow, bgClass = "") => (
    <tr key={row.id} className={bgClass}>
      <td className="border border-gray-400 p-1 pl-2">{row.nature}</td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.opening}
            onChange={(e) => handleChange(row.id, "opening", e.target.value)}
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.opening.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.dotationExploitation}
            onChange={(e) =>
              handleChange(row.id, "dotationExploitation", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.dotationExploitation.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.dotationFinancieres}
            onChange={(e) =>
              handleChange(row.id, "dotationFinancieres", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.dotationFinancieres.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.dotationHorsActivites}
            onChange={(e) =>
              handleChange(row.id, "dotationHorsActivites", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.dotationHorsActivites.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.repriseExploitation}
            onChange={(e) =>
              handleChange(row.id, "repriseExploitation", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.repriseExploitation.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.repriseFinancieres}
            onChange={(e) =>
              handleChange(row.id, "repriseFinancieres", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.repriseFinancieres.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {isEditing ? (
          <input
            type="number"
            value={row.repriseHorsActivites}
            onChange={(e) =>
              handleChange(row.id, "repriseHorsActivites", e.target.value)
            }
            className="w-full text-right bg-orange-50"
          />
        ) : (
          row.repriseHorsActivites.toLocaleString("fr-FR")
        )}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {row.closing.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  const renderTotal = (label: string, bgClass: string) => (
    <tr className={`${bgClass} font-bold`}>
      <td className="border border-gray-400 p-1 pl-2">{label}</td>
      <td className="border border-gray-400 p-1 text-right">
        {openingTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {dotationExploitationTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {dotationFinancieresTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {dotationHorsActivitesTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {repriseExploitationTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {repriseFinancieresTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {repriseHorsActivitesTotal.toLocaleString("fr-FR")}
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {closingTotal.toLocaleString("fr-FR")}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 28 - Provisions et Dépréciations Inscrites au Bilan
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
                : "bg-orange-600 hover:bg-orange-700"
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
        <div className="text-center font-bold mb-2 text-lg">41</div>

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
          NOTE 28
          <br />
          PROVISIONS ET DEPRECIATIONS INSCRITES AU BILAN
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={3} className="border border-gray-400 p-1 pl-2">
                Natures
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1">
                PROVISIONS A L'OUVERTURE DE L'EXERCICE
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                AUGMENTATIONS : DOTATIONS
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                DIMINUTIONS : REPRISES
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1">
                PROVISIONS A LA CLOTURE DE L'EXERCICE
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">D'EXPLOITATION</th>
              <th className="border border-gray-400 p-1">FINANCIERES</th>
              <th className="border border-gray-400 p-1">
                HORS ACTIVITES ORDINAIRES
              </th>
              <th className="border border-gray-400 p-1">D'EXPLOITATION</th>
              <th className="border border-gray-400 p-1">FINANCIERES</th>
              <th className="border border-gray-400 p-1">
                HORS ACTIVITES ORDINAIRES
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 3).map((row) => renderRow(row))}
            {renderTotal("TOTAL : DOTATIONS", "bg-gray-300")}
            {rows.slice(3).map((row) => renderRow(row))}
            {renderTotal(
              "TOTAL : CHARGES POUR DEPRECIATIONS ET PROVISIONS A COURT TERME",
              "bg-gray-300"
            )}
            {renderTotal(
              "TOTAL PROVISIONS ET DEPRECIATIONS",
              "bg-gray-500 text-white"
            )}
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-40 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
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

export default Note28;



