import api from "./api";
import { DonneesExtraites } from "./excel/excelExtractor";
import {
  CONFIG_NOTE1,
  CONFIG_NOTE2,
  CONFIG_NOTE3A,
  CONFIG_NOTE3B,
  CONFIG_NOTE3C,
  CONFIG_C01_NOTE3C,
  CONFIG_NOTE3D,
  CONFIG_NOTE3E,
  CONFIG_NOTE3F,
  CONFIG_NOTE4,
  CONFIG_NOTE5,
  CONFIG_NOTE6,
  CONFIG_NOTE7,
  CONFIG_NOTE8,
  CONFIG_NOTE9,
  CONFIG_NOTE10,
  CONFIG_NOTE11,
  CONFIG_NOTE12,
  CONFIG_NOTE13,
  CONFIG_NOTE14,
  CONFIG_NOTE15A,
  CONFIG_NOTE15B,
  CONFIG_NOTE16A,
  CONFIG_NOTE16B,
  CONFIG_NOTE16B_BIS,
  CONFIG_NOTE16C,
  CONFIG_NOTE17,
  CONFIG_NOTE17_C1,
  CONFIG_NOTE18,
  CONFIG_NOTE19,
  CONFIG_NOTE20,
  CONFIG_NOTE21,
  CONFIG_NOTE22,
  CONFIG_NOTE23,
  CONFIG_NOTE24,
  CONFIG_NOTE25,
  CONFIG_NOTE25_C1,
  CONFIG_NOTE25_C2,
  CONFIG_NOTE26,
  // CONFIG_NOTE27A,
  // CONFIG_NOTE27A_C1,
  // CONFIG_NOTE27B,
  CONFIG_NOTE28,
  CONFIG_NOTE28_C1,
  CONFIG_NOTE28_C2,
  CONFIG_NOTE29,
  CONFIG_NOTE30,
  CONFIG_NOTE31,
  CONFIG_NOTE32,
  CONFIG_NOTE33,
  CONFIG_NOTE34,
  // CONFIG_NOTE35,
} from "./excel/noteConfigs";

// ==================== TYPE DEFINITIONS ====================

export interface NoteEntete {
  entityName: string | null;
  fiscalYear: string | null;
  idNumber: string | null;
  duration: string | null;
}

// Note 1 Types
export interface Note1Data {
  entete: NoteEntete;
  financialDebts: Array<{
    libelle: string;
    note: string | null;
    grossAmount: number | null;
    mortgages: number | null;
    pledges: number | null;
    others: number | null;
  }>;
  leasingDebts: Array<{
    libelle: string;
    note: string | null;
    grossAmount: number | null;
    mortgages: number | null;
    pledges: number | null;
    others: number | null;
  }>;
  currentLiabilities: Array<{
    libelle: string;
    note: string | null;
    grossAmount: number | null;
    mortgages: number | null;
    pledges: number | null;
    others: number | null;
  }>;
  commitments: Array<{
    libelle: string;
    engagementsGiven: number | null;
    engagementsReceived: number | null;
  }>;
}

export interface Note2Data {
  entete: NoteEntete;
  conformity: string;
  methods: string;
  derogations: string;
  complementary: string;
}

export interface Note3AData {
  entete: NoteEntete;
  immobilisationsIncorporelles: Array<{
    libelle: string;
    montantBrutOuverture: number | null;
    acquisitions: number | null;
    virementsPosteAPoste: number | null;
    reevaluation: number | null;
    cessions: number | null;
    virementsSortie: number | null;
    montantBrutCloture: number | null;
  }>;
  immobilisationsCorporelles: Array<{
    libelle: string;
    montantBrutOuverture: number | null;
    acquisitions: number | null;
    virementsPosteAPoste: number | null;
    reevaluation: number | null;
    cessions: number | null;
    virementsSortie: number | null;
    montantBrutCloture: number | null;
  }>;
  avancesAcomptes: Array<{
    libelle: string;
    montantBrutOuverture: number | null;
    acquisitions: number | null;
    virementsPosteAPoste: number | null;
    reevaluation: number | null;
    cessions: number | null;
    virementsSortie: number | null;
    montantBrutCloture: number | null;
  }>;
  immobilisationsFinancieres: Array<{
    libelle: string;
    montantBrutOuverture: number | null;
    acquisitions: number | null;
    virementsPosteAPoste: number | null;
    reevaluation: number | null;
    cessions: number | null;
    virementsSortie: number | null;
    montantBrutCloture: number | null;
  }>;
}

export interface Note3BData {
  entete: NoteEntete;
  immobilisationsIncorporelles: Array<{
    libelle: string;
    natureContrat: string | null;
    montantBrutOuverture: number | null;
    acquisitionsApportsCreations: number | null;
    virementsPosteAPoste: number | null;
    reevaluation: number | null;
    cessionsSortiesHorsService: number | null;
    virementsPosteAPosteSortie: number | null;
    montantBrutCloture: number | null;
  }>;
  immobilisationsCorporelles: Array<{
    libelle: string;
    natureContrat: string | null;
    montantBrutOuverture: number | null;
    acquisitionsApportsCreations: number | null;
    virementsPosteAPoste: number | null;
    reevaluation: number | null;
    cessionsSortiesHorsService: number | null;
    virementsPosteAPosteSortie: number | null;
    montantBrutCloture: number | null;
  }>;
}

export interface Note3CData {
  entete: NoteEntete;
  immobilisationsIncorporelles: Array<{
    libelle: string;
    amortissementsCumulesOuverture: number | null;
    augmentationsDotationsExercice: number | null;
    diminutionsSorties: number | null;
    cumulAmortissementsCloture: number | null;
  }>;
  immobilisationsCorporelles: Array<{
    libelle: string;
    amortissementsCumulesOuverture: number | null;
    augmentationsDotationsExercice: number | null;
    diminutionsSorties: number | null;
    cumulAmortissementsCloture: number | null;
  }>;
}

export interface C01Note3CData {
  entete: NoteEntete;
  amortissementsDifferes: Array<{
    libelle: string;
    reportAmortissementsAnterieurs: number | null;
    amortissementsDifferesExercice: number | null;
    imputationExercice: number | null;
    totalReportNonImputes: number | null;
  }>;
}

export interface Note3DData {
  entete: NoteEntete;
  immobilisations: Array<{
    libelle: string;
    montantBrut: number | null;
    amortissementsPratiques: number | null;
    valeurComptableNette: number | null;
    prixCessions: number | null;
    plusOuMoinsValues: number | null;
  }>;
}

export interface Note3EData {
  entete: NoteEntete;
  informationsGenerales: Array<{ nature: string; valeur: string | null }>;
  elementsReevalues: Array<{
    element: string | null;
    montantCoutsHistoriques: number | null;
    amortissementsSupplementaires: number | null;
  }>;
}

export interface Note3FData {
  entete: NoteEntete;
  montantGlobalEtDuree: Array<{
    fraisEtablissement: number | null;
    chargesARepartir: number | null;
    primesRemboursement: number | null;
  }>;
  exerciceN: Array<{
    fraisEtablissementCompte: string | null;
    fraisEtablissementMontant: number | null;
    chargesARepartirCompte: string | null;
    chargesARepartirMontant: number | null;
    primesRemboursementCompte: string | null;
    primesRemboursementMontant: number | null;
  }>;
  totaux: Array<{
    fraisEtablissementCompte: string | null;
    fraisEtablissementMontant: number | null;
    chargesARepartirCompte: string | null;
    chargesARepartirMontant: number | null;
    primesRemboursementCompte: string | null;
    primesRemboursementMontant: number | null;
  }>;
}

export interface Note3SmtData {
  entete: {
    designationEntite: string;
    numeroIdentification: string;
    exerciceClosLe: string;
    dureeMois: string;
  };
  creances: Array<{
    id: number;
    date: string;
    nomClient: string;
    montant31Dec: string;
    montant1erJan: string;
  }>;
  dettes: Array<{
    id: number;
    date: string;
    nomFournisseur: string;
    montant31Dec: string;
    montant1erJan: string;
  }>;
}

export interface Note4Data {
  entete: NoteEntete;
  immobilisationsFinancieres: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
    creancesUnAnAuPlus: number | null;
    creancesPlusUnAnDeuxAns: number | null;
    creancesPlusDeuxAns: number | null;
  }>;
  filialesParticipations: Array<{
    denominationSociale: string | null;
    localisation: string | null;
    valeurAcquisition: number | null;
    pourcentageDetenu: number | null;
    montantCapitauxPropres: number | null;
    resultatDernierExercice: number | null;
  }>;
}

export interface Note5Data {
  entete: NoteEntete;
  actifCirculantHAO: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
  dettesHAO: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note6Data {
  entete: NoteEntete;
  stocksEnCours: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note7Data {
  entete: NoteEntete;
  creancesClients: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
    creancesUnAnAuPlus: number | null;
    creancesPlusUnAnDeuxAns: number | null;
    creancesPlusDeuxAns: number | null;
  }>;
}

export interface Note8Data {
  entete: NoteEntete;
  autresCreances: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
    creancesUnAnAuPlus: number | null;
    creancesPlusUnAnDeuxAns: number | null;
    creancesPlusDeuxAns: number | null;
  }>;
}

export interface Note9Data {
  entete: NoteEntete;
  titresPlacement: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note10Data {
  entete: NoteEntete;
  valeursAEncaisser: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note11Data {
  entete: NoteEntete;
  disponibilites: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note12Data {
  entete: NoteEntete;
  ecartsConversionActif: Array<{
    devises: string | null;
    montantDevises: number | null;
    coursAcquisition: number | null;
    cours31Dec: number | null;
    variationValeurAbsolue: number | null;
  }>;
  ecartsConversionPassif: Array<{
    devises: string | null;
    montantDevises: number | null;
    coursAcquisition: number | null;
    cours31Dec: number | null;
    variationValeurAbsolue: number | null;
  }>;
  transfertsCharges: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note13Data {
  entete: NoteEntete;
  capital: Array<{
    nomsPrenom: string | null;
    nationalite: string | null;
    natureActions: string | null;
    nombre: number | null;
    montantTotal: number | null;
    cessions: number | null;
  }>;
}

export interface Note14Data {
  entete: NoteEntete;
  primesReserves: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationValeurAbsolue: number | null;
  }>;
}

export interface Note15AData {
  entete: NoteEntete;
  subventionsProvisionsReglementees: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationValeurAbsolue: number | null;
    variationPourcentage: number | null;
    registreFiscal: string | null;
    echeances: string | null;
  }>;
}

export interface Note15BData {
  entete: NoteEntete;
  autresFondsPropres: Array<{
    note: string | null;
    anneeN: number | null;
    anneeN1: number | null;
    variationValeurAbsolue: number | null;
    variationPourcentage: number | null;
    echeances: string | null;
  }>;
}

export interface Note16AData {
  entete: NoteEntete;
  dettesFinancieres: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
    variationValeurAbsolue: number | null;
    dettesUnAnAuPlus: number | null;
    dettesPlusUnAnDeuxAns: number | null;
    dettesPlusDeuxAns: number | null;
  }>;
}

export interface Note16BData {
  entete: NoteEntete;
  hypothesesActuarielles: Array<{
    anneeN: number | null;
    anneeN1: number | null;
  }>;
  variationEngagement: Array<{ anneeN: number | null; anneeN1: number | null }>;
  analyseSensibilite: Array<{
    anneeNAugmentation: number | null;
    anneeNDiminution: number | null;
    anneeN1Augmentation: number | null;
    anneeN1Diminution: number | null;
  }>;
}

export interface Note16BBisData {
  entete: NoteEntete;
  actifPassifRegimes: Array<{ anneeN: number | null; anneeN1: number | null }>;
  valeurActuelleActifs: Array<{
    anneeNRendement: number | null;
    anneeNJusteValeur: number | null;
    anneeN1Rendement: number | null;
    anneeN1JusteValeur: number | null;
  }>;
}

export interface Note16CData {
  entete: NoteEntete;
  actifsPassifsEventuels: Array<{
    anneeN: number | null;
    anneeN1: number | null;
  }>;
}

export interface Note17Data {
  entete: NoteEntete;
  fournisseursExploitation: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
    dettesUnAnOuPlus: number | null;
    dettesPlusUnAnDeuxAns: number | null;
    dettesPlusDeuxAns: number | null;
  }>;
}

export interface Note17C1Data {
  entete: NoteEntete;
  balanceGeneraleFournisseurs: Array<{
    numero: string | null;
    soldeOuvertureDebit: number | null;
    soldeOuvertureCredit: number | null;
    mouvementsDebit: number | null;
    mouvementsCredit: number | null;
    soldeClotureDebit: number | null;
    soldeClotureCredit: number | null;
    variationDebit: number | null;
    variationCredit: number | null;
  }>;
  compte60Achats: Array<{
    lignes: string | null;
    numeroNomenclature: string | null;
    quantite: number | null;
    prixUnitaire: number | null;
    total: number | null;
  }>;
  compte61Transports: Array<{
    comptes: string | null;
    lignes: string | null;
    routier: number | null;
    ferroviaire: number | null;
    parEau: number | null;
    parAir: number | null;
    servicesAuxiliaires: number | null;
    supportesEtranger: number | null;
    total: number | null;
  }>;
}

export interface Note18Data {
  entete: NoteEntete;
  dettesFiscalesSociales: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationValeurAbsolue: number | null;
    variationPourcentage: number | null;
    dettesUnAnAuPlus: number | null;
    dettesPlusUnAnDeuxAns: number | null;
    dettesPlusDeuxAns: number | null;
  }>;
}

export interface Note19Data {
  entete: NoteEntete;
  autresDettesProvisions: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationValeurAbsolue: number | null;
    variationPourcentage: number | null;
    dettesUnAnAuPlus: number | null;
    dettesPlusUnAnDeuxAns: number | null;
    dettesPlusDeuxAns: number | null;
  }>;
}

export interface Note20Data {
  entete: NoteEntete;
  banquesCreditEscompte: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Note 21 Types
export interface Note21Data {
  entete: NoteEntete;
  chiffreAffaires: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Note 22 Types
export interface Note22Data {
  entete: NoteEntete;
  autresProduits: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note23Data {
  entete: NoteEntete;
  transports: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note24Data {
  entete: NoteEntete;
  servicesExterieurs: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note25Data {
  entete: NoteEntete;
  impotsTaxes: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note25C1Data {
  entete: NoteEntete;
  syntheseImpotsTaxes: Array<{
    anneeN: number | null;
    regularisations: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note25C2Data {
  entete: NoteEntete;
  droitsAccisesAdValorem: Array<{
    ligne: string | null;
    baseBruteTaxable: number | null;
    abattementTaux: number | null;
    abattementMontant: number | null;
    baseNetteTaxable: number | null;
    taux: number | null;
    montantDroits: number | null;
    droitsPayes: number | null;
    soldeDroits: number | null;
  }>;
  droitsAccisesSpecifiques: Array<{
    ligne: string | null;
    productionLocale: number | null;
    importation: number | null;
    exportation: number | null;
    quantitesTotales: number | null;
    uniteCalcul: string | null;
    tarif: number | null;
    montantDroits: number | null;
    droitsPayes: number | null;
    soldeDroits: number | null;
  }>;
}

export interface Note26Data {
  entete: NoteEntete;
  autresCharges: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Note 27A Types
export interface Note27AData {
  entete: NoteEntete;
  remunerationsPersonnel: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Note 27A C1 Types
export interface Note27AC1Data {
  entete: NoteEntete;
  detailRemunerations: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Note 27B Types
export interface Note27BData {
  entete: NoteEntete;
  effectifsPersonnel: Array<{
    categorie: string | null;
    nombreDebutExercice: number | null;
    nombreFinExercice: number | null;
    nombreMoyenAnnuel: number | null;
  }>;
}

export interface Note28Data {
  entete: NoteEntete;
  provisionsDepreciations: Array<{
    provisionsOuverture: number | null;
    dotationsExploitation: number | null;
    dotationsFinancieres: number | null;
    dotationsHAO: number | null;
    reprisesExploitation: number | null;
    reprisesFinancieres: number | null;
    reprisesHAO: number | null;
    provisionsCloture: number | null;
  }>;
}

export interface Note28C1Data {
  entete: NoteEntete;
  traitementFiscalProvisions: Array<{
    exploitationDeductibles: number | null;
    exploitationNonDeductibles: number | null;
    financieresDeductibles: number | null;
    financieresNonDeductibles: number | null;
    haoDeductibles: number | null;
    haoNonDeductibles: number | null;
    totauxDeductibles: number | null;
    totauxNonDeductibles: number | null;
  }>;
}

export type Note28C2Data = Note28C1Data;

export interface Note29Data {
  entete: NoteEntete;
  chargesRevenusFinancier: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note30Data {
  entete: NoteEntete;
  chargesProduitsHAO: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

export interface Note31Data {
  entete: NoteEntete;
  repartitionResultat: Array<{
    exerciceN: number | null;
    exerciceN1: number | null;
    exerciceN2: number | null;
    exerciceN3: number | null;
    exerciceN4: number | null;
  }>;
}

export interface Note32Data {
  entete: NoteEntete;
  productionExercice: Array<{
    designationProduits: string | null;
    uniteQuantite: string | null;
    productionPaysQuantite: number | null;
    productionPaysValeur: number | null;
    productionOhadaQuantite: number | null;
    productionOhadaValeur: number | null;
    productionHorsOhadaQuantite: number | null;
    productionHorsOhadaValeur: number | null;
    productionImmobiliseeQuantite: number | null;
    productionImmobiliseeValeur: number | null;
    stockOuvertureQuantite: number | null;
    stockOuvertureValeur: number | null;
    stockClotureQuantite: number | null;
    stockClotureValeur: number | null;
  }>;
}

export interface Note33Data {
  entete: NoteEntete;
  achatsProduction: Array<{
    designationMatieres: string | null;
    uniteQuantite: string | null;
    produitsEtatQuantite: number | null;
    produitsEtatValeur: number | null;
    produitsImportesEtatQuantite: number | null;
    produitsImportesEtatValeur: number | null;
    produitsImportesHorsEtatQuantite: number | null;
    produitsImportesHorsEtatValeur: number | null;
    variationStocks: number | null;
  }>;
}

export interface Note34Data {
  entete: NoteEntete;
  indicateursFinanciers: Array<{
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Note 35 Types
export interface Note35Data {
  entete: NoteEntete;
  autresInformations: Array<{
    libelle: string;
    anneeN: number | null;
    anneeN1: number | null;
    variationPourcentage: number | null;
  }>;
}

// Union type for all notes
export type NoteData =
  | Note1Data
  | Note2Data
  | Note3AData
  | Note3BData
  | Note3CData
  | C01Note3CData
  | Note3DData
  | Note3EData
  | Note3FData
  | Note4Data
  | Note5Data
  | Note6Data
  | Note7Data
  | Note8Data
  | Note9Data
  | Note10Data
  | Note11Data
  | Note12Data
  | Note13Data
  | Note14Data
  | Note15AData
  | Note15BData
  | Note16AData
  | Note16BData
  | Note16BBisData
  | Note16CData
  | Note17Data
  | Note17C1Data
  | Note18Data
  | Note19Data
  | Note20Data
  | Note21Data
  | Note22Data
  | Note23Data
  | Note24Data
  | Note25Data
  | Note25C1Data
  | Note25C2Data
  | Note26Data
  | Note27AData
  | Note27AC1Data
  | Note27BData
  | Note28Data
  | Note28C1Data
  | Note28C2Data
  | Note29Data
  | Note30Data
  | Note31Data
  | Note32Data
  | Note33Data
  | Note34Data
  | Note35Data
  | Note3SmtData;

// ==================== NOTES SERVICE CLASS ====================

class NotesService {
  // ==================== CONFIG GETTERS ====================
  // IMPORTANT: These keys must exactly match the noteNumber values in uploadSteps.tsx NOTE_CONFIGS

  getConfig(noteNumber: string) {
    const configs: Record<string, any> = {
      "1": CONFIG_NOTE1,
      "2": CONFIG_NOTE2,
      "3A": CONFIG_NOTE3A,
      "3B": CONFIG_NOTE3B,
      "3C": CONFIG_NOTE3C,
      "3C_C01": CONFIG_C01_NOTE3C, // matches uploadSteps noteNumber: "3C_C01"
      "3D": CONFIG_NOTE3D,
      "3E": CONFIG_NOTE3E,
      "3F": CONFIG_NOTE3F,
      "4": CONFIG_NOTE4,
      "5": CONFIG_NOTE5,
      "6": CONFIG_NOTE6,
      "7": CONFIG_NOTE7,
      "8": CONFIG_NOTE8,
      "9": CONFIG_NOTE9,
      "10": CONFIG_NOTE10,
      "11": CONFIG_NOTE11,
      "12": CONFIG_NOTE12,
      "13": CONFIG_NOTE13,
      "14": CONFIG_NOTE14,
      "15A": CONFIG_NOTE15A,
      "15B": CONFIG_NOTE15B,
      "16A": CONFIG_NOTE16A,
      "16B": CONFIG_NOTE16B,
      "16B bis": CONFIG_NOTE16B_BIS, // matches uploadSteps noteNumber: "16B bis"
      "16C": CONFIG_NOTE16C,
      "17": CONFIG_NOTE17,
      "C1/17": CONFIG_NOTE17_C1, // matches uploadSteps noteNumber: "C1/17"
      "18": CONFIG_NOTE18,
      "19": CONFIG_NOTE19,
      "20": CONFIG_NOTE20,
      "21": CONFIG_NOTE21,
      "22": CONFIG_NOTE22,
      "23": CONFIG_NOTE23,
      "24": CONFIG_NOTE24,
      "25": CONFIG_NOTE25,
      "C1/25": CONFIG_NOTE25_C1, // matches uploadSteps noteNumber: "C1/25"
      "C2/25": CONFIG_NOTE25_C2, // matches uploadSteps noteNumber: "C2/25"
      "26": CONFIG_NOTE26,
      // "27A": CONFIG_NOTE27A,
      // "C1/27A": CONFIG_NOTE27A_C1, // matches uploadSteps noteNumber: "C1/27A"
      // "27B": CONFIG_NOTE27B,
      "28": CONFIG_NOTE28,
      "C1/28": CONFIG_NOTE28_C1, // matches uploadSteps noteNumber: "C1/28"
      "C2/28": CONFIG_NOTE28_C2, // matches uploadSteps noteNumber: "C2/28"
      "29": CONFIG_NOTE29,
      "30": CONFIG_NOTE30,
      "31": CONFIG_NOTE31,
      "32": CONFIG_NOTE32,
      "33": CONFIG_NOTE33,
      "34": CONFIG_NOTE34,
      // "35": CONFIG_NOTE35,
    };
    return configs[noteNumber] || null;
  }

  // ==================== HELPER METHODS ====================

  private extractEntete(extractedData: DonneesExtraites): NoteEntete {
    return {
      entityName: extractedData.entete?.entityName || null,
      fiscalYear: extractedData.entete?.fiscalYear || null,
      idNumber: extractedData.entete?.idNumber || null,
      duration: extractedData.entete?.duration || null,
    };
  }

  /**
   * Safely retrieves a section from extracted data with a descriptive warning on miss.
   */
  private extractSection(extractedData: DonneesExtraites, sectionName: string) {
    const section = extractedData.sections?.[sectionName];
    if (!section) {
      console.warn(
        `[NotesService] Section "${sectionName}" not found in extracted data. ` +
        `Available: ${Object.keys(extractedData.sections || {}).join(", ")}`,
      );
    }
    return section;
  }

  // ==================== TRANSFORMATION METHODS ====================

  transformNote1Data(extractedData: DonneesExtraites): Note1Data {
    const config = CONFIG_NOTE1;
    return {
      entete: this.extractEntete(extractedData),
      financialDebts:
        this.extractSection(extractedData, "financialDebts")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.financialDebts.libelles[index] || "",
            note: ligne.note,
            grossAmount: ligne.grossAmount,
            mortgages: ligne.mortgages,
            pledges: ligne.pledges,
            others: ligne.others,
          }),
        ) || [],
      leasingDebts:
        this.extractSection(extractedData, "leasingDebts")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.leasingDebts.libelles[index] || "",
            note: ligne.note,
            grossAmount: ligne.grossAmount,
            mortgages: ligne.mortgages,
            pledges: ligne.pledges,
            others: ligne.others,
          }),
        ) || [],
      currentLiabilities:
        this.extractSection(extractedData, "currentLiabilities")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.currentLiabilities.libelles[index] || "",
            note: ligne.note,
            grossAmount: ligne.grossAmount,
            mortgages: ligne.mortgages,
            pledges: ligne.pledges,
            others: ligne.others,
          }),
        ) || [],
      commitments:
        this.extractSection(extractedData, "commitments")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.commitments.libelles[index] || "",
            engagementsGiven: ligne.Engagaments_donnes,
            engagementsReceived: ligne.Engagaments_recus,
          }),
        ) || [],
    };
  }

  transformNote2Data(extractedData: DonneesExtraites): Note2Data {
    return {
      entete: this.extractEntete(extractedData),
      conformity: "",
      methods: "",
      derogations: "",
      complementary: "",
    };
  }

  transformNote3AData(extractedData: DonneesExtraites): Note3AData {
    const config = CONFIG_NOTE3A;
    const transformSection = (sectionName: string, configSection: any) => {
      const section = this.extractSection(extractedData, sectionName);
      if (!section) return [];
      return section.lignes.map((ligne: any, index: number) => ({
        libelle: configSection.libelles[index] || "",
        montantBrutOuverture: ligne.montantBrutOuverture,
        acquisitions: ligne.acquisitions,
        virementsPosteAPoste: ligne.virementsPosteAPoste,
        reevaluation: ligne.reevaluation,
        cessions: ligne.cessions,
        virementsSortie: ligne.virementsSortie,
        montantBrutCloture: ligne.montantBrutCloture,
      }));
    };
    return {
      entete: this.extractEntete(extractedData),
      immobilisationsIncorporelles: transformSection(
        "immobilisationsIncorporelles",
        config.sections.immobilisationsIncorporelles,
      ),
      immobilisationsCorporelles: transformSection(
        "immobilisationsCorporelles",
        config.sections.immobilisationsCorporelles,
      ),
      avancesAcomptes: transformSection(
        "avancesAcomptes",
        config.sections.avancesAcomptes,
      ),
      immobilisationsFinancieres: transformSection(
        "immobilisationsFinancieres",
        config.sections.immobilisationsFinancieres,
      ),
    };
  }

  transformNote3BData(extractedData: DonneesExtraites): Note3BData {
    const config = CONFIG_NOTE3B;
    const transformSection = (sectionName: string, configSection: any) => {
      const section = this.extractSection(extractedData, sectionName);
      if (!section) return [];
      return section.lignes.map((ligne: any, index: number) => ({
        libelle: configSection.libelles[index] || "",
        natureContrat: ligne.natureContrat,
        montantBrutOuverture: ligne.montantBrutOuverture,
        acquisitionsApportsCreations: ligne.acquisitionsApportsCreations,
        virementsPosteAPoste: ligne.virementsPosteAPoste,
        reevaluation: ligne.reevaluation,
        cessionsSortiesHorsService: ligne.cessionsSortiesHorsService,
        virementsPosteAPosteSortie: ligne.virementsPosteAPosteSortie,
        montantBrutCloture: ligne.montantBrutCloture,
      }));
    };
    return {
      entete: this.extractEntete(extractedData),
      immobilisationsIncorporelles: transformSection(
        "immobilisationsIncorporelles",
        config.sections.immobilisationsIncorporelles,
      ),
      immobilisationsCorporelles: transformSection(
        "immobilisationsCorporelles",
        config.sections.immobilisationsCorporelles,
      ),
    };
  }

  // FIX: reads from "immobilisationsIncorporelles" (not "amortissementsDifferes")
  transformNote3CData(extractedData: DonneesExtraites): Note3CData {
    const config = CONFIG_NOTE3C;
    return {
      entete: this.extractEntete(extractedData),
      immobilisationsIncorporelles:
        this.extractSection(
          extractedData,
          "immobilisationsIncorporelles",
        )?.lignes.map((ligne: any, index: number) => ({
          libelle:
            config.sections.immobilisationsIncorporelles.libelles[index] || "",
          amortissementsCumulesOuverture: ligne.amortissementsCumulesOuverture,
          augmentationsDotationsExercice: ligne.augmentationsDotationsExercice,
          diminutionsSorties: ligne.diminutionsSorties ?? null,
          cumulAmortissementsCloture: ligne.cumulAmortissementsCloture ?? null,
        })) || [],
      immobilisationsCorporelles:
        this.extractSection(
          extractedData,
          "immobilisationsCorporelles",
        )?.lignes.map((ligne: any, index: number) => ({
          libelle:
            config.sections.immobilisationsCorporelles.libelles[index] || "",
          amortissementsCumulesOuverture: ligne.amortissementsCumulesOuverture,
          augmentationsDotationsExercice: ligne.augmentationsDotationsExercice,
          diminutionsSorties: ligne.diminutionsSorties ?? null,
          cumulAmortissementsCloture: ligne.cumulAmortissementsCloture ?? null,
        })) || [],
    };
  }

  transformC01Note3CData(extractedData: DonneesExtraites): C01Note3CData {
    const config = CONFIG_C01_NOTE3C;
    return {
      entete: this.extractEntete(extractedData),
      amortissementsDifferes:
        this.extractSection(
          extractedData,
          "amortissementsDifferes",
        )?.lignes.map((ligne: any, index: number) => ({
          libelle: config.sections.amortissementsDifferes.libelles[index] || "",
          reportAmortissementsAnterieurs: ligne.reportAmortissementsAnterieurs,
          amortissementsDifferesExercice: ligne.amortissementsDifferesExercice,
          imputationExercice: ligne.imputationExercice,
          totalReportNonImputes: ligne.totalReportNonImputes,
        })) || [],
    };
  }

  transformNote3DData(extractedData: DonneesExtraites): Note3DData {
    const config = CONFIG_NOTE3D;
    return {
      entete: this.extractEntete(extractedData),
      immobilisations:
        this.extractSection(
          extractedData,
          "immobilisationsIncorporelles",
        )?.lignes.map((ligne: any, index: number) => ({
          libelle:
            config.sections.immobilisationsIncorporelles.libelles[index] || "",
          montantBrut: ligne.montantBrut,
          amortissementsPratiques: ligne.amortissementsPratiques,
          valeurComptableNette: ligne.valeurComptableNette,
          prixCessions: ligne.prixCessions,
          plusOuMoinsValues: ligne.plusOuMoinsValues,
        })) || [],
    };
  }

  transformNote3EData(extractedData: DonneesExtraites): Note3EData {
    const config = CONFIG_NOTE3E;
    return {
      entete: this.extractEntete(extractedData),
      informationsGenerales:
        this.extractSection(extractedData, "informationsGenerales")?.lignes.map(
          (ligne: any, index: number) => ({
            nature: config.sections.informationsGenerales.libelles[index] || "",
            valeur: ligne.valeur,
          }),
        ) || [],
      elementsReevalues:
        this.extractSection(extractedData, "elementsReevalues")?.lignes.map(
          (ligne: any) => ({
            element: ligne.element,
            montantCoutsHistoriques: ligne.montantCoutsHistoriques,
            amortissementsSupplementaires: ligne.amortissementsSupplementaires,
          }),
        ) || [],
    };
  }

  transformNote3FData(extractedData: DonneesExtraites): Note3FData {
    return {
      entete: this.extractEntete(extractedData),
      montantGlobalEtDuree:
        this.extractSection(extractedData, "montantGlobalEtDuree")?.lignes.map(
          (ligne: any) => ({
            fraisEtablissement: ligne.fraisEtablissement ?? null,
            chargesARepartir: ligne.chargesARepartir ?? null,
            primesRemboursement: ligne.primesRemboursement ?? null,
          }),
        ) || [],
      exerciceN:
        this.extractSection(extractedData, "exerciceN")?.lignes.map(
          (ligne: any) => ({
            fraisEtablissementCompte: ligne.fraisEtablissementCompte ?? null,
            fraisEtablissementMontant: ligne.fraisEtablissementMontant ?? null,
            chargesARepartirCompte: ligne.chargesARepartirCompte ?? null,
            chargesARepartirMontant: ligne.chargesARepartirMontant ?? null,
            primesRemboursementCompte: ligne.primesRemboursementCompte ?? null,
            primesRemboursementMontant:
              ligne.primesRemboursementMontant ?? null,
          }),
        ) || [],
      totaux:
        this.extractSection(extractedData, "totaux")?.lignes.map(
          (ligne: any) => ({
            fraisEtablissementCompte: ligne.fraisEtablissementCompte ?? null,
            fraisEtablissementMontant: ligne.fraisEtablissementMontant ?? null,
            chargesARepartirCompte: ligne.chargesARepartirCompte ?? null,
            chargesARepartirMontant: ligne.chargesARepartirMontant ?? null,
            primesRemboursementCompte: ligne.primesRemboursementCompte ?? null,
            primesRemboursementMontant:
              ligne.primesRemboursementMontant ?? null,
          }),
        ) || [],
    };
  }

  transformNote4Data(extractedData: DonneesExtraites): Note4Data {
    const config = CONFIG_NOTE4;
    return {
      entete: this.extractEntete(extractedData),
      immobilisationsFinancieres:
        this.extractSection(
          extractedData,
          "immobilisationsFinancieres",
        )?.lignes.map((ligne: any, index: number) => ({
          libelle:
            config.sections.immobilisationsFinancieres.libelles[index] || "",
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
          variationPourcentage: ligne.variationPourcentage,
          creancesUnAnAuPlus: ligne.creancesUnAnAuPlus,
          creancesPlusUnAnDeuxAns: ligne.creancesPlusUnAnDeuxAns,
          creancesPlusDeuxAns: ligne.creancesPlusDeuxAns,
        })) || [],
      filialesParticipations:
        this.extractSection(
          extractedData,
          "filialesParticipations",
        )?.lignes.map((ligne: any) => ({
          denominationSociale: ligne.denominationSociale,
          localisation: ligne.localisation,
          valeurAcquisition: ligne.valeurAcquisition,
          pourcentageDetenu: ligne.pourcentageDetenu,
          montantCapitauxPropres: ligne.montantCapitauxPropres,
          resultatDernierExercice: ligne.resultatDernierExercice,
        })) || [],
    };
  }

  transformNote5Data(extractedData: DonneesExtraites): Note5Data {
    const config = CONFIG_NOTE5;
    return {
      entete: this.extractEntete(extractedData),
      actifCirculantHAO:
        this.extractSection(extractedData, "actifCirculantHAO")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.actifCirculantHAO.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
      dettesHAO:
        this.extractSection(extractedData, "dettesHAO")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.dettesHAO.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote6Data(extractedData: DonneesExtraites): Note6Data {
    const config = CONFIG_NOTE6;
    return {
      entete: this.extractEntete(extractedData),
      stocksEnCours:
        this.extractSection(extractedData, "stocksEnCours")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.stocksEnCours.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote7Data(extractedData: DonneesExtraites): Note7Data {
    const config = CONFIG_NOTE7;
    return {
      entete: this.extractEntete(extractedData),
      creancesClients:
        this.extractSection(extractedData, "creancesClients")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.creancesClients.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
            creancesUnAnAuPlus: ligne.creancesUnAnAuPlus,
            creancesPlusUnAnDeuxAns: ligne.creancesPlusUnAnDeuxAns,
            creancesPlusDeuxAns: ligne.creancesPlusDeuxAns,
          }),
        ) || [],
    };
  }

  transformNote8Data(extractedData: DonneesExtraites): Note8Data {
    const config = CONFIG_NOTE8;
    return {
      entete: this.extractEntete(extractedData),
      autresCreances:
        this.extractSection(extractedData, "autresCreances")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.autresCreances.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
            creancesUnAnAuPlus: ligne.creancesUnAnAuPlus,
            creancesPlusUnAnDeuxAns: ligne.creancesPlusUnAnDeuxAns,
            creancesPlusDeuxAns: ligne.creancesPlusDeuxAns,
          }),
        ) || [],
    };
  }

  transformNote9Data(extractedData: DonneesExtraites): Note9Data {
    const config = CONFIG_NOTE9;
    return {
      entete: this.extractEntete(extractedData),
      titresPlacement:
        this.extractSection(extractedData, "titresPlacement")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.titresPlacement.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote10Data(extractedData: DonneesExtraites): Note10Data {
    const config = CONFIG_NOTE10;
    return {
      entete: this.extractEntete(extractedData),
      valeursAEncaisser:
        this.extractSection(extractedData, "valeursAEncaisser")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.valeursAEncaisser.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote11Data(extractedData: DonneesExtraites): Note11Data {
    const config = CONFIG_NOTE11;
    return {
      entete: this.extractEntete(extractedData),
      disponibilites:
        this.extractSection(extractedData, "disponibilites")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections.disponibilites.libelles[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote12Data(extractedData: DonneesExtraites): Note12Data {
    return {
      entete: this.extractEntete(extractedData),
      ecartsConversionActif:
        this.extractSection(extractedData, "ecartsConversionActif")?.lignes.map(
          (ligne: any) => ({
            devises: ligne.devises,
            montantDevises: ligne.montantDevises,
            coursAcquisition: ligne.coursAcquisition,
            cours31Dec: ligne.cours31Dec,
            variationValeurAbsolue: ligne.variationValeurAbsolue,
          }),
        ) || [],
      ecartsConversionPassif:
        this.extractSection(
          extractedData,
          "ecartsConversionPassif",
        )?.lignes.map((ligne: any) => ({
          devises: ligne.devises,
          montantDevises: ligne.montantDevises,
          coursAcquisition: ligne.coursAcquisition,
          cours31Dec: ligne.cours31Dec,
          variationValeurAbsolue: ligne.variationValeurAbsolue,
        })) || [],
      transfertsCharges:
        this.extractSection(extractedData, "transfertsCharges")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote13Data(extractedData: DonneesExtraites): Note13Data {
    return {
      entete: this.extractEntete(extractedData),
      capital:
        this.extractSection(extractedData, "capital")?.lignes.map(
          (ligne: any) => ({
            nomsPrenom: ligne.nomsPrenom,
            nationalite: ligne.nationalite,
            natureActions: ligne.natureActions,
            nombre: ligne.nombre,
            montantTotal: ligne.montantTotal,
            cessions: ligne.cessions,
          }),
        ) || [],
    };
  }

  transformNote14Data(extractedData: DonneesExtraites): Note14Data {
    return {
      entete: this.extractEntete(extractedData),
      primesReserves:
        this.extractSection(extractedData, "primesReserves")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationValeurAbsolue: ligne.variationValeurAbsolue,
          }),
        ) || [],
    };
  }

  transformNote15AData(extractedData: DonneesExtraites): Note15AData {
    return {
      entete: this.extractEntete(extractedData),
      subventionsProvisionsReglementees:
        this.extractSection(
          extractedData,
          "subventionsProvisionsReglementees",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
          variationValeurAbsolue: ligne.variationValeurAbsolue,
          variationPourcentage: ligne.variationPourcentage,
          registreFiscal: ligne.registreFiscal,
          echeances: ligne.echeances,
        })) || [],
    };
  }

  transformNote15BData(extractedData: DonneesExtraites): Note15BData {
    return {
      entete: this.extractEntete(extractedData),
      autresFondsPropres:
        this.extractSection(extractedData, "autresFondsPropres")?.lignes.map(
          (ligne: any) => ({
            note: ligne.note,
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationValeurAbsolue: ligne.variationValeurAbsolue,
            variationPourcentage: ligne.variationPourcentage,
            echeances: ligne.echeances,
          }),
        ) || [],
    };
  }

  transformNote16AData(extractedData: DonneesExtraites): Note16AData {
    return {
      entete: this.extractEntete(extractedData),
      dettesFinancieres:
        this.extractSection(extractedData, "dettesFinancieres")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
            variationValeurAbsolue: ligne.variationValeurAbsolue,
            dettesUnAnAuPlus: ligne.dettesUnAnAuPlus,
            dettesPlusUnAnDeuxAns: ligne.dettesPlusUnAnDeuxAns,
            dettesPlusDeuxAns: ligne.dettesPlusDeuxAns,
          }),
        ) || [],
    };
  }

  transformNote16BData(extractedData: DonneesExtraites): Note16BData {
    return {
      entete: this.extractEntete(extractedData),
      hypothesesActuarielles:
        this.extractSection(
          extractedData,
          "hypothesesActuarielles",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
        })) || [],
      variationEngagement:
        this.extractSection(extractedData, "variationEngagement")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
          }),
        ) || [],
      analyseSensibilite:
        this.extractSection(extractedData, "analyseSensibilite")?.lignes.map(
          (ligne: any) => ({
            anneeNAugmentation: ligne.anneeNAugmentation,
            anneeNDiminution: ligne.anneeNDiminution,
            anneeN1Augmentation: ligne.anneeN1Augmentation,
            anneeN1Diminution: ligne.anneeN1Diminution,
          }),
        ) || [],
    };
  }

  transformNote16BBisData(extractedData: DonneesExtraites): Note16BBisData {
    return {
      entete: this.extractEntete(extractedData),
      actifPassifRegimes:
        this.extractSection(extractedData, "actifPassifRegimes")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
          }),
        ) || [],
      valeurActuelleActifs:
        this.extractSection(extractedData, "valeurActuelleActifs")?.lignes.map(
          (ligne: any) => ({
            anneeNRendement: ligne.anneeNRendement,
            anneeNJusteValeur: ligne.anneeNJusteValeur,
            anneeN1Rendement: ligne.anneeN1Rendement,
            anneeN1JusteValeur: ligne.anneeN1JusteValeur,
          }),
        ) || [],
    };
  }

  transformNote16CData(extractedData: DonneesExtraites): Note16CData {
    return {
      entete: this.extractEntete(extractedData),
      actifsPassifsEventuels:
        this.extractSection(
          extractedData,
          "actifsPassifsEventuels",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
        })) || [],
    };
  }

  transformNote17Data(extractedData: DonneesExtraites): Note17Data {
    return {
      entete: this.extractEntete(extractedData),
      fournisseursExploitation:
        this.extractSection(
          extractedData,
          "fournisseursExploitation",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
          variationPourcentage: ligne.variationPourcentage,
          dettesUnAnOuPlus: ligne.dettesUnAnOuPlus,
          dettesPlusUnAnDeuxAns: ligne.dettesPlusUnAnDeuxAns,
          dettesPlusDeuxAns: ligne.dettesPlusDeuxAns,
        })) || [],
    };
  }

  transformNote17C1Data(extractedData: DonneesExtraites): Note17C1Data {
    return {
      entete: this.extractEntete(extractedData),
      balanceGeneraleFournisseurs:
        this.extractSection(
          extractedData,
          "balanceGeneraleFournisseurs",
        )?.lignes.map((ligne: any) => ({
          numero: ligne.numero,
          soldeOuvertureDebit: ligne.soldeOuvertureDebit,
          soldeOuvertureCredit: ligne.soldeOuvertureCredit,
          mouvementsDebit: ligne.mouvementsDebit,
          mouvementsCredit: ligne.mouvementsCredit,
          soldeClotureDebit: ligne.soldeClotureDebit,
          soldeClotureCredit: ligne.soldeClotureCredit,
          variationDebit: ligne.variationDebit,
          variationCredit: ligne.variationCredit,
        })) || [],
      compte60Achats:
        this.extractSection(extractedData, "compte60Achats")?.lignes.map(
          (ligne: any) => ({
            lignes: ligne.lignes,
            numeroNomenclature: ligne.numeroNomenclature,
            quantite: ligne.quantite,
            prixUnitaire: ligne.prixUnitaire,
            total: ligne.total,
          }),
        ) || [],
      compte61Transports:
        this.extractSection(extractedData, "compte61Transports")?.lignes.map(
          (ligne: any) => ({
            comptes: ligne.comptes,
            lignes: ligne.lignes,
            routier: ligne.routier,
            ferroviaire: ligne.ferroviaire,
            parEau: ligne.parEau,
            parAir: ligne.parAir,
            servicesAuxiliaires: ligne.servicesAuxiliaires,
            supportesEtranger: ligne.supportesEtranger,
            total: ligne.total,
          }),
        ) || [],
    };
  }

  transformNote18Data(extractedData: DonneesExtraites): Note18Data {
    return {
      entete: this.extractEntete(extractedData),
      dettesFiscalesSociales:
        this.extractSection(
          extractedData,
          "dettesFiscalesSociales",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
          variationValeurAbsolue: ligne.variationValeurAbsolue,
          variationPourcentage: ligne.variationPourcentage,
          dettesUnAnAuPlus: ligne.dettesUnAnAuPlus,
          dettesPlusUnAnDeuxAns: ligne.dettesPlusUnAnDeuxAns,
          dettesPlusDeuxAns: ligne.dettesPlusDeuxAns,
        })) || [],
    };
  }

  transformNote19Data(extractedData: DonneesExtraites): Note19Data {
    return {
      entete: this.extractEntete(extractedData),
      autresDettesProvisions:
        this.extractSection(
          extractedData,
          "autresDettesProvisions",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
          variationValeurAbsolue: ligne.variationValeurAbsolue,
          variationPourcentage: ligne.variationPourcentage,
          dettesUnAnAuPlus: ligne.dettesUnAnAuPlus,
          dettesPlusUnAnDeuxAns: ligne.dettesPlusUnAnDeuxAns,
          dettesPlusDeuxAns: ligne.dettesPlusDeuxAns,
        })) || [],
    };
  }

  transformNote20Data(extractedData: DonneesExtraites): Note20Data {
    return {
      entete: this.extractEntete(extractedData),
      banquesCreditEscompte:
        this.extractSection(extractedData, "banquesCreditEscompte")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  // NEW: Note 21
  // transformNote21Data(extractedData: DonneesExtraites): Note21Data {
  //   const config = CONFIG_NOTE21;
  //   return {
  //     entete: this.extractEntete(extractedData),
  //     chiffreAffaires:
  //       this.extractSection(extractedData, "chiffreAffaires")?.lignes.map(
  //         (ligne: any, index: number) => ({
  //           libelle: config.sections?.chiffreAffaires?.libelles?.[index] || "",
  //           anneeN: ligne.anneeN,
  //           anneeN1: ligne.anneeN1,
  //           variationPourcentage: ligne.variationPourcentage,
  //         }),
  //       ) || [],
  //   };
  // }

  // NEW: Note 22
  // transformNote22Data(extractedData: DonneesExtraites): Note22Data {
  //   const config = CONFIG_NOTE22;
  //   return {
  //     entete: this.extractEntete(extractedData),
  //     autresProduits:
  //       this.extractSection(extractedData, "autresProduits")?.lignes.map(
  //         (ligne: any, index: number) => ({
  //           libelle: config.sections?.autresProduits?.libelles?.[index] || "",
  //           anneeN: ligne.anneeN,
  //           anneeN1: ligne.anneeN1,
  //           variationPourcentage: ligne.variationPourcentage,
  //         }),
  //       ) || [],
  //   };
  // }

  transformNote23Data(extractedData: DonneesExtraites): Note23Data {
    return {
      entete: this.extractEntete(extractedData),
      transports:
        this.extractSection(extractedData, "transports")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote24Data(extractedData: DonneesExtraites): Note24Data {
    return {
      entete: this.extractEntete(extractedData),
      servicesExterieurs:
        this.extractSection(extractedData, "servicesExterieurs")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote25Data(extractedData: DonneesExtraites): Note25Data {
    const config = CONFIG_NOTE25;
    return {
      entete: this.extractEntete(extractedData),
      impotsTaxes:
        this.extractSection(extractedData, "impotsTaxes")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle: config.sections?.impotsTaxes?.libelles?.[index] || "",
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote25C1Data(extractedData: DonneesExtraites): Note25C1Data {
    const config = CONFIG_NOTE25_C1;
    return {
      entete: this.extractEntete(extractedData),
      syntheseImpotsTaxes:
        this.extractSection(extractedData, "syntheseImpotsTaxes")?.lignes.map(
          (ligne: any, index: number) => ({
            libelle:
              config.sections?.syntheseImpotsTaxes?.libelles?.[index] || "",
            anneeN: ligne.anneeN,
            regularisations: ligne.regularisations,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote25C2Data(extractedData: DonneesExtraites): Note25C2Data {
    return {
      entete: this.extractEntete(extractedData),
      droitsAccisesAdValorem:
        this.extractSection(
          extractedData,
          "droitsAccisesAdValorem",
        )?.lignes.map((ligne: any) => ({
          ligne: ligne.ligne,
          baseBruteTaxable: ligne.baseBruteTaxable,
          abattementTaux: ligne.abattementTaux,
          abattementMontant: ligne.abattementMontant,
          baseNetteTaxable: ligne.baseNetteTaxable,
          taux: ligne.taux,
          montantDroits: ligne.montantDroits,
          droitsPayes: ligne.droitsPayes,
          soldeDroits: ligne.soldeDroits,
        })) || [],
      droitsAccisesSpecifiques:
        this.extractSection(
          extractedData,
          "droitsAccisesSpecifiques",
        )?.lignes.map((ligne: any) => ({
          ligne: ligne.ligne,
          productionLocale: ligne.productionLocale,
          importation: ligne.importation,
          exportation: ligne.exportation,
          quantitesTotales: ligne.quantitesTotales,
          uniteCalcul: ligne.uniteCalcul,
          tarif: ligne.tarif,
          montantDroits: ligne.montantDroits,
          droitsPayes: ligne.droitsPayes,
          soldeDroits: ligne.soldeDroits,
        })) || [],
    };
  }

  transformNote26Data(extractedData: DonneesExtraites): Note26Data {
    return {
      entete: this.extractEntete(extractedData),
      autresCharges:
        this.extractSection(extractedData, "autresCharges")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  // NEW: Note 27A
  // transformNote27AData(extractedData: DonneesExtraites): Note27AData {
  //   const config = CONFIG_NOTE27A;
  //   return {
  //     entete: this.extractEntete(extractedData),
  //     remunerationsPersonnel:
  //       this.extractSection(
  //         extractedData,
  //         "remunerationsPersonnel",
  //       )?.lignes.map((ligne: any, index: number) => ({
  //         libelle:
  //           config.sections?.remunerationsPersonnel?.libelles?.[index] || "",
  //         anneeN: ligne.anneeN,
  //         anneeN1: ligne.anneeN1,
  //         variationPourcentage: ligne.variationPourcentage,
  //       })) || [],
  //   };
  // }

  // // NEW: Note 27A C1
  // transformNote27AC1Data(extractedData: DonneesExtraites): Note27AC1Data {
  //   const config = CONFIG_NOTE27A_C1;
  //   return {
  //     entete: this.extractEntete(extractedData),
  //     detailRemunerations:
  //       this.extractSection(extractedData, "detailRemunerations")?.lignes.map(
  //         (ligne: any, index: number) => ({
  //           libelle:
  //             config.sections?.detailRemunerations?.libelles?.[index] || "",
  //           anneeN: ligne.anneeN,
  //           anneeN1: ligne.anneeN1,
  //           variationPourcentage: ligne.variationPourcentage,
  //         }),
  //       ) || [],
  //   };
  // }

  // NEW: Note 27B
  transformNote27BData(extractedData: DonneesExtraites): Note27BData {
    return {
      entete: this.extractEntete(extractedData),
      effectifsPersonnel:
        this.extractSection(extractedData, "effectifsPersonnel")?.lignes.map(
          (ligne: any) => ({
            categorie: ligne.categorie,
            nombreDebutExercice: ligne.nombreDebutExercice,
            nombreFinExercice: ligne.nombreFinExercice,
            nombreMoyenAnnuel: ligne.nombreMoyenAnnuel,
          }),
        ) || [],
    };
  }

  transformNote28Data(extractedData: DonneesExtraites): Note28Data {
    return {
      entete: this.extractEntete(extractedData),
      provisionsDepreciations:
        this.extractSection(
          extractedData,
          "provisionsDepreciations",
        )?.lignes.map((ligne: any) => ({
          provisionsOuverture: ligne.provisionsOuverture,
          dotationsExploitation: ligne.dotationsExploitation,
          dotationsFinancieres: ligne.dotationsFinancieres,
          dotationsHAO: ligne.dotationsHAO,
          reprisesExploitation: ligne.reprisesExploitation,
          reprisesFinancieres: ligne.reprisesFinancieres,
          reprisesHAO: ligne.reprisesHAO,
          provisionsCloture: ligne.provisionsCloture,
        })) || [],
    };
  }

  transformNote28C1Data(extractedData: DonneesExtraites): Note28C1Data {
    return {
      entete: this.extractEntete(extractedData),
      traitementFiscalProvisions:
        this.extractSection(
          extractedData,
          "traitementFiscalProvisions",
        )?.lignes.map((ligne: any) => ({
          exploitationDeductibles: ligne.exploitationDeductibles,
          exploitationNonDeductibles: ligne.exploitationNonDeductibles,
          financieresDeductibles: ligne.financieresDeductibles,
          financieresNonDeductibles: ligne.financieresNonDeductibles,
          haoDeductibles: ligne.haoDeductibles,
          haoNonDeductibles: ligne.haoNonDeductibles,
          totauxDeductibles: ligne.totauxDeductibles,
          totauxNonDeductibles: ligne.totauxNonDeductibles,
        })) || [],
    };
  }

  transformNote28C2Data(extractedData: DonneesExtraites): Note28C2Data {
    return this.transformNote28C1Data(extractedData);
  }

  transformNote29Data(extractedData: DonneesExtraites): Note29Data {
    return {
      entete: this.extractEntete(extractedData),
      chargesRevenusFinancier:
        this.extractSection(
          extractedData,
          "chargesRevenusFinancier",
        )?.lignes.map((ligne: any) => ({
          anneeN: ligne.anneeN,
          anneeN1: ligne.anneeN1,
          variationPourcentage: ligne.variationPourcentage,
        })) || [],
    };
  }

  transformNote30Data(extractedData: DonneesExtraites): Note30Data {
    return {
      entete: this.extractEntete(extractedData),
      chargesProduitsHAO:
        this.extractSection(extractedData, "chargesProduitsHAO")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  transformNote31Data(extractedData: DonneesExtraites): Note31Data {
    return {
      entete: this.extractEntete(extractedData),
      repartitionResultat:
        this.extractSection(extractedData, "repartitionResultat")?.lignes.map(
          (ligne: any) => ({
            exerciceN: ligne.exerciceN,
            exerciceN1: ligne.exerciceN1,
            exerciceN2: ligne.exerciceN2,
            exerciceN3: ligne.exerciceN3,
            exerciceN4: ligne.exerciceN4,
          }),
        ) || [],
    };
  }

  transformNote32Data(extractedData: DonneesExtraites): Note32Data {
    return {
      entete: this.extractEntete(extractedData),
      productionExercice:
        this.extractSection(extractedData, "productionExercice")?.lignes.map(
          (ligne: any) => ({
            designationProduits: ligne.designationProduits,
            uniteQuantite: ligne.uniteQuantite,
            productionPaysQuantite: ligne.productionPaysQuantite,
            productionPaysValeur: ligne.productionPaysValeur,
            productionOhadaQuantite: ligne.productionOhadaQuantite,
            productionOhadaValeur: ligne.productionOhadaValeur,
            productionHorsOhadaQuantite: ligne.productionHorsOhadaQuantite,
            productionHorsOhadaValeur: ligne.productionHorsOhadaValeur,
            productionImmobiliseeQuantite: ligne.productionImmobiliseeQuantite,
            productionImmobiliseeValeur: ligne.productionImmobiliseeValeur,
            stockOuvertureQuantite: ligne.stockOuvertureQuantite,
            stockOuvertureValeur: ligne.stockOuvertureValeur,
            stockClotureQuantite: ligne.stockClotureQuantite,
            stockClotureValeur: ligne.stockClotureValeur,
          }),
        ) || [],
    };
  }

  transformNote33Data(extractedData: DonneesExtraites): Note33Data {
    return {
      entete: this.extractEntete(extractedData),
      achatsProduction:
        this.extractSection(extractedData, "achatsProduction")?.lignes.map(
          (ligne: any) => ({
            designationMatieres: ligne.designationMatieres,
            uniteQuantite: ligne.uniteQuantite,
            produitsEtatQuantite: ligne.produitsEtatQuantite,
            produitsEtatValeur: ligne.produitsEtatValeur,
            produitsImportesEtatQuantite: ligne.produitsImportesEtatQuantite,
            produitsImportesEtatValeur: ligne.produitsImportesEtatValeur,
            produitsImportesHorsEtatQuantite:
              ligne.produitsImportesHorsEtatQuantite,
            produitsImportesHorsEtatValeur:
              ligne.produitsImportesHorsEtatValeur,
            variationStocks: ligne.variationStocks,
          }),
        ) || [],
    };
  }

  transformNote34Data(extractedData: DonneesExtraites): Note34Data {
    return {
      entete: this.extractEntete(extractedData),
      indicateursFinanciers:
        this.extractSection(extractedData, "indicateursFinanciers")?.lignes.map(
          (ligne: any) => ({
            anneeN: ligne.anneeN,
            anneeN1: ligne.anneeN1,
            variationPourcentage: ligne.variationPourcentage,
          }),
        ) || [],
    };
  }

  // NEW: Note 35
  // transformNote35Data(extractedData: DonneesExtraites): Note35Data {
  //   const config = CONFIG_NOTE35;
  //   return {
  //     entete: this.extractEntete(extractedData),
  //     autresInformations:
  //       this.extractSection(extractedData, "autresInformations")?.lignes.map(
  //         (ligne: any, index: number) => ({
  //           libelle:
  //             config.sections?.autresInformations?.libelles?.[index] || "",
  //           anneeN: ligne.anneeN,
  //           anneeN1: ligne.anneeN1,
  //           variationPourcentage: ligne.variationPourcentage,
  //         }),
  //       ) || [],
  //   };
  // }

  // ==================== API METHODS ====================

  async getNoteData(folderId: string, noteNumber: string): Promise<NoteData | null> {
    try {
      const encodedNote = encodeURIComponent(noteNumber);
      const response = await api.get(
        `/notes/${encodedNote}?folderId=${encodeURIComponent(folderId)}`,
      );
      return response.data?.data ?? null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error(`Error fetching Note ${noteNumber} data:`, error);
      return null;
    }
  }

  async saveNoteData(folderId: string, noteNumber: string, data: NoteData): Promise<boolean> {
    try {
      const encodedNote = encodeURIComponent(noteNumber);
      await api.post(`/notes/${encodedNote}`, { folderId, noteNumber, data });
      return true;
    } catch (error) {
      console.error(`Error saving Note ${noteNumber} data:`, error);
      return false;
    }
  }

  /**
   * Fetch all notes with full data (used by report components).
   * Pass light=true to get only { noteNumber, exists } flags (no data payload).
   */
  async getNotesForFolder(folderId: string, light = false) {
    if (!folderId || typeof folderId !== "string") return [];
    try {
      const url = `/notes/folder/${encodeURIComponent(folderId)}${light ? "?light=true" : ""}`;
      const response = await api.get(url);
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (err) {
      console.error("getNotesForFolder failed:", err);
      return [];
    }
  }

  // ==================== UTILITY METHODS ====================

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatPercentage(value: number | null): string {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: "percent",
    }).format(value / 100);
  }

  calculateNote1Totals(data: Note1Data) {
    const calculateSectionTotals = (items: any[]) =>
      items.reduce(
        (acc, item) => ({
          grossAmount: (acc.grossAmount || 0) + (item.grossAmount || 0),
          mortgages: (acc.mortgages || 0) + (item.mortgages || 0),
          pledges: (acc.pledges || 0) + (item.pledges || 0),
          others: (acc.others || 0) + (item.others || 0),
        }),
        { grossAmount: 0, mortgages: 0, pledges: 0, others: 0 },
      );

    const financialTotal = calculateSectionTotals(data.financialDebts);
    const leasingTotal = calculateSectionTotals(data.leasingDebts);
    const currentTotal = calculateSectionTotals(data.currentLiabilities);

    return {
      financialDebts: financialTotal,
      leasingDebts: leasingTotal,
      currentLiabilities: currentTotal,
      grandTotal: {
        grossAmount:
          financialTotal.grossAmount +
          leasingTotal.grossAmount +
          currentTotal.grossAmount,
        mortgages:
          financialTotal.mortgages +
          leasingTotal.mortgages +
          currentTotal.mortgages,
        pledges:
          financialTotal.pledges + leasingTotal.pledges + currentTotal.pledges,
        others:
          financialTotal.others + leasingTotal.others + currentTotal.others,
      },
    };
  }

  validateNoteData(
    noteNumber: string,
    data: any,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data) {
      errors.push("Données manquantes");
      return { valid: false, errors };
    }
    if (!data.entete) {
      errors.push("En-tête manquant");
    } else {
      if (!data.entete.entityName) errors.push("Le nom de l'entité est requis");
      if (!data.entete.fiscalYear) errors.push("L'exercice fiscal est requis");
    }
    switch (noteNumber) {
      case "1":
        if (!data.financialDebts || data.financialDebts.length === 0)
          errors.push("Les dettes financières sont requises");
        break;
      case "3A":
        if (
          !data.immobilisationsIncorporelles ||
          data.immobilisationsIncorporelles.length === 0
        )
          errors.push("Les immobilisations incorporelles sont requises");
        break;
    }
    return { valid: errors.length === 0, errors };
  }
  /**
   * Delete all notes for a folder
   */
  async deleteAllNotes(folderId: string): Promise<{ message: string }> {
    const response = await api.delete(`/notes/folder/${encodeURIComponent(folderId)}`);
    return response.data;
  }
}

export const notesService = new NotesService();
