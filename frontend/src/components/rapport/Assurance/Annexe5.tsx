import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Annexe5: React.FC = () => {
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
        pdf.save("droit_timbre_automobile.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const categories = [
    "Véhicules de 02 à 7",
    "Véhicules de 08 à",
    "Véhicules de 14 à",
    "Véhicules de plus",
    "Motocyclette",
  ];

  const rates = [
    "15 000 FCFA",
    "25 000 FCFA",
    "45 000 FCFA",
    "50 000 FCFA",
    "10 000 FCFA",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Droit de Timbre Automobile
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
        {/* Header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            <span className="border-b border-dotted border-gray-400 w-32 text-center"></span>
          </div>
        </div>

        {/* Title */}
        <div className="py-2 text-center font-bold text-lg mb-6 border-b-2 border-t-2 border-gray-400">
          TABLEAU
          <br />
          DROIT DE TIMBRE AUTOMOBILE
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-2 text-left w-[15%]"
              >
                Mois
              </th>
              <th rowSpan={2} className="border border-gray-400 p-2 text-left">
                Libellés
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-2 text-center"
              >
                Nombre
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-2 text-center"
              >
                Taux
                <br />
                (en FCFA)
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-2 text-center"
              >
                Droits
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-2 text-center"
              >
                Pénalités
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-2 text-center"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, monthIndex) => (
              <React.Fragment key={monthIndex}>
                <tr className="font-bold bg-gray-200">
                  <td className="border border-gray-400 p-2" rowSpan={5}>
                    {month}
                  </td>
                  <td className="border border-gray-400 p-2 pl-8">
                    {categories[0]}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">0</td>
                  <td className="border border-gray-400 p-2 text-center">
                    {rates[0]}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 pl-8">
                    {categories[1]}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">0</td>
                  <td className="border border-gray-400 p-2 text-center">
                    {rates[1]}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 pl-8">
                    {categories[2]}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">0</td>
                  <td className="border border-gray-400 p-2 text-center">
                    {rates[2]}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 pl-8">
                    {categories[3]}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">0</td>
                  <td className="border border-gray-400 p-2 text-center">
                    {rates[3]}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 pl-8">
                    {categories[4]}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">0</td>
                  <td className="border border-gray-400 p-2 text-center">
                    {rates[4]}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                  <td className="border border-gray-400 p-2 text-right">0</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="bg-gray-400 font-bold">
              <td className="border border-gray-400 p-2 pl-4" colSpan={4}>
                TOTAL
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Annexe5;

