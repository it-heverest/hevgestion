import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const Ass2: React.FC = () => {
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
        pdf.save("tableau_20_frais_personnel_impots.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "610 FRAIS DE PERSONNEL DANS LE PAYS CONCERNE", bold: true },
    { label: "610 Salaires et appointements du personnel administratif" },
    { label: "6100 Salaires" },
    { label: "6103 Heures supplémentaires" },
    { label: "6105 Primes imposées par la loi ou convention collective" },
    { label: "6106 Autres primes" },
    { label: "6107 Gratifications" },
    { section: "612 Rémunération du personnel de production", bold: true },
    { section: "613 Indemnités et avantages divers en espèces", bold: true },
    { section: "615 Rémunération des administrateurs", bold: true },
    {
      section: "616 Charges connexes aux salaires et appointements",
      bold: true,
    },
    {
      label:
        "6160 Charges connexes aux salaires et appointements du personnel administratif",
    },
    {
      label:
        "6162 Charges connexes aux rémunérations du personnel administratif",
    },
    { section: "617 Charges de sécurité sociale", bold: true },
    {
      label:
        "6170 Cotisations de Sécurité sociale sur salaires et appointements",
    },
    {
      label:
        "6172 Cotisations de Sécurité sociale sur rémunérations du personnel de production",
    },
    { label: "6175 Cotisations aux régimes de prévoyance et retraites" },
    { label: "6176 Prestations diverses" },
    { label: "6178 Cotisations aux fonds de chômage" },
    { section: "618 Autres charges sociales", bold: true },
    { label: "6181 Œuvres sociales" },
    { label: "6188 Comité d'entreprise" },
    { section: "62 IMPOTS ET TAXES DANS LE PAYS", bold: true },
    { section: "620 Taxes et impôts directs", bold: true },
    { label: "6200 Taxe professionnelle" },
    { label: "6201 Impôts fonciers et taxes foncières" },
    { label: "6203 Autres taxes municipales et départementales" },
    { label: "6206 Taxe d'apprentissage" },
    {
      label:
        "6207 Taxe sur les salaires ou appointements du personnel administratif",
    },
    { label: "6208 Taxe sur les rémunérations du personnel de production" },
    { label: "6209 Taxe sur les excédents de provisions pour sinistres" },
    { section: "622 Taxes et impôts indirects", bold: true },
    { label: "622000 Taxe spéciale sur les revenus" },
    { label: "622100 Taxe sur le chiffre d'affaires" },
    { section: "624 Impôts, taxes et droits d'enregistrement", bold: true },
    { label: "6240 Droits d'enregistrement des actes et marchés" },
    { label: "6241 Timbre fiscal" },
    { section: "625 Droits de douane", bold: true },
    {
      section: "626 Taxes perçues par les organismes publics internationaux",
      bold: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 20 - Frais de Personnel et Impôts
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
        <div className="text-center font-bold text-lg mb-4">20</div>

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
            <span className="font-bold">N° Identification unique (NIU) :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-left w-[70%]"></th>
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

export default Ass2;

