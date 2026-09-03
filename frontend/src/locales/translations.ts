// locales/translations.ts
export interface TranslationKeys {
  // Navigation
  dashboard: string;
  clients: string;
  exercises: string;
  reports: string;
  settings: string;
  exercise: string;
  importBalance: string;
  traitement: string;
  dsf: string;
  history: string;
  televersion: string;
  other: string;
  revueFiscal: string;
  ventilationConfig: string;
  invoiceScanner: string;
  trash: string;
  navGroupWorkflow: string;
  navGroupCompliance: string;
  navGroupAdmin: string;

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
  next: string;
  previous: string;
  back: string;
  submit: string;
  download: string;
  upload: string;

  // Authentication
  login: string;
  logout: string;
  register: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  country: string;
  legalForm: string;
  taxNumber: string;
  address: string;
  city: string;
  phone: string;
  forgotPassword: string;
  verifyOTP: string;
  otpCode: string;
  signIn: string;
  createAccount: string;
  registerAs: string;
  selectRole: string;
  companyName: string;

  // Client management
  clientManagement: string;
  addClient: string;
  clientName: string;
  clientCountry: string;
  selectCountry: string;
  noClientsFound: string;
  noClientSelected: string;
  selectClientFirst: string;
  selectCompany: string;
  selectEnterprise: string;

  // Exercise management
  exerciseManagement: string;
  addExercise: string;
  exerciseName: string;
  description: string;
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
  exerciseNamed: string;

  // Balance processing
  balanceProcessing: string;
  uploadBalance: string;
  currentBalance: string;
  previousBalance: string;
  balanceEquilibre: string;
  balanceNotEquilibre: string;
  processBalance: string;
  balanceProcessed: string;
  importBalances: string;

  // DSF
  dsfGeneration: string;
  dsfValidation: string;
  dsfExport: string;
  generateDSF: string;
  validateDSF: string;
  exportDSF: string;
  dsfImport: string;
  dsfNotes: string;

  // Reports
  allReports: string;
  balanceSheet: string;
  incomeStatement: string;
  taxTables: string;
  notes: string;
  signaletics: string;

  // Settings
  profileSettings: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  theme: string;
  language: string;
  lightMode: string;
  darkMode: string;
  accountSettings: string;

  // Messages
  success: string;
  warning: string;
  info: string;
  confirmDelete: string;
  operationCompleted: string;
  operationFailed: string;
  welcomeUser: string;
  connected: string;
  initializingAuth: string;

  // Validation
  requiredField: string;
  invalidDate: string;
  invalidEmail: string;
  duplicateEntry: string;
  passwordMismatch: string;

  // Workflow
  balanceImport: string;
  selectWorkflow: string;
  workflowDescription: string;
  chooseWorkflow: string;

  // General UI
  actions: string;
  view: string;
  refresh: string;
  reset: string;
  validateParameters: string;
  testCode: string;
  systemStatusCompliant: string;
  poweredBy: string;
  accountMappings: string;
  dsfConfig: string;
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    clients: "Clients",
    exercises: "Exercises",
    reports: "Reports",
    settings: "Settings",
    exercise: "Exercise",
    importBalance: "Balance",
    traitement: "Processing",
    dsf: "DSF",
    history: "History",
    televersion: "File Transfer",
    other: "Account Mapping",
    revueFiscal: "Fiscal Review",
    ventilationConfig: "Account Ventilation",
    invoiceScanner: "Invoice Scanner",
    trash: "Trash",
    navGroupWorkflow: "Accounting Workflow",
    navGroupCompliance: "Compliance & Filings",
    navGroupAdmin: "Administration",

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
    next: "Next",
    previous: "Previous",
    back: "Back",
    submit: "Submit",
    download: "Download",
    upload: "Upload",

    // Authentication
    login: "Login",
    logout: "Logout",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    phoneNumber: "Phone Number",
    firstName: "First Name",
    lastName: "Last Name",
    country: "Country",
    legalForm: "Legal Form",
    taxNumber: "Tax Number",
    address: "Address",
    city: "City",
    phone: "Phone",
    forgotPassword: "Forgot Password",
    verifyOTP: "Verify OTP",
    otpCode: "OTP Code",
    signIn: "Sign In",
    createAccount: "Create Account",
    registerAs: "Register as",
    selectRole: "Select a role",
    companyName: "Company Name",

    // Client management
    clientManagement: "Client Management",
    addClient: "Add Client",
    clientName: "Client Name",
    clientCountry: "Country",
    selectCountry: "Select Country",
    noClientsFound: "No clients found",
    noClientSelected: "No client selected",
    selectClientFirst: "Please select a client first",
    selectCompany: "Select Company",
    selectEnterprise: "Select Enterprise",

    // Exercise management
    exerciseManagement: "Exercise Management",
    addExercise: "Add Exercise",
    exerciseName: "Exercise Name",
    description: "Description",
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
    exerciseNamed: "Exercise named",

    // Balance processing
    balanceProcessing: "Balance Processing",
    uploadBalance: "Upload Balance",
    currentBalance: "Current Balance",
    previousBalance: "Previous Balance",
    balanceEquilibre: "Balance is balanced",
    balanceNotEquilibre: "Balance is not balanced",
    processBalance: "Process Balance",
    balanceProcessed: "Balance processed successfully",
    importBalances: "Import Balances",

    // DSF
    dsfGeneration: "DSF Generation",
    dsfValidation: "DSF Validation",
    dsfExport: "DSF Export",
    generateDSF: "Generate DSF",
    validateDSF: "Validate DSF",
    exportDSF: "Export DSF",
    dsfImport: "Import DSF",
    dsfNotes: "DSF Notes",

    // Reports
    allReports: "All Reports",
    balanceSheet: "Balance Sheet",
    incomeStatement: "Income Statement",
    taxTables: "Tax Tables",
    notes: "Notes",
    signaletics: "Signaletics",

    // Settings
    profileSettings: "Profile Settings",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    theme: "Theme",
    language: "Language",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    accountSettings: "Account Settings",

    // Messages
    success: "Success",
    warning: "Warning",
    info: "Information",
    confirmDelete: "Are you sure you want to delete this item?",
    operationCompleted: "Operation completed successfully",
    operationFailed: "Operation failed",
    welcomeUser: "Welcome",
    connected: "Connected",
    initializingAuth: "Initializing authentication...",

    // Validation
    requiredField: "This field is required",
    invalidDate: "Invalid date format",
    invalidEmail: "Invalid email address",
    duplicateEntry: "Duplicate entry",
    passwordMismatch: "Passwords do not match",

    // Workflow
    balanceImport: "Import Balances",
    selectWorkflow: "Select Workflow",
    workflowDescription: "Choose how you want to start this exercise",
    chooseWorkflow: "Choose workflow",

    // General UI
    actions: "Actions",
    view: "View",
    refresh: "Refresh",
    reset: "Reset",
    validateParameters: "Validate Parameters",
    testCode: "Test Code",
    systemStatusCompliant: "Compliant with SYSCOHADA standards",
    poweredBy: "Powered by nashsoft systems",
    accountMappings: "Account Mappings",
    dsfConfig: "DSF Configuration",
  },
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    clients: "Clients",
    exercises: "Exercices",
    reports: "Rapports",
    settings: "Paramètres",
    exercise: "Exercice",
    importBalance: "Balance",
    traitement: "Traitement",
    dsf: "DSF",
    history: "Historique",
    televersion: "Téléversion",
    other: "Mapping comptable",
    revueFiscal: "Revue Fiscale",
    ventilationConfig: "Ventilation des comptes",
    invoiceScanner: "Scanner de factures",
    trash: "Corbeille",
    navGroupWorkflow: "Workflow comptable",
    navGroupCompliance: "Déclarations & Conformité",
    navGroupAdmin: "Administration",

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
    next: "Suivant",
    previous: "Précédent",
    back: "Retour",
    submit: "Soumettre",
    download: "Télécharger",
    upload: "Téléverser",

    // Authentication
    login: "Connexion",
    logout: "Déconnexion",
    register: "S'inscrire",
    email: "E-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    phoneNumber: "Numéro de téléphone",
    firstName: "Prénom",
    lastName: "Nom",
    country: "Pays",
    legalForm: "Forme juridique",
    taxNumber: "Numéro fiscal",
    address: "Adresse",
    city: "Ville",
    phone: "Téléphone",
    forgotPassword: "Mot de passe oublié",
    verifyOTP: "Vérifier OTP",
    otpCode: "Code OTP",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    registerAs: "S'inscrire en tant que",
    selectRole: "Sélectionner un rôle",
    companyName: "Nom de l'entreprise",

    // Client management
    clientManagement: "Gestion des Clients",
    addClient: "Ajouter un Client",
    clientName: "Nom du Client",
    clientCountry: "Pays",
    selectCountry: "Sélectionner un Pays",
    noClientsFound: "Aucun client trouvé",
    noClientSelected: "Aucun client sélectionné",
    selectClientFirst: "Veuillez d'abord sélectionner un client",
    selectCompany: "Sélectionner une entreprise",
    selectEnterprise: "Sélectionner l'entreprise",

    // Exercise management
    exerciseManagement: "Gestion des Exercices",
    addExercise: "Ajouter un Exercice",
    exerciseName: "Nom de l'Exercice",
    description: "Description",
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
    exerciseNamed: "Exercice nommé",

    // Balance processing
    balanceProcessing: "Traitement des Balances",
    uploadBalance: "Téléverser la Balance",
    currentBalance: "Balance Courante",
    previousBalance: "Balance Précédente",
    balanceEquilibre: "Balance équilibrée",
    balanceNotEquilibre: "Balance non équilibrée",
    processBalance: "Traiter la Balance",
    balanceProcessed: "Balance traitée avec succès",
    importBalances: "Importer les Balances",

    // DSF
    dsfGeneration: "Génération DSF",
    dsfValidation: "Validation DSF",
    dsfExport: "Export DSF",
    generateDSF: "Générer DSF",
    validateDSF: "Valider DSF",
    exportDSF: "Exporter DSF",
    dsfImport: "Importer DSF",
    dsfNotes: "Notes DSF",

    // Reports
    allReports: "Tous les Rapports",
    balanceSheet: "Bilan",
    incomeStatement: "Compte de Résultat",
    taxTables: "Tableaux Fiscaux",
    notes: "Notes",
    signaletics: "Signalétique",

    // Settings
    profileSettings: "Paramètres du profil",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    theme: "Thème",
    language: "Langue",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    accountSettings: "Paramètres du compte",

    // Messages
    success: "Succès",
    warning: "Avertissement",
    info: "Information",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    operationCompleted: "Opération terminée avec succès",
    operationFailed: "L'opération a échoué",
    welcomeUser: "Bienvenue",
    connected: "Connecté",
    initializingAuth: "Initialisation de l'authentification...",

    // Validation
    requiredField: "Ce champ est obligatoire",
    invalidDate: "Format de date invalide",
    invalidEmail: "Adresse email invalide",
    duplicateEntry: "Entrée en double",
    passwordMismatch: "Les mots de passe ne correspondent pas",

    // Workflow
    balanceImport: "Importer les Balances",
    selectWorkflow: "Sélectionner le Workflow",
    workflowDescription:
      "Choisissez comment vous souhaitez commencer cet exercice",
    chooseWorkflow: "Choisir le workflow",

    // General UI
    actions: "Actions",
    view: "Voir",
    refresh: "Actualiser",
    reset: "Réinitialiser",
    validateParameters: "Valider les paramètres",
    testCode: "Code de test",
    systemStatusCompliant: "Conforme aux normes SYSCOHADA",
    poweredBy: "Fourni par nashsoft systems",
    accountMappings: "Mappages des comptes",
    dsfConfig: "Configuration DSF",
  },
};
