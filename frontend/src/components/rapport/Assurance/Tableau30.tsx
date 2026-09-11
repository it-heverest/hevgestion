import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const Tableau30: React.FC = () => {
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
        pdf.save("tableau_30_etats_annexes.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const annexes = [
    "Tableau 31 : ACTIF IMMOBILISE",
    "Tableau 32 : AMORTISSEMENT",
    "Tableau 33 : PLUS VALUES ET MOINS VALUES DE CESSIONS",
    "Tableau 34 : PROVISIONS INSCRITES AU BILAN",
    "Tableau 35 a : PROVISIONS TECHNIQUES",
    "Tableau 35 b : PART DES REASSUREURS DANS LES PROVISIONS TECHNIQUES",
    "Tableau 36 : BIENS PRISES EN CREDIT BAIL ET CONTRATS ASSIMILES",
    "Tableau 37 : ECHEANCES DES CREANCES A LA CLOTURE DE L'EXERCICE",
    "Tableau 38 : ECHEANCES DES DETTES A LA CLOTURE DE L'EXERCICE",
    "Tableau 39 : REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERES EXERCICES",
    "Tableau 40 : PROJET D'AFFECTATION DU RESULTAT DE L'EXERCICE",
    "Tableau 41 a : EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR",
    "Tableau 41 b : EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR AUTRES PAYS CEMAC",
    "Tableau 42 : FRAIS DE PERSONNEL",
    "Tableau 43 a : PRODUCTION VIE",
    "Tableau 43 b : PRODUCTION NON VIE",
    "Tableau 44 a : SINISTRES VIE",
    "Tableau 44 b : SINISTRES NON VIE",
    "Tableau 45 : RESULTAT DES PLACEMENTS",
    "Tableau 46 : AVANCES ET CREDITS AUX ASSOCIES ET DIRIGEANTS",
    "Tableau 47 : CONTROLE DE REMPLISSAGE",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Tableau 30 - États Annexes
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} /> : <Pencil size={18} />}
          </button>
          <button
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style>{`
          .medium-gray {
            background-color: #c0c0c0;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">30</div>

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
          TABLEAUX : ETATS ANNEXES
        </div>

        {/* List of Annexes */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <tbody>
            {annexes.map((annexe, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-2 pl-4">{annexe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tableau30;

