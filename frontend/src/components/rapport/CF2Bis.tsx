import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CF2Bis: React.FC = () => {
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
        pdf.save("cf2_bis_recap_tva.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const months = [
    "Janvier",
    "Février",
    "Mars(ou 1er trimestre)",
    "Avril",
    "Mai",
    "Juin (ou 2ᵉ trimestre)",
    "Juillet",
    "Août",
    "Septembre (ou 3ᵉ trimestre)",
    "Octobre",
    "Novembre",
    "Décembre (ou 4ᵉ trimestre)",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          CF2 Bis - Récapitulatif des Versements Effectués et Retenues Subies
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
          .dark-gray {
            background-color: #a9a9a9;
          }
          .medium-gray {
            background-color: #c0c0c0;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">65</div>

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
          CF2 BIS
          <br />
          TABLEAU DE REGULATION ANNUELLE DE LA TVA :<br />
          RECAPITULATIF DES VERSEMENTS EFFECTUES ET RETENUS SUBIES
        </div>

        {/* Sub headers */}
        <div className="grid grid-cols-2 mb-4">
          <div className="medium-gray py-1 text-center font-bold border border-black">
            TVA - Déclaration annuelle VERSEMENT EFFECTUES ET RETENUES SUBIES AU
            COURS DE L'EXERCICE
          </div>
          <div className="medium-gray py-1 text-center font-bold border border-black">
            DECLARATION ANNUELLE DES RETENUES
            <br />
            OPEREES SUR FOURNISSEURS
          </div>
        </div>

        {/* Main table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th rowSpan={2} className="border border-gray-400 p-1">
                Période de référence
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Ligne
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Montant du versement
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                No Quittance
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TVA retenues à la source
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TOTAL
                <br />
                6=2+5
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                MONTANT DU
                <br />
                VERSEMENT
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                REFERENCE
                <br />
                QUITTANCE
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">1</th>
              <th className="border border-gray-400 p-1 text-center">2</th>
              <th className="border border-gray-400 p-1 text-center">4</th>
              <th className="border border-gray-400 p-1 text-center">5</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-1 pl-2">{month}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-center"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-center"></td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-300">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL lignes 1 à 12
              </td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF2Bis;

