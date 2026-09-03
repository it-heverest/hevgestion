import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Fiche1: React.FC = () => {
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
        pdf.save("fiche_identification.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Fiche d'Identification
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
        <style>{`
          .dark-gray {
            background-color: #a9a9a9;
          }
          .medium-gray {
            background-color: #c0c0c0;
          }
          .light-gray {
            background-color: #d3d3d3;
          }
          .checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid black;
            display: inline-block;
          }
        `}</style>

        {/* Page number */}
        <div className="text-right font-bold mb-4">PAGE 1/4</div>

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
          FICHE D'IDENTIFICATION
        </div>

        {/* Table ZA - Contact */}
        <table className="w-full border-collapse border border-black mb-6 text-[11px]">
          <tbody>
            <tr className="medium-gray font-bold">
              <td className="border border-black p-1 text-center" colSpan={6}>
                ZA
              </td>
            </tr>
            <tr className="medium-gray">
              <td className="border border-black p-1 text-center">
                N° de téléphone
              </td>
              <td className="border border-black p-1 text-center">
                N° de télécopie
              </td>
              <td className="border border-black p-1 text-center">E-mail</td>
              <td className="border border-black p-1 text-center">Code pays</td>
              <td className="border border-black p-1 text-center">
                Boîte postale
              </td>
              <td className="border border-black p-1 text-center">Ville</td>
            </tr>
            <tr>
              <td className="border border-black p-1 h-10"></td>
              <td className="border border-black p-1 h-10"></td>
              <td className="border border-black p-1 h-10"></td>
              <td className="border border-black p-1 h-10"></td>
              <td className="border border-black p-1 h-10"></td>
              <td className="border border-black p-1 h-10"></td>
            </tr>
          </tbody>
        </table>

        {/* ZB - Exercice comptable */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZB
          </span>
          <span className="font-bold ml-4">EXERCICE COMPTABLE</span>
          <div className="border border-black mt-2 h-10"></div>
        </div>

        {/* ZC - Registre du commerce */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZC
          </span>
          <span className="font-bold ml-4">
            N° Registre du Commerce et du Crédit mobilier
          </span>
          <div className="border border-black mt-2 h-10"></div>
        </div>

        {/* ZD - Sécurité sociale */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZD
          </span>
          <span className="font-bold ml-4">N° Sécurité sociale</span>
          <div className="border border-black mt-2 h-10"></div>
        </div>

        {/* ZE - Activité principale */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZE
          </span>
          <span className="font-bold ml-4">
            Désignation précise de l'activité principale exercée par
            l'entreprise
          </span>
          <div className="border border-black mt-2 h-10 inline-block w-3/4"></div>
          <span className="font-bold ml-8">Code</span>
          <div className="border border-black mt-2 h-10 inline-block w-32"></div>
        </div>

        {/* ZF - Personne à contacter */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZF
          </span>
          <span className="font-bold ml-4">
            Nom, Adresse et qualité de la personne à contacter en cas de demande
            d'informations complémentaires
          </span>
          <div className="border border-black mt-2 h-32"></div>
        </div>

        {/* ZG - Responsable comptable */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZG
          </span>
          <span className="font-bold ml-4">
            Nom du responsable comptable de l'entreprise
          </span>
          <div className="border border-black mt-2 h-10"></div>
        </div>

        {/* ZH - Cabinet comptable */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZH
          </span>
          <span className="font-bold ml-4">
            Nom, adresse du cabinet comptable
          </span>
          <div className="border border-black mt-2 h-10"></div>
        </div>

        {/* ZI - Signataire */}
        <div className="mb-6">
          <span className="medium-gray font-bold inline-block w-16 text-center border border-black py-1">
            ZI
          </span>
          <span className="font-bold ml-4">
            Nom et qualité du signataire des états financiers
          </span>
          <div className="border border-black mt-2 h-10"></div>
        </div>

        {/* Date et signature */}
        <div className="grid grid-cols-2 gap-4 mt-12">
          <div>
            <span className="font-bold">Date de signature :</span>
            <div className="border-b border-dotted border-black w-64 inline-block ml-4"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Signature</span>
            <div className="border border-black h-20 w-64 inline-block mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fiche1;

