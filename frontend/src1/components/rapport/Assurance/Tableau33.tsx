import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tableau33: React.FC = () => {
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
        pdf.save("tableau_33_plus_moins_values_cession.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 33 - Plus-values et Moins-values de Cession
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
        <div className="text-center font-bold text-lg mb-4">33</div>

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
          PLUS-VALUES ET DES MOINS-VALUES DE CESSION (1)
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
                className="border border-gray-400 p-1 text-left w-[35%]"
              >
                RUBRIQUES
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
                Montant brut
                <br />A
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                AMORTISSEMENTS PRATIQUES
                <br />B
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                VALEUR COMPTABLE NETTE
                <br />C = A - B
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                PRIX DE CESSION
                <br />D
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                PLUS-VALUE OU MOINS-VALUE
                <br />E = D - C
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">
                FRAIS D'ÉTABLISSEMENT ET DE DEVELOPPEMENT
              </td>
              <td className="border border-gray-400 p-2 text-center">1</td>
              <td className="border border-gray-400 p-2 text-right black-bg">
                0
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Frais d'établissement
              </td>
              <td className="border border-gray-400 p-1 text-center">2</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-8">
                Frais d'acquisition des immobilisations
              </td>
              <td className="border border-gray-400 p-1 text-center">3</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-2 pl-8">
                TOTAL DES FRAIS D'ÉTABLISSEMENT : Lignes 2 & 3
              </td>
              <td className="border border-gray-400 p-2 text-center">4</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            {/* Other sections omitted for brevity, follow the same pattern */}
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-2 pl-8">
                TOTAL DES VALEURS IMMOBILISEES NETTES : Lignes 10, 15 & 19
              </td>
              <td className="border border-gray-400 p-2 text-center">20</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr className="dark-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">TOTAL GENERAL</td>
              <td className="border border-gray-400 p-2 text-center">25</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tableau33;
