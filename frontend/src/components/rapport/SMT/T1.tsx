import React, { useState, useRef } from "react";
import {
  Pencil,
  Save,
  Download,
  FileText,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Immobilisation {
  id: number;
  designation: string;
  montantOuverture: string;
  acquisitions: string;
  virementsPoste: string;
  reevaluation: string;
  cessions: string;
  virementsPosteSortie: string;
  montantCloture: string;
}

const T1: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Sections du tableau (vous pouvez ajouter plus de lignes par section)
  const [incorporelles, setIncorporelles] = useState<Immobilisation[]>([
    {
      id: 1,
      designation: "Frais de développement et de prospection",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 2,
      designation: "Brevets, licences, logiciels et droits similaires",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 3,
      designation: "Fonds commercial et droit au bail",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 4,
      designation: "Autres immobilisations incorporelles",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
  ]);

  const [corporelles, setCorporelles] = useState<Immobilisation[]>([
    {
      id: 5,
      designation: "Terrains hors immeubles de placement",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 6,
      designation: "Terrains - immeubles de placement",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 7,
      designation: "Bâtiments hors immeubles de placement",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 8,
      designation: "Bâtiments - immeubles de placement",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 9,
      designation: "Aménagements, agencements et installations",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 10,
      designation: "Matériel, mobilier et actifs biologiques",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 11,
      designation: "Matériel de transport",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
  ]);

  const [financieres, setFinancieres] = useState<Immobilisation[]>([
    {
      id: 12,
      designation: "Titres de participation",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
    {
      id: 13,
      designation: "Autres immobilisations financières",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    },
  ]);

  const addItem = (
    section: "incorporelles" | "corporelles" | "financieres"
  ) => {
    const newId = Date.now();
    const newItem = {
      id: newId,
      designation: "",
      montantOuverture: "0",
      acquisitions: "0",
      virementsPoste: "0",
      reevaluation: "0",
      cessions: "0",
      virementsPosteSortie: "0",
      montantCloture: "0",
    };

    if (section === "incorporelles")
      setIncorporelles([...incorporelles, newItem]);
    else if (section === "corporelles")
      setCorporelles([...corporelles, newItem]);
    else setFinancieres([...financieres, newItem]);
  };

  const removeItem = (
    section: "incorporelles" | "corporelles" | "financieres",
    id: number
  ) => {
    if (section === "incorporelles")
      setIncorporelles(incorporelles.filter((i) => i.id !== id));
    else if (section === "corporelles")
      setCorporelles(corporelles.filter((i) => i.id !== id));
    else setFinancieres(financieres.filter((i) => i.id !== id));
  };

  const updateItem = (
    section: "incorporelles" | "corporelles" | "financieres",
    id: number,
    field: keyof Immobilisation,
    value: string
  ) => {
    const update = (list: Immobilisation[]) =>
      list.map((item) => (item.id === id ? { ...item, [field]: value } : item));

    if (section === "incorporelles") setIncorporelles(update(incorporelles));
    else if (section === "corporelles") setCorporelles(update(corporelles));
    else setFinancieres(update(financieres));
  };

  const calculateTotal = (list: Immobilisation[]) => {
    return {
      montantOuverture: list.reduce(
        (sum, i) => sum + Number(i.montantOuverture || 0),
        0
      ),
      acquisitions: list.reduce(
        (sum, i) => sum + Number(i.acquisitions || 0),
        0
      ),
      virementsPoste: list.reduce(
        (sum, i) => sum + Number(i.virementsPoste || 0),
        0
      ),
      reevaluation: list.reduce(
        (sum, i) => sum + Number(i.reevaluation || 0),
        0
      ),
      cessions: list.reduce((sum, i) => sum + Number(i.cessions || 0), 0),
      virementsPosteSortie: list.reduce(
        (sum, i) => sum + Number(i.virementsPosteSortie || 0),
        0
      ),
      montantCloture: list.reduce(
        (sum, i) => sum + Number(i.montantCloture || 0),
        0
      ),
    };
  };

  const totalIncorporelles = calculateTotal(incorporelles);
  const totalCorporelles = calculateTotal(corporelles);
  const totalFinancieres = calculateTotal(financieres);

  const grandTotal = {
    montantOuverture:
      totalIncorporelles.montantOuverture +
      totalCorporelles.montantOuverture +
      totalFinancieres.montantOuverture,
    acquisitions:
      totalIncorporelles.acquisitions +
      totalCorporelles.acquisitions +
      totalFinancieres.acquisitions,
    virementsPoste:
      totalIncorporelles.virementsPoste +
      totalCorporelles.virementsPoste +
      totalFinancieres.virementsPoste,
    reevaluation:
      totalIncorporelles.reevaluation +
      totalCorporelles.reevaluation +
      totalFinancieres.reevaluation,
    cessions:
      totalIncorporelles.cessions +
      totalCorporelles.cessions +
      totalFinancieres.cessions,
    virementsPosteSortie:
      totalIncorporelles.virementsPosteSortie +
      totalCorporelles.virementsPosteSortie +
      totalFinancieres.virementsPosteSortie,
    montantCloture:
      totalIncorporelles.montantCloture +
      totalCorporelles.montantCloture +
      totalFinancieres.montantCloture,
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
      pdf.save("t1_immobilisations_brutes.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T1 - Immobilisations Brutes
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
            transition: opacity 0.2s;
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
          T1 - IMMOBILISATIONS BRUTES
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-left w-64"
                >
                  RUBRIQUES
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  MONTANT BRUT À L'OUVERTURE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  ACQUISITIONS, APPORTS, CRÉATIONS
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  VIREMENTS DE POSTE À POSTE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  SUITE À UNE RÉÉVALUATION PRATIQUÉE AU COURS DE L'EXERCICE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  CESSIONS / HORS SERVICE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  VIREMENTS DE POSTE À POSTE
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  MONTANT BRUT À LA CLÔTURE
                </th>
                {isEditing && (
                  <th
                    rowSpan={2}
                    className="border border-gray-600 p-2 w-10"
                  ></th>
                )}
              </tr>
            </thead>

            <tbody>
              {/* Section IMMOBILISATIONS INCORPORELLES */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={8} className="border border-gray-600 p-2 pl-4">
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
                          updateItem(
                            "incorporelles",
                            item.id,
                            "designation",
                            e.target.value
                          )
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
                            "incorporelles",
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
                  {/* Répéter pour chaque colonne */}
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.acquisitions}
                        onChange={(e) =>
                          updateItem(
                            "incorporelles",
                            item.id,
                            "acquisitions",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.acquisitions).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.virementsPoste}
                        onChange={(e) =>
                          updateItem(
                            "incorporelles",
                            item.id,
                            "virementsPoste",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.virementsPoste).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.reevaluation}
                        onChange={(e) =>
                          updateItem(
                            "incorporelles",
                            item.id,
                            "reevaluation",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.reevaluation).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.cessions}
                        onChange={(e) =>
                          updateItem(
                            "incorporelles",
                            item.id,
                            "cessions",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.cessions).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.virementsPosteSortie}
                        onChange={(e) =>
                          updateItem(
                            "incorporelles",
                            item.id,
                            "virementsPosteSortie",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.virementsPosteSortie).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.montantCloture}
                        onChange={(e) =>
                          updateItem(
                            "incorporelles",
                            item.id,
                            "montantCloture",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.montantCloture).toLocaleString("fr-FR")
                    )}
                  </td>
                  {isEditing && (
                    <td className="border border-gray-600 p-2 text-center">
                      <button
                        onClick={() => removeItem("incorporelles", item.id)}
                        className="delete-btn text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Sous-total incorporelles */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  Sous-total incorporelles
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.montantOuverture.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.acquisitions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.virementsPoste.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.reevaluation.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.cessions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.virementsPosteSortie.toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.montantCloture.toLocaleString("fr-FR")}
                </td>
                {isEditing && <td className="border border-gray-600 p-2"></td>}
              </tr>

              {/* Autres sections (corporelles et financières) peuvent être ajoutées de la même manière */}
              {/* ... */}

              {/* Grand Total */}
              <tr className="total-row font-extrabold">
                <td className="border border-gray-600 p-2 pl-8">
                  TOTAL GÉNÉRAL
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.montantOuverture.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.acquisitions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.virementsPoste.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.reevaluation.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.cessions.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.virementsPosteSortie.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.montantCloture.toLocaleString("fr-FR")}
                </td>
                {isEditing && <td className="border border-gray-600 p-2"></td>}
              </tr>
            </tbody>
          </table>

          {/* Boutons Ajouter par section */}
          {isEditing && (
            <div className="mt-6 flex justify-center gap-6">
              <button
                onClick={() => addItem("incorporelles")}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow"
              >
                <Plus size={18} /> Ajouter incorporel
              </button>
              <button
                onClick={() => addItem("corporelles")}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow"
              >
                <Plus size={18} /> Ajouter corporel
              </button>
              <button
                onClick={() => addItem("financieres")}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow"
              >
                <Plus size={18} /> Ajouter financier
              </button>
            </div>
          )}

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

export default T1;

