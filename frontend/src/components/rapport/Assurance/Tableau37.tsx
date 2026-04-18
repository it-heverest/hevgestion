import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tableau37: React.FC = () => {
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
        pdf.save("tableau_37_echeances_creances.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 37 - Échéances des Créances
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
        <div className="text-center font-bold text-lg mb-4">37</div>

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
          ÉCHEANCES DES CRÉANCES À LA CLÔTURE DE L'EXERCICE
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-left w-[30%]"
              >
                CRÉANCES
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
                MONTANT BRUT
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-1 text-center"
              >
                Analyse par échéance
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-1 text-center"
              >
                Autres analyses
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">
                À un an au plus
              </th>
              <th className="border border-gray-400 p-1 text-center">
                À plus d'un an et à deux au plus
              </th>
              <th className="border border-gray-400 p-1 text-center">
                À plus de deux ans
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Montants en devises
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Montant envers entreprises
              </th>
              <th className="border border-gray-400 p-1 text-center">
                Montant représenté par les effets
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">
                Créance de l'actif immobilisé
              </td>
              <td className="border border-gray-400 p-2 text-center"></td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Titre de participations
              </td>
              <td className="border border-gray-400 p-1 text-center">01</td>
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
                Valeurs mobilières et titres assimilés
              </td>
              <td className="border border-gray-400 p-1 text-center">02</td>
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
                Prêts et effets admis en représentation
              </td>
              <td className="border border-gray-400 p-1 text-center">03</td>
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
                Dépôts et cautionnements
              </td>
              <td className="border border-gray-400 p-1 text-center">04</td>
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
                Totaux lignes 1 à 5
              </td>
              <td className="border border-gray-400 p-2 text-center">06</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            {/* Continue with other sections */}
            <tr className="dark-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">
                Totaux lignes 6 et 20
              </td>
              <td className="border border-gray-400 p-2 text-center">21</td>
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
          (1) Prêts accordés en cours d'exercice : montant ; Remboursements
          obtenus en cours d'exercice : montant.
        </div>
      </div>
    </div>
  );
};

export default Tableau37;

