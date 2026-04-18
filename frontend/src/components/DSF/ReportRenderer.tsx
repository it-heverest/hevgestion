// components/reports/AllReportsGrid.tsx
import React, { Suspense, useMemo, useState } from "react";
import { FileText, Eye, Edit, Filter, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportDefinition {
  name: string;
  /** Lazy-loaded component factory. */
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  route: string;
  category: string;
}

/**
 * Props for AllReportsGrid.
 *
 * When used in "browse" mode (manual generation), pass `folderId` and
 * `onViewReport`.
 *
 * When used in "preview" mode (from ReportsView), pass `noteName` and
 * `data` — the grid will render only the matching single report.
 */
interface AllReportsGridProps {
  /** Active folder id forwarded to each report component. */
  folderId?: string;
  /** Called when the user clicks "Voir" on a report card. */
  onViewReport?: (name: string, component: React.ComponentType<any>) => void;
  /** When set, renders only the report matching this name (preview mode). */
  noteName?: string;
  /** Data forwarded to the report component in preview mode. */
  data?: unknown;
}

// ---------------------------------------------------------------------------
// Report registry
// All components are lazy-loaded so only the one(s) actually rendered are
// ever fetched. This prevents the 130-component eager-import crash.
// ----------------------------------------------------------------------------

export const ALL_REPORTS: ReportDefinition[] = [
  // ── Notes Standard ────────────────────────────────────────────────────────
  {
    name: "NOTE 1",
    route: "rapport/note1",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note1")),
  },
  {
    name: "NOTE 2",
    route: "rapport/note2",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note2")),
  },
  {
    name: "NOTE 3A",
    route: "rapport/note3a",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note3A")),
  },
  {
    name: "NOTE 3B",
    route: "rapport/note3b",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note3B")),
  },
  {
    name: "NOTE 3C",
    route: "rapport/note3c",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note3C")),
  },
  {
    name: "NOTE 3D",
    route: "rapport/note3d",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note3D")),
  },
  {
    name: "NOTE 3F",
    route: "rapport/note3f",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note3F")),
  },
  {
    name: "NOTE 4",
    route: "rapport/note4",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note4")),
  },
  {
    name: "NOTE 5",
    route: "rapport/note5",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note5")),
  },
  {
    name: "NOTE 6",
    route: "rapport/note6",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note6")),
  },
  {
    name: "NOTE 7",
    route: "rapport/note7",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note7")),
  },
  {
    name: "NOTE 8",
    route: "rapport/note8",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note8")),
  },
  {
    name: "NOTE 9",
    route: "rapport/note9",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note9")),
  },
  {
    name: "NOTE 10",
    route: "rapport/note10",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note10")),
  },
  {
    name: "NOTE 11",
    route: "rapport/note11",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note11")),
  },
  {
    name: "NOTE 12",
    route: "rapport/note12",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note12")),
  },
  {
    name: "NOTE 13",
    route: "rapport/note13",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note13")),
  },
  {
    name: "NOTE 14",
    route: "rapport/note14",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note14")),
  },
  {
    name: "NOTE 15A",
    route: "rapport/note15a",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note15A")),
  },
  {
    name: "NOTE 15B",
    route: "rapport/note15b",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note15B")),
  },
  {
    name: "NOTE 16A",
    route: "rapport/note16a",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note16A")),
  },
  {
    name: "NOTE 16B",
    route: "rapport/note16b",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note16B")),
  },
  {
    name: "NOTE 16B BIS",
    route: "rapport/note16bbis",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note16Bbis")),
  },
  {
    name: "NOTE 16C",
    route: "rapport/note16c",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note16C")),
  },
  {
    name: "NOTE 17",
    route: "rapport/note17",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note17")),
  },
  {
    name: "NOTE 18",
    route: "rapport/note18",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note18")),
  },
  {
    name: "NOTE 19",
    route: "rapport/note19",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note19")),
  },
  {
    name: "NOTE 20",
    route: "rapport/note20",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note20")),
  },
  {
    name: "NOTE 21",
    route: "rapport/note21",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note21")),
  },
  {
    name: "NOTE 22",
    route: "rapport/note22",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note22")),
  },
  {
    name: "NOTE 23",
    route: "rapport/note23",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note23")),
  },
  {
    name: "NOTE 24",
    route: "rapport/note24",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note24")),
  },
  {
    name: "NOTE 25",
    route: "rapport/note25",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note25")),
  },
  {
    name: "NOTE 26",
    route: "rapport/note26",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note26")),
  },
  {
    name: "NOTE 27A",
    route: "rapport/note27a",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note27A")),
  },
  {
    name: "NOTE 27B",
    route: "rapport/note27b",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note27B")),
  },
  {
    name: "NOTE 28",
    route: "rapport/note28",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note28")),
  },
  {
    name: "NOTE 29",
    route: "rapport/note29",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note29")),
  },
  {
    name: "NOTE 30",
    route: "rapport/note30",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note30")),
  },
  {
    name: "NOTE 31",
    route: "rapport/note31",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note31")),
  },
  {
    name: "NOTE 32",
    route: "rapport/note32",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note32")),
  },
  {
    name: "NOTE 33",
    route: "rapport/note33",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note33")),
  },
  {
    name: "NOTE 34",
    route: "rapport/note34",
    category: "Notes Standard",
    component: React.lazy(() => import("../rapport/Note34")),
  },

  // ── Documents Spéciaux ────────────────────────────────────────────────────
  {
    name: "FICHE R3",
    route: "rapport/ficher3",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/FicheR3")),
  },
  {
    name: "PAGE DE GARDE",
    route: "rapport/pagedegarde",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/PageDeGarde")),
  },
  {
    name: "SOMMAIRE",
    route: "rapport/sommaire",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/Sommaire")),
  },
  {
    name: "BILAN PAYSAGE",
    route: "rapport/bilanpaysage",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/BilanPaysage")),
  },
  {
    name: "COMPTE RESULTAT",
    route: "rapport/compteresultat",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/CompteResultat")),
  },
  {
    name: "TABLEAU FLUX TRESORERIE",
    route: "rapport/tableaufluxtresorerie",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/TableauFluxTresorerie")),
  },
  {
    name: "GRILLE ANALYSE NOTES",
    route: "rapport/grilleanalysenotes",
    category: "Documents Spéciaux",
    component: React.lazy(() => import("../rapport/GrilleAnalyseNotes")),
  },

  // ── Série C ───────────────────────────────────────────────────────────────
  {
    name: "C01 NOTE 3C",
    route: "rapport/c01note3c",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C01Note3C")),
  },
  {
    name: "C1 NOTE 17",
    route: "rapport/c1note17",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C1Note17")),
  },
  {
    name: "C1 NOTE 25",
    route: "rapport/c1note25",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C1Note25")),
  },
  {
    name: "C1 NOTE 27A",
    route: "rapport/c1note27a",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C1Note27A")),
  },
  {
    name: "C1 NOTE 28",
    route: "rapport/c1note28",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C1Note28")),
  },
  {
    name: "C2 NOTE 25",
    route: "rapport/c2note25",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C2Note25")),
  },
  {
    name: "C2 NOTE 28",
    route: "rapport/c2note28",
    category: "Série C",
    component: React.lazy(() => import("../rapport/C2Note28")),
  },

  // ── Série CF ──────────────────────────────────────────────────────────────
  {
    name: "CF1",
    route: "rapport/cf1",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF1")),
  },
  {
    name: "CF1 BIS",
    route: "rapport/cf1bis",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF1Bis")),
  },
  {
    name: "CF1 TER",
    route: "rapport/cf1ter",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF1Ter")),
  },
  {
    name: "CF1 QUATER",
    route: "rapport/cf1quater",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF1Quater")),
  },
  {
    name: "CF2",
    route: "rapport/cf2",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF2")),
  },
  {
    name: "CF2 BIS",
    route: "rapport/cf2bis",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF2Bis")),
  },
  {
    name: "CF2 TER",
    route: "rapport/cf2ter",
    category: "Série CF",
    component: React.lazy(() => import("../rapport/CF2Ter")),
  },

  // ── Assurance - Base ──────────────────────────────────────────────────────
  {
    name: "IMPOT 21",
    route: "rapport/impot21",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Impot21")),
  },
  {
    name: "IMPOT 22",
    route: "rapport/impot22",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Impot22")),
  },
  {
    name: "FICHE 1",
    route: "rapport/fiche1",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Fiche1")),
  },
  {
    name: "FICHE 2",
    route: "rapport/fiche2",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Fiche2")),
  },
  {
    name: "FICHE 3",
    route: "rapport/fiche3",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Fiche3")),
  },
  {
    name: "FICHE 4",
    route: "rapport/fiche4",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Fiche4")),
  },
  {
    name: "FICHE 5",
    route: "rapport/fiche5",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Fiche5")),
  },
  {
    name: "BILAN ACTIF",
    route: "rapport/bilanactif",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/BilanActif")),
  },
  {
    name: "BILAN PASSIF",
    route: "rapport/bilanpassif",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/BilanPassif")),
  },
  {
    name: "CHARGES",
    route: "rapport/charges",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Charges")),
  },
  {
    name: "PRODUITS",
    route: "rapport/produits",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Produits")),
  },
  {
    name: "COMPTE GENERAL PERTES PROFITS",
    route: "rapport/comptegeneralpertesprofits",
    category: "Assurance - Base",
    component: React.lazy(
      () => import("../rapport/Assurance/CompteGeneralPertesProfits"),
    ),
  },
  {
    name: "ETAT C4",
    route: "rapport/etatc4",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/EtatC4")),
  },
  {
    name: "ETAT C11",
    route: "rapport/etatc11",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/EtatC11")),
  },
  {
    name: "ETAT C11 VIE",
    route: "rapport/etatc11vie",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/EtatC11Vie")),
  },
  {
    name: "ANNEXE 6",
    route: "rapport/annexe6",
    category: "Assurance - Base",
    component: React.lazy(() => import("../rapport/Assurance/Annexe6")),
  },

  // ── Assurance - Série Ass ─────────────────────────────────────────────────
  {
    name: "ASS 1",
    route: "rapport/ass1",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass1")),
  },
  {
    name: "ASS 2",
    route: "rapport/ass2",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass2")),
  },
  {
    name: "ASS 3",
    route: "rapport/ass3",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass3")),
  },
  {
    name: "ASS 4",
    route: "rapport/ass4",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass4")),
  },
  {
    name: "ASS 5",
    route: "rapport/ass5",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass5")),
  },
  {
    name: "ASS 6",
    route: "rapport/ass6",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass6")),
  },
  {
    name: "ASS 7",
    route: "rapport/ass7",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass7")),
  },
  {
    name: "ASS 8",
    route: "rapport/ass8",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass8")),
  },
  {
    name: "ASS 9",
    route: "rapport/ass9",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass9")),
  },
  {
    name: "ASS 10",
    route: "rapport/ass10",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass10")),
  },
  {
    name: "ASS 11",
    route: "rapport/ass11",
    category: "Assurance - Série Ass",
    component: React.lazy(() => import("../rapport/Assurance/Ass11")),
  },

  // ── Assurance - Compléments ───────────────────────────────────────────────
  {
    name: "DECLARATION ANNUEL",
    route: "rapport/declarationannuel",
    category: "Assurance - Compléments",
    component: React.lazy(
      () => import("../rapport/Assurance/DeclarationAnnuel"),
    ),
  },
  {
    name: "SOMMES VERSE",
    route: "rapport/sommesverse",
    category: "Assurance - Compléments",
    component: React.lazy(() => import("../rapport/Assurance/SommesVerse")),
  },
  {
    name: "TVA",
    route: "rapport/tva",
    category: "Assurance - Compléments",
    component: React.lazy(() => import("../rapport/Assurance/TVA")),
  },
  {
    name: "VERSEMENTS",
    route: "rapport/versements",
    category: "Assurance - Compléments",
    component: React.lazy(() => import("../rapport/Assurance/Versements")),
  },

  // ── Assurance - Tableaux ──────────────────────────────────────────────────
  {
    name: "TABLEAU 30",
    route: "rapport/tableau30",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau30")),
  },
  {
    name: "TABLEAU 31",
    route: "rapport/tableau31",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau31")),
  },
  {
    name: "TABLEAU 32",
    route: "rapport/tableau32",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau32")),
  },
  {
    name: "TABLEAU 33",
    route: "rapport/tableau33",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau33")),
  },
  {
    name: "TABLEAU 34",
    route: "rapport/tableau34",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau34")),
  },
  {
    name: "TABLEAU 35A",
    route: "rapport/tableau35a",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau35A")),
  },
  {
    name: "TABLEAU 35B",
    route: "rapport/tableau35b",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau35B")),
  },
  {
    name: "TABLEAU 36",
    route: "rapport/tableau36",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau36")),
  },
  {
    name: "TABLEAU 37",
    route: "rapport/tableau37",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau37")),
  },
  {
    name: "TABLEAU 38",
    route: "rapport/tableau38",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau38")),
  },
  {
    name: "TABLEAU 39",
    route: "rapport/tableau39",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau39")),
  },
  {
    name: "TABLEAU 40",
    route: "rapport/tableau40",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau40")),
  },
  {
    name: "TABLEAU 41A",
    route: "rapport/tableau41a",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau41A")),
  },
  {
    name: "TABLEAU 41B",
    route: "rapport/tableau41b",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau41B")),
  },
  {
    name: "TABLEAU 42",
    route: "rapport/tableau42",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau42")),
  },
  {
    name: "TABLEAU 43A",
    route: "rapport/tableau43a",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau43A")),
  },
  {
    name: "TABLEAU 43B",
    route: "rapport/tableau43b",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau43B")),
  },
  {
    name: "TABLEAU 44A",
    route: "rapport/tableau44a",
    category: "Assurance - Tableaux",
    component: React.lazy(() => import("../rapport/Assurance/Tableau44A")),
  },

  // ── SMT ───────────────────────────────────────────────────────────────────
  {
    name: "GRILLE ANALYSE NOTES SMT",
    route: "rapport/smt/grilleanalysenotes",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/GrilleAnalyseNotes")),
  },
  {
    name: "MOD BILAN",
    route: "rapport/smt/modbilan",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/ModBilan")),
  },
  {
    name: "NOTE 1 SMT",
    route: "rapport/smt/note1smt",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/Note1Smt")),
  },
  {
    name: "NOTE 2 SMT",
    route: "rapport/smt/note2smt",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/Note2Smt")),
  },
  {
    name: "NOTE 3 SMT",
    route: "rapport/smt/note3smt",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/Note3Smt")),
  },
  {
    name: "NOTE 4 SMT",
    route: "rapport/smt/note4smt",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/Note4Smt")),
  },
  {
    name: "NOTE 5 SMT",
    route: "rapport/smt/note5smt",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/Note5Smt")),
  },
  {
    name: "NOTE 6 SMT",
    route: "rapport/smt/note6smt",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/Note6Smt")),
  },
  {
    name: "T1",
    route: "rapport/smt/t1",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T1")),
  },
  {
    name: "T1 BIS",
    route: "rapport/smt/t1bis",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T1Bis")),
  },
  {
    name: "T1 TER",
    route: "rapport/smt/t1ter",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T1Ter")),
  },
  {
    name: "T2",
    route: "rapport/smt/t2",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T2")),
  },
  {
    name: "T3",
    route: "rapport/smt/t3",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T3")),
  },
  {
    name: "T4",
    route: "rapport/smt/t4",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T4")),
  },
  {
    name: "T5",
    route: "rapport/smt/t5",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T5")),
  },
  {
    name: "T6",
    route: "rapport/smt/t6",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T6")),
  },
  {
    name: "T7",
    route: "rapport/smt/t7",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T7")),
  },
  {
    name: "T8",
    route: "rapport/smt/t8",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T8")),
  },
  {
    name: "T9",
    route: "rapport/smt/t9",
    category: "SMT",
    component: React.lazy(() => import("../rapport/SMT/T9")),
  },
];

// Build a lookup map for O(1) access by note name.
const REPORT_BY_NAME = new Map(
  ALL_REPORTS.map((r) => [r.name.toUpperCase(), r]),
);

// Build category map for quick lookup
export const REPORT_CATEGORIES = Object.fromEntries(
  ALL_REPORTS.reduce<[string, string[]][]>((acc, r) => {
    const existing = acc.find(([cat]) => cat === r.category);
    if (existing) {
      existing[1].push(r.name);
    } else {
      acc.push([r.category, [r.name]]);
    }
    return acc;
  }, []).map(([cat, names]) => [cat, names.sort()]),
);

// Build route map for quick lookup
export const NOTE_ROUTE_MAP = Object.fromEntries(
  ALL_REPORTS.map((r) => [r.name, r.route]),
);

// Get report by name (case-insensitive)
export const getReportByName = (name: string): ReportDefinition | undefined => {
  return REPORT_BY_NAME.get(name.toUpperCase());
};

// Get route for a note
export const getNoteRoute = (name: string): string | undefined => {
  return NOTE_ROUTE_MAP[name.toUpperCase()];
};

// Get all categories
export const getCategories = (): string[] => {
  return [...new Set(ALL_REPORTS.map((r) => r.category))];
};

// ---------------------------------------------------------------------------
// Spinner used while a lazy component loads
// ---------------------------------------------------------------------------

const ComponentSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

// ---------------------------------------------------------------------------
// AllReportsGrid
// ---------------------------------------------------------------------------

export const AllReportsGrid: React.FC<AllReportsGridProps> = ({
  folderId,
  onViewReport,
  noteName,
  data,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 64; // 8x8 grid

  // ── Preview mode: render a single report component ─────────────────────────
  if (noteName) {
    const def = REPORT_BY_NAME.get(noteName.toUpperCase());

    if (!def) {
      return (
        <p className="text-sm text-gray-500 py-8 text-center">
          Aucun composant trouvé pour « {noteName} ».
        </p>
      );
    }

    const { component: LazyComponent } = def;

    return (
      <Suspense fallback={<ComponentSpinner />}>
        <LazyComponent folderId={folderId} data={data} />
      </Suspense>
    );
  }

  // ── Browse mode: show categorised grid of all reports ─────────────────────

  const openReportInNewTab = (reportName: string) => {
    const routeMap: Record<string, string> = {
      "NOTE 1": "/rapport/note1",
      "NOTE 2": "/rapport/note2",
      "NOTE 3A": "/rapport/note3a",
      "NOTE 3B": "/rapport/note3b",
      "NOTE 3C": "/rapport/note3c",
      "C01 NOTE 3C": "/rapport/c01note3c",
      "NOTE 3D": "/rapport/note3d",
      "NOTE 3F": "/rapport/note3f",
      "NOTE 3 SMT": "/rapport/note3smt",
    };

    const route = routeMap[reportName];
    if (route) {
      window.open(`${route}?folderId=${folderId ?? ""}`, "_blank");
      return true;
    }
    return false;
  };

  const handleView = (report: ReportDefinition) => {
    if (openReportInNewTab(report.name)) return;
    onViewReport?.(report.name, report.component);
  };

  const handleEdit = (report: ReportDefinition) => {
    if (openReportInNewTab(report.name)) return;
    navigate(folderId ? `${report.route}?folderId=${folderId}` : report.route);
  };

  // Client-side filter applied when the user types in the search box.
  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_REPORTS;
    return ALL_REPORTS.filter((r) => r.name.toLowerCase().includes(q));
  }, [search]);

  // Pagination
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Group paginated reports by category, preserving insertion order.
  const grouped = useMemo(
    () =>
      paginatedReports.reduce<Record<string, ReportDefinition[]>>((acc, r) => {
        (acc[r.category] ??= []).push(r);
        return acc;
      }, {}),
    [paginatedReports],
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filtrer les rapports…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-gray-500 py-8 text-center">
          Aucun rapport trouvé pour « {search} ».
        </p>
      )}

      {Object.entries(grouped).map(([category, reports]) => (
        <div key={category} className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Filter className="h-4 w-4 mr-1 text-blue-600" />
            {category}
            <span className="ml-2 text-xs text-gray-500">
              ({reports.length})
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {reports.map((report) => (
              <div
                key={report.name}
                className="bg-white rounded border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col items-center text-center"
                onClick={() => handleView(report)}
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-xs font-medium text-gray-900 leading-tight mb-1">
                  {report.name.replace('NOTE ', '')}
                </div>
                <div className="text-xs text-gray-500">
                  Disponible
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} rapports
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReportsGrid;
