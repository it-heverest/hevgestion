import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface T3Row {
  id: number;
  libelle: string;
  anneeN: string;
  anneeN1: string;
  variation: string;
  creances1an: string;
  creances1a2ans: string;
  creancesPlus2ans: string;
}

interface FilialeRow {
  id: number;
  denomination: string;
  localisation: string;
  valeurAcquisition: string;
  pourcentageDetenu: string;
  montantCapitauxPropres: string;
  resultatDernierExercice: string;
}

const T3: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Tableau principal (valeurs financières)
  const [rows, setRows] = useState<T3Row[]>([
    {
      id: 1,
      libelle: "Titres de participation",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
    {
      id: 2,
      libelle: "Prêts et créances",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
    {
      id: 3,
      libelle: "Prêts au personnel",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
    {
      id: 4,
      libelle: "Créances sur l'État",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
    {
      id: 5,
      libelle: "Titres immobilisés",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
    {
      id: 6,
      libelle: "Dépôts et cautionnements",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
    {
      id: 7,
      libelle: "Intérêts courus",
      anneeN: "0",
      anneeN1: "0",
      variation: "0",
      creances1an: "0",
      creances1a2ans: "0",
      creancesPlus2ans: "0",
    },
  ]);

  // Liste des filiales et participations
  const [filiales, setFiliales] = useState<FilialeRow[]>([
    {
      id: 1,
      denomination: "",
      localisation: "",
      valeurAcquisition: "0",
      pourcentageDetenu: "0",
      montantCapitauxPropres: "0",
      resultatDernierExercice: "0",
    },
  ]);

  const addFiliale = () => {
    const newId = Math.max(...filiales.map((f) => f.id), 0) + 1;
    setFiliales([
      ...filiales,
      {
        id: newId,
        denomination: "",
        localisation: "",
        valeurAcquisition: "0",
        pourcentageDetenu: "0",
        montantCapitauxPropres: "0",
        resultatDernierExercice: "0",
      },
    ]);
  };

  const removeFiliale = (id: number) => {
    setFiliales(filiales.filter((f) => f.id !== id));
  };

  const updateFiliale = (
    id: number,
    field: keyof FilialeRow,
    value: string
  ) => {
    setFiliales(
      filiales.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const calculateTotal = (field: keyof T3Row) => {
    return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
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
      pdf.save("t3_immobilisations_financieres.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T3 - Immobilisations financières
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
            text-align: right;
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
          T3 - IMMOBILISATIONS FINANCIÈRES
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-left w-80">
                  Libellés
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  Année N
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  Année N-1
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Variation %
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  Créances à un an au plus
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  Créances à plus d'un an et à deux ans au plus
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  Créances à plus de deux ans
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-600 p-2 pl-4">
                    {item.libelle}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={item.anneeN}
                        onChange={(e) =>
                          updateItem(item.id, "anneeN", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.anneeN).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={item.anneeN1}
                        onChange={(e) =>
                          updateItem(item.id, "anneeN1", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.anneeN1).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-center"
                        value={item.variation}
                        onChange={(e) =>
                          updateItem(item.id, "variation", e.target.value)
                        }
                      />
                    ) : (
                      item.variation + " %"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.creances1an}
                        onChange={(e) =>
                          updateItem(item.id, "creances1an", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.creances1an).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.creances1a2ans}
                        onChange={(e) =>
                          updateItem(item.id, "creances1a2ans", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.creances1a2ans).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.creancesPlus2ans}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "creancesPlus2ans",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.creancesPlus2ans).toLocaleString("fr-FR")
                    )}
                  </td>
                </tr>
              ))}

              {/* Total brut */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  TOTAL BRUT
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal("anneeN").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal("anneeN1").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-center">—</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal("creances1an").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal("creances1a2ans").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal("creancesPlus2ans").toLocaleString("fr-FR")}
                </td>
              </tr>

              {/* Dépréciations */}
              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Dépréciations sur titres de participation
                </td>
                <td className="border border-gray-600 p-2 text-right">0</td>
                <td className="border border-gray-600 p-2 text-right">0</td>
                <td className="border border-gray-600 p-2 text-center">—</td>
                <td colSpan={3} className="border border-gray-600 p-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Dépréciations autres immobilisations
                </td>
                <td className="border border-gray-600 p-2 text-right">0</td>
                <td className="border border-gray-600 p-2 text-right">0</td>
                <td className="border border-gray-600 p-2 text-center">—</td>
                <td colSpan={3} className="border border-gray-600 p-2"></td>
              </tr>

              {/* Total net */}
              <tr className="total-row font-bold">
                <td className="border border-gray-600 p-2 pl-8">
                  TOTAL NET DE DÉPRÉCIATION
                </td>
                <td className="border border-gray-600 p-2 text-right">0</td>
                <td className="border border-gray-600 p-2 text-right">0</td>
                <td className="border border-gray-600 p-2 text-center">—</td>
                <td
                  colSpan={3}
                  className="border border-gray-600 p-2 text-right"
                >
                  0
                </td>
              </tr>
            </tbody>
          </table>

          {/* Liste des filiales */}
          <div className="mt-10">
            <div className="title-gray py-2 px-4 font-bold border border-gray-600">
              Liste des filiales et participations :
            </div>

            <table className="w-full border-collapse text-[11px] mt-2">
              <thead>
                <tr className="bg-gray-300">
                  <th className="border border-gray-600 p-2 font-bold text-left w-80">
                    Dénomination sociale
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-left w-44">
                    Localisation (ville / Pays)
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-right w-36">
                    Valeur d'acquisition
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center w-28">
                    % Détenu
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-right w-44">
                    Montant des capitaux propres filiales
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-right w-44">
                    Résultat dernier exercice filiales
                  </th>
                  {isEditing && (
                    <th className="border border-gray-600 p-2 w-10"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filiales.map((f) => (
                  <tr key={f.id}>
                    <td className="border border-gray-600 p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={f.denomination}
                          onChange={(e) =>
                            updateFiliale(f.id, "denomination", e.target.value)
                          }
                        />
                      ) : (
                        f.denomination
                      )}
                    </td>
                    <td className="border border-gray-600 p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={f.localisation}
                          onChange={(e) =>
                            updateFiliale(f.id, "localisation", e.target.value)
                          }
                        />
                      ) : (
                        f.localisation
                      )}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-right"
                          value={f.valeurAcquisition}
                          onChange={(e) =>
                            updateFiliale(
                              f.id,
                              "valeurAcquisition",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        Number(f.valeurAcquisition).toLocaleString("fr-FR")
                      )}
                    </td>
                    <td className="border border-gray-600 p-2 text-center">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-center"
                          value={f.pourcentageDetenu}
                          onChange={(e) =>
                            updateFiliale(
                              f.id,
                              "pourcentageDetenu",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        f.pourcentageDetenu + " %"
                      )}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-right"
                          value={f.montantCapitauxPropres}
                          onChange={(e) =>
                            updateFiliale(
                              f.id,
                              "montantCapitauxPropres",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        Number(f.montantCapitauxPropres).toLocaleString("fr-FR")
                      )}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-right"
                          value={f.resultatDernierExercice}
                          onChange={(e) =>
                            updateFiliale(
                              f.id,
                              "resultatDernierExercice",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        Number(f.resultatDernierExercice).toLocaleString(
                          "fr-FR"
                        )
                      )}
                    </td>
                    {isEditing && (
                      <td className="border border-gray-600 p-2 text-center">
                        <button
                          onClick={() => removeFiliale(f.id)}
                          className="delete-btn text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="mt-4 text-center">
                <button
                  onClick={addFiliale}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition"
                >
                  <Plus size={18} /> Ajouter une filiale / participation
                </button>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div className="mt-10 px-4">
            <div className="font-bold mb-2">Commentaire :</div>
            <div className="text-[10px] italic space-y-1">
              <div>Justifier toute variation significative</div>
              <div>Commenter toutes les créances anciennes</div>
              <div>
                Pour les créances relatives à la concession, faire un descriptif
                de l'accord
              </div>
              <div>Indiquer la nature de la créance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T3;

