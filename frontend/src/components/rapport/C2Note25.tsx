import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface AdValoremRow {
  id: string;
  natureProduit: string | React.ReactNode;
  baseBrute: number;
  abatementRate: string;
  abatementAmount: number;
  baseNette: number;
  taux: string;
  montantDroits: number;
  droitsPayes: number;
  solde: number;
}

interface SpecificRow {
  id: string;
  natureProduit: string | React.ReactNode;
  productionLocale: number;
  importation: number;
  exportation: number;
  quantitesTotales: number;
  unite: string;
  tarif: number;
  montantDroits: number;
  droitsPayes: number;
  solde: number;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const C2Note25: React.FC = () => {
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
      const noteData = await notesService.getNoteData(folderId, "C2/25") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.adValoremRows) setAdValoremRows(noteData.adValoremRows);
        if (noteData.specificRows) setSpecificRows(noteData.specificRows);
        if (noteData.comment !== undefined) setComment(noteData.comment);
      }
    } catch (error) {
      console.error("Error loading Note C2/25 data:", error);
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
        adValoremRows,
        specificRows,
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "C2/25", noteData as any);
      if (success) {
        alert("Données Note C2/25 sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Note C2/25 data:", error);
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

  const [adValoremRows, setAdValoremRows] = useState<AdValoremRow[]>([
    {
      id: "1",
      natureProduit:
        "Boissons gazeuses, sodas et autres boissons sucrées importées",
      baseBrute: 0,
      abatementRate: "25%",
      abatementAmount: 0,
      baseNette: 0,
      taux: "25%",
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "2",
      natureProduit: "Bières ayant un degré d'alcool ≤ 5,5",
      baseBrute: 0,
      abatementRate: "10%",
      abatementAmount: 0,
      baseNette: 0,
      taux: "25%",
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "3",
      natureProduit: "Bières ayant un degré d'alcool > 5,5",
      baseBrute: 0,
      abatementRate: "",
      abatementAmount: 0,
      baseNette: 0,
      taux: "25%",
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "4",
      natureProduit:
        "Jeux de hasard et divertissement non soumis à la taxe sur les jeux",
      baseBrute: 0,
      abatementRate: "",
      abatementAmount: 0,
      baseNette: 0,
      taux: "5%",
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "5",
      natureProduit: "Communication téléphone mobile et de services internet",
      baseBrute: 0,
      abatementRate: "",
      abatementAmount: 0,
      baseNette: 0,
      taux: "2%",
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "6",
      natureProduit: "Sous total (a)",
      baseBrute: 0,
      abatementRate: "",
      abatementAmount: 0,
      baseNette: 0,
      taux: "",
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
  ]);

  const [specificRows, setSpecificRows] = useState<SpecificRow[]>([
    {
      id: "1",
      natureProduit: "Bières 65 cl",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "65 cl",
      tarif: 75,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "2",
      natureProduit: "Bières 33 cl",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "33 cl",
      tarif: 37.5,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "3",
      natureProduit: "Bières autre contenance",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "Au prorata",
      tarif: 2,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "4",
      natureProduit: "Spiritueux dits alcools mixtes produits localement",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 2,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "5",
      natureProduit:
        "Spiritueux dits alcools mixtes de gamme inférieure importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 3,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "6",
      natureProduit:
        "Spiritueux dits alcools mixtes de gamme supérieure importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 6,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "7",
      natureProduit: "Vins produits localement",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 2,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "8",
      natureProduit: "Vins de gamme inférieure importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 3,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "9",
      natureProduit: "Vins dit de grand cru ou haut de gamme",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 6,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "10",
      natureProduit: "Whiskies produits localement",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 8,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "11",
      natureProduit: "Whiskies de gamme inférieure importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 10,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "12",
      natureProduit: "Whiskies haut de gamme ou de gamme supérieure importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 20,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "13",
      natureProduit: "Champagnes produits localement",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 25,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "14",
      natureProduit: "Champagnes de gamme inférieure importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 30,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "15",
      natureProduit: "Champagne haut gamme importés",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 60,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "16",
      natureProduit:
        "Boissons gazeuses, sodas et autres boissons sucrées importées",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "par cl",
      tarif: 2.5,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "17",
      natureProduit:
        "Emballages non retournables des boissons alcooliques et gazeuses",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "",
      tarif: 15,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "18",
      natureProduit: "Emballages non retournables autres produits*",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "",
      tarif: 5,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "19",
      natureProduit: "Sous total (b)",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "",
      tarif: 0,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
    {
      id: "20",
      natureProduit: "Total (a+b)",
      productionLocale: 0,
      importation: 0,
      exportation: 0,
      quantitesTotales: 0,
      unite: "",
      tarif: 0,
      montantDroits: 0,
      droitsPayes: 0,
      solde: 0,
    },
  ]);

  const handleAdValoremChange = (
    id: string,
    field: keyof AdValoremRow,
    value: string
  ) => {
    setAdValoremRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const handleSpecificChange = (
    id: string,
    field: keyof SpecificRow,
    value: string
  ) => {
    setSpecificRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
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
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape pour plus de colonnes
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("c2note_25_droits_accises.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-full mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          C2'Note 25 - Tableau de Régularisation Annuelle des Droits d'Accises
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
                : "bg-blue-600 hover:bg-blue-700"
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-full mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <div className="text-center font-bold mb-2 text-lg">39</div>

        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité (s) :</span>
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
                className="border-b border-blue-500 bg-blue-50 w-20 px-1"
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

        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-4">
          C2'NOTE 25
          <br />
          TABLEAU DE REGULARISATION ANNUELLE DES DROITS D'ACCISES :
          DETERMINATION DES DROITS D'ACCISES A REVERSER
        </div>

        {/* A. DROITS D'ACCISES AD VALOREM */}
        <div className="font-bold mb-2">A. DROITS D'ACCISES AD VALOREM</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-8">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1">
                N°
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[30%]"
              >
                Nature du Produit
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Base brute taxable
              </th>
              <th colSpan={2} className="border border-gray-400 p-1">
                Abattement
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Base nette taxable
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Taux
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Montant des Droits
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Droits d'accises payés pendant l'exercice
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Solde Droits d'accises à reverser
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">Taux</th>
              <th className="border border-gray-400 p-1">Montant</th>
            </tr>
          </thead>
          <tbody>
            {adValoremRows.map((row) => (
              <tr
                key={row.id}
                className={row.id === "6" ? "bg-gray-300 font-bold" : ""}
              >
                <td className="border border-gray-400 p-1 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-400 p-1 pl-2">
                  {row.natureProduit}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.baseBrute}
                      onChange={(e) =>
                        handleAdValoremChange(
                          row.id,
                          "baseBrute",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.baseBrute.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.abatementRate}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.abatementAmount}
                      onChange={(e) =>
                        handleAdValoremChange(
                          row.id,
                          "abatementAmount",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.abatementAmount.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(row.baseBrute - row.abatementAmount).toLocaleString(
                    "fr-FR"
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.taux}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(
                    (row.baseBrute - row.abatementAmount) *
                    (parseFloat(row.taux) / 100 || 0)
                  ).toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.droitsPayes}
                      onChange={(e) =>
                        handleAdValoremChange(
                          row.id,
                          "droitsPayes",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.droitsPayes.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(
                    (row.baseBrute - row.abatementAmount) *
                    (parseFloat(row.taux) / 100 || 0) -
                    row.droitsPayes
                  ).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* B. DROITS D'ACCISES SPECIFIQUES */}
        <div className="font-bold mb-2">B. DROITS D'ACCISES SPECIFIQUES</div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={2} className="border border-gray-400 p-1">
                N°
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[30%]"
              >
                Nature du produit
              </th>
              <th colSpan={3} className="border border-gray-400 p-1">
                Quantités
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Unité de calcul
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Tarif en
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Montant des Droits
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Droits d'accises payés pendant
              </th>
              <th rowSpan={2} className="border border-gray-400 p-1">
                Solde d'accises à
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">
                Production locale QTE
              </th>
              <th className="border border-gray-400 p-1">Importation QTE</th>
              <th className="border border-gray-400 p-1">Exportation QTE</th>
            </tr>
          </thead>
          <tbody>
            {specificRows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.id === "19" || row.id === "20"
                    ? "bg-gray-300 font-bold"
                    : ""
                }
              >
                <td className="border border-gray-400 p-1 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-400 p-1 pl-2">
                  {row.natureProduit}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.productionLocale}
                      onChange={(e) =>
                        handleSpecificChange(
                          row.id,
                          "productionLocale",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.productionLocale.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.importation}
                      onChange={(e) =>
                        handleSpecificChange(
                          row.id,
                          "importation",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.importation.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.exportation}
                      onChange={(e) =>
                        handleSpecificChange(
                          row.id,
                          "exportation",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.exportation.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(
                    row.productionLocale +
                    row.importation -
                    row.exportation
                  ).toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.unite}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {row.tarif.toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(
                    (row.productionLocale + row.importation - row.exportation) *
                    row.tarif
                  ).toLocaleString("fr-FR")}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.droitsPayes}
                      onChange={(e) =>
                        handleSpecificChange(
                          row.id,
                          "droitsPayes",
                          e.target.value
                        )
                      }
                      className="w-full text-right bg-blue-50"
                    />
                  ) : (
                    row.droitsPayes.toLocaleString("fr-FR")
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {(
                    (row.productionLocale + row.importation - row.exportation) *
                    row.tarif -
                    row.droitsPayes
                  ).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes */}
        <div className="mt-4 text-[10px] text-gray-600 italic space-y-1">
          <p>
            * le montant du droit d'accises résultant de l'application du taux
            de 25% ne peut être inférieur à 5 000 FCFA pour 1000 tiges de
            cigarettes
          </p>
          <p>**Plafonné à 10% de la valeur du produit</p>
        </div>
      </div>
    </div>
  );
};

export default C2Note25;



