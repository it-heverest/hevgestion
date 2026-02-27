// import { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Badge } from "./ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "./ui/dialog";
// import { Alert, AlertDescription } from "./ui/alert";
// import { Download, Save, Calculator, Info, Edit } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "./ui/table";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";

// interface ExcelEditorProps {
//   companyName: string;
//   country: {
//     name: string;
//     currency: string;
//   };
//   onSave: () => void;
// }

// interface SheetData {
//   [key: string]: any[][];
// }

// export function ExcelEditor({
//   companyName,
//   country,
//   onSave,
// }: ExcelEditorProps) {
//   const [activeReport, setActiveReport] = useState<
//     "bilan" | "resultat" | "flux"
//   >("bilan");
//   const [sheets, setSheets] = useState<SheetData>({});
//   const [selectedCell, setSelectedCell] = useState<{
//     row: number;
//     col: number;
//   } | null>(null);

//   // Initialiser les feuilles Excel par défaut
//   useEffect(() => {
//     const defaultSheets: SheetData = {
//       bilan: [
//         ["Réf", "Compte", "Libellé", "Brut", "Amort/Prov", "Net N", "Net N-1"],
//         ["REF01", "211000", "Terrains", 250000, 0, "=D2-E2", 250000],
//         ["REF02", "213000", "Constructions", 450000, 90000, "=D3-E3", 380000],
//         ["REF03", "214000", "Matériel", 300000, 150000, "=D4-E4", 180000],
//         // Ajoutez plus de lignes selon vos besoins
//       ],
//       resultat: [
//         ["Réf", "Compte", "Libellé", "N", "N-1"],
//         ["RES01", "701000", "Ventes de marchandises", 1500000, 1200000],
//         ["RES02", "607000", "Achats de marchandises", -900000, -750000],
//         // Ajoutez plus de lignes selon vos besoins
//       ],
//       flux: [
//         ["Réf", "Libellé", "N", "N-1"],
//         ["FLX01", "Flux de trésorerie provenant de l'exploitation", 0, 0],
//         // Ajoutez plus de lignes selon vos besoins
//       ],
//     };
//     setSheets(defaultSheets);
//   }, []);

//   const handleCellChange = (
//     sheetName: string,
//     row: number,
//     col: number,
//     value: any
//   ) => {
//     setSheets((prev) => {
//       const newSheets = { ...prev };
//       newSheets[sheetName][row][col] = value;
//       return newSheets;
//     });
//   };

//   const handleSaveReport = () => {
//     // Créer un nouveau classeur
//     const wb = XLSX.utils.book_new();

//     // Convertir chaque feuille et l'ajouter au classeur
//     Object.entries(sheets).forEach(([sheetName, data]) => {
//       const ws = XLSX.utils.aoa_to_sheet(data);
//       XLSX.utils.book_append_sheet(wb, ws, sheetName);
//     });

//     // Sauvegarder le fichier
//     XLSX.writeFile(wb, `${companyName}_DSF_${new Date().getFullYear()}.xlsx`);
//     onSave();
//   };

//   const handleExportPDF = () => {
//     // TODO: Implémenter l'export PDF
//     alert("Export PDF en cours...");
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2>Éditeur Excel - États OHADA</h2>
//           <p className="text-sm text-muted-foreground mt-1">
//             {companyName} - {country.name}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleSaveReport}>
//             <Download className="h-4 w-4 mr-2" />
//             Excel
//           </Button>
//           <Button variant="outline" onClick={handleExportPDF}>
//             <Download className="h-4 w-4 mr-2" />
//             PDF
//           </Button>
//           <Button onClick={handleSaveReport}>
//             <Save className="h-4 w-4 mr-2" />
//             Sauvegarder
//           </Button>
//         </div>
//       </div>

//       <Alert>
//         <Info className="h-4 w-4" />
//         <AlertDescription>
//           Cliquez sur une cellule pour voir sa formule et les comptes liés. Les
//           cellules avec formules sont calculées automatiquement.
//         </AlertDescription>
//       </Alert>

//       <Tabs
//         value={activeReport}
//         onValueChange={(v: any) => setActiveReport(v as any)}
//       >
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="bilan">Bilan</TabsTrigger>
//           <TabsTrigger value="resultat">Compte de Résultat</TabsTrigger>
//           <TabsTrigger value="flux">Flux de Trésorerie</TabsTrigger>
//         </TabsList>

//         {/* Contenu des onglets */}
//         {["bilan", "resultat", "flux"].map((reportType) => (
//           <TabsContent
//             key={reportType}
//             value={reportType}
//             className="space-y-4"
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>
//                   {reportType === "bilan" && "Bilan SYSCOHADA"}
//                   {reportType === "resultat" && "Compte de Résultat SYSCOHADA"}
//                   {reportType === "flux" && "Tableau des Flux de Trésorerie"}
//                 </CardTitle>
//                 <CardDescription>
//                   Exercice {new Date().getFullYear()}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="border rounded-lg overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         {sheets[reportType]?.[0]?.map((header, idx) => (
//                           <TableHead key={idx}>{header}</TableHead>
//                         ))}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {sheets[reportType]?.slice(1)?.map((row, rowIdx) => (
//                         <TableRow key={rowIdx}>
//                           {row.map((cell, colIdx) => (
//                             <TableCell key={colIdx}>
//                               <div
//                                 className="relative cursor-pointer hover:bg-blue-50 p-2 rounded"
//                                 onClick={() =>
//                                   setSelectedCell({
//                                     row: rowIdx + 1,
//                                     col: colIdx,
//                                   })
//                                 }
//                               >
//                                 {typeof cell === "string" &&
//                                 cell.startsWith("=") ? (
//                                   <div className="flex items-center gap-1">
//                                     <span>
//                                       {evaluateFormula(
//                                         cell,
//                                         sheets[reportType]
//                                       )}
//                                     </span>
//                                     <Badge
//                                       variant="outline"
//                                       className="text-xs"
//                                     >
//                                       fx
//                                     </Badge>
//                                   </div>
//                                 ) : (
//                                   <Input
//                                     type={
//                                       typeof cell === "number"
//                                         ? "number"
//                                         : "text"
//                                     }
//                                     value={cell}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         reportType,
//                                         rowIdx + 1,
//                                         colIdx,
//                                         e.target.value
//                                       )
//                                     }
//                                     className="h-8"
//                                   />
//                                 )}
//                               </div>
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
//     </div>
//   );
// }

// // Fonction utilitaire pour évaluer les formules simples
// function evaluateFormula(formula: string, sheetData: any[][]): number {
//   try {
//     const withoutEquals = formula.substring(1); // Enlever le '='
//     const parts = withoutEquals.split(/([+\-*/])/);

//     // Remplacer les références de cellules par leurs valeurs
//     const values = parts.map((part) => {
//       if (part.match(/[A-Z]+[0-9]+/)) {
//         // Convertir référence (ex: 'D2') en valeur
//         const colMatch = part.match(/[A-Z]+/);
//         const rowMatch = part.match(/[0-9]+/);
//         if (!colMatch || !rowMatch) return 0;
//         const col = colMatch[0];
//         const row = parseInt(rowMatch[0]) - 1;
//         const colIndex = XLSX.utils.decode_col(col);
//         return sheetData[row][colIndex];
//       }
//       return part;
//     });

//     // Évaluer l'expression
//     return eval(values.join(""));
//   } catch (error) {
//     console.error("Error evaluating formula:", error);
//     return 0;
//   }
// }
