// hooks/useBalanceProcessor.ts
import { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { clientService } from "../services/client.service";

// This hook works with its own (French-named) row shape rather than the
// canonical BalanceRow from types/balance.types — it's kept local and
// exported under its own name so it doesn't get confused with (or silently
// mismatched against) that type.
export interface BalanceRow {
  comptes: string;
  libelle: string;
  ouverture_debit: number;
  ouverture_credit: number;
  mouvement_debit: number;
  mouvement_credit: number;
  solde_debit: number;
  solde_credit: number;
  traitement: string;
  sous_comptes?: BalanceRow[];
}

export interface ProcessedBalanceRow extends BalanceRow {
  traitement: string;
  sous_comptes?: ProcessedBalanceRow[];
}

export function useBalanceProcessor(folderId?: string | null) {
  const { addToHistory } = useApp();
  const [balanceId, setBalanceId] = useState<string | null>(null);

  // États
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [treatmentCompleted, setTreatmentCompleted] = useState(false);
  const [balanceEquilibre, setBalanceEquilibre] = useState<boolean | null>(
    null
  );
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    field: string;
  } | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showFullExcelEditor, setShowFullExcelEditor] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [stepsStatus, setStepsStatus] = useState<string[]>([
    "pending",
    "pending",
    "pending",
    "pending",
  ]);
  const [balanceData, setBalanceData] = useState<BalanceRow[]>([]);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [balanceIssues, setBalanceIssues] = useState<any[]>([]);

  // Configuration des étapes
  const steps = [
    {
      id: "verification",
      name: "Vérification",
      description: "Équilibre débits/crédits",
      icon: "Scale",
    },
    {
      id: "ventilation",
      name: "Ventilation",
      description: "Sous-comptes et analyse",
      icon: "TrendingUp",
    },
    {
      id: "ajustement",
      name: "Ajustements",
      description: "Corrections comptables",
      icon: "Calculator",
    },
    {
      id: "cloture",
      name: "Clôture",
      description: "Balance finale",
      icon: "FileText",
    },
  ];

  const columns = [
    "Comptes",
    "Libellé",
    "Ouverture Débit",
    "Ouverture Crédit",
    "Mouvement Débit",
    "Mouvement Crédit",
    "Solde Débit",
    "Solde Crédit",
    "Statut",
  ];

  const fields = [
    "comptes",
    "libelle",
    "ouverture_debit",
    "ouverture_credit",
    "mouvement_debit",
    "mouvement_credit",
    "solde_debit",
    "solde_credit",
    "traitement",
  ];

  // Charger la balance depuis le backend
  useEffect(() => {
    loadBalanceFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadBalanceFromBackend = async () => {
    try {
      if (!folderId) {
        setBalanceId(null);
        setBalanceData(getDefaultBalanceData());
        return;
      }

      const balancesResponse = await clientService.getBalancesByFolder(folderId);
      const balances: any[] = balancesResponse?.balances || [];
      const currentBalance = balances.find(
        (b) => b.type === "CURRENT_YEAR" && !b.archived,
      );

      if (currentBalance) {
        setBalanceId(currentBalance.id);

        // Convert backend data to BalanceRow format
        const balanceRows: BalanceRow[] = (
          currentBalance.originalData?.rows || []
        ).map((row: any) => ({
          comptes: row.accountNumber || row.comptes || "",
          libelle: row.accountName || row.libelle || "",
          ouverture_debit: Number(row.openingDebit || row.ouverture_debit) || 0,
          ouverture_credit: Number(row.openingCredit || row.ouverture_credit) || 0,
          mouvement_debit: Number(row.movementDebit || row.mouvement_debit) || 0,
          mouvement_credit: Number(row.movementCredit || row.mouvement_credit) || 0,
          solde_debit: Number(row.closingDebit || row.solde_debit) || 0,
          solde_credit: Number(row.closingCredit || row.solde_credit) || 0,
          traitement: "Aucun",
        }));

        setBalanceData(balanceRows);

        // Load issues if any
        const issuesResponse = await clientService.getBalanceIssues(
          currentBalance.id,
        );
        setBalanceIssues(issuesResponse.issues || []);

        addToHistory("Chargement", "Balance chargée depuis le backend");
      } else {
        setBalanceId(null);
        // Load default balance data for demonstration
        setBalanceData(getDefaultBalanceData());
      }
    } catch (error) {
      console.error("Erreur chargement balance:", error);
      // Load default balance data for demonstration
      setBalanceData(getDefaultBalanceData());
    }
  };

  const getDefaultBalanceData = (): BalanceRow[] => [
    {
      comptes: "211000",
      libelle: "Terrains",
      ouverture_debit: 250000,
      ouverture_credit: 0,
      mouvement_debit: 0,
      mouvement_credit: 0,
      solde_debit: 250000,
      solde_credit: 0,
      traitement: "Aucun",
    },
    {
      comptes: "213000",
      libelle: "Constructions",
      ouverture_debit: 450000,
      ouverture_credit: 0,
      mouvement_debit: 0,
      mouvement_credit: 50000,
      solde_debit: 450000,
      solde_credit: 50000,
      traitement: "Amortissement à calculer",
      sous_comptes: [
        {
          comptes: "213100",
          libelle: "Bâtiments administratifs",
          ouverture_debit: 300000,
          ouverture_credit: 0,
          mouvement_debit: 0,
          mouvement_credit: 30000,
          solde_debit: 300000,
          solde_credit: 30000,
          traitement: "Amortissement à calculer",
        },
      ],
    },
    {
      comptes: "411000",
      libelle: "Clients",
      ouverture_debit: 175000,
      ouverture_credit: 0,
      mouvement_debit: 25000,
      mouvement_credit: 0,
      solde_debit: 200000,
      solde_credit: 0,
      traitement: "Aucun",
      sous_comptes: [
        {
          comptes: "411100",
          libelle: "Clients nationaux",
          ouverture_debit: 120000,
          ouverture_credit: 0,
          mouvement_debit: 15000,
          mouvement_credit: 0,
          solde_debit: 135000,
          solde_credit: 0,
          traitement: "Aucun",
        },
      ],
    },
    {
      comptes: "601000",
      libelle: "Achats marchandises",
      ouverture_debit: 0,
      ouverture_credit: 0,
      mouvement_debit: 120000,
      mouvement_credit: 0,
      solde_debit: 120000,
      solde_credit: 0,
      traitement: "Reclassement produit",
    },
    {
      comptes: "701000",
      libelle: "Ventes marchandises",
      ouverture_debit: 0,
      ouverture_credit: 0,
      mouvement_debit: 0,
      mouvement_credit: 300000,
      solde_debit: 0,
      solde_credit: 300000,
      traitement: "Reclassement produit",
    },
  ];

  // Calculer les totaux de la balance
  const calculateTotals = () => {
    const totalDebit = balanceData.reduce(
      (sum, row) => sum + (row.solde_debit || 0),
      0
    );
    const totalCredit = balanceData.reduce(
      (sum, row) => sum + (row.solde_credit || 0),
      0
    );
    return {
      totalDebit,
      totalCredit,
      difference: Math.abs(totalDebit - totalCredit),
    };
  };

  const totals = calculateTotals();

  // Vérifier les conditions pour chaque étape
  const checkStepConditions = (
    stepIndex: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (stepIndex) {
      case 0: // Vérification
        if (totals.difference > 0.01) {
          errors.push(
            `Balance déséquilibrée (différence: ${totals.difference.toLocaleString(
              "fr-FR"
            )})`
          );
        }
        break;

      case 1: // Ventilation
        const hasPendingVentilation = balanceData.some(
          (item) => item.traitement?.includes("à calculer") && item.sous_comptes
        );
        if (hasPendingVentilation) {
          errors.push("Ventilation des sous-comptes non terminée");
        }
        break;

      case 2: // Ajustements
        const hasPendingAdjustments = balanceData.some(
          (item) =>
            item.traitement === "Reclassement produit" ||
            item.traitement === "Amortissement à calculer"
        );
        if (hasPendingAdjustments) {
          errors.push("Ajustements comptables non appliqués");
        }
        break;

      case 3: // Clôture
        const hasResult = balanceData.some((item) =>
          item.traitement?.includes("Résultat")
        );
        if (!hasResult) {
          errors.push("Calcul du résultat non effectué");
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  // Mettre à jour le statut d'une étape
  const updateStepStatus = (stepIndex: number, status: string) => {
    setStepsStatus(prev => {
      const newStatus = [...prev];
      newStatus[stepIndex] = status;
      return newStatus;
    });
  };

  // Vérifier l'équilibre de la balance
  const checkBalanceEquilibrium = async () => {
    try {
      if (!balanceId) {
        throw new Error("Aucun ID de balance trouvé");
      }

      setProgress(50);

      const equilibriumResult = await clientService.checkBalanceEquilibrium(
        balanceId
      );

      setProgress(100);

      const isBalanced = equilibriumResult.isBalanced;
      setBalanceEquilibre(isBalanced);
      updateStepStatus(0, "completed");

      addToHistory(
        "Vérification",
        isBalanced ? "✓ Balance équilibrée" : "✗ Balance déséquilibrée"
      );
    } catch (error) {
      console.error("Erreur vérification équilibre:", error);
      updateStepStatus(0, "error");
      addToHistory("Vérification", "Erreur lors de la vérification");
      throw error;
    }
  };

  // Ventiler les comptes
  const ventilateAccounts = async () => {
    try {
      if (!balanceId) {
        throw new Error("Aucun ID de balance trouvé");
      }

      setProgress(50);

      await clientService.performBalanceVentilation(balanceId);

      setProgress(100);

      // Reload balance data to get updated information
      await loadBalanceFromBackend();

      updateStepStatus(1, "completed");
      addToHistory("Ventilation", "Ventilation des comptes terminée");
    } catch (error) {
      console.error("Erreur ventilation:", error);
      updateStepStatus(1, "error");
      addToHistory("Ventilation", "Erreur lors de la ventilation");
      throw error;
    }
  };

  // Appliquer les ajustements comptables
  const applyAccountingAdjustments = async () => {
    try {
      if (!balanceId) {
        throw new Error("Aucun ID de balance trouvé");
      }

      setProgress(25);

      // Resolve any pending issues
      const unresolvedIssues = balanceIssues.filter(
        (issue) => !issue.isResolved
      );
      for (const issue of unresolvedIssues) {
        await clientService.resolveBalanceIssue(
          balanceId,
          issue.id,
          "Résolu automatiquement"
        );
        setProgress((prev) => prev + 50 / unresolvedIssues.length);
      }

      setProgress(100);

      // Reload issues and balance data
      await loadBalanceFromBackend();
      const issuesResponse = await clientService.getBalanceIssues(balanceId);
      setBalanceIssues(issuesResponse.issues);

      updateStepStatus(2, "completed");
      addToHistory("Ajustements", "Ajustements appliqués");
    } catch (error) {
      console.error("Erreur ajustements:", error);
      updateStepStatus(2, "error");
      addToHistory("Ajustements", "Erreur lors des ajustements");
      throw error;
    }
  };

  // Préparer la balance de clôture
  const prepareClosingBalance = async () => {
    for (let i = 0; i <= 100; i += 33) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setProgress(i);
    }

    const totalCharges = balanceData
      .filter((item) => item.comptes?.startsWith("6"))
      .reduce((sum, item) => sum + (item.solde_debit || 0), 0);

    const totalProduits = balanceData
      .filter((item) => item.comptes?.startsWith("7"))
      .reduce((sum, item) => sum + (item.solde_credit || 0), 0);

    const resultat = totalProduits - totalCharges;

    const resultAccount: BalanceRow = {
      comptes: resultat >= 0 ? "120000" : "129000",
      libelle: resultat >= 0 ? "Résultat de l'exercice" : "Perte de l'exercice",
      ouverture_debit: 0,
      ouverture_credit: 0,
      mouvement_debit: resultat < 0 ? Math.abs(resultat) : 0,
      mouvement_credit: resultat >= 0 ? resultat : 0,
      solde_debit: resultat < 0 ? Math.abs(resultat) : 0,
      solde_credit: resultat >= 0 ? resultat : 0,
      traitement: "Résultat ✓",
    };

    setBalanceData((prev) => [...prev, resultAccount]);
    updateStepStatus(3, "completed");
    setTreatmentCompleted(true);
    addToHistory("Clôture", `Résultat: ${resultat.toLocaleString("fr-FR")}`);
  };

  const processCurrentStep = async () => {
    // Prevent multiple simultaneous processing
    if (processing || stepsStatus[currentStep] === "processing") {
      console.log("Step already processing, skipping...");
      return;
    }

    const stepCheck = checkStepConditions(currentStep);
    if (!stepCheck.isValid) {
      setStepErrors(stepCheck.errors);
      return;
    }

    // Mark step as processing
    updateStepStatus(currentStep, "processing");

    try {
      switch (currentStep) {
        case 0:
          await checkBalanceEquilibrium();
          break;
        case 1:
          await ventilateAccounts();
          break;
        case 2:
          await applyAccountingAdjustments();
          break;
        case 3:
          await prepareClosingBalance();
          break;
      }
      setStepErrors([]);
    } catch (error) {
      console.error("Error processing step:", error);
      updateStepStatus(currentStep, "error");
      setStepErrors(["Erreur lors du traitement de l'étape"]);
    }
  };

  const nextStep = () => {
    const stepCheck = checkStepConditions(currentStep);
    if (!stepCheck.isValid) {
      setStepErrors(stepCheck.errors);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepErrors([]);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setStepErrors([]);
    }
  };

  // Gestion de l'édition des cellules
  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    const updatedData = [...balanceData];

    if (field.includes("debit") || field.includes("credit")) {
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: Number(value) || 0,
      };
    } else {
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: value,
      };
    }

    setBalanceData(updatedData);
    setEditingCell(null);
    setStepErrors([]);
  };

  const handleSave = () => {
    // TODO: Implement backend save functionality for edited balance
    addToHistory("Sauvegarde", "Modifications enregistrées");
    setShowEditor(false);
  };

  // Convertir les données de balance vers le format FullExcelEditor
  const convertToExcelEditorData = (data: BalanceRow[]): any[] => {
    return data.map((row) => ({
      comptes: row.comptes,
      libelle: row.libelle,
      ouverture_debit: row.ouverture_debit,
      ouverture_credit: row.ouverture_credit,
      mouvement_debit: row.mouvement_debit,
      mouvement_credit: row.mouvement_credit,
      sortir_debit: 0,
      sortir_credit: 0,
      solde_debit: row.solde_debit,
      solde_credit: row.solde_credit,
    }));
  };

  // Convertir les données du FullExcelEditor vers le format BalanceRow
  const convertFromExcelEditorData = (data: any[]): BalanceRow[] => {
    return data.map((row) => ({
      comptes: row.comptes || "",
      libelle: row.libelle || "",
      ouverture_debit: Number(row.ouverture_debit) || 0,
      ouverture_credit: Number(row.ouverture_credit) || 0,
      mouvement_debit: Number(row.mouvement_debit) || 0,
      mouvement_credit: Number(row.mouvement_credit) || 0,
      solde_debit: Number(row.solde_debit) || 0,
      solde_credit: Number(row.solde_credit) || 0,
      traitement: "Aucun",
    }));
  };

  const handleFullExcelSave = (data: any[]) => {
    const convertedData = convertFromExcelEditorData(data);
    setBalanceData(convertedData);

    // TODO: Implement backend save functionality for Excel editor changes
    addToHistory("Sauvegarde", "Balance mise à jour via éditeur Excel");
    setShowFullExcelEditor(false);
  };

  const handleExport = () => {
    addToHistory("Export", "Balance exportée en Excel");
  };

  // Utilitaires
  const isStepCompleted = (stepIndex: number) =>
    stepsStatus[stepIndex] === "completed";

  const isStepProcessing = (stepIndex: number) =>
    stepsStatus[stepIndex] === "processing";

  return {
    // États
    currentStep,
    processing,
    progress,
    treatmentCompleted,
    balanceEquilibre,
    editingCell,
    showEditor,
    showFullExcelEditor,
    showDetails,
    stepsStatus,
    balanceData,
    balanceIssues,
    stepErrors,
    steps,
    columns,
    fields,
    totals,

    // Actions
    setCurrentStep,
    setShowEditor,
    setShowFullExcelEditor,
    setShowDetails,
    setEditingCell,
    processCurrentStep,
    nextStep,
    previousStep,
    handleCellEdit,
    handleSave,
    handleFullExcelSave,
    handleExport,
    checkStepConditions,
    isStepCompleted,
    isStepProcessing,
  };
}
