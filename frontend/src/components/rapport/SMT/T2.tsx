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

interface CessionItem {
  id: number;
  designation: string;
  montantBrut: string;
  amortissementsPratiques: string;
  valeurNette: string;
  prixCession: string;
  plusMoinsValue: string;
}

const T2: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Commentaire
  const [commentaire, setCommentaire] = useState(
    "Mentionner la justification de la cession ainsi que la date d'acquisition et la date de sortie."
  );

  // Lignes du tableau (sections incorporelles, corporelles, financières)
  const [items, setItems] = useState<CessionItem[]>([
    // Incorporelles
    {
      id: 1,
      designation: "Frais de développement et de prospection",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 2,
      designation: "Brevets, licences, logiciels et droits similaires",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 3,
      designation: "Fonds commercial et droit au bail",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 4,
      designation: "Autres immobilisations incorporelles",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    // Corporelles
    {
      id: 5,
      designation: "Terrains",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 6,
      designation: "Bâtiments",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 7,
      designation: "Aménagements, agencements",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 8,
      designation: "Matériel, mobilier et actifs biologiques",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 9,
      designation: "Matériel de transport",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    // Financières
    {
      id: 10,
      designation: "Titres de participations",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
    {
      id: 11,
      designation: "Autres immobilisations financières",
      montantBrut: "0",
      amortissementsPratiques: "0",
      valeurNette: "0",
      prixCession: "0",
      plusMoinsValue: "0",
    },
  ]);

  const updateItem = (id: number, field: keyof CessionItem, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateTotal = (list: CessionItem[]) => {
    return {
      montantBrut: list.reduce((sum, i) => sum + Number(i.montantBrut || 0), 0),
      amortissementsPratiques: list.reduce(
        (sum, i) => sum + Number(i.amortissementsPratiques || 0),
        0
      ),
      valeurNette: list.reduce((sum, i) => sum + Number(i.valeurNette || 0), 0),
      prixCession: list.reduce((sum, i) => sum + Number(i.prixCession || 0), 0),
      plusMoinsValue: list.reduce(
        (sum, i) => sum + Number(i.plusMoinsValue || 0),
        0
      ),
    };
  };

  const totalIncorporelles = calculateTotal(items.filter((i) => i.id <= 4));
  const totalCorporelles = calculateTotal(
    items.filter((i) => i.id > 4 && i.id <= 9)
  );
  const totalFinancieres = calculateTotal(items.filter((i) => i.id > 9));
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
      pdf.save("t2_plus_moins_values_cession.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-700" />
          T2 - Plus-values et moins-values de cession d'immobilisations
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
            text-align: right;
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
          T2 - IMMOBILISATIONS : PLUS-VALUES ET MOINS-VALUES DE CESSION
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-left w-80"
                >
                  RUBRIQUES
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  MONTANT BRUT A
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  AMORTISSEMENTS PRATIQUES B
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  VALEUR COMPTABLE NETTE C = A - B
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  PRIX DE CESSION D
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center w-36"
                >
                  PLUS-VALUES OU MOINS-VALUES E = D - C
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Section INCORPORELLES */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={6} className="border border-gray-600 p-2 pl-4">
                  IMMOBILISATIONS INCORPORELLES
                </td>
              </tr>
              {items.slice(0, 4).map((item) => (
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
                        value={item.montantBrut}
                        onChange={(e) =>
                          updateItem(item.id, "montantBrut", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montantBrut).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.amortissementsPratiques}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "amortissementsPratiques",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(item.amortissementsPratiques).toLocaleString(
                        "fr-FR"
                      )
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.valeurNette}
                        onChange={(e) =>
                          updateItem(item.id, "valeurNette", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.valeurNette).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.prixCession}
                        onChange={(e) =>
                          updateItem(item.id, "prixCession", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.prixCession).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={item.plusMoinsValue}
                        onChange={(e) =>
                          updateItem(item.id, "plusMoinsValue", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.plusMoinsValue).toLocaleString("fr-FR")
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
                  {totalIncorporelles.montantBrut.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.amortissementsPratiques.toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.valeurNette.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.prixCession.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {totalIncorporelles.plusMoinsValue.toLocaleString("fr-FR")}
                </td>
              </tr>

              {/* Section CORPORELLES */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={6} className="border border-gray-600 p-2 pl-4">
                  IMMOBILISATIONS CORPORELLES
                </td>
              </tr>
              {items.slice(4, 9).map((item) => (
                <tr key={item.id}>
                  {/* Même structure que ci-dessus */}
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
                        value={item.montantBrut}
                        onChange={(e) =>
                          updateItem(item.id, "montantBrut", e.target.value)
                        }
                      />
                    ) : (
                      Number(item.montantBrut).toLocaleString("fr-FR")
                    )}
                  </td>
                  {/* ... répéter pour les autres colonnes ... */}
                </tr>
              ))}

              {/* Sous-total corporelles */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  SOUS TOTAL : IMMOBILISATIONS CORPORELLES
                </td>
                {/* ... totaux ... */}
              </tr>

              {/* Section FINANCIÈRES */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={6} className="border border-gray-600 p-2 pl-4">
                  IMMOBILISATIONS FINANCIÈRES
                </td>
              </tr>
              {items.slice(9).map((item) => (
                <tr key={item.id}>{/* Même structure */}</tr>
              ))}

              {/* Sous-total financières */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  SOUS TOTAL : IMMOBILISATIONS FINANCIÈRES
                </td>
                {/* ... totaux ... */}
              </tr>

              {/* Grand Total */}
              <tr className="total-row font-extrabold">
                <td className="border border-gray-600 p-2 pl-8">
                  TOTAL GÉNÉRAL
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.montantBrut.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.amortissementsPratiques.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.valeurNette.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.prixCession.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {grandTotal.plusMoinsValue.toLocaleString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Commentaire */}
          <div className="mt-8 px-4">
            <div className="font-bold mb-2">Commentaire :</div>
            {isEditing ? (
              <textarea
                className="w-full h-32 p-3 border border-gray-400 rounded bg-gray-50 text-xs resize-y"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            ) : (
              <div className="p-3 border border-gray-300 rounded bg-white min-h-[100px] whitespace-pre-wrap">
                {commentaire}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default T2;

