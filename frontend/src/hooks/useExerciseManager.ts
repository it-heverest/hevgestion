// hooks/useExerciseManager.ts
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useApp } from "../contexts/AppContext";

export interface Folder {
  id: string;
  name: string;
  description?: string;
  status:
    | "DRAFT"
    | "IN_PROGRESS"
    | "PROCESSING_BALANCE"
    | "BALANCE_READY"
    | "DSF_GENERATED"
    | "DSF_VALIDATED"
    | "COMPLETED"
    | "ARCHIVED";
  fiscalYear: number;
  startDate: string;
  endDate: string;
  clientId: string;
  ownerId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useExerciseManager() {
  const {
    // App Context State
    selectedClient,
    selectedFolder,
    setSelectedFolder,
    folders,
    filteredFolders,
    loading,
    error,

    // App Context Actions
    closeFolder,
    updateFolder,
    updateFolderStatus,
    createFolder,
    duplicateFolder,
    archiveFolder: archiveFolderService,
    restoreFolder: restoreFolderService,
    deleteFolder: deleteFolderService,
    addToHistory,
    refreshFolders,

    // App Context Utilities
    getFoldersByClient,
  } = useApp();

  // Local UI state only
  const [folderToToggle, setFolderToToggle] = useState<Folder | null>(null);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [folderToDuplicate, setFolderToDuplicate] = useState<Folder | null>(
    null
  );
  const [duplicateForm, setDuplicateForm] = useState({
    fiscalYear: new Date().getFullYear() + 1,
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Use folders from AppContext instead of local state
  const allFolders = useMemo(() => {
    if (!selectedClient) return [];

    // Filter folders for the selected client
    return folders.filter((folder) => folder.clientId === selectedClient.id);
  }, [folders, selectedClient]);

  // Load folders for the selected client using AppContext
  const loadFoldersForSelectedClient = useCallback(async () => {
    if (!selectedClient) {
      console.log("📁 No client selected, skipping folder load");
      return;
    }

    console.log(
      "📁 Loading folders for selected client:",
      selectedClient.id,
      selectedClient.name
    );
    setLocalLoading(true);
    setLocalError(null);

    try {
      // Use AppContext method to load folders
      await getFoldersByClient(selectedClient.id);
      console.log("✅ Folders loaded via AppContext");
    } catch (err) {
      console.error("❌ Error loading folders:", err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des dossiers"
      );
    } finally {
      setLocalLoading(false);
    }
  }, [selectedClient, getFoldersByClient]);

  // Load folders when client changes
  useEffect(() => {
    loadFoldersForSelectedClient();
  }, [loadFoldersForSelectedClient]);

  // Sort folders by fiscal year descending (active folders first)
  const sortedFolders = useMemo(
    () =>
      [...allFolders].sort((a, b) => {
        // Active folders first
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        // Then by fiscal year descending
        return b.fiscalYear - a.fiscalYear;
      }),
    [allFolders]
  );

  // Folder status toggle handler
  const handleToggleStatus = useCallback((folder: Folder) => {
    console.log("🔄 Toggling folder status:", folder.id, folder.status);
    setFolderToToggle(folder);
    setShowToggleDialog(true);
  }, []);

  // Folder duplication handler
  const handleDuplicate = useCallback((folder: Folder) => {
    setFolderToDuplicate(folder);
    setDuplicateForm({
      fiscalYear: folder.fiscalYear + 1,
    });
    setShowDuplicateDialog(true);
  }, []);

  // Archive an exercise (soft-archive: isActive=false, status=COMPLETED)
  const handleArchiveFolder = useCallback(
    async (folder: Folder) => {
      try {
        setLocalLoading(true);
        setLocalError(null);
        await archiveFolderService(folder.id);
        await refreshFolders();
        if (selectedFolder?.id === folder.id) {
          setSelectedFolder(null as any);
        }
        addToHistory(
          "ARCHIVE_FOLDER",
          `Exercice ${folder.fiscalYear} archivé`
        );
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Erreur lors de l'archivage"
        );
      } finally {
        setLocalLoading(false);
      }
    },
    [archiveFolderService, refreshFolders, selectedFolder, setSelectedFolder, addToHistory]
  );

  // Restore an archived exercise
  const handleRestoreFolder = useCallback(
    async (folder: Folder) => {
      try {
        setLocalLoading(true);
        setLocalError(null);
        await restoreFolderService(folder.id);
        await refreshFolders();
        addToHistory(
          "RESTORE_FOLDER",
          `Exercice ${folder.fiscalYear} restauré`
        );
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Erreur lors de la restauration"
        );
      } finally {
        setLocalLoading(false);
      }
    },
    [restoreFolderService, refreshFolders, addToHistory]
  );

  // Permanently delete an exercise
  const handleDeleteFolder = useCallback(
    async (folder: Folder) => {
      try {
        setLocalLoading(true);
        setLocalError(null);
        await deleteFolderService(folder.id);
        await refreshFolders();
        if (selectedFolder?.id === folder.id) {
          setSelectedFolder(null as any);
        }
        addToHistory(
          "DELETE_FOLDER",
          `Exercice ${folder.fiscalYear} supprimé`
        );
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Erreur lors de la suppression"
        );
        throw err;
      } finally {
        setLocalLoading(false);
      }
    },
    [deleteFolderService, refreshFolders, selectedFolder, setSelectedFolder, addToHistory]
  );

  // Force reload folders using AppContext
  const reloadFolders = useCallback(async () => {
    if (!selectedClient) return;

    console.log("🔄 Force reloading folders via AppContext");
    setLocalLoading(true);
    setLocalError(null);

    try {
      await refreshFolders();
      console.log("✅ Folders reloaded successfully via AppContext");
    } catch (err) {
      console.error("❌ Error reloading folders:", err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Erreur lors du rechargement des dossiers"
      );
    } finally {
      setLocalLoading(false);
    }
  }, [selectedClient, refreshFolders]);

  // Select folder handler using AppContext
  const handleSelectFolder = useCallback(
    async (folder: Folder) => {
      console.log("📁 Selecting folder:", folder.id, folder.name);

      // Check if folder exists in current state
      const folderExists = allFolders.some((f) => f.id === folder.id);
      if (!folderExists) {
        console.error("❌ Folder not found in current state:", folder.id);
        setLocalError("Dossier introuvable");
        return;
      }

      try {
        setLocalLoading(true);
        setLocalError(null);

        // Update the folder to be active using AppContext
        await updateFolder(folder.id, { isActive: true });

        // Deactivate all other folders for this client
        const otherFolders = allFolders.filter(
          (f) => f.id !== folder.id && f.isActive
        );
        for (const otherFolder of otherFolders) {
          await updateFolder(otherFolder.id, { isActive: false });
        }

        // Set selected folder using AppContext (this will be the active folder)
        setSelectedFolder(folder);

        // Add to history using AppContext
        addToHistory(
          "SELECT_FOLDER",
          `Dossier ${folder.name} (${folder.fiscalYear}) sélectionné`
        );

        console.log("✅ Folder selected successfully");
      } catch (error) {
        console.error("❌ Error selecting folder:", error);
        setLocalError("Erreur lors de la sélection du dossier");
      } finally {
        setLocalLoading(false);
      }
    },
    [setSelectedFolder, addToHistory, updateFolder, allFolders]
  );

  // Confirm folder status toggle using AppContext
  const confirmToggleStatus = useCallback(async () => {
    if (!folderToToggle) return;

    try {
      setLocalLoading(true);
      setLocalError(null);

      const newStatus =
        folderToToggle.status === "COMPLETED" ? "DRAFT" : "COMPLETED";
      console.log(
        "🔄 Changing folder status:",
        folderToToggle.id,
        "from",
        folderToToggle.status,
        "to",
        newStatus
      );

      if (newStatus === "COMPLETED") {
        // Close the folder using AppContext
        await closeFolder(folderToToggle.id);

        // Logic for automatic creation of new folder
        const maxYear = Math.max(...allFolders.map((f) => f.fiscalYear));
        if (folderToToggle.fiscalYear === maxYear) {
          const nextYear = maxYear + 1;
          const newFolderData = {
            name: `${selectedClient?.name} - ${nextYear}`,
            description: `Dossier comptable ${nextYear}`,
            clientId: selectedClient!.id,
            fiscalYear: nextYear,
            startDate: `${nextYear}-01-01`,
            endDate: `${nextYear}-12-31`,
          };

          // Create new folder using AppContext
          console.log("📁 Creating new folder for year:", nextYear);
          await createFolder(newFolderData);
        }
      } else {
        // Reopen the folder - update status using AppContext
        await updateFolderStatus(folderToToggle.id, "DRAFT");
      }

      const action = newStatus === "COMPLETED" ? "clôture" : "réouverture";
      addToHistory(
        `FOLDER_${newStatus === "COMPLETED" ? "CLOSE" : "REOPEN"}`,
        `Dossier ${folderToToggle.name} ${
          action === "clôture" ? "clôturé" : "réouvert"
        }`
      );

      // Update selected folder if it's the one that was modified and reopened
      if (selectedFolder?.id === folderToToggle.id && newStatus === "DRAFT") {
        setSelectedFolder({ ...folderToToggle, status: newStatus });
      }

      console.log("✅ Folder status changed successfully");
    } catch (err) {
      console.error("❌ Error changing folder status:", err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Erreur lors du changement de statut"
      );
    } finally {
      setLocalLoading(false);
      setShowToggleDialog(false);
      setFolderToToggle(null);
    }
  }, [
    folderToToggle,
    selectedClient,
    selectedFolder,
    closeFolder,
    updateFolderStatus,
    createFolder,
    setSelectedFolder,
    addToHistory,
    allFolders,
  ]);

  // Confirm folder duplication using AppContext
  const confirmDuplicateFolder = useCallback(async () => {
    if (!folderToDuplicate) return;

    try {
      setLocalLoading(true);
      setLocalError(null);

      console.log(
        "📁 Duplicating folder:",
        folderToDuplicate.id,
        "to year:",
        duplicateForm.fiscalYear
      );

      // Use AppContext duplicate method
      const newFolder = await duplicateFolder(
        folderToDuplicate.id,
        duplicateForm.fiscalYear
      );

      addToHistory(
        "DUPLICATE_FOLDER",
        `Dossier ${folderToDuplicate.name} dupliqué vers ${duplicateForm.fiscalYear}`
      );

      // Auto-select the new folder
      setSelectedFolder(newFolder);

      console.log("✅ Folder duplicated successfully");
    } catch (err) {
      console.error("❌ Error duplicating folder:", err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la duplication du dossier"
      );
    } finally {
      setLocalLoading(false);
      setShowDuplicateDialog(false);
      setFolderToDuplicate(null);
      setDuplicateForm({ fiscalYear: new Date().getFullYear() + 1 });
    }
  }, [
    folderToDuplicate,
    duplicateForm,
    duplicateFolder,
    setSelectedFolder,
    addToHistory,
  ]);

  // Check if we can close a folder (at least 1 month after end date)
  const canCloseFolder = useCallback((folder: Folder) => {
    if (folder.status === "COMPLETED") return false;

    const endDate = new Date(folder.endDate);
    const today = new Date();
    const oneMonthAfterEnd = new Date(endDate);
    oneMonthAfterEnd.setMonth(oneMonthAfterEnd.getMonth() + 1);

    return today >= oneMonthAfterEnd;
  }, []);

  // Handle click on close button with verification
  const handleCloseButtonClick = useCallback(
    (folder: Folder, e: React.MouseEvent) => {
      e.stopPropagation();

      if (folder.status !== "COMPLETED" && !canCloseFolder(folder)) {
        const endDate = new Date(folder.endDate);
        const oneMonthAfterEnd = new Date(endDate);
        oneMonthAfterEnd.setMonth(oneMonthAfterEnd.getMonth() + 1);

        alert(
          `Impossible de clôturer : la date de fin doit être dépassée d'au moins 1 mois (clôture possible à partir du ${oneMonthAfterEnd.toLocaleDateString(
            "fr-FR"
          )})`
        );
        return;
      }

      handleToggleStatus(folder);
    },
    [canCloseFolder, handleToggleStatus]
  );

  // Calculate possible closure date
  const getClosurePossibleDate = useCallback((folder: Folder) => {
    const endDate = new Date(folder.endDate);
    const oneMonthAfter = new Date(endDate);
    oneMonthAfter.setMonth(oneMonthAfter.getMonth() + 1);
    return oneMonthAfter.toLocaleDateString("fr-FR");
  }, []);

  // Check if it's the most recent folder
  const isLatestFolder = useCallback(
    (folder: Folder) => {
      if (allFolders.length === 0) return false;
      const maxYear = Math.max(...allFolders.map((f) => f.fiscalYear));
      return folder.fiscalYear === maxYear;
    },
    [allFolders]
  );

  // Get folder statistics
  const folderStats = useMemo(() => {
    const stats = {
      total: allFolders.length,
      completed: allFolders.filter((f) => f.status === "COMPLETED").length,
      draft: allFolders.filter((f) => f.status === "DRAFT").length,
      inProgress: allFolders.filter(
        (f) =>
          f.status === "PROCESSING_BALANCE" ||
          f.status === "BALANCE_READY" ||
          f.status === "DSF_GENERATED" ||
          f.status === "DSF_VALIDATED"
      ).length,
    };

    return stats;
  }, [allFolders]);

  return {
    // State (from AppContext and local UI state)
    folders: sortedFolders,
    selectedFolder,
    folderToToggle,
    showToggleDialog,
    showDuplicateDialog,
    folderToDuplicate,
    duplicateForm,
    loading: loading || localLoading,
    error: error || localError,
    folderStats,

    // Actions
    handleSelectFolder,
    handleToggleStatus,
    handleCloseButtonClick,
    confirmToggleStatus,
    confirmDuplicateFolder,
    setShowToggleDialog,
    setFolderToToggle,
    handleDuplicate,
    handleArchiveFolder,
    handleRestoreFolder,
    handleDeleteFolder,
    setShowDuplicateDialog,
    setFolderToDuplicate,
    setDuplicateForm,
    reloadFolders,

    // Utilities
    canCloseFolder,
    getClosurePossibleDate,
    isLatestFolder,
  };
}
