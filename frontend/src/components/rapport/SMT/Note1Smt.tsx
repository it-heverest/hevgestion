import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";

interface EquipmentRow {
  id: string;
  date: string;
  designation: string;
  montant: number;
  dateSortie: string;
  prixCession: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const NoteSmt: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  const [rows, setRows] = useState<EquipmentRow[]>(
    Array.from({ length: 28 }, (_, i) => ({
      id: `row-${i + 1}`,
      date: "",
      designation: "",
      montant: 0,
      dateSortie: "",
      prixCession: 0,
    }))
  );

  const totalMontant = rows.reduce((acc, r) => acc + r.montant, 0);
  const totalPrixCession = rows.reduce((acc, r) => acc + r.prixCession, 0);

  const handleRowChange = (
    id: string,
    field: keyof EquipmentRow,
    value: string | number
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const renderCell = (
    row: EquipmentRow,
    field: keyof EquipmentRow,
    type: "text" | "number" = "text"
  ) => {
    if (isEditing) {
      return (
        <input
          type={type}
          value={row[field]}
          onChange={(e) =>
            handleRowChange(
              row.id,
              field,
              type === "number" ? Number(e.target.value) || 0 : e.target.value
            )
          }
          className="w-full h-full px-2 py-1 bg-orange-50 border-0 focus:outline-none"
        />
      );
    }
    return type === "number" && row[field] !== 0
      ? (row[field] as number).toLocaleString("fr-FR")
      : row[field];
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
          Note 1 - Suivi du Matériel, du Mobilier et des Cautions
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700"
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-2 text-lg">6</div>

        {/* Titre NOTE 1 */}
        <div className="header-gray text-center font-bold py-2 mb-4">
          NOTE 1
          <br />
          SUIVI DU MATERIEL, DU MOBILIER ET DES CAUTIONS
        </div>

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
              Exercice clos le :
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
              N° d'identification :
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

        {/* Sous-titre tableau */}
        <div className="text-center font-bold mb-3 text-sm">
          Tableau de suivi du matériel, du mobilier et des cautions
        </div>

        {/* Tableau */}
        <table className="w-full text-[10px]">
          <thead>
            <tr className="header-black">
              <th className="p-2 text-center w-[12%]">Date</th>
              <th className="p-2 text-center w-[30%]">Désignation</th>
              <th className="p-2 text-center w-[15%]">Montant</th>
              <th className="p-2 text-center w-[15%]">Date de sortie</th>
              <th className="p-2 text-center w-[15%]">Prix de cession</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="p-0 h-8">{renderCell(row, "date", "text")}</td>
                <td className="p-0">
                  {renderCell(row, "designation", "text")}
                </td>
                <td className="p-0 text-right">
                  {renderCell(row, "montant", "number")}
                </td>
                <td className="p-0">{renderCell(row, "dateSortie", "text")}</td>
                <td className="p-0 text-right">
                  {renderCell(row, "prixCession", "number")}
                </td>
              </tr>
            ))}
            {/* Ligne TOTAL */}
            <tr className="total-row">
              <td colSpan={2} className="p-2 text-center font-bold">
                TOTAL
              </td>
              <td className="p-2 text-right font-bold">
                {totalMontant.toLocaleString("fr-FR")}
              </td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-bold">
                {totalPrixCession.toLocaleString("fr-FR")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Note de bas de page */}
        <div className="mt-3 text-[9px] italic">
          *Bien vouloir annexer le tableau de suivi du matériel, du mobilier et
          des cautions en pièce jointe selon le model
        </div>
      </div>
    </div>
  );
};

export default NoteSmt;


