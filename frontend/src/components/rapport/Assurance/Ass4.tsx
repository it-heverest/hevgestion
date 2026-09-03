import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Ass4: React.FC = () => {
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
        pdf.save("tableau_22_charges_diverses.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { section: "64 TRANSPORTS ET DEPLACEMENTS", bold: true },
    { section: "640 Transport du Personnel", bold: true },
    { label: "641 Voyages et déplacements" },
    { label: "6410 Inspecteurs producteurs" },
    { label: "6411 Agents généraux" },
    { label: "6413 Autres producteurs" },
    { label: "6414 Personnel administratif" },
    { label: "6415 Autres inspecteurs" },
    { label: "6416 Personnel de direction" },
    { label: "6417 Personnel extérieur" },
    { label: "6418 Administrateurs" },
    { label: "6419 Divers" },
    { section: "648 Transports divers", bold: true },
    { section: "65 COMMISSIONS", bold: true },
    { section: "651 Agents généraux", bold: true },
    { section: "652 Courtiers", bold: true },
    { section: "653 Autres producteurs mandataires", bold: true },
    {
      section:
        "654 Salariés des sociétés pour leurs commissions occasionnelles",
      bold: true,
    },
    {
      section:
        "655 Variation des commissions sur primes acquises et non émises",
      bold: true,
    },
    {
      section:
        "656 Cotisations aux régimes de retraite des producteurs non salariés",
      bold: true,
    },
    { section: "657 Acceptations", bold: true },
    { label: "6574 Vie" },
    { label: "6575 Dommages, RC et risques divers" },
    {
      section: "658 Amortissements des frais d'acquisition précomptés",
      bold: true,
    },
    { section: "659 Frais d'acquisition précomptés", bold: true },
    { section: "66 FRAIS DIVERS DE GESTION", bold: true },
    { section: "660 Publicité et propagandes", bold: true },
    { label: "6600 Annonces et insertions" },
    { label: "6601 Catalogues et imprimés" },
    { label: "6602 Publicité collective" },
    { label: "6605 Foires et expositions" },
    { label: "6608 Cadeaux" },
    { section: "661 Missions et réceptions", bold: true },
    { section: "662 Fournitures de bureau", bold: true },
    { label: "6620 Imprimés et fournitures pour la mécanographie" },
    { label: "6621 Autres imprimés" },
    { label: "6622 Autres fournitures" },
    { section: "663 Documentation générale", bold: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 22 - Charges Diverses
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
        <div className="text-center font-bold text-lg mb-4">22</div>

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

export default Ass4;

