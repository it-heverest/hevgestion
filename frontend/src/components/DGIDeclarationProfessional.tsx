import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { dgiDeclarationService } from "../services/dgi-declaration.service";
import { dgiService } from "../services/dgi.service";
import {
  Upload,
  CheckCircle,
  Loader2,
  FileText,
  Download,
  Settings,
  Building,
  User,
  Calendar,
  Shield,
  AlertCircle,
  History,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function DGIDeclarationProfessional() {
  const { user } = useAuth();
  const { selectedClient, selectedFolder } = useApp();

  const [loading, setLoading] = useState(false);
  const [declarationResult, setDeclarationResult] = useState<{
    number: string;
    date: string;
    timestamp: string;
  } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [dgiLoginLoading, setDgiLoginLoading] = useState(false);
  const [dgiLoginStatus, setDgiLoginStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [dgiProcesses, setDgiProcesses] = useState<any[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [config, setConfig] = useState({
    companyName: "",
    niu: "",
    username: "",
    password: "",
  });

  const [declarationHistory, setDeclarationHistory] = useState<any[]>([]);

  // Vérifier si un modal est ouvert
  const isModalOpen = showConfig || showHistory;

  useEffect(() => {
    if (user?.id) {
      loadDGIConfig();
      loadDeclarationHistory();
    }
  }, [user?.id]);

  const loadDGIConfig = async () => {
    if (!user?.id) return;
    try {
      setConfigLoading(true);
      const dgiConfig = await dgiDeclarationService.getConfig(user.id);
      if (dgiConfig) {
        setConfig({
          companyName: dgiConfig.companyName,
          niu: dgiConfig.niu,
          username: dgiConfig.username,
          password: dgiConfig.password,
        });
      }
    } catch (error) {
      console.error("Error loading DGI config:", error);
      // Pas d'alerte pour une config non trouvée (cas normal)
    } finally {
      setConfigLoading(false);
    }
  };

  const loadDeclarationHistory = async () => {
    if (!user?.id) return;
    try {
      const history = await dgiDeclarationService.getDeclarationHistory(
        user.id
      );
      setDeclarationHistory(history);
    } catch (error) {
      console.error("Error loading declaration history:", error);
      // Pas d'alerte pour l'historique vide
    }
  };

  const currentExercise = selectedFolder
    ? {
        year: selectedFolder.fiscalYear.toString(),
        period: `${selectedFolder.startDate.split("T")[0]} - ${
          selectedFolder.endDate.split("T")[0]
        }`,
        status: selectedFolder.status === "DSF_GENERATED" ? "ready" : "pending",
        dueDate: new Date(selectedFolder.endDate).toLocaleDateString("fr-FR"),
      }
    : null;

  const handleSubmitDSF = async () => {
    if (!selectedFolder || !user?.id) {
      alert("❌ Veuillez sélectionner un dossier et vous connecter");
      return;
    }

    if (currentExercise?.status !== "ready") {
      alert("⚠️ Le dossier n'est pas encore prêt pour la déclaration");
      return;
    }

    if (
      !config.companyName ||
      !config.niu ||
      !config.username ||
      !config.password
    ) {
      alert(
        "🔧 Configuration DGI requise\nVeuillez configurer vos identifiants DGI avant de déclarer"
      );
      setShowConfig(true);
      return;
    }

    setLoading(true);

    try {
      const result = await dgiDeclarationService.submitDeclaration(
        selectedFolder.id,
        user.id
      );

      setDeclarationResult({
        number: result.number,
        date: result.date,
        timestamp: result.timestamp,
      });

      await loadDeclarationHistory();

      alert(
        `✅ Déclaration transmise avec succès !\n\nNuméro: ${result.number}\nDate: ${result.date} à ${result.timestamp}`
      );
    } catch (error: any) {
      console.error("Declaration error:", error);
      alert(
        `❌ Erreur lors de la soumission:\n${
          error.message || "Une erreur est survenue lors de la transmission"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!user?.id) return;

    // Validation des champs
    if (!config.companyName.trim()) {
      alert("❌ Veuillez saisir le nom de l'entreprise");
      return;
    }
    if (!config.niu.trim()) {
      alert("❌ Veuillez saisir le numéro NIU");
      return;
    }
    if (!config.username.trim()) {
      alert("❌ Veuillez saisir le nom d'utilisateur DGI");
      return;
    }
    if (!config.password.trim()) {
      alert("❌ Veuillez saisir le mot de passe API");
      return;
    }

    try {
      setConfigLoading(true);
      await dgiDeclarationService.saveConfig({
        ...config,
        userId: user.id,
      });
      setShowConfig(false);
      alert("✅ Configuration sauvegardée avec succès");
    } catch (error: any) {
      console.error("Save config error:", error);
      alert(
        `❌ Erreur lors de la sauvegarde:\n${
          error.message || "Impossible de sauvegarder la configuration"
        }`
      );
    } finally {
      setConfigLoading(false);
    }
  };

  const handleTestDGILogin = async () => {
    if (!config.username.trim() || !config.password.trim()) {
      alert("❌ Veuillez saisir le nom d'utilisateur et le mot de passe DGI");
      return;
    }

    try {
      setDgiLoginLoading(true);
      setDgiLoginStatus(null);

      const result = await dgiService.login(config.username, config.password);

      setDgiLoginStatus({
        success: true,
        message: "✅ Connexion DGI réussie ! Token obtenu.",
      });

      alert("✅ Connexion DGI réussie ! Vos identifiants sont valides.");
    } catch (error: any) {
      console.error("DGI login test error:", error);
      setDgiLoginStatus({
        success: false,
        message: error.message || "❌ Échec de la connexion DGI",
      });

      alert(
        `❌ Échec de la connexion DGI:\n${
          error.message || "Identifiants invalides"
        }`
      );
    } finally {
      setDgiLoginLoading(false);
    }
  };

  const handleLoadDGIProcesses = async () => {
    try {
      setLoadingProcesses(true);
      let result;

      if (selectedYear && selectedYear.trim()) {
        result = await dgiService.getProcessesByYear(selectedYear.trim());
      } else {
        result = await dgiService.getProcesses();
      }

      setDgiProcesses(result.records);
      alert(
        `✅ ${result.total} processus DGI chargés${
          selectedYear ? ` pour ${selectedYear}` : ""
        }`
      );
    } catch (error: any) {
      console.error("Load DGI processes error:", error);
      alert(
        `❌ Erreur lors du chargement des processus DGI:\n${error.message}`
      );
    } finally {
      setLoadingProcesses(false);
    }
  };

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun dossier sélectionné
          </h1>
          <p className="text-gray-600">
            Veuillez sélectionner un dossier comptable pour accéder à la
            téléversion DGI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300`}>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40"
          style={{ backdropFilter: "blur(2px)" }}
        />
      )}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Téléversion DGI
          </h1>
          <p className="text-gray-600">
            Déclaration fiscale - Exercice {currentExercise.year}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Déclaration DSF {currentExercise.year}
              </h2>
              <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                Période: {currentExercise.period}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowConfig(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Entreprise</h3>
              </div>
              <p className="text-gray-900 font-medium">
                {selectedClient?.name || config.companyName || "Non configuré"}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                NIU: {config.niu || "Non configuré"}
              </p>
              {!config.companyName && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Configuration requise
                </p>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Échéance</h3>
              </div>
              <p className="text-gray-900 font-medium">
                {currentExercise.dueDate}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Exercice {currentExercise.year}
              </p>
            </div>
          </div>

          {/* Status */}
          <div
            className={`border rounded-lg p-4 mb-6 ${
              currentExercise.status === "ready"
                ? "border-green-200 bg-green-50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`w-5 h-5 ${
                  currentExercise.status === "ready"
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              />
              <span
                className={`font-medium ${
                  currentExercise.status === "ready"
                    ? "text-green-800"
                    : "text-orange-800"
                }`}
              >
                {currentExercise.status === "ready"
                  ? "Prêt à déclarer"
                  : "En préparation"}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <button
              onClick={handleSubmitDSF}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transmission en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Déclarer à la DGI
                </>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  alert(
                    "📥 Fonctionnalité d'accusé de réception bientôt disponible"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Accusé
              </button>
              <button
                onClick={() =>
                  alert(
                    "📊 Fonctionnalité de rapport détaillé bientôt disponible"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Rapport
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Transmission sécurisée
              </h3>
              <p className="text-gray-600 text-sm">
                Données chiffrées et transmises via un canal sécurisé conforme
                aux normes DGI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Configuration DGI
              </h2>
              <button
                onClick={() => setShowConfig(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) =>
                    setConfig({ ...config, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro NIU
                </label>
                <input
                  type="text"
                  value={config.niu}
                  onChange={(e) =>
                    setConfig({ ...config, niu: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="M000000000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur DGI
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) =>
                    setConfig({ ...config, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="utilisateur@entreprise.cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe API
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={config.password}
                    onChange={(e) =>
                      setConfig({ ...config, password: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mot de passe DGI"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Test DGI Login Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleTestDGILogin}
                  disabled={dgiLoginLoading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {dgiLoginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Test de connexion...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Tester la connexion DGI
                    </>
                  )}
                </button>
                {dgiLoginStatus && (
                  <p
                    className={`text-sm mt-2 ${
                      dgiLoginStatus.success ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {dgiLoginStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={configLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {configLoading ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-auto max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Historique des déclarations
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    placeholder="Année (ex: 2024)"
                    className="px-2 py-1 text-sm border border-gray-300 rounded w-24"
                  />
                  <button
                    onClick={handleLoadDGIProcesses}
                    disabled={loadingProcesses}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingProcesses ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    Charger DGI
                  </button>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Local Declarations */}
              {declarationHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    Déclarations locales
                  </h3>
                  <div className="space-y-3">
                    {declarationHistory.map((decl, index) => (
                      <div
                        key={decl.id || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Déclaration DSF {decl.fiscalYear}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              decl.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : decl.status === "PENDING"
                                ? "bg-orange-100 text-orange-800"
                                : decl.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {decl.status === "APPROVED"
                              ? "Approuvée"
                              : decl.status === "PENDING"
                              ? "En attente"
                              : decl.status === "REJECTED"
                              ? "Rejetée"
                              : "Soumise"}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {new Date(decl.submittedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                        <p className="font-mono text-sm text-gray-900">
                          {decl.declarationNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DGI Processes */}
              {dgiProcesses.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    Processus DGI ({dgiProcesses.length})
                  </h3>
                  <div className="space-y-3">
                    {dgiProcesses.map((process, index) => (
                      <div
                        key={process.id || index}
                        className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Processus DGI
                          </h4>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            DGI
                          </span>
                        </div>
                        <p className="font-mono text-sm text-gray-900">
                          ID: {process.id || "N/A"}
                        </p>
                        <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                          {JSON.stringify(process, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {declarationHistory.length === 0 && dgiProcesses.length === 0 && (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune déclaration trouvée</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Cliquez sur "Charger DGI" pour voir les processus DGI
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
