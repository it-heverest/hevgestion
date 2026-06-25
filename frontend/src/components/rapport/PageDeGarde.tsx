import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PageDeGarde: React.FC = () => {
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
        pdf.save("page_de_garde.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Page de Garde
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
            background-color: #d3d3d3; /* light gray */
          }
          .dark-gray-header {
            background-color: #a9a9a9; /* darker gray */
          }
          .border-thick {
            border: 2px solid black;
          }
          .checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid black;
            display: inline-block;
            margin-right: 10px;
          }
        `}</style>

        <div className="text-center font-bold text-lg mb-8 gray-header py-2 border-thick">
          PAGE DE GARDE
        </div>

        <table className="w-full border-collapse border border-black mb-8">
          <tbody>
            <tr>
              <td
                className="border border-black p-2 font-bold text-center"
                colSpan={4}
              >
                REPUBLIQUE DU CAMEROUN
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center" colSpan={4}>
                MINISTERE DES FINANCES
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center" colSpan={4}>
                DIRECTION GENERALE DES IMPÔTS
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center" colSpan={4}>
                CENTRE DE DEPOT DE :
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center font-bold text-lg mb-8">
          ETATS FINANCIERS NORMALISES
          <br />
          SYSTEME COMPTABLE SYSCOHADA
        </div>

        <div className="mb-8">
          <span className="font-bold">EXERCICE CLOS LE :</span>
          <span className="border-b border-dotted border-black ml-4 w-64 inline-block"></span>
        </div>

        <div className="text-center font-bold text-lg mb-8">
          DESIGNATION DE L'ENTITE
        </div>

        <div className="mb-4">
          <span className="font-bold">DENOMINATION SOCIALE :</span>
          <br />
          <span className="italic text-[10px]">
            (ou nom et prénoms de l'exploitant)
          </span>
          <div className="border-b border-dotted border-black w-full h-8 mt-2"></div>
        </div>

        <div className="mb-4">
          <span className="font-bold">SIGLE USUEL :</span>
          <div className="border-b border-dotted border-black w-full h-8 mt-2"></div>
        </div>

        <div className="mb-4">
          <span className="font-bold">ADRESSE COMPLETE :</span>
          <div className="border-b border-dotted border-black w-full h-8 mt-2"></div>
        </div>

        <div className="mb-8">
          <span className="font-bold">N° D'IDENTIFICATION FISCALE :</span>
          <div className="border-b border-dotted border-black w-full h-8 mt-2"></div>
        </div>

        <div className="text-center font-bold mb-4 dark-gray-header py-2">
          SYSTEME NORMAL
        </div>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold" rowSpan={2}>
                documents déposés
              </td>
              <td className="border border-black p-2 text-center" colSpan={2}>
                Réservé à la Direction Générale des Impôts
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                <div className="flex items-center mb-2">
                  <span className="checkbox"></span>
                  <span>Fiche d'identification et renseignement divers</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="checkbox"></span>
                  <span>Bilan</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="checkbox"></span>
                  <span>Compte de résultat</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="checkbox"></span>
                  <span>Tableau des flux trésorerie</span>
                </div>
                <div className="flex items-center">
                  <span className="checkbox"></span>
                  <span>Notes annexes</span>
                </div>
              </td>
              <td className="border border-black p-2">
                <div className="mb-8">
                  <span>Date de dépôt</span>
                  <div className="border-b border-dotted border-black w-full h-8 mt-2"></div>
                </div>
                <div className="mb-8">
                  <span>
                    Nom de l'agent de la DCI ayant réceptionné le dépôt
                  </span>
                  <div className="border-b border-dotted border-black w-full h-8 mt-2"></div>
                </div>
                <div>
                  <span>Signature de l'agent et cachet du service</span>
                  <div className="h-20 mt-2"></div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2" colSpan={3}>
                <span>Nombre de pages déposées par exemplaire : </span>
                <span className="border-b border-dotted border-black w-32 inline-block ml-2"></span>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2" colSpan={3}>
                <span>Nombre d'exemplaires déposés : </span>
                <span className="border-b border-dotted border-black w-32 inline-block ml-2"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PageDeGarde;

