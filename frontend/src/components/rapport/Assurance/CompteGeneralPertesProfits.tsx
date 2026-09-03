import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CompteGeneralPertesProfits: React.FC = () => {
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
        pdf.save("compte_general_pertes_profits.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Compte Général de Pertes et Profits
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
          .dark-gray {
            background-color: #404040;
            color: white;
          }
          .medium-gray {
            background-color: #808080;
            color: white;
          }
          .light-gray {
            background-color: #c0c0c0;
          }
          .diagonal {
            background-image: linear-gradient(
                135deg,
                #808080 25%,
                transparent 25%
              ),
              linear-gradient(225deg, #808080 25%, transparent 25%),
              linear-gradient(315deg, #808080 25%, transparent 25%),
              linear-gradient(45deg, #808080 25%, transparent 25%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">9</div>

        {/* Header fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-bold">
              Dénomination sociale de l'entreprise :
            </span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Exercice clos le :</span>
            <div className="border-b border-dotted border-black mt-1 h-8 inline-block w-64"></div>
          </div>
          <div>
            <span className="font-bold">Sigle usuel :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="ml-4 font-bold">12</span>
          </div>
          <div>
            <span className="font-bold">Adresse :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div></div>
          <div>
            <span className="font-bold">Numéro d'identification :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
        </div>

        {/* Title */}
        <div className="dark-gray py-2 text-center font-bold text-white text-lg mb-6">
          COMPTE GENERAL DE PERTES ET PROFIT : DEBIT
        </div>

        {/* DEBIT Table */}
        <table className="w-full border-collapse border border-black text-[11px] mb-12">
          <thead>
            <tr className="dark-gray">
              <th className="border border-black p-2 text-left" colSpan={2}>
                INTITULES
              </th>
              <th className="border border-black p-2 text-center">
                Exercice
                <br />1
              </th>
              <th className="border border-black p-2 text-center">
                Exercice
                <br />2
              </th>
              <th className="border border-black p-2 text-center">
                Exercice
                <br />
                N-1
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Pertes d'exploitation de l'exercice (80) */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Pertes d'exploitation de l'exercice (80)
              </td>
            </tr>
            {/* Rows with diagonal pattern for some */}
            <tr className="diagonal">
              <td className="border border-black p-2 pl-8">
                Pertes sur exercices antérieurs (820)
              </td>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* More rows... */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">TOTAL</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* CREDIT Title */}
        <div className="dark-gray py-2 text-center font-bold text-white text-lg mb-6">
          COMPTE GENERAL DE PERTES ET PROFITS : CREDIT
        </div>

        {/* CREDIT Table */}
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="dark-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={2}
              ></th>
              <th className="border border-black p-2 text-center">
                Montant
                <br />1
              </th>
              <th className="border border-black p-2 text-center">
                Montant
                <br />2
              </th>
              <th className="border border-black p-2 text-center">
                Exercice
                <br />
                N-1
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Profits d'exploitation de l'exercice (90) */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Profits d'exploitation de l'exercice (90)
              </td>
            </tr>
            {/* Rows */}
            <tr>
              <td className="border border-black p-2 pl-8">
                Profits sur exercices antérieurs (822)
              </td>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* More rows... */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">TOTAL</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompteGeneralPertesProfits;

