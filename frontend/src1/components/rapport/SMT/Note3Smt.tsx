import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, Plus, Trash2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  // En-tête
  const [header, setHeader] = useState({
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

      const canvas = await html2canvas(reportRef.current!, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("note_3_creances_dettes_non_echues.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          NOTE 3 - État des créances et dettes non échues au 31 décembre
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow transition-all ${
              isEditing
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {isEditing ? <X size={18} /> : <Pencil size={18} />}
            {isEditing ? "Annuler" : "Éditer"}
          </button>

          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                alert("Modifications enregistrées !");
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow"
            >
              <Save size={18} /> Sauvegarder
            </button>
          )}

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-all shadow"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Document A4 paysage */}
      <div
        ref={reportRef}
        className="max-w-[297mm] mx-auto bg-white shadow-2xl border border-gray-300 rounded-lg overflow-hidden"
      >
        <style jsx>{`
          .header-gray {
            background-color: #e0e0e0;
          }
          .title-gray {
            background-color: #d0d0d0;
            font-weight: bold;
          }
          .total-row {
            background-color: #c0c0c0;
            font-weight: bold;
          }
          .edit-input {
            width: 100%;
            padding: 4px 6px;
            border: 1px solid #999;
            border-radius: 4px;
            background: #fff9e6;
            font-size: 11px;
          }
          .edit-input:focus {
            outline: 2px solid #3b82f6;
            background: #fff;
          }
          .delete-btn {
            opacity: 0.6;
          }
          .delete-btn:hover {
            opacity: 1;
          }
        `}</style>

        {/* En-tête */}
        <div className="p-6 border-b-2 border-gray-700 grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                className="edit-input flex-1"
                value={header.designationEntite}
                onChange={(e) =>
                  setHeader({ ...header, designationEntite: e.target.value })
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 flex-1 min-h-[22px]">
                {header.designationEntite || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le :
            </span>
            {isEditing ? (
              <input
                className="edit-input w-44 text-center"
                value={header.exerciceClosLe}
                onChange={(e) =>
                  setHeader({ ...header, exerciceClosLe: e.target.value })
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 w-44 text-center">
                {header.exerciceClosLe || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                className="edit-input flex-1"
                value={header.numeroIdentification}
                onChange={(e) =>
                  setHeader({ ...header, numeroIdentification: e.target.value })
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 flex-1 min-h-[22px]">
                {header.numeroIdentification || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            <span className="border-b border-dotted border-gray-600 w-16 text-center">
              {header.dureeMois}
            </span>
          </div>
        </div>

        {/* Titre principal */}
        <div className="title-gray py-4 text-center font-bold text-base border-b-2 border-gray-700">
          ÉTAT DES CRÉANCES ET DES DETTES NON ÉCHUES AU 31 DÉCEMBRE
          .........................................
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
                        className="edit-input text-center"
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
                        className="edit-input"
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
                        className="edit-input text-right"
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
                        className="edit-input text-right"
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
                        className="delete-btn text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Total Créances */}
              <tr className="total-row">
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
                        className="edit-input"
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
                        className="edit-input text-right"
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
                        className="edit-input text-right"
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
                        className="delete-btn text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Total Dettes */}
              <tr className="total-row">
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
