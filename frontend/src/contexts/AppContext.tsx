// contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAppData } from "../hooks/useAppData";
import { Client, Folder } from "../types";
import { translations } from "../locales/translations";
import { useAuth } from "./AuthContext";
import { secureStorageService } from "../services/encryption.service";
import { clientService } from "../services/client.service";
import { folderService } from "../services/folder.service";


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

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  user: string;
}

interface AppSession {
  selectedCountry: string | null;
  selectedClientId: string | null;
  selectedClientName?: string; // For better UX when data isn't loaded yet
  selectedFolderId: string | null;
  selectedFolderFiscalYear?: number; // For better UX when data isn't loaded yet
  lastUpdated: string;
}

interface AppContextType {
  // Data state
  countries: Country[];
  clients: Client[];
  folders: Folder[];
  loading: boolean;
  isFullyLoaded: boolean;
  error: string | null;

  // Selection state
  selectedCountry: string | null;
  setSelectedCountry: (countryCode: string | null) => void;
  filteredClients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  filteredFolders: Folder[];
  currentFolder: Folder | null;
  previousFolder: Folder | null;
  selectedFolder: Folder | null;
  setSelectedFolder: (folder: Folder | null) => void;

  // Client actions
  createClient: (clientData: CreateClientData) => Promise<Client>;
  refreshClients: () => Promise<void>;
  getClientsByCountry: (countryCode: string) => Promise<Client[]>;
  searchClients: (query: string, countryCode?: string) => Promise<Client[]>;
  getClientById: (clientId: string) => Promise<Client>;
  updateClient: (
    clientId: string,
    clientData: Partial<Client>
  ) => Promise<Client>;
  deleteClient: (clientId: string) => Promise<void>;

  // Folder actions
  createFolder: (folderData: CreateFolderData) => Promise<Folder>;
  closeFolder: (folderId: string) => Promise<void>;
  refreshFolders: () => Promise<void>;
  getFoldersByClient: (clientId: string) => Promise<Folder[]>;
  getFolderById: (folderId: string) => Promise<Folder>;
  getCurrentFolder: (clientId: string) => Promise<Folder | null>;
  updateFolder: (
    folderId: string,
    folderData: Partial<Folder>
  ) => Promise<Folder>;
  deleteFolder: (folderId: string) => Promise<void>;

  // Country actions
  searchCountries: (query: string) => Promise<Country[]>;
  getCountryByCode: (countryCode: string) => Country | undefined;

  // App state
  balanceImported: boolean;
  setBalanceImported: (imported: boolean) => void;
  balanceProcessed: boolean;
  setBalanceProcessed: (processed: boolean) => void;
  reportsGenerated: boolean;
  setReportsGenerated: (generated: boolean) => void;
  history: HistoryEntry[];
  addToHistory: (action: string, description: string) => void;
  clearHistory: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  language: "fr" | "en";
  setLanguage: (language: "fr" | "en") => void;

  // Translation
  t: (key: string) => string;

  // Utility methods
  getCountryName: (countryCode: string) => string;
  getCountryFlag: (countryCode: string) => string;
  reloadInitialData: () => Promise<void>;
  clearAppData: () => void;
  saveSelectionsToServer: () => Promise<void>;
  restoreSelectionsFromServer: () => Promise<void>;

  // Session management
  getAppSession: () => Promise<AppSession | null>;
  saveAppSession: (session: AppSession) => Promise<void>;
  updateAppSession: (updates: Partial<AppSession>) => Promise<void>;
  clearSession: () => Promise<void>;
  getLastSelectedInfo: () => Promise<{
    clientName?: string;
    folderFiscalYear?: number;
  } | null>;

  // Service integration
  uploadBalance: (formData: FormData) => Promise<any>;
  getBalancesByFolder: (folderId: string) => Promise<any>;
  importDSF: (formData: FormData) => Promise<any>;

  getFolderWithDetails: (folderId: string) => Promise<Folder>;
  duplicateFolder: (folderId: string, newFiscalYear: number) => Promise<Folder>;
  getFolderProgress: (folderId: string) => Promise<any>;
  updateFolderStatus: (
    folderId: string,
    status: Folder["status"]
  ) => Promise<Folder>;
  searchFolders: (query: string, clientId?: string) => Promise<Folder[]>;
  getFolderStats: (clientId: string) => Promise<{ [status: string]: number }>;
  archiveFolder: (folderId: string) => Promise<Folder>;
  restoreFolder: (folderId: string) => Promise<Folder>;
  getFolderTimeline: (folderId: string) => Promise<any[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys for encrypted session storage
const STORAGE_KEYS = {
  APP_SESSION: "app_session",
  COUNTRIES_CACHE: "countries_cache",
  CLIENTS_CACHE: "clients_cache",
  FOLDERS_CACHE: "folders_cache",
};

// Configurable debounce time for session saves (in milliseconds)
const SESSION_SAVE_DEBOUNCE_MS = 500;

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    countries,
    clients,
    folders,
    loading,
    error,
    createClient: createClientService,
    refreshClients: refreshClientsService,
    getClientsByCountry: getClientsByCountryService,
    searchClients: searchClientsService,
    getClientById: getClientByIdService,
    updateClient: updateClientService,
    deleteClient: deleteClientService,
    createFolder: createFolderService,
    closeFolder: closeFolderService,
    refreshFolders: refreshFoldersService,
    getFoldersByClient: getFoldersByClientService,
    getFolderById: getFolderByIdService,
    getCurrentFolder: getCurrentFolderService,
    updateFolder: updateFolderService,
    deleteFolder: deleteFolderService,
    loadInitialData,
    reloadData,
    clearData,
  } = useAppData();

  // Get authentication state from AuthContext
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  // Combined loading state - wait for both auth and app data to be ready
  const isFullyLoaded = !authLoading && !loading && isAuthenticated;

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [balanceImported, setBalanceImported] = useState(false);
  const [balanceProcessed, setBalanceProcessed] = useState(false);
  const [reportsGenerated, setReportsGenerated] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  // References for tracking restoration state
  const hasRestoredFromServer = useRef(false);
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataLoadAttempted = useRef(false);

  // ==================== ENCRYPTED SESSION MANAGEMENT ====================

  // In AppContext.tsx, add this method:

  /**
   * Initialize storage with error recovery
   */
  const initializeStorage = useCallback(async (): Promise<void> => {
    try {
      console.log("🔄 Initializing secure storage...");

      // Health check for storage system
      const isHealthy = await secureStorageService.healthCheck();
      if (!isHealthy) {
        console.warn("⚠️ Storage health check failed, performing cleanup");
        await secureStorageService.cleanupCorruptedData();
      }

      // Clear any obviously corrupted session data
      const session = await secureStorageService.getItem(
        STORAGE_KEYS.APP_SESSION
      );
      if (session && typeof session !== "object") {
        console.warn("⚠️ Corrupted session data found, clearing...");
        secureStorageService.removeItem(STORAGE_KEYS.APP_SESSION);
      }

      console.log("✅ Secure storage initialized successfully");
    } catch (error) {
      console.error("❌ Storage initialization failed:", error);
      // Don't throw - we can continue with empty session
    }
  }, []);

  // Call this in your useEffect or initialization
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);
  /**
   * Get app session from encrypted storage
   */
  const getAppSession = useCallback(async (): Promise<AppSession | null> => {
    try {
      return await secureStorageService.getItem<AppSession>(
        STORAGE_KEYS.APP_SESSION
      );
    } catch (error) {
      console.error("Failed to get app session:", error);
      return null;
    }
  }, []);

  /**
   * Save app session to encrypted storage
   */
  const saveAppSession = useCallback(
    async (session: AppSession): Promise<void> => {
      try {
        await secureStorageService.setItem(STORAGE_KEYS.APP_SESSION, {
          ...session,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to save app session:", error);
        throw new Error("Failed to save session securely");
      }
    },
    []
  );

  /**
   * Update specific session fields in encrypted storage and cookies
   */
  const updateAppSession = useCallback(
    async (updates: Partial<AppSession>): Promise<void> => {
      try {
        const currentSession = (await getAppSession()) || {
          selectedCountry: null,
          selectedClientId: null,
          selectedFolderId: null,
          lastUpdated: new Date().toISOString(),
        };

        const updatedSession: AppSession = {
          ...currentSession,
          ...updates,
          lastUpdated: new Date().toISOString(),
        };

        await saveAppSession(updatedSession);

        // Also store clientID in cookies for redundancy
        if (updates.selectedClientId !== undefined) {
          const clientIdValue = updates.selectedClientId || "";
          // Set cookie that expires in 4 hours (matching access token)
          document.cookie = `selectedClientId=${clientIdValue}; path=/; max-age=${
            4 * 60 * 60
          }; SameSite=Lax`;
          console.log("🍪 ClientID stored in cookie:", clientIdValue);
        }
      } catch (error) {
        console.error("Failed to update app session:", error);
        throw error;
      }
    },
    [getAppSession, saveAppSession]
  );

  /**
   * Clear encrypted session storage
   */
  const clearSession = useCallback(async (): Promise<void> => {
    secureStorageService.clear();
  }, []);

  /**
   * Get last selected items info for better UX when data isn't loaded yet
   */
  const getLastSelectedInfo = useCallback(async (): Promise<{
    clientName?: string;
    folderFiscalYear?: number;
  } | null> => {
    try {
      const session = await getAppSession();
      if (
        session &&
        (session.selectedClientName || session.selectedFolderFiscalYear)
      ) {
        return {
          clientName: session.selectedClientName,
          folderFiscalYear: session.selectedFolderFiscalYear,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get last selected info:", error);
      return null;
    }
  }, [getAppSession]);

  /**
   * Cache countries with encryption
   */
  const cacheCountries = useCallback(
    async (countries: Country[]): Promise<void> => {
      try {
        await secureStorageService.setItem(STORAGE_KEYS.COUNTRIES_CACHE, {
          data: countries,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000, // 5 minutes TTL
        });
      } catch (error) {
        console.error("Failed to cache countries:", error);
      }
    },
    []
  );

  /**
   * Get cached countries
   */
  const getCachedCountries = useCallback(async (): Promise<
    Country[] | null
  > => {
    try {
      const cached = await secureStorageService.getItem<{
        data: Country[];
        timestamp: number;
        ttl: number;
      }>(STORAGE_KEYS.COUNTRIES_CACHE);

      if (!cached) return null;

      // Check if cache is still valid
      if (Date.now() - cached.timestamp > cached.ttl) {
        secureStorageService.removeItem(STORAGE_KEYS.COUNTRIES_CACHE);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error("Failed to get cached countries:", error);
      return null;
    }
  }, []);

  /**
   * Cache clients with encryption
   */
  const cacheClients = useCallback(async (clients: Client[]): Promise<void> => {
    try {
      await secureStorageService.setItem(STORAGE_KEYS.CLIENTS_CACHE, {
        data: clients,
        timestamp: Date.now(),
        ttl: 2 * 60 * 1000, // 2 minutes TTL for clients
      });
    } catch (error) {
      console.error("Failed to cache clients:", error);
    }
  }, []);

  /**
   * Get cached clients
   */
  const getCachedClients = useCallback(async (): Promise<Client[] | null> => {
    try {
      const cached = await secureStorageService.getItem<{
        data: Client[];
        timestamp: number;
        ttl: number;
      }>(STORAGE_KEYS.CLIENTS_CACHE);

      if (!cached) return null;

      if (Date.now() - cached.timestamp > cached.ttl) {
        secureStorageService.removeItem(STORAGE_KEYS.CLIENTS_CACHE);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error("Failed to get cached clients:", error);
      return null;
    }
  }, []);

  // Save selections to encrypted storage with debouncing for efficiency
  // Efficiency improvements:
  // - Debounced saves prevent excessive storage writes
  // - Stores minimal IDs instead of full objects
  // - Includes metadata (clientName, folderFiscalYear) for better UX when data isn't loaded yet
  // - Uses encrypted storage for security
  const saveSelectionsToServer = useCallback(async () => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to prevent too many storage writes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateAppSession({
          selectedCountry,
          selectedClientId: selectedClient?.id || null,
          selectedClientName: selectedClient?.name || undefined,
          selectedFolderId: selectedFolder?.id || null,
          selectedFolderFiscalYear: selectedFolder?.fiscalYear || undefined,
        });
      } catch (error) {
        console.error("Failed to save selections to encrypted storage:", error);
      }
    }, SESSION_SAVE_DEBOUNCE_MS); // Configurable debounce
  }, [selectedCountry, selectedClient, selectedFolder, updateAppSession]);

  // Restore selections from encrypted storage and cookies
  const restoreSelectionsFromServer = useCallback(async (): Promise<void> => {
    if (hasRestoredFromServer.current || clients.length === 0) {
      return;
    }

    try {
      console.log(
        "🔄 Restoring selections from encrypted storage and cookies..."
      );
      const session = await getAppSession();
      console.log("📦 Session data retrieved:", session);

      // Get clientID from cookies as fallback
      const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
        return null;
      };

      const cookieClientId = getCookieValue("selectedClientId");
      console.log("🍪 ClientID from cookie:", cookieClientId);

      if (session?.selectedCountry) {
        setSelectedCountry(session.selectedCountry);
        console.log("✅ Country restored:", session.selectedCountry);
      }

      // Use session clientID first, then cookie as fallback
      const clientIdToRestore =
        session?.selectedClientId ||
        (cookieClientId && cookieClientId !== "" ? cookieClientId : null);

      if (clientIdToRestore && clients.length > 0) {
        const client = clients.find((c) => c.id === clientIdToRestore);
        if (client) {
          setSelectedClient(client);
          console.log(
            "✅ Client restored:",
            client.name,
            clientIdToRestore === cookieClientId
              ? "(from cookie)"
              : "(from session)"
          );

          // Restore folder after client is set
          if (session?.selectedFolderId && folders.length > 0) {
            const folder = folders.find(
              (f) =>
                f.id === session.selectedFolderId && f.clientId === client.id
            );
            if (folder) {
              setSelectedFolder(folder);
              console.log("✅ Folder restored:", folder.fiscalYear);
            }
          }
        } else {
          console.log("❌ Client not found for ID:", clientIdToRestore);
        }
      } else if (clientIdToRestore) {
        console.log(
          "⏳ Client ID found but no clients loaded yet:",
          clientIdToRestore
        );
      }

      hasRestoredFromServer.current = true;
      console.log("✅ Selections restored from encrypted storage and cookies");
    } catch (error) {
      console.error(
        "Error restoring selections from encrypted storage and cookies:",
        error
      );
    }
  }, [clients, folders, getAppSession]);

  // ==================== SERVICE INTEGRATION ====================

  /**
   * Upload balance using client service
   */

  const addToHistory = useCallback((action: string, description: string) => {
    const entry: HistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      action,
      description,
      user: "Comptable",
    };
    setHistory((prev) => [entry, ...prev.slice(0, 49)]);
  }, []);
  const uploadBalance = useCallback(
    async (formData: FormData): Promise<any> => {
      try {
        const result = await clientService.uploadBalance(formData);
        addToHistory("UPLOAD_BALANCE", "Balance uploaded successfully");
        return result;
      } catch (error) {
        console.error("Error uploading balance:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  /**
   * Get balances by folder using client service
   */
  const getBalancesByFolder = useCallback(
    async (folderId: string): Promise<any> => {
      try {
        return await clientService.getBalancesByFolder(folderId);
      } catch (error) {
        console.error("Error fetching balances:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Import DSF using client service
   */
  const importDSF = useCallback(
    async (formData: FormData): Promise<any> => {
      try {
        const result = await clientService.importDSF(formData);
        addToHistory("IMPORT_DSF", "DSF file imported successfully");
        return result;
      } catch (error) {
        console.error("Error importing DSF:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  // Utility functions
  const getCountryByCode = useCallback(
    (countryCode: string): Country | undefined => {
      return countries.find((country) => country.code === countryCode);
    },
    [countries]
  );

  const getCountryName = useCallback(
    (countryCode: string): string => {
      return getCountryByCode(countryCode)?.name || countryCode;
    },
    [getCountryByCode]
  );

  const getCountryFlag = useCallback((countryCode: string): string => {
    const flagEmojis: { [key: string]: string } = {
      BJ: "🇧🇯",
      BF: "🇧🇫",
      CI: "🇨🇮",
      SN: "🇸🇳",
      CM: "🇨🇲",
      TG: "🇹🇬",
    };
    return flagEmojis[countryCode] || "🏳️";
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    addToHistory("CLEAR_HISTORY", "Historique effacé");
  }, [addToHistory]);

  // Translation function
  const t = useCallback(
    (key: string): string => {
      const currentTranslations = translations[language] || translations.fr;
      return (
        currentTranslations[key as keyof typeof currentTranslations] || key
      );
    },
    [language]
  );

  const reloadInitialData = useCallback(async (): Promise<void> => {
    console.log("🔄 Reloading initial data...");
    try {
      await reloadData();
      // Reset restoration flag after reloading
      hasRestoredFromServer.current = false;
      dataLoadAttempted.current = true;
      addToHistory("RELOAD_DATA", "Données rechargées depuis le serveur");
    } catch (error) {
      console.error("❌ Failed to reload initial data:", error);
      throw error;
    }
  }, [reloadData, addToHistory]);

  // Enhanced clear app data that also clears encrypted storage
  const clearAppData = useCallback(async () => {
    console.log("🧹 Clearing all app data...");
    clearData();
    setSelectedCountry(null);
    setSelectedClient(null);
    setSelectedFolder(null);
    setBalanceImported(false);
    setBalanceProcessed(false);
    setReportsGenerated(false);
    setHistory([]);
    hasRestoredFromServer.current = false;
    dataLoadAttempted.current = false;

    // Clear encrypted storage
    await clearSession();

    console.log("✅ All app data cleared");
  }, [clearData, clearSession]);

  // Memoize filtered clients to prevent unnecessary re-renders
  const filteredClients = useMemo(
    () =>
      selectedCountry
        ? clients.filter((client) => client.country === selectedCountry)
        : clients,
    [clients, selectedCountry]
  );

  // Memoize filtered folders
  const filteredFolders = useMemo(
    () =>
      selectedClient
        ? folders.filter((folder) => folder.clientId === selectedClient.id)
        : folders,
    [folders, selectedClient]
  );

  // Get current folder (N) - the latest non-completed folder for selected client
  const currentFolder = useMemo(() => {
    if (!selectedClient) return null;
    return (
      filteredFolders
        .filter((folder) => folder.status !== "COMPLETED")
        .sort((a, b) => b.fiscalYear - a.fiscalYear)[0] || null
    );
  }, [selectedClient, filteredFolders]);

  // Get previous folder (N-1) - the latest completed folder before current for selected client
  const previousFolder = useMemo(() => {
    if (!selectedClient) return null;
    return (
      filteredFolders
        .filter((folder) => folder.status === "COMPLETED")
        .sort((a, b) => b.fiscalYear - a.fiscalYear)[0] || null
    );
  }, [selectedClient, filteredFolders]);

  // Data loading based on authentication state
  useEffect(() => {
    const loadDataIfNeeded = async () => {
      // Don't load if still authenticating or already attempted
      if (authLoading || dataLoadAttempted.current) {
        return;
      }

      // Only load data if user is authenticated
      if (isAuthenticated && user) {
        console.log("🔐 User authenticated, loading app data...");
        try {
          dataLoadAttempted.current = true;
          await reloadInitialData();
          isInitialLoad.current = false;
        } catch (error) {
          console.error("❌ Failed to load app data:", error);
          dataLoadAttempted.current = false; // Allow retry
        }
      } else if (!isAuthenticated && !authLoading && !isInitialLoad.current) {
        // Only clear data if we've already loaded data before and auth is genuinely lost
        // This prevents clearing during registration/login operations
        console.log("🔐 Authentication lost, clearing app data");
        await clearAppData();
        dataLoadAttempted.current = false;
      }
    };

    loadDataIfNeeded();
  }, [isAuthenticated, user, authLoading, reloadInitialData, clearAppData]);

  // Save selections to encrypted storage when they change
  // Save client selection immediately (synchronously) for reliability
  // But only save when user actually changes selection, not during restoration
  useEffect(() => {
    if (selectedClient?.id && hasRestoredFromServer.current) {
      console.log(
        "💾 Saving client selection immediately:",
        selectedClient.id,
        selectedClient.name
      );
      updateAppSession({
        selectedCountry,
        selectedClientId: selectedClient.id,
        selectedClientName: selectedClient.name,
        selectedFolderId: selectedFolder?.id || null,
        selectedFolderFiscalYear: selectedFolder?.fiscalYear || undefined,
      })
        .then(() => {
          console.log("✅ Client selection saved successfully");
        })
        .catch((error) => {
          console.error("Failed to save client selection:", error);
        });
    }
  }, [
    selectedClient?.id,
    selectedClient?.name,
    updateAppSession,
    hasRestoredFromServer.current,
  ]);

  // Save other selections with debounce
  useEffect(() => {
    if (selectedCountry && !selectedClient?.id) {
      saveSelectionsToServer();
    }
  }, [selectedCountry, saveSelectionsToServer]);

  useEffect(() => {
    if (selectedFolder?.id && selectedClient?.id) {
      saveSelectionsToServer();
    }
  }, [selectedFolder?.id, selectedFolder?.fiscalYear, saveSelectionsToServer]);

  // Restore selections from encrypted storage when data is loaded
  useEffect(() => {
    if (
      clients.length > 0 &&
      folders.length > 0 &&
      !hasRestoredFromServer.current &&
      !loading
    ) {
      restoreSelectionsFromServer();
    }
  }, [clients, folders, loading, restoreSelectionsFromServer]);

  // Fallback: Auto-select first client if no selections restored
  useEffect(() => {
    const autoSelectFallback = setTimeout(() => {
      if (
        !hasRestoredFromServer.current &&
        clients.length > 0 &&
        !selectedClient &&
        !loading
      ) {
        const defaultClient = clients[0];
        console.log("🔍 Auto-selecting client:", defaultClient.name);
        setSelectedClient(defaultClient);
        setSelectedCountry(defaultClient.country);
        hasRestoredFromServer.current = true;
      }
    }, 2000); // Wait 2 seconds for encrypted storage restoration

    return () => clearTimeout(autoSelectFallback);
  }, [clients, selectedClient, loading]);

  // Auto-select ACTIVE folder when client changes or folders load
  useEffect(() => {
    if (
      selectedClient &&
      filteredFolders.length > 0 &&
      hasRestoredFromServer.current
    ) {
      // First priority: Find the ACTIVE folder (isActive: true)
      const activeFolder = filteredFolders.find((f) => f.isActive === true);

      if (activeFolder) {
        // If we have an active folder and it's not currently selected, select it
        if (!selectedFolder || selectedFolder.id !== activeFolder.id) {
          console.log(
            "🎯 Auto-selecting ACTIVE folder:",
            activeFolder.fiscalYear,
            activeFolder.name
          );
          setSelectedFolder(activeFolder);
        }
      } else if (!selectedFolder) {
        // Fallback: No active folder, select the most appropriate one
        const inProgressFolder = filteredFolders.find(
          (f) => f.status === "IN_PROGRESS"
        );
        const folderToSelect =
          inProgressFolder || currentFolder || filteredFolders[0];

        if (folderToSelect) {
          console.log(
            "🔍 Auto-selecting fallback folder:",
            folderToSelect.fiscalYear
          );
          setSelectedFolder(folderToSelect);
        }
      }
    }
  }, [selectedClient, filteredFolders, currentFolder, selectedFolder]);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Client actions with history
  const createClient = useCallback(
    async (clientData: CreateClientData): Promise<Client> => {
      try {
        const newClient = await createClientService(clientData);
        const countryName = getCountryName(clientData.country);
        addToHistory(
          "CREATE_CLIENT",
          `Nouveau client créé: ${clientData.name} (${countryName})`
        );

        // Invalidate clients cache
        secureStorageService.removeItem(STORAGE_KEYS.CLIENTS_CACHE);

        return newClient;
      } catch (err) {
        console.error("Erreur création client:", err);
        throw err;
      }
    },
    [createClientService, getCountryName, addToHistory]
  );

  const refreshClients = useCallback(async (): Promise<void> => {
    await refreshClientsService();
    addToHistory("REFRESH_CLIENTS", "Liste des clients rafraîchie");
    // Invalidate cache on refresh
    secureStorageService.removeItem(STORAGE_KEYS.CLIENTS_CACHE);
  }, [refreshClientsService, addToHistory]);

  const getClientsByCountry = useCallback(
    async (countryCode: string): Promise<Client[]> => {
      try {
        return await getClientsByCountryService(countryCode);
      } catch (err) {
        console.error("Erreur filtrage clients par pays:", err);
        throw err;
      }
    },
    [getClientsByCountryService]
  );

  const searchClients = useCallback(
    async (query: string, countryCode?: string): Promise<Client[]> => {
      try {
        return await searchClientsService(query, countryCode);
      } catch (err) {
        console.error("Erreur recherche clients:", err);
        throw err;
      }
    },
    [searchClientsService]
  );

  const getClientById = useCallback(
    async (clientId: string): Promise<Client> => {
      try {
        return await getClientByIdService(clientId);
      } catch (err) {
        console.error("Erreur récupération client:", err);
        throw err;
      }
    },
    [getClientByIdService]
  );

  const updateClient = useCallback(
    async (clientId: string, clientData: Partial<Client>): Promise<Client> => {
      try {
        const updatedClient = await updateClientService(clientId, clientData);
        addToHistory("UPDATE_CLIENT", `Client modifié: ${updatedClient.name}`);

        // Invalidate clients cache
        secureStorageService.removeItem(STORAGE_KEYS.CLIENTS_CACHE);

        return updatedClient;
      } catch (err) {
        console.error("Erreur modification client:", err);
        throw err;
      }
    },
    [updateClientService, addToHistory]
  );

  const deleteClient = useCallback(
    async (clientId: string): Promise<void> => {
      try {
        const client = clients.find((c) => c.id === clientId);
        await deleteClientService(clientId);

        if (client) {
          addToHistory("DELETE_CLIENT", `Client supprimé: ${client.name}`);

          // If the deleted client was selected, clear selection
          if (selectedClient?.id === clientId) {
            setSelectedClient(null);
            setSelectedFolder(null);
            hasRestoredFromServer.current = false;
          }

          // Invalidate clients cache
          secureStorageService.removeItem(STORAGE_KEYS.CLIENTS_CACHE);
        }
      } catch (err) {
        console.error("Erreur suppression client:", err);
        throw err;
      }
    },
    [deleteClientService, clients, selectedClient, addToHistory]
  );

  // Folder actions with history
  const createFolder = useCallback(
    async (folderData: CreateFolderData): Promise<Folder> => {
      if (!selectedClient) {
        throw new Error("Aucun client sélectionné");
      }

      try {
        const newFolder = await createFolderService(folderData);
        const clientName = selectedClient.name;
        addToHistory(
          "CREATE_FOLDER",
          `Nouveau dossier créé: ${folderData.name} pour ${clientName} (${folderData.fiscalYear})`
        );

        // Invalidate folders cache
        secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);

        return newFolder;
      } catch (err) {
        console.error("Erreur création dossier:", err);
        throw err;
      }
    },
    [createFolderService, selectedClient, addToHistory]
  );

  const closeFolder = useCallback(
    async (folderId: string): Promise<void> => {
      try {
        await closeFolderService(folderId);
        const folder = folders.find((f) => f.id === folderId);
        const client = folder
          ? clients.find((c) => c.id === folder.clientId)
          : null;

        if (folder && client) {
          addToHistory(
            "CLOSE_FOLDER",
            `Dossier ${folder.name} clôturé pour ${client.name}`
          );

          // Invalidate folders cache
          secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);
        }
      } catch (err) {
        console.error("Erreur clôture dossier:", err);
        throw err;
      }
    },
    [closeFolderService, folders, clients, addToHistory]
  );

  const refreshFolders = useCallback(async (): Promise<void> => {
    await refreshFoldersService();
    addToHistory("REFRESH_FOLDERS", "Liste des dossiers rafraîchie");
    // Invalidate folders cache
    secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);
  }, [refreshFoldersService, addToHistory]);

  const getFoldersByClient = useCallback(
    async (clientId: string): Promise<Folder[]> => {
      try {
        return await getFoldersByClientService(clientId);
      } catch (err) {
        console.error("Erreur récupération dossiers par client:", err);
        throw err;
      }
    },
    [getFoldersByClientService]
  );

  const getFolderById = useCallback(
    async (folderId: string): Promise<Folder> => {
      try {
        return await getFolderByIdService(folderId);
      } catch (err) {
        console.error("Erreur récupération dossier:", err);
        throw err;
      }
    },
    [getFolderByIdService]
  );

  const getCurrentFolder = useCallback(
    async (clientId: string): Promise<Folder | null> => {
      try {
        return await getCurrentFolderService(clientId);
      } catch (err) {
        console.error("Erreur récupération dossier actuel:", err);
        throw err;
      }
    },
    [getCurrentFolderService]
  );

  const updateFolder = useCallback(
    async (folderId: string, folderData: Partial<Folder>): Promise<Folder> => {
      try {
        const updatedFolder = await updateFolderService(folderId, folderData);

        // Invalidate folders cache
        secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);

        return updatedFolder;
      } catch (err) {
        console.error("Erreur modification dossier:", err);
        throw err;
      }
    },
    [updateFolderService]
  );

  const deleteFolder = useCallback(
    async (folderId: string): Promise<void> => {
      try {
        const folder = folders.find((f) => f.id === folderId);
        const client = folder
          ? clients.find((c) => c.id === folder.clientId)
          : null;

        await deleteFolderService(folderId);

        if (folder && client) {
          addToHistory(
            "DELETE_FOLDER",
            `Dossier ${folder.name} supprimé pour ${client.name}`
          );

          // If the deleted folder was selected, clear selection
          if (selectedFolder?.id === folderId) {
            setSelectedFolder(null);
          }

          // Invalidate folders cache
          secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);
        }
      } catch (err) {
        console.error("Erreur suppression dossier:", err);
        throw err;
      }
    },
    [deleteFolderService, folders, clients, selectedFolder, addToHistory]
  );

  // Add these methods to your existing AppContext in contexts/AppContext.tsx

  // ==================== FOLDER SERVICE INTEGRATION ====================

  /**
   * Get folder with detailed information
   */
  const getFolderWithDetails = useCallback(
    async (folderId: string): Promise<Folder> => {
      try {
        const folder = await folderService.getFolderWithDetails(folderId);
        addToHistory(
          "GET_FOLDER_DETAILS",
          `Détails chargés pour le dossier ${folder.name}`
        );
        return folder;
      } catch (error) {
        console.error("Error fetching folder details:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  /**
   * Duplicate folder for new fiscal year
   */
  const duplicateFolder = useCallback(
    async (folderId: string, newFiscalYear: number): Promise<Folder> => {
      try {
        const folder = await folderService.duplicateFolder(
          folderId,
          newFiscalYear
        );
        addToHistory(
          "DUPLICATE_FOLDER",
          `Dossier dupliqué pour l'année ${newFiscalYear}`
        );

        // Invalidate folders cache
        secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);

        return folder;
      } catch (error) {
        console.error("Error duplicating folder:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  /**
   * Get folder progress
   */
  const getFolderProgress = useCallback(
    async (folderId: string): Promise<any> => {
      try {
        return await folderService.getFolderProgress(folderId);
      } catch (error) {
        console.error("Error fetching folder progress:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Update folder status
   */
  const updateFolderStatus = useCallback(
    async (folderId: string, status: Folder["status"]): Promise<Folder> => {
      try {
        const folder = await folderService.updateFolderStatus(folderId, status);
        addToHistory(
          "UPDATE_FOLDER_STATUS",
          `Statut du dossier mis à jour: ${status}`
        );

        // Invalidate folders cache
        secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);

        return folder;
      } catch (error) {
        console.error("Error updating folder status:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  /**
   * Search folders
   */
  const searchFolders = useCallback(
    async (query: string, clientId?: string): Promise<Folder[]> => {
      try {
        return await folderService.searchFolders(query, clientId);
      } catch (error) {
        console.error("Error searching folders:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Get folder statistics
   */
  const getFolderStats = useCallback(
    async (clientId: string): Promise<{ [status: string]: number }> => {
      try {
        return await folderService.getFolderStats(clientId);
      } catch (error) {
        console.error("Error fetching folder stats:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Archive folder
   */
  const archiveFolder = useCallback(
    async (folderId: string): Promise<Folder> => {
      try {
        const folder = await folderService.archiveFolder(folderId);
        addToHistory("ARCHIVE_FOLDER", `Dossier archivé: ${folder.name}`);

        // Invalidate folders cache
        secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);

        return folder;
      } catch (error) {
        console.error("Error archiving folder:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  /**
   * Restore folder
   */
  const restoreFolder = useCallback(
    async (folderId: string): Promise<Folder> => {
      try {
        const folder = await folderService.restoreFolder(folderId);
        addToHistory("RESTORE_FOLDER", `Dossier restauré: ${folder.name}`);

        // Invalidate folders cache
        secureStorageService.removeItem(STORAGE_KEYS.FOLDERS_CACHE);

        return folder;
      } catch (error) {
        console.error("Error restoring folder:", error);
        throw error;
      }
    },
    [addToHistory]
  );

  /**
   * Get folder timeline
   */
  const getFolderTimeline = useCallback(
    async (folderId: string): Promise<any[]> => {
      try {
        return await folderService.getFolderTimeline(folderId);
      } catch (error) {
        console.error("Error fetching folder timeline:", error);
        throw error;
      }
    },
    []
  );

  // Country actions
  const searchCountries = useCallback(
    async (query: string): Promise<Country[]> => {
      try {
        const filtered = countries.filter(
          (country) =>
            country.name.toLowerCase().includes(query.toLowerCase()) ||
            country.code.toLowerCase().includes(query.toLowerCase())
        );
        return filtered;
      } catch (err) {
        console.error("Erreur recherche pays:", err);
        throw err;
      }
    },
    [countries]
  );

  const contextValue = useMemo(
    () => ({
      // Data state
      countries,
      clients,
      folders,
      loading,
      isFullyLoaded,
      error,

      // Selection state
      selectedCountry,
      setSelectedCountry,
      filteredClients,
      selectedClient,
      setSelectedClient,
      filteredFolders,
      currentFolder,
      previousFolder,
      selectedFolder,
      setSelectedFolder,

      // Client actions
      createClient,
      refreshClients,
      getClientsByCountry,
      searchClients,
      getClientById,
      updateClient,
      deleteClient,

      // Folder actions
      createFolder,
      closeFolder,
      refreshFolders,
      getFoldersByClient,
      getFolderById,
      getCurrentFolder,
      updateFolder,
      deleteFolder,

      // Enhanced Folder actions
      getFolderWithDetails,
      duplicateFolder,
      getFolderProgress,
      updateFolderStatus,
      searchFolders,
      getFolderStats,
      archiveFolder,
      restoreFolder,
      getFolderTimeline,

      // Country actions
      searchCountries,
      getCountryByCode,

      // App state
      balanceImported,
      setBalanceImported,
      balanceProcessed,
      setBalanceProcessed,
      reportsGenerated,
      setReportsGenerated,
      history,
      addToHistory,
      clearHistory,
      theme,
      setTheme,
      language,
      setLanguage,

      // Translation
      t,

      // Utility methods
      getCountryName,
      getCountryFlag,
      reloadInitialData,
      clearAppData,
      saveSelectionsToServer,
      restoreSelectionsFromServer,

      // Session management
      getAppSession,
      saveAppSession,
      updateAppSession,
      clearSession,
      getLastSelectedInfo,

      // Service integration
      uploadBalance,
      getBalancesByFolder,
      importDSF,
    }),
    [
      countries,
      clients,
      folders,
      loading,
      isFullyLoaded,
      error,
      selectedCountry,
      filteredClients,
      selectedClient,
      filteredFolders,
      currentFolder,
      previousFolder,
      selectedFolder,
      createClient,
      refreshClients,
      getClientsByCountry,
      searchClients,
      getClientById,
      updateClient,
      deleteClient,
      createFolder,
      closeFolder,
      refreshFolders,
      getFoldersByClient,
      getFolderById,
      getCurrentFolder,
      updateFolder,
      deleteFolder,
      getFolderWithDetails,
      duplicateFolder,
      getFolderProgress,
      updateFolderStatus,
      searchFolders,
      getFolderStats,
      archiveFolder,
      restoreFolder,
      getFolderTimeline,
      searchCountries,
      getCountryByCode,
      balanceImported,
      balanceProcessed,
      reportsGenerated,
      history,
      addToHistory,
      clearHistory,
      theme,
      language,
      t,
      getCountryName,
      getCountryFlag,
      reloadInitialData,
      clearAppData,
      saveSelectionsToServer,
      restoreSelectionsFromServer,
      getAppSession,
      saveAppSession,
      updateAppSession,
      clearSession,
      uploadBalance,
      getBalancesByFolder,
      importDSF,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
