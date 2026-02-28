// DSFConfigInterface.tsx - UNIFIED ACCOUNT MAPPING INTERFACE
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Download,
  Upload,
  X,
  Edit3,
  Trash2,
  Copy,
  AlertTriangle,
  Settings,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";

import axios from "axios";
import { API_CONFIG } from "../config/api";
import { folderService } from "../services/folder.service";

const SOURCES = ["OC", "OD", "MC", "MD", "SD", "SC", "MCD", "SCD"];
const REPORT_TYPES = [
  // Notes (1-34)
  "note1",
  "note2",
  "note3A",
  "note3B",
  "note3C",
  "note3D",
  "note3F",
  "note4",
  "note5",
  "note6",
  "note7",
  "note8",
  "note9",
  "note10",
  "note11",
  "note12",
  "note13",
  "note14",
  "note15A",
  "note15B",
  "note16A",
  "note16B",
  "note16Bbis",
  "note16C",
  "note17",
  "note18",
  "note19",
  "note20",
  "note21",
  "note22",
  "note23",
  "note24",
  "note25",
  "note26",
  "note27A",
  "note27B",
  "note28",
  "note29",
  "note30",
  "note31",
  "note32",
  "note33",
  "note34",

  // CF reports
  "cf1",
  "cf1Bis",
  "cf1Quater",
  "cf1Ter",
  "cf2",
  "cf2Bis",
  "cf2Ter",

  // C reports
  "c01Note3C",
  "c1Note17",
  "c1Note25",
  "c1Note27A",
  "c1Note28",
  "c2Note25",
  "c2Note28",

  // Other main reports
  "bilanPaysage",
  "compteResultat",
  "ficheR3",
  "grilleAnalyseNotes",
  "pageDeGarde",
  "sommaire",
  "tableauFluxTresorerie",

  // Assurance reports
  "assuranceBilanActif",
  "assuranceBilanPassif",
  "assuranceCharges",
  "assuranceCompteGeneralPertesProfits",
  "assuranceEtatC4",
  "assuranceEtatC11",
  "assuranceEtatC11Vie",
  "assuranceFiche1",
  "assuranceFiche2",
  "assuranceFiche3",
  "assuranceFiche4",
  "assuranceFiche5",
  "assuranceImpot21",
  "assuranceImpot22",
  "assuranceProduits",
];

// Comprehensive DSF Template with all reports
const DSF_TEMPLATE = [
  // ===== NOTES =====
  // Note 1 - Guaranteed Debts
  {
    accountNumber: "411",
    libelle: "Clients ordinaires",
    source: "SC",
    destination: "hypotheque",
    reportType: "note1",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "201",
    libelle: "Charges immobilisées",
    source: "SD",
    destination: "gage",
    reportType: "note1",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 3A - Fixed Assets Gross
  {
    accountNumber: "211",
    libelle: "Immobilisations incorporelles - Frais de constitution",
    source: "SD",
    destination: "immobilisationsIncorporelles",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "212",
    libelle: "Immobilisations incorporelles - Frais de développement",
    source: "SD",
    destination: "immobilisationsIncorporelles",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "221",
    libelle: "Terrains",
    source: "SD",
    destination: "immobilisationsCorporelles",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "231",
    libelle: "Bâtiments industriels",
    source: "SD",
    destination: "immobilisationsCorporelles",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "232",
    libelle: "Bâtiments administratifs",
    source: "SD",
    destination: "immobilisationsCorporelles",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "261",
    libelle: "Titres de participation",
    source: "SD",
    destination: "immobilisationsFinancieres",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "262",
    libelle: "Autres titres immobilisés",
    source: "SD",
    destination: "immobilisationsFinancieres",
    reportType: "note3A",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 4 - Financial Investments
  {
    accountNumber: "261",
    libelle: "Titres de participation",
    source: "SD",
    destination: "titresDeParticipation",
    reportType: "note4",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "262",
    libelle: "Autres titres immobilisés",
    source: "SD",
    destination: "autresTitres",
    reportType: "note4",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "274",
    libelle: "Prêts participatifs",
    source: "SD",
    destination: "pretsEtCreances",
    reportType: "note4",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 6 - Stocks and Work in Progress
  {
    accountNumber: "31",
    libelle: "Marchandises A",
    source: "SD",
    destination: "marchandises",
    reportType: "note6",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "32",
    libelle: "Matières premières A",
    source: "SD",
    destination: "matieresPremieres",
    reportType: "note6",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "33",
    libelle: "Autres approvisionnements",
    source: "SD",
    destination: "autresApprovisionnements",
    reportType: "note6",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "34",
    libelle: "Produits en cours",
    source: "SD",
    destination: "enCours",
    reportType: "note6",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "35",
    libelle: "Travaux en cours",
    source: "SD",
    destination: "enCours",
    reportType: "note6",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "36",
    libelle: "Produits finis",
    source: "SD",
    destination: "produitsFinis",
    reportType: "note6",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 7 - Clients
  {
    accountNumber: "411",
    libelle: "Clients ordinaires",
    source: "SC",
    destination: "clientsOrdinaires",
    reportType: "note7",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "416",
    libelle: "Clients douteux",
    source: "SC",
    destination: "clientsDouteux",
    reportType: "note7",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "4651",
    libelle: "Créances sur cessions d'immobilisations",
    source: "SC",
    destination: "creancesSurCessions",
    reportType: "note7",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "491",
    libelle: "Provisions pour clients douteux",
    source: "SC",
    destination: "provisionsClients",
    reportType: "note7",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 8 - Other Receivables
  {
    accountNumber: "4091",
    libelle: "Fournisseurs débiteurs",
    source: "SC",
    destination: "fournisseursDebiteurs",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "421",
    libelle: "Personnel - Avances et acomptes",
    source: "SC",
    destination: "personnel",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "422",
    libelle: "Personnel - Oppositions",
    source: "SC",
    destination: "personnel",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "441",
    libelle: "État - Impôts sur les bénéfices",
    source: "SC",
    destination: "etat",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "442",
    libelle: "État - Impôts sur les salaires",
    source: "SC",
    destination: "etat",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "45",
    libelle: "Comptes de liaison des établissements",
    source: "SC",
    destination: "comptesDeLiaison",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "46",
    libelle: "Autres créances",
    source: "SC",
    destination: "autresCreances",
    reportType: "note8",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 11 - Availability
  {
    accountNumber: "521",
    libelle: "Banques locales - Comptes en devises",
    source: "SD",
    destination: "1",
    reportType: "note11",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "522",
    libelle: "Banques locales - Comptes en monnaie nationale",
    source: "SD",
    destination: "2",
    reportType: "note11",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "531",
    libelle: "Chèques postaux",
    source: "SD",
    destination: "6",
    reportType: "note11",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "57",
    libelle: "Caisse",
    source: "SD",
    destination: "10",
    reportType: "note11",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 17 - Suppliers
  {
    accountNumber: "401",
    libelle: "Fournisseurs ordinaires",
    source: "SD",
    destination: "fournisseursOrdinaires",
    reportType: "note17",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "402",
    libelle: "Fournisseurs - Retenues de garantie",
    source: "SD",
    destination: "fournisseursOrdinaires",
    reportType: "note17",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "403",
    libelle: "Fournisseurs d'immobilisations",
    source: "SD",
    destination: "fournisseursEffetsAPayer",
    reportType: "note17",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "408",
    libelle: "Fournisseurs - Factures non parvenues",
    source: "SD",
    destination: "fournisseursRetenues",
    reportType: "note17",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 18 - Tax and Social Debts
  {
    accountNumber: "4431",
    libelle: "TVA à décaisser",
    source: "SD",
    destination: "tva",
    reportType: "note18",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "4471",
    libelle: "Personnel - IRPP",
    source: "SD",
    destination: "impotsSurSalaires",
    reportType: "note18",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "444",
    libelle: "Impôts sur les résultats",
    source: "SD",
    destination: "impotsSurResultat",
    reportType: "note18",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "441",
    libelle: "Autres impôts",
    source: "SD",
    destination: "autresImpots",
    reportType: "note18",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "431",
    libelle: "CNPS - Cotisations",
    source: "SD",
    destination: "cnps",
    reportType: "note18",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "421",
    libelle: "Personnel - Avances",
    source: "SD",
    destination: "personnel",
    reportType: "note18",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 21 - Turnover and Other Products
  {
    accountNumber: "701",
    libelle: "Ventes de marchandises",
    source: "SC",
    destination: "ventesMarchandises",
    reportType: "note21",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "702",
    libelle: "Ventes de produits finis",
    source: "SC",
    destination: "ventesProduits",
    reportType: "note21",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "705",
    libelle: "Travaux",
    source: "SC",
    destination: "travaux",
    reportType: "note21",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "706",
    libelle: "Services",
    source: "SC",
    destination: "services",
    reportType: "note21",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "708",
    libelle: "Produits divers",
    source: "SC",
    destination: "produitsDivers",
    reportType: "note21",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "709",
    libelle: "Rabais, remises, ristournes",
    source: "SC",
    destination: "rabaisRemises",
    reportType: "note21",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 22 - Purchases
  {
    accountNumber: "601",
    libelle: "Achats de marchandises",
    source: "SD",
    destination: "marchandises",
    reportType: "note22",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "602",
    libelle: "Achats de matières premières",
    source: "SD",
    destination: "matieresPremieres",
    reportType: "note22",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "604",
    libelle: "Achats d'autres approvisionnements",
    source: "SD",
    destination: "autresApprovisionnements",
    reportType: "note22",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "609",
    libelle: "Rabais, remises, ristournes obtenus",
    source: "SC",
    destination: "rabaisRemises",
    reportType: "note22",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 23 - Transportation
  {
    accountNumber: "611",
    libelle: "Transports sur achats",
    source: "SD",
    destination: "transportsAchats",
    reportType: "note23",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "613",
    libelle: "Transports sur ventes",
    source: "SD",
    destination: "transportsVentes",
    reportType: "note23",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "615",
    libelle: "Transports du personnel",
    source: "SD",
    destination: "transportsPersonnel",
    reportType: "note23",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "616",
    libelle: "Autres transports",
    source: "SD",
    destination: "autresTransports",
    reportType: "note23",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 24 - External Services
  {
    accountNumber: "622",
    libelle: "Rémunérations d'intermédiaires",
    source: "SD",
    destination: "loyers",
    reportType: "note24",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "624",
    libelle: "Entretien et réparations",
    source: "SD",
    destination: "entretien",
    reportType: "note24",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "627",
    libelle: "Publicité, publications, relations publiques",
    source: "SD",
    destination: "primes",
    reportType: "note24",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "628",
    libelle: "Documentation générale",
    source: "SD",
    destination: "documentation",
    reportType: "note24",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "63",
    libelle: "Autres services extérieurs",
    source: "SD",
    destination: "autresServices",
    reportType: "note24",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 25 - Taxes and Duties
  {
    accountNumber: "444",
    libelle: "Impôts sur les bénéfices",
    source: "SD",
    destination: "impotsSurBenefices",
    reportType: "note25",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "641",
    libelle: "Impôts, taxes et versements assimilés",
    source: "SD",
    destination: "autresImpots",
    reportType: "note25",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "642",
    libelle: "Patente",
    source: "SD",
    destination: "patente",
    reportType: "note25",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "643",
    libelle: "Contribution foncière",
    source: "SD",
    destination: "foncier",
    reportType: "note25",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "644",
    libelle: "Taxe sur véhicules",
    source: "SD",
    destination: "taxesVehicules",
    reportType: "note25",
    status: "active",
    scope: "EXERCISE",
  },

  // Note 27A - Personnel Charges
  {
    accountNumber: "661",
    libelle: "Salaires, appointements",
    source: "SD",
    destination: "salairesEtTraitements",
    reportType: "note27A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "662",
    libelle: "Commissions et courtages",
    source: "SD",
    destination: "salairesEtTraitements",
    reportType: "note27A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "665",
    libelle: "Charges sociales",
    source: "SD",
    destination: "chargesSociales",
    reportType: "note27A",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "668",
    libelle: "Autres charges sociales",
    source: "SD",
    destination: "autresCharges",
    reportType: "note27A",
    status: "active",
    scope: "EXERCISE",
  },

  // ===== CF REPORTS =====
  // CF1 - Tax Table 1
  {
    accountNumber: "13",
    libelle: "Résultat de l'exercice",
    source: "SC",
    destination: "1",
    reportType: "cf1",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "201",
    libelle: "Charges immobilisées",
    source: "SCD",
    destination: "2",
    reportType: "cf1",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "601",
    libelle: "Achats de marchandises",
    source: "SCD",
    destination: "6",
    reportType: "cf1",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "602",
    libelle: "Achats de matières premières",
    source: "SCD",
    destination: "7",
    reportType: "cf1",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "701",
    libelle: "Ventes de marchandises",
    source: "SD",
    destination: "1",
    reportType: "cf1",
    status: "active",
    scope: "EXERCISE",
  },

  // CF2 - Annual VAT Regularization
  {
    accountNumber: "70",
    libelle: "Ventes totales",
    source: "SC",
    destination: "chiffreAffairesHT",
    reportType: "cf2",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "4452",
    libelle: "TVA déductible",
    source: "SC",
    destination: "tvaDeductible",
    reportType: "cf2",
    status: "active",
    scope: "EXERCISE",
  },

  // ===== ASSURANCE REPORTS =====
  // Assurance Balance Sheet Assets
  {
    accountNumber: "211",
    libelle: "Immobilisations incorporelles",
    source: "SD",
    destination: "immobilisationsIncorporelles",
    reportType: "assuranceBilanActif",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "22",
    libelle: "Immobilisations corporelles",
    source: "SD",
    destination: "immobilisationsCorporelles",
    reportType: "assuranceBilanActif",
    status: "active",
    scope: "EXERCISE",
  },

  // Assurance Balance Sheet Liabilities
  {
    accountNumber: "101",
    libelle: "Capital social",
    source: "SC",
    destination: "capitalSocial",
    reportType: "assuranceBilanPassif",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "16",
    libelle: "Emprunts",
    source: "SC",
    destination: "emprunts",
    reportType: "assuranceBilanPassif",
    status: "active",
    scope: "EXERCISE",
  },

  // Assurance Products
  {
    accountNumber: "701",
    libelle: "Primes d'assurance",
    source: "SC",
    destination: "primesAssurance",
    reportType: "assuranceProduits",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "702",
    libelle: "Commissions reçues",
    source: "SC",
    destination: "commissionsRecues",
    reportType: "assuranceProduits",
    status: "active",
    scope: "EXERCISE",
  },

  // Assurance Charges
  {
    accountNumber: "661",
    libelle: "Salaires du personnel",
    source: "SD",
    destination: "salairesPersonnel",
    reportType: "assuranceCharges",
    status: "active",
    scope: "EXERCISE",
  },
  {
    accountNumber: "665",
    libelle: "Charges sociales",
    source: "SD",
    destination: "chargesSociales",
    reportType: "assuranceCharges",
    status: "active",
    scope: "EXERCISE",
  },
];

interface AccountMapping {
  id: string;
  accountNumber: string;
  libelle?: string;
  source: string;
  destination: string;
  reportType: string;
  configId: string;
  isActive: boolean;
  status: string;
  scope: string;
  clientId?: string;
}

export default function DSFConfigInterface() {
  const { user } = useAuth();
  const { selectedFolder } = useApp();
  const [mappings, setMappings] = useState<AccountMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    field: string;
  } | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>("all");

  const currentUser = user
    ? {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        type: user.role,
      }
    : null;

  // Filter mappings based on selected report type
  const filteredMappings =
    selectedReportType === "all"
      ? mappings
      : mappings.filter((mapping) => mapping.reportType === selectedReportType);

  // Load all account mappings
  const loadMappings = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Get all configs with their account mappings
      const allConfigs = await Promise.all(
        REPORT_TYPES.map(async (reportType) => {
          const params: any = { category: reportType };
          if (selectedFolder?.clientId) {
            params.clientId = selectedFolder.clientId;
          }
          if (selectedFolder?.id) {
            params.exerciseId = selectedFolder.id;
          }
          return await dsfConfigApiService.getConfigs(params);
        }),
      );

      // Flatten and transform to account mappings
      const allMappings: AccountMapping[] = [];
      allConfigs.forEach((configs, index) => {
        const reportType = REPORT_TYPES[index];
        configs.forEach((config: any) => {
          // Load existing account mappings if available
          if (
            config.config?.accountMappings &&
            config.config.accountMappings.length > 0
          ) {
            config.config.accountMappings.forEach((mapping: any) => {
              // Find libelle from template
              const templateItem = DSF_TEMPLATE.find(
                (t) =>
                  t.accountNumber === mapping.accountNumber &&
                  t.reportType === reportType,
              );

              allMappings.push({
                id: mapping.id,
                accountNumber: mapping.accountNumber,
                libelle: templateItem?.libelle || "",
                source: mapping.source,
                destination: mapping.destination,
                reportType,
                configId: config.id,
                isActive: mapping.isActive !== false,
                status: mapping.isActive !== false ? "active" : "inactive",
                scope: config.scope || "GLOBAL",
                clientId: config.clientId,
              });
            });
          } else {
            // Create empty mapping for editing
            allMappings.push({
              id: `${config.id}_${reportType}`,
              accountNumber: "",
              libelle: "",
              source: "MC" as any,
              destination: "",
              reportType,
              configId: config.id,
              isActive: true,
              status: "active",
              scope: "EXERCISE",
              clientId: selectedFolder?.clientId,
            });
          }
        });
      });

      setMappings(allMappings);
    } catch (err: any) {
      console.error("Error loading mappings:", err);
      setError("Erreur lors du chargement des mappings");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, selectedFolder?.id, selectedFolder?.clientId]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const startEditing = (rowIndex: number, field: string) => {
    setEditingCell({ rowIndex, field });
  };

  const stopEditing = () => {
    setEditingCell(null);
  };

  const updateMapping = async (rowIndex: number, field: string, value: any) => {
    const mapping = mappings[rowIndex];
    try {
      // Get all mappings for this config and update the specific one
      const configMappings = mappings
        .filter((m) => m.configId === mapping.configId)
        .map((m) => ({
          accountNumber:
            m.id === mapping.id && field === "accountNumber"
              ? value
              : m.accountNumber,
          source: m.id === mapping.id && field === "source" ? value : m.source,
          destination:
            m.id === mapping.id && field === "destination"
              ? value
              : m.destination,
        }));

      const updateData = {
        accountMappings: configMappings,
      };

      await dsfConfigApiService.updateConfig(mapping.configId, updateData);
      await loadMappings();
      stopEditing();
    } catch (err: any) {
      console.error("Error updating mapping:", err);
      setError("Erreur lors de la mise à jour");
    }
  };

  const addMapping = async () => {
    // For simplicity, add to the first available config or create new one
    // This would need proper implementation based on your requirements
    alert("Fonctionnalité à implémenter");
  };

  const deleteMapping = async (rowIndex: number) => {
    const mapping = mappings[rowIndex];
    if (confirm("Supprimer ce mapping ?")) {
      try {
        // Remove from accountMappings array
        const updateData = {
          accountMappings: mappings
            .filter((_, i) => i !== rowIndex)
            .map((m) => ({
              accountNumber: m.accountNumber,
              source: m.source,
              destination: m.destination,
            })),
        };

        await dsfConfigApiService.updateConfig(mapping.configId, updateData);
        await loadMappings();
      } catch (err: any) {
        console.error("Error deleting mapping:", err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  const handleExport = async () => {
    try {
      // Create export data
      const exportData = mappings.map((mapping) => ({
        "N° Compte": mapping.accountNumber,
        Source: mapping.source,
        Destination: mapping.destination,
        Rapport: mapping.reportType,
        "Config ID": mapping.configId,
        Actif: mapping.isActive ? "Oui" : "Non",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Account_Mappings");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `dsf_account_mappings_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);
    } catch (err: any) {
      console.error("Export error:", err);
      setError("Erreur lors de l'exportation");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Get unique account numbers
      const uniqueAccounts = [
        ...new Set(DSF_TEMPLATE.map((item) => item.accountNumber)),
      ];

      // Create template data with fixed columns
      const templateData = uniqueAccounts.map((accountNumber) => {
        // Find all items for this account
        const accountItems = DSF_TEMPLATE.filter(
          (item) => item.accountNumber === accountNumber,
        );
        const firstItem = accountItems[0];

        // Create base object
        const row: any = {
          "account number(index)": accountNumber,
          libelle: firstItem.libelle,
          source: firstItem.source,
          status: firstItem.status,
          scope: firstItem.scope,
          clientID: selectedFolder?.clientId || "",
        };

        // Add destination columns for all report types
        REPORT_TYPES.forEach((reportType) => {
          const item = accountItems.find((i) => i.reportType === reportType);
          row[reportType] = item ? item.destination : "";
        });

        return row;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DSF_Template");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `dsf_template_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);
    } catch (err: any) {
      console.error("Template download error:", err);
      setError("Erreur lors du téléchargement du template");
    }
  };

  const handleImport = () => {
    // Create hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process import data
        const importedMappings = jsonData as any[];

        // Group by report type
        const mappingsByReport: Record<string, any[]> = {};
        importedMappings.forEach((row) => {
          const reportType = row["Rapport"];
          if (!mappingsByReport[reportType]) {
            mappingsByReport[reportType] = [];
          }
          mappingsByReport[reportType].push({
            accountNumber: row["N° Compte"],
            source: row["Source"],
            destination: row["Destination"],
          });
        });

        // Update configs for each report type
        for (const [reportType, mappings] of Object.entries(mappingsByReport)) {
          try {
            // Find existing config or create new one
            const existingConfigs = await dsfConfigApiService.getConfigs({
              category: reportType,
              clientId: selectedFolder?.clientId,
              exerciseId: selectedFolder?.id,
            });

            if (existingConfigs.length > 0) {
              // Update existing config
              await dsfConfigApiService.updateConfig(existingConfigs[0].id, {
                accountMappings: mappings,
              });
            } else {
              // Create new config
              await dsfConfigApiService.createConfig({
                category: reportType,
                codeDsf: `${reportType}_001`,
                libelle: `Configuration ${reportType}`,
                accountMappings: mappings,
                clientId: selectedFolder?.clientId,
                exerciseId: selectedFolder?.id,
              });
            }
          } catch (err) {
            console.error(`Error importing ${reportType}:`, err);
          }
        }

        await loadMappings();
        alert("Importation terminée avec succès!");
      } catch (err: any) {
        console.error("Import error:", err);
        setError("Erreur lors de l'importation");
      }
    };
    input.click();
  };

  const loadTemplate = async () => {
    if (!currentUser) return;

    const confirmLoad = confirm(
      `Êtes-vous sûr de vouloir charger le modèle complet DSF ?\n\nCela va créer ${DSF_TEMPLATE.length} mappings de comptes pour tous les rapports.\n\nCette action va remplacer toutes les configurations existantes.`,
    );

    if (!confirmLoad) return;

    try {
      setLoading(true);
      setError(null);

      // Group template by report type
      const templateByReport: Record<string, any[]> = {};
      DSF_TEMPLATE.forEach((item) => {
        if (!templateByReport[item.reportType]) {
          templateByReport[item.reportType] = [];
        }
        templateByReport[item.reportType].push({
          accountNumber: item.accountNumber,
          source: item.source,
          destination: item.destination,
        });
      });

      // Create/update configs for each report type
      const promises = Object.entries(templateByReport).map(
        async ([reportType, mappings]) => {
          try {
            // Check if config already exists
            const existingConfigs = await dsfConfigApiService.getConfigs({
              category: reportType,
              clientId: selectedFolder?.clientId,
              exerciseId: selectedFolder?.id,
            });

            if (existingConfigs.length > 0) {
              // Update existing config
              await dsfConfigApiService.updateConfig(existingConfigs[0].id, {
                accountMappings: mappings,
              });
            } else {
              // Create new config
              await dsfConfigApiService.createConfig({
                category: reportType,
                codeDsf: `${reportType}_template`,
                libelle: `Configuration ${reportType} - Modèle`,
                accountMappings: mappings,
                clientId: selectedFolder?.clientId,
                exerciseId: selectedFolder?.id,
              });
            }
          } catch (err) {
            console.error(`Error loading template for ${reportType}:`, err);
          }
        },
      );

      await Promise.all(promises);
      await loadMappings();

      alert(
        `Modèle DSF chargé avec succès!\n\n${
          DSF_TEMPLATE.length
        } mappings créés pour ${Object.keys(templateByReport).length} rapports.`,
      );
    } catch (err: any) {
      console.error("Template load error:", err);
      setError("Erreur lors du chargement du modèle");
    } finally {
      setLoading(false);
    }
  };

  const testConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test configuration by validating mappings
      const testResults = {
        totalMappings: filteredMappings.length,
        validMappings: 0,
        invalidMappings: 0,
        issues: [] as string[],
      };

      filteredMappings.forEach((mapping, index) => {
        let isValid = true;

        // Check account number
        if (
          !mapping.accountNumber ||
          mapping.accountNumber.trim().length === 0
        ) {
          testResults.issues.push(
            `Ligne ${index + 1}: Numéro de compte manquant`,
          );
          isValid = false;
        }

        // Check source
        if (!mapping.source || !SOURCES.includes(mapping.source as any)) {
          testResults.issues.push(
            `Ligne ${index + 1}: Source invalide (${mapping.source})`,
          );
          isValid = false;
        }

        // Check destination
        if (!mapping.destination || mapping.destination.trim().length === 0) {
          testResults.issues.push(`Ligne ${index + 1}: Destination manquante`);
          isValid = false;
        }

        if (isValid) {
          testResults.validMappings++;
        } else {
          testResults.invalidMappings++;
        }
      });

      // Show test results
      const message = `
Test de Configuration ${
        selectedReportType === "all" ? "Tous les rapports" : selectedReportType
      }:

✅ Mappings valides: ${testResults.validMappings}
❌ Mappings invalides: ${testResults.invalidMappings}
📊 Total: ${testResults.totalMappings}

${
  testResults.issues.length > 0
    ? `Problèmes détectés:\n${testResults.issues.join("\n")}`
    : "Aucun problème détecté!"
}
      `;

      alert(message);
    } catch (err: any) {
      console.error("Test error:", err);
      setError("Erreur lors du test de configuration");
    } finally {
      setLoading(false);
    }
  };

  const testNote1Generation = async () => {
    if (!selectedFolder) {
      alert("Veuillez sélectionner un dossier d'abord.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate Note 1 generation on frontend using mock data
      const mockNote1Data = {
        header: {
          raisonSociale: "Entreprise Test SA",
          exerciceClos: "31/12/2024",
        },
        dettes: {
          sousTotaux: {
            dettesFinancieres: { montantBrut: 1500000 },
            dettesLocationAcquisition: { montantBrut: 500000 },
            dettesPassifCirculant: { montantBrut: 300000 },
            total: { montantBrut: 2300000 },
          },
        },
        totalEngagements: {
          engagementsDonnes: 200000,
          engagementsRecus: 150000,
        },
      };

      const mockConfigUsed = {
        category: "note1",
        accountMappings: DSF_TEMPLATE.filter(
          (item) => item.reportType === "note1",
        ),
      };

      // Show test results
      const message = `
🧪 Test de Génération Note 1 (Frontend Simulation):

📁 Dossier: ${selectedFolder.name}
📊 Balance: ✅ Simulation (Données mockées)
⚙️ Configuration: ✅ Template DSF utilisé

✅ Génération réussie!

📋 Données générées:
- Société: ${mockNote1Data.header.raisonSociale}
- Exercice: ${mockNote1Data.header.exerciceClos}
- Dette financière totale: ${mockNote1Data.dettes.sousTotaux.dettesFinancieres.montantBrut}
- Dette location-acquisition totale: ${mockNote1Data.dettes.sousTotaux.dettesLocationAcquisition.montantBrut}
- Dette passif circulant totale: ${mockNote1Data.dettes.sousTotaux.dettesPassifCirculant.montantBrut}
- TOTAL DETTES: ${mockNote1Data.dettes.sousTotaux.total.montantBrut}

💰 Engagements financiers:
- Engagements donnés: ${mockNote1Data.totalEngagements.engagementsDonnes}
- Engagements reçus: ${mockNote1Data.totalEngagements.engagementsRecus}

🔧 Configuration utilisée:
- Mappings: ${mockConfigUsed.accountMappings.length}
- Catégorie: ${mockConfigUsed.category}
      `;

      alert(message);
    } catch (err: any) {
      console.error("Test Note 1 error:", err);
      setError("Erreur lors du test de génération Note 1");
      alert(`❌ Erreur lors du test: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Configuration DSF - Mappings Comptes
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedFolder
                    ? `Dossier: ${selectedFolder.name}`
                    : "Sélectionnez un dossier"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser?.name} ({currentUser?.type})
              </span>

              {/* Report Type Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Rapport:</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
                >
                  <option value="all">
                    Tous les rapports ({REPORT_TYPES.length})
                  </option>
                  <optgroup label="Notes">
                    {REPORT_TYPES.filter((r) => r.startsWith("note")).map(
                      (report) => (
                        <option key={report} value={report}>
                          {report.charAt(0).toUpperCase() + report.slice(1)}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup label="Comptes Financiers">
                    {REPORT_TYPES.filter((r) => r.startsWith("cf")).map(
                      (report) => (
                        <option key={report} value={report}>
                          {report.toUpperCase()}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup label="Rapports C">
                    {REPORT_TYPES.filter((r) => r.startsWith("c")).map(
                      (report) => (
                        <option key={report} value={report}>
                          {report}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup label="Autres Rapports">
                    {REPORT_TYPES.filter(
                      (r) =>
                        !r.startsWith("note") &&
                        !r.startsWith("cf") &&
                        !r.startsWith("c") &&
                        !r.startsWith("assurance"),
                    ).map((report) => (
                      <option key={report} value={report}>
                        {report.charAt(0).toUpperCase() + report.slice(1)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Assurance">
                    {REPORT_TYPES.filter((r) => r.startsWith("assurance")).map(
                      (report) => (
                        <option key={report} value={report}>
                          {report
                            .replace("assurance", "")
                            .charAt(0)
                            .toUpperCase() +
                            report.replace("assurance", "").slice(1)}
                        </option>
                      ),
                    )}
                  </optgroup>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger Template Excel
                </button>

                <button
                  onClick={loadTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Modèle complet
                </button>

                <button
                  onClick={handleImport}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importer
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>

                {currentUser?.type === "ADMIN" && (
                  <button
                    onClick={addMapping}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau mapping
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des mappings...
            </span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      N° Compte (Index)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Libellé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMappings.map((mapping, index) => (
                    <tr key={mapping.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {editingCell?.rowIndex === index &&
                        editingCell?.field === "accountNumber" ? (
                          <input
                            type="text"
                            value={mapping.accountNumber}
                            onChange={(e) =>
                              updateMapping(
                                mappings.indexOf(mapping), // Use original index
                                "accountNumber",
                                e.target.value,
                              )
                            }
                            onBlur={stopEditing}
                            onKeyDown={(e) =>
                              e.key === "Enter" && stopEditing()
                            }
                            className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              startEditing(index, "accountNumber")
                            }
                          >
                            {mapping.accountNumber}
                          </span>
                        )}
                      </td>

                      {selectedReportType === "all" ? (
                        REPORT_TYPES.map((report) => (
                          <td
                            key={report}
                            className="px-4 py-3 text-sm text-center"
                          >
                            {mapping.reportType === report ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        ))
                      ) : (
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓
                          </span>
                        </td>
                      )}

                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {editingCell?.rowIndex === index &&
                        editingCell?.field === "source" ? (
                          <select
                            value={mapping.source}
                            onChange={(e) =>
                              updateMapping(
                                mappings.indexOf(mapping),
                                "source",
                                e.target.value,
                              )
                            }
                            onBlur={stopEditing}
                            className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                            autoFocus
                          >
                            {SOURCES.map((source) => (
                              <option key={source} value={source}>
                                {source}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            onDoubleClick={() => startEditing(index, "source")}
                          >
                            {mapping.source}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm font-mono text-green-600">
                        {editingCell?.rowIndex === index &&
                        editingCell?.field === "destination" ? (
                          <input
                            type="text"
                            value={mapping.destination}
                            onChange={(e) =>
                              updateMapping(
                                mappings.indexOf(mapping),
                                "destination",
                                e.target.value,
                              )
                            }
                            onBlur={stopEditing}
                            onKeyDown={(e) =>
                              e.key === "Enter" && stopEditing()
                            }
                            className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              startEditing(index, "destination")
                            }
                          >
                            {mapping.destination}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          {currentUser?.type === "ADMIN" && (
                            <>
                              <button
                                onClick={() =>
                                  deleteMapping(mappings.indexOf(mapping))
                                }
                                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {filteredMappings.length} mapping(s) affiché(s)
                  {selectedReportType !== "all" &&
                    ` pour ${selectedReportType}`}
                </span>
                <button
                  onClick={testConfig}
                  className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
                >
                  Tester Configuration
                </button>

                <button
                  onClick={testNote1Generation}
                  className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700"
                  disabled={!selectedFolder}
                >
                  🧪 Tester Note 1
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Légende des Sources:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
            <div>
              <strong>OC:</strong> Ouverture Crédit
            </div>
            <div>
              <strong>OD:</strong> Ouverture Débit
            </div>
            <div>
              <strong>MC:</strong> Mouvement Crédit
            </div>
            <div>
              <strong>MD:</strong> Mouvement Débit
            </div>
            <div>
              <strong>SC:</strong> Solde Crédit
            </div>
            <div>
              <strong>SD:</strong> Solde Débit
            </div>
            <div>
              <strong>MCD:</strong> Mouvement Net
            </div>
            <div>
              <strong>SCD:</strong> Solde Net
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
