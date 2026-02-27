// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { Alert, AlertDescription } from './ui/alert';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Download, FileText, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// interface ReportGeneratorProps {
//   companyName: string;
//   country: {
//     name: string;
//     currency: string;
//   };
// }

// export function ReportGenerator({ companyName, country }: ReportGeneratorProps) {
//   const [activeReport, setActiveReport] = useState<'bilan' | 'resultat' | 'flux'>('bilan');

//   // Données du Bilan
//   const bilanActif = [
//     { compte: '211000', libelle: 'Terrains', brut: 250000, amort: 0, net: 250000, netN1: 250000 },
//     { compte: '213000', libelle: 'Constructions', brut: 450000, amort: 90000, net: 360000, netN1: 380000 },
//     { compte: '215000', libelle: 'Installations techniques', brut: 180000, amort: 60000, net: 120000, netN1: 140000 },
//     { compte: '411000', libelle: 'Clients', brut: 175000, amort: 0, net: 175000, netN1: 165000 },
//     { compte: '512000', libelle: 'Banques', brut: 156000, amort: 0, net: 156000, netN1: 142000 },
//     { compte: '531000', libelle: 'Caisse', brut: 12000, amort: 0, net: 12000, netN1: 8000 },
//   ];

//   const bilanPassif = [
//     { compte: '101000', libelle: 'Capital social', montant: 500000, montantN1: 500000 },
//     { compte: '106000', libelle: 'Réserves', montant: 150000, montantN1: 125000 },
//     { compte: '120000', libelle: 'Résultat de l\'exercice', montant: 125000, montantN1: 98000 },
//     { compte: '161000', libelle: 'Emprunts', montant: 200000, montantN1: 250000 },
//     { compte: '400000', libelle: 'Fournisseurs', montant: 125000, montantN1: 115000 },
//     { compte: '445710', libelle: 'TVA collectée', montant: 48000, montantN1: 45000 },
//   ];

//   const totalActifBrut = bilanActif.reduce((sum, item) => sum + item.brut, 0);
//   const totalActifAmort = bilanActif.reduce((sum, item) => sum + item.amort, 0);
//   const totalActifNet = bilanActif.reduce((sum, item) => sum + item.net, 0);
//   const totalPassif = bilanPassif.reduce((sum, item) => sum + item.montant, 0);

//   // Données du Compte de Résultat
//   const charges = [
//     { compte: '601000', libelle: 'Achats de matières premières', montant: 320000, montantN1: 295000 },
//     { compte: '606000', libelle: 'Achats non stockés', montant: 85000, montantN1: 78000 },
//     { compte: '613000', libelle: 'Locations', montant: 48000, montantN1: 48000 },
//     { compte: '625000', libelle: 'Déplacements', montant: 22000, montantN1: 18000 },
//     { compte: '641000', libelle: 'Rémunérations du personnel', montant: 280000, montantN1: 265000 },
//     { compte: '645000', libelle: 'Charges de sécurité sociale', montant: 110000, montantN1: 98000 },
//     { compte: '661000', libelle: 'Charges d\'intérêts', montant: 15000, montantN1: 18000 },
//     { compte: '681000', libelle: 'Dotations aux amortissements', montant: 75000, montantN1: 70000 },
//   ];

//   const produits = [
//     { compte: '701000', libelle: 'Ventes de produits finis', montant: 1250000, montantN1: 1180000 },
//     { compte: '706000', libelle: 'Prestations de services', montant: 320000, montantN1: 285000 },
//   ];

//   const totalCharges = charges.reduce((sum, item) => sum + item.montant, 0);
//   const totalProduits = produits.reduce((sum, item) => sum + item.montant, 0);
//   const resultat = totalProduits - totalCharges;

//   // Données Flux de Trésorerie
//   const fluxExploitation = [
//     { libelle: 'Résultat de l\'exercice', montant: 125000 },
//     { libelle: 'Dotations aux amortissements', montant: 75000 },
//     { libelle: 'Variation clients', montant: -10000 },
//     { libelle: 'Variation fournisseurs', montant: 10000 },
//   ];

//   const fluxInvestissement = [
//     { libelle: 'Acquisition immobilisations', montant: -50000 },
//   ];

//   const fluxFinancement = [
//     { libelle: 'Remboursement emprunts', montant: -50000 },
//     { libelle: 'Dividendes versés', montant: -73000 },
//   ];

//   const totalFluxExploitation = fluxExploitation.reduce((sum, item) => sum + item.montant, 0);
//   const totalFluxInvestissement = fluxInvestissement.reduce((sum, item) => sum + item.montant, 0);
//   const totalFluxFinancement = fluxFinancement.reduce((sum, item) => sum + item.montant, 0);
//   const variationTresorerie = totalFluxExploitation + totalFluxInvestissement + totalFluxFinancement;

//   const downloadReport = (reportType: string) => {
//     alert(`Téléchargement du ${reportType} en cours...`);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>États Financiers OHADA</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           {companyName} - {country.name}
//         </p>
//       </div>

//       <Alert>
//         <CheckCircle2 className="h-4 w-4" />
//         <AlertDescription>
//           Les états financiers sont générés automatiquement à partir de votre balance comptable importée.
//         </AlertDescription>
//       </Alert>

//       <Tabs value={activeReport} onValueChange={(v) => setActiveReport(v as any)}>
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="bilan">Bilan</TabsTrigger>
//           <TabsTrigger value="resultat">Compte de Résultat</TabsTrigger>
//           <TabsTrigger value="flux">Flux de Trésorerie</TabsTrigger>
//         </TabsList>

//         {/* BILAN */}
//         <TabsContent value="bilan" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Bilan SYSCOHADA</CardTitle>
//                   <CardDescription>Au 31 Décembre 2025</CardDescription>
//                 </div>
//                 <Button onClick={() => downloadReport('Bilan')}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Exporter PDF
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* ACTIF */}
//               <div>
//                 <h3 className="mb-3">ACTIF</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Compte</TableHead>
//                         <TableHead>Libellé</TableHead>
//                         <TableHead className="text-right">Brut</TableHead>
//                         <TableHead className="text-right">Amort.</TableHead>
//                         <TableHead className="text-right">Net N</TableHead>
//                         <TableHead className="text-right">Net N-1</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {bilanActif.map((row) => (
//                         <TableRow key={row.compte}>
//                           <TableCell className="font-mono text-sm">{row.compte}</TableCell>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.brut.toLocaleString()} {country.currency}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {row.amort ? `${row.amort.toLocaleString()} ${country.currency}` : '-'}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {row.net.toLocaleString()} {country.currency}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {row.netN1.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell colSpan={2}></TableCell>
//                         <TableCell className="text-right">
//                           <strong>{totalActifBrut.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <strong>{totalActifAmort.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <strong>{totalActifNet.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* PASSIF */}
//               <div>
//                 <h3 className="mb-3">PASSIF</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Compte</TableHead>
//                         <TableHead>Libellé</TableHead>
//                         <TableHead className="text-right">Montant N</TableHead>
//                         <TableHead className="text-right">Montant N-1</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {bilanPassif.map((row) => (
//                         <TableRow key={row.compte}>
//                           <TableCell className="font-mono text-sm">{row.compte}</TableCell>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.montant.toLocaleString()} {country.currency}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {row.montantN1.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell colSpan={2}></TableCell>
//                         <TableCell className="text-right">
//                           <strong>{totalPassif.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* COMPTE DE RÉSULTAT */}
//         <TabsContent value="resultat" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Compte de Résultat SYSCOHADA</CardTitle>
//                   <CardDescription>Exercice 2025</CardDescription>
//                 </div>
//                 <Button onClick={() => downloadReport('Compte de Résultat')}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Exporter PDF
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* CHARGES */}
//               <div>
//                 <h3 className="mb-3">CHARGES</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Compte</TableHead>
//                         <TableHead>Libellé</TableHead>
//                         <TableHead className="text-right">Exercice N</TableHead>
//                         <TableHead className="text-right">Exercice N-1</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {charges.map((row) => (
//                         <TableRow key={row.compte}>
//                           <TableCell className="font-mono text-sm">{row.compte}</TableCell>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.montant.toLocaleString()} {country.currency}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {row.montantN1.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell colSpan={2}><strong>TOTAL CHARGES</strong></TableCell>
//                         <TableCell className="text-right">
//                           <strong>{totalCharges.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* PRODUITS */}
//               <div>
//                 <h3 className="mb-3">PRODUITS</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Compte</TableHead>
//                         <TableHead>Libellé</TableHead>
//                         <TableHead className="text-right">Exercice N</TableHead>
//                         <TableHead className="text-right">Exercice N-1</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {produits.map((row) => (
//                         <TableRow key={row.compte}>
//                           <TableCell className="font-mono text-sm">{row.compte}</TableCell>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.montant.toLocaleString()} {country.currency}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {row.montantN1.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell colSpan={2}><strong>TOTAL PRODUITS</strong></TableCell>
//                         <TableCell className="text-right">
//                           <strong>{totalProduits.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* RÉSULTAT */}
//               <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     {resultat > 0 ? (
//                       <TrendingUp className="h-5 w-5 text-green-600" />
//                     ) : (
//                       <TrendingDown className="h-5 w-5 text-red-600" />
//                     )}
//                     <span className="text-lg">Résultat de l'exercice</span>
//                   </div>
//                   <span className={`text-xl ${resultat > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {resultat.toLocaleString()} {country.currency}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* FLUX DE TRÉSORERIE */}
//         <TabsContent value="flux" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Tableau des Flux de Trésorerie</CardTitle>
//                   <CardDescription>Exercice 2025</CardDescription>
//                 </div>
//                 <Button onClick={() => downloadReport('Flux de Trésorerie')}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Exporter PDF
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Flux d'exploitation */}
//               <div>
//                 <h3 className="mb-3">Flux de trésorerie liés à l'activité</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableBody>
//                       {fluxExploitation.map((row, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.montant.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell><strong>Flux net de trésorerie généré par l'activité</strong></TableCell>
//                         <TableCell className="text-right">
//                           <strong className="text-blue-600">{totalFluxExploitation.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* Flux d'investissement */}
//               <div>
//                 <h3 className="mb-3">Flux de trésorerie liés aux investissements</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableBody>
//                       {fluxInvestissement.map((row, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.montant.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell><strong>Flux net de trésorerie lié aux investissements</strong></TableCell>
//                         <TableCell className="text-right">
//                           <strong className="text-blue-600">{totalFluxInvestissement.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* Flux de financement */}
//               <div>
//                 <h3 className="mb-3">Flux de trésorerie liés au financement</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableBody>
//                       {fluxFinancement.map((row, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell>{row.libelle}</TableCell>
//                           <TableCell className="text-right">
//                             {row.montant.toLocaleString()} {country.currency}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow>
//                         <TableCell><strong>Flux net de trésorerie lié au financement</strong></TableCell>
//                         <TableCell className="text-right">
//                           <strong className="text-blue-600">{totalFluxFinancement.toLocaleString()} {country.currency}</strong>
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* Variation totale */}
//               <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <span className="text-lg">Variation de trésorerie</span>
//                   <span className={`text-xl ${variationTresorerie > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {variationTresorerie.toLocaleString()} {country.currency}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
