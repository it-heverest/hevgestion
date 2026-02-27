// components/ExerciseSelector.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Upload,
  Plus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useExerciseManager, Folder } from "../hooks/useExerciseManager";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { Copy } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export function ExerciseSelector() {
  const navigate = useNavigate();
  const { selectedClient, setSelectedFolder, createFolder, updateFolder } =
    useApp();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    fiscalYear: new Date().getFullYear(),
    workflow: "balance" as "dsf" | "balance",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    folders: allFolders,
    selectedFolder,
    folderToToggle,
    showToggleDialog,
    showDuplicateDialog,
    folderToDuplicate,
    duplicateForm,
    handleSelectFolder,
    handleCloseButtonClick,
    confirmToggleStatus,
    setShowToggleDialog,
    handleDuplicate,
    setShowDuplicateDialog,
    setFolderToDuplicate,
    setDuplicateForm,
    reloadFolders,
    canCloseFolder,
    getClosurePossibleDate,
    isLatestFolder,
    loading,
  } = useExerciseManager();

  // Trier les dossiers par année fiscale décroissante (plus récent en premier)
  const sortedFolders = useMemo(() => {
    return [...allFolders].sort((a, b) => b.fiscalYear - a.fiscalYear);
  }, [allFolders]);

  // Get active folder (the most recent non-completed folder)
  const activeFolder = useMemo(() => {
    return (
      allFolders
        .filter((folder) => folder.isActive)
        .sort((a, b) => b.fiscalYear - a.fiscalYear)[0] || null
    );
  }, [allFolders]);

  // Vérifier si la date de début est valide (doit être dans le passé ou présent)
  const isStartDateValid = (
    fiscalYear: number
  ): { isValid: boolean; message: string } => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    if (fiscalYear > currentYear) {
      return {
        isValid: false,
        message: "L'année fiscale ne peut pas être dans le futur",
      };
    }

    if (fiscalYear === currentYear && currentMonth < 11) {
      return {
        isValid: true,
        message:
          "Attention : L'exercice commence avant la fin de l'année en cours",
      };
    }

    return { isValid: true, message: "" };
  };

  const handleDuplicateClick = (folder: Folder) => {
    console.log(
      "Opening duplicate dialog for folder:",
      folder.id,
      "client:",
      folder.clientId
    );
    setFolderToDuplicate(folder);
    setDuplicateForm({
      fiscalYear: folder.fiscalYear + 1,
    });
    setShowDuplicateDialog(true);
  };

  const CreateExercise = async () => {
    if (!selectedClient) {
      alert("Aucun client sélectionné");
      return;
    }

    // Validation de la date de début
    const dateValidation = isStartDateValid(createForm.fiscalYear);
    if (!dateValidation.isValid) {
      setCreateError(dateValidation.message);
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      // Calculate start and end dates for the fiscal year
      const startDate = `${createForm.fiscalYear}-01-01`;
      const endDate = `${createForm.fiscalYear}-12-31`;

      // Create the folder using AppContext
      const newFolder = await createFolder({
        name: createForm.name || `Exercice ${createForm.fiscalYear}`,
        description: createForm.description,
        clientId: selectedClient.id,
        fiscalYear: createForm.fiscalYear,
        startDate: startDate,
        endDate: endDate,
      });

      // Force reload folders to update the list
      await reloadFolders();

      // Auto-select the created folder
      setSelectedFolder(newFolder);

      // Navigate based on workflow choice with proper route structure
      const uid = user?.id || "me";
      if (createForm.workflow === "dsf") {
        navigate(`/web/user/dsf-import/${newFolder.id}`);
      } else {
        navigate(`/web/user/import/${uid}/import`);
      }

      setShowCreateDialog(false);
      setCreateForm({
        name: "",
        description: "",
        fiscalYear: new Date().getFullYear(),
        workflow: "balance",
      });
    } catch (error: any) {
      console.error("Error creating exercise:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création de l'exercice";
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateConfirm = async () => {
    if (!selectedClient || !folderToDuplicate) {
      alert("Aucun client ou dossier sélectionné");
      return;
    }

    // Validation pour la duplication aussi
    const dateValidation = isStartDateValid(duplicateForm.fiscalYear);
    if (!dateValidation.isValid) {
      alert(dateValidation.message);
      return;
    }

    console.log(
      "Duplicating folder for client:",
      selectedClient.id,
      "folder:",
      folderToDuplicate.id
    );

    setIsCreating(true);
    try {
      const startDate = `${duplicateForm.fiscalYear}-01-01`;
      const endDate = `${duplicateForm.fiscalYear}-12-31`;

      // Create the folder using AppContext
      const duplicatedFolder = await createFolder({
        name: `Exercice ${duplicateForm.fiscalYear}`,
        description: `Duplication de l'exercice ${folderToDuplicate.fiscalYear}`,
        clientId: selectedClient.id,
        fiscalYear: duplicateForm.fiscalYear,
        startDate: startDate,
        endDate: endDate,
      });

      // Force reload folders to update the list
      await reloadFolders();

      // Auto-select the duplicated folder
      setSelectedFolder(duplicatedFolder);

      // Navigate to balance import by default with proper route structure
      const uid = user?.id || "me";
      navigate(`/web/user/import/${uid}/import`);

      setShowDuplicateDialog(false);
      setFolderToDuplicate(null);
    } catch (error: any) {
      console.error("Error duplicating exercise:", error);
      console.error("Error details:", error.response?.data);
      alert(error.message || "Erreur lors de la duplication de l'exercice");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (folder: Folder) => {
    try {
      // Toggle the isActive status
      const newIsActive = !folder.isActive;

      // Update the folder in the backend
      await updateFolder(folder.id, { isActive: newIsActive });

      // Force reload folders to update the list
      await reloadFolders();

      console.log(
        `Folder ${folder.name} ${newIsActive ? "activated" : "deactivated"}`
      );
    } catch (error: any) {
      console.error("Error toggling folder active status:", error);
      alert("Erreur lors de la modification du statut actif");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">
            Chargement des dossiers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>{t("exerciseManagement")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("selectFolderDescription")}
        </p>
      </div>

      {/* Bouton pour ajouter un nouvel exercice - toujours visible */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedClient}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addExercise")}
        </Button>
      </div>

      {/* Show active folder if exists */}
      {activeFolder && (
        <Card className="border-green-500 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Dossier actif</p>
                  <p className="text-lg">Dossier {activeFolder.fiscalYear}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show selected folder if different from active folder */}
      {selectedFolder && selectedFolder.id !== activeFolder?.id && (
        <Card className="border-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dossier sélectionné
                  </p>
                  <p className="text-lg">Dossier {selectedFolder.fiscalYear}</p>
                </div>
              </div>
              <Badge variant="default">
                {selectedFolder.status === "DRAFT" ? (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    Ouvert
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Clôturé
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          La clôture d'un exercice empêche toute modification des écritures
          comptables. Vous pouvez le réouvrir à tout moment.
        </AlertDescription>
      </Alert>

      {selectedClient && allFolders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedFolders.map((folder: Folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              isSelected={selectedFolder?.id === folder.id}
              isActive={folder.isActive || false}
              canClose={canCloseFolder(folder)}
              closurePossibleDate={getClosurePossibleDate(folder)}
              onSelect={handleSelectFolder}
              onToggleActive={handleToggleActive}
              onToggleStatus={handleCloseButtonClick}
              onDuplicate={handleDuplicateClick}
            />
          ))}
        </div>
      )}

      {selectedClient && allFolders.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Aucun dossier trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier dossier pour commencer.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un dossier
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedClient && (
        <Card className="border-orange-500 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("noClientSelected")}
                </p>
                <p className="text-lg">{t("selectClientFirst")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ToggleStatusDialog
        folder={folderToToggle}
        isOpen={showToggleDialog}
        isLatest={folderToToggle ? isLatestFolder(folderToToggle) : false}
        onClose={() => setShowToggleDialog(false)}
        onConfirm={confirmToggleStatus}
      />

      {/* Dialog de création d'exercice */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addExercise")}</DialogTitle>
            <DialogDescription>{t("workflowDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message d'erreur */}
            {createError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="name">Nom de l'exercice</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => {
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }));
                  setCreateError(null);
                }}
                placeholder="Exercice 2024"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Description de l'exercice"
              />
            </div>

            <div>
              <Label htmlFor="fiscalYear">Année fiscale</Label>
              <Input
                id="fiscalYear"
                type="number"
                value={createForm.fiscalYear}
                onChange={(e) => {
                  const year =
                    parseInt(e.target.value) || new Date().getFullYear();
                  setCreateForm((prev) => ({ ...prev, fiscalYear: year }));
                  setCreateError(null);

                  // Validation en temps réel
                  const validation = isStartDateValid(year);
                  if (!validation.isValid) {
                    setCreateError(validation.message);
                  } else if (validation.message) {
                    setCreateError(validation.message);
                  }
                }}
                min={2000}
                max={2100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'année fiscale doit être égale ou antérieure à l'année en cours
              </p>
            </div>

            <div>
              <Label>Workflow initial</Label>
              <div className="space-y-3">
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    createForm.workflow === "balance"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setCreateForm((prev) => ({ ...prev, workflow: "balance" }))
                  }
                >
                  <input
                    type="radio"
                    name="workflow"
                    value="balance"
                    checked={createForm.workflow === "balance"}
                    onChange={() =>
                      setCreateForm((prev) => ({
                        ...prev,
                        workflow: "balance",
                      }))
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <Upload className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Importer les balances</div>
                    <div className="text-sm text-gray-600">
                      Générer automatiquement la DSF
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    createForm.workflow === "dsf"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setCreateForm((prev) => ({ ...prev, workflow: "dsf" }))
                  }
                >
                  <input
                    type="radio"
                    name="workflow"
                    value="dsf"
                    checked={createForm.workflow === "dsf"}
                    onChange={() =>
                      setCreateForm((prev) => ({ ...prev, workflow: "dsf" }))
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Importer DSF existante</div>
                    <div className="text-sm text-gray-600">
                      Utiliser une DSF déjà préparée
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setCreateError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={CreateExercise}
              disabled={isCreating || !createForm.name.trim() || !!createError}
            >
              {isCreating ? "Création..." : "Créer l'exercice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de duplication d'exercice */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Dupliquer l'exercice {folderToDuplicate?.fiscalYear}
            </DialogTitle>
            <DialogDescription>
              Choisissez l'année pour la duplication de cet exercice
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="duplicateFiscalYear">Année fiscale</Label>
              <Input
                id="duplicateFiscalYear"
                type="number"
                value={duplicateForm.fiscalYear}
                onChange={(e) =>
                  setDuplicateForm((prev) => ({
                    ...prev,
                    fiscalYear:
                      parseInt(e.target.value) || new Date().getFullYear(),
                  }))
                }
                min={2000}
                max={2100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'année fiscale doit être égale ou antérieure à l'année en cours
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicateDialog(false);
                setFolderToDuplicate(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleDuplicateConfirm} disabled={isCreating}>
              {isCreating ? "Duplication..." : "Dupliquer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sous-composant pour la carte de dossier
interface FolderCardProps {
  folder: Folder;
  isSelected: boolean;
  isActive: boolean;
  canClose: boolean;
  closurePossibleDate: string;
  onSelect: (folder: Folder) => void;
  onToggleActive: (folder: Folder) => void;
  onToggleStatus: (folder: Folder, e: React.MouseEvent) => void;
  onDuplicate: (folder: Folder) => void;
}

function FolderCard({
  folder,
  isSelected,
  isActive,
  canClose,
  closurePossibleDate,
  onSelect,
  onToggleActive,
  onToggleStatus,
  onDuplicate,
}: FolderCardProps) {
  return (
    <Card
      className={`transition-all ${
        isActive
          ? "border-green-500 bg-green-50/50"
          : isSelected
          ? "border-blue-500 bg-blue-50/50"
          : "hover:border-blue-300"
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dossier {folder.fiscalYear}</CardTitle>
          <div className="flex gap-2">
            {isActive && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Actif
              </Badge>
            )}
            <Badge
              variant={folder.status === "DRAFT" ? "default" : "secondary"}
            >
              {folder.status === "DRAFT" ? (
                <>
                  <Unlock className="h-3 w-3 mr-1" />
                  Ouvert
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Clôturé
                </>
              )}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Du {new Date(folder.startDate).toLocaleDateString("fr-FR")} au{" "}
          {new Date(folder.endDate).toLocaleDateString("fr-FR")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isSelected && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
            <Calendar className="h-4 w-4" />
            <span>Dossier sélectionné</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onSelect(folder)}
            disabled={isActive}
          >
            {isActive ? "Déjà actif" : "Sélectionner"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDuplicate(folder)}
            title="Dupliquer l'exercice"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant={folder.status === "DRAFT" ? "destructive" : "default"}
            size="sm"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              onToggleStatus(folder, e)
            }
            disabled={folder.status === "DRAFT" && !canClose}
          >
            {folder.status === "DRAFT" ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Clôturer
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Réouvrir
              </>
            )}
          </Button>
        </div>
        {folder.status === "DRAFT" && !canClose && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Clôture possible le {closurePossibleDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Sous-composant pour la boîte de dialogue de confirmation
interface ToggleStatusDialogProps {
  folder: Folder | null;
  isOpen: boolean;
  isLatest: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ToggleStatusDialog({
  folder,
  isOpen,
  isLatest,
  onClose,
  onConfirm,
}: ToggleStatusDialogProps) {
  if (!folder) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {folder.status === "DRAFT" ? "Clôturer" : "Réouvrir"} le dossier{" "}
            {folder.fiscalYear}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {folder.status === "DRAFT" ? (
                <>
                  <div className="space-y-2">
                    <p>
                      Êtes-vous sûr de vouloir clôturer ce dossier ? Cette
                      action empêchera toute modification des écritures
                      comptables. Vous pourrez le réouvrir ultérieurement si
                      nécessaire.
                    </p>

                    {isLatest && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Nouveau dossier :</strong> Le dossier{" "}
                          {folder.fiscalYear + 1} sera automatiquement créé et
                          ouvert.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir réouvrir ce dossier ? Cela permettra
                  à nouveau de modifier les écritures comptables de ce dossier.
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {folder.status === "DRAFT" ? "Clôturer" : "Réouvrir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
