import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Fiche4: React.FC = () => {
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
        pdf.save("page_4_etablissements.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Page 4/4 - Liste des Établissements
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
          .light-gray {
            background-color: #d3d3d3;
          }
        `}</style>

        {/* Page number */}
        <div className="text-right font-bold mb-4">PAGE 4/4</div>

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
          LISTE DES ETABLISSEMENTS DE L'ENTREPRISE EN FIN D'EXERCICE
        </div>

        {/* Établissements table */}
        <table className="w-full border-collapse border border-black text-[11px] mb-8">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2" rowSpan={2}></th>
              <th className="border border-black p-2" colSpan={3}>
                Noms et adresses de l'Établissement
              </th>
              <th className="border border-black p-2" rowSpan={2}>
                Activités principales de l'établissement
              </th>
              <th className="border border-black p-2" rowSpan={2}>
                Date de création ou d'acquisition
              </th>
              <th className="border border-black p-2" rowSpan={2}>
                Si acquisition nom de l'ancien acquéreur
              </th>
              <th className="border border-black p-2" rowSpan={2}>
                Effectifs permanents en fin d'exercice
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-black p-2">Nom</th>
              <th className="border border-black p-2">Localité</th>
              <th className="border border-black p-2">B.P.</th>
              <th className="border border-black p-2">Tél.</th>
            </tr>
          </thead>
          <tbody>
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 text-center">
                    {i + 1}.
                  </td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Structure de l'activité */}
        <div className="text-center font-bold text-lg mb-4 py-2">
          STRUCTURE DE L'ACTIVITE PAR ETABLISSEMENT
        </div>

        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2" rowSpan={2}>
                OPERATION
              </th>
              <th className="border border-black p-2" colSpan={6}>
                Établissement
              </th>
              <th className="border border-black p-2" rowSpan={2}>
                TOTAL
              </th>
            </tr>
            <tr className="medium-gray">
              <th className="border border-black p-2">1</th>
              <th className="border border-black p-2">2</th>
              <th className="border border-black p-2">3</th>
              <th className="border border-black p-2">4</th>
              <th className="border border-black p-2">5</th>
              <th className="border border-black p-2">6</th>
            </tr>
          </thead>
          <tbody>
            {/* A - Activités commerciales */}
            <tr className="font-bold light-gray">
              <td className="border border-black p-2 pl-4" colSpan={8}>
                A) - Activités commerciales
              </td>
            </tr>
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <tr key={`a-${i}`}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}

            {/* B - Production de biens */}
            <tr className="font-bold light-gray">
              <td className="border border-black p-2 pl-4" colSpan={8}>
                B) - Activités de production de biens
              </td>
            </tr>
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <tr key={`b-${i}`}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}
            <tr className="font-bold">
              <td className="border border-black p-2 pl-8">
                Total Prod Biens Cpte
              </td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>

            {/* C - Prestations de services */}
            <tr className="font-bold light-gray">
              <td className="border border-black p-2 pl-4" colSpan={8}>
                C) - Activités de prestations de services
              </td>
            </tr>
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <tr key={`c-${i}`}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}
            <tr className="font-bold">
              <td className="border border-black p-2 pl-8">
                TOTAL Serv vendus et trav Facturés Cpte
              </td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black p-2 pl-8">
                TOTAL (A + B + C)
              </td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>

            {/* D - Cessions */}
            <tr className="font-bold light-gray">
              <td className="border border-black p-2 pl-4" colSpan={8}>
                D) - Cessions entre Etablissements
              </td>
            </tr>
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <tr key={`d-${i}`}>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                  <td className="border border-black p-2 h-10"></td>
                </tr>
              ))}

            {/* Salaires versés, Effectif salariés, Personnel saisonnier */}
            <tr>
              <td className="border border-black p-2 pl-4">Salaires versés</td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-4">
                Effectif salariés
              </td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-4">
                Personnel saisonnier (Nombre de journées de travail)
              </td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-4">
                Investissements réalisés
              </td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
              <td className="border border-black p-2 h-10"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fiche4;
