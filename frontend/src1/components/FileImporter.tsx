import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  Upload, 
  FileText, 
  Download, 
  Play,
  Table,
  File,
  BarChart3,
  CheckCircle,
  Clock,
  Database,
  X,
  Eye,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const supportedFormats = [
  { id: 'excel', name: 'Excel', ext: '.xlsx, .xls', icon: Table, color: 'green' },
  { id: 'csv', name: 'CSV', ext: '.csv', icon: File, color: 'blue' },
  { id: 'sap', name: 'SAP Export', ext: '.xml, .txt', icon: Database, color: 'orange' },
  { id: 'oracle', name: 'Oracle Export', ext: '.xml, .json', icon: Database, color: 'red' },
  { id: 'json', name: 'JSON', ext: '.json', icon: FileText, color: 'purple' }
];

const reportTypes = [
  { id: 'bilan', name: 'Bilan Comptable', description: 'Actifs, passifs et capitaux propres' },
  { id: 'resultat', name: 'Compte de Résultat', description: 'Produits et charges de l\'exercice' },
  { id: 'flux', name: 'Tableau des Flux de Trésorerie', description: 'Mouvements de trésorerie' },
  { id: 'balance', name: 'Balance Générale', description: 'Balance de tous les comptes' },
  { id: 'analytique', name: 'Rapports Analytiques', description: 'Analyses par centre de coût' }
];

export function FileImporter() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState(['bilan', 'resultat']);
  const fileInputRef = useRef(null);

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'uploaded'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFiles = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulation du traitement des fichiers
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Simulation de données parsées
          setParsedData({
            companyName: "Entreprise XYZ SARL",
            period: "2024",
            accounts: {
              revenue: 850000,
              expenses: 620000,
              assets: 1250000,
              liabilities: 450000,
              equity: 800000,
              cashFlow: 180000
            },
            recordsCount: 1247,
            lastUpdate: new Date().toLocaleString('fr-FR')
          });
          
          // Génération automatique des rapports sélectionnés
          const reports = selectedReports.map(reportId => {
            const reportType = reportTypes.find(r => r.id === reportId);
            return {
              id: Date.now() + Math.random(),
              type: reportType.name,
              name: `${reportType.name}_${Date.now()}`,
              format: 'PDF',
              size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
              generatedAt: new Date().toLocaleString('fr-FR'),
              status: 'completed'
            };
          });
          
          setGeneratedReports(reports);
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReportSelection = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Import de Fichiers</h2>
          <p className="text-muted-foreground">
            Importez vos fichiers ERP/Excel et générez automatiquement vos rapports financiers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone d'upload */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import des Données
              </CardTitle>
              <CardDescription>
                Glissez-déposez vos fichiers ou cliquez pour les sélectionner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Glissez vos fichiers ici</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ou cliquez pour parcourir
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.xml,.json,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <div className="flex flex-wrap justify-center gap-2">
                  {supportedFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <Badge key={format.id} variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {format.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Fichiers importés ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Prêt
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Données parsées */}
          {parsedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Données Détectées
                </CardTitle>
                <CardDescription>
                  Aperçu des données financières extraites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Entreprise</p>
                    <p className="font-medium">{parsedData.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Période</p>
                    <p className="font-medium">{parsedData.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enregistrements</p>
                    <p className="font-medium">{parsedData.recordsCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                    <p className="font-medium">{parsedData.lastUpdate}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                    <p className="font-bold text-green-600">
                      {parsedData.accounts.revenue.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Charges</p>
                    <p className="font-bold text-red-600">
                      {parsedData.accounts.expenses.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Résultat Net</p>
                    <p className="font-bold text-blue-600">
                      {(parsedData.accounts.revenue - parsedData.accounts.expenses).toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Configuration et génération */}
        <div className="space-y-6">
          {/* Sélection des rapports */}
          <Card>
            <CardHeader>
              <CardTitle>Rapports à Générer</CardTitle>
              <CardDescription>
                Sélectionnez les rapports financiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedReports.includes(report.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleReportSelection(report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    {selectedReports.includes(report.id) && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Traitement */}
          <Card>
            <CardHeader>
              <CardTitle>Traitement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Analyse en cours...</span>
                    <span className="text-sm">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Extraction des données et génération des rapports...
                  </p>
                </div>
              )}

              <Button 
                onClick={processFiles}
                disabled={uploadedFiles.length === 0 || isProcessing || selectedReports.length === 0}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analyser et Générer
                  </>
                )}
              </Button>

              {uploadedFiles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Importez d'abord vos fichiers
                </p>
              )}
              {selectedReports.length === 0 && uploadedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Sélectionnez au moins un type de rapport
                </p>
              )}
            </CardContent>
          </Card>

          {/* Aperçu financier */}
          {parsedData && (
            <Card>
              <CardHeader>
                <CardTitle>Résumé Financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Actifs:</span>
                  <span className="font-medium">
                    {parsedData.accounts.assets.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Passifs:</span>
                  <span className="font-medium">
                    {parsedData.accounts.liabilities.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capitaux Propres:</span>
                  <span className="font-medium">
                    {parsedData.accounts.equity.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Flux de Trésorerie:</span>
                  <span className="font-medium text-green-600">
                    +{parsedData.accounts.cashFlow.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rapports générés */}
      {generatedReports.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Rapports Générés avec Succès !
            </CardTitle>
            <CardDescription>
              {generatedReports.length} rapport(s) financier(s) prêt(s) au téléchargement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 rounded-lg p-2">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{report.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.format} • {report.size} • {report.generatedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complété
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}