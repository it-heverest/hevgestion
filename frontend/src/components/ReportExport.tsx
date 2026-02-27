// import { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "./ui/tabs";
// import { Checkbox } from "./ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "./ui/table";
// import { Alert, AlertDescription } from "./ui/alert";
// import {
//   Download,
//   Eye,
//   FileText,
//   Mail,
//   Calendar,
//   Share2,
//   Printer,
//   Archive,
//   CheckCircle,
//   Clock,
//   FileSpreadsheet,
//   FileImage,
//   ExternalLink,
// } from "lucide-react";

// interface GeneratedReport {
//   id: string;
//   name: string;
//   type: string;
//   status: "completed" | "processing";
//   generatedAt: Date;
//   size: string;
//   records: number;
//   formats: string[];
//   lastModified: Date;
// }

// interface ExportFormat {
//   id: string;
//   name: string;
//   extension: string;
//   description: string;
//   icon: any;
//   compatible: boolean;
// }

// export function ReportExport() {
//   const [selectedReports, setSelectedReports] = useState<
//     string[]
//   >([]);
//   const [selectedFormat, setSelectedFormat] = useState("pdf");
//   const [exportDestination, setExportDestination] =
//     useState("download");

//   const generatedReports: GeneratedReport[] = [
//     {
//       id: "bilan",
//       name: "Bilan Comptable 2024",
//       type: "État Financier Principal",
//       status: "completed",
//       generatedAt: new Date(2024, 11, 15, 14, 30),
//       size: "2.4 MB",
//       records: 4250,
//       formats: ["pdf", "excel", "csv"],
//       lastModified: new Date(2024, 11, 15, 14, 35),
//     },
//     {
//       id: "compte-resultat",
//       name: "Compte de Résultat 2024",
//       type: "État Financier Principal",
//       status: "completed",
//       generatedAt: new Date(2024, 11, 15, 14, 28),
//       size: "1.8 MB",
//       records: 3180,
//       formats: ["pdf", "excel", "csv"],
//       lastModified: new Date(2024, 11, 15, 14, 33),
//     },
//     {
//       id: "flux-tresorerie",
//       name: "Tableau des Flux de Trésorerie",
//       type: "État Financier Principal",
//       status: "completed",
//       generatedAt: new Date(2024, 11, 15, 14, 32),
//       size: "3.1 MB",
//       records: 5620,
//       formats: ["pdf", "excel", "csv"],
//       lastModified: new Date(2024, 11, 15, 14, 38),
//     },
//     {
//       id: "balance-generale",
//       name: "Balance Générale",
//       type: "Rapport Analytique",
//       status: "completed",
//       generatedAt: new Date(2024, 11, 15, 14, 25),
//       size: "950 KB",
//       records: 1890,
//       formats: ["pdf", "excel", "csv"],
//       lastModified: new Date(2024, 11, 15, 14, 30),
//     },
//   ];

//   const exportFormats: ExportFormat[] = [
//     {
//       id: "pdf",
//       name: "PDF",
//       extension: "pdf",
//       description:
//         "Format portable, idéal pour consultation et impression",
//       icon: FileText,
//       compatible: true,
//     },
//     {
//       id: "excel",
//       name: "Microsoft Excel",
//       extension: "xlsx",
//       description:
//         "Feuille de calcul Excel pour analyse approfondie",
//       icon: FileSpreadsheet,
//       compatible: true,
//     },
//     {
//       id: "csv",
//       name: "CSV",
//       extension: "csv",
//       description: "Données brutes séparées par virgules",
//       icon: FileSpreadsheet,
//       compatible: true,
//     },
//     {
//       id: "xml",
//       name: "XML",
//       extension: "xml",
//       description: "Format structuré pour échange de données",
//       icon: FileText,
//       compatible: true,
//     },
//     {
//       id: "json",
//       name: "JSON",
//       extension: "json",
//       description: "Format de données JavaScript",
//       icon: FileText,
//       compatible: false,
//     },
//   ];

//   const toggleReportSelection = (reportId: string) => {
//     setSelectedReports((prev) =>
//       prev.includes(reportId)
//         ? prev.filter((id) => id !== reportId)
//         : [...prev, reportId],
//     );
//   };

//   const selectAllReports = () => {
//     setSelectedReports(generatedReports.map((r) => r.id));
//   };

//   const clearSelection = () => {
//     setSelectedReports([]);
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString("fr-FR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">
//             Export & Consultation
//           </h2>
//           <p className="text-muted-foreground">
//             Consultez, exportez ou envoyez vos états financiers
//             générés
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <Badge
//             variant="outline"
//             className="flex items-center gap-2"
//           >
//             <CheckCircle className="h-4 w-4" />
//             {generatedReports.length} rapport(s) disponible(s)
//           </Badge>
//           {selectedReports.length > 0 && (
//             <Button className="flex items-center gap-2">
//               <Download className="h-4 w-4" />
//               Exporter ({selectedReports.length})
//             </Button>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Liste des rapports */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   Rapports Générés
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={selectAllReports}
//                   >
//                     Sélectionner tout
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={clearSelection}
//                   >
//                     Désélectionner
//                   </Button>
//                 </div>
//               </CardTitle>
//               <CardDescription>
//                 Rapports financiers prêts pour consultation et
//                 export
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {generatedReports.map((report) => (
//                   <div
//                     key={report.id}
//                     className={`p-4 border rounded-lg cursor-pointer transition-all ${
//                       selectedReports.includes(report.id)
//                         ? "border-primary bg-primary/5"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() =>
//                       toggleReportSelection(report.id)
//                     }
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedReports.includes(
//                           report.id,
//                         )}
//                         onCheckedChange={() =>
//                           toggleReportSelection(report.id)
//                         }
//                       />

//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center justify-between mb-2">
//                           <h4 className="font-medium">
//                             {report.name}
//                           </h4>
//                           <div className="flex items-center gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="h-8"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="h-8"
//                             >
//                               <Download className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="h-8"
//                             >
//                               <Share2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
//                           <Badge
//                             variant="outline"
//                             className="text-xs"
//                           >
//                             {report.type}
//                           </Badge>
//                           <span>
//                             {report.records.toLocaleString(
//                               "fr-FR",
//                             )}{" "}
//                             lignes
//                           </span>
//                           <span>{report.size}</span>
//                         </div>

//                         <div className="flex items-center justify-between text-sm">
//                           <span className="text-muted-foreground">
//                             Généré le{" "}
//                             {formatDate(report.generatedAt)}
//                           </span>
//                           <div className="flex items-center gap-2">
//                             {report.formats.map((format) => (
//                               <Badge
//                                 key={format}
//                                 variant="outline"
//                                 className="text-xs"
//                               >
//                                 {format.toUpperCase()}
//                               </Badge>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Aperçu rapide */}
//           {selectedReports.length === 1 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Eye className="h-5 w-5" />
//                   Aperçu Rapide
//                 </CardTitle>
//                 <CardDescription>
//                   Prévisualisation du rapport sélectionné
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] flex items-center justify-center">
//                   <div className="text-center text-muted-foreground">
//                     <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p className="text-lg font-medium mb-2">
//                       {
//                         generatedReports.find(
//                           (r) => r.id === selectedReports[0],
//                         )?.name
//                       }
//                     </p>
//                     <p className="text-sm">
//                       Cliquez sur "Voir" pour ouvrir l'aperçu
//                       complet
//                     </p>
//                     <Button variant="outline" className="mt-4">
//                       <Eye className="h-4 w-4 mr-2" />
//                       Ouvrir l'aperçu
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Options d'export */}
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Download className="h-5 w-5" />
//                 Options d'Export
//               </CardTitle>
//               <CardDescription>
//                 Choisissez le format et la destination
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="format" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="format">
//                     Format
//                   </TabsTrigger>
//                   <TabsTrigger value="destination">
//                     Destination
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent
//                   value="format"
//                   className="space-y-4"
//                 >
//                   <div className="space-y-3">
//                     {exportFormats.map((format) => {
//                       const Icon = format.icon;
//                       return (
//                         <div
//                           key={format.id}
//                           className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                             selectedFormat === format.id
//                               ? "border-primary bg-primary/5"
//                               : format.compatible
//                                 ? "border-gray-200 hover:border-gray-300"
//                                 : "border-gray-100 bg-gray-50 opacity-50"
//                           }`}
//                           onClick={() =>
//                             format.compatible &&
//                             setSelectedFormat(format.id)
//                           }
//                         >
//                           <div className="flex items-start gap-3">
//                             <Icon className="h-5 w-5 mt-0.5 text-primary" />
//                             <div className="flex-1">
//                               <div className="flex items-center gap-2">
//                                 <h4 className="font-medium">
//                                   {format.name}
//                                 </h4>
//                                 <Badge
//                                   variant="outline"
//                                   className="text-xs"
//                                 >
//                                   .{format.extension}
//                                 </Badge>
//                                 {!format.compatible && (
//                                   <Badge
//                                     variant="outline"
//                                     className="text-xs text-red-600"
//                                   >
//                                     Bientôt
//                                   </Badge>
//                                 )}
//                               </div>
//                               <p className="text-sm text-muted-foreground mt-1">
//                                 {format.description}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </TabsContent>

//                 <TabsContent
//                   value="destination"
//                   className="space-y-4"
//                 >
//                   <div className="space-y-3">
//                     <div
//                       className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                         exportDestination === "download"
//                           ? "border-primary bg-primary/5"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                       onClick={() =>
//                         setExportDestination("download")
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <Download className="h-5 w-5 text-primary" />
//                         <div>
//                           <h4 className="font-medium">
//                             Téléchargement Direct
//                           </h4>
//                           <p className="text-sm text-muted-foreground">
//                             Télécharger sur votre ordinateur
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                         exportDestination === "email"
//                           ? "border-primary bg-primary/5"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                       onClick={() =>
//                         setExportDestination("email")
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <Mail className="h-5 w-5 text-primary" />
//                         <div>
//                           <h4 className="font-medium">
//                             Envoi par Email
//                           </h4>
//                           <p className="text-sm text-muted-foreground">
//                             Envoyer à une ou plusieurs adresses
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                         exportDestination === "archive"
//                           ? "border-primary bg-primary/5"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                       onClick={() =>
//                         setExportDestination("archive")
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <Archive className="h-5 w-5 text-primary" />
//                         <div>
//                           <h4 className="font-medium">
//                             Archivage Automatique
//                           </h4>
//                           <p className="text-sm text-muted-foreground">
//                             Sauvegarder dans l'archive ERP
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {exportDestination === "email" && (
//                     <div className="space-y-3 pt-4 border-t">
//                       <div className="space-y-2">
//                         <Label htmlFor="email-to">
//                           Destinataires
//                         </Label>
//                         <Input
//                           id="email-to"
//                           placeholder="email1@entreprise.com, email2@entreprise.com"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="email-subject">
//                           Objet
//                         </Label>
//                         <Input
//                           id="email-subject"
//                           value="États Financiers - Décembre 2024"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>

//           {/* Actions rapides */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Share2 className="h-5 w-5" />
//                 Actions Rapides
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 disabled={selectedReports.length === 0}
//               >
//                 <Eye className="h-4 w-4 mr-2" />
//                 Aperçu Combiné
//               </Button>

//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 disabled={selectedReports.length === 0}
//               >
//                 <Printer className="h-4 w-4 mr-2" />
//                 Imprimer
//               </Button>

//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 disabled={selectedReports.length === 0}
//               >
//                 <ExternalLink className="h-4 w-4 mr-2" />
//                 Envoyer vers Excel
//               </Button>

//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 disabled={selectedReports.length === 0}
//               >
//                 <Calendar className="h-4 w-4 mr-2" />
//                 Programmer Envoi
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Résumé de sélection */}
//           {selectedReports.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CheckCircle className="h-5 w-5" />
//                   Résumé
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="text-sm space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">
//                       Rapports :
//                     </span>
//                     <span className="font-medium">
//                       {selectedReports.length}
//                     </span>
//                   </div>

//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">
//                       Format :
//                     </span>
//                     <span className="font-medium">
//                       {selectedFormat.toUpperCase()}
//                     </span>
//                   </div>

//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">
//                       Destination :
//                     </span>
//                     <span className="font-medium">
//                       {exportDestination === "download"
//                         ? "Téléchargement"
//                         : exportDestination === "email"
//                           ? "Email"
//                           : "Archive"}
//                     </span>
//                   </div>

//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">
//                       Taille estimée :
//                     </span>
//                     <span className="font-medium">
//                       {(selectedReports.length * 2.1).toFixed(
//                         1,
//                       )}{" "}
//                       MB
//                     </span>
//                   </div>
//                 </div>

//                 <Button className="w-full mt-4">
//                   <Download className="h-4 w-4 mr-2" />
//                   Exporter Maintenant
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* Historique récent */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Clock className="h-5 w-5" />
//             Historique des Exports
//           </CardTitle>
//           <CardDescription>
//             Derniers exports et téléchargements effectués
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Rapport</TableHead>
//                 <TableHead>Format</TableHead>
//                 <TableHead>Destination</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Statut</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow>
//                 <TableCell className="font-medium">
//                   Bilan Comptable 2024
//                 </TableCell>
//                 <TableCell>PDF</TableCell>
//                 <TableCell>Téléchargement</TableCell>
//                 <TableCell>15/12/2024 14:35</TableCell>
//                 <TableCell>
//                   <Badge
//                     variant="outline"
//                     className="bg-green-50 text-green-700"
//                   >
//                     Réussi
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <Button variant="outline" size="sm">
//                     <Download className="h-4 w-4" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium">
//                   Compte de Résultat
//                 </TableCell>
//                 <TableCell>Excel</TableCell>
//                 <TableCell>Email</TableCell>
//                 <TableCell>15/12/2024 14:28</TableCell>
//                 <TableCell>
//                   <Badge
//                     variant="outline"
//                     className="bg-green-50 text-green-700"
//                   >
//                     Envoyé
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <Button variant="outline" size="sm">
//                     <Mail className="h-4 w-4" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }