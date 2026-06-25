import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface Note2Data {
  entete: {
    entityName: string;
    fiscalYear: string;
    idNumber: string;
    duration: string;
  };
  conformity: string;
  methods: string;
  derogations: string;
  complementary: string;
}

// --- Composant Principal ---

const Note2: React.FC = () => {
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder, selectedClient } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État de l'en-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  // État du contenu des 4 sections
  const [reportData, setReportData] = useState<Note2Data>({
    entete: {
      entityName: "",
      fiscalYear: "",
      idNumber: "",
      duration: "",
    },
    conformity: "",
    methods: "",
    derogations: "",
    complementary: "",
  });

  // 🔥 Load data from backend
  const loadNoteData = async () => {
    if (!folderId) {
      console.warn("No folderId provided");
      return;
    }

    console.log("🔍 Loading Note 2 data for folderId:", folderId);

    try {
      setIsLoading(true);
      const noteData = (await notesService.getNoteData(folderId, "2")) as any;

      console.log("📥 Loaded Note 2 data:", noteData);

      if (!noteData) {
        console.log("No saved data found for Note 2");
        return;
      }

      // Apply data to state
      if (noteData.entete) {
        setHeaderInfo({
          entityName: noteData.entete.entityName || "",
          fiscalYear: noteData.entete.fiscalYear || "",
          idNumber: noteData.entete.idNumber || "",
          duration: noteData.entete.duration || "",
        });
      }

      setReportData({
        entete: noteData.entete || headerInfo,
        conformity: noteData.conformity || "",
        methods: noteData.methods || "",
        derogations: noteData.derogations || "",
        complementary: noteData.complementary || "",
      });

      console.log("✅ Note 2 data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading Note 2 data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Save data to backend
  const saveNoteData = async () => {
    if (!folderId) {
      alert("Veuillez sélectionner un dossier");
      return;
    }

    console.log("💾 Saving Note 2 data for folderId:", folderId);

    try {
      setIsSaving(true);

      // Prepare data in the format expected by backend
      const noteData = {
        entete: headerInfo,
        conformity: reportData.conformity,
        methods: reportData.methods,
        derogations: reportData.derogations,
        complementary: reportData.complementary,
      };

      console.log("📤 Sending Note 2 data:", noteData);

      const saved = await notesService.saveNoteData(folderId, "2", noteData as any);

      if (saved) {
        alert("✅ Données sauvegardées avec succès!");
        setIsEditing(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving Note 2:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Load data when folder changes
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  // Auto-populate header from context when available
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

  // --- Fonctions ---

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false); // Mode lecture pour le PDF

      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("note_2_informations_obligatoires.pdf");

        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // Helper pour rendre une section (Titre gris foncé + Zone de texte)
  const renderSection = (
    title: string,
    field: keyof Omit<Note2Data, "entete">,
    heightClass: string,
  ) => (
    <div className="mb-0">
      {/* Titre de Section (Gris foncé) */}
      <div className="bg-gray-500 text-black font-bold text-center border border-gray-400 py-1 uppercase text-xs">
        {title}
      </div>

      {/* Zone de contenu */}
      <div
        className={`border border-gray-400 border-t-0 p-2 bg-white ${heightClass}`}
      >
        {isEditing ? (
          <textarea
            className="w-full h-full p-2 bg-orange-50 focus:outline-none resize-none text-sm font-sans"
            value={reportData[field]}
            onChange={(e) =>
              setReportData({ ...reportData, [field]: e.target.value })
            }
            placeholder="Saisir le texte ici..."
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm h-full font-sans">
            {reportData[field] || ""}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
            Veuillez sélectionner un dossier pour voir la Note 2.
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
      {/* Barre d'outils */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Note 2 - Informations Obligatoires
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
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
                    <Save size={18} /> Sauvegarde...
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
                  loadNoteData(); // Reload original data
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 border-2 ${
          isEditing ? "border-orange-500" : "border-gray-200"
        }`}
      >
        {isEditing && (
          <div className="mb-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        {/* En-tête (Numéro de page 9 centré en haut) */}
        <div className="text-center font-bold text-lg mb-2">9</div>

        {/* Informations Entité */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
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
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.entityName}
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
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {headerInfo.fiscalYear}
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
                className="border-b border-orange-500 bg-orange-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.idNumber}
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
                className="border-b border-orange-500 bg-orange-50 w-16 focus:outline-none px-1 text-center"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center px-1">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        {/* Titre Principal (Fond gris clair) */}
        <div className="bg-gray-300 border border-gray-400 py-2 text-center font-bold mb-0 text-sm">
          NOTE 2 <br /> INFORMATIONS OBLIGATOIRES
        </div>

        {/* --- SECTION A --- */}
        {renderSection(
          "A- DECLARATION DE CONFORMITE AU SYSCOHADA",
          "conformity",
          "min-h-[120px]",
        )}

        {/* --- SECTION B --- */}
        {renderSection(
          "B- REGLES ET METHODES COMPTABLES",
          "methods",
          "min-h-[250px]",
        )}

        {/* --- SECTION C --- */}
        {renderSection(
          "C- DEROGATION AUX POSTULATS ET CONVENTIONS COMPTABLES",
          "derogations",
          "min-h-[120px]",
        )}

        {/* --- SECTION D --- */}
        {renderSection(
          "D- INFORMATIONS COMPLEMENTAIRES RELATIVES AU BILAN, AU COMPTE DE RESULTAT ET AU TABLEAU DES FLUX DE TRESORERIE",
          "complementary",
          "min-h-[150px] flex-grow",
        )}

        {/* Bordure verte en bas (optionnel, vu sur l'image) */}
        <div className="mt-auto border-b-4 border-green-700 pt-2"></div>
      </div>
    </div>
  );
};

export default Note2;


