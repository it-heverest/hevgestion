// import { Button } from './ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Alert, AlertDescription } from './ui/alert';
// import { Badge } from './ui/badge';
// import { Download, FileSpreadsheet, CheckCircle2, AlertCircle, Info } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// export function BalanceImportGuide() {
//   // Générer le template CSV
//   const generateTemplate = () => {
//     const headers = ['Numéro de compte', 'Libellé', 'Débit', 'Crédit', 'Solde débiteur', 'Solde créditeur'];
//     const exampleData = [
//       ['101000', 'Capital social', '', '500000.00', '', '500000.00'],
//       ['106000', 'Réserves', '', '150000.00', '', '150000.00'],
//       ['120000', 'Résultat de l\'exercice (bénéfice)', '', '125000.00', '', '125000.00'],
//       ['211000', 'Terrains', '250000.00', '', '250000.00', ''],
//       ['213000', 'Constructions', '450000.00', '', '450000.00', ''],
//       ['215000', 'Installations techniques', '180000.00', '', '180000.00', ''],
//       ['218100', 'Amortissements des constructions', '', '90000.00', '', '90000.00'],
//       ['281500', 'Amortissements des installations', '', '60000.00', '', '60000.00'],
//       ['400000', 'Fournisseurs', '', '125000.00', '', '125000.00'],
//       ['411000', 'Clients', '175000.00', '', '175000.00', ''],
//       ['445660', 'TVA déductible', '35000.00', '', '35000.00', ''],
//       ['445710', 'TVA collectée', '', '48000.00', '', '48000.00'],
//       ['512000', 'Banque', '156000.00', '', '156000.00', ''],
//       ['531000', 'Caisse', '12000.00', '', '12000.00', ''],
//       ['601000', 'Achats de matières premières', '320000.00', '', '320000.00', ''],
//       ['606000', 'Achats non stockés', '85000.00', '', '85000.00', ''],
//       ['613000', 'Locations', '48000.00', '', '48000.00', ''],
//       ['625000', 'Déplacements', '22000.00', '', '22000.00', ''],
//       ['641000', 'Rémunérations du personnel', '280000.00', '', '280000.00', ''],
//       ['645000', 'Charges de sécurité sociale', '110000.00', '', '110000.00', ''],
//       ['661000', 'Charges d\'intérêts', '15000.00', '', '15000.00', ''],
//       ['681000', 'Dotations aux amortissements', '75000.00', '', '75000.00', ''],
//       ['701000', 'Ventes de produits finis', '', '1250000.00', '', '1250000.00'],
//       ['706000', 'Prestations de services', '', '320000.00', '', '320000.00'],
//     ];

//     const csv = [
//       headers.join(';'),
//       ...exampleData.map(row => row.join(';'))
//     ].join('\n');

//     const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'template_balance_generale.csv';
//     link.click();
//   };

//   // Générer le template Excel (simulé avec CSV)
//   const generateExcelTemplate = () => {
//     const headers = ['Numéro de compte', 'Libellé', 'Débit', 'Crédit', 'Solde débiteur', 'Solde créditeur'];
//     const exampleData = [
//       ['101000', 'Capital social', '', '500000.00', '', '500000.00'],
//       ['106000', 'Réserves', '', '150000.00', '', '150000.00'],
//       ['120000', 'Résultat de l\'exercice (bénéfice)', '', '125000.00', '', '125000.00'],
//     ];

//     const csv = [
//       headers.join('\t'),
//       ...exampleData.map(row => row.join('\t'))
//     ].join('\n');

//     const blob = new Blob(['\ufeff' + csv], { type: 'application/vnd.ms-excel' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'template_balance_generale.xls';
//     link.click();
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>Import de Balance Comptable</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Téléchargez le template et importez votre balance générale
//         </p>
//       </div>

//       {/* Templates Download */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Télécharger les templates</CardTitle>
//           <CardDescription>
//             Utilisez ces fichiers modèles pour préparer votre balance comptable
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Button onClick={generateTemplate} variant="outline" className="h-auto p-4">
//               <div className="flex flex-col items-center gap-2 w-full">
//                 <FileSpreadsheet className="h-8 w-8 text-green-600" />
//                 <div className="text-center">
//                   <p>Template CSV</p>
//                   <p className="text-xs text-muted-foreground">Format standard (Excel, LibreOffice)</p>
//                 </div>
//                 <Download className="h-4 w-4 mt-2" />
//               </div>
//             </Button>

//             <Button onClick={generateExcelTemplate} variant="outline" className="h-auto p-4">
//               <div className="flex flex-col items-center gap-2 w-full">
//                 <FileSpreadsheet className="h-8 w-8 text-blue-600" />
//                 <div className="text-center">
//                   <p>Template Excel</p>
//                   <p className="text-xs text-muted-foreground">Format Microsoft Excel</p>
//                 </div>
//                 <Download className="h-4 w-4 mt-2" />
//               </div>
//             </Button>
//           </div>

//           <Alert>
//             <Info className="h-4 w-4" />
//             <AlertDescription>
//               Les templates contiennent des exemples de données. Remplacez-les par vos propres données comptables.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>

//       {/* Format Specifications */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Format requis</CardTitle>
//           <CardDescription>
//             Assurez-vous que votre fichier respecte le format suivant
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="border rounded-lg overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Colonne</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Obligatoire</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 <TableRow>
//                   <TableCell>Numéro de compte</TableCell>
//                   <TableCell>Numéro du compte comptable (ex: 101000, 411000)</TableCell>
//                   <TableCell><Badge variant="secondary">Texte</Badge></TableCell>
//                   <TableCell><CheckCircle2 className="h-4 w-4 text-green-600" /></TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Libellé</TableCell>
//                   <TableCell>Description du compte</TableCell>
//                   <TableCell><Badge variant="secondary">Texte</Badge></TableCell>
//                   <TableCell><CheckCircle2 className="h-4 w-4 text-green-600" /></TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Débit</TableCell>
//                   <TableCell>Montant total des débits</TableCell>
//                   <TableCell><Badge variant="secondary">Nombre</Badge></TableCell>
//                   <TableCell><AlertCircle className="h-4 w-4 text-muted-foreground" /></TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Crédit</TableCell>
//                   <TableCell>Montant total des crédits</TableCell>
//                   <TableCell><Badge variant="secondary">Nombre</Badge></TableCell>
//                   <TableCell><AlertCircle className="h-4 w-4 text-muted-foreground" /></TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Solde débiteur</TableCell>
//                   <TableCell>Solde si débiteur</TableCell>
//                   <TableCell><Badge variant="secondary">Nombre</Badge></TableCell>
//                   <TableCell><AlertCircle className="h-4 w-4 text-muted-foreground" /></TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Solde créditeur</TableCell>
//                   <TableCell>Solde si créditeur</TableCell>
//                   <TableCell><Badge variant="secondary">Nombre</Badge></TableCell>
//                   <TableCell><AlertCircle className="h-4 w-4 text-muted-foreground" /></TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Import Instructions */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Instructions d'import</CardTitle>
//           <CardDescription>
//             Suivez ces étapes pour importer votre balance
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ol className="space-y-3 list-decimal list-inside">
//             <li className="flex items-start gap-3">
//               <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
//               <div className="flex-1">
//                 <p>Téléchargez le template CSV ou Excel</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Choisissez le format compatible avec votre logiciel comptable
//                 </p>
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
//               <div className="flex-1">
//                 <p>Exportez votre balance depuis votre ERP (SAP, Oracle, Dynamics)</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Ou préparez manuellement vos données dans le template
//                 </p>
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
//               <div className="flex-1">
//                 <p>Vérifiez que toutes les colonnes obligatoires sont remplies</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Le numéro de compte et le libellé sont obligatoires
//                 </p>
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
//               <div className="flex-1">
//                 <p>Importez le fichier via l'onglet "Import de Fichiers"</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Le système validera automatiquement vos données
//                 </p>
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">5</span>
//               <div className="flex-1">
//                 <p>Vérifiez et validez les données importées</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Vous pourrez ensuite générer tous vos rapports financiers
//                 </p>
//               </div>
//             </li>
//           </ol>
//         </CardContent>
//       </Card>

//       {/* Compatibility */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Compatibilité ERP</CardTitle>
//           <CardDescription>
//             Systèmes ERP supportés pour l'export de balance
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {['SAP', 'Oracle Financials', 'Microsoft Dynamics', 'Sage', 'Cegid', 'EBP', 'QuickBooks', 'Autre'].map((erp) => (
//               <div key={erp} className="flex items-center gap-2 p-3 border rounded-lg">
//                 <CheckCircle2 className="h-4 w-4 text-green-600" />
//                 <span className="text-sm">{erp}</span>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
