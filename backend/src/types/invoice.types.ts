// src/types/invoice.types.ts
// Données d'une facture scannée: ce que l'IA extrait, et ce que les contrôles
// déterministes en concluent.

/** Sens de la pièce du point de vue de l'entité qui tient la comptabilité. */
export type InvoiceDirection = "ACHAT" | "VENTE";

/** Une ligne de détail de la facture. */
export interface InvoiceLine {
  designation: string;
  quantite: number | null;
  prixUnitaireHT: number | null;
  montantHT: number | null;
}

/**
 * Résultat brut de l'extraction.
 *
 * Tous les champs sont nullables: une facture illisible ou incomplète doit
 * pouvoir remonter partiellement plutôt que d'échouer. C'est le contrôle de
 * conformité qui statue ensuite sur ce qui manque.
 */
export interface ExtractedInvoice {
  direction: InvoiceDirection | null;

  // Émetteur
  fournisseurNom: string | null;
  fournisseurNiu: string | null;
  fournisseurRccm: string | null;
  fournisseurAdresse: string | null;
  fournisseurTelephone: string | null;
  regimeFiscal: string | null;
  centreImpots: string | null;

  // Destinataire
  clientNom: string | null;
  clientNiu: string | null;

  // Pièce
  numeroFacture: string | null;
  dateFacture: string | null; // ISO AAAA-MM-JJ
  devise: string | null;

  // Montants
  montantHT: number | null;
  tauxTVA: number | null; // en pourcentage, ex. 19.25
  montantTVA: number | null;
  montantTTC: number | null;
  droitTimbre: number | null;
  autresTaxes: number | null;

  // Mentions
  mentionFactureNormalisee: boolean | null;
  natureOperation: string | null; // ex. "prestation de services", "marchandises"

  lignes: InvoiceLine[];

  /** Ce que le modèle n'a pas su lire, dans ses mots. */
  remarques: string | null;
}

export type CheckSeverity = "BLOQUANT" | "AVERTISSEMENT" | "INFO";

export interface ConformityCheck {
  code: string;
  label: string;
  severity: CheckSeverity;
  passed: boolean;
  /** Précision affichée au comptable lorsque le contrôle échoue. */
  detail?: string;
}

export interface ConformityReport {
  checks: ConformityCheck[];
  /** Aucun contrôle bloquant en échec. */
  conforme: boolean;
  /** Conséquence fiscale principale: la TVA est-elle récupérable ? */
  tvaDeductible: boolean;
  blockingCount: number;
  warningCount: number;
}

/** Une ligne de l'écriture proposée (étape 2). */
export interface ProposedEntryLine {
  compte: string;
  libelleCompte: string;
  debit: number;
  credit: number;
  /** Pourquoi ce compte a été retenu — rend la proposition auditable. */
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
  /** Points nécessitant l'arbitrage du comptable avant comptabilisation. */
  reserves: string[];
}
