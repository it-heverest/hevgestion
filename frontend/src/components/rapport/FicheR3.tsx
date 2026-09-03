import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// --- Interfaces pour la FICHE R3 (Basé sur l'image) ---

interface HeaderDataR3 {
  entityName: string;
  fiscalYearEnd: string; // Ex: 31-12-2024
  idNumber: string;
  duration: string;
}

interface DirigeantRow {
  id: number;
  nom: string;
  prenom: string;
  qualite: string;
  nIdFiscale: string;
  adresse: string; // BP, ville, pays
}

interface ConseilRow {
  id: number;
  nom: string;
  prenom: string;
  qualite: string;
  adresse: string; // BP, ville, pays
}

// --- Composant Principal (FICHE R3) ---

// Nombre de lignes de l'imprimé officiel: dirigeants en lignes 11 à 23,
// membres du conseil d'administration en lignes 33 à 43.
const DIRIGEANT_ROWS = 13;
const CONSEIL_ROWS = 11;

const emptyDirigeants = (): DirigeantRow[] =>
  Array.from({ length: DIRIGEANT_ROWS }, (_, i) => ({
    id: i + 1,
    nom: "",
    prenom: "",
    qualite: "",
    nIdFiscale: "",
    adresse: "",
  }));

const emptyConseil = (): ConseilRow[] =>
  Array.from({ length: CONSEIL_ROWS }, (_, i) => ({
    id: i + 1,
    nom: "",
    prenom: "",
    qualite: "",
    adresse: "",
  }));

const FicheR3: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder, selectedClient } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // En-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderDataR3>({
    entityName: "",
    fiscalYearEnd: "",
    idNumber: "",
    duration: "12",
  });

  const [dirigeants, setDirigeants] = useState<DirigeantRow[]>(emptyDirigeants());
  const [conseil, setConseil] = useState<ConseilRow[]>(emptyConseil());

  // 🔥 Chargement depuis le backend (colonne fiche3 du modèle DSF)
  const loadNoteData = useCallback(async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const data = (await notesService.getNoteData(folderId, "R3")) as any;
      if (!data) return;

      if (data.entete) {
        setHeaderInfo({
          entityName: data.entete.entityName || "",
          fiscalYearEnd: data.entete.fiscalYear || "",
          idNumber: data.entete.idNumber || "",
          duration: data.entete.duration || "12",
        });
      }

      // Le nombre de lignes de l'imprimé est toujours respecté, quel que soit
      // le nombre de lignes renseignées.
      if (Array.isArray(data.dirigeants)) {
        const rows = emptyDirigeants();
        data.dirigeants.slice(0, DIRIGEANT_ROWS).forEach((r: any, i: number) => {
          rows[i] = {
            id: i + 1,
            nom: r.nom ?? "",
            prenom: r.prenom ?? "",
            qualite: r.qualite ?? "",
            nIdFiscale: r.nIdFiscale ?? "",
            adresse: r.adresse ?? "",
          };
        });
        setDirigeants(rows);
      }

      if (Array.isArray(data.conseilAdministration)) {
        const rows = emptyConseil();
        data.conseilAdministration
          .slice(0, CONSEIL_ROWS)
          .forEach((r: any, i: number) => {
            rows[i] = {
              id: i + 1,
              nom: r.nom ?? "",
              prenom: r.prenom ?? "",
              qualite: r.qualite ?? "",
              adresse: r.adresse ?? "",
            };
          });
        setConseil(rows);
      }
    } catch (error) {
      console.error("Erreur chargement Fiche R3:", error);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    loadNoteData();
  }, [loadNoteData]);

  // Pré-remplissage de l'en-tête depuis le dossier courant si la fiche est vierge.
  useEffect(() => {
    if (selectedClient && selectedFolder && !headerInfo.entityName) {
      setHeaderInfo((prev) => ({
        ...prev,
        entityName: selectedClient.name || "",
        fiscalYearEnd: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: prev.duration || "12",
      }));
    }
  }, [selectedClient, selectedFolder, headerInfo.entityName]);

  // 🔥 Sauvegarde
  const saveNoteData = async () => {
    if (!folderId) {
      alert("Veuillez sélectionner un dossier");
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        entete: {
          entityName: headerInfo.entityName,
          fiscalYear: headerInfo.fiscalYearEnd,
          idNumber: headerInfo.idNumber,
          duration: headerInfo.duration,
        },
        title:
          "FICHE D'IDENTIFICATION ET DE RENSEIGNEMENT DIVERS 3 - DIRIGEANTS",
        dirigeants: dirigeants.map((r) => ({
          id: String(r.id),
          nom: r.nom,
          prenom: r.prenom,
          qualite: r.qualite,
          nIdFiscale: r.nIdFiscale,
          adresse: r.adresse,
        })),
        conseilAdministration: conseil.map((r) => ({
          id: String(r.id),
          nom: r.nom,
          prenom: r.prenom,
          qualite: r.qualite,
          adresse: r.adresse,
        })),
      };

      const saved = await notesService.saveNoteData(
        folderId,
        "R3",
        payload as any,
      );
      if (saved) {
        alert("✅ Fiche R3 sauvegardée");
        setIsEditing(false);
      } else {
        throw new Error("Échec de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde Fiche R3:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers de changement ---

  const handleDirigeantChange = (
    id: number,
    field: keyof DirigeantRow,
    value: string
  ) => {
    setDirigeants((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleConseilChange = (
    id: number,
    field: keyof ConseilRow,
    value: string
  ) => {
    setConseil((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // --- Fonction de téléchargement PDF ---

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      // Désactiver l'édition juste avant la capture pour avoir le style statique
      setIsEditing(false);

      // Petit délai pour assurer la mise à jour du DOM
      setTimeout(async () => {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("FICHE_R3_Dirigeants.pdf");

        // Restaurer l'état d'édition
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  // --- Rendu des lignes Dirigeants ---

  const renderDirigeantRow = (row: DirigeantRow) => (
    <tr key={row.id}>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.nom}
            onChange={(e) =>
              handleDirigeantChange(row.id, "nom", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.nom
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.prenom}
            onChange={(e) =>
              handleDirigeantChange(row.id, "prenom", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.prenom
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.qualite}
            onChange={(e) =>
              handleDirigeantChange(row.id, "qualite", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.qualite
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.nIdFiscale}
            onChange={(e) =>
              handleDirigeantChange(row.id, "nIdFiscale", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.nIdFiscale
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.adresse}
            onChange={(e) =>
              handleDirigeantChange(row.id, "adresse", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.adresse
        )}
      </td>
    </tr>
  );

  // --- Rendu des lignes Conseil d'Administration ---

  const renderConseilRow = (row: ConseilRow) => (
    <tr key={row.id}>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.nom}
            onChange={(e) => handleConseilChange(row.id, "nom", e.target.value)}
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.nom
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.prenom}
            onChange={(e) =>
              handleConseilChange(row.id, "prenom", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.prenom
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.qualite}
            onChange={(e) =>
              handleConseilChange(row.id, "qualite", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.qualite
        )}
      </td>
      <td className="border border-black p-1">
        {isEditing ? (
          <input
            value={row.adresse}
            onChange={(e) =>
              handleConseilChange(row.id, "adresse", e.target.value)
            }
            className="w-full bg-orange-50 focus:outline-none"
          />
        ) : (
          row.adresse
        )}
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="w-3/4 max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-600" />
          FICHE R3 - Dirigeants & CA
        </h1>
        <div className="flex gap-3">
          <button
            onClick={isEditing ? saveNoteData : () => setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition disabled:opacity-60 ${
              isEditing ? "bg-green-600" : "bg-orange-600"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={18} /> {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </>
            ) : (
              <>
                <Pencil size={18} /> Éditer
              </>
            )}
          </button>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto bg-white shadow-2xl p-6 text-[10px] border border-black"
      >
        {/* Numéro de page */}
        <div className="text-center font-bold text-lg mb-1">3</div>

        {/* En-tête (Lignes 1-7) */}
        <div className="text-center font-bold text-lg mb-4">FICHE R3</div>

        {/* Champs d'en-tête */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <span className="font-bold w-[25%] shrink-0">
              Désignation entité :
            </span>
            <div
              className={`flex-1 ${isEditing ? "" : "border-b border-black"}`}
            >
              {isEditing ? (
                <input
                  value={headerInfo.entityName}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                  }
                  className="w-full border-b border-orange-500 bg-orange-50 focus:outline-none px-1"
                />
              ) : (
                headerInfo.entityName
              )}
            </div>
            <span className="font-bold ml-8 mr-2 shrink-0">
              Exercice clos le 31-12-
            </span>
            <div className={`w-20 ${isEditing ? "" : "border-b border-black"}`}>
              {isEditing ? (
                <input
                  value={headerInfo.fiscalYearEnd}
                  onChange={(e) =>
                    setHeaderInfo({
                      ...headerInfo,
                      fiscalYearEnd: e.target.value,
                    })
                  }
                  className="w-full text-center border-b border-orange-500 bg-orange-50 focus:outline-none px-1"
                />
              ) : (
                headerInfo.fiscalYearEnd
              )}
            </div>
          </div>

          <div className="flex items-center">
            <span className="font-bold w-[25%] shrink-0">
              Numéro d'identification :
            </span>
            <div
              className={`flex-1 ${isEditing ? "" : "border-b border-black"}`}
            >
              {isEditing ? (
                <input
                  value={headerInfo.idNumber}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, idNumber: e.target.value })
                  }
                  className="w-full border-b border-orange-500 bg-orange-50 focus:outline-none px-1"
                />
              ) : (
                headerInfo.idNumber
              )}
            </div>
            <span className="font-bold ml-8 mr-2 shrink-0">
              Durée (en mois) :
            </span>
            <div className={`w-20 ${isEditing ? "" : "border-b border-black"}`}>
              {isEditing ? (
                <input
                  value={headerInfo.duration}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, duration: e.target.value })
                  }
                  className="w-full text-center border-b border-orange-500 bg-orange-50 focus:outline-none px-1"
                />
              ) : (
                headerInfo.duration
              )}
            </div>
          </div>
        </div>

        {/* Titre Dirigeants */}
        <div className="text-center font-bold text-sm mb-0">
          FICHE D'IDENTIFICATION ET DE RENSEIGNEMENT DIVERS 3 DIRIGEANTS (*)
        </div>

        {/* Tableau Dirigeants (Lignes 9-23) */}
        <table className="w-full border-collapse border border-black text-[10px] my-1">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-1 w-[20%] text-center">
                Nom
              </th>
              <th className="border border-black p-1 w-[20%] text-center">
                Prénoms
              </th>
              <th className="border border-black p-1 w-[15%] text-center">
                Qualité
              </th>
              <th className="border border-black p-1 w-[20%] text-center">
                N° d'identification
              </th>
              <th className="border border-black p-1 w-[25%] text-center">
                Adresse (BP, ville, pays)
              </th>
            </tr>
          </thead>
          <tbody>{dirigeants.map(renderDirigeantRow)}</tbody>
        </table>

        {/* Légende Dirigeants (Ligne 24-25) */}
        <div className="mt-2 pl-1 mb-6">
          (*) Dirigeant = Président Directeur Général, Directeur Général,
          Administrateur Général, Gérant, Autres
        </div>

        {/* Titre Conseil d'Administration (Ligne 30) */}
        <div className="text-center font-bold text-sm my-1 pt-1 border-t border-black">
          MEMBRE DU CONSEIL D'ADMINISTRATION
        </div>

        {/* Tableau Conseil d'Administration (Lignes 32-43) */}
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-1 w-[25%] text-center">
                Nom
              </th>
              <th className="border border-black p-1 w-[25%] text-center">
                Prénoms
              </th>
              <th className="border border-black p-1 w-[20%] text-center">
                Qualité
              </th>
              <th className="border border-black p-1 w-[30%] text-center">
                Adresse (BP, ville, Pays)
              </th>
            </tr>
          </thead>
          <tbody>{conseil.map(renderConseilRow)}</tbody>
        </table>

        {/* Espace pour remplir la page (simulation de mise en page) */}
        <div className="h-16"></div>
      </div>
    </div>
  );
};

export default FicheR3;

