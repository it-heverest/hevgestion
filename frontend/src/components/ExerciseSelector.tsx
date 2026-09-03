// components/ExerciseSelector.tsx
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Upload,
  Plus,
  Copy,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useTranslation } from "../hooks/useTranslation";
import { folderService } from "../services/folder.service";

export function ExerciseSelector() {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();
  const langPrefix = lang === "en" ? "en" : "fr";
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
    handleArchiveFolder,
    handleRestoreFolder,
    handleDeleteFolder,
    setShowDuplicateDialog,
    setFolderToDuplicate,
    setDuplicateForm,
    reloadFolders,
    canCloseFolder,
    getClosurePossibleDate,
    isLatestFolder,
    loading,
  } = useExerciseManager();

  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (folder: Folder) => {
    setFolderToDelete(folder);
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!folderToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await handleDeleteFolder(folderToDelete);
      setShowDeleteDialog(false);
      setFolderToDelete(null);
    } catch (error: any) {
      setDeleteError(
        error?.message || "Erreur lors de la suppression de l'exercice"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedFolders = useMemo(() => {
    return [...allFolders].sort((a, b) => b.fiscalYear - a.fiscalYear);
  }, [allFolders]);

  const activeFolder = useMemo(() => {
    return (
      allFolders
        .filter((folder) => folder.isActive)
        .sort((a, b) => b.fiscalYear - a.fiscalYear)[0] || null
    );
  }, [allFolders]);

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
    setFolderToDuplicate(folder);
    setDuplicateForm({ fiscalYear: folder.fiscalYear + 1 });
    setShowDuplicateDialog(true);
  };

  const CreateExercise = async () => {
    if (!selectedClient) {
      alert("Aucun client sélectionné");
      return;
    }

    const dateValidation = isStartDateValid(createForm.fiscalYear);
    if (!dateValidation.isValid) {
      setCreateError(dateValidation.message);
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const startDate = `${createForm.fiscalYear}-01-01`;
      const endDate = `${createForm.fiscalYear}-12-31`;

      const newFolder = await createFolder({
        name: createForm.name || `Exercice ${createForm.fiscalYear}`,
        description: createForm.description,
        clientId: selectedClient.id,
        fiscalYear: createForm.fiscalYear,
        startDate,
        endDate,
      });

      await reloadFolders();
      setSelectedFolder(newFolder);

      const uid = user?.id || "me";
      if (createForm.workflow === "dsf") {
        navigate(`/${langPrefix}/web/user/dsf-import/${newFolder.id}`);
      } else {
        navigate(`/${langPrefix}/web/user/import/${uid}/import`);
      }

      setShowCreateDialog(false);
      setCreateForm({
        name: "",
        description: "",
        fiscalYear: new Date().getFullYear(),
        workflow: "balance",
      });
    } catch (error: any) {
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

    const dateValidation = isStartDateValid(duplicateForm.fiscalYear);
    if (!dateValidation.isValid) {
      alert(dateValidation.message);
      return;
    }

    setIsCreating(true);
    try {
      const clonedFolder = await folderService.cloneFolder(
        folderToDuplicate.id,
        duplicateForm.fiscalYear,
      );

      await reloadFolders();
      setSelectedFolder(clonedFolder);

      const uid = user?.id || "me";
      navigate(`/${langPrefix}/web/user/import/${uid}/import`);

      setShowDuplicateDialog(false);
      setFolderToDuplicate(null);
    } catch (error: any) {
      alert(error.message || "Erreur lors du clonage de l'exercice");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (folder: Folder) => {
    try {
      await updateFolder(folder.id, { isActive: !folder.isActive });
      await reloadFolders();
    } catch {
      alert("Erreur lors de la modification du statut actif");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-b-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">
          Chargement des dossiers...
        </span>
      </div>
    );
  }

  const openCount = allFolders.filter((f) => f.status === "DRAFT").length;
  const closedCount = allFolders.length - openCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("exerciseManagement")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("selectFolderDescription")}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="h-10 bg-primary px-4 text-sm text-white shadow-sm hover:bg-primary/90"
          disabled={!selectedClient}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("addExercise")}
        </Button>
      </div>

      {/* Stat strip */}
      {selectedClient && allFolders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">
              Total exercices
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {allFolders.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">
              Ouverts
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {openCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">
              Clôturés
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-500">
              {closedCount}
            </p>
          </div>
        </div>
      )}

      {/* Compact info note */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <AlertTriangle className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm text-muted-foreground">
          La clôture d'un exercice empêche toute modification des écritures
          comptables. Vous pouvez le réouvrir à tout moment.
        </span>
      </div>

      {/* No client selected */}
      {!selectedClient && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {t("noClientSelected")}
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              {t("selectClientFirst")}
            </p>
          </div>
        </div>
      )}

      {/* Folder table */}
      {selectedClient && allFolders.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Exercice
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Période
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Statut
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedFolders.map((folder: Folder) => (
                <FolderRow
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
                  onArchive={handleArchiveFolder}
                  onRestore={handleRestoreFolder}
                  onDelete={handleDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {selectedClient && allFolders.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Aucun dossier trouvé
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Créez votre premier dossier pour commencer.
          </p>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="mt-5 h-9 bg-primary px-4 text-sm text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Créer un dossier
          </Button>
        </div>
      )}

      <ToggleStatusDialog
        folder={folderToToggle}
        isOpen={showToggleDialog}
        isLatest={folderToToggle ? isLatestFolder(folderToToggle) : false}
        onClose={() => setShowToggleDialog(false)}
        onConfirm={confirmToggleStatus}
      />

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addExercise")}</DialogTitle>
            <DialogDescription>{t("workflowDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
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
                  const year = parseInt(e.target.value) || new Date().getFullYear();
                  setCreateForm((prev) => ({ ...prev, fiscalYear: year }));
                  setCreateError(null);
                  const validation = isStartDateValid(year);
                  if (!validation.isValid || validation.message) {
                    setCreateError(validation.message);
                  }
                }}
                min={2000}
                max={2100}
              />
              <p className="text-xs text-gray-500 mt-1">
                L'année fiscale doit être égale ou antérieure à l'année en cours
              </p>
            </div>

            <div>
              <Label>Workflow initial</Label>
              <div className="space-y-2 mt-1">
                <div
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    createForm.workflow === "balance"
                      ? "border-orange-400 bg-orange-50"
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
                      setCreateForm((prev) => ({ ...prev, workflow: "balance" }))
                    }
                    className="h-4 w-4 text-orange-600"
                  />
                  <Upload className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Importer les balances</div>
                    <div className="text-xs text-gray-500">
                      Générer automatiquement la DSF
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    createForm.workflow === "dsf"
                      ? "border-orange-400 bg-orange-50"
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
                    className="h-4 w-4 text-orange-600"
                  />
                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Importer DSF existante</div>
                    <div className="text-xs text-gray-500">
                      Utiliser une DSF déjà préparée
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateDialog(false);
                setCreateError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={CreateExercise}
              disabled={isCreating || !createForm.name.trim() || !!createError}
            >
              {isCreating ? "Création..." : "Créer l'exercice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cloner l'exercice {folderToDuplicate?.fiscalYear}
            </DialogTitle>
            <DialogDescription>
              Toutes les données seront copiées (balance, ventilation, DSF). Si un exercice existe déjà pour l'année choisie, il sera archivé.
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
              <p className="text-xs text-gray-500 mt-1">
                L'année fiscale doit être égale ou antérieure à l'année en cours
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDuplicateDialog(false);
                setFolderToDuplicate(null);
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleDuplicateConfirm}
              disabled={isCreating}
            >
              {isCreating ? "Clonage..." : "Cloner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer l'exercice {folderToDelete?.fiscalYear}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Cette action est irréversible. L'exercice ne peut être
                  supprimé que s'il ne contient aucune balance, DSF ou
                  déclaration.
                </p>
                {deleteError && (
                  <p className="text-red-600 text-sm font-medium">
                    {deleteError}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setFolderToDelete(null);
                setDeleteError(null);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface FolderRowProps {
  folder: Folder;
  isSelected: boolean;
  isActive: boolean;
  canClose: boolean;
  closurePossibleDate: string;
  onSelect: (folder: Folder) => void;
  onToggleActive: (folder: Folder) => void;
  onToggleStatus: (folder: Folder, e: React.MouseEvent) => void;
  onDuplicate: (folder: Folder) => void;
  onArchive: (folder: Folder) => void;
  onRestore: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

function FolderRow({
  folder,
  isSelected,
  isActive,
  canClose,
  closurePossibleDate,
  onSelect,
  onToggleActive,
  onToggleStatus,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: FolderRowProps) {
  const isClosed = folder.status !== "DRAFT";
  const isArchived = folder.status === "COMPLETED" && !isActive;

  return (
    <tr
      className={`transition-colors ${
        isSelected ? "bg-orange-50/60" : "hover:bg-muted/30"
      }`}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {isSelected && (
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-primary" />
          )}
          <span
            className={`text-sm font-medium ${
              isClosed ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            Exercice {folder.fiscalYear}
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              actif
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs text-muted-foreground">
        {new Date(folder.startDate).toLocaleDateString("fr-FR")} –{" "}
        {new Date(folder.endDate).toLocaleDateString("fr-FR")}
      </td>
      <td className="px-5 py-3.5">
        {isClosed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <Lock className="h-3 w-3" />
            Clôturé
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <Unlock className="h-3 w-3" />
            Ouvert
          </span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onSelect(folder)}
            disabled={isSelected}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-default disabled:opacity-40"
          >
            {isSelected ? "Sélectionné" : "Sélectionner"}
          </button>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              onToggleStatus(folder, e)
            }
            disabled={!isClosed && !canClose}
            title={
              !isClosed && !canClose
                ? `Clôture possible le ${closurePossibleDate}`
                : undefined
            }
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-default disabled:opacity-40"
          >
            {isClosed ? "Réouvrir" : "Clôturer"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Plus d'actions"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(folder)}>
                <Copy className="h-3.5 w-3.5" />
                Cloner
              </DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem onClick={() => onRestore(folder)}>
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  Restaurer
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onArchive(folder)}>
                  <Archive className="h-3.5 w-3.5" />
                  Archiver
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(folder)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {!isClosed && !canClose && (
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            Possible le {closurePossibleDate}
          </p>
        )}
      </td>
    </tr>
  );
}

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
            {folder.status === "DRAFT" ? "Clôturer" : "Réouvrir"} l'exercice{" "}
            {folder.fiscalYear}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {folder.status === "DRAFT" ? (
                <div className="space-y-2">
                  <p>
                    Êtes-vous sûr de vouloir clôturer ce dossier ? Cette action
                    empêchera toute modification des écritures comptables. Vous
                    pourrez le réouvrir ultérieurement si nécessaire.
                  </p>
                  {isLatest && (
                    <div className="flex items-start gap-2 text-sm bg-blue-50 border border-blue-200 rounded px-3 py-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                      <span className="text-blue-700">
                        <strong>Nouveau dossier :</strong> Le dossier{" "}
                        {folder.fiscalYear + 1} sera automatiquement créé et ouvert.
                      </span>
                    </div>
                  )}
                </div>
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
