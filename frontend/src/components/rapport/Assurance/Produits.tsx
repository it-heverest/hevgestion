import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Produits: React.FC = () => {
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
        pdf.save("compte_resultat_credit.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Compte de résultat : Crédit
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
        <style jsx>{`
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
        <div className="text-center font-bold text-lg mb-4">8</div>

        {/* Header fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-bold">Dénomination de l'entreprise :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Exercice clos le :</span>
            <div className="border-b border-dotted border-black mt-1 h-8 inline-block w-64"></div>
          </div>
          <div>
            <span className="font-bold">Sigle :</span>
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
        <div className="light-gray py-2 text-center font-bold mb-6">CREDIT</div>

        {/* Table */}
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="dark-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={2}
              ></th>
              <th className="border border-black p-2 text-center" colSpan={3}>
                Exercice N
              </th>
              <th className="border border-black p-2 text-center">
                Exercice N-1
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-left" colSpan={2}>
                Rubriques
              </th>
              <th className="border border-black p-2 text-center">
                AFFAIRES DIRECTES
              </th>
              <th className="border border-black p-2 text-center">
                CESSIONS ET RETROCESSIONS
              </th>
              <th className="border border-black p-2 text-center">
                OPERATIONS NETTES
              </th>
              <th className="border border-black p-2 text-center"></th>
            </tr>
            <tr className="medium-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={2}
              ></th>
              <th className="border border-black p-2 text-center">1</th>
              <th className="border border-black p-2 text-center">2</th>
              <th className="border border-black p-2 text-center">3=1+2</th>
              <th className="border border-black p-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {/* PRIMES */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={6}>
                PRIMES
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Primes émises nettes d'annulations
              </td>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                ajouter : provisions de primes à l'ouverture
              </td>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                déduire : provisions de primes à la clôture
              </td>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                Primes de l'exercice
              </td>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* PRODUITS DES PLACEMENTS */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={6}>
                PRODUITS DES PLACEMENTS
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                Produits financiers sur titres
              </td>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* ... more rows ... */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                TOTAL DES PRODUITS DES PLACEMENTS
              </td>
              <td className="border border-black p-2 text-center">11</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* AUTRES PRODUITS */}
            <tr className="medium-gray font-bold">
              <td className="border border-black p-2 pl-4" colSpan={6}>
                AUTRES PRODUITS
              </td>
            </tr>
            {/* ... */}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                TOTAL AUTRES PRODUITS
              </td>
              <td className="border border-black p-2 text-center">15</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* Intérêts créditeurs aux provisions mathématiques */}
            <tr className="diagonal font-bold">
              <td className="border border-black p-2 pl-8">
                Intérêts créditeurs aux provisions mathématiques
              </td>
              <td className="border border-black p-2 text-center">18</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* Opérations brutes */}
            <tr>
              <td className="border border-black p-2 pl-8">
                Opérations brutes
              </td>
              <td className="border border-black p-2 text-center">20</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* Cessions et rétrocessions */}
            <tr>
              <td className="border border-black p-2 pl-8">
                Cessions et rétrocessions
              </td>
              <td className="border border-black p-2 text-center">21</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>

            {/* TOTAL */}
            <tr className="black-bg font-bold">
              <td className="border border-black p-2 pl-8">TOTAL</td>
              <td className="border border-black p-2 text-center">22</td>
              <td className="border border-black p-2 text-right">0</td>
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

export default Produits;

