import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { dsfTemplateService } from "../../services/dsf-template.service";

const Sommaire: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const { selectedFolder } = useApp();
  const folderId = selectedFolder?.id;

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
        pdf.save("sommaire.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Sommaire
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
        <div className="text-center font-bold underline text-lg mb-12">
          SOMMAIRE
        </div>

        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-black p-2 w-[70%] text-left">
                INTITULES
              </th>
              <th className="border border-black p-2 text-center">PAGE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">SOMMAIRE</td>
              <td className="border border-black p-2 text-center"></td>
            </tr>
            {/* Large empty space as in the image */}
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}

            <tr className="bg-gray-200">
              <td className="border border-black p-2 pl-8 font-bold">
                I. INFORMATIONS GENERALES
              </td>
              <td className="border border-black p-2 text-center">1 - 3</td>
            </tr>

            {/* Empty rows for spacing */}
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <tr key={`space1-${i}`}>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}

            <tr className="bg-gray-200">
              <td className="border border-black p-2 pl-8 font-bold">
                II. NOTES STATISTIQUES ET DE SYNTHESES
              </td>
              <td className="border border-black p-2 text-center">4 - 49</td>
            </tr>

            {/* Empty rows for spacing */}
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <tr key={`space2-${i}`}>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}

            <tr className="bg-gray-200">
              <td className="border border-black p-2 pl-8 font-bold">
                III. NOTE STATISTIQUES A CARACTERE SOCIAL ET ENVIRONNEMENTAL
              </td>
              <td className="border border-black p-2 text-center">50 - 57</td>
            </tr>

            {/* Empty rows for spacing */}
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <tr key={`space3-${i}`}>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}

            <tr className="bg-gray-200">
              <td className="border border-black p-2 pl-8 font-bold">
                IV. NOTES STATISTIQUES A CARACTERE COMMERCIAL
              </td>
              <td className="border border-black p-2 text-center">58 - 59</td>
            </tr>

            {/* Larger empty space before section VI */}
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <tr key={`space4-${i}`}>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}

            <tr className="bg-gray-200">
              <td className="border border-black p-2 pl-8 font-bold">
                VI. AUTRES ANNEXES DE TRAITEMENT FISCAUX
              </td>
              <td className="border border-black p-2 text-center">60 - 66</td>
            </tr>

            {/* Remaining empty space at bottom */}
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <tr key={`bottom-${i}`}>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sommaire;


