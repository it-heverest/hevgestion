import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CF2Ter: React.FC = () => {
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
        pdf.save("cf2_ter_situation_tva.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { line: 1, label: "Crédit de TVA à l'ouverture de l'exercice" },
    { line: 2, label: "Reversement TVA à effectuer" },
    { line: 3, label: "TVA brute" },
    { line: 4, label: "TVA déductible" },
    { line: 5, label: "TVA nette", bold: true },
    { line: 6, label: "TVA versé au cours de l'exercice" },
    {
      line: 7,
      label:
        "Remboursement demandés sur les crédits de TVA validés de l'exercice",
    },
    { line: 8, label: "TVA nette à payer (ligne 5 - ligne 6 - ligne 7 >0)" },
    {
      line: 9,
      label: "Crédit de TVA net à reporter (ligne 6 + ligne 7 - ligne 5 > 0)",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          CF2 Ter - Situation Nette de TVA
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
        <style jsx>{`
          .gray-header {
            background-color: #d3d3d3;
          }
          .dark-gray-header {
            background-color: #a9a9a9;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg">66</div>

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
        <div className="gray-header py-2 text-center font-bold mb-6">
          CF2 TER
          <br />
          SITUATION NETTE DE TVA
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="dark-gray-header">
              <th className="border border-gray-400 p-2 w-[70%]">INTITULES</th>
              <th className="border border-gray-400 p-2 text-center">Lignes</th>
              <th className="border border-gray-400 p-2 text-center">
                MONTANTS
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={row.bold ? "font-bold" : ""}>
                <td className="border border-gray-400 p-2 pl-4">{row.label}</td>
                <td className="border border-gray-400 p-2 text-center">
                  {row.line}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full text-right bg-orange-50 border border-orange-300"
                      defaultValue={0}
                    />
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CF2Ter;

