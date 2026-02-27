import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const T9: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [header, setHeader] = useState({
    designationEntite: "",
    numeroIdentification: "",
    exerciceClosLe: "",
    dureeMois: "12",
  });

  // Lignes mensuelles (12 mois + total)
  const [moisData, setMoisData] = useState([
    {
      mois: "Janvier",
      ligne: "1",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Février",
      ligne: "2",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Mars (ou 1ᵉʳ trimestre)",
      ligne: "3",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Avril",
      ligne: "4",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Mai",
      ligne: "5",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Juin (ou 2ᵉ trimestre)",
      ligne: "6",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Juillet",
      ligne: "7",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Août",
      ligne: "8",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Septembre (ou 3ᵉ trimestre)",
      ligne: "9",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Octobre",
      ligne: "10",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Novembre",
      ligne: "11",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
    {
      mois: "Décembre (ou 4ᵉ trimestre)",
      ligne: "12",
      precomptesAchats: "0",
      principal: "0",
      ccx: "0",
      retenuesCASubsidies: "0",
      autresPrelevements: "0",
    },
  ]);

  const calculateTotal = (field: keyof (typeof moisData)[0]) => {
    return moisData.reduce((sum, row) => sum + Number(row[field] || 0), 0);
  };

  const calculateTotalForRow = (index: number) => {
    const row = moisData[index];
    return (
      Number(row.precomptesAchats || 0) +
      Number(row.principal || 0) +
      Number(row.ccx || 0) +
      Number(row.retenuesCASubsidies || 0) +
      Number(row.autresPrelevements || 0)
    );
  };

  const calculateGrandTotal = () => {
    return moisData.reduce(
      (sum, row, index) => sum + calculateTotalForRow(index),
      0
    );
  };

  const handleHeaderChange = (field: string, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleCellChange = (
    index: number,
    field: keyof (typeof moisData)[0],
    value: string
  ) => {
    const newData = [...moisData];
    newData[index] = { ...newData[index], [field]: value };
    setMoisData(newData);
  };

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
      pdf.save("t9_recap_versements_acomptes_retenues.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans text-xs">
      {/* Barre d'actions */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-700" />
          T9 - Récapitulatif des versements d'acomptes et de retenues
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
        <style>{`
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
          T9 - TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT :
          RÉCAPITULATIF DES VERSEMENTS D'ACOMPTES ET DE RETENUES SUBIES D'IMPÔT
          SUR LES SOCIÉTÉS DE L'EXERCICE
        </div>

        {/* Tableau principal */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  MOIS
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-16">
                  Ligne
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Précomptes sur achats
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Acomptes versés au titre de l'impôt - Principal
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Acomptes versés au titre de l'impôt - CCX
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Retenues à la source sur le CA subies
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  Autres prélèvements
                </th>
                <th className="border border-gray-600 p-2 font-bold text-center w-44">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {moisData.map((mois, index) => (
                <tr key={index}>
                  <td className="border border-gray-600 p-2 pl-4">
                    {mois.mois}
                  </td>
                  <td className="border border-gray-600 p-2 text-center">
                    {mois.ligne}
                  </td>
                  {[
                    "precomptesAchats",
                    "principal",
                    "ccx",
                    "retenuesCASubsidies",
                    "autresPrelevements",
                  ].map((field) => (
                    <td
                      key={field}
                      className="border border-gray-600 p-2 text-right"
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={mois[field as keyof typeof mois]}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              field as any,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        Number(mois[field as keyof typeof mois]).toLocaleString(
                          "fr-FR"
                        )
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-600 p-2 text-right font-medium">
                    {calculateTotalForRow(index).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}

              {/* Total général */}
              <tr className="total-row font-bold">
                <td className="border border-gray-600 p-2 pl-8">
                  Totaux (ligne 1 à 12)
                </td>
                <td className="border border-gray-600 p-2 text-center">13</td>
                <td className="border border-gray-600 p-2 text-right">
                  {calculateTotal("precomptesAchats").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {calculateTotal("principal").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {calculateTotal("ccx").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {calculateTotal("retenuesCASubsidies").toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-600 p-2 text-right">
                  {calculateTotal("autresPrelevements").toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-600 p-2 text-right font-extrabold">
                  {calculateGrandTotal().toLocaleString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>

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

export default T9;
