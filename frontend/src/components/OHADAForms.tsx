// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { Alert, AlertDescription } from './ui/alert';
// import { Download, FileCheck, Calendar, Info, CheckCircle2 } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// interface OHADAFormsProps {
//   country: {
//     name: string;
//     code: string;
//     currency: string;
//   };
//   companyName: string;
// }

// export function OHADAForms({ country, companyName }: OHADAFormsProps) {
//   const generateIFU = () => {
//     // Simuler la génération du formulaire IFU
//     alert('Génération du formulaire IFU en cours...');
//   };

//   const generateCNPS = () => {
//     // Simuler la génération du formulaire CNPS
//     alert('Génération de la déclaration CNPS en cours...');
//   };

//   const generateDSF = () => {
//     // Simuler la génération de la DSF
//     alert('Génération de la Déclaration Statistique et Fiscale en cours...');
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>Formulaires OHADA Pré-remplis</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           {companyName} - {country.name}
//         </p>
//       </div>

//       {/* Status Overview */}
//       <Card>
//         <CardHeader>
//           <CardTitle>État des Formulaires</CardTitle>
//           <CardDescription>Formulaires disponibles pour l'exercice en cours</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="p-4 border rounded-lg">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm">IFU</span>
//                 <Badge variant="default">Prêt</Badge>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Identifiant Fiscal Unique
//               </p>
//             </div>
//             <div className="p-4 border rounded-lg">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm">CNPS</span>
//                 <Badge variant="default">Prêt</Badge>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Déclaration cotisations sociales
//               </p>
//             </div>
//             <div className="p-4 border rounded-lg">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm">DSF</span>
//                 <Badge variant="default">Prêt</Badge>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Déclaration Statistique et Fiscale
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="ifu" className="w-full">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="ifu">IFU</TabsTrigger>
//           <TabsTrigger value="cnps">CNPS</TabsTrigger>
//           <TabsTrigger value="dsf">DSF</TabsTrigger>
//         </TabsList>

//         {/* IFU Form */}
//         <TabsContent value="ifu" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Formulaire IFU</CardTitle>
//                   <CardDescription>
//                     Identifiant Fiscal Unique - {country.name}
//                   </CardDescription>
//                 </div>
//                 <FileCheck className="h-8 w-8 text-orange-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertDescription>
//                   Ce formulaire est pré-rempli avec les données de votre balance comptable.
//                 </AlertDescription>
//               </Alert>

//               <div className="space-y-3">
//                 <div className="p-4 bg-accent rounded-lg">
//                   <h4 className="mb-3">Données pré-remplies</h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Raison sociale</span>
//                       <span>{companyName}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Pays</span>
//                       <span>{country.name}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Devise</span>
//                       <span>{country.currency}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Exercice</span>
//                       <span>2025</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Chiffre d'affaires</span>
//                       <span>1 250 000 {country.currency}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Résultat fiscal</span>
//                       <span>125 000 {country.currency}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
//                   <div className="flex items-start gap-3">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
//                     <div>
//                       <p className="text-sm mb-1">Formulaire validé</p>
//                       <p className="text-xs text-muted-foreground">
//                         Toutes les données obligatoires sont présentes
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button onClick={generateIFU} className="flex-1">
//                   <Download className="h-4 w-4 mr-2" />
//                   Télécharger IFU (PDF)
//                 </Button>
//                 <Button variant="outline">
//                   Télédéclarer
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* CNPS Form */}
//         <TabsContent value="cnps" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Déclaration CNPS</CardTitle>
//                   <CardDescription>
//                     Caisse Nationale de Prévoyance Sociale
//                   </CardDescription>
//                 </div>
//                 <FileCheck className="h-8 w-8 text-purple-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertDescription>
//                   Déclaration mensuelle des cotisations sociales.
//                 </AlertDescription>
//               </Alert>

//               <div className="space-y-3">
//                 <div className="p-4 bg-accent rounded-lg">
//                   <h4 className="mb-3">Cotisations calculées</h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Masse salariale</span>
//                       <span>280 000 {country.currency}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Nombre de salariés</span>
//                       <span>25</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Part salariale (3.6%)</span>
//                       <span>10 080 {country.currency}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Part patronale (16.6%)</span>
//                       <span>46 480 {country.currency}</span>
//                     </div>
//                     <div className="flex justify-between pt-2 border-t">
//                       <span>Total à verser</span>
//                       <span>56 560 {country.currency}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
//                     <div>
//                       <p className="text-sm mb-1">Échéance: 15 du mois suivant</p>
//                       <p className="text-xs text-muted-foreground">
//                         Prochaine échéance: 15 Nov 2025
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button onClick={generateCNPS} className="flex-1">
//                   <Download className="h-4 w-4 mr-2" />
//                   Télécharger CNPS (PDF)
//                 </Button>
//                 <Button variant="outline">
//                   Télédéclarer
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* DSF Form */}
//         <TabsContent value="dsf" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Déclaration Statistique et Fiscale</CardTitle>
//                   <CardDescription>
//                     États financiers SYSCOHADA
//                   </CardDescription>
//                 </div>
//                 <FileCheck className="h-8 w-8 text-green-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertDescription>
//                   La DSF inclut le Bilan, le Compte de Résultat et les annexes SYSCOHADA.
//                 </AlertDescription>
//               </Alert>

//               <div className="space-y-3">
//                 <div className="p-4 bg-accent rounded-lg">
//                   <h4 className="mb-3">États financiers disponibles</h4>
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between p-2 border rounded">
//                       <span className="text-sm">Bilan SYSCOHADA</span>
//                       <Badge variant="default">Disponible</Badge>
//                     </div>
//                     <div className="flex items-center justify-between p-2 border rounded">
//                       <span className="text-sm">Compte de Résultat</span>
//                       <Badge variant="default">Disponible</Badge>
//                     </div>
//                     <div className="flex items-center justify-between p-2 border rounded">
//                       <span className="text-sm">Tableau des Flux</span>
//                       <Badge variant="default">Disponible</Badge>
//                     </div>
//                     <div className="flex items-center justify-between p-2 border rounded">
//                       <span className="text-sm">Annexes</span>
//                       <Badge variant="default">Disponible</Badge>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
//                     <div>
//                       <p className="text-sm mb-1">Échéance annuelle</p>
//                       <p className="text-xs text-muted-foreground">
//                         À déposer avant le 30 Avril de l'année N+1
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button onClick={generateDSF} className="flex-1">
//                   <Download className="h-4 w-4 mr-2" />
//                   Télécharger DSF complète
//                 </Button>
//                 <Button variant="outline">
//                   Télédéclarer
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
