import React, { useRef } from "react";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

// --- Composant Principal ---
// Page de séparation entre les sections du DSF (sommaire "III. NOTES
// STATISTIQUES A CARACTERE SOCIAL ET ENVIRONNEMENTAL") — pas de données à
// éditer, juste le titre de section centré comme dans le modèle Excel.
const SectionDividerIII: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("section_iii_notes_statistiques_social_environnemental.pdf");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          III. Notes Statistiques à Caractère Social et Environnemental
        </h1>
        <button
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="relative w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl border border-gray-200 overflow-hidden"
        style={{ minHeight: "297mm" }}
      >
        {/* Titre de section, centré verticalement/horizontalement comme dans le modèle */}
        <div className="absolute inset-0 flex items-center justify-center px-16">
          <div className="text-center font-bold text-base leading-relaxed">
            III. NOTES STATISTIQUES A CARACTERE SOCIAL ET ENVIRONNEMENTAL
          </div>
        </div>

        {/* Bandeau orange (droite + bas), identique au cadre des autres pages du DSF */}
        <div className="absolute top-0 right-0 h-full w-6 bg-orange-500" />
        <div className="absolute bottom-0 left-0 w-full h-6 bg-orange-500" />
      </div>
    </div>
  );
};

export default SectionDividerIII;
