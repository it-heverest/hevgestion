import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "../../contexts/AppContext";
import { notesService } from "../../services/notes.service";

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
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  const [globalAmount, setGlobalAmount] = useState<string>("");
  const [retainedDuration, setRetainedDuration] = useState<string>("");

  // Exercice N data
  const [exerciseN, setExerciseN] = useState<ExerciseData>({
    rows: [
      { id: "n1", account: "", amount: "" },
      { id: "n2", account: "", amount: "" },
      { id: "n3", account: "", amount: "" },
      { id: "n4", account: "", amount: "" },
      { id: "n5", account: "", amount: "" },
    ],
    total: "",
  });

  // Charges à répartir data
  const [chargesToSpread, setChargesToSpread] = useState<ExerciseData>({
    rows: [
      { id: "c1", account: "", amount: "" },
      { id: "c2", account: "", amount: "" },
      { id: "c3", account: "", amount: "" },
      { id: "c4", account: "", amount: "" },
      { id: "c5", account: "", amount: "" },
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

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  useEffect(() => {
    if (selectedClient && selectedFolder && !headerInfo.entityName) {
      setHeaderInfo({
        entityName: selectedClient.name || "",
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: "12",
      });
    }
  }, [selectedClient, selectedFolder]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "3F")) as any;
      if (!noteData) return;

      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      if (noteData.montantGlobalEtDuree && noteData.montantGlobalEtDuree.length > 0) {
        setGlobalAmount(noteData.montantGlobalEtDuree[0]?.fraisEtablissement?.toString() || "");
        setRetainedDuration(noteData.montantGlobalEtDuree[1]?.fraisEtablissement?.toString() || "");
      }

      if (noteData.exerciceN) {
        const rowsN = noteData.exerciceN.map((row: any, i: number) => ({
          id: `n${i + 1}`,
          account: row.fraisEtablissementCompte || "",
          amount: row.fraisEtablissementMontant?.toString() || "",
        }));
        setExerciseN(prev => ({ ...prev, rows: rowsN.slice(0, 5) }));

        const rowsC = noteData.exerciceN.map((row: any, i: number) => ({
          id: `c${i + 1}`,
          account: row.chargesARepartirCompte || "",
          amount: row.chargesARepartirMontant?.toString() || "",
        }));
        setChargesToSpread(prev => ({ ...prev, rows: rowsC.slice(0, 5) }));

        const rowsP = noteData.exerciceN.map((row: any, i: number) => ({
          id: `p${i + 1}`,
          account: row.primesRemboursementCompte || "",
          amount: row.primesRemboursementMontant?.toString() || "",
        }));
        setPrimes(prev => ({ ...prev, rows: rowsP.slice(0, 5) }));
      }

      if (noteData.totaux && noteData.totaux.length > 0) {
        setExerciseN(prev => ({ ...prev, total: noteData.totaux[0]?.fraisEtablissementMontant?.toString() || "" }));
        setChargesToSpread(prev => ({ ...prev, total: noteData.totaux[0]?.chargesARepartirMontant?.toString() || "" }));
        setPrimes(prev => ({ ...prev, total: noteData.totaux[0]?.primesRemboursementMontant?.toString() || "" }));

        setTotalExerciseN1(noteData.totaux[1]?.fraisEtablissementMontant?.toString() || "");
        setTotalExerciseN2(noteData.totaux[2]?.fraisEtablissementMontant?.toString() || "");
        setTotalExerciseN3(noteData.totaux[3]?.fraisEtablissementMontant?.toString() || "");
        setTotalExerciseN4(noteData.totaux[4]?.fraisEtablissementMontant?.toString() || "");
        setTotalGeneral(noteData.totaux[5]?.fraisEtablissementMontant?.toString() || "");
      }
    } catch (error) {
      console.error("Error loading Note 3F:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      const noteData = {
        entete: headerInfo,
        montantGlobalEtDuree: [
          { fraisEtablissement: parseFloat(globalAmount) || 0, chargesARepartir: 0, primesRemboursement: 0 },
          { fraisEtablissement: parseFloat(retainedDuration) || 0, chargesARepartir: 0, primesRemboursement: 0 },
        ],
        exerciceN: exerciseN.rows.map((row, i) => ({
          fraisEtablissementCompte: row.account,
          fraisEtablissementMontant: parseFloat(row.amount) || 0,
          chargesARepartirCompte: chargesToSpread.rows[i].account,
          chargesARepartirMontant: parseFloat(chargesToSpread.rows[i].amount) || 0,
          primesRemboursementCompte: primes.rows[i].account,
          primesRemboursementMontant: parseFloat(primes.rows[i].amount) || 0,
        })),
        totaux: [
          {
            fraisEtablissementMontant: parseFloat(exerciseN.total) || 0,
            chargesARepartirMontant: parseFloat(chargesToSpread.total) || 0,
            primesRemboursementMontant: parseFloat(primes.total) || 0
          },
          { fraisEtablissementMontant: parseFloat(totalExerciseN1) || 0 },
          { fraisEtablissementMontant: parseFloat(totalExerciseN2) || 0 },
          { fraisEtablissementMontant: parseFloat(totalExerciseN3) || 0 },
          { fraisEtablissementMontant: parseFloat(totalExerciseN4) || 0 },
          { fraisEtablissementMontant: parseFloat(totalGeneral) || 0 },
        ]
      };

      await notesService.saveNoteData(folderId, "3F", noteData as any);
      alert("Données sauvegardées avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving Note 3F:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

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

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);

      setTimeout(async () => {
        try {
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

  const isHeaderIncomplete =
    !headerInfo.entityName ||
    !headerInfo.fiscalYear ||
    !headerInfo.idNumber ||
    !headerInfo.duration;

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

  if (!folderId || !selectedFolder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Aucun dossier sélectionné
          </h2>
          <p className="text-gray-600">
            Veuillez sélectionner un dossier pour voir la Note 3F.
          </p>
          {selectedClient && (
            <p className="text-sm text-gray-500 mt-2">
              Client: {selectedClient.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Note 3F - Étalement des Charges
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
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

      {isLoading && (
        <div className="max-w-[210mm] mx-auto mb-6 bg-blue-50 p-4 rounded border border-blue-200 text-blue-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Chargement des données...
        </div>
      )}

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border-2 ${isEditing ? "border-blue-500" : "border-gray-200"
          }`}
      >
        {isEditing && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {isHeaderIncomplete && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex justify-between items-center">
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

        {/* En-tête du document */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 border-b-2 border-transparent pb-4 text-[10px]">
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Désignation entité :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.entityName || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-20 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center px-1">
                {headerInfo.fiscalYear || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Numéro d'identification :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.idNumber || "-"}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-end justify-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {headerInfo.duration || "-"}
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



