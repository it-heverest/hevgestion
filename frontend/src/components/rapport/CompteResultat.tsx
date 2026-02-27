import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CompteResultat: React.FC = () => {
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
        pdf.save("compte_de_resultat.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { ref: "TA", label: "Vente de marchandises", note: "21" },
    { ref: "RB", label: "Achat de marchandises", note: "22" },
    { ref: "RB", label: "Variation de stock de marchandises", note: "6" },
    {
      ref: "",
      label: (
        <span className="font-bold bg-gray-400">
          MARGE COMMERCIALE (Somme TA à RB)
        </span>
      ),
      note: "",
    },
    { ref: "LB", label: "Vente de produits fabriqués B", note: "21" },
    { ref: "TL", label: "Travaux, services vendus C", note: "21" },
    { ref: "TD", label: "Produits accessoires D", note: "21" },
    {
      ref: "",
      label: (
        <span className="font-bold bg-gray-400">
          CHIFFRE D'AFFAIRES (A+B+C+D)
        </span>
      ),
      note: "6",
    },
    { ref: "TE", label: "Production stockée (ou déstockage)", note: "21" },
    { ref: "TF", label: "Production immobilisée", note: "21" },
    { ref: "TH", label: "Subventions d'exploitation", note: "21" },
    { ref: "TI", label: "Transfert de charges d'exploitation", note: "12" },
    {
      ref: "RC",
      label: "Achats de matières premières et fournitures liées",
      note: "22",
    },
    {
      ref: "RD",
      label: "Variation de stocks de matières premières et fournitures liées",
      note: "6",
    },
    { ref: "RE", label: "Autres achats", note: "22" },
    {
      ref: "RF",
      label: "Variation de stock d'autres approvisionnement",
      note: "6",
    },
    { ref: "RB", label: "Transports", note: "23" },
    { ref: "RH", label: "Services extérieurs", note: "24" },
    { ref: "RI", label: "Impôts et taxes", note: "25" },
    { ref: "RJ", label: "Autres charges", note: "26" },
    {
      ref: "",
      label: (
        <span className="font-bold bg-gray-400">
          VALEUR AJOUTEE (XR + RA + RB) + (somme TE à RJ)
        </span>
      ),
      note: "",
    },
    { ref: "RK", label: "Charges de personnel", note: "27" },
    { ref: "XD", label: "EXCEDENT BRUT D'EXPLOITATION (XC+RK)", note: "28" },
    {
      ref: "TL",
      label: "Reprises d'amortissements, provisions et dépréciations",
      note: "3C&3D",
    },
    { ref: "XF", label: "RESULTAT D'EXPLOITATION (XD + TL + RIS)", note: "" },
    { ref: "TK", label: "Revenus financiers et assimilés", note: "28" },
    {
      ref: "TL",
      label: "Reprises de provisions et dépréciations financières",
      note: "28",
    },
    { ref: "TM", label: "Transfert de charges financières", note: "12" },
    { ref: "RM", label: "Frais financiers et charges assimilées", note: "28" },
    {
      ref: "RN",
      label: "Dotations aux provisions et aux dépréciations financières",
      note: "3C&3D",
    },
    { ref: "XF", label: "RESULTATS FINANCIERS (somme TK à RN)", note: "" },
    { ref: "XG", label: "RESULTAT DES ACTIVITES ORDINAIRES", note: "" },
    { ref: "TN", label: "Produits et cessions d'immobilisations", note: "3D" },
    { ref: "TO", label: "Autres Produits HAO", note: "30" },
    {
      ref: "RU",
      label: "Valeurs comptables de cessions d'immobilisations",
      note: "3D",
    },
    { ref: "RP", label: "Autres charges HAO", note: "30" },
    {
      ref: "RH",
      label: "RESULTATS ACTIVITES ORDINAIRES (somme TN à RP)",
      note: "",
    },
    { ref: "RA", label: "Participation des travailleurs", note: "30" },
    { ref: "TQ", label: "Impôt sur le résultat", note: "" },
    { ref: "XR", label: "RESULTAT NET (XG+XH+RQ+RS)", note: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Compte de Résultat
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
        <div className="text-center font-bold mb-2 text-lg">6</div>

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

        <div className="bg-gray-400 py-1 text-center font-bold mb-4">
          COMPTE DE RESULTAT
          <br />
          COMPTE RESULTAT AU 31 DECEMBRE
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                REF
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[50%]"
              >
                LIBELLES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                NOTE
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE AU
                <br />
                31/12/N
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE AU
                <br />
                31/12/N-1
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">NET</th>
              <th className="border border-gray-400 p-1">NET</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={
                  row.label.toString().includes("MARGE") ||
                  row.label.toString().includes("CHIFFRE") ||
                  row.label.toString().includes("VALEUR") ||
                  row.label.toString().includes("RESULTAT") ||
                  row.label.toString().includes("TOTAL")
                    ? "bg-gray-400 font-bold"
                    : ""
                }
              >
                <td className="border border-gray-400 p-1 text-center font-bold">
                  {row.ref}
                </td>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.note}
                </td>
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

export default CompteResultat;
