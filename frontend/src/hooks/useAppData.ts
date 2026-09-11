// hooks/useAppData.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { Client, Folder, CountryInfo } from "../types";
import { authService } from "../services/auth.service";
import { clientService } from "../services/client.service";
import { folderService } from "../services/folder.service";
import { useAuth } from "../contexts/AuthContext";

interface CreateClientData {
  name: string;
  legalForm: "SARL" | "SA" | "SUARL" | "INDIVIDUAL" | "OTHER";
  taxNumber?: string;
  address?: string;
  city?: string;
  phone?: string;
  country: string;
}

interface CreateFolderData {
  name: string;
  clientId: string;
  fiscalYear: number;
  startDate?: string;
  endDate?: string;
  status?: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
}

interface Country {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  flag: string;
}

export function useAppData() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get authentication state
  const { isAuthenticated, user } = useAuth();

  // Références pour empêcher les rechargements multiples
  const hasLoaded = useRef(false);
  const hasStartedLoading = useRef(false);
  const isMounted = useRef(true);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Load initial data - only when user is authenticated
   */
  const loadInitialData = useCallback(
    async (forceReload = false) => {
      // Load public data (countries) even if user is not authenticated so
      // UI components like CountrySelector can function in local/offline modes.

      // Réinitialiser les flags si forceReload
      if (forceReload) {
        hasLoaded.current = false;
        hasStartedLoading.current = false;
      }

      // Éviter les appels multiples
      if (
        !isMounted.current ||
        loading ||
        hasLoaded.current ||
        hasStartedLoading.current
      ) {
        return;
      }

      hasStartedLoading.current = true;
      setLoading(true);
      setError(null);

      try {
        console.log("🚀 Chargement des données initiales...");

        // Get countries first (public endpoint) so selector can render
        const countriesData = (await clientService.getCountries().catch((e) => {
          console.warn("Warning: failed to load countries:", e?.message || e);
          return [] as Country[];
        })) as Country[];

        // Only load clients if user is authenticated
        let clientsData: Client[] = [];
        if (user) {
          try {
            // Get user info for role-based access
            const userProfile = await authService.getProfile();
            const userRole = userProfile?.user?.role || user.role;

            clientsData = (await clientService.getClients()) as Client[];
          } catch (e) {
            console.warn(
              "Warning: failed to load clients:",
              e instanceof Error ? e.message : e,
            );
            clientsData = [];
          }
        }

        console.log("📊 Données reçues:", {
          countries: countriesData.length,
          clients: clientsData.length,
        });

        // Load folders for all clients
        let allFoldersData: Folder[] = [];
        if (clientsData && clientsData.length > 0) {
          console.log("📁 Chargement des dossiers pour les clients...");

          const folderPromises = clientsData.map(async (client) => {
            try {
              const folders = await folderService.getFolders(client.id);
              return folders;
            } catch (err) {
              console.warn(
                `Erreur chargement dossiers pour client ${client.id}:`,
                err
              );
              return [];
            }
          });

          const foldersArrays = await Promise.all(folderPromises);
          allFoldersData = foldersArrays.flat();
          console.log("📁 Total dossiers chargés:", allFoldersData.length);
        }

        // Vérifier que le composant est toujours monté
        if (!isMounted.current) return;

        setCountries(countriesData);
        setClients(clientsData);
        setFolders(allFoldersData);

        // Marquer comme chargé
        hasLoaded.current = true;
        console.log("✅ Données initiales chargées avec succès");
      } catch (err) {
        // Vérifier que le composant est toujours monté
        if (!isMounted.current) return;

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des données";
        setError(errorMessage);

        console.error("❌ Erreur lors du chargement:", errorMessage);
        hasLoaded.current = false; // Allow retry on error
        hasStartedLoading.current = false;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [loading, user]
  );

  /**
   * Clear all data - called on logout or auth failure
   */
  const clearData = useCallback(() => {
    if (isMounted.current) {
      setClients([]);
      setFolders([]);
      setCountries([]);
      setError(null);
      setLoading(false);
      hasLoaded.current = false;
      hasStartedLoading.current = false;
      console.log("🧹 Données d'application vidées");
    }
  }, []);

  /**
   * Force reload all data
   */
  const reloadData = useCallback(async () => {
    await loadInitialData(true);
  }, [loadInitialData]);

  // Auto-load data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !hasLoaded.current && !hasStartedLoading.current) {
      console.log("🔐 User authenticated, loading initial data");
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  // Auto-clear data when authentication is lost (but not during auth operations)
  useEffect(() => {
    // Only clear if we were previously authenticated and data was loaded
    // This prevents clearing during login/registration operations
    if (!isAuthenticated && hasLoaded.current && !loading) {
      console.log("🔐 Authentication lost, clearing app data");
      clearData();
    }
  }, [isAuthenticated, clearData, loading]);

  /**
   * Generic error handler for API calls
   */
  const handleApiError = useCallback(
    (err: unknown, operation: string): string => {
      const errorMessage =
        err instanceof Error ? err.message : `Erreur lors de ${operation}`;

      console.error(`❌ ${operation} error:`, errorMessage);

      if (isMounted.current) {
        setError(errorMessage);
      }

      return errorMessage;
    },
    []
  );

  /**
   * Generic API call wrapper with loading state and error handling
   */
  const withApiCall = useCallback(
    async <T>(
      operation: string,
      apiCall: () => Promise<T>,
      onSuccess?: (result: T) => void
    ): Promise<T> => {
      if (!isMounted.current) throw new Error("Composant démonté");
      if (!isAuthenticated) throw new Error("Utilisateur non authentifié");

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();

        if (isMounted.current) {
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const errorMessage = handleApiError(err, operation);
        throw new Error(errorMessage);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [isAuthenticated, handleApiError]
  );

  // Client methods
  const createClient = useCallback(
    async (clientData: CreateClientData): Promise<Client> => {
      return withApiCall(
        "la création du client",
        async () => {
          if (!user) throw new Error("User not authenticated");
          const client = await clientService.createClient(clientData as any);
          return client as Client;
        },
        (newClient) => {
          setClients((prev) => [...prev, newClient]);
        }
      );
    },
    [withApiCall, user]
  );

  const refreshClients = useCallback(async (): Promise<void> => {
    return withApiCall("le rafraîchissement des clients", async () => {
      if (!user) throw new Error("User not authenticated");
      const clients = await clientService.getClients();
      setClients(clients as Client[]);
    });
  }, [withApiCall, user]);

  const getClientsByCountry = useCallback(
    async (countryCode: string): Promise<Client[]> => {
      return withApiCall("le filtrage des clients par pays", async () => {
        if (!user) throw new Error("User not authenticated");
        const clients = await clientService.getClients(countryCode);
        return clients as Client[];
      });
    },
    [withApiCall, user]
  );

  const searchClients = useCallback(
    async (query: string, countryCode?: string): Promise<Client[]> => {
      return withApiCall("la recherche de clients", async () => {
        if (!user) throw new Error("User not authenticated");
        // For now, just filter locally
        const clients = await clientService.getClients(countryCode);
        const typedClients = clients as Client[];
        return typedClients.filter(
          (client) =>
            client.name.toLowerCase().includes(query.toLowerCase()) ||
            client.taxNumber?.toLowerCase().includes(query.toLowerCase())
        );
      });
    },
    [withApiCall, user]
  );

  const getClientById = useCallback(
    async (clientId: string): Promise<Client> => {
      return withApiCall("la récupération du client", async () => {
        if (!user) throw new Error("User not authenticated");
        const client = await clientService.getClientById(clientId);
        return client as Client;
      });
    },
    [withApiCall, user]
  );

  const updateClient = useCallback(
    async (clientId: string, clientData: Partial<Client>): Promise<Client> => {
      return withApiCall(
        "la modification du client",
        async () => {
          if (!user) throw new Error("User not authenticated");
          const client = await clientService.updateClient(
            clientId,
            clientData as any
          );
          return client as Client;
        },
        (updatedClient) => {
          setClients((prev) =>
            prev.map((client) =>
              client.id === clientId ? updatedClient : client
            )
          );
        }
      );
    },
    [withApiCall, user]
  );

  const deleteClient = useCallback(
    async (clientId: string): Promise<void> => {
      return withApiCall("la suppression du client", async () => {
        if (!user) throw new Error("User not authenticated");
        await clientService.deleteClient(clientId);
        setClients((prev) => prev.filter((client) => client.id !== clientId));
      });
    },
    [withApiCall, user]
  );

  // Folder methods
  const createFolder = useCallback(
    async (folderData: CreateFolderData): Promise<Folder> => {
      return withApiCall(
        "la création du dossier",
        async () => {
          if (!user) throw new Error("User not authenticated");
          const newFolder = await folderService.createFolder({
            name: folderData.name,
            clientId: folderData.clientId,
            fiscalYear: folderData.fiscalYear,
            startDate:
              folderData.startDate ||
              new Date(new Date().getFullYear(), 0, 1).toISOString(),
            endDate:
              folderData.endDate ||
              new Date(new Date().getFullYear(), 11, 31).toISOString(),
          });

          return newFolder as Folder;
        },
        (newFolder) => {
          setFolders((prev) => [...prev, newFolder]);
        }
      );
    },
    [withApiCall, user]
  );

  const closeFolder = useCallback(
    async (folderId: string): Promise<Folder> => {
      return withApiCall(
        "la clôture du dossier",
        async () => {
          const updatedFolder = await folderService.updateFolderStatus(
            folderId,
            "COMPLETED"
          );
          return updatedFolder as Folder;
        },
        (updatedFolder) => {
          setFolders((prev) =>
            prev.map((folder) =>
              folder.id === folderId ? updatedFolder : folder
            )
          );
        }
      );
    },
    [withApiCall]
  );

  const refreshFolders = useCallback(async (): Promise<void> => {
    return withApiCall("le rafraîchissement des dossiers", async () => {
      // Only refresh folders if we have clients
      if (clients.length === 0) {
        setFolders([]);
        return;
      }

      const allFolders = await Promise.all(
        clients.map(async (client) => {
          try {
            const folders = await folderService.getFolders(client.id);
            return folders as Folder[];
          } catch (err) {
            console.warn(
              `Erreur rafraîchissement dossiers pour client ${client.id}:`,
              err
            );
            return [];
          }
        })
      );
      const flattenedFolders = allFolders.flat();
      setFolders(flattenedFolders);
    });
  }, [withApiCall, clients]);

  const getFoldersByClient = useCallback(
    async (clientId: string): Promise<Folder[]> => {
      return withApiCall(
        "la récupération des dossiers par client",
        async () => {
          const folders = await folderService.getFolders(clientId);
          return folders as Folder[];
        },
        (clientFolders) => {
          setFolders((prev) => [
            ...prev.filter((folder) => folder.clientId !== clientId),
            ...clientFolders,
          ]);
        }
      );
    },
    [withApiCall]
  );

  const getFolderById = useCallback(
    async (folderId: string): Promise<Folder> => {
      return withApiCall("la récupération du dossier", async () => {
        const folder = await folderService.getFolderById(folderId);
        return folder as Folder;
      });
    },
    [withApiCall]
  );

  const getCurrentFolder = useCallback(
    async (clientId: string): Promise<Folder | null> => {
      return withApiCall("la récupération du dossier actuel", async () => {
        const folders = await folderService.getFolders(clientId);
        const typedFolders = folders as Folder[];
        return (
          typedFolders
            .filter((folder: Folder) => folder.status !== "COMPLETED")
            .sort((a: Folder, b: Folder) => b.fiscalYear - a.fiscalYear)[0] ||
          null
        );
      });
    },
    [withApiCall]
  );

  const updateFolder = useCallback(
    async (folderId: string, folderData: Partial<Folder>): Promise<Folder> => {
      return withApiCall(
        "la modification du dossier",
        async () => {
          const updatedFolder = await folderService.updateFolder(
            folderId,
            folderData as any
          );
          return updatedFolder as Folder;
        },
        (updatedFolder) => {
          setFolders((prev) =>
            prev.map((folder) =>
              folder.id === folderId ? updatedFolder : folder
            )
          );
        }
      );
    },
    [withApiCall]
  );

  const deleteFolder = useCallback(
    async (folderId: string): Promise<void> => {
      return withApiCall("la suppression du dossier", async () => {
        // Note: updateClient is wrong, should be a method to update folder
        // For now, just remove from state
        setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      });
    },
    [withApiCall]
  );

  // Load folders for a specific client on demand
  const loadFoldersForClient = useCallback(
    async (clientId: string): Promise<Folder[]> => {
      return withApiCall("le chargement des dossiers du client", async () => {
        const clientFolders = await folderService.getFolders(clientId);
        const typedFolders = clientFolders as Folder[];

        // Update folders state, merging with existing folders
        setFolders((prev) => {
          const otherFolders = prev.filter(
            (folder) => folder.clientId !== clientId
          );
          return [...otherFolders, ...typedFolders];
        });

        return typedFolders;
      });
    },
    [withApiCall]
  );

  // NEW: Clear error manually
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    countries,
    clients,
    folders,
    loading,
    error,

    // Client methods
    createClient,
    refreshClients,
    getClientsByCountry,
    searchClients,
    getClientById,
    updateClient,
    deleteClient,

    // Folder methods
    createFolder,
    closeFolder,
    refreshFolders,
    getFoldersByClient,
    getFolderById,
    getCurrentFolder,
    updateFolder,
    deleteFolder,
    loadFoldersForClient, // NEW: On-demand folder loading

    // Utility methods
    loadInitialData,
    reloadData,
    clearData,
    clearError, // NEW: Error management
  };
}
