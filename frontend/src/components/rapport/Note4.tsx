import React, { useState, useRef, useEffect } from "react";
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

const Note4: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedFolder } = useApp();

  // Standardized entete state
  const [entete, setEntete] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  const [immobilisations, setImmobilisations] = useState<ImmobilisationRow[]>([
    { id: "1", label: "Titres de participation", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "2", label: "Prêts et créances", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "3", label: "Prêt au personnel", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "4", label: "Créances sur l'Etat", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "5", label: "Titres immobilisés", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "6", label: "Dépôts et cautionnements", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "7", label: "Intérêts courus", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
  ]);

  const [totalBrut, setTotalBrut] = useState({ yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" });

  const [depreciations, setDepreciations] = useState<ImmobilisationRow[]>([
    { id: "d1", label: "Dépréciations titres de participation", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
    { id: "d2", label: "Dépréciations autres immobilisations", yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" },
  ]);

  const [totalNet, setTotalNet] = useState({ yearN: "", yearN1: "", variation: "", oneYearPlus: "", twoYearsPlus: "", fourYearsPlus: "" });

  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryRow[]>([
    { id: "s1", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s2", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s3", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s4", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s5", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
    { id: "s6", denomination: "", location: "", acquisitionValue: "", percentageHeld: "", capitalAmount: "", lastResult: "" },
  ]);

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
      const noteData = await notesService.getNoteData(folderId, "NOTE4") as any;
      if (noteData) {
        setEntete(noteData.entete || noteData.headerInfo || entete);
        // Map backend keys → frontend state
        if (noteData.immobilisationsFinancieres) {
          setImmobilisations(
            noteData.immobilisationsFinancieres.map((r: any, i: number) => ({
              id: String(i + 1),
              label: r.libelle || immobilisations[i]?.label || "",
              yearN: String(r.anneeN ?? ""),
              yearN1: String(r.anneeN1 ?? ""),
              variation: String(r.variationPourcentage ?? ""),
              oneYearPlus: String(r.creancesUnAnAuPlus ?? ""),
              twoYearsPlus: String(r.creancesPlusUnAnDeuxAns ?? ""),
              fourYearsPlus: String(r.creancesPlusDeuxAns ?? ""),
            }))
          );
        } else if (noteData.immobilisations) {
          setImmobilisations(noteData.immobilisations);
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
        if (noteData.totalBrut) setTotalBrut(noteData.totalBrut);
        if (noteData.depreciations) setDepreciations(noteData.depreciations);
        if (noteData.totalNet) setTotalNet(noteData.totalNet);
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
      // Map frontend state → backend keys
      const noteData = {
        entete,
        immobilisationsFinancieres: immobilisations.map((r) => ({
          libelle: r.label,
          anneeN: parseFloat(r.yearN) || null,
          anneeN1: parseFloat(r.yearN1) || null,
          variationPourcentage: parseFloat(r.variation) || null,
          creancesUnAnAuPlus: parseFloat(r.oneYearPlus) || null,
          creancesPlusUnAnDeuxAns: parseFloat(r.twoYearsPlus) || null,
          creancesPlusDeuxAns: parseFloat(r.fourYearsPlus) || null,
        })),
        filialesParticipations: subsidiaries.map((r) => ({
          denominationSociale: r.denomination || null,
          localisation: r.location || null,
          valeurAcquisition: parseFloat(r.acquisitionValue) || null,
          pourcentageDetenu: parseFloat(r.percentageHeld) || null,
          montantCapitauxPropres: parseFloat(r.capitalAmount) || null,
          resultatDernierExercice: parseFloat(r.lastResult) || null,
        })),
      };
      const success = await notesService.saveNoteData(folderId, "NOTE4", noteData as any);
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
        className={`w-full h-full px-1 bg-blue-50 border-none focus:outline-none ${className}`}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
        className={`max-w-[297mm] mx-auto min-h-[210mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-blue-500" : "border-gray-200"
          }`}
      >
        {isEditing && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-blue-800">
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
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-20 focus:outline-none px-1 text-center"
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
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
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
                className="border-b border-blue-500 bg-blue-50 w-16 focus:outline-none px-1 text-center"
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
                <td className="border border-gray-600 p-1 pl-2 font-medium">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN, (val) => handleImmobilisationChange(row.id, "yearN", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN1, (val) => handleImmobilisationChange(row.id, "yearN1", val))}</td>
                <td className="border border-gray-600 p-1 text-center">{renderEditableCell(row.variation, (val) => handleImmobilisationChange(row.id, "variation", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.oneYearPlus, (val) => handleImmobilisationChange(row.id, "oneYearPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.twoYearsPlus, (val) => handleImmobilisationChange(row.id, "twoYearsPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.fourYearsPlus, (val) => handleImmobilisationChange(row.id, "fourYearsPlus", val))}</td>
              </tr>
            ))}
            <tr className="bg-[#e6e6e6] font-bold text-center">
              <td className="border border-gray-600 p-1 pl-2 text-left">TOTAL BRUT</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalBrut.yearN, (val) => setTotalBrut({ ...totalBrut, yearN: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalBrut.yearN1, (val) => setTotalBrut({ ...totalBrut, yearN1: val }))}</td>
              <td className="border border-gray-600 p-1">{renderEditableCell(totalBrut.variation, (val) => setTotalBrut({ ...totalBrut, variation: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalBrut.oneYearPlus, (val) => setTotalBrut({ ...totalBrut, oneYearPlus: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalBrut.twoYearsPlus, (val) => setTotalBrut({ ...totalBrut, twoYearsPlus: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalBrut.fourYearsPlus, (val) => setTotalBrut({ ...totalBrut, fourYearsPlus: val }))}</td>
            </tr>
            {depreciations.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 italic">
                <td className="border border-gray-600 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN, (val) => handleDepreciationChange(row.id, "yearN", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.yearN1, (val) => handleDepreciationChange(row.id, "yearN1", val))}</td>
                <td className="border border-gray-600 p-1 text-center">{renderEditableCell(row.variation, (val) => handleDepreciationChange(row.id, "variation", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.oneYearPlus, (val) => handleDepreciationChange(row.id, "oneYearPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.twoYearsPlus, (val) => handleDepreciationChange(row.id, "twoYearsPlus", val))}</td>
                <td className="border border-gray-600 p-1 text-right">{renderEditableCell(row.fourYearsPlus, (val) => handleDepreciationChange(row.id, "fourYearsPlus", val))}</td>
              </tr>
            ))}
            <tr className="bg-[#e6e6e6] font-bold text-center">
              <td className="border border-gray-600 p-1 pl-2 text-left">TOTAL NET DE DEPRECIATION</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalNet.yearN, (val) => setTotalNet({ ...totalNet, yearN: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalNet.yearN1, (val) => setTotalNet({ ...totalNet, yearN1: val }))}</td>
              <td className="border border-gray-600 p-1">{renderEditableCell(totalNet.variation, (val) => setTotalNet({ ...totalNet, variation: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalNet.oneYearPlus, (val) => setTotalNet({ ...totalNet, oneYearPlus: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalNet.twoYearsPlus, (val) => setTotalNet({ ...totalNet, twoYearsPlus: val }))}</td>
              <td className="border border-gray-600 p-1 text-right">{renderEditableCell(totalNet.fourYearsPlus, (val) => setTotalNet({ ...totalNet, fourYearsPlus: val }))}</td>
            </tr>
          </tbody>
        </table>

        {/* Section Liste des filiales */}
        <div className="mt-8 mb-4 text-center font-bold text-[12px] bg-[#d9d9d9] py-2 border border-gray-600">
          LISTE DES FILIALES ET PARTICIPATIONS:
        </div>

        <table className="w-full border-collapse border border-gray-600 text-[10px] mb-8">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-gray-600 p-2 w-[20%] text-left">Dénomination sociale</th>
              <th className="border border-gray-600 p-2 w-[15%]">Localisation (ville / Pays)</th>
              <th className="border border-gray-600 p-2 w-[15%]">Valeur d'acquisition</th>
              <th className="border border-gray-600 p-2 w-[10%]">% Détenu</th>
              <th className="border border-gray-600 p-2 w-[20%]">Montant des capitaux propres filiale</th>
              <th className="border border-gray-600 p-2 w-[20%]">Résultat dernier exercice filiale</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note4;
