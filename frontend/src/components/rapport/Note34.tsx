import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Note34: React.FC = () => {
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
        pdf.save("note_34_indicateurs_financiers.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { label: "SOLDE INTERMEDIAIRES DE GESTION", bold: true, gray: true },
    { label: "CHIFFRE D'AFFAIRES" },
    { label: "MARGE COMMERCIALE" },
    { label: "VALEUR AJOUTEE" },
    { label: "EXCEDENT BRUT D'EXPLOITATION (EBE)" },
    { label: "RESULTAT D'EXPLOITATION" },
    { label: "RESULTAT FINANCIER" },
    { label: "RESULTAT DES ACTIVITES ORDINAIRES" },
    { label: "RESULTAT HORS ACTIVITES ORDINAIRES" },
    { label: "RESULTAT NET" },
    {
      label: "DETERMINATION DE LA CAPACITE D'AUTOFINANCEMENT",
      bold: true,
      gray: true,
    },
    { label: "EBE" },
    {
      label:
        "+ Reprises comptables des cessions courantes d'immobilisation (compte 654)",
    },
    {
      label: "- Produits des cessions courantes d'immobilisation (compte 754)",
    },
    { label: "CAPACITE D'AUTOFINANCEMENT D'EXPLOITATION" },
    { label: "+ Revenus financiers" },
    { label: "- Frais de change" },
    { label: "+ Transfert de charges financières" },
    { label: "+ Produits HAO" },
    { label: "- Transfert de charges HAO" },
    { label: "- Frais financiers" },
    { label: "- Perte de change" },
    { label: "- Impôts sur les résultats" },
    { label: "CAPACITE D'AUTOFINANCEMENT GLOBAL", bold: true, gray: true },
    { label: "- Distribution de dividendes opérés durant l'exercice" },
    { label: "AUTOFINANCEMENT" },
    { label: "ANALYSE DE LA RENTABILITE", bold: true, gray: true },
    {
      label:
        "Rentabilité économique/ressultat d'exploitation (a) (capitaux propres + dettes)",
    },
    { label: "Rentabilité financière/ressultat (capitaux propres)" },
    { label: "ANALYSE DE LA STRUCTURE FINANCIERE", bold: true, gray: true },
    { label: "Capitaux propres et ressources assimilées" },
    { label: "- Dettes financières et autres ressources assimilées (b)" },
    { label: "Ressources stables" },
    { label: "- Actifs immobilisés (b)" },
    { label: "FONDS DE ROULEMENT (1)" },
    { label: "Actif circulant d'exploitation (b)" },
    { label: "- Passif circulant d'exploitation (b)" },
    { label: "BESOIN DE FINANCEMENT D'EXPLOITATION (2)" },
    { label: "Actif circulant HAO (b)" },
    { label: "- Passif circulant HAO (b)" },
    { label: "BESOIN DE FINANCEMENT HAO (3)" },
    { label: "BESOIN DE FINANCEMENT GLOBAL (1) = (2) + (3)" },
    { label: "TRESORERIE NETTE (5) = (1) - (4)" },
    {
      label:
        "CONTROLE TRESORERIE NETTE (TRESORERIE ACTIF - TRESORERIE PASSIF) = TRESORERIE NETTE",
      bold: true,
    },
    {
      label: "ANALYSE DU FINANCEMENT DE L'EXPLOITATION",
      bold: true,
      gray: true,
    },
    { label: "+ Flux de trésorerie des activités opérationnelles" },
    { label: "+ Flux de trésorerie des activités d'investissement" },
    { label: "+ Flux de trésorerie des activités de financement" },
    { label: "= VARIATION DE LA TRESORERIE NETTE DE LA PERIODE" },
    {
      label:
        "Endettement financières brut (Dettes financières + Trésorerie passif)",
    },
    { label: "- Trésorerie actif" },
    { label: "= ENDETTEMENT FINANCIERE NET", bold: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 34 - Indicateurs Financiers
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
          .light-gray {
            background-color: #d3d3d3;
          }
          .medium-gray {
            background-color: #c0c0c0;
          }
          .dark-gray {
            background-color: #a9a9a9;
          }
          .green-bg {
            background-color: #92d050;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold mb-4 text-lg"></div>

        {/* Standard header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            <span className="border-b border-dotted border-gray-400 w-32 text-center"></span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            <span className="border-b border-dotted border-gray-400 flex-1"></span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="border-b border-dotted border-gray-400 w-16 text-center"></span>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold mb-6">
          NOTE 34:
          <br />
          FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS
        </div>

        <div className="text-center mb-4">(EN MILLIERS DE FRANC)</div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="light-gray">
              <th className="border border-gray-400 p-1 w-[60%]">
                NATURE DES INDICATIONS
              </th>
              <th className="border border-gray-400 p-1 text-center">N</th>
              <th className="border border-gray-400 p-1 text-center">N-1</th>
              <th className="border border-gray-400 p-1 text-center">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="medium-gray font-bold">
              <td className="border border-gray-400 p-1 pl-4">
                SOLDE INTERMEDIAIRES DE GESTION
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`${row.gray ? "medium-gray" : ""} ${
                  row.bold ? "font-bold" : ""
                }`}
              >
                <td className="border border-gray-400 p-1 pl-4">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note34;
