import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ModeBilan: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Données éditables
  const [header, setHeader] = useState({
    designation: "",
    numId: "",
    dateCloture: "",
    duree: "12",
  });

  const [bilan, setBilan] = useState({
    immobilisations: { n: "0", n1: "0" },
    stocks: { n: "0", n1: "0" },
    clientsDebiteurs: { n: "0", n1: "0" },
    caisseBanque: { n: "0", n1: "0" },
    totalActif: { n: "0", n1: "0" },

    compteExplo: { n: "0", n1: "0" },
    resultatExercice: { n: "0", n1: "0" },
    emprunt: { n: "0", n1: "0" },
    fournisseursCreanciers: { n: "0", n1: "0" },
    totalPassif: { n: "0", n1: "0" },
  });

  const [compteResultat, setCompteResultat] = useState({
    recettesPrestations: { n: "0", n1: "0" },
    autresRecettes: { n: "0", n1: "0" },
    totalRecettes: { n: "0", n1: "0" },

    depensesAchats: { n: "0", n1: "0" },
    depensesLoyers: { n: "0", n1: "0" },
    depensesSalairesTaxes: { n: "0", n1: "0" },
    autresDepenses: { n: "0", n1: "0" },
    totalDepenses: { n: "0", n1: "0" },

    soldeC: { n: "0", n1: "0" },
    variationStocks: { n: "0", n1: "0" },
    variationCreances: { n: "0", n1: "0" },
    variationDettes: { n: "0", n1: "0" },
    dotationsAmortissements: { n: "0", n1: "0" },
    resultatExerciceG: { n: "0", n1: "0" },
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleBilanChange = (key: string, year: "n" | "n1", value: string) => {
    setBilan((prev) => ({
      ...prev,
      [key]: { ...prev[key], [year]: value },
    }));
  };

  const handleCRChange = (key: string, year: "n" | "n1", value: string) => {
    setCompteResultat((prev) => ({
      ...prev,
      [key]: { ...prev[key], [year]: value },
    }));
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(reportRef.current!, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("bilan_cdr_smt.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-xs text-gray-900">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-700" />
          Modèle Bilan et Compte de Résultat – Système Minimal
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all shadow ${
              isEditing
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {isEditing ? "Annuler" : <Pencil size={18} />}
            {isEditing ? "Annuler" : "Éditer"}
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-medium transition-all shadow"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Contenu A4 paysage */}
      <div
        ref={reportRef}
        className="max-w-[297mm] mx-auto bg-white shadow-2xl border border-gray-300"
      >
        <style jsx>{`
          .header-gray {
            background-color: #e6e6e6;
          }
          .title-gray {
            background-color: #d3d3d3;
            font-weight: bold;
          }
          .total-gray {
            background-color: #c0c0c0;
            font-weight: bold;
          }
          .edit-input {
            width: 100%;
            padding: 3px 5px;
            border: 1px solid #999;
            background: #fff9e6;
            text-align: right;
            font-size: 11px;
          }
          .edit-input:focus {
            outline: 2px solid #3b82f6;
            background: #fff;
          }
        `}</style>

        {/* En-tête */}
        <div className="p-6 border-b-2 border-gray-700 grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                className="edit-input flex-1"
                value={header.designation}
                onChange={(e) =>
                  handleHeaderChange("designation", e.target.value)
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 flex-1 min-h-[20px]">
                {header.designation || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le :
            </span>
            {isEditing ? (
              <input
                className="edit-input w-40 text-center"
                value={header.dateCloture}
                onChange={(e) =>
                  handleHeaderChange("dateCloture", e.target.value)
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 w-40 text-center">
                {header.dateCloture || "31-12-..."}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                className="edit-input flex-1"
                value={header.numId}
                onChange={(e) => handleHeaderChange("numId", e.target.value)}
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 flex-1 min-h-[20px]">
                {header.numId || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            <span className="border-b border-dotted border-gray-600 w-16 text-center">
              {header.duree}
            </span>
          </div>
        </div>

        {/* Titre principal */}
        <div className="title-gray py-3 text-center font-bold text-lg border-b-2 border-gray-700">
          MODELE BILAN ET COMPTE DE RESULTAT DU SYSTEME MINIMAL
        </div>

        {/* Tableau Bilan */}
        <div className="p-4">
          <div className="header-gray py-2 px-4 font-bold text-center border border-gray-600">
            BILAN SMT AU 31 DECEMBRE ........................................
          </div>

          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-600 p-2 text-left">ACTIF</th>
                <th className="border border-gray-600 p-2 text-center">NOTE</th>
                <th
                  colSpan={2}
                  className="border border-gray-600 p-2 text-center"
                >
                  MONTANT
                </th>
                <th className="border border-gray-600 p-2 text-left">PASSIF</th>
                <th className="border border-gray-600 p-2 text-center">NOTE</th>
                <th
                  colSpan={2}
                  className="border border-gray-600 p-2 text-center"
                >
                  MONTANT
                </th>
              </tr>
              <tr className="bg-gray-200">
                <th className="border border-gray-600 p-1"></th>
                <th className="border border-gray-600 p-1"></th>
                <th className="border border-gray-600 p-1 text-center">
                  EXERCICE N
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  EXERCICE N-1
                </th>
                <th className="border border-gray-600 p-1"></th>
                <th className="border border-gray-600 p-1"></th>
                <th className="border border-gray-600 p-1 text-center">
                  EXERCICE N
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  EXERCICE N-1
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Immobilisations (1)",
                  note: "1",
                  n: bilan.immobilisations.n,
                  n1: bilan.immobilisations.n1,
                  passif: "Compte exploitant",
                },
                {
                  label: "Stocks",
                  note: "2",
                  n: bilan.stocks.n,
                  n1: bilan.stocks.n1,
                  passif: "Résultat exercice",
                },
                {
                  label: "Clients et débiteurs divers",
                  note: "3",
                  n: bilan.clientsDebiteurs.n,
                  n1: bilan.clientsDebiteurs.n1,
                  passif: "Emprunt",
                },
                {
                  label: "Caisse (en + ou en -)",
                  note: "",
                  n: bilan.caisseBanque.n,
                  n1: bilan.caisseBanque.n1,
                  passif: "Fournisseurs et créditeurs divers",
                },
                {
                  label: "Banque (en + ou en -)",
                  note: "",
                  n: "",
                  n1: "",
                  passif: "",
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-600 p-2 pl-4">
                    {row.label}
                  </td>
                  <td className="border border-gray-600 p-2 text-center">
                    {row.note}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={row.n}
                        onChange={(e) =>
                          handleBilanChange(
                            row.label.toLowerCase().replace(/\s/g, ""),
                            "n",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      row.n
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {row.n1}
                  </td>
                  <td className="border border-gray-600 p-2 pl-4">
                    {row.passif}
                  </td>
                  <td className="border border-gray-600 p-2 text-center"></td>
                  <td className="border border-gray-600 p-2 text-right">0</td>
                  <td className="border border-gray-600 p-2 text-right">0</td>
                </tr>
              ))}

              {/* Totaux */}
              <tr className="total-gray font-bold">
                <td className="border border-gray-600 p-2 pl-4">Total actif</td>
                <td className="border border-gray-600 p-2"></td>
                <td className="border border-gray-600 p-2 text-right">
                  {bilan.totalActif.n}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {bilan.totalActif.n1}
                </td>
                <td className="border border-gray-600 p-2 pl-4">
                  Total passif
                </td>
                <td className="border border-gray-600 p-2"></td>
                <td className="border border-gray-600 p-2 text-right">
                  {bilan.totalPassif.n}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {bilan.totalPassif.n1}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-[10px] italic mt-2 px-2">
            (1) A faire figurer à l’actif du bilan si elles correspondent à des
            montants significatifs
          </div>

          {/* Compte de Résultat */}
          <div className="mt-8">
            <div className="title-gray py-2 px-4 font-bold text-center border border-gray-600">
              COMPTE DE RESULTAT SMT AU 31 DECEMBRE N
            </div>

            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-600 p-2 text-left">
                    RUBRIQUES
                  </th>
                  <th className="border border-gray-600 p-2 text-center">
                    NOTE
                  </th>
                  <th
                    colSpan={2}
                    className="border border-gray-600 p-2 text-center"
                  >
                    MONTANT
                  </th>
                </tr>
                <tr className="bg-gray-200">
                  <th className="border border-gray-600 p-1"></th>
                  <th className="border border-gray-600 p-1"></th>
                  <th className="border border-gray-600 p-1 text-center">
                    EXERCICE N
                  </th>
                  <th className="border border-gray-600 p-1 text-center">
                    EXERCICE N-1
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Lignes du compte de résultat */}
                <tr>
                  <td className="border border-gray-600 p-2 pl-4">
                    Recettes sur ventes ou prestations de services
                  </td>
                  <td className="border border-gray-600 p-2 text-center">4</td>
                  <td className="border border-gray-600 p-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={compteResultat.recettesPrestations.n}
                        onChange={(e) =>
                          handleCRChange(
                            "recettesPrestations",
                            "n",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      compteResultat.recettesPrestations.n
                    )}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.recettesPrestations.n1}
                  </td>
                </tr>
                {/* ... Ajouter toutes les autres lignes de la même façon ... */}
                {/* Exemple pour TOTAL RECETTES */}
                <tr className="total-gray font-bold">
                  <td className="border border-gray-600 p-2 pl-4">
                    TOTAL DES RECETTES SUR ACTIVITES
                  </td>
                  <td className="border border-gray-600 p-2 text-center">A</td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.totalRecettes.n}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.totalRecettes.n1}
                  </td>
                </tr>
                {/* TOTAL DEPENSES */}
                <tr className="total-gray font-bold">
                  <td className="border border-gray-600 p-2 pl-4">
                    TOTAL DEPENSES SUR CHARGES
                  </td>
                  <td className="border border-gray-600 p-2 text-center">B</td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.totalDepenses.n}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.totalDepenses.n1}
                  </td>
                </tr>
                {/* SOLDE */}
                <tr className="light-gray font-bold">
                  <td className="border border-gray-600 p-2 pl-4">
                    SOLDE : Excédent (+) ou insuffisance (-) de recettes (C=A-B)
                  </td>
                  <td className="border border-gray-600 p-2 text-center">C</td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.soldeC.n}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.soldeC.n1}
                  </td>
                </tr>
                {/* RESULTAT */}
                <tr className="dark-gray font-bold">
                  <td className="border border-gray-600 p-2 pl-4">
                    RESULTAT EXERCICE (G=C+D+F)
                  </td>
                  <td className="border border-gray-600 p-2 text-center">G</td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.resultatExerciceG.n}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {compteResultat.resultatExerciceG.n1}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeBilan;

