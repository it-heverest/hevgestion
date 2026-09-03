// src/services/invoice-conformity.service.ts
//
// Contrôles de conformité d'une facture. Entièrement déterministes: aucune IA
// n'intervient ici. L'IA se contente de lire la facture (extraction), ces
// règles décident — c'est ce qui rend le verdict reproductible et opposable.
//
// Enjeu principal: au Cameroun, une facture à laquelle il manque une mention
// obligatoire ne permet pas de récupérer la TVA. Les contrôles marqués
// BLOQUANT sont ceux qui compromettent cette déductibilité.
import { ConformityCheck, ConformityReport, ExtractedInvoice } from "../types/invoice.types";

/** Taux de TVA en vigueur au Cameroun (17,5 % + 10 % de CAC). */
export const TAUX_TVA_CAMEROUN = 19.25;

/**
 * Tolérance sur les rapprochements de montants. Les factures arrondissent au
 * franc, et l'OCR peut se tromper d'une unité: 1 XAF d'écart n'est pas une
 * anomalie, 100 XAF en est une.
 */
const TOLERANCE_MONTANT = 1;
const TOLERANCE_TAUX = 0.05;

/**
 * NIU camerounais: 14 caractères, une lettre, 12 chiffres, une lettre.
 * Exemple: M021712603971A
 */
const NIU_PATTERN = /^[A-Z]\d{12}[A-Z]$/i;

const isBlank = (v: unknown): boolean =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

function check(
  code: string,
  label: string,
  severity: ConformityCheck["severity"],
  passed: boolean,
  detail?: string,
): ConformityCheck {
  return { code, label, severity, passed, ...(passed ? {} : { detail }) };
}

/**
 * Applique les contrôles à une facture extraite.
 *
 * @param exerciceRange bornes de l'exercice, pour vérifier le rattachement.
 */
export function checkConformity(
  invoice: ExtractedInvoice,
  exerciceRange?: { start: Date; end: Date },
): ConformityReport {
  const checks: ConformityCheck[] = [];
  const isAchat = invoice.direction !== "VENTE";

  // ─── Identification de l'émetteur ───────────────────────────────────────
  checks.push(
    check(
      "FOURNISSEUR_NOM",
      "Raison sociale du fournisseur",
      "BLOQUANT",
      !isBlank(invoice.fournisseurNom),
      "La raison sociale de l'émetteur est absente ou illisible.",
    ),
  );

  const niu = invoice.fournisseurNiu?.trim();
  if (isBlank(niu)) {
    checks.push(
      check(
        "FOURNISSEUR_NIU",
        "NIU du fournisseur",
        "BLOQUANT",
        false,
        "Sans NIU du fournisseur, la TVA n'est pas récupérable.",
      ),
    );
  } else {
    checks.push(
      check(
        "FOURNISSEUR_NIU",
        "NIU du fournisseur",
        "BLOQUANT",
        NIU_PATTERN.test(niu!),
        `Le NIU « ${niu} » ne respecte pas le format attendu (une lettre, 12 chiffres, une lettre).`,
      ),
    );
  }

  checks.push(
    check(
      "FOURNISSEUR_RCCM",
      "Numéro de registre du commerce (RCCM)",
      "AVERTISSEMENT",
      !isBlank(invoice.fournisseurRccm),
      "Mention obligatoire sur une facture normalisée.",
    ),
    check(
      "FOURNISSEUR_ADRESSE",
      "Adresse du fournisseur",
      "AVERTISSEMENT",
      !isBlank(invoice.fournisseurAdresse),
      "Mention obligatoire sur une facture normalisée.",
    ),
    check(
      "REGIME_FISCAL",
      "Régime fiscal de l'émetteur",
      "AVERTISSEMENT",
      !isBlank(invoice.regimeFiscal),
      "Le régime fiscal conditionne le droit à déduction: à vérifier manuellement.",
    ),
    check(
      "CENTRE_IMPOTS",
      "Centre des impôts de rattachement",
      "INFO",
      !isBlank(invoice.centreImpots),
    ),
  );

  // ─── Identification du destinataire ─────────────────────────────────────
  // Sur un achat, le NIU du client conditionne la déduction de la TVA.
  checks.push(
    check(
      "CLIENT_NIU",
      "NIU du client",
      isAchat ? "BLOQUANT" : "AVERTISSEMENT",
      !isBlank(invoice.clientNiu),
      isAchat
        ? "Le NIU du destinataire doit figurer sur la facture pour ouvrir droit à déduction."
        : "Mention attendue pour une facture entre assujettis.",
    ),
  );

  // ─── Identification de la pièce ─────────────────────────────────────────
  checks.push(
    check(
      "NUMERO_FACTURE",
      "Numéro de facture",
      "BLOQUANT",
      !isBlank(invoice.numeroFacture),
      "Une facture doit porter un numéro séquentiel.",
    ),
  );

  const dateOk = !isBlank(invoice.dateFacture) && !Number.isNaN(Date.parse(invoice.dateFacture!));
  checks.push(
    check(
      "DATE_FACTURE",
      "Date de facture",
      "BLOQUANT",
      dateOk,
      "La date est absente ou illisible.",
    ),
  );

  // Rattachement à l'exercice: une facture hors période n'a pas à y être
  // comptabilisée, c'est une source classique de redressement.
  if (dateOk && exerciceRange) {
    const d = new Date(invoice.dateFacture!);
    const dansExercice = d >= exerciceRange.start && d <= exerciceRange.end;
    checks.push(
      check(
        "DATE_DANS_EXERCICE",
        "Date comprise dans l'exercice",
        "AVERTISSEMENT",
        dansExercice,
        `La facture du ${invoice.dateFacture} est hors de l'exercice ` +
          `(${exerciceRange.start.toISOString().slice(0, 10)} → ${exerciceRange.end.toISOString().slice(0, 10)}).`,
      ),
    );
  }

  // ─── Mentions de facturation ────────────────────────────────────────────
  checks.push(
    check(
      "FACTURE_NORMALISEE",
      "Mention de facture normalisée",
      "AVERTISSEMENT",
      invoice.mentionFactureNormalisee === true,
      "La mention de facture normalisée (ou le timbre) n'a pas été détectée.",
    ),
    check(
      "DETAIL_LIGNES",
      "Détail des biens ou services",
      "AVERTISSEMENT",
      invoice.lignes.length > 0,
      "Aucune ligne de détail n'a pu être lue: la nature de l'opération doit être justifiée.",
    ),
  );

  // ─── Cohérence arithmétique ─────────────────────────────────────────────
  // C'est ce bloc qui rattrape une erreur de lecture de l'IA avant qu'elle ne
  // devienne une écriture: les montants doivent se recouper entre eux.
  const { montantHT: ht, montantTVA: tva, montantTTC: ttc } = invoice;

  checks.push(
    check(
      "MONTANTS_PRESENTS",
      "Montants HT, TVA et TTC lisibles",
      "BLOQUANT",
      ht !== null && tva !== null && ttc !== null,
      "Au moins un des montants (HT, TVA, TTC) n'a pas pu être lu.",
    ),
  );

  if (ht !== null && tva !== null && ttc !== null) {
    const ecart = Math.abs(ht + tva - ttc);
    checks.push(
      check(
        "COHERENCE_HT_TVA_TTC",
        "HT + TVA = TTC",
        "BLOQUANT",
        ecart <= TOLERANCE_MONTANT,
        `Écart de ${ecart.toFixed(2)} : ${ht} + ${tva} ≠ ${ttc}. ` +
          "Montants à vérifier sur la pièce avant toute comptabilisation.",
      ),
    );

    // Le taux effectif doit correspondre au taux légal, sauf opération
    // exonérée ou export (TVA nulle), qui restent des cas légitimes.
    if (ht > 0) {
      const tauxEffectif = (tva / ht) * 100;
      const exonere = Math.abs(tva) < TOLERANCE_MONTANT;
      checks.push(
        check(
          "TAUX_TVA",
          `Taux de TVA (${TAUX_TVA_CAMEROUN} %)`,
          "AVERTISSEMENT",
          exonere || Math.abs(tauxEffectif - TAUX_TVA_CAMEROUN) <= TOLERANCE_TAUX,
          exonere
            ? undefined
            : `Taux constaté ${tauxEffectif.toFixed(2)} % au lieu de ${TAUX_TVA_CAMEROUN} %. ` +
              "Vérifier s'il s'agit d'une exonération ou d'une erreur de facturation.",
        ),
      );
    }
  }

  // Somme des lignes = total HT, lorsque les lignes ont pu être lues.
  const lignesChiffrees = invoice.lignes.filter((l) => l.montantHT !== null);
  if (ht !== null && lignesChiffrees.length > 0) {
    const sommeLignes = lignesChiffrees.reduce((s, l) => s + (l.montantHT || 0), 0);
    const ecart = Math.abs(sommeLignes - ht);
    checks.push(
      check(
        "COHERENCE_LIGNES",
        "Somme des lignes = total HT",
        "AVERTISSEMENT",
        ecart <= TOLERANCE_MONTANT,
        `Somme des lignes ${sommeLignes.toFixed(2)} ≠ total HT ${ht}. ` +
          "Des lignes ont pu échapper à la lecture.",
      ),
    );
  }

  const blocking = checks.filter((c) => c.severity === "BLOQUANT" && !c.passed);
  const warnings = checks.filter((c) => c.severity === "AVERTISSEMENT" && !c.passed);

  // La TVA n'est déductible que si aucune mention bloquante ne manque et que
  // les montants se recoupent.
  const tvaDeductible = blocking.length === 0;

  return {
    checks,
    conforme: blocking.length === 0,
    tvaDeductible,
    blockingCount: blocking.length,
    warningCount: warnings.length,
  };
}
