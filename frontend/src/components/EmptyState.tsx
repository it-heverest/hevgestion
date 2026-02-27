// import { Button } from './ui/button';
// import { Card, CardContent } from './ui/card';
// import { 
//   FileX, 
//   FolderOpen, 
//   Upload, 
//   FileText,
//   Calendar,
//   Search,
//   Plus,
//   Inbox
// } from 'lucide-react';

// interface EmptyStateProps {
//   icon?: 'file' | 'folder' | 'upload' | 'document' | 'calendar' | 'search' | 'inbox';
//   title: string;
//   description: string;
//   action?: {
//     label: string;
//     onClick: () => void;
//   };
//   secondaryAction?: {
//     label: string;
//     onClick: () => void;
//   };
// }

// const iconMap = {
//   file: FileX,
//   folder: FolderOpen,
//   upload: Upload,
//   document: FileText,
//   calendar: Calendar,
//   search: Search,
//   inbox: Inbox
// };

// export function EmptyState({ 
//   icon = 'inbox', 
//   title, 
//   description, 
//   action,
//   secondaryAction 
// }: EmptyStateProps) {
//   const Icon = iconMap[icon];

//   return (
//     <Card className="border-dashed">
//       <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
//         <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mb-6">
//           <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400 opacity-80" />
//         </div>
        
//         <h3 className="text-lg font-semibold mb-2">{title}</h3>
//         <p className="text-muted-foreground max-w-md mb-6">
//           {description}
//         </p>

//         {action && (
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Button onClick={action.onClick} size="lg">
//               <Plus className="h-4 w-4 mr-2" />
//               {action.label}
//             </Button>
//             {secondaryAction && (
//               <Button 
//                 variant="outline" 
//                 onClick={secondaryAction.onClick}
//                 size="lg"
//               >
//                 {secondaryAction.label}
//               </Button>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // Composants pré-configurés pour des cas d'usage courants
// export function NoBalanceState({ onImport, onUseTemplate }: { 
//   onImport: () => void;
//   onUseTemplate: () => void;
// }) {
//   return (
//     <EmptyState
//       icon="upload"
//       title="Aucune balance importée"
//       description="Commencez par importer votre balance comptable depuis Excel, CSV ou votre ERP. Vous pouvez également utiliser un template pré-configuré."
//       action={{
//         label: 'Importer une balance',
//         onClick: onImport
//       }}
//       secondaryAction={{
//         label: 'Utiliser un template',
//         onClick: onUseTemplate
//       }}
//     />
//   );
// }

// export function NoReportsState({ onGenerate }: { onGenerate: () => void }) {
//   return (
//     <EmptyState
//       icon="document"
//       title="Aucun rapport généré"
//       description="Générez vos états financiers OHADA automatiquement à partir de votre balance importée. Bilan, Compte de Résultat, TAFIRE et plus encore."
//       action={{
//         label: 'Générer les rapports',
//         onClick: onGenerate
//       }}
//     />
//   );
// }

// export function NoExerciseState({ onCreate }: { onCreate: () => void }) {
//   return (
//     <EmptyState
//       icon="calendar"
//       title="Aucun exercice comptable"
//       description="Créez votre premier exercice comptable pour commencer à travailler. Un exercice correspond généralement à une période de 12 mois."
//       action={{
//         label: 'Créer un exercice',
//         onClick: onCreate
//       }}
//     />
//   );
// }

// export function NoSearchResultsState() {
//   return (
//     <EmptyState
//       icon="search"
//       title="Aucun résultat trouvé"
//       description="Essayez d'autres mots-clés ou vérifiez l'orthographe de votre recherche."
//     />
//   );
// }

// export function NoDataState({ message }: { message?: string }) {
//   return (
//     <EmptyState
//       icon="inbox"
//       title="Aucune donnée disponible"
//       description={message || "Il n'y a actuellement aucune donnée à afficher. Commencez par créer du contenu."}
//     />
//   );
// }
