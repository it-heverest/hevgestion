import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Settings2,
  Wifi,
  Lock,
  Users,
  Building2
} from 'lucide-react';

export function ERPConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [selectedERP, setSelectedERP] = useState('');

  const erpSystems = [
    { id: 'sap', name: 'SAP', version: 'S/4HANA', status: 'supported' },
    { id: 'oracle', name: 'Oracle ERP Cloud', version: '23C', status: 'supported' },
    { id: 'dynamics', name: 'Microsoft Dynamics 365', version: 'Business Central', status: 'supported' },
    { id: 'netsuite', name: 'NetSuite', version: '2024.1', status: 'supported' },
    { id: 'sage', name: 'Sage X3', version: '12', status: 'supported' },
    { id: 'epicor', name: 'Epicor ERP', version: '10.2', status: 'supported' }
  ];

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connexion ERP</h2>
          <p className="text-muted-foreground">
            Connectez-vous à votre système ERP pour accéder au module de gestion financière
          </p>
        </div>
        <Badge 
          variant={connectionStatus === 'connected' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          {connectionStatus === 'connected' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Connecté
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              Déconnecté
            </>
          )}
        </Badge>
      </div>

      {/* Statut de connexion */}
      {connectionStatus === 'connected' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Connexion établie avec succès. Vous pouvez maintenant accéder aux modules de gestion financière et de comptabilité.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration de connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuration ERP
            </CardTitle>
            <CardDescription>
              Sélectionnez et configurez votre système ERP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="selection" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="selection">Sélection ERP</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="selection" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="erp-select">Système ERP</Label>
                  <Select onValueChange={setSelectedERP}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre ERP" />
                    </SelectTrigger>
                    <SelectContent>
                      {erpSystems.map((erp) => (
                        <SelectItem key={erp.id} value={erp.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{erp.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {erp.version}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedERP && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="server">Serveur</Label>
                        <Input id="server" placeholder="https://erp.entreprise.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" placeholder="443" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="database">Base de données</Label>
                      <Input id="database" placeholder="PROD_DB" />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="config" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input id="username" placeholder="utilisateur.erp" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine</Label>
                  <Input id="domain" placeholder="ENTREPRISE" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Code société</Label>
                  <Input id="company" placeholder="100" />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleConnect}
                disabled={connectionStatus === 'connecting' || !selectedERP}
                className="flex-1"
              >
                {connectionStatus === 'connecting' ? 'Connexion...' : 'Se connecter'}
              </Button>
              {connectionStatus === 'connected' && (
                <Button 
                  variant="outline" 
                  onClick={() => setConnectionStatus('disconnected')}
                >
                  Déconnecter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <div className="space-y-6">
          {/* Systèmes ERP supportés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Systèmes Supportés
              </CardTitle>
              <CardDescription>
                ERP compatibles avec notre module financier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {erpSystems.map((erp) => (
                  <div key={erp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{erp.name}</p>
                      <p className="text-sm text-muted-foreground">{erp.version}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Supporté
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statut de connexion détaillé */}
          {connectionStatus === 'connected' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Statut de Connexion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Base de données
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Authentification
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Validée
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Permissions
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Comptabilité
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Module financier
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Accessible
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Dernière connexion : {new Date().toLocaleString('fr-FR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}