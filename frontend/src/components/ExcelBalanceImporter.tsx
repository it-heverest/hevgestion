import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Upload,
  FileSpreadsheet,
  Download,
  FileDown,
  Sparkles,
  ArrowLeft,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  FileText,
  History,
  Info,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  FileValidationService,
  ValidationResult,
} from "../services/fileValidationService";
import { FullExcelEditor } from "./FullExcelEditor";
import { clientService } from "../services/client.service";
import { folderService } from "../services/folder.service";

interface ExcelBalanceImporterProps {
  onComplete?: () => void;
}

interface BalanceRow {
  compte: string;
  libelle: string;
  entre_debit: number;
  entre_credit: number;
  mouvement_debit: number;
  mouvement_credit: number;
  solde_debit?: number;
  solde_credit?: number;
}

interface StoredBalance {
  data: BalanceRow[];
  timestamp: string;
  type: "current" | "previous";
  rowCount: number;
  fileName?: string;
  id?: string; // Add balance ID for backend operations
}

export function ExcelBalanceImporter({
  onComplete,
}: ExcelBalanceImporterProps = {}) {
  const navigate = useNavigate();
  const { userId, actionId } = useParams();
  const {
    addToHistory,
    setBalanceImported,
    setBalanceProcessed,
    selectedFolder,
    previousFolder,
    balanceProcessed,
  } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importType, setImportType] = useState<"current" | "previous" | null>(
    null,
  );

  const [storedBalances, setStoredBalances] = useState<{
    current: StoredBalance | null;
    previous: StoredBalance | null;
  }>({ current: null, previous: null });

  const [showBalancesDialog, setShowBalancesDialog] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  // Nouvel état pour gérer l'éditeur en plein écran
  const [showFullEditor, setShowFullEditor] = useState(false);
  const [editorData, setEditorData] = useState<{
    reportName: string;
    reportId: string;
    initialData: BalanceRow[];
    balanceType: "current" | "previous";
    fileName?: string;
  } | null>(null);

  // For now, we'll work with the selected folder

  useEffect(() => {
    loadStoredBalances();
    loadBalancesFromBackend();
  }, [selectedFolder]);

  // Auto-navigate to traitement when both balances are available
  useEffect(() => {
    if (
      storedBalances.current &&
      storedBalances.previous &&
      !balanceProcessed
    ) {
      console.log("Both balances available, auto-navigating to traitement");
      setBalanceProcessed(true);
      navigate(`/web/user/traitement/${userId}/traitement`);
    }
  }, [storedBalances, balanceProcessed, navigate, userId]);

  const loadStoredBalances = () => {
    // Balances are now loaded from backend via loadBalancesFromBackend()
    // This function is kept for compatibility but now only initializes empty state
    setStoredBalances({ current: null, previous: null });
  };

  const loadBalancesFromBackend = async () => {
    if (!selectedFolder || !selectedFolder.id) {
      return;
    }

    try {
      console.log(
        "Loading balances from backend for client:",
        selectedFolder.clientId,
      );

      // Get all folders for this client to find balances across all years
      const allFolders = await folderService.getFoldersByClient(
        selectedFolder.clientId,
      );
      console.log("All folders for client:", allFolders);

      // Load balances from all folders of this client
      const allBalances: any[] = [];
      for (const folder of allFolders) {
        try {
          const response = await clientService.getBalancesByFolder(folder.id);
          const folderBalances = response.balances || [];
          console.log(
            `Balances for folder ${folder.id} (${folder.fiscalYear}):`,
            folderBalances,
          );
          allBalances.push(...folderBalances);
        } catch (error) {
          console.log(`No balances found for folder ${folder.id}`);
        }
      }

      console.log("All balances loaded from backend:", allBalances);

      // Convert backend balances to frontend format
      const backendBalances = {
        current: null as StoredBalance | null,
        previous: null as StoredBalance | null,
      };

      allBalances.forEach((balance: any) => {
        // Determine balance type based on period, not folder
        // Current year balance has period matching selected folder's year
        // Previous year balance has period matching selected folder's year - 1
        const balancePeriod = parseInt(balance.period);
        const selectedFiscalYear = selectedFolder.fiscalYear;

        let balanceType: "current" | "previous" | null = null;

        if (balancePeriod === selectedFiscalYear) {
          balanceType = "current";
        } else if (balancePeriod === selectedFiscalYear - 1) {
          balanceType = "previous";
        } else {
          console.log(
            "Skipping balance with period",
            balancePeriod,
            "for selected year",
            selectedFiscalYear,
          );
          return;
        }

        // Convert backend data format to frontend format
        const rawData = balance.originalData?.rows || [];
        const balanceData: BalanceRow[] = rawData.map((row: any) => ({
          compte: row.accountNumber || row.compte || "",
          libelle: row.accountName || row.libelle || "",
          entre_debit: Number(row.openingDebit || row.entre_debit) || 0,
          entre_credit: Number(row.openingCredit || row.entre_credit) || 0,
          mouvement_debit:
            Number(row.movementDebit || row.mouvement_debit) || 0,
          mouvement_credit:
            Number(row.movementCredit || row.mouvement_credit) || 0,
          solde_debit: Number(row.closingDebit || row.solde_debit) || 0,
          solde_credit: Number(row.closingCredit || row.solde_credit) || 0,
        }));

        const storedBalance: StoredBalance = {
          data: balanceData,
          timestamp:
            balance.importedAt || balance.createdAt || new Date().toISOString(),
          type: balanceType,
          rowCount: balanceData.length,
          fileName: balance.fileName,
          id: balance.id, // Store balance ID for deletion
        };

        if (balanceType === "current") {
          backendBalances.current = storedBalance;
        } else if (balanceType === "previous") {
          backendBalances.previous = storedBalance;
        }
      });

      // Merge with localStorage balances (backend takes precedence)
      setStoredBalances({
        current: backendBalances.current || storedBalances.current,
        previous: backendBalances.previous || storedBalances.previous,
      });

      console.log("Final merged balances:", {
        current: backendBalances.current || storedBalances.current,
        previous: backendBalances.previous || storedBalances.previous,
      });
    } catch (error) {
      console.error(
        "Erreur lors du chargement des balances depuis le backend:",
        error,
      );
      // Don't show error to user, just log it
    }
  };

  const calculateBalances = (row: BalanceRow) => {
    return {
      solde_debit: row.entre_debit + row.mouvement_debit,
      solde_credit: row.entre_credit + row.mouvement_credit,
    };
  };

  const saveBalanceToStorage = (
    data: BalanceRow[],
    type: "current" | "previous",
    fileName?: string,
  ) => {
    // Balance data is now managed by backend
    // This function is kept for compatibility but doesn't save to localStorage
    console.log(`Balance ${type} mise à jour:`, {
      nombreLignes: data.length,
      fileName,
      premiereLigne: data[0],
    });

    if (type === "current") {
      setBalanceImported(true);
    }

    addToHistory(
      "Balance sauvegardée",
      `${type === "current" ? "Exercice courant" : "Exercice précédent"} - ${
        data.length
      } lignes`,
    );
  };

  const handleFileImport = async (file: File, type: "current" | "previous") => {
    if (!selectedFolder || !selectedFolder.id) {
      alert(
        "Aucun dossier d'exercice sélectionné. Veuillez d'abord sélectionner un client et un dossier d'exercice.",
      );
      return;
    }

    try {
      setImporting(true);
      setProgress(0);
      setImportType(type);
      setValidationResult(null);

      // First validate the file locally using FileValidationService
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
      }) as any[][];

      // Validation du fichier
      const validation = FileValidationService.validateBalanceFile(rawData);
      setValidationResult(validation);

      if (!validation.isValid) {
        const errorMessage =
          FileValidationService.formatValidationResult(validation);
        alert(errorMessage);
        return;
      }

      // Determine the correct folder for the balance type
      let targetFolderId = selectedFolder.id;

      if (type === "previous") {
        // For previous balance, we need to find or create the previous year's folder
        const previousYear = selectedFolder.fiscalYear - 1;

        // First try to find existing folder for previous year
        const allFolders = await folderService.getFoldersByClient(
          selectedFolder.clientId,
        );
        const previousFolder = allFolders.find(
          (f) => f.fiscalYear === previousYear,
        );

        if (previousFolder) {
          targetFolderId = previousFolder.id;
          console.log(
            "Using existing previous year folder:",
            previousFolder.id,
          );
        } else {
          // Create the previous year folder
          console.log("Creating previous year folder for year:", previousYear);
          const previousFolderData = await folderService.createFolder({
            name: `Exercice ${previousYear}`,
            description: `Dossier automatique pour balance précédente ${previousYear}`,
            clientId: selectedFolder.clientId,
            fiscalYear: previousYear,
            startDate: `${previousYear}-01-01`,
            endDate: `${previousYear}-12-31`,
          });
          targetFolderId = previousFolderData.id;
          console.log("Created previous year folder:", previousFolderData.id);
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", targetFolderId);
      formData.append("type", type);

      console.log("Uploading balance to backend:", {
        folderId: targetFolderId,
        type,
        fileName: file.name,
        selectedFolder: selectedFolder,
      });

      // Debug: Check FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Upload to backend
      const uploadResult = await clientService.uploadBalance(formData);

      console.log("Balance uploaded successfully:", uploadResult);

      // Balance ID is now managed by backend session
      // No need to store in localStorage

      // Mark as imported
      setBalanceImported(true);
      addToHistory(
        "Import balance",
        `${
          type === "current" ? "Exercice courant" : "Exercice précédent"
        } importé: ${file.name}`,
      );

      // Refresh balances from backend to show the newly uploaded balance
      await loadBalancesFromBackend();

      // Refresh balances from backend to check if both are now available
      await loadBalancesFromBackend();

      // Check if both balances are now available (this will be checked in useEffect or when user clicks button)
      // Auto-navigation will happen when the state updates
    } catch (error) {
      console.error("Erreur import:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'import du fichier.";
      alert(`Erreur lors de l'import: ${errorMessage}`);
    } finally {
      setImporting(false);
    }
  };

  const checkAndNavigateToTreatment = () => {
    // Both balances must be present before allowing navigation to traitement
    if (storedBalances.current && storedBalances.previous) {
      setBalanceProcessed(true);
      // Navigation avec ID d'action personnalisé
      navigate(`/web/user/traitement/${userId}/traitement`);
    } else {
      alert(
        "Les deux balances (courante et précédente) doivent être importées avant de commencer le traitement.",
      );
    }
  };

  const handleExport = (balance: StoredBalance) => {
    const columns = [
      "Comptes",
      "Libellés",
      "Entrée Débit",
      "Entrée Crédit",
      "Mouvement Débit",
      "Mouvement Crédit",
      "Sortie Débit",
      "Sortie Crédit",
      "Solde Débit",
      "Solde Crédit",
    ];

    const wb = XLSX.utils.book_new();
    const aoa = [
      columns,
      ...balance.data.map((row) => [
        row.compte,
        row.libelle,
        row.entre_debit,
        row.entre_credit,
        row.mouvement_debit,
        row.mouvement_credit,
        row.solde_debit,
        row.solde_credit,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, "Balance");

    const fileName = `balance_${balance.type}_${
      new Date(balance.timestamp).toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
    addToHistory("Export balance", `Balance ${balance.type} exportée`);
  };

  const handleDeleteBalance = async (type: "current" | "previous") => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la balance ${
          type === "current" ? "courante" : "précédente"
        } ?`,
      )
    ) {
      try {
        // Find the balance ID from stored balances
        const balanceToDelete =
          type === "current" ? storedBalances.current : storedBalances.previous;

        if (balanceToDelete && balanceToDelete.id) {
          // Delete from backend
          await clientService.deleteBalance(balanceToDelete.id);
          console.log(`Balance ${type} deleted from backend`);
        }

        // Balances are now managed by backend
        // No localStorage cleanup needed
        if (type === "current") {
          setBalanceImported(false);
        }

        addToHistory("Suppression balance", `Balance ${type} supprimée`);

        // Reload the entire app to reflect all changes
        window.location.reload();
      } catch (error) {
        console.error("Error deleting balance:", error);
        alert("Erreur lors de la suppression de la balance");
      }
    }
  };

  const handleViewBalance = (balance: StoredBalance) => {
    console.log("Visualisation balance:", {
      type: balance.type,
      nombreLignes: balance.data.length,
      premiereLigne: balance.data[0],
    });

    // Ouvrir l'éditeur en plein écran avec les données de la balance
    setEditorData({
      reportName: `Balance ${
        balance.type === "current" ? "Courante" : "Précédente"
      }`,
      reportId: "BALANCE",
      initialData: balance.data,
      balanceType: balance.type,
      fileName: balance.fileName,
    });
    setShowFullEditor(true);
    addToHistory(
      "Visualisation balance",
      `Balance ${balance.type} chargée dans l'éditeur (${balance.data.length} lignes)`,
    );
  };

  const handleEditorSave = (data: BalanceRow[]) => {
    if (editorData) {
      console.log("Sauvegarde depuis l'éditeur:", {
        nombreLignes: data.length,
        balanceType: editorData.balanceType,
        premiereLigne: data[0],
      });

      // Sauvegarder les données modifiées
      saveBalanceToStorage(data, editorData.balanceType, editorData.fileName);

      // Mettre à jour les données locales si nécessaire
      if (editorData.balanceType === "current") {
        setStoredBalances((prev) => ({
          ...prev,
          current: {
            ...prev.current!,
            data,
            timestamp: new Date().toISOString(),
          },
        }));
      } else {
        setStoredBalances((prev) => ({
          ...prev,
          previous: {
            ...prev.previous!,
            data,
            timestamp: new Date().toISOString(),
          },
        }));
      }

      addToHistory(
        "Balance modifiée",
        `Balance ${editorData.balanceType} mise à jour dans l'éditeur (${data.length} lignes)`,
      );
    }
  };

  const handleEditorBack = () => {
    console.log("Retour depuis l'éditeur");
    setShowFullEditor(false);
    setEditorData(null);
    // Recharger les balances au cas où elles auraient été modifiées
    loadStoredBalances();
  };

  const generateTemplateWorkbook = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "comptes",
        "libelle",
        "ouverture debit",
        "ouverture credit",
        "mouvement debit",
        "mouvement credit",
        "solde debit",
        "solde credit",
      ],
      ["101000", "Capital social", 0, 0, 0, 0, 0, 0],
      ["106100", "Réserve légale", 0, 0, 0, 0, 0, 0],
      ["120000", "Report à nouveau", 0, 0, 0, 0, 0, 0],
      ["211000", "Terrains", 0, 0, 0, 0, 0, 0],
    ]);

    ws["!cols"] = [
      { width: 15 },
      { width: 35 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Balance");
    return wb;
  };

  const downloadTemplate = () => {
    const wb = generateTemplateWorkbook();
    XLSX.writeFile(wb, "template_balance_syscohada.xlsx");
    addToHistory("Téléchargement", "Template balance téléchargé");
  };

  const openTemplateEditor = () => {
    const wb = generateTemplateWorkbook();
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const templateData: BalanceRow[] = data.slice(1).map((row: any) => {
      const balanceRow: BalanceRow = {
        compte: row[0]?.toString() || "",
        libelle: row[1]?.toString() || "",
        entre_debit: Number(row[2]) || 0,
        entre_credit: Number(row[3]) || 0,
        mouvement_debit: Number(row[4]) || 0,
        mouvement_credit: Number(row[5]) || 0,
      };

      const balances = calculateBalances(balanceRow);
      balanceRow.solde_debit = balances.solde_debit;
      balanceRow.solde_credit = balances.solde_credit;

      return balanceRow;
    });

    console.log("Template data:", templateData);

    // Ouvrir l'éditeur en plein écran avec le template
    setEditorData({
      reportName: "Balance Template",
      reportId: "BALANCE_TEMPLATE",
      initialData: templateData,
      balanceType: "current",
    });
    setShowFullEditor(true);
    addToHistory(
      "Template interactif",
      "Template balance ouvert dans l'éditeur",
    );
  };

  const ImportCard = ({
    type,
    title,
    description,
    year,
    isImported,
    isAvailable = true,
  }: {
    type: "current" | "previous";
    title: string;
    description: string;
    year?: number;
    isImported: boolean;
    isAvailable?: boolean;
  }) => (
    <Card
      className={`border-2 transition-all ${
        !isAvailable
          ? "border-gray-300 bg-gray-50 opacity-60"
          : isImported
            ? "border-green-200 bg-green-50"
            : "border-blue-200 bg-blue-50 hover:border-blue-300 cursor-pointer"
      }`}
      onClick={() => !isImported && isAvailable && setImportType(type)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                !isAvailable
                  ? "bg-gray-100 text-gray-400"
                  : isImported
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
              }`}
            >
              {!isAvailable ? (
                <XCircle className="h-5 w-5" />
              ) : isImported ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">
                {year ? `${year} - ${description}` : description}
              </p>
            </div>
          </div>
          <Badge
            variant={
              !isAvailable ? "outline" : isImported ? "default" : "outline"
            }
            className={
              !isAvailable
                ? "text-gray-500"
                : isImported
                  ? "bg-green-100 text-green-800"
                  : ""
            }
          >
            {!isAvailable
              ? "Indisponible"
              : isImported
                ? "Importé"
                : "À importer"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const FileUploadZone = () => (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-blue-50/30">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && importType) {
            setFile(file);
            handleFileImport(file, importType);
          }
        }}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="h-12 w-12 mx-auto mb-3 text-blue-600" />
        <p className="text-lg font-medium mb-2">
          Importer{" "}
          {importType === "current"
            ? "l'exercice courant"
            : "l'exercice précédent"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Glissez-déposez votre fichier Excel ou cliquez pour parcourir
        </p>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Choisir un fichier
        </Button>
      </label>
    </div>
  );

  // Composant pour la gestion des balances sauvegardées
  const SavedBalancesDialog = () => (
    <Dialog open={showBalancesDialog} onOpenChange={setShowBalancesDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Balances Sauvegardées
          </DialogTitle>
          <DialogDescription>
            Gérez vos balances importées précédemment
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Balance Courante */}
          <Card
            className={`border-2 ${
              storedBalances.current ? "border-blue-200" : "border-gray-200"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Exercice Courant</span>
                {storedBalances.current && (
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800"
                  >
                    Importé
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {storedBalances.current ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {storedBalances.current.fileName || "Balance courante"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {storedBalances.current.rowCount} lignes • Importé le{" "}
                      {new Date(
                        storedBalances.current.timestamp,
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewBalance(storedBalances.current!)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(storedBalances.current!)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBalance("current")}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune balance importée
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Précédente */}
          <Card
            className={`border-2 ${
              storedBalances.previous ? "border-orange-200" : "border-gray-200"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Exercice Précédent</span>
                {storedBalances.previous && (
                  <Badge
                    variant="default"
                    className="bg-orange-100 text-orange-800"
                  >
                    Importé
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {storedBalances.previous ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {storedBalances.previous.fileName || "Balance précédente"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {storedBalances.previous.rowCount} lignes • Importé le{" "}
                      {new Date(
                        storedBalances.previous.timestamp,
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleViewBalance(storedBalances.previous!)
                      }
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(storedBalances.previous!)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBalance("previous")}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune balance importée
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowBalancesDialog(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Si l'éditeur en plein écran est ouvert
  if (showFullEditor && editorData) {
    console.log("Ouverture de FullExcelEditor avec:", {
      reportName: editorData.reportName,
      dataLength: editorData.initialData.length,
      balanceType: editorData.balanceType,
    });

    return (
      <div className="fixed inset-0 bg-background z-50">
        <FullExcelEditor
          reportName={editorData.reportName}
          reportId={editorData.reportId}
          onSave={handleEditorSave}
          onBack={handleEditorBack}
          initialData={editorData.initialData}
          balanceType={editorData.balanceType}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Import des Balances</h1>
        <p className="text-muted-foreground mt-2">
          Importez vos balances comptables pour commencer le traitement
        </p>
        {!selectedFolder && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Avant d'importer :</strong> Veuillez d'abord
              sélectionner un client et un dossier d'exercice dans le menu
              "Exercice".
            </p>
          </div>
        )}
      </div>

      {/* Bouton pour voir les balances sauvegardées */}
      {(storedBalances.current || storedBalances.previous) && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShowBalancesDialog(true)}>
            <History className="h-4 w-4 mr-2" />
            Voir les balances sauvegardées
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <ImportCard
          type="current"
          title={`Exercice ${selectedFolder?.fiscalYear || "N"}`}
          description="Balance en cours - Obligatoire"
          year={selectedFolder?.fiscalYear}
          isImported={!!storedBalances.current}
          isAvailable={!!selectedFolder}
        />

        <ImportCard
          type="previous"
          title={`Exercice ${
            selectedFolder ? selectedFolder.fiscalYear - 1 : "N-1"
          }`}
          description="Balance précédente - Obligatoire"
          year={selectedFolder ? selectedFolder.fiscalYear - 1 : undefined}
          isImported={!!storedBalances.previous}
          isAvailable={!!selectedFolder}
        />
      </div>

      {importType && !storedBalances[importType] && <FileUploadZone />}

      {importing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import en cours...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {validationResult && !validationResult.isValid && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">
            {FileValidationService.formatValidationResult(validationResult)}
          </AlertDescription>
        </Alert>
      )}

      {storedBalances.current && storedBalances.previous && (
        <div className="text-center">
          <Button
            onClick={checkAndNavigateToTreatment}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Commencer le Traitement
          </Button>
        </div>
      )}

      {storedBalances.current && !storedBalances.previous && (
        <div className="text-center">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Balance précédente requise :</strong> Vous devez
              importer les deux balances (courante et précédente) avant de
              commencer le traitement.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4" />
              Template Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Télécharger le Template
            </Button>
            <Button
              onClick={openTemplateEditor}
              variant="outline"
              className="w-full"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Éditeur Interactif
            </Button>
            <p className="text-xs text-muted-foreground">
              Utilisez notre template pré-formaté ou l'éditeur interactif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Format SYSCOHADA à 6 chiffres</li>
              <li>• Les soldes sont calculés automatiquement</li>
              <li>• Supporte le copier-coller depuis Excel</li>
              <li>• Éditeur avancé disponible</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <SavedBalancesDialog />
    </div>
  );
}
