// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { Alert, AlertDescription } from './ui/alert';
// import { ScrollArea } from './ui/scroll-area';
// import { Checkbox } from './ui/checkbox';
// import { 
//   ArrowRight, 
//   CheckCircle2, 
//   AlertTriangle,
//   RefreshCw,
//   Save,
//   Play
// } from 'lucide-react';
// import { Progress } from './ui/progress';
// import { useApp } from '../contexts/AppContext';

// interface ExcelBalanceProcessorProps {
//   onComplete?: () => void;
// }

// export function ExcelBalanceProcessor({ onComplete }: ExcelBalanceProcessorProps = {}) {
//   const { addToHistory } = useApp();
//   const [processing, setProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [completed, setCompleted] = useState(false);

//   // Balance originale (avant traitement)
//   const originalBalance = [
//     { account: '211000', label: 'Terrains', debit: '250000', credit: '', balance: '250000 D', warning: '' },
//     { account: '213000', label: 'Constructions', debit: '450000', credit: '', balance: '450000 D', warning: '' },
//     { account: '215000', label: 'Installations techniques', debit: '180000', credit: '', balance: '180000 D', warning: '' },
//     { account: '281300', label: 'Amort. constructions', debit: '', credit: '70000', balance: '70000 C', warning: 'À ajuster' },
//     { account: '411000', label: 'Clients', debit: '175000', credit: '', balance: '175000 D', warning: '' },
//     { account: '512000', label: 'Banque', debit: '156000', credit: '', balance: '156000 D', warning: '' },
//     { account: '601000', label: 'Achats de matières', debit: '320000', credit: '', balance: '320000 D', warning: '' },
//     { account: '701000', label: 'Ventes de produits', debit: '', credit: '1250000', balance: '1250000 C', warning: '' },
//   ];

//   // Balance traitée (après traitement)
//   const [processedBalance, setProcessedBalance] = useState<typeof originalBalance>([]);

//   const [processingOptions, setProcessingOptions] = useState([
//     { id: 'reclassify', label: 'Reclassement automatique', enabled: true },
//     { id: 'amortization', label: 'Calcul des amortissements', enabled: true },
//     { id: 'provisions', label: 'Validation des provisions', enabled: false },
//     { id: 'result-calculation', label: 'Calcul du résultat', enabled: true },
//   ]);

//   const toggleOption = (id: string) => {
//     setProcessingOptions(prev =>
//       prev.map(opt => opt.id === id ? { ...opt, enabled: !opt.enabled } : opt)
//     );
//   };

//   const startProcessing = async () => {
//     setProcessing(true);
//     setProgress(0);

//     // Simuler le traitement
//     for (let i = 0; i <= 100; i += 10) {
//       await new Promise(resolve => setTimeout(resolve, 300));
//       setProgress(i);
//     }

//     // Balance traitée avec les ajustements
//     const treated = [
//       { account: '211000', label: 'Terrains', debit: '250000', credit: '', balance: '250000 D', warning: '', modification: false },
//       { account: '213000', label: 'Constructions', debit: '450000', credit: '', balance: '450000 D', warning: '', modification: false },
//       { account: '215000', label: 'Installations techniques', debit: '180000', credit: '', balance: '180000 D', warning: '', modification: false },
//       { account: '281300', label: 'Amort. constructions', debit: '', credit: '90000', balance: '90000 C', warning: '', modification: true },
//       { account: '281500', label: 'Amort. installations', debit: '', credit: '60000', balance: '60000 C', warning: 'Ajouté', modification: true },
//       { account: '411000', label: 'Clients', debit: '175000', credit: '', balance: '175000 D', warning: '', modification: false },
//       { account: '512000', label: 'Banque', debit: '156000', credit: '', balance: '156000 D', warning: '', modification: false },
//       { account: '601000', label: 'Achats de matières', debit: '320000', credit: '', balance: '320000 D', warning: '', modification: false },
//       { account: '701000', label: 'Ventes de produits', debit: '', credit: '1250000', balance: '1250000 C', warning: '', modification: false },
//     ];

//     setProcessedBalance(treated);
//     setProcessing(false);
//     setCompleted(true);
//     addToHistory('Traitement balance', 'Balance traitée selon les normes SYSCOHADA');
//   };

//   const handleSave = () => {
//     addToHistory('Sauvegarde traitement', 'Résultats du traitement sauvegardés');
//     if (onComplete) onComplete();
//   };

//   // Colonnes Excel
//   const columns = ['N° Compte', 'Libellé', 'Débit', 'Crédit', 'Solde', 'Remarque'];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>Traitement de Balance SYSCOHADA</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Vue Excel avec balance originale et balance traitée
//         </p>
//       </div>

//       {/* Options de traitement */}
//       {!processing && !completed && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Options de Traitement</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {processingOptions.map((option) => (
//               <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50">
//                 <Checkbox
//                   checked={option.enabled}
//                   onCheckedChange={() => toggleOption(option.id)}
//                 />
//                 <label className="flex-1 cursor-pointer">
//                   {option.label}
//                 </label>
//               </div>
//             ))}
            
//             <Alert>
//               <AlertTriangle className="h-4 w-4" />
//               <AlertDescription>
//                 Les traitements sélectionnés seront appliqués selon les normes SYSCOHADA.
//               </AlertDescription>
//             </Alert>

//             <Button onClick={startProcessing} className="w-full" size="lg">
//               <Play className="h-4 w-4 mr-2" />
//               Lancer le traitement
//             </Button>
//           </CardContent>
//         </Card>
//       )}

//       {/* Processing Progress */}
//       {processing && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Traitement en cours...</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span>Progression</span>
//                 <span>{Math.round(progress)}%</span>
//               </div>
//               <Progress value={progress} className="h-2" />
//             </div>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <RefreshCw className="h-4 w-4 animate-spin" />
//               <span>Application des règles SYSCOHADA...</span>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Vue Excel côte à côte */}
//       {completed && (
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             {/* Balance Originale */}
//             <Card>
//               <CardHeader className="border-b">
//                 <CardTitle className="text-base">Balance Originale</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <ScrollArea className="h-[500px]">
//                   <table className="w-full border-collapse">
//                     <thead className="sticky top-0 bg-muted z-10">
//                       <tr>
//                         {columns.map((col) => (
//                           <th key={col} className="border border-border p-2 text-left text-sm">
//                             {col}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {originalBalance.map((row, idx) => (
//                         <tr key={idx} className="hover:bg-accent/30">
//                           <td className="border border-border p-2 font-mono text-sm">{row.account}</td>
//                           <td className="border border-border p-2 text-sm">{row.label}</td>
//                           <td className="border border-border p-2 text-sm text-right">{row.debit || '-'}</td>
//                           <td className="border border-border p-2 text-sm text-right">{row.credit || '-'}</td>
//                           <td className="border border-border p-2 text-sm">{row.balance}</td>
//                           <td className="border border-border p-2 text-sm">
//                             {row.warning && (
//                               <Badge variant="outline" className="text-xs">
//                                 {row.warning}
//                               </Badge>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </ScrollArea>
//               </CardContent>
//             </Card>

//             {/* Balance Traitée */}
//             <Card>
//               <CardHeader className="border-b bg-green-50">
//                 <CardTitle className="text-base flex items-center gap-2">
//                   <CheckCircle2 className="h-4 w-4 text-green-600" />
//                   Balance Traitée
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <ScrollArea className="h-[500px]">
//                   <table className="w-full border-collapse">
//                     <thead className="sticky top-0 bg-muted z-10">
//                       <tr>
//                         {columns.map((col) => (
//                           <th key={col} className="border border-border p-2 text-left text-sm">
//                             {col}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {processedBalance.map((row, idx) => (
//                         <tr 
//                           key={idx} 
//                           className={`hover:bg-accent/30 ${row.modification ? 'bg-green-50' : ''}`}
//                         >
//                           <td className="border border-border p-2 font-mono text-sm">{row.account}</td>
//                           <td className="border border-border p-2 text-sm">{row.label}</td>
//                           <td className="border border-border p-2 text-sm text-right">{row.debit || '-'}</td>
//                           <td className="border border-border p-2 text-sm text-right">{row.credit || '-'}</td>
//                           <td className="border border-border p-2 text-sm">{row.balance}</td>
//                           <td className="border border-border p-2 text-sm">
//                             {row.warning && (
//                               <Badge variant={row.modification ? 'default' : 'outline'} className="text-xs">
//                                 {row.warning}
//                               </Badge>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </ScrollArea>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Résumé des modifications */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Résumé des Modifications</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-green-600" />
//                     <span className="text-sm">Comptes modifiés</span>
//                   </div>
//                   <span className="text-sm text-green-600">
//                     {processedBalance.filter(row => row.modification).length}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <ArrowRight className="h-5 w-5 text-blue-600" />
//                     <span className="text-sm">Nouveaux comptes ajoutés</span>
//                   </div>
//                   <span className="text-sm text-blue-600">
//                     {processedBalance.filter(row => row.warning === 'Ajouté').length}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-2 mt-4">
//                 <Button className="flex-1" onClick={handleSave}>
//                   <Save className="h-4 w-4 mr-2" />
//                   Sauvegarder et continuer
//                 </Button>
//                 <Button variant="outline" onClick={() => setCompleted(false)}>
//                   Nouveau traitement
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }
