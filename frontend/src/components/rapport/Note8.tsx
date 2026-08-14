import React, { useState, useRef, useEffect, useMemo } from "react";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Types et Interfaces ---

interface ReceivableRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  oneYearOrLess: string;
  oneToTwoYears: string;
  moreThanTwoYears: string;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface Justifications {
  variation: string;
  montant: string;
  anciennes: string;
  depreciation: string;
  compteTransitoire: string;
}

// --- Composant Principal ---

const Note8: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedFolder } = useApp();

  // État pour l'en-tête (Standardized)
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  // État pour les Autres Créances
  const [otherReceivables, setOtherReceivables] = useState<ReceivableRow[]>([
    {
      id: "9",
      label: "Personnel",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "10",
      label: "Organismes sociaux",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "11",
      label: "État et Collectivités publiques",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "12",
      label: "Organismes internationaux",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "13",
      label: "Apporteurs, associés et groupe",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "14",
      label:
        "Compte transitoire ajustement spécial lié à la révision du SYSCOHADA",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "15",
      label: "Autres débiteurs divers",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "16",
      label:
        "Comptes permanents non bloqués des établissements et des succursales",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "17",
      label: "Comptes de liaison charges et produits",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
    {
      id: "18",
      label: "Comptes de liaison des sociétés en participation",
      yearN: "",
      yearN1: "",
      oneYearOrLess: "",
      oneToTwoYears: "",
      moreThanTwoYears: "",
    },
  ]);

  // Dépréciations
  const [depreciations, setDepreciations] = useState("");

  // Justifications
  const [justifications, setJustifications] = useState<Justifications>({
    variation: "",
    montant: "",
    anciennes: "",
    depreciation: "",
    compteTransitoire: "",
  });

  const folderId = selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "8")) as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Map backend keys → frontend state
        if (noteData.autresCreances) {
          setOtherReceivables(
            noteData.autresCreances.map((r: any, i: number) => ({
              id: otherReceivables[i]?.id || String(9 + i),
              label: r.libelle || otherReceivables[i]?.label || "",
              yearN: String(r.anneeN ?? ""),
              yearN1: String(r.anneeN1 ?? ""),
              oneYearOrLess: String(r.creancesUnAnAuPlus ?? ""),
              oneToTwoYears: String(r.creancesPlusUnAnDeuxAns ?? ""),
              moreThanTwoYears: String(r.creancesPlusDeuxAns ?? ""),
            })),
          );
        } else if (noteData.otherReceivables) {
          setOtherReceivables(noteData.otherReceivables);
        }
        setDepreciations(noteData.depreciations || "");
        setJustifications(noteData.justifications || justifications);
      }
    } catch (error) {
      console.error("Error loading Note 8 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Map frontend state → backend keys
      const noteData = {
        entete,
        autresCreances: otherReceivables.map((r) => ({
          libelle: r.label,
          anneeN: parseFloat(r.yearN) || null,
          anneeN1: parseFloat(r.yearN1) || null,
          variationPourcentage: null,
          creancesUnAnAuPlus: parseFloat(r.oneYearOrLess) || null,
          creancesPlusUnAnDeuxAns: parseFloat(r.oneToTwoYears) || null,
          creancesPlusDeuxAns: parseFloat(r.moreThanTwoYears) || null,
        })),
        depreciations,
        justifications,
      };
      const success = await notesService.saveNoteData(
        folderId,
        "8",
        noteData as any,
      );
      if (success) {
        alert("Données Note 8 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 8 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 8");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReceivableChange = (
    id: string,
    field: keyof ReceivableRow,
    value: string,
  ) => {
    setOtherReceivables((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleJustificationChange = (
    field: keyof Justifications,
    value: string,
  ) => {
    setJustifications((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_8_autres_creances.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 8:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = "",
  ) => {
    return isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full px-1 bg-orange-50 border-none focus:outline-none ${className}`}
      />
    ) : (
      <span className="px-1">{value || ""}</span>
    );
  };

  const calculateTotal = (data: any[], field: string) => {
    return data.reduce(
      (acc, row) =>
        acc + (parseFloat(row[field]?.toString().replace(/\s/g, "")) || 0),
      0,
    );
  };

  const calculateVariation = (n: string | number, n1: string | number) => {
    const valN =
      typeof n === "string" ? parseFloat(n.replace(/\s/g, "")) || 0 : n;
    const valN1 =
      typeof n1 === "string" ? parseFloat(n1.replace(/\s/g, "")) || 0 : n1;
    if (valN1 === 0) return "-";
    const variation = ((valN - valN1) / valN1) * 100;
    return variation.toFixed(2) + "%";
  };

  const totalBrut = useMemo(
    () => calculateTotal(otherReceivables, "yearN"),
    [otherReceivables],
  );
  const totalN1 = useMemo(
    () => calculateTotal(otherReceivables, "yearN1"),
    [otherReceivables],
  );
  const totalOneYear = useMemo(
    () => calculateTotal(otherReceivables, "oneYearOrLess"),
    [otherReceivables],
  );
  const totalOneTwoYears = useMemo(
    () => calculateTotal(otherReceivables, "oneToTwoYears"),
    [otherReceivables],
  );
  const totalMoreTwoYears = useMemo(
    () => calculateTotal(otherReceivables, "moreThanTwoYears"),
    [otherReceivables],
  );
  const totalNet = useMemo(
    () => totalBrut - (parseFloat(depreciations.replace(/\s/g, "")) || 0),
    [totalBrut, depreciations],
  );

  const isHeaderIncomplete =
    !entete.entityName ||
    !entete.fiscalYear ||
    !entete.idNumber ||
    !entete.duration;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 8 - Autres Créances
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Standardization en cours...
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              <Pencil size={18} /> Éditer
            </button>
          ) : (
            <>
              <button
                onClick={saveNoteData}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadNoteData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border-2 ${
          isEditing ? "border-orange-500" : "border-gray-200"
        }`}
      >
        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center text-sm">
            <div className="text-orange-800">
              <span className="font-bold">Attention :</span> Certains champs de
              l'en-tête sont vides.
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-orange-800 underline font-bold"
              >
                Mettre à jour l'en-tête
              </button>
            )}
          </div>
        )}

        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            21
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 pb-4">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) =>
                  setEntete({ ...entete, entityName: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.entityName || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={entete.fiscalYear}
                onChange={(e) =>
                  setEntete({ ...entete, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">
                {entete.fiscalYear || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={entete.idNumber}
                onChange={(e) =>
                  setEntete({ ...entete, idNumber: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {entete.idNumber || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={entete.duration}
                onChange={(e) =>
                  setEntete({ ...entete, duration: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {entete.duration || "-"}
              </span>
            )}
          </div>
        </div>

        {/* Titre du Tableau */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-2 text-center font-bold mb-4 text-[12px]">
          NOTE 8 <br /> AUTRES CRÉANCES
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-4">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th rowSpan={2} className="border border-gray-600 p-2 w-[25%]">
                Libellés
              </th>
              <th rowSpan={2} className="border border-gray-600 p-2 w-[12%]">
                Année N
              </th>
              <th rowSpan={2} className="border border-gray-600 p-2 w-[12%]">
                Année N-1
              </th>
              <th rowSpan={2} className="border border-gray-600 p-2 w-[8%]">
                Variation en %
              </th>
              <th
                colSpan={3}
                className="border border-gray-600 p-2 text-center bg-[#bfbfbf]"
              >
                ÉCHÉANCIER (Année N)
              </th>
            </tr>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2">À 1 an au plus</th>
              <th className="border border-gray-600 p-2">De 1 à 2 ans</th>
              <th className="border border-gray-600 p-2">Plus de 2 ans</th>
            </tr>
          </thead>
          <tbody>
            {otherReceivables.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) =>
                    handleReceivableChange(row.id, "yearN", val),
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleReceivableChange(row.id, "yearN1", val),
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-center bg-gray-50 font-bold">
                  {calculateVariation(row.yearN, row.yearN1)}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.oneYearOrLess, (val) =>
                    handleReceivableChange(row.id, "oneYearOrLess", val),
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.oneToTwoYears, (val) =>
                    handleReceivableChange(row.id, "oneToTwoYears", val),
                  )}
                </td>
                <td className="border border-gray-600 p-1 text-right">
                  {renderEditableCell(row.moreThanTwoYears, (val) =>
                    handleReceivableChange(row.id, "moreThanTwoYears", val),
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-[#e6e6e6] font-bold text-[11px]">
              <td className="border border-gray-600 p-2">
                TOTAL BRUT AUTRES CRÉANCES
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {totalBrut.toLocaleString()}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {totalN1.toLocaleString()}
              </td>
              <td className="border border-gray-600 p-1 text-center bg-gray-200">
                {calculateVariation(totalBrut, totalN1)}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {totalOneYear.toLocaleString()}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {totalOneTwoYears.toLocaleString()}
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {totalMoreTwoYears.toLocaleString()}
              </td>
            </tr>

            {/* DEPRECIATIONS */}
            <tr>
              <td className="border border-gray-600 p-2 italic">
                Dépréciations des autres créances
              </td>
              <td className="border border-gray-600 p-1 text-right bg-red-50">
                {renderEditableCell(depreciations, (val) =>
                  setDepreciations(val),
                )}
              </td>
              <td
                colSpan={5}
                className="border border-gray-600 bg-gray-100"
              ></td>
            </tr>

            {/* TOTAL NET */}
            <tr className="bg-[#bfbfbf] font-bold text-[11px]">
              <td className="border border-gray-600 p-2">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-600 p-1 text-right">
                {totalNet.toLocaleString()}
              </td>
              <td
                colSpan={5}
                className="border border-gray-600 bg-gray-200"
              ></td>
            </tr>
          </tbody>
        </table>

        {/* Section Justifications */}
        <div className="border border-gray-600 p-3 bg-white min-h-[120px]">
          <div className="font-bold underline mb-3 text-[11px]">
            Commentaire / Justifications :
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <span className="w-1/3 flex-shrink-0 font-medium text-gray-700">
                Justifier toute variation significative :
              </span>
              {isEditing ? (
                <textarea
                  value={justifications.variation}
                  onChange={(e) =>
                    handleJustificationChange("variation", e.target.value)
                  }
                  className="w-full border p-1 bg-orange-50 text-[10px] h-12"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-full min-h-[1.5rem]">
                  {justifications.variation}
                </span>
              )}
            </div>
            <div className="flex items-start gap-4">
              <span className="w-1/3 flex-shrink-0 font-medium text-gray-700">
                Détailler les créances significatives :
              </span>
              {isEditing ? (
                <textarea
                  value={justifications.montant}
                  onChange={(e) =>
                    handleJustificationChange("montant", e.target.value)
                  }
                  className="w-full border p-1 bg-orange-50 text-[10px] h-12"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-full min-h-[1.5rem]">
                  {justifications.montant}
                </span>
              )}
            </div>
            <div className="flex items-start gap-4">
              <span className="w-1/3 flex-shrink-0 font-medium text-gray-700">
                Justifier les créances anciennes :
              </span>
              {isEditing ? (
                <textarea
                  value={justifications.anciennes}
                  onChange={(e) =>
                    handleJustificationChange("anciennes", e.target.value)
                  }
                  className="w-full border p-1 bg-orange-50 text-[10px] h-12"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-full min-h-[1.5rem]">
                  {justifications.anciennes}
                </span>
              )}
            </div>
            <div className="flex items-start gap-4">
              <span className="w-1/3 flex-shrink-0 font-medium text-gray-700">
                Événements de dépréciation :
              </span>
              {isEditing ? (
                <textarea
                  value={justifications.depreciation}
                  onChange={(e) =>
                    handleJustificationChange("depreciation", e.target.value)
                  }
                  className="w-full border p-1 bg-orange-50 text-[10px] h-12"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-full min-h-[1.5rem]">
                  {justifications.depreciation}
                </span>
              )}
            </div>
            <div className="flex items-start gap-4">
              <span className="w-1/3 flex-shrink-0 font-medium text-gray-700">
                Détail Compte transitoire :
              </span>
              {isEditing ? (
                <textarea
                  value={justifications.compteTransitoire}
                  onChange={(e) =>
                    handleJustificationChange(
                      "compteTransitoire",
                      e.target.value,
                    )
                  }
                  className="w-full border p-1 bg-orange-50 text-[10px] h-12"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-full min-h-[1.5rem]">
                  {justifications.compteTransitoire}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note8;
