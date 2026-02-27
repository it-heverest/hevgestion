import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Fiche2: React.FC = () => {
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
        pdf.save("fiche_renseignement.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Fiche de Renseignement
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
          .light-orange {
            background-color: #ffd9b3;
          }
          .checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid black;
            display: inline-block;
            margin-right: 8px;
          }
        `}</style>

        {/* Page number */}
        <div className="text-right font-bold mb-4">PAGE 2/4</div>

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

        {/* Title */}
        <div className="text-center font-bold text-lg mb-8 py-2">
          FICHE DE RENSEIGNEMENT
        </div>

        {/* Table ZK - ZP */}
        <table className="w-full border-collapse border border-black mb-8 text-[11px]">
          <tbody>
            <tr>
              <td className="border border-black p-2 medium-gray font-bold text-center w-16">
                ZK
              </td>
              <td className="border border-black p-2">
                <span className="font-bold">
                  Nombre d'établissements dans le pays :
                </span>
                <span className="border-b border-dotted border-black w-16 inline-block ml-4"></span>
                <span className="checkbox ml-4"></span>
              </td>
              <td className="border border-black p-2 medium-gray font-bold text-center w-16">
                ZN
              </td>
              <td className="border border-black p-2">
                <div className="flex items-center mb-2">
                  <span className="checkbox"></span>
                  <span>Entreprise sous contrôle public</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 medium-gray font-bold text-center">
                ZL
              </td>
              <td className="border border-black p-2">
                <span className="font-bold">
                  Nombre d'établissements hors pays pour lesquels une
                  comptabilité distincte est tenue :
                </span>
                <span className="checkbox ml-4"></span>
              </td>
              <td className="border border-black p-2 medium-gray font-bold text-center">
                ZO
              </td>
              <td className="border border-black p-2">
                <div className="flex items-center mb-2">
                  <span className="checkbox"></span>
                  <span>Entreprise sous contrôle privé national</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 medium-gray font-bold text-center">
                ZM
              </td>
              <td className="border border-black p-2">
                <div className="h-16"></div>
              </td>
              <td className="border border-black p-2 medium-gray font-bold text-center">
                ZP
              </td>
              <td className="border border-black p-2">
                <div className="flex items-center">
                  <span className="checkbox"></span>
                  <span>Entreprise sous contrôle privé étranger</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Activités de l'entreprise */}
        <div className="text-center font-bold mb-4">
          ACTIVITES DE L'ENTREPRISE
        </div>

        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2">
                Désignation de l'activité
              </th>
              <th className="border border-black p-2">
                Code nomenclature d'activité
              </th>
              <th className="border border-black p-2 text-center">(1)</th>
              <th className="border border-black p-2 text-center">
                Chiffre d'affaires HT
                <br />
                (CAHT)
              </th>
              <th className="border border-black p-2 text-center">
                % activité dans
                <br />
                le (CAHT)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-bold">
              <td className="border border-black p-2 text-center" colSpan={5}>
                ASSURANCES
              </td>
            </tr>
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <tr key={`ass-${i}`}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 text-right">0</td>
                  <td className="border border-black p-2 text-right">0</td>
                  <td className="border border-black p-2 text-right">0,00%</td>
                </tr>
              ))}
            <tr className="font-bold">
              <td className="border border-black p-2 text-center" colSpan={5}>
                AUTRES
              </td>
            </tr>
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <tr key={`aut-${i}`}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 text-right">0</td>
                  <td className="border border-black p-2 text-right">0</td>
                  <td className="border border-black p-2 text-right">0,00%</td>
                </tr>
              ))}
            <tr className="light-orange font-bold">
              <td className="border border-black p-2 text-center" colSpan={3}>
                TOTAL
              </td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">100,00%</td>
            </tr>
          </tbody>
        </table>

        <div className="text-[10px] italic mt-4">
          (1) Liste de produits et/ou activité dont l'ordre décroissant du CAHT
        </div>
      </div>
    </div>
  );
};

export default Fiche2;
