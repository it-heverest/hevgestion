/**
 * DGI Declaration Types
 *
 * Types for DGI API integration based on:
 * http://tasserver.dgi.cm/api/v1
 */

import { Request } from "express";

// ============================================
// Authentication Types
// ============================================

export interface DGIAuthRequest {
  username: string;
  password: string;
}

export interface DGIAuthResponse {
  token: string;
  statusCode: number;
}

// ============================================
// Declaration Types
// ============================================

export type DGIDeclarationType =
  | "dsf"
  | "dsfBanque"
  | "dsfAssurance"
  | "igs"
  | "dgi";

export interface DGICreateDeclarationRequest {
  declarationType: DGIDeclarationType;
  fiscalYear: string;
}

export interface DGICreateDeclarationResponse {
  id: string;
  action: string;
  status: string;
}

export interface DGIDeclaration {
  id: string;
  annee: string;
  status: string;
  typeDeclaration: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface DGIDeclarationListResponse {
  total: number;
  records: DGIDeclaration[];
}

export interface DGIDeleteDeclarationResponse {
  action: string;
  status: string;
}

// ============================================
// Page Types (Page de Garde, Fiche R1/R2)
// ============================================

export interface DGIPageDeGardeData {
  republique?: string;
  ministere?: string;
  direction?: string;
  centreDeDepot?: string;
  exerClosLe?: string;
  denomSoc?: string;
  siglUsuel?: string;
  addrComp?: string;
  numIdentFiscal: string;
  ficDide?: boolean;
  bilan?: boolean;
  comptRes?: boolean;
  tabDesFluxTreso?: boolean;
  notAnnex?: boolean;
  nombreDePages?: string;
  nombreDexamplaire?: string;
  dateDepot?: string;
  nomDeAgent?: string;
  signDeLagent?: string;
}

export interface DGIFicheR1Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  [key: string]: any;
}

export interface DGIFicheR2Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  [key: string]: any;
}

// ============================================
// Grille Analyse Types
// ============================================

export interface DGIGridRow {
  eco: string;
  soc: string;
  fisc: string;
  cial: string;
}

export interface DGIGrilleAnalyseData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGIGridRow;
  r2?: DGIGridRow;
  r3?: DGIGridRow;
  r4?: DGIGridRow;
  r5?: DGIGridRow;
  r6?: DGIGridRow;
  r7?: DGIGridRow;
  r8?: DGIGridRow;
  r9?: DGIGridRow;
  r10?: DGIGridRow;
  r11?: DGIGridRow;
  r12?: DGIGridRow;
  r13?: DGIGridRow;
  r14?: DGIGridRow;
  r15?: DGIGridRow;
  r16?: DGIGridRow;
  r17?: DGIGridRow;
  r18?: DGIGridRow;
  r19?: DGIGridRow;
  r20?: DGIGridRow;
  r21?: DGIGridRow;
  r22?: DGIGridRow;
  r23?: DGIGridRow;
  r24?: DGIGridRow;
  r25?: DGIGridRow;
  r26?: DGIGridRow;
  r27?: DGIGridRow;
  r28?: DGIGridRow;
  r29?: DGIGridRow;
  r30?: DGIGridRow;
  r31?: DGIGridRow;
  r32?: DGIGridRow;
  r33?: DGIGridRow;
  r34?: DGIGridRow;
  r35?: DGIGridRow;
  r36?: DGIGridRow;
  r37?: DGIGridRow;
  r38?: DGIGridRow;
  r39?: DGIGridRow;
  r40?: DGIGridRow;
  r41?: DGIGridRow;
  r42?: DGIGridRow;
  r43?: DGIGridRow;
  r44?: DGIGridRow;
  r45?: DGIGridRow;
  r46?: DGIGridRow;
  r50?: DGIGridRow;
  r51?: DGIGridRow;
  r52?: DGIGridRow;
  r53?: DGIGridRow;
  r54?: DGIGridRow;
  r57?: DGIGridRow;
  r58?: DGIGridRow;
  r59?: DGIGridRow;
  r60?: DGIGridRow;
  r61?: DGIGridRow;
  r62?: DGIGridRow;
}

// ============================================
// Section 2 Model 1 Bilan Paysage Types
// ============================================

export interface DGIBilanPaysageRow {
  brut1: number;
  amort: number;
  net1: number;
  net2: number;
  net3: number;
  net4: number;
}

export interface DGISection2Model1BilanPaysageData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGIBilanPaysageRow;
  r2?: DGIBilanPaysageRow;
  r3?: DGIBilanPaysageRow;
  r4?: DGIBilanPaysageRow;
  r5?: DGIBilanPaysageRow;
  r6?: DGIBilanPaysageRow;
  r7?: DGIBilanPaysageRow;
  r8?: DGIBilanPaysageRow;
  r9?: DGIBilanPaysageRow;
  r10?: DGIBilanPaysageRow;
  r11?: DGIBilanPaysageRow;
  r12?: DGIBilanPaysageRow;
  r13?: DGIBilanPaysageRow;
  r14?: DGIBilanPaysageRow;
  r15?: DGIBilanPaysageRow;
  r16?: DGIBilanPaysageRow;
  r17?: DGIBilanPaysageRow;
  r18?: DGIBilanPaysageRow;
  r19?: DGIBilanPaysageRow;
  r20?: DGIBilanPaysageRow;
  r21?: DGIBilanPaysageRow;
  r22?: DGIBilanPaysageRow;
  r23?: DGIBilanPaysageRow;
  r24?: DGIBilanPaysageRow;
  r25?: DGIBilanPaysageRow;
  r26?: DGIBilanPaysageRow;
  r27?: DGIBilanPaysageRow;
  r28?: DGIBilanPaysageRow;
  r29?: DGIBilanPaysageRow;
}

// ============================================
// Section 2 Model Compte de Resultat Types
// ============================================

export interface DGICompteResultatRow {
  exercicenet: number;
  exercicenetmin1: number;
}

export interface DGISection2ModelCompteResultatData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGICompteResultatRow;
  r2?: DGICompteResultatRow;
  r3?: DGICompteResultatRow;
  r4?: DGICompteResultatRow;
  r5?: DGICompteResultatRow;
  r6?: DGICompteResultatRow;
  r7?: DGICompteResultatRow;
  r8?: DGICompteResultatRow;
  r9?: DGICompteResultatRow;
  r10?: DGICompteResultatRow;
  r11?: DGICompteResultatRow;
  r12?: DGICompteResultatRow;
  r13?: DGICompteResultatRow;
  r14?: DGICompteResultatRow;
  r15?: DGICompteResultatRow;
  r16?: DGICompteResultatRow;
  r17?: DGICompteResultatRow;
  r18?: DGICompteResultatRow;
  r19?: DGICompteResultatRow;
  r20?: DGICompteResultatRow;
  r21?: DGICompteResultatRow;
  r22?: DGICompteResultatRow;
  r23?: DGICompteResultatRow;
  r24?: DGICompteResultatRow;
  r25?: DGICompteResultatRow;
  r26?: DGICompteResultatRow;
  r27?: DGICompteResultatRow;
  r28?: DGICompteResultatRow;
  r29?: DGICompteResultatRow;
  r30?: DGICompteResultatRow;
  r31?: DGICompteResultatRow;
  r32?: DGICompteResultatRow;
  r33?: DGICompteResultatRow;
  r34?: DGICompteResultatRow;
  r35?: DGICompteResultatRow;
  r36?: DGICompteResultatRow;
  r37?: DGICompteResultatRow;
  r38?: DGICompteResultatRow;
  r39?: DGICompteResultatRow;
  r40?: DGICompteResultatRow;
  r41?: DGICompteResultatRow;
  r42?: DGICompteResultatRow;
}

// ============================================
// Section 2 Model Tableau des Flux de Tresorerie Types
// ============================================

export interface DGITresorieRow {
  note: number;
  exercice: number;
  exercicenmin1: number;
}

export interface DGISection2ModelTableauFluxTresorerieData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGITresorieRow;
  r2?: DGITresorieRow;
  r3?: DGITresorieRow;
  r4?: DGITresorieRow;
  r5?: DGITresorieRow;
  r6?: DGITresorieRow;
  r7?: DGITresorieRow;
  r8?: DGITresorieRow;
  r9?: DGITresorieRow;
  r10?: DGITresorieRow;
  r11?: DGITresorieRow;
  r12?: DGITresorieRow;
  r13?: DGITresorieRow;
  r14?: DGITresorieRow;
  r15?: DGITresorieRow;
  r16?: DGITresorieRow;
  r17?: DGITresorieRow;
  r18?: DGITresorieRow;
  r19?: DGITresorieRow;
  r20?: DGITresorieRow;
  r21?: DGITresorieRow;
  r22?: DGITresorieRow;
  r23?: DGITresorieRow;
  r24?: DGITresorieRow;
  r25?: DGITresorieRow;
  r26?: DGITresorieRow;
  r27?: DGITresorieRow;
  r28?: DGITresorieRow;
  r29?: DGITresorieRow;
  r30?: DGITresorieRow;
}

// ============================================
// Note 1 (Passif/Bilan) Types
// ============================================

export interface DGINote1MontantRow {
  note: string;
  montantBrut: number;
  hypoteques: number;
  nantissements: number;
  gagesAutres: number;
}

export interface DGINote1EngagementsRow {
  blnk: number;
  engagementsDonnees: number;
  engagementsRecu: number;
}

export interface DGINote1Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  emprunsObligatoires?: DGINote1MontantRow;
  autresEmprunsObligatoires?: DGINote1MontantRow;
  empruntsEtDettes?: DGINote1MontantRow;
  autresDettesFinancieres?: DGINote1MontantRow;
  sousTotal1?: DGINote1MontantRow;
  dettesDeCreditBailImmobilier?: DGINote1MontantRow;
  dettesDeCreditBailMobilier?: DGINote1MontantRow;
  dettesSurContratsDeLocationVente?: DGINote1MontantRow;
  DettesSurContratsDeLocationAqcuisation?: DGINote1MontantRow;
  sousTotal2?: DGINote1MontantRow;
  fournisseursEtComptesRattaches?: DGINote1MontantRow;
  clients?: DGINote1MontantRow;
  personnel?: DGINote1MontantRow;
  securiteSocialeEtOrganismesInternationaux?: DGINote1MontantRow;
  etat?: DGINote1MontantRow;
  organismesinternal?: DGINote1MontantRow;
  associesEtGroupe?: DGINote1MontantRow;
  crediteursDivers?: DGINote1MontantRow;
  sousTotal3?: DGINote1MontantRow;
  total123?: DGINote1MontantRow;
  engagementsConsentis?: DGINote1EngagementsRow;
  primesDeRemboursements?: DGINote1EngagementsRow;
  avalsCautionsGarantis?: DGINote1EngagementsRow;
  hypothequesNantissementsGagesAutres?: DGINote1EngagementsRow;
  effetsEscomptesNonEchus?: DGINote1EngagementsRow;
  creancesCommerciales?: DGINote1EngagementsRow;
  abandonsDeCreances?: DGINote1EngagementsRow;
  total?: DGINote1EngagementsRow;
  indiquerLaRaison?: string;
}

// ============================================
// Note 2 (Informations Obligatoires) Types
// ============================================

export interface DGINote2Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  aDeclaration?: string;
  bRegies?: string;
  cDerogat?: string;
  dInfo?: string;
}

// ============================================
// Note 3A (Immobilisations Brutes) Types
// ============================================

export interface DGINote3ARow {
  montantbrut: number;
  acquisition: number;
  virements: number;
  suiteareevalution: number;
  cession: number;
  virementdepos: number;
  montantcloture: number;
}

export interface DGINote3AData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote3ARow;
  r2?: DGINote3ARow;
  r3?: DGINote3ARow;
  r4?: DGINote3ARow;
  r5?: DGINote3ARow;
  r6?: DGINote3ARow;
  r7?: DGINote3ARow;
  r8?: DGINote3ARow;
  r9?: DGINote3ARow;
  r10?: DGINote3ARow;
  r11?: DGINote3ARow;
  r12?: DGINote3ARow;
  r13?: DGINote3ARow;
  r14?: DGINote3ARow;
  r15?: DGINote3ARow;
  r16?: DGINote3ARow;
  r17?: DGINote3ARow;
  r18?: DGINote3ARow;
  r19?: DGINote3ARow;
  r20?: DGINote3ARow;
  commentaires?: string;
}

// ============================================
// Note 3B (Biens Pris en Location Acquisition) Types
// ============================================

export interface DGINote3BRow {
  natureducontr: string;
  montantbrut: number;
  acquisitions: number;
  cirementsdepos: number;
  suiteaunereev: number;
  cessions: number;
  virementsdeposte: number;
  montantbrutaexerc: number;
}

export interface DGINote3BData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote3BRow;
  r2?: DGINote3BRow;
  r3?: DGINote3BRow;
  r4?: DGINote3BRow;
  r5?: DGINote3BRow;
  r6?: DGINote3BRow;
  r7?: DGINote3BRow;
  r8?: DGINote3BRow;
  r9?: DGINote3BRow;
  r10?: DGINote3BRow;
  r11?: DGINote3BRow;
  commentaire?: string;
}

// ============================================
// Note 3C (Immobilisation - Amortissements) Types
// ============================================

export interface DGINote3CRow {
  ammortissement: number;
  augmentation: number;
  diminutions: number;
  cumuldesamor: number;
}

export interface DGINote3CData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote3CRow;
  r2?: DGINote3CRow;
  r3?: DGINote3CRow;
  r4?: DGINote3CRow;
  r5?: DGINote3CRow;
  r6?: DGINote3CRow;
  r7?: DGINote3CRow;
  r8?: DGINote3CRow;
  r9?: DGINote3CRow;
  r10?: DGINote3CRow;
  r11?: DGINote3CRow;
  r12?: DGINote3CRow;
  r13?: DGINote3CRow;
  r14?: DGINote3CRow;
  commentaires?: string;
}

// ============================================
// CO1-Note 3C (Tableau de Suivi des Amortissements) Types
// ============================================

export interface DGICol1Note3C2Row {
  reportdeamortisement: number;
  amortissementsdif: number;
  imputationsurex: number;
  totaldureport: number;
}

export interface DGICol1Note3C2Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGICol1Note3C2Row;
  r2?: DGICol1Note3C2Row;
  r3?: DGICol1Note3C2Row;
}

// ============================================
// Note 3D2 (Immobilisations - Cessions) Types
// ============================================

export interface DGINote3D2Row {
  montantbruta: number;
  amortissements: number;
  valeurcompt: number;
  prixdecessions: number;
  plusvalues: number;
}

export interface DGINote3D2Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote3D2Row;
  r2?: DGINote3D2Row;
  r3?: DGINote3D2Row;
  r4?: DGINote3D2Row;
  r5?: DGINote3D2Row;
  r6?: DGINote3D2Row;
  r7?: DGINote3D2Row;
  r8?: DGINote3D2Row;
  r9?: DGINote3D2Row;
  r10?: DGINote3D2Row;
  r11?: DGINote3D2Row;
  r12?: DGINote3D2Row;
  r13?: DGINote3D2Row;
  r14?: DGINote3D2Row;
  r15?: DGINote3D2Row;
  commentaire?: string;
}

// ============================================
// Note 3E2 (Immobilisations - Réévaluation) Types
// ============================================

export interface DGINote3E2Row {
  elementsreevalue: string;
  montatshist: string;
  amortissement: string;
}

export interface DGINote3E2Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  natureetdate?: string;
  r1?: DGINote3E2Row;
  r2?: DGINote3E2Row;
  r3?: DGINote3E2Row;
  r4?: DGINote3E2Row;
  r5?: DGINote3E2Row;
  r6?: DGINote3E2Row;
  r7?: DGINote3E2Row;
  r8?: DGINote3E2Row;
  methodereevalue?: string;
  traitementfiscal?: string;
  montantdelecart?: string;
}

// ============================================
// Note 3F (Frais d'Établissement) Types
// This endpoint uses the URL pattern: /process/:year/:type/:page
// ============================================

export interface DGINote3FData {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  montantGlobalAEtait?: {
    fraisDEtablissement?: number;
    chargesARepartir?: number;
    primesDeRemboursement?: number;
  };
  dureeDEtalement?: {
    fraisDEtablissement?: number;
    chargesARepartir?: number;
    primesDeRemboursement?: number;
  };
  exerciseN?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  noRow1?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  noRow2?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  noRow3?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  noRow4?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  totalExerciceN?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  totalExerciceN1?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  totalExerciceN3?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  totalExerciceN4?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  totalExerciceN5?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
  totalGeneral?: {
    comptes1?: number;
    montants1?: number;
    comptes2?: number;
    montants2?: number;
    comptes3?: number;
    montants3?: number;
  };
}

// ============================================
// Generic Page Response
// ============================================

export interface DGIPageResponse {
  action: string;
  status: string;
  message?: string;
}

// ============================================
// Error Types
// ============================================

export interface DGIError {
  action: string;
  errorCode: number;
  message: string;
}

// ============================================
// Request/Response Types for Controller
// ============================================

export interface AuthRequestBody {
  username: string;
  password: string;
}

export interface CreateDeclarationBody {
  userId: string;
  declarationType: DGIDeclarationType;
  fiscalYear: string;
}

export interface GetDeclarationsBody {
  userId: string;
  year?: string;
}

export interface DeleteDeclarationBody {
  userId: string;
  declarationId: string;
}

export interface SubmitPageBody {
  userId: string;
  declarationId: string;
  pageName: string;
  pageData: any;
}

export interface UpdatePageBody {
  userId: string;
  declarationId: string;
  pageName: string;
  pageData: any;
}

export interface DeletePageBody {
  userId: string;
  declarationId: string;
  pageName: string;
}

// ============================================
// Express Request Extensions
// ============================================

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: DGIError;
}

// ============================================
// Note 4 (Créances) Types
// This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
// The :declaration_page parameter is "note42"
// ============================================

export interface DGINote4R1 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
  denomination?: string;
  localisationville?: string;
  localisationpays?: string;
  valeuredacquisition?: number;
  detenu?: number;
  montantdescapitau?: number;
  resltaldernier?: number;
}

export interface DGINote4R2 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
  denomination?: string;
  localisationville?: string;
  localisationpays?: string;
  valeuredacquisition?: number;
  detenu?: number;
  montantdescapitau?: number;
  resltaldernier?: number;
}

export interface DGINote4R3 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
  denomination?: string;
  localisationville?: string;
  localisationpays?: string;
  valeuredacquisition?: number;
  detenu?: number;
  montantdescapitau?: number;
  resltaldernier?: number;
}

export interface DGINote4R4 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
  denomination?: string;
  localisationville?: string;
  localisationpays?: string;
  valeuredacquisition?: number;
  detenu?: number;
  montantdescapitau?: number;
  resltaldernier?: number;
}

export interface DGINote4R5 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
  denomination?: string;
  localisationville?: string;
  localisationpays?: string;
  valeuredacquisition?: number;
  detenu?: number;
  montantdescapitau?: number;
  resltaldernier?: number;
}

export interface DGINote4R6 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote4R7 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote4R8 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote4R9 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote4R10 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote4R11 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote4Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote4R1;
  r2?: DGINote4R2;
  r3?: DGINote4R3;
  r4?: DGINote4R4;
  r5?: DGINote4R5;
  r6?: DGINote4R6;
  r7?: DGINote4R7;
  r8?: DGINote4R8;
  r9?: DGINote4R9;
  r10?: DGINote4R10;
  r11?: DGINote4R11;
  commentaire?: string;
}

// ============================================
// Note 5 (Stocks) Types
// This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
// The :declaration_page parameter is "note52"
// ============================================

export interface DGINote5R1_1 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R1_2 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R1_3 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R1_4 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R1_5 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R2_1 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R2_2 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R2_3 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R2_4 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5R2_5 {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote5Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1_1?: DGINote5R1_1;
  r1_2?: DGINote5R1_2;
  r1_3?: DGINote5R1_3;
  r1_4?: DGINote5R1_4;
  r1_5?: DGINote5R1_5;
  r2_1?: DGINote5R2_1;
  r2_2?: DGINote5R2_2;
  r2_3?: DGINote5R2_3;
  r2_4?: DGINote5R2_4;
  r2_5?: DGINote5R2_5;
  commentaire?: string;
}

// ============================================
// Note 6 (Provisions) Types
// This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
// The :declaration_page parameter is "note62"
// ============================================

export interface DGINote6Row {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote6Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote6Row;
  r2?: DGINote6Row;
  r3?: DGINote6Row;
  r4?: DGINote6Row;
  r5?: DGINote6Row;
  r6?: DGINote6Row;
  r7?: DGINote6Row;
  r8?: DGINote6Row;
  r9?: DGINote6Row;
  r10?: DGINote6Row;
  r11?: DGINote6Row;
  rlast?: string;
}

// ============================================
// Note 7 (Créances - Accounts Receivable)
// Page parameter: note72
// ============================================

export interface DGINote7Row {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote7Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote7Row;
  r2?: DGINote7Row;
  r3?: DGINote7Row;
  r4?: DGINote7Row;
  r5?: DGINote7Row;
  r6?: DGINote7Row;
  r7?: DGINote7Row;
  r8?: DGINote7Row;
  r9?: DGINote7Row;
  r10?: DGINote7Row;
  r11?: DGINote7Row;
  r12?: DGINote7Row;
  r13?: DGINote7Row;
  r14?: DGINote7Row;
  r15?: DGINote7Row;
  rlast?: string;
}

// ============================================
// Note 8 (Dettes - Accounts Payable)
// Page parameter: note82
// ============================================

export interface DGINote8Row {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
  creancesaunauplus?: number;
  creancesaplus2ansauplus?: number;
  creancesaplux2ans?: number;
}

export interface DGINote8Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote8Row;
  r2?: DGINote8Row;
  r3?: DGINote8Row;
  r4?: DGINote8Row;
  r5?: DGINote8Row;
  r6?: DGINote8Row;
  r7?: DGINote8Row;
  r8?: DGINote8Row;
  r9?: DGINote8Row;
  r10?: DGINote8Row;
  r11?: DGINote8Row;
  r12?: DGINote8Row;
  r13?: DGINote8Row;
  commentaire?: string;
}

// ============================================
// Note 9 (Investissements)
// Page parameter: note92
// ============================================

export interface DGINote9Row {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote9Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote9Row;
  r2?: DGINote9Row;
  r3?: DGINote9Row;
  r4?: DGINote9Row;
  r5?: DGINote9Row;
  r6?: DGINote9Row;
  r7?: DGINote9Row;
  r8?: DGINote9Row;
  r9?: DGINote9Row;
  r10?: DGINote9Row;
  commentaire?: string;
}

// ============================================
// Note 10 (Immobilisations)
// Page parameter: note10
// Uses URL pattern: /process/:declaration_id/note10
// ============================================

export interface DGINote10Row {
  anneen?: number;
  anneenmin1?: number;
  variation?: number;
}

export interface DGINote10Data {
  desigEntite?: string;
  numerodIdent?: string;
  exerciceClos?: string;
  dureeMois?: number;
  r1?: DGINote10Row;
  r2?: DGINote10Row;
  r3?: DGINote10Row;
  r4?: DGINote10Row;
  r5?: DGINote10Row;
  r6?: DGINote10Row;
  r7?: DGINote10Row;
  r8?: DGINote10Row;
  r9?: DGINote10Row;
  commentaire?: string;
}
