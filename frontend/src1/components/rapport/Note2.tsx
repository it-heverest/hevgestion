import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Interfaces ---

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface Note2Data {
  conformity: string; // A
  methods: string; // B
  derogations: string; // C
  complementary: string; // D
}

// --- Composant Principal ---

const Note2: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // État de l'en-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYear: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  // État du contenu des 4 sections
  const [reportData, setReportData] = useState<Note2Data>({
    conformity: "",
    methods: "",
    derogations: "",
    complementary: "",
  });

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
        pdf.save("rapport_note_2.pdf");

        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // Helper pour rendre une section (Titre gris foncé + Zone de texte)
  const renderSection = (
    title: string,
    field: keyof Note2Data,
    heightClass: string
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
            className="w-full h-full p-2 bg-blue-50 focus:outline-none resize-none text-sm font-sans"
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'outils */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Note 2 - Informations Obligatoires
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
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-8 border border-gray-200 flex flex-col"
      >
        {/* En-tête (Numéro de page 9 centré en haut) */}
        <div className="text-center font-bold text-lg mb-2">9</div>

        {/* Informations Entité */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1">
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
                {headerInfo.entityName}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Exercice clos le 31-12-
            </span>
            {isEditing ? (
              <input
                value={headerInfo.fiscalYear}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, fiscalYear: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
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
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
                {headerInfo.idNumber}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-end">
            <span className="font-bold whitespace-nowrap">
              Durée (en mois) :
            </span>
            {isEditing ? (
              <input
                value={headerInfo.duration}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, duration: e.target.value })
                }
                className="border-b border-blue-500 bg-blue-50 w-full focus:outline-none px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-full px-1">
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
          "min-h-[120px]"
        )}

        {/* --- SECTION B --- */}
        {renderSection(
          "B- REGLES ET METHODES COMPTABLES",
          "methods",
          "min-h-[250px]"
        )}

        {/* --- SECTION C --- */}
        {renderSection(
          "C- DEROGATION AUX POSTULATS ET CONVENTIONS COMPTABLES",
          "derogations",
          "min-h-[120px]"
        )}

        {/* --- SECTION D --- */}
        {renderSection(
          "D- INFORMATIONS COMPLEMENTAIRES RELATIVES AU BILAN, AU COMPTE DE RESULTAT ET AU TABLEAU DES FLUX DE TRESORERIE",
          "complementary",
          "min-h-[150px] flex-grow" // flex-grow pour remplir le reste de la page si nécessaire
        )}

        {/* Bordure verte en bas (optionnel, vu sur l'image) */}
        <div className="mt-auto border-b-4 border-green-700 pt-2"></div>
      </div>
    </div>
  );
};

export default Note2;
