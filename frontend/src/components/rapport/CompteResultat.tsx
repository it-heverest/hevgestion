import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

const CompteResultat: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');

  const { selectedFolder } = useApp();
  // Use folderId from URL params, fallback to selectedFolder
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");

  // Header
  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Load data
  useEffect(() => {
    if (folderId) {
      loadNoteData();
    }
  }, [folderId]);

  const loadNoteData = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteData(folderId, "compte-resultat") as any;

      if (noteData) {
        if (noteData.headerInfo) {
          setHeaderInfo(noteData.headerInfo);
        } else if (noteData.entete) {
          setHeaderInfo(noteData.entete);
        }

        if (noteData.comment !== undefined) {
          setComment(noteData.comment);
        }
      }
    } catch (error) {
      console.error("Error loading Compte Resultat data:", error);
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
        comment,
      };

      const success = await notesService.saveNoteData(folderId, "compte-resultat", noteData as any);
      if (success) {
        alert("Données Compte de Résultat sauvegardées avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving Compte Resultat data:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
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
        pdf.save("compte_de_resultat.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  const rows = [
    { ref: "TA", label: "Vente de marchandises", note: "21" },
    { ref: "RB", label: "Achat de marchandises", note: "22" },
    { ref: "RB", label: "Variation de stock de marchandises", note: "6" },
    {
      ref: "",
      label: (
        <span className="font-bold bg-gray-400">
          MARGE COMMERCIALE (Somme TA à RB)
        </span>
      ),
      note: "",
    },
    { ref: "LB", label: "Vente de produits fabriqués B", note: "21" },
    { ref: "TL", label: "Travaux, services vendus C", note: "21" },
    { ref: "TD", label: "Produits accessoires D", note: "21" },
    {
      ref: "",
      label: (
        <span className="font-bold bg-gray-400">
          CHIFFRE D'AFFAIRES (A+B+C+D)
        </span>
      ),
      note: "6",
    },
    { ref: "TE", label: "Production stockée (ou déstockage)", note: "21" },
    { ref: "TF", label: "Production immobilisée", note: "21" },
    { ref: "TH", label: "Subventions d'exploitation", note: "21" },
    { ref: "TI", label: "Transfert de charges d'exploitation", note: "12" },
    {
      ref: "RC",
      label: "Achats de matières premières et fournitures liées",
      note: "22",
    },
    {
      ref: "RD",
      label: "Variation de stocks de matières premières et fournitures liées",
      note: "6",
    },
    { ref: "RE", label: "Autres achats", note: "22" },
    {
      ref: "RF",
      label: "Variation de stock d'autres approvisionnement",
      note: "6",
    },
    { ref: "RB", label: "Transports", note: "23" },
    { ref: "RH", label: "Services extérieurs", note: "24" },
    { ref: "RI", label: "Impôts et taxes", note: "25" },
    { ref: "RJ", label: "Autres charges", note: "26" },
    {
      ref: "",
      label: (
        <span className="font-bold bg-gray-400">
          VALEUR AJOUTEE (XR + RA + RB) + (somme TE à RJ)
        </span>
      ),
      note: "",
    },
    { ref: "RK", label: "Charges de personnel", note: "27" },
    { ref: "XD", label: "EXCEDENT BRUT D'EXPLOITATION (XC+RK)", note: "28" },
    {
      ref: "TL",
      label: "Reprises d'amortissements, provisions et dépréciations",
      note: "3C&3D",
    },
    { ref: "XF", label: "RESULTAT D'EXPLOITATION (XD + TL + RIS)", note: "" },
    { ref: "TK", label: "Revenus financiers et assimilés", note: "28" },
    {
      ref: "TL",
      label: "Reprises de provisions et dépréciations financières",
      note: "28",
    },
    { ref: "TM", label: "Transfert de charges financières", note: "12" },
    { ref: "RM", label: "Frais financiers et charges assimilées", note: "28" },
    {
      ref: "RN",
      label: "Dotations aux provisions et aux dépréciations financières",
      note: "3C&3D",
    },
    { ref: "XF", label: "RESULTATS FINANCIERS (somme TK à RN)", note: "" },
    { ref: "XG", label: "RESULTAT DES ACTIVITES ORDINAIRES", note: "" },
    { ref: "TN", label: "Produits et cessions d'immobilisations", note: "3D" },
    { ref: "TO", label: "Autres Produits HAO", note: "30" },
    {
      ref: "RU",
      label: "Valeurs comptables de cessions d'immobilisations",
      note: "3D",
    },
    { ref: "RP", label: "Autres charges HAO", note: "30" },
    {
      ref: "RH",
      label: "RESULTATS ACTIVITES ORDINAIRES (somme TN à RP)",
      note: "",
    },
    { ref: "RA", label: "Participation des travailleurs", note: "30" },
    { ref: "TQ", label: "Impôt sur le résultat", note: "" },
    { ref: "XR", label: "RESULTAT NET (XG+XH+RQ+RS)", note: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Compte de Résultat
        </h1>
        <div className="flex gap-3">
          <button
            onClick={isEditing ? saveNoteData : () => setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : isEditing ? (
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
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <div className="text-center font-bold mb-2 text-lg">6</div>

        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b-2 border-transparent pb-2">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
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
                className="border-b border-blue-500 bg-blue-50 w-16 px-1"
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
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

        {isEditing && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Pencil size={16} />
              <span className="font-medium">Mode édition activé</span>
            </div>
          </div>
        )}

        <div className="bg-gray-400 py-1 text-center font-bold mb-4">
          COMPTE DE RESULTAT
          <br />
          COMPTE RESULTAT AU 31 DECEMBRE
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                REF
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 pl-2 w-[50%]"
              >
                LIBELLES
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 p-1 text-center"
              >
                NOTE
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE AU
                <br />
                31/12/N
              </th>
              <th
                colSpan={1}
                className="border border-gray-400 p-1 text-center"
              >
                EXERCICE AU
                <br />
                31/12/N-1
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-1">NET</th>
              <th className="border border-gray-400 p-1">NET</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={
                  row.label.toString().includes("MARGE") ||
                  row.label.toString().includes("CHIFFRE") ||
                  row.label.toString().includes("VALEUR") ||
                  row.label.toString().includes("RESULTAT") ||
                  row.label.toString().includes("TOTAL")
                    ? "bg-gray-400 font-bold"
                    : ""
                }
              >
                <td className="border border-gray-400 p-1 text-center font-bold">
                  {row.ref}
                </td>
                <td className="border border-gray-400 p-1 pl-2">{row.label}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {row.note}
                </td>
                <td className="border border-gray-400 p-1 text-right"></td>
                <td className="border border-gray-400 p-1 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Commentaire */}
        <div className="mt-6">
          <div className="font-bold mb-2">Commentaire :</div>
          <div className="italic text-[10px] mb-2">
            Commenter les variations significatives du compte de résultat
          </div>
          {isEditing ? (
            <textarea
              className="w-full h-24 p-2 border border-blue-300 bg-blue-50 resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter vos commentaires ici..."
            />
          ) : (
            <div className="min-h-[6rem] border border-gray-400 p-2 whitespace-pre-wrap">
              {comment || "Aucun commentaire"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompteResultat;

