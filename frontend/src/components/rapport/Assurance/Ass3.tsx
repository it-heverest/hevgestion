import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const Ass3: React.FC = () => {
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
        pdf.save("tableau_21_charges_exterieures.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "627 Taxes professionnelles", bold: true },
    { label: "6270 Frais de contrôle" },
    { label: "6279 Taxes diverses" },
    { section: "628 Taxes diverses", bold: true },
    {
      label:
        "6280 Participation aux fonds de garantie à la charge des sociétés",
    },
    {
      label:
        "6281 Contribution au fonds commun de majoration des rentes viagères",
    },
    {
      label:
        "6282 Contribution au fonds de compensation des risques de l'assurance de la construction",
    },
    { label: "6283 Contribution des institutions financières" },
    { label: "6284 Taxe sur certains frais généraux" },
    { label: "6289 Taxes diverses" },
    { section: "63 TRAVAUX, FOURNITURES ET SERVICES EXTERIEURS", bold: true },
    { section: "630 Loyers et charges locatives", bold: true },
    { label: "6300 Terrains d'exploitation" },
    { label: "6302 Immeubles utilisés pour les besoins de l'entreprise" },
    { label: "6306 Matériel et mobilier" },
    { section: "631 Entretien et réparations", bold: true },
    { label: "6310 Entretien des terrains d'exploitation" },
    { label: "6312 Entretien des immeubles utilisés pour l'entreprise" },
    { label: "6316 Entretien et réparation du matériel et du mobilier" },
    { label: "6318 Produits divers d'entretien" },
    { section: "632 Travaux en façon exécutés à l'extérieur", bold: true },
    { label: "6320 Travaux de mécanographie" },
    { label: "6325 Autres travaux" },
    {
      label:
        "6326 Personnel intérimaire non rémunéré directement par l'entreprise",
    },
    { label: "6327 Frais d'apéritif" },
    { section: "633 Mobilier et petit matériel", bold: true },
    { section: "634 Fournitures faites à l'entreprise", bold: true },
    { label: "6340 Electricité" },
    { label: "6341 Eau" },
    { label: "6342 Gaz" },
    { label: "6345 Autres fournitures" },
    { section: "635 Redevances", bold: true },
    {
      section: "636 Etudes, recherches et documentation technique",
      bold: true,
    },
    { section: "637 Rémunérations d'intermédiaires et honoraires", bold: true },
    { section: "638 Primes d'assurances", bold: true },
    { label: "6380 Assurance incendie" },
    { label: "6381 Assurance vol" },
    { label: "6382 Assurance transport" },
    { label: "6383 Assurance RC" },
    { label: "6386 Assurance du personnel au profit de l'entreprise" },
    { label: "6389 Autres Assurances" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 21 - Charges Extérieures
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
          .black-bg {
            background-color: #000000;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">21</div>

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
                EXERCICE
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

export default Ass3;

