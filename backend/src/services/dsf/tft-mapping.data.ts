// AUTO-EXTRACTED from "BASE NOTE HEVEREST 1.xlsx" (feuille "Base à renseigner",
// section "TFT" — Tableau des Flux de Trésorerie, lignes 501-530).
// Chaque entrée porte la formule brute (colonne "AD" de la table source) et
// le code de ligne standard OHADA (ZA, FA-FQ, ZB-ZI) déduit de la structure
// du tableau. Les lignes FF/FG/FH (décaissements sur acquisitions
// d'immobilisations) référencent des cellules d'un autre onglet ("N3A;C15",
// "ACQUISITION INCORP OUVERTURE(...)") non résolvables depuis cette table —
// elles sont calculées séparément (voir generateTFT) à partir des données
// FixedAsset plutôt que via ce moteur de formules générique.

export interface TftLine {
  ref: string;
  label: string;
  /** Formule brute (grammaire formula-engine.ts) ; absente = calculée à part. */
  formula?: string;
  /** true = ligne de sous-total calculée comme somme d'autres refs. */
  sumOf?: string[];
  bold?: boolean;
  highlight?: string;
}

export const TFT_LINES: TftLine[] = [
  {
    ref: 'ZA',
    label:
      "Trésorerie nette au 1er janvier (Trésorerie actif N-1 - Trésorerie passif N-1)",
    formula: 'SDA(5; SAUF 599)-SCA(5;SAUF 599)',
    highlight: 'lightblue',
  },
  {
    ref: 'FA',
    label: "Capacité d'Autofinancement Globale (CAFG)",
    // Renvoie à note34;E41 ("N34;E41") — repris depuis notes.note34 déjà
    // calculée plutôt que re-dérivé ici (voir generateTFT).
  },
  {
    ref: 'FE1',
    label: '- Variation de l\'Actif circulant H.A.O.',
    formula: '-(SD(488) -SC(4988) -SDA(488) +SCA(4988))',
  },
  {
    ref: 'FC',
    label: '- Variation des stocks',
    formula: '-(SD(3) -SC(3) -SDA(3) +SCA(3))',
  },
  {
    ref: 'FD',
    label: '- Variation des créances et emplois assimilés',
    formula:
      '-(SD (185;409;41;42;43;44;45;46;47; SAUF 419)- SC (490;491;492;493;494;495;496;497)-SDA (185;409;41;42;43;44;45;46;47; SAUF 419)+SCA (490;491;492;493;494;495;496;497))',
  },
  {
    ref: 'FE2',
    label: '+ Variation du passif circulant',
    formula:
      'SC(185;45;46;471;472;473;474;475;476;477;484;4998;419;499;599;401;402;403;405;406;407;408;42;43;44;479)-SCA(185;45;46;471;472;473;474;475;476;477;484;4998;419;499;599;401;402;403;405;406;407;408;42;43;44;479)',
  },
  {
    ref: 'BF',
    label:
      'Variation du BF lié aux activités opérationnelles (FB + FC + FD + FE)',
    sumOf: ['FE1', 'FC', 'FD', 'FE2'],
  },
  {
    ref: 'ZE',
    label:
      'Flux de trésorerie provenant des activités opérationnelles (somme FA à FE)',
    sumOf: ['FA', 'BF'],
    highlight: 'brown',
  },
  {
    ref: 'FF',
    label: "- Décaissements liés aux acquisitions d'immobilisations incorporelles",
    // Calculée à part (FixedAsset) — voir generateTFT.
  },
  {
    ref: 'FG',
    label: "- Décaissements liés aux acquisitions d'immobilisations corporelles",
  },
  {
    ref: 'FH',
    label: "- Décaissements liés aux acquisitions d'immobilisations financières",
  },
  {
    ref: 'FI',
    label:
      "+ Encaissements liés aux cessions d'immobilisations incorporelles et corporelles",
    formula: 'SC(821;822)+SCA(414;485)-SC(414;485)',
  },
  {
    ref: 'FJ',
    label: "+ Encaissements liés aux cessions d'immobilisations financières",
    formula: 'SC(823)',
  },
  {
    ref: 'ZC',
    label:
      "Flux de trésorerie provenant des activités d'investissements (somme FF à FJ)",
    sumOf: ['FF', 'FG', 'FH', 'FI', 'FJ'],
    highlight: 'brown',
  },
  {
    ref: 'FK',
    label: '+ Augmentations de capital par apports nouveaux',
    formula:
      'SI SC(10 SAUF 109)- SCA(10 SAUF 109)>0 ALORS SC(10 SAUF 109) - SCA(10 SAUF 109) SINON 0',
  },
  {
    ref: 'FL',
    label: "+ Subventions d'investissement reçues",
    formula: 'SC(14) - SCA(14) + SC(799)',
  },
  {
    ref: 'FM',
    label: '- Prélèvements sur le capital',
    formula:
      'SI SCA(10 SAUF 109) - SC (10 SAUF 109)>0 ALORS SCA(10 SAUF 109) - SC (10 SAUF 109) SINON 0',
  },
  {
    ref: 'FN',
    label: '- Dividendes versés',
    formula:
      'SI SCA(11;12;13)-SDA(11;12;13)-SC(11;12;13)+SD(11;12;13)>0 ALORS SCA(11;12;13)-SDA(11;12;13)-SC(11;12;13)+SD(11;12;13) SINON 0',
  },
  {
    ref: 'ZD',
    label: 'Flux de trésorerie provenant des capitaux propres (somme FK à FN)',
    sumOf: ['FK', 'FL', 'FM', 'FN'],
    highlight: 'brown',
  },
  { ref: 'FO', label: 'Emprunts', formula: 'MC(16)' },
  { ref: 'FP', label: 'Autres dettes financières', formula: 'MC(17)' },
  {
    ref: 'FQ',
    label: 'Remboursements des emprunts et autres dettes financières',
    formula: 'MD(16;17)',
  },
  {
    ref: 'ZF',
    label: 'Flux de trésorerie provenant des capitaux étrangers (somme FO à FQ)',
    sumOf: ['FO', 'FP', 'FQ'],
    highlight: 'brown',
  },
  {
    ref: 'ZG',
    label: 'Flux de trésorerie provenant des activités de financement (D + E)',
    sumOf: ['ZD', 'ZF'],
    highlight: 'lightblue',
  },
  {
    ref: 'ZH',
    label: 'VARIATION DE LA TRESORERIE NETTE DE LA PERIODE (B + C + F)',
    sumOf: ['ZE', 'ZC', 'ZG'],
    highlight: 'lightblue',
  },
  {
    ref: 'ZI',
    label: 'Trésorerie nette au 31 décembre (G + A)',
    sumOf: ['ZA', 'ZH'],
    highlight: 'lightblue',
  },
];
