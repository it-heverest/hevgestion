import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EtatC4: React.FC = () => {
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
        pdf.save("etat_c4.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const engagements = [
    { line: 1, label: "Provisions pour risques en cours" },
    { line: 2, label: "Provisions pour sinistres à payer" },
    { line: 3, label: "Provisions mathématiques" },
    { line: 4, label: "Autres provisions techniques" },
    { line: 5, label: "Autres engagements réglementés" },
  ];

  const actifs = [
    { red: true, label: "- Obligations et autres valeurs d'État" },
    { label: "Obligations des organismes internationaux", art: "art 335.11-a" },
    { label: "Obligations des institutions financières", art: "art 335.11-b" },
    { label: "Autres obligations", art: "art 335.11-c" },
    { label: "Actions cotées", art: "art 335.12-a" },
    { label: "Actions des entreprises d'assurances", art: "art 335.12-b" },
    {
      label: "Actions et obligations des sociétés commerciales",
      art: "art 335.12-c",
    },
    { label: "Actions des sociétés d'investissement", art: "art 335.12-d" },
    { label: "Droits réels immobiliers", art: "art 335.13" },
    { label: "Prêts garantis", art: "art 335.14" },
    { label: "Prêts hypothécaires", art: "art 335.15-a" },
    { label: "Autres prêts", art: "art 335.15-b" },
    { label: "Dépôts en banque", art: "art 335.16" },
    { label: "Avances sur contrat des Sociétés vie", art: "art 335.2" },
    {
      label: "Recours Admis (règlement n.0001/PCMA/CE/SG/CIMA/2003",
      art: "art 335.2",
    },
    {
      label: "Primes ou cotisations de moins de trois mois des sociétés vie",
      art: "art 335.2",
    },
    {
      label:
        "Primes ou cotisations de moins d'un an des sociétés accidents santé",
      art: "art 335.3 alinéa 1",
    },
    {
      label: "Primes ou cotisations de moins d'un an des branches transports",
      art: "art 335.3 alinéa 2",
    },
    {
      label: "Créances sur les réassureurs garanties par un nantissement",
      art: "art 335.5",
    },
    {
      label: "Autres créances sur les réassureurs pour la branche transport",
      art: "art 335.5",
    },
    { label: "Créances sur les cédants", art: "art 335.6" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          ETAT C4 - Engagements Réglementés
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
          .red-text {
            color: red;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">10</div>

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
        <div className="medium-gray py-2 text-center font-bold text-white mb-6">
          ETAT C4 : MONTANT DES ENGAGEMENTS REGLEMENTES ET DE LEUR COUVERTURE
        </div>

        {/* Table I */}
        <table className="w-full border-collapse border border-black text-[11px] mb-8">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-left" colSpan={2}>
                I- MONTANT DES ENGAGEMENTS REGLEMENTES
              </th>
              <th className="border border-black p-2 text-center">Ligne</th>
              <th className="border border-black p-2 text-center">
                (c) PROMISSE
                <br />
                MONTANT
              </th>
            </tr>
          </thead>
          <tbody>
            {engagements.map((item) => (
              <tr key={item.line}>
                <td className="border border-black p-2 pl-8">{item.label}</td>
                <td className="border border-black p-2 text-center">
                  {item.line}
                </td>
                <td className="border border-black p-2 text-right black-bg">
                  0
                </td>
                <td className="border border-black p-2 text-right">0</td>
              </tr>
            ))}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                TOTAL DES ENGAGEMENTS REGLEMENTES : Lignes 1 à 5
              </td>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* Table II */}
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th className="border border-black p-2 text-left" colSpan={2}>
                II- ACTIFS REPRESENTATIFS
              </th>
              <th className="border border-black p-2 text-center">
                N° article
              </th>
              <th className="border border-black p-2 text-center">
                Prix d'achat ou de revient
              </th>
              <th className="border border-black p-2 text-center">
                Valeur de réalisation
              </th>
              <th className="border border-black p-2 text-center">
                Valeur de couverture
              </th>
            </tr>
          </thead>
          <tbody>
            {actifs.map((item, index) => (
              <tr key={index} className={item.red ? "red-text font-bold" : ""}>
                <td
                  className="border border-black p-2 pl-8"
                  colSpan={item.art ? 1 : 2}
                >
                  {item.label}
                </td>
                {item.art && (
                  <td className="border border-black p-2 text-center">
                    {index + 7}
                  </td>
                )}
                {item.art && (
                  <td className="border border-black p-2 text-center">
                    {item.art}
                  </td>
                )}
                {!item.art && (
                  <td className="border border-black p-2 text-center"></td>
                )}
                <td className="border border-black p-2 text-right">0</td>
                <td className="border border-black p-2 text-right">0</td>
                <td className="border border-black p-2 text-right">0</td>
              </tr>
            ))}
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                Total des actifs admis en représentation: Total 20 & 29
              </td>
              <td className="border border-black p-2 text-center">30</td>
              <td className="border border-black p-2"></td>
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

export default EtatC4;
