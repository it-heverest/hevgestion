import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  RefreshCw,
  Play,
  Filter,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  MoreHorizontal,
  Calendar,
  Hash,
  LayoutList,
  AlertTriangle,
  FileText,
  X,
  Save,
  Edit3,
  Check,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { clientService } from "../services/client.service";
import * as XLSX from "xlsx";

import { BalanceRow, normalizeRow } from "../types/balance.types";

type OriginalDataType = 
  | { rows: BalanceRow[] }
  | BalanceRow[]
  | string;

interface BalanceData {
  id: string;
  type: string;
  period: string;
  fileName: string;
  status: string;
  originalData: OriginalDataType;
  equilibrium?: {
    isBalanced: boolean;
    totalDebit: number;
    totalCredit: number;
    difference: number;
  };
  importedAt: string;
}

const parseExcelFilePreview = async (
  file: File,
): Promise<{
  headers: string[];
  rows: string[][];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        if (!data) {
          reject(new Error("Erreur de lecture du fichier"));
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          defval: "",
        }) as string[][];

        if (jsonData.length === 0) {
          reject(new Error("Fichier vide"));
          return;
        }

        const headers = jsonData[0].map((h) => String(h).trim());
        const rows = jsonData
          .slice(1, 11)
          .map((row) => row.map((cell) => String(cell).trim()));

        resolve({ headers, rows });
      } catch (err) {
        reject(new Error("Erreur de lecture du fichier"));
      }
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsArrayBuffer(file);
  });
};

const validateBalanceFile = (preview: {
  headers: string[];
  rows: string[][];
}): string[] => {
  const errors: string[] = [];

  if (preview.headers.length < 8) {
    errors.push(
      `Nombre de colonnes insuffisant: ${preview.headers.length} colonnes détectées (8 minimum attendues)`,
  );
}

  if (preview.rows.length > 0) {
    preview.rows.forEach((row, idx) => {
      const accountNum = row[0]?.trim().replace(/[^0-9]/g, "") || "";
      const nameCell = row[1]?.trim() || "";
      
      const numericCols = row.slice(2).map(c => {
        const cleaned = c?.trim().replace(/[^0-9.-]/g, "");
        return cleaned === "" || cleaned === "-" ? null : parseFloat(cleaned);
      });
      const hasNumericData = numericCols.some(v => v !== null && v !== 0);
      
      if (accountNum) {
        if (!/^[1-8]\d{2,}$/.test(accountNum)) {
          errors.push(`Ligne ${idx + 2}: Compte "${accountNum}" invalide`);
        }
      }
      
      if (!accountNum && !nameCell && !hasNumericData) {
        return;
      }
      
      if (accountNum && !nameCell) {
        errors.push(`Ligne ${idx + 2}: Libellé de compte manquant`);
      }
      
      for (let colIdx = 2; colIdx < Math.min(row.length, 10); colIdx++) {
        const cellVal = row[colIdx]?.trim();
        const cleaned = cellVal?.replace(/[^0-9.-]/g, "") || "";
        if (cellVal && cellVal !== "-" && cellVal !== "" && cleaned !== "" && isNaN(parseFloat(cleaned))) {
          errors.push(`Ligne ${idx + 2}: Valeur numérique invalide dans la colonne ${colIdx + 1}`);
        }
      }
    });
  }

  return errors;
};

export function BalanceImporter() {
  const { userId } = useParams<{ userId: string }>();
  const { selectedFolder } = useApp();

  const [balances, setBalances] = useState<BalanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importBalanceType, setImportBalanceType] = useState<
    "current" | "previous"
  >("current");
  const [selectedBalance, setSelectedBalance] = useState<BalanceData | null>(
    null,
  );
  const [showMissingPreviousAlert, setShowMissingPreviousAlert] =
    useState(false);
  const [pendingUpload, setPendingUpload] = useState(false);

  const effectiveFolderId = selectedFolder?.id || userId;
  const fiscalYear = selectedFolder?.fiscalYear || new Date().getFullYear();
  const previousYear = fiscalYear - 1;

  useEffect(() => {
    if (effectiveFolderId) {
      loadBalances();
    }
  }, [effectiveFolderId]);

  const loadBalances = async () => {
    if (!effectiveFolderId) return;
    setIsLoading(true);
    try {
      const response =
        await clientService.getBalancesByFolder(effectiveFolderId);

      let balancesList = response?.balances || response?.data?.balances || [];

      // Handle case where originalData is a JSON string
      balancesList = balancesList.map((b: any) => {
        let originalData = b.originalData;
        if (typeof originalData === 'string') {
          try {
            originalData = JSON.parse(originalData);
          } catch (e) {
            console.error('Failed to parse originalData:', e);
            originalData = null;
          }
        }
        return { ...b, originalData };
      });


      setBalances(balancesList);
    } catch (error) {
      console.error("Error loading balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentBalance = async () => {
    if (!selectedBalance || !effectiveFolderId) return;

    setIsRefreshing(true);
    try {
      // Recharger toutes les balances pour s'assurer d'avoir les données à jour
      const response = await clientService.getBalancesByFolder(effectiveFolderId);
      let balancesList = response?.balances || response?.data?.balances || [];

      // Parser les données comme dans loadBalances
      balancesList = balancesList.map((b: any) => {
        let originalData = b.originalData;
        if (typeof originalData === 'string') {
          try {
            originalData = JSON.parse(originalData);
          } catch (e) {
            console.error('Failed to parse originalData:', e);
            originalData = null;
          }
        }
        return { ...b, originalData };
      });

      // Mettre à jour la liste des balances
      setBalances(balancesList);

      // Mettre à jour la balance sélectionnée avec les nouvelles données
      const updatedBalance = balancesList.find(b => b.id === selectedBalance.id);
      if (updatedBalance) {
        setSelectedBalance(updatedBalance);
      }

      // Recharger aussi la balance précédente si elle existe
      if (previousYearBalance) {
        const updatedPrevious = balancesList.find(b => b.id === previousYearBalance.id);
        if (updatedPrevious) {
          setPreviousYearBalance(updatedPrevious);
        }
      }

      console.log("Balance refreshed successfully");
    } catch (error) {
      console.error("Error refreshing balance:", error);
      // En cas d'erreur, on recharge complètement
      await loadBalances();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBalanceImported = (balance: BalanceData) => {
    setShowImportDialog(false);
    setPendingUpload(false);
    loadBalances();
  };

  const handleBalanceDeleted = async (balanceId: string) => {
    try {
      await clientService.deleteBalance(balanceId);
      setSelectedBalance(null);
      loadBalances();
    } catch (err: any) {
      console.error("Error deleting balance:", err);
      alert(err.message || "Erreur lors de la suppression de la balance");
    }
  };

  // Get current and previous year balances (using type field)
  const currentYearBalance = balances.find(
    (b) => b.type?.toUpperCase() === "CURRENT_YEAR",
  );
  const previousYearBalance = balances.find(
    (b) => b.type?.toUpperCase() === "PREVIOUS_YEAR",
  );

  const openImportDialog = (type: "current" | "previous") => {
    setImportBalanceType(type);

    // If importing current year (N), check if N-1 exists
    if (type === "current" && !previousYearBalance) {
      setShowMissingPreviousAlert(true);
      return;
    }

    setShowImportDialog(true);
  };

  const confirmImportDespiteMissingPrevious = () => {
    setShowMissingPreviousAlert(false);
    setShowImportDialog(true);
  };

  const hasCurrentYear = !!currentYearBalance;
  const hasPreviousYear = !!previousYearBalance;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Balance comptable
              </h1>
              <p className="text-sm text-gray-500">Exercice {fiscalYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Button for N-1 */}
            <Button
              onClick={() => openImportDialog("previous")}
              variant={hasPreviousYear ? "outline" : "default"}
              className={
                hasPreviousYear ? "" : "bg-green-600 hover:bg-green-700"
              }
              title={
                hasPreviousYear
                  ? "Balance N-1 déjà importée"
                  : `Importer Balance N-1 (${previousYear})`
              }
            >
              {hasPreviousYear ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  N-1 ({previousYear})
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  N-1 ({previousYear})
                </>
              )}
            </Button>

            {/* Button for N */}
            <Button
              onClick={() => openImportDialog("current")}
              variant={hasCurrentYear ? "outline" : "default"}
              className={hasCurrentYear ? "" : "bg-blue-600 hover:bg-blue-700"}
              title={
                hasCurrentYear
                  ? "Balance N déjà importée"
                  : `Importer Balance N (${fiscalYear})`
              }
            >
              {hasCurrentYear ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />N (
                  {fiscalYear})
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />N ({fiscalYear})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : balances.length === 0 ? (
          <EmptyState onImport={() => openImportDialog("current")} />
        ) : (
          <div className="flex flex-col h-full gap-4">
            {/* Balance List - Horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {balances.map((balance) => (
                <BalanceListItem
                  key={balance.id}
                  balance={balance}
                  isSelected={selectedBalance?.id === balance.id}
                  onClick={() => setSelectedBalance(balance)}
                  onDelete={() => handleBalanceDeleted(balance.id)}
                />
              ))}
            </div>

            {/* Balance Details - Full Width */}
            <div className="flex-1 min-h-0">
              {selectedBalance ? (
                <BalanceDetailView
                  balance={selectedBalance}
                  previousYearBalance={previousYearBalance}
                  onDelete={() => handleBalanceDeleted(selectedBalance.id)}
                  onRefresh={refreshCurrentBalance}
                  isRefreshing={isRefreshing}
                  onReimport={() => {
                    handleBalanceDeleted(selectedBalance.id);
                    openImportDialog(
                      selectedBalance.type === "PREVIOUS_YEAR"
                        ? "previous"
                        : "current",
                    );
                  }}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    Sélectionnez une balance pour voir les détails
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Missing N-1 Alert Dialog */}
      <Dialog
        open={showMissingPreviousAlert}
        onOpenChange={setShowMissingPreviousAlert}
        style={{ width: "50%" }}
      >
        <DialogContent className="w-[50vw] max-w-[50vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Balance N-1 manquante
            </DialogTitle>
            <DialogDescription className="mt-2">
              La balance de l'exercice précédent (N-1 : {previousYear}) n'a pas
              été importée. Pour une meilleure précision, il est recommandé
              d'importer d'abord la balance N-1 car le système vérifiera que les
              soldes de clôture N-1 correspondent aux soldes d'ouverture N.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-2">
            <p className="text-sm text-orange-800">
              Voulez-vous continuer quand même ?
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowMissingPreviousAlert(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={confirmImportDespiteMissingPrevious}
              className="bg-blue-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer quand même
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        style={{ width: "60%" }}
      >
        <DialogContent className="w-[60vw] max-w-[60vw]">
          <DialogHeader>
            <DialogTitle>
              Importer la balance{" "}
              {importBalanceType === "current"
                ? `N (${fiscalYear})`
                : `N-1 (${previousYear})`}
            </DialogTitle>
            <DialogDescription>
              Importez votre balance comptable au format Excel
            </DialogDescription>
          </DialogHeader>
          <BalanceImportForm
            folderId={effectiveFolderId || ""}
            balanceType={importBalanceType}
            onSuccess={handleBalanceImported}
            onCancel={() => setShowImportDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center justify-center h-full py-16">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <FileSpreadsheet className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune balance importée
        </h3>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          Importez votre balance comptable pour procéder à la ventilation et
          générer les états financiers.
        </p>
        <Button onClick={onImport} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Importer une balance
        </Button>
      </CardContent>
    </Card>
  );
}

function BalanceListItem({
  balance,
  isSelected,
  onClick,
  onDelete,
}: {
  balance: BalanceData;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getBalanceRows = (balance: BalanceData): BalanceRow[] => {
    if (!balance.originalData) return [];
    
    let data = balance.originalData;
    
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse originalData:', e);
        return [];
      }
    }
    
    if (data && typeof data === 'object' && 'rows' in data) {
      return data.rows as BalanceRow[];
    }
    if (Array.isArray(data)) {
      return data as BalanceRow[];
    }
    return [];
  };

  const rows = getBalanceRows(balance);
  const totalDebit = rows.reduce((sum, r) => sum + (r.closingDebit || 0), 0);
  const totalCredit = rows.reduce((sum, r) => sum + (r.closingCredit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Determine if balance is N or N-1 based on type
  const balanceTypeUpper = balance.type?.toUpperCase() || "";
  const isCurrentYear = balanceTypeUpper === "CURRENT_YEAR";
  const isPreviousYear = balanceTypeUpper === "PREVIOUS_YEAR";
  const balanceTypeLabel = isPreviousYear
    ? "N-1"
    : isCurrentYear
      ? "N"
      : balance.period || "N";

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <Card
      className={`flex-shrink-0 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "hover:bg-gray-50 hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {balanceTypeLabel}
            </span>
            <Badge
              variant={isBalanced ? "default" : "destructive"}
              className={`text-xs ${isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {isBalanced ? "Équilibrée" : "Déséquilibrée"}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {rows.length} comptes • {totalDebit.toLocaleString()} D /{" "}
            {totalCredit.toLocaleString()} C
          </p>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowMenu(false);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Editable Cell Component for Inline Editing
function EditableCell({
  accountNumber,
  value,
  isEditing,
  field,
  onCellEdit,
  onStartEdit,
  className = "",
}: {
  accountNumber: string;
  value: number;
  isEditing: boolean;
  field: keyof Pick<BalanceRow, 'openingDebit' | 'openingCredit' | 'movementDebit' | 'movementCredit'>;
  onCellEdit: (accountNumber: string, field: string, value: number) => void;
  onStartEdit: () => void;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  if (isEditing) {
    return (
      <TableCell className={`relative ${className}`}>
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            onCellEdit(accountNumber, field, parseFloat(newValue) || 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              // Ctrl+Enter to apply all cached changes for this account
              const target = e.target as HTMLInputElement;
              target.blur(); // Trigger blur to save
            }
          }}
          className="w-full h-8 text-right font-mono border-blue-300 focus:border-blue-500 focus:ring-blue-200"
          autoFocus
          step="0.01"
          min="0"
          placeholder="0"
          title="Ctrl+Enter pour appliquer"
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      className={`font-mono cursor-pointer hover:bg-blue-50 transition-colors ${className}`}
      onClick={onStartEdit}
    >
      {value > 0 ? (
        <span className="font-medium text-gray-900">
          {value.toLocaleString()}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </TableCell>
  );
}

function BalanceDetailView({
  balance,
  previousYearBalance,
  onDelete,
  onReimport,
  onRefresh,
  isRefreshing = false,
}: {
  balance: BalanceData;
  previousYearBalance?: BalanceData;
  onDelete: () => void;
  onReimport: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof BalanceRow>("accountNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedClass, setSelectedClass] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOpeningMismatch, setShowOpeningMismatch] = useState(false);
  const [openingMismatches, setOpeningMismatches] = useState<
    { account: string; name: string; n1Closing: number; nOpening: number }[]
  >([]);
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{
    openingDebit: number;
    openingCredit: number;
    movementDebit: number;
    movementCredit: number;
    closingDebit: number;
    closingCredit: number;
  } | null>(null);
  const [modifiedRows, setModifiedRows] = useState<{
    [key: string]: BalanceRow;
  }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cache for temporary edits (not yet applied to modifiedRows)
  const [editCache, setEditCache] = useState<{
    [accountNumber: string]: {
      openingDebit?: number;
      openingCredit?: number;
      movementDebit?: number;
      movementCredit?: number;
    };
  }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const getBalanceRows = (balance: BalanceData): BalanceRow[] => {
    if (!balance.originalData) return [];
    
    let data = balance.originalData;
    
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse originalData:', e);
        return [];
      }
    }
    
    if (data && typeof data === 'object' && 'rows' in data) {
      return data.rows as BalanceRow[];
    }
    if (Array.isArray(data)) {
      return data as BalanceRow[];
    }
    return [];
  };

  const balanceRows = getBalanceRows(balance);
  const previousYearRows = previousYearBalance
    ? getBalanceRows(previousYearBalance)
    : [];
  
  // Calculate accounts with opening balance issues
  const accountsWithIssues = useMemo(() => {
    if (!previousYearBalance || previousYearRows.length === 0)
      return new Set<string>();

    const issues = new Set<string>();

    // Create a map of previous year accounts by account number
    const previousYearAccounts: {
      [key: string]: { debit: number; credit: number };
    } = {};
    previousYearRows.forEach((row) => {
      const accNum = row.accountNumber?.trim() || "";
      if (accNum) {
        previousYearAccounts[accNum] = {
          debit: row.closingDebit || 0,
          credit: row.closingCredit || 0,
        };
      }
    });

    // Check each account in current year - only flag if account existed in N-1
    // and the opening balance doesn't match the previous closing
    balanceRows.forEach((row) => {
      const accNum = row.accountNumber?.trim() || "";
      if (!accNum) return;
      
      const prevData = previousYearAccounts[accNum];
      if (prevData) {
        const prevClosing = prevData.debit - prevData.credit;
        const currentOpening = (row.openingDebit || 0) - (row.openingCredit || 0);

        if (Math.abs(prevClosing - currentOpening) > 0.01) {
          issues.add(accNum);
        }
      }
    });

    return issues;
  }, [balanceRows, previousYearRows, previousYearBalance]);

  const getAllRowsWithModifications = (): BalanceRow[] => {
    return balanceRows.map((row) => {
      const hasModification = !!modifiedRows[row.accountNumber];
      const openingDebit = hasModification
        ? (modifiedRows[row.accountNumber].openingDebit ??
          row.openingDebit ??
          0)
        : (row.openingDebit ?? 0);
      const openingCredit = hasModification
        ? (modifiedRows[row.accountNumber].openingCredit ??
          row.openingCredit ??
          0)
        : (row.openingCredit ?? 0);
      const movementDebit = hasModification
        ? (modifiedRows[row.accountNumber].movementDebit ??
          row.movementDebit ??
          0)
        : (row.movementDebit ?? 0);
      const movementCredit = hasModification
        ? (modifiedRows[row.accountNumber].movementCredit ??
          row.movementCredit ??
          0)
        : (row.movementCredit ?? 0);
      // Use closing balances as imported from Excel, don't recalculate
      const closingDebit = hasModification
        ? (modifiedRows[row.accountNumber].closingDebit ??
          row.closingDebit ??
          0)
        : (row.closingDebit ?? 0);
      const closingCredit = hasModification
        ? (modifiedRows[row.accountNumber].closingCredit ??
          row.closingCredit ??
          0)
        : (row.closingCredit ?? 0);

      return {
        accountNumber: row.accountNumber,
        accountName: row.accountName,
        openingDebit,
        openingCredit,
        movementDebit,
        movementCredit,
        closingDebit,
        closingCredit,
      };
    });
  };

  const allRowsModified = getAllRowsWithModifications();
  const totals = allRowsModified.reduce(
    (acc, row) => ({
      openingDebit: acc.openingDebit + (row.openingDebit || 0),
      openingCredit: acc.openingCredit + (row.openingCredit || 0),
      movementDebit: acc.movementDebit + (row.movementDebit || 0),
      movementCredit: acc.movementCredit + (row.movementCredit || 0),
      closingDebit: acc.closingDebit + (row.closingDebit || 0),
      closingCredit: acc.closingCredit + (row.closingCredit || 0),
    }),
    {
      openingDebit: 0,
      openingCredit: 0,
      movementDebit: 0,
      movementCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
  );

  const isBalanced =
    Math.abs(totals.closingDebit - totals.closingCredit) < 0.01;

  // Check opening balance matches previous year closing (group by first 3 digits)
  const checkOpeningBalance = () => {
    if (!previousYearBalance || previousYearRows.length === 0) return;

    // Group previous year by first 3 digits - aggregate all accounts under same root
    const previousYearByRoot: {
      [key: string]: { debit: number; credit: number };
    } = {};
    previousYearRows.forEach((row) => {
      const root = row.accountNumber?.substring(0, 3) || "";
      if (!previousYearByRoot[root]) {
        previousYearByRoot[root] = { debit: 0, credit: 0 };
      }
      previousYearByRoot[root].debit += row.closingDebit || 0;
      previousYearByRoot[root].credit += row.closingCredit || 0;
    });

    // Group current year opening by first 3 digits - aggregate all accounts under same root
    const currentYearByRoot: {
      [key: string]: { debit: number; credit: number };
    } = {};
    balanceRows.forEach((row) => {
      const root = row.accountNumber?.substring(0, 3) || "";
      if (!currentYearByRoot[root]) {
        currentYearByRoot[root] = { debit: 0, credit: 0 };
      }
      currentYearByRoot[root].debit += row.openingDebit || 0;
      currentYearByRoot[root].credit += row.openingCredit || 0;
    });

    // Compare sums by root and identify specific accounts with issues
    const mismatches: {
      root: string;
      n1ClosingDebit: number;
      n1ClosingCredit: number;
      n1ClosingNet: number;
      nOpeningDebit: number;
      nOpeningCredit: number;
      nOpeningNet: number;
      difference: number;
      accounts: {
        account: string;
        name: string;
        closingN1: number;
        openingN: number;
      }[];
    }[] = [];

    Object.keys(currentYearByRoot).forEach((root) => {
      const prevData = previousYearByRoot[root];
      if (prevData) {
        const prevClosingNet = prevData.debit - prevData.credit;
        const currentOpeningNet =
          currentYearByRoot[root].debit - currentYearByRoot[root].credit;

        if (Math.abs(prevClosingNet - currentOpeningNet) > 0.01) {
          // Find individual accounts in this root that have differences
          const problemAccounts: {
            account: string;
            name: string;
            closingN1: number;
            openingN: number;
          }[] = [];

          // Get accounts from N-1 for this root
          const prevRootAccounts = previousYearRows.filter(
            (r) => r.accountNumber?.substring(0, 3) === root,
          );
          const prevRootAccountsMap: {
            [account: string]: {
              name: string;
              closingDebit: number;
              closingCredit: number;
            };
          } = {};
          prevRootAccounts.forEach((r) => {
            prevRootAccountsMap[r.accountNumber] = {
              name: r.accountName,
              closingDebit: r.closingDebit || 0,
              closingCredit: r.closingCredit || 0,
            };
          });

          // Get accounts from N for this root
          const currRootAccounts = balanceRows.filter(
            (r) => r.accountNumber?.substring(0, 3) === root,
          );
          const currRootAccountsMap: {
            [account: string]: {
              name: string;
              openingDebit: number;
              openingCredit: number;
            };
          } = {};
          currRootAccounts.forEach((r) => {
            currRootAccountsMap[r.accountNumber] = {
              name: r.accountName,
              openingDebit: r.openingDebit || 0,
              openingCredit: r.openingCredit || 0,
            };
          });

          // Compare individual accounts
          const allAccountKeys = new Set([
            ...Object.keys(prevRootAccountsMap),
            ...Object.keys(currRootAccountsMap),
          ]);
          allAccountKeys.forEach((account) => {
            const prev = prevRootAccountsMap[account];
            const curr = currRootAccountsMap[account];

            const closingN1 = prev ? prev.closingDebit - prev.closingCredit : 0;
            const openingN = curr ? curr.openingDebit - curr.openingCredit : 0;

            if (Math.abs(closingN1 - openingN) > 0.01) {
              problemAccounts.push({
                account: account,
                name: prev?.name || curr?.name || "",
                closingN1: closingN1,
                openingN: openingN,
              });
            }
          });

          mismatches.push({
            root: root,
            n1ClosingDebit: prevData.debit,
            n1ClosingCredit: prevData.credit,
            n1ClosingNet: prevClosingNet,
            nOpeningDebit: currentYearByRoot[root].debit,
            nOpeningCredit: currentYearByRoot[root].credit,
            nOpeningNet: currentOpeningNet,
            difference: currentOpeningNet - prevClosingNet,
            accounts: problemAccounts,
          });
        }
      }
    });

    if (mismatches.length > 0) {
      setOpeningMismatches(mismatches as any);
      setShowOpeningMismatch(true);
    } else {
      alert("Les soldes d'ouverture correspondent aux soldes de clôture N-1 ✓");
    }
  };

  // Calculate suggested values for fixing
  const getSuggestedValues = (accountNumber: string) => {
    if (!previousYearBalance || previousYearRows.length === 0) return null;

    const root = accountNumber.substring(0, 3);
    const prevRootAccounts = previousYearRows.filter(
      (r) => r.accountNumber?.substring(0, 3) === root,
    );

    const totalDebit = prevRootAccounts.reduce(
      (sum, r) => sum + (r.closingDebit || 0),
      0,
    );
    const totalCredit = prevRootAccounts.reduce(
      (sum, r) => sum + (r.closingCredit || 0),
      0,
    );
    const net = totalDebit - totalCredit;

    if (net > 0) {
      return { openingDebit: net, openingCredit: 0 };
    } else if (net < 0) {
      return { openingDebit: 0, openingCredit: Math.abs(net) };
    }
    return { openingDebit: 0, openingCredit: 0 };
  };

  const handleStartEdit = (row: BalanceRow) => {
    const modified = modifiedRows[row.accountNumber];
    const cached = editCache[row.accountNumber];
    setEditingAccount(row.accountNumber);

    // Initialize editedValues from cache, then modified, then original
    const openingDebit = cached?.openingDebit ?? modified?.openingDebit ?? row.openingDebit ?? 0;
    const openingCredit = cached?.openingCredit ?? modified?.openingCredit ?? row.openingCredit ?? 0;
    const movementDebit = cached?.movementDebit ?? modified?.movementDebit ?? row.movementDebit ?? 0;
    const movementCredit = cached?.movementCredit ?? modified?.movementCredit ?? row.movementCredit ?? 0;

    // Calculate closing balances based on opening + movement
    const netOpening = openingDebit - openingCredit;
    const netMovement = movementDebit - movementCredit;
    const netClosing = netOpening + netMovement;

    const closingDebit = netClosing > 0 ? netClosing : 0;
    const closingCredit = netClosing < 0 ? Math.abs(netClosing) : 0;
    setEditedValues({
      openingDebit,
      openingCredit,
      movementDebit,
      movementCredit,
      closingDebit,
      closingCredit,
    });
  };

  const handleSaveEdit = () => {
    if (!editingAccount) return;

    const cachedEdits = editCache[editingAccount];
    if (!cachedEdits) return;

    // Get current values (from cache or existing modified data)
    const currentRow = modifiedRows[editingAccount] ||
      balanceRows.find((r) => r.accountNumber === editingAccount);
    if (!currentRow) return;

    const openingDebit = cachedEdits.openingDebit ?? currentRow.openingDebit ?? 0;
    const openingCredit = cachedEdits.openingCredit ?? currentRow.openingCredit ?? 0;
    const movementDebit = cachedEdits.movementDebit ?? currentRow.movementDebit ?? 0;
    const movementCredit = cachedEdits.movementCredit ?? currentRow.movementCredit ?? 0;

    // Calculate closing balances
    const netOpening = openingDebit - openingCredit;
    const netMovement = movementDebit - movementCredit;
    const netClosing = netOpening + netMovement;

    const closingDebit = netClosing > 0 ? netClosing : 0;
    const closingCredit = netClosing < 0 ? Math.abs(netClosing) : 0;

    // Move from cache to modifiedRows (staging area)
    setModifiedRows((prev) => ({
      ...prev,
      [editingAccount]: {
        ...currentRow,
        accountNumber: editingAccount,
        accountName: currentRow.accountName || "",
        openingDebit,
        openingCredit,
        movementDebit,
        movementCredit,
        closingDebit,
        closingCredit,
      },
    }));

    // Clear from cache
    setEditCache((prev) => {
      const newCache = { ...prev };
      delete newCache[editingAccount];
      return newCache;
    });

    setHasUnsavedChanges(true);
    setEditingAccount(null);
  };

  const handleApplySuggestedFix = (accountNumber: string) => {
    const suggested = getSuggestedValues(accountNumber);
    if (suggested) {
      const openingDebit = suggested.openingDebit;
      const openingCredit = suggested.openingCredit;
      const movementDebit = 0;
      const movementCredit = 0;
      const netOpening = openingDebit - openingCredit;
      const netClosing = netOpening + (movementDebit - movementCredit);
      const closingDebit = netClosing > 0 ? netClosing : 0;
      const closingCredit = netClosing < 0 ? Math.abs(netClosing) : 0;

      setEditingAccount(accountNumber);
      setEditedValues({
        openingDebit,
        openingCredit,
        movementDebit,
        movementCredit,
        closingDebit,
        closingCredit,
      });
    }
  };

  const getEffectiveValue = (
    row: BalanceRow,
    field: keyof BalanceRow,
  ): number => {
    const modified = modifiedRows[row.accountNumber];
    if (modified) {
      const value = modified[field];
      if (value !== undefined) return Number(value) || 0;
    }
    return (row[field] as number) || 0;
  };

  const handleSaveToBackend = async () => {
    setIsSaving(true);
    try {
      const rowsToSave = Object.values(modifiedRows);
      console.log("Sending rows to update:", rowsToSave.length, rowsToSave);
      await clientService.updateBalanceRows(balance.id, rowsToSave);

      // Rafraîchir les données depuis le backend
      if (onRefresh) {
        await onRefresh();
      }

      setModifiedRows({});
      setEditCache({});
      setHasUnsavedChanges(false);

      // Message de succès sans alert bloquant
      console.log(`${rowsToSave.length} modification(s) sauvegardée(s) en base avec succès!`);
    } catch (err: any) {
      console.error("Error saving:", err);
      alert(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setModifiedRows({});
    setEditCache({});
    setHasUnsavedChanges(false);
  };

  // Handle cell edits (cached, not immediately saved)
  const handleCellEdit = (accountNumber: string, field: string, value: number) => {
    setEditCache(prev => ({
      ...prev,
      [accountNumber]: {
        ...prev[accountNumber],
        [field]: value,
      },
    }));
  };

  // Bulk edit functions
  const handleBulkEdit = (field: string, value: number) => {
    const newModifiedRows = { ...modifiedRows };
    selectedRows.forEach(accountNumber => {
      const originalRow = balanceRows.find(r => r.accountNumber === accountNumber);
      if (originalRow) {
        newModifiedRows[accountNumber] = {
          ...originalRow,
          ...newModifiedRows[accountNumber],
          [field]: value,
        };
      }
    });
    setModifiedRows(newModifiedRows);
    setHasUnsavedChanges(true);
    setSelectedRows(new Set());
    setBulkEditMode(false);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) return;
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedRows.size} compte(s) sélectionné(s) ? Cette action ne peut pas être annulée.`
    );
    if (!confirmDelete) return;

    const newModifiedRows = { ...modifiedRows };
    selectedRows.forEach(accountNumber => {
      // Mark for deletion by setting all values to 0
      newModifiedRows[accountNumber] = {
        ...balanceRows.find(r => r.accountNumber === accountNumber)!,
        openingDebit: 0,
        openingCredit: 0,
        movementDebit: 0,
        movementCredit: 0,
        closingDebit: 0,
        closingCredit: 0,
      };
    });
    setModifiedRows(newModifiedRows);
    setHasUnsavedChanges(true);
    setSelectedRows(new Set());
    setBulkEditMode(false);
  };

  const hasModificationInRow = (accountNumber: string): boolean => {
    const modified = modifiedRows[accountNumber];
    if (!modified) return false;
    const original = balanceRows.find((r) => r.accountNumber === accountNumber);
    if (!original) return false;
    return (
      modified.openingDebit !== original.openingDebit ||
      modified.openingCredit !== original.openingCredit ||
      modified.movementDebit !== original.movementDebit ||
      modified.movementCredit !== original.movementCredit
    );
  };

  // Prepare filtered and sorted data
  const processedData = balanceRows
    .map((row) => {
      const hasModification = !!modifiedRows[row.accountNumber];
      const cachedEdits = editCache[row.accountNumber];

      // Get values from cache, then modifiedRows, then original
      const openingDebit = cachedEdits?.openingDebit ??
        (hasModification ? (modifiedRows[row.accountNumber].openingDebit ?? row.openingDebit ?? 0) : (row.openingDebit ?? 0));

      const openingCredit = cachedEdits?.openingCredit ??
        (hasModification ? (modifiedRows[row.accountNumber].openingCredit ?? row.openingCredit ?? 0) : (row.openingCredit ?? 0));

      const movementDebit = cachedEdits?.movementDebit ??
        (hasModification ? (modifiedRows[row.accountNumber].movementDebit ?? row.movementDebit ?? 0) : (row.movementDebit ?? 0));

      const movementCredit = cachedEdits?.movementCredit ??
        (hasModification ? (modifiedRows[row.accountNumber].movementCredit ?? row.movementCredit ?? 0) : (row.movementCredit ?? 0));

      // Use closing balances as imported from Excel, don't recalculate
      const closingDebit = hasModification
        ? (modifiedRows[row.accountNumber].closingDebit ??
          row.closingDebit ??
          0)
        : (row.closingDebit ?? 0);
      const closingCredit = hasModification
        ? (modifiedRows[row.accountNumber].closingCredit ??
          row.closingCredit ??
          0)
        : (row.closingCredit ?? 0);

      return {
        ...row,
        openingDebit,
        openingCredit,
        movementDebit,
        movementCredit,
        closingDebit,
        closingCredit,
        hasModification,
        hasCachedChanges: !!cachedEdits,
        hasIssue: accountsWithIssues.has(row.accountNumber),
      };
    })
    .filter((row) => {
      const matchesSearch =
        row.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.accountName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass =
        selectedClass === "all" || row.accountNumber?.startsWith(selectedClass);
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc"
        ? ((aVal as number) || 0) - ((bVal as number) || 0)
        : ((bVal as number) || 0) - ((aVal as number) || 0);
    });

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  const accountClasses = Array.from(
    new Set(
      balanceRows.map((row) => row.accountNumber?.charAt(0)).filter(Boolean),
    ),
  ).sort();

  const handleSort = (field: keyof BalanceRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await clientService.checkBalanceEquilibrium(balance.id);
      await clientService.performBalanceVentilation(balance.id);
      alert("Traitement terminé avec succès!");
    } catch (error) {
      console.error("Processing error:", error);
      alert("Erreur lors du traitement");
    } finally {
      setIsProcessing(false);
    }
  };

  const SortIcon = ({ field }: { field: keyof BalanceRow }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Hash className="h-3 w-3" />
              Comptes
            </div>
            <p className="text-xl font-semibold">{balanceRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />À problème
            </div>
            <p className="text-xl font-semibold text-orange-600">
              {accountsWithIssues.size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <LayoutList className="h-3 w-3" />
              Total Débits
            </div>
            <p className="text-xl font-semibold">
              {totals.closingDebit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <LayoutList className="h-3 w-3" />
              Total Crédits
            </div>
            <p className="text-xl font-semibold">
              {totals.closingCredit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            isBalanced
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <CheckCircle2 className="h-3 w-3" />
              Équilibre
            </div>
            <p
              className={`text-xl font-semibold ${isBalanced ? "text-green-600" : "text-red-600"}`}
            >
              {isBalanced ? "OK" : "Différé"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={onReimport}>
          <Upload className="h-4 w-4 mr-1" />
          Réimporter
        </Button>
        <Button size="sm" onClick={handleProcess} disabled={isProcessing}>
          {isProcessing ? (
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          Ventiler
        </Button>
        {/* Show refresh status */}
        {isRefreshing && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">
              Actualisation des données...
            </span>
          </div>
        )}

        {/* Show cache status */}
        {Object.keys(editCache).length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-sm text-yellow-700">
              💾 {Object.keys(editCache).length} modification(s) en cache
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Apply all cached changes to staging area
                const newModifiedRows = { ...modifiedRows };
                Object.entries(editCache).forEach(([accountNumber, cachedEdits]) => {
                  const originalRow = balanceRows.find(r => r.accountNumber === accountNumber);
                  if (originalRow) {
                    newModifiedRows[accountNumber] = {
                      ...originalRow,
                      ...cachedEdits,
                      accountNumber,
                      accountName: originalRow.accountName || "",
                    };
                  }
                });
                setModifiedRows(newModifiedRows);
                setEditCache({});
                setHasUnsavedChanges(true);
              }}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            >
              Appliquer tout
            </Button>
          </div>
        )}

        {hasUnsavedChanges && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelChanges}
              className="text-orange-700 border-orange-300 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-1" />
              Annuler tout
            </Button>
            <Button
              size="sm"
              onClick={handleSaveToBackend}
              disabled={isSaving || Object.keys(modifiedRows).length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Sauvegarder en base ({Object.keys(modifiedRows).length})
            </Button>
          </>
        )}
        {previousYearBalance && (
          <Button variant="outline" size="sm" onClick={checkOpeningBalance}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Vérifier ouverture N
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-1 text-red-500" />
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un compte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">Toutes les classes</option>
                {accountClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Classe {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        {/* Table Header with Pagination Info */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {totalItems} comptes • Page {currentPage} sur {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Afficher:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(2);
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            {bulkEditMode && selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">Débit ouverture:</span>
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-20 h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseFloat((e.target as HTMLInputElement).value) || 0;
                        handleBulkEdit('openingDebit', value);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">Crédit ouverture:</span>
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-20 h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseFloat((e.target as HTMLInputElement).value) || 0;
                        handleBulkEdit('openingCredit', value);
                      }
                    }}
                  />
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkEditMode(!bulkEditMode);
                setSelectedRows(new Set());
              }}
              className={bulkEditMode ? "bg-blue-50 border-blue-300" : ""}
            >
              {bulkEditMode ? "Annuler sélection" : "Édition multiple"}
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className={`flex-1 overflow-auto transition-opacity duration-200 ${isRefreshing ? 'opacity-75 pointer-events-none' : ''}`}>
          <Table>
            <TableHeader className="bg-white border-b-2 border-gray-200">
              <TableRow className="hover:bg-gray-50">
                {bulkEditMode && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(paginatedData.map(row => row.accountNumber)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                <TableHead
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("accountNumber")}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    N° Compte
                    <SortIcon field="accountNumber" />
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors min-w-[200px]"
                  onClick={() => handleSort("accountName")}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Libellé du compte
                    <SortIcon field="accountName" />
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-900 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("openingDebit")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Débit Ouverture
                    <SortIcon field="openingDebit" />
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-900 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("openingCredit")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Crédit Ouverture
                    <SortIcon field="openingCredit" />
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-900 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("movementDebit")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Débit Mouvements
                    <SortIcon field="movementDebit" />
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-900 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("movementCredit")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Crédit Mouvements
                    <SortIcon field="movementCredit" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">
                  <div className="flex items-center justify-end gap-1 text-gray-500">
                    Débit Clôture
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">
                  <div className="flex items-center justify-end gap-1 text-gray-500">
                    Crédit Clôture
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-center w-24">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, idx) => {
                const isEditing = editingAccount === row.accountNumber;
                const isSelected = selectedRows.has(row.accountNumber);

                return (
                  <TableRow
                    key={row.accountNumber || idx}
                    className={`
                      hover:bg-gray-50 transition-colors
                      ${row.hasIssue ? "bg-red-50 hover:bg-red-100" : ""}
                      ${row.hasModification ? "bg-blue-50 hover:bg-blue-100" : ""}
                      ${row.hasCachedChanges ? "bg-yellow-50 hover:bg-yellow-100" : ""}
                      ${isSelected ? "bg-blue-100 hover:bg-blue-150" : ""}
                    `}
                  >
                    {bulkEditMode && (
                      <TableCell className="w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = new Set(selectedRows);
                            if (e.target.checked) {
                              newSelected.add(row.accountNumber);
                            } else {
                              newSelected.delete(row.accountNumber);
                            }
                            setSelectedRows(newSelected);
                          }}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                    )}

                    {/* Account Number */}
                    <TableCell className="font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <span className={row.hasIssue ? "text-red-700 font-bold" : "text-gray-900"}>
                          {row.accountNumber?.replace(/[^0-9]/g, "") || row.accountNumber}
                        </span>
                        {row.hasIssue && (
                          <span
                            className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full"
                            title="Incohérence avec l'exercice N-1"
                          >
                            ⚠️
                          </span>
                        )}
                        {row.hasCachedChanges && (
                          <span
                            className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full"
                            title="Modifications en cache (cliquez sur Appliquer)"
                          >
                            💾
                          </span>
                        )}
                        {row.hasModification && (
                          <span
                            className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full"
                            title="Modifications prêtes à sauvegarder"
                          >
                            ✏️
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Account Name */}
                    <TableCell className="max-w-0">
                      <div className="truncate font-medium text-gray-900" title={row.accountName}>
                        {row.accountName}
                      </div>
                    </TableCell>

                    {/* Opening Debit */}
                    <EditableCell
                      accountNumber={row.accountNumber}
                      value={row.openingDebit}
                      isEditing={isEditing && editingAccount === row.accountNumber}
                      field="openingDebit"
                      onCellEdit={handleCellEdit}
                      onStartEdit={() => handleStartEdit(row)}
                      className="text-right"
                    />

                    {/* Opening Credit */}
                    <EditableCell
                      accountNumber={row.accountNumber}
                      value={row.openingCredit}
                      isEditing={isEditing && editingAccount === row.accountNumber}
                      field="openingCredit"
                      onCellEdit={handleCellEdit}
                      onStartEdit={() => handleStartEdit(row)}
                      className="text-right"
                    />

                    {/* Movement Debit */}
                    <EditableCell
                      accountNumber={row.accountNumber}
                      value={row.movementDebit}
                      isEditing={isEditing && editingAccount === row.accountNumber}
                      field="movementDebit"
                      onCellEdit={handleCellEdit}
                      onStartEdit={() => handleStartEdit(row)}
                      className="text-right"
                    />

                    {/* Movement Credit */}
                    <EditableCell
                      accountNumber={row.accountNumber}
                      value={row.movementCredit}
                      isEditing={isEditing && editingAccount === row.accountNumber}
                      field="movementCredit"
                      onCellEdit={handleCellEdit}
                      onStartEdit={() => handleStartEdit(row)}
                      className="text-right"
                    />

                    {/* Closing Debit */}
                    <TableCell className="text-right font-mono text-gray-600">
                      {(row.closingDebit || 0) > 0 ? (
                        <span className="font-medium">
                          {(row.closingDebit || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Closing Credit */}
                    <TableCell className="text-right font-mono text-gray-600">
                      {(row.closingCredit || 0) > 0 ? (
                        <span className="font-medium">
                          {(row.closingCredit || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Sauvegarder"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Clear cache for this account when canceling
                                setEditCache(prev => {
                                  const newCache = { ...prev };
                                  delete newCache[editingAccount!];
                                  return newCache;
                                });
                                setEditingAccount(null);
                                setEditedValues(null);
                              }}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              title="Annuler (efface les modifications en cache)"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(row)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {row.hasIssue && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApplySuggestedFix(row.accountNumber)}
                            className="h-7 w-7 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Appliquer la correction suggérée"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {paginatedData.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Aucun compte trouvé</p>
                <p className="text-gray-400 text-sm">Vérifiez vos filtres de recherche</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-gray-600 mx-2">
                Page {currentPage} sur {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} sur {totalItems} comptes
            </div>
          </div>
        )}
      </Card>

      {/* Opening Mismatch Dialog - Custom Overlay */}
      {showOpeningMismatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[85vw] max-h-[90vh] overflow-hidden flex flex-col mx-auto" style={{ width: '85vw' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 min-h-[60px]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Incohérences soldes d'ouverture
                  </h2>
                  <p className="text-sm text-gray-600">
                    Clôture N-1 → Ouverture N • {openingMismatches.length} racine(s)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOpeningMismatch(false)}
                className="h-6 w-6 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-2 space-y-1">
              {openingMismatches.map((mismatch: any, idx) => {
                const isExpanded = expandedRoots.has(mismatch.root);
                const hasSubAccounts = mismatch.accounts && mismatch.accounts.length > 0;

                return (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Root header - clickable */}
                    <div
                      className="p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                      onClick={() => {
                        const newExpanded = new Set(expandedRoots);
                        if (isExpanded) {
                          newExpanded.delete(mismatch.root);
                        } else {
                          newExpanded.add(mismatch.root);
                        }
                        setExpandedRoots(newExpanded);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {hasSubAccounts && (
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          )}
                          <span className="font-mono font-bold text-sm text-gray-900 px-2 py-1 bg-white rounded border flex-shrink-0">
                            {mismatch.root}
                          </span>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {mismatch.accounts.length} comptes
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600 whitespace-nowrap">Écart:</span>
                            <span className={`font-semibold text-xs ${mismatch.difference > 0 ? "text-green-600" : "text-red-600"}`}>
                              {mismatch.difference > 0 ? "+" : ""}{mismatch.difference.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Auto-correct button */}
                        <div className="flex-shrink-0 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Auto-correct entire root
                              const correctedRows = mismatch.accounts.map((acc: any) => ({
                                accountNumber: acc.account,
                                openingDebit: acc.closingN1 > 0 ? acc.closingN1 : 0,
                                openingCredit: acc.closingN1 < 0 ? Math.abs(acc.closingN1) : 0,
                                movementDebit: 0,
                                movementCredit: 0,
                              }));

                              setModifiedRows(prev => ({
                                ...prev,
                                ...Object.fromEntries(
                                  correctedRows.map((row: any) => [row.accountNumber, {
                                    ...balanceRows.find(r => r.accountNumber === row.accountNumber),
                                    ...row,
                                  }])
                                )
                              }));

                              setHasUnsavedChanges(true);
                              alert(`Correction automatique appliquée à toute la racine ${mismatch.root}`);
                            }}
                            className="text-green-600 border-green-300 hover:bg-green-50 h-7 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Corriger
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible sub-accounts */}
                    {isExpanded && hasSubAccounts && (
                      <div className="border-t border-gray-100 bg-white">
                        <div className="p-2">
                          {/* Compact table */}
                          <div className="border border-gray-200 rounded overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-6 gap-2 p-2 bg-gray-100 text-xs font-semibold text-gray-700 border-b border-gray-200">
                              <div className="col-span-1">N° Compte</div>
                              <div className="col-span-2">Libellé</div>
                              <div className="col-span-1 text-right">Clôture N-1</div>
                              <div className="col-span-1 text-right">Ouverture N</div>
                              <div className="col-span-1 text-center">Action</div>
                            </div>

                            {/* Table rows */}
                            <div className="divide-y divide-gray-100">
                              {mismatch.accounts.map((acc: any, accIdx: number) => {
                                const difference = acc.openingN - acc.closingN1;
                                const hasIssue = Math.abs(difference) > 0.01;

                                return (
                                  <div
                                    key={accIdx}
                                    className={`grid grid-cols-6 gap-2 p-2 text-xs hover:bg-gray-50 ${
                                      hasIssue ? "bg-red-50" : ""
                                    }`}
                                  >
                                    <div className="col-span-1">
                                      <span className="font-mono font-medium text-gray-900">
                                        {acc.account}
                                      </span>
                                    </div>

                                    <div className="col-span-2">
                                      <span className="text-gray-700 truncate">
                                        {acc.name || "Sans libellé"}
                                      </span>
                                    </div>

                                    <div className="col-span-1 text-right">
                                      <span className="font-mono text-gray-600">
                                        {acc.closingN1.toLocaleString()}
                                      </span>
                                    </div>

                                    <div className="col-span-1 text-right">
                                      <span className="font-mono text-gray-600">
                                        {acc.openingN.toLocaleString()}
                                      </span>
                                    </div>

                                    <div className="col-span-1 flex justify-center items-center gap-1">
                                      {hasIssue && (
                                        <>
                                          <span className={`font-mono text-xs ${
                                            difference > 0 ? "text-green-600" : "text-red-600"
                                          }`}>
                                            {difference > 0 ? "+" : ""}
                                            {difference.toLocaleString()}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              // Auto-correct this specific account
                                              const correctedRow = {
                                                accountNumber: acc.account,
                                                openingDebit: acc.closingN1 > 0 ? acc.closingN1 : 0,
                                                openingCredit: acc.closingN1 < 0 ? Math.abs(acc.closingN1) : 0,
                                                movementDebit: 0,
                                                movementCredit: 0,
                                              };

                                              setModifiedRows(prev => ({
                                                ...prev,
                                                [acc.account]: {
                                                  ...balanceRows.find(r => r.accountNumber === acc.account),
                                                  ...correctedRow,
                                                }
                                              }));

                                              setHasUnsavedChanges(true);
                                              alert(`Correction appliquée au compte ${acc.account}`);
                                            }}
                                            className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                                          >
                                            <RefreshCw className="h-3 w-3" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-2 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{openingMismatches.length}</span> racine(s) •
                <span className="font-semibold text-gray-900 ml-1">
                  {openingMismatches.reduce((sum, m) => sum + m.accounts.length, 0)}
                </span> comptes •
                Écart total: <span className="font-semibold text-gray-900">
                  {openingMismatches.reduce((sum, m) => sum + Math.abs(m.difference), 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // Auto-correct all mismatches
                    const allCorrectedRows: any[] = [];
                    openingMismatches.forEach(mismatch => {
                      mismatch.accounts.forEach((acc: any) => {
                        allCorrectedRows.push({
                          accountNumber: acc.account,
                          openingDebit: acc.closingN1 > 0 ? acc.closingN1 : 0,
                          openingCredit: acc.closingN1 < 0 ? Math.abs(acc.closingN1) : 0,
                          movementDebit: 0,
                          movementCredit: 0,
                        });
                      });
                    });

                    setModifiedRows(prev => ({
                      ...prev,
                      ...Object.fromEntries(
                        allCorrectedRows.map((row: any) => [row.accountNumber, {
                          ...balanceRows.find(r => r.accountNumber === row.accountNumber),
                          ...row,
                        }])
                      )
                    }));

                    setHasUnsavedChanges(true);
                    alert(`Correction automatique appliquée à ${allCorrectedRows.length} comptes`);
                  }}
                  className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tout corriger
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedRoots(new Set())}
                  className="h-7 text-xs"
                >
                  Réduire
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowOpeningMismatch(false)}
                  className="h-7 text-xs"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la balance</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette balance ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BalanceImportForm({
  folderId,
  balanceType,
  onSuccess,
  onCancel,
}: {
  folderId: string;
  balanceType: "current" | "previous";
  onSuccess: (balance: BalanceData) => void;
  onCancel: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(xls|xlsx)$/i)
    ) {
      setValidationErrors([
        "Veuillez sélectionner un fichier Excel valide (.xls ou .xlsx)",
      ]);
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);

    setIsValidating(true);
    try {
      const preview = await parseExcelFilePreview(selectedFile);
      const errors = validateBalanceFile(preview);
      setValidationErrors(errors);
    } catch (err: any) {
      setValidationErrors([
        err.message || "Erreur lors de la lecture du fichier",
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !folderId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", folderId);
      formData.append("type", balanceType);

      const response = await clientService.uploadBalance(formData);
      if (response.balance) {
        onSuccess(response.balance);
      }
    } catch (err: any) {
      setValidationErrors([err.message || "Erreur lors de l'upload"]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const result = await clientService.createBalanceFromTemplate(
        folderId,
        balanceType,
      );
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error creating template:", err);
    }
  };

  const downloadPreviousTemplate = async () => {
    try {
      const result = await clientService.createBalanceFromTemplate(
        folderId,
        "previous",
      );
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error creating previous template:", err);
    }
  };

  const downloadCurrentTemplate = async () => {
    try {
      const result = await clientService.createBalanceFromTemplate(
        folderId,
        "current",
      );
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error creating current template:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : file
              ? validationErrors.length > 0
                ? "border-red-400 bg-red-50"
                : "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) handleFileSelect(droppedFile);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) handleFileSelect(selectedFile);
          }}
        />
        {file ? (
          <div className="space-y-2">
            {validationErrors.length > 0 ? (
              <XCircle className="h-8 w-8 text-red-600 mx-auto" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-green-600 mx-auto" />
            )}
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-600 font-medium">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-gray-400">
              ou cliquez pour sélectionner
            </p>
          </div>
        )}
      </div>

      {/* Errors */}
      {validationErrors.length > 0 && (
        <div className="border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-3 py-2 border-b border-red-200 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {validationErrors.length} erreur
              {validationErrors.length > 1 ? "s" : ""} de validation
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-red-700 font-medium">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-red-700 font-medium">
                    Erreur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {validationErrors.map((error, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-3 py-2 text-red-500">{idx + 1}</td>
                    <td className="px-3 py-2 text-red-600">{error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success */}
      {file && validationErrors.length === 0 && !isValidating && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700">
            Fichier valide - Prêt à importer
          </span>
        </div>
      )}

      {/* Loading */}
      {(isValidating || isUploading) && (
        <div className="flex items-center justify-center gap-2 p-3">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">
            {isValidating ? "Validation..." : "Import en cours..."}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={downloadPreviousTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Modèle N-1
            </Button>
            <Button variant="outline" onClick={downloadCurrentTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Modèle N
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !file ||
                isUploading ||
                isValidating ||
                validationErrors.length > 0
              }
              className="bg-blue-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>
      </div>

      {/* Format Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg max-w-full">
        <p className="font-medium mb-1">Format attendu:</p>
        <p className="break-words">
          8 colonnes: N° compte, Nom, DO, CO, DM, CM, DC, CC
        </p>
      </div>
    </div>
  );
}
