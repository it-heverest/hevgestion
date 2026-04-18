import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Versements: React.FC = () => {
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
        pdf.save("tableau_15_versements.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const months = [
    "Janvier",
    "Février",
    "Mars (ou 1ᵉʳ trimestre)",
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
          Tableau 15 - Versements Effectués
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
          .medium-gray {
            background-color: #c0c0c0;
          }
          .dark-gray {
            background-color: #808080;
          }
          .black-bg {
            background-color: #000000;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">15</div>

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
            <span className="font-bold">Adresse :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div></div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold mb-6">
          Versements effectués en cours d'exercice
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th rowSpan={2} className="border border-gray-400 p-1">
                Mois
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
                IS RAS pour le compte de nos fournisseurs et prestataires de
                services
                <br />1
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Acompte sur Impôt sur le Revenu (1,1% du CA)
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Contribution de l'entreprise à la CRTV
                <br />4
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Autres prélèvements
                <br />5
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TOTAL
                <br />
                6=1+2+3+4+5
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">
                Principal
                <br />2
              </th>
              <th className="border border-gray-400 p-1 text-center">
                CCX
                <br />3
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-1 pl-2">{month}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right black-bg">
                  0
                </td>
              </tr>
            ))}
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Totaux lignes 1 à 12
              </td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Versements;

