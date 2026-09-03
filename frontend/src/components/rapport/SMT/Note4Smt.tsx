import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, Plus, Trash2, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface TresoLine {
  id: number;
  date: string;
  libelle: string;
  recettes: string;
  depenses: string;
  solde: string;
  vente: string;
  autresRecettes: string;
  materielMobilier: string;
  achatsMarchandises: string;
  achatsMatieresFournitures: string;
  loyer: string;
  salaires: string;
  impotsTaxes: string;
  autresDepenses: string;
}

const Note4Smt: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
    mois: "",
    annee: "",
  });

  // Lignes du journal
  const [lines, setLines] = useState<TresoLine[]>([
    {
      id: 0,
      date: "",
      libelle: "Report à nouveau",
      recettes: "0",
      depenses: "0",
      solde: "0",
      vente: "0",
      autresRecettes: "0",
      materielMobilier: "0",
      achatsMarchandises: "0",
      achatsMatieresFournitures: "0",
      loyer: "0",
      salaires: "0",
      impotsTaxes: "0",
      autresDepenses: "0",
    },
  ]);

  const addLine = () => {
    const newId = Math.max(...lines.map((l) => l.id), 0) + 1;
    setLines([
      ...lines,
      {
        id: newId,
        date: "",
        libelle: "",
        recettes: "0",
        depenses: "0",
        solde: "0",
        vente: "0",
        autresRecettes: "0",
        materielMobilier: "0",
        achatsMarchandises: "0",
        achatsMatieresFournitures: "0",
        loyer: "0",
        salaires: "0",
        impotsTaxes: "0",
        autresDepenses: "0",
      },
    ]);
  };

  const removeLine = (id: number) => {
    if (id === 0) return; // On protège la ligne "Report à nouveau"
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id: number, field: keyof TresoLine, value: string) => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const calculateTotal = (rows: TresoLine[], field: keyof TresoLine): number =>
    rows.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);

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
      pdf.save("note_4_journal_tresorierie.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-700" />
          NOTE 4 - Journal de Trésorerie
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
        <style>{`
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
          JOURNAL DE TRÉSORERIE
        </div>

        {/* Sous-titre mois/année */}
        <div className="p-4 text-center font-medium border-b border-gray-400">
          Mois de :{" "}
          {isEditing ? (
            <input
              className="edit-input w-32 inline-block text-center"
              value={header.mois}
              onChange={(e) => setHeader({ ...header, mois: e.target.value })}
            />
          ) : (
            header.mois || ".................."
          )}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Année :{" "}
          {isEditing ? (
            <input
              className="edit-input w-32 inline-block text-center"
              value={header.annee}
              onChange={(e) => setHeader({ ...header, annee: e.target.value })}
            />
          ) : (
            header.annee || ".................."
          )}
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-center w-24">
                  Date
                </th>
                <th className="border border-gray-600 p-2 font-bold text-left">
                  Libellés
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-28">
                  Recettes
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-28">
                  Dépenses
                </th>
                <th className="border border-gray-600 p-2 font-bold text-right w-28">
                  Solde
                </th>

                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Vente
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Autres
                </th>

                <th className="border border-gray-600 p-2 font-bold text-center w-32">
                  Matériel et Mobilier
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-32">
                  Achats marchandises
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-32">
                  Achats matières et fournitures
                </th>

                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Loyer
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Salaires
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Impôts et taxes
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  Autres
                </th>

                {isEditing && (
                  <th className="border border-gray-600 p-2 w-10"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="border border-gray-600 p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-center"
                        value={line.date}
                        onChange={(e) =>
                          updateLine(line.id, "date", e.target.value)
                        }
                      />
                    ) : (
                      line.date || "-"
                    )}
                  </td>
                  <td className="border border-gray-600 p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={line.libelle}
                        onChange={(e) =>
                          updateLine(line.id, "libelle", e.target.value)
                        }
                      />
                    ) : (
                      line.libelle
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.recettes}
                        onChange={(e) =>
                          updateLine(line.id, "recettes", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.recettes).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.depenses}
                        onChange={(e) =>
                          updateLine(line.id, "depenses", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.depenses).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.solde}
                        onChange={(e) =>
                          updateLine(line.id, "solde", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.solde).toLocaleString("fr-FR")
                    )}
                  </td>

                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.vente}
                        onChange={(e) =>
                          updateLine(line.id, "vente", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.vente).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.autresRecettes}
                        onChange={(e) =>
                          updateLine(line.id, "autresRecettes", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.autresRecettes).toLocaleString("fr-FR")
                    )}
                  </td>

                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.materielMobilier}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "materielMobilier",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(line.materielMobilier).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.achatsMarchandises}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "achatsMarchandises",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(line.achatsMarchandises).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.achatsMatieresFournitures}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "achatsMatieresFournitures",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(line.achatsMatieresFournitures).toLocaleString(
                        "fr-FR"
                      )
                    )}
                  </td>

                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.loyer}
                        onChange={(e) =>
                          updateLine(line.id, "loyer", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.loyer).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.salaires}
                        onChange={(e) =>
                          updateLine(line.id, "salaires", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.salaires).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.impotsTaxes}
                        onChange={(e) =>
                          updateLine(line.id, "impotsTaxes", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.impotsTaxes).toLocaleString("fr-FR")
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={line.autresDepenses}
                        onChange={(e) =>
                          updateLine(line.id, "autresDepenses", e.target.value)
                        }
                      />
                    ) : (
                      Number(line.autresDepenses).toLocaleString("fr-FR")
                    )}
                  </td>

                  {isEditing && (
                    <td className="border border-gray-600 p-2 text-center">
                      {line.id !== 0 && (
                        <button
                          onClick={() => removeLine(line.id)}
                          className="delete-btn text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {/* Solde à reporter */}
              <tr className="total-row">
                <td
                  colSpan={isEditing ? 2 : 1}
                  className="border border-gray-600 p-2 font-bold text-right"
                >
                  Solde à reporter
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {/* Solde final recettes */}
                  {calculateTotal(lines, "recettes").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {calculateTotal(lines, "depenses").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {/* Solde = Recettes - Dépenses */}
                  {(
                    calculateTotal(lines, "recettes") -
                    calculateTotal(lines, "depenses")
                  ).toLocaleString("fr-FR")}
                </td>
                <td colSpan={10} className="border border-gray-600 p-2"></td>
                {isEditing && <td className="border border-gray-600 p-2"></td>}
              </tr>
            </tbody>
          </table>

          {/* Bouton Ajouter */}
          {isEditing && (
            <div className="mt-6 text-center">
              <button
                onClick={addLine}
                className="inline-flex items-center gap-2 px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition"
              >
                <Plus size={20} /> Ajouter une ligne
              </button>
            </div>
          )}

          {/* Note de bas de page */}
          <div className="mt-8 px-4 pb-6 text-[10px] italic text-gray-700 text-center">
            * Annexer en pièces jointes un journal mensuel par banque et un
            journal mensuel par caisse selon le modèle ci-dessus
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note4Smt;


