import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
import Note1 from "./components/rapport/Note1";
import Note2 from "./components/rapport/Note2";
import Note3A from "./components/rapport/Note3A";
import { SimpleSettings } from "./components/SimpleSettings";
import { ExcelBalanceImporter } from "./components/ExcelBalanceImporter";
import { StepByStepProcessor } from "./components/StepByStepProcessor";
import { DSFImporter } from "./components/DSFImporter";
import { TaxDeadlines } from "./components/TaxDeadlines";
import { AuditHistory } from "./components/AuditHistory";
import { OnboardingGuide } from "./components/OnboardingGuide";
import { GlobalSearch } from "./components/GlobalSearch";
import { NotificationCenter } from "./components/NotificationCenter";
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
import { OtpVerificationPage } from "./components/OtpVerificationPage";
import DSFConfigInterface from "./components/DSFConfigInterface";
import { notesService } from "./services/notes.service";
import type { ExtractionResult } from "./components/DSF/uploadSteps";

const navigationItems = [
  {
    id: "dashboard",
    label: "Tableau de Bord",
    icon: LayoutDashboard,
    path: "/web/user/dashboard",
  },
  {
    id: "exercise",
    label: "Exercice",
    icon: Calendar,
    path: "/web/user/exercise",
  },
  {
    id: "import",
    label: "Import Balance",
    icon: Upload,
    path: "/web/user/import",
  },
  {
    id: "traitement",
    label: "Traitement",
    icon: Edit3,
    path: "/web/user/traitement",
  },
  {
    id: "reports",
    label: "DSF Notes",
    icon: FileText,
    path: "/web/user/reports",
  },
  {
    id: "history",
    label: "Historique",
    icon: History,
    path: "/web/user/history",
  },
  {
    id: "settings",
    label: "Paramètres",
    icon: Settings,
    path: "/web/user/settings",
  },
  {
    id: "televersion",
    label: "Téléversion",
    icon: Cloud,
    path: "/web/user/televersion",
  },
  {
    id: "other",
    label: "Autres",
    icon: MoreHorizontal,
    path: "/web/user/other",
  },
];

export function ProtectedLayout({
  selectedCountry,
  setSelectedCountry,
  selectedCompany,
  setSelectedCompany,
  selectedExercise,
  setActiveRoute,
}: {
  selectedCountry: any;
  setSelectedCountry: (c: any) => void;
  selectedCompany: any;
  setSelectedCompany: (c: any) => void;
  selectedExercise: any;
  setActiveRoute: (route: string) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const actionId =
      parts.length >= 2 ? parts[2] || parts[1] : parts[0] || "dashboard";
    setActiveRoute(actionId);
  }, [location.pathname, setActiveRoute]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-lg p-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-semibold">HevGestion DSF</h1>
                <p className="text-xs text-muted-foreground">
                  Gestion Comptable OHADA
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => {
                            navigate(
                              `${item.path}/${user?.id ?? "me"}/${item.id}`,
                            );
                            setActiveRoute(item.id);
                          }}
                          isActive={location.pathname.startsWith(item.path)}
                          className="w-full"
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

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="border-b bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">
                        HevGestion DSF
                      </h1>
                      <p className="text-sm text-gray-500">
                        Bienvenue, {user?.firstName || "Utilisateur"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <Wifi className="h-3 w-3" />
                    Connecté
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-none bg-transparent hover:bg-gray-100 focus:ring-0 focus:outline-none"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <GlobalSearch
                    onNavigate={(r) => navigate(r)}
                    companyName={selectedCompany?.name}
                    currentExercise={selectedExercise?.fiscalYear}
                  />
                  <NotificationCenter />

                  <div
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCountry(null);
                      setSelectedCompany(null);
                      navigate("/web/user/select-country");
                    }}
                  >
                    <span className="text-sm font-medium truncate">
                      {" "}
                      {selectedCompany?.name || "Sélectionner entreprise"}
                    </span>
                  </div>

                  {selectedExercise && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      onClick={() => navigate("/web/user/exercise")}
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {selectedExercise.fiscalYear}
                      </span>
                    </div>
                  )}

                  {/* <div
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer max-w-[200px]"
                    onClick={() => navigate("/web/user/select-company")}
                  >
                    <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {selectedCompany?.name || "Sélectionner entreprise"}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pb-16">
            <Outlet />
          </div>

          <footer className="fixed bottom-0 right-0 left-0 md:left-[280px] py-2 px-6 text-center bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 select-none">
              powered by nashsoft systems
            </p>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Initialisation de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/web/user/login" element={<Login />} />
        <Route path="/web/user/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/web/user/forgot-password" element={<ForgotPassword />} />
        <Route path="/web/user/select-country" element={<CountrySelector />} />
        <Route
          path="/web/user/select-company"
          element={<CompanySelector onSelectCompany={setSelectedCompany} />}
        />

        {/* Protected area */}
        <Route
          path="/web/user/*"
          element={
            isAuthenticated ? (
              <ProtectedLayout
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                selectedExercise={selectedFolder}
                setActiveRoute={setActiveRoute}
              />
            ) : (
              <Navigate to="/web/user/login" replace />
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
            element={<ExcelBalanceImporter onComplete={() => {}} />}
          />
          <Route
            path="traitement/:userId/:actionId?"
            element={<StepByStepProcessor />}
          />
          <Route path="dsf-import/:folderId" element={<DSFImporter />} />
          <Route path="rapport/note1" element={<Note1 />} />
          <Route path="rapport/note2" element={<Note2 />} />
          <Route path="rapport/note3A" element={<Note3A />} />
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
              />
            }
          />
          <Route
            path="deadlines/:userId/:actionId?"
            element={<TaxDeadlines />}
          />
          <Route path="history/:userId/:actionId?" element={<AuditHistory />} />
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
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? `/web/user/dashboard/${user?.id ?? "me"}`
                  : "/web/user/login"
              }
              replace
            />
          }
        />
      </Routes>

      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={completeOnboarding}
        onComplete={completeOnboarding}
      />
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
