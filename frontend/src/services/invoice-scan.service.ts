// services/invoice-scan.service.ts
import api from "./api";

export type InvoiceDirection = "ACHAT" | "VENTE";
export type CheckSeverity = "BLOQUANT" | "AVERTISSEMENT" | "INFO";

export interface InvoiceLine {
  designation: string;
  quantite: number | null;
  prixUnitaireHT: number | null;
  montantHT: number | null;
}

export interface ExtractedInvoice {
  direction: InvoiceDirection | null;
  fournisseurNom: string | null;
  fournisseurNiu: string | null;
  fournisseurRccm: string | null;
  fournisseurAdresse: string | null;
  fournisseurTelephone: string | null;
  regimeFiscal: string | null;
  centreImpots: string | null;
  clientNom: string | null;
  clientNiu: string | null;
  numeroFacture: string | null;
  dateFacture: string | null;
  devise: string | null;
  montantHT: number | null;
  tauxTVA: number | null;
  montantTVA: number | null;
  montantTTC: number | null;
  droitTimbre: number | null;
  autresTaxes: number | null;
  mentionFactureNormalisee: boolean | null;
  natureOperation: string | null;
  lignes: InvoiceLine[];
  remarques: string | null;
}

export interface ConformityCheck {
  code: string;
  label: string;
  severity: CheckSeverity;
  passed: boolean;
  detail?: string;
}

export interface ConformityReport {
  checks: ConformityCheck[];
  conforme: boolean;
  tvaDeductible: boolean;
  blockingCount: number;
  warningCount: number;
}

export interface ProposedEntryLine {
  compte: string;
  libelleCompte: string;
  debit: number;
  credit: number;
  justification: string;
}

export interface ProposedEntry {
  journal: string;
  date: string | null;
  libelle: string;
  lines: ProposedEntryLine[];
  totalDebit: number;
  totalCredit: number;
  equilibree: boolean;
  reserves: string[];
}

export interface InvoiceAnalysis {
  extraction: ExtractedInvoice;
  conformity: ConformityReport;
  proposedEntry: ProposedEntry;
}

// Delai accorde a l'analyse d'une piece, bien au-dela du defaut global.
// Le backend essaie d'abord Ox Alpha (jusqu'a 100s observes) puis, en cas
// d'echec, bascule automatiquement sur Gemini (jusqu'a ~90s de budget de
// reprises) - le pire cas mesure avoisine les 3 minutes au total.
export const ANALYSIS_TIMEOUT_MS = 220_000;

class InvoiceScanService {
  /** Retire le prefixe "data:...;base64," ajoute par FileReader. */
  private toBase64(file: File): Promise<{ data: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        const comma = result.indexOf(",");
        resolve({
          data: comma >= 0 ? result.slice(comma + 1) : result,
          mimeType: file.type,
        });
      };
      reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
      reader.readAsDataURL(file);
    });
  }

  async analyze(file: File, folderId?: string): Promise<InvoiceAnalysis> {
    const document = await this.toBase64(file);
    const response = await api.post(
      "/invoice-scan/analyze",
      { document, folderId },
      // La lecture d'une piece par le modele multimodal prend couramment 20 a
      // 60 secondes, davantage sur un PDF de plusieurs pages ou si le
      // fournisseur applique une temporisation. Le delai global de 15 s de
      // l'instance axios convient aux appels CRUD mais avorte cette requete:
      // on le remplace ici seulement.
      { timeout: ANALYSIS_TIMEOUT_MS },
    );
    return response.data;
  }
}

export const invoiceScanService = new InvoiceScanService();
