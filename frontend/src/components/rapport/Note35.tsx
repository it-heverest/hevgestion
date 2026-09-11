import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface Bullet {
  id: string;
  prompt: string;
  reponse: string;
}

interface Subsection {
  subtitle: string;
  bullets: Bullet[];
}

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

type SectionKey =
  | "informationsSociales"
  | "informationsEnvironnementales"
  | "informationsSocietales";

// Couleurs de fond exactes du vrai template (dsf_complet.xlsx, feuille
// "NOTE 35").
const GRAY_TITLE = "#D9D9D9";
const GRAY_BAR = "#BFBFBF";

const Note35: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  const [informationsSociales, setInformationsSociales] = useState<Subsection[]>([
    {
      subtitle: "Emploi :",
      bullets: [
        { id: "soc-1", prompt: "L'effectif total et la répartition des salariés par sexe, âge et zone géographique :", reponse: "" },
        { id: "soc-2", prompt: "Les embauches et les licenciements ;", reponse: "" },
        { id: "soc-3", prompt: "Les rémunérations et leur évolution.", reponse: "" },
      ],
    },
    {
      subtitle: "Relations sociales :",
      bullets: [
        { id: "soc-4", prompt: "L'organisation du dialogue social", reponse: "" },
        { id: "soc-5", prompt: "Le bilan des accords collectifs", reponse: "" },
      ],
    },
    {
      subtitle: "Santé et sécurité :",
      bullets: [
        { id: "soc-6", prompt: "Les conditions de santé et de sécurité au travail :", reponse: "" },
        { id: "soc-7", prompt: "Le bilan des accords signés avec les organisations syndicales ou les représentants du personnel en matière de santé et de sécurité au travail", reponse: "" },
      ],
    },
    {
      subtitle: "Formation :",
      bullets: [
        { id: "soc-8", prompt: "Les politiques mises en œuvre en matière de formation ;", reponse: "" },
        { id: "soc-9", prompt: "Le nombre total de formation.", reponse: "" },
      ],
    },
    {
      subtitle: "Egalités de traitement :",
      bullets: [
        { id: "soc-10", prompt: "Les mesures prises en faveur de l'égalité entre les femmes et les hommes ;", reponse: "" },
        { id: "soc-11", prompt: "Les mesures prises en faveur de l'emploi et de l'insertion des personnes handicapées ;", reponse: "" },
      ],
    },
  ]);

  const [informationsEnvironnementales, setInformationsEnvironnementales] = useState<Subsection[]>([
    {
      subtitle: "Politique générale en matière environnementale :",
      bullets: [
        { id: "env-1", prompt: "L'organisation de la société pour prendre en compte les questions environnementales et, le cas échéant, les démarches d'évaluation ou de certification en matière d'environnement ;", reponse: "" },
        { id: "env-2", prompt: "Les actions de formation et d'information des salariés menées en matière de protection de l'environnement ;", reponse: "" },
        { id: "env-3", prompt: "Les moyens consacrés à la prévention des risques environnementaux et des pollutions.", reponse: "" },
      ],
    },
    {
      subtitle: "Pollution et gestion des déchets",
      bullets: [
        { id: "env-4", prompt: "Les mesures de prévention, de réduction ou de réparation de rejets dans l'air, l'eau et le sol affectant gravement l'environnement ;", reponse: "" },
        { id: "env-5", prompt: "Les mesures de prévention, de recyclage et d'élimination des déchets ;", reponse: "" },
        { id: "env-6", prompt: "La prise en compte des nuisances sonores et de toute autre forme de pollution spécifique à une activité", reponse: "" },
      ],
    },
    {
      subtitle: "Utilisation durable des ressources :",
      bullets: [
        { id: "env-7", prompt: "La consommation d'eau et l'approvisionnement en eau en fonction des contraintes locales ;", reponse: "" },
        { id: "env-8", prompt: "La consommation d'énergie, les mesures prises pour améliorer l'efficacité énergétique et le recours aux énergies renouvelables.", reponse: "" },
      ],
    },
    {
      subtitle: "Changement climatique :",
      bullets: [{ id: "env-9", prompt: "Les rejets de gaz à effet de serre.", reponse: "" }],
    },
    {
      subtitle: "Protection de la biodiversité :",
      bullets: [{ id: "env-10", prompt: "Les mesures prises pour préserver ou développer la biodiversité.", reponse: "" }],
    },
  ]);

  const [informationsSocietales, setInformationsSocietales] = useState<Subsection[]>([
    {
      subtitle: "Impact territorial, économique et social de l'activité de la société :",
      bullets: [
        { id: "soct-1", prompt: "En matière d'emploi et de développement régional ;", reponse: "" },
        { id: "soct-2", prompt: "Sur les populations riveraines ou locales.", reponse: "" },
      ],
    },
    {
      subtitle: "Relations entretenues avec les personnes ou les organisations intéressées par l'activité de la société (association d'insertion, établissement d'enseignement …) :",
      bullets: [
        { id: "soct-3", prompt: "Les conditions du dialogue avec ces personnes ou organisations ;", reponse: "" },
        { id: "soct-4", prompt: "Les actions de partenariat ou de mécénat.", reponse: "" },
      ],
    },
    {
      subtitle: "Sous-traitance et fournisseurs :",
      bullets: [{ id: "soct-5", prompt: "La prise en compte dans la politique d'achat des enjeux sociaux et environnementaux.", reponse: "" }],
    },
  ]);

  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;
    try {
      const noteData = (await notesService.getNoteData(folderId, "35")) as any;
      if (noteData) {
        if (noteData.headerInfo) setHeaderInfo(noteData.headerInfo);
        else if (noteData.entete) setHeaderInfo(noteData.entete);

        if (noteData.informationsSociales) setInformationsSociales(noteData.informationsSociales);
        if (noteData.informationsEnvironnementales) setInformationsEnvironnementales(noteData.informationsEnvironnementales);
        if (noteData.informationsSocietales) setInformationsSocietales(noteData.informationsSocietales);
      }
    } catch (error) {
      console.error("Error loading Note 35 data:", error);
    }
  };

  const saveNoteData = async () => {
    if (!folderId) return;
    try {
      setIsSaving(true);
      const noteData = {
        entete: headerInfo,
        informationsSociales,
        informationsEnvironnementales,
        informationsSocietales,
      };
      const success = await notesService.saveNoteData(folderId, "35", noteData as any);
      if (success) {
        setIsEditing(false);
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving Note 35 data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResponseChange = (
    setSection: React.Dispatch<React.SetStateAction<Subsection[]>>,
    bulletId: string,
    value: string
  ) => {
    setSection((prev) =>
      prev.map((sub) => ({
        ...sub,
        bullets: sub.bullets.map((b) => (b.id === bulletId ? { ...b, reponse: value } : b)),
      }))
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
          pdf.save("note_35_informations_sociales_environnementales.pdf");
        } finally {
          setIsEditing(wasEditing);
        }
      }, 100);
    }
  };

  const renderSection = (
    sectionTitle: string,
    subsections: Subsection[],
    setSection: React.Dispatch<React.SetStateAction<Subsection[]>>
  ) => (
    <div className="mb-2">
      <div
        className="py-1.5 text-center font-bold border border-gray-400"
        style={{ backgroundColor: GRAY_TITLE }}
      >
        {sectionTitle}
      </div>
      {subsections.map((sub) => (
        <div key={sub.subtitle} className="border-x border-b border-gray-400">
          <div className="px-2 py-1 font-bold">{sub.subtitle}</div>
          {sub.bullets.map((bullet) => (
            <div key={bullet.id} className="px-4 pb-1.5">
              <div>- {bullet.prompt}</div>
              {isEditing ? (
                <textarea
                  value={bullet.reponse}
                  onChange={(e) => handleResponseChange(setSection, bullet.id, e.target.value)}
                  placeholder="Réponse du comptable..."
                  className="w-full mt-1 border border-orange-300 bg-orange-50 p-1 text-[11px] resize-y"
                  rows={2}
                />
              ) : bullet.reponse ? (
                <div className="mt-1 pl-2 border-l-2 border-gray-300 text-gray-700 whitespace-pre-wrap">
                  {bullet.reponse}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Note 35 - Informations sociales, environnementales et sociétales
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          >
            <Download size={18} /> PDF
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
            57
          </span>
        </div>

        {/* Standard header */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) => setHeaderInfo({ ...headerInfo, entityName: e.target.value })}
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
                onChange={(e) => setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-32 text-center px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-32 text-center">
                {headerInfo.fiscalYear}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Numéro d'identification :</span>
            {isEditing ? (
              <input
                value={headerInfo.idNumber}
                onChange={(e) => setHeaderInfo({ ...headerInfo, idNumber: e.target.value })}
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
                onChange={(e) => setHeaderInfo({ ...headerInfo, duration: e.target.value })}
                className="border-b border-orange-500 bg-orange-50 w-16 text-center px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="py-2 text-center font-bold mb-1" style={{ backgroundColor: GRAY_TITLE }}>
          NOTE 35 :
          <br />
          LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIALES A FOURNIR
        </div>

        <div className="py-1 text-center italic font-bold mb-1">
          Note obligatoire pour les entités ayant un effectif de plus de 250 salariés
        </div>

        <div className="py-1.5 text-center font-bold mb-3" style={{ backgroundColor: GRAY_BAR }}>
          Liste des informations sociales, environnementales et sociales à fournir
        </div>

        {renderSection("INFORMATIONS SOCIALES", informationsSociales, setInformationsSociales)}
        {renderSection(
          "INFORMATIONS ENVIRONNEMENTALES",
          informationsEnvironnementales,
          setInformationsEnvironnementales
        )}
        {renderSection(
          "INFORMATIONS RELATIVES AUX ENGAGEMENTS SOCIETAUX EN FAVEUR DU DEVELOPPEMENT DURABLE",
          informationsSocietales,
          setInformationsSocietales
        )}
      </div>
    </div>
  );
};

export default Note35;
