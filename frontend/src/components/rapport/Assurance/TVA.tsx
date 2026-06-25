import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TVA: React.FC = () => {
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
        pdf.save("tableau_16_tva.pdf");
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
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 16 - Déclaration Annuelle TVA
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
          .dotted-bg {
            background-image: linear-gradient(90deg, #000 2%, transparent 2%);
            background-size: 10px 1px;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">16</div>

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
          TAXE SUR LA VALEUR AJOUTEE - DECLARATION ANNUELLE
          <br />
          VERSEMENTS EFFECTUES ET RETENUES SUBIES AU COURS DE L'EXERCICE
        </div>

        {/* Main Table */}
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
                <br />2
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                N° quittance
                <br />3
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                Date de la quittance
                <br />4
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TVA retenue à la source (entreprise collectrice)
                <br />5
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TVA retenue à la source subie
                <br />6
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                TOTAL
                <br />
                7=2+5+6
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-gray-400 p-1 text-center">1</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-1 pl-2">{month}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {33 + index}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-center"></td>
                <td className="border border-gray-400 p-1 text-center"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right black-bg">
                  0
                </td>
              </tr>
            ))}
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAUX lignes 33 à 44
              </td>
              <td className="border border-gray-400 p-1 text-center">45</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-center"></td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* Situation nette de la TVA */}
        <div className="medium-gray py-2 text-center font-bold mt-8 mb-4">
          SITUATION NETTE DE LA TVA
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 pl-4">
                Reversement TVA à effectuer
              </td>
              <td className="border border-gray-400 p-1 text-center">46</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray">
              <td className="border border-gray-400 p-1 pl-4">
                TVA Brute totale
              </td>
              <td className="border border-gray-400 p-1 text-center">47</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray">
              <td className="border border-gray-400 p-1 pl-4">
                TVA déductible
              </td>
              <td className="border border-gray-400 p-1 text-center">48</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray">
              <td className="border border-gray-400 p-1 pl-4">
                TVA nette totale
              </td>
              <td className="border border-gray-400 p-1 text-center">49</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-4">
                TVA retenue à la source subie
              </td>
              <td className="border border-gray-400 p-1 text-center">50</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-4">
                TVA retenue à la source à reverser (entreprises collectrices
                uniquement)
              </td>
              <td className="border border-gray-400 p-1 text-center">51</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-4">
                TVA versée au cours de l'exercice
              </td>
              <td className="border border-gray-400 p-1 text-center">52</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 pl-4">
                TVA nette à payer
              </td>
              <td className="border border-gray-400 p-1 text-center">53</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-gray-400 p-1 pl-4">
                Crédit de TVA net à reporter
              </td>
              <td className="border border-gray-400 p-1 text-center">54</td>
              <td className="border border-gray-400 p-1 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TVA;

