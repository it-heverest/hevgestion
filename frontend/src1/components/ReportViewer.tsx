// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { ScrollArea } from './ui/scroll-area';
// import { Separator } from './ui/separator';
// import { 
//   Download, 
//   Printer, 
//   Share2, 
//   ArrowLeft,
//   FileText,
//   Calendar
// } from 'lucide-react';

// interface ReportViewerProps {
//   reportId: string;
//   reportName: string;
//   reportDate: string;
//   onClose: () => void;
// }

// export function ReportViewer({ reportId, reportName, reportDate, onClose }: ReportViewerProps) {
//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Button variant="outline" size="sm" onClick={onClose}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Retour
//           </Button>
//           <div>
//             <h2 className="font-semibold">{reportName}</h2>
//             <p className="text-sm text-muted-foreground">{reportDate}</p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" size="sm">
//             <Printer className="h-4 w-4 mr-2" />
//             Imprimer
//           </Button>
//           <Button variant="outline" size="sm">
//             <Share2 className="h-4 w-4 mr-2" />
//             Partager
//           </Button>
//           <Button size="sm">
//             <Download className="h-4 w-4 mr-2" />
//             Télécharger PDF
//           </Button>
//         </div>
//       </div>

//       {/* Rapport */}
//       <Card>
//         <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
//           <div className="flex items-center justify-between">
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//               {reportName}
//             </CardTitle>
//             <Badge variant="outline">
//               <Calendar className="h-3 w-3 mr-1" />
//               {reportDate}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           <ScrollArea className="h-[700px]">
//             <div className="p-8">
//               {/* En-tête du rapport */}
//               <div className="text-center mb-8 pb-6 border-b-2">
//                 <h1 className="text-2xl font-bold mb-2">{reportName}</h1>
//                 <p className="text-muted-foreground">Exercice comptable 2025</p>
//                 <p className="text-sm text-muted-foreground mt-2">Généré le {reportDate}</p>
//               </div>

//               {/* Contenu du rapport - Bilan Actif exemple */}
//               {reportName.includes('Bilan') && reportName.includes('Actif') && (
//                 <div className="space-y-6">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-800">
//                         <th className="border border-gray-300 dark:border-gray-600 p-3 text-left font-semibold">ACTIF</th>
//                         <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">Note</th>
//                         <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">Brut</th>
//                         <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">Amort./Prov.</th>
//                         <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">Net N</th>
//                         <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">Net N-1</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="font-semibold bg-gray-50 dark:bg-gray-900">
//                         <td className="border border-gray-300 dark:border-gray-600 p-3" colSpan={6}>ACTIF IMMOBILISÉ</td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">Immobilisations incorporelles</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right">2A</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">Terrains</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right">2B</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">250,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">250,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">250,000</td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">Bâtiments</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right">2C</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">450,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">(90,000)</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">360,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">405,000</td>
//                       </tr>
//                       <tr className="font-semibold bg-gray-100 dark:bg-gray-800">
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">TOTAL ACTIF IMMOBILISÉ</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3"></td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">700,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">(90,000)</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">610,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">655,000</td>
//                       </tr>
                      
//                       <tr className="font-semibold bg-gray-50 dark:bg-gray-900">
//                         <td className="border border-gray-300 dark:border-gray-600 p-3" colSpan={6}>ACTIF CIRCULANT</td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">Créances clients</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right">4A</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">175,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">175,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">145,000</td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">Disponibilités</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right">5A</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">156,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">156,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">120,000</td>
//                       </tr>
//                       <tr className="font-semibold bg-gray-100 dark:bg-gray-800">
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">TOTAL ACTIF CIRCULANT</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3"></td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">331,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">-</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">331,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">265,000</td>
//                       </tr>

//                       <tr className="font-bold bg-gray-200 dark:bg-gray-700 text-lg">
//                         <td className="border border-gray-300 dark:border-gray-600 p-3">TOTAL ACTIF</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3"></td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">1,031,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">(90,000)</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">941,000</td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-3 text-right font-mono">920,000</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {/* Autres types de rapports */}
//               {!reportName.includes('Bilan') && (
//                 <div className="space-y-6">
//                   <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
//                     <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//                     <h3 className="text-lg font-semibold mb-2">Rapport disponible</h3>
//                     <p className="text-muted-foreground">
//                       Le contenu détaillé de ce rapport sera affiché ici.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Pied de page */}
//               <Separator className="my-8" />
//               <div className="text-center text-sm text-muted-foreground">
//                 <p>Document généré automatiquement par FinanceERP Pro</p>
//                 <p className="mt-1">Conforme aux normes SYSCOHADA révisé</p>
//               </div>
//             </div>
//           </ScrollArea>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
