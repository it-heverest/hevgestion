// components/StepByStepProcessor.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import {
  CheckCircle2,
  Play,
  Save,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Scale,
  AlertTriangle,
  Edit,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { FullExcelEditor } from "./FullExcelEditor";
import { useBalanceProcessor, BalanceRow } from "../hooks/useBalanceProcessor";
import { useApp } from "../contexts/AppContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  Building2,
  Calendar,
  MapPin,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface BalanceTreatmentProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export function StepByStepProcessor({
  onComplete,
  onBack,
}: BalanceTreatmentProps) {
  const {
    selectedClient,
    selectedFolder,
    currentFolder,
    previousFolder,
    getCountryName,
    getCountryFlag,
  } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();
  const langPrefix = lang === "en" ? "en" : "fr";

  const {
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
  } = useBalanceProcessor();

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

  // Handle back navigation with proper route
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back navigation to dashboard
      const uid = selectedClient?.id || "me";
      navigate(`/${langPrefix}/web/user/dashboard/${uid}/dashboard`);
    }
  };

  // Handle completion with proper route
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Default completion navigation to reports
      const uid = selectedClient?.id || "me";
      navigate(`/${langPrefix}/web/user/reports/${uid}/reports`);
    }
  };

  // Si on affiche le FullExcelEditor, remplacer complètement l'interface
  if (showFullExcelEditor) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <FullExcelEditor
          reportName="Balance de Traitement"
          reportId="balance_traitement"
          onSave={handleFullExcelSave}
          onBack={() => setShowFullExcelEditor(false)}
          initialData={convertToExcelEditorData(balanceData)}
          balanceType="current"
        />
      </div>
    );
  }

  const getStatusBadge = (traitement: string) => {
    if (!traitement) {
      return (
        <Badge variant="secondary" className="text-xs">
          Aucun
        </Badge>
      );
    }

    if (traitement.includes("✓")) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-200 text-xs"
        >
          OK
        </Badge>
      );
    }
    if (
      traitement.includes("à calculer") ||
      traitement.includes("Reclassement")
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
        >
          En attente
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Aucun
      </Badge>
    );
  };

  // Fonction récursive pour afficher les comptes et sous-comptes
  const renderAccountRow = (
    row: BalanceRow,
    level: number = 0,
    rowIndex: number = 0
  ) => {
    if (!row) return null;

    const paddingLeft = level * 20;
    const isEditable = showEditor && (level === 0 || showDetails);

    return (
      <>
        <tr
          className={`hover:bg-gray-50 transition-colors ${
            row.traitement?.includes("✓")
              ? "bg-green-50"
              : row.traitement &&
                row.traitement !== "Aucun" &&
                row.traitement !== "Complété"
              ? "bg-orange-50"
              : ""
          }`}
        >
          {fields.map((field) => (
            <td key={field} className="border border-gray-300 p-1">
              {isEditable &&
              editingCell?.rowIndex === rowIndex &&
              editingCell?.field === field ? (
                <Input
                  autoFocus
                  value={row[field] || ""}
                  onChange={(e) =>
                    handleCellEdit(rowIndex, field, e.target.value)
                  }
                  onBlur={() => setEditingCell(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                  className="h-8 text-sm border-orange-300"
                />
              ) : (
                <div
                  className={`p-2 text-sm ${
                    isEditable &&
                    (field.includes("debit") ||
                      field.includes("credit") ||
                      field === "libelle")
                      ? "cursor-pointer hover:bg-orange-50 rounded"
                      : ""
                  }`}
                  style={
                    field === "libelle"
                      ? { paddingLeft: `${paddingLeft}px` }
                      : {}
                  }
                  onClick={() => {
                    if (
                      isEditable &&
                      (field.includes("debit") ||
                        field.includes("credit") ||
                        field === "libelle")
                    ) {
                      setEditingCell({ rowIndex, field });
                    }
                  }}
                >
                  {field.includes("debit") || field.includes("credit")
                    ? Number(row[field] || 0).toLocaleString("fr-FR")
                    : field === "traitement"
                    ? getStatusBadge(row.traitement || "")
                    : field === "libelle" && level > 0
                    ? `↳ ${row[field] || ""}`
                    : row[field] || ""}
                </div>
              )}
            </td>
          ))}
        </tr>
        {row.sous_comptes &&
          showDetails &&
          row.sous_comptes.map((subAccount, subIndex) =>
            renderAccountRow(subAccount, level + 1, rowIndex + subIndex + 1)
          )}
      </>
    );
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "Scale":
        return Scale;
      case "TrendingUp":
        return TrendingUp;
      case "Calculator":
        return Calculator;
      case "FileText":
        return FileText;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* En-tête simplifié */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Traitement Comptable - {selectedClient?.name || "Client"}{" "}
            {selectedFolder?.fiscalYear || ""}
          </h1>
          <p className="text-sm text-gray-600">
            Analyse et traitement automatique selon les normes SYSCOHADA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullExcelEditor(true)}
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Éditeur Excel
          </Button>
          {showEditor && (
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          )}
        </div>
      </div>

      {/* Étapes de traitement horizontales */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Étapes de traitement
          </h3>
          <span className="text-sm text-gray-500">
            Étape {currentStep + 1} sur {steps.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step.icon);
            const isCompleted = isStepCompleted(index);
            const isCurrent = currentStep === index;
            const stepCheck = checkStepConditions(index);

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all mb-2
                    ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                        ? "bg-orange-600 border-orange-600 text-white shadow-lg"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <p
                  className={`text-sm text-center font-medium mb-1 ${
                    isCurrent
                      ? "text-orange-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-400 text-center mb-2">
                  {step.description}
                </p>
                {isCurrent && stepCheck.errors.length > 0 && (
                  <div className="w-full max-w-32">
                    <div className="text-xs text-red-600 text-center bg-red-50 p-1 rounded">
                      {stepCheck.errors[0]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes d'erreur */}
      {stepErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">
            <strong>Impossible de continuer:</strong>
            <ul className="mt-1 list-disc list-inside">
              {stepErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Alertes importantes seulement */}
      {currentStep === 0 &&
        balanceEquilibre === false &&
        stepErrors.length === 0 && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              Balance déséquilibrée: {totals.difference.toLocaleString("fr-FR")}{" "}
              - Utilisez l'éditeur Excel pour corriger avant de continuer
            </AlertDescription>
          </Alert>
        )}

      {treatmentCompleted && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            Traitement terminé - Prêt pour les états financiers
          </AlertDescription>
        </Alert>
      )}

      {/* Barre de progression seulement pendant le traitement */}
      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Traitement...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Tableau principal */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("balanceProcessing")}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? t("hide") : t("show")} {t("subAccounts")}
              </Button>
              {showEditor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditor(false)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("close")} {t("edit")}
                </Button>
              )}
            </div>
          </div>
        </div>
        <ScrollArea className="h-[600px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white border-b">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border-r border-gray-200 p-3 text-left font-semibold text-sm text-gray-700 bg-gray-50"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {balanceData.map((row, index) => renderAccountRow(row, 0, index))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Navigation professionnelle */}
      <div className="bg-white rounded-lg border shadow-sm p-6 -mt-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0 || processing}
            className="px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-4 items-center">
            {!isStepCompleted(currentStep) && !isStepProcessing(currentStep) ? (
              <Button
                onClick={processCurrentStep}
                disabled={processing}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 px-8 py-3 text-base font-semibold"
              >
                <Play className="h-5 w-5 mr-2" />
                {processing
                  ? "Traitement en cours..."
                  : `Exécuter ${steps[currentStep].name}`}
              </Button>
            ) : isStepProcessing(currentStep) ? (
              <Button
                disabled
                size="lg"
                className="bg-gray-400 px-8 py-3 text-base font-semibold"
              >
                <Play className="h-5 w-5 mr-2 animate-spin" />
                Traitement en cours...
              </Button>
            ) : currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                size="lg"
                className="bg-green-600 hover:bg-green-700 px-8 py-3 text-base font-semibold"
              >
                Étape suivante
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="px-6"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 text-base font-semibold"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Générer les états financiers
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
