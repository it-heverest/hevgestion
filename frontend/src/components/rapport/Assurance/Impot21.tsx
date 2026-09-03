import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Impot21: React.FC = () => {
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
        pdf.save("tableau_passage_resultat.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau de Passage du Résultat Comptable Avant Impôt au Résultat
          Fiscal
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
          .black-bg {
            background-color: #000000;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">12</div>

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
        <div className="medium-gray py-2 text-center font-bold text-white mb-6">
          TABLEAU DE PASSAGE DU RESULTAT COMPTABLE AVANT IMPÔT AU RESULTAT
          FISCAL
        </div>

        {/* Main Table */}
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={3}
              ></th>
              <th className="border border-black p-2 text-center">Ligne</th>
              <th className="border border-black p-2 text-center">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Solde du résultat net avant impôt
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Résultat comptable avant impôt
              </td>
              <td className="border border-black p-2 text-center" colSpan={2}>
                Bénéfice net comptable avant impôt
              </td>
              <td className="border border-black p-2 text-center">01</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Résultat comptable avant impôt
              </td>
              <td className="border border-black p-2 text-center" colSpan={2}>
                Perte nette comptable avant impôt
              </td>
              <td className="border border-black p-2 text-center">02</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* Reprises sur amortissements et provisions */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Reprises sur amortissements et provisions
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Provisions non déductibles
              </td>
              <td className="border border-black p-2 text-center">03</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* ... more rows ... */}

            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                Réintégrations : Total lignes 3 à 20
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* Déductions */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Déductions
              </td>
            </tr>
            {/* ... rows ... */}

            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                Total des déductions : Total lignes 24 à 31
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            <tr className="dark-gray font-bold">
              <td className="border border-black p-2 pl-8">Résultat fiscal</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* Impôt sur les bénéfices section at bottom */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Impôt sur les bénéfices
              </td>
            </tr>
            {/* Rows for minimum de perception, etc. */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                Impôt sur les bénéfices
              </td>
              <td className="border border-black p-2 text-center">35</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-center">Base</td>
              <td className="border border-black p-2 text-right">Taux</td>
              <td className="border border-black p-2 text-right">Principal</td>
            </tr>
            {/* More rows for tax calculation */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Impot21;

