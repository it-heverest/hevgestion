import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DeclarationAnnuel: React.FC = () => {
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
        pdf.save("tableau_17_tva.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 17 - Déclaration Annuelle TVA
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
            background-color: #c0c0c0;
          }
          .dark-gray {
            background-color: #808080;
          }
          .light-gray {
            background-color: #d3d3d3;
          }
          .black-bg {
            background-color: #000000;
            color: white;
          }
          .dotted-bg {
            background-image: repeating-linear-gradient(
              90deg,
              #000 0,
              #000 2px,
              transparent 2px,
              transparent 4px
            );
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">17</div>

        {/* Header fields */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">
              Dénomination sociale de l'entreprise :
            </span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le :</span>
            <span className="border-b border-dotted border-gray-400 w-48 text-center"></span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Sigle usuel :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="border-b border-dotted border-gray-400 w-16 text-center">
              12
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Adresse géographique :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div></div>
          <div className="flex gap-2">
            <span className="font-bold">N° Identification unique (NIU) :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold mb-6">
          TAXE SUR LA VALEUR AJOUTEE - DECLARATION ANNUELLE
        </div>

        {/* Main Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[45%]"
              >
                NATURE DES OPERATIONS
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Ligne
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                BASES TAXABLES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                BASES NON TAXABLES
                <br />4
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                CUMUL
                <br />5
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">
                Taux général
                <br />2
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Taux zéro
                <br />3
              </th>
            </tr>
          </thead>
          <tbody>
            {/* I BASE DE TAXATION */}
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4" colSpan={6}>
                I BASE DE TAXATION
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Prestations de services
              </td>
              <td className="border border-gray-400 p-1 text-center">01</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Intérêts DAT des banques Camerounaises
              </td>
              <td className="border border-gray-400 p-1 text-center">02</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Intérêts des prêts aux tiers
              </td>
              <td className="border border-gray-400 p-1 text-center">03</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Frais d'assistance technique
              </td>
              <td className="border border-gray-400 p-1 text-center">04</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">TSR</td>
              <td className="border border-gray-400 p-1 text-center">05</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Locations locaux nus
              </td>
              <td className="border border-gray-400 p-1 text-center">07</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Intérêts divers
              </td>
              <td className="border border-gray-400 p-1 text-center">08</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Autres opérations taxables (17,5%)
              </td>
              <td className="border border-gray-400 p-1 text-center">09</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Opérations exonérées
              </td>
              <td className="border border-gray-400 p-1 text-center">10</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                TOTAL DES OPERATIONS
              </td>
              <td className="border border-gray-400 p-1 text-center">11</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                Droits d'accises
              </td>
              <td className="border border-gray-400 p-1 text-center">12</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                TOTAL DE LA BASE TAXABLE : Totaux lignes 1 à 13
              </td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                Montant de la taxe (17,5)
              </td>
              <td className="border border-gray-400 p-1 text-center">14</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                Centimes additionnels
              </td>
              <td className="border border-gray-400 p-1 text-center">16</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                Total TVA brute : Total ligne 14
              </td>
              <td className="border border-gray-400 p-1 text-center">17</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                CA ouvrant droit à déduction
              </td>
              <td className="border border-gray-400 p-1 text-center">18</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">CA Total</td>
              <td className="border border-gray-400 p-1 text-center">19</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Prorata de régularisation en fin d'exercice
              </td>
              <td className="border border-gray-400 p-1 text-center">20</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>

            {/* IV DEDUCTIONS */}
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4" colSpan={6}>
                IV DEDUCTIONS
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Sur biens et services ne constituant pas des immobilisations
              </td>
              <td className="border border-gray-400 p-1 text-center">23</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Sur biens et services constituant des immobilisations
              </td>
              <td className="border border-gray-400 p-1 text-center">24</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">Sur sinistres</td>
              <td className="border border-gray-400 p-1 text-center">25</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Complément de TVA à déduire
              </td>
              <td className="border border-gray-400 p-1 text-center">26</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Report de crédit TVA de l'exercice précédent
              </td>
              <td className="border border-gray-400 p-1 text-center">27</td>
              <td className="border border-gray-400 p-1 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-8">
                Total des déductions : Totaux lignes 21 à 26
              </td>
              <td className="border border-gray-400 p-1 text-center">28</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeclarationAnnuel;

