import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const Fiche5: React.FC = () => {
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
        pdf.save("declaration_assurances.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Déclaration Statistique et Fiscale - Sociétés d'Assurances
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
          .dark-green {
            background-color: #008000;
            color: white;
          }
          .light-green {
            background-color: #90ee90;
          }
          .gray-bg {
            background-color: #d3d3d3;
          }
        `}</style>

        {/* CEMAC Header */}
        <div className="text-center font-bold text-lg mb-2">
          COMMUNAUTE ECONOMIQUE ET MONETAIRE
          <br />
          DE L'AFRIQUE CENTRALE
        </div>
        <div className="dark-green py-2 text-center font-bold text-white text-2xl mb-4">
          CEMAC
        </div>

        {/* Cameroon Header */}
        <div className="text-center font-bold text-lg mb-8">
          REPUBLIQUE DU CAMEROUN
          <br />
          PAIX - TRAVAIL - PATRIE
        </div>

        {/* Main Title Box */}
        <div className="border-4 border-black p-4 text-center font-bold text-lg mb-12">
          DECLARATION STATISTIQUE ET FISCALE
          <br />* DES SOCIETES D'ASSURANCES *
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
          <div>
            <span className="font-bold">EXERCICE CLOS LE :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>
          <div></div>

          <div>
            <span className="font-bold">RAISON SOCIALE (DÉNOMINATION) :</span>
            <div className="border-b border-dotted border-black w-full mt-2"></div>
          </div>

          <div>
            <span className="font-bold">SIGLE :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>

          <div>
            <span className="font-bold">FORME JURIDIQUE :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>

          <div>
            <span className="font-bold">RÉGIME FISCAL :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>

          <div>
            <span className="font-bold">AGREMENTS OBTENUS :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>

          <div>
            <span className="font-bold">ADRESSE COMPLÈTE :</span>
            <div className="border-b border-dotted border-black w-full mt-2"></div>
          </div>

          <div>
            <span className="font-bold">DATE DE CRÉATION DE LA L'ENTRE :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>

          <div>
            <span className="font-bold">SYSTEME COMPTABLE :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>
        </div>

        {/* Cachet de l'entreprise */}
        <div className="text-right text-[10px] italic text-gray-600 mt-12">
          CACHET DE L'ENTREPRISE
        </div>

        {/* Footer note */}
        <div className="text-center text-[10px] italic mt-20">
          Retour obligatoire au plus tard le 15 mars
        </div>
      </div>
    </div>
  );
};

export default Fiche5;

