import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Save, Download, FileText, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";

// Mise en page reprise de l'onglet « Fiche R2 » de la DSF officielle:
// bloc de renseignements (codes ZK à ZP), bloc « Contrôle de l'entité »
// (ZQ à ZS), puis tableau des activités de l'entreprise.

interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

interface ActivityRow {
  id: string;
  designation: string;
  codeNomenclature: string;
  montant: number;
  pourcentage: number;
}

/** Codes tels qu'imprimés sur la fiche, dans l'ordre du formulaire. */
const RENSEIGNEMENTS: { code: string; label: string; boxes: number }[] = [
  { code: "ZK", label: "Forme juridique (1) :", boxes: 4 },
  { code: "ZL", label: "Régistre fiscal (1) :", boxes: 4 },
  { code: "ZM", label: "Pays du siège social (1) :", boxes: 4 },
  { code: "ZN", label: "Nombre d'établissement dans le pays :", boxes: 4 },
  {
    code: "ZO",
    label:
      "Nombre d'établissement dans le pays hors du pays pour lesquels une comptabilité distincte est tenue",
    boxes: 4,
  },
  { code: "ZP", label: "Première année d'exercice dans le pays :", boxes: 8 },
];

const CODE_NOMENCLATURE_BOXES = 6;

/** Rendu "case par case" façon imprimé officiel, une case par caractère. */
const renderBoxes = (value: string, count: number) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-5 h-5 border border-gray-500 flex items-center justify-center text-[10px] shrink-0"
      >
        {value[i] || ""}
      </div>
    ))}
  </div>
);

const CONTROLE: { code: string; label: string }[] = [
  { code: "ZQ", label: "Entreprise sous contrôle public" },
  { code: "ZR", label: "Entreprise sous contrôle privé national" },
  { code: "ZS", label: "Entreprise sous contrôle privé étranger" },
];

const ACTIVITY_ROWS = 6;

const emptyActivities = (): ActivityRow[] =>
  Array.from({ length: ACTIVITY_ROWS }, (_, i) => ({
    id: String(i + 1),
    designation: "",
    codeNomenclature: "",
    montant: 0,
    pourcentage: 0,
  }));

const FicheR2: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const { selectedFolder, selectedClient } = useApp();
  const folderId = folderIdFromUrl || selectedFolder?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "12",
  });

  const [renseignements, setRenseignements] = useState<Record<string, string>>(
    {}
  );
  const [controle, setControle] = useState<string>("");
  const [activities, setActivities] = useState<ActivityRow[]>(emptyActivities());
  const [divers, setDivers] = useState({ montant: 0, pourcentage: 0 });
  const [comment, setComment] = useState("");

  const loadNoteData = useCallback(async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const data = (await notesService.getNoteData(folderId, "R2")) as any;
      if (!data) return;

      if (data.entete) {
        setHeaderInfo({
          entityName: data.entete.entityName || "",
          fiscalYear: data.entete.fiscalYear || "",
          idNumber: data.entete.idNumber || "",
          duration: data.entete.duration || "12",
        });
      }

      if (data.renseignements) {
        const next: Record<string, string> = {};
        RENSEIGNEMENTS.forEach(({ code }) => {
          next[code] = data.renseignements[code]?.value ?? "";
        });
        setRenseignements(next);
      }

      if (data.controleEntite) {
        const checked = CONTROLE.find(
          ({ code }) => data.controleEntite[code]?.checked
        );
        setControle(checked?.code ?? "");
      }

      if (Array.isArray(data.activites) && data.activites.length > 0) {
        // On conserve toujours le nombre de lignes de l'imprimé.
        const rows = emptyActivities();
        data.activites.slice(0, ACTIVITY_ROWS).forEach((r: any, i: number) => {
          rows[i] = {
            id: String(i + 1),
            designation: r.designation ?? "",
            codeNomenclature: r.codeNomenclature ?? "",
            montant: Number(r.montant) || 0,
            pourcentage: Number(r.pourcentage) || 0,
          };
        });
        setActivities(rows);
      }

      if (data.divers) {
        setDivers({
          montant: Number(data.divers.montant) || 0,
          pourcentage: Number(data.divers.pourcentage) || 0,
        });
      }

      if (data.comment !== undefined) setComment(data.comment || "");
    } catch (error) {
      console.error("Erreur chargement Fiche R2:", error);
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
        fiscalYear: selectedFolder.fiscalYear?.toString() || "",
        idNumber: selectedClient.taxNumber || "",
        duration: prev.duration || "12",
      }));
    }
  }, [selectedClient, selectedFolder, headerInfo.entityName]);

  const saveNoteData = async () => {
    if (!folderId) {
      alert("Veuillez sélectionner un dossier");
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        entete: headerInfo,
        title: "FICHE D'IDENTIFICATION ET DE RENSEIGNEMENT DIVERS 2",
        renseignements: RENSEIGNEMENTS.reduce(
          (acc, { code, label }) => {
            acc[code] = { label, value: renseignements[code] ?? "" };
            return acc;
          },
          {} as Record<string, { label: string; value: string }>
        ),
        controleEntite: CONTROLE.reduce(
          (acc, { code, label }) => {
            acc[code] = { label, checked: controle === code };
            return acc;
          },
          {} as Record<string, { label: string; checked: boolean }>
        ),
        activites: activities,
        divers: { designation: "Divers", ...divers },
        comment,
      };

      const saved = await notesService.saveNoteData(folderId, "R2", payload as any);
      if (saved) {
        alert("✅ Fiche R2 sauvegardée");
        setIsEditing(false);
      } else {
        throw new Error("Échec de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde Fiche R2:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const wasEditing = isEditing;
    setIsEditing(false);
    setTimeout(async () => {
      const canvas = await html2canvas(reportRef.current!, { scale: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pdfWidth,
        (canvas.height * pdfWidth) / canvas.width
      );
      pdf.save("fiche_r2.pdf");
      setIsEditing(wasEditing);
    }, 100);
  };

  const updateActivity = (
    id: string,
    field: keyof ActivityRow,
    value: string
  ) => {
    setActivities((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "montant" || field === "pourcentage"
                  ? Number(value) || 0
                  : value,
            }
          : row
      )
    );
  };

  const totalMontant =
    activities.reduce((sum, r) => sum + r.montant, 0) + divers.montant;
  const totalPourcentage =
    activities.reduce((sum, r) => sum + r.pourcentage, 0) + divers.pourcentage;

  const fmt = (v: number) => (v === 0 ? "" : v.toLocaleString("fr-FR").replace(/\u202F/g, " "));

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

  const inputCls =
    "w-full bg-orange-50 border border-orange-300 px-1 text-[11px] outline-none";

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Fiche R2 - Identification et renseignements divers
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedClient?.name} - Exercice {selectedFolder?.fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
            onClick={() => setIsEditing(true)}
            title="Éditer"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil size={18} />
          </button>
          ) : (
            <>
              <button
            onClick={saveNoteData}
            disabled={isSaving}
            title="Sauvegarder"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className={isSaving ? "animate-pulse" : ""} />
          </button>
              <button
            onClick={() => setIsEditing(false)}
            title="Annuler"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
            </>
          )}
          <button
            onClick={downloadPDF}
            title="Télécharger PDF"
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Imprimé */}
      <div
        ref={reportRef}
        className={`max-w-[210mm] mx-auto bg-white shadow-2xl p-6 border-2 ${
          isEditing ? "border-orange-500" : "border-gray-200"
        }`}
      >
        {/* Numéro de page */}
        <div className="flex justify-center mb-4">
          <span className="font-bold text-base bg-gray-100 px-4 py-1 rounded-full border border-gray-300">
            2
          </span>
        </div>
        <div className="bg-gray-300 border border-gray-400 py-1 text-center font-bold mb-3">
          FICHE R2
        </div>

        {/* En-tête */}
        <div className="mb-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">
          <div className="flex gap-2">
            <span className="font-bold">Désignation entité :</span>
            {isEditing ? (
              <input
                value={headerInfo.entityName}
                onChange={(e) =>
                  setHeaderInfo({ ...headerInfo, entityName: e.target.value })
                }
                className={`${inputCls} flex-1`}
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
                className={`${inputCls} w-16`}
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
                className={`${inputCls} flex-1`}
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
                className={`${inputCls} w-16`}
              />
            ) : (
              <span className="border-b border-dotted border-gray-400 w-16 text-center">
                {headerInfo.duration}
              </span>
            )}
          </div>
        </div>

        <div className="text-center font-bold mb-2">
          FICHE D'IDENTIFICATION ET DE RENSEIGNEMENT DIVERS 2
        </div>

        {/* Renseignements + contrôle de l'entité */}
        <div className="grid grid-cols-2 gap-0 border border-gray-400">
          <div className="border-r border-gray-400">
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                {RENSEIGNEMENTS.map(({ code, label, boxes }) => (
                  <tr key={code}>
                    <td className="border-b border-gray-300 p-1 w-8 text-center font-bold align-top">
                      {code}
                    </td>
                    <td className="border-b border-gray-300 p-1 align-top">
                      {label}
                    </td>
                    <td className="border-b border-gray-300 p-1 align-top">
                      {isEditing ? (
                        <input
                          value={renseignements[code] ?? ""}
                          onChange={(e) =>
                            setRenseignements((prev) => ({
                              ...prev,
                              [code]: e.target.value,
                            }))
                          }
                          maxLength={boxes}
                          className={inputCls}
                        />
                      ) : (
                        renderBoxes(renseignements[code] ?? "", boxes)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="border-b border-gray-300 p-1 font-bold text-center">
              Contrôle de l'entité (cocher la case)
            </div>
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                {CONTROLE.map(({ code, label }) => (
                  <tr key={code}>
                    <td className="border-b border-gray-300 p-1 w-8 text-center font-bold">
                      {code}
                    </td>
                    <td className="border-b border-gray-300 p-1">{label}</td>
                    <td className="border-b border-gray-300 p-1 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={controle === code}
                        disabled={!isEditing}
                        onChange={() =>
                          setControle(controle === code ? "" : code)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activités */}
        <div className="bg-gray-300 border border-gray-400 border-t-0 py-1 text-center font-bold">
          ACTIVITE DE L'ENTREPRISE
        </div>
        <table className="w-full border-collapse border border-gray-400 border-t-0 text-[11px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 text-left w-[38%]">
                Désignation de l'activité (*)
              </th>
              <th className="border border-gray-400 p-1 w-[22%]">
                Code nomenclature d'activité (*)
              </th>
              <th className="border border-gray-400 p-1 w-[25%]">
                Chiffre d'Affaire HT (CA HT) ou valeur ajoutée (VA) (*)
              </th>
              <th className="border border-gray-400 p-1 w-[15%]">
                % activité dans le CA HT ou la VA
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 p-1">
                  {isEditing ? (
                    <input
                      value={row.designation}
                      onChange={(e) =>
                        updateActivity(row.id, "designation", e.target.value)
                      }
                      className={inputCls}
                    />
                  ) : (
                    row.designation
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {isEditing ? (
                    <input
                      value={row.codeNomenclature}
                      onChange={(e) =>
                        updateActivity(
                          row.id,
                          "codeNomenclature",
                          e.target.value
                        )
                      }
                      maxLength={CODE_NOMENCLATURE_BOXES}
                      className={`${inputCls} text-center`}
                    />
                  ) : (
                    <div className="flex justify-center">
                      {renderBoxes(row.codeNomenclature, CODE_NOMENCLATURE_BOXES)}
                    </div>
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.montant}
                      onChange={(e) =>
                        updateActivity(row.id, "montant", e.target.value)
                      }
                      className={`${inputCls} text-right`}
                    />
                  ) : (
                    fmt(row.montant)
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={row.pourcentage}
                      onChange={(e) =>
                        updateActivity(row.id, "pourcentage", e.target.value)
                      }
                      className={`${inputCls} text-right`}
                    />
                  ) : (
                    fmt(row.pourcentage)
                  )}
                </td>
              </tr>
            ))}

            <tr>
              <td className="border border-gray-400 p-1 font-bold">Divers</td>
              <td className="border border-gray-400 p-1" />
              <td className="border border-gray-400 p-1 text-right">
                {isEditing ? (
                  <input
                    type="number"
                    value={divers.montant}
                    onChange={(e) =>
                      setDivers({ ...divers, montant: Number(e.target.value) || 0 })
                    }
                    className={`${inputCls} text-right`}
                  />
                ) : (
                  fmt(divers.montant)
                )}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {isEditing ? (
                  <input
                    type="number"
                    value={divers.pourcentage}
                    onChange={(e) =>
                      setDivers({
                        ...divers,
                        pourcentage: Number(e.target.value) || 0,
                      })
                    }
                    className={`${inputCls} text-right`}
                  />
                ) : (
                  fmt(divers.pourcentage)
                )}
              </td>
            </tr>

            <tr className="bg-gray-200 font-bold">
              <td className="border border-gray-400 p-1" colSpan={2}>
                TOTAL
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {fmt(totalMontant)}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {fmt(totalPourcentage)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Renvois de l'imprimé */}
        <div className="mt-2 text-[10px] italic space-y-0.5">
          <div>(*) Note 34</div>
          <div>
            (*) lister de manière précise les entités dans l'ordre décroissant du
            CA HT, ou de la valeur ajoutée (VA)
          </div>
        </div>

        {/* Commentaire */}
        <div className="mt-4 border border-gray-400 p-2">
          <div className="font-bold underline mb-1">Commentaire :</div>
          {isEditing ? (
            <textarea
              className="w-full h-16 p-1 border border-orange-300 bg-orange-50 resize-none outline-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <div className="min-h-[2rem] whitespace-pre-wrap">{comment}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FicheR2;
