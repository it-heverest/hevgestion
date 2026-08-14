import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, Plus, Trash2, X, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "../../../contexts/AppContext";
import { notesService } from "../../../services/notes.service";

interface CreanceItem {
  id: number;
  date: string;
  nomClient: string;
  montant31Dec: string;
  montant1erJan: string;
}

interface DetteItem {
  id: number;
  date: string;
  nomFournisseur: string;
  montant31Dec: string;
  montant1erJan: string;
}

const Note3Smt: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // En-tête (standardized to 'entete' used by other notes)
  const [entete, setEntete] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Créances
  const [creances, setCreances] = useState<CreanceItem[]>([
    { id: 1, date: "", nomClient: "", montant31Dec: "0", montant1erJan: "0" },
  ]);

  // Dettes
  const [dettes, setDettes] = useState<DetteItem[]>([
    {
      id: 1,
      date: "",
      nomFournisseur: "",
      montant31Dec: "0",
      montant1erJan: "0",
    },
  ]);

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  useEffect(() => {
    if (selectedClient && selectedFolder && !entete.designationEntite) {
      setEntete({
        designationEntite: selectedClient.name || "",
        exerciceClosLe: selectedFolder.fiscalYear?.toString() || "",
        numeroIdentification: selectedClient.taxNumber || "",
        dureeMois: "12",
      });
    }
  }, [selectedClient, selectedFolder]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3SMT")) as any;
      if (!noteData) return;

      if (noteData.entete) {
        setEntete(noteData.entete);
      } else if (noteData.header) {
        // Fallback for legacy data if any
        setEntete(noteData.header);
      }

      if (noteData.creances) setCreances(noteData.creances);
      if (noteData.dettes) setDettes(noteData.dettes);
    } catch (error) {
      console.error("Error loading Note 3 SMT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      const noteData = {
        entete,
        creances,
        dettes,
      };

      await notesService.saveNoteData(folderId, "3SMT", noteData as any);
      alert("Données sauvegardées avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving Note 3 SMT:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const addCreance = () => {
    const newId = Math.max(...creances.map((i) => i.id), 0) + 1;
    setCreances([
      ...creances,
      {
        id: newId,
        date: "",
        nomClient: "",
        montant31Dec: "0",
        montant1erJan: "0",
      },
    ]);
  };

  const addDette = () => {
    const newId = Math.max(...dettes.map((i) => i.id), 0) + 1;
    setDettes([
      ...dettes,
      {
        id: newId,
        date: "",
        nomFournisseur: "",
        montant31Dec: "0",
        montant1erJan: "0",
      },
    ]);
  };

  const removeCreance = (id: number) => {
    setCreances(creances.filter((i) => i.id !== id));
  };

  const removeDette = (id: number) => {
    setDettes(dettes.filter((i) => i.id !== id));
  };

  const updateCreance = (
    id: number,
    field: keyof CreanceItem,
    value: string
  ) => {
    setCreances(
      creances.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const updateDette = (id: number, field: keyof DetteItem, value: string) => {
    setDettes(
      dettes.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = (
    items: (CreanceItem | DetteItem)[],
    field: "montant31Dec" | "montant1erJan"
  ) => {
    return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_3_creances_dettes_non_echues.pdf");
      } catch (error) {
        console.error("Erreur PDF:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const isHeaderIncomplete =
    !entete.designationEntite ||
    !entete.exerciceClosLe ||
    !entete.numeroIdentification ||
    !entete.dureeMois;

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

  if (!folderId || !selectedFolder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Aucun dossier sélectionné
          </h2>
          <p className="text-gray-600">
            Veuillez sélectionner un dossier pour voir la Note 3 SMT.
          </p>
          {selectedClient && (
            <p className="text-sm text-gray-500 mt-2">
              Client: {selectedClient.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 3 SMT - Créances et Dettes Non Échues
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
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

      {isLoading && (
        <div className="max-w-[297mm] mx-auto mb-6 bg-orange-50 p-4 rounded-lg border border-orange-200 text-orange-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Chargement des données...
        </div>
      )}

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[297mm] mx-auto min-h-[210mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
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
            <div className="text-orange-800">
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

        {/* En-tête du document */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4 text-[10px]">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={entete.designationEntite}
                onChange={(e) =>
                  setEntete({ ...entete, designationEntite: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.designationEntite || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={entete.exerciceClosLe}
                onChange={(e) =>
                  setEntete({ ...entete, exerciceClosLe: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">
                {entete.exerciceClosLe || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={entete.numeroIdentification}
                onChange={(e) =>
                  setEntete({ ...entete, numeroIdentification: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.numeroIdentification || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={entete.dureeMois}
                onChange={(e) =>
                  setEntete({ ...entete, dureeMois: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {entete.dureeMois || "-"}
              </span>
            )}
          </div>
        </div>

        {/* Titre principal */}
        <div className="bg-gray-300 font-bold py-2 text-center text-xs border border-gray-400 mb-4">
          NOTE 3 <br /> ÉTAT DES CRÉANCES ET DES DETTES NON ÉCHUES AU 31 DÉCEMBRE
        </div>

        {/* Tableau Créances */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px] mb-8">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  DATE
                </th>
                <th className="border border-gray-600 p-2 font-bold text-left">
                  NOM DU CLIENT
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-36">
                  Montant au 31 décembre
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-36">
                  Montant au 1er janvier
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Variation %
                </th>
                {isEditing && (
                  <th className="border border-gray-600 p-2 w-10"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {creances.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-600 p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] text-center focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.date}
                        onChange={(e) =>
                          updateCreance(item.id, "date", e.target.value)
                        }
                      />
                    ) : (
                      item.date || "-"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.nomClient}
                        onChange={(e) =>
                          updateCreance(item.id, "nomClient", e.target.value)
                        }
                      />
                    ) : (
                      item.nomClient || ""
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] text-right focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.montant31Dec}
                        onChange={(e) =>
                          updateCreance(item.id, "montant31Dec", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montant31Dec).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] text-right focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.montant1erJan}
                        onChange={(e) =>
                          updateCreance(
                            item.id,
                            "montant1erJan",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.montant1erJan).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-center">—</td>
                  {isEditing && (
                    <td className="border border-gray-600 p-2 text-center">
                      <button
                        onClick={() => removeCreance(item.id)}
                        className="opacity-60 hover:opacity-100 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Total Créances */}
              <tr className="bg-[#c0c0c0] font-bold">
                <td
                  colSpan={isEditing ? 2 : 1}
                  className="border border-gray-600 p-2 font-bold text-right"
                >
                  TOTAL DES CRÉANCES
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal(creances, "montant31Dec").toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal(creances, "montant1erJan").toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-center">—</td>
                {isEditing && <td className="border border-gray-600 p-2"></td>}
              </tr>
            </tbody>
          </table>

          {/* Bouton Ajouter Créances */}
          {isEditing && (
            <div className="text-center mb-8">
              <button
                onClick={addCreance}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow"
              >
                <Plus size={18} /> Ajouter une créance
              </button>
            </div>
          )}

          {/* Tableau Dettes */}
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  DATE
                </th>
                <th className="border border-gray-600 p-2 font-bold text-left">
                  NOM DU FOURNISSEUR
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-36">
                  Montant au 31 décembre
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-36">
                  Montant au 1er janvier
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Variation %
                </th>
                {isEditing && (
                  <th className="border border-gray-600 p-2 w-10"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {dettes.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-600 p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-center"
                        value={item.date}
                        onChange={(e) =>
                          updateDette(item.id, "date", e.target.value)
                        }
                      />
                    ) : (
                      item.date || "-"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.nomFournisseur}
                        onChange={(e) =>
                          updateDette(item.id, "nomFournisseur", e.target.value)
                        }
                      />
                    ) : (
                      item.nomFournisseur || ""
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] text-right focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.montant31Dec}
                        onChange={(e) =>
                          updateDette(item.id, "montant31Dec", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montant31Dec).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-[6px] py-[4px] border border-[#999] rounded-md bg-[#fff9e6] text-[11px] text-right focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white"
                        value={item.montant1erJan}
                        onChange={(e) =>
                          updateDette(item.id, "montant1erJan", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montant1erJan).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-center">—</td>
                  {isEditing && (
                    <td className="border border-gray-600 p-2 text-center">
                      <button
                        onClick={() => removeDette(item.id)}
                        className="opacity-60 hover:opacity-100 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Total Dettes */}
              <tr className="bg-[#c0c0c0] font-bold">
                <td
                  colSpan={isEditing ? 2 : 1}
                  className="border border-gray-600 p-2 font-bold text-right"
                >
                  TOTAL DES DETTES
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal(dettes, "montant31Dec").toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal(dettes, "montant1erJan").toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-center">—</td>
                {isEditing && <td className="border border-gray-600 p-2"></td>}
              </tr>
            </tbody>
          </table>

          {/* Bouton Ajouter Dettes */}
          {isEditing && (
            <div className="text-center mt-4">
              <button
                onClick={addDette}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition"
              >
                <Plus size={18} /> Ajouter une dette
              </button>
            </div>
          )}

          {/* Note de bas de page */}
          <div className="mt-8 px-4 pb-6 text-[10px] italic text-gray-700 text-center">
            * Bien vouloir annexer l'état des créances et dettes non échues au
            31 décembre en pièce jointe selon les modèles ci-dessus
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note3Smt;



