import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface LedgerRow {
  id: string;
  accountNumber: string;
  openingDebit: number;
  openingCredit: number;
  movementsDebit: number;
  movementsCredit: number;
  closingDebit: number;
  closingCredit: number;
  [key: string]: any;
}

interface PurchaseRow {
  id: string;
  account: string;
  nomenclatureNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TransportRow {
  id: string;
  object: string;
  road: number;
  rail: number;
  sea: number;
  air: number;
  auxiliary: string;
  etran: string;
  ger: string;
  total: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const Note17Annex: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      const noteData = await notesService.getNoteData(folderId, "C1/17") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.ledgerRows) setLedgerRows(noteData.ledgerRows);
        if (noteData.purchaseRows) setPurchaseRows(noteData.purchaseRows);
        if (noteData.transportRows) setTransportRows(noteData.transportRows);
        if (noteData.comment !== undefined) setComment(noteData.comment);
      }
    } catch (error) {
      console.error("Error loading Note C1/17 data:", error);
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
        ledgerRows,
        purchaseRows,
        transportRows,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "C1/17", noteData as any);
      if (success) {
        alert("Données Note C1/17 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note C1/17 data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([
    {
      id: "1",
      accountNumber: "604322",
      openingDebit: 0,
      openingCredit: 0,
      movementsDebit: 0,
      movementsCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
    {
      id: "2",
      accountNumber: "604216",
      openingDebit: 0,
      openingCredit: 0,
      movementsDebit: 0,
      movementsCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
    {
      id: "3",
      accountNumber: "432165",
      openingDebit: 0,
      openingCredit: 0,
      movementsDebit: 0,
      movementsCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
    {
      id: "4",
      accountNumber: "321654",
      openingDebit: 0,
      openingCredit: 0,
      movementsDebit: 0,
      movementsCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
    {
      id: "5",
      accountNumber: "216654",
      openingDebit: 0,
      openingCredit: 0,
      movementsDebit: 0,
      movementsCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
    {
      id: "6",
      accountNumber: "1054321",
      openingDebit: 0,
      openingCredit: 0,
      movementsDebit: 0,
      movementsCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
  ]);

  const [purchaseRows, setPurchaseRows] = useState<PurchaseRow[]>(
    Array(18)
      .fill(null)
      .map((_, i) => ({
        id: `${i + 1}`,
        account: i < 17 ? `60${i + 1}` : "Total",
        nomenclatureNumber: "",
        quantity: 0,
        unitPrice: 0,
        total: 0,
      }))
  );

  const [transportRows, setTransportRows] = useState<TransportRow[]>([
    {
      id: "1",
      object: "Transports sur achats",
      road: 0,
      rail: 0,
      sea: 0,
      air: 0,
      auxiliary: "",
      etran: "",
      ger: "",
      total: 0,
    },
    {
      id: "2",
      object: "Transports sur ventes",
      road: 0,
      rail: 0,
      sea: 0,
      air: 0,
      auxiliary: "",
      etran: "",
      ger: "",
      total: 0,
    },
    {
      id: "3",
      object: "Transports pour le c...",
      road: 0,
      rail: 0,
      sea: 0,
      air: 0,
      auxiliary: "",
      etran: "",
      ger: "",
      total: 0,
    },
    {
      id: "4",
      object: "Transports du personnel",
      road: 0,
      rail: 0,
      sea: 0,
      air: 0,
      auxiliary: "",
      etran: "",
      ger: "",
      total: 0,
    },
    {
      id: "5",
      object: "Transports de trans...",
      road: 0,
      rail: 0,
      sea: 0,
      air: 0,
      auxiliary: "",
      etran: "",
      ger: "",
      total: 0,
    },
  ]);

  const handleLedgerChange = (
    id: string,
    field: keyof LedgerRow,
    value: string
  ) => {
    setLedgerRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const handlePurchaseChange = (
    id: string,
    field: keyof PurchaseRow,
    value: string
  ) => {
    setPurchaseRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]:
              field === "nomenclatureNumber" ? value : Number(value) || 0,
          }
          : row
      )
    );
  };

  const handleTransportChange = (
    id: string,
    field: keyof TransportRow,
    value: string
  ) => {
    setTransportRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]:
              field === "auxiliary" || field === "etran" || field === "ger"
                ? value
                : Number(value) || 0,
          }
          : row
      )
    );
  };

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_17_annexe_balance_fournisseurs.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          C'NOTE 17 - Extrait de la Balance Générale Fournisseurs
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) {
                saveNoteData();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-orange-600 hover:bg-orange-700"
              } ${isSaving ? "opacity-50" : ""}`}
          >
            {isSaving ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarde...{" "}
              </>
            ) : isEditing ? (
              <>
                {" "}
                <Save size={18} /> Sauvegarder{" "}
              </>
            ) : (
              <>
                {" "}
                <Pencil size={18} /> Éditer{" "}
              </>
            )}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                loadNoteData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border border-gray-200"
      >
        <div className="text-center font-bold mb-2 text-lg">32</div>

        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité (s) :</span>
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
          <div className="flex gap-2 justify-end">
            <span className="font-bold">Exercice clos le 31-12-</span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-orange-500 bg-orange-50 w-20 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-20 text-center">
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
                className="border-b border-orange-500 bg-orange-50 flex-1 px-1"
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
                className="border-b border-orange-500 bg-orange-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          C'NOTE 17
          <br />
          EXTRAIT DE LA BALANCE GÉNÉRALE FOURNISSEURS
        </div>

        {/* Tableau Balance Générale */}
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1">
                No Compte
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Solde ouverture
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Mouvements
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Solde clôture
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Variation
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Débit</th>
              <th className="border border-gray-400 p-1">Crédit</th>
              <th className="border border-gray-400 p-1">Débit</th>
              <th className="border border-gray-400 p-1">Crédit</th>
              <th className="border border-gray-400 p-1">Débit</th>
              <th className="border border-gray-400 p-1">Crédit</th>
              <th className="border border-gray-400 p-1">Débit</th>
              <th className="border border-gray-400 p-1">Crédit</th>
            </tr>
          </thead>
          <tbody>
            {ledgerRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 text-center font-mono">
                  {row.accountNumber}
                </td>
                {[
                  "openingDebit",
                  "openingCredit",
                  "movementsDebit",
                  "movementsCredit",
                  "closingDebit",
                  "closingCredit",
                ].map((field) => (
                  <td
                    key={field}
                    className="border border-gray-400 p-1 text-right"
                  >
                    {isEditing ? (
                      <input
                        type="number"
                        value={row[field]}
                        onChange={(e) =>
                          handleLedgerChange(row.id, field, e.target.value)
                        }
                        className="w-full text-right bg-orange-50"
                      />
                    ) : (
                      row[field].toLocaleString("fr-FR")
                    )}
                  </td>
                ))}
                <td className="border border-gray-400 p-1 text-right">-</td>
                <td className="border border-gray-400 p-1 text-right">-</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Compte 60: Achats */}
        <div className="text-center font-bold mb-2">Compte 60: Achats</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">No Compte</th>
              <th className="border border-gray-400 p-1">RUBRIQUES</th>
              <th className="border border-gray-400 p-1">
                N° de la Nomenclature
              </th>
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Prix Unitaire</th>
              <th className="border border-gray-400 p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchaseRows.map((row) => (
              <tr
                key={row.id}
                className={row.id === "18" ? "bg-gray-300 font-bold" : ""}
              >
                <td className="border border-gray-400 p-1 text-center">
                  {row.account}
                </td>
                <td className="border border-gray-400 p-1"></td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      value={row.nomenclatureNumber}
                      onChange={(e) =>
                        handlePurchaseChange(
                          row.id,
                          "nomenclatureNumber",
                          e.target.value
                        )
                      }
                      className="w-full text-center bg-orange-50"
                    />
                  ) : (
                    row.nomenclatureNumber
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        handlePurchaseChange(row.id, "quantity", e.target.value)
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.quantity.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) =>
                        handlePurchaseChange(
                          row.id,
                          "unitPrice",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-orange-50"
                    />
                  ) : (
                    row.unitPrice.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(row.quantity * row.unitPrice).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Compte 61: Transports */}
        <div className="text-center font-bold mb-2">COMPTE 61: TRANSPORTS</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1 w-[20%]">
                OBJET DU TRANSPORT
              </th>
              <th colSpan={4} className="border border-gray-400 p-1">
                FRAIS DE TRANSPORT SUPPORTÉS AU CAMEROUN
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                SUPPORT
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                TOTAL 7=1+2+3+4+5+6
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Route</th>
              <th className="border border-gray-400 p-1">Ferroviaire</th>
              <th className="border border-gray-400 p-1">Par Eau</th>
              <th className="border border-gray-400 p-1">Par Air</th>
              <th className="border border-gray-400 p-1">Auxiliaire s</th>
              <th className="border border-gray-400 p-1">A L'ETRAN</th>
              <th className="border border-gray-400 p-1">GER</th>
            </tr>
          </thead>
          <tbody>
            {transportRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 pl-2">
                  {row.object}
                </td>
                {["road", "rail", "sea", "air"].map((f) => (
                  <td key={f} className="border border-gray-400 p-1 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={row[f]}
                        onChange={(e) =>
                          handleTransportChange(row.id, f, e.target.value)
                        }
                        className="w-full text-right bg-orange-50"
                      />
                    ) : (
                      row[f].toLocaleString("fr-FR")
                    )}
                  </td>
                ))}
                {["auxiliary", "etran", "ger"].map((f) => (
                  <td
                    key={f}
                    className="border border-gray-400 p-1 text-center"
                  >
                    {isEditing ? (
                      <input
                        value={row[f]}
                        onChange={(e) =>
                          handleTransportChange(row.id, f, e.target.value)
                        }
                        className="w-full text-center bg-orange-50"
                      />
                    ) : (
                      row[f]
                    )}
                  </td>
                ))}
                <td className="border border-gray-400 p-1 text-right font-bold">
                  {(row.road + row.rail + row.sea + row.air).toLocaleString(
                    "fr-FR"
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 pl-2">
                Total (7=6+8+10+11+12)
              </td>
              <td
                colSpan={8}
                className="border border-gray-400 p-1 text-right"
              ></td>
              <td className="border border-gray-400 p-1 text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Note17Annex;



