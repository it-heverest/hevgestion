import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3,
  ExternalLink,
  Mail,
  Cloud,
  Settings2,
  CheckCircle
} from 'lucide-react';

const exportFormats = [
  { id: 'pdf', name: 'PDF', icon: FileText, description: 'Document portable' },
  { id: 'excel', name: 'Excel', icon: Table, description: 'Feuille de calcul' },
  { id: 'csv', name: 'CSV', icon: Table, description: 'Données tabulaires' },
  { id: 'json', name: 'JSON', icon: FileText, description: 'Format de données' }
];

const externalTools = [
  { 
    id: 'powerbi', 
    name: 'Power BI', 
    icon: BarChart3, 
    status: 'connected',
    description: 'Tableau de bord analytique'
  },
  { 
    id: 'excel', 
    name: 'Microsoft Excel', 
    icon: Table, 
    status: 'connected',
    description: 'Analyse de données'
  },
  { 
    id: 'tableau', 
    name: 'Tableau', 
    icon: BarChart3, 
    status: 'available',
    description: 'Visualisation avancée'
  }
];

const recentExports = [
  { 
    id: '1', 
    name: 'Bilan Comptable Décembre', 
    format: 'PDF', 
    destination: 'Téléchargement local',
    exportedAt: '15/12/2024 14:35',
    size: '2.4 MB'
  },
  { 
    id: '2', 
    name: 'Compte de Résultat Q4', 
    format: 'Excel', 
    destination: 'Power BI',
    exportedAt: '15/12/2024 14:28',
    size: '1.8 MB'
  },
  { 
    id: '3', 
    name: 'Flux de Trésorerie', 
    format: 'CSV', 
    destination: 'Email envoyé',
    exportedAt: '15/12/2024 13:45',
    size: '850 KB'
  }
];

export function SimpleExports() {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedReports, setSelectedReports] = useState([]);
  const [autoEmail, setAutoEmail] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);

  const availableReports = [
    { id: '1', name: 'Bilan Comptable Décembre 2024', generated: '15/12/2024' },
    { id: '2', name: 'Compte de Résultat Q4 2024', generated: '15/12/2024' },
    { id: '3', name: 'Flux de Trésorerie Novembre 2024', generated: '14/12/2024' },
    { id: '4', name: 'Balance Générale Q4 2024', generated: '14/12/2024' }
  ];

  const handleReportSelection = (reportId, checked) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    }
  };

  const handleExport = () => {
    console.log('Exporting reports:', selectedReports, 'in format:', selectedFormat);
    // Logique d'export ici
  };

  return (
    <div className="space-y-6">
      {/* Export rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter des Rapports
          </CardTitle>
          <CardDescription>
            Sélectionnez les rapports et le format d'export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sélection des rapports */}
            <div className="space-y-4">
              <Label>Rapports disponibles</Label>
              <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                {availableReports.map((report) => (
                  <div key={report.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={report.id}
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) => handleReportSelection(report.id, checked)}
                    />
                    <Label htmlFor={report.id} className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">Généré le {report.generated}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Options d'export */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format d'export</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        <div className="flex items-center gap-2">
                          <format.icon className="h-4 w-4" />
                          <span>{format.name}</span>
                          <span className="text-muted-foreground text-sm">- {format.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-email"
                    checked={autoEmail}
                    onCheckedChange={setAutoEmail}
                  />
                  <Label htmlFor="auto-email" className="cursor-pointer">
                    Envoyer par email automatiquement
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cloud-sync"
                    checked={cloudSync}
                    onCheckedChange={setCloudSync}
                  />
                  <Label htmlFor="cloud-sync" className="cursor-pointer">
                    Synchroniser avec le cloud
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleExport}
            disabled={selectedReports.length === 0}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter {selectedReports.length} rapport{selectedReports.length > 1 ? 's' : ''}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools">Outils Externes</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {externalTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground rounded-lg p-2">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {tool.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={tool.status === 'connected' ? 'default' : 'outline'}
                        className={tool.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {tool.status === 'connected' ? 'Connecté' : 'Disponible'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tool.status === 'connected' ? (
                        <>
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings2 className="h-4 w-4 mr-2" />
                            Configurer
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connecter
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Exports</CardTitle>
              <CardDescription>
                Vos derniers exports et transferts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExports.map((export_item) => (
                  <div key={export_item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{export_item.name}</p>
                        <p className="text-sm text-muted-foreground">{export_item.exportedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{export_item.format}</Badge>
                      <span className="text-sm text-muted-foreground min-w-[60px]">
                        {export_item.size}
                      </span>
                      <span className="text-sm text-muted-foreground min-w-[120px]">
                        {export_item.destination}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
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