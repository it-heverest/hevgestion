// import { useState } from 'react';
// import { Button } from './ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Download, FileSpreadsheet, Info } from 'lucide-react';
// import { Alert, AlertDescription } from './ui/alert';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// type ReportType = 'bilan' | 'compte-resultat' | 'flux-tresorerie' | 'balance';

// interface TemplateStructure {
//   columns: string[];
//   description: string;
//   example: string[][];
// }

// const reportTemplates: Record<ReportType, TemplateStructure> = {
//   'bilan': {
//     columns: ['Numéro de compte', 'Libellé', 'Brut', 'Amortissements', 'Net N', 'Net N-1'],
//     description: 'Template pour le Bilan Comptable (Actif et Passif)',
//     example: [
//       ['211000', 'Terrains', '250000', '', '250000', '250000'],
//       ['213000', 'Constructions', '450000', '90000', '360000', '380000'],
//       ['101000', 'Capital social', '', '', '500000', '500000'],
//     ]
//   },
//   'compte-resultat': {
//     columns: ['Numéro de compte', 'Libellé', 'Montant N', 'Montant N-1'],
//     description: 'Template pour le Compte de Résultat',
//     example: [
//       ['701000', 'Ventes de produits finis', '1250000', '1180000'],
//       ['601000', 'Achats de matières premières', '320000', '295000'],
//       ['641000', 'Rémunérations du personnel', '280000', '265000'],
//     ]
//   },
//   'flux-tresorerie': {
//     columns: ['Numéro de compte', 'Libellé', 'Flux exploitation', 'Flux investissement', 'Flux financement'],
//     description: 'Template pour le Tableau des Flux de Trésorerie',
//     example: [
//       ['120000', 'Résultat de l\'exercice', '125000', '', ''],
//       ['681000', 'Dotations aux amortissements', '75000', '', ''],
//       ['211000', 'Acquisition immobilisations', '', '-150000', ''],
//     ]
//   },
//   'balance': {
//     columns: ['Numéro de compte', 'Libellé', 'Débit', 'Crédit', 'Solde débiteur', 'Solde créditeur'],
//     description: 'Template pour la Balance Générale',
//     example: [
//       ['101000', 'Capital social', '', '500000', '', '500000'],
//       ['411000', 'Clients', '175000', '', '175000', ''],
//       ['512000', 'Banque', '156000', '', '156000', ''],
//     ]
//   }
// };

// export function ReportTemplates() {
//   const [selectedReport, setSelectedReport] = useState<ReportType>('balance');

//   const generateTemplate = (reportType: ReportType, format: 'csv' | 'excel') => {
//     const template = reportTemplates[reportType];
//     const headers = template.columns;
//     const data = template.example;

//     const separator = format === 'csv' ? ';' : '\t';
//     const content = [
//       headers.join(separator),
//       ...data.map(row => row.join(separator))
//     ].join('\n');

//     const blob = format === 'csv' 
//       ? new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
//       : new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel' });
    
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = `template_${reportType}.${format === 'csv' ? 'csv' : 'xls'}`;
//     link.click();
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>Templates d'Import par Rapport</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Chaque type de rapport a sa structure spécifique
//         </p>
//       </div>

//       <Tabs value={selectedReport} onValueChange={(v) => setSelectedReport(v as ReportType)}>
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="balance">Balance</TabsTrigger>
//           <TabsTrigger value="bilan">Bilan</TabsTrigger>
//           <TabsTrigger value="compte-resultat">Compte de Résultat</TabsTrigger>
//           <TabsTrigger value="flux-tresorerie">Flux Trésorerie</TabsTrigger>
//         </TabsList>

//         {Object.entries(reportTemplates).map(([key, template]) => (
//           <TabsContent key={key} value={key} className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Template {key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</CardTitle>
//                 <CardDescription>{template.description}</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Button 
//                     onClick={() => generateTemplate(key as ReportType, 'csv')} 
//                     variant="outline" 
//                     className="h-auto p-4"
//                   >
//                     <div className="flex flex-col items-center gap-2 w-full">
//                       <FileSpreadsheet className="h-8 w-8 text-green-600" />
//                       <div className="text-center">
//                         <p>Télécharger CSV</p>
//                         <p className="text-xs text-muted-foreground">Format universel</p>
//                       </div>
//                       <Download className="h-4 w-4 mt-2" />
//                     </div>
//                   </Button>

//                   <Button 
//                     onClick={() => generateTemplate(key as ReportType, 'excel')} 
//                     variant="outline" 
//                     className="h-auto p-4"
//                   >
//                     <div className="flex flex-col items-center gap-2 w-full">
//                       <FileSpreadsheet className="h-8 w-8 text-blue-600" />
//                       <div className="text-center">
//                         <p>Télécharger Excel</p>
//                         <p className="text-xs text-muted-foreground">Format Microsoft</p>
//                       </div>
//                       <Download className="h-4 w-4 mt-2" />
//                     </div>
//                   </Button>
//                 </div>

//                 <Alert>
//                   <Info className="h-4 w-4" />
//                   <AlertDescription>
//                     Ce template est spécifiquement conçu pour le rapport {key.split('-').join(' ')}. 
//                     Respectez la structure des colonnes pour un import réussi.
//                   </AlertDescription>
//                 </Alert>
//               </CardContent>
//             </Card>

//             {/* Structure Preview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Structure du Template</CardTitle>
//                 <CardDescription>Aperçu des colonnes requises</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         {template.columns.map((col, idx) => (
//                           <TableHead key={idx}>{col}</TableHead>
//                         ))}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {template.example.map((row, idx) => (
//                         <TableRow key={idx}>
//                           {row.map((cell, cellIdx) => (
//                             <TableCell key={cellIdx}>
//                               {cell || <span className="text-muted-foreground">-</span>}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         ))}
//       </Tabs>

//       {/* SYSCOHADA Info */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Conformité SYSCOHADA</CardTitle>
//           <CardDescription>
//             Système Comptable OHADA - Nomenclature des comptes
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <p className="text-sm">
//             Tous les templates respectent le plan comptable SYSCOHADA révisé. 
//             Assurez-vous que vos numéros de comptes correspondent à cette nomenclature.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             <div className="p-3 border rounded-lg">
//               <p className="text-xs text-muted-foreground">Classe 1</p>
//               <p className="text-sm">Comptes de ressources</p>
//             </div>
//             <div className="p-3 border rounded-lg">
//               <p className="text-xs text-muted-foreground">Classe 2</p>
//               <p className="text-sm">Comptes d'actif</p>
//             </div>
//             <div className="p-3 border rounded-lg">
//               <p className="text-xs text-muted-foreground">Classe 3-5</p>
//               <p className="text-sm">Stocks et tiers</p>
//             </div>
//             <div className="p-3 border rounded-lg">
//               <p className="text-xs text-muted-foreground">Classe 6-7</p>
//               <p className="text-sm">Charges et produits</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
