import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CF1Quater: React.FC = () => {
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
        pdf.save("cf1_quater_acomptes_impot.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const months = [
    "Janvier",
    "Février",
    "Mars(ou 1ᵉʳ trimestre)",
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
          <FileText className="w-6 h-6 text-orange-600" />
          CF1 Quater - Récapitulatif des Versements d'Acomptes et Retenues
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
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style>{`
          .light-gray {
            background-color: #d3d3d3;
          }
          .medium-gray {
            background-color: #c0c0c0;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">63</div>

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
          CF1 QUATER
          <br />
          TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT : RECAPITULATIF
          DES VERSEMENTS D'ACOMPTES ET DE RETENUES
          <br />
          SUBIES D'IMPOT SUR LES SOCIETES DE L'EXERCICE
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th rowSpan={2} className="border border-gray-400 p-1">
                MOIS
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Ligne
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 p-1 text-center"
              >
                Acomptes versés au titre de l'impôt
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Retenues à la
                <br />
                source sur le CA
                <br />
                subies
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Autres prélèvements
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
                Précomptes sur achats
                <br />1
              </th>
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
                  {index + 1}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-300">
              <td className="border border-gray-400 p-1 pl-2">
                Totaux (ligne 1 à 12)
              </td>
              <td className="border border-gray-400 p-1 text-center">13</td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF1Quater;

