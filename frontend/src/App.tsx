import { useEffect, useState, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useLanguageRoute } from "./hooks/useLanguageRoute";
import { useTranslation } from "./hooks/useTranslation";
import { TranslationKeys } from "./locales/translations";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Login } from "./components/Login";
import { CountrySelector } from "./components/CountrySelector";
import { CompanySelector } from "./components/CompanySelector";
import { DashboardGrid } from "./components/DashboardGrid";
import { ExerciseSelector } from "./components/ExerciseSelector";
import { AllReports } from "./components/AllReports";
import { BalanceImporter } from "./components/BalanceImporter";
import { SimpleSettings } from "./components/SimpleSettings";
import { ExcelBalanceImporter } from "./components/ExcelBalanceImporter";
import { StepByStepProcessor } from "./components/StepByStepProcessor";
import { DSFImporter } from "./components/DSFImporter";
import { TaxDeadlines } from "./components/TaxDeadlines";
import { AuditHistory } from "./components/AuditHistory";
import { OnboardingGuide } from "./components/OnboardingGuide";
import { ReportNavigation } from "./components/DSF/ReportNavigation";
import { GlobalSearch } from "./components/GlobalSearch";
import { NotificationCenter } from "./components/NotificationCenter";
import { EntityHeader } from "./components/EntityHeader";
import { AuthLoader } from "./components/AuthLoader";
import {
  LayoutDashboard,
  Upload,
  Edit3,
  History,
  Settings,
  BarChart3,
  FileText,
  Building2,
  Calendar,
  Cloud,
  MoreHorizontal,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { Button } from "./components/ui/button";
import DGIDeclarationProfessional from "./components/DGIDeclarationProfessional";
import { ForgotPassword } from "./components/ForgotPassword";
import { NotFound } from "./components/NotFound";
import { OtpVerificationPage } from "./components/OtpVerificationPage";
import DSFConfigInterface from "./components/DSFConfigInterface";
import { notesService } from "./services/notes.service";
import { dsfService } from "./services/dsf.service";
import type { ExtractionResult } from "./components/DSF/uploadSteps";
import {
  Note1,
  Note2,
  Note3A,
  Note3B,
  Note3C,
  Note3D,
  Note3F,
  Note4,
  Note5,
  Note6,
  Note7,
  Note8,
  Note9,
  Note10,
  Note11,
  Note12,
  Note13,
  Note14,
  Note15A,
  Note15B,
  Note16A,
  Note16B,
  Note16Bbis,
  Note16C,
  Note17,
  Note18,
  Note19,
  Note20,
  Note21,
  Note22,
  Note23,
  Note24,
  Note25,
  Note26,
  Note27A,
  Note27B,
  Note28,
  Note29,
  Note30,
  Note31,
  Note32,
  Note33,
  Note34,
  FicheR3,
  PageDeGarde,
  Sommaire,
  BilanPaysage,
  CompteResultat,
  TableauFluxTresorerie,
  GrilleAnalyseNotes,
  C01Note3C,
  C1Note17,
  C1Note25,
  C1Note27A,
  C1Note28,
  C2Note25,
  C2Note28,
  CF1,
  CF1Bis,
  CF1Ter,
  CF1Quater,
  CF2,
  CF2Bis,
  CF2Ter,
  Impot21,
  Impot22,
  Fiche1,
  Fiche2,
  Fiche3,
  Fiche4,
  Fiche5,
  BilanActif,
  BilanPassif,
  Charges,
  Produits,
  CompteGeneralPertesProfits,
  EtatC4,
  EtatC11,
  EtatC11Vie,
  Annexe6,
  Ass1,
  Ass2,
  Ass3,
  Ass4,
  Ass5,
  Ass6,
  Ass7,
  Ass8,
  Ass9,
  Ass10,
  Ass11,
  DeclarationAnnuel,
  SommesVerse,
  TVA,
  Versements,
  Tableau30,
  Tableau31,
  Tableau32,
  Tableau33,
  Tableau34,
  Tableau35A,
  Tableau35B,
  Tableau36,
  Tableau37,
  Tableau38,
  Tableau39,
  Tableau40,
  Tableau41A,
  Tableau41B,
  Tableau42,
  Tableau43A,
  Tableau43B,
  Tableau44A,
  GrilleAnalyseNotesSMT,
  ModBilan,
  Note1Smt,
  Note2Smt,
  Note3Smt,
  Note4Smt,
  Note5Smt,
  Note6Smt,
  T1,
  T1Bis,
  T1Ter,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
} from "./components/Notes";
import RevueFiscal from "./components/RevueFiscal";

/**
 * Get navigation items with translated labels
 */
function getNavigationItems(t: (key: keyof TranslationKeys) => string) {
  return [
    {
      id: "dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      path: "/web/user/dashboard",
    },
    {
      id: "exercise",
      label: t("exercise"),
      icon: Calendar,
      path: "/web/user/exercise",
    },
    {
      id: "import",
      label: t("importBalance"),
      icon: Upload,
      path: "/web/user/import",
    },
    {
      id: "traitement",
      label: t("traitement"),
      icon: Edit3,
      path: "/web/user/traitement",
    },
    {
      id: "reports",
      label: t("dsfNotes"),
      icon: FileText,
      path: "/web/user/reports",
    },
    {
      id: "history",
      label: t("history"),
      icon: History,
      path: "/web/user/history",
    },
    {
      id: "settings",
      label: t("settings"),
      icon: Settings,
      path: "/web/user/settings",
    },
    {
      id: "televersion",
      label: t("televersion"),
      icon: Cloud,
      path: "/web/user/televersion",
    },
    {
      id: "other",
      label: t("other"),
      icon: MoreHorizontal,
      path: "/web/user/other",
    },
    {
      id: "revuefiscal",
      label: t("revueFiscal"),
      icon: MoreHorizontal,
      path: "/web/user/revuefiscal",
    },
  ];
}

// const navigationItems = [
//   {
//     id: "dashboard",
//     label: "Tableau de Bord",
//     icon: LayoutDashboard,
//     path: "/web/user/dashboard",
//   },
//   {
//     id: "exercise",
//     label: "Exercice",
//     icon: Calendar,
//     path: "/web/user/exercise",
//   },
//   {
//     id: "import",
//     label: "Import Balance",
//     icon: Upload,
//     path: "/web/user/import",
//   },
//   {
//     id: "traitement",
//     label: "Traitement",
//     icon: Edit3,
//     path: "/web/user/traitement",
//   },
//   {
//     id: "reports",
//     label: "DSF Notes",
//     icon: FileText,
//     path: "/web/user/reports",
//   },
//   {
//     id: "history",
//     label: "Historique",
//     icon: History,
//     path: "/web/user/history",
//   },
//   {
//     id: "settings",
//     label: "Paramètres",
//     icon: Settings,
//     path: "/web/user/settings",
//   },
//   {
//     id: "televersion",
//     label: "Téléversion",
//     icon: Cloud,
//     path: "/web/user/televersion",
//   },
//   {
//     id: "other",
//     label: "Autres",
//     icon: MoreHorizontal,
//     path: "/web/user/other",
//   },
// ];

/**
 * LanguageLayout: Wrapper component that ensures language routing works correctly
 */
function LanguageLayout() {
  const { lang } = useParams<{ lang?: string }>();
  const { language, setLanguage } = useApp();
  const location = useLocation();

  useEffect(() => {
    // Validate and set language from URL
    if (lang === "en" || lang === "fr") {
      if (lang !== language) {
        setLanguage(lang);
      }
    }
  }, [lang, language, setLanguage]);

  return <Outlet />;
}

export function ProtectedLayout({
  selectedCountry,
  setSelectedCountry,
  selectedCompany,
  setSelectedCompany,
  selectedExercise,
  setActiveRoute,
  selectedClient,
}: {
  selectedCountry: any;
  setSelectedCountry: (c: any) => void;
  selectedCompany: any;
  setSelectedCompany: (c: any) => void;
  selectedExercise: any;
  setActiveRoute: (route: string) => void;
  selectedClient: any;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useApp();
  const { t } = useTranslation();

  // Get translated navigation items
  const translatedNavItems = useMemo(() => getNavigationItems(t), [t]);

  // Extract language prefix from URL
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const langPrefix =
    pathSegments[0] === "en" || pathSegments[0] === "fr"
      ? pathSegments[0]
      : "fr";

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    // Skip language prefix and "web/user" parts
    const actionId =
      parts.length >= 4 ? parts[3] || parts[2] : parts[1] || "dashboard";
    setActiveRoute(actionId);
  }, [location.pathname, setActiveRoute]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-2 shadow-sm">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground">HevGestion DSF</h1>
                <p className="text-xs text-sidebar-foreground/60">
                  {t("systemStatusCompliant")}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {translatedNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => {
                            navigate(
                              `/${langPrefix}${item.path}/${user?.id ?? "me"}/${item.id}`,
                            );
                            setActiveRoute(item.id);
                          }}
                          isActive={location.pathname.includes(item.path)}
                          className="w-full data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-medium data-[active=true]:shadow-sm"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-background">
          <div className="border-b border-border bg-card shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="flex items-center gap-3">
                    <div>
                      <h1 className="text-lg font-semibold text-foreground">
                        HevGestion DSF
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {t("welcomeUser")}, {user?.firstName || "User"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-none bg-transparent hover:bg-muted focus:ring-0 focus:outline-none"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <GlobalSearch
                    onNavigate={(r) => navigate(r)}
                    companyName={selectedCompany?.name}
                    currentExercise={selectedExercise?.fiscalYear}
                  />

                  <div
                    className="flex items-center justify-center px-3 py-2 bg-accent border border-accent-foreground/15 text-accent-foreground rounded-lg hover:bg-accent/70 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCountry(null);
                      setSelectedCompany(null);
                      navigate(`/${langPrefix}/web/user/select-country`);
                    }}
                  >
                    <span className="text-sm font-medium truncate">
                      {" "}
                      {selectedClient?.name || t("selectCompany")}
                    </span>
                  </div>

                  <NotificationCenter />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pb-16">
            <Outlet />
            <EntityHeader />
          </div>

          <footer className="fixed bottom-0 right-0 left-0 md:left-[280px] py-2 px-6 text-center bg-card border-t border-border">
            <p className="text-xs text-muted-foreground select-none">
              {t("poweredBy")}
            </p>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, user, isInitializing } = useAuth();
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOpen] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => localStorage.getItem("onboarding_completed") === "true",
  );

  const { selectedFolder, selectedClient, clients, isFullyLoaded } = useApp();

  const needsOnboarding =
    isAuthenticated &&
    user &&
    isFullyLoaded &&
    !hasCompletedOnboarding &&
    (clients.length === 0 || !selectedCountry);

  useEffect(() => {
    if (needsOnboarding) setShowOnboarding(true);
  }, [needsOnboarding]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem("onboarding_completed", "true");
  };

  if (isInitializing) {
    return <AuthLoader />;
  }

  return (
    <>
      <Routes>
        {/* Root redirect to default language and login */}
        <Route index element={<Navigate to="/fr/web/user/login" replace />} />

        {/* Language-aware routes wrapper */}
        <Route path="/:lang/*" element={<LanguageLayout />}>
          {/* Public routes with language prefix */}
          <Route path="web/user/login" element={<Login />} />
          <Route path="web/user/verify-otp" element={<OtpVerificationPage />} />
          <Route path="web/user/forgot-password" element={<ForgotPassword />} />
          <Route path="web/user/select-country" element={<CountrySelector />} />
          <Route
            path="web/user/select-company"
            element={<CompanySelector onSelectCompany={setSelectedCompany} />}
          />

          {/* Protected area routes with language prefix */}
          <Route
            path="web/user/*"
            element={
              isInitializing ? (
                <AuthLoader />
              ) : isAuthenticated ? (
                <ProtectedLayout
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  selectedCompany={selectedCompany}
                  setSelectedCompany={setSelectedCompany}
                  selectedExercise={selectedFolder}
                  setActiveRoute={setActiveRoute}
                  selectedClient={selectedClient}
                />
              ) : (
                <Navigate to="/fr/web/user/login" replace />
              )
            }
          >
            <Route
              index
              element={
                <Navigate
                  to={`/web/user/dashboard/${user?.id ?? "me"}`}
                  replace
                />
              }
            />
            <Route
              path="dashboard/:userId/:actionId?"
              element={
                <DashboardGrid
                  companyName={selectedCompany?.name || ""}
                  currentExercise={
                    selectedFolder?.fiscalYear || new Date().getFullYear()
                  }
                  onNavigate={setActiveRoute}
                />
              }
            />
            <Route
              path="exercise/:userId/:actionId?"
              element={<ExerciseSelector />}
            />
            <Route
              path="import/:userId/:actionId?"
              element={<BalanceImporter />}
            />
            <Route
              path="traitement/:userId/:actionId?"
              element={<StepByStepProcessor />}
            />
            <Route path="dsf-import/:folderId" element={<DSFImporter />} />
            <Route
              path="balance-import/:folderId"
              element={<BalanceImporter />}
            />
            <Route
              path="reports/:userId/reports/rapport/note1"
              element={<Note1 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note2"
              element={<Note2 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note3a"
              element={<Note3A />}
            />
            <Route
              path="reports/:userId/reports/rapport/note3b"
              element={<Note3B />}
            />
            <Route
              path="reports/:userId/reports/rapport/note3c"
              element={<Note3C />}
            />
            <Route
              path="reports/:userId/reports/rapport/note3d"
              element={<Note3D />}
            />
            <Route
              path="reports/:userId/reports/rapport/note3f"
              element={<Note3F />}
            />
            <Route
              path="reports/:userId/reports/rapport/note4"
              element={<Note4 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note5"
              element={<Note5 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note6"
              element={<Note6 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note7"
              element={<Note7 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note8"
              element={<Note8 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note9"
              element={<Note9 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note10"
              element={<Note10 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note11"
              element={<Note11 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note12"
              element={<Note12 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note13"
              element={<Note13 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note14"
              element={<Note14 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note15a"
              element={<Note15A />}
            />
            <Route
              path="reports/:userId/reports/rapport/note15b"
              element={<Note15B />}
            />
            <Route
              path="reports/:userId/reports/rapport/note16a"
              element={<Note16A />}
            />
            <Route
              path="reports/:userId/reports/rapport/note16b"
              element={<Note16B />}
            />
            <Route
              path="reports/:userId/reports/rapport/note16bbis"
              element={<Note16Bbis />}
            />
            <Route
              path="reports/:userId/reports/rapport/note16c"
              element={<Note16C />}
            />
            <Route
              path="reports/:userId/reports/rapport/note17"
              element={<Note17 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note18"
              element={<Note18 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note19"
              element={<Note19 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note20"
              element={<Note20 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note21"
              element={<Note21 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note22"
              element={<Note22 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note23"
              element={<Note23 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note24"
              element={<Note24 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note25"
              element={<Note25 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note26"
              element={<Note26 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note27a"
              element={<Note27A />}
            />
            <Route
              path="reports/:userId/reports/rapport/note27b"
              element={<Note27B />}
            />
            <Route
              path="reports/:userId/reports/rapport/note28"
              element={<Note28 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note29"
              element={<Note29 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note30"
              element={<Note30 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note31"
              element={<Note31 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note32"
              element={<Note32 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note33"
              element={<Note33 />}
            />
            <Route
              path="reports/:userId/reports/rapport/note34"
              element={<Note34 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ficher3"
              element={<FicheR3 />}
            />
            <Route
              path="reports/:userId/reports/rapport/pagedegarde"
              element={<PageDeGarde />}
            />
            <Route
              path="reports/:userId/reports/rapport/sommaire"
              element={<Sommaire />}
            />
            <Route
              path="reports/:userId/reports/rapport/bilanpaysage"
              element={<BilanPaysage />}
            />
            <Route
              path="reports/:userId/reports/rapport/compteresultat"
              element={<CompteResultat />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableaufluxtresorerie"
              element={<TableauFluxTresorerie />}
            />
            <Route
              path="reports/:userId/reports/rapport/grilleanalysenotes"
              element={<GrilleAnalyseNotes />}
            />
            <Route
              path="reports/:userId/reports/rapport/c01note3c"
              element={<C01Note3C />}
            />
            <Route
              path="reports/:userId/reports/rapport/c1note17"
              element={<C1Note17 />}
            />
            <Route
              path="reports/:userId/reports/rapport/c1note25"
              element={<C1Note25 />}
            />
            <Route
              path="reports/:userId/reports/rapport/c1note27a"
              element={<C1Note27A />}
            />
            <Route
              path="reports/:userId/reports/rapport/c1note28"
              element={<C1Note28 />}
            />
            <Route
              path="reports/:userId/reports/rapport/c2note25"
              element={<C2Note25 />}
            />
            <Route
              path="reports/:userId/reports/rapport/c2note28"
              element={<C2Note28 />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf1"
              element={<CF1 />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf1bis"
              element={<CF1Bis />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf1ter"
              element={<CF1Ter />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf1quater"
              element={<CF1Quater />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf2"
              element={<CF2 />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf2bis"
              element={<CF2Bis />}
            />
            <Route
              path="reports/:userId/reports/rapport/cf2ter"
              element={<CF2Ter />}
            />
            <Route
              path="reports/:userId/reports/rapport/impot21"
              element={<Impot21 />}
            />
            <Route
              path="reports/:userId/reports/rapport/impot22"
              element={<Impot22 />}
            />
            <Route
              path="reports/:userId/reports/rapport/fiche1"
              element={<Fiche1 />}
            />
            <Route
              path="reports/:userId/reports/rapport/fiche2"
              element={<Fiche2 />}
            />
            <Route
              path="reports/:userId/reports/rapport/fiche3"
              element={<Fiche3 />}
            />
            <Route
              path="reports/:userId/reports/rapport/fiche4"
              element={<Fiche4 />}
            />
            <Route
              path="reports/:userId/reports/rapport/fiche5"
              element={<Fiche5 />}
            />
            <Route
              path="reports/:userId/reports/rapport/bilanactif"
              element={<BilanActif />}
            />
            <Route
              path="reports/:userId/reports/rapport/bilanpassif"
              element={<BilanPassif />}
            />
            <Route
              path="reports/:userId/reports/rapport/charges"
              element={<Charges />}
            />
            <Route
              path="reports/:userId/reports/rapport/produits"
              element={<Produits />}
            />
            <Route
              path="reports/:userId/reports/rapport/comptegeneralpertesprofits"
              element={<CompteGeneralPertesProfits />}
            />
            <Route
              path="reports/:userId/reports/rapport/etatc4"
              element={<EtatC4 />}
            />
            <Route
              path="reports/:userId/reports/rapport/etatc11"
              element={<EtatC11 />}
            />
            <Route
              path="reports/:userId/reports/rapport/etatc11vie"
              element={<EtatC11Vie />}
            />
            <Route
              path="reports/:userId/reports/rapport/annexe6"
              element={<Annexe6 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass1"
              element={<Ass1 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass2"
              element={<Ass2 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass3"
              element={<Ass3 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass4"
              element={<Ass4 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass5"
              element={<Ass5 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass6"
              element={<Ass6 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass7"
              element={<Ass7 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass8"
              element={<Ass8 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass9"
              element={<Ass9 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass10"
              element={<Ass10 />}
            />
            <Route
              path="reports/:userId/reports/rapport/ass11"
              element={<Ass11 />}
            />
            <Route
              path="reports/:userId/reports/rapport/declarationannuel"
              element={<DeclarationAnnuel />}
            />
            <Route
              path="reports/:userId/reports/rapport/sommesverse"
              element={<SommesVerse />}
            />
            <Route
              path="reports/:userId/reports/rapport/tva"
              element={<TVA />}
            />
            <Route
              path="reports/:userId/reports/rapport/versements"
              element={<Versements />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau30"
              element={<Tableau30 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau31"
              element={<Tableau31 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau32"
              element={<Tableau32 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau33"
              element={<Tableau33 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau34"
              element={<Tableau34 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau35a"
              element={<Tableau35A />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau35b"
              element={<Tableau35B />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau36"
              element={<Tableau36 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau37"
              element={<Tableau37 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau38"
              element={<Tableau38 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau39"
              element={<Tableau39 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau40"
              element={<Tableau40 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau41a"
              element={<Tableau41A />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau41b"
              element={<Tableau41B />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau42"
              element={<Tableau42 />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau43a"
              element={<Tableau43A />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau43b"
              element={<Tableau43B />}
            />
            <Route
              path="reports/:userId/reports/rapport/tableau44a"
              element={<Tableau44A />}
            />
            <Route
              path="reports/:userId/reports/rapport/grilleanalysenotessmt"
              element={<GrilleAnalyseNotesSMT />}
            />
            <Route
              path="reports/:userId/reports/rapport/modbilan"
              element={<ModBilan />}
            />
            <Route
              path="reports/:userId/reports/rapport/note1smt"
              element={<Note1Smt />}
            />
            <Route
              path="reports/:userId/reports/rapport/note2smt"
              element={<Note2Smt />}
            />
            <Route
              path="reports/:userId/reports/rapport/note3smt"
              element={<Note3Smt />}
            />
            <Route
              path="reports/:userId/reports/rapport/note4smt"
              element={<Note4Smt />}
            />
            <Route
              path="reports/:userId/reports/rapport/note5smt"
              element={<Note5Smt />}
            />
            <Route
              path="reports/:userId/reports/rapport/note6smt"
              element={<Note6Smt />}
            />
            <Route path="reports/:userId/reports/rapport/t1" element={<T1 />} />
            <Route
              path="reports/:userId/reports/rapport/t1bis"
              element={<T1Bis />}
            />
            <Route
              path="reports/:userId/reports/rapport/t1ter"
              element={<T1Ter />}
            />
            <Route path="reports/:userId/reports/rapport/t2" element={<T2 />} />
            <Route path="reports/:userId/reports/rapport/t3" element={<T3 />} />
            <Route path="reports/:userId/reports/rapport/t4" element={<T4 />} />
            <Route path="reports/:userId/reports/rapport/t5" element={<T5 />} />
            <Route path="reports/:userId/reports/rapport/t6" element={<T6 />} />
            <Route path="reports/:userId/reports/rapport/t7" element={<T7 />} />
            <Route path="reports/:userId/reports/rapport/t8" element={<T8 />} />
            <Route path="reports/:userId/reports/rapport/t9" element={<T9 />} />
            <Route
              path="reports/:userId/:actionId?"
              element={
                <AllReports
                  folderId={selectedFolder?.id}
                  checkExistingDSF={async (
                    folderId: string,
                  ): Promise<ExtractionResult[] | null> => {
                    try {
                      const notes =
                        await notesService.getNotesForFolder(folderId);
                      if (notes?.length) {
                        return notes.map((note: any) => ({
                          noteName: `NOTE ${note.noteNumber}`,
                          success: note.exists,
                          data: note.data,
                        })) as ExtractionResult[];
                      }

                      return null;
                    } catch (err) {
                      console.error("Error checking existing DSF:", err);
                      return null;
                    }
                  }}
                  onNormalGeneration={async () => {
                    if (!selectedFolder?.id) return;
                    try {
                      await dsfService.generateDSF(selectedFolder.id);
                      // Refresh the page or trigger a re-check
                      window.location.reload();
                    } catch (error) {
                      console.error("Error generating DSF:", error);
                      alert(
                        "Erreur lors de la génération de la DSF. Veuillez vérifier que la balance N est disponible.",
                      );
                    }
                  }}
                />
              }
            />
            <Route
              path="deadlines/:userId/:actionId?"
              element={<TaxDeadlines />}
            />
            <Route
              path="history/:userId/:actionId?"
              element={<AuditHistory />}
            />
            <Route
              path="settings/:userId/:actionId?"
              element={<SimpleSettings />}
            />
            <Route
              path="televersion/:userId/:actionId?"
              element={
                <div className="p-6">
                  <DGIDeclarationProfessional />
                </div>
              }
            />
            <Route
              path="other/:userId/:actionId?"
              element={
                <div className="p-6">
                  <DSFConfigInterface />
                </div>
              }
            />
            <Route
              path="revuefiscal/:userId/:actionId?"
              element={
                <div className="p-6">
                  <RevueFiscal />
                </div>
              }
            />
          </Route>

          {/* 404 Not Found - outside protected routes to avoid sidebar/navbar */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* 404 Not Found for unauthenticated/invalid language routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={completeOnboarding}
        onComplete={completeOnboarding}
      />
      {location.pathname.includes("/rapport/") && (
        <ReportNavigation key={location.pathname} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
