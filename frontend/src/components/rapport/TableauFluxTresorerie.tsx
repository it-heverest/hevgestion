import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
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

const TableauFluxTresorerie: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");
  // Valeurs calculées par le backend (generateTFT) à partir de la balance,
  // conservées pour affichage et pour ne pas être écrasées par une
  // sauvegarde manuelle de l'entête/commentaire (voir saveNoteData).
  const [computedRows, setComputedRows] = useState<
    { ref: string; valueN: number; valueN1: number }[]
  >([]);

  const formatAmount = (value: number | undefined) => {
    if (value === undefined || value === null || value === 0) return "";
    return new Intl.NumberFormat("fr-FR").format(Math.round(value));
  };

  // Header
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Load data
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "flux-tresorerie") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }

        if (Array.isArray(noteData.rows)) {
          setComputedRows(noteData.rows);
        }
      }
    } catch (error) {
      console.error("Error loading Flux Trésorerie data:", error);
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
        comment,
        // Réinjecter les valeurs calculées par le backend pour ne pas les
        // écraser: cette sauvegarde ne modifie que l'entête/le commentaire.
        rows: computedRows,
      };

      const success = await notesService.saveNoteData(folderId, "flux-tresorerie", noteData as any);
      if (success) {
        alert("Données Flux de Trésorerie sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Flux Trésorerie data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("tableau_flux_tresorerie.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    {
      ref: "ZA",
      backendRef: "ZA",
      label:
        "Trésorerie nette au 1er janvier (Trésorerie actif N-1 - Trésorerie passif N-1)",
      note: "",
      highlight: "lightblue",
      letter: "A",
    },
    {
      ref: "",
      label: "Flux de trésorerie provenant des activités opérationnelles",
      note: "",
      bold: true,
    },
    {
      ref: "FA",
      backendRef: "FA",
      label: "Capacité d'Autofinancement Globale (CFA+FE)",
      note: "",
    },
    { ref: "FE", backendRef: "FE1", label: "- Actif circulant HAO", note: "" },
    { ref: "FC", backendRef: "FC", label: "- Variation des stocks", note: "" },
    { ref: "FD", backendRef: "FD", label: "- Variation des créances", note: "" },
    { ref: "FE", backendRef: "FE2", label: "- Variation du passif circulant", note: "" },
    {
      ref: "",
      backendRef: "BF",
      label:
        "Variation du BF lié aux activités opérationnelles (FB+FC+FD+FE)................",
      note: "",
    },
    {
      ref: "ZE",
      backendRef: "ZE",
      label:
        "Flux de trésorerie provenant des activités opérationnelles (somme FA à FE)",
      note: "",
      highlight: "brown",
      letter: "B",
    },
    {
      ref: "",
      label: "Flux de trésorerie provenant des activités d'investissement",
      note: "",
      bold: true,
    },
    {
      ref: "FF",
      backendRef: "FF",
      label:
        "- Décaissements liés aux acquisitions d'immobilisation incorporelles",
      note: "",
    },
    {
      ref: "FG",
      backendRef: "FG",
      label:
        "- Décaissements liés aux acquisitions d'immobilisation corporelles",
      note: "",
    },
    {
      ref: "FH",
      backendRef: "FH",
      label:
        "- Décaissements liés aux acquisitions d'immobilisation financières",
      note: "",
    },
    {
      ref: "FI",
      backendRef: "FI",
      label:
        "+ Encaissement liés aux cessions d'immobilisations incorporelles et corporelles",
      note: "",
    },
    {
      ref: "FJ",
      backendRef: "FJ",
      label: "+ Encaissement liés aux cessions d'immobilisations financières",
      note: "",
    },
    {
      ref: "ZC",
      backendRef: "ZC",
      label:
        "Flux de trésorerie provenant des activités d'investissements (somme FF à FJ)",
      note: "",
      highlight: "brown",
      letter: "C",
    },
    {
      ref: "",
      label:
        "Flux de trésorerie provenant du financement par les capitaux propres",
      note: "",
      bold: true,
    },
    {
      ref: "FK",
      backendRef: "FK",
      label: "+ Augmentation de capital par rapport au nouveau",
      note: "",
    },
    { ref: "FL", backendRef: "FL", label: "+ Subventions d'investissement reçues", note: "" },
    { ref: "FM", backendRef: "FM", label: "+ Prélèvement sur le capital", note: "" },
    { ref: "FN", backendRef: "FN", label: "- Dividendes versés", note: "" },
    {
      ref: "ZD",
      backendRef: "ZD",
      label:
        "Flux de trésorerie provenant des capitaux propres (somme FK à FN)",
      note: "",
      highlight: "brown",
      letter: "D",
    },
    {
      ref: "",
      label: "Flux de trésorerie provenant des capitaux étrangers",
      note: "",
      bold: true,
    },
    { ref: "FO", backendRef: "FO", label: "Emprunts", note: "" },
    { ref: "FP", backendRef: "FP", label: "- Autres dettes financières", note: "" },
    {
      ref: "FQ",
      backendRef: "FQ",
      label: "- Remboursement des emprunts et aux dettes financières",
      note: "",
    },
    {
      ref: "ZF",
      backendRef: "ZF",
      label:
        "Flux de trésorerie provenant des capitaux étrangers (somme FO à FQ)",
      note: "",
      highlight: "brown",
      letter: "E",
    },
    {
      ref: "ZG",
      backendRef: "ZG",
      label: "Flux de trésorerie provenant des activités de financement (D+F)",
      note: "",
      highlight: "lightblue",
      letter: "F",
    },
    {
      ref: "ZH",
      backendRef: "ZH",
      label: "VARIATION DE LA TRESORERIE NETTE DE LA PERIODE (B+C+F)",
      note: "",
      highlight: "lightblue",
      letter: "G",
    },
    {
      ref: "ZI",
      backendRef: "ZI",
      label: "Trésorerie nette au 31 décembre (C+A)",
      note: "",
      highlight: "lightblue",
    },
    {
      ref: "",
      label: "Contrôle trésorerie actif N+ Trésorerie passif N=",
      note: "",
      bold: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau des Flux de Trésorerie
        </h1>
        <div className="flex gap-3">
          <button
            onClick={isEditing ? saveNoteData : () => setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <div className="text-center font-bold mb-2 text-lg">7</div>

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

        {isEditing && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        <div className="bg-gray-400 py-1 text-center font-bold mb-4">
          TABLEAU DES FLUX DE TRESORERIE
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                REF
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[55%]"
              >
                LIBELLES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                NOTE
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE AU
                <br />
                31/12/N
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE AU
                <br />
                31/12/N-1
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const computed = row.backendRef
                ? computedRows.find((r) => r.ref === row.backendRef)
                : undefined;
              return (
                <tr
                  key={index}
                  className={`${
                    row.highlight === "lightblue"
                      ? "bg-orange-200"
                      : row.highlight === "brown"
                      ? "bg-amber-700 text-white"
                      : ""
                  } ${row.bold ? "font-bold" : ""}`}
                >
                  <td className="border border-gray-400 p-1 text-center">
                    {row.ref}
                  </td>
                  <td className="border border-gray-400 p-1 pl-2">
                    {row.label}{" "}
                    {row.letter ? (
                      <span className="font-bold">{row.letter}</span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {row.note}
                  </td>
                  <td className="border border-gray-400 p-1 text-right">
                    {formatAmount(computed?.valueN)}
                  </td>
                  <td className="border border-gray-400 p-1 text-right">
                    {formatAmount(computed?.valueN1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-6">
          <div className="font-bold mb-2">Commentaire :</div>
          <div className="italic text-[10px] mb-2">
            Commenter les variations significatives des flux de trésorerie
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-orange-300 bg-orange-50 resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter vos commentaires ici..."
            />
          ) : (
            <div className="min-h-[6rem] border border-gray-400 p-2 whitespace-pre-wrap">
              {comment || "Aucun commentaire"}
            </div>
          )}
        </div>

        <div className="mt-4 text-[10px] italic">
          [1] A l'exclusion des variations des créances et dettes liées aux
          activités d'investissement (variation des créances sur cession
          d'immobilisation et des dettes sur acquisition ou production
          d'immobilisation) et de financement (par exemple variation des
          créances sur subventions d'investissements reçues).
        </div>
      </div>
    </div>
  );
};

export default TableauFluxTresorerie;

