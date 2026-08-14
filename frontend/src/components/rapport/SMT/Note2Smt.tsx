import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, Plus, Trash2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StockItem {
  id: number;
  reference: string;
  designation: string;
  quantite: string;
  prixUnitaire: string;
  montant: string;
}

const Note2Smt: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Lignes du tableau
  const [items, setItems] = useState<StockItem[]>([
    {
      id: 1,
      reference: "",
      designation: "",
      quantite: "0",
      prixUnitaire: "0",
      montant: "0",
    },
  ]);

  // Valeurs totales
  const [valeurStockFinal, setValeurStockFinal] = useState("0");
  const [valeurStockInitial, setValeurStockInitial] = useState("0");

  const addRow = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setItems([
      ...items,
      {
        id: newId,
        reference: "",
        designation: "",
        quantite: "0",
        prixUnitaire: "0",
        montant: "0",
      },
    ]);
  };

  const removeRow = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: keyof StockItem, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateTotalMontant = () => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.montant) || 0);
    }, 0);
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
      pdf.save("note_2_etat_des_stocks.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-700" />
          NOTE 2 - État des Stocks
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow transition-all ${
              isEditing
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-orange-700 hover:bg-orange-800 text-white"
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
          ÉTAT DES STOCKS AU 31 DÉCEMBRE
          .........................................
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-center w-32">
                  RÉFÉRENCE
                </th>
                <th className="border border-gray-600 p-2 font-bold text-left">
                  DÉSIGNATION
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-28">
                  QUANTITÉ
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-32">
                  PRIX UNITAIRE
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-36">
                  MONTANT
                </th>
                {isEditing && (
                  <th className="border border-gray-600 p-2 w-10"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-600 p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-center"
                        value={item.reference}
                        onChange={(e) =>
                          updateItem(item.id, "reference", e.target.value)
                        }
                      />
                    ) : (
                      item.reference || "-"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={item.designation}
                        onChange={(e) =>
                          updateItem(item.id, "designation", e.target.value)
                        }
                      />
                    ) : (
                      item.designation || ""
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.quantite}
                        onChange={(e) =>
                          updateItem(item.id, "quantite", e.target.value)
                        }
                      />
                    ) : (
                      item.quantite || "0"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.prixUnitaire}
                        onChange={(e) =>
                          updateItem(item.id, "prixUnitaire", e.target.value)
                        }
                      />
                    ) : (
                      item.prixUnitaire || "0"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.montant}
                        onChange={(e) =>
                          updateItem(item.id, "montant", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montant).toLocaleString("fr-FR")
                    )}
                  </td>
                  {isEditing && (
                    <td className="border border-gray-600 p-2 text-center">
                      <button
                        onClick={() => removeRow(item.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Ligne TOTAL */}
              <tr className="total-row">
                <td
                  colSpan={isEditing ? 4 : 3}
                  className="border border-gray-600 p-2 font-bold text-right"
                >
                  TOTAL
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotalMontant().toLocaleString("fr-FR")}
                </td>
                {isEditing && <td className="border border-gray-600 p-2"></td>}
              </tr>
            </tbody>
          </table>

          {/* Bouton Ajouter */}
          {isEditing && (
            <div className="mt-4 text-center">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition"
              >
                <Plus size={18} /> Ajouter une ligne
              </button>
            </div>
          )}

          {/* Valeurs finales */}
          <div className="mt-6 grid grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="border border-gray-600 p-3 rounded">
              <div className="font-bold text-center mb-1">
                VALEUR DU STOCK FINAL
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input text-center w-full"
                  value={valeurStockFinal}
                  onChange={(e) => setValeurStockFinal(e.target.value)}
                />
              ) : (
                <div className="text-center font-medium">
                  {Number(valeurStockFinal).toLocaleString("fr-FR")}
                </div>
              )}
            </div>

            <div className="border border-gray-600 p-3 rounded">
              <div className="font-bold text-center mb-1">
                VALEUR DU STOCK INITIAL
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input text-center w-full"
                  value={valeurStockInitial}
                  onChange={(e) => setValeurStockInitial(e.target.value)}
                />
              ) : (
                <div className="text-center font-medium">
                  {Number(valeurStockInitial).toLocaleString("fr-FR")}
                </div>
              )}
            </div>
          </div>

          {/* Note de bas de page */}
          <div className="mt-6 px-4 pb-6 text-[10px] italic text-gray-700 text-center">
            * Bien vouloir annexer l'état des stocks en pièce jointe selon le
            modèle ci-dessus
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note2Smt;


