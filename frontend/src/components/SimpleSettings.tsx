
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import {
  User,
  Building2,
  Mail,
  Phone,
  Shield,
  Globe,
  Palette,
  Moon,
  Sun,
  Database,
  Settings2,
  Lock,
  Key,
  Save,
  LogOut,
  Loader2,
  Folder,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  X,
  Trash2,
  Download,
  FileSpreadsheet,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { assistantService, Assistant } from "../services/assistant.service";
import {
  folderService,
  Folder as FolderType,
} from "../services/folder.service";
import { dsfTemplateService } from "../services/dsf-template.service";
import { generateStrongPassword } from "../utils/passwordGeneration"

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AssistantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export function SimpleSettings() {
  const { addToHistory, theme, setTheme, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout,
    updateProfile,
    changePassword,
    updateSettings,
    loading: authLoading,
  } = useAuth();

  // États pour le profil
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  // États pour la gestion des assistants
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showCreateAssistant, setShowCreateAssistant] = useState(false);
  const [newAssistant, setNewAssistant] = useState<AssistantFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const [creatingAssistant, setCreatingAssistant] = useState(false);
  const [assistantPasswordVisible, setAssistantPasswordVisible] =
    useState(false);

  // États pour l'assignation des dossiers
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [showAssignFolders, setShowAssignFolders] = useState<string | null>(
    null,
  );
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // DSF Template states
  const [templateStatus, setTemplateStatus] = useState<{
    hasTemplate: boolean;
    fileName?: string;
    uploadDate?: string;
    fileSize?: number;
  }>({ hasTemplate: false });
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateUploading, setTemplateUploading] = useState(false);

  // Calculs
  const maxAssistants = Number(user?.maxAssistants) || 0;
  const canCreateMoreAssistants = assistants.length < maxAssistants;
  const hasReachedLimit = assistants.length >= maxAssistants;

  // Initialiser les données du profil
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Charger les assistants
  useEffect(() => {
    if (user?.role === "COMPTABLE") {
      loadAssistants();
    }
  }, [user]);

  // Charger le statut du template DSF
  useEffect(() => {
    if (user) {
      loadTemplateStatus();
    }
  }, [user]);

  // Charger les dossiers
  useEffect(() => {
    if (user?.role === "COMPTABLE") {
      loadFolders();
    }
  }, [user]);

  // ==================== FONCTIONS DE CHARGEMENT ====================

  const loadAssistants = async () => {
    try {
      setLoadingAssistants(true);
      const assistantsData = await assistantService.getAssistants();
      setAssistants(assistantsData);
    } catch (error) {
      console.error("Erreur lors du chargement des assistants:", error);
    } finally {
      setLoadingAssistants(false);
    }
  };

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      if (!user?.id) return;
      const foldersData = await folderService.getFolders(user.id);
      setFolders(foldersData);
    } catch (error) {
      console.error("Erreur lors du chargement des dossiers:", error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const loadTemplateStatus = async () => {
    try {
      setTemplateLoading(true);
      const status = await dsfTemplateService.getTemplateStatus();
      setTemplateStatus(status);
    } catch (error) {
      console.error("Erreur chargement statut template:", error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateUpload = async (file: File) => {
    try {
      setTemplateUploading(true);
      const status = await dsfTemplateService.uploadTemplate(file);
      setTemplateStatus(status);
      addToHistory("Template DSF", "Template importé avec succès");
    } catch (error: any) {
      console.error("Erreur upload template:", error);
      alert(error.response?.data?.message || error.message || "Erreur lors de l'import");
    } finally {
      setTemplateUploading(false);
    }
  };

  const handleTemplateDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer le template DSF ?")) return;
    try {
      await dsfTemplateService.deleteTemplate();
      setTemplateStatus({ hasTemplate: false });
      addToHistory("Template DSF", "Template supprimé");
    } catch (error: any) {
      console.error("Erreur suppression template:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  // ==================== GESTION DU PROFIL ====================

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      addToHistory("Paramètres", "Profil mis à jour avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error.message);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      addToHistory("Sécurité", "Mot de passe changé avec succès");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error(
        "Erreur lors du changement de mot de passe:",
        error.message,
      );
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        language,
        theme,
      });
      addToHistory("Paramètres", "Paramètres mis à jour avec succès");
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour des paramètres:",
        error.message,
      );
    }
  };

  // ==================== GESTION DES ASSISTANTS ====================



  const isAssistantFormValid = useCallback(() => {
    const { firstName, lastName, email, phoneNumber, password } = newAssistant;

    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      /^\d[\d\s-]{7,15}$/.test(phoneNumber) &&
      password.length >= 8
    );
  }, [newAssistant]);

  const handleCreateAssistant = async () => {
    if (!isAssistantFormValid()) {
      alert("Veuillez remplir tous les champs correctement");
      return;
    }

    try {
      setCreatingAssistant(true);
      const createdAssistant =
        await assistantService.createAssistant(newAssistant);

      setAssistants([...assistants, createdAssistant]);
      setNewAssistant({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
      setShowCreateAssistant(false);

      addToHistory(
        "Assistant",
        `Assistant ${createdAssistant.firstName} ${createdAssistant.lastName} créé avec succès`,
      );
    } catch (error: any) {
      console.error("Erreur lors de la création de l'assistant:", error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setCreatingAssistant(false);
    }
  };

  const handleToggleAssistantStatus = async (
    assistantId: string,
    currentStatus: boolean,
  ) => {
    try {
      const updatedAssistant = await assistantService.updateAssistant(
        assistantId,
        {
          isActive: !currentStatus,
        },
      );

      setAssistants(
        assistants.map((assistant) =>
          assistant.id === assistantId ? updatedAssistant : assistant,
        ),
      );

      addToHistory(
        "Assistant",
        `Assistant ${updatedAssistant.isActive ? "activé" : "désactivé"}`,
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'assistant:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet assistant ?")) {
      return;
    }

    try {
      await assistantService.deleteAssistant(assistantId);
      setAssistants(
        assistants.filter((assistant) => assistant.id !== assistantId),
      );
      addToHistory("Assistant", "Assistant supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'assistant:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  // ==================== GESTION DES DOSSIERS ====================

  const handleAssignFolders = async (assistantId: string) => {
    if (selectedFolders.length === 0) {
      alert("Veuillez sélectionner au moins un dossier");
      return;
    }

    try {
      await assistantService.assignToFolders(assistantId, selectedFolders);
      setShowAssignFolders(null);
      setSelectedFolders([]);
      addToHistory("Assistant", "Dossiers assignés à l'assistant");

      // Recharger les assistants pour mettre à jour le compteur
      await loadAssistants();
    } catch (error: any) {
      console.error("Erreur lors de l'assignation des dossiers:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  // ==================== RENDU ====================

  const position =
    user?.role === "COMPTABLE"
      ? "Expert-Comptable"
      : user?.role === "ADMIN"
        ? "Administrateur"
        : "Assistant";

  return (
    <div className="space-y-6">
      <div>
        <h2>Paramètres</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez vos paramètres personnels et préférences de l'application
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${user?.role === "COMPTABLE" ? "grid-cols-3" : "grid-cols-2"}`}>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil & Template
          </TabsTrigger>
          {user?.role === "COMPTABLE" && (
            <TabsTrigger value="assistants">
              <Users className="h-4 w-4 mr-2" />
              Assistants
            </TabsTrigger>
          )}
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Données
          </TabsTrigger>
        </TabsList>

        {/* Onglet Profil & Template */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations de profil et coordonnées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar et informations de base */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-3xl">
                      {user
                        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                        : "U"}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold">
                        {user
                          ? `${user.firstName} ${user.lastName}`
                          : "Utilisateur"}
                      </h3>
                      <p className="text-muted-foreground">{position}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Formulaire du profil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        className="h-11"
                        placeholder="Prénom"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        className="h-11"
                        placeholder="Nom"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="h-11"
                        placeholder="Email"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Téléphone</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="h-11"
                        placeholder="Téléphone"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={authLoading}>
                      {authLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder le profil
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Template DSF Section inside Profile tab */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    Template DSF Excel
                  </CardTitle>
                  <CardDescription>
                    Importez votre template Excel DSF pour activer l'export Excel pré-rempli.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {templateLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement du statut...
                    </div>
                  ) : templateStatus.hasTemplate ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-green-800">Template importé avec succès</p>
                            <p className="text-xs text-green-700 opacity-80">
                              Dernière mise à jour le {templateStatus.uploadDate ? new Date(templateStatus.uploadDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleTemplateDelete}
                            className="h-8"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Aucun template importé. L'export Excel DSF sera indisponible.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleTemplateUpload(file);
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".xlsx,.xls";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleTemplateUpload(file);
                      };
                      input.click();
                    }}
                  >
                    {templateUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                        <p className="text-sm text-muted-foreground">Importation en cours...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-gray-400" />
                        <p className="text-sm font-medium">
                          {templateStatus.hasTemplate ? "Remplacer le template" : "Importer un template Excel"}
                        </p>
                        <p className="text-xs text-muted-foreground">Fichiers .xlsx ou .xls uniquement</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800">
                    <p className="font-medium mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Aide à l'export
                    </p>
                    <p>Le template sera utilisé pour injecter vos données de DSF directement dans votre fichier Excel personnalisé lors du téléchargement.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Sécurité */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={passwordVisible ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type={passwordVisible ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleChangePassword}
                    disabled={authLoading || !passwordData.newPassword}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Changer
                  </Button>
                </CardContent>
              </Card>

              {/* Préférences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Préférences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select
                      value={language}
                      onValueChange={(newLanguage: string) => {
                        // Change the language
                        setLanguage(newLanguage as "en" | "fr");

                        // Update the URL to reflect the language change
                        const pathSegments = location.pathname
                          .split("/")
                          .filter(Boolean);
                        let newPath: string;

                        // Remove existing language prefix if present
                        const pathWithoutLanguage =
                          pathSegments[0] === "en" || pathSegments[0] === "fr"
                            ? pathSegments.slice(1).join("/")
                            : pathSegments.join("/");

                        // Add new language prefix
                        newPath = `/${newLanguage}${
                          pathWithoutLanguage ? "/" + pathWithoutLanguage : ""
                        }`;

                        navigate(
                          newPath + location.search + location.hash,
                          { replace: true }
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Thème</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="auto">Système</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" variant="outline" onClick={handleSaveSettings}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </Button>
                </CardContent>
              </Card>

              <Button variant="destructive" className="w-full" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Assistants (seulement pour les comptables) */}
        {user?.role === "COMPTABLE" && (
          <TabsContent value="assistants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Assistants</CardTitle>
                <CardDescription>
                  Gérez les comptes assistants pour votre cabinet comptable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Information sur la limite */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Vous pouvez créer jusqu'à {maxAssistants} comptes
                    assistants.
                    {hasReachedLimit && (
                      <span className="text-orange-600 font-medium">
                        {" "}
                        Limite atteinte - contactez le support pour augmenter
                        votre quota.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Bouton de création */}
                {!showCreateAssistant && (
                  <Button
                    onClick={() => setShowCreateAssistant(true)}
                    disabled={hasReachedLimit}
                    className="w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Nouvel assistant
                    {!hasReachedLimit && (
                      <Badge variant="secondary" className="ml-2">
                        {assistants.length}/{maxAssistants}
                      </Badge>
                    )}
                  </Button>
                )}

                {/* Formulaire de création */}
                {showCreateAssistant && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Créer un nouvel assistant</CardTitle>
                      <CardDescription>
                        Remplissez les informations pour créer un compte
                        assistant
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assistantFirstName">Prénom *</Label>
                          <Input
                            id="assistantFirstName"
                            value={newAssistant.firstName}
                            onChange={(e) =>
                              setNewAssistant({
                                ...newAssistant,
                                firstName: e.target.value,
                              })
                            }
                            placeholder="Jean"
                            className="h-11"
                            autoComplete="off"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistantLastName">Nom *</Label>
                          <Input
                            id="assistantLastName"
                            value={newAssistant.lastName}
                            onChange={(e) =>
                              setNewAssistant({
                                ...newAssistant,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Dupont"
                            className="h-11"
                            autoComplete="off"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistantEmail">
                            Email professionnel *
                          </Label>
                          <Input
                            id="assistantEmail"
                            type="email"
                            value={newAssistant.email}
                            onChange={(e) =>
                              setNewAssistant({
                                ...newAssistant,
                                email: e.target.value,
                              })
                            }
                            placeholder="jean.dupont@cabinet.com"
                            className="h-11"
                            autoComplete="off"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistantPhone">Téléphone *</Label>
                          <Input
                            id="assistantPhone"
                            type="tel"
                            value={newAssistant.phoneNumber}
                            onChange={(e) =>
                              setNewAssistant({
                                ...newAssistant,
                                phoneNumber: e.target.value,
                              })
                            }
                            placeholder="6 99 12 34 56"
                            className="h-11"
                            autoComplete="off"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="assistantPassword">
                            Mot de passe temporaire *
                          </Label>
                          <div className="relative">
                            <Input
                              id="assistantPassword"
                              type={
                                assistantPasswordVisible ? "text" : "password"
                              }
                              value={newAssistant.password}
                              onChange={(e) =>
                                setNewAssistant({
                                  ...newAssistant,
                                  password: e.target.value,
                                })
                              }
                              placeholder="Mot de passe temporaire"
                              className="h-11 pr-20"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setAssistantPasswordVisible(
                                  !assistantPasswordVisible,
                                )
                              }
                              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {assistantPasswordVisible ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
                              onClick={() => {
                                const strongPass = generateStrongPassword();
                                setNewAssistant({
                                  ...newAssistant,
                                  password: strongPass,
                                });
                                setAssistantPasswordVisible(true);
                              }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowCreateAssistant(false);
                            setNewAssistant({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phoneNumber: "",
                              password: "",
                            });
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={
                            !isAssistantFormValid() || creatingAssistant
                          }
                          onClick={handleCreateAssistant}
                        >
                          {creatingAssistant ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Création...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Créer l'assistant
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Liste des assistants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Comptes assistants actifs</h4>
                    <Badge variant="outline">
                      {loadingAssistants
                        ? "..."
                        : `${assistants.length} / ${maxAssistants}`}
                    </Badge>
                  </div>

                  {loadingAssistants ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des assistants...</span>
                    </div>
                  ) : assistants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">
                        Aucun assistant créé pour le moment
                      </p>
                      {canCreateMoreAssistants && (
                        <p className="text-sm mt-2">
                          Cliquez sur "Nouvel assistant" pour créer votre
                          premier compte assistant
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assistants.map((assistant, index) => (
                        <Card key={assistant.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {assistant.firstName} {assistant.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {assistant.email}
                                  </p>
                                  {assistant._count?.assignedFolders !==
                                    undefined && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        <Folder className="h-3 w-3 inline mr-1" />
                                        {assistant._count.assignedFolders}{" "}
                                        dossier(s) assigné(s)
                                      </p>
                                    )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    assistant.isActive ? "default" : "secondary"
                                  }
                                >
                                  {assistant.isActive ? "Actif" : "Inactif"}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setShowAssignFolders(assistant.id)
                                  }
                                >
                                  <Folder className="h-4 w-4 mr-1" />
                                  Dossiers
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleAssistantStatus(
                                      assistant.id,
                                      assistant.isActive,
                                    )
                                  }
                                >
                                  {assistant.isActive ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Réactiver
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteAssistant(assistant.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Les comptes assistants ont accès limité aux dossiers qui
                    leur sont assignés. Ils peuvent consulter et modifier
                    uniquement les données autorisées.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Onglet Données */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Données</CardTitle>
              <CardDescription>
                Exporter et gérer vos données d'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-amber-100 bg-amber-50/50 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Zone sensible
                </h4>
                <p className="text-sm text-amber-800 mb-4">
                  Ces actions impactent l'ensemble de vos données. Soyez prudent.
                </p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" /> Exporter en JSON
                  </Button>
                  <Button variant="destructive" className="justify-start">
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer mon compte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'assignation des dossiers */}
      {
        showAssignFolders && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full max-h-[80vh] overflow-hidden">
              <CardHeader>
                <CardTitle>Assigner des dossiers</CardTitle>
                <CardDescription>
                  Sélectionnez les dossiers à assigner à cet assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {loadingFolders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Chargement des dossiers...</span>
                  </div>
                ) : folders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun dossier disponible
                  </p>
                ) : (
                  <div className="space-y-3">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          id={`folder-${folder.id}`}
                          checked={selectedFolders.includes(folder.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFolders([...selectedFolders, folder.id]);
                            } else {
                              setSelectedFolders(
                                selectedFolders.filter((id) => id !== folder.id),
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <label
                          htmlFor={`folder-${folder.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{folder.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Client: {folder.client?.name || "Non spécifié"} •
                            Exercice: {folder.fiscalYear}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignFolders(null);
                    setSelectedFolders([]);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => handleAssignFolders(showAssignFolders)}
                  disabled={selectedFolders.length === 0}
                >
                  Assigner ({selectedFolders.length})
                </Button>
              </div>
            </Card>
          </div>
        )
      }
    </div>
  );
}
