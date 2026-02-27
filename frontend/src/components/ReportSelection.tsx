// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { Checkbox } from "./ui/checkbox";
// import { 
//   FileText, 
//   BarChart3, 
//   TrendingUp, 
//   PieChart,
//   DollarSign,
//   Calendar,
//   Calculator,
//   FileBarChart,
//   Target,
//   Activity
// } from 'lucide-react';

// interface FinancialReport {
//   id: string;
//   name: string;
//   description: string;
//   icon: any;
//   category: string;
//   complexity: 'simple' | 'medium' | 'complex';
//   estimatedTime: string;
//   required: boolean;
// }

// export function ReportSelection() {
//   const [selectedReports, setSelectedReports] = useState<string[]>([]);

//   const financialReports: FinancialReport[] = [
//     // États financiers principaux
//     {
//       id: 'bilan',
//       name: 'Bilan',
//       description: 'État de la situation financière à une date donnée',
//       icon: BarChart3,
//       category: 'principal',
//       complexity: 'medium',
//       estimatedTime: '5-10 min',
//       required: true
//     },
//     {
//       id: 'compte-resultat',
//       name: 'Compte de Résultat',
//       description: 'Revenus et charges sur une période donnée',
//       icon: TrendingUp,
//       category: 'principal',
//       complexity: 'medium',
//       estimatedTime: '5-10 min',
//       required: true
//     },
//     {
//       id: 'flux-tresorerie',
//       name: 'Tableau des Flux de Trésorerie',
//       description: 'Mouvements de trésorerie par activité',
//       icon: DollarSign,
//       category: 'principal',
//       complexity: 'complex',
//       estimatedTime: '10-15 min',
//       required: true
//     },
    
//     // Rapports analytiques
//     {
//       id: 'balance-generale',
//       name: 'Balance Générale',
//       description: 'Soldes de tous les comptes du plan comptable',
//       icon: Calculator,
//       category: 'analytique',
//       complexity: 'simple',
//       estimatedTime: '2-5 min',
//       required: false
//     },
//     {
//       id: 'balance-agee',
//       name: 'Balance Âgée',
//       description: 'Analyse des créances et dettes par échéance',
//       icon: Calendar,
//       category: 'analytique',
//       complexity: 'medium',
//       estimatedTime: '5-10 min',
//       required: false
//     },
//     {
//       id: 'analyse-rentabilite',
//       name: 'Analyse de Rentabilité',
//       description: 'Ratios et indicateurs de performance financière',
//       icon: Target,
//       category: 'analytique',
//       complexity: 'complex',
//       estimatedTime: '10-20 min',
//       required: false
//     },
    
//     // Rapports de gestion
//     {
//       id: 'budget-realise',
//       name: 'Budget vs Réalisé',
//       description: 'Comparaison entre budget et réalisations',
//       icon: PieChart,
//       category: 'gestion',
//       complexity: 'medium',
//       estimatedTime: '5-10 min',
//       required: false
//     },
//     {
//       id: 'centres-couts',
//       name: 'Rapport par Centres de Coûts',
//       description: 'Analyse financière par centre de responsabilité',
//       icon: FileBarChart,
//       category: 'gestion',
//       complexity: 'complex',
//       estimatedTime: '10-15 min',
//       required: false
//     },
//     {
//       id: 'kpi-financiers',
//       name: 'KPI Financiers',
//       description: 'Tableau de bord des indicateurs clés',
//       icon: Activity,
//       category: 'gestion',
//       complexity: 'medium',
//       estimatedTime: '5-10 min',
//       required: false
//     }
//   ];

//   const categories = [
//     { id: 'principal', name: 'États Financiers Principaux', description: 'Bilan, compte de résultat, flux de trésorerie' },
//     { id: 'analytique', name: 'Rapports Analytiques', description: 'Balances, analyses détaillées' },
//     { id: 'gestion', name: 'Rapports de Gestion', description: 'Budgets, centres de coûts, KPI' }
//   ];

//   const toggleReport = (reportId: string) => {
//     setSelectedReports(prev => 
//       prev.includes(reportId) 
//         ? prev.filter(id => id !== reportId)
//         : [...prev, reportId]
//     );
//   };

//   const getComplexityColor = (complexity: string) => {
//     switch (complexity) {
//       case 'simple': return 'bg-green-100 text-green-800 border-green-200';
//       case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'complex': return 'bg-red-100 text-red-800 border-red-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const requiredReports = financialReports.filter(report => report.required);
//   const optionalReports = financialReports.filter(report => !report.required);

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Sélection des Rapports</h2>
//           <p className="text-muted-foreground">
//             Choisissez les types d'états financiers à générer
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <Badge variant="outline" className="flex items-center gap-2">
//             <FileText className="h-4 w-4" />
//             {selectedReports.length} rapport(s) sélectionné(s)
//           </Badge>
//           <Button 
//             onClick={() => setSelectedReports(financialReports.map(r => r.id))}
//             variant="outline"
//             size="sm"
//           >
//             Sélectionner tout
//           </Button>
//           <Button 
//             onClick={() => setSelectedReports([])}
//             variant="outline"
//             size="sm"
//           >
//             Désélectionner tout
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="categories" className="w-full">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="categories">Par Catégories</TabsTrigger>
//           <TabsTrigger value="all">Tous les Rapports</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="categories" className="space-y-6">
//           {categories.map((category) => {
//             const categoryReports = financialReports.filter(report => report.category === category.id);
            
//             return (
//               <Card key={category.id}>
//                 <CardHeader>
//                   <CardTitle>{category.name}</CardTitle>
//                   <CardDescription>{category.description}</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                     {categoryReports.map((report) => {
//                       const Icon = report.icon;
//                       const isSelected = selectedReports.includes(report.id);
                      
//                       return (
//                         <div 
//                           key={report.id}
//                           className={`p-4 border rounded-lg cursor-pointer transition-all ${
//                             isSelected 
//                               ? 'border-primary bg-primary/5' 
//                               : 'border-gray-200 hover:border-gray-300'
//                           }`}
//                           onClick={() => toggleReport(report.id)}
//                         >
//                           <div className="flex items-start gap-3">
//                             <Checkbox 
//                               checked={isSelected}
//                               onCheckedChange={() => toggleReport(report.id)}
//                             />
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-2">
//                                 <Icon className="h-5 w-5 text-primary" />
//                                 <h4 className="font-medium">{report.name}</h4>
//                                 {report.required && (
//                                   <Badge variant="default" className="text-xs">
//                                     Requis
//                                   </Badge>
//                                 )}
//                               </div>
//                               <p className="text-sm text-muted-foreground mb-3">
//                                 {report.description}
//                               </p>
//                               <div className="flex items-center gap-2">
//                                 <Badge 
//                                   variant="outline"
//                                   className={getComplexityColor(report.complexity)}
//                                 >
//                                   {report.complexity === 'simple' ? 'Simple' : 
//                                    report.complexity === 'medium' ? 'Moyen' : 'Complexe'}
//                                 </Badge>
//                                 <span className="text-xs text-muted-foreground">
//                                   ~{report.estimatedTime}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </TabsContent>
        
//         <TabsContent value="all" className="space-y-6">
//           {/* Rapports requis */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="h-5 w-5" />
//                 Rapports Requis
//               </CardTitle>
//               <CardDescription>
//                 Ces rapports sont obligatoires et seront automatiquement inclus
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {requiredReports.map((report) => {
//                   const Icon = report.icon;
                  
//                   return (
//                     <div 
//                       key={report.id}
//                       className="p-4 border-2 border-primary bg-primary/5 rounded-lg"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox checked={true} disabled />
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <Icon className="h-5 w-5 text-primary" />
//                             <h4 className="font-medium">{report.name}</h4>
//                             <Badge variant="default" className="text-xs">
//                               Requis
//                             </Badge>
//                           </div>
//                           <p className="text-sm text-muted-foreground mb-3">
//                             {report.description}
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <Badge 
//                               variant="outline"
//                               className={getComplexityColor(report.complexity)}
//                             >
//                               {report.complexity === 'simple' ? 'Simple' : 
//                                report.complexity === 'medium' ? 'Moyen' : 'Complexe'}
//                             </Badge>
//                             <span className="text-xs text-muted-foreground">
//                               ~{report.estimatedTime}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Rapports optionnels */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <BarChart3 className="h-5 w-5" />
//                 Rapports Optionnels
//               </CardTitle>
//               <CardDescription>
//                 Sélectionnez les rapports supplémentaires selon vos besoins
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {optionalReports.map((report) => {
//                   const Icon = report.icon;
//                   const isSelected = selectedReports.includes(report.id);
                  
//                   return (
//                     <div 
//                       key={report.id}
//                       className={`p-4 border rounded-lg cursor-pointer transition-all ${
//                         isSelected 
//                           ? 'border-primary bg-primary/5' 
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => toggleReport(report.id)}
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox 
//                           checked={isSelected}
//                           onCheckedChange={() => toggleReport(report.id)}
//                         />
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <Icon className="h-5 w-5 text-primary" />
//                             <h4 className="font-medium">{report.name}</h4>
//                           </div>
//                           <p className="text-sm text-muted-foreground mb-3">
//                             {report.description}
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <Badge 
//                               variant="outline"
//                               className={getComplexityColor(report.complexity)}
//                             >
//                               {report.complexity === 'simple' ? 'Simple' : 
//                                report.complexity === 'medium' ? 'Moyen' : 'Complexe'}
//                             </Badge>
//                             <span className="text-xs text-muted-foreground">
//                               ~{report.estimatedTime}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Actions */}
//       <div className="flex justify-between items-center pt-6 border-t">
//         <div className="text-sm text-muted-foreground">
//           {selectedReports.length > 0 && (
//             <>
//               Temps estimé total : {
//                 financialReports
//                   .filter(r => selectedReports.includes(r.id) || r.required)
//                   .reduce((total, report) => {
//                     const time = parseInt(report.estimatedTime.split('-')[1]);
//                     return total + time;
//                   }, 0)
//               } minutes
//             </>
//           )}
//         </div>
//         <div className="flex gap-3">
//           <Button variant="outline">
//             Annuler
//           </Button>
//           <Button 
//             disabled={selectedReports.length === 0}
//             className="min-w-[120px]"
//           >
//             Continuer
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }