import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
  ChevronUp,
  Search,
  Eye,
  MoreHorizontal,
  Calendar,
  Hash,
  LayoutList,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { clientService } from "../services/client.service";
import * as XLSX from "xlsx";

interface BalanceRow {
  id?: string;
  accountNumber: string;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
}

interface BalanceData {
  id: string;
  type: string;
  period: string;
  fileName: string;
  status: string;
  originalData: {
    rows: BalanceRow[];
  };
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
        const rows = jsonData.slice(1, 11).map((row) =>
          row.map((cell) => String(cell).trim()),
        );

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

  if (preview.headers.length !== 8) {
    errors.push(
      `Nombre de colonnes invalide: ${preview.headers.length} colonnes détectées (8 attendues)`,
    );
  }

  if (preview.rows.length > 0) {
    preview.rows.forEach((row, idx) => {
      if (row.length >= 1 && row[0]?.trim()) {
        const accountNum = row[0].trim();
        if (!/^[1-8]\d{2,}$/.test(accountNum)) {
          errors.push(
            `Ligne ${idx + 2}: Compte "${accountNum}" invalide`,
          );
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importBalanceType, setImportBalanceType] = useState<"current" | "previous">("current");
  const [selectedBalance, setSelectedBalance] = useState<BalanceData | null>(null);
  const [showMissingPreviousAlert, setShowMissingPreviousAlert] = useState(false);
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
      const response = await clientService.getBalancesByFolder(effectiveFolderId);
      const balancesList = response?.balances || response?.data?.balances || [];
      setBalances(balancesList);
      
      if (balancesList.length > 0) {
        const currentId = selectedBalance?.id;
        const currentExists = balancesList.some((b: BalanceData) => b.id === currentId);
        if (!selectedBalance || !currentExists) {
          setSelectedBalance(balancesList[0]);
        }
      } else {
        setSelectedBalance(null);
      }
    } catch (err: any) {
      console.error("Error loading balances:", err);
      setBalances([]);
    } finally {
      setIsLoading(false);
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
  const currentYearBalance = balances.find(b => 
    b.type?.toUpperCase() === "CURRENT_YEAR"
  );
  const previousYearBalance = balances.find(b => 
    b.type?.toUpperCase() === "PREVIOUS_YEAR"
  );
  
  console.log("Fiscal year:", fiscalYear, "Previous year:", previousYear);
  console.log("Balances types:", balances.map(b => ({ id: b.id, type: b.type, period: b.period })));
  console.log("Current year balance found:", currentYearBalance?.type);
  console.log("Previous year balance found:", previousYearBalance?.type);

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

  console.log("Current year balance:", currentYearBalance);
  console.log("Previous year balance:", previousYearBalance);
  console.log("All balances:", balances);

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
              <p className="text-sm text-gray-500">
                Exercice {fiscalYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Button for N-1 */}
            <Button
              onClick={() => openImportDialog("previous")}
              variant={hasPreviousYear ? "outline" : "default"}
              className={hasPreviousYear ? "" : "bg-green-600 hover:bg-green-700"}
              title={hasPreviousYear ? "Balance N-1 déjà importée" : `Importer Balance N-1 (${previousYear})`}
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
              title={hasCurrentYear ? "Balance N déjà importée" : `Importer Balance N (${fiscalYear})`}
            >
              {hasCurrentYear ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  N ({fiscalYear})
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  N ({fiscalYear})
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
                  onReimport={() => {
                    handleBalanceDeleted(selectedBalance.id);
                    openImportDialog(selectedBalance.type === "PREVIOUS_YEAR" ? "previous" : "current");
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
      <Dialog open={showMissingPreviousAlert} onOpenChange={setShowMissingPreviousAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Balance N-1 manquante
            </DialogTitle>
            <DialogDescription className="mt-2">
              La balance de l'exercice précédent (N-1 : {previousYear}) n'a pas été importée. 
              Pour une meilleure précision, il est recommandé d'importer d'abord la balance N-1 
              car le système vérifiera que les soldes de clôture N-1 correspondent aux soldes d'ouverture N.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-2">
            <p className="text-sm text-orange-800">
              Voulez-vous continuer quand même ?
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowMissingPreviousAlert(false)}>
              Annuler
            </Button>
            <Button variant="default" onClick={confirmImportDespiteMissingPrevious} className="bg-blue-600">
              <Upload className="h-4 w-4 mr-2" />
              Importer quand même
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Importer la balance {importBalanceType === "current" ? `N (${fiscalYear})` : `N-1 (${previousYear})`}
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
          Importez votre balance comptable pour procéder à la ventilation et générer les états financiers.
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
    if (balance.originalData.rows) {
      return balance.originalData.rows;
    }
    if (Array.isArray(balance.originalData)) {
      return balance.originalData as BalanceRow[];
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
  const balanceTypeLabel = isPreviousYear ? "N-1" : (isCurrentYear ? "N" : balance.period || "N");
  
  console.log("BalanceListItem - balance:", balance.id, "type:", balance.type);

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
            {rows.length} comptes • {totalDebit.toLocaleString()} D / {totalCredit.toLocaleString()} C
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

function BalanceDetailView({
  balance,
  previousYearBalance,
  onDelete,
  onReimport,
}: {
  balance: BalanceData;
  previousYearBalance?: BalanceData;
  onDelete: () => void;
  onReimport: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof BalanceRow>("accountNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedClass, setSelectedClass] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOpeningMismatch, setShowOpeningMismatch] = useState(false);
  const [openingMismatches, setOpeningMismatches] = useState<{account: string, name: string, n1Closing: number, nOpening: number}[]>([]);

  const getBalanceRows = (balance: BalanceData): BalanceRow[] => {
    if (!balance.originalData) return [];
    if (balance.originalData.rows) {
      return balance.originalData.rows;
    }
    if (Array.isArray(balance.originalData)) {
      return balance.originalData as BalanceRow[];
    }
    return [];
  };

  const balanceRows = getBalanceRows(balance);
  const previousYearRows = previousYearBalance ? getBalanceRows(previousYearBalance) : [];

  const totals = balanceRows.reduce(
    (acc, row) => ({
      openingDebit: acc.openingDebit + (row.openingDebit || 0),
      openingCredit: acc.openingCredit + (row.openingCredit || 0),
      movementDebit: acc.movementDebit + (row.movementDebit || 0),
      movementCredit: acc.movementCredit + (row.movementCredit || 0),
      closingDebit: acc.closingDebit + (row.closingDebit || 0),
      closingCredit: acc.closingCredit + (row.closingCredit || 0),
    }),
    { openingDebit: 0, openingCredit: 0, movementDebit: 0, movementCredit: 0, closingDebit: 0, closingCredit: 0 },
  );

  const isBalanced = Math.abs(totals.closingDebit - totals.closingCredit) < 0.01;

// Check opening balance matches previous year closing (group by first 3 digits)
  const checkOpeningBalance = () => {
    if (!previousYearBalance || previousYearRows.length === 0) return;
    
    // Group previous year by first 3 digits - aggregate all accounts under same root
    const previousYearByRoot: {[key: string]: {debit: number, credit: number}} = {};
    previousYearRows.forEach(row => {
      const root = row.accountNumber?.substring(0, 3) || "";
      if (!previousYearByRoot[root]) {
        previousYearByRoot[root] = { debit: 0, credit: 0 };
      }
      previousYearByRoot[root].debit += row.closingDebit || 0;
      previousYearByRoot[root].credit += row.closingCredit || 0;
    });

    // Group current year opening by first 3 digits - aggregate all accounts under same root
    const currentYearByRoot: {[key: string]: {debit: number, credit: number}} = {};
    balanceRows.forEach(row => {
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
      accounts: {account: string, name: string, closingN1: number, openingN: number}[];
    }[] = [];
    
    Object.keys(currentYearByRoot).forEach(root => {
      const prevData = previousYearByRoot[root];
      if (prevData) {
        const prevClosingNet = prevData.debit - prevData.credit;
        const currentOpeningNet = currentYearByRoot[root].debit - currentYearByRoot[root].credit;
        
        if (Math.abs(prevClosingNet - currentOpeningNet) > 0.01) {
          // Find individual accounts in this root that have differences
          const problemAccounts: {account: string, name: string, closingN1: number, openingN: number}[] = [];
          
          // Get accounts from N-1 for this root
          const prevRootAccounts = previousYearRows.filter(r => r.accountNumber?.substring(0, 3) === root);
          const prevRootAccountsMap: {[account: string]: {name: string, closingDebit: number, closingCredit: number}} = {};
          prevRootAccounts.forEach(r => {
            prevRootAccountsMap[r.accountNumber] = {
              name: r.accountName,
              closingDebit: r.closingDebit || 0,
              closingCredit: r.closingCredit || 0
            };
          });
          
          // Get accounts from N for this root
          const currRootAccounts = balanceRows.filter(r => r.accountNumber?.substring(0, 3) === root);
          const currRootAccountsMap: {[account: string]: {name: string, openingDebit: number, openingCredit: number}} = {};
          currRootAccounts.forEach(r => {
            currRootAccountsMap[r.accountNumber] = {
              name: r.accountName,
              openingDebit: r.openingDebit || 0,
              openingCredit: r.openingCredit || 0
            };
          });
          
          // Compare individual accounts
          const allAccountKeys = new Set([...Object.keys(prevRootAccountsMap), ...Object.keys(currRootAccountsMap)]);
          allAccountKeys.forEach(account => {
            const prev = prevRootAccountsMap[account];
            const curr = currRootAccountsMap[account];
            
            const closingN1 = prev ? (prev.closingDebit - prev.closingCredit) : 0;
            const openingN = curr ? (curr.openingDebit - curr.openingCredit) : 0;
            
            if (Math.abs(closingN1 - openingN) > 0.01) {
              problemAccounts.push({
                account: account,
                name: prev?.name || curr?.name || "",
                closingN1: closingN1,
                openingN: openingN
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
            accounts: problemAccounts
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

  const filteredData = balanceRows
    .filter((row) => {
      const matchesSearch =
        row.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.accountName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === "all" || row.accountNumber?.startsWith(selectedClass);
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc"
        ? ((aVal as number) || 0) - ((bVal as number) || 0)
        : ((bVal as number) || 0) - ((aVal as number) || 0);
    });

  const accountClasses = Array.from(
    new Set(balanceRows.map((row) => row.accountNumber?.charAt(0)).filter(Boolean)),
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
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
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
              <LayoutList className="h-3 w-3" />
              Total Débits
            </div>
            <p className="text-xl font-semibold">{totals.closingDebit.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <LayoutList className="h-3 w-3" />
              Total Crédits
            </div>
            <p className="text-xl font-semibold">{totals.closingCredit.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <CheckCircle2 className="h-3 w-3" />
              Équilibre
            </div>
            <p className={`text-xl font-semibold ${isBalanced ? "text-green-600" : "text-red-600"}`}>
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
          {isProcessing ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
          Ventiler
        </Button>
        {previousYearBalance && (
          <Button variant="outline" size="sm" onClick={checkOpeningBalance}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Vérifier ouverture N
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
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
                  <option key={cls} value={cls}>Classe {cls}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("accountNumber")}>
                  <div className="flex items-center">N° Compte <SortIcon field="accountNumber" /></div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("accountName")}>
                  <div className="flex items-center">Libellé <SortIcon field="accountName" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("openingDebit")}>
                  <div className="flex items-center justify-end">Déb. Ouv. <SortIcon field="openingDebit" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("openingCredit")}>
                  <div className="flex items-center justify-end">Créd. Ouv. <SortIcon field="openingCredit" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("movementDebit")}>
                  <div className="flex items-center justify-end">Déb. Mvt <SortIcon field="movementDebit" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("movementCredit")}>
                  <div className="flex items-center justify-end">Créd. Mvt <SortIcon field="movementCredit" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("closingDebit")}>
                  <div className="flex items-center justify-end">Déb. Clôt <SortIcon field="closingDebit" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("closingCredit")}>
                  <div className="flex items-center justify-end">Créd. Clôt <SortIcon field="closingCredit" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.slice(0, 50).map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-sm">{row.accountNumber}</TableCell>
                  <TableCell className="text-sm">{row.accountName}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(row.openingDebit || 0) > 0 ? (row.openingDebit || 0).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(row.openingCredit || 0) > 0 ? (row.openingCredit || 0).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(row.movementDebit || 0) > 0 ? (row.movementDebit || 0).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(row.movementCredit || 0) > 0 ? (row.movementCredit || 0).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(row.closingDebit || 0) > 0 ? (row.closingDebit || 0).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(row.closingCredit || 0) > 0 ? (row.closingCredit || 0).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableRow className="bg-gray-100 font-bold">
              <TableCell colSpan={2}>TOTAL</TableCell>
              <TableCell className="text-right">{totals.openingDebit.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.openingCredit.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.movementDebit.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.movementCredit.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.closingDebit.toLocaleString()}</TableCell>
              <TableCell className="text-right">{totals.closingCredit.toLocaleString()}</TableCell>
            </TableRow>
          </Table>
        </div>
      </Card>

      {/* Opening Mismatch Dialog */}
      <Dialog open={showOpeningMismatch} onOpenChange={setShowOpeningMismatch}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Incohérence des soldes d'ouverture
            </DialogTitle>
            <DialogDescription>
              Les soldes d'ouverture de la balance N ne correspondent pas aux soldes de clôture de la balance N-1.
              Les incohérences sont groupées par racine de 3 chiffres.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto mt-2 space-y-4">
            {openingMismatches.slice(0, 10).map((mismatch: any, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                {/* Root summary */}
                <div className="bg-red-50 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">Racine {mismatch.root}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Clôture N-1: {mismatch.n1ClosingNet.toLocaleString()} → Ouverture N: {mismatch.nOpeningNet.toLocaleString()})
                    </span>
                  </div>
                  <span className="text-red-600 font-mono font-semibold">
                    Diff: {mismatch.difference.toLocaleString()}
                  </span>
                </div>
                
                {/* Individual accounts */}
                {mismatch.accounts && mismatch.accounts.length > 0 && (
                  <div className="p-2 bg-white">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead>Compte</TableHead>
                          <TableHead>Libellé</TableHead>
                          <TableHead className="text-right">Clôture N-1</TableHead>
                          <TableHead className="text-right">Ouverture N</TableHead>
                          <TableHead className="text-right">Écart</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mismatch.accounts.slice(0, 10).map((acc: any, accIdx: number) => (
                          <TableRow key={accIdx}>
                            <TableCell className="font-mono text-sm">{acc.account}</TableCell>
                            <TableCell className="text-sm">{acc.name}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{acc.closingN1.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{acc.openingN.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-mono text-sm ${Math.abs(acc.openingN - acc.closingN1) > 0.01 ? 'text-red-600 font-semibold' : ''}`}>
                              {(acc.openingN - acc.closingN1).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {mismatch.accounts.length > 10 && (
                      <p className="text-xs text-gray-500 p-2">
                        ... et {mismatch.accounts.length - 10} autres comptes
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {openingMismatches.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">
              ... et {openingMismatches.length - 10} autres racines avec incohérences
            </p>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowOpeningMismatch(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la balance</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette balance ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={() => { onDelete(); setShowDeleteDialog(false); }}>
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
      setValidationErrors(["Veuillez sélectionner un fichier Excel valide (.xls ou .xlsx)"]);
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
      setValidationErrors([err.message || "Erreur lors de la lecture du fichier"]);
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
      const result = await clientService.createBalanceFromTemplate(folderId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error creating template:", err);
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
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
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
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-600 font-medium">Glissez-déposez votre fichier ici</p>
            <p className="text-sm text-gray-400">ou cliquez pour sélectionner</p>
          </div>
        )}
      </div>

      {/* Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{validationErrors[0]}</p>
        </div>
      )}

      {/* Success */}
      {file && validationErrors.length === 0 && !isValidating && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700">Fichier valide - Prêt à importer</span>
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
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Modèle
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || isValidating || validationErrors.length > 0}
            className="bg-blue-600"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
        </div>
      </div>

      {/* Format Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Format attendu:</p>
        <p>8 colonnes: N° compte, Nom, DO, CO, DM, CM, DC, CC</p>
      </div>
    </div>
  );
}