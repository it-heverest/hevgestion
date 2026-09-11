import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const GrilleAnalyseNotes: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const wasEditing = isEditing;
      setIsEditing(false);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(reportRef.current!, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("grille_analyse_notes.pdf");

      setIsEditing(wasEditing);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-xs text-gray-900">
      <div className="w-full max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-7 h-7 text-orange-700" />
          Grille d'Analyse des Notes
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm ${
              isEditing
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-orange-700 text-white hover:bg-orange-800"
            }`}
          >
            {isEditing ? "Annuler" : <Pencil size={18} />}
            {isEditing ? "Annuler" : "Éditer"}
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-all shadow-sm"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-full max-w-[210mm] mx-auto bg-white shadow-xl border border-gray-300"
      >
        <style>{`
          .header-gray {
            background-color: #e6e6e6;
          }
          .title-gray {
            background-color: #d3d3d3;
          }
          .total-gray {
            background-color: #c0c0c0;
            font-weight: bold;
          }
          .checkbox {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #666;
            border-radius: 4px;
            outline: none;
            cursor: pointer;
            position: relative;
          }
          .checkbox:checked::after {
            content: "✔";
            position: absolute;
            top: -1px;
            left: 1px;
            font-size: 14px;
            color: #000;
          }
          .edit-input {
            width: 100%;
            padding: 4px 6px;
            border: 1px solid #999;
            border-radius: 4px;
            background-color: #fff9e6;
            font-size: 11px;
          }
          .edit-input:focus {
            outline: 2px solid #3b82f6;
            background-color: #fff;
          }
        `}</style>

        {/* En-tête */}
        <div className="p-5 border-b-2 border-gray-700">
          <div className="grid grid-cols-2 gap-6 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-bold whitespace-nowrap">
                Désignation entité :
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input flex-1"
                  placeholder="Nom de l'entité"
                />
              ) : (
                <span className="border-b border-dotted border-gray-600 flex-1 min-h-[20px]"></span>
              )}
            </div>
            <div className="flex items-center gap-3 justify-end">
              <span className="font-bold whitespace-nowrap">
                Exercice clos le :
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input w-40 text-center"
                  placeholder="31-12-...."
                />
              ) : (
                <span className="border-b border-dotted border-gray-600 w-40 text-center min-h-[20px]"></span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <span className="font-bold whitespace-nowrap">
                Numéro d'identification :
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input flex-1"
                  placeholder="Numéro"
                />
              ) : (
                <span className="border-b border-dotted border-gray-600 flex-1 min-h-[20px]"></span>
              )}
            </div>
            <div className="flex items-center gap-3 justify-end">
              <span className="font-bold whitespace-nowrap">
                Durée (en mois) :
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input w-24 text-center"
                  value="12"
                  readOnly
                />
              ) : (
                <span className="border-b border-dotted border-gray-600 w-24 text-center">
                  12
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Titre principal */}
        <div className="title-gray py-3 text-center font-bold text-base border-b-2 border-gray-700">
          GRILLE D'ANALYSE DES NOTES
        </div>

        {/* Tableau principal */}
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="header-gray">
              <th className="border border-gray-600 p-2 font-bold text-left w-16">
                NOTES
              </th>
              <th className="border border-gray-600 p-2 font-bold text-left">
                INTITULES
              </th>
              <th className="border border-gray-600 p-2 w-20 text-center font-bold">
                A
              </th>
              <th className="border border-gray-600 p-2 w-20 text-center font-bold">
                NA
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                note: "NOTE 1",
                title: "SOMMAIRE DU MATÉRIEL, DU MOBILIER ET DES CAUTIONS",
              },
              { note: "NOTE 2", title: "ETATS DES STOCKS" },
              {
                note: "NOTE 3",
                title:
                  "ETAT DES CRÉANCES ET DES DETTES NON ÉCHUES AU 31 DÉCEMBRE",
              },
              { note: "NOTE 4", title: "JOURNAL DES TRÉSORERIE" },
              {
                note: "NOTE 5",
                title: "JOURNAL DES SOMMES DES CRÉANCES IMPAYÉES",
              },
              {
                note: "NOTE 6",
                title: "JOURNAL DES SOMMES DES DETTES À PAYER",
              },
              { note: "T1", title: "IMMOBILISATIONS BRUTES" },
              {
                note: "T1 BIS",
                title: "IMMOBILISATION (AMORTISSEMENTS) DEDUCTIBLES RÉPUTÉS",
              },
              {
                note: "T1 TER",
                title:
                  "TABLEAU DE SOMME DES AMORTISSEMENTS DEDUCTIBLES RÉPUTÉS DIFFÉRENT EN PÉRIODE DÉFICITAIRE",
              },
              {
                note: "T2",
                title:
                  "IMMOBILISATIONS : PLUS-VALUES ET MOINS-VALUES DE CESSION",
              },
              { note: "T3", title: "IMMOBILISATIONS FINANCIÈRES" },
              {
                note: "T4",
                title: "EXTRAIT DE LA BALANCE GÉNÉRALE DES FOURNISSEURS",
              },
              { note: "T5", title: "SYNTHÈSE DES IMPÔTS ET TAXES VERSÉS" },
              {
                note: "T6",
                title:
                  "TABLEAU DE PASSAGE DU RÉSULTAT COMPTABLE AVANT IMPÔT AU RÉSULTAT FISCAL",
              },
              {
                note: "T7",
                title:
                  "TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT : IMPÔT SUR LE BÉNÉFICE FISCAL",
              },
              {
                note: "T8",
                title:
                  "TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT : MINIMUM DE PERCEPTION",
              },
              {
                note: "T9",
                title:
                  "TABLEAU DE DÉTERMINATION DE L'IMPÔT SUR LE RÉSULTAT : PERCEPTION",
              },
              {
                note: "T9",
                title:
                  "RÉCAPITULATIF DES VERSEMENTS D'ACOMPTES ET DE RETENUES À LA SOURCE",
              },
              { note: "A", title: "APPLICABLE" },
              { note: "NA", title: "NON APPLICABLE" },
            ].map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-600 p-2 font-medium text-center">
                  {row.note}
                </td>
                <td className="border border-gray-600 p-2">{row.title}</td>
                <td className="border border-gray-600 p-2 text-center">
                  <input
                    type="checkbox"
                    className="checkbox"
                    disabled={!isEditing}
                  />
                </td>
                <td className="border border-gray-600 p-2 text-center">
                  <input
                    type="checkbox"
                    className="checkbox"
                    disabled={!isEditing}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Légende */}
        <div className="p-4 text-[10px] border-t border-gray-600 bg-gray-50">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-bold">A :</span> Applicable
            </div>
            <div>
              <span className="font-bold">NA :</span> Non applicable.
            </div>
          </div>
          <div className="mt-2">
            Par exemple pour une entité qui n’a pas de créances impayées, elle
            doit cocher à l’intersection (ligne NOTE 5 & colonne NA)
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrilleAnalyseNotes;

