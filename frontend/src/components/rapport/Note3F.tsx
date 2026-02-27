import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface ExerciseRow {
  id: string;
  account: string;
  amount: string;
}

interface ExerciseData {
  rows: ExerciseRow[];
  total: string;
}

const Note3F: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  const [globalAmount, setGlobalAmount] = useState<string>("");
  const [retainedDuration, setRetainedDuration] = useState<string>("");

  // Exercice N data
  const [exerciseN, setExerciseN] = useState<ExerciseData>({
    rows: [
      { id: "n1", account: "60…", amount: "" },
      { id: "n2", account: "61…", amount: "" },
      { id: "n3", account: "62…", amount: "" },
      { id: "n4", account: "63…", amount: "" },
      { id: "n5", account: "…", amount: "" },
    ],
    total: "",
  });

  // Charges à répartir data
  const [chargesToSpread, setChargesToSpread] = useState<ExerciseData>({
    rows: [
      { id: "c1", account: "60…", amount: "" },
      { id: "c2", account: "61…", amount: "" },
      { id: "c3", account: "62…", amount: "" },
      { id: "c4", account: "63…", amount: "" },
      { id: "c5", account: "…", amount: "" },
    ],
    total: "",
  });

  // Primes de remboursement data
  const [primes, setPrimes] = useState<ExerciseData>({
    rows: [
      { id: "p1", account: "", amount: "" },
      { id: "p2", account: "", amount: "" },
      { id: "p3", account: "", amount: "" },
      { id: "p4", account: "", amount: "" },
      { id: "p5", account: "", amount: "" },
    ],
    total: "",
  });

  const [totalExerciseN1, setTotalExerciseN1] = useState<string>("");
  const [totalExerciseN2, setTotalExerciseN2] = useState<string>("");
  const [totalExerciseN3, setTotalExerciseN3] = useState<string>("");
  const [totalExerciseN4, setTotalExerciseN4] = useState<string>("");
  const [totalGeneral, setTotalGeneral] = useState<string>("");

  const handleExerciseRowChange = (
    setter: React.Dispatch<React.SetStateAction<ExerciseData>>,
    id: string,
    field: "account" | "amount",
    value: string
  ) => {
    setter((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);

      // Dynamically import libraries
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
          pdf.save("note_3f_charges.pdf");
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
          Prévisualiser Rapport - Note 3F
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
        <div className="text-center font-bold mb-3 text-base">16</div>

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
          <div>NOTE 3F</div>
          <div>TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES</div>
        </div>

        {/* Tableau Principal */}
        <table className="w-full border-collapse border border-gray-400 text-[10px]">
          <thead>
            <tr className="bg-white">
              <th
                rowSpan={3}
                className="border border-gray-400 p-2 text-left font-bold w-[20%]"
              >
                Libellés
              </th>
              <th colSpan={2} className="border border-gray-400 p-2 font-bold">
                Frais
                <br />
                d'établissement
              </th>
              <th colSpan={2} className="border border-gray-400 p-2 font-bold">
                Charges à répartir
                <br />
                sur plusieurs
                <br />
                exercice
              </th>
              <th colSpan={2} className="border border-gray-400 p-2 font-bold">
                Primes de
                <br />
                remboursement
                <br />
                des obligations
              </th>
            </tr>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-1 font-normal">
                Comptes
              </th>
              <th className="border border-gray-400 p-1 font-normal">
                Montants
              </th>
              <th className="border border-gray-400 p-1 font-normal">
                Comptes
              </th>
              <th className="border border-gray-400 p-1 font-normal">
                Montants
              </th>
              <th className="border border-gray-400 p-1 font-normal">
                Comptes
              </th>
              <th className="border border-gray-400 p-1 font-normal">
                Montants
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Montant global à étaler */}
            <tr className="bg-white">
              <td className="border border-gray-400 p-1 font-bold">
                Montant global à étaler au 1er
                <br />
                janvier
              </td>
              <td
                colSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                {renderEditableCell(
                  globalAmount,
                  setGlobalAmount,
                  "text-center"
                )}
              </td>
              <td colSpan={2} className="border border-gray-400 p-1"></td>
              <td colSpan={2} className="border border-gray-400 p-1"></td>
            </tr>

            {/* Durée d'étalement retenue */}
            <tr className="bg-gray-200">
              <td className="border border-gray-400 p-1 font-bold">
                Durée d'étalement retenue
              </td>
              <td
                colSpan={6}
                className="border border-gray-400 p-1 text-center"
              >
                {renderEditableCell(
                  retainedDuration,
                  setRetainedDuration,
                  "text-center"
                )}
              </td>
            </tr>

            {/* Sous-en-tête */}
            <tr className="bg-gray-200">
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-center font-normal">
                60…
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-center font-normal">
                60…
              </td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>

            {/* Exercice N */}
            <tr className="bg-white">
              <td
                rowSpan={6}
                className="border border-gray-400 p-1 font-bold align-top"
              >
                Exercice N
              </td>
              {exerciseN.rows.slice(0, 1).map((row) => (
                <React.Fragment key={row.id}>
                  <td className="border border-gray-400 p-1 text-center">
                    {renderEditableCell(
                      row.account,
                      (val) =>
                        handleExerciseRowChange(
                          setExerciseN,
                          row.id,
                          "account",
                          val
                        ),
                      "text-center"
                    )}
                  </td>
                  <td className="border border-gray-400 p-1 text-right">
                    {renderEditableCell(
                      row.amount,
                      (val) =>
                        handleExerciseRowChange(
                          setExerciseN,
                          row.id,
                          "amount",
                          val
                        ),
                      "text-right"
                    )}
                  </td>
                  {chargesToSpread.rows.slice(0, 1).map((cRow) => (
                    <React.Fragment key={cRow.id}>
                      <td className="border border-gray-400 p-1 text-center">
                        {renderEditableCell(
                          cRow.account,
                          (val) =>
                            handleExerciseRowChange(
                              setChargesToSpread,
                              cRow.id,
                              "account",
                              val
                            ),
                          "text-center"
                        )}
                      </td>
                      <td className="border border-gray-400 p-1 text-right">
                        {renderEditableCell(
                          cRow.amount,
                          (val) =>
                            handleExerciseRowChange(
                              setChargesToSpread,
                              cRow.id,
                              "amount",
                              val
                            ),
                          "text-right"
                        )}
                      </td>
                    </React.Fragment>
                  ))}
                  {primes.rows.slice(0, 1).map((pRow) => (
                    <React.Fragment key={pRow.id}>
                      <td className="border border-gray-400 p-1 text-center">
                        {renderEditableCell(
                          pRow.account,
                          (val) =>
                            handleExerciseRowChange(
                              setPrimes,
                              pRow.id,
                              "account",
                              val
                            ),
                          "text-center"
                        )}
                      </td>
                      <td className="border border-gray-400 p-1 text-right">
                        {renderEditableCell(
                          pRow.amount,
                          (val) =>
                            handleExerciseRowChange(
                              setPrimes,
                              pRow.id,
                              "amount",
                              val
                            ),
                          "text-right"
                        )}
                      </td>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tr>
            {[1, 2, 3, 4].map((idx) => (
              <tr key={`ex-n-${idx}`} className="bg-white">
                <td className="border border-gray-400 p-1 text-center">
                  {renderEditableCell(
                    exerciseN.rows[idx].account,
                    (val) =>
                      handleExerciseRowChange(
                        setExerciseN,
                        exerciseN.rows[idx].id,
                        "account",
                        val
                      ),
                    "text-center"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(
                    exerciseN.rows[idx].amount,
                    (val) =>
                      handleExerciseRowChange(
                        setExerciseN,
                        exerciseN.rows[idx].id,
                        "amount",
                        val
                      ),
                    "text-right"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {renderEditableCell(
                    chargesToSpread.rows[idx].account,
                    (val) =>
                      handleExerciseRowChange(
                        setChargesToSpread,
                        chargesToSpread.rows[idx].id,
                        "account",
                        val
                      ),
                    "text-center"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(
                    chargesToSpread.rows[idx].amount,
                    (val) =>
                      handleExerciseRowChange(
                        setChargesToSpread,
                        chargesToSpread.rows[idx].id,
                        "amount",
                        val
                      ),
                    "text-right"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {renderEditableCell(
                    primes.rows[idx].account,
                    (val) =>
                      handleExerciseRowChange(
                        setPrimes,
                        primes.rows[idx].id,
                        "account",
                        val
                      ),
                    "text-center"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {renderEditableCell(
                    primes.rows[idx].amount,
                    (val) =>
                      handleExerciseRowChange(
                        setPrimes,
                        primes.rows[idx].id,
                        "amount",
                        val
                      ),
                    "text-right"
                  )}
                </td>
              </tr>
            ))}

            {/* Total exercice N */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1">Total exercice N</td>
              <td colSpan={2} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  exerciseN.total,
                  (val) => setExerciseN({ ...exerciseN, total: val }),
                  "text-right"
                )}
              </td>
              <td colSpan={2} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  chargesToSpread.total,
                  (val) =>
                    setChargesToSpread({ ...chargesToSpread, total: val }),
                  "text-right"
                )}
              </td>
              <td colSpan={2} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  primes.total,
                  (val) => setPrimes({ ...primes, total: val }),
                  "text-right"
                )}
              </td>
            </tr>

            {/* Total exercice N-1 */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1">Total exercice N-1</td>
              <td colSpan={6} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  totalExerciseN1,
                  setTotalExerciseN1,
                  "text-right"
                )}
              </td>
            </tr>

            {/* Total exercice N-2 */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1">Total exercice N-2</td>
              <td colSpan={6} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  totalExerciseN2,
                  setTotalExerciseN2,
                  "text-right"
                )}
              </td>
            </tr>

            {/* Total exercice N-3 */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1">Total exercice N-3</td>
              <td colSpan={6} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  totalExerciseN3,
                  setTotalExerciseN3,
                  "text-right"
                )}
              </td>
            </tr>

            {/* Total exercice N-4 */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1">Total exercice N-4</td>
              <td colSpan={6} className="border border-gray-400 p-1 text-right">
                {renderEditableCell(
                  totalExerciseN4,
                  setTotalExerciseN4,
                  "text-right"
                )}
              </td>
            </tr>

            {/* TOTAL GENERAL */}
            <tr className="bg-gray-400 font-bold">
              <td className="border border-gray-400 p-2">TOTAL GENERAL</td>
              <td colSpan={6} className="border border-gray-400 p-2 text-right">
                {renderEditableCell(
                  totalGeneral,
                  setTotalGeneral,
                  "text-right"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note3F;
