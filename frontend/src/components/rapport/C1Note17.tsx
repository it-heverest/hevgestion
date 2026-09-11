import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, RefreshCw, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";

// --- Interfaces ---
interface LedgerRow {
  id: string;
  numero: number;
  accountNumber: string;
  openingDebit: number;
  openingCredit: number;
  movementsDebit: number;
  movementsCredit: number;
  closingDebit: number;
  closingCredit: number;
  variationDebit: number;
  variationCredit: number;
}

interface PurchaseRow {
  id: string;
  account: string;
  ligne: number;
  rubriques: string;
  quantity: number;
  unitPrice: number;
}

interface TransportRow {
  id: string;
  compte: string;
  ligne: number;
  label: string;
  routier: number;
  ferroviaire: number;
  parEau: number;
  parAir: number;
  servicesAuxiliaires: number;
  supportesEtranger: number;
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

        if (noteData.ledgerRows) {
          setLedgerRows((prev) =>
            prev.map((row, i) => ({ ...row, ...noteData.ledgerRows[i] }))
          );
        }
        if (noteData.purchaseRows) setPurchaseRows(noteData.purchaseRows);
        if (noteData.gainsDeChange) setGainsDeChange(noteData.gainsDeChange);
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
        gainsDeChange,
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

  // Balance générale fournisseurs — 6 comptes (mêmes libellés que le modèle DGI)
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>(
    ["654321", "543216", "432165", "321654", "216543", "1654321"].map(
      (accountNumber, i) => ({
        id: `${i + 1}`,
        numero: i + 1,
        accountNumber,
        openingDebit: 0,
        openingCredit: 0,
        movementsDebit: 0,
        movementsCredit: 0,
        closingDebit: 0,
        closingCredit: 0,
        variationDebit: 0,
        variationCredit: 0,
      })
    )
  );

  // Compte 60: Achats — 18 lignes (comptes 601 à 608, puis regroupements)
  const [purchaseRows, setPurchaseRows] = useState<PurchaseRow[]>(
    [
      "601",
      "602",
      "603",
      "604",
      "6041",
      "6042",
      "6043",
      "6044",
      "6051",
      "6052",
      "6053",
      "6054",
      "6055",
      "6056",
      "6057",
      "608",
      "6015/6045/6085",
      "6019/6029/6049/6059/6089",
    ].map((account, i) => ({
      id: `${i + 1}`,
      account,
      ligne: i + 1,
      rubriques: "",
      quantity: 0,
      unitPrice: 0,
    }))
  );

  // Ligne récapitulative "Totaux lignes 1 à 5 / Gains de change" à la suite des 18 comptes
  const [gainsDeChange, setGainsDeChange] = useState({
    quantity: 0,
    unitPrice: 0,
  });

  // Compte 61: Transports — 6 lignes (comptes 61 à 618), numérotées 7 à 12
  // (le formulaire numérote 1 à 6 les colonnes de frais et 7 à 12 les lignes,
  // d'où le "TOTAL 7=1+2+3+4+5+6" par ligne et "Total (7+8+9+10+11+12)" en pied)
  const [transportRows, setTransportRows] = useState<TransportRow[]>(
    [
      { compte: "61", label: "Transport sur achats" },
      { compte: "612", label: "Transports sur ventes" },
      { compte: "613", label: "Transports pour le compte Tiers" },
      { compte: "614", label: "Transport du Personnel" },
      { compte: "616", label: "Transport de Plis" },
      { compte: "618", label: "Autres frais de transport" },
    ].map((row, i) => ({
      id: `${i + 1}`,
      compte: row.compte,
      ligne: i + 7,
      label: row.label,
      routier: 0,
      ferroviaire: 0,
      parEau: 0,
      parAir: 0,
      servicesAuxiliaires: 0,
      supportesEtranger: 0,
    }))
  );

  const handleLedgerChange = (
    id: string,
    field: keyof Omit<LedgerRow, "id" | "numero" | "accountNumber">,
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
    field: "rubriques" | "quantity" | "unitPrice",
    value: string
  ) => {
    setPurchaseRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "rubriques" ? value : Number(value) || 0,
            }
          : row
      )
    );
  };

  const handleTransportChange = (
    id: string,
    field:
      | "routier"
      | "ferroviaire"
      | "parEau"
      | "parAir"
      | "servicesAuxiliaires"
      | "supportesEtranger",
    value: string
  ) => {
    setTransportRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const transportRowTotal = (row: TransportRow) =>
    row.routier +
    row.ferroviaire +
    row.parEau +
    row.parAir +
    row.servicesAuxiliaires +
    row.supportesEtranger;

  const transportGrandTotal = transportRows.reduce(
    (acc, row) => acc + transportRowTotal(row),
    0
  );

  const [isRegeneratingDSF, setIsRegeneratingDSF] = useState(false);

  // Régénère la DSF côté backend (relance dsf-generator.service.ts avec le
  // mapping comptable / les formules actuelles), puis recharge cette note
  // pour refléter les nouvelles valeurs.
  const regenerateDSF = async () => {
    if (!folderId) return;
    try {
      setIsRegeneratingDSF(true);
      await dsfService.generateDSF(folderId);
      await loadNoteData();
    } catch (error) {
      console.error("Error regenerating DSF:", error);
      alert("Erreur lors de la régénération de la DSF");
    } finally {
      setIsRegeneratingDSF(false);
    }
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

  const numberCell = (
    value: number,
    onChange: (value: string) => void
  ) => (
    <td className="border border-gray-400 p-1 text-right">
      {isEditing ? (
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-right bg-orange-50"
        />
      ) : (
        (value ?? 0).toLocaleString("fr-FR").replace(/\u202F/g, " ")
      )}
    </td>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-full max-w-[1400px] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          C1/NOTE 17 - Extrait de la Balance Générale Fournisseurs
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
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} className={isSaving ? "animate-pulse" : ""} /> : <Pencil size={18} />}
          </button>
          {isEditing && (
            <button
            onClick={() => {
                setIsEditing(false);
                loadNoteData();
              }}
            title="Annuler"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
          )}
          <button
            onClick={regenerateDSF}
            disabled={isRegeneratingDSF}
            title="Recalculer la DSF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isRegeneratingDSF ? "animate-spin" : ""} />
          </button>
          <button
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-full max-w-[1400px] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            32
          </span>
        </div>

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
          C1/NOTE 17
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
              <th rowSpan={2} className="border border-gray-400 p-1">
                Numéro
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
                <td className="border border-gray-400 p-1 text-center">
                  {row.numero}
                </td>
                {numberCell(row.openingDebit, (v) =>
                  handleLedgerChange(row.id, "openingDebit", v)
                )}
                {numberCell(row.openingCredit, (v) =>
                  handleLedgerChange(row.id, "openingCredit", v)
                )}
                {numberCell(row.movementsDebit, (v) =>
                  handleLedgerChange(row.id, "movementsDebit", v)
                )}
                {numberCell(row.movementsCredit, (v) =>
                  handleLedgerChange(row.id, "movementsCredit", v)
                )}
                {numberCell(row.closingDebit, (v) =>
                  handleLedgerChange(row.id, "closingDebit", v)
                )}
                {numberCell(row.closingCredit, (v) =>
                  handleLedgerChange(row.id, "closingCredit", v)
                )}
                {numberCell(row.variationDebit, (v) =>
                  handleLedgerChange(row.id, "variationDebit", v)
                )}
                {numberCell(row.variationCredit, (v) =>
                  handleLedgerChange(row.id, "variationCredit", v)
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Compte 60: Achats */}
        <div className="text-center font-bold mb-2">Compte 60: Achats</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1">
                No Compte
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                RUBRIQUES
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1 w-6">
                Ligne
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                N° de la Nomenclature
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Quantité</th>
              <th className="border border-gray-400 p-1">Prix Unitaire</th>
              <th className="border border-gray-400 p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchaseRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 text-center font-mono">
                  {row.account}
                </td>
                <td className="border border-gray-400 p-1">
                  {isEditing ? (
                    <input
                      value={row.rubriques}
                      onChange={(e) =>
                        handlePurchaseChange(row.id, "rubriques", e.target.value)
                      }
                      className="w-full bg-orange-50"
                    />
                  ) : (
                    row.rubriques
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.ligne}
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
                    row.quantity.toLocaleString("fr-FR").replace(/\u202F/g, " ")
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
                    row.unitPrice.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(row.quantity * row.unitPrice).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
                </td>
              </tr>
            ))}
            {/* Ligne récapitulative, à la suite des 18 comptes */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-gray-400 p-1 text-center">
                Totaux lignes 1 à 5
              </td>
              <td className="border border-gray-400 p-1">Gains de change</td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-right">
                {isEditing ? (
                  <input
                    type="number"
                    value={gainsDeChange.quantity}
                    onChange={(e) =>
                      setGainsDeChange((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full text-right bg-orange-50"
                  />
                ) : (
                  gainsDeChange.quantity.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {isEditing ? (
                  <input
                    type="number"
                    value={gainsDeChange.unitPrice}
                    onChange={(e) =>
                      setGainsDeChange((prev) => ({
                        ...prev,
                        unitPrice: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full text-right bg-orange-50"
                  />
                ) : (
                  gainsDeChange.unitPrice.toLocaleString("fr-FR").replace(/\u202F/g, " ")
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {(
                  gainsDeChange.quantity * gainsDeChange.unitPrice
                ).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Compte 61: Transports */}
        <div className="text-center font-bold mb-2">COMPTE 61: TRANSPORTS</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={3} className="border border-gray-400 p-1 w-6">
                Comptes
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1 w-[18%]">
                OBJET DU TRANSPORT
              </th>
              <th colSpan={4} className="border border-gray-400 p-1">
                FRAIS DE TRANSPORT SUPPORTÉS AU CAMEROUN
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1">
                Service Auxiliaires des Transports
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1">
                Supportés à l'étranger
              </th>
              <th rowSpan={3} className="border border-gray-400 p-1">
                TOTAL 7=1+2+3+4+5+6
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th colSpan={2} className="border border-gray-400 p-1">
                Transport terrestre
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Par Eau
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Par Air
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Routier</th>
              <th className="border border-gray-400 p-1">Ferroviaire</th>
            </tr>
          </thead>
          <tbody>
            {transportRows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1 text-center font-mono">
                  {row.compte}
                </td>
                <td className="border border-gray-400 p-1 pl-2">
                  {row.label}
                </td>
                {numberCell(row.routier, (v) =>
                  handleTransportChange(row.id, "routier", v)
                )}
                {numberCell(row.ferroviaire, (v) =>
                  handleTransportChange(row.id, "ferroviaire", v)
                )}
                {numberCell(row.parEau, (v) =>
                  handleTransportChange(row.id, "parEau", v)
                )}
                {numberCell(row.parAir, (v) =>
                  handleTransportChange(row.id, "parAir", v)
                )}
                {numberCell(row.servicesAuxiliaires, (v) =>
                  handleTransportChange(row.id, "servicesAuxiliaires", v)
                )}
                {numberCell(row.supportesEtranger, (v) =>
                  handleTransportChange(row.id, "supportesEtranger", v)
                )}
                <td className="border border-gray-400 p-1 text-right font-bold">
                  {transportRowTotal(row).toLocaleString("fr-FR").replace(/\u202F/g, " ")}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-300 font-bold">
              <td
                colSpan={2}
                className="border border-gray-400 p-1 pl-2"
              >
                Total (7+8+9+10+11+12)
              </td>
              <td colSpan={6} className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1 text-right">
                {transportGrandTotal.toLocaleString("fr-FR").replace(/\u202F/g, " ")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-8 border border-gray-400 p-2 bg-white flex flex-col gap-2">
          <div className="font-bold underline">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-1 border border-orange-300 bg-orange-50 focus:outline-none resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[6rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Note17Annex;
