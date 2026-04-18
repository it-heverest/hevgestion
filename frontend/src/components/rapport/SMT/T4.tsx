import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const T4: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Tableau principal : Extrait balance fournisseurs
  const [balanceRows, setBalanceRows] = useState([
    {
      compte: "401",
      libelle: "Fournisseurs - Achats de biens et services",
      soldeOuvertureDebit: "0",
      soldeOuvertureCredit: "0",
      mouvementsDebit: "0",
      mouvementsCredit: "0",
      soldeClotureDebit: "0",
      soldeClotureCredit: "0",
      variationDebit: "0",
      variationCredit: "0",
    },
    {
      compte: "402",
      libelle: "Fournisseurs - Immobilisations",
      soldeOuvertureDebit: "0",
      soldeOuvertureCredit: "0",
      mouvementsDebit: "0",
      mouvementsCredit: "0",
      soldeClotureDebit: "0",
      soldeClotureCredit: "0",
      variationDebit: "0",
      variationCredit: "0",
    },
    // Ajouter d'autres comptes au besoin...
  ]);

  // Détail compte 60 - Achats
  const [achatsRows, setAchatsRows] = useState([
    {
      ligne: "1",
      rubrique: "Routier",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
    {
      ligne: "2",
      rubrique: "Ferroviaire",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
    {
      ligne: "3",
      rubrique: "Par eau",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
    {
      ligne: "4",
      rubrique: "Par air",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
    {
      ligne: "5",
      rubrique: "Auxiliaire",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
    {
      ligne: "6",
      rubrique: "Transports internationaux",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
    {
      ligne: "7",
      rubrique: "Gains de change",
      quantite: "0",
      prixUnitaire: "0",
      total: "0",
    },
  ]);

  // Détail compte 61 - Transports
  const [transportsRows, setTransportsRows] = useState([
    {
      compte: "611",
      objet: "Transport sur achats",
      lignes: "7",
      routier: "0",
      ferroviaire: "0",
      eau: "0",
      air: "0",
      auxiliaire: "0",
      tes: "0",
      total: "0",
    },
    {
      compte: "613",
      objet: "Transports pour compte de tiers",
      lignes: "9",
      routier: "0",
      ferroviaire: "0",
      eau: "0",
      air: "0",
      auxiliaire: "0",
      tes: "0",
      total: "0",
    },
    {
      compte: "616",
      objet: "Transports du personnel",
      lignes: "11",
      routier: "0",
      ferroviaire: "0",
      eau: "0",
      air: "0",
      auxiliaire: "0",
      tes: "0",
      total: "0",
    },
    {
      compte: "618",
      objet: "Autres frais de transport",
      lignes: "12",
      routier: "0",
      ferroviaire: "0",
      eau: "0",
      air: "0",
      auxiliaire: "0",
      tes: "0",
      total: "0",
    },
  ]);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(reportRef.current!, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("t4_extrait_balance_fournisseurs.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T4 - Extrait de la balance générale fournisseurs
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow transition-all ${
              isEditing
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {isEditing ? <X size={18} /> : <Pencil size={18} />}
            {isEditing ? "Annuler" : "Éditer"}
          </button>

          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                alert("Modifications enregistrées !");
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow"
            >
              <Save size={18} /> Sauvegarder
            </button>
          )}

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-all shadow"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Document A4 paysage */}
      <div
        ref={reportRef}
        className="max-w-[297mm] mx-auto bg-white shadow-2xl border border-gray-300 rounded-lg overflow-hidden"
      >
        <style jsx>{`
          .header-gray {
            background-color: #e0e0e0;
          }
          .title-gray {
            background-color: #d0d0d0;
            font-weight: bold;
          }
          .total-row {
            background-color: #c0c0c0;
            font-weight: bold;
          }
          .edit-input {
            width: 100%;
            padding: 4px 6px;
            border: 1px solid #999;
            border-radius: 4px;
            background: #fff9e6;
            font-size: 11px;
            text-align: right;
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
                value={header.designationEntite}
                onChange={(e) =>
                  setHeader({ ...header, designationEntite: e.target.value })
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 flex-1 min-h-[22px]">
                {header.designationEntite || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12- :
            </span>
            {isEditing ? (
              <input
                className="edit-input w-44 text-center"
                value={header.exerciceClosLe}
                onChange={(e) =>
                  setHeader({ ...header, exerciceClosLe: e.target.value })
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 w-44 text-center">
                {header.exerciceClosLe || ""}
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
                value={header.numeroIdentification}
                onChange={(e) =>
                  setHeader({ ...header, numeroIdentification: e.target.value })
                }
              />
            ) : (
              <span className="border-b border-dotted border-gray-600 flex-1 min-h-[22px]">
                {header.numeroIdentification || ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            <span className="border-b border-dotted border-gray-600 w-16 text-center">
              {header.dureeMois}
            </span>
          </div>
        </div>

        {/* Titre principal */}
        <div className="title-gray py-4 text-center font-bold text-base border-b-2 border-gray-700">
          T4 - EXTRAIT DE LA BALANCE GÉNÉRALE FOURNISSEURS
        </div>

        {/* Tableau principal : Extrait balance */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px] mb-10">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-center w-28">
                  No Compte
                </th>
                <th className="border border-gray-600 p-2 font-bold text-left">
                  Solde ouverture
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center"
                >
                  Mouvements
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center"
                >
                  Solde clôture
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-600 p-2 font-bold text-center"
                >
                  Variation
                </th>
              </tr>
              <tr className="bg-gray-200">
                <th className="border border-gray-600 p-1"></th>
                <th className="border border-gray-600 p-1"></th>
                <th className="border border-gray-600 p-1 text-center">
                  Débit
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  Crédit
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  Débit
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  Crédit
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  Débit
                </th>
                <th className="border border-gray-600 p-1 text-center">
                  Crédit
                </th>
              </tr>
            </thead>
            <tbody>
              {balanceRows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-600 p-2 text-center">
                    {row.compte}
                  </td>
                  <td className="border border-gray-600 p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-input text-right"
                        value={row.soldeOuvertureDebit}
                        onChange={(e) => {
                          const newRows = [...balanceRows];
                          newRows[index].soldeOuvertureDebit = e.target.value;
                          setBalanceRows(newRows);
                        }}
                      />
                    ) : (
                      row.soldeOuvertureDebit
                    )}
                  </td>
                  {/* Répéter pour chaque colonne... */}
                  <td className="border border-gray-600 p-2 text-right">
                    {row.mouvementsDebit}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {row.mouvementsCredit}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {row.soldeClotureDebit}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {row.soldeClotureCredit}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {row.variationDebit}
                  </td>
                  <td className="border border-gray-600 p-2 text-right">
                    {row.variationCredit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Détail compte 60 - Achats */}
          <div className="mt-12">
            <div className="title-gray py-2 px-4 font-bold border border-gray-600">
              DÉTAIL DU COMPTE ACHATS - Compte 60 Achats
            </div>

            <table className="w-full border-collapse text-[11px] mt-2">
              <thead>
                <tr className="bg-gray-300">
                  <th className="border border-gray-600 p-2 font-bold text-center w-16">
                    No Compte
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-left">
                    RUBRIQUES
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center w-16">
                    Lignes
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center w-28">
                    Quantité
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center w-28">
                    Prix Unitaire
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center w-36">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {achatsRows.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-600 p-2 text-center">
                      {row.ligne}
                    </td>
                    <td className="border border-gray-600 p-2 pl-4">
                      {row.rubrique}
                    </td>
                    <td className="border border-gray-600 p-2 text-center">
                      {row.ligne}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-right"
                          value={row.quantite}
                        />
                      ) : (
                        row.quantite
                      )}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-right"
                          value={row.prixUnitaire}
                        />
                      ) : (
                        row.prixUnitaire
                      )}
                    </td>
                    <td className="border border-gray-600 p-2 text-right font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input text-right"
                          value={row.total}
                        />
                      ) : (
                        row.total
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Détail compte 61 - Transports */}
          <div className="mt-12">
            <div className="title-gray py-2 px-4 font-bold border border-gray-600">
              COMPTE 61 : SUPPORTS AUX CAMEROUNAIS - SUPPORTS TRANSPORTS
            </div>

            <table className="w-full border-collapse text-[11px] mt-2">
              <thead>
                <tr className="bg-gray-300">
                  <th className="border border-gray-600 p-2 font-bold text-center w-16">
                    Compte
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-left">
                    OBJET DU TRANSPORT
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center w-16">
                    Lignes
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    Routier
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    Ferroviaire
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    Par Eau
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    Par Air
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    Auxiliaire des Transports
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    TES
                  </th>
                  <th className="border border-gray-600 p-2 font-bold text-center">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {transportsRows.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-600 p-2 text-center">
                      {row.compte}
                    </td>
                    <td className="border border-gray-600 p-2 pl-4">
                      {row.objet}
                    </td>
                    <td className="border border-gray-600 p-2 text-center">
                      {row.lignes}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {row.routier}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {row.ferroviaire}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {row.eau}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {row.air}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {row.auxiliaire}
                    </td>
                    <td className="border border-gray-600 p-2 text-right">
                      {row.tes}
                    </td>
                    <td className="border border-gray-600 p-2 text-right font-medium">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note finale */}
          <div className="mt-8 px-4 pb-6 text-[10px] italic text-gray-700 text-center">
            * Bien vouloir annexer la balance générale fournisseurs en pièce
            jointe selon le modèle ci-dessus
          </div>
        </div>
      </div>
    </div>
  );
};

export default T4;

