import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CF2: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("cf2_calcul_tva.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    // Section I - Base de taxation
    { section: "I", label: "Livraison des biens", line: 1 },
    { section: "", label: "Livraison à soi-même", line: 2 },
    { section: "", label: "Prestations de services", line: 3 },
    { section: "", label: "Prestations à soi-même", line: 4 },
    { section: "", label: "Travaux immobiliers", line: 5 },
    { section: "", label: "Cession d'éléments d'actifs non exonérés", line: 6 },
    { section: "", label: "Locations terrains non aménagés", line: 7 },
    { section: "", label: "Locations locaux nus", line: 8 },
    { section: "", label: "Exportations des produits taxables", line: 9 },
    { section: "", label: "Autres opérations taxables", line: 10 },
    { section: "", label: "Opérations exonérées", line: 11 },
    { section: "", label: "Total des opérations", line: 12 },
    { section: "", label: "Droits d'accises", line: 13 },
    {
      section: "",
      label: "TOTAL DE LA BASE TAXABLE : Totaux lignes 1 à 13",
      line: 14,
      bold: true,
    },
    // Section II - Calcul TVA brute
    { section: "II", label: "Montant de la taxe", line: 15 },
    { section: "", label: "Centimes additionnels", line: 16 },
    {
      section: "",
      label: "TOTAL TVA BRUTE : Totaux lignes 15 et 16",
      line: 17,
      bold: true,
    },
    // Section III - CA ouvrant droit à déduction
    { section: "III", label: "CA ouvrant droit à déduction", line: 18 },
    // Section IV - Déductions
    { section: "IV", label: "Déductions soumises au prorata", line: 19 },
    {
      section: "",
      label: "Sur biens et services ne constituant pas des immobilisations",
      line: 21,
    },
    {
      section: "",
      label: "Sur biens et services constituant des immobilisations",
      line: 22,
    },
    { section: "", label: "Déductions hors prorata", line: null },
    {
      section: "",
      label: "Sur biens et services ne constituant pas des immobilisations",
      line: 23,
    },
    {
      section: "",
      label: "Sur biens et services constituant des immobilisations",
      line: 24,
    },
    { section: "", label: "Complement de TVA à déduire", line: 25 },
    {
      section: "",
      label: "Report de crédit TVA de l'exercice précédent",
      line: 26,
    },
    {
      section: "",
      label: "TOTAL DES DÉDUCTIONS : Totaux lignes 21 à 26",
      line: 27,
      bold: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          CF2 - Calcul de Régularisation Annuelle de la TVA
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
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style jsx>{`
          .light-gray {
            background-color: #d3d3d3;
          }
          .medium-gray {
            background-color: #c0c0c0;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">64</div>

        {/* Standard header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            <span className="border-b border-dotted border-gray-400 w-32 text-center"></span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="border-b border-dotted border-gray-400 w-16 text-center"></span>
          </div>
        </div>

        {/* Title */}
        <div className="light-gray py-2 text-center font-bold mb-6">
          CF2
          <br />
          TABLEAU DE CALCUL DE REGULARISATION ANNUELLE DE LA TVA: CALCUL DE LA
          TVA BRUTE ET DE LA TVA DEDUITE
        </div>

        {/* Sub title */}
        <div className="medium-gray py-1 text-center font-bold mb-4 border border-black">
          TAXE SUR LA VALEUR AJOUTEE - DECLARATION ANNUELLE
        </div>

        {/* Main table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[40%]"
              >
                NATURE DES OPERATIONS
                <br />
                (CHIFFRE D'AFFAIRES HORS TAXE)
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Lignes
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                BASES TAXABLES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                BASES NON TAXABLES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                CUMUL
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">
                TAUX GENERAL
                <br />2
              </th>
              <th className="border border-gray-400 p-1 text-center">
                TAUX ZERO
                <br />3
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={row.bold ? "font-bold" : ""}>
                <td className="border border-gray-400 p-1 pl-4">
                  {row.section && (
                    <span className="font-bold mr-2">{row.section}</span>
                  )}
                  {row.label}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.line || ""}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF2;

