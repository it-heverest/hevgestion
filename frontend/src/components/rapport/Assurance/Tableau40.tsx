import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tableau40: React.FC = () => {
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
        pdf.save("tableau_40_affectation_resultat.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau 40 - Projet d'Affectation du Résultat
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style jsx>{`
          .medium-gray {
            background-color: #c0c0c0;
          }
          .black-bg {
            background-color: #000000;
            color: white;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">40</div>

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
            <span className="font-bold">Adresse géographique :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div></div>
          <div className="flex gap-2">
            <span className="font-bold">N° Identification unique (NIU) :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold text-lg mb-8">
          PROJET D'AFFECTATION DU RÉSULTAT DE L'EXERCICE
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-left w-[45%]"
              >
                AFFECTATIONS
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
                MONTANT (1)
              </th>
              <th
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                ORIGINES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                MONTANT (1)
              </th>
            </tr>
            <tr className="medium-gray">
              <th
                className="border border-gray-400 p-1 text-center"
                colSpan={2}
              ></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 pl-4">
                Réserve légale
              </td>
              <td className="border border-gray-400 p-2 text-center">01</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 pl-4" colSpan={2}>
                Report à nouveau antérieur (pertes)
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 pl-4">
                Réserves statutaires ou contractuelles
              </td>
              <td className="border border-gray-400 p-2 text-center">02</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 pl-4" colSpan={2}>
                Report à nouveau antérieur (bénéficiaires)
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 pl-4">
                Autres réserves (disponibles)
              </td>
              <td className="border border-gray-400 p-2 text-center">03</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 pl-4" colSpan={2}>
                Résultat net de l'exercice
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 pl-4">
                Dividendes (2)
              </td>
              <td className="border border-gray-400 p-2 text-center">04</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2 pl-4" colSpan={2}>
                Prélèvement sur les réserves
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 pl-4">
                Autres affectations
              </td>
              <td className="border border-gray-400 p-2 text-center">05</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2" colSpan={2}></td>
              <td className="border border-gray-400 p-2 text-right black-bg">
                0
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 pl-4">
                Report à nouveau
              </td>
              <td className="border border-gray-400 p-2 text-center">06</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td className="border border-gray-400 p-2" colSpan={2}></td>
              <td className="border border-gray-400 p-2 text-right black-bg">
                0
              </td>
            </tr>
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-2 pl-4">TOTAL (A)</td>
              <td className="border border-gray-400 p-2 text-center">07</td>
              <td className="border border-gray-400 p-2 text-right">0</td>
              <td
                className="border border-gray-400 p-2 text-center font-bold"
                colSpan={2}
              >
                TOTAL (B)
              </td>
              <td className="border border-gray-400 p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* Footer notes */}
        <div className="mt-6 text-[10px] space-y-1">
          <div>
            (1) Les montants négatifs sont à porter entre parenthèses ou
            précédés d'un signe (-)
          </div>
          <div>
            (2) S'il existe plusieurs catégories d'ayants droit aux dividendes,
            indiquer le montant pour chacune d'elles
          </div>
          <div>
            (3) Indiquer les postes de réserves sur lesquels les prélèvements
            sont effectués
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tableau40;

