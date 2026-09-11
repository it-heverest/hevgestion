import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface BankRow {
  id: string;
  banque: string;
  numeroCompte: string;
}

interface FicheR1Data {
  siegeSocial: string;
  numeroIdentificationFiscal: string;
  exerciceClosLe: string;
  dureeEnMois: string;
  exerciceComptableDu: string;
  exerciceComptableAu: string;
  dateArreteEffectifComptes: string;
  exercicePrecedentClosLe: string;
  dureeExercicePrecedentEnMois: string;
  greffe: string;
  numeroRegistreCommerce: string;
  numeroRepertoireEntites: string;
  numeroCaisseSociale: string;
  numeroCodeImportateur: string;
  codeActivitePrincipale: string;
  telephone: string;
  email: string;
  code: string;
  bp: string;
  ville: string;
  adresseGeographique: string;
  designationActivitePrincipale: string;
  personneContact: string;
  professionnelComptable: string;
  professionnelComptableLigne2: string;
  etatsFinanciersApprouves: "non1" | "non2" | "oui" | "";
  nomSignataire: string;
  qualiteSignataire: string;
  dateSignature: string;
  banques: BankRow[];
}

const EMPTY_DATA: FicheR1Data = {
  siegeSocial: "",
  numeroIdentificationFiscal: "",
  exerciceClosLe: "",
  dureeEnMois: "",
  exerciceComptableDu: "",
  exerciceComptableAu: "",
  dateArreteEffectifComptes: "",
  exercicePrecedentClosLe: "",
  dureeExercicePrecedentEnMois: "",
  greffe: "",
  numeroRegistreCommerce: "",
  numeroRepertoireEntites: "",
  numeroCaisseSociale: "",
  numeroCodeImportateur: "",
  codeActivitePrincipale: "",
  telephone: "",
  email: "",
  code: "",
  bp: "",
  ville: "",
  adresseGeographique: "",
  designationActivitePrincipale: "",
  personneContact: "",
  professionnelComptable: "",
  professionnelComptableLigne2: "",
  etatsFinanciersApprouves: "",
  nomSignataire: "",
  qualiteSignataire: "",
  dateSignature: "",
  banques: [
    { id: "1", banque: "", numeroCompte: "" },
    { id: "2", banque: "", numeroCompte: "" },
    { id: "3", banque: "", numeroCompte: "" },
  ],
};

// --- Composant Principal ---
const FicheR1: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder, selectedClient } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FicheR1Data>(EMPTY_DATA);

  useEffect(() => {
    if (folderId) loadDSFData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  useEffect(() => {
    if (selectedClient && selectedFolder && !data.numeroIdentificationFiscal) {
      setData((prev) => ({
        ...prev,
        numeroIdentificationFiscal: selectedClient.taxNumber || "",
        exerciceClosLe: selectedFolder.fiscalYear
          ? `31-12-${selectedFolder.fiscalYear}`
          : "",
        dureeEnMois: "12",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, selectedFolder]);

  const loadDSFData = async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      const loaded = (await notesService.getNoteData(folderId, "R1")) as any;
      if (loaded) {
        setData({
          ...EMPTY_DATA,
          ...loaded,
          banques: Array.isArray(loaded.banques) && loaded.banques.length > 0
            ? loaded.banques
            : EMPTY_DATA.banques,
        });
      }
    } catch (error) {
      console.error("Error loading Fiche R1 data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!folderId) return;
    try {
      setSaving(true);
      const success = await notesService.saveNoteData(folderId, "R1", data as any);
      if (!success) alert("Erreur lors de la sauvegarde");
    } catch (error) {
      console.error("Error saving Fiche R1 data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof FicheR1Data>(field: K, value: FicheR1Data[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (id: string, field: "banque" | "numeroCompte", value: string) => {
    setData((prev) => ({
      ...prev,
      banques: prev.banques.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const addBankRow = () => {
    setData((prev) => ({
      ...prev,
      banques: [...prev.banques, { id: `${Date.now()}`, banque: "", numeroCompte: "" }],
    }));
  };

  const deleteBankRow = (id: string) => {
    setData((prev) => ({ ...prev, banques: prev.banques.filter((row) => row.id !== id) }));
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
        pdf.save("fiche_r1.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // Champ texte simple sur une ligne, avec un libellé bref à gauche.
  // `labelNode` permet de remplacer le libellé texte par du JSX (ex.
  // portion en rouge, comme dans le modèle Excel d'origine).
  const field = (
    label: string,
    key: keyof FicheR1Data,
    className = "",
    labelClassName = "",
    labelNode?: React.ReactNode,
  ) => (
    <div className={`flex items-end gap-1 ${className}`}>
      <span className={`whitespace-nowrap ${labelClassName}`}>
        {labelNode ?? `${label} :`}
      </span>
      {isEditing ? (
        <input
          value={data[key] as string}
          onChange={(e) => setField(key, e.target.value as any)}
          className="border-b border-orange-500 bg-orange-50 flex-1 px-1 focus:outline-none"
        />
      ) : (
        <span className="border-b border-dotted border-gray-400 flex-1">
          {data[key] as string}
        </span>
      )}
    </div>
  );

  // Case vide encadrée, avec la légende centrée EN DESSOUS (pas à côté) —
  // c'est le style du modèle Excel d'origine pour les zones ZD et suivantes.
  // Légende en bleu marine par défaut (couleur du modèle Excel pour ces
  // libellés) — `captionClassName` permet de la remplacer (ex. signature).
  const boxField = (
    label: React.ReactNode,
    key: keyof FicheR1Data,
    className = "",
    captionClassName = "text-blue-900",
  ) => (
    <div className={`flex flex-col ${className}`}>
      {isEditing ? (
        <input
          value={data[key] as string}
          onChange={(e) => setField(key, e.target.value as any)}
          className="border border-gray-400 h-6 px-1 bg-orange-50 focus:outline-none"
        />
      ) : (
        <div className="border border-gray-400 h-6 px-1 flex items-center">
          {data[key] as string}
        </div>
      )}
      <span className={`text-center text-[10px] mt-0.5 ${captionClassName}`}>{label}</span>
    </div>
  );

  // Bloc "ZX" : lettre de référence dans une colonne étroite + contenu.
  const zoneRow = (zone: string, children: React.ReactNode) => (
    <div className="flex gap-2 py-2">
      <div className="w-10 h-6 flex-shrink-0 flex items-center justify-center font-bold text-black bg-gray-300 border-x border-b border-gray-400">
        {zone}
      </div>
      <div className="flex-1 flex flex-wrap gap-x-6 gap-y-2">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Fiche R1 - Identification de l'Entité
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
              setIsEditing(!isEditing);
            }}
            disabled={saving}
            title={isEditing ? "Sauvegarder" : "Éditer"}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? <Save size={18} className={saving ? "animate-pulse" : ""} /> : <Pencil size={18} />}
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
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            1
          </span>
        </div>

        {/* Titre */}
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-2">
          FICHE R1
        </div>

        {/* En-tête */}
        <div className="border border-gray-400 border-t-0 p-2 mb-2">
          <div className="font-bold mb-1">Description sociale de l'entreprise</div>
          {field("Siège social", "siegeSocial", "mb-1")}
          <div className="flex flex-wrap gap-x-6">
            {field("N° d'identification fiscal", "numeroIdentificationFiscal", "flex-1 min-w-[200px]")}
            {field("Exercice clos le", "exerciceClosLe", "flex-1 min-w-[150px]")}
            {field("Durée en mois", "dureeEnMois", "w-32")}
          </div>
        </div>

        {/* Zones ZA à ZI */}
        <div className="border border-gray-400 p-2 mb-4">
          {zoneRow(
            "ZA",
            <>
              <span className="font-bold">EXERCICE COMPTABLE :</span>
              {isEditing ? (
                <input
                  value={data.exerciceComptableDu}
                  onChange={(e) => setField("exerciceComptableDu", e.target.value)}
                  className="border-b border-orange-500 bg-orange-50 w-32 px-1 focus:outline-none"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-32 inline-block">
                  {data.exerciceComptableDu}
                </span>
              )}
              <span className="font-bold">AU :</span>
              {isEditing ? (
                <input
                  value={data.exerciceComptableAu}
                  onChange={(e) => setField("exerciceComptableAu", e.target.value)}
                  className="border-b border-orange-500 bg-orange-50 w-32 px-1 focus:outline-none"
                />
              ) : (
                <span className="border-b border-dotted border-gray-400 w-32 inline-block">
                  {data.exerciceComptableAu}
                </span>
              )}
            </>,
          )}

          {zoneRow(
            "ZB",
            field("DATE D'ARRETE EFFECTIF DES COMPTES", "dateArreteEffectifComptes", "flex-1"),
          )}

          {zoneRow(
            "ZC",
            <>
              {field("EXERCICE PRECEDENT CLOS LE", "exercicePrecedentClosLe", "flex-1 min-w-[200px]")}
              {field("DUREE EXERCICE PRECEDENT EN MOIS", "dureeExercicePrecedentEnMois", "w-40")}
            </>,
          )}

          {zoneRow(
            "ZD",
            <>
              {boxField("Greffe", "greffe", "flex-1 min-w-[150px]")}
              {boxField("N° Registre du commerce", "numeroRegistreCommerce", "flex-1 min-w-[150px]")}
              {boxField("N° Répertoire des entités", "numeroRepertoireEntites", "flex-1 min-w-[150px]")}
            </>,
          )}

          {zoneRow(
            "ZE",
            <>
              {boxField("N° de caisse sociale", "numeroCaisseSociale", "flex-1 min-w-[150px]")}
              {boxField("N° Code Importateur", "numeroCodeImportateur", "flex-1 min-w-[150px]")}
              {boxField("Code activité principale", "codeActivitePrincipale", "flex-1 min-w-[150px]")}
            </>,
          )}

          {zoneRow(
            "ZG",
            <>
              {boxField(
                <span className="text-gray-700">N° de téléphone</span>,
                "telephone",
                "flex-1 min-w-[130px]",
              )}
              {boxField(<span className="text-gray-700">Email</span>, "email", "flex-1 min-w-[150px]")}
              {boxField("Code", "code", "w-24")}
              {boxField("BP", "bp", "w-24")}
              {boxField("Ville", "ville", "flex-1 min-w-[100px]")}
            </>,
          )}

          {zoneRow(
            "ZH",
            boxField(
              "Adresse géographique complète (Immeuble, Rue, Quartier, Ville, Pays)",
              "adresseGeographique",
              "flex-1",
            ),
          )}

          {zoneRow(
            "ZI",
            boxField(
              "Désignation précise de l'activité principale exercée par l'entreprise",
              "designationActivitePrincipale",
              "flex-1",
            ),
          )}
        </div>

        <div className="mb-4">
          {boxField(
            "Nom, adresse et qualité de la personne à contacter en cas de demande d'informations complémentaires",
            "personneContact",
          )}
        </div>

        <div className="mb-4">
          <div className="text-[10px] text-center mb-1">
            Nom du professionnel salarié de l'entreprise ou
            <br />
            nom, adresse téléphone du cabinet comptable ou du professionnel INSCRIT A
            L'ORDRE NATIONAL DES EXPERTS ET DES COMPTABLES AGREES
            <br />
            ayant établi les états financiers
          </div>
          {isEditing ? (
            <input
              value={data.professionnelComptable}
              onChange={(e) => setField("professionnelComptable", e.target.value)}
              className="border border-gray-400 h-6 px-1 bg-orange-50 w-full focus:outline-none mb-1"
            />
          ) : (
            <div className="border border-gray-400 h-6 px-1 w-full mb-1 flex items-center">
              {data.professionnelComptable}
            </div>
          )}
          {isEditing ? (
            <input
              value={data.professionnelComptableLigne2}
              onChange={(e) => setField("professionnelComptableLigne2", e.target.value)}
              className="border border-gray-400 h-6 px-1 bg-orange-50 w-full focus:outline-none"
            />
          ) : (
            <div className="border border-gray-400 h-6 px-1 w-full flex items-center">
              {data.professionnelComptableLigne2}
            </div>
          )}
        </div>

        {/* Etats financiers approuvés : cases à cocher au-dessus, légende en dessous */}
        <div className="flex flex-col items-end gap-1 mb-6">
          <div className="flex items-center gap-4">
            {([
              { key: "non1", label: "Non" },
              { key: "non2", label: "Non" },
              { key: "oui", label: "Oui" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex flex-col items-center gap-1">
                <input
                  type="checkbox"
                  checked={data.etatsFinanciersApprouves === key}
                  disabled={!isEditing}
                  onChange={() =>
                    setField(
                      "etatsFinanciersApprouves",
                      data.etatsFinanciersApprouves === key ? "" : key,
                    )
                  }
                  className="w-5 h-5 border-2 border-black"
                />
                <span className="text-[10px]">{label}</span>
              </label>
            ))}
          </div>
          <span className="text-right text-[10px]">
            Etats financiers approuvés par l'Assemblée Générale (cocher la case)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            {boxField(
              <>Nom <span className="text-gray-700">du signataire des</span> états financiers</>,
              "nomSignataire",
              "mb-4",
              "text-black",
            )}
            {boxField(
              <>Qualité <span className="text-gray-700">du signataire des</span> états financiers</>,
              "qualiteSignataire",
              "mb-4",
              "text-black",
            )}
            {boxField("Date de signature", "dateSignature", "mb-4", "text-black")}
            <div className="h-16 border border-gray-400 flex items-end justify-center pb-1 text-[10px] text-gray-500">
              Signature
            </div>
          </div>

          <div>
            <div className="font-bold text-center bg-gray-200 border border-gray-400 py-1 mb-1">
              Domiciliation bancaire :
            </div>
            <table className="w-full border-collapse border border-gray-400 text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-1">Banque</th>
                  <th className="border border-gray-400 p-1">Numéro de compte</th>
                  {isEditing && <th className="border border-gray-400 p-1 w-6"></th>}
                </tr>
              </thead>
              <tbody>
                {data.banques.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-gray-400 px-1 py-3">
                      {isEditing ? (
                        <input
                          value={row.banque}
                          onChange={(e) => handleBankChange(row.id, "banque", e.target.value)}
                          className="w-full bg-orange-50 px-1 focus:outline-none"
                        />
                      ) : (
                        row.banque
                      )}
                    </td>
                    <td className="border border-gray-400 px-1 py-3">
                      {isEditing ? (
                        <input
                          value={row.numeroCompte}
                          onChange={(e) => handleBankChange(row.id, "numeroCompte", e.target.value)}
                          className="w-full bg-orange-50 px-1 focus:outline-none"
                        />
                      ) : (
                        row.numeroCompte
                      )}
                    </td>
                    {isEditing && (
                      <td className="border border-gray-400 px-1 py-3 text-center">
                        <button
                          onClick={() => deleteBankRow(row.id)}
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
            {isEditing && (
              <button
                onClick={addBankRow}
                className="mt-1 text-orange-600 hover:text-orange-800 text-[10px] font-medium"
              >
                + Ajouter une ligne
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FicheR1;
