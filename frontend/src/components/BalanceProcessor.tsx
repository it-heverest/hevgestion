import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Play,
  FileCheck,
  Calculator,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import { clientService } from "../services/client.service";
import { useApp } from "../contexts/AppContext";

interface ProcessingOption {
  id: string;
  label: string;
  description: string;
  syscohadaRef: string;
  enabled: boolean;
}

interface BalanceProcessorProps {
  onComplete?: () => void;
}

interface BalanceData {
  id: string;
  type: string;
  status: string;
  period: string;
  fileName: string;
  originalData: any[];
  equilibrium?: {
    isBalanced: boolean;
    totalDebit: number;
    totalCredit: number;
    difference: number;
  };
  accountIssues?: any[];
}

export function BalanceProcessor({ onComplete }: BalanceProcessorProps = {}) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { selectedFolder } = useApp();

  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [equilibriumResult, setEquilibriumResult] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);

  // For now, we'll get balance ID from localStorage or route params
  // TODO: Pass balance ID properly through navigation
  const [balanceId, setBalanceId] = useState<string | null>(null);

  const [processingOptions, setProcessingOptions] = useState<
    ProcessingOption[]
  >([
    {
      id: "equilibrium-check",
      label: "Vérification de l'équilibre comptable",
      description: "Total débits = Total crédits",
      syscohadaRef: "Principe fondamental",
      enabled: true,
    },
    {
      id: "ventilation",
      label: "Ventilation des comptes",
      description: "Analyse détaillée par classes et catégories",
      syscohadaRef: "Art. 20-27",
      enabled: true,
    },
    {
      id: "issues-check",
      label: "Détection des anomalies",
      description: "Identifier les comptes problématiques",
      syscohadaRef: "Art. 30-35",
      enabled: true,
    },
  ]);

  useEffect(() => {
    loadBalanceData();
  }, []);

  const loadBalanceData = async () => {
    try {
      setLoading(true);
      // For now, get the most recent balance for the selected folder
      // TODO: Pass balance ID through navigation state
      if (selectedFolder) {
        // This is a temporary solution - we need to get the balance ID from the upload response
        // Balance ID will be obtained from AppContext selections
        // TODO: Get balance ID from context
        const tempBalanceId = null; // Will be updated when balance selection is implemented
        if (tempBalanceId) {
          const balanceData = await clientService.getBalanceById(tempBalanceId);
          setBalance(balanceData.balance);
          setBalanceId(tempBalanceId);

          // Load issues if any
          const issuesData = await clientService.getBalanceIssues(
            tempBalanceId
          );
          setIssues(issuesData.issues);
        }
      }
    } catch (error) {
      console.error("Error loading balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (id: string) => {
    setProcessingOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  const startProcessing = async () => {
    if (!balanceId) return;

    setProcessing(true);
    setProgress(0);
    setCompleted(false);

    const enabledOptions = processingOptions.filter((opt) => opt.enabled);
    const step = 100 / enabledOptions.length;

    try {
      for (let i = 0; i < enabledOptions.length; i++) {
        const option = enabledOptions[i];

        switch (option.id) {
          case "equilibrium-check":
            const equilibriumResult =
              await clientService.checkBalanceEquilibrium(balanceId);
            setEquilibriumResult(equilibriumResult);
            break;
          case "ventilation":
            await clientService.performBalanceVentilation(balanceId);
            break;
          case "issues-check":
            const issuesResult = await clientService.getBalanceIssues(
              balanceId
            );
            setIssues(issuesResult.issues);
            break;
        }

        setProgress((i + 1) * step);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for UX
      }

      setCompleted(true);
    } catch (error) {
      console.error("Processing error:", error);
      alert("Erreur lors du traitement de la balance");
    } finally {
      setProcessing(false);
    }
  };

  const getProcessingResults = () => {
    const results = [];

    if (equilibriumResult) {
      results.push({
        check: "Équilibre comptable",
        status: equilibriumResult.isBalanced ? "success" : "error",
        message: equilibriumResult.isBalanced
          ? `Débits = Crédits: ${equilibriumResult.totalDebit.toLocaleString()} €`
          : `Déséquilibre: ${Math.abs(
              equilibriumResult.difference
            ).toLocaleString()} €`,
      });
    }

    if (issues.length > 0) {
      const unresolvedIssues = issues.filter((issue) => !issue.isResolved);
      results.push({
        check: "Détection d'anomalies",
        status: unresolvedIssues.length === 0 ? "success" : "warning",
        message: `${issues.length} problème(s) détecté(s), ${unresolvedIssues.length} non résolu(s)`,
      });
    }

    return results;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement de la balance...</p>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2>Traitement de la Balance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aucune balance trouvée. Veuillez d'abord importer une balance.
          </p>
        </div>
        <div className="text-center">
          <Button onClick={() => navigate(`/import/${userId}/balance`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'import
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Traitement de la Balance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Traitement et validation selon les normes SYSCOHADA
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/import/${userId}/balance`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'import
        </Button>
      </div>

      {/* Import Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Balance importée</CardTitle>
              <CardDescription>
                {balance.fileName} - {balance.originalData?.length || 0} comptes
              </CardDescription>
            </div>
            <Badge variant="default">
              <FileCheck className="h-3 w-3 mr-1" />
              {balance.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl mb-1">
                {balance.originalData?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Comptes</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl mb-1">
                {equilibriumResult
                  ? equilibriumResult.totalDebit.toLocaleString()
                  : "0"}{" "}
                €
              </p>
              <p className="text-xs text-muted-foreground">Total débits</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl mb-1">
                {equilibriumResult
                  ? equilibriumResult.totalCredit.toLocaleString()
                  : "0"}{" "}
                €
              </p>
              <p className="text-xs text-muted-foreground">Total crédits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options de traitement</CardTitle>
          <CardDescription>
            Sélectionnez les traitements à appliquer selon SYSCOHADA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processingOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={option.id}
                checked={option.enabled}
                onCheckedChange={() => toggleOption(option.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {option.syscohadaRef}
                </Badge>
              </div>
            </div>
          ))}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Les traitements sélectionnés seront appliqués dans l'ordre.
              Certains traitements dépendent des précédents.
            </AlertDescription>
          </Alert>

          {!processing && !completed && (
            <Button onClick={startProcessing} className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Lancer le traitement
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Processing Progress */}
      {processing && (
        <Card>
          <CardHeader>
            <CardTitle>Traitement en cours...</CardTitle>
            <CardDescription>Application des règles SYSCOHADA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Analyse en cours...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {completed && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Résultats du traitement</CardTitle>
                <CardDescription>Analyse terminée</CardDescription>
              </div>
              <Badge variant="default">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Terminé
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Résultat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getProcessingResults().map((result: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{result.check}</TableCell>
                      <TableCell>
                        {result.status === "success" ? (
                          <Badge variant="default">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : result.status === "error" ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Erreur
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-600"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Attention
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {result.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                La balance a été traitée avec succès. Vous pouvez maintenant
                générer vos rapports financiers.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={onComplete}>
                <Calculator className="h-4 w-4 mr-2" />
                Générer les rapports
              </Button>
              <Button variant="outline" onClick={() => setCompleted(false)}>
                Nouveau traitement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SYSCOHADA Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Référence SYSCOHADA</CardTitle>
          <CardDescription>
            Système Comptable OHADA - Normes et règles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm mb-2">
                Plan comptable général SYSCOHADA révisé
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Classe 1: Comptes de ressources durables</li>
                <li>Classe 2: Comptes d'actif immobilisé</li>
                <li>Classe 3: Comptes de stocks</li>
                <li>Classe 4: Comptes de tiers</li>
                <li>Classe 5: Comptes de trésorerie</li>
                <li>Classe 6: Comptes de charges</li>
                <li>Classe 7: Comptes de produits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
