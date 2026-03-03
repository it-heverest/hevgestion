// services/report-calculations.service.ts
// Calculation service for DSF reports using DSF config mappings

import { dsfService } from "./dsf.service";

export interface BalanceRow {
  accountNumber: string;
  accountName?: string;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface BalanceData {
  rows: BalanceRow[];
}

export interface DSFConfigMapping {
  accountNumber: string;
  source: "OD" | "OC" | "MD" | "MC" | "SD" | "SC" | "MCD" | "SCD";
  destination: string;
}

export interface DSFConfig {
  id: string;
  configId: string;
  ownerId: string;
  ownerType: "SYSTEM" | "ACCOUNTANT" | "ADMIN";
  codeDsf: string;
  libelle: string;
  operations: string[];
  destinationCell: string | null;
  scope: "GLOBAL" | "CLIENT" | "EXERCISE";
  clientId: string | null;
  exerciseId: string | null;
  isActive: boolean;
  isLocked: boolean;
  isModified: boolean;
  baseConfigId: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
  config: {
    accountMappings: DSFConfigMapping[];
  };
}

export interface ReportCalculationsInput {
  balanceData: BalanceData;
  previousBalanceData?: BalanceData;
  dsfConfigs: DSFConfig[];
}

export interface ReportCalculationResult {
  [key: string]: any;
}

export class ReportCalculationsService {
  private input: ReportCalculationsInput | null = null;

  constructor(input?: ReportCalculationsInput) {
    this.input = input || null;
  }

  /**
   * Update input data for calculations
   */
  updateInput(input: ReportCalculationsInput) {
    this.input = input;
  }

  /**
   * Get account balance value based on DSF config mapping
   */
  private getAccountValue(
    accountNumber: string,
    source: "OD" | "OC" | "MD" | "MC" | "SD" | "SC" | "MCD" | "SCD",
    balanceType: "current" | "previous" = "current"
  ): number {
    if (!this.input) return 0;

    const data =
      balanceType === "current"
        ? this.input.balanceData
        : this.input.previousBalanceData;
    if (!data?.rows) return 0;

    const account = data.rows.find(
      (row) => row.accountNumber === accountNumber
    );
    if (!account) return 0;

    switch (source) {
      case "OD":
        return account.openingDebit;
      case "OC":
        return account.openingCredit;
      case "MD":
        return account.movementDebit;
      case "MC":
        return account.movementCredit;
      case "SD":
        return account.closingDebit;
      case "SC":
        return account.closingCredit;
      case "MCD":
        return account.movementDebit - account.movementCredit;
      case "SCD":
        return account.closingDebit - account.closingCredit;
      default:
        return 0;
    }
  }

  /**
   * Get config mappings for a specific category
   */
  private getConfigMappings(category: string): DSFConfigMapping[] {
    if (!this.input?.dsfConfigs) return [];
    const config = this.input.dsfConfigs.find((c) => c.category === category);
    return config?.config?.accountMappings || [];
  }

  /**
   * Aggregate values by destination (sums multiple accounts mapping to same destination)
   */
  private aggregateByDestination(
    mappings: DSFConfigMapping[],
    balanceType: "current" | "previous" = "current"
  ): Map<string, number> {
    const destinationMap = new Map<string, number>();

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source, balanceType);
      const currentSum = destinationMap.get(mapping.destination) || 0;
      destinationMap.set(mapping.destination, currentSum + value);
    });

    return destinationMap;
  }

  /**
   * Calculate BilanPaysage (Balance Sheet Landscape)
   */
  calculateBilanPaysage(): ReportCalculationResult {
    const mappings = this.getConfigMappings("bilan");
    // Implementation based on DSF config mappings
    return {
      assets: {},
      liabilities: {},
      headerInfo: {
        entityName: "Company Name",
        fiscalYear: "2024",
        idNumber: "Tax Number",
      },
    };
  }

  /**
   * Calculate CompteResultat (Income Statement)
   */
  calculateCompteResultat(): ReportCalculationResult {
    const mappings = this.getConfigMappings("compteresultat");
    // Implementation based on DSF config mappings
    return {
      exploitation: {},
      hao: {},
      resultat: {},
      headerInfo: {
        entityName: "Company Name",
        fiscalYear: "2024",
        idNumber: "Tax Number",
      },
    };
  }

  /**
   * Calculate CF1 (Tax Table 1)
   */
  calculateCF1(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf1");
    const result: any = {
      headerInfo: {
        entityName: "Company Name",
        fiscalYear: "2024",
        idNumber: "Tax Number",
        duration: "12",
      },
      rows: [],
    };

    // Initialize CF1 rows
    const cf1Rows = [
      {
        id: "1",
        label: "Bénéfice net comptable avant impôt",
        line: 1,
        amount: 0,
      },
      { id: "2", label: "Amortissement non déductible", line: 3, amount: 0 },
      // ... other rows
    ];

    // Apply mappings
    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      const row = cf1Rows.find((r) => r.id === mapping.destination);
      if (row) {
        row.amount = value;
      }
    });

    result.rows = cf1Rows;
    return result;
  }

  /**
   * Calculate Note1 (Guaranteed Debts)
   */
  calculateNote1(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note1");

    // Group mappings by destination to sum multiple accounts
    const destinationMap = new Map<
      string,
      { comptes: string[]; montant: number }
    >();

    mappings.forEach((mapping) => {
      const montant = this.getAccountValue(
        mapping.accountNumber,
        mapping.source
      );
      const destination = mapping.destination || "À préciser";

      if (!destinationMap.has(destination)) {
        destinationMap.set(destination, { comptes: [], montant: 0 });
      }

      const entry = destinationMap.get(destination)!;
      entry.comptes.push(mapping.accountNumber);
      entry.montant += montant;
    });

    const dettesGaranties = Array.from(destinationMap.entries()).map(
      ([garantie, data]) => ({
        compte: data.comptes.join(", "),
        montant: data.montant,
        garantie,
      })
    );

    return {
      title: "DETTES GARANTIES PAR DES SURETES REELLES",
      raisonSociale: "Company Name",
      formeJuridique: "SARL",
      activitePrincipale: "À compléter",
      effectif: 0,
      dettesGaranties,
    };
  }

  /**
   * Calculate Note2 (Mandatory Information)
   */
  calculateNote2(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note2");

    // Note2 typically contains static information, but can be configured if needed
    let baseEvaluation = "Coûts historiques";
    let methodesAmortissement = "Linéaire";
    let methodesProvisions = "Au cas par cas";

    // Apply any config mappings if available
    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "baseEvaluation") {
        baseEvaluation = value.toString() || "Coûts historiques";
      } else if (mapping.destination === "methodesAmortissement") {
        methodesAmortissement = value.toString() || "Linéaire";
      } else if (mapping.destination === "methodesProvisions") {
        methodesProvisions = value.toString() || "Au cas par cas";
      }
    });

    return {
      title: "INFORMATIONS OBLIGATOIRES",
      baseEvaluation,
      methodesAmortissement,
      methodesProvisions,
    };
  }

  /**
   * Calculate Note3A (Fixed Assets Brutes)
   */
  calculateNote3A(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note3a");
    const aggregatedValues = this.aggregateByDestination(mappings);

    const immobilisationsIncorporelles = aggregatedValues.get("immobilisationsIncorporelles") || 0;
    const immobilisationsCorporelles = aggregatedValues.get("immobilisationsCorporelles") || 0;
    const immobilisationsFinancieres = aggregatedValues.get("immobilisationsFinancieres") || 0;

    const total = immobilisationsIncorporelles + immobilisationsCorporelles + immobilisationsFinancieres;

    return {
      title: "IMMOBILISATIONS BRUTES",
      immobilisationsIncorporelles,
      immobilisationsCorporelles,
      immobilisationsFinancieres,
      total,
    };
  }
  /**
   * Calculate Note3B (Leasing Assets)
   */
  calculateNote3B(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note3b");

    let debutExercice = 0;
    let acquisitions = 0;
    let cessions = 0;
    let finExercice = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "debutExercice") {
        debutExercice = valueN1;
      } else if (mapping.destination === "acquisitions") {
        acquisitions = valueN;
      } else if (mapping.destination === "cessions") {
        cessions = valueN;
      } else if (mapping.destination === "finExercice") {
        finExercice = valueN;
      }
    });

    // Calculate finExercice if not directly mapped
    if (finExercice === 0 && debutExercice !== 0) {
      finExercice = debutExercice + acquisitions - cessions;
    }

    return {
      title: "BIENS PRIS EN LOCATION ACQUISITION",
      debutExercice,
      acquisitions,
      cessions,
      finExercice,
      tableauDetails: [], // Can be populated from additional mappings if needed
    };
  }

  /**
   * Calculate Note3C (Fixed Assets Depreciation)
   */
  calculateNote3C(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note3c");

    let amortissementsCumules = 0;
    let dotationsExercice = 0;
    let reprisesExercice = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "amortissementsCumules") {
        amortissementsCumules = value;
      } else if (mapping.destination === "dotationsExercice") {
        dotationsExercice = value;
      } else if (mapping.destination === "reprisesExercice") {
        reprisesExercice = value;
      }
    });

    return {
      title: "IMMOBILISATIONS: AMORTISSEMENTS",
      amortissementsCumules,
      dotationsExercice,
      reprisesExercice,
    };
  }

  /**
   * Calculate Note3D (Asset Disposal Plus/Minus Values)
   */
  calculateNote3D(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note3d");

    let prixCession = 0;
    let valeurComptableNette = 0;
    let plusValue = 0;
    let moinsValue = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "prixCession") {
        prixCession = value;
      } else if (mapping.destination === "valeurComptableNette") {
        valeurComptableNette = value;
      } else if (mapping.destination === "plusValue") {
        plusValue = value;
      } else if (mapping.destination === "moinsValue") {
        moinsValue = value;
      }
    });

    // Calculate plus/minus values if not directly mapped
    if (
      plusValue === 0 &&
      moinsValue === 0 &&
      prixCession !== 0 &&
      valeurComptableNette !== 0
    ) {
      const difference = prixCession - valeurComptableNette;
      if (difference > 0) {
        plusValue = difference;
      } else {
        moinsValue = Math.abs(difference);
      }
    }

    return {
      title: "IMMOBILISATIONS: PLUS ET MOINS VALUE DE CESSION",
      prixCession,
      valeurComptableNette,
      plusValue,
      moinsValue,
    };
  }

  /**
   * Calculate Note3E (Revaluation Information)
   */
  calculateNote3E(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note3e");

    let reevaluations: any[] = [];
    let total = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "total") {
        total = value;
      }
      // Additional reevaluation details can be mapped as needed
    });

    return {
      title: "INFORMATIONS SUR LES REEVALUATIONS EFFECTUEES PAR L'ENTITE",
      reevaluations,
      total,
    };
  }

  /**
   * Calculate Note3F (Immobilized Charges Schedule)
   */
  calculateNote3F(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note3f");

    let chargesImmobilisees = 0;
    let amortissements = 0;
    let valeurNette = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "chargesImmobilisees") {
        chargesImmobilisees = value;
      } else if (mapping.destination === "amortissements") {
        amortissements = value;
      } else if (mapping.destination === "valeurNette") {
        valeurNette = value;
      }
    });

    // Calculate valeurNette if not directly mapped
    if (
      valeurNette === 0 &&
      chargesImmobilisees !== 0 &&
      amortissements !== 0
    ) {
      valeurNette = chargesImmobilisees - amortissements;
    }

    return {
      title: "TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES",
      chargesImmobilisees,
      amortissements,
      valeurNette,
    };
  }

  /**
   * Calculate Note4 (Financial Investments)
   */
  calculateNote4(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note4");
    const aggregatedValues = this.aggregateByDestination(mappings);

    const titresDeParticipation = aggregatedValues.get("titresDeParticipation") || 0;
    const autresTitres = aggregatedValues.get("autresTitres") || 0;
    const pretsEtCreances = aggregatedValues.get("pretsEtCreances") || 0;

    const total = titresDeParticipation + autresTitres + pretsEtCreances;

    return {
      title: "IMMOBILISATIONS FINANCIERES",
      titresDeParticipation,
      autresTitres,
      pretsEtCreances,
      total,
    };
  }

  /**
   * Calculate Note5 (HAO Current Assets)
   */
  calculateNote5(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note5");

    let actifCirculantHAO = 0;
    let details: any[] = [];

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "actifCirculantHAO") {
        actifCirculantHAO = value;
      }
      // Additional details can be populated from mappings
    });

    return {
      title: "ACTIF CIRCULANT HAO",
      actifCirculantHAO,
      details,
    };
  }

  /**
   * Calculate Note6 (Stocks and Work in Progress)
   */
  calculateNote6(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note6");

    let marchandisesN = 0,
      marchandisesN1 = 0;
    let matieresPremieresN = 0,
      matieresPremieresN1 = 0;
    let autresApprovisionnementsN = 0,
      autresApprovisionnementsN1 = 0;
    let enCoursN = 0,
      enCoursN1 = 0;
    let produitsFinisN = 0,
      produitsFinisN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "marchandises") {
        marchandisesN = valueN;
        marchandisesN1 = valueN1;
      } else if (mapping.destination === "matieresPremieres") {
        matieresPremieresN = valueN;
        matieresPremieresN1 = valueN1;
      } else if (mapping.destination === "autresApprovisionnements") {
        autresApprovisionnementsN = valueN;
        autresApprovisionnementsN1 = valueN1;
      } else if (mapping.destination === "enCours") {
        enCoursN = valueN;
        enCoursN1 = valueN1;
      } else if (mapping.destination === "produitsFinis") {
        produitsFinisN = valueN;
        produitsFinisN1 = valueN1;
      }
    });

    const totalN =
      marchandisesN +
      matieresPremieresN +
      autresApprovisionnementsN +
      enCoursN +
      produitsFinisN;
    const totalN1 =
      marchandisesN1 +
      matieresPremieresN1 +
      autresApprovisionnementsN1 +
      enCoursN1 +
      produitsFinisN1;

    return {
      title: "STOCKS ET ENCOURS",
      marchandises: { n: marchandisesN, n1: marchandisesN1 },
      matieresPremieres: { n: matieresPremieresN, n1: matieresPremieresN1 },
      autresApprovisionnements: {
        n: autresApprovisionnementsN,
        n1: autresApprovisionnementsN1,
      },
      enCours: { n: enCoursN, n1: enCoursN1 },
      produitsFinis: { n: produitsFinisN, n1: produitsFinisN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note7 (Clients)
   */
  calculateNote7(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note7");
    const aggregatedValuesN = this.aggregateByDestination(mappings, "current");
    const aggregatedValuesN1 = this.aggregateByDestination(mappings, "previous");

    const clientsOrdinairesN = aggregatedValuesN.get("clientsOrdinaires") || 0;
    const clientsOrdinairesN1 = aggregatedValuesN1.get("clientsOrdinaires") || 0;
    const clientsDouteuxN = aggregatedValuesN.get("clientsDouteux") || 0;
    const clientsDouteuxN1 = aggregatedValuesN1.get("clientsDouteux") || 0;
    const creancesSurCessionsN = aggregatedValuesN.get("creancesSurCessions") || 0;
    const creancesSurCessionsN1 = aggregatedValuesN1.get("creancesSurCessions") || 0;
    const provisionsClientsN = aggregatedValuesN.get("provisionsClients") || 0;
    const provisionsClientsN1 = aggregatedValuesN1.get("provisionsClients") || 0;

    const totalN = clientsOrdinairesN + clientsDouteuxN + creancesSurCessionsN - provisionsClientsN;
    const totalN1 = clientsOrdinairesN1 + clientsDouteuxN1 + creancesSurCessionsN1 - provisionsClientsN1;

    return {
      title: "CLIENTS",
      clientsOrdinaires: { n: clientsOrdinairesN, n1: clientsOrdinairesN1 },
      clientsDouteux: { n: clientsDouteuxN, n1: clientsDouteuxN1 },
      creancesSurCessions: {
        n: creancesSurCessionsN,
        n1: creancesSurCessionsN1,
      },
      provisionsClients: { n: provisionsClientsN, n1: provisionsClientsN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note8 (Other Receivables)
   */
  calculateNote8(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note8");
    const aggregatedValuesN = this.aggregateByDestination(mappings, "current");
    const aggregatedValuesN1 = this.aggregateByDestination(mappings, "previous");

    const fournisseursDebiteursN = aggregatedValuesN.get("fournisseursDebiteurs") || 0;
    const fournisseursDebiteursN1 = aggregatedValuesN1.get("fournisseursDebiteurs") || 0;
    const personnelN = aggregatedValuesN.get("personnel") || 0;
    const personnelN1 = aggregatedValuesN1.get("personnel") || 0;
    const etatN = aggregatedValuesN.get("etat") || 0;
    const etatN1 = aggregatedValuesN1.get("etat") || 0;
    const comptesDeLiaisonN = aggregatedValuesN.get("comptesDeLiaison") || 0;
    const comptesDeLiaisonN1 = aggregatedValuesN1.get("comptesDeLiaison") || 0;
    const autresCreancesN = aggregatedValuesN.get("autresCreances") || 0;
    const autresCreancesN1 = aggregatedValuesN1.get("autresCreances") || 0;

    const totalN = fournisseursDebiteursN + personnelN + etatN + comptesDeLiaisonN + autresCreancesN;
    const totalN1 = fournisseursDebiteursN1 + personnelN1 + etatN1 + comptesDeLiaisonN1 + autresCreancesN1;

    return {
      title: "AUTRES CREANCES",
      fournisseursDebiteurs: {
        n: fournisseursDebiteursN,
        n1: fournisseursDebiteursN1,
      },
      personnel: { n: personnelN, n1: personnelN1 },
      etat: { n: etatN, n1: etatN1 },
      comptesDeLiaison: { n: comptesDeLiaisonN, n1: comptesDeLiaisonN1 },
      autresCreances: { n: autresCreancesN, n1: autresCreancesN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note9 (Investment Securities)
   */
  calculateNote9(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note9");

    let titresDePlacement = 0;
    let provisions = 0;
    let valeurNette = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "titresDePlacement") {
        titresDePlacement = value;
      } else if (mapping.destination === "provisions") {
        provisions = value;
      } else if (mapping.destination === "valeurNette") {
        valeurNette = value;
      }
    });

    // Calculate valeurNette if not directly mapped
    if (valeurNette === 0 && titresDePlacement !== 0 && provisions !== 0) {
      valeurNette = titresDePlacement - provisions;
    }

    return {
      title: "TITRES DE PLACEMENT",
      titresDePlacement,
      provisions,
      valeurNette,
    };
  }

  /**
   * Calculate Note10 (Receivables to be Collected)
   */
  calculateNote10(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note10");

    let effetsARecevoir = 0;
    let chequesAEncaisser = 0;
    let couponsAEncaisser = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "effetsARecevoir") {
        effetsARecevoir = value;
      } else if (mapping.destination === "chequesAEncaisser") {
        chequesAEncaisser = value;
      } else if (mapping.destination === "couponsAEncaisser") {
        couponsAEncaisser = value;
      }
    });

    const total = effetsARecevoir + chequesAEncaisser + couponsAEncaisser;

    return {
      title: "VALEURS A ENCAISSER",
      effetsARecevoir,
      chequesAEncaisser,
      couponsAEncaisser,
      total,
    };
  }

  /**
   * Calculate Note11 (Availability)
   */
  calculateNote11(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note11");
    const availabilities = [
      { id: "1", label: "Banques locales", yearN: 0, yearN1: 0 },
      { id: "2", label: "Banques autres états région", yearN: 0, yearN1: 0 },
      { id: "3", label: "Banques, dépôt à terme", yearN: 0, yearN1: 0 },
      { id: "4", label: "Autres Banques", yearN: 0, yearN1: 0 },
      { id: "5", label: "Banques intérêts courus", yearN: 0, yearN1: 0 },
      { id: "6", label: "Chèques postaux", yearN: 0, yearN1: 0 },
      {
        id: "7",
        label: "Autres établissement financiers",
        yearN: 0,
        yearN1: 0,
      },
      {
        id: "8",
        label: "Etablissement financiers intérêts courus",
        yearN: 0,
        yearN1: 0,
      },
      { id: "9", label: "Instrument de trésorerie", yearN: 0, yearN1: 0 },
      { id: "10", label: "Caisse", yearN: 0, yearN1: 0 },
      { id: "11", label: "Caisse électronique mobile", yearN: 0, yearN1: 0 },
      {
        id: "12",
        label: "Régies d'avances et virements accrédités",
        yearN: 0,
        yearN1: 0,
      },
    ];

    // Apply mappings to populate availabilities
    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      const availability = availabilities.find(
        (a) => a.id === mapping.destination
      );
      if (availability) {
        availability.yearN = valueN;
        availability.yearN1 = valueN1;
      }
    });

    const totalBrut = availabilities.reduce((sum, row) => sum + row.yearN, 0);
    const totalDepreciation = 0;
    const totalNet = totalBrut - totalDepreciation;

    return {
      headerInfo: {
        entityName: "Company Name",
        fiscalYear: "2024",
        idNumber: "Tax Number",
        duration: "12",
      },
      availabilities,
      totals: { totalBrut, totalDepreciation, totalNet },
      comment: "",
    };
  }

  // Continue with all other report methods...
  // Note12 through Note34, CF1Bis, CF1Ter, CF1Quater, CF2, CF2Bis, CF2Ter
  // All Assurance reports, etc.

  /**
   * Calculate Note12 (Foreign Exchange Differences)
   */
  calculateNote12(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note12");

    let diminutionCreances = 0;
    let augmentationDettes = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "diminutionCreances") {
        diminutionCreances = value;
      } else if (mapping.destination === "augmentationDettes") {
        augmentationDettes = value;
      }
    });

    const total = diminutionCreances + augmentationDettes;

    return {
      title: "ECARTS DE CONVERSION",
      diminutionCreances,
      augmentationDettes,
      total,
    };
  }

  /**
   * Calculate Note13 (Nominal Value of Shares)
   */
  calculateNote13(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note13");

    let capitalSocial = 0;
    let nombreParts = 0;
    let valeurNominale = 0;
    let repartition: any[] = [];

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "capitalSocial") {
        capitalSocial = value;
      } else if (mapping.destination === "nombreParts") {
        nombreParts = value;
      } else if (mapping.destination === "valeurNominale") {
        valeurNominale = value;
      }
    });

    // Calculate valeurNominale if not directly mapped
    if (valeurNominale === 0 && capitalSocial !== 0 && nombreParts !== 0) {
      valeurNominale = capitalSocial / nombreParts;
    }

    return {
      title: "VALEUR NOMINALE DES ACTIONS OU PARTS",
      capitalSocial,
      nombreParts,
      valeurNominale,
      repartition,
    };
  }

  /**
   * Calculate Note14 (Primes and Reserves)
   */
  calculateNote14(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note14");

    let primesApport = 0;
    let primesFusion = 0;
    let primesEmission = 0;
    let reserveLegale = 0;
    let reserveStatutaire = 0;
    let reservesReglementees = 0;
    let autresReserves = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "primesApport") {
        primesApport = value;
      } else if (mapping.destination === "primesFusion") {
        primesFusion = value;
      } else if (mapping.destination === "primesEmission") {
        primesEmission = value;
      } else if (mapping.destination === "reserveLegale") {
        reserveLegale = value;
      } else if (mapping.destination === "reserveStatutaire") {
        reserveStatutaire = value;
      } else if (mapping.destination === "reservesReglementees") {
        reservesReglementees = value;
      } else if (mapping.destination === "autresReserves") {
        autresReserves = value;
      }
    });

    const total =
      primesApport +
      primesFusion +
      primesEmission +
      reserveLegale +
      reserveStatutaire +
      reservesReglementees +
      autresReserves;

    return {
      title: "PRIMES ET RESERVES",
      primesApport,
      primesFusion,
      primesEmission,
      reserveLegale,
      reserveStatutaire,
      reservesReglementees,
      autresReserves,
      total,
    };
  }

  /**
   * Calculate Note15A (Subventions and Regulated Provisions)
   */
  calculateNote15A(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note15a");

    let subventionsEquipement = 0;
    let provisionsReglementees = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "subventionsEquipement") {
        subventionsEquipement = value;
      } else if (mapping.destination === "provisionsReglementees") {
        provisionsReglementees = value;
      }
    });

    const total = subventionsEquipement + provisionsReglementees;

    return {
      title: "SUBVENTIONS ET PROVISIONS REGLEMENTEES",
      subventionsEquipement,
      provisionsReglementees,
      total,
    };
  }

  /**
   * Calculate Note15B (Other Equity)
   */
  calculateNote15B(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note15b");

    let empruntsParticuliers = 0;
    let autresEmprunts = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "empruntsParticuliers") {
        empruntsParticuliers = value;
      } else if (mapping.destination === "autresEmprunts") {
        autresEmprunts = value;
      }
    });

    const total = empruntsParticuliers + autresEmprunts;

    return {
      title: "AUTRES FONDS PROPRES",
      empruntsParticuliers,
      autresEmprunts,
      total,
    };
  }

  /**
   * Calculate Note16A (Financial Debts and Assimilated Resources)
   */
  calculateNote16A(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note16a");

    let empruntsObligataires = 0;
    let empruntsEtablissementsCredit = 0;
    let depotsCautionnements = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "empruntsObligataires") {
        empruntsObligataires = value;
      } else if (mapping.destination === "empruntsEtablissementsCredit") {
        empruntsEtablissementsCredit = value;
      } else if (mapping.destination === "depotsCautionnements") {
        depotsCautionnements = value;
      }
    });

    const total =
      empruntsObligataires +
      empruntsEtablissementsCredit +
      depotsCautionnements;

    return {
      title: "DETTES FINANCIERES ET RESSOURCES ASSIMILEES",
      empruntsObligataires,
      empruntsEtablissementsCredit,
      depotsCautionnements,
      total,
    };
  }

  /**
   * Calculate Note16B (Retirement Commitments)
   */
  calculateNote16B(): ReportCalculationResult {
    return {
      title:
        "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES (METHODE ACTUARIELLE)",
      valeurActuelleEngagements: 0,
      justerValeurActifs: 0,
      ecartsActuariels: 0,
      total: 0,
    };
  }

  /**
   * Calculate Note16BBis (Retirement Commitments)
   */
  calculateNote16BBis(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note16bbis");
    // Implementation based on mappings
    return {
      title: "ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES",
      provisionOuverture: 0,
      dotationsExercice: 0,
      reprisesExercice: 0,
      provisionCloture: 0,
    };
  }

  /**
   * Calculate Note16C (Contingent Assets and Liabilities)
   */
  calculateNote16C(): ReportCalculationResult {
    return {
      title: "ACTIFS ET PASSIFS EVENTUELS",
      cautions: 0,
      avals: 0,
      garanties: 0,
      engagementsCredit: 0,
      total: 0,
    };
  }

  /**
   * Calculate Note17 (Suppliers)
   */
  calculateNote17(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note17");

    let fournisseursOrdinaires = 0;
    let fournisseursEffetsAPayer = 0;
    let fournisseursRetenues = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "fournisseursOrdinaires") {
        fournisseursOrdinaires = value;
      } else if (mapping.destination === "fournisseursEffetsAPayer") {
        fournisseursEffetsAPayer = value;
      } else if (mapping.destination === "fournisseursRetenues") {
        fournisseursRetenues = value;
      }
    });

    const total =
      fournisseursOrdinaires + fournisseursEffetsAPayer + fournisseursRetenues;

    return {
      title: "FOURNISSEURS D'EXPLOITATION",
      fournisseursOrdinaires,
      fournisseursEffetsAPayer,
      fournisseursRetenues,
      total,
    };
  }

  /**
   * Calculate C1Note17 (Suppliers General Ledger Extract)
   */
  calculateC1Note17(): ReportCalculationResult {
    const mappings = this.getConfigMappings("c1note17");

    let fournisseurs: any[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    mappings.forEach((mapping) => {
      const debit = this.getAccountValue(mapping.accountNumber, "SD");
      const credit = this.getAccountValue(mapping.accountNumber, "SC");

      if (debit !== 0 || credit !== 0) {
        fournisseurs.push({
          account: mapping.accountNumber,
          debit,
          credit,
          balance: debit - credit,
        });
        totalDebit += debit;
        totalCredit += credit;
      }
    });

    const solde = totalDebit - totalCredit;

    return {
      title: "EXTRAIT DE LA BALANCE GENERALE FOURNISSEURS",
      fournisseurs,
      totalDebit,
      totalCredit,
      solde,
    };
  }

  /**
   * Calculate Note18 (Tax and Social Debts)
   */
  calculateNote18(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note18");

    let tva = 0;
    let impotsSurSalaires = 0;
    let impotsSurResultat = 0;
    let autresImpots = 0;
    let cnps = 0;
    let personnel = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "tva") {
        tva = value;
      } else if (mapping.destination === "impotsSurSalaires") {
        impotsSurSalaires = value;
      } else if (mapping.destination === "impotsSurResultat") {
        impotsSurResultat = value;
      } else if (mapping.destination === "autresImpots") {
        autresImpots = value;
      } else if (mapping.destination === "cnps") {
        cnps = value;
      } else if (mapping.destination === "personnel") {
        personnel = value;
      }
    });

    const total =
      tva +
      impotsSurSalaires +
      impotsSurResultat +
      autresImpots +
      cnps +
      personnel;

    return {
      title: "DETTES FISCALES ET SOCIALES",
      dettesFiscales: {
        tva,
        impotsSurSalaires,
        impotsSurResultat,
        autresImpots,
      },
      dettesSociales: {
        cnps,
        personnel,
      },
      total,
    };
  }

  /**
   * Calculate Note19 (Other Debts and Short-term Provisions)
   */
  calculateNote19(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note19");

    let autresDettes = 0;
    let provisionsRisques = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "autresDettes") {
        autresDettes = value;
      } else if (mapping.destination === "provisionsRisques") {
        provisionsRisques = value;
      }
    });

    const total = autresDettes + provisionsRisques;

    return {
      title: "AUTRES DETTES ET PROVISIONS POUR RISQUES A COURT TERME",
      autresDettes,
      provisionsRisques,
      total,
    };
  }

  /**
   * Calculate Note20 (Banks, Discount Credit and Treasury)
   */
  calculateNote20(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note20");

    let creditsCourtsTermes = 0;
    let decouvertsBancaires = 0;
    let escompteEffets = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "creditsCourtsTermes") {
        creditsCourtsTermes = value;
      } else if (mapping.destination === "decouvertsBancaires") {
        decouvertsBancaires = value;
      } else if (mapping.destination === "escompteEffets") {
        escompteEffets = value;
      }
    });

    const total = creditsCourtsTermes + decouvertsBancaires + escompteEffets;

    return {
      title: "BANQUES, CREDIT D'ESCOMPTE ET DE TRESORERIE",
      creditsCourtsTermes,
      decouvertsBancaires,
      escompteEffets,
      total,
    };
  }

  /**
   * Calculate Note21 (Turnover and Other Products)
   */
  calculateNote21(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note21");

    let ventesMarchandisesN = 0,
      ventesMarchandisesN1 = 0;
    let ventesProduitsN = 0,
      ventesProduitsN1 = 0;
    let travauxN = 0,
      travauxN1 = 0;
    let servicesN = 0,
      servicesN1 = 0;
    let produitsDiversN = 0,
      produitsDiversN1 = 0;
    let rabaisRemisesN = 0,
      rabaisRemisesN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "ventesMarchandises") {
        ventesMarchandisesN = valueN;
        ventesMarchandisesN1 = valueN1;
      } else if (mapping.destination === "ventesProduits") {
        ventesProduitsN = valueN;
        ventesProduitsN1 = valueN1;
      } else if (mapping.destination === "travaux") {
        travauxN = valueN;
        travauxN1 = valueN1;
      } else if (mapping.destination === "services") {
        servicesN = valueN;
        servicesN1 = valueN1;
      } else if (mapping.destination === "produitsDivers") {
        produitsDiversN = valueN;
        produitsDiversN1 = valueN1;
      } else if (mapping.destination === "rabaisRemises") {
        rabaisRemisesN = valueN;
        rabaisRemisesN1 = valueN1;
      }
    });

    const totalN =
      ventesMarchandisesN +
      ventesProduitsN +
      travauxN +
      servicesN +
      produitsDiversN -
      rabaisRemisesN;
    const totalN1 =
      ventesMarchandisesN1 +
      ventesProduitsN1 +
      travauxN1 +
      servicesN1 +
      produitsDiversN1 -
      rabaisRemisesN1;

    return {
      title: "CHIFFRE D'AFFAIRES ET AUTRES PRODUITS",
      ventesMarchandises: { n: ventesMarchandisesN, n1: ventesMarchandisesN1 },
      ventesProduits: { n: ventesProduitsN, n1: ventesProduitsN1 },
      travaux: { n: travauxN, n1: travauxN1 },
      services: { n: servicesN, n1: servicesN1 },
      produitsDivers: { n: produitsDiversN, n1: produitsDiversN1 },
      rabaisRemises: { n: rabaisRemisesN, n1: rabaisRemisesN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note22 (Purchases)
   */
  calculateNote22(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note22");

    let marchandisesN = 0,
      marchandisesN1 = 0;
    let matieresPremieresN = 0,
      matieresPremieresN1 = 0;
    let autresApprovisionnementsN = 0,
      autresApprovisionnementsN1 = 0;
    let rabaisRemisesN = 0,
      rabaisRemisesN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "marchandises") {
        marchandisesN = valueN;
        marchandisesN1 = valueN1;
      } else if (mapping.destination === "matieresPremieres") {
        matieresPremieresN = valueN;
        matieresPremieresN1 = valueN1;
      } else if (mapping.destination === "autresApprovisionnements") {
        autresApprovisionnementsN = valueN;
        autresApprovisionnementsN1 = valueN1;
      } else if (mapping.destination === "rabaisRemises") {
        rabaisRemisesN = valueN;
        rabaisRemisesN1 = valueN1;
      }
    });

    const totalN =
      marchandisesN +
      matieresPremieresN +
      autresApprovisionnementsN -
      rabaisRemisesN;
    const totalN1 =
      marchandisesN1 +
      matieresPremieresN1 +
      autresApprovisionnementsN1 -
      rabaisRemisesN1;

    return {
      title: "ACHATS",
      marchandises: { n: marchandisesN, n1: marchandisesN1 },
      matieresPremieres: { n: matieresPremieresN, n1: matieresPremieresN1 },
      autresApprovisionnements: {
        n: autresApprovisionnementsN,
        n1: autresApprovisionnementsN1,
      },
      rabaisRemises: { n: rabaisRemisesN, n1: rabaisRemisesN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note23 (Transportation)
   */
  calculateNote23(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note23");

    let transportsAchatsN = 0,
      transportsAchatsN1 = 0;
    let transportsVentesN = 0,
      transportsVentesN1 = 0;
    let transportsPersonnelN = 0,
      transportsPersonnelN1 = 0;
    let autresTransportsN = 0,
      autresTransportsN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "transportsAchats") {
        transportsAchatsN = valueN;
        transportsAchatsN1 = valueN1;
      } else if (mapping.destination === "transportsVentes") {
        transportsVentesN = valueN;
        transportsVentesN1 = valueN1;
      } else if (mapping.destination === "transportsPersonnel") {
        transportsPersonnelN = valueN;
        transportsPersonnelN1 = valueN1;
      } else if (mapping.destination === "autresTransports") {
        autresTransportsN = valueN;
        autresTransportsN1 = valueN1;
      }
    });

    const totalN =
      transportsAchatsN +
      transportsVentesN +
      transportsPersonnelN +
      autresTransportsN;
    const totalN1 =
      transportsAchatsN1 +
      transportsVentesN1 +
      transportsPersonnelN1 +
      autresTransportsN1;

    return {
      title: "TRANSPORTS",
      transportsAchats: { n: transportsAchatsN, n1: transportsAchatsN1 },
      transportsVentes: { n: transportsVentesN, n1: transportsVentesN1 },
      transportsPersonnel: {
        n: transportsPersonnelN,
        n1: transportsPersonnelN1,
      },
      autresTransports: { n: autresTransportsN, n1: autresTransportsN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note24 (External Services)
   */
  calculateNote24(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note24");

    let loyersN = 0,
      loyersN1 = 0;
    let entretienN = 0,
      entretienN1 = 0;
    let primesN = 0,
      primesN1 = 0;
    let documentationN = 0,
      documentationN1 = 0;
    let autresServicesN = 0,
      autresServicesN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "loyers") {
        loyersN = valueN;
        loyersN1 = valueN1;
      } else if (mapping.destination === "entretien") {
        entretienN = valueN;
        entretienN1 = valueN1;
      } else if (mapping.destination === "primes") {
        primesN = valueN;
        primesN1 = valueN1;
      } else if (mapping.destination === "documentation") {
        documentationN = valueN;
        documentationN1 = valueN1;
      } else if (mapping.destination === "autresServices") {
        autresServicesN = valueN;
        autresServicesN1 = valueN1;
      }
    });

    const totalN =
      loyersN + entretienN + primesN + documentationN + autresServicesN;
    const totalN1 =
      loyersN1 + entretienN1 + primesN1 + documentationN1 + autresServicesN1;

    return {
      title: "SERVICES EXTERIEURS",
      loyers: { n: loyersN, n1: loyersN1 },
      entretien: { n: entretienN, n1: entretienN1 },
      primes: { n: primesN, n1: primesN1 },
      documentation: { n: documentationN, n1: documentationN1 },
      autresServices: { n: autresServicesN, n1: autresServicesN1 },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note25 (Taxes and Duties)
   */
  calculateNote25(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note25");

    let impotsSurBenefices = 0;
    let autresImpots = 0;
    let patente = 0;
    let foncier = 0;
    let taxesVehicules = 0;
    let autresTaxes = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "impotsSurBenefices") {
        impotsSurBenefices = value;
      } else if (mapping.destination === "autresImpots") {
        autresImpots = value;
      } else if (mapping.destination === "patente") {
        patente = value;
      } else if (mapping.destination === "foncier") {
        foncier = value;
      } else if (mapping.destination === "taxesVehicules") {
        taxesVehicules = value;
      } else if (mapping.destination === "autresTaxes") {
        autresTaxes = value;
      }
    });

    const total =
      impotsSurBenefices +
      autresImpots +
      patente +
      foncier +
      taxesVehicules +
      autresTaxes;

    return {
      title: "IMPOTS ET TAXES",
      impotsSurBenefices,
      autresImpots,
      total,
      detail: {
        patente,
        foncier,
        taxesVehicules,
        autresTaxes,
      },
    };
  }

  /**
   * Calculate C1Note25 (Taxes and Duties Synthesis)
   */
  calculateC1Note25(): ReportCalculationResult {
    const mappings = this.getConfigMappings("c1note25");

    let impotsVersesExploitation = 0;
    let impotsHAO = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "impotsVersesExploitation") {
        impotsVersesExploitation = value;
      } else if (mapping.destination === "impotsHAO") {
        impotsHAO = value;
      }
    });

    const total = impotsVersesExploitation + impotsHAO;

    return {
      title: "SYNTHESE DES IMPOTS ET TAXES VERSES",
      impotsVersesExploitation,
      impotsHAO,
      total,
    };
  }

  /**
   * Calculate C2Note25 (Accise Duties Regularization)
   */
  calculateC2Note25(): ReportCalculationResult {
    const mappings = this.getConfigMappings("c2note25");

    let baseImposable = 0;
    let tauxAccises = 0;
    let droitsCalcules = 0;
    let droitsVerses = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "baseImposable") {
        baseImposable = value;
      } else if (mapping.destination === "tauxAccises") {
        tauxAccises = value;
      } else if (mapping.destination === "droitsCalcules") {
        droitsCalcules = value;
      } else if (mapping.destination === "droitsVerses") {
        droitsVerses = value;
      }
    });

    // Calculate droitsCalcules if not directly mapped
    if (droitsCalcules === 0 && baseImposable !== 0 && tauxAccises !== 0) {
      droitsCalcules = baseImposable * tauxAccises;
    }

    const solde = droitsCalcules - droitsVerses;

    return {
      title:
        "TABLEAU DE LA REGULARISATION ANNUELLE DES DROITS D'ACCISES: DETERMINATION DES DROITS D'ACCISES A REVERSER",
      baseImposable,
      tauxAccises,
      droitsCalcules,
      droitsVerses,
      solde,
    };
  }

  /**
   * Calculate Note26 (Other Charges)
   */
  calculateNote26(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note26");

    let chargesDiversesN = 0,
      chargesDiversesN1 = 0;
    let pertesSurCreances = 0;
    let chargesExceptionnelles = 0;
    let autresCharges = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "chargesDiverses") {
        chargesDiversesN = valueN;
        chargesDiversesN1 = valueN1;
      } else if (mapping.destination === "pertesSurCreances") {
        pertesSurCreances = valueN;
      } else if (mapping.destination === "chargesExceptionnelles") {
        chargesExceptionnelles = valueN;
      } else if (mapping.destination === "autresCharges") {
        autresCharges = valueN;
      }
    });

    const totalN =
      chargesDiversesN +
      pertesSurCreances +
      chargesExceptionnelles +
      autresCharges;
    const totalN1 = chargesDiversesN1; // Only current year has detailed breakdown

    return {
      title: "AUTRES CHARGES",
      chargesDiverses: { n: chargesDiversesN, n1: chargesDiversesN1 },
      detail: {
        pertesSurCreances,
        chargesExceptionnelles,
        autresCharges,
      },
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate Note27A (Personnel Charges)
   */
  calculateNote27A(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note27a");
    const aggregatedValuesN = this.aggregateByDestination(mappings, "current");
    const aggregatedValuesN1 = this.aggregateByDestination(mappings, "previous");

    const rows = [
      {
        id: "1",
        label: "Rémunérations directes versées au personnel",
        yearN: aggregatedValuesN.get("remunerationsPersonnel") || 0,
        yearN1: aggregatedValuesN1.get("remunerationsPersonnel") || 0,
      },
      {
        id: "2",
        label: "Indemnités forfaitaire versées au personnel",
        yearN: aggregatedValuesN.get("indemnitesPersonnel") || 0,
        yearN1: aggregatedValuesN1.get("indemnitesPersonnel") || 0,
      },
      {
        id: "3",
        label: "Charges sociales",
        yearN: aggregatedValuesN.get("chargesSociales") || 0,
        yearN1: aggregatedValuesN1.get("chargesSociales") || 0,
      },
      {
        id: "4",
        label: "Rémunérations et charges sociales de l'exploitant individuel",
        yearN: aggregatedValuesN.get("remunerationsExploitant") || 0,
        yearN1: aggregatedValuesN1.get("remunerationsExploitant") || 0,
      },
      {
        id: "5",
        label: "Rémunération transférée de personnel extérieur",
        yearN: aggregatedValuesN.get("personnelExterieur") || 0,
        yearN1: aggregatedValuesN1.get("personnelExterieur") || 0,
      },
      {
        id: "6",
        label: "Autres charges sociales",
        yearN: aggregatedValuesN.get("autresChargesSociales") || 0,
        yearN1: aggregatedValuesN1.get("autresChargesSociales") || 0,
      },
    ];

    const totalN = rows.reduce((acc, r) => acc + r.yearN, 0);
    const totalN1 = rows.reduce((acc, r) => acc + r.yearN1, 0);

    return {
      title: "CHARGES DE PERSONNEL",
      rows,
      total: { n: totalN, n1: totalN1 },
    };
  }

  /**
   * Calculate C1Note27A (Payroll Taxes Regularization)
   */
  calculateC1Note27A(): ReportCalculationResult {
    const mappings = this.getConfigMappings("c1note27a");

    let masseSalariale = 0;
    let irppVerse = 0;
    let centimesCommunaux = 0;
    let cfpVerse = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "masseSalariale") {
        masseSalariale = value;
      } else if (mapping.destination === "irppVerse") {
        irppVerse = value;
      } else if (mapping.destination === "centimesCommunaux") {
        centimesCommunaux = value;
      } else if (mapping.destination === "cfpVerse") {
        cfpVerse = value;
      }
    });

    const total = irppVerse + centimesCommunaux + cfpVerse;

    return {
      title:
        "TABLEAU DE REGULARISATION ANNUELLE DES IMPOTS ET TAXES SUR SALAIRES",
      masseSalariale,
      irppVerse,
      centimesCommunaux,
      cfpVerse,
      total,
    };
  }

  /**
   * Calculate Note27B (Staff, Payroll and External Personnel)
   */
  calculateNote27B(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note27b");

    let cadres = 0;
    let employes = 0;
    let ouvriers = 0;
    let salaires = 0;
    let chargesSociales = 0;
    let personnelExterieur = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "cadres") {
        cadres = value;
      } else if (mapping.destination === "employes") {
        employes = value;
      } else if (mapping.destination === "ouvriers") {
        ouvriers = value;
      } else if (mapping.destination === "salaires") {
        salaires = value;
      } else if (mapping.destination === "chargesSociales") {
        chargesSociales = value;
      } else if (mapping.destination === "personnelExterieur") {
        personnelExterieur = value;
      }
    });

    const totalEffectif = cadres + employes + ouvriers;
    const totalMasseSalariale = salaires + chargesSociales;

    return {
      title: "EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR",
      effectif: {
        cadres,
        employes,
        ouvriers,
        total: totalEffectif,
      },
      masseSalariale: {
        salaires,
        chargesSociales,
        total: totalMasseSalariale,
      },
      personnelExterieur,
    };
  }

  /**
   * Calculate Note28 (Provisions and Depreciation)
   */
  calculateNote28(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note28");

    let provisionsExploitation = 0;
    let provisionsFinancieres = 0;
    let provisionsHAO = 0;
    let depreciationsExploitation = 0;
    let depreciationsFinancieres = 0;
    let depreciationsHAO = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "provisionsExploitation") {
        provisionsExploitation = value;
      } else if (mapping.destination === "provisionsFinancieres") {
        provisionsFinancieres = value;
      } else if (mapping.destination === "provisionsHAO") {
        provisionsHAO = value;
      } else if (mapping.destination === "depreciationsExploitation") {
        depreciationsExploitation = value;
      } else if (mapping.destination === "depreciationsFinancieres") {
        depreciationsFinancieres = value;
      } else if (mapping.destination === "depreciationsHAO") {
        depreciationsHAO = value;
      }
    });

    const total =
      provisionsExploitation +
      provisionsFinancieres +
      provisionsHAO +
      (depreciationsExploitation + depreciationsFinancieres + depreciationsHAO);

    return {
      title: "PROVISIONS ET DEPRECIATIONS INSCRITES AU BILAN",
      provisions: {
        exploitation: provisionsExploitation,
        financieres: provisionsFinancieres,
        hao: provisionsHAO,
      },
      depreciations: {
        exploitation: depreciationsExploitation,
        financieres: depreciationsFinancieres,
        hao: depreciationsHAO,
      },
      total,
    };
  }

  /**
   * Calculate C1Note28 (Provisions Tax Treatment - Reversals)
   */
  calculateC1Note28(): ReportCalculationResult {
    const mappings = this.getConfigMappings("c1note28");

    let reprisesExploitation = 0;
    let reprisesFinancieres = 0;
    let reprisesHAO = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "reprisesExploitation") {
        reprisesExploitation = value;
      } else if (mapping.destination === "reprisesFinancieres") {
        reprisesFinancieres = value;
      } else if (mapping.destination === "reprisesHAO") {
        reprisesHAO = value;
      }
    });

    const total = reprisesExploitation + reprisesFinancieres + reprisesHAO;

    return {
      title:
        "TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE L'EXERCICE: LES REPRISES",
      reprisesExploitation,
      reprisesFinancieres,
      reprisesHAO,
      total,
    };
  }

  /**
   * Calculate C2Note28 (Provisions Tax Treatment - Allocations)
   */
  calculateC2Note28(): ReportCalculationResult {
    const mappings = this.getConfigMappings("c2note28");

    let dotationsExploitation = 0;
    let dotationsFinancieres = 0;
    let dotationsHAO = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "dotationsExploitation") {
        dotationsExploitation = value;
      } else if (mapping.destination === "dotationsFinancieres") {
        dotationsFinancieres = value;
      } else if (mapping.destination === "dotationsHAO") {
        dotationsHAO = value;
      }
    });

    const total = dotationsExploitation + dotationsFinancieres + dotationsHAO;

    return {
      title:
        "TABLEAU RECAPITULATIF DU TRAITEMENT FISCAL DES PROVISIONS DE L'EXERCICE: LES DOTATIONS",
      dotationsExploitation,
      dotationsFinancieres,
      dotationsHAO,
      total,
    };
  }

  /**
   * Calculate Note29 (Financial Charges and Income)
   */
  calculateNote29(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note29");

    let revenusFinanciersN = 0,
      revenusFinanciersN1 = 0;
    let reprisesProvisionsN = 0,
      reprisesProvisionsN1 = 0;
    let interetsN = 0,
      interetsN1 = 0;
    let pertesChangeN = 0,
      pertesChangeN1 = 0;
    let autresChargesN = 0,
      autresChargesN1 = 0;
    let dotationsProvisionsN = 0,
      dotationsProvisionsN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "revenusFinanciers") {
        revenusFinanciersN = valueN;
        revenusFinanciersN1 = valueN1;
      } else if (mapping.destination === "reprisesProvisions") {
        reprisesProvisionsN = valueN;
        reprisesProvisionsN1 = valueN1;
      } else if (mapping.destination === "interets") {
        interetsN = valueN;
        interetsN1 = valueN1;
      } else if (mapping.destination === "pertesChange") {
        pertesChangeN = valueN;
        pertesChangeN1 = valueN1;
      } else if (mapping.destination === "autresCharges") {
        autresChargesN = valueN;
        autresChargesN1 = valueN1;
      } else if (mapping.destination === "dotationsProvisions") {
        dotationsProvisionsN = valueN;
        dotationsProvisionsN1 = valueN1;
      }
    });

    const totalRevenusN = revenusFinanciersN + reprisesProvisionsN;
    const totalRevenusN1 = revenusFinanciersN1 + reprisesProvisionsN1;
    const totalChargesN =
      interetsN + pertesChangeN + autresChargesN + dotationsProvisionsN;
    const totalChargesN1 =
      interetsN1 + pertesChangeN1 + autresChargesN1 + dotationsProvisionsN1;

    const resultatFinancierN = totalRevenusN - totalChargesN;
    const resultatFinancierN1 = totalRevenusN1 - totalChargesN1;

    return {
      title: "CHARGES ET REVENUS FINANCIERS",
      revenus: {
        revenusFinanciers: { n: revenusFinanciersN, n1: revenusFinanciersN1 },
        reprisesProvisions: {
          n: reprisesProvisionsN,
          n1: reprisesProvisionsN1,
        },
      },
      charges: {
        interets: { n: interetsN, n1: interetsN1 },
        pertesChange: { n: pertesChangeN, n1: pertesChangeN1 },
        autresCharges: { n: autresChargesN, n1: autresChargesN1 },
        dotationsProvisions: {
          n: dotationsProvisionsN,
          n1: dotationsProvisionsN1,
        },
      },
      resultatFinancier: { n: resultatFinancierN, n1: resultatFinancierN1 },
    };
  }

  /**
   * Calculate Note30 (Other HAO Charges and Products)
   */
  calculateNote30(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note30");

    let plusValuesCessionsN = 0,
      plusValuesCessionsN1 = 0;
    let produitsExceptionnelsN = 0,
      produitsExceptionnelsN1 = 0;
    let moinsValuesCessionsN = 0,
      moinsValuesCessionsN1 = 0;
    let chargesExceptionnellesN = 0,
      chargesExceptionnellesN1 = 0;

    mappings.forEach((mapping) => {
      const valueN = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "current"
      );
      const valueN1 = this.getAccountValue(
        mapping.accountNumber,
        mapping.source,
        "previous"
      );

      if (mapping.destination === "plusValuesCessions") {
        plusValuesCessionsN = valueN;
        plusValuesCessionsN1 = valueN1;
      } else if (mapping.destination === "produitsExceptionnels") {
        produitsExceptionnelsN = valueN;
        produitsExceptionnelsN1 = valueN1;
      } else if (mapping.destination === "moinsValuesCessions") {
        moinsValuesCessionsN = valueN;
        moinsValuesCessionsN1 = valueN1;
      } else if (mapping.destination === "chargesExceptionnelles") {
        chargesExceptionnellesN = valueN;
        chargesExceptionnellesN1 = valueN1;
      }
    });

    const totalProduitsN = plusValuesCessionsN + produitsExceptionnelsN;
    const totalProduitsN1 = plusValuesCessionsN1 + produitsExceptionnelsN1;
    const totalChargesN = moinsValuesCessionsN + chargesExceptionnellesN;
    const totalChargesN1 = moinsValuesCessionsN1 + chargesExceptionnellesN1;

    const resultatHAON = totalProduitsN - totalChargesN;
    const resultatHAON1 = totalProduitsN1 - totalChargesN1;

    return {
      title: "AUTRES CHARGES ET PRODUITS HAO",
      produits: {
        plusValuesCessions: {
          n: plusValuesCessionsN,
          n1: plusValuesCessionsN1,
        },
        produitsExceptionnels: {
          n: produitsExceptionnelsN,
          n1: produitsExceptionnelsN1,
        },
      },
      charges: {
        moinsValuesCessions: {
          n: moinsValuesCessionsN,
          n1: moinsValuesCessionsN1,
        },
        chargesExceptionnelles: {
          n: chargesExceptionnellesN,
          n1: chargesExceptionnellesN1,
        },
      },
      resultatHAO: { n: resultatHAON, n1: resultatHAON1 },
    };
  }

  /**
   * Calculate Note31 (Result Distribution)
   */
  calculateNote31(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note31");

    let resultatAvantImpot = 0;
    let impotSurResultat = 0;
    let resultatNet = 0;
    let dividendes = 0;
    let reportANouveau = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "resultatAvantImpot") {
        resultatAvantImpot = value;
      } else if (mapping.destination === "impotSurResultat") {
        impotSurResultat = value;
      } else if (mapping.destination === "resultatNet") {
        resultatNet = value;
      } else if (mapping.destination === "dividendes") {
        dividendes = value;
      } else if (mapping.destination === "reportANouveau") {
        reportANouveau = value;
      }
    });

    // Calculate derived values if not directly mapped
    if (
      resultatNet === 0 &&
      resultatAvantImpot !== 0 &&
      impotSurResultat !== 0
    ) {
      resultatNet = resultatAvantImpot - impotSurResultat;
    }

    return {
      title:
        "REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EXERCICES",
      resultatAvantImpot,
      impotSurResultat,
      resultatNet,
      dividendes,
      reportANouveau,
    };
  }

  /**
   * Calculate Note32 (Period Production)
   */
  calculateNote32(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note32");

    let ventesProduction = 0;
    let productionStockee = 0;
    let productionImmobilisee = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "ventesProduction") {
        ventesProduction = value;
      } else if (mapping.destination === "productionStockee") {
        productionStockee = value;
      } else if (mapping.destination === "productionImmobilisee") {
        productionImmobilisee = value;
      }
    });

    const total = ventesProduction + productionStockee + productionImmobilisee;

    return {
      title: "PRODUCTION DE L'EXERCICE",
      ventesProduction,
      productionStockee,
      productionImmobilisee,
      total,
    };
  }

  /**
   * Calculate Note33 (Production Purchases)
   */
  calculateNote33(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note33");

    let achatsMatieresPremieres = 0;
    let autresApprovisionnements = 0;
    let variationStocks = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "achatsMatieresPremieres") {
        achatsMatieresPremieres = value;
      } else if (mapping.destination === "autresApprovisionnements") {
        autresApprovisionnements = value;
      } else if (mapping.destination === "variationStocks") {
        variationStocks = value;
      }
    });

    const total =
      achatsMatieresPremieres + autresApprovisionnements + variationStocks;

    return {
      title: "ACHATS DESTINES A LA PRODUCTION",
      achatsMatieresPremieres,
      autresApprovisionnements,
      variationStocks,
      total,
    };
  }

  /**
   * Calculate Note34 (Financial Indicators Synthesis Sheet)
   */
  calculateNote34(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note34");

    let chiffreAffaires = 0;
    let valeurAjoutee = 0;
    let excedentBrutExploitation = 0;
    let resultatExploitation = 0;
    let resultatFinancier = 0;
    let resultatHAO = 0;
    let resultatNet = 0;
    let capaciteAutofinancement = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "chiffreAffaires") {
        chiffreAffaires = value;
      } else if (mapping.destination === "valeurAjoutee") {
        valeurAjoutee = value;
      } else if (mapping.destination === "excedentBrutExploitation") {
        excedentBrutExploitation = value;
      } else if (mapping.destination === "resultatExploitation") {
        resultatExploitation = value;
      } else if (mapping.destination === "resultatFinancier") {
        resultatFinancier = value;
      } else if (mapping.destination === "resultatHAO") {
        resultatHAO = value;
      } else if (mapping.destination === "resultatNet") {
        resultatNet = value;
      } else if (mapping.destination === "capaciteAutofinancement") {
        capaciteAutofinancement = value;
      }
    });

    // Calculate ratios if base values are available
    let margeCommerciale = 0;
    let tauxMarque = 0;
    let rentabiliteCommerciale = 0;
    let rentabiliteEconomique = 0;

    if (chiffreAffaires !== 0) {
      if (valeurAjoutee !== 0) {
        rentabiliteEconomique = (resultatExploitation / valeurAjoutee) * 100;
      }
      if (resultatNet !== 0) {
        rentabiliteCommerciale = (resultatNet / chiffreAffaires) * 100;
      }
    }

    return {
      title: "FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS",
      chiffreAffaires,
      valeurAjoutee,
      excedentBrutExploitation,
      resultatExploitation,
      resultatFinancier,
      resultatHAO,
      resultatNet,
      capaciteAutofinancement,
      ratiosRentabilite: {
        margeCommerciale,
        tauxMarque,
        rentabiliteCommerciale,
        rentabiliteEconomique,
      },
    };
  }

  /**
   * Calculate Note35 (Social, Environmental and Societal Information)
   */
  calculateNote35(): ReportCalculationResult {
    const mappings = this.getConfigMappings("note35");

    // Note35 typically contains qualitative information, but can be configured if needed
    let informationsSociales: any[] = [];
    let informationsEnvironnementales: any[] = [];
    let informationsSocietales: any[] = [];

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "informationsSociales") {
        informationsSociales.push({ description: value.toString() });
      } else if (mapping.destination === "informationsEnvironnementales") {
        informationsEnvironnementales.push({ description: value.toString() });
      } else if (mapping.destination === "informationsSocietales") {
        informationsSocietales.push({ description: value.toString() });
      }
    });

    return {
      title:
        "LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIETALES A FOURNIR",
      informationsSociales,
      informationsEnvironnementales,
      informationsSocietales,
    };
  }

  /**
   * Calculate CF1Bis (Minimum Taxable Income)
   */
  calculateCF1Bis(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf1bis");

    let chiffreAffaires = 0;
    let minimumPerception = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "chiffreAffaires") {
        chiffreAffaires = value;
      } else if (mapping.destination === "minimumPerception") {
        minimumPerception = value;
      }
    });

    // Calculate minimumPerception if not directly mapped (typically 1.1% of turnover)
    if (minimumPerception === 0 && chiffreAffaires !== 0) {
      minimumPerception = chiffreAffaires * 0.011;
    }

    return {
      title:
        "TABLEAU DE DETERMINATION DE L'IMPOT SUR LE RESULTAT: MINIMUM DE PERCEPTION",
      chiffreAffaires,
      minimumPerception,
    };
  }

  /**
   * Calculate CF1Ter (Minimum Perception)
   */
  calculateCF1Ter(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf1ter");

    let chiffreAffairesHT = 0;
    let tauxMinimum = 0.011;
    let minimumCalcule = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "chiffreAffairesHT") {
        chiffreAffairesHT = value;
      } else if (mapping.destination === "tauxMinimum") {
        tauxMinimum = value;
      } else if (mapping.destination === "minimumCalcule") {
        minimumCalcule = value;
      }
    });

    // Calculate minimumCalcule if not directly mapped
    if (minimumCalcule === 0 && chiffreAffairesHT !== 0 && tauxMinimum !== 0) {
      minimumCalcule = chiffreAffairesHT * tauxMinimum;
    }

    return {
      title: "MINIMUM DE PERCEPTION",
      chiffreAffairesHT,
      tauxMinimum,
      minimumCalcule,
    };
  }

  /**
   * Calculate CF1Quater (Advance Payments and Withheld Taxes Summary)
   */
  calculateCF1Quater(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf1quater");

    let acomptesVerses = 0;
    let retenuesSubies = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "acomptesVerses") {
        acomptesVerses = value;
      } else if (mapping.destination === "retenuesSubies") {
        retenuesSubies = value;
      }
    });

    const total = acomptesVerses + retenuesSubies;

    return {
      title:
        "RECAPITULATIF DES VERSEMENTS D'ACOMPTES ET DE RETENUES SUBIES D'IMPOT SOCIETE ET D'ERENCE",
      acomptesVerses,
      retenuesSubies,
      total,
    };
  }

  /**
   * Calculate CF2 (Annual VAT Regularization Calculation)
   */
  calculateCF2(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf2");

    let chiffreAffairesHT = 0;
    let tvaBrute = 0;
    let tvaDeductible = 0;
    let tvaNette = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "chiffreAffairesHT") {
        chiffreAffairesHT = value;
      } else if (mapping.destination === "tvaBrute") {
        tvaBrute = value;
      } else if (mapping.destination === "tvaDeductible") {
        tvaDeductible = value;
      } else if (mapping.destination === "tvaNette") {
        tvaNette = value;
      }
    });

    // Calculate derived values if not directly mapped
    if (tvaBrute === 0 && chiffreAffairesHT !== 0) {
      tvaBrute = chiffreAffairesHT * 0.1925; // Standard VAT rate
    }
    if (tvaNette === 0 && tvaBrute !== 0 && tvaDeductible !== 0) {
      tvaNette = tvaBrute - tvaDeductible;
    }

    return {
      title: "CALCUL DE REGULARISATION ANNUELLE DE LA TVA",
      chiffreAffairesHT,
      tvaBrute,
      tvaDeductible,
      tvaNette,
    };
  }

  /**
   * Calculate CF2Bis (Payments Made and Withheld Taxes Summary)
   */
  calculateCF2Bis(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf2bis");

    let versementsMensuels: any[] = [];
    let total = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "total") {
        total = value;
      }
      // Additional monthly payments can be mapped as needed
    });

    return {
      title: "RECAPITULATIF DES VERSEMENTS EFFECTUES ET RETENUS SUBIES",
      versementsMensuels,
      total,
    };
  }

  /**
   * Calculate CF2Ter (Net VAT Situation)
   */
  calculateCF2Ter(): ReportCalculationResult {
    const mappings = this.getConfigMappings("cf2ter");

    let tvaDue = 0;
    let tvaPayee = 0;
    let solde = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "tvaDue") {
        tvaDue = value;
      } else if (mapping.destination === "tvaPayee") {
        tvaPayee = value;
      } else if (mapping.destination === "solde") {
        solde = value;
      }
    });

    // Calculate solde if not directly mapped
    if (solde === 0 && tvaDue !== 0 && tvaPayee !== 0) {
      solde = tvaDue - tvaPayee;
    }

    return {
      title: "SITUATION NETTE DE TVA",
      tvaDue,
      tvaPayee,
      solde,
    };
  }

  /**
   * Calculate FicheR3 (Identity of Directors)
   */
  calculateFicheR3(): ReportCalculationResult {
    const mappings = this.getConfigMappings("ficher3");

    let dirigeants: any[] = [];
    let commissairesAuxComptes: any[] = [];

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "dirigeants") {
        dirigeants.push({ name: value.toString() });
      } else if (mapping.destination === "commissairesAuxComptes") {
        commissairesAuxComptes.push({ name: value.toString() });
      }
    });

    return {
      title: "IDENTITE DES DIRIGEANTS",
      dirigeants,
      commissairesAuxComptes,
    };
  }

  /**
   * Calculate GrilleAnalyseNotes (Notes Analysis Grid)
   */
  calculateGrilleAnalyseNotes(): ReportCalculationResult {
    const mappings = this.getConfigMappings("grilleanalysenotes");

    let notes: any[] = [];

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "notes") {
        notes.push({ analysis: value.toString() });
      }
    });

    return {
      title: "GRILLE D'ANALYSE DES NOTES",
      notes,
    };
  }

  /**
   * Calculate PageDeGarde (Cover Page)
   */
  calculatePageDeGarde(): ReportCalculationResult {
    const mappings = this.getConfigMappings("pagedegarde");

    let companyName = "Company Name";
    let fiscalYear = "2024";
    let address = "";
    let legalForm = "";
    let taxNumber = "";

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "companyName") {
        companyName = value.toString();
      } else if (mapping.destination === "fiscalYear") {
        fiscalYear = value.toString();
      } else if (mapping.destination === "address") {
        address = value.toString();
      } else if (mapping.destination === "legalForm") {
        legalForm = value.toString();
      } else if (mapping.destination === "taxNumber") {
        taxNumber = value.toString();
      }
    });

    return {
      title: "PAGE DE GARDE",
      companyName,
      fiscalYear,
      address,
      legalForm,
      taxNumber,
    };
  }

  /**
   * Calculate Sommaire (Summary)
   */
  calculateSommaire(): ReportCalculationResult {
    const mappings = this.getConfigMappings("sommaire");

    let sections: any[] = [];

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "sections") {
        sections.push({ title: value.toString() });
      }
    });

    return {
      title: "SOMMAIRE",
      sections,
    };
  }

  /**
   * Calculate TableauFluxTresorerie (Cash Flow Statement)
   */
  calculateTableauFluxTresorerie(): ReportCalculationResult {
    const mappings = this.getConfigMappings("fluxTresorerie");

    let fluxExploitation = 0;
    let fluxInvestissement = 0;
    let fluxFinancement = 0;
    let variationTresorerie = 0;

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (mapping.destination === "fluxExploitation") {
        fluxExploitation = value;
      } else if (mapping.destination === "fluxInvestissement") {
        fluxInvestissement = value;
      } else if (mapping.destination === "fluxFinancement") {
        fluxFinancement = value;
      } else if (mapping.destination === "variationTresorerie") {
        variationTresorerie = value;
      }
    });

    // Calculate variationTresorerie if not directly mapped
    if (variationTresorerie === 0) {
      variationTresorerie =
        fluxExploitation + fluxInvestissement + fluxFinancement;
    }

    return {
      title: "TABLEAU DES FLUX DE TRESORERIE",
      fluxExploitation,
      fluxInvestissement,
      fluxFinancement,
      variationTresorerie,
    };
  }

  // ===== ASSURANCE REPORTS =====

  /**
   * Calculate Assurance Bilan Actif
   */
  calculateAssuranceBilanActif(): ReportCalculationResult {
    const mappings = this.getConfigMappings("assuranceBilanActif");

    let actifs: any = {};

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (!actifs[mapping.destination]) {
        actifs[mapping.destination] = 0;
      }
      actifs[mapping.destination] += value;
    });

    return {
      title: "BILAN ACTIF - ASSURANCE",
      actifs,
    };
  }

  /**
   * Calculate Assurance Bilan Passif
   */
  calculateAssuranceBilanPassif(): ReportCalculationResult {
    const mappings = this.getConfigMappings("assuranceBilanPassif");

    let passifs: any = {};

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (!passifs[mapping.destination]) {
        passifs[mapping.destination] = 0;
      }
      passifs[mapping.destination] += value;
    });

    return {
      title: "BILAN PASSIF - ASSURANCE",
      passifs,
    };
  }

  /**
   * Calculate Assurance Produits
   */
  calculateAssuranceProduits(): ReportCalculationResult {
    const mappings = this.getConfigMappings("assuranceProduits");

    let produits: any = {};

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (!produits[mapping.destination]) {
        produits[mapping.destination] = 0;
      }
      produits[mapping.destination] += value;
    });

    return {
      title: "PRODUITS - ASSURANCE",
      produits,
    };
  }

  /**
   * Calculate Assurance Charges
   */
  calculateAssuranceCharges(): ReportCalculationResult {
    const mappings = this.getConfigMappings("assuranceCharges");

    let charges: any = {};

    mappings.forEach((mapping) => {
      const value = this.getAccountValue(mapping.accountNumber, mapping.source);
      if (!charges[mapping.destination]) {
        charges[mapping.destination] = 0;
      }
      charges[mapping.destination] += value;
    });

    return {
      title: "CHARGES - ASSURANCE",
      charges,
    };
  }

  // Add all other assurance reports...
  // Ass1 through Ass11, Annexe1-6, EtatC4, EtatC11, etc.

  /**
   * Calculate all reports
   */
  calculateAllReports(): { [reportName: string]: ReportCalculationResult } {
    return {
      // Main reports
      bilanPaysage: this.calculateBilanPaysage(),
      compteResultat: this.calculateCompteResultat(),
      cf1: this.calculateCF1(),
      cf1Bis: this.calculateCF1Bis(),
      cf1Ter: this.calculateCF1Ter(),
      cf1Quater: this.calculateCF1Quater(),
      cf2: this.calculateCF2(),
      cf2Bis: this.calculateCF2Bis(),
      cf2Ter: this.calculateCF2Ter(),

      // Notes 1-35
      note1: this.calculateNote1(),
      note2: this.calculateNote2(),
      note3A: this.calculateNote3A(),
      note3B: this.calculateNote3B(),
      note3C: this.calculateNote3C(),
      note3D: this.calculateNote3D(),
      note3E: this.calculateNote3E(),
      note3F: this.calculateNote3F(),
      note4: this.calculateNote4(),
      note5: this.calculateNote5(),
      note6: this.calculateNote6(),
      note7: this.calculateNote7(),
      note8: this.calculateNote8(),
      note9: this.calculateNote9(),
      note10: this.calculateNote10(),
      note11: this.calculateNote11(),
      note12: this.calculateNote12(),
      note13: this.calculateNote13(),
      note14: this.calculateNote14(),
      note15A: this.calculateNote15A(),
      note15B: this.calculateNote15B(),
      note16A: this.calculateNote16A(),
      note16B: this.calculateNote16B(),
      note16BBis: this.calculateNote16BBis(),
      note16C: this.calculateNote16C(),
      note17: this.calculateNote17(),
      c1Note17: this.calculateC1Note17(),
      note18: this.calculateNote18(),
      note19: this.calculateNote19(),
      note20: this.calculateNote20(),
      note21: this.calculateNote21(),
      note22: this.calculateNote22(),
      note23: this.calculateNote23(),
      note24: this.calculateNote24(),
      note25: this.calculateNote25(),
      c1Note25: this.calculateC1Note25(),
      c2Note25: this.calculateC2Note25(),
      note26: this.calculateNote26(),
      note27A: this.calculateNote27A(),
      c1Note27A: this.calculateC1Note27A(),
      note27B: this.calculateNote27B(),
      note28: this.calculateNote28(),
      c1Note28: this.calculateC1Note28(),
      c2Note28: this.calculateC2Note28(),
      note29: this.calculateNote29(),
      note30: this.calculateNote30(),
      note31: this.calculateNote31(),
      note32: this.calculateNote32(),
      note33: this.calculateNote33(),
      note34: this.calculateNote34(),
      note35: this.calculateNote35(),

      // Other reports
      ficheR3: this.calculateFicheR3(),
      grilleAnalyseNotes: this.calculateGrilleAnalyseNotes(),
      pageDeGarde: this.calculatePageDeGarde(),
      sommaire: this.calculateSommaire(),
      tableauFluxTresorerie: this.calculateTableauFluxTresorerie(),

      // Assurance reports
      assuranceBilanActif: this.calculateAssuranceBilanActif(),
      assuranceBilanPassif: this.calculateAssuranceBilanPassif(),
      assuranceProduits: this.calculateAssuranceProduits(),
      assuranceCharges: this.calculateAssuranceCharges(),
      // Add all other assurance reports...
    };
  }
}

export const reportCalculationsService = new ReportCalculationsService();
