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
        pdf.save("tableau_24_dotations.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    {
      section:
        "68 Dotations de l'exercice aux comptes d'amortissements et de provisions",
      bold: true,
    },
    {
      section:
        "680 Dotations aux amortissements des frais d'établissement et de développement",
      bold: true,
    },
    { label: "6800 Frais de constitution" },
    { label: "6801 Frais d'établissement" },
    {
      label:
        "6802 Frais d'aug. du capital ou de fonds d'établ. ou de fonds social compl.",
    },
    { label: "6803 Frais d'émissions d'obligations" },
    { label: "6804 Frais d'acquisition des immobilisations" },
    {
      label:
        "6805 Primes de remboursement des obligations émises par l'entreprise",
    },
    { label: "6809 Frais d'acquisition des immobilisations d'exploitation" },
    {
      section: "681 Dotations aux amortissements des immobilisations",
      bold: true,
    },
    { label: "6812 Immeubles batis" },
    { label: "6813 Parcs et actions de sociétés immobilières" },
    { label: "6814 Matériel" },
    { label: "6815 Matériel de transport" },
    { label: "6816 Autres immobilisations corporelles" },
    { label: "6819 Immobilisation d'exploitation" },
    {
      section: "685 Dotations aux amortissements pour pertes et charges",
      bold: true,
    },
    {
      label:
        "6850 Provisions pour avances de commissions reçues des réassureurs",
    },
    { label: "6852 Pour litiges et autres risques" },
    { label: "6857 Pour charges à répartir sur plusieurs exercices" },
    { label: "6858 Pour régimes de prévoyance du personnel" },
    {
      section:
        "689 Dotations aux provisions pour dépréciation des comptes de tiers",
      bold: true,
    },
    { label: "6890 Réassureurs, cédants coassureurs" },
    { label: "6891 Agents, courtiers, producteurs, assurés" },
    { label: "6895 Filiales" },
    { label: "6899 Débiteurs divers" },
    { section: "69 Charges par nature à l'étranger", bold: true },
    { section: "690 Prestations", bold: true },
    { label: "6901 Affaires directes vie" },
    { label: "6902 Affaires directes dommages, RC et risques divers" },
    { label: "6904 Acceptations vie" },
    { label: "6905 Acceptations dommages, RC et risques divers" },
    { label: "6909 Part des réassureurs dans les prestations et frais" },
    { section: "691 Frais de personnel", bold: true },
    {
      label:
        "6910 Salaires et appointements du personnel administratif et charges connexes",
    },
    {
      label:
        "6912 Salaires et rémunérations du personnel de production et charges connexes",
    },
    { label: "6913 Indemnités et avantages divers en espèces" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 24 - Dotations et Charges
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
        <div className="text-center font-bold text-lg mb-4">24</div>

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

