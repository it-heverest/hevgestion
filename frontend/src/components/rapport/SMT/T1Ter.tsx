import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const T1Ter: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Données des rubriques (3 lignes principales + total)
  const [data, setData] = useState({
    incorporelles: {
      reportOuverture: "0",
      amortissementsDiffresExercice: "0",
      imputationAnterieure: "0",
      totalReportNonImpute: "0",
    },
    corporelles: {
      reportOuverture: "0",
      amortissementsDiffresExercice: "0",
      imputationAnterieure: "0",
      totalReportNonImpute: "0",
    },
    total: {
      reportOuverture: "0",
      amortissementsDiffresExercice: "0",
      imputationAnterieure: "0",
      totalReportNonImpute: "0",
    },
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleDataChange = (
    category: "incorporelles" | "corporelles" | "total",
    field:
      | "reportOuverture"
      | "amortissementsDiffresExercice"
      | "imputationAnterieure"
      | "totalReportNonImpute",
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
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
      pdf.save("t1_ter_amortissements_diffres.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T1 TER - Tableau des amortissements différés en période déficitaire
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
          T1 TER - TABLEAU DE SUIVI DES AMORTISSEMENTS DÉDUCTIBLES REPUTÉS
          DIFFÉRÉS EN PÉRIODE DÉFICITAIRE
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-left w-80">
                  RUBRIQUES
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Report des amortissements antérieurement différés à
                  l'ouverture
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Amortissements différés de l'exercice
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Imputation sur l'exercice antérieurement différés
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Total du report des amortissements antérieurement différés non
                  imputés
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Immobilisations incorporelles */}
              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Immobilisations incorporelles
                </td>
                {[
                  "reportOuverture",
                  "amortissementsDiffresExercice",
                  "imputationAnterieure",
                  "totalReportNonImpute",
                ].map((field) => (
                  <td
                    key={field}
                    className="border border-gray-600 p-2 text-right"
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={
                          data.incorporelles[
                            field as keyof typeof data.incorporelles
                          ]
                        }
                        onChange={(e) =>
                          handleDataChange(
                            "incorporelles",
                            field as any,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(
                        data.incorporelles[
                          field as keyof typeof data.incorporelles
                        ]
                      ).toLocaleString("fr-FR")
                    )}
                  </td>
                ))}
              </tr>

              {/* Immobilisations corporelles */}
              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Immobilisations corporelles
                </td>
                {[
                  "reportOuverture",
                  "amortissementsDiffresExercice",
                  "imputationAnterieure",
                  "totalReportNonImpute",
                ].map((field) => (
                  <td
                    key={field}
                    className="border border-gray-600 p-2 text-right"
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={
                          data.corporelles[
                            field as keyof typeof data.corporelles
                          ]
                        }
                        onChange={(e) =>
                          handleDataChange(
                            "corporelles",
                            field as any,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      Number(
                        data.corporelles[field as keyof typeof data.corporelles]
                      ).toLocaleString("fr-FR")
                    )}
                  </td>
                ))}
              </tr>

              {/* Total général */}
              <tr className="total-row font-bold">
                <td className="border border-gray-600 p-2 pl-8">TOTAL</td>
                {[
                  "reportOuverture",
                  "amortissementsDiffresExercice",
                  "imputationAnterieure",
                  "totalReportNonImpute",
                ].map((field) => (
                  <td
                    key={field}
                    className="border border-gray-600 p-2 text-right"
                  >
                    {Number(
                      data.total[field as keyof typeof data.total]
                    ).toLocaleString("fr-FR")}
                  </td>
                ))}
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

export default T1Ter;

