import { useState, useMemo, useRef, SetStateAction, useEffect } from "react";
import { revueFiscalService, RevueFiscalCompanyWithStates, RevueFiscalEval, RevueFiscalPriority } from "../services/revue-fiscal.service";

type RiskLevel = "FAIBLE" | "MODERE" | "ELEVE";
type View = "companies" | "review" | "plan";

interface QuestionState {
  eval: RevueFiscalEval | null;
  note: string;
  renvoi: string;
  priority: RevueFiscalPriority;
}
interface Question {
  id: string;
  text: string;
  isNew2026?: boolean;
  ref?: string;
}
interface SubSection {
  id: string;
  title: string;
  badge?: string;
  info?: string;
  questions: Question[];
}
interface Section {
  id: string;
  number: string;
  title: string;
  subsections: SubSection[];
}

const SECTIONS: Section[] = [
  {
    id: "s00",
    number: "00",
    title: "Renseignements généraux & organisation fiscale",
    subsections: [
      {
        id: "s00-1",
        title: "Identification de l'entreprise",
        questions: [
          {
            id: "00.1.01",
            text: "Dénomination sociale exacte (telle que figurant aux statuts)",
          },
          {
            id: "00.1.02",
            text: "Forme juridique (SA, SARL, SNC, SCS, GIE, EP, etc.)",
          },
          {
            id: "00.1.03",
            text: "Numéro d'Identifiant Unique (NIU) — cohérence avec les déclarations",
          },
          {
            id: "00.1.04",
            text: "Capital social (montant libéré / non libéré)",
          },
          {
            id: "00.1.05",
            text: "Résultats comptables et fiscaux des 3 derniers exercices",
          },
          {
            id: "00.1.06",
            text: "Déficits reportables et amortissements différés : montants par exercice d'origine",
          },
          {
            id: "00.1.07",
            text: "L'entreprise fait-elle partie d'un groupe ? (organigramme au dossier)",
          },
          {
            id: "00.1.08",
            text: "Existence d'un pacte d'actionnaires ou convention de vote ?",
          },
        ],
      },
      {
        id: "s00-2",
        title: "Données fiscales formelles",
        questions: [
          {
            id: "00.2.01",
            text: "Régime d'imposition applicable : Libératoire / Simplifié / Réel",
            ref: "Art. C38 ss CGI",
          },
          {
            id: "00.2.02",
            text: "Centre des impôts compétent (Centre Régional / CIME / DGE)",
          },
          {
            id: "00.2.03",
            text: "Adhésion à un Centre de Gestion Agréé (CGA) ?",
          },
          {
            id: "00.2.04",
            text: "Caractère libératoire de l'IGS correctement appliqué ?",
            isNew2026: true,
            ref: "Art. C38–C44 CGI 2026",
          },
        ],
      },
      {
        id: "s00-3",
        title: "Historique fiscal & contentieux",
        questions: [
          {
            id: "00.3.01",
            text: "Contrôles fiscaux au cours des 5 derniers exercices ?",
          },
          {
            id: "00.3.02",
            text: "Niveau de la procédure contentieuse en cours",
          },
          {
            id: "00.3.03",
            text: "Sursis de paiement demandé ? Garanties offertes ?",
          },
          {
            id: "00.3.04",
            text: "Transaction fiscale (réduction 80 %) activée pour créances antérieures au 31/12/2023 ?",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s00-4",
        title: "Organisation service fiscal",
        questions: [
          {
            id: "00.4.01",
            text: "Service fiscal interne existant ? Rattachement hiérarchique ?",
          },
          {
            id: "00.4.02",
            text: "Déclarations déposées dans les délais légaux ?",
            ref: "Art. L1 LPF",
          },
          {
            id: "00.4.03",
            text: "Mises en demeure ou pénalités de retard reçues ?",
          },
          {
            id: "00.4.04",
            text: "PV du CA et AGO transmis à l'administration fiscale ?",
          },
        ],
      },
      {
        id: "s00-5",
        title: "Revue fiscale obligatoire",
        badge: "NOUVEAU 2026",
        info: "Art. L6 quater CGI — CA > 1 milliard FCFA",
        questions: [
          {
            id: "00.5.01",
            text: "CA > 1 milliard FCFA ? (vérifier seuil)",
            isNew2026: true,
          },
          {
            id: "00.5.02",
            text: "Rapport de revue fiscale annexé à la DSF ?",
            isNew2026: true,
          },
          {
            id: "00.5.03",
            text: "Conseil fiscal agréé signataire inscrit à l'ordre ?",
            isNew2026: true,
          },
          {
            id: "00.5.04",
            text: "Recommandations de la revue précédente mises en œuvre ?",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s00-6",
        title: "Obligations déclaratives renforcées",
        badge: "NOUVEAU 2026",
        questions: [
          {
            id: "00.6.01",
            text: "Données de transactions transmises en temps réel à l'administration ?",
            isNew2026: true,
            ref: "Art. L8 sexies CGI",
          },
          {
            id: "00.6.02",
            text: "Système d'information permet la transmission instantanée des données ?",
            isNew2026: true,
          },
          {
            id: "00.6.03",
            text: "Déclaration préalable de cessation souscrite 3 mois à l'avance ?",
            isNew2026: true,
            ref: "Art. 95 bis CGI",
          },
          {
            id: "00.6.04",
            text: "Nouvelles amendes forfaitaires pour défaut de déclaration provisionnées ?",
            isNew2026: true,
            ref: "Art. L97 LPF",
          },
        ],
      },
    ],
  },
  {
    id: "s01",
    number: "01",
    title: "Obligations comptables et formelles",
    subsections: [
      {
        id: "s01-1",
        title: "Organisation de la comptabilité",
        questions: [
          {
            id: "01.1.01",
            text: "Logiciel comptable utilisé conforme SYSCOHADA révisé ?",
          },
          {
            id: "01.1.02",
            text: "Migration de données suite à changement de logiciel vérifiée ?",
          },
          {
            id: "01.1.03",
            text: "Séparation des exercices correctement appliquée (cut-off) ?",
          },
          {
            id: "01.1.04",
            text: "Procédure de clôture mensuelle et annuelle documentée ?",
          },
        ],
      },
      {
        id: "s01-2",
        title: "Régularité & probité",
        questions: [
          {
            id: "01.2.01",
            text: "Livres légaux (journal, inventaire, grand-livre) tenus à jour ?",
          },
          {
            id: "01.2.02",
            text: "Comptabilité informatisée conforme aux nouvelles exigences CGI 2026 ?",
            isNew2026: true,
            ref: "Art. L30 bis LPF",
          },
          {
            id: "01.2.03",
            text: "Conservation des pièces justificatives originales (minimum 10 ans) ?",
          },
          {
            id: "01.2.04",
            text: "États de rapprochements bancaires établis mensuellement ?",
          },
          {
            id: "01.2.05",
            text: "Comptes annuels certifiés par le CAC dans les délais ?",
          },
        ],
      },
      {
        id: "s01-3",
        title: "DSF et liasses fiscales",
        questions: [
          { id: "01.3.01", text: "DSF déposée dans les délais ?" },
          {
            id: "01.3.02",
            text: "Cohérence DSF / états financiers certifiés CAC ?",
          },
          {
            id: "01.3.03",
            text: "Tableaux annexes DSF (T12 provisions, T22 réintégrations) correctement remplis ?",
          },
          {
            id: "01.3.04",
            text: "Résultat fiscal (T22 DSF) correctement calculé ?",
          },
          {
            id: "01.3.05",
            text: "Déficits fiscaux reportés correctement imputés (limite 5 ans) ?",
          },
        ],
      },
    ],
  },
  {
    id: "s02",
    number: "02",
    title: "Immobilisations incorporelles et corporelles",
    subsections: [
      {
        id: "s02-1",
        title: "Inventaire et gestion",
        questions: [
          {
            id: "02.1.01",
            text: "Fichier des immobilisations informatisé et à jour ?",
          },
          {
            id: "02.1.02",
            text: "Rapprochement fichier / comptes comptables effectué régulièrement ?",
          },
          {
            id: "02.1.03",
            text: "Mises au rebut documentées (PV de destruction) ?",
          },
          {
            id: "02.1.04",
            text: "Acquisition de véhicules au gaz naturel ? Exonérations 2026 appliquées ?",
            isNew2026: true,
            ref: "Art. 228 septies CGI",
          },
        ],
      },
      {
        id: "s02-2",
        title: "Amortissements",
        questions: [
          {
            id: "02.2.01",
            text: "Taux d'amortissement conformes à la réglementation ?",
            ref: "Art. 7D CGI",
          },
          {
            id: "02.2.02",
            text: "Amortissements excédentaires réintégrés au résultat fiscal ?",
          },
          {
            id: "02.2.03",
            text: "Durée d'amortissement fiscal des biens en crédit-bail alignée sur durée du contrat ?",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s02-3",
        title: "Cessions d'immobilisations",
        questions: [
          {
            id: "02.3.01",
            text: "Plus-values de cession correctement calculées et imposées ?",
          },
          {
            id: "02.3.02",
            text: "Plus-values de cession d'actions imposées selon nouvelles règles ?",
            isNew2026: true,
            ref: "Art. 42 CGI 2026",
          },
          {
            id: "02.3.03",
            text: "Régularisation TVA effectuée pour cession avant 5 ans ?",
          },
        ],
      },
    ],
  },
  {
    id: "s05",
    number: "05",
    title: "Créances et dettes — Comptes d'associés",
    subsections: [
      {
        id: "s05-1",
        title: "Créances clients",
        questions: [
          {
            id: "05.1.01",
            text: "Rattachement des créances acquises respecté ?",
          },
          {
            id: "05.1.02",
            text: "Provisions pour dépréciation clients calculées hors taxes ?",
          },
          {
            id: "05.1.03",
            text: "Créances irrécouvrables correctement suivies ? TVA récupérée ?",
          },
        ],
      },
      {
        id: "s05-2",
        title: "Comptes courants d'associés",
        questions: [
          {
            id: "05.2.01",
            text: "Avances en compte courant à associés/dirigeants : taux d'intérêt conforme au marché ?",
          },
          {
            id: "05.2.02",
            text: "Intérêts versés sur comptes courants déductibles (conditions légales, plafond) ?",
          },
          {
            id: "05.2.03",
            text: "Intérêts reçus par associés soumis à retenue à la source ?",
          },
        ],
      },
    ],
  },
  {
    id: "s10",
    number: "10",
    title: "Charges — Relevé des frais généraux",
    subsections: [
      {
        id: "s10-1",
        title: "Conditions générales de déductibilité",
        questions: [
          {
            id: "10.1.01",
            text: "Relevé des frais généraux correctement établi et exhaustif ?",
          },
          {
            id: "10.1.02",
            text: "Pénalités et amendes fiscales exclues des charges déductibles ?",
            ref: "Art. 7A al.3 CGI",
          },
          {
            id: "10.1.03",
            text: "Pièces justificatives originales disponibles pour toutes les charges ?",
          },
        ],
      },
      {
        id: "s10-2",
        title: "Rémunérations et charges de personnel",
        questions: [
          {
            id: "10.2.01",
            text: "Rémunérations dirigeants conformes aux délibérations des organes compétents ?",
          },
          {
            id: "10.2.02",
            text: "Abattement forfaitaire de 35 % appliqué sur revenus exceptionnels ?",
            isNew2026: true,
            ref: "Art. 65 bis CGI 2026",
          },
          {
            id: "10.2.03",
            text: "Avantages en nature correctement évalués et déclarés ?",
          },
          {
            id: "10.2.04",
            text: "Indemnités kilométriques justifiées ? Cumul avec amortissement véhicule évité ?",
          },
        ],
      },
      {
        id: "s10-3",
        title: "Versements non-résidents & prix de transfert",
        questions: [
          {
            id: "10.3.01",
            text: "Versements à des non-résidents correspondent à des prestations réelles contractuelles ?",
          },
          {
            id: "10.3.02",
            text: "Retenue à la source sur versements non-résidents effectuée ?",
          },
          {
            id: "10.3.03",
            text: "Prix de pleine concurrence respecté pour transactions intra-groupe ?",
          },
          {
            id: "10.3.04",
            text: "Règles déductibilité frais d'assistance technique respectées ?",
            isNew2026: true,
            ref: "Art. 57 CGI 2026",
          },
        ],
      },
      {
        id: "s10-4",
        title: "Loyers et assurances",
        questions: [
          {
            id: "10.4.01",
            text: "Distinction entretien/réparation (charges) vs rénovation/amélioration (immobilisation) ?",
          },
          {
            id: "10.4.02",
            text: "Loyers dans le marché ? Bénéficiaires sans lien de dépendance ?",
          },
          {
            id: "10.4.03",
            text: "Précompte sur loyers calculé au nouveau taux de 10 % ?",
            isNew2026: true,
            ref: "Art. 87 CGI 2026",
          },
        ],
      },
      {
        id: "s10-5",
        title: "Précomptes numérique/télécom",
        badge: "NOUVEAU 2026",
        info: "Art. 21 et 58 CGI 2026",
        questions: [
          {
            id: "10.5.01",
            text: "Précomptes secteur télécommunications collectés et reversés ?",
            isNew2026: true,
          },
          {
            id: "10.5.02",
            text: "Précomptes plateformes numériques traités ?",
            isNew2026: true,
          },
          {
            id: "10.5.03",
            text: "Acomptes IS téléphonie/numérique alignés sur encaissements effectifs ?",
            isNew2026: true,
            ref: "Art. 21 bis CGI",
          },
        ],
      },
    ],
  },
  {
    id: "s11",
    number: "11",
    title: "Produits et TVA",
    subsections: [
      {
        id: "s11-1",
        title: "Chiffre d'affaires",
        questions: [
          {
            id: "11.1.01",
            text: "Rapprochement périodique déclarations TVA / CA comptabilisé effectué ?",
          },
          {
            id: "11.1.02",
            text: "NIU figurant sur toutes les factures de vente ?",
          },
          {
            id: "11.1.03",
            text: "Règles de rattachement à l'exercice correctement appliquées ?",
          },
        ],
      },
      {
        id: "s11-2",
        title: "TVA collectée et déductible",
        questions: [
          { id: "11.2.01", text: "TVA reversée sur créances irrécouvrables ?" },
          {
            id: "11.2.02",
            text: "Règles TVA sur factures respectées (date, n°, NIU, HT, taux, total) ?",
          },
          {
            id: "11.2.03",
            text: "Exclusions de déduction TVA respectées (véhicules tourisme, biens somptuaires) ?",
          },
        ],
      },
      {
        id: "s11-3",
        title: "Taux réduit TVA 10 %",
        badge: "NOUVEAU 2026",
        info: "Art. 142 CGI 2026 — Remplace l'exonération sur opérations immobilières sociales",
        questions: [
          {
            id: "11.3.01",
            text: "Taux réduit 10 % appliqué sur intérêts de prêts immobiliers première maison ?",
            isNew2026: true,
          },
          {
            id: "11.3.02",
            text: "Taux réduit 10 % appliqué sur ventes/locations logements sociaux par promoteurs ?",
            isNew2026: true,
          },
          {
            id: "11.3.03",
            text: "Ancien régime d'exonération correctement remplacé par taux réduit ?",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s11-4",
        title: "Droits d'accises",
        questions: [
          {
            id: "11.4.01",
            text: "Droits d'accises vins et spiritueux haut de gamme aux nouveaux tarifs 2026 ?",
            isNew2026: true,
            ref: "Art. 142(8) CGI 2026",
          },
          {
            id: "11.4.02",
            text: "Droits d'accises bière au taux antérieur (pas de relèvement) ?",
          },
        ],
      },
    ],
  },
  {
    id: "s13",
    number: "13",
    title: "IRPP — Fiscalité des personnes et obligations sociales",
    subsections: [
      {
        id: "s13-1",
        title: "IRPP sur salaires",
        questions: [
          {
            id: "13.1.01",
            text: "Calcul IRPP conforme au barème légal (tranches et taux) ?",
          },
          {
            id: "13.1.02",
            text: "IRPP retenu à la source reversé dans les délais (avant le 15 du mois suivant) ?",
          },
          {
            id: "13.1.03",
            text: "Abattement 35 % (relevé de 25 %) sur revenus exceptionnels correctement appliqué ?",
            isNew2026: true,
            ref: "Art. 65 bis CGI 2026",
          },
          {
            id: "13.1.04",
            text: "DIPE déposée dans les délais et concordante avec bulletins de paie ?",
          },
        ],
      },
      {
        id: "s13-2",
        title: "Cotisations sociales",
        questions: [
          {
            id: "13.2.01",
            text: "Cotisations CNPS (part patronale et salariale) correctement calculées ?",
          },
          {
            id: "13.2.02",
            text: "CFC, FNE, taxe d'apprentissage correctement calculés et déclarés ?",
          },
          {
            id: "13.2.03",
            text: "Rapprochement livre de paye / comptabilité / déclarations sociales effectué ?",
          },
        ],
      },
    ],
  },
  {
    id: "s14",
    number: "14",
    title: "Retenues à la source et TSR",
    subsections: [
      {
        id: "s14-1",
        title: "Taxe Spéciale sur les Revenus (TSR)",
        questions: [
          {
            id: "14.1.01",
            text: "TSR correctement retenue et reversée sur paiements à non-résidents ?",
          },
          {
            id: "14.1.02",
            text: "Certificats de résidence fiscale des bénéficiaires étrangers disponibles ?",
          },
          {
            id: "14.1.03",
            text: "Déclarations mensuelles TSR déposées dans les délais ?",
          },
        ],
      },
      {
        id: "s14-2",
        title: "Retenues à la source honoraires",
        questions: [
          {
            id: "14.2.01",
            text: "Retenue à la source 5 % sur honoraires/commissions effectuée et reversée ?",
            ref: "Art. 92 bis CGI",
          },
          {
            id: "14.2.02",
            text: "Retenue à la source sur loyers au nouveau taux 10 % ?",
            isNew2026: true,
            ref: "Art. 87 CGI 2026",
          },
        ],
      },
      {
        id: "s14-3",
        title: "Précompte IS",
        questions: [
          {
            id: "14.3.01",
            text: "Acomptes IS (précompte achats, importations) correctement calculés et reversés ?",
          },
          {
            id: "14.3.02",
            text: "Solde IS fin d'exercice correctement calculé (acomptes déduits) ?",
          },
        ],
      },
    ],
  },
  {
    id: "s15",
    number: "15",
    title: "Transition écologique — Taxes environnementales ★",
    subsections: [
      {
        id: "s15-1",
        title: "Mesures fiscales écologiques",
        badge: "NOUVEAU 2026",
        info: "Art. 124 quater à 124 octies et 228 septies CGI 2026",
        questions: [
          {
            id: "15.1.01",
            text: "Taxes environnementales LF 2026 correctement calculées et déclarées ?",
            isNew2026: true,
            ref: "Art. 124 quater CGI",
          },
          {
            id: "15.1.02",
            text: "Exonérations fiscales pour véhicules au gaz naturel / énergie propre appliquées ?",
            isNew2026: true,
            ref: "Art. 228 septies CGI",
          },
          {
            id: "15.1.03",
            text: "Mesures fiscales en faveur des personnes handicapées appliquées ?",
            isNew2026: true,
            ref: "Art. 149(2) CGI 2026",
          },
        ],
      },
    ],
  },
  {
    id: "s16",
    number: "16",
    title: "Synthèse — Risques et recommandations",
    subsections: [
      {
        id: "s16-1",
        title: "Évaluation globale du risque",
        questions: [
          {
            id: "16.1.01",
            text: "Niveau global de risque fiscal estimé (faible / modéré / élevé) ?",
          },
          {
            id: "16.1.02",
            text: "Principaux risques provisionnés dans les comptes ?",
          },
          {
            id: "16.1.03",
            text: "Risques de redressement sur exercices non prescrits ? Montant estimé ?",
          },
          { id: "16.1.04", text: "Positions fiscales adoptées justifiables ?" },
        ],
      },
      {
        id: "s16-2",
        title: "Prescription",
        questions: [
          {
            id: "16.2.01",
            text: "Prescription 3 ans opposable pour exercices N-3 et antérieurs ?",
            ref: "Art. L50 LPF",
          },
          {
            id: "16.2.02",
            text: "Actes interruptifs de prescription établis par l'administration ?",
          },
        ],
      },
      {
        id: "s16-3",
        title: "Plan d'action",
        questions: [
          {
            id: "16.3.01",
            text: "Recommandations de mise en conformité formulées par le réviseur ?",
          },
          {
            id: "16.3.02",
            text: "Plan d'action avec délais et responsables établi et validé ?",
          },
          {
            id: "16.3.03",
            text: "Erreurs matérielles feront-elles l'objet de déclarations rectificatives ?",
          },
          {
            id: "16.3.04",
            text: "Formation fiscale du personnel nécessaire ?",
          },
        ],
      },
    ],
  },
];

const EC = {
  NA: { label: "N.A.", color: "#6b7280", bg: "#f3f4f6", icon: "—" },
  OK: { label: "O.K.", color: "#15803d", bg: "#f0fdf4", icon: "✓" },
  ERR_MAT: { label: "ERR.MAT.", color: "#c2410c", bg: "#fff7ed", icon: "!" },
  ANOMALIE: { label: "ANOMALIE", color: "#b91c1c", bg: "#fef2f2", icon: "✕" },
};

const defQS = (): QuestionState => ({
  eval: null,
  note: "",
  renvoi: "",
  priority: "normale",
});

function getStats(
  cid: string,
  states: Record<string, Record<string, QuestionState>>,
) {
  const cs = states[cid] ?? {};
  const all: string[] = [];
  SECTIONS.forEach((s) =>
    s.subsections.forEach((sub) =>
      sub.questions.forEach((q) => all.push(q.id)),
    ),
  );
  const answered = all.filter((id) => cs[id]?.eval != null);
  return {
    total: all.length,
    answered: answered.length,
    anomalies: all.filter((id) => cs[id]?.eval === "ANOMALIE").length,
    erreurs: all.filter((id) => cs[id]?.eval === "ERR_MAT").length,
    ok: all.filter((id) => cs[id]?.eval === "OK").length,
    na: all.filter((id) => cs[id]?.eval === "NA").length,
    pct: Math.round((answered.length / all.length) * 100),
  };
}

// ─────────────────────────────────────────────
export default function RevueFiscal() {
  const [view, setView] = useState<View>("companies");
  const [companies, setCompanies] = useState<RevueFiscalCompanyWithStates[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSec, setActiveSec] = useState("s00");
  const [states, setStates] = useState<
    Record<string, Record<string, QuestionState>>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Partial<RevueFiscalCompanyWithStates>>({});
  const [planFilter, setPlanFilter] = useState<"all" | "anomalies" | "erreurs">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await revueFiscalService.getCompanies();

        // Convert to local state format
        const companiesData = data.map(company => ({
          ...company,
          sector: company.sector || "",
          exercice: company.exercice || "",
          reviseur: company.reviseur || "",
          chef: company.chef || "",
          niu: company.niu || "",
        }));

        setCompanies(companiesData);

        // Build states from questionStates
        const statesData: Record<string, Record<string, QuestionState>> = {};
        data.forEach(company => {
          statesData[company.id] = {};
          company.questionStates.forEach(qs => {
            statesData[company.id][qs.questionId] = {
              eval: qs.eval || null,
              note: qs.note || "",
              renvoi: qs.renvoi || "",
              priority: qs.priority,
            };
          });
        });
        setStates(statesData);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
        console.error("Error loading companies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const company = companies.find((c) => c.id === activeId);
  const cs = activeId ? (states[activeId] ?? {}) : {};
  const getQS = (id: string) => cs[id] ?? defQS();
  const setQS = async (id: string, p: Partial<QuestionState>) => {
    if (!activeId) return;

    const currentState = getQS(id);
    const updatedState = { ...currentState, ...p };

    // Update local state immediately for UI responsiveness
    setStates((prev) => ({
      ...prev,
      [activeId]: { ...(prev[activeId] ?? {}), [id]: updatedState },
    }));

    // Save to API
    try {
      await revueFiscalService.updateQuestionState({
        companyId: activeId,
        questionId: id,
        eval: updatedState.eval || undefined,
        note: updatedState.note,
        renvoi: updatedState.renvoi,
        priority: updatedState.priority,
      });
    } catch (err: any) {
      console.error("Error saving question state:", err);
      // Revert local state on error
      setStates((prev) => ({
        ...prev,
        [activeId]: { ...(prev[activeId] ?? {}), [id]: currentState },
      }));
      setError(err.message || "Erreur lors de la sauvegarde");
    }
  };

  const createCompany = async () => {
    if (!draft.name) return;

    try {
      setSaving(true);
      setError(null);

      const newCompany = await revueFiscalService.createCompany({
        name: draft.name,
        sector: draft.sector,
        exercice: draft.exercice,
        reviseur: draft.reviseur,
        chef: draft.chef,
        niu: draft.niu,
      });

      // Convert to local format
      const companyWithStates: RevueFiscalCompanyWithStates = {
        ...newCompany,
        sector: newCompany.sector || "",
        exercice: newCompany.exercice || "",
        reviseur: newCompany.reviseur || "",
        chef: newCompany.chef || "",
        niu: newCompany.niu || "",
        questionStates: [],
      };

      setCompanies((p) => [...p, companyWithStates]);
      setStates((prev) => ({ ...prev, [newCompany.id]: {} }));

      setDraft({});
      setShowModal(false);
      setActiveId(newCompany.id);
      setActiveSec("s00");
      setView("review");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'entreprise");
      console.error("Error creating company:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f2f1ed",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 16 }}>Chargement...</div>
          <div style={{ width: 40, height: 40, border: "4px solid #e0dfd8", borderTop: "4px solid #E85D04", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f2f1ed",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 18, color: "#b91c1c", marginBottom: 16 }}>Erreur</div>
          <div style={{ color: "#666", marginBottom: 20 }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#E85D04",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  if (view === "companies") {
    return (
      <CompaniesView
        companies={companies}
        states={states}
        onOpen={(id: SetStateAction<string | null>) => {
          setActiveId(id);
          setActiveSec("s00");
          setView("review");
        }}
        onPlan={(id: SetStateAction<string | null>) => {
          setActiveId(id);
          setView("plan");
        }}
        onNew={() => setShowModal(true)}
        showModal={showModal}
        draft={draft}
        setDraft={setDraft}
        onCreate={createCompany}
        saving={saving}
        onCloseModal={() => {
          setShowModal(false);
          setDraft({});
        }}
      />
    );
  }
  if (view === "plan" && company) {
    return (
      <PlanView
        company={company}
        cs={cs}
        stats={getStats(company.id, states)}
        filter={planFilter}
        setFilter={setPlanFilter}
        onBack={() => setView("companies")}
        onReview={() => {
          setActiveSec("s00");
          setView("review");
        }}
      />
    );
  }
  return (
    <ReviewView
      company={company!}
      activeSec={activeSec}
      setActiveSec={setActiveSec}
      getQS={getQS}
      setQS={setQS}
      stats={getStats(company?.id ?? "", states)}
      cs={cs}
      onBack={() => setView("companies")}
      onPlan={() => setView("plan")}
    />
  );
}

// ─────────────────────────────────────────────
function CompaniesView({
  companies,
  states,
  onOpen,
  onPlan,
  onNew,
  showModal,
  draft,
  setDraft,
  onCreate,
  saving,
  onCloseModal,
}: any) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`}</style>
      {/* NAV */}
      <nav
        style={{
          background: "#111",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "#E85D04",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 15,
              color: "#fff",
              letterSpacing: "0.02em",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            RF
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: "-0.02em",
              }}
            >
              Revue Fiscale
            </div>
            <div
              style={{
                color: "#555",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              CGI 2026 — Loi N°2025/012
            </div>
          </div>
        </div>
        <button
          onClick={onNew}
          style={{
            background: "#E85D04",
            color: "#fff",
            border: "none",
            padding: "11px 26px",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1, marginTop: -1 }}>+</span>{" "}
          Nouvelle mission
        </button>
      </nav>

      <div style={{ padding: "44px 48px", maxWidth: 1200, margin: "0 auto" }}>
        {companies.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 100,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: "#e8e7e3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                marginBottom: 24,
              }}
            >
              📋
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#111",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Aucune mission en cours
            </div>
            <div
              style={{
                color: "#999",
                fontSize: 14,
                marginBottom: 32,
                textAlign: "center",
                maxWidth: 400,
              }}
            >
              Commencez par créer une mission de revue fiscale pour une
              entreprise.
            </div>
            <button
              onClick={onNew}
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                padding: "14px 36px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Créer une mission →
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: 32,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#111",
                    letterSpacing: "-0.03em",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  Tableau de bord
                </h1>
                <p
                  style={{
                    color: "#888",
                    fontSize: 14,
                    marginTop: 6,
                    margin: "6px 0 0",
                  }}
                >
                  {companies.length} mission{companies.length > 1 ? "s" : ""} de
                  revue — Exercice 2026
                </p>
              </div>
            </div>
            {/* Summary strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 32,
              }}
            >
              {[
                { label: "Missions", val: companies.length, color: "#111" },
                {
                  label: "Total anomalies",
                  val: companies.reduce(
                    (a: number, c: { id: string; }) => a + getStats(c.id, states).anomalies,
                    0,
                  ),
                  color: "#b91c1c",
                },
                {
                  label: "Erreurs matérielles",
                  val: companies.reduce(
                    (a: number, c: { id: string; }) => a + getStats(c.id, states).erreurs,
                    0,
                  ),
                  color: "#c2410c",
                },
                {
                  label: "Points conformes",
                  val: companies.reduce(
                    (a: number, c: { id: string; }) => a + getStats(c.id, states).ok,
                    0,
                  ),
                  color: "#15803d",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0dfd8",
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: s.color,
                      lineHeight: 1,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#888",
                      marginTop: 5,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))",
                gap: 20,
              }}
            >
              {companies.map((c: Company) => (
                <CompanyCard
                  key={c.id}
                  c={c}
                  s={getStats(c.id, states)}
                  onOpen={() => onOpen(c.id)}
                  onPlan={() => onPlan(c.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 32px 100px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                background: "#111",
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "-0.01em",
                }}
              >
                Nouvelle mission de revue fiscale
              </div>
              <button
                onClick={onCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#555",
                  fontSize: 22,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                {
                  k: "name",
                  l: "Raison sociale *",
                  ph: "Ex: SARL ACME Cameroun",
                },
                { k: "niu", l: "NIU", ph: "Numéro d'Identifiant Unique" },
                {
                  k: "sector",
                  l: "Secteur d'activité",
                  ph: "Commerce, BTP, Services, Industrie...",
                },
                {
                  k: "exercice",
                  l: "Exercice fiscal",
                  ph: "01/01/2025 – 31/12/2025",
                },
                {
                  k: "reviseur",
                  l: "Réviseur fiscal",
                  ph: "Nom complet du réviseur",
                },
                {
                  k: "chef",
                  l: "Chef de mission",
                  ph: "Nom complet du chef de mission",
                },
              ].map((f) => (
                <div key={f.k}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#888",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 5,
                    }}
                  >
                    {f.l}
                  </label>
                  <input
                    value={(draft as any)[f.k] ?? ""}
                    onChange={(e) =>
                      setDraft((p: any) => ({ ...p, [f.k]: e.target.value }))
                    }
                    placeholder={f.ph}
                    style={{
                      width: "100%",
                      border: "1.5px solid #e0dfd8",
                      padding: "10px 12px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#fafaf8",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#E85D04")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0dfd8")}
                  />
                </div>
              ))}
              <button
                onClick={onCreate}
                disabled={!draft.name || saving}
                style={{
                  background: draft.name && !saving ? "#E85D04" : "#e0dfd8",
                  color: draft.name && !saving ? "#fff" : "#bbb",
                  border: "none",
                  padding: "13px",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: draft.name && !saving ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginTop: 4,
                }}
              >
                {saving ? "Création..." : "Créer la mission →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyCard({
  c,
  s,
  onOpen,
  onPlan,
}: {
  c: Company;
  s: ReturnType<typeof getStats>;
  onOpen: () => void;
  onPlan: () => void;
}) {
  const risk: RiskLevel =
    s.anomalies > 5 ? "ELEVE" : s.anomalies > 1 ? "MODERE" : "FAIBLE";
  const rc = {
    FAIBLE: { c: "#15803d", bg: "#f0fdf4" },
    MODERE: { c: "#d97706", bg: "#fffbeb" },
    ELEVE: { c: "#b91c1c", bg: "#fef2f2" },
  }[risk];
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e0dfd8",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#111",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {c.name}
          </div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
            {c.sector || "—"} · {c.exercice || "—"}
          </div>
        </div>
        <div
          style={{
            background: rc.bg,
            border: `1.5px solid ${rc.c}`,
            padding: "4px 10px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: rc.c,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            RISQUE {risk}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>
            Progression
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: s.pct === 100 ? "#15803d" : "#E85D04",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {s.pct}%
          </span>
        </div>
        <div style={{ background: "#f0efe8", height: 5 }}>
          <div
            style={{
              background: s.pct === 100 ? "#15803d" : "#E85D04",
              height: "100%",
              width: `${s.pct}%`,
              transition: "width 0.4s",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            marginTop: 14,
            paddingBottom: 16,
            borderBottom: "1px solid #f0efe8",
          }}
        >
          {[
            { v: s.answered, l: "Renseignées", c: "#111" },
            { v: s.anomalies, l: "Anomalies", c: "#b91c1c" },
            { v: s.erreurs, l: "Err. mat.", c: "#c2410c" },
            { v: s.ok, l: "Conformes", c: "#15803d" },
          ].map((x) => (
            <div
              key={x.l}
              style={{
                textAlign: "center",
                padding: "8px 4px",
                background: "#fafaf7",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: x.c,
                  lineHeight: 1,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {x.v}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: 3,
                }}
              >
                {x.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px 16px", flex: 1 }}>
        {[
          ["NIU", c.niu],
          ["Réviseur", c.reviseur],
          ["Chef de mission", c.chef],
          ["Créée le", c.createdAt],
        ].map(([l, v]) => (
          <div
            key={l as string}
            style={{ display: "flex", gap: 6, marginBottom: 4 }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#bbb",
                minWidth: 110,
                flexShrink: 0,
              }}
            >
              {l as string}
            </span>
            <span style={{ fontSize: 11, color: "#444", fontWeight: 600 }}>
              {(v as string) || "—"}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1.5px solid #e0dfd8",
        }}
      >
        <button
          onClick={onOpen}
          style={{
            padding: "13px 8px",
            background: "#111",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "inherit",
            borderRight: "1px solid #1c1c1c",
          }}
        >
          ▶ Questionnaire
        </button>
        <button
          onClick={onPlan}
          style={{
            padding: "13px 8px",
            background: "#E85D04",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "inherit",
          }}
        >
          📋 Plan de travail
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function ReviewView({
  company,
  activeSec,
  setActiveSec,
  getQS,
  setQS,
  stats,
  cs,
  onBack,
  onPlan,
}: any) {
  const sec = SECTIONS.find((s) => s.id === activeSec) ?? SECTIONS[0];
  const secStats = useMemo(() => {
    const ids: string[] = [];
    sec.subsections.forEach((sub) =>
      sub.questions.forEach((q) => ids.push(q.id)),
    );
    return {
      total: ids.length,
      done: ids.filter((id) => cs[id]?.eval != null).length,
    };
  }, [sec, cs]);

  const secPct = (s: Section) => {
    const ids: string[] = [];
    s.subsections.forEach((sub) =>
      sub.questions.forEach((q) => ids.push(q.id)),
    );
    const done = ids.filter((id) => cs[id]?.eval != null).length;
    return ids.length ? Math.round((done / ids.length) * 100) : 0;
  };
  const secAlert = (s: Section) => {
    const ids: string[] = [];
    s.subsections.forEach((sub) =>
      sub.questions.forEach((q) => ids.push(q.id)),
    );
    return ids.some(
      (id) => cs[id]?.eval === "ANOMALIE" || cs[id]?.eval === "ERR_MAT",
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* SIDEBAR */}
      <aside
        style={{
          width: 264,
          background: "#111",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Company */}
        <div
          style={{
            padding: "18px 18px 16px",
            borderBottom: "1px solid #1e1e1e",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontSize: 10,
              cursor: "pointer",
              padding: 0,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "inherit",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← Accueil
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: "#E85D04",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 15,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {company.name.charAt(0)}
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1.25,
                }}
              >
                {company.name}
              </div>
              <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>
                {company.exercice || "Exercice —"}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Avancement global
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#E85D04",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {stats.pct}%
              </span>
            </div>
            <div style={{ background: "#1e1e1e", height: 4 }}>
              <div
                style={{
                  background: "#E85D04",
                  height: "100%",
                  width: `${stats.pct}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  color: "#b91c1c",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ✕ {stats.anomalies}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#c2410c",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ! {stats.erreurs}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#15803d",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ✓ {stats.ok}
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {SECTIONS.map((s) => {
            const isActive = s.id === activeSec;
            const pct = secPct(s);
            const alert = secAlert(s);
            return (
              <button
                key={s.id}
                onClick={() => setActiveSec(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "9px 14px",
                  background: isActive ? "#1a1a1a" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#E85D04" : "transparent"}`,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 8,
                  transition: "background 0.1s",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: isActive ? "#E85D04" : "#3a3a3a",
                    minWidth: 22,
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  {s.number}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: isActive ? "#fff" : "#666",
                    lineHeight: 1.3,
                    fontFamily: "inherit",
                  }}
                >
                  {s.title}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {alert && (
                    <span style={{ fontSize: 8, color: "#ef4444" }}>●</span>
                  )}
                  {pct > 0 && (
                    <span
                      style={{
                        fontSize: 9,
                        color: pct === 100 ? "#22c55e" : "#444",
                        fontWeight: 700,
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: 14, borderTop: "1px solid #1a1a1a" }}>
          <button
            onClick={onPlan}
            style={{
              width: "100%",
              background: "#E85D04",
              color: "#fff",
              border: "none",
              padding: "11px",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "inherit",
            }}
          >
            📋 Plan de travail
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "2px solid #111",
            padding: "0 28px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                background: "#E85D04",
                color: "#fff",
                fontWeight: 900,
                fontSize: 12,
                padding: "5px 11px",
                letterSpacing: "0.06em",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              §{sec.number}
            </span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              {sec.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "#999" }}>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    secStats.done === secStats.total && secStats.done > 0
                      ? "#15803d"
                      : "#111",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {secStats.done}
              </span>
              <span style={{ color: "#ccc" }}> / </span>
              <span style={{ fontFamily: "'DM Mono',monospace" }}>
                {secStats.total}
              </span>
              <span style={{ marginLeft: 4 }}>questions</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {sec.subsections.map((sub) => (
            <SubBlock
              key={sub.id}
              sub={sub}
              getQS={getQS}
              setQS={setQS}
              cs={cs}
            />
          ))}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

function SubBlock({
  sub,
  getQS,
  setQS,
  cs,
}: {
  sub: SubSection;
  getQS: any;
  setQS: any;
  cs: any;
}) {
  const [open, setOpen] = useState(true);
  const alerts = sub.questions.filter((q) => {
    const e = cs[q.id]?.eval;
    return e === "ANOMALIE" || e === "ERR_MAT";
  }).length;
  return (
    <div
      style={{
        marginBottom: 14,
        border: "1.5px solid #e0dfd8",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px",
          cursor: "pointer",
          background: "#fafaf7",
          borderBottom: open ? "1.5px solid #e0dfd8" : "none",
          userSelect: "none",
        }}
      >
        <span
          style={{
            color: open ? "#E85D04" : "#ccc",
            fontSize: 10,
            fontWeight: 700,
            transition: "transform 0.2s",
            display: "inline-block",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          ▼
        </span>
        <span style={{ fontWeight: 800, fontSize: 13, color: "#111", flex: 1 }}>
          {sub.title}
        </span>
        {sub.badge && (
          <span
            style={{
              background: "#E85D04",
              color: "#fff",
              fontSize: 8,
              fontWeight: 900,
              padding: "2px 7px",
              letterSpacing: "0.1em",
            }}
          >
            {sub.badge}
          </span>
        )}
        {alerts > 0 && (
          <span
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
            }}
          >
            {alerts} {alerts > 1 ? "anomalies" : "anomalie"}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#ccc" }}>
          {sub.questions.length}q
        </span>
      </div>
      {open && (
        <>
          {sub.info && (
            <div
              style={{
                padding: "7px 18px",
                background: "#fffbf5",
                borderBottom: "1px solid #fed7aa",
                fontSize: 11,
                color: "#92400e",
              }}
            >
              ℹ {sub.info}
            </div>
          )}
          {sub.questions.map((q, i) => (
            <QRow
              key={q.id}
              q={q}
              s={getQS(q.id)}
              onChange={(p: any) => setQS(q.id, p)}
              even={i % 2 === 0}
            />
          ))}
        </>
      )}
    </div>
  );
}

function QRow({
  q,
  s,
  onChange,
  even,
}: {
  q: Question;
  s: QuestionState;
  onChange: (p: Partial<QuestionState>) => void;
  even: boolean;
}) {
  const [noteOpen, setNoteOpen] = useState(!!s.note);
  const conf = s.eval ? EC[s.eval as keyof typeof EC] : null;
  const bls = {
    ANOMALIE: "3px solid #b91c1c",
    ERR_MAT: "3px solid #c2410c",
    OK: "3px solid #15803d",
    NA: "3px solid #6b7280",
  };
  const bgs = {
    ANOMALIE: "#fef8f8",
    ERR_MAT: "#fffaf6",
    OK: "#f7fef9",
    NA: "#f9f9f9",
  };

  return (
    <div
      style={{
        borderBottom: "1px solid #f0efe8",
        borderLeft: s.eval ? bls[s.eval] : "3px solid transparent",
        background: s.eval ? bgs[s.eval] : even ? "#fff" : "#fdfdfb",
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          padding: "11px 18px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            {q.isNew2026 && (
              <span
                style={{
                  background: "#E85D04",
                  color: "#fff",
                  fontSize: 7,
                  fontWeight: 900,
                  padding: "2px 5px",
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                  marginTop: 3,
                  lineHeight: "12px",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ★ 2026
              </span>
            )}
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#111",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              {q.text}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
            <span
              style={{
                fontSize: 9,
                color: "#d0d0cc",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {q.id}
            </span>
            {q.ref && (
              <span
                style={{
                  fontSize: 9,
                  color: "#E85D04",
                  fontWeight: 600,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {q.ref}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            flexShrink: 0,
            alignItems: "flex-end",
          }}
        >
          {/* Eval */}
          <div style={{ display: "flex", gap: 3 }}>
            {(Object.entries(EC) as [string, any][]).map(([code, cfg]) => {
              const active = s.eval === code;
              return (
                <button
                  key={code}
                  onClick={() =>
                    onChange({ eval: active ? null : (code as EvalCode) })
                  }
                  title={cfg.label}
                  style={{
                    height: 30,
                    width: active ? undefined : 30,
                    padding: active ? "0 9px" : "0",
                    background: active ? cfg.color : "#fff",
                    border: `1.5px solid ${cfg.color}`,
                    color: active ? "#fff" : cfg.color,
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: active ? 9 : 13,
                    letterSpacing: "0.04em",
                    fontFamily: "'DM Mono',monospace",
                    transition: "all 0.12s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {active ? cfg.label : cfg.icon}
                </button>
              );
            })}
          </div>
          {/* Meta */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <button
              onClick={() => setNoteOpen((v) => !v)}
              style={{
                padding: "3px 8px",
                fontSize: 9,
                fontWeight: 700,
                background: s.note || noteOpen ? "#111" : "#f2f1ed",
                border:
                  "1.5px solid " + (s.note || noteOpen ? "#111" : "#e0dfd8"),
                cursor: "pointer",
                color: s.note || noteOpen ? "#fff" : "#888",
                fontFamily: "inherit",
                letterSpacing: "0.05em",
              }}
            >
              {s.note ? "✎ Note" : "+ Note"}
            </button>
            <input
              value={s.renvoi}
              onChange={(e) => onChange({ renvoi: e.target.value })}
              placeholder="Réf. feuille"
              style={{
                width: 78,
                border: "1.5px solid #e0dfd8",
                padding: "3px 7px",
                fontSize: 9,
                fontFamily: "'DM Mono',monospace",
                background: "#fafafa",
                color: "#555",
                outline: "none",
              }}
            />
            <select
              value={s.priority}
              onChange={(e) => onChange({ priority: e.target.value as any })}
              style={{
                border: "1.5px solid #e0dfd8",
                padding: "3px 5px",
                fontSize: 9,
                fontFamily: "inherit",
                background: "#fafafa",
                color: "#555",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="haute">🔴 Priorité haute</option>
              <option value="normale">🟡 Normale</option>
              <option value="basse">🟢 Basse</option>
            </select>
          </div>
        </div>
      </div>
      {noteOpen && (
        <div style={{ padding: "0 18px 10px", paddingLeft: 32 }}>
          <textarea
            value={s.note}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Observations, décisions, suggestions, recommandations, références..."
            rows={2}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1.5px solid #e0dfd8",
              padding: "8px 10px",
              fontSize: 12,
              fontFamily: "inherit",
              background: "#fffef8",
              color: "#222",
              outline: "none",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
function PlanView({
  company,
  cs,
  stats,
  filter,
  setFilter,
  onBack,
  onReview,
}: any) {
  const all = useMemo(() => {
    const items: Array<{
      sec: Section;
      sub: SubSection;
      q: Question;
      s: QuestionState;
    }> = [];
    SECTIONS.forEach((sec) =>
      sec.subsections.forEach((sub) =>
        sub.questions.forEach((q) => {
          const st: QuestionState = cs[q.id] ?? defQS();
          if (st.eval !== null) items.push({ sec, sub, q, s: st });
        }),
      ),
    );
    return items;
  }, [cs]);

  const anomalies = all.filter((i) => i.s.eval === "ANOMALIE");
  const erreurs = all.filter((i) => i.s.eval === "ERR_MAT");
  const toAction = all.filter((i) => i.s.eval !== "OK" && i.s.eval !== "NA");
  const display =
    filter === "anomalies"
      ? anomalies
      : filter === "erreurs"
        ? erreurs
        : toAction;
  const priority = all.filter(
    (i) =>
      i.s.priority === "haute" &&
      (i.s.eval === "ANOMALIE" || i.s.eval === "ERR_MAT"),
  );
  const risk: RiskLevel =
    anomalies.length > 5 ? "ELEVE" : anomalies.length > 1 ? "MODERE" : "FAIBLE";
  const rc = {
    FAIBLE: { c: "#15803d", bg: "#f0fdf4", l: "FAIBLE" },
    MODERE: { c: "#d97706", bg: "#fffbeb", l: "MODÉRÉ" },
    ELEVE: { c: "#b91c1c", bg: "#fef2f2", l: "ÉLEVÉ" },
  }[risk];

  // Group by section
  const grouped = useMemo(() => {
    const map: Record<string, typeof display> = {};
    display.forEach((i) => {
      if (!map[i.sec.id]) map[i.sec.id] = [];
      map[i.sec.id].push(i);
    });
    return map;
  }, [display]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
      @media print { .no-print{display:none!important} body{background:#fff} }`}</style>

      {/* STICKY HEADER */}
      <div
        className="no-print"
        style={{
          background: "#111",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "2px solid #E85D04",
        }}
      >
        <div
          style={{
            padding: "0 40px",
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                color: "#555",
                fontSize: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ← Accueil
            </button>
            <div style={{ color: "#333", fontSize: 16 }}>|</div>
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "-0.01em",
              }}
            >
              Plan de Travail
            </span>
            <div
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                padding: "4px 12px",
              }}
            >
              <span style={{ color: "#E85D04", fontWeight: 700, fontSize: 13 }}>
                {company.name}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onReview}
              style={{
                background: "transparent",
                border: "1px solid #333",
                color: "#888",
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              ← Questionnaire
            </button>
            <button
              onClick={() => window.print()}
              style={{
                background: "#E85D04",
                border: "none",
                color: "#fff",
                padding: "7px 18px",
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              🖨 Imprimer
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "36px 40px", maxWidth: 1060, margin: "0 auto" }}>
        {/* TITLE */}
        <div
          style={{
            background: "#111",
            padding: "28px 32px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                color: "#E85D04",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 10,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              Plan de Travail · Revue Fiscale CGI 2026
            </div>
            <div
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {company.name}
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              {company.sector && <span>{company.sector} · </span>}
              {company.exercice && <span>Exercice {company.exercice} · </span>}
              {company.niu && (
                <span style={{ fontFamily: "'DM Mono',monospace" }}>
                  NIU: {company.niu}
                </span>
              )}
            </div>
            <div style={{ color: "#444", fontSize: 11, marginTop: 5 }}>
              Réviseur: {company.reviseur || "—"} · Chef de mission:{" "}
              {company.chef || "—"}
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <div
              style={{
                background: rc.bg,
                border: `2px solid ${rc.c}`,
                padding: "14px 20px",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: rc.c,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Risque Global
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: rc.c,
                  lineHeight: 1,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {rc.l}
              </div>
            </div>
            <div
              style={{
                color: "#444",
                fontSize: 9,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>

        {/* KPI ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            {
              l: "Renseignées",
              v: stats.answered,
              sub: `/ ${stats.total}`,
              c: "#111",
            },
            {
              l: "Anomalies",
              v: stats.anomalies,
              sub: "à traiter",
              c: "#b91c1c",
            },
            {
              l: "Err. matérielles",
              v: stats.erreurs,
              sub: "à corriger",
              c: "#c2410c",
            },
            { l: "Conformes", v: stats.ok, sub: "O.K.", c: "#15803d" },
            { l: "N. applicables", v: stats.na, sub: "N.A.", c: "#6b7280" },
          ].map((x) => (
            <div
              key={x.l}
              style={{
                background: "#fff",
                border: "1.5px solid #e0dfd8",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: x.c,
                  lineHeight: 1,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {x.v}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#999",
                  marginTop: 5,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {x.l}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: x.c,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {x.sub}
              </div>
            </div>
          ))}
        </div>

        {/* PRIORITY BLOCK */}
        {priority.length > 0 && (
          <div
            style={{
              border: "2px solid #E85D04",
              background: "#fff",
              marginBottom: 24,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#E85D04",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                🔴 Actions Prioritaires — {priority.length} point
                {priority.length > 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ padding: "4px 0" }}>
              {priority.map((item) => {
                const cfg = EC[item.s.eval as keyof typeof EC];
                return (
                  <div
                    key={item.q.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px 18px",
                      borderBottom: "1px solid #f8f8f6",
                      borderLeft: `4px solid ${cfg.color}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "2px 6px",
                        background: cfg.color,
                        color: "#fff",
                        flexShrink: 0,
                        marginTop: 3,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {cfg.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.q.text}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bbb",
                          marginTop: 2,
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        {item.q.id} · {item.sub.title}
                      </div>
                      {item.s.note && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#92400e",
                            marginTop: 5,
                            background: "#fffbf0",
                            padding: "6px 8px",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          "{item.s.note}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTER TABS */}
        <div
          className="no-print"
          style={{
            display: "flex",
            marginBottom: 18,
            border: "1.5px solid #e0dfd8",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          {(
            [
              { k: "all", l: `Points à traiter (${toAction.length})` },
              { k: "anomalies", l: `Anomalies (${anomalies.length})` },
              { k: "erreurs", l: `Erreurs matérielles (${erreurs.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              style={{
                flex: 1,
                padding: "11px 14px",
                border: "none",
                cursor: "pointer",
                background: filter === t.k ? "#111" : "transparent",
                color: filter === t.k ? "#fff" : "#777",
                fontWeight: 700,
                fontSize: 11,
                fontFamily: "inherit",
                borderRight: "1px solid #e0dfd8",
                letterSpacing: "0.02em",
              }}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* GROUPED ITEMS */}
        {Object.keys(grouped).length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e0dfd8",
              padding: 56,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#15803d" }}>
              Aucun point à signaler
            </div>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
              Tous les points renseignés sont conformes dans cette catégorie.
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([sid, items]) => {
            const sec = items[0].sec;
            return (
              <div key={sid} style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: "#111",
                      color: "#E85D04",
                      fontWeight: 900,
                      fontSize: 11,
                      padding: "4px 10px",
                      letterSpacing: "0.06em",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    §{sec.number}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#111",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {sec.title}
                  </span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>
                    — {items.length} point{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0dfd8",
                    overflow: "hidden",
                  }}
                >
                  {(items as any[]).map((item: any, idx: number) => {
                    const cfg = EC[item.s.eval as keyof typeof EC];
                    const pc =
                      item.s.priority === "haute"
                        ? "#b91c1c"
                        : item.s.priority === "normale"
                          ? "#d97706"
                          : "#6b7280";
                    return (
                      <div
                        key={item.q.id}
                        style={{
                          display: "flex",
                          borderBottom:
                            idx < items.length - 1
                              ? "1px solid #f0efe8"
                              : "none",
                          borderLeft: `4px solid ${cfg.color}`,
                        }}
                      >
                        <div
                          style={{
                            width: 82,
                            background: cfg.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "12px 6px",
                            flexShrink: 0,
                            borderRight: "1px solid #f0efe8",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              fontWeight: 900,
                              color: cfg.color,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              textAlign: "center",
                              lineHeight: 1.5,
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#111",
                                  lineHeight: 1.55,
                                }}
                              >
                                {item.q.text}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginTop: 4,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 9,
                                    color: "#d0d0cc",
                                    fontFamily: "'DM Mono',monospace",
                                  }}
                                >
                                  {item.q.id}
                                </span>
                                <span style={{ fontSize: 9, color: "#bbb" }}>
                                  ·
                                </span>
                                <span style={{ fontSize: 9, color: "#999" }}>
                                  {item.sub.title}
                                </span>
                                {item.q.ref && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      color: "#E85D04",
                                      fontWeight: 600,
                                      fontFamily: "'DM Mono',monospace",
                                    }}
                                  >
                                    {item.q.ref}
                                  </span>
                                )}
                                {item.q.isNew2026 && (
                                  <span
                                    style={{
                                      background: "#E85D04",
                                      color: "#fff",
                                      fontSize: 7,
                                      fontWeight: 900,
                                      padding: "1px 4px",
                                      fontFamily: "'DM Mono',monospace",
                                    }}
                                  >
                                    ★ 2026
                                  </span>
                                )}
                              </div>
                              {item.s.note && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    padding: "7px 10px",
                                    background: "#fffef6",
                                    border: "1px solid #f0ede0",
                                    fontSize: 12,
                                    color: "#555",
                                    fontStyle: "italic",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  📝 {item.s.note}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                flexShrink: 0,
                                alignItems: "flex-end",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 8,
                                  fontWeight: 800,
                                  color: pc,
                                  padding: "2px 7px",
                                  border: `1px solid ${pc}`,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.07em",
                                  fontFamily: "'DM Mono',monospace",
                                }}
                              >
                                {item.s.priority === "haute"
                                  ? "🔴 Haute"
                                  : item.s.priority === "normale"
                                    ? "🟡 Normale"
                                    : "🟢 Basse"}
                              </span>
                              {item.s.renvoi && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    color: "#aaa",
                                    fontFamily: "'DM Mono',monospace",
                                  }}
                                >
                                  📄 {item.s.renvoi}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* SIGNATURE */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e0dfd8",
            padding: "22px 28px",
            marginTop: 28,
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #f0efe8",
              paddingBottom: 14,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: "#111",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Visas et signatures
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 28,
            }}
          >
            {[
              { r: "Réviseur fiscal", n: company.reviseur },
              { r: "Chef de mission", n: company.chef },
              { r: "Visa direction", n: "" },
            ].map((sg) => (
              <div key={sg.r}>
                <div
                  style={{
                    fontSize: 9,
                    color: "#aaa",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  {sg.r}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 24,
                  }}
                >
                  {sg.n || "—"}
                </div>
                <div style={{ borderTop: "1.5px solid #111", paddingTop: 5 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#ccc",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Signature · Date
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 9,
            color: "#ccc",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          Loi N°2025/012 du 17 décembre 2025 portant CGI 2026 — République du
          Cameroun
        </div>
      </div>
    </div>
  );
}
