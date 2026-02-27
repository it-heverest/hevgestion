// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { Checkbox } from "./ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
// import { Calendar } from "./ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
// import { 
//   Calendar as CalendarIcon, 
//   Settings2, 
//   Filter,
//   Clock,
//   Building2,
//   FileText,
//   Eye,
//   Database,
//   Users
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

// export function ReportParameters() {
//   const [dateRange, setDateRange] = useState({
//     from: new Date(2024, 0, 1), // 1er janvier 2024
//     to: new Date() // Aujourd'hui
//   });
//   const [reportLevel, setReportLevel] = useState('summary');
//   const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['100']);
//   const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
//   const [includeSubAccounts, setIncludeSubAccounts] = useState(true);

//   const reportPeriods = [
//     { id: 'month', name: 'Mensuel', description: 'Rapport mensuel' },
//     { id: 'quarter', name: 'Trimestriel', description: 'Rapport trimestriel' },
//     { id: 'year', name: 'Annuel', description: 'Rapport annuel' },
//     { id: 'custom', name: 'Personnalisé', description: 'Période personnalisée' }
//   ];

//   const companies = [
//     { code: '100', name: 'Société Principale SA', country: 'France' },
//     { code: '200', name: 'Filiale Export SARL', country: 'France' },
//     { code: '300', name: 'Subsidiary UK Ltd', country: 'Royaume-Uni' },
//     { code: '400', name: 'Tochtergesellschaft GmbH', country: 'Allemagne' }
//   ];

//   const departments = [
//     { code: 'ADM', name: 'Administration', parent: null },
//     { code: 'COM', name: 'Commercial', parent: null },
//     { code: 'PRO', name: 'Production', parent: null },
//     { code: 'FIN', name: 'Finance', parent: null },
//     { code: 'RH', name: 'Ressources Humaines', parent: null },
//     { code: 'IT', name: 'Informatique', parent: 'ADM' },
//     { code: 'VEN', name: 'Ventes', parent: 'COM' },
//     { code: 'MKT', name: 'Marketing', parent: 'COM' }
//   ];

//   const accountFilters = [
//     { id: 'all', name: 'Tous les comptes', description: 'Inclure tous les comptes comptables' },
//     { id: 'active', name: 'Comptes actifs uniquement', description: 'Exclure les comptes fermés' },
//     { id: 'range', name: 'Plage de comptes', description: 'Spécifier une plage de numéros de compte' },
//     { id: 'categories', name: 'Catégories spécifiques', description: 'Sélectionner par catégorie comptable' }
//   ];

//   const toggleCompany = (companyCode: string) => {
//     setSelectedCompanies(prev => 
//       prev.includes(companyCode) 
//         ? prev.filter(code => code !== companyCode)
//         : [...prev, companyCode]
//     );
//   };

//   const toggleDepartment = (deptCode: string) => {
//     setSelectedDepartments(prev => 
//       prev.includes(deptCode) 
//         ? prev.filter(code => code !== deptCode)
//         : [...prev, deptCode]
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Paramètres des Rapports</h2>
//           <p className="text-muted-foreground">
//             Définissez la période, le niveau de détail et les filtres pour vos états financiers
//           </p>
//         </div>
//         <Badge variant="outline" className="flex items-center gap-2">
//           <Settings2 className="h-4 w-4" />
//           Configuration
//         </Badge>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Configuration principale */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Période de rapport */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <CalendarIcon className="h-5 w-5" />
//                 Période de Rapport
//               </CardTitle>
//               <CardDescription>
//                 Sélectionnez la période pour laquelle générer les états financiers
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {reportPeriods.map((period) => (
//                   <div key={period.id} className="space-y-2">
//                     <Button 
//                       variant="outline" 
//                       className="w-full h-auto p-4 flex flex-col items-center gap-2"
//                     >
//                       <span className="font-medium">{period.name}</span>
//                       <span className="text-xs text-muted-foreground text-center">
//                         {period.description}
//                       </span>
//                     </Button>
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Date de début</Label>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant="outline" className="w-full justify-start">
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {dateRange.from ? format(dateRange.from, 'dd MMMM yyyy', { locale: fr }) : 'Sélectionner'}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0">
//                       <Calendar
//                         mode="single"
//                         selected={dateRange.from}
//                         onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || new Date() }))}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label>Date de fin</Label>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant="outline" className="w-full justify-start">
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {dateRange.to ? format(dateRange.to, 'dd MMMM yyyy', { locale: fr }) : 'Sélectionner'}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0">
//                       <Calendar
//                         mode="single"
//                         selected={dateRange.to}
//                         onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || new Date() }))}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Niveau de détail */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Eye className="h-5 w-5" />
//                 Niveau de Détail
//               </CardTitle>
//               <CardDescription>
//                 Choisissez le niveau de détail des transactions et comptes
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RadioGroup value={reportLevel} onValueChange={setReportLevel}>
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-2 p-4 border rounded-lg">
//                     <RadioGroupItem value="summary" id="summary" />
//                     <div className="flex-1">
//                       <Label htmlFor="summary" className="font-medium">Résumé</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Totaux par catégorie comptable principale
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center space-x-2 p-4 border rounded-lg">
//                     <RadioGroupItem value="detailed" id="detailed" />
//                     <div className="flex-1">
//                       <Label htmlFor="detailed" className="font-medium">Détaillé</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Détail par compte avec sous-totaux
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center space-x-2 p-4 border rounded-lg">
//                     <RadioGroupItem value="transaction" id="transaction" />
//                     <div className="flex-1">
//                       <Label htmlFor="transaction" className="font-medium">Transactionnel</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Toutes les transactions individuelles
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </RadioGroup>
//             </CardContent>
//           </Card>

//           {/* Filtres spécifiques */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Filter className="h-5 w-5" />
//                 Filtres Spécifiques
//               </CardTitle>
//               <CardDescription>
//                 Appliquez des filtres pour personnaliser vos rapports
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="accounts" className="w-full">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="accounts">Comptes</TabsTrigger>
//                   <TabsTrigger value="transactions">Transactions</TabsTrigger>
//                   <TabsTrigger value="advanced">Avancé</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="accounts" className="space-y-4">
//                   <RadioGroup defaultValue="all">
//                     {accountFilters.map((filter) => (
//                       <div key={filter.id} className="flex items-center space-x-2 p-3 border rounded-lg">
//                         <RadioGroupItem value={filter.id} id={filter.id} />
//                         <div className="flex-1">
//                           <Label htmlFor={filter.id} className="font-medium">{filter.name}</Label>
//                           <p className="text-sm text-muted-foreground">{filter.description}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </RadioGroup>
                  
//                   <div className="flex items-center space-x-2 pt-4">
//                     <Checkbox 
//                       id="sub-accounts" 
//                       checked={includeSubAccounts}
//                       onCheckedChange={setIncludeSubAccounts}
//                     />
//                     <Label htmlFor="sub-accounts">Inclure les sous-comptes</Label>
//                   </div>
//                 </TabsContent>
                
//                 <TabsContent value="transactions" className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Montant minimum</Label>
//                       <Input type="number" placeholder="0.00" />
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Montant maximum</Label>
//                       <Input type="number" placeholder="999999.99" />
//                     </div>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <Label>Type de transaction</Label>
//                     <Select>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Tous les types" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">Tous les types</SelectItem>
//                         <SelectItem value="manual">Saisies manuelles</SelectItem>
//                         <SelectItem value="auto">Écritures automatiques</SelectItem>
//                         <SelectItem value="import">Importations</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </TabsContent>
                
//                 <TabsContent value="advanced" className="space-y-4">
//                   <div className="space-y-4">
//                     <div className="flex items-center space-x-2">
//                       <Checkbox id="zero-balance" />
//                       <Label htmlFor="zero-balance">Exclure les comptes à solde nul</Label>
//                     </div>
                    
//                     <div className="flex items-center space-x-2">
//                       <Checkbox id="inactive-accounts" />
//                       <Label htmlFor="inactive-accounts">Inclure les comptes inactifs</Label>
//                     </div>
                    
//                     <div className="flex items-center space-x-2">
//                       <Checkbox id="inter-company" />
//                       <Label htmlFor="inter-company">Éliminer les transactions inter-sociétés</Label>
//                     </div>
//                   </div>
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Paramètres organisationnels */}
//         <div className="space-y-6">
//           {/* Sélection des sociétés */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Building2 className="h-5 w-5" />
//                 Sociétés
//               </CardTitle>
//               <CardDescription>
//                 Sélectionnez les entités à inclure
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {companies.map((company) => (
//                 <div 
//                   key={company.code}
//                   className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                     selectedCompanies.includes(company.code) 
//                       ? 'border-primary bg-primary/5' 
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                   onClick={() => toggleCompany(company.code)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <Checkbox 
//                       checked={selectedCompanies.includes(company.code)}
//                       onCheckedChange={() => toggleCompany(company.code)}
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-sm">{company.name}</p>
//                       <div className="flex items-center gap-2 mt-1">
//                         <Badge variant="outline" className="text-xs">
//                           {company.code}
//                         </Badge>
//                         <span className="text-xs text-muted-foreground">
//                           {company.country}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           {/* Départements */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Users className="h-5 w-5" />
//                 Départements
//               </CardTitle>
//               <CardDescription>
//                 Filtrer par centre de coûts
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {departments.filter(dept => !dept.parent).map((department) => (
//                 <div key={department.code}>
//                   <div 
//                     className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                       selectedDepartments.includes(department.code) 
//                         ? 'border-primary bg-primary/5' 
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                     onClick={() => toggleDepartment(department.code)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <Checkbox 
//                         checked={selectedDepartments.includes(department.code)}
//                         onCheckedChange={() => toggleDepartment(department.code)}
//                       />
//                       <div className="flex-1">
//                         <p className="font-medium text-sm">{department.name}</p>
//                         <Badge variant="outline" className="text-xs mt-1">
//                           {department.code}
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Sous-départements */}
//                   {departments.filter(d => d.parent === department.code).map((subDept) => (
//                     <div 
//                       key={subDept.code}
//                       className={`ml-6 mt-2 p-2 border rounded cursor-pointer transition-all ${
//                         selectedDepartments.includes(subDept.code) 
//                           ? 'border-primary bg-primary/5' 
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => toggleDepartment(subDept.code)}
//                     >
//                       <div className="flex items-center gap-2">
//                         <Checkbox 
//                           checked={selectedDepartments.includes(subDept.code)}
//                           onCheckedChange={() => toggleDepartment(subDept.code)}
//                         />
//                         <div className="flex-1">
//                           <p className="text-sm">{subDept.name}</p>
//                           <Badge variant="outline" className="text-xs">
//                             {subDept.code}
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           {/* Résumé de configuration */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="h-5 w-5" />
//                 Résumé
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="text-sm space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Période :</span>
//                   <span className="font-medium">
//                     {format(dateRange.from, 'dd/MM/yyyy', { locale: fr })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: fr })}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Niveau :</span>
//                   <span className="font-medium">
//                     {reportLevel === 'summary' ? 'Résumé' : 
//                      reportLevel === 'detailed' ? 'Détaillé' : 'Transactionnel'}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Sociétés :</span>
//                   <span className="font-medium">{selectedCompanies.length}</span>
//                 </div>
                
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Départements :</span>
//                   <span className="font-medium">
//                     {selectedDepartments.length > 0 ? selectedDepartments.length : 'Tous'}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex justify-between items-center pt-6 border-t">
//         <Button variant="outline">
//           Retour
//         </Button>
//         <div className="flex gap-3">
//           <Button variant="outline">
//             Sauvegarder le modèle
//           </Button>
//           <Button className="min-w-[120px]">
//             Valider les paramètres
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }