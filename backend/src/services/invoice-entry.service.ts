// src/services/invoice-entry.service.ts
//
// Étape 2: proposition d'écriture à partir d'une facture extraite.
//
// L'imputation est décidée par une table de règles, pas par l'IA: le modèle
// a seulement transcrit la facture, il ne choisit aucun compte. Chaque ligne
// proposée porte sa justification, et l'écriture n'est JAMAIS comptabilisée
// automatiquement — elle est soumise au comptable.
import {
  ConformityReport,
  ExtractedInvoice,
  ProposedEntry,
  ProposedEntryLine,
} from "../types/invoice.types";
import { planComptableService } from "./plan-comptable.service";

/**
 * Règles d'imputation de la charge, par nature d'opération (référentiel
 * OHADA). La correspondance se fait sur des mots-clés relevés dans la nature
 * de l'opération ou les libellés de lignes.
 *
 * Volontairement conservatrice: en l'absence de correspondance, on retombe
 * sur un compte générique et on émet une réserve, plutôt que de deviner.
 */
interface ChargeRule {
  compte: string;
  libelle: string;
  motsCles: string[];
}

const REGLES_CHARGES: ChargeRule[] = [
  { compte: "6011", libelle: "Achats de marchandises", motsCles: ["marchandise", "revente"] },
  { compte: "6021", libelle: "Achats de matières premières", motsCles: ["matière première", "matiere premiere"] },
  { compte: "6041", libelle: "Achats de matières consommables", motsCles: ["consommable"] },
  { compte: "6051", libelle: "Achats d'eau", motsCles: ["eau", "camwater"] },
  { compte: "6052", libelle: "Achats d'électricité", motsCles: ["électricité", "electricite", "eneo"] },
  { compte: "6055", libelle: "Fournitures de bureau", motsCles: ["fourniture de bureau", "papeterie", "bureautique"] },
  { compte: "6056", libelle: "Petit matériel et outillage", motsCles: ["outillage", "petit matériel", "petit materiel"] },
  { compte: "6081", libelle: "Achats d'emballages", motsCles: ["emballage"] },
  { compte: "6122", libelle: "Transports sur ventes", motsCles: ["transport", "livraison", "fret"] },
  { compte: "6221", libelle: "Locations et charges locatives", motsCles: ["location", "loyer", "bail"] },
  { compte: "6241", libelle: "Entretien, réparations et maintenance", motsCles: ["entretien", "réparation", "reparation", "maintenance"] },
  { compte: "6251", libelle: "Primes d'assurance", motsCles: ["assurance"] },
  { compte: "6271", libelle: "Publicité et relations publiques", motsCles: ["publicité", "publicite", "marketing", "communication"] },
  { compte: "6281", libelle: "Frais de télécommunications", motsCles: ["télécom", "telecom", "internet", "téléphone", "telephone", "orange", "mtn", "camtel"] },
  { compte: "6311", libelle: "Frais bancaires", motsCles: ["frais bancaire", "commission bancaire", "agios"] },
  { compte: "6321", libelle: "Rémunérations d'intermédiaires et de conseils", motsCles: ["honoraire", "conseil", "consultant", "avocat", "expertise", "audit"] },
  { compte: "6161", libelle: "Transports de plis", motsCles: ["courrier", "pli", "dhl"] },
  { compte: "6261", libelle: "Études, recherches et documentation", motsCles: ["étude", "etude", "documentation", "formation"] },
  { compte: "6051", libelle: "Carburant", motsCles: ["carburant", "essence", "gasoil", "total energies", "tradex"] },

  // Charges sociales et de personnel. Un bordereau CNPS ou un etat de
  // salaires n'est pas une facture au sens strict, mais il se scanne de la
  // meme facon et doit s'imputer correctement.
  { compte: "6641", libelle: "Charges sociales (CNPS)", motsCles: ["cnps", "prevoyance sociale", "cotisation sociale", "securite sociale", "caisse nationale"] },
  { compte: "6611", libelle: "Remunerations du personnel", motsCles: ["salaire", "bulletin de paie", "etat de paie", "remuneration"] },
  { compte: "6631", libelle: "Indemnites forfaitaires", motsCles: ["indemnite", "prime de transport"] },

  // Impots et taxes.
  { compte: "6411", libelle: "Impots et taxes directs", motsCles: ["impot", "patente", "taxe fonciere", "contribution"] },
  { compte: "6461", libelle: "Droits d'enregistrement et de timbre", motsCles: ["timbre", "enregistrement", "droit de douane", "douane"] },

  // Services divers frequents.
  { compte: "6245", libelle: "Entretien de vehicules", motsCles: ["vidange", "pneu", "garage", "mecanique"] },
  { compte: "6181", libelle: "Voyages et deplacements", motsCles: ["billet", "hotel", "mission", "deplacement", "hebergement"] },
  { compte: "6471", libelle: "Penalites et amendes fiscales", motsCles: ["penalite", "amende", "majoration"] },
];

/** Comptes de contrepartie, invariants du référentiel OHADA. */
const COMPTE_FOURNISSEUR = { numero: "4011", libelle: "Fournisseurs d'exploitation" };
const COMPTE_CLIENT = { numero: "4111", libelle: "Clients" };
const COMPTE_TVA_DEDUCTIBLE = { numero: "4452", libelle: "TVA récupérable sur achats" };
const COMPTE_TVA_COLLECTEE = { numero: "4431", libelle: "TVA facturée sur ventes" };
const COMPTE_VENTE_DEFAUT = { numero: "7061", libelle: "Services vendus" };
const COMPTE_CHARGE_DEFAUT = { numero: "6058", libelle: "Autres achats" };
const COMPTE_TIMBRE = { numero: "6461", libelle: "Droits d'enregistrement et de timbre" };

/** Minuscules sans accents, pour que « électricité » et « electricite » matchent. */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Cherche la règle dont un mot-clé apparaît dans le texte de la facture. */
function findChargeRule(invoice: ExtractedInvoice): ChargeRule | null {
  const haystack = normalize(
    [
      invoice.natureOperation ?? "",
      invoice.fournisseurNom ?? "",
      ...invoice.lignes.map((l) => l.designation),
    ].join(" "),
  );

  for (const rule of REGLES_CHARGES) {
    if (rule.motsCles.some((mot) => haystack.includes(normalize(mot)))) {
      return rule;
    }
  }
  return null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Construit l'écriture proposée.
 *
 * @param conformity utilisé pour refuser la déduction de TVA lorsque la
 * facture ne le permet pas — la TVA est alors intégrée à la charge, comme le
 * ferait un comptable.
 */
export function proposeEntry(
  invoice: ExtractedInvoice,
  conformity: ConformityReport,
): ProposedEntry {
  const lines: ProposedEntryLine[] = [];
  const reserves: string[] = [];

  const isVente = invoice.direction === "VENTE";
  const ht = invoice.montantHT ?? 0;
  const tva = invoice.montantTVA ?? 0;
  const ttc = invoice.montantTTC ?? ht + tva;
  const timbre = invoice.droitTimbre ?? 0;

  if (invoice.direction === null) {
    reserves.push(
      "Le sens de la facture (achat ou vente) n'a pas pu être déterminé: un achat a été supposé.",
    );
  }

  if (isVente) {
    // Client (TTC) au débit, produit et TVA collectée au crédit.
    lines.push({
      compte: COMPTE_CLIENT.numero,
      libelleCompte: COMPTE_CLIENT.libelle,
      debit: round2(ttc),
      credit: 0,
      justification: `Créance sur ${invoice.clientNom ?? "le client"} pour le montant TTC.`,
    });
    lines.push({
      compte: COMPTE_VENTE_DEFAUT.numero,
      libelleCompte: COMPTE_VENTE_DEFAUT.libelle,
      debit: 0,
      credit: round2(ht),
      justification:
        "Compte de produit générique: la ventilation par nature de vente reste à préciser.",
    });
    reserves.push(
      "Le compte de produit (701 marchandises, 702 produits finis, 706 services…) doit être confirmé.",
    );
    if (tva !== 0) {
      lines.push({
        compte: COMPTE_TVA_COLLECTEE.numero,
        libelleCompte: COMPTE_TVA_COLLECTEE.libelle,
        debit: 0,
        credit: round2(tva),
        justification: "TVA facturée au client.",
      });
    }
  } else {
    // Achat: charge et TVA au débit, fournisseur au crédit.
    const rule = findChargeRule(invoice);
    const compteCharge = rule ?? {
      compte: COMPTE_CHARGE_DEFAUT.numero,
      libelle: COMPTE_CHARGE_DEFAUT.libelle,
      motsCles: [],
    };

    if (!rule) {
      reserves.push(
        `Aucune règle d'imputation n'a reconnu la nature de l'opération: ` +
          `le compte générique ${COMPTE_CHARGE_DEFAUT.numero} a été retenu, à corriger.`,
      );
    }

    // Lorsque la TVA n'est pas déductible, elle n'est pas isolée: elle
    // augmente le coût de la charge.
    const tvaDeductible = conformity.tvaDeductible && tva !== 0;
    const montantCharge = tvaDeductible ? ht : ht + tva;

    lines.push({
      compte: compteCharge.compte,
      libelleCompte: compteCharge.libelle,
      debit: round2(montantCharge),
      credit: 0,
      justification: rule
        ? `Nature reconnue à partir du libellé de la facture.`
        : `Compte générique faute de correspondance.`,
    });

    if (tvaDeductible) {
      lines.push({
        compte: COMPTE_TVA_DEDUCTIBLE.numero,
        libelleCompte: COMPTE_TVA_DEDUCTIBLE.libelle,
        debit: round2(tva),
        credit: 0,
        justification: "TVA récupérable: la facture porte les mentions requises.",
      });
    } else if (tva !== 0) {
      reserves.push(
        "TVA non déductible (mentions obligatoires manquantes): elle a été incorporée à la charge.",
      );
    }

    if (timbre !== 0) {
      lines.push({
        compte: COMPTE_TIMBRE.numero,
        libelleCompte: COMPTE_TIMBRE.libelle,
        debit: round2(timbre),
        credit: 0,
        justification: "Droit de timbre porté sur la facture.",
      });
    }

    lines.push({
      compte: COMPTE_FOURNISSEUR.numero,
      libelleCompte: COMPTE_FOURNISSEUR.libelle,
      debit: 0,
      credit: round2(ttc + timbre),
      justification: `Dette envers ${invoice.fournisseurNom ?? "le fournisseur"} pour le montant TTC.`,
    });
  }

  // Contrôle final: une écriture déséquilibrée ne doit jamais être proposée
  // sans que le comptable en soit averti explicitement.
  const totalDebit = round2(lines.reduce((s, l) => s + l.debit, 0));
  const totalCredit = round2(lines.reduce((s, l) => s + l.credit, 0));
  const equilibree = Math.abs(totalDebit - totalCredit) < 0.01;

  if (!equilibree) {
    reserves.push(
      `Écriture déséquilibrée (débit ${totalDebit} / crédit ${totalCredit}): ` +
        "les montants lus sur la facture sont incohérents.",
    );
  }

  if (!conformity.conforme) {
    reserves.push(
      `${conformity.blockingCount} mention(s) obligatoire(s) manquante(s): ` +
        "la pièce ne devrait pas être comptabilisée en l'état.",
    );
  }

  // Les comptes proposés doivent exister au plan comptable OHADA.
  for (const line of lines) {
    const validation = planComptableService.validateAccount(line.compte, line.libelleCompte);
    if (!validation.valid && validation.error) {
      reserves.push(`Compte ${line.compte}: ${validation.error}`);
    }
  }

  return {
    journal: isVente ? "VT" : "AC",
    date: invoice.dateFacture,
    libelle: [
      invoice.numeroFacture ? `Facture ${invoice.numeroFacture}` : "Facture",
      isVente ? invoice.clientNom : invoice.fournisseurNom,
    ]
      .filter(Boolean)
      .join(" — "),
    lines,
    totalDebit,
    totalCredit,
    equilibree,
    reserves,
  };
}
