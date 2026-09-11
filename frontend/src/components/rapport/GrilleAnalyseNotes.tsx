import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, Check, X, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import { dsfService } from "../../services/dsf.service";

// --- Interfaces ---
interface NoteStatus {
  note: string;
  title: string;
  eco: boolean;
  soc: boolean;
  fisc: boolean;
  cial: boolean;
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// --- Composant Principal ---
const GrilleAnalyseNotes: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load DSF data
  useEffect(() => {
    if (folderId) {
      loadDSFData();
    }
  }, [folderId]);

  const loadDSFData = async () => {
    if (!folderId) return;

    try {
      setLoading(true);
      const data = await notesService.getNoteData(folderId, "grille-analyse-notes") as any;

      if (data) {
        if (data.notes) {
          setNotes(data.notes);
        }

        if (data.headerInfo) {
          setHeaderInfo(data.headerInfo);
        }
      }
    } catch (error) {
      console.error("Error loading DSF data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!folderId) return;

    try {
      setSaving(true);

      const grilleData = {
        headerInfo,
        notes,
      };

      const success = await notesService.saveNoteData(folderId, "grille-analyse-notes", grilleData as any);
      if (!success) {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving to backend:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Header
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Liste des 59 notes/annexes réellement générées par l'application (codes
  // + intitulés repris tels quels des `title:` de chaque `generateNoteX()`
  // dans dsf-generator.service.ts — source faisant foi, plus fiable qu'une
  // relecture d'imprimé). Exclut le tableau des flux de trésorerie (TFT,
  // hors grille) et CF1 (config DB, pas de balance à cocher).
  const NOTE_REFERENCE: [string, string][] = [
    ["NOTE 1", "DETTES GARANTIES PAR DES SURETES REELLES"],
    ["NOTE 2", "INFORMATIONS OBLIGATOIRES"],
    ["NOTE 3A", "IMMOBILISATIONS BRUTES"],
    ["NOTE 3B", "BIENS PRIS EN LOCATION ACQUISITION"],
    ["NOTE 3C", "IMMOBILISATIONS: AMORTISSEMENTS"],
    ["C1/NOTE 3C", "TABLEAU DE SUIVI DES AMORTISSEMENTS DEDUCTIBLES REPUTES DIFFERES EN PERIODE DEFICITAIRE"],
    ["NOTE 3D", "IMMOBILISATIONS: PLUS ET MOINS VALUE DE CESSION"],
    ["NOTE 3E", "INFORMATIONS SUR LES REEVALUATIONS EFFECTUEES PAR L'ENTITE"],
    ["NOTE 3F", "TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES"],
    ["NOTE 4", "IMMOBILISATIONS FINANCIERES"],
    ["NOTE 5", "ACTIF ET PASSIF CIRCULANT HAO"],
    ["NOTE 6", "STOCKS ET ENCOURS"],
    ["NOTE 7", "CLIENTS"],
    ["NOTE 8", "AUTRES CREANCES"],
    ["NOTE 9", "TITRES DE PLACEMENT"],
    ["NOTE 10", "VALEURS A ENCAISSER"],
    ["NOTE 11", "DISPONIBILITES"],
    ["NOTE 12", "ECARTS DE CONVERSION"],
    ["NOTE 13", "VALEUR NOMINALE DES ACTIONS OU PARTS"],
    ["NOTE 14", "PRIMES ET RESERVES"],
    ["NOTE 15A", "SUBVENTIONS ET PROVISIONS REGLEMENTEES"],
    ["NOTE 15B", "AUTRES FONDS PROPRES"],
    ["NOTE 16A", "DETTES FINANCIERES ET RESSOURCES ASSIMILEES"],
    ["NOTE 16B", "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES (METHODE ACTUARIELLE)"],
    ["NOTE 16 Bis", "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES"],
    ["NOTE 16C", "ACTIFS ET PASSIFS EVENTUELS"],
    ["NOTE 17", "FOURNISSEURS D'EXPLOITATION"],
    ["C1/NOTE 17", "EXTRAIT DE LA BALANCE GENERALE FOURNISSEURS"],
    ["NOTE 18", "DETTES FISCALES ET SOCIALES"],
    ["NOTE 19", "AUTRES DETTES ET PROVISIONS POUR RISQUES A COURT TERME"],
    ["NOTE 20", "BANQUES, CREDIT D'ESCOMPTE ET DE TRESORERIE"],
    ["NOTE 21", "CHIFFRE D'AFFAIRES ET AUTRES PRODUITS"],
    ["NOTE 22", "ACHATS"],
    ["NOTE 23", "TRANSPORTS"],
    ["NOTE 24", "SERVICES EXTERIEURS"],
    ["NOTE 25", "IMPOTS ET TAXES"],
    ["C1/NOTE 25", "SYNTHESE DES IMPOTS ET TAXES VERSES"],
    ["C2/NOTE 25", "TABLEAU DE LA REGULARISATION ANNUELLE DES DROITS D'ACCISES: DETERMINATION DES DROITS D'ACCISES A REVERSER"],
    ["NOTE 26", "AUTRES CHARGES"],
    ["NOTE 27A", "CHARGES DE PERSONNEL"],
    ["C1/NOTE 27A", "TABLEAU DE REGULARISATION ANNUELLE DES IMPOTS ET TAXES SUR SALAIRES"],
    ["NOTE 27B", "EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR"],
    ["NOTE 28", "PROVISIONS ET DEPRECIATIONS INSCRITES AU BILAN"],
    ["C1/NOTE 28", "TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE L'EXERCICE: LES REPRISES"],
    ["C2/NOTE 28", "TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE L'EXERCICE: LES DOTATIONS"],
    ["NOTE 29", "CHARGES ET REVENUS FINANCIERS"],
    ["NOTE 30", "AUTRES CHARGES ET PRODUITS HAO"],
    ["NOTE 31", "REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EXERCICES"],
    ["NOTE 32", "PRODUCTION DE L'EXERCICE"],
    ["NOTE 33", "ACHATS DESTINES A LA PRODUCTION"],
    ["NOTE 34", "FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS"],
    ["NOTE 35", "LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIETALES A FOURNIR"],
    ["CF1", "TABLEAU DE PASSAGE DU RESULTAT COMPTABLE AVANT IMPOT AU RESULTAT FISCAL"],
    ["CF1 Bis", "TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT: MINIMUM DE PERCEPTION"],
    ["CF1 Ter", "MINIMUM DE PERCEPTION"],
    ["CF1 Quater", "RECAPITULATIF DES VERSEMENTS D'ACOMPTES ET DE RETENUES SUBIES D'IMPOT SOCIETE DE L'EXERCICE"],
    ["CF2", "CALCUL DE REGULARISATION ANNUELLE DE LA TVA"],
    ["CF2 Bis", "RECAPITULATIF DES VERSEMENTS EFFECTUES ET RETENUS SUBIES"],
    ["CF2 Ter", "SITUATION NETTE DE TVA"],
  ];

  const initialNotes: NoteStatus[] = NOTE_REFERENCE.map(([note, title]) => ({
    note,
    title,
    eco: false,
    soc: false,
    fisc: false,
    cial: false,
  }));

  const [notes, setNotes] = useState<NoteStatus[]>(initialNotes);

  // Handler pour cocher/décocher
  const toggleStatus = (
    noteIndex: number,
    field: keyof Omit<NoteStatus, "note" | "title">
  ) => {
    setNotes((prev) =>
      prev.map((n, i) => (i === noteIndex ? { ...n, [field]: !n[field] } : n))
    );
  };

  const [isRegeneratingDSF, setIsRegeneratingDSF] = useState(false);

  // Régénère la DSF côté backend (relance dsf-generator.service.ts avec le
  // mapping comptable / les formules actuelles), puis recharge cette note
  // pour refléter les nouvelles valeurs.
  const regenerateDSF = async () => {
    if (!folderId) return;
    try {
      setIsRegeneratingDSF(true);
      await dsfService.generateDSF(folderId);
      await loadDSFData();
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
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("grille_analyse_notes.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-full max-w-[210mm] mx-auto mb-8 flex justify-between items-center bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-7 h-7 text-orange-600" />
          Grille d'Analyse des Notes
        </h1>
        <div className="flex gap-4">
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
            onClick={regenerateDSF}
            disabled={isRegeneratingDSF}
            title="Recalculer la DSF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isRegeneratingDSF ? "animate-spin" : ""} />
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium transform hover:scale-105"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-full max-w-[210mm] mx-auto bg-white shadow-2xl p-8 border border-gray-300"
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            4
          </span>
        </div>

        {/* En-tête */}
        <div className="mb-6 pb-4 border-b-2 border-gray-300">
          {/* Première ligne d'en-tête */}
          <div className="grid grid-cols-2 gap-8 mb-4">
            {/* Colonne gauche: Désignation entité */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-700 mb-1">
                Désignation de l'entité :
              </label>
              {isEditing ? (
                <input
                  value={headerInfo.entityName}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                  }
                  className="border-b-2 border-orange-500 bg-orange-50 px-2 py-1 text-sm font-medium"
                />
              ) : (
                <span className="border-b-2 border-dotted border-gray-400 px-2 py-1 text-sm font-medium min-h-[24px]">
                  {headerInfo.entityName || "________________"}
                </span>
              )}
            </div>

            {/* Colonne droite: Exercice clos */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-700 mb-1">
                Exercice clos le 31-12- :
              </label>
              {isEditing ? (
                <input
                  value={headerInfo.fiscalYear}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                  }
                  className="border-b-2 border-orange-500 bg-orange-50 px-2 py-1 text-sm font-medium w-full"
                />
              ) : (
                <span className="border-b-2 border-dotted border-gray-400 px-2 py-1 text-sm font-medium min-h-[24px]">
                  {headerInfo.fiscalYear || "________"}
                </span>
              )}
            </div>
          </div>

          {/* Deuxième ligne d'en-tête */}
          <div className="grid grid-cols-2 gap-8">
            {/* Colonne gauche: Numéro d'identification */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-700 mb-1">
                Numéro d'identification :
              </label>
              {isEditing ? (
                <input
                  value={headerInfo.idNumber}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                  }
                  className="border-b-2 border-orange-500 bg-orange-50 px-2 py-1 text-sm font-medium"
                />
              ) : (
                <span className="border-b-2 border-dotted border-gray-400 px-2 py-1 text-sm font-medium min-h-[24px]">
                  {headerInfo.idNumber || "________________"}
                </span>
              )}
            </div>

            {/* Colonne droite: Durée */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-700 mb-1">
                Durée (en mois) :
              </label>
              {isEditing ? (
                <input
                  value={headerInfo.duration}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, duration: e.target.value })
                  }
                  className="border-b-2 border-orange-500 bg-orange-50 px-2 py-1 text-sm font-medium w-full"
                />
              ) : (
                <span className="border-b-2 border-dotted border-gray-400 px-2 py-1 text-sm font-medium min-h-[24px]">
                  {headerInfo.duration || "____"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Titre Principal */}
        <div className="bg-gray-400 border-2 border-gray-500 py-3 px-4 text-center font-bold mb-6 text-lg">
          GRILLE D'ANALYSE DES NOTES
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse border-2 border-gray-500 text-[11px]">
          <thead>
            <tr className="bg-gray-350">
              <th rowSpan={2} className="border-2 border-gray-500 p-3 text-left font-bold">
                NOTES/ ANNEXES
              </th>
              <th rowSpan={2} className="border-2 border-gray-500 p-3 text-left font-bold">
                INTITULE
              </th>
              <th
                colSpan={4}
                className="border-2 border-gray-500 p-3 text-center font-bold bg-gray-300"
              >
                STATISTIQUES DSF
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border-2 border-gray-500 p-3 text-center font-bold text-xs">
                Eco
              </th>
              <th className="border-2 border-gray-500 p-3 text-center font-bold text-xs">
                Soc
              </th>
              <th className="border-2 border-gray-500 p-3 text-center font-bold text-xs">
                Fisc
              </th>
              <th className="border-2 border-gray-500 p-3 text-center font-bold text-xs">
                Cial
              </th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note, index) => (
              <tr key={note.note} className="hover:bg-gray-50">
                <td className="border-2 border-gray-500 p-2 font-bold text-center align-middle w-20">
                  {note.note}
                </td>
                <td className="border-2 border-gray-500 p-2 text-left align-middle">
                  <span className="text-xs leading-tight">{note.title}</span>
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "eco")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.eco ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.eco ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "soc")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.soc ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.soc ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "fisc")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.fisc ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.fisc ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "cial")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.cial ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.cial ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Légende */}
        <div className="mt-6 pt-4 border-t border-gray-300 text-[10px] text-gray-700 leading-relaxed">
          <p className="font-bold mb-2">Légende :</p>
          <p>
            <strong>Eco</strong> : Statistiques économiques - <strong>Soc</strong> : Statistiques sociales - <strong>Fisc</strong> : Statistiques fiscales - <strong>Cial</strong> : Statistiques commerciales
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrilleAnalyseNotes;



