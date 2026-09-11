import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";

interface TaxRow {
  id: string;
  label: string;
  indent?: number;
  isSubItem?: boolean;
  isCategory?: boolean;
  isTotal?: boolean;
  anneeN: number;
  regularisation: number;
  anneeN1: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const T5: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  const [rows, setRows] = useState<TaxRow[]>([
    {
      id: "r1",
      label: "Impôts sur les Société",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r2",
      label: "Impôt sur le Revenue des Personnes",
      indent: 1,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r3",
      label: "Traitements, salaires, rentes viagères",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r4",
      label: "Revenu des Capitaux Mobilier (IRCM)",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r5",
      label: "Revenus fonciers",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r6",
      label: "Bénéfices artisanaux, industriels, et",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r7",
      label: "Bénéfice agricole",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r8",
      label: "Bénéfice des professions non commerciales",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r9",
      label: "Revenus non commerciaux",
      indent: 2,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r10",
      label: "Taxe sur la Valeur Ajoutée",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r11",
      label: "Droits d'accises",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r12",
      label: "Asf tcladong",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r13",
      label: "Au taux de 25%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r14",
      label: "Au taux de 12.5%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r15",
      label: "Au taux de 10%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r16",
      label: "Au taux de 2%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r17",
      label: "Spécifiques",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r18",
      label: "Boissons alcoolisées",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r19",
      label: "Emballages non retournables (boissons",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r20",
      label: "alcoolisées et gazeuses)",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r21",
      label: "Autres emballages",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r22",
      label: "Taxe sur les jeux",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r23",
      label: "Taxe de séjour",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r24",
      label: "Taxe Spéciale sur les Revenus",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r25",
      label: "Au taux général de 15%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r26",
      label: "Au taux réduit de 7.5%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r27",
      label: "Au taux réduit de 5%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r28",
      label: "Au taux majoré de 2%",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r29",
      label: "Taxe Spéciale sur les Produits",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r30",
      label: "Taxes minières",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r31",
      label: "Taxe à l'extraction",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r32",
      label: "Taxe ad valorem",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r33",
      label: "Autres taxes minières",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r34",
      label: "Recette des forêts",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r35",
      label: "Taxe d'abattage",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r36",
      label: "Redevance Forestière Annuelle (RFA)",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r37",
      label: "Autres taxes forestières",
      indent: 1,
      isSubItem: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r38",
      label: "Droit de timbre automobile",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r39",
      label: "Droits d'enregistrement",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r40",
      label: "Taxe à l'essieu",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r41",
      label: "Taxe foncière",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r42",
      label: "Droit de timbre d'aéroport",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r43",
      label: "Timbre sur la publicité",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
    {
      id: "r44",
      label: "Autres impôts et taxes",
      isCategory: true,
      anneeN: 0,
      regularisation: 0,
      anneeN1: 0,
    },
  ]);

  const totalAnneeN = rows.reduce((acc, r) => acc + r.anneeN, 0);
  const totalRegularisation = rows.reduce(
    (acc, r) => acc + r.regularisation,
    0
  );
  const totalAnneeN1 = rows.reduce((acc, r) => acc + r.anneeN1, 0);

  const variationPercent = (n: number, n1: number) =>
    n1 === 0 ? "-" : (((n - n1) / Math.abs(n1)) * 100).toFixed(0) + "%";

  const handleRowChange = (
    id: string,
    field: "anneeN" | "regularisation" | "anneeN1",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const renderCell = (
    row: TaxRow,
    field: "anneeN" | "regularisation" | "anneeN1"
  ) => {
    if (isEditing) {
      return (
        <input
          type="number"
          value={row[field]}
          onChange={(e) => handleRowChange(row.id, field, e.target.value)}
          className="w-full h-full px-2 py-1 bg-orange-50 border-0 focus:outline-none text-right"
        />
      );
    }
    return row[field] !== 0 ? row[field].toLocaleString("fr-FR").replace(/\u202F/g, " ") : "";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <style>{`
        .header-gray {
          background-color: #d9d9d9;
        }
        .header-black {
          background-color: #000000;
          color: #ffffff;
        }
        .pattern-gray {
          background-image: repeating-linear-gradient(
            45deg,
            #d9d9d9,
            #d9d9d9 2px,
            #bfbfbf 2px,
            #bfbfbf 4px
          );
        }
        .total-row {
          background-color: #d9d9d9;
          font-weight: bold;
        }
        table {
          border-collapse: collapse;
        }
        td, th {
          border: 1px solid #000000;
        }
      `}</style>

      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 15 - Synthèse des Impôts et Taxes Versés
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} /> : <Pencil size={18} />}
          </button>
          <button className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">16</div>

        {/* En-tête avec champs */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12- :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-24 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-24">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre NOTE 15 */}
        <div className="header-gray text-center font-bold py-2 mb-4">
          15
          <br />
          SYNTHESE DES IMPOTS ET TAXES VERSES
        </div>

        {/* Tableau */}
        <table className="w-full text-[10px]">
          <thead>
            <tr className="header-black">
              <th className="p-2 text-left w-[40%]">Libellés</th>
              <th className="p-2 text-center w-[15%]">Année N</th>
              <th className="p-2 text-center w-[15%]">Régularisation</th>
              <th className="p-2 text-center w-[15%]">Année N-1</th>
              <th className="p-2 text-center w-[15%]">Variation en %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const paddingLeft = row.indent
                ? `${row.indent * 1.5}rem`
                : "0.5rem";
              const bgClass = row.isCategory ? "pattern-gray" : "";
              const fontWeight = row.isCategory ? "font-semibold" : "";

              return (
                <tr key={row.id} className={bgClass}>
                  <td className={`p-0 ${fontWeight}`} style={{ paddingLeft }}>
                    <div className="py-1">{row.label}</div>
                  </td>
                  <td className={`p-0 text-right ${bgClass}`}>
                    {renderCell(row, "anneeN")}
                  </td>
                  <td className={`p-0 text-right ${bgClass}`}>
                    {renderCell(row, "regularisation")}
                  </td>
                  <td className={`p-0 text-right ${bgClass}`}>
                    {renderCell(row, "anneeN1")}
                  </td>
                  <td className={`p-0 text-right ${bgClass}`}>
                    {row.anneeN !== 0 || row.anneeN1 !== 0
                      ? variationPercent(row.anneeN, row.anneeN1)
                      : ""}
                  </td>
                </tr>
              );
            })}

            {/* Ligne Total */}
            <tr className="total-row">
              <td className="p-2 text-center font-bold">Total</td>
              <td className="p-2 text-right font-bold">
                {totalAnneeN.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="p-2 text-right font-bold">
                {totalRegularisation.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="p-2 text-right font-bold">
                {totalAnneeN1.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
              <td className="p-2 text-right font-bold">
                {variationPercent(totalAnneeN, totalAnneeN1)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section commentaires */}
        <div className="mt-4">
          <div className="font-bold italic mb-1">
            *Tolérance à lier de la valeur du poste Dû
          </div>
          <div className="font-bold mb-2">Commentaire :</div>

          {isEditing ? (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-400 p-2 min-h-[60px] bg-orange-50"
              placeholder="Commenter toute variation significative."
            />
          ) : (
            <div className="border border-gray-400 p-2 min-h-[60px]">
              {comment || "Commenter toute variation significative."}
            </div>
          )}

          <div className="mt-1 text-[9px]">
            Détailler les postes de taxes et indiquer la cause.
          </div>
        </div>
      </div>
    </div>
  );
};

export default T5;

