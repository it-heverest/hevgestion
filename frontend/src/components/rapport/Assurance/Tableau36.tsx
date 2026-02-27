import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tableau36: React.FC = () => {
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
        pdf.save("tableau_36_credit_bail.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 36 - Biens Pris en Crédit Bail et Contrats Assimilés
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
          .medium-gray {
            background-color: #c0c0c0;
          }
          .dark-gray {
            background-color: #808080;
            color: white;
          }
          .light-gray {
            background-color: #d3d3d3;
          }
          .black-bg {
            background-color: #000000;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">36</div>

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
        <div className="medium-gray py-2 text-center font-bold text-lg mb-6">
          BIENS PRIS EN CRÉDIT BAIL ET CONTRATS ASSIMILÉS
        </div>

        {/* Subtitle */}
        <div className="medium-gray py-2 text-center font-bold mb-4">
          SITUATIONS ET MOUVEMENTS
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-left w-[30%]"
              >
                RUBRIQUES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                NATURE DU CONTRAT
                <br />
                (I ; M ; A)
                <br />
                (1)
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Ligne
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                MONTANT BRUT À L'OUVERTURE DE L'EXERCICE
                <br />A
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-1 text-center"
              >
                AUGMENTATIONS
                <br />B
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                DIMINUTIONS
                <br />C
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                MONTANT BRUT À LA CLÔTURE DE L'EXERCICE
                <br />D = A + B - C
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">
                Acquisitions,
                <br />
                Apports,
                <br />
                Créations
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Virements de poste à poste
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Suite à une réévaluation pratiquée au cours de l'exercice
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Cessions
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Virements de poste à poste
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">
                Immobilisations Incorporelles
              </td>
              <td className="border border-gray-400 p-2 text-center"></td>
              <td className="border border-gray-400 p-2 text-center">01</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right black-bg">
                0
              </td>
            </tr>
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">Immeubles</td>
              <td className="border border-gray-400 p-2 text-center"></td>
              <td className="border border-gray-400 p-2 text-center">03</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right black-bg">
                0
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Matériel, mobilier, installation
              </td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">04</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Immobilisations en cours
              </td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center">05</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-2 pl-8">
                Totaux lignes 3 à 5
              </td>
              <td className="border border-gray-400 p-2 text-center"></td>
              <td className="border border-gray-400 p-2 text-center">06</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr className="dark-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">
                Totaux lignes 1 et 6
              </td>
              <td className="border border-gray-400 p-2 text-center"></td>
              <td className="border border-gray-400 p-2 text-center">07</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* Footer note */}
        <div className="mt-4 text-[10px] italic">
          (1) I : Crédit - bail immobilier ; M : Crédit - bail mobilier ; A :
          Autres contrats (dédoubler le poste si montants significatifs)
        </div>
      </div>
    </div>
  );
};

export default Tableau36;
