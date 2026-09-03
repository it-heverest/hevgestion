import React, { useState, useRef } from "react";
import { Pencil, Save, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EtatC11: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

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
        pdf.save("etat_c11_marge_solvabilite.pdf");
        setIsEditing(wasEditing);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-xs text-black">
      <div className="w-3/4 max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          ETAT C11 - Marge de Solvabilité Non Vie
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
              isEditing ? "bg-green-600" : "bg-orange-600"
            }`}
          >
            {isEditing ? (
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-3/4 max-w-[297mm] mx-auto bg-white shadow-2xl p-6 border border-gray-200"
      >
        <style>{`
          .dark-gray {
            background-color: #404040;
            color: white;
          }
          .medium-gray {
            background-color: #808080;
            color: white;
          }
          .light-gray {
            background-color: #c0c0c0;
          }
          .diagonal {
            background-image: linear-gradient(
                135deg,
                #808080 25%,
                transparent 25%
              ),
              linear-gradient(225deg, #808080 25%, transparent 25%),
              linear-gradient(315deg, #808080 25%, transparent 25%),
              linear-gradient(45deg, #808080 25%, transparent 25%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
          }
        `}</style>

        {/* Page number */}
        <div className="text-center font-bold text-lg mb-4">11B</div>

        {/* Header fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-bold">
              Dénomination sociale de l'entreprise :
            </span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Exercice clos le :</span>
            <div className="border-b border-dotted border-black mt-1 h-8 inline-block w-64"></div>
          </div>
          <div>
            <span className="font-bold">Sigle usuel :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div className="text-right">
            <span className="font-bold">Durée (en mois) :</span>
            <span className="ml-4 font-bold">12</span>
          </div>
          <div>
            <span className="font-bold">Adresse géographique :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
          <div></div>
          <div>
            <span className="font-bold">N° Identification unique (NIU) :</span>
            <div className="border-b border-dotted border-black mt-1 h-8"></div>
          </div>
        </div>

        {/* Title */}
        <div className="medium-gray py-2 text-center font-bold text-white mb-6">
          ETAT C11: CALCUL DE LA MARGE DE SOLVABILITE - NON VIE
        </div>

        {/* ÉLÉMENTS CONSTITUTIFS */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          ÉLÉMENTS CONSTITUTIFS (art 337-1)
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={2}
              ></th>
              <th className="border border-black p-2 text-center">Année N</th>
              <th className="border border-black p-2 text-center">Année N-1</th>
              <th className="border border-black p-2 text-center">Année N-2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                1) Capital social versé ou fonds d'établissement constitué
              </td>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                2) La moitié de la fraction non versée du capital ou de la part
                restant à rembourser pour fonds d'établissement
              </td>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                3) Emprunt pour fonds social complémentaire
              </td>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                4) Réserves réglementaires ou libres
              </td>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                5) Bénéfices reportés et de l'exercice
              </td>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                6) Plus-values sur éléments d'actifs
              </td>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                7) Fonds encaissés provenant de l'émission des titres ou
                emprunts subordonnés
              </td>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                8) Droit d'adhésion prélevés sur les nouveaux adhérents des
                mutuelles
              </td>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                TOTAL (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8)
              </td>
              <td className="border border-black p-2 text-center">9</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                10) Amortissement restant à réaliser sur frais d'établissement &
                de développement
              </td>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                11) Amortissement restant à réaliser sur immobilisations
                incorporelles
              </td>
              <td className="border border-black p-2 text-center">11</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                12) Amortissement restant à réaliser sur immobilisations
                incorporelles
              </td>
              <td className="border border-black p-2 text-center">12</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                13) TOTAL (10 + 11 + 12)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                [14] MARGE DISPONIBLE (9 - 13)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>

        {/* CALCUL RÉGLEMENTAIRE */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          CALCUL RÉGLEMENTAIRE
        </div>
        <table className="w-full border-collapse border border-black text-[11px] mb-6">
          <thead>
            <tr className="medium-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={2}
              ></th>
              <th className="border border-black p-2 text-center">Année N</th>
              <th className="border border-black p-2 text-center">Année N-1</th>
              <th className="border border-black p-2 text-center">Année N-2</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-bold">
              <td className="border border-black p-2 pl-4" colSpan={5}>
                Méthode des primes (article 337-2 a)
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                a) Primes émises nettes d'annulations
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                b) Charges de sinistre nette de réassurance
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                c) Charge de sinistre brute de réassurance
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                d) Taux de conservation des sinistres (b/c sup. ou égal à 50%)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0%</td>
              <td className="border border-black p-2 text-right">0%</td>
              <td className="border border-black p-2 text-right">0%</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                e) Montant de primes retenu (a x 20%)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr className="light-gray font-bold">
              <td className="border border-black p-2 pl-8">
                [f] MARGE MINIMALE (e x d)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            {/* Similar for other methods and final surplus/deficit */}
          </tbody>
        </table>

        {/* DÉTERMINATION DE LA MARGE */}
        <div className="medium-gray py-1 text-center font-bold text-white mb-2">
          DÉTERMINATION DE LA MARGE
        </div>
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="medium-gray">
              <th
                className="border border-black p-2 text-left"
                colSpan={2}
              ></th>
              <th className="border border-black p-2 text-center">Année N</th>
              <th className="border border-black p-2 text-center">Année N-1</th>
              <th className="border border-black p-2 text-center">Année N-2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 pl-8">
                [m] SURPLUS DE MARGE (12 - l)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-8">
                [n] DÉFICIT DE MARGE (l - 12)
              </td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EtatC11;

