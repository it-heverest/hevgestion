import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";

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

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  const [immobilisations, setImmobilisations] = useState<ImmobilisationRow[]>([
    {
      id: "1",
      label: "Titres de participation",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "2",
      label: "Prêts et créances",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "3",
      label: "Prêt au personnel",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "4",
      label: "Créances sur l'Etat",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "5",
      label: "Titres immobilisés",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "6",
      label: "Dépôts et cautionnements",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "7",
      label: "Intérêts courus",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
  ]);

  const [totalBrut, setTotalBrut] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
    oneYearPlus: "",
    twoYearsPlus: "",
    fourYearsPlus: "",
  });

  const [depreciations, setDepreciations] = useState([
    {
      id: "d1",
      label: "Dépréciations titres de participation",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
    {
      id: "d2",
      label: "Dépréciations autres immobilisations",
      yearN: "",
      yearN1: "",
      variation: "",
      oneYearPlus: "",
      twoYearsPlus: "",
      fourYearsPlus: "",
    },
  ]);

  const [totalNet, setTotalNet] = useState({
    yearN: "",
    yearN1: "",
    variation: "",
    oneYearPlus: "",
    twoYearsPlus: "",
    fourYearsPlus: "",
  });

  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryRow[]>([
    {
      id: "s1",
      denomination: "",
      location: "",
      acquisitionValue: "",
      percentageHeld: "",
      capitalAmount: "",
      lastResult: "",
    },
    {
      id: "s2",
      denomination: "",
      location: "",
      acquisitionValue: "",
      percentageHeld: "",
      capitalAmount: "",
      lastResult: "",
    },
    {
      id: "s3",
      denomination: "",
      location: "",
      acquisitionValue: "",
      percentageHeld: "",
      capitalAmount: "",
      lastResult: "",
    },
    {
      id: "s4",
      denomination: "",
      location: "",
      acquisitionValue: "",
      percentageHeld: "",
      capitalAmount: "",
      lastResult: "",
    },
    {
      id: "s5",
      denomination: "",
      location: "",
      acquisitionValue: "",
      percentageHeld: "",
      capitalAmount: "",
      lastResult: "",
    },
    {
      id: "s6",
      denomination: "",
      location: "",
      acquisitionValue: "",
      percentageHeld: "",
      capitalAmount: "",
      lastResult: "",
    },
  ]);

  const handleImmobilisationChange = (
    id: string,
    field: keyof ImmobilisationRow,
    value: string
  ) => {
    setImmobilisations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDepreciationChange = (
    id: string,
    field: keyof ImmobilisationRow,
    value: string
  ) => {
    setDepreciations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubsidiaryChange = (
    id: string,
    field: keyof SubsidiaryRow,
    value: string
  ) => {
    setSubsidiaries((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);

      setTimeout(async () => {
        try {
          const html2canvas = (
            await import(
              "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" as any
            )
          ).default;
          const { jsPDF } = await import(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" as any
          );

          const canvas = await html2canvas(reportRef.current!, { scale: 2 });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("note_4_immobilisations.pdf");
        } catch (error) {
          console.error("Erreur lors de la génération du PDF:", error);
          alert("Erreur lors de la génération du PDF");
        } finally {
          setIsEditing(wasEditing);
        }
      }, 100);
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
      <span>{value}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Prévisualiser Rapport - Note 4
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
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-300"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold mb-3 text-base">17</div>

        {/* En-tête */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 pb-3">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.entityName}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 flex-1 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 flex-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Durée (en mois) :</span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold mb-0">
          <div>NOTE 4</div>
          <div>IMMOBILISATIONS FINANCIERES</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[10px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left w-[20%]">
                Libellés
              </th>
              <th className="border border-gray-400 p-1 w-[13%]">
                Année
                <br />N
              </th>
              <th className="border border-gray-400 p-1 w-[13%]">
                Année
                <br />
                N-1
              </th>
              <th className="border border-gray-400 p-1 w-[13%]">
                Variation
                <br />
                en %
              </th>
              <th className="border border-gray-400 p-1 w-[13%]">
                Créances à un
                <br />
                an au plus
              </th>
              <th className="border border-gray-400 p-1 w-[14%]">
                Créances à<br />
                plus d'un
                <br />
                an et à<br />
                deux ans
                <br />
                au plus
              </th>
              <th className="border border-gray-400 p-1 w-[14%]">
                Créances
                <br />à plus de
                <br />
                deux ans
              </th>
            </tr>
          </thead>
          <tbody>
            {immobilisations.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) =>
                    handleImmobilisationChange(row.id, "yearN", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleImmobilisationChange(row.id, "yearN1", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.variation, (val) =>
                    handleImmobilisationChange(row.id, "variation", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.oneYearPlus, (val) =>
                    handleImmobilisationChange(row.id, "oneYearPlus", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.twoYearsPlus, (val) =>
                    handleImmobilisationChange(row.id, "twoYearsPlus", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.fourYearsPlus, (val) =>
                    handleImmobilisationChange(row.id, "fourYearsPlus", val)
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL BRUT */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">TOTAL BRUT</td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.yearN, (val) =>
                  setTotalBrut({ ...totalBrut, yearN: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.yearN1, (val) =>
                  setTotalBrut({ ...totalBrut, yearN1: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.variation, (val) =>
                  setTotalBrut({ ...totalBrut, variation: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.oneYearPlus, (val) =>
                  setTotalBrut({ ...totalBrut, oneYearPlus: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.twoYearsPlus, (val) =>
                  setTotalBrut({ ...totalBrut, twoYearsPlus: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalBrut.fourYearsPlus, (val) =>
                  setTotalBrut({ ...totalBrut, fourYearsPlus: val })
                )}
              </td>
            </tr>

            {/* Dépréciations */}
            {depreciations.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.yearN, (val) =>
                    handleDepreciationChange(row.id, "yearN", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.yearN1, (val) =>
                    handleDepreciationChange(row.id, "yearN1", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.variation, (val) =>
                    handleDepreciationChange(row.id, "variation", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.oneYearPlus, (val) =>
                    handleDepreciationChange(row.id, "oneYearPlus", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.twoYearsPlus, (val) =>
                    handleDepreciationChange(row.id, "twoYearsPlus", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.fourYearsPlus, (val) =>
                    handleDepreciationChange(row.id, "fourYearsPlus", val)
                  )}
                </td>
              </tr>
            ))}

            {/* TOTAL NET DE DEPRECIATION */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                TOTAL NET DE DEPRECIATION
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.yearN, (val) =>
                  setTotalNet({ ...totalNet, yearN: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.yearN1, (val) =>
                  setTotalNet({ ...totalNet, yearN1: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.variation, (val) =>
                  setTotalNet({ ...totalNet, variation: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.oneYearPlus, (val) =>
                  setTotalNet({ ...totalNet, oneYearPlus: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.twoYearsPlus, (val) =>
                  setTotalNet({ ...totalNet, twoYearsPlus: val })
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {renderEditableCell(totalNet.fourYearsPlus, (val) =>
                  setTotalNet({ ...totalNet, fourYearsPlus: val })
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section Liste des filiales */}
        <div className="mt-6 mb-2 text-center font-bold text-sm">
          Liste des filiales et participations:
        </div>

        {/* Tableau des filiales */}
        <table className="w-full border-collapse border border-gray-400 text-[10px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 w-[20%]">
                Dénomination sociale
              </th>
              <th className="border border-gray-400 p-2 w-[15%]">
                Localisation
                <br />
                (ville / Pays)
              </th>
              <th className="border border-gray-400 p-2 w-[15%]">
                Valeur
                <br />
                d'acquisition
              </th>
              <th className="border border-gray-400 p-2 w-[10%]">% Détenu</th>
              <th className="border border-gray-400 p-2 w-[20%]">
                Montant
                <br />
                des capitaux
                <br />
                propres
                <br />
                filiale
              </th>
              <th className="border border-gray-400 p-2 w-[20%]">
                Résultat
                <br />
                dernier
                <br />
                exercice
                <br />
                filiale
              </th>
            </tr>
          </thead>
          <tbody>
            {subsidiaries.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border border-gray-400 p-1">
                  {renderEditableCell(row.denomination, (val) =>
                    handleSubsidiaryChange(row.id, "denomination", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1">
                  {renderEditableCell(row.location, (val) =>
                    handleSubsidiaryChange(row.id, "location", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.acquisitionValue, (val) =>
                    handleSubsidiaryChange(row.id, "acquisitionValue", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {renderEditableCell(row.percentageHeld, (val) =>
                    handleSubsidiaryChange(row.id, "percentageHeld", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.capitalAmount, (val) =>
                    handleSubsidiaryChange(row.id, "capitalAmount", val)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(row.lastResult, (val) =>
                    handleSubsidiaryChange(row.id, "lastResult", val)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note4;
