import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Ass7: React.FC = () => {
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
        pdf.save("tableau_25_charges.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "692 Impôts et taxes", bold: true },
    { label: "6920 Directs" },
    { label: "6921 Indirects" },
    { label: "6927 Taxes professionnelles" },
    { label: "6928 Divers" },
    { section: "693 Travaux fournitures et services extérieurs", bold: true },
    { label: "6930 Loyers, charges locatives, entretien, réparations" },
    { label: "6932 Travaux, mobilier, autres fournitures" },
    { section: "694 Transports et déplacements", bold: true },
    { section: "695 Commissions", bold: true },
    { label: "6950 Affaires directes" },
    { label: "6957 Acceptations" },
    { label: "6958 Amortissements des frais d'acquisition précomptés" },
    { label: "6959 Frais d'acquisition précomptés" },
    { section: "696 Frais divers de gestion", bold: true },
    { section: "697 Frais financiers", bold: true },
    {
      label:
        "6970 Intérêts des emprunts des comptes de crédits créditeurs, intérêts bancaires, commissions sur ouverture de crédit, cautions et avals",
    },
    { label: "6974 Frais de banque, contentieux des placements" },
    { label: "6975 Frais d'achat des titres" },
    {
      label:
        "6976 Intérêts servis à la provision pour participation aux excédents",
    },
    { label: "6977 Autres charges financières" },
    { label: "6978 Frais sur immeubles" },
    {
      section:
        "698 Dotation de l'exercice aux comptes d'amortissements et de provisions",
      bold: true,
    },
    {
      section:
        "699 Amortissements des frais d'établissement et de développement",
      bold: true,
    },
    { section: "699 Amortissements des immobilisations", bold: true },
    { section: "699 Provisions pour pertes et charges", bold: true },
    {
      section: "699 Provisions pour dépréciation des comptes de tiers",
      bold: true,
    },
    { section: "70 PRIMES, ALLOCATIONS", bold: true },
    { section: "701 Primes (Affaires directes vie)", bold: true },
    { label: "7010 Primes périodiques émises" },
    { label: "7011 Primes uniques émises" },
    { label: "7013 Cotisations de polices et accessoires" },
    { label: "7019 Annulations" },
    {
      section: "702 Primes (Affaires directes dommages, RC et risques divers)",
      bold: true,
    },
    { label: "7022 Primes émises" },
    { label: "7023 Cotisations de polices et accessoires" },
    {
      label: "7024 Variation de la provision de primes acquises et non émises",
    },
    { label: "7025 Rappels de cotisations" },
    { label: "7026 Autres rappels de primes" },
    { label: "7029 Annulations" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 25 - Charges et Primes
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
        <div className="text-center font-bold text-lg mb-4">25</div>

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

export default Ass7;
