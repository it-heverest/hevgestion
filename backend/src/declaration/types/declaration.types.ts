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
