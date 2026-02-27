import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AmortissementItem {
  id: number;
  designation: string;
  montantOuverture: string;
  dotations: string;
  diminutions: string;
  montantCloture: string;
}

const T1Bis: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Lignes du tableau (sections incorporelles + corporelles)
  const [items, setItems] = useState<AmortissementItem[]>([
    // Incorporelles
    {
      id: 1,
      designation: "Frais de développement et de prospection",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 2,
      designation: "Brevets, licences, logiciels et droits similaires",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 3,
      designation: "Fonds commercial et droit au bail",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 4,
      designation: "Autres immobilisations incorporelles",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    // Corporelles
    {
      id: 5,
      designation: "Terrains hors immeubles de placement",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 6,
      designation: "Terrains - immeubles de placement",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 7,
      designation: "Bâtiments hors immeubles de placement",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 8,
      designation: "Bâtiments - immeubles de placement",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 9,
      designation: "Aménagements, agencements et installations",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 10,
      designation: "Matériel, mobilier et actifs biologiques",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
    {
      id: 11,
      designation: "Matériel de transport",
      montantOuverture: "0",
      dotations: "0",
      diminutions: "0",
      montantCloture: "0",
    },
  ]);

  const updateItem = (
    id: number,
    field: keyof AmortissementItem,
    value: string
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateTotal = (list: AmortissementItem[]) => {
    return {
      montantOuverture: list.reduce(
        (sum, i) => sum + Number(i.montantOuverture || 0),
        0
      ),
      dotations: list.reduce((sum, i) => sum + Number(i.dotations || 0), 0),
      diminutions: list.reduce((sum, i) => sum + Number(i.diminutions || 0), 0),
      montantCloture: list.reduce(
        (sum, i) => sum + Number(i.montantCloture || 0),
        0
      ),
    };
  };

  const totalIncorporelles = calculateTotal(items.filter((i) => i.id <= 4));
  const totalCorporelles = calculateTotal(items.filter((i) => i.id > 4));
  const grandTotal = calculateTotal(items);

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
      pdf.save("t1_bis_amortissements.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T1 BIS - Amortissements des immobilisations
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
              Exercice clos le 31-12- :
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
          T1 BIS - AMORTISSEMENTS
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-left w-72"
                >
                  RUBRIQUES
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  AMORTISSEMENTS CUMULÉS À L'OUVERTURE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  AUGMENTATIONS : DOTATIONS DE L'EXERCICE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  DIMINUTIONS : AMORTISSEMENTS RELATIFS AUX ÉLÉMENTS SORTIS DE
                  L'ACTIF
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  CUMUL DES AMORTISSEMENTS À LA CLÔTURE
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Section INCORPORELLES */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={5} className="border border-gray-600 p-2 pl-4">
                  IMMOBILISATIONS INCORPORELLES
                </td>
              </tr>
              {incorporelles.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-600 p-2 pl-8">
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
                      item.designation
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.montantOuverture}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "montantOuverture",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.montantOuverture).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.dotations}
                        onChange={(e) =>
                          updateItem(item.id, "dotations", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.dotations).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.diminutions}
                        onChange={(e) =>
                          updateItem(item.id, "diminutions", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.diminutions).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.montantCloture}
                        onChange={(e) =>
                          updateItem(item.id, "montantCloture", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montantCloture).toLocaleString("fr-FR")
                    )}
                  </td>
                </tr>
              ))}

              {/* Sous-total incorporelles */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  SOUS TOTAL : IMMOBILISATIONS INCORPORELLES
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.montantOuverture.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.dotations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.diminutions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.montantCloture.toLocaleString("fr-FR")}
                </td>
              </tr>

              {/* Section CORPORELLES */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={5} className="border border-gray-600 p-2 pl-4">
                  IMMOBILISATIONS CORPORELLES
                </td>
              </tr>
              {corporelles.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-600 p-2 pl-8">
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
                      item.designation
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.montantOuverture}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "montantOuverture",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.montantOuverture).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.dotations}
                        onChange={(e) =>
                          updateItem(item.id, "dotations", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.dotations).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.diminutions}
                        onChange={(e) =>
                          updateItem(item.id, "diminutions", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.diminutions).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.montantCloture}
                        onChange={(e) =>
                          updateItem(item.id, "montantCloture", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montantCloture).toLocaleString("fr-FR")
                    )}
                  </td>
                </tr>
              ))}

              {/* Sous-total corporelles */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  SOUS TOTAL : IMMOBILISATIONS CORPORELLES
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalCorporelles.montantOuverture.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalCorporelles.dotations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalCorporelles.diminutions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalCorporelles.montantCloture.toLocaleString("fr-FR")}
                </td>
              </tr>

              {/* Grand Total */}
              <tr className="total-row font-extrabold">
                <td className="border border-gray-600 p-2 pl-8">
                  TOTAL GÉNÉRAL
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.montantOuverture.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.dotations.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.diminutions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.montantCloture.toLocaleString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Zone Commentaires */}
          <div className="mt-8 px-4">
            <div className="font-bold mb-1">Commentaires :</div>
            <textarea
              className="w-full h-24 p-3 border border-gray-400 rounded bg-gray-50 text-xs resize-y"
              placeholder="Ajoutez vos commentaires ici..."
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default T1Bis;
