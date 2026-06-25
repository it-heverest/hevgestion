import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
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
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();

  // Standardized entete state
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  const [valeurs, setValeurs] = useState<ValeurRow[]>([
    { id: "1", label: "Effets à encaisser", yearN: "", yearN1: "", variation: "" },
    { id: "2", label: "Effets à l'encaissement", yearN: "", yearN1: "", variation: "" },
    { id: "3", label: "Chèques à encaisser", yearN: "", yearN1: "", variation: "" },
    { id: "4", label: "Chèques à l'encaissement", yearN: "", yearN1: "", variation: "" },
    { id: "5", label: "Cartes de crédit à encaisser", yearN: "", yearN1: "", variation: "" },
    { id: "6", label: "Autres valeurs à encaisser", yearN: "", yearN1: "", variation: "" },
  ]);

  const [totalBrut, setTotalBrut] = useState({ yearN: "", yearN1: "", variation: "" });
  const [depreciations, setDepreciations] = useState<ValeurRow[]>([
    { id: "d1", label: "Dépréciations des valeurs à encaisser", yearN: "", yearN1: "", variation: "" },
  ]);
  const [totalNet, setTotalNet] = useState({ yearN: "", yearN1: "", variation: "" });
  const [comment, setComment] = useState("");

  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "10") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Map backend keys → frontend state
        if (noteData.valeursAEncaisser) {
          setValeurs(
            noteData.valeursAEncaisser.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.libelle || valeurs[i]?.label || "",
              yearN: String(r.anneeN ?? ""),
              yearN1: String(r.anneeN1 ?? ""),
              variation: "",
            }))
          );
        } else if (noteData.valeurs) {
          setValeurs(noteData.valeurs);
        }
        if (noteData.totalBrut) setTotalBrut(noteData.totalBrut);
        if (noteData.depreciations) setDepreciations(noteData.depreciations);
        if (noteData.totalNet) setTotalNet(noteData.totalNet);
        setComment(noteData.comment || "");
      }
    } catch (error) {
      console.error("Error loading note data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Map frontend state → backend keys
      const noteData = {
        entete,
        valeursAEncaisser: valeurs.map((r) => ({
          libelle: r.label,
          anneeN: parseFloat(r.yearN) || null,
          anneeN1: parseFloat(r.yearN1) || null,
          variationPourcentage: null,
        })),
        comment,
      };
      const success = await notesService.saveNoteData(folderId, "10", noteData as any);
      if (success) {
        alert("Données sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving note data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValeurChange = (id: string, field: keyof ValeurRow, value: string) => {
    setValeurs((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDepreciationChange = (id: string, field: keyof ValeurRow, value: string) => {
    setDepreciations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_10_valeurs_a_encaisser.pdf");
      } catch (error) {
        console.error("Erreur PDF:", error);
      } finally {
        setIsEditing(wasEditing);
      }
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
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span>{value || ""}</span>
    );
  };

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 10 - Valeurs à Encaisser
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Standardization en cours...
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
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
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Sauvegarder
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
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

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
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

        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center">
            <div className="text-orange-800 text-[11px]">
              <span className="font-bold">Attention :</span> Certains champs de
              l'en-tête sont vides.
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-orange-800 underline font-bold"
              >
                Mettre à jour l'en-tête
              </button>
            )}
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            23
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) =>
                  setEntete({ ...entete, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.entityName || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={entete.fiscalYear}
                onChange={(e) =>
                  setEntete({ ...entete, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">
                {entete.fiscalYear || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={entete.idNumber}
                onChange={(e) =>
                  setEntete({ ...entete, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.idNumber || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={entete.duration}
                onChange={(e) =>
                  setEntete({ ...entete, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {entete.duration || "-"}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-3 text-center font-bold mb-6 text-[12px]">
          <div>NOTE 10</div>
          <div>VALEURS A ENCAISSER</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[11px] mb-8">
          <thead>
            <tr className="bg-[#d9d9d9]">
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
                <td className="border border-gray-600 p-2 pl-4 font-medium">{row.label}</td>
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
                <td className="border border-gray-600 p-1 text-center">
                  {renderEditableCell(
                    row.variation,
                    (val) => handleValeurChange(row.id, "variation", val),
                    ""
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT VALEURS A ENCAISSER */}
            <tr className="bg-[#e6e6e6] font-bold">
              <td className="border border-gray-600 p-2 pl-4">
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
              <td className="border border-gray-600 p-1 text-center">
                {renderEditableCell(totalBrut.variation, (val) =>
                  setTotalBrut({ ...totalBrut, variation: val })
                )}
              </td>
            </tr>

            {/* Dépréciations */}
            {depreciations.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-2 pl-4 italic">{row.label}</td>
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
                <td className="border border-gray-600 p-1 text-center">
                  {renderEditableCell(row.variation, (val) =>
                    handleDepreciationChange(row.id, "variation", val)
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL NET DE DEPRECIATION */}
            <tr className="bg-[#e6e6e6] font-bold">
              <td className="border border-gray-600 p-2 pl-4">
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
              <td className="border border-gray-600 p-1 text-center">
                {renderEditableCell(totalNet.variation, (val) =>
                  setTotalNet({ ...totalNet, variation: val })
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-gray-500" />
            <span className="font-bold text-gray-700">Commentaire :</span>
          </div>
          <div className={`p-4 rounded border-2 transition-all ${isEditing ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-gray-50"
            }`}>
            {isEditing ? (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 bg-transparent border-none focus:outline-none resize-none text-[11px]"
                placeholder="Saisir un commentaire..."
              />
            ) : (
              <div className="min-h-[60px] text-[11px] text-gray-700 whitespace-pre-wrap">
                {comment || "Aucun commentaire"}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Note10;



