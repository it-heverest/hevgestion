import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const impot22: React.FC = () => {
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
        pdf.save("tableau_impot_resultat.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau de Détermination de l'Impôt sur le Résultat
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
              isEditing ? "bg-green-600" : "bg-orange-600"
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded"
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
          .medium-gray {
            background-color: #808080;
            color: white;
          }
          .light-gray {
            background-color: #c0c0c0;
          }
          .dark-gray {
            background-color: #404040;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">13</div>

        {/* Header fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-bold">
              Dénomination sociale de l'entreprise :
            </span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Exercice clos le :</span>
            <div className="border-b border-dotted border-black mt-1 h-8 inline-block w-64"></div>
          </div>
          <div>
            <span className="font-bold">Sigle usuel :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="ml-4 font-bold">12</span>
          </div>
          <div>
            <span className="font-bold">Adresse géographique :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div></div>
          <div>
            <span className="font-bold">Numéro d'identification :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold text-white mb-6">
          TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT
        </div>

        {/* REPORT DU BÉNÉFICE FISCAL */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          REPORT DU BÉNÉFICE FISCAL DE L'EXERCICE
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={5}
              ></th>
              <th className="border border-black p-2 text-center">MONTANTS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-4" colSpan={6}></td>
            </tr>
          </tbody>
        </table>

        {/* DÉDUCTION PAR SUITE DE RÉINVESTISSEMENTS ANTÉRIEURS */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          DÉDUCTION PAR SUITE DE RÉINVESTISSEMENTS ANTÉRIEURS
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-left">INTITULÉS</th>
              <th className="border border-black p-2 text-center">Ligne</th>
              <th className="border border-black p-2 text-center">Année N-3</th>
              <th className="border border-black p-2 text-center">Année N-2</th>
              <th className="border border-black p-2 text-center">Année N-1</th>
              <th className="border border-black p-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                Réinvestissements admis et reportés
              </td>
              <td className="border border-black p-2 text-center">02</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">
                Total ligne 4
              </td>
            </tr>
            {/* More rows */}
            <tr>
              <td className="border border-black p-2 pl-8">
                Réinvestissements reportables = 2 x (ligne 3 - ligne 4)
              </td>
              <td className="border border-black p-2 text-center">05</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right"></td>
            </tr>
          </tbody>
        </table>

        {/* DÉDUCTION DES RÉINVESTISSEMENTS DE L'EXERCICE */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          DÉDUCTION DES RÉINVESTISSEMENTS DE L'EXERCICE
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                Réinvestissements admis
              </td>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Réinvestissements déductibles = 50% ligne 6
              </td>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Réinvestissements déductibles = 50% ligne 7
              </td>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2 text-right">
                Total ligne 8
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Réinvestissements reportables = 2 x (ligne 7 - ligne 8)
              </td>
              <td className="border border-black p-2 text-center">9</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* IMPUTATION DES REPORTS DÉFICITAIRES */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          IMPUTATION DES REPORTS DÉFICITAIRES
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                Déficits reportés
              </td>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2 text-center">Année N-4</td>
              <td className="border border-black p-2 text-center">Année N-3</td>
              <td className="border border-black p-2 text-center">Année N-2</td>
              <td className="border border-black p-2 text-center">Année N-1</td>
              <td className="border border-black p-2 text-right">
                Total ligne 11
              </td>
            </tr>
            {/* Rows */}
          </tbody>
        </table>

        {/* BÉNÉFICE FISCAL DÉFINITIF */}
        <div className="dark-gray py-1 text-center font-bold text-white mb-2">
          BÉNÉFICE FISCAL DÉFINITIF (Total ligne 1, 4, 8 et 11)
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">13</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* CALCUL DE L'IMPÔT SUR LE BÉNÉFICE FISCAL DÉFINITIF */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          CALCUL DE L'IMPÔT SUR LE BÉNÉFICE FISCAL DÉFINITIF
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-left">INTITULÉS</th>
              <th className="border border-black p-2 text-center">Base</th>
              <th className="border border-black p-2 text-center">Taux</th>
              <th className="border border-black p-2 text-center">Ligne</th>
              <th className="border border-black p-2 text-center">Montants</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                Impôt sur les sociétés
              </td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-center">30,00%</td>
              <td className="border border-black p-2 text-center">14</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* More rows */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">TOTAL DE L'IMPÔT</td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-center">20</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* Compte 85 */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          Compte 85 : Impôts sur le résultat
        </div>
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-left">Rubriques</th>
              <th className="border border-black p-2 text-center">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                Impôts sur les bénéfices de l'exercice
              </td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* More rows */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">Total</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default impot22;

