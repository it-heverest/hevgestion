import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Fiche3: React.FC = () => {
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
        pdf.save("page_3.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Page 3/4 - Dirigeants et Filiales
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
        `}</style>

        {/* Page number */}
        <div className="text-right font-bold mb-4">PAGE 3/4</div>

        {/* Header fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-bold">
              Dénomination sociale de l'entreprise :
            </span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div>
            <span className="font-bold">Exercice clos le 31-12-</span>
            <div className="border-b border-dotted border-black mt-1 h-8 inline-block w-48 ml-2"></div>
          </div>
          <div>
            <span className="font-bold">Sigle usuel :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div>
            <span className="font-bold">Durée (en mois) :</span>
            <span className="ml-2 font-bold">12</span>
          </div>
          <div>
            <span className="font-bold">Adresse géographique :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div></div>
          <div>
            <span className="font-bold">N° Identification unique (NIU) :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
        </div>

        {/* Dirigeants section */}
        <div className="medium-gray py-2 text-center font-bold mb-4">
          DIRIGEANTS
        </div>

        <table className="w-full border-collapse border border-black text-[11px] mb-8">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2" colSpan={5}>
                Nom et Prénoms
              </th>
              <th className="border border-black p-2">Age</th>
              <th className="border border-black p-2">Sexe</th>
              <th className="border border-black p-2">Nationalité</th>
              <th className="border border-black p-2">Ville</th>
            </tr>
          </thead>
          <tbody>
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 h-10" colSpan={5}></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Actionnaires section */}
        <table className="w-full border-collapse border border-black text-[11px] mb-8">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2" colSpan={2}>
                Nom
              </th>
              <th className="border border-black p-2">Nationalité</th>
              <th className="border border-black p-2">
                Capital
                <br />
                Montant (en F CFA)
              </th>
              <th className="border border-black p-2">%</th>
            </tr>
          </thead>
          <tbody>
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 h-10" colSpan={2}></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Personnel section */}
        <table className="w-full border-collapse border border-black text-[11px] mb-8">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2" colSpan={5}>
                Nom et Prénoms
              </th>
              <th className="border border-black p-2">Age</th>
              <th className="border border-black p-2">Sexe</th>
              <th className="border border-black p-2">Nationalité</th>
              <th className="border border-black p-2">Qualité</th>
            </tr>
          </thead>
          <tbody>
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 h-10" colSpan={5}></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Filiales et Participations */}
        <div className="medium-gray py-2 text-center font-bold mb-4">
          FILIALES ET PARTICIPATIONS
        </div>

        <table className="w-full border-collapse border border-black text-[11px] mb-8">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2">Désignation</th>
              <th className="border border-black p-2">Nationalité</th>
              <th className="border border-black p-2">
                Capital
                <br />
                Montant (en F CFA)
              </th>
              <th className="border border-black p-2">%</th>
            </tr>
          </thead>
          <tbody>
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}
            <tr className="font-bold">
              <td className="border border-black p-2 text-center">TOTAL</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Mouvement du personnel */}
        <div className="medium-gray py-2 text-center font-bold mb-4">
          MOUVEMENT DU PERSONNEL
        </div>

        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2" rowSpan={2}>
                Effectifs
              </th>
              <th className="border border-black p-2 text-center" colSpan={2}>
                Variation de l'exercice
              </th>
              <th className="border border-black p-2 text-center" rowSpan={2}>
                Effectifs
                <br />
                en fin
                <br />
                d'exercice
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-center">
                Entrées
                <br />
                (1)
              </th>
              <th className="border border-black p-2 text-center">
                Sorties
                <br />
                (2)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-4">
                Cadres supérieurs
              </td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-4">
                Techniciens supérieurs et Cadres moyens
              </td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-4">
                Techniciens, agents de maîtrise et ouvriers qualifiés
              </td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-4">
                Employés, manœuvres, ouvriers et apprentis
              </td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
              <td className="border border-black p-2 text-right"></td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black p-2 pl-4">TOTAL</td>
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

export default Fiche3;
