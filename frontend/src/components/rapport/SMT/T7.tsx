import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const T7DeterminationImpots: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Valeurs modifiables du tableau
  const [values, setValues] = useState({
    reportBeneficeFiscal: "0", // 1

    // Réinvestissements antérieurs
    reinvestAnterieurNmoins3: "0", // ligne 2
    reinvestAnterieurNmoins2: "0", // ligne 3
    reinvestAnterieurNmoins1: "0", // ligne 4
    totalReinvestAnterieur: "0", // 5

    // Réinvestissement exercice
    reinvestExercice: "0", // 7
    baseReduction50: "0", // 8
    reinvestReportable: "0", // 9

    // Reports déficitaires
    reportDeficitaireNmoins4: "0", // 10
    reportDeficitaireNmoins3: "0",
    reportDeficitaireNmoins2: "0",
    reportDeficitaireNmoins1: "0", // total ligne 11
    totalReportsDeficitaires: "0", // total ligne 10+11

    beneficeFiscalDefinitif: "0", // 13

    // Calcul impôt
    impotsSocietesBase: "0",
    impotsSocietesTaux: "30%",
    impotsSocietesMontant: "0", // 30

    ircmNonRetenueBase: "0",
    ircmNonRetenueTaux: "15%",
    ircmNonRetenueMontant: "0", // 31

    autresDeductionsBase: "0",
    autresDeductionsTaux: "100%",
    autresDeductionsMontant: "0", // 32

    centimesAdditionnels: "0", // 33

    totalImpots: "0", // 34
    acomptesVerses: "0", // 35
    netAPayer: "0", // 36
    creditImpot: "0", // 37
    totalCompte89: "0", // 38
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
      pdf.save("t7_determination_impot_resultat.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-700" />
          T7 - Tableau de détermination de l'impôt sur le résultat
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

      {/* Document */}
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
          T7 - TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT : IMPÔT SUR
          LE BÉNÉFICE FISCAL
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-left w-96">
                  RUBRIQUES
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-16">
                  ligne
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-36">
                  MONTANTS
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 1 - Report du bénéfice fiscal */}
              <tr>
                <td className="border border-gray-600 p-2 pl-4 font-bold">
                  REPORT DU BÉNÉFICE FISCAL DE L'EXERCICE
                </td>
                <td className="border border-gray-600 p-2 text-center">1</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reportBeneficeFiscal}
                      onChange={(e) =>
                        handleValueChange(
                          "reportBeneficeFiscal",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    Number(values.reportBeneficeFiscal).toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>

              {/* Réinvestissements antérieurs */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="border border-gray-600 p-2 pl-4">
                  DÉDUCTION PAR SUITE DE RÉINVESTISSEMENTS ANTÉRIEURS
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Réinvestissements admis = 50% × (ligne 2)
                </td>
                <td className="border border-gray-600 p-2 text-center">2</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reinvestAnterieurNmoins3}
                      onChange={(e) =>
                        handleValueChange(
                          "reinvestAnterieurNmoins3",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    Number(values.reinvestAnterieurNmoins3).toLocaleString(
                      "fr-FR"
                    )
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Réinvestissements intermédiaires
                </td>
                <td className="border border-gray-600 p-2 text-center">3</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reinvestAnterieurNmoins2}
                      onChange={(e) =>
                        handleValueChange(
                          "reinvestAnterieurNmoins2",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    Number(values.reinvestAnterieurNmoins2).toLocaleString(
                      "fr-FR"
                    )
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Réinvestissements récents
                </td>
                <td className="border border-gray-600 p-2 text-center">4</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reinvestAnterieurNmoins1}
                      onChange={(e) =>
                        handleValueChange(
                          "reinvestAnterieurNmoins1",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    Number(values.reinvestAnterieurNmoins1).toLocaleString(
                      "fr-FR"
                    )
                  )}
                </td>
              </tr>

              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  TOTAUX
                </td>
                <td className="border border-gray-600 p-2 text-center">5</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {Number(values.totalReinvestAnterieur).toLocaleString(
                    "fr-FR"
                  )}
                </td>
              </tr>

              {/* Réinvestissement exercice */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="border border-gray-600 p-2 pl-4">
                  DÉDUCTION PAR SUITE DE RÉINVESTISSEMENT DE L'EXERCICE
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Réinvestissements admis = 50% × (ligne 7)
                </td>
                <td className="border border-gray-600 p-2 text-center">7</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reinvestExercice}
                      onChange={(e) =>
                        handleValueChange("reinvestExercice", e.target.value)
                      }
                    />
                  ) : (
                    Number(values.reinvestExercice).toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Base de la réduction d'impôt (50%)
                </td>
                <td className="border border-gray-600 p-2 text-center">8</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.baseReduction50}
                      onChange={(e) =>
                        handleValueChange("baseReduction50", e.target.value)
                      }
                    />
                  ) : (
                    Number(values.baseReduction50).toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Réinvestissements reportables (ligne 7 - ligne 8)
                </td>
                <td className="border border-gray-600 p-2 text-center">9</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reinvestReportable}
                      onChange={(e) =>
                        handleValueChange("reinvestReportable", e.target.value)
                      }
                    />
                  ) : (
                    Number(values.reinvestReportable).toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>

              {/* Reports déficitaires */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="border border-gray-600 p-2 pl-4">
                  IMPUTATION DES REPORTS DÉFICITAIRES
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Reports déficitaires N-4
                </td>
                <td className="border border-gray-600 p-2 text-center">10</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.reportDeficitaireNmoins4}
                      onChange={(e) =>
                        handleValueChange(
                          "reportDeficitaireNmoins4",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    Number(values.reportDeficitaireNmoins4).toLocaleString(
                      "fr-FR"
                    )
                  )}
                </td>
              </tr>

              {/* ... Ajouter les autres années déficitaires de la même façon ... */}

              <tr className="total-row">
                <td className="border border-gray-600 p-2 pl-8 font-bold">
                  Total ligne 10 + 11
                </td>
                <td className="border border-gray-600 p-2 text-center">11</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {Number(values.totalReportsDeficitaires).toLocaleString(
                    "fr-FR"
                  )}
                </td>
              </tr>

              {/* Bénéfice fiscal définitif */}
              <tr className="total-row font-extrabold">
                <td className="border border-gray-600 p-2 pl-8">
                  BÉNÉFICE FISCAL DÉFINITIF (total lignes 1, 4, 8 et 11)
                </td>
                <td className="border border-gray-600 p-2 text-center">13</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {Number(values.beneficeFiscalDefinitif).toLocaleString(
                    "fr-FR"
                  )}
                </td>
              </tr>

              {/* Calcul de l'impôt */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="border border-gray-600 p-2 pl-4">
                  CALCUL DE L'IMPÔT SUR LE BÉNÉFICE FISCAL DÉFINITIF
                </td>
              </tr>

              <tr>
                <td className="border border-gray-600 p-2 pl-8">
                  Impôts sur les sociétés
                </td>
                <td className="border border-gray-600 p-2 text-center">30</td>
                <td className="border border-gray-600 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={values.impotsSocietesMontant}
                      onChange={(e) =>
                        handleValueChange("impotsSocietesMontant", e.target.value)
                      }
                    />
                  ) : (
                    Number(values.impotsSocietesMontant).toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
              </tr>

              {/* ... Vous pouvez continuer à ajouter les autres lignes d'impôts et déductions de la même façon ... */}

              {/* Total final */}
              <tr className="total-row font-extrabold">
                <td className="border border-gray-600 p-2 pl-8">TOTAL</td>
                <td className="border border-gray-600 p-2 text-center">38</td>
                <td className="border border-gray-600 p-2 text-right font-bold">
                  {Number(values.totalCompte89).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default T7DeterminationImpots;

