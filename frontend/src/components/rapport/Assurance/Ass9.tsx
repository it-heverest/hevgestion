import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Ass9: React.FC = () => {
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
        pdf.save("tableau_27_charges_produits_etranger.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "776 Intérêts des comptes courants et des comptes de dépôts débiteurs", bold: true },
    { label: "7760 Comptes courants avec les cessionnaires et rétrocessionnaires" },
    { label: "7761 Comptes courants avec les cédants et rétrocessionnaires" },
    { label: "7764 Autres comptes débiteurs" },
    { label: "7765 Intérêts bancaires" },
    { label: "7767 Dépôts espèces effectués chez les cédants" },
    { label: "7769 Autres dépôts" },
    { section: "777 Jetons de présence, tantièmes, rémunération d'administrateurs", bold: true },
    { section: "778 Autres produits financiers", bold: true },
    { section: "779 Ajustement des valeurs effectuées à la représentation des travaux faits par l'entreprise pour elle-même. Charges non imputables à l'exploitation de l'exercice", bold: true },
    { section: "780 Travaux faits par l'entreprise pour elle-même", bold: true },
    { section: "785 Charges non imputables à l'exploitation de l'exercice", bold: true },
    { label: "7850 Charges couvertes par les provisions" },
    { label: "7857 Charges imputables à pertes et profits" },
    { section: "79 PRODUITS PAR NATURE A L'ETRANGER", bold: true },
    { section: "790 Primes", bold: true },
    { label: "7901 Affaires directes vie" },
    { label: "7902 Affaires directes dommages, RC et risques divers" },
    { label: "7904 Acceptations vie" },
    { label: "7905 Acceptations dommages, RC et risques divers" },
    { label: "7909 Part des réassureurs dans les primes" },
    { section: "791 Subvention d'exploitation reçues", bold: true },
    { section: "793 Réductions et ristournes de primes", bold: true },
    { section: "794 Ristournes, rabais et remises obtenus", bold: true },
    { section: "795 Commissions et participations reçues des réassureurs", bold: true },
    { section: "796 Produits accessoires", bold: true },
    { section: "797 Produits financiers", bold: true },
    { label: "7971 Revenus des immeubles" },
    { label: "7973 Revenus des titres de placement" },
    { label: "7974 Intérêts des prêts" },
    { label: "7975 Revenus des titres de participation" },
    { label: "7976 Intérêts des comptes courants et des comptes de dépôts débiteurs" },
    { label: "7977 Jetons de présence, tantième, rémunérations d'administrateurs" },
    { label: "7978 Autres produits financiers" },
    { section: "799 Travaux faits par l'entreprise pour elle-même, charges non imputables à l'exploitation de l'exercice", bold: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 27 - Charges et Produits à l'Étranger
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white ${isEditing ? "bg-green-600" : "bg-orange-600"}`}
          >
            {isEditing ? <> <Save size={18} /> Sauvegarder </> : <> <Pencil size={18} /> Éditer </>}
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div ref={reportRef} className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200">
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
        <div className="text-center font-bold text-lg mb-4">27</div>

        {/* Header fields */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Dénomination sociale de l'entreprise :</span>
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
            <span className="border-b border-dotted border-gray-400 w-16 text-center">12</span>
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
              <th className="border border-gray-400 p-1 text-center">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={row.bold ? "medium-gray font-bold" : ""}>
                <td className="border border-gray-400 p-1 pl-4">{row.section || row.label}</td>
                <td className="border border-gray-400 p-1 text-right black-bg">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ass9;

