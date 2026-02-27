import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Bell, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  type: 'TVA' | 'IS' | 'CNPS' | 'DSF' | 'IFU';
  date: string;
  status: 'urgent' | 'upcoming' | 'completed';
  description: string;
  daysLeft: number;
}

export function TaxDeadlines() {
  const [deadlines] = useState<Deadline[]>([
    {
      id: '1',
      title: 'Déclaration TVA Octobre',
      type: 'TVA',
      date: '2025-11-15',
      status: 'urgent',
      description: 'Déclaration et paiement de la TVA du mois d\'octobre',
      daysLeft: 2
    },
    {
      id: '2',
      title: 'Cotisations CNPS Octobre',
      type: 'CNPS',
      date: '2025-11-15',
      status: 'urgent',
      description: 'Versement des cotisations sociales du mois d\'octobre',
      daysLeft: 2
    },
    {
      id: '3',
      title: 'Acompte IS - 4ème trimestre',
      type: 'IS',
      date: '2025-12-15',
      status: 'upcoming',
      description: 'Paiement du 4ème acompte d\'impôt sur les sociétés',
      daysLeft: 32
    },
    {
      id: '4',
      title: 'Déclaration TVA Novembre',
      type: 'TVA',
      date: '2025-12-15',
      status: 'upcoming',
      description: 'Déclaration et paiement de la TVA du mois de novembre',
      daysLeft: 32
    },
    {
      id: '5',
      title: 'DSF Annuelle 2025',
      type: 'DSF',
      date: '2026-04-30',
      status: 'upcoming',
      description: 'Dépôt de la Déclaration Statistique et Fiscale',
      daysLeft: 169
    },
    {
      id: '6',
      title: 'Déclaration TVA Septembre',
      type: 'TVA',
      date: '2025-10-15',
      status: 'completed',
      description: 'Déclaration et paiement de la TVA du mois de septembre',
      daysLeft: -3
    },
  ]);

  const urgentDeadlines = deadlines.filter(d => d.status === 'urgent');
  const upcomingDeadlines = deadlines.filter(d => d.status === 'upcoming');
  const completedDeadlines = deadlines.filter(d => d.status === 'completed');

  const getStatusColor = (status: Deadline['status']) => {
    switch (status) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getTypeColor = (type: Deadline['type']) => {
    switch (type) {
      case 'TVA':
        return 'bg-blue-100 text-blue-700';
      case 'IS':
        return 'bg-green-100 text-green-700';
      case 'CNPS':
        return 'bg-purple-100 text-purple-700';
      case 'DSF':
        return 'bg-orange-100 text-orange-700';
      case 'IFU':
        return 'bg-pink-100 text-pink-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Alertes et Échéances Fiscales</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Rappels automatiques des obligations fiscales
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Urgent</p>
                <p className="text-2xl text-red-700">{urgentDeadlines.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">À venir</p>
                <p className="text-2xl text-blue-700">{upcomingDeadlines.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Complété</p>
                <p className="text-2xl text-green-700">{completedDeadlines.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Deadlines */}
      {urgentDeadlines.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-700">Échéances Urgentes</CardTitle>
            </div>
            <CardDescription>
              À traiter dans les {Math.min(...urgentDeadlines.map(d => d.daysLeft))} prochains jours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentDeadlines.map((deadline) => (
              <div key={deadline.id} className={`p-4 border rounded-lg ${getStatusColor(deadline.status)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4>{deadline.title}</h4>
                      <Badge className={getTypeColor(deadline.type)}>
                        {deadline.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {deadline.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(deadline.date).toLocaleDateString('fr-FR')}</span>
                      <span className="ml-2 px-2 py-0.5 bg-white/50 rounded">
                        Dans {deadline.daysLeft} jour{deadline.daysLeft > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Traiter
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Échéances à Venir</CardTitle>
          <CardDescription>Prochaines obligations fiscales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingDeadlines.map((deadline) => (
            <div key={deadline.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4>{deadline.title}</h4>
                    <Badge className={getTypeColor(deadline.type)} variant="outline">
                      {deadline.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {deadline.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{new Date(deadline.date).toLocaleDateString('fr-FR')}</span>
                    <span className="text-muted-foreground">
                      (Dans {deadline.daysLeft} jours)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completed Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Échéances Traitées</CardTitle>
          <CardDescription>Obligations complétées récemment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedDeadlines.map((deadline) => (
            <div key={deadline.id} className="p-4 border rounded-lg bg-green-50/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <h4 className="text-muted-foreground">{deadline.title}</h4>
                    <Badge className={getTypeColor(deadline.type)} variant="outline">
                      {deadline.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {deadline.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres des Alertes</CardTitle>
          <CardDescription>Configurer les rappels automatiques</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Vous recevrez des notifications par email 7 jours, 3 jours et 1 jour avant chaque échéance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
