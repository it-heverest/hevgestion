import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, FileText, Upload, CheckCircle2, Calculator } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function OperationHistory() {
  const { history } = useApp();

  const getIcon = (action: string) => {
    if (action.includes('Import')) return <Upload className="h-4 w-4" />;
    if (action.includes('Traitement')) return <Calculator className="h-4 w-4" />;
    if (action.includes('Rapport') || action.includes('État')) return <FileText className="h-4 w-4" />;
    if (action.includes('exercice')) return <Clock className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getColor = (action: string) => {
    if (action.includes('Import')) return 'text-blue-600 bg-blue-50';
    if (action.includes('Traitement')) return 'text-purple-600 bg-purple-50';
    if (action.includes('Rapport') || action.includes('État')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Historique des Opérations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toutes les actions effectuées dans l'application
        </p>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="mb-2">Aucune opération enregistrée</h3>
            <p className="text-sm text-muted-foreground">
              Les actions que vous effectuez seront affichées ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getColor(entry.action)}`}>
                    {getIcon(entry.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4>{entry.action}</h4>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.user}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
