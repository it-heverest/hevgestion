import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tableau46: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("tableau_46_avances_credits.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 46 - Avances et Crédits aux Associés et Dirigeants
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">46</div>

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

        {/* First table - Avances et crédits aux associés et dirigeants sociaux */}
        <div className="mb-8">
          <div className="font-bold text-center mb-4">
            Avances et crédits aux associés et dirigeants sociaux
          </div>
          <table className="w-full border-collapse border border-gray-400 text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 p-2 text-left">
                  Nom et prénom
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Échéance
                </th>
                <th className="border border-gray-400 p-2 text-center">Taux</th>
                <th className="border border-gray-400 p-2 text-center">
                  Terme
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Montant accordé dans
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Montant remboursé dans
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Second table - Conventions conclues */}
        <div className="mb-8">
          <div className="font-bold text-center mb-4">
            Conventions conclues entre l'entreprise et les dirigeants, associés
            ou sociétés liées
          </div>
          <table className="w-full border-collapse border border-gray-400 text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 p-2 text-left">
                  Nom et Prénom ou désignation
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Qualité
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Échéance
                </th>
                <th className="border border-gray-400 p-2 text-center">Taux</th>
                <th className="border border-gray-400 p-2 text-center">
                  Terme
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Montant accordé dans
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Montant remboursé dans
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Third table - Éléments constitutifs du fonds commercial */}
        <div>
          <div className="font-bold text-center mb-4">
            Éléments constitutifs du fonds commercial
          </div>
          <table className="w-full border-collapse border border-gray-400 text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 p-2 text-left">
                  Éléments
                </th>
                <th className="border border-gray-400 p-2 text-center">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 pl-4">Clientèle</td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 pl-4">
                  Achat/landage
                </td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 pl-4">
                  Droit au bail
                </td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 pl-4">
                  Non commercial
                </td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 pl-4">Enseignes</td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 pl-4">Autres</td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
              <tr className="bg-gray-300 font-bold">
                <td className="border border-gray-400 p-2 pl-4">
                  Totaux lignes 1 à 6
                </td>
                <td className="border border-gray-400 p-2 text-right">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tableau46;

