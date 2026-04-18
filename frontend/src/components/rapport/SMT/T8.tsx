import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const T8: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Valeurs modifiables du tableau principal
  const [values, setValues] = useState({
    reportMinimumPerception: "0", // 1
    reinvestissementAnterieur: "0", // ligne 5 total
    // Réintégrations / Charges
    amortissementNonDeductible: "0", // 3
    provisionsNonDeductibles: "0", // 5
    interetsExcedentaires: "0", // 6
    // ... (vous pouvez ajouter toutes les autres lignes)
    totalReintegration: "0", // 15
    // Déductions
    amortissementAnterieurDiffere: "0", // 18
    fractionNonImposablePlusValues: "0", // 19
    produitNetFilialesDeductible: "0", // 21
    fraisSiegeDeductibles: "0", // 23
    totalDeduction: "0", // 27
    // Résultat fiscal
    beneficeFiscal: "0", // 28
    perteFiscale: "0", // 29
    // Minimum de perception
    minimumPerception: "0", // 30
    // ... autres lignes du minimum
    totalImpotsVerses: "0", // 38
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleValueChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
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
      pdf.save("t8_minimum_perception.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T8 - Tableau de détermination de l'impôt : Minimum de perception
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
                  handleHeaderChange("designationEntite", e.target.value)
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
                  handleHeaderChange("exerciceClosLe", e.target.value)
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
                  handleHeaderChange("numeroIdentification", e.target.value)
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
          T8 - TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT : MINIMUM DE
          PERCEPTION
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-left w-96">
                  RUBRIQUES
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Ligne
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  Montants
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Report minimum perception antérieur */}
              <tr>
                <td className="border border-gray-600 p-2 pl-4 font-bold">
                  REPORT MINIMUM PERCEPTION ANTÉRIEUR (réinvestissement
                  antérieur)
                </td>
                <td className="border border-gray-600 p-2 text-center">1</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reportMinimumPerception}
                      onChange={(e) =>
                        handleValueChange(
                          "reportMinimumPerception",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    Number(values.reportMinimumPerception).toLocaleString(
                      "fr-FR"
                    )
                  )}
                </td>
              </tr>

              {/* Périodes antérieures */}
              <tr className="bg-gray-200">
                <td
                  colSpan={3}
                  className="border border-gray-600 p-2 pl-4 font-bold"
                >
                  PÉRIODES ANTÉRIEURES
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Année N-3 et antérieures - Réinvestissements
                </td>
                <td className="border border-gray-600 p-2 text-center">2</td>
                <td className="border border-gray-600 p-2 text-right">0</td>
              </tr>

              {/* Total réinvestissement antérieur */}
              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  TOTAUX
                </td>
                <td className="border border-gray-600 p-2 text-center">5</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {Number(values.reinvestissementAnterieur).toLocaleString(
                    "fr-FR"
                  )}
                </td>
              </tr>

              {/* Réduction d'impôt par réinvestissement de l'exercice */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="border border-gray-600 p-2 pl-4">
                  RÉDUCTION D'IMPÔT PAR SUITE DE RÉINVESTISSEMENT DE L'EXERCICE
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Base de la réduction d'impôt (I)
                </td>
                <td className="border border-gray-600 p-2 text-center">8</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input type="text" className="edit-input" value="0" />
                  ) : (
                    "0"
                  )}
                </td>
              </tr>

              {/* ... Ajouter toutes les autres lignes de la même façon ... */}

              {/* Total impôt */}
              <tr className="total-row font-extrabold">
                <td className="border border-gray-600 p-2 pl-8">
                  TOTAL DE L'IMPÔT (lignes 32 à 38)
                </td>
                <td className="border border-gray-600 p-2 text-center">39</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  0
                </td>
              </tr>
            </tbody>
          </table>

          {/* Commentaire */}
          <div className="mt-8 px-4">
            <div className="font-bold mb-2">Commentaire :</div>
            <textarea
              className="w-full h-24 p-3 border border-gray-400 rounded bg-gray-50 text-xs resize-y"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Justifier toute variation significative, préciser les pénalités et amendes, etc."
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default T8;

