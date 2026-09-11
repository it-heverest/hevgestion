// src/services/dsf-generator.service.ts
import { DSF, Folder, Balance, Client } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";
import { config } from "../config";
import { getMappingLine, getMappingLines, MappingLine } from "./dsf/account-mapping.data";
import { resolveAllMappingLines } from "./dsf/mapping-resolver";
import { sumMappingLine, sumBySide, sumMovement } from "./dsf/account-sum.util";
import { evaluateFormulaSource } from "./dsf/formula-engine";
import { TFT_LINES } from "./dsf/tft-mapping.data";

interface DSFData {
  taxTables: any;
  notes: any;
  signaletics: any;
  note1: any;
  note2: any;
  note3: any;
  note4: any;
  note5: any;
  note6: any;
  note7: any;
  note8: any;
  note9: any;
  note10: any;
  note11: any;
  note12: any;
  note13: any;
  note14: any;
  note15: any;
  note16: any;
  note17: any;
  note18: any;
  note19: any;
  note20: any;
  note21: any;
  note22: any;
  note23: any;
  note24: any;
  note25: any;
  note26: any;
  note27: any;
  note28: any;
  note29: any;
  note30: any;
  note31: any;
  note32: any;
  note33: any;
  fiche1: any;
  fiche2: any;
  fiche3: any;
  cter: any;
  cf1: any;
}

interface CoherenceResult {
  isCoherent: boolean;
  issues: any;
}

type FolderWithRelations = Folder & {
  client: Client & { clientType?: string };
  balances: (Balance & { fixedAssets?: any[]; equilibrium?: any })[];
  /** Formules effectives (défaut statique ou surcharge admin/comptable en
   * base) pour toutes les notes couvertes par ACCOUNT_MAPPING, résolues une
   * seule fois en tête de generateAllNotes() et relues de façon synchrone
   * partout ailleurs — voir dsf/mapping-resolver.ts. `folder` est propre à
   * la requête en cours (jamais partagé entre requêtes concurrentes), le
   * muter ici est donc sans risque. */
  resolvedMappings?: Map<string, MappingLine[]>;
};

export class DSFGenerator {
  async generate(folder: FolderWithRelations): Promise<any[]> {
    const nBalance = folder.balances.find((b) => b.type === "CURRENT_YEAR");
    const n1Balance = folder.balances.find((b) => b.type === "PREVIOUS_YEAR");

    if (!nBalance) {
      throw new Error("Current year balance is required");
    }

    const nData = nBalance.originalData as any;
    
    // If previous year balance doesn't exist, use current year's closing as N-1 opening
    // This implements the rule: Balance N of year Y = Balance N-1 of year Y+1
    let n1Data: any;
    if (n1Balance) {
      n1Data = n1Balance.originalData as any;
    } else {
      // Auto-populate N-1 opening from N closing
      console.log(`⚠️ No previous year balance found for ${folder.fiscalYear - 1}. Using current year ${folder.fiscalYear} closing as N-1 opening.`);
      n1Data = this.createPreviousYearFromCurrent(nData);
    }

    const reports: any[] = [];

    // Generate all reports and add them to the array
    reports.push({
      type: "BALANCE_SHEET",
      data: this.generateBalanceSheet(nData, n1Data),
    });

    reports.push({
      type: "INCOME_STATEMENT",
      data: this.generateIncomeStatement(nData, n1Data),
    });

    reports.push({
      type: "TAX_TABLES",
      data: this.generateTaxTables(nData, n1Data, folder),
    });

    reports.push({
      type: "NOTES",
      data: await this.generateAllNotes(nData, n1Data, nBalance, n1Balance, folder),
    });

    reports.push({
      type: "SIGNALETICS",
      data: this.generateSignaletics(folder),
    });

    return reports;
  }

  private generateBalanceSheet(nData: any, n1Data: any): any {
    const n = nData.rows || [];
    const n1 = n1Data?.rows || [];

    return {
      assets: {
        immobilisations: {
          chargesImmobilisees: {
            brut: this.sumAccounts(n, ["201", "202", "203"]),
            amortissements: this.sumAccounts(n, ["2801", "2802", "2803"]),
            net: this.calculateNet(
              n,
              ["201", "202", "203"],
              ["2801", "2802", "2803"]
            ),
            netN1: this.calculateNet(
              n1,
              ["201", "202", "203"],
              ["2801", "2802", "2803"]
            ),
          },
          immobilisationsIncorporelles: {
            brut: this.sumAccounts(n, ["211", "212", "213", "214", "215"]),
            amortissements: this.sumAccounts(n, [
              "2811",
              "2812",
              "2813",
              "2814",
              "2815",
            ]),
            net: this.calculateNet(
              n,
              ["211", "212", "213", "214", "215"],
              ["2811", "2812", "2813", "2814", "2815"]
            ),
            netN1: this.calculateNet(
              n1,
              ["211", "212", "213", "214", "215"],
              ["2811", "2812", "2813", "2814", "2815"]
            ),
          },
          immobilisationsCorporelles: {
            terrains: {
              brut: this.sumAccounts(n, ["221", "222"]),
              amortissements: 0,
              net: this.sumAccounts(n, ["221", "222"]),
              netN1: this.sumAccounts(n1, ["221", "222"]),
            },
            batiments: {
              brut: this.sumAccounts(n, ["231", "232", "233", "234", "235"]),
              amortissements: this.sumAccounts(n, [
                "2831",
                "2832",
                "2833",
                "2834",
                "2835",
              ]),
              net: this.calculateNet(
                n,
                ["231", "232", "233", "234", "235"],
                ["2831", "2832", "2833", "2834", "2835"]
              ),
              netN1: this.calculateNet(
                n1,
                ["231", "232", "233", "234", "235"],
                ["2831", "2832", "2833", "2834", "2835"]
              ),
            },
            installationsEtAgencements: {
              brut: this.sumAccounts(n, ["241", "242", "243", "244", "245"]),
              amortissements: this.sumAccounts(n, [
                "2841",
                "2842",
                "2843",
                "2844",
                "2845",
              ]),
              net: this.calculateNet(
                n,
                ["241", "242", "243", "244", "245"],
                ["2841", "2842", "2843", "2844", "2845"]
              ),
              netN1: this.calculateNet(
                n1,
                ["241", "242", "243", "244", "245"],
                ["2841", "2842", "2843", "2844", "2845"]
              ),
            },
            materiel: {
              brut: this.sumAccounts(n, ["251", "252", "253", "254", "255"]),
              amortissements: this.sumAccounts(n, [
                "2851",
                "2852",
                "2853",
                "2854",
                "2855",
              ]),
              net: this.calculateNet(
                n,
                ["251", "252", "253", "254", "255"],
                ["2851", "2852", "2853", "2854", "2855"]
              ),
              netN1: this.calculateNet(
                n1,
                ["251", "252", "253", "254", "255"],
                ["2851", "2852", "2853", "2854", "2855"]
              ),
            },
          },
          immobilisationsFinancieres: {
            brut: this.sumAccounts(n, ["26", "27"]),
            provisions: this.sumAccounts(n, ["296", "297"]),
            net: this.calculateNet(n, ["26", "27"], ["296", "297"]),
            netN1: this.calculateNet(n1, ["26", "27"], ["296", "297"]),
          },
        },
        actifCirculant: {
          stocks: {
            brut: this.sumAccounts(n, [
              "31",
              "32",
              "33",
              "34",
              "35",
              "36",
              "37",
              "38",
            ]),
            provisions: this.sumAccounts(n, [
              "391",
              "392",
              "393",
              "394",
              "395",
              "396",
              "397",
              "398",
            ]),
            net: this.calculateNet(
              n,
              ["31", "32", "33", "34", "35", "36", "37", "38"],
              ["391", "392", "393", "394", "395", "396", "397", "398"]
            ),
            netN1: this.calculateNet(
              n1,
              ["31", "32", "33", "34", "35", "36", "37", "38"],
              ["391", "392", "393", "394", "395", "396", "397", "398"]
            ),
          },
          creances: {
            fournisseursAvances: {
              brut: this.sumAccounts(n, ["4091", "4092"]),
              provisions: this.sumAccounts(n, ["491", "492"]),
              net: this.calculateNet(n, ["4091", "4092"], ["491", "492"]),
              netN1: this.calculateNet(n1, ["4091", "4092"], ["491", "492"]),
            },
            clients: {
              brut: this.sumAccounts(n, ["411", "416"]),
              provisions: this.sumAccounts(n, ["491"]),
              net: this.calculateNet(n, ["411", "416"], ["491"]),
              netN1: this.calculateNet(n1, ["411", "416"], ["491"]),
            },
            autresCreances: {
              brut: this.sumAccounts(n, [
                "42",
                "43",
                "44",
                "45",
                "46",
                "47",
                "48",
              ]),
              provisions: this.sumAccounts(n, [
                "494",
                "495",
                "496",
                "497",
                "498",
              ]),
              net: this.calculateNet(
                n,
                ["42", "43", "44", "45", "46", "47", "48"],
                ["494", "495", "496", "497", "498"]
              ),
              netN1: this.calculateNet(
                n1,
                ["42", "43", "44", "45", "46", "47", "48"],
                ["494", "495", "496", "497", "498"]
              ),
            },
          },
          tresorerie: {
            brut: this.sumAccounts(n, [
              "50",
              "51",
              "52",
              "53",
              "54",
              "56",
              "57",
              "58",
            ]),
            provisions: 0,
            net: this.sumAccounts(n, [
              "50",
              "51",
              "52",
              "53",
              "54",
              "56",
              "57",
              "58",
            ]),
            netN1: this.sumAccounts(n1, [
              "50",
              "51",
              "52",
              "53",
              "54",
              "56",
              "57",
              "58",
            ]),
          },
        },
      },
      liabilities: {
        capitauxPropres: {
          capital: {
            n: this.getAccountBalance(n, "101"),
            n1: this.getAccountBalance(n1, "101"),
          },
          primes: {
            n: this.sumAccounts(n, ["1051", "1052", "1053", "1054"]),
            n1: this.sumAccounts(n1, ["1051", "1052", "1053", "1054"]),
          },
          reserves: {
            n: this.sumAccounts(n, ["106", "11"]),
            n1: this.sumAccounts(n1, ["106", "11"]),
          },
          reportANouveau: {
            n: this.getAccountBalance(n, "12"),
            n1: this.getAccountBalance(n1, "12"),
          },
          resultat: {
            n: this.getAccountBalance(n, "13"),
            n1: this.getAccountBalance(n1, "13"),
          },
          subventions: {
            n: this.sumAccounts(n, ["14"]),
            n1: this.sumAccounts(n1, ["14"]),
          },
          provisions: {
            n: this.sumAccounts(n, ["15"]),
            n1: this.sumAccounts(n1, ["15"]),
          },
        },
        dettesFinancieres: {
          emprunts: {
            n: this.sumAccounts(n, ["16", "17"]),
            n1: this.sumAccounts(n1, ["16", "17"]),
          },
          provisionsRisques: {
            n: this.sumAccounts(n, ["19"]),
            n1: this.sumAccounts(n1, ["19"]),
          },
        },
        passifCirculant: {
          fournisseurs: {
            n: this.sumAccounts(n, [
              "401",
              "402",
              "403",
              "404",
              "405",
              "406",
              "408",
            ]),
            n1: this.sumAccounts(n1, [
              "401",
              "402",
              "403",
              "404",
              "405",
              "406",
              "408",
            ]),
          },
          dettesFiscales: {
            n: this.sumAccounts(n, [
              "441",
              "442",
              "443",
              "444",
              "445",
              "446",
              "447",
            ]),
            n1: this.sumAccounts(n1, [
              "441",
              "442",
              "443",
              "444",
              "445",
              "446",
              "447",
            ]),
          },
          dettesSociales: {
            n: this.sumAccounts(n, ["42", "43"]),
            n1: this.sumAccounts(n1, ["42", "43"]),
          },
          autresDettes: {
            n: this.sumAccounts(n, ["46", "47", "48"]),
            n1: this.sumAccounts(n1, ["46", "47", "48"]),
          },
          tresoreriePassif: {
            n: this.sumAccounts(n, ["50", "56"]),
            n1: this.sumAccounts(n1, ["50", "56"]),
          },
        },
      },
    };
  }

  /**
   * Calcule les lignes du Bilan Paysage à partir de la table de correspondance
   * comptes → notes OHADA (fichier Excel de référence de l'utilisateur, voir
   * account-mapping.data.ts). Utilise une recherche "fail-soft" (jamais
   * d'exception) car cette fonction tourne au milieu de generateAllNotes():
   * une étiquette introuvable ne doit jamais faire échouer toute la
   * génération DSF, juste laisser cette ligne à 0 pour vérification manuelle.
   *
   * Certaines lignes n'ont pas de source fiable dans le fichier de référence
   * (avances sur immobilisations AP, capital non appelé CB) et restent à 0,
   * volontairement, plutôt que de deviner un numéro de compte non confirmé.
   */
  private generateBilanPaysageRows(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    const findLine = (code: string, needle: string) =>
      this.linesFor(code, folder).find((l) =>
        l.label.toLowerCase().includes(needle.toLowerCase())
      );
    const sum = (rows: any[], code: string, needle: string): number => {
      const l = findLine(code, needle);
      return l ? sumMappingLine(rows, l) : 0;
    };
    const sumMany = (rows: any[], code: string, needles: string[]): number =>
      needles.reduce((acc, needle) => acc + sum(rows, code, needle), 0);

    // { brutN, amortN, netN, netN1 } pour une ligne actif avec amortissement.
    const actifLine = (
      brutNeedles: { code: string; needles: string[] },
      amortNeedles: { code: string; needles: string[] } | null
    ) => {
      const brutN = sumMany(n, brutNeedles.code, brutNeedles.needles);
      const brutN1 = sumMany(n1, brutNeedles.code, brutNeedles.needles);
      const amortN = amortNeedles
        ? sumMany(n, amortNeedles.code, amortNeedles.needles)
        : 0;
      const amortN1 = amortNeedles
        ? sumMany(n1, amortNeedles.code, amortNeedles.needles)
        : 0;
      return {
        brutN,
        amortN,
        netN: brutN - amortN,
        netN1: brutN1 - amortN1,
      };
    };

    // { netN, netN1 } pour une ligne passif (pas de colonne brut/amort).
    const passifLine = (code: string, needles: string[]) => ({
      brutN: 0,
      amortN: 0,
      netN: sumMany(n, code, needles),
      netN1: sumMany(n1, code, needles),
    });

    // ── ACTIF ────────────────────────────────────────────────────────────
    const ae = actifLine(
      { code: "3A", needles: ["frais de développement"] },
      { code: "3C", needles: ["frais de développement"] }
    );
    const af = actifLine(
      { code: "3A", needles: ["brevets, licences"] },
      { code: "3C", needles: ["brevets, licences"] }
    );
    const ag = actifLine(
      { code: "3A", needles: ["fonds commercial"] },
      { code: "3C", needles: ["fonds commercial"] }
    );
    const ah = actifLine(
      { code: "3A", needles: ["autres immobilisations incorporelles"] },
      { code: "3C", needles: ["autres immobilisations incorporelles"] }
    );
    const ad = {
      brutN: ae.brutN + af.brutN + ag.brutN + ah.brutN,
      amortN: ae.amortN + af.amortN + ag.amortN + ah.amortN,
      netN: ae.netN + af.netN + ag.netN + ah.netN,
      netN1: ae.netN1 + af.netN1 + ag.netN1 + ah.netN1,
    };

    const aj = actifLine(
      {
        code: "3A",
        needles: ["terrains hors immeuble", "terrains - immeuble"],
      },
      null // terrains non amortis
    );
    const ak = actifLine(
      {
        code: "3A",
        needles: ["bâtiments hors immeuble", "bâtiments - immeuble"],
      },
      { code: "3C", needles: ["bâtiments hors immeuble"] }
    );
    const al = actifLine(
      { code: "3A", needles: ["aménagements, agencements"] },
      { code: "3C", needles: ["aménagements, agencements"] }
    );
    const am = actifLine(
      { code: "3A", needles: ["matériel, mobilier"] },
      { code: "3C", needles: ["matériel, mobilier"] }
    );
    const an = actifLine(
      { code: "3A", needles: ["matériel de transport"] },
      { code: "3C", needles: ["matériel de transport"] }
    );
    const ai = {
      brutN: aj.brutN + ak.brutN + al.brutN + am.brutN + an.brutN,
      amortN: aj.amortN + ak.amortN + al.amortN + am.amortN + an.amortN,
      netN: aj.netN + ak.netN + al.netN + am.netN + an.netN,
      netN1: aj.netN1 + ak.netN1 + al.netN1 + am.netN1 + an.netN1,
    };

    // AP: avances et acomptes versés sur immobilisation — pas de source
    // fiable dans le fichier de référence, laissé à 0 (saisie manuelle).
    const ap = { brutN: 0, amortN: 0, netN: 0, netN1: 0 };

    const ar = actifLine(
      { code: "4", needles: ["titres de participation"] },
      { code: "4", needles: ["dépréciations titres de participation"] }
    );
    const as_ = actifLine(
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
    const aq = {
      brutN: ar.brutN + as_.brutN,
      amortN: ar.amortN + as_.amortN,
      netN: ar.netN + as_.netN,
      netN1: ar.netN1 + as_.netN1,
    };

    const az = {
      brutN: ad.brutN + ai.brutN + ap.brutN + aq.brutN,
      amortN: ad.amortN + ai.amortN + ap.amortN + aq.amortN,
      netN: ad.netN + ai.netN + ap.netN + aq.netN,
      netN1: ad.netN1 + ai.netN1 + ap.netN1 + aq.netN1,
    };

    const ba = actifLine(
      {
        code: "5",
        needles: [
          "créances sur cessions d'immobilisations",
          "autres créances hors activités ordinaires",
        ],
      },
      { code: "5", needles: ["dépréciations des créances h.a.o."] }
    );
    const bb = actifLine(
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
    const bh = actifLine(
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
    const bi = actifLine(
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
    const bj = actifLine(
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
    const bc = {
      brutN: bh.brutN + bi.brutN + bj.brutN,
      amortN: bh.amortN + bi.amortN + bj.amortN,
      netN: bh.netN + bi.netN + bj.netN,
      netN1: bh.netN1 + bi.netN1 + bj.netN1,
    };
    const bk = {
      brutN: ba.brutN + bb.brutN + bc.brutN,
      amortN: ba.amortN + bb.amortN + bc.amortN,
      netN: ba.netN + bb.netN + bc.netN,
      netN1: ba.netN1 + bb.netN1 + bc.netN1,
    };

    const bq = actifLine(
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
    const br = actifLine(
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
    const bs = actifLine(
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
    const bt = {
      brutN: bq.brutN + br.brutN + bs.brutN,
      amortN: bq.amortN + br.amortN + bs.amortN,
      netN: bq.netN + br.netN + bs.netN,
      netN1: bq.netN1 + br.netN1 + bs.netN1,
    };

    const bu = actifLine(
      { code: "12", needles: ["ecart de conversion - actifs"] },
      null
    );

    const bz = {
      brutN: az.brutN + bk.brutN + bt.brutN + bu.brutN,
      amortN: az.amortN + bk.amortN + bt.amortN + bu.amortN,
      netN: az.netN + bk.netN + bt.netN + bu.netN,
      netN1: az.netN1 + bk.netN1 + bt.netN1 + bu.netN1,
    };

    // ── PASSIF (net uniquement) ─────────────────────────────────────────
    const ca = {
      brutN: 0,
      amortN: 0,
      netN: this.getAccountBalance(n, "101"),
      netN1: this.getAccountBalance(n1, "101"),
    };
    // CB: apporteurs capital non appelé — pas de source fiable, à saisir.
    const cb = { brutN: 0, amortN: 0, netN: 0, netN1: 0 };
    const cd = passifLine("14", [
      "prime d'émission",
      "primes d'apport",
      "prime de fusion",
      "prime de conversion",
      "autres primes",
    ]);
    // CE: écart de réévaluation — compte 106, confirmé par la note 3E.
    const ce = {
      brutN: 0,
      amortN: 0,
      netN: this.getAccountBalance(n, "106"),
      netN1: this.getAccountBalance(n1, "106"),
    };
    const cf = passifLine("14", [
      "réserves légales",
      "réserves statutaires",
      "réserves de plus-values nettes",
      "réserves d'attribution gratuite",
      "autres réserves réglementées",
    ]);
    const cg = passifLine("14", ["réserves libres"]);
    const ch = passifLine("14", ["report à nouveau"]);
    const cj = {
      brutN: 0,
      amortN: 0,
      netN: this.getAccountBalance(n, "13"),
      netN1: this.getAccountBalance(n1, "13"),
    };
    const cl = passifLine("15A", [
      "etat",
      "régions",
      "départements",
      "communes et collectivités",
      "entités publiques ou mixtes",
      "entités et organismes privés",
      "organismes internationaux",
      "autres",
    ]);
    const cm = passifLine("15A", [
      "amortissements dérogatoires",
      "plue-value de cession à réinvestir",
      "provision spéciale de réévaluation",
      "provisions réglementées relatives aux immobilisations",
      "provisions réglementées relatives aux stocks",
      "provisions pour investissement",
      "autres provisions et fonds réglementés",
    ]);
    const cp = {
      brutN: 0,
      amortN: 0,
      netN:
        ca.netN +
        cb.netN +
        cd.netN +
        ce.netN +
        cf.netN +
        cg.netN +
        ch.netN +
        cj.netN +
        cl.netN +
        cm.netN,
      netN1:
        ca.netN1 +
        cb.netN1 +
        cd.netN1 +
        ce.netN1 +
        cf.netN1 +
        cg.netN1 +
        ch.netN1 +
        cj.netN1 +
        cl.netN1 +
        cm.netN1,
    };

    const da = passifLine("16A", [
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
    const db = passifLine("16A", [
      "crédit bail immobilier",
      "crédit bail mobilier",
      "location vente",
      "intérêts courus",
      "autres dettes de location acquisition",
    ]);
    const dc = passifLine("16A", [
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
    const dd = {
      brutN: 0,
      amortN: 0,
      netN: da.netN + db.netN + dc.netN,
      netN1: da.netN1 + db.netN1 + dc.netN1,
    };
    const df = {
      brutN: 0,
      amortN: 0,
      netN: cp.netN + dd.netN,
      netN1: cp.netN1 + dd.netN1,
    };

    const dh = passifLine("5", [
      "fournisseurs d'investissements",
      "fournisseurs d'investissements effets à payer",
      "versements restant à effectuer sur titres de participation",
      "autres dettes hors activités ordinaires",
    ]);
    const di = passifLine("7", [
      "clients, avances reçues hors groupe",
      "clients, avances reçues groupe",
      "autres clients créditeurs",
    ]);
    const dj = passifLine("17", [
      "fournisseurs dettes en compte (hors groupe)",
      "fournisseurs effets à payer (hors groupe)",
      "fournisseurs dettes et effets à payer groupe",
      "fournisseurs factures non parvenues (hors groupe)",
      "fournisseurs factures non parvenues groupe",
    ]);
    const dk = passifLine("18", [
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
    const dm = passifLine("19", [
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
    const dn = passifLine("28", [
      "12. dépréciations et provisions pour risques à court",
      "13. dépréciations et provisions pour risques à court",
    ]);
    const dp = {
      brutN: 0,
      amortN: 0,
      netN: dh.netN + di.netN + dj.netN + dk.netN + dm.netN + dn.netN,
      netN1: dh.netN1 + di.netN1 + dj.netN1 + dk.netN1 + dm.netN1 + dn.netN1,
    };

    const dq = passifLine("20", [
      "escomptes de crédit de campagne",
      "escomptes de crédit ordinaires",
    ]);
    const dr = passifLine("20", [
      "banques locales",
      "banques autres états région",
      "autres banques",
      "banques intérêts courus",
      "crédit de trésorerie",
    ]);
    const dt = {
      brutN: 0,
      amortN: 0,
      netN: dq.netN + dr.netN,
      netN1: dq.netN1 + dr.netN1,
    };

    const dy = passifLine("12", ["ecart de conversion - passifs"]);

    const dz = {
      brutN: 0,
      amortN: 0,
      netN: df.netN + dp.netN + dt.netN + dy.netN,
      netN1: df.netN1 + dp.netN1 + dt.netN1 + dy.netN1,
    };

    const withIds = (obj: Record<string, any>) =>
      Object.entries(obj).map(([id, v]) => ({ id, ...v }));

    return {
      headerInfo: this.buildEntete(folder),
      actifRows: withIds({
        ad,
        ae,
        af,
        ag,
        ah,
        ai,
        aj,
        ak,
        al,
        am,
        an,
        ap,
        aq,
        ar,
        as: as_,
        az,
        ba,
        bb,
        bc,
        bh,
        bi,
        bj,
        bk,
        bq,
        br,
        bs,
        bt,
        bu,
        bz,
      }),
      passifRows: withIds({
        ca,
        cb,
        cd,
        ce,
        cf,
        cg,
        ch,
        cj,
        cl,
        cm,
        cp,
        da,
        db,
        dc,
        dd,
        df,
        dh,
        di,
        dj,
        dk,
        dm,
        dn,
        dp,
        dq,
        dr,
        dt,
        dy,
        dz,
      }),
    };
  }

  private generateIncomeStatement(nData: any, n1Data: any): any {
    const n = nData.rows || [];
    const n1 = n1Data?.rows || [];

    const produitsExploitation = this.sumAccounts(n, [
      "70",
      "71",
      "72",
      "73",
      "74",
      "75",
      "76",
      "77",
      "78",
    ]);
    const chargesExploitation = this.sumAccounts(n, [
      "60",
      "61",
      "62",
      "63",
      "64",
      "65",
      "66",
      "681",
      "691",
    ]);
    const resultatExploitation = produitsExploitation - chargesExploitation;

    const produitsFinanciers = this.sumAccounts(n, ["77"]);
    const chargesFinancieres = this.sumAccounts(n, ["67"]);
    const resultatFinancier = produitsFinanciers - chargesFinancieres;

    const produitsHAO = this.sumAccounts(n, [
      "81",
      "82",
      "84",
      "85",
      "86",
      "87",
      "88",
    ]);
    const chargesHAO = this.sumAccounts(n, ["83"]);
    const resultatHAO = produitsHAO - chargesHAO;

    const impotSurResultat = this.sumAccounts(n, ["89"]);
    const resultatNet =
      resultatExploitation + resultatFinancier + resultatHAO - impotSurResultat;

    return {
      exploitation: {
        ventes: {
          ventesMarchandises: {
            n: this.sumAccounts(n, ["701"]),
            n1: this.sumAccounts(n1, ["701"]),
          },
          ventesProduitsFinis: {
            n: this.sumAccounts(n, ["702", "703", "704"]),
            n1: this.sumAccounts(n1, ["702", "703", "704"]),
          },
          travauxServices: {
            n: this.sumAccounts(n, ["705", "706"]),
            n1: this.sumAccounts(n1, ["705", "706"]),
          },
          produitsAccessoires: {
            n: this.sumAccounts(n, ["707"]),
            n1: this.sumAccounts(n1, ["707"]),
          },
          variationStocks: {
            n: this.sumAccounts(n, ["72"]),
            n1: this.sumAccounts(n1, ["72"]),
          },
          productionImmobilisee: {
            n: this.sumAccounts(n, ["73"]),
            n1: this.sumAccounts(n1, ["73"]),
          },
          subventionsExploitation: {
            n: this.sumAccounts(n, ["74"]),
            n1: this.sumAccounts(n1, ["74"]),
          },
          autresProduits: {
            n: this.sumAccounts(n, ["75", "76", "77", "78"]),
            n1: this.sumAccounts(n1, ["75", "76", "77", "78"]),
          },
        },
        charges: {
          achatsMarchandises: {
            n: this.sumAccounts(n, ["601"]),
            n1: this.sumAccounts(n1, ["601"]),
          },
          variationStocks: {
            n: this.sumAccounts(n, ["6031"]),
            n1: this.sumAccounts(n1, ["6031"]),
          },
          achatsMatieresPremieres: {
            n: this.sumAccounts(n, ["602"]),
            n1: this.sumAccounts(n1, ["602"]),
          },
          autresAchats: {
            n: this.sumAccounts(n, ["604", "605", "606", "607", "608"]),
            n1: this.sumAccounts(n1, ["604", "605", "606", "607", "608"]),
          },
          transports: {
            n: this.sumAccounts(n, ["61"]),
            n1: this.sumAccounts(n1, ["61"]),
          },
          servicesExterieurs: {
            n: this.sumAccounts(n, ["62", "63"]),
            n1: this.sumAccounts(n1, ["62", "63"]),
          },
          impotsTaxes: {
            n: this.sumAccounts(n, ["64"]),
            n1: this.sumAccounts(n1, ["64"]),
          },
          autresCharges: {
            n: this.sumAccounts(n, ["65"]),
            n1: this.sumAccounts(n1, ["65"]),
          },
          chargesPersonnel: {
            n: this.sumAccounts(n, ["66"]),
            n1: this.sumAccounts(n1, ["66"]),
          },
          chargesFinancieres: {
            n: this.sumAccounts(n, ["67"]),
            n1: this.sumAccounts(n1, ["67"]),
          },
          dotationsAmortissements: {
            n: this.sumAccounts(n, ["681", "691"]),
            n1: this.sumAccounts(n1, ["681", "691"]),
          },
          dotationsProvisions: {
            n: this.sumAccounts(n, ["689", "699"]),
            n1: this.sumAccounts(n1, ["689", "699"]),
          },
        },
      },
      hao: {
        produits: {
          n: this.sumAccounts(n, ["81", "82", "84", "85", "86", "87", "88"]),
          n1: this.sumAccounts(n1, ["81", "82", "84", "85", "86", "87", "88"]),
        },
        charges: {
          n: this.sumAccounts(n, ["83"]),
          n1: this.sumAccounts(n1, ["83"]),
        },
      },
      resultat: {
        resultatExploitation: {
          n: resultatExploitation,
          n1:
            this.sumAccounts(n1, [
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "78",
            ]) -
            this.sumAccounts(n1, [
              "60",
              "61",
              "62",
              "63",
              "64",
              "65",
              "66",
              "681",
              "691",
            ]),
        },
        resultatFinancier: {
          n: resultatFinancier,
          n1: this.sumAccounts(n1, ["77"]) - this.sumAccounts(n1, ["67"]),
        },
        resultatHAO: {
          n: resultatHAO,
          n1:
            this.sumAccounts(n1, ["81", "82", "84", "85", "86", "87", "88"]) -
            this.sumAccounts(n1, ["83"]),
        },
        impotSurResultat: {
          n: impotSurResultat,
          n1: this.sumAccounts(n1, ["89"]),
        },
        resultatNet: {
          n: resultatNet,
          n1: this.getAccountBalance(n1, "13"),
        },
      },
    };
  }

  private generateTaxTables(
    nData: any,
    n1Data: any,
    folder: FolderWithRelations
  ): any {
    const n = nData.rows || [];
    const n1 = n1Data?.rows || [];

    const resultatComptable = this.getAccountBalance(n, "13");

    return {
      determinationResultatFiscal: {
        resultatComptable,
        reintegrations: {
          amendesEtPenalites: 0,
          chargesNonDeductibles: 0,
          depreciationNonDeductible: 0,
          autresReintegrations: 0,
          total: 0,
        },
        deductions: {
          provisionsExonerees: 0,
          amortissementsDifferes: 0,
          autresDeductions: 0,
          deficitsAnterieurs: 0,
          total: 0,
        },
        resultatFiscal: resultatComptable,
        impotSurSocietes: resultatComptable * 0.3,
      },
      cf1Bis: this.generateCF1Bis(n),
      cf1Ter: this.generateCF1Ter(n),
      cf1Quater: this.generateCF1Quater(n),
      cf2: this.generateCF2(n),
      cf2Bis: this.generateCF2Bis(n),
      cf2Ter: this.generateCF2Ter(n),
      amortissements: {
        immobilisations: [],
        totalAmortissements: this.sumAccounts(n, [
          "281",
          "282",
          "283",
          "284",
          "285",
        ]),
      },
      provisions: {
        provisionsReglementees: [],
        provisionsRisques: [],
        total: this.sumAccounts(n, ["15", "19"]),
      },
    };
  }

  private generateCF1Bis(n: any[]): any {
    return {
      title:
        "TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT: MINIMUM DE PERCEPTION",
      chiffreAffaires: this.sumAccounts(n, ["70", "71"]),
      minimumPerception: this.sumAccounts(n, ["70", "71"]) * 0.011,
    };
  }

  private generateCF1Ter(n: any[]): any {
    return {
      title: "MINIMUM DE PERCEPTION",
      chiffreAffairesHT: this.sumAccounts(n, ["70", "71"]),
      tauxMinimum: 0.011,
      minimumCalcule: this.sumAccounts(n, ["70", "71"]) * 0.011,
    };
  }

  private generateCF1Quater(n: any[]): any {
    return {
      title:
        "RECAPITULATIF DES VERSEMENTS D'ACOMPTES ET DE RETENUES SUBIES D'IMPOT SOCIETE ET D'ERENCE",
      acomptesVerses: 0,
      retenuesSubies: 0,
      total: 0,
    };
  }

  private generateCF2(n: any[]): any {
    const ca = this.sumAccounts(n, ["70", "71"]);
    const tvaBrute = ca * 0.1925;
    const tvaDeductible = this.sumAccounts(n, ["4452"]);

    return {
      title: "CALCUL DE REGULARISATION ANNUELLE DE LA TVA",
      chiffreAffairesHT: ca,
      tvaBrute,
      tvaDeductible,
      tvaNette: tvaBrute - tvaDeductible,
    };
  }

  private generateCF2Bis(n: any[]): any {
    return {
      title: "RECAPITULATIF DES VERSEMENTS EFFECTUES ET RETENUS SUBIES",
      versementsMensuels: [],
      total: 0,
    };
  }

  private generateCF2Ter(n: any[]): any {
    return {
      title: "SITUATION NETTE DE TVA",
      tvaDue: 0,
      tvaPayee: 0,
      solde: 0,
    };
  }

  private async generateAllNotes(
    nData: any,
    n1Data: any,
    nBalance: any,
    n1Balance: any,
    folder: FolderWithRelations
  ): Promise<any> {
    const n = nData.rows || [];
    const n1 = n1Data?.rows || [];
    const clientType = folder.client.clientType || "NORMAL";

    // Un seul aller-retour DB pour toutes les notes couvertes par
    // ACCOUNT_MAPPING (défauts + éventuelles surcharges du dossier/client).
    // Attaché sur `folder` pour rester synchrone partout en aval (voir le
    // commentaire sur FolderWithRelations.resolvedMappings plus haut).
    folder.resolvedMappings = await resolveAllMappingLines({
      id: folder.id,
      clientId: folder.clientId,
    });

    const notes: any = {};

    // Chaque note est isolée dans son propre try/catch: avant ce
    // changement, seul le Bilan Paysage était protégé (voir l'ancien
    // commentaire "notes 1-35 non affectées" — un aveu que TOUTES les
    // autres notes ne l'étaient pas). Comme les 63 notes sont assignées
    // en séquence dans une seule fonction, la moindre exception levée par
    // UNE SEULE d'entre elles interrompait généreAllNotes() et faisait
    // disparaître silencieusement toutes les notes suivantes — expliquant
    // des générations tronquées à un nombre de notes imprévisible selon
    // la balance importée. Chaque note échouée est maintenant journalisée
    // et simplement absente du résultat, sans jamais empêcher les
    // suivantes de se générer, dans le même ordre qu'avant.
    const safe = (key: string, fn: () => any) => {
      try {
        notes[key] = fn();
      } catch (err) {
        console.error(
          `Erreur génération note "${key}" (les autres notes ne sont pas affectées):`,
          err
        );
      }
    };
    const safeAsync = async (key: string, fn: () => Promise<any>) => {
      try {
        notes[key] = await fn();
      } catch (err) {
        console.error(
          `Erreur génération note "${key}" (les autres notes ne sont pas affectées):`,
          err
        );
      }
    };

    // Jeu de notes "normal" (DSF complète OHADA) — réservé aux clients qui
    // ne sont ni SMT ni ASSURANCE. Ces deux régimes ont leur propre liasse
    // dédiée (voir plus bas) et ne doivent PAS recevoir en plus les ~50
    // notes normales : avant ce changement, tous les clients recevaient ce
    // bloc puis, en plus, leurs notes de régime — un client SMT ou
    // ASSURANCE se retrouvait avec les deux liasses mélangées alors que ce
    // sont des régimes de déclaration distincts et exclusifs.
    if (clientType !== "ASSURANCE" && clientType !== "SMT") {
      await safeAsync("note1", () => this.generateNote1(folder, n));
      safe("note2", () => this.generateNote2());
      await safeAsync("note3A", () => this.generateNote3A(n, n1, folder));
      safe("note3B", () => this.generateNote3B(n, n1, folder));
      safe("note3C", () => this.generateNote3C(n, n1, folder));
      safe("c1Note3C", () => this.generateC1Note3C(folder));
      safe("note3D", () => this.generateNote3D(n, folder));
      safe("note3E", () => this.generateNote3E(n, folder));
      safe("note3F", () => this.generateNote3F(n1, folder));
      await safeAsync("note4", () => this.generateNote4(n, n1, folder));
      safe("note5", () => this.generateNote5(n, n1, folder));
      safe("note6", () => this.generateNote6(n, n1, folder));
      await safeAsync("note7", () => this.generateNote7(n, n1, folder));
      safe("note8", () => this.generateNote8(n, n1, folder));
      safe("note9", () => this.generateNote9(n, n1, folder));
      safe("note10", () => this.generateNote10(n, n1, folder));
      safe("note11", () => this.generateNote11(n, n1, folder));
      safe("note12", () => this.generateNote12(folder));
      safe("note13", () => this.generateNote13(folder));
      safe("note14", () => this.generateNote14(n, n1, folder));
      safe("note15A", () => this.generateNote15A(n, n1, folder));
      safe("note15B", () => this.generateNote15B(n, n1, folder));
      safe("note16A", () => this.generateNote16A(n, n1, folder));
      safe("note16B", () => this.generateNote16B(n, n1, folder));
      safe("note16BBis", () => this.generateNote16BBis(n, n1, folder));
      safe("note16C", () => this.generateNote16C(folder));
      safe("note17", () => this.generateNote17(n, n1, folder));
      safe("c1Note17", () => this.generateC1Note17(n, folder));
      safe("note18", () => this.generateNote18(n, n1, folder));
      safe("note19", () => this.generateNote19(n, n1, folder));
      safe("note20", () => this.generateNote20(n, n1, folder));
      safe("note21", () => this.generateNote21(n, n1, folder));
      safe("note22", () => this.generateNote22(n, n1, folder));
      safe("note23", () => this.generateNote23(n, n1, folder));
      safe("note24", () => this.generateNote24(n, n1, folder));
      safe("note25", () => this.generateNote25(n, n1, folder));
      safe("c1Note25", () => this.generateC1Note25(n, folder));
      safe("c2Note25", () => this.generateC2Note25(n, folder));
      safe("note26", () => this.generateNote26(n, n1, folder));
      safe("note27A", () => this.generateNote27A(n, n1, folder));
      safe("c1Note27A", () => this.generateC1Note27A(n, folder));
      safe("note27B", () => this.generateNote27B(folder));
      safe("note28", () => this.generateNote28(n, n1, folder));
      safe("c1Note28", () => this.generateC1Note28(n, folder));
      safe("c2Note28", () => this.generateC2Note28(n, folder));
      safe("note29", () => this.generateNote29(n, n1, folder));
      safe("note30", () => this.generateNote30(n, n1, folder));
      safe("note31", () => this.generateNote31(n, n1, folder));
      safe("note32", () => this.generateNote32(folder));
      safe("note33", () => this.generateNote33(folder));
      safe("note34", () => this.generateNote34(n, n1, folder));
      safe("note35", () => this.generateNote35(folder));
      await safeAsync("cf1", () => this.generateCF1(n, folder));
      safe("cf1Bis", () => this.generateCF1Bis(n));
      safe("cf1Ter", () => this.generateCF1Ter(n));
      safe("cf1Quater", () => this.generateCF1Quater(n));
      safe("cf2", () => this.generateCF2(n));
      safe("cf2Bis", () => this.generateCF2Bis(n));
      safe("cf2Ter", () => this.generateCF2Ter(n));
      safe("bilanPaysage", () => this.generateBilanPaysageRows(n, n1, folder));
      // Lit `notes` déjà rempli (ex. le résultat de note34) — doit rester
      // après les notes dont elle dépend, ce qui est déjà le cas ici.
      safe("tft", () => this.generateTFT(n, n1, notes, nBalance, n1Balance));
      safe("ficheR2", () => this.generateFicheR2(n, folder));
      safe("ficheR3", () => this.generateFicheR3(folder));
    }

    // Jeu de notes propre au régime du client — exclusif du bloc "normal"
    // ci-dessus.
    if (clientType === "ASSURANCE") {
      // Add assurance-specific notes
      safe("bilanActif", () => this.generateBilanActif(n));
      safe("bilanPassif", () => this.generateBilanPassif(n));
      safe("charges", () => this.generateCharges(n));
      safe("compteGeneral", () => this.generateCompteGeneral(n));
      safe("etatC4", () => this.generateEtatC4(n));
      safe("etatC11", () => this.generateEtatC11(n));
      safe("etatC11Vie", () => this.generateEtatC11Vie(n));
      safe("produits", () => this.generateProduits(n));
      // Add other assurance notes...
    } else if (clientType === "SMT") {
      // Add SMT-specific notes
      safe("grilleAnalyseNotesSMT", () => this.generateGrilleAnalyseNotesSMT(n));
      safe("modBilan", () => this.generateModBilan(n));
      safe("note1Smt", () => this.generateNote1Smt(n));
      safe("note2Smt", () => this.generateNote2Smt(n));
      safe("note3Smt", () => this.generateNote3Smt(n));
      safe("note4Smt", () => this.generateNote4Smt(n));
      safe("note5Smt", () => this.generateNote5Smt(n));
      safe("note6Smt", () => this.generateNote6Smt(n));
      // Add other SMT notes...
    }

    return notes;
  }

  /**
   * En-tête commun à tous les composants de notes (ils lisent tous
   * `noteData.entete`).
   */
  private buildEntete(folder: FolderWithRelations): any {
    return {
      entityName: folder.client?.name || null,
      fiscalYear: folder.fiscalYear ? String(folder.fiscalYear) : null,
      idNumber: folder.client?.taxNumber || null,
      duration: "12",
    };
  }

  /**
   * Construit les lignes d'une note à partir de la table de correspondance
   * OHADA. Chaque ligne de la table produit TOUJOURS une ligne de sortie,
   * même à 0, pour que le tableau s'affiche complet côté frontend.
   * `indexes` permet de ne retenir qu'un sous-ensemble ordonné de lignes
   * (ex. séparer charges et produits d'une même note).
   */
  /** Lignes de mapping effectives (surcharge DB si résolue sur `folder`,
   * sinon fallback statique) — remplacement direct de getMappingLines(). */
  private linesFor(noteCode: string, folder?: FolderWithRelations): MappingLine[] {
    return folder?.resolvedMappings?.get(noteCode) ?? getMappingLines(noteCode);
  }

  /** Équivalent config-aware de getMappingLine() (recherche par fragment de
   * libellé, insensible à la casse). */
  private lineFor(
    noteCode: string,
    labelIncludes: string,
    folder?: FolderWithRelations
  ): MappingLine {
    const lines = this.linesFor(noteCode, folder);
    const needle = labelIncludes.toLowerCase();
    const found = lines.find((l) => l.label.toLowerCase().includes(needle));
    if (!found) {
      throw new Error(
        `[dsf-generator] Aucune ligne trouvée pour note "${noteCode}" avec libellé contenant "${labelIncludes}"`
      );
    }
    return found;
  }

  private buildNoteRows(
    noteCode: string,
    n: any[],
    n1: any[],
    options: {
      indexes?: number[];
      extra?: (valueN: number, valueN1: number, index: number) => any;
    } = {},
    folder?: FolderWithRelations
  ): any[] {
    const lines = this.linesFor(noteCode, folder);
    const picked =
      options.indexes !== undefined
        ? options.indexes.map((i) => lines[i]).filter(Boolean)
        : lines;

    return picked.map((line, i) => {
      const yearN = sumMappingLine(n, line);
      const yearN1 = sumMappingLine(n1, line);
      return {
        id: String(i + 1),
        label: line.label,
        yearN,
        yearN1,
        ...(options.extra ? options.extra(yearN, yearN1, i) : {}),
      };
    });
  }

  /** Colonnes d'échéancier (1 an / 1-5 ans / +5 ans). Sans information
   * d'échéance dans la balance, tout est classé à un an au plus. */
  private agingLong(yearN: number): any {
    return { lessThan1Year: yearN, oneToFiveYears: 0, moreThanFiveYears: 0 };
  }

  /** Colonnes d'échéancier (1 an / 1-2 ans / +2 ans). */
  private agingShort(yearN: number): any {
    return { lessThan1Year: yearN, oneToTwoYears: 0, moreThanTwoYears: 0 };
  }

  private async generateNote1(
    folder: FolderWithRelations,
    n: any[]
  ): Promise<any> {
    // Table OHADA note "1", 3 groupes: 0-3 = dettes financières,
    // 4-7 = dettes de location-acquisition, 8-15 = dettes du passif circulant.
    // Les colonnes garanties (hypothèques/nantissements/autres sûretés) ne
    // sont pas déductibles de la balance: laissées à 0, à saisir par le
    // comptable.
    const toDebtRow = (line: any, i: number) => ({
      id: String(i + 1),
      libelle: line.label,
      note: "",
      grossAmount: sumMappingLine(n, line),
      mortgages: 0,
      pledges: 0,
      others: 0,
    });

    const lines = this.linesFor("1", folder);
    const pick = (indexes: number[]) =>
      indexes.map((idx, i) => toDebtRow(lines[idx], i));

    return {
      entete: this.buildEntete(folder),
      title: "DETTES GARANTIES PAR DES SURETES REELLES",
      financialDebts: pick([0, 1, 2, 3]),
      leasingDebts: pick([4, 5, 6, 7]),
      currentLiabilities: pick([8, 9, 10, 11, 12, 13, 14, 15]),
      // Engagements financiers: hors bilan, sans compte comptable dédié —
      // les 7 libellés standards OHADA sont toujours émis, montants à 0
      // (saisie manuelle par le comptable).
      commitments: [
        "Engagements consentis à des entités liées",
        "Primes de remboursement non échues",
        "Avals, cautions, garanties",
        "Hypothèques, nantissements, gages, autres",
        "Effets escomptés non échus",
        "Créances commerciales et professionnelles cédées",
        "Abandons de créances conditionnels",
      ].map((libelle) => ({
        libelle,
        engagementsGiven: 0,
        engagementsReceived: 0,
      })),
    };
  }

  private generateNote2(): any {
    return {
      title: "INFORMATIONS OBLIGATOIRES",
      baseEvaluation: "Coûts historiques",
      methodesAmortissement: "Linéaire",
      methodesProvisions: "Au cas par cas",
    };
  }

  private async generateNote3A(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): Promise<any> {
    // Table OHADA note "3A" (tableau de mouvements des immobilisations
    // brutes). Ordre des lignes: 0-3 = incorporelles, 4-10 = corporelles,
    // 11 = avances sur incorporelles (251), 12 = avances sur corporelles
    // (252), 13-14 = financières.
    // Ouverture = solde N-1, clôture = solde N. Les acquisitions et cessions
    // de la période sont lues sur les mouvements du compte (débit =
    // acquisition, crédit = cession/sortie). Les virements de poste à poste
    // et les réévaluations ne sont pas isolables dans la balance: à 0.
    const lines = this.linesFor("3A", folder);
    const buildMovementRows = (indexes: number[]) =>
      indexes.map((idx, i) => {
        const line = lines[idx];
        return {
          id: String(i + 1),
          libelle: line.label,
          montantBrutOuverture: sumMappingLine(n1, line),
          acquisitions: sumMovement(n, line.accounts, "MD", line.excludedAccounts),
          virementsPosteAPoste: 0,
          reevaluation: 0,
          cessions: sumMovement(n, line.accounts, "MC", line.excludedAccounts),
          virementsSortie: 0,
          montantBrutCloture: sumMappingLine(n, line),
        };
      });

    return {
      entete: this.buildEntete(folder),
      title: "IMMOBILISATIONS BRUTES",
      immobilisationsIncorporelles: buildMovementRows([0, 1, 2, 3]),
      immobilisationsCorporelles: buildMovementRows([4, 5, 6, 7, 8, 9, 10]),
      avancesAcomptes: buildMovementRows([11, 12]),
      immobilisationsFinancieres: buildMovementRows([13, 14]),
    };
  }

  private generateNote3B(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Biens pris en location-acquisition (crédit-bail): mêmes rubriques que
    // la note 3A, mais restreintes aux biens LOUÉS plutôt que possédés. Ce
    // distingo n'est pas déductible du numéro de compte dans le plan
    // comptable général — un compte 245 (matériel de transport) ne dit pas
    // si le véhicule est loué ou possédé — donc ce tableau est
    // intégralement à saisie manuelle par le comptable (comme les
    // engagements financiers de la note 1), les lignes étant toujours
    // émises pour que le tableau s'affiche complet.
    const toRow = (label: string) => ({
      libelle: label,
      natureContrat: "",
      montantBrutOuverture: 0,
      acquisitions: 0,
      virementsPosteAPoste: 0,
      reevaluation: 0,
      cessions: 0,
      virementsSortie: 0,
    });

    return {
      entete: this.buildEntete(folder),
      title: "BIENS PRIS EN LOCATION ACQUISITION",
      immobilisationsIncorporelles: [
        "Brevets, licences, logiciels et droits similaires",
        "Fonds commercial et droit au bail",
        "Autres immobilisations incorporelles",
      ].map(toRow),
      immobilisationsCorporelles: [
        "Terrains",
        "Bâtiments",
        "Aménagements, agencements et installations",
        "Matériel, mobilier et actifs biologiques",
        "Matériel de transport",
      ].map(toRow),
    };
  }

  private generateNote3C(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "3C" (amortissements cumulés): 0-3 = incorporelles
    // (2811-2818), 4-8 = corporelles (282-2845).
    // Ouverture = cumul N-1, augmentations = dotations (mouvement créditeur),
    // diminutions = reprises/sorties (mouvement débiteur).
    const lines = this.linesFor("3C", folder);
    const buildRows = (indexes: number[]) =>
      indexes.map((idx, i) => {
        const line = lines[idx];
        return {
          id: String(i + 1),
          libelle: line.label,
          openingCumulative: sumMappingLine(n1, line),
          augmentations: sumMovement(n, line.accounts, "MC", line.excludedAccounts),
          diminutions: sumMovement(n, line.accounts, "MD", line.excludedAccounts),
        };
      });

    return {
      entete: this.buildEntete(folder),
      title: "IMMOBILISATIONS: AMORTISSEMENTS",
      immobilisationsIncorporelles: buildRows([0, 1, 2, 3]),
      immobilisationsCorporelles: buildRows([4, 5, 6, 7, 8]),
    };
  }

  private generateC1Note3C(folder: FolderWithRelations): any {
    // Table C1/Note3C (suivi des amortissements différés en période
    // déficitaire): mécanisme purement fiscal — report d'un exercice
    // déficitaire à imputer sur les exercices bénéficiaires suivants. Comme
    // Note3D/Note3F, ce n'est pas déductible de la seule balance (c'est un
    // suivi de déclaration fiscale, pas un solde de compte) — lignes toujours
    // émises avec l'entête pour que le tableau s'affiche complet et soit
    // éditable par le comptable, plutôt qu'un tableau vide.
    const toRow = (label: string) => ({
      libelle: label,
      reportAmortissementsAnterieurs: 0,
      amortissementsDifferesExercice: 0,
      imputationExercice: 0,
      totalReportNonImputes: 0,
    });

    return {
      entete: this.buildEntete(folder),
      title:
        "TABLEAU DE SUIVI DES AMORTISSEMENTS DEDUCTIBLES REPUTES DIFFERES EN PERIODE DEFICITAIRE",
      amortissementsDifferes: [
        "Immobilisations corporelles",
        "Immobilisations incorporelles",
      ].map(toRow),
      total: 0,
    };
  }

  private generateNote3D(n: any[], folder: FolderWithRelations): any {
    // Table OHADA note "3D" (plus/moins-values de cession): mêmes rubriques
    // que les notes 3A/3B/3C (incorporelles/corporelles) + 2 rubriques
    // financières. Comme la note 3B, le montant brut cédé, les
    // amortissements pratiqués sur CE bien précis et son prix de cession
    // ne sont pas déductibles rubrique par rubrique depuis le solde agrégé
    // d'un compte (un compte 245 "Matériel de transport" ne dit pas QUEL
    // véhicule a été cédé, ni son prix de vente) — saisie manuelle par le
    // comptable, lignes toujours émises pour que le tableau s'affiche
    // complet. La valeur nette (C=A-B) et la plus/moins-value (E=D-C) sont
    // calculées côté frontend, pas stockées ici.
    const toRow = (label: string) => ({
      libelle: label,
      montantBrut: 0,
      amortissementsPratiques: 0,
      prixCessions: 0,
    });

    return {
      entete: this.buildEntete(folder),
      title: "IMMOBILISATIONS: PLUS ET MOINS VALUE DE CESSION",
      immobilisationsIncorporelles: [
        "Frais de développement et de prospection",
        "Brevets, licences, logiciels et droits similaires",
        "Fonds commercial et droit au bail",
        "Autres immobilisations incorporelles",
      ].map(toRow),
      immobilisationsCorporelles: [
        "Terrains",
        "Bâtiments",
        "Aménagements, agencements et installations",
        "Matériel, mobilier et actifs biologiques",
        "Matériel de transport",
      ].map(toRow),
      immobilisationsFinancieres: [
        "Titres de participations",
        "Autres immobilisations financières",
      ].map(toRow),
      justification: "",
    };
  }

  private generateNote3E(n: any[], folder: FolderWithRelations): any {
    const total = sumMappingLine(n, this.lineFor("3E", "écart incorporé", folder));
    return {
      entete: this.buildEntete(folder),
      title: "INFORMATIONS SUR LES REEVALUATIONS EFFECTUEES PAR L'ENTITE",
      reevaluations: [],
      total,
    };
  }

  private generateNote3F(n1: any[], folder: FolderWithRelations): any {
    // Table OHADA note "3F": étalement des charges immobilisées (frais
    // d'établissement 201, charges à répartir sur plusieurs exercices 202,
    // primes de remboursement des obligations 206). Le "montant global à
    // étaler au 1er janvier" est directement lisible dans la balance: c'est
    // le solde débiteur de CLÔTURE de l'exercice précédent (= ouverture de
    // l'exercice courant), d'où le paramètre `n1` plutôt que `n`. En
    // revanche la durée d'étalement retenue, le détail par compte de charge
    // ayant reçu la quote-part amortie cette année, et les totaux des
    // exercices antérieurs (N-1 à N-4) ne sont pas déductibles de la
    // balance courante: saisie manuelle, avec les repères d'exemple
    // (comptes 60 à 63) de l'imprimé DGI toujours pré-remplis.
    const placeholderRows = () => [
      { compte: "60...", montant: 0 },
      { compte: "61...", montant: 0 },
      { compte: "62...", montant: 0 },
      { compte: "63...", montant: 0 },
      { compte: "...", montant: 0 },
    ];

    const toCategory = (key: string, label: string, account: string) => ({
      key,
      label,
      montantGlobal: sumBySide(n1, [account], "SD"),
      dureeEtalement: "",
      exerciceNRows: placeholderRows(),
      totalExerciceN1: 0,
      totalExerciceN2: 0,
      totalExerciceN3: 0,
      totalExerciceN4: 0,
    });

    return {
      entete: this.buildEntete(folder),
      title: "TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES",
      categories: [
        toCategory("fraisEtablissement", "Frais d'établissement", "201"),
        toCategory(
          "chargesARepartir",
          "Charges à répartir sur plusieurs exercice",
          "202"
        ),
        toCategory(
          "primesRemboursement",
          "Primes de remboursement des obligations",
          "206"
        ),
      ],
    };
  }

  private async generateNote4(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): Promise<any> {
    // Table OHADA note "4", 10 lignes: 0-7 = immobilisations financières
    // brutes (26, 271-278), 8-9 = dépréciations (296, 297).
    return {
      entete: this.buildEntete(folder),
      title: "IMMOBILISATIONS FINANCIERES",
      immobilisations: this.buildNoteRows("4", n, n1, {
        indexes: [0, 1, 2, 3, 4, 5, 6, 7],
        extra: (yearN, yearN1) => ({
          variation: yearN - yearN1,
          oneYearPlus: 0,
          twoYearsPlus: 0,
          fourYearsPlus: 0,
        }),
      }, folder),
      depreciations: this.buildNoteRows("4", n, n1, {
        indexes: [8, 9],
        extra: (yearN, yearN1) => ({
          variation: yearN - yearN1,
          oneYearPlus: 0,
          twoYearsPlus: 0,
          fourYearsPlus: 0,
        }),
      }, folder),
      // Détail des filiales/participations: information juridique non
      // déductible de la balance, à saisir par le comptable.
      subsidiaries: [],
      filialesParticipations: [],
    };
  }

  private generateNote5(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "5": 0-1 = créances H.A.O. (485, 488), 2 =
    // dépréciations (498), 3-6 = dettes H.A.O. (481x, 482, 4813, 484).
    return {
      entete: this.buildEntete(folder),
      title: "ACTIF ET PASSIF CIRCULANT HAO",
      assetsData: this.buildNoteRows("5", n, n1, {
        indexes: [0, 1, 2],
        extra: () => ({ isTotal: false }),
      }, folder),
      liabilitiesData: this.buildNoteRows("5", n, n1, {
        indexes: [3, 4, 5, 6],
        extra: () => ({ isTotal: false }),
      }, folder),
      actifCirculantHAO: this.buildNoteRows("5", n, n1, { indexes: [0, 1, 2] }, folder),
      dettesHAO: this.buildNoteRows("5", n, n1, { indexes: [3, 4, 5, 6] }, folder),
    };
  }

  private generateNote6(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "6": 0-7 = stocks et en-cours (31-38),
    // 8 = dépréciations des stocks (39).
    const stocks = this.buildNoteRows("6", n, n1, {
      indexes: [0, 1, 2, 3, 4, 5, 6, 7],
      extra: () => ({ isTotal: false }),
    }, folder);
    const depreciations = this.buildNoteRows("6", n, n1, { indexes: [8] }, folder);
    const totalBrutN = stocks.reduce((t, r) => t + r.yearN, 0);
    const totalBrutN1 = stocks.reduce((t, r) => t + r.yearN1, 0);
    const depN = depreciations.reduce((t, r) => t + r.yearN, 0);
    const depN1 = depreciations.reduce((t, r) => t + r.yearN1, 0);

    return {
      entete: this.buildEntete(folder),
      title: "STOCKS ET ENCOURS",
      stocksEnCours: stocks.map((r) => ({
        libelle: r.label,
        anneeN: r.yearN,
        anneeN1: r.yearN1,
      })),
      stocks,
      depreciations,
      totalBrut: { yearN: totalBrutN, yearN1: totalBrutN1 },
      totalNet: { yearN: totalBrutN - depN, yearN1: totalBrutN1 - depN1 },
    };
  }

  private async generateNote7(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): Promise<any> {
    // Table OHADA note "7": 0-8 = créances clients (4111-418),
    // 9 = dépréciations (491), 10-12 = clients créditeurs (4191, 4192, 4194/4198).
    const receivables = this.buildNoteRows("7", n, n1, {
      indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      extra: (yearN) => ({
        oneYearOrLess: yearN,
        oneToTwoYears: 0,
        moreThanTwoYears: 0,
      }),
    }, folder);

    return {
      entete: this.buildEntete(folder),
      title: "CLIENTS",
      clientReceivables: receivables,
      creancesClients: receivables,
      depreciations: this.buildNoteRows("7", n, n1, {
        indexes: [9],
        extra: (yearN) => ({
          oneYearOrLess: yearN,
          oneToTwoYears: 0,
          moreThanTwoYears: 0,
        }),
      }, folder),
      clientCreditors: this.linesFor("7", folder)
        .slice(10, 13)
        .map((line, i) => ({
          id: String(i + 1),
          label: line.label,
          amount: sumMappingLine(n, line),
        })),
    };
  }

  private generateNote8(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "8": 0-9 = autres créances (421-188),
    // 10 = dépréciations (492-497).
    const withAging = (yearN: number) => ({
      oneYearOrLess: yearN,
      oneToTwoYears: 0,
      moreThanTwoYears: 0,
    });

    return {
      entete: this.buildEntete(folder),
      title: "AUTRES CREANCES",
      autresCreances: this.buildNoteRows("8", n, n1, {
        indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        extra: (yearN) => withAging(yearN),
      }, folder),
      // Ligne 11 de la table ("Dépréciations des autres créances", 492-497):
      // une seule valeur (exercice courant), pas un tableau — l'imprimé
      // n'a qu'une colonne pour cette ligne, contrairement aux créances
      // elle-mêmes qui ont Année N/N-1/échéancier.
      depreciations: sumMappingLine(n, this.linesFor("8", folder)[10]),
      justifications: {
        variation: "",
        montant: "",
        anciennes: "",
        depreciation: "",
        compteTransitoire: "",
      },
    };
  }

  private generateNote9(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "9": 0-6 = titres de placement (501-508),
    // 7 = dépréciations (590).
    const titres = this.buildNoteRows("9", n, n1, {
      indexes: [0, 1, 2, 3, 4, 5, 6],
      extra: () => ({ isTotal: false }),
    }, folder);
    const depreciations = this.buildNoteRows("9", n, n1, {
      indexes: [7],
      extra: () => ({ isTotal: false }),
    }, folder);

    return {
      entete: this.buildEntete(folder),
      title: "TITRES DE PLACEMENT",
      rows: titres,
      titresPlacement: titres,
      depreciations,
    };
  }

  private generateNote10(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "10": 0-5 = valeurs à encaisser (511-518),
    // 6 = dépréciations (591). Les comptes 413/414 utilisés précédemment
    // appartiennent en réalité à la note "7" (clients).
    // Pas de champ "variation" stocké ici: la colonne s'intitule "en %" côté
    // frontend, qui la calcule donc lui-même (comme les notes 8/11) plutôt
    // que de recevoir un écart absolu sous une étiquette de pourcentage.
    const valeursAEncaisser = this.buildNoteRows("10", n, n1, {
      indexes: [0, 1, 2, 3, 4, 5],
    }, folder);
    const depreciations = this.buildNoteRows("10", n, n1, {
      indexes: [6],
    }, folder);
    const brutN = valeursAEncaisser.reduce((t, r) => t + r.yearN, 0);
    const brutN1 = valeursAEncaisser.reduce((t, r) => t + r.yearN1, 0);
    const depN = depreciations.reduce((t, r) => t + r.yearN, 0);
    const depN1 = depreciations.reduce((t, r) => t + r.yearN1, 0);

    return {
      entete: this.buildEntete(folder),
      title: "VALEURS A ENCAISSER",
      valeursAEncaisser,
      depreciations,
      totalBrut: { yearN: brutN, yearN1: brutN1 },
      totalNet: { yearN: brutN - depN, yearN1: brutN1 - depN1 },
    };
  }

  private generateNote11(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "11", 12 lignes de détail: banques et CCP (521-531),
    // autres établissements financiers (532-538), instruments de trésorerie
    // (54), caisse (57), caisse électronique (55), régies d'avances (58).
    // Ordre d'affichage: banques d'abord. La ligne "Dépréciations"
    // (592-599, index 6) est à part: l'imprimé DGI ne l'affiche pas dans la
    // liste de détail mais comme une ligne dédiée après le TOTAL BRUT.
    const rows = this.buildNoteRows("11", n, n1, {
      indexes: [7, 8, 9, 10, 11, 12, 0, 1, 2, 3, 4, 5],
    }, folder);

    return {
      entete: this.buildEntete(folder),
      title: "DISPONIBILITES",
      disponibilites: rows,
      depreciations: sumMappingLine(n, this.linesFor("11", folder)[6]),
    };
  }

  private generateNote12(folder: FolderWithRelations): any {
    // Table OHADA note "12": deux tableaux distincts, tous deux
    // intégralement à saisie manuelle.
    // - Écarts de conversion (comptes 478/479): la balance ne donne que le
    //   solde agrégé, pas le détail par devise et par créance/dette
    //   (montant en devise, cours d'acquisition, cours de clôture) exigé
    //   par ce tableau.
    // - Transferts de charges: aucun compte dédié — la nature de la charge
    //   reclassée est une information qualitative, pas un solde. (Un
    //   précédent code réutilisait par erreur les comptes 478/479 pour ce
    //   second tableau, alors que les deux notes n'ont aucun rapport.)
    // Le frontend fusionne ces valeurs dans ses propres lignes par `id`,
    // sans écraser ses libellés (avec renvois colorés) déjà en place — ne
    // renvoyer ici que ce qui est réellement à saisir.
    const zeroConversionRow = (id: string) => ({
      id,
      currency: "",
      amountInCurrency: 0,
      acquisitionRate: 0,
      closingRate: 0,
    });
    const zeroTransferRow = (id: string) => ({ id, yearN: 0, yearN1: 0 });

    return {
      entete: this.buildEntete(folder),
      title: "ECARTS DE CONVERSION",
      conversionRows: [zeroConversionRow("1"), zeroConversionRow("2")],
      transferRows: [zeroTransferRow("3"), zeroTransferRow("4")],
      commentConversion: "",
      commentTransfer: "",
    };
  }

  private generateNote13(folder: FolderWithRelations): any {
    // Note 13: VALEUR NOMINALE DES ACTIONS OU PARTS
    // This should contain shareholder information and capital details
    // Return data structure that matches frontend Note13 component expectations

    return {
      entete: {
        entityName: folder.client?.name || null,
        fiscalYear: folder.fiscalYear ? `31-12-${folder.fiscalYear}` : null,
        idNumber: folder.client?.taxNumber || null,
        duration: "12", // Standard 12 months
      },
      shareholders: [
        {
          id: "1",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "2",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "3",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "4",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "5",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "6",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "7",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "8",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "9",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
        {
          id: "10",
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        },
      ],
      unpaidCapital: 0, // Capital non appelé
    };
  }

  private generateNote14(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "14" (12 lignes: primes 1051-1058, réserves 111-118,
    // report à nouveau 12). Les comptes 1061-1068 utilisés précédemment
    // n'existent pas dans la nomenclature OHADA; corrigé.
    return {
      entete: this.buildEntete(folder),
      title: "PRIMES ET RESERVES",
      rows: this.buildNoteRows("14", n, n1, {}, folder),
    };
  }

  private generateNote15A(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "15A" (15 lignes: subventions 141x/148 puis
    // provisions réglementées 151-158).
    return {
      entete: this.buildEntete(folder),
      title: "SUBVENTIONS ET PROVISIONS REGLEMENTEES",
      // `echeancier` (date d'échéance) n'est déductible d'aucune balance —
      // saisie manuelle par le comptable dans le composant (champ texte,
      // voir Note15A.tsx). Laissé vide plutôt qu'à 0: une valeur numérique
      // 0 dans une cellule Excel formatée en date s'affiche "00/01/1900".
      rows: this.buildNoteRows("15A", n, n1, {
        extra: () => ({ fiscalAdjustment: 0, echeancier: "" }),
      }, folder),
    };
  }

  private generateNote15B(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Pas de section "15B" dans la table OHADA fournie: les autres fonds
    // propres (comptes 166/167/168) sont dérivés de la note "16A" qui les
    // porte. Les lignes sont toujours émises pour que le tableau s'affiche.
    const lines = this.linesFor("16A", folder);
    const rows = [
      { idx: 5, label: "Intérêts courus" }, // 166
      { idx: 6, label: "Avances assorties de conditions particulières" }, // 167
      { idx: 7, label: "Autres emprunts et dettes" }, // 168
      { idx: 8, label: "Dettes liées à des participations" }, // 181/182/183
      { idx: 9, label: "Comptes permanents bloqués des établissements" }, // 184
    ].map((r, i) => {
      const line = lines[r.idx];
      const yearN = line ? sumMappingLine(n, line) : 0;
      const yearN1 = line ? sumMappingLine(n1, line) : 0;
      return {
        id: String(i + 1),
        label: r.label,
        note: "",
        yearN,
        yearN1,
        echeancier: 0,
      };
    });

    return {
      entete: this.buildEntete(folder),
      title: "AUTRES FONDS PROPRES",
      rows,
    };
  }

  private generateNote16A(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "16A", 28 lignes: emprunts et dettes financières
    // (161-184), dettes de location-acquisition (172-178), puis provisions
    // pour risques et charges (191-1988).
    return {
      entete: this.buildEntete(folder),
      title: "DETTES FINANCIERES ET RESSOURCES ASSIMILEES",
      rows: this.buildNoteRows("16A", n, n1, {
        extra: (yearN) => this.agingLong(yearN),
      }, folder),
    };
  }

  private generateNote16B(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Engagements de retraite (méthode actuarielle): données actuarielles
    // non déductibles de la balance. Lignes émises à 0 pour que le tableau
    // s'affiche; l'obligation de clôture provient des comptes 1961/1962.
    const provisionRetraite = sumBySide(n, ["1961", "1962"], "SC");
    const provisionRetraiteN1 = sumBySide(n1, ["1961", "1962"], "SC");

    return {
      entete: this.buildEntete(folder),
      title:
        "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES (METHODE ACTUARIELLE)",
      hypotheses: [
        "Taux d'actualisation",
        "Taux d'inflation",
        "Taux de progression des salaires",
        "Taux de rotation du personnel",
        "Age de départ à la retraite",
        "Table de mortalité",
      ].map((label, i) => ({ id: String(i + 1), label, yearN: 0, yearN1: 0 })),
      obligations: [
        "Obligation au titre des engagements à l'ouverture",
        "Coût des services rendus",
        "Coût financier (désactualisation)",
        "Prestations versées",
        "Obligation au titre des engagements à la clôture",
      ].map((label, i) => ({
        id: String(i + 1),
        label,
        yearN: i === 4 ? provisionRetraite : 0,
        yearN1: i === 4 ? provisionRetraiteN1 : 0,
      })),
      sensitivity: [
        "Variation du taux d'actualisation",
        "Variation du taux de progression des salaires",
        "Variation du taux de rotation",
      ].map((label, i) => ({
        id: String(i + 1),
        label,
        increaseN: 0,
        decreaseN: 0,
        increaseN1: 0,
        decreaseN1: 0,
      })),
      comments: "",
    };
  }

  private generateNote16BBis(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    const provisionN = sumBySide(n, ["1961"], "SC");
    const provisionN1 = sumBySide(n1, ["1961"], "SC");
    const actifRegimeN = sumBySide(n, ["1962"], "SC");
    const actifRegimeN1 = sumBySide(n1, ["1962"], "SC");

    return {
      entete: this.buildEntete(folder),
      title: "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES",
      actifPassif: [
        {
          id: "1",
          label: "Valeur actuelle de l'obligation",
          yearN: provisionN,
          yearN1: provisionN1,
        },
        {
          id: "2",
          label: "Juste valeur des actifs du régime",
          yearN: actifRegimeN,
          yearN1: actifRegimeN1,
        },
        {
          id: "3",
          label: "Position nette (passif) / actif",
          yearN: provisionN - actifRegimeN,
          yearN1: provisionN1 - actifRegimeN1,
        },
      ],
      actifRegime: [
        "Instruments de capitaux propres",
        "Instruments de dettes",
        "Autres actifs",
      ].map((label, i) => ({
        id: String(i + 1),
        label,
        rendementYearN: 0,
        justeValeurYearN: 0,
        rendementYearN1: 0,
        justeValeurYearN1: 0,
      })),
      comment1: "",
      comment2: "",
    };
  }

  private generateNote16C(folder: FolderWithRelations): any {
    // Actifs/passifs éventuels: hors bilan, non déductibles de la balance.
    // Lignes émises à 0 pour que le tableau s'affiche.
    return {
      entete: this.buildEntete(folder),
      title: "ACTIFS ET PASSIFS EVENTUELS",
      actifs: [
        "Cautions reçues",
        "Avals et garanties reçus",
        "Autres actifs éventuels",
      ].map((description, i) => ({
        id: String(i + 1),
        description,
        yearN: 0,
        yearN1: 0,
      })),
      passifs: [
        "Cautions données",
        "Avals et garanties donnés",
        "Litiges en cours",
        "Autres passifs éventuels",
      ].map((description, i) => ({
        id: String(i + 1),
        description,
        yearN: 0,
        yearN1: 0,
      })),
    };
  }

  private generateNote17(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "17", 8 lignes: fournisseurs créditeurs (dettes en
    // compte, effets à payer, factures non parvenues) puis fournisseurs
    // débiteurs (avances et acomptes).
    return {
      entete: this.buildEntete(folder),
      title: "FOURNISSEURS D'EXPLOITATION",
      rows: this.buildNoteRows("17", n, n1, {
        extra: (yearN) => this.agingLong(yearN),
      }, folder),
    };
  }

  private generateC1Note17(n: any[], folder: FolderWithRelations): any {
    // Extrait de la balance générale limité aux comptes fournisseurs
    // (classe 40). Chaque compte présent dans la balance donne une ligne.
    const ledgerRows = (n || [])
      .filter((row: any) => String(row.accountNumber || "").startsWith("40"))
      .map((row: any, i: number) => ({
        id: String(i + 1),
        accountNumber: `${row.accountNumber} - ${row.accountName || ""}`.trim(),
        openingDebit: parseFloat(row.openingDebit || 0),
        openingCredit: parseFloat(row.openingCredit || 0),
        movementsDebit: parseFloat(row.movementDebit || 0),
        movementsCredit: parseFloat(row.movementCredit || 0),
        closingDebit: parseFloat(row.closingDebit || 0),
        closingCredit: parseFloat(row.closingCredit || 0),
      }));

    return {
      entete: this.buildEntete(folder),
      title: "EXTRAIT DE LA BALANCE GENERALE FOURNISSEURS",
      ledgerRows,
      // Détail quantitatif des achats et des transports: non déductible de la
      // balance (pas de quantités en comptabilité générale).
      purchaseRows: [],
      transportRows: [],
    };
  }

  private generateNote18(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "18", 11 lignes: dettes sociales (personnel 421-428,
    // organismes sociaux 431-438) puis dettes fiscales (441-449).
    return {
      entete: this.buildEntete(folder),
      title: "DETTES FISCALES ET SOCIALES",
      rows: this.buildNoteRows("18", n, n1, {
        extra: (yearN) => this.agingShort(yearN),
      }, folder),
    };
  }

  private generateNote19(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Note 19: AUTRES DETTES ET PROVISIONS POUR RISQUES A COURT TERME
    // Comptes/sens tirés de la table OHADA (note "19"), 16 lignes + une 17e
    // ligne "Provisions pour risques à court terme" (voir note 28, non
    // couverte par cette table — laissée à 0). Pas de donnée d'échéancier
    // dans la balance: par défaut on classe tout en "moins d'un an" (cohérent
    // avec le titre "à court terme" de la note).
    const lines = this.linesFor("19", folder);
    const toRow = (id: string, label: string, line?: (typeof lines)[number]) => {
      const yearN = line ? sumMappingLine(n, line) : 0;
      const yearN1 = line ? sumMappingLine(n1, line) : 0;
      return {
        id,
        label,
        yearN,
        yearN1,
        lessThan1Year: yearN,
        oneToTwoYears: 0,
        moreThanTwoYears: 0,
      };
    };

    const rows = [
      toRow("1", "Organismes internationaux", lines[0]),
      toRow("2", "Apporteurs, opérations sur le capital", lines[1]),
      toRow("3", "Associés, compte courant", lines[2]),
      toRow("4", "Associés dividendes à payer", lines[3]),
      toRow("5", "Groupe, comptes courants", lines[4]),
      toRow("6", "Autres dettes associées", lines[5]),
      toRow("7", "Créditeurs divers", lines[6]),
      toRow("8", "Obligataires", lines[7]),
      toRow("9", "Rémunérations d'administrateurs", lines[8]),
      toRow("10", "Compte du factor", lines[9]),
      toRow(
        "11",
        "Versements restants à effectuer sur titres de placement non libérés",
        lines[10]
      ),
      toRow(
        "12",
        "Compte transitoire ajustement spécial lié à la révision du SYSCOHADA",
        lines[11]
      ),
      toRow("13", "Autres créditeurs divers", lines[12]),
      toRow(
        "14",
        "Comptes permanents non bloqués des établissements et des succursales",
        lines[13]
      ),
      toRow("15", "Comptes de liaison charges et produits", lines[14]),
      toRow(
        "16",
        "Comptes de liaison des sociétés en participation",
        lines[15]
      ),
      toRow("17", "Provisions pour risques à court terme (voir note 28)"),
    ];

    return {
      entete: {
        entityName: folder.client?.name || null,
        fiscalYear: folder.fiscalYear ? `31-12-${folder.fiscalYear}` : null,
        idNumber: folder.client?.taxNumber || null,
        duration: "12", // Standard 12 months
      },
      rows: rows,
    };
  }

  private generateNote20(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "20", 7 lignes: escomptes de crédit (564/565),
    // banques en position créditrice (521-526), crédit de trésorerie
    // (561/566).
    return {
      entete: this.buildEntete(folder),
      title: "BANQUES, CREDIT D'ESCOMPTE ET DE TRESORERIE",
      rows: this.buildNoteRows("20", n, n1, {}, folder),
    };
  }

  private generateNote21(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "21", 16 lignes: ventes de marchandises (7011-7015),
    // de produits fabriqués, travaux et services vendus, produits
    // accessoires (707), production immobilisée (72), subventions
    // d'exploitation (71), autres produits (75).
    return {
      entete: this.buildEntete(folder),
      title: "CHIFFRE D'AFFAIRES ET AUTRES PRODUITS",
      rows: this.buildNoteRows("21", n, n1, {}, folder),
    };
  }

  private generateNote22(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "22", 20 lignes: achats de marchandises (601x), de
    // matières premières (602x), autres achats (604x-608x), frais sur
    // achats, remises/rabais/ristournes obtenus.
    return {
      entete: this.buildEntete(folder),
      title: "ACHATS",
      rows: this.buildNoteRows("22", n, n1, {}, folder),
    };
  }

  private generateNote23(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "23", 5 lignes: transports sur ventes (612), pour le
    // compte de tiers (613), du personnel (614), de plis (616), autres (618).
    return {
      entete: this.buildEntete(folder),
      title: "TRANSPORTS",
      rows: this.buildNoteRows("23", n, n1, {}, folder),
    };
  }

  private generateNote24(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "24", 14 lignes: services extérieurs (621-628) et
    // autres services extérieurs (631-638).
    return {
      entete: this.buildEntete(folder),
      title: "SERVICES EXTERIEURS",
      rows: this.buildNoteRows("24", n, n1, {}, folder),
    };
  }

  private generateNote25(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "25", 5 lignes: impôts et taxes directs (641),
    // indirects (645), droits d'enregistrement (646), pénalités et amendes
    // fiscales (647), autres impôts et taxes (648).
    return {
      entete: this.buildEntete(folder),
      title: "IMPOTS ET TAXES",
      rows: this.buildNoteRows("25", n, n1, {}, folder),
    };
  }

  private generateC1Note25(n: any[], folder: FolderWithRelations): any {
    return {
      entete: this.buildEntete(folder),
      title: "SYNTHESE DES IMPOTS ET TAXES VERSES",
      impotsVersesExploitation: this.sumAccounts(n, ["64"]),
      impotsHAO: this.sumAccounts(n, ["848"]),
      total: this.sumAccounts(n, ["64", "848"]),
    };
  }

  private generateC2Note25(n: any[], folder: FolderWithRelations): any {
    return {
      entete: this.buildEntete(folder),
      title:
        "TABLEAU DE LA REGULARISATION ANNUELLE DES DROITS D'ACCISES: DETERMINATION DES DROITS D'ACCISES A REVERSER",
      baseImposable: 0,
      tauxAccises: 0,
      droitsCalcules: 0,
      droitsVerses: 0,
      solde: 0,
    };
  }

  private generateNote26(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "26", 8 lignes: pertes sur créances (6511/6515),
    // quote-part opérations en commun (652), valeur comptable des cessions
    // courantes (654), indemnités administrateurs (6581), dons (6582/6583),
    // autres charges diverses, charges pour dépréciations CT (659).
    return {
      entete: this.buildEntete(folder),
      title: "AUTRES CHARGES",
      rows: this.buildNoteRows("26", n, n1, {}, folder),
    };
  }

  private generateNote27A(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "27A", 6 lignes: rémunérations directes (661/662),
    // indemnités forfaitaires (663), charges sociales (664), rémunérations
    // de l'exploitant individuel (666), personnel extérieur (667), autres
    // charges sociales (668).
    return {
      entete: this.buildEntete(folder),
      title: "CHARGES DE PERSONNEL",
      rows: this.buildNoteRows("27A", n, n1, {}, folder),
    };
  }

  private generateC1Note27A(n: any[], folder: FolderWithRelations): any {
    return {
      entete: this.buildEntete(folder),
      title:
        "TABLEAU DE REGULARISATION ANNUELLE DES IMPOTS ET TAXES SUR SALAIRES",
      masseSalariale: this.sumAccounts(n, ["661", "662", "663", "664"]),
      irppVerse: this.sumAccounts(n, ["4472"]),
      centimesCommunaux: this.sumAccounts(n, ["4473"]),
      cfpVerse: this.sumAccounts(n, ["4474"]),
      total: this.sumAccounts(n, ["4472", "4473", "4474"]),
    };
  }

  private generateNote27B(folder: FolderWithRelations): any {
    // Effectifs par catégorie et nationalité: donnée sociale non déductible
    // de la balance comptable (à saisir par le comptable). Les lignes sont
    // toujours émises à 0 pour que le tableau s'affiche complet.
    const categories = [
      { label: "Cadres", isTotal: false, isSubTotal: false },
      { label: "Agents de maîtrise", isTotal: false, isSubTotal: false },
      { label: "Employés / Ouvriers", isTotal: false, isSubTotal: false },
      { label: "TOTAL PERSONNEL PERMANENT", isTotal: false, isSubTotal: true },
      { label: "Personnel temporaire", isTotal: false, isSubTotal: false },
      { label: "TOTAL GENERAL", isTotal: true, isSubTotal: false },
    ];

    return {
      entete: this.buildEntete(folder),
      title: "EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR",
      rows: categories.map((c, i) => ({
        id: String(i + 1),
        category: c.label,
        isTotal: c.isTotal,
        isSubTotal: c.isSubTotal,
        nationalsM: 0,
        nationalsF: 0,
        ohadaM: 0,
        ohadaF: 0,
        horsOhadaM: 0,
        horsOhadaF: 0,
        totalM: 0,
        totalF: 0,
      })),
    };
  }

  private generateNote28(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // BUG CORRIGÉ: "provisions" et "depreciations" utilisaient exactement
    // les mêmes comptes (691/697/857).
    // Table OHADA note "28", 13 lignes de comptes de provisions/dépréciations
    // au bilan. Pour chaque ligne: ouverture = solde N-1, clôture = solde N,
    // dotation = mouvement créditeur de la période, reprise = mouvement
    // débiteur (un compte de provision est crédité en dotation, débité en
    // reprise). La ventilation exploitation / financière / H.A.O. est déduite
    // de la nature de chaque ligne — la balance seule ne permet pas de la
    // répartir compte par compte.
    const CATEGORY: Record<number, "exploitation" | "financieres" | "hao"> = {
      0: "exploitation", // dépréciations des stocks (39)
      1: "hao", // dépréciations actif circulant H.A.O. (4998)
      2: "exploitation", // dépréciations fournisseurs (490)
      3: "exploitation", // dépréciations clients (491)
      4: "exploitation", // dépréciations autres créances (492-497)
      5: "financieres", // dépréciations titres de placement (590)
      6: "financieres", // dépréciations valeurs à encaisser (591)
      7: "financieres", // dépréciations disponibilités (592-594)
      8: "exploitation", // risques à court terme exploitation (4991)
      9: "financieres", // risques à court terme financiers (599/4997)
      10: "hao", // provisions réglementées (15) — dotations via 851
      11: "financieres", // provisions financières risques et charges (19x)
      12: "exploitation", // dépréciation des immobilisations (29)
    };

    const rows = this.linesFor("28", folder).map((line, i) => {
      const category = CATEGORY[i] || "exploitation";
      const dotation = sumMovement(n, line.accounts, "MC", line.excludedAccounts);
      const reprise = sumMovement(n, line.accounts, "MD", line.excludedAccounts);

      return {
        id: String(i + 1),
        nature: line.label,
        opening: sumMappingLine(n1, line),
        dotationExploitation: category === "exploitation" ? dotation : 0,
        dotationFinancieres: category === "financieres" ? dotation : 0,
        dotationHorsActivites: category === "hao" ? dotation : 0,
        repriseExploitation: category === "exploitation" ? reprise : 0,
        repriseFinancieres: category === "financieres" ? reprise : 0,
        repriseHorsActivites: category === "hao" ? reprise : 0,
        closing: sumMappingLine(n, line),
      };
    });

    return {
      entete: this.buildEntete(folder),
      title: "PROVISIONS ET DEPRECIATIONS INSCRITES AU BILAN",
      rows,
    };
  }

  private generateC1Note28(n: any[], folder: FolderWithRelations): any {
    return {
      entete: this.buildEntete(folder),
      title:
        "TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE L'EXERCICE: LES REPRISES",
      reprisesExploitation: this.sumAccounts(n, ["791"]),
      reprisesFinancieres: this.sumAccounts(n, ["797"]),
      reprisesHAO: this.sumAccounts(n, ["867"]),
      total: this.sumAccounts(n, ["791", "797", "867"]),
    };
  }

  private generateC2Note28(n: any[], folder: FolderWithRelations): any {
    return {
      entete: this.buildEntete(folder),
      title:
        "TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE L'EXERCICE: LES DOTATIONS",
      dotationsExploitation: this.sumAccounts(n, ["691"]),
      dotationsFinancieres: this.sumAccounts(n, ["697"]),
      dotationsHAO: this.sumAccounts(n, ["857"]),
      total: this.sumAccounts(n, ["691", "697", "857"]),
    };
  }

  private generateNote29(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "29": 0-9 = charges financières (671-676, 6771, 6772,
    // 6791/6795, 6798), 10-18 = revenus financiers (771-779).
    return {
      entete: this.buildEntete(folder),
      title: "CHARGES ET REVENUS FINANCIERS",
      charges: this.buildNoteRows("29", n, n1, {
        indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, folder),
      revenus: this.buildNoteRows("29", n, n1, {
        indexes: [10, 11, 12, 13, 14, 15, 16, 17, 18],
      }, folder),
    };
  }

  private generateNote30(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Table OHADA note "30": 0-5 = charges H.A.O. (831/833/837, 834, 835,
    // 836, 839, 85), 6-12 = produits H.A.O. (841/843/844/847, 845, 846, 848,
    // 849, 86, 88), 13-14 = participation des travailleurs (87) et impôts sur
    // le résultat (89), rattachés aux charges.
    return {
      entete: this.buildEntete(folder),
      title: "AUTRES CHARGES ET PRODUITS HAO",
      charges: this.buildNoteRows("30", n, n1, {
        indexes: [0, 1, 2, 3, 4, 5, 13, 14],
      }, folder),
      produits: this.buildNoteRows("30", n, n1, {
        indexes: [6, 7, 8, 9, 10, 11, 12],
      }, folder),
    };
  }

  private generateNote31(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Éléments caractéristiques sur 5 exercices. Seuls N et N-1 sont
    // calculables (l'application ne conserve que deux balances); N-2 à N-4
    // restent à 0, à compléter par le comptable.
    const capitalN = sumBySide(n, ["10"], "SC", ["109"]);
    const capitalN1 = sumBySide(n1, ["10"], "SC", ["109"]);
    const lines = this.linesFor("31", folder);

    const rows = [
      { label: "Capital social", yearN: capitalN, yearN1: capitalN1 },
      {
        label: lines[0]?.label || "Chiffre d'affaires hors taxes",
        yearN: lines[0] ? sumMappingLine(n, lines[0]) : 0,
        yearN1: lines[0] ? sumMappingLine(n1, lines[0]) : 0,
      },
      {
        label: "Résultat net de l'exercice",
        yearN: sumBySide(n, ["13"], "SC"),
        yearN1: sumBySide(n1, ["13"], "SC"),
      },
      {
        label: lines[1]?.label || "Participation des travailleurs aux bénéfices",
        yearN: lines[1] ? sumMappingLine(n, lines[1]) : 0,
        yearN1: lines[1] ? sumMappingLine(n1, lines[1]) : 0,
      },
      {
        label: lines[2]?.label || "Impôt sur le résultat",
        yearN: lines[2] ? sumMappingLine(n, lines[2]) : 0,
        yearN1: lines[2] ? sumMappingLine(n1, lines[2]) : 0,
      },
      {
        label: "Report à nouveau",
        yearN: sumBySide(n, ["12"], "SC"),
        yearN1: sumBySide(n1, ["12"], "SC"),
      },
    ].map((r, i) => ({
      id: String(i + 1),
      label: r.label,
      yearN: r.yearN,
      yearN1: r.yearN1,
      yearN2: 0,
      yearN3: 0,
      yearN4: 0,
    }));

    return {
      entete: this.buildEntete(folder),
      title:
        "REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EXERCICES",
      rows,
    };
  }

  private generateNote32(folder: FolderWithRelations): any {
    // Production de l'exercice détaillée par produit (quantités et valeurs
    // par destination). Ce détail n'existe pas dans la balance comptable —
    // une ligne vide est émise pour que le tableau s'affiche et soit
    // saisissable par le comptable.
    return {
      entete: this.buildEntete(folder),
      title: "PRODUCTION DE L'EXERCICE",
      rows: [
        {
          id: "1",
          productDesignation: "",
          unit: "",
          soldInCountryQty: 0,
          soldInCountryVal: 0,
          soldOtherOHADAQty: 0,
          soldOtherOHADAVal: 0,
          soldOutsideOHADAQty: 0,
          soldOutsideOHADAVal: 0,
          immobilizedQty: 0,
          immobilizedVal: 0,
          openingStockQty: 0,
          openingStockVal: 0,
          closingStockQty: 0,
          closingStockVal: 0,
        },
      ],
    };
  }

  private generateNote33(folder: FolderWithRelations): any {
    // Achats destinés à la production détaillés par nature (quantités
    // locales/importées). Détail absent de la balance — ligne vide émise
    // pour affichage et saisie.
    return {
      entete: this.buildEntete(folder),
      title: "ACHATS DESTINES A LA PRODUCTION",
      rows: [
        {
          id: "1",
          designation: "",
          unit: "",
          localQty: 0,
          localVal: 0,
          importedQty: 0,
          importedVal: 0,
          stockVariation: 0,
        },
      ],
    };
  }

  private generateNote34(
    n: any[],
    n1: any[],
    folder: FolderWithRelations
  ): any {
    // Fiche de synthèse: soldes intermédiaires de gestion, CAFG et éléments
    // du fonds de roulement. Les lignes calculables le sont depuis la
    // balance; les lignes issues d'autres états (TFT, bilan) restent à 0.
    const lines = this.linesFor("34", folder);
    const line = (i: number, rows: any[]) =>
      lines[i] ? sumMappingLine(rows, lines[i]) : 0;

    const sig = (rows: any[]) => {
      const ca = sumBySide(rows, ["70", "71"], "SC");
      const achats = sumBySide(rows, ["60", "61", "62", "63", "64"], "SD");
      const valeurAjoutee = ca - achats;
      const ebe = valeurAjoutee - sumBySide(rows, ["66"], "SD");
      const resultatExploitation = ebe - sumBySide(rows, ["681"], "SD");
      const resultatFinancier =
        sumBySide(rows, ["77"], "SC") - sumBySide(rows, ["67"], "SD");
      const resultatHAO =
        sumBySide(rows, ["82", "84", "86", "88"], "SC") -
        sumBySide(rows, ["83", "85"], "SD");
      const resultatNet = sumBySide(rows, ["13"], "SC");
      return {
        ca,
        valeurAjoutee,
        ebe,
        resultatExploitation,
        resultatFinancier,
        resultatHAO,
        resultatNet,
      };
    };

    const sN = sig(n);
    const sN1 = sig(n1);

    // Nuances de fond du vrai template (dsf_complet.xlsx, feuille "NOTE 34"):
    // bleu pour le grand titre de section "ANALYSE DE ...", gris moyen pour
    // les jalons de la CAFG, gris clair pour les autres bandeaux "ANALYSE DE
    // ...". Trois teintes distinctes dans le fichier source — reproduites
    // telles quelles, pas de couleur inventée.
    const BLUE = "#DCE6F1";
    const GRAY_MEDIUM = "#AEAAAA";
    const GRAY_LIGHT = "#D0CECE";

    const spec: {
      label: string;
      n: number;
      n1: number;
      bold?: boolean;
      bg?: string;
      gray?: boolean;
      header?: boolean; // ligne de titre pure: pas de saisie, pas de %variation
    }[] = [
      {
        label: "ANALYSE DE L'ACTIVITE",
        n: 0,
        n1: 0,
        bold: true,
        bg: BLUE,
        header: true,
      },
      {
        label: "SOLDE INTERMEDIAIRES DE GESTION",
        n: 0,
        n1: 0,
        bold: true,
        header: true,
      },
      { label: "CHIFFRE D'AFFAIRES", n: sN.ca, n1: sN1.ca, bold: true },
      {
        label: "MARGE COMMERCIALE",
        n: sumBySide(n, ["701"], "SC") - sumBySide(n, ["601"], "SD"),
        n1: sumBySide(n1, ["701"], "SC") - sumBySide(n1, ["601"], "SD"),
      },
      { label: "VALEUR AJOUTEE", n: sN.valeurAjoutee, n1: sN1.valeurAjoutee },
      { label: "EXCEDENT BRUT D'EXPLOITATION (E.B.E)", n: sN.ebe, n1: sN1.ebe },
      {
        label: "RESULTAT D'EXPLOITATION",
        n: sN.resultatExploitation,
        n1: sN1.resultatExploitation,
      },
      {
        label: "RESULTAT FINANCIER",
        n: sN.resultatFinancier,
        n1: sN1.resultatFinancier,
      },
      {
        label: "RESULTAT DES ACTIVITES ORDINAIRES",
        n: sN.resultatExploitation + sN.resultatFinancier,
        n1: sN1.resultatExploitation + sN1.resultatFinancier,
      },
      {
        label: "RESULTAT HORS ACTIVITES ORDINAIRES",
        n: sN.resultatHAO,
        n1: sN1.resultatHAO,
      },
      { label: "RESULTAT NET", n: sN.resultatNet, n1: sN1.resultatNet, bold: true },
      {
        label: "DETERMINATION DE LA CAPACITE D'AUTOFINANCEMENT",
        n: 0,
        n1: 0,
        bold: true,
        bg: GRAY_MEDIUM,
        header: true,
      },
      { label: "EBE", n: sN.ebe, n1: sN1.ebe, bold: true },
      { label: lines[0]?.label || "+ Valeurs comptables des cessions courantes", n: line(0, n), n1: line(0, n1) },
      { label: lines[1]?.label || "- Produits des cessions courantes", n: line(1, n), n1: line(1, n1) },
    ];

    // CAFE = EBE + valeur comptable des cessions - produits des cessions.
    // Sous-total intermédiaire du vrai template, distinct de la CAFG finale
    // (qui inclut en plus tous les éléments financiers/H.A.O. ci-dessous) —
    // entièrement dérivable des lignes déjà calculées ci-dessus.
    const cafeN = sN.ebe + line(0, n) - line(1, n);
    const cafeN1 = sN1.ebe + line(0, n1) - line(1, n1);
    spec.push(
      {
        label: "CAPACITE D'AUTOFINANCEMENT D'EXPLOITATION",
        n: cafeN,
        n1: cafeN1,
        bold: true,
        bg: GRAY_MEDIUM,
      },
      { label: lines[2]?.label || "+ Revenus financiers", n: line(2, n), n1: line(2, n1) },
      { label: lines[3]?.label || "+ Gains de change", n: line(3, n), n1: line(3, n1) },
      { label: lines[4]?.label || "+ Transferts de charges financières", n: line(4, n), n1: line(4, n1) },
      { label: lines[5]?.label || "+ Produits H.A.O.", n: line(5, n), n1: line(5, n1) },
      { label: lines[6]?.label || "+ Transferts de charges H.A.O.", n: line(6, n), n1: line(6, n1) },
      { label: lines[7]?.label || "- Frais financiers", n: line(7, n), n1: line(7, n1) },
      { label: lines[8]?.label || "- Pertes de change", n: line(8, n), n1: line(8, n1) },
      { label: lines[9]?.label || "- Charges H.A.O.", n: line(9, n), n1: line(9, n1) },
      { label: lines[10]?.label || "- Participation", n: line(10, n), n1: line(10, n1) },
      { label: lines[11]?.label || "- Impôts sur le résultat", n: line(11, n), n1: line(11, n1) }
    );

    // CAFG = EBE + éléments encaissables/décaissables ci-dessus.
    const cafg = (rows: any[], s: ReturnType<typeof sig>) =>
      s.ebe +
      line(0, rows) -
      line(1, rows) +
      line(2, rows) +
      line(3, rows) +
      line(4, rows) +
      line(5, rows) +
      line(6, rows) -
      line(7, rows) -
      line(8, rows) -
      line(9, rows) -
      line(10, rows) -
      line(11, rows);

    const cafgN = cafg(n, sN);
    const cafgN1 = cafg(n1, sN1);
    spec.push({
      label: "CAPACITE D'AUTOFINANCEMENT GLOBAL",
      n: cafgN,
      n1: cafgN1,
      bold: true,
      bg: GRAY_MEDIUM,
    });

    const dividendes = Math.max(
      sumBySide(n1, ["11", "12", "13"], "SC") - sumBySide(n, ["11", "12", "13"], "SC"),
      0
    );
    spec.push({
      label: "Distributions de dividendes opérées au cours de l'exercice",
      n: dividendes,
      n1: 0,
    });
    spec.push({
      label: "AUTOFINANCEMENT",
      n: cafgN - dividendes,
      n1: cafgN1,
      bold: true,
      bg: GRAY_MEDIUM,
    });

    // Éléments de structure financière (fonds de roulement / BFE / trésorerie).
    const capitauxPropres = (rows: any[]) =>
      sumBySide(rows, ["10", "11", "12", "13", "14", "15"], "SC") -
      sumBySide(rows, ["109"], "SD");
    const actifImmobilise = (rows: any[]) => line(12, rows);
    const actifCirculantExpl = (rows: any[]) => line(13, rows);
    const passifCirculantExpl = (rows: any[]) => line(14, rows);
    const actifCirculantHao = (rows: any[]) => line(15, rows);
    const passifCirculantHao = (rows: any[]) => line(16, rows);
    const endettementBrut = (rows: any[]) => line(17, rows);
    const tresorerieActif = (rows: any[]) => line(18, rows);

    const structure = (rows: any[]) => {
      const cp = capitauxPropres(rows);
      const dettesFin = sumBySide(rows, ["16", "17"], "SC");
      const ressourcesStables = cp + dettesFin;
      const fdr = ressourcesStables - actifImmobilise(rows);
      const bfe = actifCirculantExpl(rows) - passifCirculantExpl(rows);
      const bfhao = actifCirculantHao(rows) - passifCirculantHao(rows);
      const bfg = bfe + bfhao;
      return { cp, dettesFin, ressourcesStables, fdr, bfe, bfhao, bfg };
    };

    const stN = structure(n);
    const stN1 = structure(n1);

    // Rentabilité économique = résultat d'exploitation / (capitaux propres +
    // dettes financières). Rentabilité financière = résultat net / capitaux
    // propres. Entièrement dérivables des agrégats déjà calculés ci-dessus.
    const rentabiliteEco = (s: ReturnType<typeof sig>, st: ReturnType<typeof structure>) =>
      st.cp + st.dettesFin === 0 ? 0 : s.resultatExploitation / (st.cp + st.dettesFin);
    const rentabiliteFin = (s: ReturnType<typeof sig>, st: ReturnType<typeof structure>) =>
      st.cp === 0 ? 0 : s.resultatNet / st.cp;

    spec.push(
      {
        label: "ANALYSE DE LA RENTABILITE",
        n: 0,
        n1: 0,
        bold: true,
        bg: GRAY_LIGHT,
        header: true,
      },
      {
        label: "Rentabilité économique = résultat d'exploitation / (capitaux propres + dettes financières)",
        n: rentabiliteEco(sN, stN),
        n1: rentabiliteEco(sN1, stN1),
      },
      {
        label: "Rentabilité financière = résultat net / capitaux propres",
        n: rentabiliteFin(sN, stN),
        n1: rentabiliteFin(sN1, stN1),
      },
      {
        label: "ANALYSE DE LA STRUCTURE FINANCIERE",
        n: 0,
        n1: 0,
        bold: true,
        bg: GRAY_LIGHT,
        header: true,
      },
      { label: "Capitaux propres et ressources assimilées", n: stN.cp, n1: stN1.cp },
      {
        label: "+ Dettes financières et autres ressources assimilées",
        n: stN.dettesFin,
        n1: stN1.dettesFin,
      },
      {
        label: "= Ressources stables",
        n: stN.ressourcesStables,
        n1: stN1.ressourcesStables,
      },
      {
        label: "- Actif immobilisé",
        n: actifImmobilise(n),
        n1: actifImmobilise(n1),
      },
      {
        label: "= FONDS DE ROULEMENT (1)",
        n: stN.fdr,
        n1: stN1.fdr,
        bold: true,
        bg: GRAY_LIGHT,
      },
      {
        label: "Actif circulant d'exploitation",
        n: actifCirculantExpl(n),
        n1: actifCirculantExpl(n1),
      },
      {
        label: "- Passif circulant d'exploitation",
        n: passifCirculantExpl(n),
        n1: passifCirculantExpl(n1),
      },
      {
        label: "= BESOIN DE FINANCEMENT D'EXPLOITATION (2)",
        n: stN.bfe,
        n1: stN1.bfe,
        bold: true,
      },
      {
        label: "Actif circulant H.A.O.",
        n: actifCirculantHao(n),
        n1: actifCirculantHao(n1),
      },
      {
        label: "- Passif circulant H.A.O.",
        n: passifCirculantHao(n),
        n1: passifCirculantHao(n1),
      },
      {
        label: "= BESOIN DE FINANCEMENT H.A.O. (3)",
        n: stN.bfhao,
        n1: stN1.bfhao,
      },
      {
        label: "BESOIN DE FINANCEMENT GLOBAL (4) = (2) + (3)",
        n: stN.bfg,
        n1: stN1.bfg,
        bold: true,
        bg: GRAY_LIGHT,
      },
      {
        label: "TRESORERIE NETTE (5) = (1) - (4)",
        n: stN.fdr - stN.bfg,
        n1: stN1.fdr - stN1.bfg,
        bold: true,
        bg: GRAY_LIGHT,
      },
      {
        // Ligne de contrôle du vrai template (trésorerie nette recalculée
        // depuis le bilan): trésorerie-passif n'est pas disponible dans
        // cette fonction — comme les lignes issues du TFT ci-dessous, elle
        // reste à 0 plutôt que d'être approximée.
        label: "CONTROLE TRESORERIE NETTE = (TRESORERIE-ACTIF) - (TRESORERIE-PASSIF)",
        n: 0,
        n1: 0,
      },
      {
        label: "ANALYSE DE LA VARIATION DE LA TRESORERIE",
        n: 0,
        n1: 0,
        bg: GRAY_LIGHT,
        header: true,
      },
      // Flux issus du TFT (tableau des flux de trésorerie): non recalculés
      // ici pour ne pas dupliquer sa logique — restent à 0, à consulter sur
      // la note TFT elle-même.
      { label: "Flux de trésorerie des activités opérationnelles", n: 0, n1: 0, bold: true },
      { label: "- Flux de trésorerie des activités d'investissement", n: 0, n1: 0, bold: true },
      { label: "+ Flux de trésorerie des activités de financement", n: 0, n1: 0, bold: true },
      {
        label: "= VARIATION DE LA TRESORERIE NETTE DE LA PERIODE",
        n: 0,
        n1: 0,
        bold: true,
        bg: GRAY_LIGHT,
      },
      {
        label: "ANALYSE DE LA VARIATION DE L'ENDETTEMENT FINANCIERE NET",
        n: 0,
        n1: 0,
        bold: true,
        bg: GRAY_LIGHT,
        header: true,
      },
      {
        label: "Endettement financier brut",
        n: endettementBrut(n),
        n1: endettementBrut(n1),
        bold: true,
      },
      {
        label: "- Trésorerie Actif",
        n: tresorerieActif(n),
        n1: tresorerieActif(n1),
        bold: true,
      },
      {
        label: "= ENDETTEMENT FINANCIER NET",
        n: endettementBrut(n) - tresorerieActif(n),
        n1: endettementBrut(n1) - tresorerieActif(n1),
        bold: true,
      }
    );

    return {
      entete: this.buildEntete(folder),
      title: "FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS",
      rows: spec.map((r, i) => ({
        id: String(i + 1),
        label: r.label,
        yearN: r.n,
        yearN1: r.n1,
        bold: r.bold || false,
        bg: r.bg || null,
        header: r.header || false,
      })),
    };
  }

  private generateNote35(folder: FolderWithRelations): any {
    // Note purement déclarative (checklist OHADA), obligatoire pour les
    // entités de plus de 250 salariés — aucune donnée dérivable de la
    // balance. Structure et libellés repris à l'identique de la feuille
    // "NOTE 35" du vrai template (dsf_complet.xlsx); `reponse` est laissé
    // vide, à saisir par le comptable.
    const bullet = (id: string, prompt: string) => ({ id, prompt, reponse: "" });

    return {
      entete: this.buildEntete(folder),
      title: "LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIALES A FOURNIR",
      subtitle: "Note obligatoire pour les entités ayant un effectif de plus de 250 salariés",
      informationsSociales: [
        {
          subtitle: "Emploi :",
          bullets: [
            bullet("soc-1", "L'effectif total et la répartition des salariés par sexe, âge et zone géographique :"),
            bullet("soc-2", "Les embauches et les licenciements ;"),
            bullet("soc-3", "Les rémunérations et leur évolution."),
          ],
        },
        {
          subtitle: "Relations sociales :",
          bullets: [
            bullet("soc-4", "L'organisation du dialogue social"),
            bullet("soc-5", "Le bilan des accords collectifs"),
          ],
        },
        {
          subtitle: "Santé et sécurité :",
          bullets: [
            bullet("soc-6", "Les conditions de santé et de sécurité au travail :"),
            bullet("soc-7", "Le bilan des accords signés avec les organisations syndicales ou les représentants du personnel en matière de santé et de sécurité au travail"),
          ],
        },
        {
          subtitle: "Formation :",
          bullets: [
            bullet("soc-8", "Les politiques mises en œuvre en matière de formation ;"),
            bullet("soc-9", "Le nombre total de formation."),
          ],
        },
        {
          subtitle: "Egalités de traitement :",
          bullets: [
            bullet("soc-10", "Les mesures prises en faveur de l'égalité entre les femmes et les hommes ;"),
            bullet("soc-11", "Les mesures prises en faveur de l'emploi et de l'insertion des personnes handicapées ;"),
          ],
        },
      ],
      informationsEnvironnementales: [
        {
          subtitle: "Politique générale en matière environnementale :",
          bullets: [
            bullet("env-1", "L'organisation de la société pour prendre en compte les questions environnementales et, le cas échéant, les démarches d'évaluation ou de certification en matière d'environnement ;"),
            bullet("env-2", "Les actions de formation et d'information des salariés menées en matière de protection de l'environnement ;"),
            bullet("env-3", "Les moyens consacrés à la prévention des risques environnementaux et des pollutions."),
          ],
        },
        {
          subtitle: "Pollution et gestion des déchets",
          bullets: [
            bullet("env-4", "Les mesures de prévention, de réduction ou de réparation de rejets dans l'air, l'eau et le sol affectant gravement l'environnement ;"),
            bullet("env-5", "Les mesures de prévention, de recyclage et d'élimination des déchets ;"),
            bullet("env-6", "La prise en compte des nuisances sonores et de toute autre forme de pollution spécifique à une activité"),
          ],
        },
        {
          subtitle: "Utilisation durable des ressources :",
          bullets: [
            bullet("env-7", "La consommation d'eau et l'approvisionnement en eau en fonction des contraintes locales ;"),
            bullet("env-8", "La consommation d'énergie, les mesures prises pour améliorer l'efficacité énergétique et le recours aux énergies renouvelables."),
          ],
        },
        {
          subtitle: "Changement climatique :",
          bullets: [bullet("env-9", "Les rejets de gaz à effet de serre.")],
        },
        {
          subtitle: "Protection de la biodiversité :",
          bullets: [bullet("env-10", "Les mesures prises pour préserver ou développer la biodiversité.")],
        },
      ],
      informationsSocietales: [
        {
          subtitle: "Impact territorial, économique et social de l'activité de la société :",
          bullets: [
            bullet("soct-1", "En matière d'emploi et de développement régional ;"),
            bullet("soct-2", "Sur les populations riveraines ou locales."),
          ],
        },
        {
          subtitle: "Relations entretenues avec les personnes ou les organisations intéressées par l'activité de la société (association d'insertion, établissement d'enseignement …) :",
          bullets: [
            bullet("soct-3", "Les conditions du dialogue avec ces personnes ou organisations ;"),
            bullet("soct-4", "Les actions de partenariat ou de mécénat."),
          ],
        },
        {
          subtitle: "Sous-traitance et fournisseurs :",
          bullets: [bullet("soct-5", "La prise en compte dans la politique d'achat des enjeux sociaux et environnementaux.")],
        },
      ],
    };
  }

  private sumFixedAssetGross(fixedAssets: any[], prefixes: string[]): number {
    if (!fixedAssets || fixedAssets.length === 0) return 0;
    return fixedAssets
      .filter((fa) =>
        prefixes.some((p) => String(fa.accountNumber || "").startsWith(p))
      )
      .reduce((total, fa) => total + (parseFloat(fa.grossValue) || 0), 0);
  }

  /**
   * Tableau des Flux de Trésorerie (TFT). Comptes/formules tirés de la table
   * OHADA (section "TFT", voir tft-mapping.data.ts). La colonne N-1 n'est
   * pas calculée: les termes SDA/SCA du calcul de la période N-1 exigeraient
   * une balance N-2, non disponible dans l'application.
   */
  private generateTFT(
    n: any[],
    n1: any[],
    notes: any,
    nBalance: any,
    n1Balance: any
  ): any {
    const ctx = { currentRows: n, priorRows: n1 };
    const values = new Map<string, number>();

    // FF/FG/FH: décaissements sur acquisitions d'immobilisations. La table
    // source référence des cellules d'un autre onglet (note 3A: "N3A;C15",
    // "ACQUISITION INCORP OUVERTURE(...)") non résolvables depuis cette
    // table. Approximation: variation de la valeur brute des immobilisations
    // (données FixedAsset) + mouvement des avances/acomptes fournisseurs
    // d'investissement (comptes 4041/4046/4811 etc., eux bien couverts par
    // le moteur de formules).
    const nFixedAssets = nBalance?.fixedAssets || [];
    const n1FixedAssets = n1Balance?.fixedAssets || [];
    const grossDelta = (prefixes: string[]) =>
      this.sumFixedAssetGross(nFixedAssets, prefixes) -
      this.sumFixedAssetGross(n1FixedAssets, prefixes);

    values.set(
      "FF",
      -(
        grossDelta(["21"]) +
        evaluateFormulaSource("SCA(4041;4046;4811)-SC(4041;4046;4811)", ctx)
      )
    );
    values.set(
      "FG",
      -(
        grossDelta(["22", "23", "24", "25"]) +
        evaluateFormulaSource("SCA(4042;4046;4812)-SC(4042;4046;4812)", ctx)
      )
    );
    values.set(
      "FH",
      -(
        grossDelta(["26", "27"]) +
        evaluateFormulaSource("SCA(4813)-SC(4813)", ctx)
      )
    );

    // FA: reprend la CAFG déjà calculée en note 34 (référence Excel "N34;E41").
    values.set("FA", notes?.note34?.capaciteAutofinancement || 0);

    const rows = TFT_LINES.map((line) => {
      let value = 0;
      if (values.has(line.ref)) {
        value = values.get(line.ref)!;
      } else if (line.formula) {
        try {
          value = evaluateFormulaSource(line.formula, ctx);
        } catch (error) {
          console.error(`[TFT] Erreur de formule pour ${line.ref}:`, error);
          value = 0;
        }
      } else if (line.sumOf) {
        value = line.sumOf.reduce(
          (total, ref) => total + (values.get(ref) || 0),
          0
        );
      }
      values.set(line.ref, value);
      return {
        ref: line.ref,
        label: line.label,
        valueN: value,
        valueN1: 0,
        bold: line.bold || false,
        highlight: line.highlight || null,
      };
    });

    return { rows };
  }

  private async getConfigByCategory(
    category: string,
    folder: FolderWithRelations
  ): Promise<any> {
    // Import prisma here to avoid circular dependencies
    const { prisma } = require("../lib/prisma");

    // Find the config by category. Note: DSFConfig has no `accountMappings`
    // relation in the schema - this only carries comptableConfigs/systemConfig,
    // so callers fall back to an empty mapping list via `?.accountMappings || []`.
    const config = await prisma.dSFConfig.findUnique({
      where: { category: category.toLowerCase() },
    });

    return config;
  }

  private calculateFromMappings(
    n: any[],
    folder: FolderWithRelations,
    accountMappings: any[],
    type: "reintegrations" | "deductions"
  ): number {
    // Group mappings by destination and sum values for same destination
    const destinationMap = new Map<string, number>();

    accountMappings.forEach((mapping: any) => {
      const value = this.getBalanceValue(
        n,
        folder,
        mapping.accountNumber,
        mapping.source
      );
      const currentSum = destinationMap.get(mapping.destination) || 0;
      destinationMap.set(mapping.destination, currentSum + value);
    });

    // For now, return sum of all values (can be filtered by type later based on destination patterns)
    return Array.from(destinationMap.values()).reduce(
      (sum, val) => sum + val,
      0
    );
  }

  private getBalanceValue(
    n: any[],
    folder: FolderWithRelations,
    accountNumber: string,
    source: string
  ): number {
    // Find the account in balance data
    const account = n.find(
      (row: any) => String(row.accountNumber) === accountNumber
    );

    if (!account) return 0;

    // Get the appropriate balance value based on source
    switch (source) {
      case "OD":
        return parseFloat(account.openingDebit || 0);
      case "OC":
        return parseFloat(account.openingCredit || 0);
      case "MD":
        return parseFloat(account.movementDebit || 0);
      case "MC":
        return parseFloat(account.movementCredit || 0);
      case "SD":
        return parseFloat(account.closingDebit || 0);
      case "SC":
        return parseFloat(account.closingCredit || 0);
      case "MCD":
        return (
          parseFloat(account.movementDebit || 0) -
          parseFloat(account.movementCredit || 0)
        );
      case "SCD":
        return (
          parseFloat(account.closingDebit || 0) -
          parseFloat(account.closingCredit || 0)
        );
      default:
        return 0;
    }
  }

  /**
   * Creates previous year (N-1) data from current year (N) closing balances
   * Rule: Balance N of year Y becomes Balance N-1 of year Y+1
   * The closing debit/credit of year N becomes the opening debit/credit of year N-1
   */
  private createPreviousYearFromCurrent(currentData: any): any {
    if (!currentData || !currentData.rows || !Array.isArray(currentData.rows)) {
      return null;
    }

    const previousYearRows = currentData.rows.map((row: any) => ({
      accountNumber: row.accountNumber,
      accountName: row.accountName,
      // Opening = Previous year's closing (from current year's closing)
      openingDebit: row.closingDebit || 0,
      openingCredit: row.closingCredit || 0,
      // No movement in previous year (it's already the result)
      movementDebit: 0,
      movementCredit: 0,
      // Closing = Same as opening (since no movement)
      closingDebit: row.closingDebit || 0,
      closingCredit: row.closingCredit || 0,
    }));

    return {
      rows: previousYearRows,
      meta: {
        ...currentData.meta,
        period: `N-1 (auto-generated from N)`,
        isAutoGenerated: true,
      },
    };
  }

  private applyAccountMappings(
    n: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Map<string, number> {
    const destinationMap = new Map<string, number>();

    accountMappings.forEach((mapping: any) => {
      const value = this.getBalanceValue(
        n,
        folder,
        mapping.accountNumber,
        mapping.source
      );
      const currentSum = destinationMap.get(mapping.destination) || 0;
      destinationMap.set(mapping.destination, currentSum + value);
    });

    return destinationMap;
  }

  private async generateCF1(
    n: any[],
    folder: FolderWithRelations
  ): Promise<any> {
    const resultatComptable = this.getAccountBalance(n, "13");

    // Get CF1 config and account mappings
    const cf1Config = await this.getConfigByCategory("cf1", folder);
    const accountMappings = cf1Config?.accountMappings || [];

    // Initialize CF1 data structure with default values
    const cf1Data = {
      headerInfo: {
        entityName: folder.client.name,
        fiscalYear: folder.fiscalYear.toString(),
        idNumber: folder.client.taxNumber || "",
        duration: "12",
      },
      rows: [
        {
          id: "1",
          label: "Bénéfice net comptable avant impôt",
          line: 1,
          amount: resultatComptable,
        },
        { id: "2", label: "Amortissement non déductible", line: 3, amount: 0 },
        {
          id: "3",
          label:
            "Amortissement comptable mais réputes différés en période déficitaire",
          line: 4,
          amount: 0,
        },
        { id: "4", label: "Provisions non déductibles", line: 5, amount: 0 },
        {
          id: "5",
          label: "Intérêt excédentaires des comptes courants d'associés",
          line: 6,
          amount: 0,
        },
        {
          id: "6",
          label: "Frais de siège et d'assistance technique",
          line: 7,
          amount: 0,
        },
        {
          id: "7",
          label: "Impôt non déductibles autres qu'impôt sur le résultat",
          line: 8,
          amount: 0,
        },
        {
          id: "8",
          label: "Amendes et pénalités non déductibles",
          line: 9,
          amount: 0,
        },
        {
          id: "9",
          label: "Pourboires et dons non déductibles",
          line: 10,
          amount: 0,
        },
        {
          id: "10",
          label: "Revenu à la source(IRMC) sur revenus des capitaux mobiliers",
          line: 12,
          amount: 0,
        },
        { id: "11", label: "Divers 1", line: 13, amount: 0 },
        { id: "12", label: "Divers 2", line: 14, amount: 0 },
        { id: "13", label: "Divers 3", line: 15, amount: 0 },
        {
          id: "14",
          label:
            "Total intermédiaire POSITIF : ligne 15=lignes1ou ligne15ligne2",
          line: 16,
          amount: 0,
        },
        {
          id: "15",
          label: "Total intermédiaire NEGATIF : ligne2=lignes 15",
          line: 17,
          amount: 0,
        },
        {
          id: "16",
          label: "Amortissement antérieur différés et imputés sur l'exercice",
          line: 18,
          amount: 0,
        },
        {
          id: "17",
          label:
            "Provisions antérieurement taxées ou définitivement exonérées réintégrées dans",
          line: 19,
          amount: 0,
        },
        {
          id: "18",
          label:
            "Fraction non imposable des plus-values réalisées en fin d'explication",
          line: 20,
          amount: 0,
        },
        {
          id: "19",
          label:
            "Produit net des filiales (après déduction de la quote-part de frais et charges)",
          line: 21,
          amount: 0,
        },
        {
          id: "20",
          label: "Autres revenus mobiliers déductibles",
          line: 22,
          amount: 0,
        },
        {
          id: "21",
          label: "Frais de siège et d'assistance technique déductible",
          line: 23,
          amount: 0,
        },
        { id: "22", label: "Divers 1", line: 24, amount: 0 },
        { id: "23", label: "Divers 2", line: 25, amount: 0 },
        { id: "24", label: "Total lignes 18 à 26", line: 27, amount: 0 },
        {
          id: "25",
          label: "BÉNÉFICE FISCAL DE L'EXERCICE : ligne 16 - ligne 27",
          line: 28,
          amount: 0,
        },
        {
          id: "26",
          label:
            "PERTE FISCALE DE L'EXERCICE : ligne 27 - ligne 16 ou ligne 17 +",
          line: 29,
          amount: 0,
        },
      ],
      rubriques: [
        {
          id: "1",
          label: "Impôt sur les sociétés",
          line: 31,
          minimum: "Minimum de perception",
          base: "30%",
          rate: "30%",
          principal: "",
        },
        {
          id: "2",
          label: "BIC et BNC",
          line: 32,
          minimum: "",
          base: "",
          rate: "22%",
          principal: "",
        },
        {
          id: "3",
          label: "",
          line: 33,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
        {
          id: "4",
          label: "Bénéfice artisanaux",
          line: 34,
          minimum: "",
          base: "",
          rate: "11%",
          principal: "",
        },
        {
          id: "5",
          label: "",
          line: 35,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
        {
          id: "6",
          label: "Bénéfices agricoles",
          line: 36,
          minimum: "",
          base: "",
          rate: "15%",
          principal: "",
        },
        {
          id: "7",
          label: "",
          line: 37,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
        {
          id: "8",
          label: "TOTAL lignes 32 à 38",
          line: 39,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
      ],
    };

    // Apply account mappings to populate CF1 rows
    accountMappings.forEach((mapping: any) => {
      const value = this.getBalanceValue(
        n,
        folder,
        mapping.accountNumber,
        mapping.source
      );
      const rowIndex = cf1Data.rows.findIndex(
        (row) => row.id === mapping.destination
      );

      if (rowIndex !== -1) {
        cf1Data.rows[rowIndex].amount = value;
      }
    });

    // Calculate totals
    const reintegrationsSum = cf1Data.rows
      .slice(1, 13)
      .reduce((sum, row) => sum + row.amount, 0);
    const deductionsSum = cf1Data.rows
      .slice(15, 24)
      .reduce((sum, row) => sum + row.amount, 0);
    const beneficeFiscal = cf1Data.rows[13].amount - deductionsSum;
    const perteFiscal = deductionsSum - cf1Data.rows[13].amount;

    cf1Data.rows[12].amount = reintegrationsSum; // Line 15
    cf1Data.rows[23].amount = deductionsSum; // Line 27
    cf1Data.rows[24].amount = beneficeFiscal; // Line 28
    cf1Data.rows[25].amount = perteFiscal; // Line 29

    return cf1Data;
  }

  /**
   * FICHE R2 — Fiche d'identification et de renseignements divers 2.
   *
   * Mise en page relevée sur l'onglet « Fiche R2 » d'une DSF réelle: un bloc
   * de renseignements repérés par des codes (ZK à ZP), un bloc « Contrôle de
   * l'entité » (ZQ à ZS) et un tableau des activités de l'entreprise.
   *
   * Seul le chiffre d'affaires est déductible de la balance; la forme
   * juridique et le pays viennent de la fiche client. Le reste
   * (immatriculation, nomenclature d'activité, répartition du CA) relève d'une
   * saisie du comptable: les lignes sont émises vides pour être complétées.
   */
  private generateFicheR2(n: any[], folder: FolderWithRelations): any {
    const chiffreAffaires = sumBySide(n, ["70", "71"], "SC");

    return {
      entete: this.buildEntete(folder),
      title: "FICHE D'IDENTIFICATION ET DE RENSEIGNEMENT DIVERS 2",
      renseignements: {
        // ZK..ZP — les codes sont conservés: ils figurent sur l'imprimé.
        ZK: { label: "Forme juridique", value: folder.client.legalForm ?? "" },
        ZL: { label: "Régistre fiscal", value: "" },
        ZM: { label: "Pays du siège social", value: folder.client.country ?? "" },
        ZN: { label: "Nombre d'établissement dans le pays", value: "" },
        ZO: {
          label:
            "Nombre d'établissement dans le pays hors du pays pour lesquels une comptabilité distincte est tenue",
          value: "",
        },
        ZP: { label: "Première année d'exercice dans le pays", value: "" },
      },
      controleEntite: {
        // Une seule des trois cases est cochée sur l'imprimé.
        ZQ: { label: "Entreprise sous contrôle public", checked: false },
        ZR: { label: "Entreprise sous contrôle privé national", checked: false },
        ZS: { label: "Entreprise sous contrôle privé étranger", checked: false },
      },
      // 6 lignes d'activité comme sur l'imprimé, plus la ligne « Divers ».
      activites: Array.from({ length: 6 }, (_, i) => ({
        id: String(i + 1),
        designation: "",
        codeNomenclature: "",
        montant: 0,
        pourcentage: 0,
      })),
      divers: { designation: "Divers", montant: 0, pourcentage: 0 },
      // Report du CA de la balance: sert de contrôle au comptable qui
      // ventile ensuite par activité.
      totalCA: chiffreAffaires,
      comment: "",
    };
  }

  /**
   * FICHE R3 — Dirigeants et membres du conseil d'administration.
   *
   * Mise en page relevée sur l'onglet « Fiche R3 »: 13 lignes de dirigeants
   * (nom, prénoms, qualité, n° d'identification fiscale, adresse) puis 11
   * lignes de membres du conseil d'administration (sans n° fiscal).
   *
   * Ces informations sont juridiques et n'existent pas dans la balance: les
   * lignes sont émises vides, prêtes à la saisie, pour que le tableau
   * s'affiche complet.
   */
  private generateFicheR3(folder: FolderWithRelations): any {
    return {
      entete: this.buildEntete(folder),
      title: "FICHE D'IDENTIFICATION ET DE RENSEIGNEMENT DIVERS 3 - DIRIGEANTS",
      dirigeants: Array.from({ length: 13 }, (_, i) => ({
        id: String(i + 1),
        nom: "",
        prenom: "",
        qualite: "",
        nIdFiscale: "",
        adresse: "",
      })),
      conseilAdministration: Array.from({ length: 11 }, (_, i) => ({
        id: String(i + 1),
        nom: "",
        prenom: "",
        qualite: "",
        adresse: "",
      })),
      comment: "",
    };
  }

  private generateSignaletics(folder: FolderWithRelations): any {
    return {
      r1: {
        title: "RENSEIGNEMENTS GENERAUX",
        denominationSociale: folder.client.name,
        formeJuridique: folder.client.legalForm,
        numeroContribuable: folder.client.taxNumber,
        exerciceFiscal: {
          debut: folder.startDate,
          fin: folder.endDate,
          duree: this.calculateExerciseDuration(
            folder.startDate,
            folder.endDate
          ),
        },
        adresse: folder.client.address,
        ville: folder.client.city,
        telephone: folder.client.phone,
        activitePrincipale: "À compléter",
        dateCreation: null,
        dateImmatriculation: null,
        numeroRCCM: null,
      },
      r2: {
        title: "ASSOCIES/ACTIONNAIRES",
        capitalSocial: 0,
        nombreParts: 0,
        valeurNominale: 0,
        associes: [],
        repartitionCapital: [],
      },
      r3: {
        title: "IDENTITE DES DIRIGEANTS",
        dirigeants: [],
        commissairesAuxComptes: [],
      },
      r4: {
        title: "EFFECTIF ET MASSE SALARIALE",
        effectif: {
          cadres: 0,
          agents: 0,
          employes: 0,
          ouvriers: 0,
          total: 0,
        },
        masseSalariale: {
          salaires: 0,
          chargesSociales: 0,
          total: 0,
        },
        evolutionEffectif: [],
      },
      r4Bis: {
        title: "INFORMATIONS COMPLEMENTAIRES",
        investissements: 0,
        subventions: 0,
        exportations: 0,
        importations: 0,
      },
    };
  }

  async performCoherenceControl(
    dsf: DSF & { folder: FolderWithRelations }
  ): Promise<CoherenceResult> {
    const dsfAny = dsf as any;
    const issues: any[] = [];

    // Check balance sheet equilibrium
    const bs = dsfAny.balanceSheet;
    const totalAssets = this.sumBalanceSheetAssets(bs);
    const totalLiabilities = this.sumBalanceSheetLiabilities(bs);

    if (Math.abs(totalAssets - totalLiabilities) > 1) {
      issues.push({
        type: "EQUILIBRIUM",
        severity: "ERROR",
        message: `Balance sheet not balanced: Assets ${totalAssets} vs Liabilities ${totalLiabilities}`,
      });
    }

    // Check income statement
    const is = dsfAny.incomeStatement;
    const totalProducts = this.sumIncomeStatementProducts(is);
    const totalCharges = this.sumIncomeStatementCharges(is);
    const calculatedResult = totalProducts - totalCharges;
    const declaredResult = is.resultat?.resultatNet?.n || 0;

    if (Math.abs(calculatedResult - declaredResult) > 1) {
      issues.push({
        type: "RESULT_MISMATCH",
        severity: "ERROR",
        message: `Result mismatch: Calculated ${calculatedResult} vs Declared ${declaredResult}`,
      });
    }

    // Check tax tables coherence
    const taxTables = dsfAny.taxTables;
    const resultatComptable =
      taxTables.determinationResultatFiscal?.resultatComptable || 0;

    if (Math.abs(resultatComptable - declaredResult) > 1) {
      issues.push({
        type: "TAX_RESULT_MISMATCH",
        severity: "ERROR",
        message: `Tax result doesn't match accounting result`,
      });
    }

    // Check notes coherence
    const notes = dsfAny.notes;
    if (!notes.note34 || !notes.note34.chiffreAffaires) {
      issues.push({
        type: "MISSING_NOTE",
        severity: "WARNING",
        message: "Note 34 (Financial indicators) is incomplete",
      });
    }

    return {
      isCoherent: issues.filter((i) => i.severity === "ERROR").length === 0,
      issues,
    };
  }

  async exportToExcel(
    dsf: DSF & { folder: FolderWithRelations }
  ): Promise<string> {
    const workbook = XLSX.utils.book_new();
    const dsfAny = dsf as any;

    // Create Balance Sheet
    const bsSheet = this.createBalanceSheetWorksheet(dsfAny.balanceSheet);
    XLSX.utils.book_append_sheet(workbook, bsSheet, "Bilan");

    // Create Income Statement
    const isSheet = this.createIncomeStatementWorksheet(dsfAny.incomeStatement);
    XLSX.utils.book_append_sheet(workbook, isSheet, "Compte de Résultat");

    // Create Tax Tables
    const taxSheet = this.createTaxTablesWorksheet(dsfAny.taxTables);
    XLSX.utils.book_append_sheet(workbook, taxSheet, "Tableaux Fiscaux");

    // Create all notes
    const notes = dsfAny.notes;
    Object.keys(notes).forEach((noteKey) => {
      const note = notes[noteKey];
      if (note && note.title) {
        const noteSheet = this.createNoteWorksheet(note);
        const sheetName = noteKey
          .toUpperCase()
          .replace("NOTE", "Note ")
          .substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, noteSheet, sheetName);
      }
    });

    // Create Signaletics sheets
    const signaletics = dsfAny.signaletics;
    ["r1", "r2", "r3", "r4", "r4Bis"].forEach((ficheKey) => {
      if (signaletics[ficheKey]) {
        const ficheSheet = this.createSignaleticWorksheet(
          signaletics[ficheKey]
        );
        const sheetName = ficheKey.toUpperCase();
        XLSX.utils.book_append_sheet(workbook, ficheSheet, sheetName);
      }
    });

    // Save file
    const fileName = `DSF_${dsf.folder.client.name.replace(/\s+/g, "_")}_${dsf.folder.fiscalYear}_${Date.now()}.xlsx`;
    const filePath = path.join(config.upload.directory, fileName);

    XLSX.writeFile(workbook, filePath);

    return filePath;
  }

  // Helper methods
  private sumAccounts(rows: any[], accountPrefixes: string[]): number {
    if (!rows || !Array.isArray(rows)) return 0;

    return rows.reduce((sum, row) => {
      const accountNumber = String(row.accountNumber || "");
      const matchesPrefix = accountPrefixes.some((prefix) =>
        accountNumber.startsWith(prefix)
      );

      if (matchesPrefix) {
        const debit = parseFloat(row.closingDebit || 0);
        const credit = parseFloat(row.closingCredit || 0);
        return sum + (debit - credit);
      }

      return sum;
    }, 0);
  }

  private calculateNet(
    rows: any[],
    assetAccounts: string[],
    depreciationAccounts: string[]
  ): number {
    const gross = this.sumAccounts(rows, assetAccounts);
    const depreciation = this.sumAccounts(rows, depreciationAccounts);
    return gross - Math.abs(depreciation);
  }

  private getAccountBalance(rows: any[], accountPrefix: string): number {
    return this.sumAccounts(rows, [accountPrefix]);
  }

  private calculateExerciseDuration(startDate: Date, endDate: Date): number {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
  }

  private sumBalanceSheetAssets(bs: any): number {
    let total = 0;

    if (bs.assets?.immobilisations) {
      const immo = bs.assets.immobilisations;
      total += immo.chargesImmobilisees?.net || 0;
      total += immo.immobilisationsIncorporelles?.net || 0;
      if (immo.immobilisationsCorporelles) {
        total += immo.immobilisationsCorporelles.terrains?.net || 0;
        total += immo.immobilisationsCorporelles.batiments?.net || 0;
        total +=
          immo.immobilisationsCorporelles.installationsEtAgencements?.net || 0;
        total += immo.immobilisationsCorporelles.materiel?.net || 0;
      }
      total += immo.immobilisationsFinancieres?.net || 0;
    }

    if (bs.assets?.actifCirculant) {
      const ac = bs.assets.actifCirculant;
      total += ac.stocks?.net || 0;
      total += ac.creances?.fournisseursAvances?.net || 0;
      total += ac.creances?.clients?.net || 0;
      total += ac.creances?.autresCreances?.net || 0;
      total += ac.tresorerie?.net || 0;
    }

    return total;
  }

  private sumBalanceSheetLiabilities(bs: any): number {
    let total = 0;

    if (bs.liabilities?.capitauxPropres) {
      const cp = bs.liabilities.capitauxPropres;
      total += cp.capital?.n || 0;
      total += cp.primes?.n || 0;
      total += cp.reserves?.n || 0;
      total += cp.reportANouveau?.n || 0;
      total += cp.resultat?.n || 0;
      total += cp.subventions?.n || 0;
      total += cp.provisions?.n || 0;
    }

    if (bs.liabilities?.dettesFinancieres) {
      total += bs.liabilities.dettesFinancieres.emprunts?.n || 0;
      total += bs.liabilities.dettesFinancieres.provisionsRisques?.n || 0;
    }

    if (bs.liabilities?.passifCirculant) {
      const pc = bs.liabilities.passifCirculant;
      total += pc.fournisseurs?.n || 0;
      total += pc.dettesFiscales?.n || 0;
      total += pc.dettesSociales?.n || 0;
      total += pc.autresDettes?.n || 0;
      total += pc.tresoreriePassif?.n || 0;
    }

    return total;
  }

  private sumIncomeStatementProducts(is: any): number {
    let total = 0;

    if (is.exploitation?.ventes) {
      const v = is.exploitation.ventes;
      total += v.ventesMarchandises?.n || 0;
      total += v.ventesProduitsFinis?.n || 0;
      total += v.travauxServices?.n || 0;
      total += v.produitsAccessoires?.n || 0;
      total += v.variationStocks?.n || 0;
      total += v.productionImmobilisee?.n || 0;
      total += v.subventionsExploitation?.n || 0;
      total += v.autresProduits?.n || 0;
    }

    if (is.hao?.produits?.n) {
      total += is.hao.produits.n;
    }

    return total;
  }

  private sumIncomeStatementCharges(is: any): number {
    let total = 0;

    if (is.exploitation?.charges) {
      const c = is.exploitation.charges;
      total += c.achatsMarchandises?.n || 0;
      total += c.variationStocks?.n || 0;
      total += c.achatsMatieresPremieres?.n || 0;
      total += c.autresAchats?.n || 0;
      total += c.transports?.n || 0;
      total += c.servicesExterieurs?.n || 0;
      total += c.impotsTaxes?.n || 0;
      total += c.autresCharges?.n || 0;
      total += c.chargesPersonnel?.n || 0;
      total += c.chargesFinancieres?.n || 0;
      total += c.dotationsAmortissements?.n || 0;
      total += c.dotationsProvisions?.n || 0;
    }

    if (is.hao?.charges?.n) {
      total += is.hao.charges.n;
    }

    if (is.resultat?.impotSurResultat?.n) {
      total += is.resultat.impotSurResultat.n;
    }

    return total;
  }

  private createBalanceSheetWorksheet(data: any): XLSX.WorkSheet {
    const wsData: any[][] = [
      ["BILAN ACTIF", "", "", "", ""],
      ["", "", "", "", ""],
      ["ACTIF", "Brut N", "Amort/Prov", "Net N", "Net N-1"],
      ["", "", "", "", ""],
      ["ACTIF IMMOBILISE", "", "", "", ""],
      [
        "Charges immobilisées",
        data.assets?.immobilisations?.chargesImmobilisees?.brut || 0,
        data.assets?.immobilisations?.chargesImmobilisees?.amortissements || 0,
        data.assets?.immobilisations?.chargesImmobilisees?.net || 0,
        data.assets?.immobilisations?.chargesImmobilisees?.netN1 || 0,
      ],
      ["", "", "", "", ""],
      ["TOTAL ACTIF", "", "", this.sumBalanceSheetAssets(data), ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["PASSIF", "", "N", "N-1", ""],
      ["", "", "", "", ""],
      ["CAPITAUX PROPRES", "", "", "", ""],
      [
        "Capital",
        "",
        data.liabilities?.capitauxPropres?.capital?.n || 0,
        data.liabilities?.capitauxPropres?.capital?.n1 || 0,
        "",
      ],
      ["", "", "", "", ""],
      ["TOTAL PASSIF", "", this.sumBalanceSheetLiabilities(data), "", ""],
    ];

    return XLSX.utils.aoa_to_sheet(wsData);
  }

  private createIncomeStatementWorksheet(data: any): XLSX.WorkSheet {
    const wsData: any[][] = [
      ["COMPTE DE RESULTAT", "", "", ""],
      ["", "", "", ""],
      ["COMPTE D'EXPLOITATION", "N", "N-1", ""],
      ["", "", "", ""],
      ["PRODUITS", "", "", ""],
      [
        "Ventes de marchandises",
        data.exploitation?.ventes?.ventesMarchandises?.n || 0,
        data.exploitation?.ventes?.ventesMarchandises?.n1 || 0,
        "",
      ],
      ["", "", "", ""],
      ["CHARGES", "", "", ""],
      [
        "Achats de marchandises",
        data.exploitation?.charges?.achatsMarchandises?.n || 0,
        data.exploitation?.charges?.achatsMarchandises?.n1 || 0,
        "",
      ],
      ["", "", "", ""],
      [
        "RESULTAT NET",
        data.resultat?.resultatNet?.n || 0,
        data.resultat?.resultatNet?.n1 || 0,
        "",
      ],
    ];

    return XLSX.utils.aoa_to_sheet(wsData);
  }

  private createTaxTablesWorksheet(data: any): XLSX.WorkSheet {
    const wsData: any[][] = [
      ["TABLEAUX DE DETERMINATION DU RESULTAT FISCAL", ""],
      ["", ""],
      [
        "Résultat comptable",
        data.determinationResultatFiscal?.resultatComptable || 0,
      ],
      ["", ""],
      ["REINTEGRATIONS", ""],
      [
        "Amendes et pénalités",
        data.determinationResultatFiscal?.reintegrations?.amendesEtPenalites ||
          0,
      ],
      [
        "Charges non déductibles",
        data.determinationResultatFiscal?.reintegrations
          ?.chargesNonDeductibles || 0,
      ],
      [
        "Total réintégrations",
        data.determinationResultatFiscal?.reintegrations?.total || 0,
      ],
      ["", ""],
      ["DEDUCTIONS", ""],
      [
        "Provisions exonérées",
        data.determinationResultatFiscal?.deductions?.provisionsExonerees || 0,
      ],
      [
        "Déficits antérieurs",
        data.determinationResultatFiscal?.deductions?.deficitsAnterieurs || 0,
      ],
      [
        "Total déductions",
        data.determinationResultatFiscal?.deductions?.total || 0,
      ],
      ["", ""],
      [
        "RESULTAT FISCAL",
        data.determinationResultatFiscal?.resultatFiscal || 0,
      ],
      [
        "Impôt sur sociétés (30%)",
        data.determinationResultatFiscal?.impotSurSocietes || 0,
      ],
    ];

    return XLSX.utils.aoa_to_sheet(wsData);
  }

  private createNoteWorksheet(note: any): XLSX.WorkSheet {
    const wsData: any[][] = [[note.title || "NOTE"], [""]];

    Object.keys(note).forEach((key) => {
      if (key !== "title" && note[key] !== null && note[key] !== undefined) {
        if (typeof note[key] === "object" && !Array.isArray(note[key])) {
          wsData.push([key.toUpperCase(), ""]);
          Object.keys(note[key]).forEach((subKey) => {
            wsData.push([`  ${subKey}`, note[key][subKey]]);
          });
        } else {
          wsData.push([key, note[key]]);
        }
      }
    });

    return XLSX.utils.aoa_to_sheet(wsData);
  }

  private createSignaleticWorksheet(data: any): XLSX.WorkSheet {
    const wsData: any[][] = [[data.title || "FICHE"], [""]];

    Object.keys(data).forEach((key) => {
      if (key !== "title") {
        if (typeof data[key] === "object" && !Array.isArray(data[key])) {
          wsData.push([key.toUpperCase(), ""]);
          Object.keys(data[key]).forEach((subKey) => {
            wsData.push([`  ${subKey}`, data[key][subKey]]);
          });
        } else if (Array.isArray(data[key])) {
          wsData.push([key.toUpperCase(), `${data[key].length} éléments`]);
        } else {
          wsData.push([key, data[key]]);
        }
      }
    });

    return XLSX.utils.aoa_to_sheet(wsData);
  }

  // New functions for processing DSF configs and generating reports

  /**
   * Generic function to generate a report from account mappings
   */
  private generateReportFromMappings(
    n: any[],
    n1: any[],
    folder: FolderWithRelations,
    accountMappings: any[],
    baseReportData: any
  ): any {
    const reportData = { ...baseReportData };

    accountMappings.forEach((mapping: any) => {
      const valueN = this.getBalanceValue(
        n,
        folder,
        mapping.accountNumber,
        mapping.source
      );
      const valueN1 = n1
        ? this.getBalanceValue(
            n1,
            folder,
            mapping.accountNumber,
            mapping.source
          )
        : 0;

      // Apply the value to the destination in the report data
      this.applyValueToReport(reportData, mapping.destination, valueN, valueN1);
    });

    return reportData;
  }

  /**
   * Apply value to report data based on destination path
   */
  private applyValueToReport(
    reportData: any,
    destination: string,
    valueN: number,
    valueN1?: number
  ): void {
    const keys = destination.split(".");
    let current = reportData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];

    if (
      valueN1 !== undefined &&
      typeof current[lastKey] === "object" &&
      current[lastKey] !== null
    ) {
      // If it's an object with n and n1 properties
      if ("n" in current[lastKey]) {
        current[lastKey].n = valueN;
      }
      if ("n1" in current[lastKey]) {
        current[lastKey].n1 = valueN1;
      }
    } else {
      // Direct assignment
      current[lastKey] = valueN;
    }
  }

  // Functions for generating notes from DSF configs

  private async generateNote1FromConfig(
    n: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Promise<any> {
    const baseData = {
      title: "DETTES GARANTIES PAR DES SURETES REELLES",
      raisonSociale: folder.client.name,
      formeJuridique: folder.client.legalForm,
      activitePrincipale: "À compléter",
      effectif: 0,
      dettesGaranties: [],
    };

    const reportData = this.generateReportFromMappings(
      n,
      [],
      folder,
      accountMappings,
      baseData
    );

    // Process dettesGaranties array
    const dettesGaranties = accountMappings
      .filter((mapping) => mapping.destination.startsWith("dettesGaranties."))
      .map((mapping) => ({
        compte: mapping.accountNumber,
        montant: this.getBalanceValue(
          n,
          folder,
          mapping.accountNumber,
          mapping.source
        ),
        garantie:
          mapping.libelle ||
          mapping.destination.split(".").pop() ||
          "À préciser",
      }));

    reportData.dettesGaranties = dettesGaranties;

    return reportData;
  }

  private async generateNote3AFromConfig(
    n: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Promise<any> {
    const baseData = {
      title: "IMMOBILISATIONS BRUTES",
      immobilisationsIncorporelles: 0,
      immobilisationsCorporelles: 0,
      immobilisationsFinancieres: 0,
      total: 0,
    };

    const reportData = this.generateReportFromMappings(
      n,
      [],
      folder,
      accountMappings,
      baseData
    );

    // Calculate total
    reportData.total =
      reportData.immobilisationsIncorporelles +
      reportData.immobilisationsCorporelles +
      reportData.immobilisationsFinancieres;

    return reportData;
  }

  private async generateNote4FromConfig(
    n: any[],
    n1: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Promise<any> {
    const baseData = {
      title: "IMMOBILISATIONS FINANCIERES",
      titresDeParticipation: { n: 0, n1: 0 },
      autresTitres: { n: 0, n1: 0 },
      pretsEtCreances: { n: 0, n1: 0 },
      total: { n: 0, n1: 0 },
    };

    const reportData = this.generateReportFromMappings(
      n,
      n1,
      folder,
      accountMappings,
      baseData
    );

    // Calculate totals
    reportData.total.n =
      reportData.titresDeParticipation.n +
      reportData.autresTitres.n +
      reportData.pretsEtCreances.n;
    reportData.total.n1 =
      reportData.titresDeParticipation.n1 +
      reportData.autresTitres.n1 +
      reportData.pretsEtCreances.n1;

    return reportData;
  }

  private async generateNote7FromConfig(
    n: any[],
    n1: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Promise<any> {
    const baseData = {
      title: "CLIENTS",
      clientsOrdinaires: { n: 0, n1: 0 },
      clientsDouteux: { n: 0, n1: 0 },
      creancesSurCessions: { n: 0, n1: 0 },
      provisionsClients: { n: 0, n1: 0 },
      total: { n: 0, n1: 0 },
    };

    const reportData = this.generateReportFromMappings(
      n,
      n1,
      folder,
      accountMappings,
      baseData
    );

    // Calculate totals
    reportData.total.n =
      reportData.clientsOrdinaires.n +
      reportData.clientsDouteux.n +
      reportData.creancesSurCessions.n -
      reportData.provisionsClients.n;
    reportData.total.n1 =
      reportData.clientsOrdinaires.n1 +
      reportData.clientsDouteux.n1 +
      reportData.creancesSurCessions.n1 -
      reportData.provisionsClients.n1;

    return reportData;
  }

  // Functions for generating tax reports from DSF configs

  private async generateCF1FromConfig(
    n: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Promise<any> {
    const baseData = {
      headerInfo: {
        entityName: folder.client.name,
        fiscalYear: folder.fiscalYear.toString(),
        idNumber: folder.client.taxNumber || "",
        duration: "12",
      },
      rows: [
        {
          id: "1",
          label: "Bénéfice net comptable avant impôt",
          line: 1,
          amount: this.getAccountBalance(n, "13"),
        },
        { id: "2", label: "Amortissement non déductible", line: 3, amount: 0 },
        {
          id: "3",
          label:
            "Amortissement comptable mais réputes différés en période déficitaire",
          line: 4,
          amount: 0,
        },
        { id: "4", label: "Provisions non déductibles", line: 5, amount: 0 },
        {
          id: "5",
          label: "Intérêt excédentaires des comptes courants d'associés",
          line: 6,
          amount: 0,
        },
        {
          id: "6",
          label: "Frais de siège et d'assistance technique",
          line: 7,
          amount: 0,
        },
        {
          id: "7",
          label: "Impôt non déductibles autres qu'impôt sur le résultat",
          line: 8,
          amount: 0,
        },
        {
          id: "8",
          label: "Amendes et pénalités non déductibles",
          line: 9,
          amount: 0,
        },
        {
          id: "9",
          label: "Pourboires et dons non déductibles",
          line: 10,
          amount: 0,
        },
        {
          id: "10",
          label: "Revenu à la source(IRMC) sur revenus des capitaux mobiliers",
          line: 12,
          amount: 0,
        },
        { id: "11", label: "Divers 1", line: 13, amount: 0 },
        { id: "12", label: "Divers 2", line: 14, amount: 0 },
        { id: "13", label: "Divers 3", line: 15, amount: 0 },
        {
          id: "14",
          label:
            "Total intermédiaire POSITIF : ligne 15=lignes1ou ligne15ligne2",
          line: 16,
          amount: 0,
        },
        {
          id: "15",
          label: "Total intermédiaire NEGATIF : ligne2=lignes 15",
          line: 17,
          amount: 0,
        },
        {
          id: "16",
          label: "Amortissement antérieur différés et imputés sur l'exercice",
          line: 18,
          amount: 0,
        },
        {
          id: "17",
          label:
            "Provisions antérieurement taxées ou définitivement exonérées réintégrées dans",
          line: 19,
          amount: 0,
        },
        {
          id: "18",
          label:
            "Fraction non imposable des plus-values réalisées en fin d'explication",
          line: 20,
          amount: 0,
        },
        {
          id: "19",
          label:
            "Produit net des filiales (après déduction de la quote-part de frais et charges)",
          line: 21,
          amount: 0,
        },
        {
          id: "20",
          label: "Autres revenus mobiliers déductibles",
          line: 22,
          amount: 0,
        },
        {
          id: "21",
          label: "Frais de siège et d'assistance technique déductible",
          line: 23,
          amount: 0,
        },
        { id: "22", label: "Divers 1", line: 24, amount: 0 },
        { id: "23", label: "Divers 2", line: 25, amount: 0 },
        { id: "24", label: "Total lignes 18 à 26", line: 27, amount: 0 },
        {
          id: "25",
          label: "BÉNÉFICE FISCAL DE L'EXERCICE : ligne 16 - ligne 27",
          line: 28,
          amount: 0,
        },
        {
          id: "26",
          label:
            "PERTE FISCALE DE L'EXERCICE : ligne 27 - ligne 16 ou ligne 17 +",
          line: 29,
          amount: 0,
        },
      ],
      rubriques: [
        {
          id: "1",
          label: "Impôt sur les sociétés",
          line: 31,
          minimum: "Minimum de perception",
          base: "30%",
          rate: "30%",
          principal: "",
        },
        {
          id: "2",
          label: "BIC et BNC",
          line: 32,
          minimum: "",
          base: "",
          rate: "22%",
          principal: "",
        },
        {
          id: "3",
          label: "",
          line: 33,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
        {
          id: "4",
          label: "Bénéfice artisanaux",
          line: 34,
          minimum: "",
          base: "",
          rate: "11%",
          principal: "",
        },
        {
          id: "5",
          label: "",
          line: 35,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
        {
          id: "6",
          label: "Bénéfices agricoles",
          line: 36,
          minimum: "",
          base: "",
          rate: "15%",
          principal: "",
        },
        {
          id: "7",
          label: "",
          line: 37,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
        {
          id: "8",
          label: "TOTAL lignes 32 à 38",
          line: 39,
          minimum: "",
          base: "",
          rate: "",
          principal: "",
        },
      ],
    };

    // Apply account mappings to CF1 rows
    accountMappings.forEach((mapping: any) => {
      const value = this.getBalanceValue(
        n,
        folder,
        mapping.accountNumber,
        mapping.source
      );
      const row = baseData.rows.find((r: any) => r.id === mapping.destination);
      if (row) {
        row.amount = value;
      }
    });

    // Calculate totals
    const reintegrationsSum = baseData.rows
      .slice(1, 13)
      .reduce((sum: number, row: any) => sum + row.amount, 0);
    const deductionsSum = baseData.rows
      .slice(15, 24)
      .reduce((sum: number, row: any) => sum + row.amount, 0);
    const beneficeFiscal = baseData.rows[13].amount - deductionsSum;
    const perteFiscal = deductionsSum - baseData.rows[13].amount;

    baseData.rows[12].amount = reintegrationsSum; // Line 15
    baseData.rows[23].amount = deductionsSum; // Line 27
    baseData.rows[24].amount = beneficeFiscal; // Line 28
    baseData.rows[25].amount = perteFiscal; // Line 29

    return baseData;
  }

  private async generateCF2FromConfig(
    n: any[],
    folder: FolderWithRelations,
    accountMappings: any[]
  ): Promise<any> {
    const ca = this.sumAccounts(n, ["70", "71"]);
    const tvaBrute = ca * 0.1925;
    const baseData = {
      title: "CALCUL DE REGULARISATION ANNUELLE DE LA TVA",
      chiffreAffairesHT: ca,
      tvaBrute,
      tvaDeductible: 0,
      tvaNette: tvaBrute,
    };

    // Apply account mappings
    accountMappings.forEach((mapping: any) => {
      const value = this.getBalanceValue(
        n,
        folder,
        mapping.accountNumber,
        mapping.source
      );
      if (mapping.destination === "tvaDeductible") {
        baseData.tvaDeductible = value;
        baseData.tvaNette = baseData.tvaBrute - value;
      }
    });

    return baseData;
  }

  private generateNote2FromConfig(): any {
    return {
      title: "INFORMATIONS OBLIGATOIRES",
      baseEvaluation: "Coûts historiques",
      methodesAmortissement: "Linéaire",
      methodesProvisions: "Au cas par cas",
    };
  }

  private generateNote3BFromConfig(n: any[], n1: any[]): any {
    const debutExercice = this.sumAccounts(n1, [
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
    ]);
    const finExercice = this.sumAccounts(n, [
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
    ]);

    return {
      title: "BIENS PRIS EN LOCATION ACQUISITION",
      debutExercice,
      acquisitions: 0,
      cessions: 0,
      finExercice,
      tableauDetails: [],
    };
  }

  private generateNote3CFromConfig(n: any[]): any {
    return {
      title: "IMMOBILISATIONS: AMORTISSEMENTS",
      amortissementsCumules: this.sumAccounts(n, [
        "281",
        "282",
        "283",
        "284",
        "285",
      ]),
      dotationsExercice: this.sumAccounts(n, ["681"]),
      reprisesExercice: 0,
    };
  }

  private generateNote5FromConfig(n: any[]): any {
    return {
      title: "ACTIF CIRCULANT HAO",
      actifCirculantHAO: this.sumAccounts(n, ["485"]),
      details: [],
    };
  }

  private generateNote6FromConfig(n: any[], n1: any[]): any {
    return {
      title: "STOCKS ET ENCOURS",
      marchandises: {
        n: this.sumAccounts(n, ["31"]),
        n1: this.sumAccounts(n1, ["31"]),
      },
      matieresPremieres: {
        n: this.sumAccounts(n, ["32"]),
        n1: this.sumAccounts(n1, ["32"]),
      },
      autresApprovisionnements: {
        n: this.sumAccounts(n, ["33"]),
        n1: this.sumAccounts(n1, ["33"]),
      },
      enCours: {
        n: this.sumAccounts(n, ["34", "35"]),
        n1: this.sumAccounts(n1, ["34", "35"]),
      },
      produitsFinis: {
        n: this.sumAccounts(n, ["36"]),
        n1: this.sumAccounts(n1, ["36"]),
      },
      total: {
        n: this.sumAccounts(n, [
          "31",
          "32",
          "33",
          "34",
          "35",
          "36",
          "37",
          "38",
        ]),
        n1: this.sumAccounts(n1, [
          "31",
          "32",
          "33",
          "34",
          "35",
          "36",
          "37",
          "38",
        ]),
      },
    };
  }

  private generateNote8FromConfig(n: any[], n1: any[]): any {
    return {
      title: "AUTRES CREANCES",
      fournisseursDebiteurs: {
        n: this.sumAccounts(n, ["4091", "4092"]),
        n1: this.sumAccounts(n1, ["4091", "4092"]),
      },
      personnel: {
        n: this.sumAccounts(n, [
          "421",
          "422",
          "423",
          "424",
          "425",
          "426",
          "427",
          "428",
        ]),
        n1: this.sumAccounts(n1, [
          "421",
          "422",
          "423",
          "424",
          "425",
          "426",
          "427",
          "428",
        ]),
      },
      etat: {
        n: this.sumAccounts(n, [
          "441",
          "442",
          "443",
          "444",
          "445",
          "446",
          "447",
        ]),
        n1: this.sumAccounts(n1, [
          "441",
          "442",
          "443",
          "444",
          "445",
          "446",
          "447",
        ]),
      },
      comptesDeLiaison: {
        n: this.sumAccounts(n, ["45"]),
        n1: this.sumAccounts(n1, ["45"]),
      },
      autresCreances: {
        n: this.sumAccounts(n, ["46", "47", "48"]),
        n1: this.sumAccounts(n1, ["46", "47", "48"]),
      },
      total: {
        n: this.sumAccounts(n, ["42", "43", "44", "45", "46", "47", "48"]),
        n1: this.sumAccounts(n1, ["42", "43", "44", "45", "46", "47", "48"]),
      },
    };
  }

  private generateNote9FromConfig(n: any[]): any {
    return {
      title: "TITRES DE PLACEMENT",
      titresDePlacement: this.sumAccounts(n, ["50"]),
      provisions: this.sumAccounts(n, ["590"]),
      valeurNette: this.calculateNet(n, ["50"], ["590"]),
    };
  }

  private generateNote10FromConfig(n: any[]): any {
    return {
      title: "VALEURS A ENCAISSER",
      effetsARecevoir: this.sumAccounts(n, ["413", "414"]),
      chequesAEncaisser: this.sumAccounts(n, ["513"]),
      couponsAEncaisser: this.sumAccounts(n, ["515"]),
      total: this.sumAccounts(n, ["413", "414", "513", "515"]),
    };
  }

  private generateNote11FromConfig(n: any[]): any {
    return {
      title: "DISPONIBILITES",
      banques: this.sumAccounts(n, ["521", "522", "523", "524", "526"]),
      ccp: this.sumAccounts(n, ["531"]),
      caisse: this.sumAccounts(n, ["57"]),
      regiesAvances: this.sumAccounts(n, ["58"]),
      total: this.sumAccounts(n, ["52", "53", "57", "58"]),
    };
  }

  private generateNote17FromConfig(n: any[]): any {
    return {
      title: "FOURNISSEURS D'EXPLOITATION",
      fournisseursOrdinaires: this.sumAccounts(n, ["401", "402"]),
      fournisseursEffetsAPayer: this.sumAccounts(n, ["403", "404", "405"]),
      fournisseursRetenues: this.sumAccounts(n, ["408"]),
      total: this.sumAccounts(n, [
        "401",
        "402",
        "403",
        "404",
        "405",
        "406",
        "408",
      ]),
    };
  }

  private generateNote18FromConfig(n: any[]): any {
    return {
      title: "DETTES FISCALES ET SOCIALES",
      dettesFiscales: {
        tva: this.sumAccounts(n, ["4431", "4432", "4433", "4434", "4435"]),
        impotsSurSalaires: this.sumAccounts(n, ["4471", "4472", "4473"]),
        impotsSurResultat: this.sumAccounts(n, ["444"]),
        autresImpots: this.sumAccounts(n, ["441", "442", "445", "446", "447"]),
      },
      dettesSociales: {
        cnps: this.sumAccounts(n, ["431", "432", "433"]),
        personnel: this.sumAccounts(n, [
          "421",
          "422",
          "423",
          "424",
          "425",
          "426",
          "427",
          "428",
        ]),
      },
      total: this.sumAccounts(n, ["42", "43", "44"]),
    };
  }

  private generateNote21FromConfig(n: any[], n1: any[]): any {
    return {
      title: "CHIFFRE D'AFFAIRES ET AUTRES PRODUITS",
      ventesMarchandises: {
        n: this.sumAccounts(n, ["701"]),
        n1: this.sumAccounts(n1, ["701"]),
      },
      ventesProduits: {
        n: this.sumAccounts(n, ["702", "703", "704"]),
        n1: this.sumAccounts(n1, ["702", "703", "704"]),
      },
      travaux: {
        n: this.sumAccounts(n, ["705"]),
        n1: this.sumAccounts(n1, ["705"]),
      },
      services: {
        n: this.sumAccounts(n, ["706", "707"]),
        n1: this.sumAccounts(n1, ["706", "707"]),
      },
      produitsDivers: {
        n: this.sumAccounts(n, ["708"]),
        n1: this.sumAccounts(n1, ["708"]),
      },
      rabaisRemises: {
        n: this.sumAccounts(n, ["709"]),
        n1: this.sumAccounts(n1, ["709"]),
      },
      total: {
        n: this.sumAccounts(n, ["70"]),
        n1: this.sumAccounts(n1, ["70"]),
      },
    };
  }

  private generateNote27AFromConfig(n: any[], n1: any[]): any {
    return {
      title: "CHARGES DE PERSONNEL",
      salairesEtTraitements: {
        n: this.sumAccounts(n, ["661", "662", "663", "664"]),
        n1: this.sumAccounts(n1, ["661", "662", "663", "664"]),
      },
      chargesSociales: {
        n: this.sumAccounts(n, ["665", "666", "667"]),
        n1: this.sumAccounts(n1, ["665", "666", "667"]),
      },
      autresCharges: {
        n: this.sumAccounts(n, ["668"]),
        n1: this.sumAccounts(n1, ["668"]),
      },
      total: {
        n: this.sumAccounts(n, ["66"]),
        n1: this.sumAccounts(n1, ["66"]),
      },
    };
  }

  private generateNote28FromConfig(n: any[]): any {
    return {
      title: "PROVISIONS ET DEPRECIATIONS INSCRITES AU BILAN",
      provisions: {
        exploitation: this.sumAccounts(n, ["691"]),
        financieres: this.sumAccounts(n, ["697"]),
        hao: this.sumAccounts(n, ["857"]),
      },
      depreciations: {
        exploitation: this.sumAccounts(n, ["691"]),
        financieres: this.sumAccounts(n, ["697"]),
        hao: this.sumAccounts(n, ["857"]),
      },
      total: this.sumAccounts(n, ["691", "697", "857"]),
    };
  }

  // Tax report functions

  private generateCF1BisFromConfig(n: any[]): any {
    return {
      title:
        "TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT: MINIMUM DE PERCEPTION",
      chiffreAffaires: this.sumAccounts(n, ["70", "71"]),
      minimumPerception: this.sumAccounts(n, ["70", "71"]) * 0.011,
    };
  }

  private generateCF1TerFromConfig(n: any[]): any {
    return {
      title: "MINIMUM DE PERCEPTION",
      chiffreAffairesHT: this.sumAccounts(n, ["70", "71"]),
      tauxMinimum: 0.011,
      minimumCalcule: this.sumAccounts(n, ["70", "71"]) * 0.011,
    };
  }

  private generateCF1QuaterFromConfig(): any {
    return {
      title:
        "RECAPITULATIF DES VERSEMENTS D'ACOMPTES ET DE RETENUES SUBIES D'IMPOT SOCIETE ET D'ERENCE",
      acomptesVerses: 0,
      retenuesSubies: 0,
      total: 0,
    };
  }

  private generateCF2BisFromConfig(): any {
    return {
      title: "RECAPITULATIF DES VERSEMENTS EFFECTUES ET RETENUS SUBIES",
      versementsMensuels: [],
      total: 0,
    };
  }

  private generateCF2TerFromConfig(): any {
    return {
      title: "SITUATION NETTE DE TVA",
      tvaDue: 0,
      tvaPayee: 0,
      solde: 0,
    };
  }

  /**
   * Generate all reports from DSF configs
   */
  async generateAllReportsFromConfigs(
    folder: FolderWithRelations,
    nData: any,
    n1Data: any
  ): Promise<any> {
    const n = nData.rows || [];
    const n1 = n1Data?.rows || [];

    // Get all DSF configs for this folder/client
    const configs = await this.getAllConfigsForFolder(folder);

    const reports: any = {};

    // Generate each report based on available configs
    for (const config of configs) {
      const accountMappings = config.accountMappings || [];

      switch (config.category.toLowerCase()) {
        case "note1":
          reports.note1 = await this.generateNote1FromConfig(
            n,
            folder,
            accountMappings
          );
          break;
        case "note3a":
          reports.note3A = await this.generateNote3AFromConfig(
            n,
            folder,
            accountMappings
          );
          break;
        case "note4":
          reports.note4 = await this.generateNote4FromConfig(
            n,
            n1,
            folder,
            accountMappings
          );
          break;
        case "note7":
          reports.note7 = await this.generateNote7FromConfig(
            n,
            n1,
            folder,
            accountMappings
          );
          break;
        case "cf1":
          reports.cf1 = await this.generateCF1FromConfig(
            n,
            folder,
            accountMappings
          );
          break;
        case "cf2":
          reports.cf2 = await this.generateCF2FromConfig(
            n,
            folder,
            accountMappings
          );
          break;
        // Add more cases for other notes and reports
        default:
          // For notes/reports without specific config-based generation, use default
          break;
      }
    }

    // Generate notes that don't have configs with default values
    reports.note2 = this.generateNote2FromConfig();
    reports.note3B = this.generateNote3BFromConfig(n, n1);
    reports.note3C = this.generateNote3CFromConfig(n);
    reports.note5 = this.generateNote5FromConfig(n);
    reports.note6 = this.generateNote6FromConfig(n, n1);
    reports.note8 = this.generateNote8FromConfig(n, n1);
    reports.note9 = this.generateNote9FromConfig(n);
    reports.note10 = this.generateNote10FromConfig(n);
    reports.note11 = this.generateNote11FromConfig(n);
    reports.note17 = this.generateNote17FromConfig(n);
    reports.note18 = this.generateNote18FromConfig(n);
    reports.note21 = this.generateNote21FromConfig(n, n1);
    reports.note27A = this.generateNote27AFromConfig(n, n1);
    reports.note28 = this.generateNote28FromConfig(n);

    // Generate tax reports
    reports.cf1Bis = this.generateCF1BisFromConfig(n);
    reports.cf1Ter = this.generateCF1TerFromConfig(n);
    reports.cf1Quater = this.generateCF1QuaterFromConfig();
    reports.cf2Bis = this.generateCF2BisFromConfig();
    reports.cf2Ter = this.generateCF2TerFromConfig();

    return reports;
  }

  /**
   * Get all DSF configs for a folder
   */
  private async getAllConfigsForFolder(
    folder: FolderWithRelations
  ): Promise<any[]> {
    // Import prisma here to avoid circular dependencies
    const { prisma } = require("../lib/prisma");

    // Get configs by folder ID
    const configs = await prisma.DSFComptableConfig.findMany({
      where: {
        OR: [
          { exerciseId: folder.id },
          { clientId: folder.clientId, exerciseId: null },
          { ownerType: "SYSTEM" },
        ],
        isActive: true,
      },
      include: {
        config: {
          include: {
            accountMappings: true,
          },
        },
      },
    });

    return configs.map((c: any) => ({
      ...c,
      category: c.config?.category || "unknown",
      accountMappings: c.accountMappings || [],
    }));
  }

  // Assurance-specific note generation methods
  private generateBilanActif(n: any[]): any {
    return {
      title: "Bilan Actif - Assurance",
      description: "État de l'actif pour les entreprises d'assurance",
      // Add specific logic for assurance bilan actif
    };
  }

  private generateBilanPassif(n: any[]): any {
    return {
      title: "Bilan Passif - Assurance",
      description: "État du passif pour les entreprises d'assurance",
      // Add specific logic for assurance bilan passif
    };
  }

  private generateCharges(n: any[]): any {
    return {
      title: "Charges d'Exploitation Assurance",
      description: "Charges d'exploitation spécifiques aux assurances",
      // Add specific logic for assurance charges
    };
  }

  private generateCompteGeneral(n: any[]): any {
    return {
      title: "Compte de Résultat Général",
      description: "État des résultats généraux pour assurances",
      // Add specific logic for assurance compte general
    };
  }

  private generateEtatC4(n: any[]): any {
    return {
      title: "État C4 Sectoriel",
      description: "État réglementaire C4 pour les assurances",
      // Add specific logic for assurance etat C4
    };
  }

  private generateEtatC11(n: any[]): any {
    return {
      title: "État C11 Sectoriel",
      description: "État réglementaire C11 pour les assurances",
      // Add specific logic for assurance etat C11
    };
  }

  private generateEtatC11Vie(n: any[]): any {
    return {
      title: "État C11 Vie Sectoriel",
      description: "État réglementaire C11 Vie pour les assurances",
      // Add specific logic for assurance etat C11 vie
    };
  }

  private generateProduits(n: any[]): any {
    return {
      title: "Produits d'Exploitation Assurance",
      description: "Produits d'exploitation spécifiques aux assurances",
      // Add specific logic for assurance produits
    };
  }

  // SMT-specific note generation methods
  private generateGrilleAnalyseNotesSMT(n: any[]): any {
    return {
      title: "Grille d'Analyse des Notes SMT",
      description:
        "Grille d'analyse structurée des notes pour les sociétés de microfinance",
      // Add specific logic for SMT grille analyse notes
    };
  }

  private generateModBilan(n: any[]): any {
    return {
      title: "Modèle de Bilan SMT",
      description: "Modèle de bilan pour les sociétés de microfinance",
      // Add specific logic for SMT mod bilan
    };
  }

  private generateNote1Smt(n: any[]): any {
    return {
      title: "Sommaire du Matériel SMT",
      description: "Sommaire du matériel, mobilier et cautions pour SMT",
      // Add specific logic for SMT note 1
    };
  }

  private generateNote2Smt(n: any[]): any {
    return {
      title: "États des Stocks SMT",
      description: "États des stocks pour les sociétés de microfinance",
      // Add specific logic for SMT note 2
    };
  }

  private generateNote3Smt(n: any[]): any {
    return {
      title: "Créances et Dettes SMT",
      description: "État des créances et dettes non échues pour SMT",
      // Add specific logic for SMT note 3
    };
  }

  private generateNote4Smt(n: any[]): any {
    return {
      title: "Journal Trésorerie SMT",
      description: "Journal des trésoreries pour les sociétés de microfinance",
      // Add specific logic for SMT note 4
    };
  }

  private generateNote5Smt(n: any[]): any {
    return {
      title: "Créances Impayées SMT",
      description: "Journal des sommes des créances impayées pour SMT",
      // Add specific logic for SMT note 5
    };
  }

  private generateNote6Smt(n: any[]): any {
    return {
      title: "Dettes à Payer SMT",
      description: "Journal des sommes des dettes à payer pour SMT",
      // Add specific logic for SMT note 6
    };
  }
}
