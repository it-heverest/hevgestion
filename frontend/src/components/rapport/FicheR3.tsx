import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

const FicheR3: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // En-tête
  const [headerInfo, setHeaderInfo] = useState<HeaderDataR3>({
    entityName: "NASHSOFT SYSTEMS",
    fiscalYearEnd: "2024",
    idNumber: "RC/DLA/2024/B/123",
    duration: "12",
  });

  // Données Dirigeants (Pré-remplissage pour l'exemple, et ajout de 8 lignes vides)
  const [dirigeants, setDirigeants] = useState<DirigeantRow[]>([
    {
      id: 1,
      nom: "DOE",
      prenom: "John",
      qualite: "Président Directeur Général",
      nIdFiscale: "123456789",
      adresse: "BP 100, Yaoundé, Cameroun",
    },
    ...Array(7)
      .fill(null)
      .map((_, i) => ({
        id: i + 2,
        nom: "",
        prenom: "",
        qualite: "",
        nIdFiscale: "",
        adresse: "",
      })),
  ]);

  // Données Conseil d'Administration (Ajout de 10 lignes vides)
  const [conseil, setConseil] = useState<ConseilRow[]>([
    ...Array(10)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        nom: "",
        prenom: "",
        qualite: "",
        adresse: "",
      })),
  ]);

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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
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
            className="w-full bg-blue-50 focus:outline-none"
          />
        ) : (
          row.adresse
        )}
      </td>
    </tr>
  );

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
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isEditing ? "bg-green-600" : "bg-blue-600"
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
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 transition"
          >
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <div
        ref={reportRef}
        className="w-3/4 max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-2xl p-6 text-[10px] border border-black"
      >
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
                  className="w-full border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
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
                  className="w-full text-center border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
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
                  className="w-full border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
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
                  className="w-full text-center border-b border-blue-500 bg-blue-50 focus:outline-none px-1"
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
                N° d'identification fiscale
              </th>
              <th className="border border-black p-1 w-[25%] text-center">
                Adresse (BP, ville, pays)
              </th>
            </tr>
          </thead>
          <tbody>
            {dirigeants.map(renderDirigeantRow)}
            {/* Ligne vide finale (pour simuler la ligne 23) */}
            <tr>
              <td colSpan={5} className="p-1 border-x border-black h-4">
                &nbsp;
              </td>
            </tr>
          </tbody>
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
          <tbody>
            {conseil.map(renderConseilRow)}
            {/* Remplir les lignes restantes pour atteindre la hauteur visuelle du modèle */}
            <tr>
              <td colSpan={4} className="p-1 border-x border-black h-4">
                &nbsp;
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="p-1 border-x border-black h-4">
                &nbsp;
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="p-1 border-x border-black h-4">
                &nbsp;
              </td>
            </tr>
          </tbody>
        </table>

        {/* Espace pour remplir la page (simulation de mise en page) */}
        <div className="h-16"></div>
      </div>
    </div>
  );
};

export default FicheR3;

