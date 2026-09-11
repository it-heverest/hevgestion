import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const Annexe2: React.FC = () => {
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
        pdf.save("detail_cessions_reassurances.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Détail des Cessions (Réassurances Effectuées)
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} /> : <Pencil size={18} />}
          </button>
          <button
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style>{`
          .medium-gray {
            background-color: #d3d3d3;
          }
          .dark-gray {
            background-color: #808080;
            color: white;
          }
        `}</style>

        {/* Header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            <span className="border-b border-dotted border-gray-400 w-32 text-center"></span>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold text-lg mb-6">
          TABLEAU
          <br />
          DETAIL DES CESSIONS (REASSURANCES EFFECTUEES)
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-2 text-left w-[40%]">
                Objets
              </th>
              <th className="border border-gray-400 p-2 text-center">Ligne</th>
              <th className="border border-gray-400 p-2 text-center">
                Montant
              </th>
              <th className="border border-gray-400 p-2 text-center">
                Réassureur
              </th>
              <th className="border border-gray-400 p-2 text-center">Pays</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(28)].map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2 text-center">
                  {i + 1}
                </td>
                <td className="border border-gray-400 p-2 text-right">0</td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2"></td>
              </tr>
            ))}
            <tr className="dark-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">Total</td>
              <td className="border border-gray-400 p-2 text-center"></td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Annexe2;

