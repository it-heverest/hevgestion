import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Ass5: React.FC = () => {
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
        pdf.save("tableau_23_charges_financieres.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "664 Frais de poste et télécommunications", bold: true },
    { label: "6640 Affranchissements" },
    { label: "6641 Téléphone et télégrammes" },
    { label: "6644 Télex" },
    { label: "6645 Télécopieur" },
    { section: "665 Frais d'actes et de contentieux", bold: true },
    { label: "6650 Frais d'actes" },
    { label: "6655 Frais de contentieux et des primes" },
    { label: "6656 Autres frais de contentieux" },
    { section: "666 Cotisations et dons", bold: true },
    { label: "6660 Cotisations aux organismes professionnels" },
    { label: "6661 Pourboires et étrennes" },
    { label: "6668 Autres cotisations" },
    { label: "6669 Autres dons" },
    {
      section: "667 Frais des conseils et assemblées, jetons de présence",
      bold: true,
    },
    { section: "668 Subventions accordées", bold: true },
    { section: "67 FRAIS FINANCIERS", bold: true },
    {
      section: "670 Intérêts des emprunts contractés par l'entreprise",
      bold: true,
    },
    { label: "6700 Emprunts obligataires" },
    { label: "6702 Autres emprunts" },
    { section: "671 Intérêts des comptes et dépôts créditeurs", bold: true },
    { label: "6710 Comptes courants avec les cédants et rétrocessionnaires" },
    { label: "6714 Autres comptes créditeurs" },
    {
      label:
        "6716 Dépôts espèces effectués par les cessionnaires et rétrocessionnaires",
    },
    { label: "6717 Dépôts des agents" },
    { label: "6718 Autres dépôts" },
    {
      section:
        "672 Intérêts bancaires: commission sur ouverture de crédit, cautions et aval",
      bold: true,
    },
    { section: "673 Escomptes accordés", bold: true },
    { section: "674 Frais de banque et de recouvrement", bold: true },
    { label: "6740 Frais sur titres" },
    { label: "6741 Frais sur effets" },
    { label: "6745 Commissions directes" },
    { label: "6746 Frais de contentieux des placements" },
    { section: "675 Frais d'achat des titres", bold: true },
    {
      section:
        "676 Intérêts serv is à la provision pour participation aux excédents",
      bold: true,
    },
    { section: "677 Autres charges financières", bold: true },
    { section: "678 Frais sur immeubles", bold: true },
    { label: "6780 Entretien" },
    { label: "6785 Réparations" },
    { label: "6789 Autres charges (assurances, gérance...)" },
    {
      section: "679 Ajustement des valeurs affectées à la représentation",
      bold: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 23 - Charges Financières et Diverses
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
        <div className="text-center font-bold text-lg mb-4">23</div>

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

export default Ass5;
