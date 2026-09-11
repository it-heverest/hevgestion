import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const SommesVerse: React.FC = () => {
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
        pdf.save("tableau_18_versements_tiers.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // Generate 20 empty rows for the first table and 10 for the second
  const emptyRows1 = Array(20).fill(null);
  const emptyRows2 = Array(10).fill(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 18 - Versements aux Tiers
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
            background-color: #c0c0c0;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">18</div>

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
            <span className="font-bold">Adresse :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div></div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
        </div>

        {/* First Table - Détails des sommes versées aux tiers */}
        <div className="medium-gray py-2 text-center font-bold mb-4">
          Détails des sommes versées aux tiers
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-12">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-2">
                Noms des bénéficiaires
              </th>
              <th className="border border-gray-400 p-2">Adresse</th>
              <th className="border border-gray-400 p-2">
                Nature de la transaction
              </th>
              <th className="border border-gray-400 p-2">
                Numéro de comptabilité
              </th>
              <th className="border border-gray-400 p-2">Montant</th>
            </tr>
          </thead>
          <tbody>
            {emptyRows1.map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-400 p-2 h-10"></td>
                <td className="border border-gray-400 p-2 h-10"></td>
                <td className="border border-gray-400 p-2 h-10"></td>
                <td className="border border-gray-400 p-2 h-10"></td>
                <td className="border border-gray-400 p-2 h-10"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Second Table - Bénéficiaires des loyers versés */}
        <div className="medium-gray py-2 text-center font-bold mb-4">
          Bénéficiaires des loyers versés
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-2" rowSpan={2}>
                Noms et adresses des bénéficiaires
              </th>
              <th
                colSpan={5}
                className="border border-gray-400 p-2 text-center"
              >
                Références des baux et avenants
              </th>
              <th className="border border-gray-400 p-2" rowSpan={2}>
                Montant du bail
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-2 text-center"
              >
                Règlement des droits de bail
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-2">
                N° d'enregistrement
              </th>
              <th className="border border-gray-400 p-2">Vol.</th>
              <th className="border border-gray-400 p-2">Folio</th>
              <th className="border border-gray-400 p-2">Case</th>
              <th className="border border-gray-400 p-2">Période du</th>
              <th className="border border-gray-400 p-2">au</th>
              <th className="border border-gray-400 p-2">Date</th>
              <th className="border border-gray-400 p-2">N° recu</th>
              <th className="border border-gray-400 p-2">Montant</th>
            </tr>
          </thead>
          <tbody>
            {emptyRows2.map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
                <td className="border border-gray-400 p-2 h-12"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SommesVerse;

