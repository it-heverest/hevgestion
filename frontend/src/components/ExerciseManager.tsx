// import { useState } from 'react';
// import { Button } from './ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { Alert, AlertDescription } from './ui/alert';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
// import { Calendar, Lock, Unlock, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
// import { Separator } from './ui/separator';

// interface Exercise {
//   year: number;
//   status: 'open' | 'closed' | 'in_progress';
//   startDate: string;
//   endDate: string;
//   result?: number;
//   closedDate?: string;
// }

// interface ExerciseManagerProps {
//   companyId: string;
//   companyName: string;
// }

// export function ExerciseManager({ companyId, companyName }: ExerciseManagerProps) {
//   const [exercises, setExercises] = useState<Exercise[]>([
//     {
//       year: 2025,
//       status: 'open',
//       startDate: '2025-01-01',
//       endDate: '2025-12-31',
//     },
//     {
//       year: 2024,
//       status: 'closed',
//       startDate: '2024-01-01',
//       endDate: '2024-12-31',
//       result: 125000,
//       closedDate: '2025-01-15',
//     },
//     {
//       year: 2023,
//       status: 'closed',
//       startDate: '2023-01-01',
//       endDate: '2023-12-31',
//       result: 98000,
//       closedDate: '2024-01-10',
//     },
//   ]);

//   const [selectedExercise, setSelectedExercise] = useState<number>(2025);
//   const [showCloseDialog, setShowCloseDialog] = useState(false);
//   const [exerciseToClose, setExerciseToClose] = useState<Exercise | null>(null);

//   const handleCloseExercise = (exercise: Exercise) => {
//     setExerciseToClose(exercise);
//     setShowCloseDialog(true);
//   };

//   const confirmCloseExercise = () => {
//     if (!exerciseToClose) return;

//     // Simuler le calcul du résultat
//     const mockResult = Math.floor(Math.random() * 200000) + 50000;

//     // Clôturer l'exercice
//     const updatedExercises = exercises.map(ex =>
//       ex.year === exerciseToClose.year
//         ? { ...ex, status: 'closed' as const, result: mockResult, closedDate: new Date().toISOString() }
//         : ex
//     );

//     // Créer le nouvel exercice si nécessaire
//     const nextYear = exerciseToClose.year + 1;
//     const nextExerciseExists = exercises.some(ex => ex.year === nextYear);

//     if (!nextExerciseExists) {
//       updatedExercises.push({
//         year: nextYear,
//         status: 'open',
//         startDate: `${nextYear}-01-01`,
//         endDate: `${nextYear}-12-31`,
//       });
//     }

//     setExercises(updatedExercises.sort((a, b) => b.year - a.year));
//     setShowCloseDialog(false);
//     setExerciseToClose(null);
//   };

//   const currentExercise = exercises.find(ex => ex.year === selectedExercise);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2>Gestion des Exercices Comptables</h2>
//           <p className="text-sm text-muted-foreground mt-1">{companyName}</p>
//         </div>
//         <Select value={selectedExercise.toString()} onValueChange={(v) => setSelectedExercise(parseInt(v))}>
//           <SelectTrigger className="w-[200px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             {exercises.map(ex => (
//               <SelectItem key={ex.year} value={ex.year.toString()}>
//                 Exercice {ex.year}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Current Exercise Details */}
//       {currentExercise && (
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Exercice {currentExercise.year}</CardTitle>
//                 <CardDescription>
//                   Du {new Date(currentExercise.startDate).toLocaleDateString('fr-FR')} au{' '}
//                   {new Date(currentExercise.endDate).toLocaleDateString('fr-FR')}
//                 </CardDescription>
//               </div>
//               <Badge variant={currentExercise.status === 'open' ? 'default' : 'secondary'}>
//                 {currentExercise.status === 'open' && (
//                   <>
//                     <Unlock className="h-3 w-3 mr-1" />
//                     Ouvert
//                   </>
//                 )}
//                 {currentExercise.status === 'closed' && (
//                   <>
//                     <Lock className="h-3 w-3 mr-1" />
//                     Clôturé
//                   </>
//                 )}
//               </Badge>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Exercise Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <p className="text-xs text-muted-foreground">Date de début</p>
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-orange-600" />
//                   <span>{new Date(currentExercise.startDate).toLocaleDateString('fr-FR')}</span>
//                 </div>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-xs text-muted-foreground">Date de fin</p>
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-orange-600" />
//                   <span>{new Date(currentExercise.endDate).toLocaleDateString('fr-FR')}</span>
//                 </div>
//               </div>
//             </div>

//             {currentExercise.status === 'closed' && currentExercise.result !== undefined && (
//               <>
//                 <Separator />
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-muted-foreground">Résultat de l'exercice</span>
//                     <div className="flex items-center gap-2">
//                       <TrendingUp className={`h-4 w-4 ${currentExercise.result > 0 ? 'text-green-600' : 'text-red-600'}`} />
//                       <span className={currentExercise.result > 0 ? 'text-green-600' : 'text-red-600'}>
//                         {currentExercise.result.toLocaleString('fr-FR')} €
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-muted-foreground">Date de clôture</span>
//                     <span className="text-xs">
//                       {currentExercise.closedDate && new Date(currentExercise.closedDate).toLocaleDateString('fr-FR')}
//                     </span>
//                   </div>
//                 </div>

//                 <Alert>
//                   <CheckCircle2 className="h-4 w-4" />
//                   <AlertDescription>
//                     Le résultat de cet exercice a été automatiquement transféré à l'exercice {currentExercise.year + 1}
//                   </AlertDescription>
//                 </Alert>
//               </>
//             )}

//             {currentExercise.status === 'open' && (
//               <>
//                 <Separator />
//                 <Alert>
//                   <AlertTriangle className="h-4 w-4" />
//                   <AlertDescription>
//                     La clôture de cet exercice créera automatiquement l'exercice {currentExercise.year + 1}
//                     et transférera le résultat.
//                   </AlertDescription>
//                 </Alert>
//                 <Button
//                   onClick={() => handleCloseExercise(currentExercise)}
//                   className="w-full"
//                   variant="default"
//                 >
//                   <Lock className="h-4 w-4 mr-2" />
//                   Clôturer l'exercice {currentExercise.year}
//                 </Button>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Exercises Timeline */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Historique des exercices</CardTitle>
//           <CardDescription>Vue d'ensemble de tous les exercices comptables</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {exercises.map((exercise, index) => (
//               <div key={exercise.year}>
//                 <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
//                   <div className="flex items-center gap-4">
//                     <div className={`p-2 rounded-lg ${exercise.status === 'open' ? 'bg-orange-100' : 'bg-gray-100'}`}>
//                       {exercise.status === 'open' ? (
//                         <Unlock className="h-5 w-5 text-orange-600" />
//                       ) : (
//                         <Lock className="h-5 w-5 text-gray-600" />
//                       )}
//                     </div>
//                     <div>
//                       <p>Exercice {exercise.year}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {new Date(exercise.startDate).toLocaleDateString('fr-FR')} - {new Date(exercise.endDate).toLocaleDateString('fr-FR')}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     {exercise.result !== undefined && (
//                       <div className="text-right">
//                         <p className="text-xs text-muted-foreground">Résultat</p>
//                         <p className={exercise.result > 0 ? 'text-green-600' : 'text-red-600'}>
//                           {exercise.result.toLocaleString('fr-FR')} €
//                         </p>
//                       </div>
//                     )}
//                     <Badge variant={exercise.status === 'open' ? 'default' : 'secondary'}>
//                       {exercise.status === 'open' ? 'Ouvert' : 'Clôturé'}
//                     </Badge>
//                   </div>
//                 </div>
//                 {index < exercises.length - 1 && (
//                   <div className="flex justify-center py-2">
//                     <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Close Exercise Dialog */}
//       <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Clôturer l'exercice {exerciseToClose?.year}</DialogTitle>
//             <DialogDescription>
//               Cette action va clôturer définitivement l'exercice {exerciseToClose?.year}.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <Alert>
//               <CheckCircle2 className="h-4 w-4" />
//               <AlertDescription>
//                 <ul className="list-disc list-inside space-y-1 text-sm">
//                   <li>Le résultat de l'exercice sera calculé</li>
//                   <li>L'exercice {exerciseToClose && exerciseToClose.year + 1} sera créé automatiquement</li>
//                   <li>Le résultat sera transféré au bilan d'ouverture de l'exercice suivant</li>
//                   <li>Aucune modification ne sera possible après clôture</li>
//                 </ul>
//               </AlertDescription>
//             </Alert>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
//               Annuler
//             </Button>
//             <Button onClick={confirmCloseExercise}>
//               <Lock className="h-4 w-4 mr-2" />
//               Confirmer la clôture
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
