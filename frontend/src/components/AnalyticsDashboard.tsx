// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { Progress } from './ui/progress';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import {
//   TrendingUp,
//   TrendingDown,
//   AlertCircle,
//   CheckCircle2,
//   Clock,
//   FileText,
//   Users,
//   BarChart3,
//   Calendar,
//   DollarSign,
//   ArrowUpRight,
//   ArrowDownRight,
//   Activity
// } from 'lucide-react';
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend
// } from 'recharts';

// interface AnalyticsDashboardProps {
//   companyName: string;
//   currentExercise: number;
// }

// const performanceData = [
//   { month: 'Jan', revenu: 4500, charges: 3200 },
//   { month: 'Fév', revenu: 5200, charges: 3800 },
//   { month: 'Mar', revenu: 4800, charges: 3500 },
//   { month: 'Avr', revenu: 6100, charges: 4200 },
//   { month: 'Mai', revenu: 5900, charges: 4000 },
//   { month: 'Juin', revenu: 7200, charges: 4800 },
// ];

// const categoryData = [
//   { name: 'Ventes', value: 45, color: '#3b82f6' },
//   { name: 'Services', value: 30, color: '#10b981' },
//   { name: 'Autres', value: 15, color: '#f59e0b' },
//   { name: 'Exceptionnels', value: 10, color: '#ef4444' },
// ];

// const recentActivities = [
//   { id: 1, action: 'Balance importée', date: '2025-01-15', status: 'success' },
//   { id: 2, action: 'Rapport Bilan généré', date: '2025-01-14', status: 'success' },
//   { id: 3, action: 'Traitement en cours', date: '2025-01-14', status: 'pending' },
//   { id: 4, action: 'Anomalie détectée', date: '2025-01-13', status: 'warning' },
// ];

// export function AnalyticsDashboard({ companyName, currentExercise }: AnalyticsDashboardProps) {
//   const kpiCards = [
//     {
//       title: 'Chiffre d\'affaires',
//       value: '33,700 FCFA',
//       change: '+12.5%',
//       trend: 'up',
//       icon: DollarSign,
//       color: 'text-green-600 dark:text-green-400'
//     },
//     {
//       title: 'Résultat Net',
//       value: '10,100 FCFA',
//       change: '+8.2%',
//       trend: 'up',
//       icon: TrendingUp,
//       color: 'text-blue-600 dark:text-blue-400'
//     },
//     {
//       title: 'Trésorerie',
//       value: '15,450 FCFA',
//       change: '-3.1%',
//       trend: 'down',
//       icon: Activity,
//       color: 'text-orange-600 dark:text-orange-400'
//     },
//     {
//       title: 'Dossiers actifs',
//       value: '24',
//       change: '+2',
//       trend: 'up',
//       icon: FileText,
//       color: 'text-purple-600 dark:text-purple-400'
//     },
//   ];

//   const upcomingDeadlines = [
//     { id: 1, title: 'Déclaration TVA', date: '2025-01-30', priority: 'high' },
//     { id: 2, title: 'Déclaration CNPS', date: '2025-02-05', priority: 'medium' },
//     { id: 3, title: 'Bilan annuel', date: '2025-03-31', priority: 'low' },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div>
//         <h2 className="text-2xl font-semibold mb-1">Tableau de Bord Analytique</h2>
//         <p className="text-muted-foreground">
//           {companyName} • Exercice {currentExercise}
//         </p>
//       </div>

//       {/* KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {kpiCards.map((kpi, index) => {
//           const Icon = kpi.icon;
//           return (
//             <Card key={index}>
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   {kpi.title}
//                 </CardTitle>
//                 <Icon className={`h-4 w-4 ${kpi.color}`} />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold mb-1">{kpi.value}</div>
//                 <div className="flex items-center gap-1 text-sm">
//                   {kpi.trend === 'up' ? (
//                     <ArrowUpRight className="h-4 w-4 text-green-600" />
//                   ) : (
//                     <ArrowDownRight className="h-4 w-4 text-red-600" />
//                   )}
//                   <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
//                     {kpi.change}
//                   </span>
//                   <span className="text-muted-foreground">vs mois dernier</span>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Graphiques */}
//       <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
//         {/* Performance */}
//         <Card className="lg:col-span-4">
//           <CardHeader>
//             <CardTitle>Performance Financière</CardTitle>
//             <CardDescription>Évolution des revenus et charges sur 6 mois</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={performanceData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
//                 <XAxis dataKey="month" className="text-xs" />
//                 <YAxis className="text-xs" />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="revenu"
//                   stroke="#3b82f6"
//                   strokeWidth={2}
//                   name="Revenus"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="charges"
//                   stroke="#ef4444"
//                   strokeWidth={2}
//                   name="Charges"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Répartition */}
//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle>Répartition des Revenus</CardTitle>
//             <CardDescription>Par catégorie de produits</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={categoryData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {categoryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Activités et Échéances */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Activités récentes */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Activity className="h-5 w-5" />
//               Activités Récentes
//             </CardTitle>
//             <CardDescription>Dernières actions effectuées</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentActivities.map((activity) => (
//                 <div key={activity.id} className="flex items-center gap-3">
//                   {activity.status === 'success' && (
//                     <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
//                   )}
//                   {activity.status === 'pending' && (
//                     <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                   )}
//                   {activity.status === 'warning' && (
//                     <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
//                   )}
//                   <div className="flex-1">
//                     <p className="text-sm font-medium">{activity.action}</p>
//                     <p className="text-xs text-muted-foreground">{activity.date}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Échéances */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Calendar className="h-5 w-5" />
//               Échéances Fiscales
//             </CardTitle>
//             <CardDescription>Prochaines dates importantes</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {upcomingDeadlines.map((deadline) => (
//                 <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex-1">
//                     <p className="text-sm font-medium">{deadline.title}</p>
//                     <p className="text-xs text-muted-foreground">{deadline.date}</p>
//                   </div>
//                   <Badge
//                     variant={
//                       deadline.priority === 'high' ? 'destructive' :
//                       deadline.priority === 'medium' ? 'default' :
//                       'secondary'
//                     }
//                   >
//                     {deadline.priority === 'high' ? 'Urgent' :
//                      deadline.priority === 'medium' ? 'Moyen' :
//                      'Bas'}
//                   </Badge>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Conformité SYSCOHADA */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Conformité SYSCOHADA</CardTitle>
//           <CardDescription>État de conformité de vos documents</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <div className="flex items-center justify-between text-sm">
//               <span>Balance comptable</span>
//               <span className="font-medium">100%</span>
//             </div>
//             <Progress value={100} className="h-2" />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between text-sm">
//               <span>États financiers</span>
//               <span className="font-medium">85%</span>
//             </div>
//             <Progress value={85} className="h-2" />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between text-sm">
//               <span>Notes annexes</span>
//               <span className="font-medium">60%</span>
//             </div>
//             <Progress value={60} className="h-2" />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
