import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CF1Bis: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("cf1_bis_impot_benefice.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          CF1 Bis - Détermination de l'Impôt sur le Bénéfice Fiscal
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
              isEditing ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {isEditing ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarder{" "}
              </>
            ) : (
              <>
                {" "}
                <Pencil size={18} /> Éditer{" "}
              </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style jsx>{`
          .light-gray {
            background-color: #d3d3d3;
          }
          .medium-gray {
            background-color: #c0c0c0;
          }
          .dark-gray {
            background-color: #a9a9a9;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">61</div>

        {/* Standard header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            <span className="border-b border-dotted border-gray-400 w-32 text-center"></span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="border-b border-dotted border-gray-400 w-16 text-center"></span>
          </div>
        </div>

        {/* Title */}
        <div className="light-gray py-2 text-center font-bold mb-6">
          CF1 BIS
          <br />
          TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT : IMPOT SUR LE
          BENEFICE FISCAL
        </div>

        {/* Report du bénéfice fiscal */}
        <div className="medium-gray py-1 text-center font-bold mb-2">
          REPORT DU BENEFICE FISCAL DE L'EXERCICE
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th
                className="border border-gray-400 p-1 text-center"
                colSpan={5}
              ></th>
              <th className="border border-gray-400 p-1 text-center">
                MONTANT
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-2" colSpan={5}>
                Intitulés
              </td>
              <td className="border border-gray-400 p-1 text-center">1</td>
            </tr>
          </tbody>
        </table>

        {/* Déduction par suite de réinvestissements antérieurs */}
        <div className="medium-gray py-1 text-center font-bold mb-2">
          DEDUCTION PAR SUITE DE REINVESTISSEMENTS ANTERIEURS
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1">Intitulés</th>
              <th className="border border-gray-400 p-1 text-center">ligne</th>
              <th className="border border-gray-400 p-1 text-center">
                Année N-3
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Année N-2
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Année N-1
              </th>
              <th className="border border-gray-400 p-1 text-center"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissement admis et reportés
              </td>
              <td className="border border-gray-400 p-1 text-center">2</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissement
              </td>
              <td className="border border-gray-400 p-1 text-center">3</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissement effectivement déduits
              </td>
              <td className="border border-gray-400 p-1 text-center">4</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">
                Total ligne
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissement reportables=2*(ligne7 - ligne 8)
              </td>
              <td className="border border-gray-400 p-1 text-center">5</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>

        {/* Déduction des réinvestissements de l'exercice */}
        <div className="medium-gray py-1 text-center font-bold mb-2">
          DEDUCTION DES REINVESTISSEMENTS DE L'EXERCICE
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissements admis
              </td>
              <td className="border border-gray-400 p-1 text-center">6</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissement déductibles=50%(ligne2
              </td>
              <td className="border border-gray-400 p-1 text-center">7</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissement déductibles=50%(ligne1
              </td>
              <td className="border border-gray-400 p-1 text-center">8</td>
              <td className="border border-gray-400 p-1 text-right">
                Total ligne 8
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Réinvestissements reportables=2*(ligne7 - ligne 8)
              </td>
              <td className="border border-gray-400 p-1 text-center">9</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>

        {/* Imputation des reports déficitaires */}
        <div className="medium-gray py-1 text-center font-bold mb-2">
          IMPUTATION DES REPORTS DEFICITAIRES
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">Déficits</td>
              <td className="border border-gray-400 p-1 text-center">10</td>
              <td className="border border-gray-400 p-1 text-center">
                Année N-4
              </td>
              <td className="border border-gray-400 p-1 text-center">
                Année N-3
              </td>
              <td className="border border-gray-400 p-1 text-center">
                Année N-2
              </td>
              <td className="border border-gray-400 p-1 text-center">
                Année N-1
              </td>
              <td className="border border-gray-400 p-1 text-right">
                Total ligne 11
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Déficits imputés sur l'exercice
              </td>
              <td className="border border-gray-400 p-1 text-center">11</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">Déficits</td>
              <td className="border border-gray-400 p-1 text-center">12</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>

        <div className="dark-gray py-1 text-center font-bold mb-2">
          BENEFICE FISCAL DEFINITIF (total ligne 1, 4, 8 et 11)
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>

        {/* Calcul de l'impôt */}
        <div className="medium-gray py-1 text-center font-bold mb-2">
          CALCUL DE L'IMPOT SUR LE BENEFICE FISCAL DEFINITIF
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1">Intitulés</th>
              <th className="border border-gray-400 p-1 text-center">base</th>
              <th className="border border-gray-400 p-1 text-center">taux</th>
              <th className="border border-gray-400 p-1 text-center">ligne</th>
              <th className="border border-gray-400 p-1 text-center">
                montants
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Impôts sur les sociétés
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center">30%</td>
              <td className="border border-gray-400 p-1 text-center">14</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                IRCM non retenus à la source
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center">15%</td>
              <td className="border border-gray-400 p-1 text-center">15</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Déduction de la IRCM retenue à la source
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center">100%</td>
              <td className="border border-gray-400 p-1 text-center">16</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Autres déductions
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center">100%</td>
              <td className="border border-gray-400 p-1 text-center">17</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Impôt net dû (ligne14 + ligne 15) - (ligne 16 + ligne 17)
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">18</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Centimes additionnels commerciaux
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">19</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr className="dark-gray font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL DE L'IMPOT (ligne 18 + ligne 19)
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">20</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Acomptes versés (report ligne 13 tableau CF1 QUATER col. 6)
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">21</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">Net à payer</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">22</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                Crédit d'impôt
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">23</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>

        {/* Compte 89 */}
        <div className="medium-gray py-1 text-center font-bold mb-2">
          compte 89 : impôts sur le résultat
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1">rubriques</th>
              <th className="border border-gray-400 p-1 text-center">
                montant
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                891 Impôts sur les bénéfices de l'exercice
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                892 Rappel d'impôts sur résultat antérieurs
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                895 Minimum de perception
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-2">
                899 Dégrèvement et annulations d'impôts sur résultats antérieurs
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
            <tr className="font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL</td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF1Bis;

