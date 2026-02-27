// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Badge } from './ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Alert, AlertDescription } from './ui/alert';
// import { Separator } from './ui/separator';
// import { Calculator, Info, Download, CheckCircle2 } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// interface TaxCalculatorProps {
//   country: {
//     name: string;
//     vat: string;
//     corporateTax: string;
//     currency: string;
//   };
// }

// export function TaxCalculator({ country }: TaxCalculatorProps) {
//   const [vatBase, setVatBase] = useState('');
//   const [turnover, setTurnover] = useState('');
//   const [salaries, setSalaries] = useState('');

//   const vatRate = parseFloat(country.vat) / 100;
//   const corporateTaxRate = parseFloat(country.corporateTax) / 100;

//   const calculatedVAT = vatBase ? (parseFloat(vatBase) * vatRate).toFixed(2) : '0';
//   const calculatedIS = turnover && salaries 
//     ? ((parseFloat(turnover) - parseFloat(salaries)) * corporateTaxRate).toFixed(2)
//     : '0';

//   const cnpsEmployee = salaries ? (parseFloat(salaries) * 0.036).toFixed(2) : '0'; // 3.6%
//   const cnpsEmployer = salaries ? (parseFloat(salaries) * 0.166).toFixed(2) : '0'; // 16.6%
//   const totalCNPS = salaries ? (parseFloat(cnpsEmployee) + parseFloat(cnpsEmployer)).toFixed(2) : '0';

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2>Calculs Fiscaux - {country.name}</h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Calculatrice fiscale automatique selon les taux en vigueur
//         </p>
//       </div>

//       {/* Country Tax Info */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Taux Fiscaux Applicables</CardTitle>
//           <CardDescription>Taux officiels pour {country.name}</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">TVA (Taxe sur la Valeur Ajoutée)</p>
//               <p className="text-2xl text-blue-600">{country.vat}</p>
//             </div>
//             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">IS (Impôt sur les Sociétés)</p>
//               <p className="text-2xl text-green-600">{country.corporateTax}</p>
//             </div>
//             <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">CNPS (Cotisations Sociales)</p>
//               <p className="text-2xl text-purple-600">20.2%</p>
//               <p className="text-xs text-muted-foreground">3.6% salarié + 16.6% employeur</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="vat" className="w-full">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="vat">TVA</TabsTrigger>
//           <TabsTrigger value="is">Impôt sur Sociétés</TabsTrigger>
//           <TabsTrigger value="cnps">CNPS</TabsTrigger>
//         </TabsList>

//         {/* TVA Calculator */}
//         <TabsContent value="vat" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Calcul de la TVA</CardTitle>
//               <CardDescription>Calculez la TVA collectée et déductible</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="vat-base">Base HT ({country.currency})</Label>
//                 <Input
//                   id="vat-base"
//                   type="number"
//                   value={vatBase}
//                   onChange={(e) => setVatBase(e.target.value)}
//                   placeholder="Entrez le montant HT"
//                 />
//               </div>

//               <Separator />

//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Base HT</span>
//                   <span>{vatBase || '0'} {country.currency}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Taux TVA</span>
//                   <Badge>{country.vat}</Badge>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-200 rounded-lg">
//                   <span>TVA à payer</span>
//                   <span className="text-blue-600">{calculatedVAT} {country.currency}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <span>Montant TTC</span>
//                   <span className="text-blue-600">
//                     {vatBase ? (parseFloat(vatBase) + parseFloat(calculatedVAT)).toFixed(2) : '0'} {country.currency}
//                   </span>
//                 </div>
//               </div>

//               <Button className="w-full">
//                 <Download className="h-4 w-4 mr-2" />
//                 Générer la déclaration TVA
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* IS Calculator */}
//         <TabsContent value="is" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Calcul de l'Impôt sur les Sociétés</CardTitle>
//               <CardDescription>Estimation de l'IS à payer</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="turnover">Chiffre d'affaires ({country.currency})</Label>
//                 <Input
//                   id="turnover"
//                   type="number"
//                   value={turnover}
//                   onChange={(e) => setTurnover(e.target.value)}
//                   placeholder="Entrez le CA annuel"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="expenses">Charges déductibles ({country.currency})</Label>
//                 <Input
//                   id="expenses"
//                   type="number"
//                   value={salaries}
//                   onChange={(e) => setSalaries(e.target.value)}
//                   placeholder="Entrez les charges"
//                 />
//               </div>

//               <Separator />

//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Chiffre d'affaires</span>
//                   <span>{turnover || '0'} {country.currency}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Charges déductibles</span>
//                   <span>{salaries || '0'} {country.currency}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Résultat fiscal</span>
//                   <span>
//                     {turnover && salaries 
//                       ? (parseFloat(turnover) - parseFloat(salaries)).toFixed(2)
//                       : '0'} {country.currency}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Taux IS</span>
//                   <Badge>{country.corporateTax}</Badge>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-green-100 border border-green-200 rounded-lg">
//                   <span>Impôt à payer</span>
//                   <span className="text-green-600">{calculatedIS} {country.currency}</span>
//                 </div>
//               </div>

//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertDescription>
//                   Ce calcul est une estimation. Consultez votre expert-comptable pour le calcul définitif.
//                 </AlertDescription>
//               </Alert>

//               <Button className="w-full">
//                 <Download className="h-4 w-4 mr-2" />
//                 Générer la déclaration IS
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* CNPS Calculator */}
//         <TabsContent value="cnps" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Calcul des Cotisations CNPS</CardTitle>
//               <CardDescription>Caisse Nationale de Prévoyance Sociale</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="salaries">Masse salariale brute ({country.currency})</Label>
//                 <Input
//                   id="salaries"
//                   type="number"
//                   value={salaries}
//                   onChange={(e) => setSalaries(e.target.value)}
//                   placeholder="Entrez la masse salariale"
//                 />
//               </div>

//               <Separator />

//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
//                   <span className="text-sm">Masse salariale brute</span>
//                   <span>{salaries || '0'} {country.currency}</span>
//                 </div>
                
//                 <div className="p-3 border rounded-lg space-y-2">
//                   <p className="text-sm mb-2">Répartition des cotisations</p>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-muted-foreground">Part salariale (3.6%)</span>
//                     <span>{cnpsEmployee} {country.currency}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-muted-foreground">Part patronale (16.6%)</span>
//                     <span>{cnpsEmployer} {country.currency}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-purple-100 border border-purple-200 rounded-lg">
//                   <span>Total CNPS à verser</span>
//                   <span className="text-purple-600">{totalCNPS} {country.currency}</span>
//                 </div>
//               </div>

//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertDescription>
//                   Taux indicatifs. Les taux peuvent varier selon les catégories professionnelles et les pays.
//                 </AlertDescription>
//               </Alert>

//               <Button className="w-full">
//                 <Download className="h-4 w-4 mr-2" />
//                 Générer la déclaration CNPS
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Récapitulatif Fiscal</CardTitle>
//           <CardDescription>Vue d'ensemble des obligations fiscales</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Type d'impôt</TableHead>
//                 <TableHead>Base</TableHead>
//                 <TableHead>Taux</TableHead>
//                 <TableHead className="text-right">Montant estimé</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow>
//                 <TableCell>TVA</TableCell>
//                 <TableCell>{vatBase || '0'} {country.currency}</TableCell>
//                 <TableCell>{country.vat}</TableCell>
//                 <TableCell className="text-right">{calculatedVAT} {country.currency}</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell>Impôt sur Sociétés</TableCell>
//                 <TableCell>
//                   {turnover && salaries 
//                     ? (parseFloat(turnover) - parseFloat(salaries)).toFixed(2)
//                     : '0'} {country.currency}
//                 </TableCell>
//                 <TableCell>{country.corporateTax}</TableCell>
//                 <TableCell className="text-right">{calculatedIS} {country.currency}</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell>CNPS</TableCell>
//                 <TableCell>{salaries || '0'} {country.currency}</TableCell>
//                 <TableCell>20.2%</TableCell>
//                 <TableCell className="text-right">{totalCNPS} {country.currency}</TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
