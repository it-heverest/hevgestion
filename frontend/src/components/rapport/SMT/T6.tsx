import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";

interface Row {
  id: string;
  label: string;
  lineNumber: string;
  montants: number;
  isHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isCategory?: boolean;
  indent?: number;
  hasPattern?: boolean;
}

interface RubriqueRow {
  id: string;
  label: string;
  ligne: string;
  bases: string;
  taux: string;
  principalDe: number;
  hasPattern?: boolean;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const T6: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  const [rows, setRows] = useState<Row[]>([
    {
      id: "r1",
      label: "BENEFICE NET COMPTABLE AVANT IMPOT",
      lineNumber: "1",
      montants: 0,
      isHeader: true,
    },
    {
      id: "r2",
      label: "PERTE NETTE COMPTABLE AVNT IMPOT",
      lineNumber: "2",
      montants: 0,
      isHeader: true,
    },
    { id: "r3", label: "", lineNumber: "", montants: 0 },
    {
      id: "r4",
      label: "Amortissement non déductible",
      lineNumber: "3",
      montants: 0,
    },
    {
      id: "r5",
      label:
        "Amortissement comptabilisés mais réputés différés en période déficitaire",
      lineNumber: "4",
      montants: 0,
    },
    {
      id: "r6",
      label: "• Provisions non déductible",
      lineNumber: "5",
      montants: 0,
    },
    {
      id: "r7",
      label: "Intérêt excédentaires des comptes courants d'associés",
      lineNumber: "6",
      montants: 0,
    },
    {
      id: "r8",
      label: "• Frais de siège et d'assistance technique",
      lineNumber: "7",
      montants: 0,
    },
    {
      id: "r9",
      label: "Impôt non déductibles autres qu'impôt sur le résultat",
      lineNumber: "8",
      montants: 0,
    },
    {
      id: "r10",
      label: "Amendes et pénalités de toute nature",
      lineNumber: "9",
      montants: 0,
    },
    {
      id: "r11",
      label: "• Pourboires et dons non déductible",
      lineNumber: "10",
      montants: 0,
    },
    {
      id: "r12",
      label: "Retenue à la source(IRNC) sur revenus des capitaux mobiliers",
      lineNumber: "11",
      montants: 0,
    },
    { id: "r13", label: "Divers 1", lineNumber: "12", montants: 0 },
    { id: "r14", label: "Divers 2", lineNumber: "13", montants: 0 },
    { id: "r15", label: "Divers 3", lineNumber: "14", montants: 0 },
    {
      id: "r16",
      label: "REINTEGRATIONS : totaux lignes 3 à 14",
      lineNumber: "15",
      montants: 0,
      isSubtotal: true,
      hasPattern: true,
    },
    { id: "r17", label: "", lineNumber: "", montants: 0 },
    {
      id: "r18",
      label: "Total intermédiaire POSITIF : ligne 15ligne1ou ligne2",
      lineNumber: "16",
      montants: 0,
      hasPattern: true,
    },
    {
      id: "r19",
      label: "Total intermédiaire NEGATIF : ligne2-ligne 15",
      lineNumber: "17",
      montants: 0,
      hasPattern: true,
    },
    { id: "r20", label: "", lineNumber: "", montants: 0 },
    {
      id: "r21",
      label: "Amortissement antérieur différé et imputés sur l'exercice",
      lineNumber: "18",
      montants: 0,
    },
    {
      id: "r22",
      label:
        "Provisions antérieurement taxés ou défintivement devenus réintegrées dans",
      lineNumber: "19",
      montants: 0,
    },
    {
      id: "r23",
      label:
        "• Fraction non imposabie des plus-values réalisées en fin d'exploitation",
      lineNumber: "20",
      montants: 0,
    },
    {
      id: "r24",
      label:
        "• Produit nets des initials ( après déduction de la quote-part de frais et charges)",
      lineNumber: "21",
      montants: 0,
    },
    {
      id: "r25",
      label: "• Autres revenus mobilier et divisibles",
      lineNumber: "22",
      montants: 0,
    },
    {
      id: "r26",
      label: "• Plus de siège et dividisions technique déductibles",
      lineNumber: "23",
      montants: 0,
    },
    { id: "r27", label: "Divers 1", lineNumber: "24", montants: 0 },
    { id: "r28", label: "Divers 2", lineNumber: "25", montants: 0 },
    { id: "r29", label: "Divers 3", lineNumber: "26", montants: 0 },
    {
      id: "r30",
      label: "DEDUCTIONS : totaux lignes 18 à 26",
      lineNumber: "27",
      montants: 0,
      isSubtotal: true,
      hasPattern: true,
    },
    { id: "r31", label: "", lineNumber: "", montants: 0 },
    {
      id: "r32",
      label: "BENEFICE FISCAL DE L'EXERCICE : ligne 16 - ligne 27",
      lineNumber: "28",
      montants: 0,
      isTotal: true,
      hasPattern: true,
    },
    {
      id: "r33",
      label: "PERTE FISCALE DE L'EXERCICE : ligne 27 - ligne 16 ou ligne 17 -",
      lineNumber: "29",
      montants: 0,
      isTotal: true,
      hasPattern: true,
    },
  ]);

  const [rubriques, setRubriques] = useState<RubriqueRow[]>([
    {
      id: "rub1",
      label: "Minimum de perception",
      ligne: "30",
      bases: "",
      taux: "2%",
      principalDe: 0,
      hasPattern: true,
    },
    {
      id: "rub2",
      label: "Impôt sur les sociétés",
      ligne: "31",
      bases: "",
      taux: "",
      principalDe: 0,
    },
    {
      id: "rub3",
      label: "BIC et BNC",
      ligne: "32",
      bases: "",
      taux: "22%",
      principalDe: 0,
      hasPattern: true,
    },
    {
      id: "rub4",
      label: "BA",
      ligne: "33",
      bases: "",
      taux: "",
      principalDe: 0,
    },
    {
      id: "rub5",
      label: "Bénéfice artisanau",
      ligne: "34",
      bases: "",
      taux: "11%",
      principalDe: 0,
      hasPattern: true,
    },
    { id: "rub6", label: "", ligne: "35", bases: "", taux: "", principalDe: 0 },
    { id: "rub7", label: "", ligne: "36", bases: "", taux: "", principalDe: 0 },
    {
      id: "rub8",
      label: "Bénéficiares agricoles",
      ligne: "37",
      bases: "",
      taux: "",
      principalDe: 0,
    },
    {
      id: "rub9",
      label: "IFC",
      ligne: "38",
      bases: "",
      taux: "15%",
      principalDe: 0,
      hasPattern: true,
    },
    {
      id: "rub10",
      label: "TOTAL lignes 32 à 38",
      ligne: "39",
      bases: "",
      taux: "",
      principalDe: 0,
    },
  ]);

  const handleRowChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, montants: Number(value) || 0 } : row
      )
    );
  };

  const handleRubriqueChange = (
    id: string,
    field: keyof RubriqueRow,
    value: string
  ) => {
    setRubriques((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "principalDe" ? Number(value) || 0 : value,
            }
          : row
      )
    );
  };

  const renderCell = (row: Row) => {
    if (
      isEditing &&
      !row.isSubtotal &&
      !row.isTotal &&
      !row.isHeader &&
      row.lineNumber !== ""
    ) {
      return (
        <input
          type="number"
          value={row.montants === 0 ? "" : row.montants}
          onChange={(e) => handleRowChange(row.id, e.target.value)}
          className="w-full h-full px-2 py-1 bg-blue-50 border-0 focus:outline-none text-right"
          placeholder="0"
        />
      );
    }
    return row.montants !== 0 ? row.montants.toLocaleString("fr-FR") : "";
  };

  const renderRubriqueCell = (
    rubrique: RubriqueRow,
    field: "bases" | "principalDe"
  ) => {
    if (isEditing && rubrique.label !== "") {
      if (field === "principalDe") {
        return (
          <input
            type="number"
            value={rubrique.principalDe === 0 ? "" : rubrique.principalDe}
            onChange={(e) =>
              handleRubriqueChange(rubrique.id, "principalDe", e.target.value)
            }
            className="w-full h-full px-2 py-1 bg-blue-50 border-0 focus:outline-none text-right"
            placeholder="0"
          />
        );
      } else {
        return (
          <input
            type="text"
            value={rubrique.bases}
            onChange={(e) =>
              handleRubriqueChange(rubrique.id, "bases", e.target.value)
            }
            className="w-full h-full px-2 py-1 bg-blue-50 border-0 focus:outline-none text-center"
            placeholder=""
          />
        );
      }
    }

    if (field === "principalDe") {
      return rubrique.principalDe !== 0
        ? rubrique.principalDe.toLocaleString("fr-FR")
        : "";
    } else {
      return rubrique.bases || "";
    }
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
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        table {
          border-collapse: collapse;
        }
        td, th {
          border: 1px solid #000000;
          padding: 2px;
        }
        input {
          font-size: 9px;
        }
      `}</style>

      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 17 - Passage du Résultat Comptable au Résultat Fiscal
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
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">17</div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap text-[10px]">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1 text-[10px]"
                placeholder="Nom de l'entité"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1 min-h-[20px] flex items-center">
                {headerInfo.entityName || " "}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center justify-end">
            <span className="font-bold whitespace-nowrap text-[10px]">
              Exercice clos le 31-12- :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-24 px-1 text-[10px]"
                placeholder="2024"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-24 min-h-[20px] flex items-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap text-[10px]">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1 text-[10px]"
                placeholder="Numéro d'ID"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1 min-h-[20px] flex items-center">
                {headerInfo.idNumber || " "}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center justify-end">
            <span className="font-bold whitespace-nowrap text-[10px]">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1 text-[10px]"
                placeholder="12"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 min-h-[20px] flex items-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre */}
        <div className="header-gray text-center font-bold py-2 mb-4 text-[11px]">
          17
          <br />
          TABLEAU DE PASSAGE DU RESULTAT COMPTABLE AVANT IMPOT AU RESULTAT
          FISCAL
        </div>

        {/* Tableau principal */}
        <table className="w-full text-[9px] mb-6">
          <thead>
            <tr>
              <th rowSpan={2} className=" p-1 text-left w-[8%] align-middle">
                {/* <div className="vertical-text text-center h-32">
                  SURCENU RESULTAT
                </div> */}
              </th>
              <th rowSpan={2} className=" p-1 w-[60%]"></th>
              <th rowSpan={2} className="p-1 text-center w-[8%]">
                <div className="vertical-text mx-auto h-40">ligne</div>
              </th>
              <th rowSpan={2} className="p-1 text-center w-[24%]">
                Montants
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Section AVANT IMPOT SUR - Ligne 1 */}
            <tr>
              <td rowSpan={2} className="font-bold text-center align-middle">
                <div className="vertical-text mx-auto h-32 text-[8px]">
                  {" "}
                  {/* text-[11px] au lieu de text-[9px] par défaut */}
                  SOLDE DU RESULTAT NET AVANT <br />
                  IMPOT SUR LE RESULTAT
                </div>
              </td>
              <td className="p-3 font-bold text-[9px]">LE RESULTAT</td>
              <td className="p-1 text-center">1</td>
              <td className="p-1 h-8">{renderCell(rows[0])}</td>
            </tr>

            {/* Ligne 2 */}
            <tr>
              <td className="p-1 font-bold text-[9px]">
                PERTE NETTE COMPTABLE AVANT IMPOT
              </td>
              <td className="p-1 text-center">2</td>
              <td className="p-1 h-8">{renderCell(rows[1])}</td>
            </tr>

            {/* Ligne vide */}
            <tr>
              <td colSpan={4} className="p-0 h-2"></td>
            </tr>

            {/* Section CHARGES ET PRODUITS A REINTEGRER */}
            <tr>
              <td rowSpan={13} className="font-bold text-center align-top pt-2">
                <div className="vertical-text mx-auto h-96">
                  REINTEGRATION DES CHARGES OU PERTES
                  <br />
                  NON DEDUCTIBLES OU PARTIELLEMENT <br />
                  DEDUCTIBLES DU POINT DE VUE FISCAL
                </div>
              </td>
              <td className="p-1 text-[9px]">{rows[3].label}</td>
              <td className="p-1 text-center">{rows[3].lineNumber}</td>
              <td className="p-1 h-8">{renderCell(rows[3])}</td>
            </tr>

            {/* Lignes 4 à 14 */}
            {rows.slice(4, 15).map((row) => (
              <tr key={row.id}>
                <td className="p-1 text-[9px]">{row.label}</td>
                <td className="p-1 text-center">{row.lineNumber}</td>
                <td className="p-1 h-8">{renderCell(row)}</td>
              </tr>
            ))}

            {/* Ligne 15 - REINTEGRATIONS */}
            <tr>
              <td
                className={`p-1 font-bold text-[9px] ${
                  rows[15].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[15].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rows[15].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[15].lineNumber}
              </td>
              <td
                className={`p-1 h-8 ${
                  rows[15].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderCell(rows[15])}
              </td>
            </tr>

            {/* Ligne vide */}
            <tr>
              <td colSpan={4} className="p-0 h-2"></td>
            </tr>

            {/* Ligne 16 - Total intermédiaire POSITIF */}
            <tr>
              <td></td>
              <td
                className={`p-1 text-[9px] ${
                  rows[17].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[17].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rows[17].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[17].lineNumber}
              </td>
              <td
                className={`p-1 h-8 ${
                  rows[17].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderCell(rows[17])}
              </td>
            </tr>

            {/* Ligne 17 - Total intermédiaire NEGATIF */}
            <tr>
              <td></td>
              <td
                className={`p-1 text-[9px] ${
                  rows[18].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[18].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rows[18].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[18].lineNumber}
              </td>
              <td
                className={`p-1 h-8 ${
                  rows[18].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderCell(rows[18])}
              </td>
            </tr>

            {/* Ligne vide */}
            <tr>
              <td colSpan={4} className="p-0 h-2"></td>
            </tr>

            {/* Section PRODUITS A DEDUIRE */}
            <tr>
              <td rowSpan={11} className="font-bold text-center align-top pt-2">
                <div className="vertical-text mx-auto h-80">
                  PRODUITS A DEDUIRE
                </div>
              </td>
              <td className="p-1 text-[9px]">{rows[20].label}</td>
              <td className="p-1 text-center">{rows[20].lineNumber}</td>
              <td className="p-1 h-8">{renderCell(rows[20])}</td>
            </tr>

            {/* Lignes 19 à 26 */}
            {rows.slice(21, 29).map((row) => (
              <tr key={row.id}>
                <td className="p-1 text-[9px]">{row.label}</td>
                <td className="p-1 text-center">{row.lineNumber}</td>
                <td className="p-1 h-8">{renderCell(row)}</td>
              </tr>
            ))}

            {/* Ligne 27 - DEDUCTIONS */}
            <tr>
              <td
                className={`p-1 font-bold text-[9px] ${
                  rows[29].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[29].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rows[29].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[29].lineNumber}
              </td>
              <td
                className={`p-1 h-8 ${
                  rows[29].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderCell(rows[29])}
              </td>
            </tr>

            {/* Ligne vide */}
            <tr>
              <td colSpan={4} className="p-0 h-2"></td>
            </tr>

            {/* Section BENEFICE FISCAL - Ligne 28 */}
            <tr>
              <td rowSpan={2} className="font-bold text-center align-middle">
                <div className="vertical-text mx-auto h-16">
                  BENEFICE FISCAL
                </div>
              </td>
              <td
                className={`p-1 font-bold text-[9px] ${
                  rows[31].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[31].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rows[31].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[31].lineNumber}
              </td>
              <td
                className={`p-1 h-8 ${
                  rows[31].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderCell(rows[31])}
              </td>
            </tr>

            {/* Ligne 29 - PERTE FISCALE */}
            <tr>
              <td
                className={`p-1 font-bold text-[9px] ${
                  rows[32].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[32].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rows[32].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rows[32].lineNumber}
              </td>
              <td
                className={`p-1 h-8 ${
                  rows[32].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderCell(rows[32])}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tableau RUBRIQUES */}
        <table className="w-full text-[9px]">
          <thead>
            <tr>
              <th rowSpan={3} className="header-black p-1 w-[12%] align-middle">
                <div className="vertical-text mx-auto h-40">
                  L'ENTREPRISE LA REGIM E
                </div>
              </th>
              <th rowSpan={3} className="header-black p-1 w-[10%] align-middle">
                <div className="vertical-text mx-auto h-40">
                  IMPOT SUR LE BENEFICE OU PERCEPTION
                </div>
              </th>
              <th rowSpan={3} className="header-black p-1 w-[35%]">
                RUBRIQUES
              </th>
              <th rowSpan={3} className="header-black p-1 w-[8%]">
                LIGNE
              </th>
              <th rowSpan={3} className="header-black p-1 w-[15%]">
                BASES
              </th>
              <th rowSpan={3} className="header-black p-1 w-[10%]">
                taux
              </th>
              <th rowSpan={3} className="header-black p-1 w-[10%]">
                Principal dé
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Ligne 30 - Minimum de perception */}
            <tr>
              <td
                colSpan={2}
                rowSpan={2}
                className="font-bold text-center align-middle"
              >
                <div className="vertical-text mx-auto h-16">
                  MINIMUM DE PERCEPTION
                </div>
              </td>
              <td
                className={`p-1 text-[9px] ${
                  rubriques[0].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rubriques[0].label}
              </td>
              <td
                className={`p-1 text-center ${
                  rubriques[0].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rubriques[0].ligne}
              </td>
              <td
                className={`p-1 text-center ${
                  rubriques[0].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderRubriqueCell(rubriques[0], "bases")}
              </td>
              <td
                className={`p-1 text-center ${
                  rubriques[0].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {rubriques[0].taux}
              </td>
              <td
                className={`p-1 text-right ${
                  rubriques[0].hasPattern ? "pattern-gray" : ""
                }`}
              >
                {renderRubriqueCell(rubriques[0], "principalDe")}
              </td>
            </tr>

            {/* Ligne 31 - Impôt sur les sociétés */}
            <tr>
              <td className="p-1 text-[9px]">{rubriques[1].label}</td>
              <td className="p-1 text-center">{rubriques[1].ligne}</td>
              <td className="p-1 text-center">
                {renderRubriqueCell(rubriques[1], "bases")}
              </td>
              <td className="p-1 text-center">{rubriques[1].taux}</td>
              <td className="p-1 text-right">
                {renderRubriqueCell(rubriques[1], "principalDe")}
              </td>
            </tr>

            {/* Lignes 32 à 39 */}
            {rubriques.slice(2).map((rub, idx) => (
              <tr key={rub.id}>
                {idx === 0 && (
                  <td
                    colSpan={2}
                    rowSpan={8}
                    className="font-bold text-center align-middle"
                  >
                    <div className="vertical-text mx-auto h-64">
                      REGIME REEL
                    </div>
                  </td>
                )}
                <td
                  className={`p-1 text-[9px] ${
                    rub.hasPattern ? "pattern-gray" : ""
                  }`}
                >
                  {rub.label}
                </td>
                <td
                  className={`p-1 text-center ${
                    rub.hasPattern ? "pattern-gray" : ""
                  }`}
                >
                  {rub.ligne}
                </td>
                <td
                  className={`p-1 text-center ${
                    rub.hasPattern ? "pattern-gray" : ""
                  }`}
                >
                  {renderRubriqueCell(rub, "bases")}
                </td>
                <td
                  className={`p-1 text-center ${
                    rub.hasPattern ? "pattern-gray" : ""
                  }`}
                >
                  {rub.taux}
                </td>
                <td
                  className={`p-1 text-right ${
                    rub.hasPattern ? "pattern-gray" : ""
                  }`}
                >
                  {renderRubriqueCell(rub, "principalDe")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default T6;
