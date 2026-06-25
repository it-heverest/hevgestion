import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Ass10: React.FC = () => {
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
        pdf.save("tableau_28_operations_exceptionnelles.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "80 EXPLOITATION GENERALE", bold: true },
    { section: "82 PERTES ET PROFITS SUR EXERCICES ANTERIEURS", bold: true },
    { section: "820 Pertes sur exercices antérieurs", bold: true },
    { label: "8202 Rappel d'impôts" },
    {
      label:
        "8203 Charges diverses imputables à l'exploitation des exercices antérieurs",
    },
    { section: "822 Profits sur exercices antérieurs", bold: true },
    { label: "8220 Rentrees sur créances amorties" },
    { label: "8222 Dégrèvements d'impôts" },
    {
      label:
        "8227 Produits divers imputables à l'exploitation des exercices antérieurs",
    },
    { section: "828 Reprises sur provisions antérieures", bold: true },
    {
      section:
        "829 Utilisation des provisions précédemment constituées pour couvrir des pertes sur exercices antérieurs et des pertes",
      bold: true,
    },
    {
      section:
        "83 Dotation de l'exercice aux comptes de provisions hors exploitation ou exceptionnelles et de réserves réglementaires",
      bold: true,
    },
    { section: "831 Dotation aux réserves diverses à l'étranger", bold: true },
    { section: "833 Dotation aux réserves réglementaires", bold: true },
    {
      label:
        "8330 Réserve pour remboursement de l'emprunt pour fonds d'établissement",
    },
    { label: "8331 Fonds d'établissement constitué" },
    { label: "8332 Réserve pour fluctuation de change" },
    { section: "839 Dotation aux provisions pour dépréciation", bold: true },
    { label: "8391 Sur immeuble" },
    { label: "8392 Sur obligations" },
    { label: "8393 Sur actions" },
    { label: "8399 Sur créances diverses" },
    { label: "8395 Sur obligations" },
    { section: "84 PERTES ET PROFITS EXCEPTIONNELS", bold: true },
    { section: "840 Moins values sur cessions d'éléments d'actif", bold: true },
    { label: "8400 Dans le pays" },
    { label: "8403 Etranger" },
    { section: "841 Pertes de change", bold: true },
    { label: "8411 Pertes sur cessions de monnaies étrangères" },
    { label: "8414 Pertes sur conversion de monnaies étrangères" },
    {
      section: "842 Calcul des résultats sur cessions d'éléments d'actif",
      bold: true,
    },
    { label: "8421 Immobilisations dans le pays" },
    { label: "8422 Immobilisations en cours dans le pays" },
    { label: "8423 Valeurs mobilières détenues dans le pays" },
    { label: "8424 Titres de participation dans le pays" },
    { label: "8429 Valeurs immobilisées à l'étranger" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 28 - Opérations Exceptionnelles
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
        <style jsx>{`
          .medium-gray {
            background-color: #c0c0c0;
          }
          .black-bg {
            background-color: #000000;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">28</div>

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
            <span className="font-bold">NIU :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-left w-[70%]"></th>
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

export default Ass10;

