import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface ImmobilisationRow {
  id: string;
  label: string;
  yearN: string;
  yearN1: string;
  variation: string;
  oneYearPlus: string;
  twoYearsPlus: string;
  fourYearsPlus: string;
}

interface SubsidiaryRow {
  id: string;
  denomination: string;
  location: string;
  acquisitionValue: string;
  percentageHeld: string;
  capitalAmount: string;
  lastResult: string;
}

// Rubriques fixes du template (dans l'ordre exact de CONFIG_NOTE4 côté backend)
const IMMOBILISATION_LABELS = [
  "Titres de participation",
  "Prêts et créances",
  "Prêt au personnel",
  "Créances sur l'Etat",
  "Titres immobilisés",
  "Dépôts et cautionnements",
  "Intérêts courus",
];
const DEPRECIATION_LABELS = [
  "Dépréciations titres de participation",
  "Dépréciations autres immobilisations",
];

const emptyRow = (id: string, label: string): ImmobilisationRow => ({
  id,
  label,
  yearN: "",
  yearN1: "",
  variation: "",
  oneYearPlus: "",
  twoYearsPlus: "",
  fourYearsPlus: "",
});

// Variation en % recalculée depuis Année N / Année N-1 (jamais saisie à la main)
const calcVariation = (yearN: string, yearN1: string): string => {
  const n = parseFloat(yearN) || 0;
  const n1 = parseFloat(yearN1) || 0;
  if (!n1) return "";
  return (((n - n1) / Math.abs(n1)) * 100).toFixed(2);
};

const sumField = (
  rows: ImmobilisationRow[],
  field: "yearN" | "yearN1" | "oneYearPlus" | "twoYearsPlus" | "fourYearsPlus",
): number => rows.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);

const Note4: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();

  // Standardized entete state
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  const [immobilisations, setImmobilisations] = useState<ImmobilisationRow[]>(
    IMMOBILISATION_LABELS.map((label, i) => emptyRow(String(i + 1), label)),
  );

  const [depreciations, setDepreciations] = useState<ImmobilisationRow[]>(
    DEPRECIATION_LABELS.map((label, i) => emptyRow(`d${i + 1}`, label)),
  );

  // TOTAL BRUT et TOTAL NET DE DEPRECIATION sont toujours calculés à partir
  // des lignes ci-dessus — jamais saisis directement, pour rester cohérents
  // avec les montants édités.
  const totalBrutYearN = sumField(immobilisations, "yearN");
  const totalBrutYearN1 = sumField(immobilisations, "yearN1");
  const totalBrut = {
    yearN: totalBrutYearN,
    yearN1: totalBrutYearN1,
    variation: calcVariation(String(totalBrutYearN), String(totalBrutYearN1)),
    oneYearPlus: sumField(immobilisations, "oneYearPlus"),
    twoYearsPlus: sumField(immobilisations, "twoYearsPlus"),
    fourYearsPlus: sumField(immobilisations, "fourYearsPlus"),
  };

  const totalNetYearN = totalBrutYearN - sumField(depreciations, "yearN");
  const totalNetYearN1 = totalBrutYearN1 - sumField(depreciations, "yearN1");
  const totalNet = {
    yearN: totalNetYearN,
    yearN1: totalNetYearN1,
    variation: calcVariation(String(totalNetYearN), String(totalNetYearN1)),
    oneYearPlus: totalBrut.oneYearPlus - sumField(depreciations, "oneYearPlus"),
    twoYearsPlus: totalBrut.twoYearsPlus - sumField(depreciations, "twoYearsPlus"),
    fourYearsPlus: totalBrut.fourYearsPlus - sumField(depreciations, "fourYearsPlus"),
  };

  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryRow[]>([
    { id: "s1", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s2", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s3", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s4", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s5", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s6", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
  ]);

  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "4") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Le backend stocke les 11 lignes (7 immobilisations + TOTAL BRUT +
        // 2 dépréciations + TOTAL NET) dans un seul tableau, dans cet ordre
        // exact (cf. CONFIG_NOTE4.sections.immobilisationsFinancieres) —
        // les lignes TOTAL sont ignorées ici car recalculées côté client.
        const rows = noteData.immobilisationsFinancieres;
        if (Array.isArray(rows) && rows.length > 0) {
          const toRow = (id: string, label: string, r: any): ImmobilisationRow => ({
            id,
            label,
            yearN: String(r?.anneeN ?? ""),
            yearN1: String(r?.anneeN1 ?? ""),
            variation: "",
            oneYearPlus: String(r?.creancesUnAnAuPlus ?? ""),
            twoYearsPlus: String(r?.creancesPlusUnAnDeuxAns ?? ""),
            fourYearsPlus: String(r?.creancesPlusDeuxAns ?? ""),
          });
          setImmobilisations(
            IMMOBILISATION_LABELS.map((label, i) =>
              toRow(String(i + 1), label, rows[i]),
            ),
          );
          setDepreciations(
            DEPRECIATION_LABELS.map((label, i) =>
              toRow(`d${i + 1}`, label, rows[8 + i]),
            ),
          );
        }
        if (noteData.filialesParticipations) {
          setSubsidiaries(
            noteData.filialesParticipations.map((r: any, i: number) => ({
              id: `s${i + 1}`,
              denomination: r.denominationSociale ?? "",
              location: r.localisation ?? "",
              acquisitionValue: String(r.valeurAcquisition ?? ""),
              percentageHeld: String(r.pourcentageDetenu ?? ""),
              capitalAmount: String(r.montantCapitauxPropres ?? ""),
              lastResult: String(r.resultatDernierExercice ?? ""),
            }))
          );
        } else if (noteData.subsidiaries) {
          setSubsidiaries(noteData.subsidiaries);
        }
      }
    } catch (error) {
      console.error("Error loading Note 4 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      // Le backend attend un seul tableau de 11 lignes, dans l'ordre exact
      // du template (7 immobilisations + TOTAL BRUT + 2 dépréciations +
      // TOTAL NET), cf. CONFIG_NOTE4 côté backend.
      const toApiRow = (
        label: string,
        r: {
          yearN: string | number;
          yearN1: string | number;
          variation: string;
          oneYearPlus: string | number;
          twoYearsPlus: string | number;
          fourYearsPlus: string | number;
        },
      ) => ({
        libelle: label,
        anneeN: parseFloat(String(r.yearN)) || null,
        anneeN1: parseFloat(String(r.yearN1)) || null,
        variationPourcentage: parseFloat(r.variation) || null,
        creancesUnAnAuPlus: parseFloat(String(r.oneYearPlus)) || null,
        creancesPlusUnAnDeuxAns: parseFloat(String(r.twoYearsPlus)) || null,
        creancesPlusDeuxAns: parseFloat(String(r.fourYearsPlus)) || null,
      });

      const noteData = {
        entete,
        immobilisationsFinancieres: [
          ...immobilisations.map((r) => toApiRow(r.label, r)),
          toApiRow("TOTAL BRUT", totalBrut),
          ...depreciations.map((r) => toApiRow(r.label, r)),
          toApiRow("TOTAL NET DE DEPRECIATION", totalNet),
        ],
        filialesParticipations: subsidiaries.map((r) => ({
          denominationSociale: r.denomination || null,
          localisation: r.location || null,
          valeurAcquisition: parseFloat(r.acquisitionValue) || null,
          pourcentageDetenu: parseFloat(r.percentageHeld) || null,
          montantCapitauxPropres: parseFloat(r.capitalAmount) || null,
          resultatDernierExercice: parseFloat(r.lastResult) || null,
        })),
      };
      const success = await notesService.saveNoteData(folderId, "4", noteData as any);
      if (success) {
        alert("Données Note 4 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note 4 data:", error);
      alert("Erreur lors de la sauvegarde de la Note 4");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImmobilisationChange = (id: string, field: keyof ImmobilisationRow, value: string) => {
    setImmobilisations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDepreciationChange = (id: string, field: keyof ImmobilisationRow, value: string) => {
    setDepreciations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubsidiaryChange = (id: string, field: keyof SubsidiaryRow, value: string) => {
    setSubsidiaries((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addSubsidiaryRow = () => {
    setSubsidiaries((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        denomination: "",
        location: "",
        acquisitionValue: "",
        percentageHeld: "",
        capitalAmount: "",
        lastResult: "",
      },
    ]);
  };

  const deleteSubsidiaryRow = (id: string) => {
    setSubsidiaries((prev) => prev.filter((row) => row.id !== id));
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_4_immobilisations_financieres.pdf");
      } catch (error) {
        console.error("Erreur PDF Note 4:", error);
      } finally {
        setIsEditing(wasEditing);
      }
    }
  };

  const renderEditableCell = (
    value: string,
    onChange: (val: string) => void,
    className: string = ""
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

  const isHeaderIncomplete =
    !entete.entityName || !entete.fiscalYear || !entete.idNumber || !entete.duration;

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
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 4 - Immobilisations Financières
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
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Sauvegarder
                  </>
                )}
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
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 Landscape */}
      <div
        ref={reportRef}
        className={`max-w-[297mm] mx-auto bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-orange-500" : "border-gray-200"
          }`}
      >
        {isEditing && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-orange-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center text-sm">
            <div className="text-orange-800">
              <span className="font-bold">Attention :</span> Certains champs de l'en-tête sont vides.
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
            17
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Désignation entité :</span>
            {isEditing ? (
              <input
                value={entete.entityName}
                onChange={(e) => setEntete({ ...entete, entityName: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">{entete.entityName || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={entete.fiscalYear}
                onChange={(e) => setEntete({ ...entete, fiscalYear: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">{entete.fiscalYear || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={entete.idNumber}
                onChange={(e) => setEntete({ ...entete, idNumber: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">{entete.idNumber || "-"}</span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={entete.duration}
                onChange={(e) => setEntete({ ...entete, duration: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">{entete.duration || "-"}</span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-[#bfbfbf] border border-gray-600 py-3 text-center font-bold mb-6 text-[12px]">
          <div>NOTE 4</div>
          <div>IMMOBILISATIONS FINANCIERES</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-8">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 text-left w-[20%]">Libellés</th>
              <th className="border border-gray-600 p-1 w-[13%]">Année N</th>
              <th className="border border-gray-600 p-1 w-[13%]">Année N-1</th>
              <th className="border border-gray-600 p-1 w-[13%]">Variation en %</th>
              <th className="border border-gray-600 p-1 w-[13%]">Créances à un an au plus</th>
              <th className="border border-gray-600 p-1 w-[14%]">Créances à plus d'un an et à deux ans au plus</th>
              <th className="border border-gray-600 p-1 w-[14%]">Créances à plus de deux ans</th>
            </tr>
          </thead>
          <tbody>
            {immobilisations.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1 pl-2 font-medium text-orange-700">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN, (val) => handleImmobilisationChange(row.id, "yearN", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN1, (val) => handleImmobilisationChange(row.id, "yearN1", val))}</td>
                <td className="border border-gray-600 p-1 text-center text-gray-500">
                  {calcVariation(row.yearN, row.yearN1) && `${calcVariation(row.yearN, row.yearN1)}%`}
                </td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.oneYearPlus, (val) => handleImmobilisationChange(row.id, "oneYearPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.twoYearsPlus, (val) => handleImmobilisationChange(row.id, "twoYearsPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.fourYearsPlus, (val) => handleImmobilisationChange(row.id, "fourYearsPlus", val))}</td>
              </tr>
            ))}
            <tr className="bg-[#e6e6e6] font-bold text-center">
              <td className="border border-gray-600 p-1 pl-2 text-left">TOTAL BRUT</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.yearN.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.yearN1.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1">{totalBrut.variation && `${totalBrut.variation}%`}</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.oneYearPlus.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.twoYearsPlus.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalBrut.fourYearsPlus.toLocaleString("fr-FR")}</td>
            </tr>
            {depreciations.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 italic">
                <td className="border border-gray-600 p-1 pl-2 text-orange-700">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN, (val) => handleDepreciationChange(row.id, "yearN", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN1, (val) => handleDepreciationChange(row.id, "yearN1", val))}</td>
                <td className="border border-gray-600 p-1 text-center text-gray-500">
                  {calcVariation(row.yearN, row.yearN1) && `${calcVariation(row.yearN, row.yearN1)}%`}
                </td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.oneYearPlus, (val) => handleDepreciationChange(row.id, "oneYearPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.twoYearsPlus, (val) => handleDepreciationChange(row.id, "twoYearsPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.fourYearsPlus, (val) => handleDepreciationChange(row.id, "fourYearsPlus", val))}</td>
              </tr>
            ))}
            <tr className="bg-[#e6e6e6] font-bold text-center">
              <td className="border border-gray-600 p-1 pl-2 text-left">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.yearN.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.yearN1.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1">{totalNet.variation && `${totalNet.variation}%`}</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.oneYearPlus.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.twoYearsPlus.toLocaleString("fr-FR")}</td>
              <td className="border border-gray-600 p-1 text-right">{totalNet.fourYearsPlus.toLocaleString("fr-FR")}</td>
            </tr>
          </tbody>
        </table>

        {/* Section Liste des filiales */}
        <div className="mt-8 mb-4 text-center font-bold text-[12px]">
          Liste des filiales et participations:
        </div>

        <table className="w-full border-collapse border border-gray-600 text-[10px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 w-[20%] text-left">Dénomination sociale</th>
              <th className="border border-gray-600 p-2 w-[15%]">Localisation (ville / Pays)</th>
              <th className="border border-gray-600 p-2 w-[15%]">Valeur d'acquisition</th>
              <th className="border border-gray-600 p-2 w-[10%]">% Détenu</th>
              <th className="border border-gray-600 p-2 w-[18%]">Montant des capitaux propres filiale</th>
              <th className="border border-gray-600 p-2 w-[18%]">Résultat dernier exercice filiale</th>
              {isEditing && <th className="border border-gray-600 p-2 w-[4%]"></th>}
            </tr>
          </thead>
          <tbody>
            {subsidiaries.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-600 p-1">{renderEditableCell(row.denomination, (val) => handleSubsidiaryChange(row.id, "denomination", val))}</td>
                <td className="border border-gray-600 p-1 text-center">{renderEditableCell(row.location, (val) => handleSubsidiaryChange(row.id, "location", val))}</td>
                <td className="border border-gray-600 p-1 text-right pr-2">{renderEditableCell(row.acquisitionValue, (val) => handleSubsidiaryChange(row.id, "acquisitionValue", val))}</td>
                <td className="border border-gray-600 p-1 text-center font-bold">{renderEditableCell(row.percentageHeld, (val) => handleSubsidiaryChange(row.id, "percentageHeld", val))}</td>
                <td className="border border-gray-600 p-1 text-right pr-2 font-medium">{renderEditableCell(row.capitalAmount, (val) => handleSubsidiaryChange(row.id, "capitalAmount", val))}</td>
                <td className="border border-gray-600 p-1 text-right pr-2 font-medium">{renderEditableCell(row.lastResult, (val) => handleSubsidiaryChange(row.id, "lastResult", val))}</td>
                {isEditing && (
                  <td className="border border-gray-600 p-1 text-center">
                    <button
                      onClick={() => deleteSubsidiaryRow(row.id)}
                      className="text-red-500 hover:text-red-700 font-bold leading-none"
                      title="Supprimer cette ligne"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mb-8">
          {isEditing && (
            <button
              onClick={addSubsidiaryRow}
              className="mt-1 text-orange-600 hover:text-orange-800 text-[10px] font-medium"
            >
              + Ajouter une ligne
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note4;



