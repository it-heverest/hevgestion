// components/AllReports.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Loader2,
  Search,
  Wand2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  RefreshCw,
} from "lucide-react";
import { validateExcelFile } from "../utils/filevalidation";
import {
  FileSelector,
  ProcessingView,
  SuccessView,
  ErrorView,
  extractAllNotesFromFile,
  type ExtractionResult,
} from "./DSF/uploadSteps";
import { ReportsView } from "./DSF/ReportsView";
import { useApp } from "../contexts/AppContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type MainStep =
  | "search" // Client search input
  | "checking" // Verifying DSF + balances
  | "no_dsf" // Client found, no DSF → show options
  | "upload" // Upload DSF file
  | "processing" // Extraction in progress
  | "success" // Brief success screen
  | "reports" // Display extracted reports
  | "error";

interface BalanceStatus {
  hasCurrentYear: boolean; // Balance N
  hasPreviousYear: boolean; // Balance N-1
}

interface AllReportsProps {
  /** Optional: if provided, skip client search and jump straight to checking */
  folderId?: string;
  checkExistingDSF?: (folderId: string) => Promise<ExtractionResult[] | null>;
  onNormalGeneration?: () => void;
  className?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const STEP_ORDER: MainStep[] = [
  "search",
  "checking",
  "no_dsf",
  "upload",
  "processing",
  "success",
  "reports",
  "error",
];
const stepIndex = (s: MainStep) => STEP_ORDER.indexOf(s);

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepDot: React.FC<{ active: boolean; done: boolean; label: string }> = ({
  active,
  done,
  label,
}) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
        done
          ? "bg-emerald-500 text-white"
          : active
            ? "bg-blue-600 text-white ring-4 ring-blue-100"
            : "bg-gray-100 text-gray-400"
      }`}
    >
      {done && <CheckCircle2 className="w-4 h-4" />}
    </div>
    <span
      className={`text-[11px] font-medium ${active ? "text-blue-600" : done ? "text-emerald-600" : "text-gray-400"}`}
    >
      {label}
    </span>
  </div>
);

const Connector: React.FC<{ done: boolean }> = ({ done }) => (
  <div
    className={`flex-1 h-0.5 mt-3.5 transition-colors duration-500 ${done ? "bg-emerald-400" : "bg-gray-200"}`}
  />
);

const OptionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
}> = ({
  icon,
  title,
  description,
  badge,
  badgeColor = "bg-blue-100 text-blue-700",
  disabled,
  disabledReason,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
      disabled
        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
        : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-50 cursor-pointer"
    }`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-400"
            : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
          {description}
        </p>
        {disabled && disabledReason && (
          <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {disabledReason}
          </p>
        )}
      </div>
      {!disabled && (
        <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-blue-500 mt-3 transition-colors" />
      )}
    </div>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const AllReports: React.FC<AllReportsProps> = ({
  folderId: propFolderId,
  checkExistingDSF,
  onNormalGeneration,
  className = "",
}) => {
  // ── AppContext ──────────────────────────────────────────────────────────────
  const {
    searchClients,
    selectedClient,
    setSelectedClient,
    selectedFolder,
    setSelectedFolder,
    currentFolder, // Balance N: active/in-progress folder (computed in context)
    previousFolder, // Balance N-1: latest completed folder (computed in context)
    filteredFolders,
    getBalancesByFolder,
    getFoldersByClient,
  } = useApp();

  // ── Local state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<MainStep>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [clientNotFound, setClientNotFound] = useState(false);

  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus | null>(
    null,
  );
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionResults, setExtractionResults] = useState<
    ExtractionResult[]
  >([]);
  const [processingNote, setProcessingNote] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null!);

  // Effective folder ID: prop > context
  const activeFolderId = propFolderId ?? selectedFolder?.id;

  // ── Effects ─────────────────────────────────────────────────────────────────

  // If folderId is pre-supplied, skip search entirely
  useEffect(() => {
    if (propFolderId) {
      runCheck(propFolderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propFolderId]);

  // ── Core check logic ──────────────────────────────────────────────────────────

  const runCheck = useCallback(
    async (folderId: string) => {
      setStep("checking");
      setErrorMessage(null);

      // 1. Check for existing DSF
      if (checkExistingDSF) {
        try {
          const existing = await checkExistingDSF(folderId);
          if (existing && existing.length > 0) {
            setExtractionResults(existing);
            setStep("reports");
            return;
          }
        } catch {
          // fall through
        }
      }

      // 2. No DSF found — check balances via AppContext
      setIsLoadingBalances(true);
      try {
        const balancesResponse = await getBalancesByFolder(folderId);

        // Derive hasCurrentYear / hasPreviousYear.
        // The API may return an array or { current, previous } object.
        // We also fall back to AppContext's currentFolder / previousFolder
        // which are already computed based on folder status + fiscalYear.
        let hasCurrentYear = false;
        let hasPreviousYear = false;

        if (Array.isArray(balancesResponse)) {
          const currentFY = currentFolder?.fiscalYear;
          const previousFY = previousFolder?.fiscalYear;
          hasCurrentYear = balancesResponse.some(
            (b: any) =>
              b.fiscalYear === currentFY ||
              b.year === currentFY ||
              b.type === "N" ||
              b.period === "current",
          );
          hasPreviousYear = balancesResponse.some(
            (b: any) =>
              b.fiscalYear === previousFY ||
              b.year === previousFY ||
              b.type === "N-1" ||
              b.period === "previous",
          );
        } else if (balancesResponse && typeof balancesResponse === "object") {
          hasCurrentYear = !!balancesResponse.current;
          hasPreviousYear = !!balancesResponse.previous;
        }

        // Authoritative fallback: use AppContext's pre-computed folders
        if (!hasCurrentYear && !hasPreviousYear) {
          hasCurrentYear = !!currentFolder;
          hasPreviousYear = !!previousFolder;
        }

        setBalanceStatus({ hasCurrentYear, hasPreviousYear });
      } catch {
        // Fallback entirely to context-derived state
        setBalanceStatus({
          hasCurrentYear: !!currentFolder,
          hasPreviousYear: !!previousFolder,
        });
      } finally {
        setIsLoadingBalances(false);
        setStep("no_dsf");
      }
    },
    [checkExistingDSF, getBalancesByFolder, currentFolder, previousFolder],
  );

  // ── Search ────────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearching(true);
    setClientNotFound(false);
    setSearchResults([]);
    try {
      const results = await searchClients(query);
      if (!results || results.length === 0) {
        setClientNotFound(true);
      } else if (results.length === 1) {
        await handleSelectClient(results[0]);
      } else {
        setSearchResults(results);
      }
    } catch {
      setClientNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectClient = async (client: any) => {
    setSelectedClient(client);
    setSearchResults([]);

    // Resolve the best folder for this client
    let folderId: string | undefined;
    try {
      const clientFolders = await getFoldersByClient(client.id);
      const chosen =
        clientFolders.find((f: any) => f.isActive) ??
        clientFolders.find((f: any) => f.status === "IN_PROGRESS") ??
        clientFolders[0];
      if (chosen) {
        setSelectedFolder(chosen);
        folderId = chosen.id;
      }
    } catch {
      // Fallback to already-loaded filteredFolders
      const fallback = filteredFolders.find((f) => f.clientId === client.id);
      if (fallback) {
        setSelectedFolder(fallback);
        folderId = fallback.id;
      }
    }

    if (folderId) {
      await runCheck(folderId);
    } else {
      setBalanceStatus({ hasCurrentYear: false, hasPreviousYear: false });
      setStep("no_dsf");
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setErrorMessage(null);
      return;
    }
    const validation = validateExcelFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Fichier invalide");
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Aucun fichier sélectionné");
      return;
    }
    if (!activeFolderId) {
      setErrorMessage("Aucun dossier sélectionné");
      return;
    }
    try {
      setStep("processing");
      setUploadProgress(0);
      setProcessingNote("Vérification du fichier...");
      setUploadProgress(5);
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(10);
      setProcessingNote("Extraction des données...");
      const results = await extractAllNotesFromFile(
        selectedFile,
        activeFolderId,
        (progress, note) => {
          setUploadProgress(progress);
          setProcessingNote(note);
        },
      );
      setExtractionResults(results);
      if (results.filter((r) => r.success).length === 0) {
        throw new Error("Aucune donnée n'a pu être extraite du fichier.");
      }
      setUploadProgress(100);
      setStep("success");
      setTimeout(() => setStep("reports"), 1800);
    } catch (error: any) {
      setErrorMessage(error.message || "Erreur lors du traitement");
      setStep("error");
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setStep("search");
    setSearchQuery("");
    setSearchResults([]);
    setClientNotFound(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage(null);
    setExtractionResults([]);
    setProcessingNote(null);
    setBalanceStatus(null);
    if (!propFolderId) {
      setSelectedClient(null);
      setSelectedFolder(null);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const canGenerate =
    !!balanceStatus?.hasCurrentYear && !!balanceStatus?.hasPreviousYear;

  const generateDisabledReason = balanceStatus
    ? !balanceStatus.hasCurrentYear && !balanceStatus.hasPreviousYear
      ? "Balances N et N-1 manquantes."
      : !balanceStatus.hasCurrentYear
        ? "Balance N (exercice en cours) manquante."
        : "Balance N-1 (exercice précédent) manquante."
    : "Impossible de vérifier les balances.";

  const progressSteps: { key: MainStep; label: string }[] = [
    { key: "search", label: "Recherche" },
    { key: "checking", label: "Vérification" },
    { key: "no_dsf", label: "Options" },
    { key: "reports", label: "Rapports" },
  ];

  // ── Render: full reports ────────────────────────────────────────────────────

  if (step === "reports" && extractionResults.length > 0) {
    return (
      <div className={className}>
        <ReportsView
          extractionResults={extractionResults}
          onNewUpload={handleReset}
          onClose={handleReset}
          onNormalGeneration={onNormalGeneration ?? (() => {})}
          folderId={activeFolderId}
          checkExistingDSF={checkExistingDSF}
        />
      </div>
    );
  }

  // ── Render: main card ───────────────────────────────────────────────────────

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 tracking-tight">
              DSF &amp; Rapports
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {step === "search"
                ? "Recherchez un client pour accéder à ses déclarations."
                : selectedClient
                  ? `Client : ${selectedClient.name}`
                  : "Vérification en cours..."}
            </p>
          </div>
          {step !== "search" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Progress dots */}
        {step !== "search" && step !== "error" && (
          <div className="mt-5 flex items-center">
            {progressSteps.map((s, i) => {
              const uploadSteps: MainStep[] = [
                "upload",
                "processing",
                "success",
              ];
              const isActive =
                step === s.key ||
                (s.key === "no_dsf" && uploadSteps.includes(step));
              const isDone =
                stepIndex(step) > stepIndex(s.key) ||
                (s.key === "no_dsf" &&
                  ["processing", "success", "reports"].includes(step));
              return (
                <React.Fragment key={s.key}>
                  <StepDot label={s.label} active={isActive} done={isDone} />
                  {i < progressSteps.length - 1 && <Connector done={isDone} />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {/* SEARCH */}
        {step === "search" && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setClientNotFound(false);
                  setSearchResults([]);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nom ou identifiant du client..."
                className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg outline-none transition-all ${
                  clientNotFound
                    ? "border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50"
                    : "border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                }`}
              />
            </div>

            {/* Multiple results dropdown */}
            {searchResults.length > 1 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 shadow-sm">
                {searchResults.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {client.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {client.legalForm} · {client.country}
                        {client.taxNumber ? ` · ${client.taxNumber}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            )}

            {clientNotFound && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Aucun client trouvé. Vérifiez l&apos;identifiant et réessayez.
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isSearching ? "Recherche en cours..." : "Rechercher"}
            </button>
          </div>
        )}

        {/* CHECKING */}
        {step === "checking" && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-700">
              {isLoadingBalances
                ? "Vérification des balances disponibles..."
                : "Recherche des déclarations existantes..."}
            </p>
          </div>
        )}

        {/* NO DSF — Two options */}
        {step === "no_dsf" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Aucune DSF trouvée pour{" "}
                <strong>{selectedClient?.name ?? "ce client"}</strong>.
                Choisissez une option&nbsp;:
              </span>
            </div>

            <div className="grid gap-3">
              <OptionCard
                icon={<Upload className="w-5 h-5" />}
                title="Importer un fichier DSF"
                description="Chargez un fichier Excel (.xls / .xlsx) contenant les données DSF. Les notes annexes seront extraites automatiquement."
                badge="Manuel"
                badgeColor="bg-gray-100 text-gray-600"
                onClick={() => setStep("upload")}
              />
              <OptionCard
                icon={<Wand2 className="w-5 h-5" />}
                title="Générer la DSF automatiquement"
                description="Génération automatique à partir des balances comptables N et N-1 déjà importées dans le système."
                badge={canGenerate ? "Disponible" : "Indisponible"}
                badgeColor={
                  canGenerate
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }
                disabled={!canGenerate}
                disabledReason={
                  !canGenerate ? generateDisabledReason : undefined
                }
                onClick={() => onNormalGeneration?.()}
              />
            </div>

            {/* Balance status panel */}
            {balanceStatus !== null && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
                <div className="flex items-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    État des balances
                  </p>
                  <button
                    onClick={() => activeFolderId && runCheck(activeFolderId)}
                    className="ml-auto text-gray-400 hover:text-blue-500 transition-colors"
                    title="Rafraîchir"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-6">
                  {[
                    {
                      label: "Balance N",
                      ok: balanceStatus.hasCurrentYear,
                      sub: currentFolder
                        ? `Exercice ${currentFolder.fiscalYear}`
                        : undefined,
                    },
                    {
                      label: "Balance N-1",
                      ok: balanceStatus.hasPreviousYear,
                      sub: previousFolder
                        ? `Exercice ${previousFolder.fiscalYear}`
                        : undefined,
                    },
                  ].map(({ label, ok, sub }) => (
                    <div key={label} className="flex items-start gap-2 text-xs">
                      <span
                        className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${ok ? "bg-emerald-400" : "bg-red-400"}`}
                      />
                      <div>
                        <span className="text-gray-600">{label} </span>
                        <span
                          className={`font-medium ${ok ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {ok ? "Présente" : "Manquante"}
                        </span>
                        {sub && <p className="text-gray-400 mt-0.5">{sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD */}
        {step === "upload" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("no_dsf")}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Retour aux options
            </button>
            <FileSelector
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              errorMessage={errorMessage}
              fileInputRef={fileInputRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMessage(null);
                }}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Effacer
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Extraire les données
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {step === "processing" && (
          <ProcessingView
            uploadProgress={uploadProgress}
            processingNote={processingNote}
            extractionResults={extractionResults}
          />
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <SuccessView extractionResults={extractionResults} />
        )}

        {/* ERROR */}
        {step === "error" && (
          <ErrorView
            errorMessage={errorMessage}
            onClose={handleReset}
            onRetry={() => {
              setStep("upload");
              setErrorMessage(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
