// components/reports/AllReportsGrid.tsx - Display ALL reports as cards
import React from "react";
import { FileText, Eye, Edit, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import ALL note components
import Note1 from "../rapport/Note1";
import Note2 from "../rapport/Note2";
import Note3A from "../rapport/Note3A";
import Note3B from "../rapport/Note3B";
import Note3C from "../rapport/Note3C";
import Note3D from "../rapport/Note3D";
import Note3F from "../rapport/Note3F";
import Note4 from "../rapport/Note4";
import Note5 from "../rapport/Note5";
import Note6 from "../rapport/Note6";
import Note7 from "../rapport/Note7";
import Note8 from "../rapport/Note8";
import Note9 from "../rapport/Note9";
import Note10 from "../rapport/Note10";
import Note11 from "../rapport/Note11";
import Note12 from "../rapport/Note12";
import Note13 from "../rapport/Note13";
import Note14 from "../rapport/Note14";
import Note15A from "../rapport/Note15A";
import Note15B from "../rapport/Note15B";
import Note16A from "../rapport/Note16A";
import Note16B from "../rapport/Note16B";
import Note16Bbis from "../rapport/Note16Bbis";
import Note16C from "../rapport/Note16C";
import Note17 from "../rapport/Note17";
import Note18 from "../rapport/Note18";
import Note19 from "../rapport/Note19";
import Note20 from "../rapport/Note20";
import Note21 from "../rapport/Note21";
import Note22 from "../rapport/Note22";
import Note23 from "../rapport/Note23";
import Note24 from "../rapport/Note24";
import Note25 from "../rapport/Note25";
import Note26 from "../rapport/Note26";
import Note27A from "../rapport/Note27A";
import Note27B from "../rapport/Note27B";
import Note28 from "../rapport/Note28";
import Note29 from "../rapport/Note29";
import Note30 from "../rapport/Note30";
import Note31 from "../rapport/Note31";
import Note32 from "../rapport/Note32";
import Note33 from "../rapport/Note33";
import Note34 from "../rapport/Note34";
import FicheR3 from "../rapport/FicheR3";
import C01Note3C from "../rapport/C01Note3C";
import C1Note17 from "../rapport/C1Note17";
import C1Note25 from "../rapport/C1Note25";
import C1Note27A from "../rapport/C1Note27A";
import C1Note28 from "../rapport/C1Note28";
import C2Note25 from "../rapport/C2Note25";
import C2Note28 from "../rapport/C2Note28";
import CF1 from "../rapport/CF1";
import CF1Bis from "../rapport/CF1Bis";
import CF1Quater from "../rapport/CF1Quater";
import CF1Ter from "../rapport/CF1Ter";
import CF2 from "../rapport/CF2";
import CF2Bis from "../rapport/CF2Bis";
import CF2Ter from "../rapport/CF2Ter";
import CompteResultat from "../rapport/CompteResultat";
import GrilleAnalyseNotes from "../rapport/GrilleAnalyseNotes";
import PageDeGarde from "../rapport/PageDeGarde";
import Sommaire from "../rapport/Sommaire";
import TableauFluxTresorerie from "../rapport/TableauFluxTresorerie";
import BilanPaysage from "../rapport/BilanPaysage";
import Impot21 from "../rapport/Assurance/Impot21";
import Impot22 from "../rapport/Assurance/Impot22";
import Fiche1 from "../rapport/Assurance/Fiche1";
import Fiche2 from "../rapport/Assurance/Fiche2";
import Fiche3 from "../rapport/Assurance/Fiche3";
import Fiche4 from "../rapport/Assurance/Fiche4";
import Fiche5 from "../rapport/Assurance/Fiche5";
import BilanActif from "../rapport/Assurance/BilanActif";
import BilanPassif from "../rapport/Assurance/BilanPassif";
import Charges from "../rapport/Assurance/Charges";
import CompteGeneralPertesProfits from "../rapport/Assurance/CompteGeneralPertesProfits";
import EtatC4 from "../rapport/Assurance/EtatC4";
import EtatC11 from "../rapport/Assurance/EtatC11";
import EtatC11Vie from "../rapport/Assurance/EtatC11Vie";
import Produits from "../rapport/Assurance/Produits";
import Ass1 from "../rapport/Assurance/Ass1";
import Ass2 from "../rapport/Assurance/Ass2";
import Ass3 from "../rapport/Assurance/Ass3";
import Ass4 from "../rapport/Assurance/Ass4";
import Ass5 from "../rapport/Assurance/Ass5";
import Ass6 from "../rapport/Assurance/Ass6";
import Ass7 from "../rapport/Assurance/Ass7";
import Ass8 from "../rapport/Assurance/Ass8";
import Ass9 from "../rapport/Assurance/Ass9";
import Ass10 from "../rapport/Assurance/Ass10";
import Ass11 from "../rapport/Assurance/Ass11";
import DeclarationAnnuel from "../rapport/Assurance/DeclarationAnnuel";
import SommesVerse from "../rapport/Assurance/SommesVerse";
import TVA from "../rapport/Assurance/TVA";
import Versements from "../rapport/Assurance/Versements";
import Tableau30 from "../rapport/Assurance/Tableau30";
import Tableau31 from "../rapport/Assurance/Tableau31";
import Tableau32 from "../rapport/Assurance/Tableau32";
import Tableau33 from "../rapport/Assurance/Tableau33";
import Tableau34 from "../rapport/Assurance/Tableau34";
import Tableau35A from "../rapport/Assurance/Tableau35A";
import Tableau35B from "../rapport/Assurance/Tableau35B";
import Tableau36 from "../rapport/Assurance/Tableau36";
import Tableau37 from "../rapport/Assurance/Tableau37";
import Tableau38 from "../rapport/Assurance/Tableau38";
import Tableau39 from "../rapport/Assurance/Tableau39";
import Tableau40 from "../rapport/Assurance/Tableau40";
import Tableau41A from "../rapport/Assurance/Tableau41A";
import Tableau41B from "../rapport/Assurance/Tableau41B";
import Tableau42 from "../rapport/Assurance/Tableau42";
import Tableau43A from "../rapport/Assurance/Tableau43A";
import Tableau43B from "../rapport/Assurance/Tableau43B";
import Tableau44A from "../rapport/Assurance/Tableau44A";
import Annexe6 from "../rapport/Assurance/Annexe6";
import GrilleAnalyseNotesSMT from "../rapport/SMT/GrilleAnalyseNotes";
import ModBilan from "../rapport/SMT/ModBilan";
import Note1Smt from "../rapport/SMT/Note1Smt";
import Note2Smt from "../rapport/SMT/Note2Smt";
import Note3Smt from "../rapport/SMT/Note3Smt";
import Note4Smt from "../rapport/SMT/Note4Smt";
import Note5Smt from "../rapport/SMT/Note5Smt";
import Note6Smt from "../rapport/SMT/Note6Smt";
import T1 from "../rapport/SMT/T1";
import T1Bis from "../rapport/SMT/T1Bis";
import T1Ter from "../rapport/SMT/T1Ter";
import T2 from "../rapport/SMT/T2";
import T3 from "../rapport/SMT/T3";
import T4 from "../rapport/SMT/T4";
import T5 from "../rapport/SMT/T5";
import T6 from "../rapport/SMT/T6";
import T7 from "../rapport/SMT/T7";
import T8 from "../rapport/SMT/T8";
import T9 from "../rapport/SMT/T9";

interface ReportCard {
  name: string;
  component: React.ComponentType<any>;
  route: string;
  category: string;
}

interface AllReportsGridProps {
  folderId?: string;
  onViewReport?: (
    reportName: string,
    component: React.ComponentType<any>,
  ) => void;
}

export const AllReportsGrid: React.FC<AllReportsGridProps> = ({
  folderId,
  onViewReport,
}) => {
  const navigate = useNavigate();

  // ALL REPORTS WITH THEIR INFO
  const allReports: ReportCard[] = [
    // Notes Standard
    {
      name: "NOTE 1",
      component: Note1,
      route: "/rapport/note1",
      category: "Notes Standard",
    },
    {
      name: "NOTE 2",
      component: Note2,
      route: "/rapport/note2",
      category: "Notes Standard",
    },
    {
      name: "NOTE 3A",
      component: Note3A,
      route: "/rapport/note3a",
      category: "Notes Standard",
    },
    {
      name: "NOTE 3B",
      component: Note3B,
      route: "/rapport/note3b",
      category: "Notes Standard",
    },
    {
      name: "NOTE 3C",
      component: Note3C,
      route: "/rapport/note3c",
      category: "Notes Standard",
    },
    {
      name: "NOTE 3D",
      component: Note3D,
      route: "/rapport/note3d",
      category: "Notes Standard",
    },
    {
      name: "NOTE 3F",
      component: Note3F,
      route: "/rapport/note3f",
      category: "Notes Standard",
    },
    {
      name: "NOTE 4",
      component: Note4,
      route: "/rapport/note4",
      category: "Notes Standard",
    },
    {
      name: "NOTE 5",
      component: Note5,
      route: "/rapport/note5",
      category: "Notes Standard",
    },
    {
      name: "NOTE 6",
      component: Note6,
      route: "/rapport/note6",
      category: "Notes Standard",
    },
    {
      name: "NOTE 7",
      component: Note7,
      route: "/rapport/note7",
      category: "Notes Standard",
    },
    {
      name: "NOTE 8",
      component: Note8,
      route: "/rapport/note8",
      category: "Notes Standard",
    },
    {
      name: "NOTE 9",
      component: Note9,
      route: "/rapport/note9",
      category: "Notes Standard",
    },
    {
      name: "NOTE 10",
      component: Note10,
      route: "/rapport/note10",
      category: "Notes Standard",
    },
    {
      name: "NOTE 11",
      component: Note11,
      route: "/rapport/note11",
      category: "Notes Standard",
    },
    {
      name: "NOTE 12",
      component: Note12,
      route: "/rapport/note12",
      category: "Notes Standard",
    },
    {
      name: "NOTE 13",
      component: Note13,
      route: "/rapport/note13",
      category: "Notes Standard",
    },
    {
      name: "NOTE 14",
      component: Note14,
      route: "/rapport/note14",
      category: "Notes Standard",
    },
    {
      name: "NOTE 15A",
      component: Note15A,
      route: "/rapport/note15a",
      category: "Notes Standard",
    },
    {
      name: "NOTE 15B",
      component: Note15B,
      route: "/rapport/note15b",
      category: "Notes Standard",
    },
    {
      name: "NOTE 16A",
      component: Note16A,
      route: "/rapport/note16a",
      category: "Notes Standard",
    },
    {
      name: "NOTE 16B",
      component: Note16B,
      route: "/rapport/note16b",
      category: "Notes Standard",
    },
    {
      name: "NOTE 16B BIS",
      component: Note16Bbis,
      route: "/rapport/note16bbis",
      category: "Notes Standard",
    },
    {
      name: "NOTE 16C",
      component: Note16C,
      route: "/rapport/note16c",
      category: "Notes Standard",
    },
    {
      name: "NOTE 17",
      component: Note17,
      route: "/rapport/note17",
      category: "Notes Standard",
    },
    {
      name: "NOTE 18",
      component: Note18,
      route: "/rapport/note18",
      category: "Notes Standard",
    },
    {
      name: "NOTE 19",
      component: Note19,
      route: "/rapport/note19",
      category: "Notes Standard",
    },
    {
      name: "NOTE 20",
      component: Note20,
      route: "/rapport/note20",
      category: "Notes Standard",
    },
    {
      name: "NOTE 21",
      component: Note21,
      route: "/rapport/note21",
      category: "Notes Standard",
    },
    {
      name: "NOTE 22",
      component: Note22,
      route: "/rapport/note22",
      category: "Notes Standard",
    },
    {
      name: "NOTE 23",
      component: Note23,
      route: "/rapport/note23",
      category: "Notes Standard",
    },
    {
      name: "NOTE 24",
      component: Note24,
      route: "/rapport/note24",
      category: "Notes Standard",
    },
    {
      name: "NOTE 25",
      component: Note25,
      route: "/rapport/note25",
      category: "Notes Standard",
    },
    {
      name: "NOTE 26",
      component: Note26,
      route: "/rapport/note26",
      category: "Notes Standard",
    },
    {
      name: "NOTE 27A",
      component: Note27A,
      route: "/rapport/note27a",
      category: "Notes Standard",
    },
    {
      name: "NOTE 27B",
      component: Note27B,
      route: "/rapport/note27b",
      category: "Notes Standard",
    },
    {
      name: "NOTE 28",
      component: Note28,
      route: "/rapport/note28",
      category: "Notes Standard",
    },
    {
      name: "NOTE 29",
      component: Note29,
      route: "/rapport/note29",
      category: "Notes Standard",
    },
    {
      name: "NOTE 30",
      component: Note30,
      route: "/rapport/note30",
      category: "Notes Standard",
    },
    {
      name: "NOTE 31",
      component: Note31,
      route: "/rapport/note31",
      category: "Notes Standard",
    },
    {
      name: "NOTE 32",
      component: Note32,
      route: "/rapport/note32",
      category: "Notes Standard",
    },
    {
      name: "NOTE 33",
      component: Note33,
      route: "/rapport/note33",
      category: "Notes Standard",
    },
    {
      name: "NOTE 34",
      component: Note34,
      route: "/rapport/note34",
      category: "Notes Standard",
    },

    // Documents Spéciaux
    {
      name: "FICHE R3",
      component: FicheR3,
      route: "/rapport/ficher3",
      category: "Documents Spéciaux",
    },
    {
      name: "PAGE DE GARDE",
      component: PageDeGarde,
      route: "/rapport/pagedegrade",
      category: "Documents Spéciaux",
    },
    {
      name: "SOMMAIRE",
      component: Sommaire,
      route: "/rapport/sommaire",
      category: "Documents Spéciaux",
    },
    {
      name: "BILAN PAYSAGE",
      component: BilanPaysage,
      route: "/rapport/bilanpaysage",
      category: "Documents Spéciaux",
    },
    {
      name: "COMPTE RESULTAT",
      component: CompteResultat,
      route: "/rapport/compteresultat",
      category: "Documents Spéciaux",
    },
    {
      name: "TABLEAU FLUX TRESORERIE",
      component: TableauFluxTresorerie,
      route: "/rapport/tableaufluxtre",
      category: "Documents Spéciaux",
    },
    {
      name: "GRILLE ANALYSE NOTES",
      component: GrilleAnalyseNotes,
      route: "/rapport/grilleanalysenotes",
      category: "Documents Spéciaux",
    },

    // Série C
    {
      name: "C01 NOTE 3C",
      component: C01Note3C,
      route: "/rapport/c01note3c",
      category: "Série C",
    },
    {
      name: "C1 NOTE 17",
      component: C1Note17,
      route: "/rapport/c1note17",
      category: "Série C",
    },
    {
      name: "C1 NOTE 25",
      component: C1Note25,
      route: "/rapport/c1note25",
      category: "Série C",
    },
    {
      name: "C1 NOTE 27A",
      component: C1Note27A,
      route: "/rapport/c1note27a",
      category: "Série C",
    },
    {
      name: "C1 NOTE 28",
      component: C1Note28,
      route: "/rapport/c1note28",
      category: "Série C",
    },
    {
      name: "C2 NOTE 25",
      component: C2Note25,
      route: "/rapport/c2note25",
      category: "Série C",
    },
    {
      name: "C2 NOTE 28",
      component: C2Note28,
      route: "/rapport/c2note28",
      category: "Série C",
    },

    // Série CF
    {
      name: "CF1",
      component: CF1,
      route: "/rapport/cf1",
      category: "Série CF",
    },
    {
      name: "CF1 BIS",
      component: CF1Bis,
      route: "/rapport/cf1bis",
      category: "Série CF",
    },
    {
      name: "CF1 TER",
      component: CF1Ter,
      route: "/rapport/cf1ter",
      category: "Série CF",
    },
    {
      name: "CF1 QUATER",
      component: CF1Quater,
      route: "/rapport/cf1quater",
      category: "Série CF",
    },
    {
      name: "CF2",
      component: CF2,
      route: "/rapport/cf2",
      category: "Série CF",
    },
    {
      name: "CF2 BIS",
      component: CF2Bis,
      route: "/rapport/cf2bis",
      category: "Série CF",
    },
    {
      name: "CF2 TER",
      component: CF2Ter,
      route: "/rapport/cf2ter",
      category: "Série CF",
    },

    // Assurance - Base
    {
      name: "IMPOT 21",
      component: Impot21,
      route: "/rapport/assurance/impot21",
      category: "Assurance - Base",
    },
    {
      name: "IMPOT 22",
      component: Impot22,
      route: "/rapport/assurance/impot22",
      category: "Assurance - Base",
    },
    {
      name: "FICHE 1",
      component: Fiche1,
      route: "/rapport/assurance/fiche1",
      category: "Assurance - Base",
    },
    {
      name: "FICHE 2",
      component: Fiche2,
      route: "/rapport/assurance/fiche2",
      category: "Assurance - Base",
    },
    {
      name: "FICHE 3",
      component: Fiche3,
      route: "/rapport/assurance/fiche3",
      category: "Assurance - Base",
    },
    {
      name: "FICHE 4",
      component: Fiche4,
      route: "/rapport/assurance/fiche4",
      category: "Assurance - Base",
    },
    {
      name: "FICHE 5",
      component: Fiche5,
      route: "/rapport/assurance/fiche5",
      category: "Assurance - Base",
    },
    {
      name: "BILAN ACTIF",
      component: BilanActif,
      route: "/rapport/assurance/bilanactif",
      category: "Assurance - Base",
    },
    {
      name: "BILAN PASSIF",
      component: BilanPassif,
      route: "/rapport/assurance/bilanpassif",
      category: "Assurance - Base",
    },
    {
      name: "CHARGES",
      component: Charges,
      route: "/rapport/assurance/charges",
      category: "Assurance - Base",
    },
    {
      name: "PRODUITS",
      component: Produits,
      route: "/rapport/assurance/produits",
      category: "Assurance - Base",
    },
    {
      name: "COMPTE GENERAL PERTES PROFITS",
      component: CompteGeneralPertesProfits,
      route: "/rapport/assurance/comptegeneralperte",
      category: "Assurance - Base",
    },
    {
      name: "ETAT C4",
      component: EtatC4,
      route: "/rapport/assurance/etatc4",
      category: "Assurance - Base",
    },
    {
      name: "ETAT C11",
      component: EtatC11,
      route: "/rapport/assurance/etatc11",
      category: "Assurance - Base",
    },
    {
      name: "ETAT C11 VIE",
      component: EtatC11Vie,
      route: "/rapport/assurance/etatc11vie",
      category: "Assurance - Base",
    },
    {
      name: "ANNEXE 6",
      component: Annexe6,
      route: "/rapport/assurance/annexe6",
      category: "Assurance - Base",
    },

    // Assurance - Série Ass
    {
      name: "ASS 1",
      component: Ass1,
      route: "/rapport/assurance/ass1",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 2",
      component: Ass2,
      route: "/rapport/assurance/ass2",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 3",
      component: Ass3,
      route: "/rapport/assurance/ass3",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 4",
      component: Ass4,
      route: "/rapport/assurance/ass4",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 5",
      component: Ass5,
      route: "/rapport/assurance/ass5",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 6",
      component: Ass6,
      route: "/rapport/assurance/ass6",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 7",
      component: Ass7,
      route: "/rapport/assurance/ass7",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 8",
      component: Ass8,
      route: "/rapport/assurance/ass8",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 9",
      component: Ass9,
      route: "/rapport/assurance/ass9",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 10",
      component: Ass10,
      route: "/rapport/assurance/ass10",
      category: "Assurance - Série Ass",
    },
    {
      name: "ASS 11",
      component: Ass11,
      route: "/rapport/assurance/ass11",
      category: "Assurance - Série Ass",
    },

    // Assurance - Compléments
    {
      name: "DECLARATION ANNUEL",
      component: DeclarationAnnuel,
      route: "/rapport/assurance/declarationannuel",
      category: "Assurance - Compléments",
    },
    {
      name: "SOMMES VERSE",
      component: SommesVerse,
      route: "/rapport/assurance/sommesverse",
      category: "Assurance - Compléments",
    },
    {
      name: "TVA",
      component: TVA,
      route: "/rapport/assurance/tva",
      category: "Assurance - Compléments",
    },
    {
      name: "VERSEMENTS",
      component: Versements,
      route: "/rapport/assurance/versements",
      category: "Assurance - Compléments",
    },

    // Assurance - Tableaux
    {
      name: "TABLEAU 30",
      component: Tableau30,
      route: "/rapport/assurance/tableau30",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 31",
      component: Tableau31,
      route: "/rapport/assurance/tableau31",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 32",
      component: Tableau32,
      route: "/rapport/assurance/tableau32",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 33",
      component: Tableau33,
      route: "/rapport/assurance/tableau33",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 34",
      component: Tableau34,
      route: "/rapport/assurance/tableau34",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 35A",
      component: Tableau35A,
      route: "/rapport/assurance/tableau35a",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 35B",
      component: Tableau35B,
      route: "/rapport/assurance/tableau35b",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 36",
      component: Tableau36,
      route: "/rapport/assurance/tableau36",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 37",
      component: Tableau37,
      route: "/rapport/assurance/tableau37",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 38",
      component: Tableau38,
      route: "/rapport/assurance/tableau38",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 39",
      component: Tableau39,
      route: "/rapport/assurance/tableau39",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 40",
      component: Tableau40,
      route: "/rapport/assurance/tableau40",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 41A",
      component: Tableau41A,
      route: "/rapport/assurance/tableau41a",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 41B",
      component: Tableau41B,
      route: "/rapport/assurance/tableau41b",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 42",
      component: Tableau42,
      route: "/rapport/assurance/tableau42",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 43A",
      component: Tableau43A,
      route: "/rapport/assurance/tableau43a",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 43B",
      component: Tableau43B,
      route: "/rapport/assurance/tableau43b",
      category: "Assurance - Tableaux",
    },
    {
      name: "TABLEAU 44A",
      component: Tableau44A,
      route: "/rapport/assurance/tableau44a",
      category: "Assurance - Tableaux",
    },

    // SMT
    {
      name: "GRILLE ANALYSE NOTES SMT",
      component: GrilleAnalyseNotesSMT,
      route: "/rapport/smt/grilleanalysenotes",
      category: "SMT",
    },
    {
      name: "MOD BILAN",
      component: ModBilan,
      route: "/rapport/smt/modbilan",
      category: "SMT",
    },
    {
      name: "NOTE 1 SMT",
      component: Note1Smt,
      route: "/rapport/smt/note1smt",
      category: "SMT",
    },
    {
      name: "NOTE 2 SMT",
      component: Note2Smt,
      route: "/rapport/smt/note2smt",
      category: "SMT",
    },
    {
      name: "NOTE 3 SMT",
      component: Note3Smt,
      route: "/rapport/smt/note3smt",
      category: "SMT",
    },
    {
      name: "NOTE 4 SMT",
      component: Note4Smt,
      route: "/rapport/smt/note4smt",
      category: "SMT",
    },
    {
      name: "NOTE 5 SMT",
      component: Note5Smt,
      route: "/rapport/smt/note5smt",
      category: "SMT",
    },
    {
      name: "NOTE 6 SMT",
      component: Note6Smt,
      route: "/rapport/smt/note6smt",
      category: "SMT",
    },
    { name: "T1", component: T1, route: "/rapport/smt/t1", category: "SMT" },
    {
      name: "T1 BIS",
      component: T1Bis,
      route: "/rapport/smt/t1bis",
      category: "SMT",
    },
    {
      name: "T1 TER",
      component: T1Ter,
      route: "/rapport/smt/t1ter",
      category: "SMT",
    },
    { name: "T2", component: T2, route: "/rapport/smt/t2", category: "SMT" },
    { name: "T3", component: T3, route: "/rapport/smt/t3", category: "SMT" },
    { name: "T4", component: T4, route: "/rapport/smt/t4", category: "SMT" },
    { name: "T5", component: T5, route: "/rapport/smt/t5", category: "SMT" },
    { name: "T6", component: T6, route: "/rapport/smt/t6", category: "SMT" },
    { name: "T7", component: T7, route: "/rapport/smt/t7", category: "SMT" },
    { name: "T8", component: T8, route: "/rapport/smt/t8", category: "SMT" },
    { name: "T9", component: T9, route: "/rapport/smt/t9", category: "SMT" },
  ];

  // Group by category
  const groupedReports = allReports.reduce(
    (acc, report) => {
      if (!acc[report.category]) {
        acc[report.category] = [];
      }
      acc[report.category].push(report);
      return acc;
    },
    {} as Record<string, ReportCard[]>,
  );

  const handleView = (report: ReportCard) => {
    if (onViewReport) {
      onViewReport(report.name, report.component);
    }
  };

  const handleEdit = (report: ReportCard) => {
    if (folderId) {
      navigate(`${report.route}?folderId=${folderId}`);
    } else {
      navigate(report.route);
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedReports).map(([category, reports]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            {category}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({reports.length})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.map((report) => (
              <div
                key={report.name}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {report.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800">
                      Disponible
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Rapport comptable disponible
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(report)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </button>
                    <button
                      onClick={() => handleEdit(report)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Éditer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllReportsGrid;
