import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces ---
interface DocumentsDeposes {
  ficheIdentification: boolean;
  bilan: boolean;
  compteResultat: boolean;
  tableauFlux: boolean;
  notesAnnexes: boolean;
}

interface PageDeGardeData {
  centreDepot: string;
  exerciceClosLe: string;
  denominationSociale: string;
  sigleUsuel: string;
  adresseComplete: string;
  numeroIdentificationFiscale: string;
  documentsDeposes: DocumentsDeposes;
  nombrePagesParExemplaire: string;
  nombreExemplairesDeposes: string;
  dateDepot: string;
  nomAgentDGI: string;
}

const EMPTY_DATA: PageDeGardeData = {
  centreDepot: "",
  exerciceClosLe: "",
  denominationSociale: "",
  sigleUsuel: "",
  adresseComplete: "",
  numeroIdentificationFiscale: "",
  documentsDeposes: {
    ficheIdentification: false,
    bilan: false,
    compteResultat: false,
    tableauFlux: false,
    notesAnnexes: false,
  },
  nombrePagesParExemplaire: "",
  nombreExemplairesDeposes: "",
  dateDepot: "",
  nomAgentDGI: "",
};

const DOCUMENT_LABELS: { key: keyof DocumentsDeposes; label: string }[] = [
  { key: "ficheIdentification", label: "Fiche d'identification et renseignement divers" },
  { key: "bilan", label: "Bilan" },
  { key: "compteResultat", label: "Compte de résultat" },
  { key: "tableauFlux", label: "Tableau des flux trésorerie" },
  { key: "notesAnnexes", label: "Notes annexes" },
];

// --- Composant Principal ---
const PageDeGarde: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder, selectedClient } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PageDeGardeData>(EMPTY_DATA);

  useEffect(() => {
    if (folderId) loadDSFData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  // Pré-remplit depuis le contexte si le formulaire n'a jamais été édité.
  useEffect(() => {
    if (selectedClient && !data.denominationSociale) {
      setData((prev) => ({
        ...prev,
        denominationSociale: selectedClient.name || "",
        numeroIdentificationFiscale: selectedClient.taxNumber || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  const loadDSFData = async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      const loaded = (await notesService.getNoteData(folderId, "page-de-garde")) as any;
      if (loaded) {
        setData({
          ...EMPTY_DATA,
          ...loaded,
          documentsDeposes: { ...EMPTY_DATA.documentsDeposes, ...loaded.documentsDeposes },
        });
      }
    } catch (error) {
      console.error("Error loading Page de Garde data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!folderId) return;
    try {
      setSaving(true);
      const success = await notesService.saveNoteData(folderId, "page-de-garde", data as any);
      if (!success) alert("Erreur lors de la sauvegarde");
    } catch (error) {
      console.error("Error saving Page de Garde data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof PageDeGardeData>(field: K, value: PageDeGardeData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDocument = (key: keyof DocumentsDeposes) => {
    setData((prev) => ({
      ...prev,
      documentsDeposes: { ...prev.documentsDeposes, [key]: !prev.documentsDeposes[key] },
    }));
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
        pdf.save("page_de_garde.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const renderLine = (
    label: string,
    field: keyof PageDeGardeData,
    note?: string,
  ) => (
    <div className="mb-4">
      <span className="font-bold">{label} :</span>
      {note && (
        <>
          <br />
          <span className="italic text-[10px]">{note}</span>
        </>
      )}
      {isEditing ? (
        <input
          value={data[field] as string}
          onChange={(e) => setField(field, e.target.value as any)}
          className="border-b border-orange-500 bg-orange-50 w-full h-8 mt-2 px-1 focus:outline-none"
        />
      ) : (
        <div className="border-b border-dotted border-black w-full h-8 mt-2 flex items-end">
          {data[field] as string}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Page de Garde
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
        <style>{`
          .gray-header { background-color: #d3d3d3; }
          .dark-gray-header { background-color: #a9a9a9; }
          .border-thick { border: 2px solid black; }
        `}</style>

        <div className="text-center font-bold text-lg mb-8 gray-header py-2 border-thick">
          PAGE DE GARDE
        </div>

        <table className="w-full border-collapse border border-black mb-8">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold text-center">
                REPUBLIQUE DU CAMEROUN
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">
                MINISTERE DES FINANCES
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">
                DIRECTION GENERALE DES IMPÔTS
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">
                <span className="font-bold">CENTRE DE DEPOT DE :</span>{" "}
                {isEditing ? (
                  <input
                    value={data.centreDepot}
                    onChange={(e) => setField("centreDepot", e.target.value)}
                    className="border-b border-orange-500 bg-orange-50 w-64 px-1 focus:outline-none"
                  />
                ) : (
                  <span className="border-b border-dotted border-black w-64 inline-block">
                    {data.centreDepot}
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center font-bold text-lg mb-8">
          ETATS FINANCIERS NORMALISES
          <br />
          SYSTEME COMPTABLE SYSCOHADA
        </div>

        <div className="mb-8">
          <span className="font-bold">EXERCICE CLOS LE :</span>
          {isEditing ? (
            <input
              value={data.exerciceClosLe}
              onChange={(e) => setField("exerciceClosLe", e.target.value)}
              className="border-b border-orange-500 bg-orange-50 ml-4 w-64 px-1 focus:outline-none"
            />
          ) : (
            <span className="border-b border-dotted border-black ml-4 w-64 inline-block">
              {data.exerciceClosLe}
            </span>
          )}
        </div>

        <div className="text-center font-bold text-lg mb-8">
          DESIGNATION DE L'ENTITE
        </div>

        {renderLine(
          "DENOMINATION SOCIALE",
          "denominationSociale",
          "(ou nom et prénoms de l'exploitant)",
        )}
        {renderLine("SIGLE USUEL", "sigleUsuel")}
        {renderLine("ADRESSE COMPLETE", "adresseComplete")}
        {renderLine("N° D'IDENTIFICATION FISCALE", "numeroIdentificationFiscale")}

        <div className="text-center font-bold mb-4 dark-gray-header py-2">
          SYSTEME NORMAL
        </div>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold" rowSpan={3}>
                documents déposés
              </td>
              <td className="border border-black p-2 text-center">
                Réservé à la Direction Générale des Impôts
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                {DOCUMENT_LABELS.map(({ key, label }) => (
                  <div key={key} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={data.documentsDeposes[key]}
                      disabled={!isEditing}
                      onChange={() => toggleDocument(key)}
                      className="w-5 h-5 mr-2 border-2 border-black"
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                <div className="mb-8">
                  <span>Date de dépôt</span>
                  {isEditing ? (
                    <input
                      value={data.dateDepot}
                      onChange={(e) => setField("dateDepot", e.target.value)}
                      className="border-b border-orange-500 bg-orange-50 w-full h-8 mt-2 px-1 focus:outline-none"
                    />
                  ) : (
                    <div className="border-b border-dotted border-black w-full h-8 mt-2">
                      {data.dateDepot}
                    </div>
                  )}
                </div>
                <div className="mb-8">
                  <span>Nom de l'agent de la DGI ayant réceptionné le dépôt</span>
                  {isEditing ? (
                    <input
                      value={data.nomAgentDGI}
                      onChange={(e) => setField("nomAgentDGI", e.target.value)}
                      className="border-b border-orange-500 bg-orange-50 w-full h-8 mt-2 px-1 focus:outline-none"
                    />
                  ) : (
                    <div className="border-b border-dotted border-black w-full h-8 mt-2">
                      {data.nomAgentDGI}
                    </div>
                  )}
                </div>
                <div>
                  <span>Signature de l'agent et cachet du service</span>
                  <div className="h-20 mt-2"></div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2" colSpan={2}>
                <span>Nombre de pages déposées par exemplaire : </span>
                {isEditing ? (
                  <input
                    value={data.nombrePagesParExemplaire}
                    onChange={(e) => setField("nombrePagesParExemplaire", e.target.value)}
                    className="border-b border-orange-500 bg-orange-50 w-32 px-1 ml-2 focus:outline-none"
                  />
                ) : (
                  <span className="border-b border-dotted border-black w-32 inline-block ml-2">
                    {data.nombrePagesParExemplaire}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2" colSpan={2}>
                <span>Nombre d'exemplaires déposés : </span>
                {isEditing ? (
                  <input
                    value={data.nombreExemplairesDeposes}
                    onChange={(e) => setField("nombreExemplairesDeposes", e.target.value)}
                    className="border-b border-orange-500 bg-orange-50 w-32 px-1 ml-2 focus:outline-none"
                  />
                ) : (
                  <span className="border-b border-dotted border-black w-32 inline-block ml-2">
                    {data.nombreExemplairesDeposes}
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PageDeGarde;
