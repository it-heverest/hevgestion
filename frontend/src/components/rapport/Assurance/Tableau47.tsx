import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, Check, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tableau47: React.FC = () => {
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
        pdf.save("tableau_47_controle_remplissage.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // Dummy data for checkboxes (in real app, this would be state)
  const checks = Array(30).fill(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 47 - Contrôle de Remplissage
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">47</div>

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
          <div className="flex-2">
            <span className="font-bold">Sigle usuel :</span>
            <span className="border-b border-dotted border-gray-400 flex-1 ml-2"></span>
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
        <div className="py-2 text-center font-bold text-lg mb-6">
          CONTROLE DE REMPLISSAGE
        </div>

        {/* Attention note */}
        <div className="mb-4 text-[10px] border border-gray-600 p-2">
          <strong>ATTENTION :</strong>
          <br />
          1) Veuillez fournir en annexe tous les détails des comptes de la
          classe n°13 selon les stipulations du Plan comptable OHADA;
          <br />
          2) Veuillez également cocher les tableaux que vous avez remplis.
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-2 text-center w-[10%]">
                N°
              </th>
              <th className="border border-gray-400 p-2 text-left">Tableaux</th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Contrôle
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 text-center">1-3</td>
              <td className="border border-gray-400 p-2 pl-4">
                Fiche d'identification et renseignements divers
              </td>
              <td className="border border-gray-400 p-2 text-center">
                <div className="w-6 h-6 border-2 border-gray-600 mx-auto"></div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 text-center">4</td>
              <td className="border border-gray-400 p-2 pl-4">
                Liste des établissements de l'entreprise en fin d'exercice et
                Structure de l'activité par établissement
              </td>
              <td className="border border-gray-400 p-2 text-center">
                <div className="w-6 h-6 border-2 border-gray-600 mx-auto"></div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 text-center">5-6</td>
              <td className="border border-gray-400 p-2 pl-4">
                Bilan (système normal)
              </td>
              <td className="border border-gray-400 p-2 text-center">
                <div className="w-6 h-6 border-2 border-gray-600 mx-auto"></div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 text-center">7-9</td>
              <td className="border border-gray-400 p-2 pl-4">
                Compte de résultat (système normal) et Compte de Perte & Profit
              </td>
              <td className="border border-gray-400 p-2 text-center">
                <div className="w-6 h-6 border-2 border-gray-600 mx-auto"></div>
              </td>
            </tr>
            {/* Add more rows as needed */}
            <tr>
              <td className="border border-gray-400 p-2 text-center">46</td>
              <td className="border border-gray-400 p-2 pl-4">
                Avances et crédits aux Associés et Dirigeants
              </td>
              <td className="border border-gray-400 p-2 text-center">
                <div className="w-6 h-6 border-2 border-gray-600 mx-auto"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tableau47;

