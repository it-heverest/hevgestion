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
  const { language, selectedFolder } = useApp();
  const uid = user?.id ?? "me";
  const isFolderOpen = !selectedFolder || selectedFolder.status === "DRAFT";

  // Chaque étape porte sa propre teinte pastel (icône + fond), comme les
  // tuiles de mise en avant d'un tableau de bord épuré — plus chaleureux
  // qu'une liste uniformément grise, et ça aide à repérer l'étape en cours
  // au premier coup d'œil.
  const workflowSteps = [
    {
      id: "exercise",
      step: 1,
      label: "Exercice",
      description: "Sélectionner ou créer un exercice fiscal",
      icon: Calendar,
      path: `/${language}/web/user/exercise/${uid}/exercise`,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      id: "import",
      step: 2,
      label: "Import balance",
      description: "Charger la balance Excel",
      icon: Upload,
      path: `/${language}/web/user/import/${uid}/import`,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "traitement",
      step: 3,
      label: "Traitement",
      description: "Vérifier et corriger les données",
      icon: Edit3,
      path: `/${language}/web/user/traitement/${uid}/traitement`,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      id: "reports",
      step: 4,
      label: "Génération DSF",
      description: "Générer les états financiers",
      icon: FileText,
      path: `/${language}/web/user/reports/${uid}/reports`,
      tint: "bg-purple-50 text-purple-600",
    },
    {
      id: "televersion",
      step: 5,
      label: "Téléversion",
      description: "Soumettre à l'administration",
      icon: Cloud,
      path: `/${language}/web/user/televersion/${uid}/televersion`,
      tint: "bg-orange-50 text-primary",
    },
  ];

  const quickLinks = [
    {
      label: "Tableau de bord",
      icon: LayoutDashboard,
      path: `/${language}/web/user/dashboard/${uid}/dashboard`,
      description: "Vue d'ensemble",
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Config. ventilation",
      icon: Split,
      path: `/${language}/web/user/ventilation-config/${uid}/ventilation-config`,
      description: "Paramétrer les comptes",
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Revue fiscale",
      icon: ShieldCheck,
      path: `/${language}/web/user/revuefiscal/${uid}/revuefiscal`,
      description: "Questionnaire de conformité",
      tint: "bg-purple-50 text-purple-600",
    },
    {
      label: "Historique",
      icon: History,
      path: `/${language}/web/user/history/${uid}/history`,
      description: "Journal des actions",
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Paramètres",
      icon: Settings,
      path: `/${language}/web/user/settings/${uid}/settings`,
      description: "Configuration du compte",
      tint: "bg-orange-50 text-primary",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {companyName ? companyName : "Tableau de bord"}
        </h1>
        <div className="mt-1.5 flex items-center gap-2.5">
          <p className="text-sm text-muted-foreground">
            Exercice fiscal {currentExercise}
          </p>
          {selectedFolder && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                isFolderOpen
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isFolderOpen ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {isFolderOpen ? "Ouvert" : "Clôturé"}
            </span>
          )}
        </div>
      </div>

      {/* Workflow pipeline */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Flux de travail
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => navigate(step.path)}
                className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 ${
                  i < workflowSteps.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-xs font-semibold text-muted-foreground">
                  {step.step}
                </span>
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${step.tint}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Accès rapide
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.tint}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight text-foreground">
                    {link.label}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
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
