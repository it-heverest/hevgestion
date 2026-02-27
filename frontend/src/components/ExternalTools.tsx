import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  ExternalLink, 
  FileSpreadsheet,
  BarChart3,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
  Download,
  Upload,
  Workflow,
  PieChart,
  TrendingUp
} from 'lucide-react';

interface ExternalTool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: 'connected' | 'disconnected' | 'available';
  features: string[];
  integrationLevel: 'basic' | 'advanced' | 'full';
}

interface Integration {
  id: string;
  toolName: string;
  description: string;
  lastSync: Date;
  dataTypes: string[];
  status: 'active' | 'inactive';
}

export function ExternalTools() {
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>(['excel', 'powerbi']);

  const externalTools: ExternalTool[] = [
    {
      id: 'excel',
      name: 'Microsoft Excel',
      description: 'Exportez vos données vers Excel pour une analyse flexible et la création de tableaux de bord personnalisés',
      icon: FileSpreadsheet,
      category: 'spreadsheet',
      status: 'connected',
      features: ['Export direct', 'Modèles personnalisés', 'Macros automatiques', 'Tableaux croisés dynamiques'],
      integrationLevel: 'full'
    },
    {
      id: 'powerbi',
      name: 'Microsoft Power BI',
      description: 'Créez des rapports financiers interactifs et des tableaux de bord visuels avec Power BI',
      icon: BarChart3,
      category: 'bi',
      status: 'connected',
      features: ['Connexion directe', 'Rafraîchissement auto', 'Dashboards interactifs', 'Alertes intelligentes'],
      integrationLevel: 'advanced'
    },
    {
      id: 'tableau',
      name: 'Tableau',
      description: 'Plateforme de visualisation de données pour des analyses financières avancées',
      icon: PieChart,
      category: 'bi',
      status: 'available',
      features: ['Visualisations avancées', 'Analytics prédictifs', 'Collaboration', 'Mobile'],
      integrationLevel: 'advanced'
    },
    {
      id: 'spreadsheet-server',
      name: 'Spreadsheet Server',
      description: 'Solution spécialisée pour l\'intégration ERP avec des capacités de reporting avancées',
      icon: Database,
      category: 'specialized',
      status: 'available',
      features: ['Intégration ERP native', 'Reporting temps réel', 'Sécurité avancée', 'Audit trail'],
      integrationLevel: 'full'
    },
    {
      id: 'jet-reports',
      name: 'Jet Reports',
      description: 'Outil de reporting spécialement conçu pour s\'intégrer avec les ERP (SAP, Oracle, Dynamics)',
      icon: TrendingUp,
      category: 'specialized',
      status: 'available',
      features: ['Templates prêts à l\'emploi', 'Drill-down', 'Formatage automatique', 'Distribution'],
      integrationLevel: 'full'
    },
    {
      id: 'qlik-sense',
      name: 'QlikSense',
      description: 'Plateforme de BI moderne avec des capacités d\'analyse associative',
      icon: BarChart3,
      category: 'bi',
      status: 'available',
      features: ['Analyse associative', 'Self-service BI', 'Storytelling', 'Alertes intelligentes'],
      integrationLevel: 'advanced'
    }
  ];

  const currentIntegrations: Integration[] = [
    {
      id: 'excel-integration',
      toolName: 'Microsoft Excel',
      description: 'Export automatique des états financiers vers des modèles Excel prédéfinis',
      lastSync: new Date(2024, 11, 15, 14, 45),
      dataTypes: ['Bilan', 'Compte de résultat', 'Balance générale'],
      status: 'active'
    },
    {
      id: 'powerbi-integration',
      toolName: 'Microsoft Power BI',
      description: 'Tableau de bord financier en temps réel avec KPIs et alertes',
      lastSync: new Date(2024, 11, 15, 15, 0),
      dataTypes: ['KPIs financiers', 'Ratios', 'Tendances', 'Comparatifs'],
      status: 'active'
    }
  ];

  const toggleIntegration = (toolId: string) => {
    setActiveIntegrations(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-red-100 text-red-800 border-red-200';
      case 'available': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIntegrationColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'full': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [
    { id: 'spreadsheet', name: 'Tableurs', description: 'Outils de calcul et d\'analyse' },
    { id: 'bi', name: 'Business Intelligence', description: 'Plateformes de visualisation et d\'analyse' },
    { id: 'specialized', name: 'Solutions Spécialisées', description: 'Outils spécifiques aux ERP' }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Outils Externes</h2>
          <p className="text-muted-foreground">
            Connectez et intégrez des outils externes pour des analyses plus poussées
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          {activeIntegrations.length} intégration(s) active(s)
        </Badge>
      </div>

      {/* Informations importantes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Recommandation :</strong> Utilisez Excel pour des analyses flexibles, Power BI ou Tableau pour des tableaux de bord visuels, 
          et des solutions spécialisées comme Spreadsheet Server ou Jet Reports pour une intégration ERP avancée.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Outils Disponibles</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations Actives</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          {categories.map((category) => {
            const categoryTools = externalTools.filter(tool => tool.category === category.id);
            
            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {categoryTools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = activeIntegrations.includes(tool.id);
                      
                      return (
                        <div 
                          key={tool.id}
                          className={`p-6 border rounded-lg transition-all ${
                            isActive ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Icon className="h-8 w-8 text-primary" />
                              <div>
                                <h3 className="font-semibold">{tool.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline"
                                    className={getStatusColor(tool.status)}
                                  >
                                    {tool.status === 'connected' ? 'Connecté' :
                                     tool.status === 'disconnected' ? 'Déconnecté' : 'Disponible'}
                                  </Badge>
                                  <Badge 
                                    variant="outline"
                                    className={getIntegrationColor(tool.integrationLevel)}
                                  >
                                    {tool.integrationLevel === 'basic' ? 'Basique' :
                                     tool.integrationLevel === 'advanced' ? 'Avancé' : 'Complet'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {tool.status === 'connected' && (
                                <Switch 
                                  checked={isActive}
                                  onCheckedChange={() => toggleIntegration(tool.id)}
                                />
                              )}
                              {tool.status === 'available' && (
                                <Button variant="outline" size="sm">
                                  Connecter
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">
                            {tool.description}
                          </p>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Fonctionnalités :</h4>
                            <div className="grid grid-cols-2 gap-1">
                              {tool.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {tool.status === 'connected' && isActive && (
                            <div className="mt-4 pt-4 border-t flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Exporter
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ouvrir
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Intégrations Configurées
              </CardTitle>
              <CardDescription>
                Gestion des connexions actives avec les outils externes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentIntegrations.map((integration) => (
                  <div key={integration.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{integration.toolName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={integration.status === 'active' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {integration.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          Dernière synchro : {integration.lastSync.toLocaleString('fr-FR')}
                        </span>
                        <div className="flex gap-1">
                          {integration.dataTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Synchroniser
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileSpreadsheet className="h-5 w-5" />
                  Excel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Rapide
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Modèles
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir Excel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5" />
                  Power BI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Publier
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir Power BI
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="h-5 w-5" />
                  Tableau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Connecter d'abord
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Workbook
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Configurer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Générale
              </CardTitle>
              <CardDescription>
                Paramètres globaux pour les intégrations externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync" className="text-base">Synchronisation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Synchroniser automatiquement les données avec les outils connectés
                    </p>
                  </div>
                  <Switch id="auto-sync" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-base">Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes lors des synchronisations
                    </p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compression" className="text-base">Compression des exports</Label>
                    <p className="text-sm text-muted-foreground">
                      Compresser automatiquement les gros volumes de données
                    </p>
                  </div>
                  <Switch id="compression" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Format d'export par défaut</Label>
                  <Input id="export-format" value="Excel (.xlsx)" readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Fréquence de synchronisation</Label>
                  <Input id="sync-frequency" value="Toutes les heures" readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retention">Rétention des données</Label>
                  <Input id="retention" value="30 jours" readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration spécifique par outil */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration par Outil</CardTitle>
              <CardDescription>
                Paramètres spécifiques pour chaque intégration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="excel-config" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="excel-config">Excel</TabsTrigger>
                  <TabsTrigger value="powerbi-config">Power BI</TabsTrigger>
                </TabsList>
                
                <TabsContent value="excel-config" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="excel-template">Modèle par défaut</Label>
                      <Input id="excel-template" value="Template_Etats_Financiers.xlsx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excel-format">Format de date</Label>
                      <Input id="excel-format" value="dd/mm/yyyy" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="excel-macros">Activer les macros</Label>
                      <p className="text-sm text-muted-foreground">
                        Exécuter automatiquement les macros lors de l'export
                      </p>
                    </div>
                    <Switch id="excel-macros" defaultChecked />
                  </div>
                </TabsContent>
                
                <TabsContent value="powerbi-config" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="powerbi-workspace">Workspace</Label>
                      <Input id="powerbi-workspace" value="Finance Department" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="powerbi-dataset">Dataset principal</Label>
                      <Input id="powerbi-dataset" value="Financial_Data_2024" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="powerbi-refresh">Actualisation automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Actualiser automatiquement les datasets Power BI
                      </p>
                    </div>
                    <Switch id="powerbi-refresh" defaultChecked />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}