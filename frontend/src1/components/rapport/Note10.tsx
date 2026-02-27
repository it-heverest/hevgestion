import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import { notesService, DSFNoteType } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface ValeurRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  variation: string;
}

const Note10: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedFolder } = useApp();

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  const [valeurs, setValeurs] = useState<ValeurRow[]>([
    {
      id: "1",
      label: "Effets à encaisser",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "2",
      label: "Effets à l'encaissement",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "3",
      label: "Chèques à encaisser",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "4",
      label: "Chèques à l'encaissement",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "5",
      label: "Cartes de crédit à encaisser",
      yearN: "",
      yearN1: "",
      variation: "",
    },
    {
      id: "6",
      label: "Autres valeurs à encaisser",
      yearN: "",
      yearN1: "",
      variation: "",
    },
  ]);

  const [totalBrut, setTotalBrut] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
  });

  const [depreciations, setDepreciations] = useState<ValeurRow[]>([
    {
      id: "d1",
      label: "Dépréciations des valeurs à encaisser",
      yearN: "",
      yearN1: "",
      variation: "",
    },
  ]);

  const [totalNet, setTotalNet] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
  });

  const [comment, setComment] = useState("");

  // Load note data on component mount
  useEffect(() => {
    if (selectedFolder?.id) {
      loadNoteData();
    }
  }, [selectedFolder?.id]);

  const loadNoteData = async () => {
    if (!selectedFolder?.id) return;

    try {
      setIsLoading(true);
      const noteData = await notesService.getNote(selectedFolder.id, "NOTE10");
      if (noteData) {
        setHeaderInfo(noteData.headerInfo || headerInfo);
        setValeurs(noteData.valeurs || valeurs);
        setTotalBrut(noteData.totalBrut || totalBrut);
        setDepreciations(noteData.depreciations || depreciations);
        setTotalNet(noteData.totalNet || totalNet);
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading note data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!selectedFolder?.id) {
      alert("Veuillez sélectionner un dossier");
      return;
    }

    try {
      setIsSaving(true);
      const noteData = {
        headerInfo,
        valeurs,
        totalBrut,
        depreciations,
        totalNet,
        comment,
      };

      await notesService.saveNote(selectedFolder.id, "NOTE10", noteData);
      alert("Données sauvegardées avec succès!");
    } catch (error) {
      console.error("Error saving note data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValeurChange = (
    id: string,
    field: keyof ValeurRow,
    value: string
  ) => {
    setValeurs((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDepreciationChange = (
    id: string,
    field: keyof ValeurRow,
    value: string
  ) => {
    setDepreciations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        try {
          const html2canvas = (
            await import(
              "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" as any
            )
          ).default;
          const { jsPDF } = await import(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" as any
          );
          const canvas = await html2canvas(reportRef.current!, { scale: 2 });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("note_10_valeurs_a_encaisser.pdf");
        } catch (error) {
          console.error("Erreur lors de la génération du PDF:", error);
          alert("Erreur lors de la génération du PDF");
        } finally {
          setIsEditing(wasEditing);
        }
      }, 100);
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = ""
  ) => {
    return isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-blue-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span>{value || ""}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Prévisualiser Rapport - Note 10
        </h1>
        <div className="flex gap-3">
          <button
            onClick={isEditing ? saveNoteData : () => setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? (
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-300"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-3 text-base">23</div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 pb-3">
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

        {/* Titre Principal */}
        <div className="bg-custom-gray-title border border-gray-600 py-2 text-center font-bold mb-4">
          <div>NOTE 10</div>
          <div>VALEURS A ENCAISSER</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[10px]">
          <thead>
            <tr className="bg-custom-gray-header">
              <th className="border border-gray-600 p-2 text-left w-[55%]">
                Libellés
              </th>
              <th className="border border-gray-600 p-1 text-center w-[15%]">
                Année N
              </th>
              <th className="border border-gray-600 p-1 text-center w-[15%]">
                Année N-1
              </th>
              <th className="border border-gray-600 p-1 text-center w-[15%]">
                Variation
                <br />
                en %
              </th>
            </tr>
          </thead>
          <tbody>
            {valeurs.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-4">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(
                    row.yearN,
                    (val) => handleValeurChange(row.id, "yearN", val),
                    "pr-2"
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(
                    row.yearN1,
                    (val) => handleValeurChange(row.id, "yearN1", val),
                    "pr-2"
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(
                    row.variation,
                    (val) => handleValeurChange(row.id, "variation", val),
                    "pr-2"
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT VALEURS A ENCAISSER */}
            <tr className="bg-custom-gray-total font-bold">
              <td className="border border-gray-600 p-1 pl-4">
                TOTAL BRUT VALEURS A ENCAISSER
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalBrut.yearN, (val) =>
                  setTotalBrut({ ...totalBrut, yearN: val })
                )}
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalBrut.yearN1, (val) =>
                  setTotalBrut({ ...totalBrut, yearN1: val })
                )}
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalBrut.variation, (val) =>
                  setTotalBrut({ ...totalBrut, variation: val })
                )}
              </td>
            </tr>

            {/* Dépréciations */}
            {depreciations.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-4">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right pr-2">
                  {renderEditableCell(row.yearN, (val) =>
                    handleDepreciationChange(row.id, "yearN", val)
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right pr-2">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleDepreciationChange(row.id, "yearN1", val)
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right pr-2">
                  {renderEditableCell(row.variation, (val) =>
                    handleDepreciationChange(row.id, "variation", val)
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL NET DE DEPRECIATION */}
            <tr className="bg-custom-gray-total font-bold">
              <td className="border border-gray-600 p-1 pl-4">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalNet.yearN, (val) =>
                  setTotalNet({ ...totalNet, yearN: val })
                )}
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalNet.yearN1, (val) =>
                  setTotalNet({ ...totalNet, yearN1: val })
                )}
              </td>
              <td className="border border-gray-600 p-1 text-right pr-2">
                {renderEditableCell(totalNet.variation, (val) =>
                  setTotalNet({ ...totalNet, variation: val })
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8">
          <span className="font-bold">Commentaire :</span>
          <div className="mt-2 min-h-[60px] border-b-2 border-dotted border-gray-400">
            {isEditing ? (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 px-1 bg-blue-50 border-none focus:outline-none resize-none"
                placeholder="Saisir un commentaire..."
              />
            ) : (
              <span className="text-gray-500 italic">
                {comment || "Aucun commentaire"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS pour les couleurs uniquement */}
      <style jsx>{`
        .bg-custom-gray-header {
          background-color: #d9d9d9;
        }
        .bg-custom-gray-title {
          background-color: #bfbfbf;
        }
        .bg-custom-gray-total {
          background-color: #e6e6e6;
        }
      `}</style>
    </div>
  );
};

export default Note10;
