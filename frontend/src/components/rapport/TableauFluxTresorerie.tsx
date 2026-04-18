import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TableauFluxTresorerie: React.FC = () => {
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
        pdf.save("tableau_flux_tresorerie.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    {
      ref: "ZA",
      label:
        "Trésorerie nette au 1er janvier (Trésorerie actif N-1 - Trésorerie passif N-1)",
      note: "",
      highlight: "lightblue",
      letter: "A",
    },
    {
      ref: "",
      label: "Flux de trésorerie provenant des activités opérationnelles",
      note: "",
      bold: true,
    },
    {
      ref: "FA",
      label: "Capacité d'Autofinancement Globale (CFA+FE)",
      note: "",
    },
    { ref: "FE", label: "- Actif circulant HAO", note: "" },
    { ref: "FC", label: "- Variation des stocks", note: "" },
    { ref: "FD", label: "- Variation des créances", note: "" },
    { ref: "FE", label: "- Variation du passif circulant", note: "" },
    {
      ref: "",
      label:
        "Variation du BF lié aux activités opérationnelles (FB+FC+FD+FE)................",
      note: "",
    },
    {
      ref: "ZE",
      label:
        "Flux de trésorerie provenant des activités opérationnelles (somme FA à FE)",
      note: "",
      highlight: "brown",
      letter: "B",
    },
    {
      ref: "",
      label: "Flux de trésorerie provenant des activités d'investissement",
      note: "",
      bold: true,
    },
    {
      ref: "FF",
      label:
        "- Décaissements liés aux acquisitions d'immobilisation incorporelles",
      note: "",
    },
    {
      ref: "FG",
      label:
        "- Décaissements liés aux acquisitions d'immobilisation corporelles",
      note: "",
    },
    {
      ref: "FH",
      label:
        "- Décaissements liés aux acquisitions d'immobilisation financières",
      note: "",
    },
    {
      ref: "FI",
      label:
        "+ Encaissement liés aux cessions d'immobilisations incorporelles et corporelles",
      note: "",
    },
    {
      ref: "FJ",
      label: "+ Encaissement liés aux cessions d'immobilisations financières",
      note: "",
    },
    {
      ref: "ZC",
      label:
        "Flux de trésorerie provenant des activités d'investissements (somme FF à FJ)",
      note: "",
      highlight: "brown",
      letter: "C",
    },
    {
      ref: "",
      label:
        "Flux de trésorerie provenant du financement par les capitaux propres",
      note: "",
      bold: true,
    },
    {
      ref: "FK",
      label: "+ Augmentation de capital par rapport au nouveau",
      note: "",
    },
    { ref: "FL", label: "+ Subventions d'investissement reçues", note: "" },
    { ref: "FM", label: "+ Prélèvement sur le capital", note: "" },
    { ref: "FN", label: "- Dividendes versés", note: "" },
    {
      ref: "ZD",
      label:
        "Flux de trésorerie provenant des capitaux propres (somme FK à FN)",
      note: "",
      highlight: "brown",
      letter: "D",
    },
    {
      ref: "",
      label: "Flux de trésorerie provenant des capitaux étrangers",
      note: "",
      bold: true,
    },
    { ref: "FO", label: "Emprunts", note: "" },
    { ref: "FP", label: "- Autres dettes financières", note: "" },
    {
      ref: "FQ",
      label: "- Remboursement des emprunts et aux dettes financières",
      note: "",
    },
    {
      ref: "ZF",
      label:
        "Flux de trésorerie provenant des capitaux étrangers (somme FO à FQ)",
      note: "",
      highlight: "brown",
      letter: "E",
    },
    {
      ref: "ZG",
      label: "Flux de trésorerie provenant des activités de financement (D+F)",
      note: "",
      highlight: "lightblue",
      letter: "F",
    },
    {
      ref: "ZH",
      label: "VARIATION DE LA TRESORERIE NETTE DE LA PERIODE (B+C+F)",
      note: "",
      highlight: "lightblue",
      letter: "G",
    },
    {
      ref: "ZI",
      label: "Trésorerie nette au 31 décembre (C+A)",
      note: "",
      highlight: "lightblue",
    },
    {
      ref: "",
      label: "Contrôle trésorerie actif N+ Trésorerie passif N=",
      note: "",
      bold: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Tableau des Flux de Trésorerie
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
        <div className="text-center font-bold mb-2 text-lg">7</div>

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
          TABLEAU DES FLUX DE TRESORERIE
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
                className="border border-gray-400 p-1 pl-2 w-[55%]"
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
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`${
                  row.highlight === "lightblue"
                    ? "bg-blue-200"
                    : row.highlight === "brown"
                    ? "bg-amber-700 text-white"
                    : ""
                } ${row.bold ? "font-bold" : ""}`}
              >
                <td className="border border-gray-400 p-1 text-center">
                  {row.ref}
                </td>
                <td className="border border-gray-400 p-1 pl-2">
                  {row.label}{" "}
                  {row.letter ? (
                    <span className="font-bold">{row.letter}</span>
                  ) : (
                    ""
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.note}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-[10px] italic">
          [1] A l'exclusion des variations des créances et dettes liées aux
          activités d'investissement (variation des créances sur cession
          d'immobilisation et des dettes sur acquisition ou production
          d'immobilisation) et de financement (par exemple variation des
          créances sur subventions d'investissements reçues).
        </div>
      </div>
    </div>
  );
};

export default TableauFluxTresorerie;

