import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Note35: React.FC = () => {
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
        pdf.save("note35_fiche_synthese_indicateurs.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          NOTE 35 - Fiche de synthèse des principaux indicateurs financiers
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
                <Save size={18} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
              </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white p-8 rounded shadow"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">FICHE DE SYNTHÈSE</h2>
            <h3 className="text-md font-semibold">DES PRINCIPAUX INDICATEURS FINANCIERS</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="font-bold">Désignation entité :</span>
              <span className="border-b border-dotted border-gray-400 w-full block mt-1"></span>
            </div>
            <div>
              <span className="font-bold">Exercice clos le 31-12-</span>
              <span className="border-b border-dotted border-gray-400 w-20 inline-block ml-1"></span>
            </div>
            <div>
              <span className="font-bold">Numéro d'identification :</span>
              <span className="border-b border-dotted border-gray-400 w-full block mt-1"></span>
            </div>
            <div>
              <span className="font-bold">Durée (en mois) :</span>
              <span className="border-b border-dotted border-gray-400 w-16 inline-block ml-1"></span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <table className="w-full border-collapse border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left font-bold" rowSpan={2}>
                INDICATEURS
              </th>
              <th className="border border-gray-400 p-2 text-center font-bold" colSpan={2}>
                EXERCICE N
              </th>
              <th className="border border-gray-400 p-2 text-center font-bold" colSpan={2}>
                EXERCICE N-1
              </th>
              <th className="border border-gray-400 p-2 text-center font-bold" colSpan={2}>
                EXERCICE N-2
              </th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-center font-bold w-16">Brut</th>
              <th className="border border-gray-400 p-2 text-center font-bold w-16">Net</th>
              <th className="border border-gray-400 p-2 text-center font-bold w-16">Brut</th>
              <th className="border border-gray-400 p-2 text-center font-bold w-16">Net</th>
              <th className="border border-gray-400 p-2 text-center font-bold w-16">Brut</th>
              <th className="border border-gray-400 p-2 text-center font-bold w-16">Net</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Chiffre d'affaires</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 p-2 font-medium">Résultat d'exploitation</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Résultat financier</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 p-2 font-medium">Résultat exceptionnel</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Résultat net</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 p-2 font-medium">Total bilan</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Fonds propres</td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
              <td className="border border-gray-400 p-2 text-right"></td>
            </tr>
          </tbody>
        </table>

        {/* Ratios */}
        <div className="mb-6">
          <h4 className="font-bold mb-3">RATIOS</h4>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left font-bold">RATIO</th>
                <th className="border border-gray-400 p-2 text-center font-bold">N</th>
                <th className="border border-gray-400 p-2 text-center font-bold">N-1</th>
                <th className="border border-gray-400 p-2 text-center font-bold">N-2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2">Rentabilité des capitaux propres (%)</td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-2">Rentabilité économique (%)</td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">Ratio d'endettement (%)</td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-2">Ratio de liquidité générale</td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">Ratio de solvabilité</td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
                <td className="border border-gray-400 p-2 text-right"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Comment */}
        <div className="mt-6">
          <div className="font-bold mb-2">Commentaire :</div>
          <div className="italic text-[10px] mb-2">
            Commenter les principales évolutions des indicateurs financiers et ratios
          </div>
          <div className="min-h-[6rem] border border-gray-400 p-2 whitespace-pre-wrap">
            {isEditing ? (
              <textarea
                className="w-full h-24 p-2 border border-orange-300 bg-orange-50 resize-none"
                placeholder="Ajouter vos commentaires ici..."
              />
            ) : (
              "Aucun commentaire"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note35;