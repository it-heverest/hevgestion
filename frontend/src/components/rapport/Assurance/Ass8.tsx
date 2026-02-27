import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Ass8: React.FC = () => {
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
        pdf.save("tableau_26_produits.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "704 Primes (acceptations vie)", bold: true },
    { label: "7040 Primes périodiques" },
    { label: "7048 Entrées de portefeuille" },
    { label: "7049 Retraits de portefeuille" },
    {
      section: "705 Primes (acceptations dommages, RC et risques divers)",
      bold: true,
    },
    { label: "7050 Primes" },
    { label: "7058 Entrées de portefeuille" },
    { label: "7059 Retraits de portefeuille" },
    { section: "709 Part des réassureurs dans les primes", bold: true },
    { label: "7091 Affaires directes vie" },
    { label: "7092 Affaires directes dommages, RC et risques divers" },
    { label: "7094 Acceptations vie" },
    { label: "7095 Acceptations dommages, RC et risques divers" },
    { section: "71 Subvention d'exploitation reçues", bold: true },
    {
      section: "73 Réductions et ristournes des primes dans le pays",
      bold: true,
    },
    { section: "74 Ristournes, rabais et remises obtenus", bold: true },
    { section: "75 COMMISSIONS", bold: true },
    { section: "751 Affaires directes vie", bold: true },
    {
      section: "752 Affaires directes dommage, RC et risques divers",
      bold: true,
    },
    { section: "754 Acceptations vie", bold: true },
    { section: "755 Acceptations dommage, RC et risques divers", bold: true },
    { section: "76 Produits accessoires", bold: true },
    {
      section:
        "760 Produits des services exploités dans l'intérêt du personnel",
      bold: true,
    },
    { label: "7601 Cantines" },
    { label: "7603 Divers" },
    { label: "762 Ventes de déchets" },
    { label: "763 Rémunérations de produits divers" },
    { section: "77 Produits financiers", bold: true },
    { section: "773 Revenus des immeubles", bold: true },
    { section: "773 Revenus des titres de placements", bold: true },
    { label: "7731 Revenus des obligations" },
    { label: "7738 Revenus des actions" },
    { section: "774 Intérêts des prêts", bold: true },
    { label: "7740 Au personnel" },
    { label: "7741 Aux agents" },
    { label: "7742 À des tiers" },
    { section: "775 Revenus des titres de participation", bold: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 26 - Produits d'Exploitation
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
        <div className="text-center font-bold text-lg mb-4">26</div>

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

export default Ass8;
