
import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { assistantService, Assistant } from "../services/assistant.service";
import {
  folderService,
  Folder as FolderType,
} from "../services/folder.service";

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

  const generateStrongPassword = (): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|";
    let password = "";

    // Au moins un de chaque catégorie
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_+-=[]{}|"[Math.floor(Math.random() * 12)];

    // Compléter jusqu'à 12 caractères
    while (password.length < 12) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
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

        {/* Onglet Profil */}
        <TabsContent value="profile" className="space-y-6">
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
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Changement de mot de passe */}
              <div className="space-y-4">
                <h4 className="font-medium">Changer le mot de passe</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Mot de passe actuel *
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={passwordVisible ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="h-11 pr-10"
                        autoComplete="new-password"
                        placeholder="Mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                    <Input
                      id="newPassword"
                      type={passwordVisible ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="h-11"
                      placeholder="Nouveau mot de passe"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmer le nouveau mot de passe *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={passwordVisible ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="h-11"
                      placeholder="Confirmer le mot de passe"
                      autoComplete="new-password"
                    />
                  </div>

                  <Button onClick={handleChangePassword} disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Changer le mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Préférences */}
              <div className="space-y-4">
                <h4 className="font-medium">Préférences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="language"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4 text-blue-600" />
                      Langue
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme" className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-blue-600" />
                      Thème
                    </Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Clair
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Sombre
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">Automatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={handleSaveSettings}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Settings2 className="h-4 w-4 mr-2" />
                        Sauvegarder les préférences
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Déconnexion */}
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Vos données sont stockées de manière sécurisée. Vous pouvez
                  exporter vos données à tout moment.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Exporter les données</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exportez toutes vos données au format JSON pour les
                    sauvegarder localement.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter toutes les données
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Supprimer les données</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Attention : Cette action est irréversible. Toutes vos
                    données seront définitivement supprimées.
                  </p>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer toutes les données
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'assignation des dossiers */}
      {showAssignFolders && (
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
      )}
    </div>
  );
}
