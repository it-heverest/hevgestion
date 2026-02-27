// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Alert, AlertDescription } from './ui/alert';
// import { Badge } from './ui/badge';
// import { Progress } from './ui/progress';
// import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Info, Download } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// interface BalanceImporterProps {
//   onComplete?: () => void;
// }

// export function BalanceImporter({ onComplete }: BalanceImporterProps = {}) {
//   const [file, setFile] = useState<File | null>(null);
//   const [importing, setImporting] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [imported, setImported] = useState(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//       setImported(false);
//     }
//   };

//   const handleImport = async () => {
//     if (!file) return;

//     setImporting(true);
//     setProgress(0);

//     // Simuler l'import
//     for (let i = 0; i <= 100; i += 10) {
//       await new Promise(resolve => setTimeout(resolve, 200));
//       setProgress(i);
//     }

//     setImporting(false);
//     setImported(true);

//     // Passer à l'étape suivante
//     setTimeout(() => {
//       if (window.location.hash !== '#traitement') {
//         alert('Balance importée ! Cliquez sur "Procéder au traitement" pour continuer.');
//       }
//     }, 500);
//   };

//   const mockData = [
//     { account: '101000', label: 'Capital social', debit: '', credit: '500000', balance: '500000 C' },
//     { account: '411000', label: 'Clients', debit: '175000', credit: '', balance: '175000 D' },
//     { account: '512000', label: 'Banque', debit: '156000', credit: '', balance: '156000 D' },
//     { account: '601000', label: 'Achats de matières', debit: '320000', credit: '', balance: '320000 D' },
//     { account: '701000', label: 'Ventes de produits', debit: '', credit: '1250000', balance: '1250000 C' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>Import de Balance Comptable</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Importez votre balance générale pour générer les états OHADA
//         </p>
//       </div>

//       {/* Upload Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Importer la Balance</CardTitle>
//           <CardDescription>
//             Formats acceptés: CSV, Excel (.xls, .xlsx)
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
//             <input
//               type="file"
//               accept=".csv,.xls,.xlsx"
//               onChange={handleFileChange}
//               className="hidden"
//               id="file-upload"
//             />
//             <label htmlFor="file-upload" className="cursor-pointer">
//               <Upload className="h-12 w-12 mx-auto text-blue-600 mb-3" />
//               <p className="mb-2">
//                 Cliquez pour sélectionner un fichier
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 ou glissez-déposez votre fichier ici
//               </p>
//             </label>
//           </div>

//           {file && (
//             <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <FileSpreadsheet className="h-5 w-5 text-blue-600" />
//                 <div>
//                   <p className="text-sm">{file.name}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {(file.size / 1024).toFixed(2)} KB
//                   </p>
//                 </div>
//               </div>
//               {!imported && (
//                 <Button onClick={handleImport} disabled={importing}>
//                   {importing ? 'Import en cours...' : 'Importer'}
//                 </Button>
//               )}
//               {imported && (
//                 <Badge variant="default">
//                   <CheckCircle2 className="h-3 w-3 mr-1" />
//                   Importé
//                 </Badge>
//               )}
//             </div>
//           )}

//           {importing && (
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span>Import en cours...</span>
//                 <span>{progress}%</span>
//               </div>
//               <Progress value={progress} className="h-2" />
//             </div>
//           )}

//           <Alert>
//             <Info className="h-4 w-4" />
//             <AlertDescription>
//               Assurez-vous que votre fichier respecte le template SYSCOHADA.
//               <Button variant="link" className="p-0 h-auto ml-1">
//                 Télécharger le template
//               </Button>
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>

//       {/* Preview */}
//       {imported && (
//         <>
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Aperçu des Données Importées</CardTitle>
//                   <CardDescription>248 comptes importés avec succès</CardDescription>
//                 </div>
//                 <Badge variant="default">
//                   <CheckCircle2 className="h-3 w-3 mr-1" />
//                   Validé
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="border rounded-lg overflow-hidden">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>N° Compte</TableHead>
//                       <TableHead>Libellé</TableHead>
//                       <TableHead>Débit</TableHead>
//                       <TableHead>Crédit</TableHead>
//                       <TableHead>Solde</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {mockData.map((row, idx) => (
//                       <TableRow key={idx}>
//                         <TableCell>{row.account}</TableCell>
//                         <TableCell>{row.label}</TableCell>
//                         <TableCell>{row.debit || '-'}</TableCell>
//                         <TableCell>{row.credit || '-'}</TableCell>
//                         <TableCell>{row.balance}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//               <p className="text-xs text-muted-foreground mt-2">
//                 Affichage de 5 lignes sur 248
//               </p>
//             </CardContent>
//           </Card>

//           {/* Validation Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Résumé de la Validation</CardTitle>
//               <CardDescription>Contrôles SYSCOHADA effectués</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="h-5 w-5 text-green-600" />
//                   <span className="text-sm">Équilibre comptable</span>
//                 </div>
//                 <span className="text-sm text-green-600">OK</span>
//               </div>
//               <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="h-5 w-5 text-green-600" />
//                   <span className="text-sm">Numéros de comptes SYSCOHADA</span>
//                 </div>
//                 <span className="text-sm text-green-600">248/248</span>
//               </div>
//               <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="h-5 w-5 text-orange-600" />
//                   <span className="text-sm">Comptes à reclasser</span>
//                 </div>
//                 <span className="text-sm text-orange-600">3</span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Next Steps */}
//           <div className="flex gap-2">
//             <Button className="flex-1" onClick={onComplete}>
//               Procéder au traitement
//             </Button>
//             <Button variant="outline">
//               Exporter les erreurs
//             </Button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
