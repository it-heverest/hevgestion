import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  FileText, 
  Download, 
  Play, 
  Calendar,
  Settings2,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const reportTemplates = [
  {
    id: 'bilan',
    name: 'Bilan Comptable',
    description: 'État de la situation financière',
    icon: FileText,
    estimatedTime: '3-5 min',
    lastGenerated: '15/12/2024'
  },
  {
    id: 'resultat',
    name: 'Compte de Résultat',
    description: 'Performance financière de la période',
    icon: FileText,
    estimatedTime: '2-4 min',
    lastGenerated: '15/12/2024'
  },
  {
    id: 'flux',
    name: 'Flux de Trésorerie',
    description: 'Mouvements de trésorerie',
    icon: FileText,
    estimatedTime: '4-6 min',
    lastGenerated: '14/12/2024'
  },
  {
    id: 'balance',
    name: 'Balance Générale',
    description: 'Balance de tous les comptes',
    icon: FileText,
    estimatedTime: '5-8 min',
    lastGenerated: '14/12/2024'
  }
];

const recentReports = [
  { id: '1', name: 'Bilan Comptable Décembre 2024', status: 'Complété', generatedAt: '15/12/2024 14:35', size: '2.4 MB', format: 'PDF' },
  { id: '2', name: 'Compte de Résultat Q4 2024', status: 'Complété', generatedAt: '15/12/2024 14:28', size: '1.8 MB', format: 'Excel' },
  { id: '3', name: 'Flux de Trésorerie Novembre', status: 'En cours', generatedAt: '15/12/2024 14:45', size: '~950 KB', format: 'PDF' },
  { id: '4', name: 'Balance Générale Q4', status: 'Programmé', generatedAt: '15/12/2024 15:00', size: '~3.1 MB', format: 'Excel' }
];

export function SimpleReports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerateReport = () => {
    if (!selectedReport || !selectedPeriod) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulation de génération de rapport
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Génération rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Générer un Rapport
          </CardTitle>
          <CardDescription>
            Sélectionnez le type de rapport et la période pour générer automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Type de rapport</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un rapport" />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period">Période</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois précédent</SelectItem>
                  <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
                  <SelectItem value="last-quarter">Trimestre précédent</SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <Input type="date" id="start-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin</Label>
                <Input type="date" id="end-date" />
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Génération en cours...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleGenerateReport}
            disabled={!selectedReport || !selectedPeriod || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Générer le Rapport
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Modèles de Rapports</TabsTrigger>
          <TabsTrigger value="recent">Rapports Récents</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground rounded-lg p-2">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Temps estimé:</span>
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dernière génération:</span>
                        <span>{template.lastGenerated}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedReport(template.id);
                          setSelectedPeriod('current-month');
                        }}
                      >
                        Utiliser ce modèle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Rapports Récents</CardTitle>
              <CardDescription>
                Vos derniers rapports générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">{report.generatedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{report.format}</Badge>
                      <Badge 
                        variant={
                          report.status === 'Complété' ? 'default' :
                          report.status === 'En cours' ? 'secondary' : 'outline'
                        }
                        className={
                          report.status === 'Complété' ? 'bg-green-100 text-green-800' :
                          report.status === 'En cours' ? 'bg-blue-100 text-blue-800' : ''
                        }
                      >
                        {report.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground min-w-[60px]">
                        {report.size}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}