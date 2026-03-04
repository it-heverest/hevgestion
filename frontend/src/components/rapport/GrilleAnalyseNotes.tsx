import React, { useState, useRef, useEffect } from "react";
import { Pencil, Save, Download, FileText, Check, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { dsfService } from "../../services/dsf.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface NoteStatus {
  note: string;
  title: string;
  ecoSocFisc: boolean;
  ecoSocFiscObli: boolean;
  ecoSocFiscStat: boolean;
  ecoSocFiscCial: boolean;
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
  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [dsfId, setDsfId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load DSF data
  useEffect(() => {
    if (selectedFolder?.id) {
      loadDSFData();
    }
  }, [selectedFolder?.id]);

  const loadDSFData = async () => {
    if (!selectedFolder?.id) return;

    try {
      setLoading(true);
      const response = await dsfService.getDSF(selectedFolder.id);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      if (dsf.grille && dsf.grille.notes) {
        setNotes(dsf.grille.notes);
      }

      if (dsf.grille && dsf.grille.headerInfo) {
        setHeaderInfo(dsf.grille.headerInfo);
      }
    } catch (error) {
      console.error("Error loading DSF data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!dsfId) return;

    try {
      setSaving(true);

      const grilleData = {
        headerInfo,
        notes,
      };

      await dsfService.updateDSF(dsfId, { grille: grilleData });
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

  // Liste des notes exactement comme dans l'image
  const initialNotes: NoteStatus[] = [
    {
      note: "NOTE1",
      title: "DETTES GARANTIES PAR DES SURETES REELLES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE2",
      title: "IMMOBILISATIONS INCORPORELLES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE3",
      title: "IMMOBILISATIONS CORPORELLES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE3B",
      title: "BIENS PRISE EN LOCATION-ACQUISITION",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE3C",
      title: "IMMOBILISATIONS ACQUISES EN LEASING",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE3D",
      title: "IMMOBILISATIONS FINANCIERES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE3E",
      title: "AMORTISSEMENTS DEROGATOIRES ET PROVISIONS REGLEMENTEES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE3F",
      title: "DEPRECIATION DES IMMOBILISATIONS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE4",
      title: "IMMOBILISATIONS FINANCIERES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE5",
      title: "ACTIF CIRCULANT HAO",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE6",
      title: "CLIENTS ET COMPTES RATTACHES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE7",
      title: "CLIENTS DOUTEUX",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE8",
      title: "AUTRES CREANCES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE9",
      title: "TITRES DE PLACEMENT",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE10",
      title: "VALEURS A ENCAISSER",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE11",
      title: "DISPONIBILITES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE12",
      title: "CAPITAL SOUSCRIT - APPELE NON VERSE",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE13",
      title: "CAPITAL SOUSCRIT - APPELE NON VERSE",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE14",
      title: "PRIMES ET RESERVES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE15",
      title: "SUBVENTIONS D'INVESTISSEMENT",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE16",
      title: "PROVISIONS REGLEMENTEES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE16A",
      title: "DETTES FINANCIERES ET RESSOURCES ASSIMILEES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE16B",
      title:
        "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES (METHODE ACTUARIELLE)",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE16C",
      title: "ACTIFS ET PASSIFS EVENTUELS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE17",
      title: "FOURNISSEURS D'EXPLOITATION",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE18",
      title: "DETTES FISCALES ET SOCIALES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE19",
      title: "AUTRES DETTES ET PROVISIONS POUR RISQUES A COURT TERME",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE20",
      title: "BANQUES, CREDIT D'ESCOMPTE ET DE TRESORERIE",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE21",
      title: "CHIFFRE D'AFFAIRES ET AUTRES PRODUITS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE22",
      title: "ACHATS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE23",
      title: "TRANSPORTS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE24",
      title: "SERVICES EXTERIEURS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE25",
      title: "IMPOTS ET TAXES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE26",
      title: "AUTRES CHARGES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE27A",
      title: "CHARGES DE PERSONNEL",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE27B",
      title: "EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE28",
      title: "PROVISIONS ET DEPRECIATIONS INSCRITES AU BILAN",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE29",
      title: "CHARGES ET REVENUS FINANCIERS",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE30",
      title: "AUTRES CHARGES ET PRODUITS HAO",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE31",
      title:
        "REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EXERCICES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE32",
      title: "PRODUCTION DE L'EXERCICE",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "NOTE33",
      title: "ACHATS DESTINES A LA PRODUCTION",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF1",
      title:
        "TABLEAU DE PASSAGE DU RESULTAT COMPTABLE AVANT IMPOT AU RESULTAT FISCAL",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF1BIS",
      title:
        "TABLEAU DE DETERMINATION DE L'IMPOT SUR RESULTAT : IMPOT SUR LE BENEFICE FISCAL",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF1TER",
      title:
        "TABLEAU DE DETERMINATION DE L'IMPOT SUR RESULTAT MINIMUM DE PERCEPTION",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF1QUATER",
      title:
        "ETAT DES VERSEMENTS EFFECTUES AU TITRE DE L'IMPOT SUR RESULTAT : IMPOT SUR LES BENEFICES ET D'ACOMPTES",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF1QUINQUIES",
      title:
        "ETAT DES VERSEMENTS EFFECTUES AU TITRE DE L'IMPOT SUR RESULTAT : MINIMUM DE PERCEPTION",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF2",
      title: "CALCUL DE LA VALEUR AJOUTEE",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF3",
      title: "DETERMINATION DU BENEFICE FISCAL (SYNTHESE)",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF3BIS",
      title: "CALCUL DE LA TAXE SUR LES VEHICULES DE SOCIETE",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
    {
      note: "CF4TER",
      title: "SITUATION NETTE DE TVA",
      ecoSocFisc: false,
      ecoSocFiscObli: false,
      ecoSocFiscStat: false,
      ecoSocFiscCial: false,
    },
  ];

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
          <FileText className="w-7 h-7 text-blue-600" />
          Grille d'Analyse des Notes
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (isEditing) saveToBackend();
              setIsEditing(!isEditing);
            }}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium transition transform hover:scale-105 ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? (
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
        className="w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border border-gray-300"
      >
        {/* Numéro de page */}
        <div className="text-right font-bold mb-6 text-base text-gray-600">Page 4</div>

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
                  className="border-b-2 border-blue-500 bg-blue-50 px-2 py-1 text-sm font-medium"
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
                  className="border-b-2 border-blue-500 bg-blue-50 px-2 py-1 text-sm font-medium w-full"
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
                  className="border-b-2 border-blue-500 bg-blue-50 px-2 py-1 text-sm font-medium"
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
                  className="border-b-2 border-blue-500 bg-blue-50 px-2 py-1 text-sm font-medium w-full"
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
                Eco Soc Fisc
              </th>
              <th className="border-2 border-gray-500 p-3 text-center font-bold text-xs">
                Obl
              </th>
              <th className="border-2 border-gray-500 p-3 text-center font-bold text-xs">
                Stat
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
                      onClick={() => toggleStatus(index, "ecoSocFisc")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.ecoSocFisc ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.ecoSocFisc ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "ecoSocFiscObli")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.ecoSocFiscObli ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.ecoSocFiscObli ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "ecoSocFiscStat")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.ecoSocFiscStat ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.ecoSocFiscStat ? (
                    <Check className="text-green-600 mx-auto font-bold" size={18} />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="border-2 border-gray-500 p-3 text-center align-middle">
                  {isEditing ? (
                    <button
                      onClick={() => toggleStatus(index, "ecoSocFiscCial")}
                      className="w-6 h-6 flex justify-center items-center mx-auto rounded hover:bg-gray-100"
                    >
                      {note.ecoSocFiscCial ? (
                        <Check className="text-green-600 font-bold" size={18} />
                      ) : (
                        <X className="text-gray-400" size={18} />
                      )}
                    </button>
                  ) : note.ecoSocFiscCial ? (
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
            <strong>Eco</strong> = Statistiques économiques | <strong>Soc</strong> = Statistiques sociales | <strong>Fisc</strong> = Statistiques fiscales |
            <strong> Obl</strong> = Obligatoire | <strong>Stat</strong> = Statistique | <strong>Cial</strong> = Commercial
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrilleAnalyseNotes;
