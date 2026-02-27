import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Types et Interfaces ---

interface RowData {
  id: string;
  label: string;
  yearN: number | string;
  yearNMinus1: number | string;
  isTotal?: boolean; // Pour le style gras/gris
  isHeader?: boolean; // Pour les lignes vides ou titres
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---

const Note5: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // État pour l'en-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  // État pour le commentaire
  const [comment, setComment] = useState("");

  // État pour le Tableau 1 (Actifs)
  const [assetsData, setAssetsData] = useState<RowData[]>([
    {
      id: "1",
      label: "Créances sur cessions d'immobilisations",
      yearN: 0,
      yearNMinus1: 0,
    },
    {
      id: "2",
      label: "Autres créances hors activités ordinaires",
      yearN: 0,
      yearNMinus1: 0,
    },
    { id: "3", label: "TOTAL BRUT", yearN: 0, yearNMinus1: 0, isTotal: true },
    {
      id: "4",
      label: "Dépréciation des créances HAO",
      yearN: 0,
      yearNMinus1: 0,
    },
    {
      id: "5",
      label: "TOTAL NET DE DEPRECIATION",
      yearN: 0,
      yearNMinus1: 0,
      isTotal: true,
    },
  ]);

  // État pour le Tableau 2 (Dettes)
  const [liabilitiesData, setLiabilitiesData] = useState<RowData[]>([
    {
      id: "6",
      label: "Fournisseurs d'investissements",
      yearN: 0,
      yearNMinus1: 0,
    },
    {
      id: "7",
      label: "Fournisseurs d'investissements effets à payer",
      yearN: 0,
      yearNMinus1: 0,
    },
    {
      id: "8",
      label: "Versements restant à effectuer sur titres",
      yearN: 0,
      yearNMinus1: 0,
    },
    {
      id: "9",
      label: "Autres dettes hors activités ordinaires",
      yearN: 0,
      yearNMinus1: 0,
    },
  ]);

  // --- Fonctions Utilitaires ---

  const calculateVariation = (n: number | string, n1: number | string) => {
    const valN = Number(n);
    const valN1 = Number(n1);
    if (valN1 === 0) return "-";
    const variation = ((valN - valN1) / valN1) * 100;
    return variation.toFixed(2) + "%";
  };

  const handleInputChange = (
    id: string,
    field: "yearN" | "yearNMinus1",
    value: string,
    isAssetTable: boolean
  ) => {
    const updateFn = isAssetTable ? setAssetsData : setLiabilitiesData;
    updateFn((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      // On force temporairement le mode lecture pour que le PDF soit propre (pas d'input boxes)
      const wasEditing = isEditing;
      setIsEditing(false);

      // Petit délai pour laisser React faire le rendu
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("rapport_hao_note_5.pdf");

        // Rétablir l'état d'édition si nécessaire
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu du composant ---

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-sm">
      {/* Barre d'outils supérieure */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Prévisualiser Rapport
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={18} /> Sauvegarder
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Zone du Rapport (Format A4) */}
      <div
        ref={reportRef}
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 text-black"
        style={{ border: "1px solid #e5e7eb" }}
      >
        {/* En-tête Excel-like */}
        <div className="mb-6 grid grid-cols-2 gap-x-12 gap-y-2">
          <div className="flex gap-2 items-center">
            <span className="font-bold w-40">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-blue-500 focus:outline-none px-1 flex-1 bg-blue-50"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <span className="font-bold w-40">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 focus:outline-none px-1 w-20 bg-blue-50"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <span className="font-bold w-40">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-blue-500 focus:outline-none px-1 flex-1 bg-blue-50"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <span className="font-bold w-40">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 focus:outline-none px-1 w-20 bg-blue-50"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre du Tableau */}
        <div className="bg-gray-200 border border-gray-400 py-1 text-center font-bold mb-0">
          NOTE 5 <br /> ACTIF CIRCULANT HAO
        </div>

        {/* Tableau 1 : Actifs */}
        <table className="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-2 text-center w-[40%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Année N
              </th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Année N-1
              </th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            {assetsData.map((row) => (
              <tr
                key={row.id}
                className={row.isTotal ? "bg-gray-100 font-bold" : ""}
              >
                <td className="border border-gray-400 p-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing && !row.isTotal ? (
                    <input
                      type="number"
                      value={row.yearN}
                      onChange={(e) =>
                        handleInputChange(row.id, "yearN", e.target.value, true)
                      }
                      className="w-full text-right bg-blue-50 px-1 focus:outline-none"
                    />
                  ) : (
                    Number(row.yearN).toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing && !row.isTotal ? (
                    <input
                      type="number"
                      value={row.yearNMinus1}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          "yearNMinus1",
                          e.target.value,
                          true
                        )
                      }
                      className="w-full text-right bg-blue-50 px-1 focus:outline-none"
                    />
                  ) : (
                    Number(row.yearNMinus1).toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-2 text-center bg-gray-50">
                  {calculateVariation(row.yearN, row.yearNMinus1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section Commentaire */}
        <div className="border border-gray-400 p-2 mb-4 bg-white min-h-[100px]">
          <div className="font-bold underline mb-1">Commentaire :</div>
          <ul className="list-disc pl-5 italic text-xs text-gray-600 mb-2">
            <li>Commenter toute variation significative.</li>
            <li>
              Dépréciation : indiquer les événements et les circonstances qui
              ont motivé la dépréciation ou la reprise
            </li>
          </ul>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-blue-300 bg-blue-50 text-sm focus:outline-none resize-none"
              placeholder="Saisir votre commentaire ici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm min-h-[2rem]">
              {comment || "Aucun commentaire."}
            </div>
          )}
        </div>

        {/* Tableau 2 : Dettes */}
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-2 text-center w-[40%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Année N
              </th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Année N-1
              </th>
              <th className="border border-gray-400 p-2 text-center w-[20%]">
                Variation en %
              </th>
            </tr>
          </thead>
          <tbody>
            {liabilitiesData.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.yearN}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          "yearN",
                          e.target.value,
                          false
                        )
                      }
                      className="w-full text-right bg-blue-50 px-1 focus:outline-none"
                    />
                  ) : (
                    Number(row.yearN).toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.yearNMinus1}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          "yearNMinus1",
                          e.target.value,
                          false
                        )
                      }
                      className="w-full text-right bg-blue-50 px-1 focus:outline-none"
                    />
                  ) : (
                    Number(row.yearNMinus1).toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-2 text-center bg-gray-50">
                  {calculateVariation(row.yearN, row.yearNMinus1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Numéro de page simulé */}
        <div className="text-center mt-4 font-bold">18</div>
      </div>
    </div>
  );
};

export default Note5;
