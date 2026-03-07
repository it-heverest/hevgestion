import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Calendar,
  FileText,
  Upload,
  Settings,
  Cloud,
  Zap,
  Target,
  BarChart3,
  Edit3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";

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
  const uid = user?.id ?? "me";

  const { language } = useApp();

  const workflowSteps = [
    {
      id: "setup",
      title: "Configuration",
      description: "Paramétrer votre environnement",
      icon: <Settings className="h-5 w-5" />,
      status: "En cours",
      statusColor: "bg-blue-100 text-blue-800",
      action: () => navigate(`/${language}/web/user/select-country`),
    },
    {
      id: "exercise",
      title: "Exercice Fiscal",
      description: "Définir la période comptable",
      icon: <Calendar className="h-5 w-5" />,
      status: currentExercise.toString(),
      statusColor: "bg-blue-100 text-blue-800",
      action: () => navigate(`/${language}/web/user/exercise/${uid}/exercise`),
    },
    {
      id: "import",
      title: "Import Données",
      description: "Charger votre balance Excel",
      icon: <Upload className="h-5 w-5" />,
      status: "Prêt",
      statusColor: "bg-green-100 text-green-800",
      action: () => navigate(`/${language}/web/user/import/${uid}/import`),
    },
    {
      id: "process",
      title: "Traitement IA",
      description: "Analyse automatique SYSCOHADA",
      icon: <Zap className="h-5 w-5" />,
      status: "En attente",
      statusColor: "bg-orange-100 text-orange-800",
      action: () =>
        navigate(`/${language}/web/user/traitement/${uid}/traitement`),
    },
    {
      id: "reports",
      title: "Génération DSF",
      description: "Créer vos rapports fiscaux",
      icon: <FileText className="h-5 w-5" />,
      status: "15 rapports",
      statusColor: "bg-purple-100 text-purple-800",
      action: () => navigate(`/${language}/web/user/reports/${uid}/reports`),
    },
    {
      id: "submit",
      title: "Téléversion",
      description: "Soumettre à l'administration",
      icon: <Cloud className="h-5 w-5" />,
      status: "Non envoyé",
      statusColor: "bg-gray-100 text-gray-800",
      action: () =>
        navigate(`/${language}/web/user/televersion/${uid}/televersion`),
    },
  ];

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step) => (
            <Card
              key={step.id}
              className="cursor-pointer hover:shadow-lg hover:scale-105 transition-transform"
              onClick={step.action}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{step.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={step.statusColor}>
                  {step.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
