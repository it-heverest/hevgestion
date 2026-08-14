// components/VentilationConfig.tsx
import { useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { clientService } from "../services/client.service";
import {
  ventilationConfigService,
  VentilationConfig as VentilationConfigData,
  SubAccountInput,
} from "../services/ventilation-config.service";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  Building2,
  Split,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface SubAccountFormRow extends SubAccountInput {
  key: number;
}

interface AvailableAccount {
  accountNumber: string;
  accountName: string;
}

const emptyRow = (key: number): SubAccountFormRow => ({
  key,
  accountNumber: "",
  accountName: "",
  debitAmount: 0,
  creditAmount: 0,
});

const extractAccountsFromBalance = (balance: any): AvailableAccount[] => {
  if (!balance?.originalData) return [];

  let data = balance.originalData;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }

  const rows = Array.isArray(data) ? data : data?.rows;
  if (!Array.isArray(rows)) return [];

  const seen = new Set<string>();
  const accounts: AvailableAccount[] = [];
  for (const row of rows) {
    const accountNumber = String(
      row.accountNumber ?? row.compte ?? row["n° compte"] ?? "",
    ).trim();
    const accountName = String(
      row.accountName ?? row.libelle ?? row["libellé"] ?? "",
    ).trim();
    if (!accountNumber || seen.has(accountNumber)) continue;
    seen.add(accountNumber);
    accounts.push({ accountNumber, accountName });
  }
  return accounts.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber));
};

export function VentilationConfig() {
  const { selectedClient, selectedFolder } = useApp();
  const isClosed = selectedFolder?.status === 'COMPLETED';

  const [configs, setConfigs] = useState<VentilationConfigData[]>([]);
  const [archivedConfigs, setArchivedConfigs] = useState<VentilationConfigData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableAccounts, setAvailableAccounts] = useState<AvailableAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mainAccountNumber, setMainAccountNumber] = useState("");
  const [mainAccountName, setMainAccountName] = useState("");
  const [rows, setRows] = useState<SubAccountFormRow[]>([emptyRow(0)]);
  const [nextRowKey, setNextRowKey] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<VentilationConfigData | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [restoreTarget, setRestoreTarget] = useState<VentilationConfigData | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);

  const loadAvailableAccounts = async () => {
    if (!selectedFolder) {
      setAvailableAccounts([]);
      return;
    }
    setIsLoadingAccounts(true);
    try {
      const response = await clientService.getBalancesByFolder(selectedFolder.id);
      const balances = response?.balances || response?.data?.balances || [];
      const currentYearBalance = balances.find(
        (b: any) => b.type?.toUpperCase() === "CURRENT_YEAR" && !b.archived,
      );
      setAvailableAccounts(extractAccountsFromBalance(currentYearBalance));
    } catch (err) {
      console.error("Error loading accounts from balance N:", err);
      setAvailableAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAvailableAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder?.id]);

  const loadConfigs = async () => {
    if (!selectedClient) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ventilationConfigService.getConfigs(selectedClient.id, selectedFolder?.id);
      setConfigs(data.filter((c) => !c.archived));
      setArchivedConfigs(data.filter((c) => c.archived));
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id, selectedFolder?.id]);

  const openCreateDialog = () => {
    setEditingId(null);
    setMainAccountNumber("");
    setMainAccountName("");
    setRows([emptyRow(0)]);
    setNextRowKey(1);
    setFormError(null);
    setShowDialog(true);
  };

  const openEditDialog = (config: VentilationConfigData) => {
    setEditingId(config.id);
    setMainAccountNumber(config.mainAccountNumber);
    setMainAccountName(config.mainAccountName);
    const sorted = [...config.subAccounts].sort((a, b) => a.order - b.order);
    setRows(
      sorted.map((sub, index) => ({
        key: index,
        accountNumber: sub.accountNumber,
        accountName: sub.accountName,
        debitAmount: sub.debitAmount ?? 0,
        creditAmount: sub.creditAmount ?? 0,
      })),
    );
    setNextRowKey(sorted.length);
    setFormError(null);
    setShowDialog(true);
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(nextRowKey)]);
    setNextRowKey((k) => k + 1);
  };

  const removeRow = (key: number) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const selectMainAccount = (accountNumber: string) => {
    const account = availableAccounts.find(
      (a) => a.accountNumber === accountNumber
    );
    setMainAccountNumber(accountNumber);
    setMainAccountName(account?.accountName || "");
  };

  // Keep a config's previously saved account selectable even if it has since
  // disappeared from the balance N (e.g. chart of accounts changed)
  const withCurrentValue = (
    accountNumber: string,
    accountName: string
  ): AvailableAccount[] => {
    if (
      !accountNumber ||
      availableAccounts.some((a) => a.accountNumber === accountNumber)
    ) {
      return availableAccounts;
    }
    return [...availableAccounts, { accountNumber, accountName }].sort((a, b) =>
      a.accountNumber.localeCompare(b.accountNumber)
    );
  };

  const mainAccountOptions = withCurrentValue(mainAccountNumber, mainAccountName);

  const handleSave = async () => {
    setFormError(null);

    if (!selectedClient) return;
    if (!mainAccountNumber.trim() || !mainAccountName.trim()) {
      setFormError("Le numéro et le libellé du compte principal sont requis");
      return;
    }

    const cleanRows = rows
      .map((row) => ({
        accountNumber: row.accountNumber.trim(),
        accountName: row.accountName.trim(),
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
      }))
      .filter((row) => row.accountNumber || row.accountName);

    if (cleanRows.length === 0) {
      setFormError("Ajoutez au moins un sous-compte");
      return;
    }

    if (cleanRows.some((row) => !row.accountNumber || !row.accountName)) {
      setFormError("Chaque sous-compte doit avoir un numéro et un libellé");
      return;
    }

    const numbers = cleanRows.map((row) => row.accountNumber);
    if (new Set(numbers).size !== numbers.length) {
      setFormError("Les numéros de sous-compte doivent être uniques");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await ventilationConfigService.updateConfig(editingId, {
          mainAccountNumber: mainAccountNumber.trim(),
          mainAccountName: mainAccountName.trim(),
          subAccounts: cleanRows,
        });
      } else {
        await ventilationConfigService.createConfig({
          clientId: selectedClient.id,
          folderId: selectedFolder?.id,
          mainAccountNumber: mainAccountNumber.trim(),
          mainAccountName: mainAccountName.trim(),
          subAccounts: cleanRows,
        });
      }
      setShowDialog(false);
      await loadConfigs();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ventilationConfigService.deleteConfig(deleteTarget.id);
      setDeleteTarget(null);
      await loadConfigs();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      await ventilationConfigService.restoreConfig(restoreTarget.id);
      setRestoreTarget(null);
      await loadConfigs();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la restauration");
    } finally {
      setIsRestoring(false);
    }
  };

  if (!selectedClient) {
    return (
      <Card className="m-6">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Building2 className="h-10 w-10 text-gray-400" />
          <p className="text-gray-600">
            Sélectionnez d'abord une entreprise pour configurer la ventilation
            de ses comptes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Split className="h-5 w-5" />
            Ventilation des comptes
          </h2>
          <p className="text-sm text-gray-500">
            Préconfigurez, pour {selectedClient.name}, les sous-comptes utilisés
            pour ventiler le solde d'un compte principal.
          </p>
        </div>
        {isClosed ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-md px-3 py-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Exercice clôturé — lecture seule
          </div>
        ) : (
          <Button
            onClick={openCreateDialog}
            disabled={isLoadingAccounts || availableAccounts.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un compte à ventiler
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!isLoadingAccounts && availableAccounts.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4" />
          Importez d'abord la balance N (année en cours) de cet exercice pour
          pouvoir choisir les comptes à ventiler.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comptes configurés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Chargement...
            </p>
          ) : configs.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Aucun compte de ventilation configuré pour ce client.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte principal</TableHead>
                  <TableHead>Sous-comptes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="font-medium">
                        {config.mainAccountNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {config.mainAccountName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {config.subAccounts.map((sub) => (
                          <Badge key={sub.id} variant="secondary">
                            {sub.accountNumber} – {sub.accountName}
                            {sub.debitAmount != null && (
                              <span className="ml-1">D: {sub.debitAmount}</span>
                            )}
                            {sub.creditAmount != null && (
                              <span className="ml-1">C: {sub.creditAmount}</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!isClosed && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(config)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(config)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {archivedConfigs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comptes archivés</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte principal</TableHead>
                  <TableHead>Sous-comptes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedConfigs.map((config) => (
                  <TableRow key={config.id} className="opacity-60">
                    <TableCell>
                      <div className="font-medium">
                        {config.mainAccountNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {config.mainAccountName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {config.subAccounts.map((sub) => (
                          <Badge key={sub.id} variant="outline">
                            {sub.accountNumber} – {sub.accountName}
                            {sub.debitAmount != null && (
                              <span className="ml-1">D: {sub.debitAmount}</span>
                            )}
                            {sub.creditAmount != null && (
                              <span className="ml-1">C: {sub.creditAmount}</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!isClosed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRestoreTarget(config)}
                          title="Restaurer"
                        >
                          <RefreshCw className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier le compte à ventiler" : "Ajouter un compte à ventiler"}
            </DialogTitle>
            <DialogDescription>
              Définissez le compte principal et la liste des sous-comptes entre
              lesquels son solde pourra être réparti. Les montants débit et
              crédit doivent être équilibrés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="mainAccountNumber">Compte principal *</Label>
              <Select value={mainAccountNumber} onValueChange={selectMainAccount}>
                <SelectTrigger id="mainAccountNumber">
                  <SelectValue placeholder="Sélectionner un compte de la balance N" />
                </SelectTrigger>
                <SelectContent>
                  {mainAccountOptions.map((account) => (
                    <SelectItem
                      key={account.accountNumber}
                      value={account.accountNumber}
                    >
                      {account.accountNumber} – {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sous-comptes *</Label>
                <Button variant="outline" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un sous-compte
                </Button>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {rows.map((row) => (
                  <div key={row.key} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <Input
                        placeholder="N° compte"
                        value={row.accountNumber}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key
                                ? { ...r, accountNumber: e.target.value }
                                : r
                            )
                          )
                        }
                      />
                      <Input
                        placeholder="Libellé"
                        value={row.accountName}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key
                                ? { ...r, accountName: e.target.value }
                                : r
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Débit"
                        min={0}
                        step={0.01}
                        value={row.debitAmount ?? ""}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key
                                ? { ...r, debitAmount: parseFloat(e.target.value) || 0 }
                                : r
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Crédit"
                        min={0}
                        step={0.01}
                        value={row.creditAmount ?? ""}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key
                                ? { ...r, creditAmount: parseFloat(e.target.value) || 0 }
                                : r
                            )
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver cette configuration ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte {deleteTarget?.mainAccountNumber} ne sera plus ventilé
              automatiquement. Vous pourrez le restaurer plus tard depuis la
              section des comptes archivés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Archivage..." : "Archiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore confirmation */}
      <AlertDialog
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer cette configuration ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte {restoreTarget?.mainAccountNumber} sera de nouveau
              disponible pour la ventilation automatique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? "Restauration..." : "Restaurer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VentilationConfig;