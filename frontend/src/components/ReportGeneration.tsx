// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Progress } from "./ui/progress";
// import { Alert, AlertDescription } from "./ui/alert";
// import { 
//   Play, 
//   CheckCircle, 
//   AlertCircle, 
//   Clock,
//   FileText,
//   Database,
//   Loader2,
//   BarChart3,
//   Download,
//   Eye,
//   RefreshCw
// } from 'lucide-react';

// interface GenerationStep {
//   id: string;
//   name: string;
//   description: string;
//   status: 'pending' | 'running' | 'completed' | 'error';
//   duration?: number;
//   details?: string;
// }

// interface Report {
//   id: string;
//   name: string;
//   type: string;
//   status: 'generating' | 'completed' | 'error';
//   progress: number;
//   estimatedTime: number;
//   actualTime?: number;
//   size?: string;
//   records?: number;
// }

// export function ReportGeneration() {
//   const [generationStatus, setGenerationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
//   const [currentStep, setCurrentStep] = useState(0);
//   const [overallProgress, setOverallProgress] = useState(0);
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [elapsedTime, setElapsedTime] = useState(0);

//   const [steps, setSteps] = useState<GenerationStep[]>([
//     {
//       id: 'validation',
//       name: 'Validation des paramètres',
//       description: 'Vérification de la configuration et des accès',
//       status: 'pending'
//     },
//     {
//       id: 'connection',
//       name: 'Connexion à l\'ERP',
//       description: 'Établissement de la connexion avec la base de données',
//       status: 'pending'
//     },
//     {
//       id: 'data-extraction',
//       name: 'Extraction des données',
//       description: 'Récupération des données comptables selon les critères',
//       status: 'pending'
//     },
//     {
//       id: 'data-processing',
//       name: 'Traitement des données',
//       description: 'Calculs, regroupements et mise en forme',
//       status: 'pending'
//     },
//     {
//       id: 'report-generation',
//       name: 'Génération des rapports',
//       description: 'Création des états financiers finaux',
//       status: 'pending'
//     },
//     {
//       id: 'finalization',
//       name: 'Finalisation',
//       description: 'Validation et préparation pour export',
//       status: 'pending'
//     }
//   ]);

//   const [reports, setReports] = useState<Report[]>([
//     {
//       id: 'bilan',
//       name: 'Bilan',
//       type: 'principal',
//       status: 'generating',
//       progress: 0,
//       estimatedTime: 300
//     },
//     {
//       id: 'compte-resultat',
//       name: 'Compte de Résultat',
//       type: 'principal',
//       status: 'generating',
//       progress: 0,
//       estimatedTime: 240
//     },
//     {
//       id: 'flux-tresorerie',
//       name: 'Tableau des Flux de Trésorerie',
//       type: 'principal',
//       status: 'generating',
//       progress: 0,
//       estimatedTime: 420
//     },
//     {
//       id: 'balance-generale',
//       name: 'Balance Générale',
//       type: 'analytique',
//       status: 'generating',
//       progress: 0,
//       estimatedTime: 180
//     }
//   ]);

//   // Simulation de la génération
//   useEffect(() => {
//     if (generationStatus === 'running') {
//       const interval = setInterval(() => {
//         setElapsedTime(prev => prev + 1);
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [generationStatus]);

//   const startGeneration = () => {
//     setGenerationStatus('running');
//     setStartTime(new Date());
//     setCurrentStep(0);
//     setOverallProgress(0);

//     // Simulation des étapes
//     let stepIndex = 0;
//     const processStep = () => {
//       if (stepIndex < steps.length) {
//         setSteps(prev => prev.map((step, index) => 
//           index === stepIndex 
//             ? { ...step, status: 'running' }
//             : step
//         ));

//         setCurrentStep(stepIndex);

//         // Durée simulée pour chaque étape
//         const stepDuration = [2000, 3000, 8000, 6000, 5000, 2000][stepIndex];
        
//         setTimeout(() => {
//           setSteps(prev => prev.map((step, index) => 
//             index === stepIndex 
//               ? { ...step, status: 'completed', duration: stepDuration / 1000 }
//               : step
//           ));

//           // Mise à jour du progrès global
//           const newProgress = ((stepIndex + 1) / steps.length) * 100;
//           setOverallProgress(newProgress);

//           stepIndex++;
//           if (stepIndex < steps.length) {
//             setTimeout(processStep, 500);
//           } else {
//             setGenerationStatus('completed');
//             // Finaliser tous les rapports
//             setReports(prev => prev.map(report => ({
//               ...report,
//               status: 'completed' as const,
//               progress: 100,
//               actualTime: Math.floor(Math.random() * 60) + 120,
//               size: `${Math.floor(Math.random() * 500) + 50} KB`,
//               records: Math.floor(Math.random() * 5000) + 1000
//             })));
//           }
//         }, stepDuration);
//       }
//     };

//     processStep();

//     // Simulation du progrès des rapports individuels
//     const reportInterval = setInterval(() => {
//       if (stepIndex >= 2) { // Commencer après l'extraction des données
//         setReports(prev => prev.map(report => {
//           if (report.status === 'generating' && report.progress < 100) {
//             const increment = Math.random() * 15 + 5;
//             const newProgress = Math.min(report.progress + increment, 100);
            
//             return {
//               ...report,
//               progress: newProgress,
//               status: newProgress >= 100 ? 'completed' : 'generating'
//             };
//           }
//           return report;
//         }));
//       }
//     }, 1000);

//     setTimeout(() => {
//       clearInterval(reportInterval);
//     }, 26000);
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case 'running': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
//       case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
//       default: return <Clock className="h-5 w-5 text-gray-400" />;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Génération des Rapports</h2>
//           <p className="text-muted-foreground">
//             Le logiciel compile automatiquement les données pour produire les états financiers
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           {startTime && (
//             <Badge variant="outline" className="flex items-center gap-2">
//               <Clock className="h-4 w-4" />
//               {formatTime(elapsedTime)}
//             </Badge>
//           )}
//           {generationStatus === 'idle' && (
//             <Button onClick={startGeneration} className="flex items-center gap-2">
//               <Play className="h-4 w-4" />
//               Générer les Rapports
//             </Button>
//           )}
//           {generationStatus === 'completed' && (
//             <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
//               <RefreshCw className="h-4 w-4" />
//               Nouvelle Génération
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Progression globale */}
//       {generationStatus !== 'idle' && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5" />
//               Progression Globale
//             </CardTitle>
//             <CardDescription>
//               {generationStatus === 'running' 
//                 ? `Étape ${currentStep + 1} sur ${steps.length} en cours...`
//                 : 'Génération terminée avec succès'
//               }
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium">Progrès global</span>
//                 <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
//               </div>
//               <Progress value={overallProgress} className="h-3" />
              
//               {generationStatus === 'completed' && (
//                 <Alert>
//                   <CheckCircle className="h-4 w-4" />
//                   <AlertDescription>
//                     Tous les rapports ont été générés avec succès en {formatTime(elapsedTime)}.
//                   </AlertDescription>
//                 </Alert>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Étapes de génération */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Database className="h-5 w-5" />
//               Étapes de Traitement
//             </CardTitle>
//             <CardDescription>
//               Processus automatique de compilation des données ERP
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {steps.map((step, index) => (
//                 <div 
//                   key={step.id}
//                   className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
//                     step.status === 'running' ? 'border-blue-200 bg-blue-50' :
//                     step.status === 'completed' ? 'border-green-200 bg-green-50' :
//                     step.status === 'error' ? 'border-red-200 bg-red-50' :
//                     'border-gray-200'
//                   }`}
//                 >
//                   <div className="flex-shrink-0 mt-1">
//                     {getStatusIcon(step.status)}
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between">
//                       <h4 className="font-medium">{step.name}</h4>
//                       {step.duration && (
//                         <span className="text-sm text-muted-foreground">
//                           {step.duration}s
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {step.description}
//                     </p>
//                     {step.details && (
//                       <p className="text-xs text-muted-foreground mt-2">
//                         {step.details}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* État des rapports */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               Rapports en Cours
//             </CardTitle>
//             <CardDescription>
//               État de génération de chaque rapport financier
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {reports.map((report) => (
//                 <div key={report.id} className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-medium">{report.name}</h4>
//                       <div className="flex items-center gap-2 mt-1">
//                         <Badge 
//                           variant={report.type === 'principal' ? 'default' : 'outline'}
//                           className="text-xs"
//                         >
//                           {report.type === 'principal' ? 'Principal' : 'Analytique'}
//                         </Badge>
//                         {report.status === 'completed' && report.records && (
//                           <span className="text-xs text-muted-foreground">
//                             {report.records.toLocaleString('fr-FR')} lignes
//                           </span>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       {report.status === 'completed' ? (
//                         <>
//                           <Button variant="outline" size="sm">
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Button variant="outline" size="sm">
//                             <Download className="h-4 w-4" />
//                           </Button>
//                         </>
//                       ) : (
//                         <div className="flex items-center gap-2">
//                           {getStatusIcon(report.status)}
//                           <span className="text-sm text-muted-foreground">
//                             {Math.round(report.progress)}%
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <Progress value={report.progress} className="h-2" />
                  
//                   {report.status === 'completed' && (
//                     <div className="flex items-center justify-between text-xs text-muted-foreground">
//                       <span>Taille: {report.size}</span>
//                       <span>
//                         {report.actualTime ? 
//                           `Généré en ${formatTime(report.actualTime)}` :
//                           `Temps estimé: ${formatTime(report.estimatedTime)}`
//                         }
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Informations système */}
//       {generationStatus === 'running' && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Database className="h-5 w-5" />
//               Informations Système
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//               <div>
//                 <p className="text-muted-foreground">Serveur ERP</p>
//                 <p className="font-medium">erp.entreprise.com</p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">Base de données</p>
//                 <p className="font-medium">PROD_2024</p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">Société</p>
//                 <p className="font-medium">100 - Société Principale</p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">Période</p>
//                 <p className="font-medium">01/01/2024 - 31/12/2024</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Actions finales */}
//       {generationStatus === 'completed' && (
//         <div className="flex justify-between items-center pt-6 border-t">
//           <div className="text-sm text-muted-foreground">
//             {reports.length} rapport(s) généré(s) avec succès
//           </div>
//           <div className="flex gap-3">
//             <Button variant="outline">
//               Voir les Logs
//             </Button>
//             <Button className="min-w-[160px]">
//               Exporter les Rapports
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }