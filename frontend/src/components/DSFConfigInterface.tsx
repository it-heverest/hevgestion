// DSFConfigInterface.tsx - Configuration des formules DSF (comptes → cellules calculées)
//
// Chaque ligne représente UNE cellule calculée d'une note (un "mapping"),
// définie par : le rapport (catégorie), la cellule de destination, et la
// liste des comptes qui l'alimentent (signe + numéro de compte + source).
// C'est le format réel stocké par le backend (DSFComptableConfig.operations,
// ex: ["+20MD", "-30MC"]) — voir dsfConfigValidators.ts pour le format exact.
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Download,
  RefreshCw,
  Trash2,
  Copy,
  Pencil,
  AlertTriangle,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { dsfConfigService, DSFConfig } from "../services/dsf-config.service";
import { Modal } from "./ui/modal";

const SOURCES = ["MD", "MC", "OD", "OC", "SD", "SC"] as const;
type Source = (typeof SOURCES)[number];

const SOURCE_LABELS: Record<Source, string> = {
  OC: "Ouverture Crédit",
  OD: "Ouverture Débit",
  MC: "Mouvement Crédit",
  MD: "Mouvement Débit",
  SC: "Solde Crédit",
  SD: "Solde Débit",
};

// Catégories réelles lues par les notes (cf. Note11/Note27A qui appellent
// dsfConfigService.getConfigsByFolder(folderId, "note11") — toujours en
// minuscules, préfixées "note" pour les notes numérotées).
const CATEGORIES = [
  "note1", "note2", "note3a", "note3b", "note3c", "note3d", "note3e", "note3f",
  "note4", "note5", "note6", "note7", "note8", "note9", "note10", "note11",
  "note12", "note13", "note14", "note15a", "note15b", "note16a", "note16b",
  "note16c", "note17", "note18", "note19", "note20", "note21", "note22",
  "note23", "note24", "note25", "note26", "note27a", "note27b", "note28",
  "note29", "note30", "note31", "note32", "note33", "note34", "note35",
  "cf1", "cf1bis", "cf1ter", "cf1quater", "cf2", "cf2bis", "cf2ter",
  "bilan-paysage", "compte-resultat", "flux-tresorerie", "grille-analyse-notes",
];

// Catégories dont le calcul réel (dsf-generator.service.ts) consulte
// effectivement ces mappings (via resolveAllMappingLines / linesFor) —
// les éditer change vraiment les chiffres de la DSF générée. Pour toutes
// les autres catégories listées ci-dessus, la note est calculée par une
// logique différente (comptes en dur, formule TFT, ou contenu statique) et
// modifier un mapping ici n'a aucun effet sur elle pour l'instant.
// Bilan Paysage n'a pas sa propre catégorie: son calcul relit les mappings
// d'autres notes (note3a, note4, ... note28) — les modifier là les affecte
// aussi, mais il n'y a rien à seeder/éditer sous "bilan-paysage" lui-même.
const WIRED_CATEGORIES = new Set([
  "note1", "note3a", "note3c", "note3e", "note4", "note5", "note6", "note7",
  "note8", "note9", "note10", "note11", "note14", "note15a", "note16a",
  "note17", "note18", "note19", "note20", "note21", "note22", "note23",
  "note24", "note25", "note26", "note27a", "note28", "note29", "note30",
  "note31", "note34",
]);

interface OperationRow {
  sign: "+" | "-";
  account: string;
  source: Source;
}

const parseOperations = (ops: string[]): OperationRow[] =>
  ops
    .map((op) => {
      const sign: "+" | "-" = op.startsWith("-") ? "-" : "+";
      const rest = op.replace(/^[+-]/, "");
      const source = rest.slice(-2) as Source;
      const account = rest.slice(0, -2);
      return { sign, account, source };
    })
    .filter((row) => row.account.length > 0);

const formatOperations = (rows: OperationRow[]): string[] =>
  rows
    .filter((r) => r.account.trim().length > 0)
    .map((r) => `${r.sign}${r.account.trim()}${r.source}`);

const emptyOperationRow = (): OperationRow => ({ sign: "+", account: "", source: "MD" });

interface FormState {
  id: string | null;
  category: string;
  codeDsf: string;
  libelle: string;
  destinationCell: string;
  operations: OperationRow[];
}

const emptyForm = (category: string): FormState => ({
  id: null,
  category,
  codeDsf: "",
  libelle: "",
  destinationCell: "",
  operations: [emptyOperationRow()],
});

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400";

export default function DSFConfigInterface() {
  const { user } = useAuth();
  const { selectedFolder } = useApp();
  const [configs, setConfigs] = useState<DSFConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(CATEGORIES[0]));
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = selectedFolder?.id
        ? await dsfConfigService.getConfigsByFolder(selectedFolder.id)
        : await dsfConfigService.getConfigs();
      setConfigs(data);
    } catch (err) {
      console.error("Error loading DSF configs:", err);
      setError("Erreur lors du chargement des configurations");
    } finally {
      setLoading(false);
    }
  }, [selectedFolder?.id]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const filteredConfigs =
    categoryFilter === "all"
      ? configs
      : configs.filter((c) => c.category === categoryFilter);

  const openNewForm = () => {
    setForm(emptyForm(categoryFilter !== "all" ? categoryFilter : CATEGORIES[0]));
    setFormOpen(true);
  };

  const openEditForm = (config: DSFConfig) => {
    const rows = parseOperations(config.operations || []);
    setForm({
      id: config.id,
      category: config.category,
      codeDsf: config.codeDsf,
      libelle: config.libelle,
      destinationCell: config.destinationCell || "",
      operations: rows.length > 0 ? rows : [emptyOperationRow()],
    });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const updateOperationRow = (index: number, patch: Partial<OperationRow>) => {
    setForm((prev) => ({
      ...prev,
      operations: prev.operations.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  const addOperationRow = () => {
    setForm((prev) => ({ ...prev, operations: [...prev.operations, emptyOperationRow()] }));
  };

  const removeOperationRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      operations: prev.operations.filter((_, i) => i !== index),
    }));
  };

  const saveForm = async () => {
    if (!form.codeDsf.trim() || !form.libelle.trim() || !form.destinationCell.trim()) {
      alert("Code DSF, libellé et cellule de destination sont requis.");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<DSFConfig> & Record<string, unknown> = {
        category: form.category,
        codeDsf: form.codeDsf.trim(),
        libelle: form.libelle.trim(),
        destinationCell: form.destinationCell.trim(),
        operations: formatOperations(form.operations),
        clientId: selectedFolder?.clientId,
        exerciseId: selectedFolder?.id,
      };
      if (form.id) {
        await dsfConfigService.updateConfig(form.id, payload);
      } else {
        await dsfConfigService.createConfig(payload);
      }
      await loadConfigs();
      setFormOpen(false);
    } catch (err: any) {
      console.error("Error saving DSF config:", err);
      alert(err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (config: DSFConfig) => {
    try {
      await dsfConfigService.duplicateConfig(config.id);
      await loadConfigs();
    } catch (err) {
      console.error("Error duplicating config:", err);
      alert("Erreur lors de la duplication");
    }
  };

  const handleDelete = async (config: DSFConfig) => {
    if (!confirm(`Supprimer la configuration « ${config.libelle} » ?`)) return;
    try {
      await dsfConfigService.deleteConfig(config.id);
      await loadConfigs();
    } catch (err) {
      console.error("Error deleting config:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const result = await dsfConfigService.createDefaultConfigs();
      await loadConfigs();
      alert(
        `Mappings par défaut créés/mis à jour pour ${result.categoriesSeeded} catégorie(s), ${result.linesUpserted} ligne(s).`
      );
    } catch (err: any) {
      console.error("Error seeding default configs:", err);
      alert(err?.message || "Erreur lors de la génération des mappings par défaut");
    } finally {
      setSeeding(false);
    }
  };

  const handleExport = () => {
    const rows = filteredConfigs.map((c) => ({
      category: c.category,
      codeDsf: c.codeDsf,
      libelle: c.libelle,
      destinationCell: c.destinationCell,
      operations: (c.operations || []).join(","),
      scope: c.scope,
      ownerType: c.ownerType,
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsf-mappings-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-400" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Mapping comptable</h1>
                <p className="text-sm text-gray-500">
                  {selectedFolder ? `Dossier : ${selectedFolder.name}` : "Aucun dossier sélectionné"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadConfigs}
                title="Actualiser"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Download className="w-4 h-4" /> Exporter
              </button>
              {isAdmin && (
                <button
                  onClick={handleSeedDefaults}
                  disabled={seeding}
                  title="Recrée/rafraîchit les mappings par défaut de chaque note depuis le moteur de calcul (account-mapping.data.ts) — sans effet sur les surcharges déjà créées manuellement"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${seeding ? "animate-pulse" : ""}`} />
                  {seeding ? "Génération..." : "Générer les défauts"}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={openNewForm}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                >
                  <Plus className="w-4 h-4" /> Nouveau mapping
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filtre */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm text-gray-600">Rapport :</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          >
            <option value="all">Tous les rapports ({configs.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" /> Chargement...
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              <p>Aucun mapping configuré{categoryFilter !== "all" ? ` pour ${categoryFilter}` : ""}.</p>
              {categoryFilter !== "all" && !WIRED_CATEGORIES.has(categoryFilter) ? (
                <p className="mt-2 text-xs text-gray-400 max-w-md mx-auto">
                  Cette note n'est pas encore branchée sur ce système de configuration —
                  son calcul vient d'une autre logique (comptes en dur, formule TFT, ou
                  contenu statique). Un mapping créé ici resterait sans effet.
                </p>
              ) : (
                isAdmin && (
                  <p className="mt-2 text-xs text-gray-400">
                    Cliquez sur « Générer les défauts » pour pré-remplir depuis le moteur de calcul.
                  </p>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Rapport
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Libellé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Opérations
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Portée
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Origine
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {config.category}
                        {!WIRED_CATEGORIES.has(config.category) && (
                          <div
                            className="text-xs text-amber-600 mt-0.5"
                            title="Cette note n'est pas branchée sur ce système de configuration — modifier ce mapping n'affecte pas encore son calcul."
                          >
                            hors périmètre
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {config.libelle}
                        <div className="text-xs text-gray-400 font-mono">{config.codeDsf}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">
                        {config.destinationCell || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">
                        {config.operations?.length ? (
                          config.operations.join(", ")
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{config.scope}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            config.ownerType === "SYSTEM"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-blue-50 text-blue-700"
                          }`}
                          title={
                            config.ownerType === "SYSTEM"
                              ? "Valeur par défaut du moteur de calcul — verrouillée, éditable par un admin uniquement"
                              : "Surcharge créée par un comptable pour ce dossier/client"
                          }
                        >
                          {config.ownerType === "SYSTEM" ? "Défaut" : "Surcharge"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(config)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Éditer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(config)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Dupliquer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(config)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Légende des sources</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
            {SOURCES.map((code) => (
              <div key={code}>
                <strong className="text-gray-800">{code} :</strong> {SOURCE_LABELS[code]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire nouveau / éditer */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={form.id ? "Modifier le mapping" : "Nouveau mapping"}
        description="Choisissez les comptes qui alimentent cette cellule calculée."
        size="lg"
        footer={
          <>
            <button
              onClick={closeForm}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              onClick={saveForm}
              disabled={saving}
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rapport</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cellule de destination
              </label>
              <input
                value={form.destinationCell}
                onChange={(e) => setForm({ ...form, destinationCell: e.target.value })}
                placeholder="ex : B14"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code DSF</label>
            <input
              value={form.codeDsf}
              onChange={(e) => setForm({ ...form, codeDsf: e.target.value })}
              placeholder="ex : NOTE11_CAISSE"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
            <input
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              placeholder="ex : Caisse"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comptes utilisés dans le calcul
            </label>
            <div className="space-y-2">
              {form.operations.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={row.sign}
                    onChange={(e) =>
                      updateOperationRow(index, { sign: e.target.value as "+" | "-" })
                    }
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="+">+</option>
                    <option value="-">−</option>
                  </select>
                  <input
                    value={row.account}
                    onChange={(e) =>
                      updateOperationRow(index, { account: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="N° compte"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <select
                    value={row.source}
                    onChange={(e) => updateOperationRow(index, { source: e.target.value as Source })}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeOperationRow(index)}
                    disabled={form.operations.length === 1}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Retirer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addOperationRow}
              className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              + Ajouter un compte
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
