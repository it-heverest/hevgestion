import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const Ass1: React.FC = () => {
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
        pdf.save("tableau_19_impots_comptabilite.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "601 Prestations échues", bold: true },
    { label: "6011 Sinistres" },
    { label: "6012 Capitaux échus" },
    { label: "6013 Arrérages échus" },
    { label: "6014 Rachats" },
    { label: "6015 Participation aux excédents liquidés" },
    {
      section: "602 Prestations et frais payés (affaires directes dommages)",
      bold: true,
    },
    { label: "6021 Sinistres en principal" },
    { label: "6022 Capitaux constitués de rentes" },
    { label: "6023 Frais après constitution" },
    { label: "6024 Rachats" },
    { label: "6025 Participation aux excédents" },
    { label: "6026 Frais Accessoires" },
    { label: "6029 Recours en principal" },
    { section: "604 Prestations échues (Acceptations vie)", bold: true },
    { label: "6041 Sinistres" },
    { label: "6042 Capitaux échus" },
    { label: "6043 Arrérages échus" },
    { label: "6044 Rachats" },
    { label: "6045 Participation aux excédents" },
    { label: "6046 Retraits de portefeuille" },
    { label: "6048 Entrees de portefeuille" },
    { section: "605 Prestations et frais (Acceptations dommages)", bold: true },
    { label: "6050 Sinistres et frais accessoires nets de recours" },
    { label: "6059 Participation aux excédents" },
    { label: "6059 Retraits de portefeuille" },
    {
      section: "609 Part des réassureurs dans les prestations et frais",
      bold: true,
    },
    { label: "6091 Prestations échues (Affaires directes vie)" },
    { label: "60911 Sinistres" },
    { label: "60912 Capitaux échus" },
    { label: "60913 Arrérages échus" },
    { label: "60914 Rachats" },
    { label: "60915 Participation aux excédents" },
    { label: "60918 Retraits de portefeuille" },
    { label: "60919 Entrées de portefeuille" },
    { label: "6092 Prestations et frais payés (Affaires directes Dommages)" },
    { label: "6094 Prestations et frais payés (Acceptation vie)" },
    { label: "6095 Prestations et frais (Acceptation affaires dommage)" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 19 - Impôts et Comptabilité Nationale
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
          .dark-gray {
            background-color: #808080;
            color: white;
          }
          .black-bg {
            background-color: #000000;
            color: white;
          }
          .dotted-bg {
            background-image: repeating-linear-gradient(
              90deg,
              #000 0,
              #000 2px,
              transparent 2px,
              transparent 4px
            );
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">19</div>

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

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold mb-6">
          INFORMATION COMPLÉMENTAIRE STATISTIQUE
          <br />
          [DIRECTION GENERALE DES IMPOTS (COMPTABILITE NATIONALE)]
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-left w-[60%]"></th>
              <th className="border border-gray-400 p-1 text-center">Ligne</th>
              <th className="border border-gray-400 p-1 text-center">
                MONTANT
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={row.bold ? "medium-gray font-bold" : ""}
              >
                <td className="border border-gray-400 p-1 pl-4">
                  {row.section || row.label}
                </td>
                <td className="border border-gray-400 p-1 text-center"></td>
                <td className="border border-gray-400 p-1 text-right black-bg">
                  0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ass1;

