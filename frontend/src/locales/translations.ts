// locales/translations.ts
export interface TranslationKeys {
  // Navigation
  dashboard: string;
  clients: string;
  exercises: string;
  reports: string;
  settings: string;

  // Common
  loading: string;
  error: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  create: string;
  close: string;
  open: string;
  yes: string;
  no: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  show: string;
  hide: string;
  subAccounts: string;

  // Client management
  clientManagement: string;
  addClient: string;
  clientName: string;
  clientCountry: string;
  selectCountry: string;
  noClientsFound: string;
  noClientSelected: string;
  selectClientFirst: string;

  // Exercise management
  exerciseManagement: string;
  addExercise: string;
  exerciseName: string;
  fiscalYear: string;
  startDate: string;
  endDate: string;
  status: string;
  active: string;
  closed: string;
  draft: string;
  completed: string;
  duplicateExercise: string;
  selectYear: string;
  selectFolderDescription: string;

  // Balance processing
  balanceProcessing: string;
  uploadBalance: string;
  currentBalance: string;
  previousBalance: string;
  balanceEquilibre: string;
  balanceNotEquilibre: string;
  processBalance: string;
  balanceProcessed: string;

  // DSF
  dsfGeneration: string;
  dsfValidation: string;
  dsfExport: string;
  generateDSF: string;
  validateDSF: string;
  exportDSF: string;

  // Reports
  allReports: string;
  balanceSheet: string;
  incomeStatement: string;
  taxTables: string;
  notes: string;
  signaletics: string;

  // Messages
  success: string;
  warning: string;
  info: string;
  confirmDelete: string;
  operationCompleted: string;
  operationFailed: string;

  // Validation
  requiredField: string;
  invalidDate: string;
  invalidEmail: string;
  duplicateEntry: string;

  // Workflow
  balanceImport: string;
  dsfImport: string;
  selectWorkflow: string;
  workflowDescription: string;
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    clients: "Clients",
    exercises: "Exercises",
    reports: "Reports",
    settings: "Settings",

    // Common
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    show: "Show",
    hide: "Hide",
    subAccounts: "sub-accounts",

    // Client management
    clientManagement: "Client Management",
    addClient: "Add Client",
    clientName: "Client Name",
    clientCountry: "Country",
    selectCountry: "Select Country",
    noClientsFound: "No clients found",
    noClientSelected: "No client selected",
    selectClientFirst: "Please select a client first",

    // Exercise management
    exerciseManagement: "Exercise Management",
    addExercise: "Add Exercise",
    exerciseName: "Exercise Name",
    fiscalYear: "Fiscal Year",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    active: "Active",
    closed: "Closed",
    draft: "Draft",
    completed: "Completed",
    duplicateExercise: "Duplicate Exercise",
    selectYear: "Select Year",
    selectFolderDescription: "Select, close or reopen your accounting folders",

    // Balance processing
    balanceProcessing: "Balance Processing",
    uploadBalance: "Upload Balance",
    currentBalance: "Current Balance",
    previousBalance: "Previous Balance",
    balanceEquilibre: "Balance is balanced",
    balanceNotEquilibre: "Balance is not balanced",
    processBalance: "Process Balance",
    balanceProcessed: "Balance processed successfully",

    // DSF
    dsfGeneration: "DSF Generation",
    dsfValidation: "DSF Validation",
    dsfExport: "DSF Export",
    generateDSF: "Generate DSF",
    validateDSF: "Validate DSF",
    exportDSF: "Export DSF",

    // Reports
    allReports: "All Reports",
    balanceSheet: "Balance Sheet",
    incomeStatement: "Income Statement",
    taxTables: "Tax Tables",
    notes: "Notes",
    signaletics: "Signaletics",

    // Messages
    success: "Success",
    warning: "Warning",
    info: "Information",
    confirmDelete: "Are you sure you want to delete this item?",
    operationCompleted: "Operation completed successfully",
    operationFailed: "Operation failed",

    // Validation
    requiredField: "This field is required",
    invalidDate: "Invalid date format",
    invalidEmail: "Invalid email address",
    duplicateEntry: "Duplicate entry",

    // Workflow
    balanceImport: "Import Balances",
    dsfImport: "Import DSF",
    selectWorkflow: "Select Workflow",
    workflowDescription: "Choose how you want to start this exercise",
  },
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    clients: "Clients",
    exercises: "Exercices",
    reports: "Rapports",
    settings: "Paramètres",

    // Common
    loading: "Chargement...",
    error: "Erreur",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    close: "Fermer",
    open: "Ouvrir",
    yes: "Oui",
    no: "Non",
    search: "Rechercher",
    filter: "Filtrer",
    export: "Exporter",
    import: "Importer",
    show: "Afficher",
    hide: "Masquer",
    subAccounts: "sous-comptes",

    // Client management
    clientManagement: "Gestion des Clients",
    addClient: "Ajouter un Client",
    clientName: "Nom du Client",
    clientCountry: "Pays",
    selectCountry: "Sélectionner un Pays",
    noClientsFound: "Aucun client trouvé",
    noClientSelected: "Aucun client sélectionné",
    selectClientFirst: "Veuillez d'abord sélectionner un client",

    // Exercise management
    exerciseManagement: "Gestion des Exercices",
    addExercise: "Ajouter un Exercice",
    exerciseName: "Nom de l'Exercice",
    fiscalYear: "Année Fiscale",
    startDate: "Date de Début",
    endDate: "Date de Fin",
    status: "Statut",
    active: "Actif",
    closed: "Fermé",
    draft: "Brouillon",
    completed: "Terminé",
    duplicateExercise: "Dupliquer l'Exercice",
    selectYear: "Sélectionner l'Année",
    selectFolderDescription:
      "Sélectionnez, clôturez ou réouvrez vos dossiers comptables",

    // Balance processing
    balanceProcessing: "Traitement des Balances",
    uploadBalance: "Téléverser la Balance",
    currentBalance: "Balance Courante",
    previousBalance: "Balance Précédente",
    balanceEquilibre: "Balance équilibrée",
    balanceNotEquilibre: "Balance non équilibrée",
    processBalance: "Traiter la Balance",
    balanceProcessed: "Balance traitée avec succès",

    // DSF
    dsfGeneration: "Génération DSF",
    dsfValidation: "Validation DSF",
    dsfExport: "Export DSF",
    generateDSF: "Générer DSF",
    validateDSF: "Valider DSF",
    exportDSF: "Exporter DSF",

    // Reports
    allReports: "Tous les Rapports",
    balanceSheet: "Bilan",
    incomeStatement: "Compte de Résultat",
    taxTables: "Tableaux Fiscaux",
    notes: "Notes",
    signaletics: "Signalétique",

    // Messages
    success: "Succès",
    warning: "Avertissement",
    info: "Information",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    operationCompleted: "Opération terminée avec succès",
    operationFailed: "L'opération a échoué",

    // Validation
    requiredField: "Ce champ est obligatoire",
    invalidDate: "Format de date invalide",
    invalidEmail: "Adresse email invalide",
    duplicateEntry: "Entrée en double",

    // Workflow
    balanceImport: "Importer les Balances",
    dsfImport: "Importer DSF",
    selectWorkflow: "Sélectionner le Workflow",
    workflowDescription:
      "Choisissez comment vous souhaitez commencer cet exercice",
  },
};
