import { getMappingLines } from "./account-mapping.data";
import { formatMappingLine, formatNetBalance, formatSumOfRows } from "./formula-format.util";
import { FormulaCatalog } from "./formula-catalog.types";

/**
 * Catalogue de formules pour le Bilan Paysage (`generateBilanPaysageRows`,
 * dsf-generator.service.ts:455). Cas le plus particulier: chaque case
 * additionne PLUSIEURS lignes de `ACCOUNT_MAPPING` retrouvées par
 * sous-chaîne de leur libellé (pas un `MappingLine` unique), et les lignes
 * de TOTAL additionnent d'autres lignes déjà calculées entre elles.
 *
 * Ce fichier reproduit fidèlement — sans l'appeler — la structure de
 * `generateBilanPaysageRows` (mêmes variables ae/af/.../dz, mêmes needles,
 * même ordre), en construisant du texte au lieu de sommer des montants.
 * Toute modification de `generateBilanPaysageRows` doit être répercutée ici.
 */

function findLineText(code: string, needle: string): string | null {
  const line = getMappingLines(code).find((l) =>
    l.label.toLowerCase().includes(needle.toLowerCase())
  );
  return line ? formatMappingLine(line) : null;
}

function sumManyText(code: string, needles: string[]): string {
  return needles
    .map((needle) => findLineText(code, needle))
    .filter((t): t is string => t !== null)
    .join(" + ");
}

/** Ligne actif avec brut/amortissement (ou brut seul si non amorti). */
function detailFormula(
  brut: { code: string; needles: string[] },
  amort: { code: string; needles: string[] } | null
): string {
  const brutText = sumManyText(brut.code, brut.needles);
  if (!amort) return brutText;
  const amortText = sumManyText(amort.code, amort.needles);
  return `(${brutText}) − (${amortText})`;
}

/** Ligne passif (une seule colonne "net"). */
function passifFormula(code: string, needles: string[]): string {
  return sumManyText(code, needles);
}

export function buildBilanPaysageCatalog(): FormulaCatalog {
  const actifRows: Record<string, string> = {};
  const passifRows: Record<string, string> = {};

  // ── ACTIF ──────────────────────────────────────────────────────────────
  actifRows.ae = detailFormula(
    { code: "3A", needles: ["frais de développement"] },
    { code: "3C", needles: ["frais de développement"] }
  );
  actifRows.af = detailFormula(
    { code: "3A", needles: ["brevets, licences"] },
    { code: "3C", needles: ["brevets, licences"] }
  );
  actifRows.ag = detailFormula(
    { code: "3A", needles: ["fonds commercial"] },
    { code: "3C", needles: ["fonds commercial"] }
  );
  actifRows.ah = detailFormula(
    { code: "3A", needles: ["autres immobilisations incorporelles"] },
    { code: "3C", needles: ["autres immobilisations incorporelles"] }
  );
  actifRows.ad = formatSumOfRows(["ae", "af", "ag", "ah"]);

  actifRows.aj = detailFormula(
    { code: "3A", needles: ["terrains hors immeuble", "terrains - immeuble"] },
    null
  );
  actifRows.ak = detailFormula(
    { code: "3A", needles: ["bâtiments hors immeuble", "bâtiments - immeuble"] },
    { code: "3C", needles: ["bâtiments hors immeuble"] }
  );
  actifRows.al = detailFormula(
    { code: "3A", needles: ["aménagements, agencements"] },
    { code: "3C", needles: ["aménagements, agencements"] }
  );
  actifRows.am = detailFormula(
    { code: "3A", needles: ["matériel, mobilier"] },
    { code: "3C", needles: ["matériel, mobilier"] }
  );
  actifRows.an = detailFormula(
    { code: "3A", needles: ["matériel de transport"] },
    { code: "3C", needles: ["matériel de transport"] }
  );
  actifRows.ai = formatSumOfRows(["aj", "ak", "al", "am", "an"]);

  // AP: avances et acomptes versés sur immobilisation — pas de source
  // fiable, saisie manuelle (voir generateBilanPaysageRows) — pas de formule.

  actifRows.ar = detailFormula(
    { code: "4", needles: ["titres de participation"] },
    { code: "4", needles: ["dépréciations titres de participation"] }
  );
  actifRows.as = detailFormula(
    {
      code: "4",
      needles: [
        "prêts et créances",
        "prêts au personnel",
        "créances sur l'etat",
        "titres immobilisés",
        "dépôts et cautionnements",
        "intérêts couruss",
        "immobilisations financières diverses",
      ],
    },
    { code: "4", needles: ["dépréciations autres immobilisations"] }
  );
  actifRows.aq = formatSumOfRows(["ar", "as"]);

  actifRows.az = formatSumOfRows(["ad", "ai", "ap", "aq"]);

  actifRows.ba = detailFormula(
    {
      code: "5",
      needles: [
        "créances sur cessions d'immobilisations",
        "autres créances hors activités ordinaires",
      ],
    },
    { code: "5", needles: ["dépréciations des créances h.a.o."] }
  );
  actifRows.bb = detailFormula(
    {
      code: "6",
      needles: [
        "marchandises",
        "matières premières et fournitures liées",
        "autres approvisionnements",
        "produits en cours",
        "services en cours",
        "produits finis",
        "produits intermédiaires",
        "stocks en cours de route",
      ],
    },
    { code: "6", needles: ["dépréciations des stocks"] }
  );
  actifRows.bh = detailFormula(
    {
      code: "17",
      needles: [
        "fournisseurs, avances et acomptes (hors groupe)",
        "fournisseurs, avances et acomptes groupe",
        "autres fournisseurs débiteurs",
      ],
    },
    null
  );
  actifRows.bi = detailFormula(
    {
      code: "7",
      needles: [
        "clients (hors réserve de propriété et groupe)",
        "clients effets à recevoir (hors réserve de propriété et groupe)",
        "clients et effets à recevoir avec réserve de propriété",
        "clients et effets à recevoir groupe",
        "clients, chèques, effets et autres valeurs impayés",
        "créances sur cessions courantes d'immobilisations",
        "clients effets eomptés et non échus",
        "créances litigeuses ou douteuses",
        "clients produits à recevoir",
      ],
    },
    { code: "7", needles: ["dépréciations des comptes clients"] }
  );
  actifRows.bj = detailFormula(
    {
      code: "8",
      needles: [
        "personnel",
        "organismes sociaux",
        "etat et collectivités publiques",
        "organismes internationaux",
        "apporteurs, associés et groupe",
        "compte transitoire ajustement",
        "autres débiteurs divers",
        "comptes permanents non bloqués",
        "comptes de liaison charges et produits",
        "comptes de liaison des sociétés en participation",
      ],
    },
    { code: "8", needles: ["dépréciations des autres créances"] }
  );
  actifRows.bc = formatSumOfRows(["bh", "bi", "bj"]);
  actifRows.bk = formatSumOfRows(["ba", "bb", "bc"]);

  actifRows.bq = detailFormula(
    {
      code: "9",
      needles: [
        "titres de trésor et bons de caisse à court terme",
        "actions",
        "obligations",
        "bons de souription",
        "titres négociables hors régions",
        "intérêts courus",
        "autres valeurs assimilées",
      ],
    },
    { code: "9", needles: ["dépréciations des titres"] }
  );
  actifRows.br = detailFormula(
    {
      code: "10",
      needles: [
        "effets à encaisser",
        "effets à l'encaissement",
        "chèques à encaisser",
        "chèques à l'encaissement",
        "cartes de crédit à encaisser",
        "autres valeurs à encaisser",
      ],
    },
    { code: "10", needles: ["dépréciations des valeurs à encaisser"] }
  );
  actifRows.bs = detailFormula(
    {
      code: "11",
      needles: [
        "autres établissements financiers",
        "etablissements financiers intérêts courus",
        "instruments de trésorerie",
        "caisse",
        "caisse électronique mobile",
        "régies d'avances et virements accréditifs",
        "banques locales",
        "banques autres états région",
        "banques, dépôt à terme",
        "autres banques",
        "banques intérêts courus",
        "chèques postaux",
      ],
    },
    { code: "11", needles: ["dépréciations"] }
  );
  actifRows.bt = formatSumOfRows(["bq", "br", "bs"]);

  actifRows.bu = detailFormula(
    { code: "12", needles: ["ecart de conversion - actifs"] },
    null
  );

  actifRows.bz = formatSumOfRows(["az", "bk", "bt", "bu"]);

  // ── PASSIF ─────────────────────────────────────────────────────────────
  passifRows.ca = formatNetBalance(["101"]);
  // CB: apporteurs capital non appelé — saisie manuelle, pas de formule.
  passifRows.cd = passifFormula("14", [
    "prime d'émission",
    "primes d'apport",
    "prime de fusion",
    "prime de conversion",
    "autres primes",
  ]);
  passifRows.ce = formatNetBalance(["106"]);
  passifRows.cf = passifFormula("14", [
    "réserves légales",
    "réserves statutaires",
    "réserves de plus-values nettes",
    "réserves d'attribution gratuite",
    "autres réserves réglementées",
  ]);
  passifRows.cg = passifFormula("14", ["réserves libres"]);
  passifRows.ch = passifFormula("14", ["report à nouveau"]);
  passifRows.cj = formatNetBalance(["13"]);
  passifRows.cl = passifFormula("15A", [
    "etat",
    "régions",
    "départements",
    "communes et collectivités",
    "entités publiques ou mixtes",
    "entités et organismes privés",
    "organismes internationaux",
    "autres",
  ]);
  passifRows.cm = passifFormula("15A", [
    "amortissements dérogatoires",
    "plue-value de cession à réinvestir",
    "provision spéciale de réévaluation",
    "provisions réglementées relatives aux immobilisations",
    "provisions réglementées relatives aux stocks",
    "provisions pour investissement",
    "autres provisions et fonds réglementés",
  ]);
  passifRows.cp = formatSumOfRows(["ca", "cb", "cd", "ce", "cf", "cg", "ch", "cj", "cl", "cm"]);

  passifRows.da = passifFormula("16A", [
    "emprunts obligataires",
    "emprunts et dettes auprès des établissements crédits",
    "avances reçues de l'etat",
    "avances reçues et comptes courants bloqués",
    "dépôts et cautionnements reçus",
    "intérêts courus1",
    "avances assorties de conditions particulières",
    "autres emprunts et dettes",
    "dettes liées à des participations",
    "comptes permanents bloqués",
  ]);
  passifRows.db = passifFormula("16A", [
    "crédit bail immobilier",
    "crédit bail mobilier",
    "location vente",
    "intérêts courus",
    "autres dettes de location acquisition",
  ]);
  passifRows.dc = passifFormula("16A", [
    "provisions pour litiges",
    "provisions pour garantie donnée aux clients",
    "provisions pour pertes sur marchés",
    "provisions pour pertes de change",
    "provisions pour impôts",
    "provisions pour pensions",
    "actif du régime de retraite",
    "provisions pour restructuration",
    "provisions pour amendes et pénalités",
    "provisions de propre assureur",
    "provisions pour démantèlement",
    "provisions de droits à déduction",
    "autres provisions",
  ]);
  passifRows.dd = formatSumOfRows(["da", "db", "dc"]);
  passifRows.df = formatSumOfRows(["cp", "dd"]);

  passifRows.dh = passifFormula("5", [
    "fournisseurs d'investissements",
    "fournisseurs d'investissements effets à payer",
    "versements restant à effectuer sur titres de participation",
    "autres dettes hors activités ordinaires",
  ]);
  passifRows.di = passifFormula("7", [
    "clients, avances reçues hors groupe",
    "clients, avances reçues groupe",
    "autres clients créditeurs",
  ]);
  passifRows.dj = passifFormula("17", [
    "fournisseurs dettes en compte (hors groupe)",
    "fournisseurs effets à payer (hors groupe)",
    "fournisseurs dettes et effets à payer groupe",
    "fournisseurs factures non parvenues (hors groupe)",
    "fournisseurs factures non parvenues groupe",
  ]);
  passifRows.dk = passifFormula("18", [
    "personnel avances et acomptes",
    "personnel rémunérations dues",
    "autres personnel",
    "caisse de sécurité sociale",
    "caisse de retraite",
    "autres organismes sociaux",
    "etat, impôts sur les bénéfices",
    "etat, impôts et taxes",
    "etat, tva",
    "etat, impôts retenus à la source",
    "autres dettes etat",
  ]);
  passifRows.dm = passifFormula("19", [
    "organismes internationaux",
    "apporteurs, opérations sur le capital",
    "associés, compte courant",
    "associés, dividendes à payer",
    "groupe, comptes courants",
    "autres dettes associés",
    "créditeurs divers",
    "obligataires",
    "rémunérations d'administrateurs",
    "compte du factor",
    "versements restant à effectuer sur titres de placement",
    "compte transitoire ajustement",
    "autres créditeurs divers",
    "comptes permanents non bloqués",
    "comptes de liaison charges et produits",
    "comptes de liaison des sociétés en participation",
  ]);
  passifRows.dn = passifFormula("28", [
    "12. dépréciations et provisions pour risques à court",
    "13. dépréciations et provisions pour risques à court",
  ]);
  passifRows.dp = formatSumOfRows(["dh", "di", "dj", "dk", "dm", "dn"]);

  passifRows.dq = passifFormula("20", [
    "escomptes de crédit de campagne",
    "escomptes de crédit ordinaires",
  ]);
  passifRows.dr = passifFormula("20", [
    "banques locales",
    "banques autres états région",
    "autres banques",
    "banques intérêts courus",
    "crédit de trésorerie",
  ]);
  passifRows.dt = formatSumOfRows(["dq", "dr"]);

  passifRows.dy = passifFormula("12", ["ecart de conversion - passifs"]);

  passifRows.dz = formatSumOfRows(["df", "dp", "dt", "dy"]);

  return {
    bilan_paysage: { actifRows, passifRows },
  };
}
