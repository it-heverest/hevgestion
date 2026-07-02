import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import {
  Calendar,
  FileText,
  Upload,
  Settings,
  Cloud,
  Edit3,
  ChevronRight,
  ShieldCheck,
  Split,
  History,
  LayoutDashboard,
} from "lucide-react";

interface DashboardGridProps {
  companyName: string;
  currentExercise: number;
  onNavigate: (view: string) => void;
}

export function DashboardGrid({
  companyName,
  currentExercise,
}: DashboardGridProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useApp();
  const uid = user?.id ?? "me";

  const workflowSteps = [
    {
      id: "exercise",
      step: 1,
      label: "Exercice",
      description: "Sélectionner ou créer un exercice fiscal",
      icon: Calendar,
      path: `/${language}/web/user/exercise/${uid}/exercise`,
    },
    {
      id: "import",
      step: 2,
      label: "Import balance",
      description: "Charger la balance Excel",
      icon: Upload,
      path: `/${language}/web/user/import/${uid}/import`,
    },
    {
      id: "traitement",
      step: 3,
      label: "Traitement",
      description: "Vérifier et corriger les données",
      icon: Edit3,
      path: `/${language}/web/user/traitement/${uid}/traitement`,
    },
    {
      id: "reports",
      step: 4,
      label: "Génération DSF",
      description: "Générer les états financiers",
      icon: FileText,
      path: `/${language}/web/user/reports/${uid}/reports`,
    },
    {
      id: "televersion",
      step: 5,
      label: "Téléversion",
      description: "Soumettre à l'administration",
      icon: Cloud,
      path: `/${language}/web/user/televersion/${uid}/televersion`,
    },
  ];

  const quickLinks = [
    {
      label: "Tableau de bord",
      icon: LayoutDashboard,
      path: `/${language}/web/user/dashboard/${uid}/dashboard`,
      description: "Vue d'ensemble",
    },
    {
      label: "Config. ventilation",
      icon: Split,
      path: `/${language}/web/user/ventilation-config/${uid}/ventilation-config`,
      description: "Paramétrer les comptes",
    },
    {
      label: "Revue fiscale",
      icon: ShieldCheck,
      path: `/${language}/web/user/revuefiscal/${uid}/revuefiscal`,
      description: "Questionnaire de conformité",
    },
    {
      label: "Historique",
      icon: History,
      path: `/${language}/web/user/history/${uid}/history`,
      description: "Journal des actions",
    },
    {
      label: "Paramètres",
      icon: Settings,
      path: `/${language}/web/user/settings/${uid}/settings`,
      description: "Configuration du compte",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-foreground">
          {companyName ? companyName : "Tableau de bord"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Exercice fiscal {currentExercise}
        </p>
      </div>

      {/* Workflow pipeline */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Flux de travail
        </h2>
        <div className="border border-border rounded-md bg-card overflow-hidden">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => navigate(step.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-muted/60 transition-colors ${
                  i < workflowSteps.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-border bg-background flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                  {step.step}
                </span>
                <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Accès rapide
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-start gap-2 p-3 bg-card border border-border rounded-md hover:border-primary/40 hover:bg-muted/40 transition-colors text-left group"
              >
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground leading-tight">
                    {link.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {link.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
