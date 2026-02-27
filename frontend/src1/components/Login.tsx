// // components/Login.tsx
// import React, { useState } from "react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Progress } from "./ui/progress";
// import {
//   BarChart3,
//   Building2,
//   Mail,
//   Lock,
//   User,
//   Phone,
//   Shield,
//   Users,
//   Loader2,
//   CheckCircle2,
//   ArrowLeft,
//   ArrowRight,
//   MapPin,
//   Globe,
//   FileText,
//   Briefcase,
// } from "lucide-react";
// import { useLogin } from "../hooks/useLogin";
// import { motion, AnimatePresence } from "framer-motion";

// export function Login() {
//   const {
//     activeTab,
//     loginForm,
//     registerForm,
//     registerStep,
//     registerProgress,
//     setActiveTab,
//     handleLoginChange,
//     handleLogin,
//     handleRegisterChange,
//     handleRegister,
//     nextStep,
//     previousStep,
//     isStepValid,
//   } = useLogin();

//   const [isLoggingIn, setIsLoggingIn] = useState(false);
//   const [isRegistering, setIsRegistering] = useState(false);

//   // Enhanced handlers with loading states
//   const handleLoginSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoggingIn(true);
//     try {
//       await handleLogin(e);
//     } finally {
//       setIsLoggingIn(false);
//     }
//   };

//   const handleRegisterSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsRegistering(true);
//     try {
//       await handleRegister(e);
//     } finally {
//       setIsRegistering(false);
//     }
//   };

//   const stepVariants = {
//     initial: { opacity: 0, x: 20 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -20 },
//   };

//   // Updated password validation helper based on Zod schema
//   const validatePassword = (password: string) => {
//     const hasUpperCase = /[A-Z]/.test(password);
//     const hasLowerCase = /[a-z]/.test(password);
//     const hasNumber = /[0-9]/.test(password);
//     const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
//     const hasMinLength = password.length >= 8;

//     return {
//       hasUpperCase,
//       hasLowerCase,
//       hasNumber,
//       hasSpecialChar,
//       hasMinLength,
//       isValid:
//         hasUpperCase &&
//         hasLowerCase &&
//         hasNumber &&
//         hasSpecialChar &&
//         hasMinLength,
//     };
//   };

//   const renderRegisterStep = () => {
//     const passwordValidation = validatePassword(registerForm.password);

//     switch (registerStep) {
//       case 1:
//         return (
//           <motion.div
//             key="step1"
//             variants={stepVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             className="space-y-4"
//           >
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="register-firstName">Prénom *</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="register-firstName"
//                     type="text"
//                     value={registerForm.firstName}
//                     onChange={(e) =>
//                       handleRegisterChange("firstName", e.target.value)
//                     }
//                     placeholder="Jean"
//                     className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 {registerForm.firstName &&
//                   registerForm.firstName.length < 2 && (
//                     <motion.p
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       className="text-xs text-red-500"
//                     >
//                       Le prénom doit contenir au moins 2 caractères
//                     </motion.p>
//                   )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="register-lastName">Nom *</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="register-lastName"
//                     type="text"
//                     value={registerForm.lastName}
//                     onChange={(e) =>
//                       handleRegisterChange("lastName", e.target.value)
//                     }
//                     placeholder="Dupont"
//                     className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 {registerForm.lastName && registerForm.lastName.length < 2 && (
//                   <motion.p
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     className="text-xs text-red-500"
//                   >
//                     Le nom doit contenir au moins 2 caractères
//                   </motion.p>
//                 )}
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="register-email">Email professionnel *</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="register-email"
//                   type="email"
//                   value={registerForm.email}
//                   onChange={(e) =>
//                     handleRegisterChange("email", e.target.value)
//                   }
//                   placeholder="jean.dupont@entreprise.com"
//                   className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               {registerForm.email &&
//                 !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email) && (
//                   <motion.p
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     className="text-xs text-red-500"
//                   >
//                     Format d'email invalide
//                   </motion.p>
//                 )}
//             </div>

//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <Button
//                 type="button"
//                 className="w-full transition-all duration-200"
//                 onClick={nextStep}
//                 disabled={!isStepValid(1)}
//               >
//                 Suivant
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </motion.div>
//           </motion.div>
//         );

//       case 2:
//         return (
//           <motion.div
//             key="step2"
//             variants={stepVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             className="space-y-4"
//           >
//             <div className="space-y-2">
//               <Label htmlFor="register-phone">Téléphone</Label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="register-phone"
//                   type="tel"
//                   value={registerForm.phone}
//                   onChange={(e) =>
//                     handleRegisterChange("phone", e.target.value)
//                   }
//                   placeholder="+229 97 12 34 56"
//                   className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="register-country">Pays *</Label>
//               <div className="relative">
//                 <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Select
//                   value={registerForm.country}
//                   onValueChange={(value: string) =>
//                     handleRegisterChange("country", value)
//                   }
//                 >
//                   <SelectTrigger className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500">
//                     <SelectValue placeholder="Sélectionnez votre pays" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="BJ">Bénin</SelectItem>
//                     <SelectItem value="BF">Burkina Faso</SelectItem>
//                     <SelectItem value="CI">Côte d'Ivoire</SelectItem>
//                     <SelectItem value="SN">Sénégal</SelectItem>
//                     <SelectItem value="CM">Cameroun</SelectItem>
//                     <SelectItem value="TG">Togo</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               {!registerForm.country && (
//                 <motion.p
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   className="text-xs text-red-500"
//                 >
//                   Le pays est requis
//                 </motion.p>
//               )}
//             </div>

//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="w-full transition-all duration-200"
//                     onClick={previousStep}
//                   >
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Retour
//                   </Button>
//                 </motion.div>
//               </div>
//               <div className="flex-1">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     type="button"
//                     className="w-full transition-all duration-200"
//                     onClick={nextStep}
//                     disabled={!isStepValid(2)}
//                   >
//                     Suivant
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         );

//       case 3:
//         return (
//           <motion.div
//             key="step3"
//             variants={stepVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             className="space-y-4"
//           >
//             <div className="space-y-2">
//               <Label htmlFor="register-role">Type de compte *</Label>
//               <Select
//                 value={registerForm.role}
//                 onValueChange={(
//                   value: "CLIENT" | "EMPLOYEE" | "ENTERPRISE" | "ADMIN"
//                 ) => handleRegisterChange("role", value)}
//               >
//                 <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
//                   <SelectValue placeholder="Sélectionnez un type de compte" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="CLIENT">
//                     <div className="flex items-center gap-2">
//                       <User className="h-4 w-4" />
//                       <span>Client</span>
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="EMPLOYEE">
//                     <div className="flex items-center gap-2">
//                       <Briefcase className="h-4 w-4" />
//                       <span>Employé</span>
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="ENTERPRISE">
//                     <div className="flex items-center gap-2">
//                       <Building2 className="h-4 w-4" />
//                       <span>Entreprise</span>
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="ADMIN">
//                     <div className="flex items-center gap-2">
//                       <Shield className="h-4 w-4" />
//                       <span>Administrateur</span>
//                     </div>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="text-xs text-muted-foreground"
//               >
//                 {registerForm.role === "CLIENT" &&
//                   "• Accès client aux fonctionnalités de base"}
//                 {registerForm.role === "EMPLOYEE" &&
//                   "• Accès employé avec permissions étendues"}
//                 {registerForm.role === "ENTERPRISE" &&
//                   "• Gestion complète avec options entreprise"}
//                 {registerForm.role === "ADMIN" &&
//                   "• Accès complet à toutes les fonctionnalités"}
//               </motion.p>
//             </div>

//             {registerForm.role === "ENTERPRISE" && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 className="space-y-4 pt-2"
//               >
//                 <div className="space-y-2">
//                   <Label htmlFor="register-companyName">
//                     Nom de l'entreprise
//                   </Label>
//                   <div className="relative">
//                     <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="register-companyName"
//                       type="text"
//                       value={registerForm.companyName}
//                       onChange={(e) =>
//                         handleRegisterChange("companyName", e.target.value)
//                       }
//                       placeholder="Entreprise SARL"
//                       className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="register-legalForm">Forme juridique</Label>
//                     <div className="relative">
//                       <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Select
//                         value={registerForm.legalForm || ""}
//                         onValueChange={(
//                           value:
//                             | "SARL"
//                             | "SA"
//                             | "SUARL"
//                             | "INDIVIDUAL"
//                             | "OTHER"
//                             | ""
//                         ) => handleRegisterChange("legalForm", value)}
//                       >
//                         <SelectTrigger className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500">
//                           <SelectValue placeholder="Sélectionnez une forme" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="SARL">SARL</SelectItem>
//                           <SelectItem value="SA">SA</SelectItem>
//                           <SelectItem value="SUARL">SUARL</SelectItem>
//                           <SelectItem value="INDIVIDUAL">Individuel</SelectItem>
//                           <SelectItem value="OTHER">Autre</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="register-taxNumber">Numéro fiscal</Label>
//                     <div className="relative">
//                       <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="register-taxNumber"
//                         type="text"
//                         value={registerForm.taxNumber}
//                         onChange={(e) =>
//                           handleRegisterChange("taxNumber", e.target.value)
//                         }
//                         placeholder="123456789"
//                         className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="register-address">Adresse</Label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="register-address"
//                       type="text"
//                       value={registerForm.address}
//                       onChange={(e) =>
//                         handleRegisterChange("address", e.target.value)
//                       }
//                       placeholder="123 Rue des Entreprises"
//                       className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="register-city">Ville</Label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="register-city"
//                       type="text"
//                       value={registerForm.city}
//                       onChange={(e) =>
//                         handleRegisterChange("city", e.target.value)
//                       }
//                       placeholder="Cotonou"
//                       className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//               </motion.div>
//             )}

//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="w-full transition-all duration-200"
//                     onClick={previousStep}
//                   >
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Retour
//                   </Button>
//                 </motion.div>
//               </div>
//               <div className="flex-1">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     type="button"
//                     className="w-full transition-all duration-200"
//                     onClick={nextStep}
//                     disabled={!isStepValid(3)}
//                   >
//                     Suivant
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         );

//       case 4:
//         return (
//           <motion.div
//             key="step4"
//             variants={stepVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             className="space-y-4"
//           >
//             <div className="space-y-2">
//               <Label htmlFor="register-password">Mot de passe *</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="register-password"
//                   type="password"
//                   value={registerForm.password}
//                   onChange={(e) =>
//                     handleRegisterChange("password", e.target.value)
//                   }
//                   placeholder="VotreMotDePasse123!"
//                   className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Updated password validation hints based on Zod schema */}
//               <div className="space-y-1 text-xs">
//                 <div
//                   className={`flex items-center gap-2 ${
//                     passwordValidation.hasMinLength
//                       ? "text-green-600"
//                       : "text-red-500"
//                   }`}
//                 >
//                   <div
//                     className={`w-1.5 h-1.5 rounded-full ${
//                       passwordValidation.hasMinLength
//                         ? "bg-green-600"
//                         : "bg-red-500"
//                     }`}
//                   />
//                   Au moins 8 caractères
//                 </div>
//                 <div
//                   className={`flex items-center gap-2 ${
//                     passwordValidation.hasUpperCase
//                       ? "text-green-600"
//                       : "text-red-500"
//                   }`}
//                 >
//                   <div
//                     className={`w-1.5 h-1.5 rounded-full ${
//                       passwordValidation.hasUpperCase
//                         ? "bg-green-600"
//                         : "bg-red-500"
//                     }`}
//                   />
//                   Au moins une majuscule (A-Z)
//                 </div>
//                 <div
//                   className={`flex items-center gap-2 ${
//                     passwordValidation.hasLowerCase
//                       ? "text-green-600"
//                       : "text-red-500"
//                   }`}
//                 >
//                   <div
//                     className={`w-1.5 h-1.5 rounded-full ${
//                       passwordValidation.hasLowerCase
//                         ? "bg-green-600"
//                         : "bg-red-500"
//                     }`}
//                   />
//                   Au moins une minuscule (a-z)
//                 </div>
//                 <div
//                   className={`flex items-center gap-2 ${
//                     passwordValidation.hasNumber
//                       ? "text-green-600"
//                       : "text-red-500"
//                   }`}
//                 >
//                   <div
//                     className={`w-1.5 h-1.5 rounded-full ${
//                       passwordValidation.hasNumber
//                         ? "bg-green-600"
//                         : "bg-red-500"
//                     }`}
//                   />
//                   Au moins un chiffre (0-9)
//                 </div>
//                 <div
//                   className={`flex items-center gap-2 ${
//                     passwordValidation.hasSpecialChar
//                       ? "text-green-600"
//                       : "text-red-500"
//                   }`}
//                 >
//                   <div
//                     className={`w-1.5 h-1.5 rounded-full ${
//                       passwordValidation.hasSpecialChar
//                         ? "bg-green-600"
//                         : "bg-red-500"
//                     }`}
//                   />
//                   Au moins un caractère spécial (!@#$% etc.)
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="register-confirm">
//                 Confirmer le mot de passe *
//               </Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="register-confirm"
//                   type="password"
//                   value={registerForm.confirmPassword}
//                   onChange={(e) =>
//                     handleRegisterChange("confirmPassword", e.target.value)
//                   }
//                   placeholder="Confirmez votre mot de passe"
//                   className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               {registerForm.confirmPassword &&
//                 registerForm.password !== registerForm.confirmPassword && (
//                   <motion.p
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     className="text-xs text-red-500"
//                   >
//                     Les mots de passe ne correspondent pas
//                   </motion.p>
//                 )}
//             </div>

//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="w-full transition-all duration-200"
//                     onClick={previousStep}
//                   >
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Retour
//                   </Button>
//                 </motion.div>
//               </div>
//               <div className="flex-1">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     type="submit"
//                     className="w-full transition-all duration-200"
//                     disabled={!isStepValid(4) || isRegistering}
//                   >
//                     {isRegistering ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Création...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle2 className="mr-2 h-4 w-4" />
//                         Créer mon compte
//                       </>
//                     )}
//                   </Button>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         );
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-md"
//       >
//         {/* Logo et titre */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="text-center mb-8"
//         >
//           <motion.div
//             whileHover={{ scale: 1.05, rotate: 5 }}
//             className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg"
//           >
//             <BarChart3 className="h-8 w-8 text-white" />
//           </motion.div>
//           <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
//             FinanceERP Pro
//           </h1>
//           <p className="text-muted-foreground">Gestion Comptable OHADA</p>
//         </motion.div>

//         <Tabs
//           value={activeTab}
//           onValueChange={(v: "login" | "register") => setActiveTab(v)}
//           className="w-full"
//         >
//           <TabsList className="grid w-full grid-cols-2 mb-6">
//             <TabsTrigger
//               value="login"
//               className="transition-all duration-200 data-[state=active]:shadow-sm"
//             >
//               Connexion
//             </TabsTrigger>
//             <TabsTrigger
//               value="register"
//               className="transition-all duration-200 data-[state=active]:shadow-sm"
//             >
//               Inscription
//             </TabsTrigger>
//           </TabsList>

//           {/* Onglet Connexion */}
//           <TabsContent value="login">
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//             >
//               <Card className="shadow-lg border-0">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="text-xl">Connexion</CardTitle>
//                   <CardDescription>
//                     Accédez à votre espace professionnel
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleLoginSubmit} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="login-email">Email professionnel</Label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                         <Input
//                           id="login-email"
//                           type="email"
//                           value={loginForm.email}
//                           onChange={(e) =>
//                             handleLoginChange("email", e.target.value)
//                           }
//                           placeholder="votre@email.com"
//                           className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="login-password">Mot de passe</Label>
//                       <div className="relative">
//                         <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                         <Input
//                           id="login-password"
//                           type="password"
//                           value={loginForm.password}
//                           onChange={(e) =>
//                             handleLoginChange("password", e.target.value)
//                           }
//                           placeholder="Votre mot de passe"
//                           className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <motion.div
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <Button
//                         type="submit"
//                         className="w-full transition-all duration-200"
//                         disabled={isLoggingIn}
//                       >
//                         {isLoggingIn ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Connexion...
//                           </>
//                         ) : (
//                           "Se connecter"
//                         )}
//                       </Button>
//                     </motion.div>

//                     <p className="text-center text-sm text-muted-foreground">
//                       Pas encore de compte ?{" "}
//                       <button
//                         type="button"
//                         className="text-blue-600 hover:underline font-medium transition-all duration-200"
//                         onClick={() => setActiveTab("register")}
//                       >
//                         S'inscrire
//                       </button>
//                     </p>
//                   </form>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>

//           {/* Onglet Inscription */}
//           <TabsContent value="register">
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//             >
//               <Card className="shadow-lg border-0">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="text-xl">Créer un compte</CardTitle>
//                   <CardDescription>
//                     Étape {registerStep} sur 4 - {registerProgress}% complété
//                   </CardDescription>
//                   <Progress value={registerProgress} className="mt-2 h-2" />
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleRegisterSubmit}>
//                     <AnimatePresence mode="wait">
//                       {renderRegisterStep()}
//                     </AnimatePresence>
//                   </form>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>
//         </Tabs>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.6 }}
//           className="mt-6 text-center text-xs text-muted-foreground"
//         >
//           <p>Conforme aux normes SYSCOHADA révisé</p>
//           <p className="mt-1">Powered by nashsoft systems</p>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }

// components/Login.tsx
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useLogin } from "../hooks/useLogin";
import { WelcomePage } from "./WelcomePage";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

export function Login() {
  const [showWelcome, setShowWelcome] = useState(true);
  const {
    activeTab,
    loginForm,
    registerForm,
    registerStep,
    registerProgress,
    setActiveTab,
    handleLoginChange,
    handleLogin,
    handleRegisterChange,
    handleRegister,
    nextStep,
    previousStep,
    isStepValid,
  } = useLogin();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await handleLogin(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      await handleRegister(e);
    } finally {
      setIsRegistering(false);
    }
  };

  if (showWelcome) {
    return <WelcomePage onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg"
          >
            <BarChart3 className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
            FinanceERP Pro
          </h1>
          <p className="text-muted-foreground">Gestion Comptable OHADA</p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={(v: "login" | "register") => setActiveTab(v)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="login"
              className="transition-all duration-200 data-[state=active]:shadow-sm"
            >
              Connexion
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="transition-all duration-200 data-[state=active]:shadow-sm"
            >
              Inscription
            </TabsTrigger>
          </TabsList>

          {/* Onglet Connexion */}
          <TabsContent value="login">
            <LoginPage
              loginForm={loginForm}
              isLoggingIn={isLoggingIn}
              onLoginChange={handleLoginChange}
              onLoginSubmit={handleLoginSubmit}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>

          {/* Onglet Inscription */}
          <TabsContent value="register">
            <RegisterPage
              registerForm={registerForm}
              registerStep={registerStep}
              registerProgress={registerProgress}
              isRegistering={isRegistering}
              onRegisterChange={handleRegisterChange}
              onRegisterSubmit={handleRegisterSubmit}
              onNextStep={nextStep}
              onPreviousStep={previousStep}
              isStepValid={isStepValid}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p>Conforme aux normes SYSCOHADA révisé</p>
          <p className="mt-1 opacity-50">Powered by nashsoft systems</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
