// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Textarea } from "./ui/textarea";
// import { ScrollArea } from "./ui/scroll-area";
// import { Separator } from "./ui/separator";
// import {
//   MessageSquare,
//   Send,
//   UserPlus,
//   MoreHorizontal,
//   Reply,
//   ThumbsUp,
//   Edit,
//   Trash2,
//   Users,
//   Loader2,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { useAuth } from "../contexts/AuthContext";
// import { useApp } from "../contexts/AppContext";
// import { folderService } from "../services/folder.service";

// interface Comment {
//   id: string;
//   author: {
//     name: string;
//     avatar?: string;
//     role: string;
//   };
//   content: string;
//   timestamp: string;
//   likes: number;
//   replies?: Comment[];
// }

// interface CollaborationPanelProps {
//   context?: string;
//   entityId?: string;
// }

// const mockComments: Comment[] = [
//   {
//     id: "1",
//     author: {
//       name: "Marie Kouadio",
//       role: "Expert Comptable",
//     },
//     content:
//       "J'ai vérifié les comptes de classe 2, tout semble conforme aux normes SYSCOHADA.",
//     timestamp: "Il y a 2h",
//     likes: 3,
//     replies: [
//       {
//         id: "1-1",
//         author: {
//           name: "Jean Mensah",
//           role: "Comptable",
//         },
//         content:
//           "Merci pour la vérification ! J'ai fait les ajustements nécessaires.",
//         timestamp: "Il y a 1h",
//         likes: 1,
//       },
//     ],
//   },
//   {
//     id: "2",
//     author: {
//       name: "Amadou Diallo",
//       role: "Auditeur",
//     },
//     content:
//       "Attention, il y a une anomalie sur le compte 401000. Le solde ne correspond pas à la balance auxiliaire.",
//     timestamp: "Il y a 4h",
//     likes: 5,
//   },
// ];

// const mockCollaborators = [
//   {
//     id: "1",
//     name: "Marie Kouadio",
//     role: "Expert Comptable",
//     status: "online",
//   },
//   { id: "2", name: "Jean Mensah", role: "Comptable", status: "online" },
//   { id: "3", name: "Amadou Diallo", role: "Auditeur", status: "offline" },
//   { id: "4", name: "Fatou Ba", role: "Assistant", status: "away" },
// ];

// export function CollaborationPanel({
//   context,
//   entityId,
// }: CollaborationPanelProps) {
//   const { user } = useAuth();
//   const { selectedClient, selectedFolder } = useApp();
//   const [comments, setComments] = useState<Comment[]>(mockComments);
//   const [newComment, setNewComment] = useState("");
//   const [replyingTo, setReplyingTo] = useState<string | null>(null);
//   const [collaborators, setCollaborators] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Load collaborators from folder assignments
//   useEffect(() => {
//     if (selectedFolder?.id) {
//       loadCollaborators();
//     }
//   }, [selectedFolder?.id]);

//   const loadCollaborators = async () => {
//     if (!selectedFolder?.id) return;

//     try {
//       setLoading(true);
//       const folderDetails: any = await folderService.getFolderById(
//         selectedFolder.id
//       );

//       if (folderDetails?.assignments) {
//         const collaboratorsData = folderDetails.assignments.map(
//           (assignment: any) => ({
//             id: assignment.user.id,
//             name: `${assignment.user.firstName} ${assignment.user.lastName}`,
//             role: assignment.user.role,
//             status: "online", // Default status, could be enhanced with real-time status
//           })
//         );

//         // Add the folder owner if not already included
//         if (
//           folderDetails.owner &&
//           !collaboratorsData.find((c: any) => c.id === folderDetails.owner.id)
//         ) {
//           collaboratorsData.unshift({
//             id: folderDetails.owner.id,
//             name: `${folderDetails.owner.firstName} ${folderDetails.owner.lastName}`,
//             role: folderDetails.owner.role,
//             status: "online",
//           });
//         }

//         setCollaborators(collaboratorsData);
//       }
//     } catch (error) {
//       console.error("Error loading collaborators:", error);
//       // Fallback to mock data if API fails
//       setCollaborators(mockCollaborators);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddComment = () => {
//     if (!newComment.trim()) return;

//     const comment: Comment = {
//       id: Date.now().toString(),
//       author: {
//         name: "Vous",
//         role: "Comptable",
//       },
//       content: newComment,
//       timestamp: "À l'instant",
//       likes: 0,
//     };

//     setComments([comment, ...comments]);
//     setNewComment("");
//   };

//   const handleLike = (commentId: string) => {
//     setComments(
//       comments.map((c) =>
//         c.id === commentId ? { ...c, likes: c.likes + 1 } : c
//       )
//     );
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "online":
//         return "bg-green-500";
//       case "away":
//         return "bg-yellow-500";
//       default:
//         return "bg-gray-400";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Collaborateurs */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-blue-600" />
//               <CardTitle>Collaborateurs</CardTitle>
//             </div>
//             <Button size="sm" variant="outline">
//               <UserPlus className="h-4 w-4 mr-2" />
//               Inviter
//             </Button>
//           </div>
//           <CardDescription>
//             {loading
//               ? "Chargement..."
//               : `${collaborators.length} personnes travaillent sur ce dossier`}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {loading ? (
//               <div className="flex items-center justify-center py-4">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <span className="ml-2">Chargement des collaborateurs...</span>
//               </div>
//             ) : (
//               collaborators.map((collaborator) => (
//                 <div key={collaborator.id} className="flex items-center gap-3">
//                   <div className="relative">
//                     <Avatar className="h-8 w-8">
//                       <AvatarFallback>
//                         {String(collaborator.name)
//                           .split(" ")
//                           .map((n: string) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div
//                       className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
//                         collaborator.status
//                       )}`}
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-sm font-medium">{collaborator.name}</p>
//                     <p className="text-xs text-muted-foreground">
//                       {collaborator.role}
//                     </p>
//                   </div>
//                   <Badge variant="outline" className="text-xs">
//                     {collaborator.status === "online"
//                       ? "En ligne"
//                       : collaborator.status === "away"
//                       ? "Absent"
//                       : "Hors ligne"}
//                   </Badge>
//                 </div>
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Commentaires */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center gap-2">
//             <MessageSquare className="h-5 w-5 text-blue-600" />
//             <CardTitle>Commentaires</CardTitle>
//           </div>
//           <CardDescription>
//             Discutez avec votre équipe sur ce dossier
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {/* Nouveau commentaire */}
//           <div className="space-y-3 mb-6">
//             <Textarea
//               placeholder="Ajouter un commentaire..."
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               className="min-h-[80px]"
//             />
//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setNewComment("")}
//               >
//                 Annuler
//               </Button>
//               <Button
//                 size="sm"
//                 onClick={handleAddComment}
//                 disabled={!newComment.trim()}
//               >
//                 <Send className="h-4 w-4 mr-2" />
//                 Envoyer
//               </Button>
//             </div>
//           </div>

//           <Separator className="my-6" />

//           {/* Liste des commentaires */}
//           <ScrollArea className="h-[400px]">
//             <div className="space-y-4">
//               {comments.map((comment) => (
//                 <div key={comment.id} className="space-y-3">
//                   <div className="flex items-start gap-3">
//                     <Avatar className="h-8 w-8">
//                       <AvatarFallback>
//                         {comment.author.name
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1 space-y-2">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium">
//                           {comment.author.name}
//                         </span>
//                         <Badge variant="outline" className="text-xs">
//                           {comment.author.role}
//                         </Badge>
//                         <span className="text-xs text-muted-foreground">
//                           {comment.timestamp}
//                         </span>
//                       </div>
//                       <p className="text-sm">{comment.content}</p>

//                       {/* Actions */}
//                       <div className="flex items-center gap-3">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-7 text-xs"
//                           onClick={() => handleLike(comment.id)}
//                         >
//                           <ThumbsUp className="h-3 w-3 mr-1" />
//                           J'aime {comment.likes > 0 && `(${comment.likes})`}
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-7 text-xs"
//                           onClick={() => setReplyingTo(comment.id)}
//                         >
//                           <Reply className="h-3 w-3 mr-1" />
//                           Répondre
//                         </Button>

//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="h-7 w-7 p-0"
//                             >
//                               <MoreHorizontal className="h-3 w-3" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem>
//                               <Edit className="h-4 w-4 mr-2" />
//                               Modifier
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="text-red-600">
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Supprimer
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>

//                       {/* Réponses */}
//                       {comment.replies && comment.replies.length > 0 && (
//                         <div className="ml-6 mt-4 space-y-3 border-l-2 pl-4">
//                           {comment.replies.map((reply) => (
//                             <div
//                               key={reply.id}
//                               className="flex items-start gap-3"
//                             >
//                               <Avatar className="h-6 w-6">
//                                 <AvatarFallback className="text-xs">
//                                   {reply.author.name
//                                     .split(" ")
//                                     .map((n) => n[0])
//                                     .join("")}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <div className="flex-1 space-y-1">
//                                 <div className="flex items-center gap-2">
//                                   <span className="text-xs font-medium">
//                                     {reply.author.name}
//                                   </span>
//                                   <span className="text-xs text-muted-foreground">
//                                     {reply.timestamp}
//                                   </span>
//                                 </div>
//                                 <p className="text-sm">{reply.content}</p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {comments.length === 0 && (
//                 <div className="text-center py-8">
//                   <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
//                   <p className="text-sm text-muted-foreground">
//                     Aucun commentaire pour le moment
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Soyez le premier à commenter !
//                   </p>
//                 </div>
//               )}
//             </div>
//           </ScrollArea>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
