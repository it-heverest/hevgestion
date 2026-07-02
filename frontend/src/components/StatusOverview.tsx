import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  XCircle,
  TrendingUp,
  Database,
  FileCheck,
  Shield
} from 'lucide-react';

interface StatusItem {
  label: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  value?: string | number;
  progress?: number;
}

interface StatusOverviewProps {
  companyName: string;
  currentExercise: number;
}

export function StatusOverview({ companyName, currentExercise }: StatusOverviewProps) {
  const statusItems: StatusItem[] = [
    { 
      label: 'Balance importée', 
      status: 'success', 
      value: '✓ Importée',
      progress: 100
    },
    { 
      label: 'Conformité SYSCOHADA', 
      status: 'success', 
      value: '95%',
      progress: 95
    },
    { 
      label: 'Traitement', 
      status: 'warning', 
      value: 'En cours',
      progress: 60
    },
    { 
      label: 'États financiers', 
      status: 'pending', 
      value: '6/8 générés',
      progress: 75
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Complété</Badge>;
      case 'warning':
        return <Badge variant="warning">Attention</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'pending':
        return <Badge variant="secondary">En cours</Badge>;
      default:
        return <Badge variant="outline">En attente</Badge>;
    }
  };

  const metrics = [
    {
      icon: Database,
      label: 'Comptes traités',
      value: '247',
    },
    {
      icon: FileCheck,
      label: 'Rapports générés',
      value: '8',
    },
    {
      icon: Shield,
      label: 'Conformité',
      value: '95%',
    },
    {
      icon: TrendingUp,
      label: 'Performance',
      value: 'Excellente',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Métriques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* État détaillé */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">État de Traitement</h3>
          <div className="space-y-4">
            {statusItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                {item.progress !== undefined && (
                  <Progress value={item.progress} className="h-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
