import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Bot, RefreshCw, Save, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  dsfAssistantService,
  AssistantModel,
  AssistantProvider,
  AssistantSettingsResponse,
} from "../services/dsf-assistant.service";
import { useAuth } from "../contexts/AuthContext";

/**
 * Choix du modèle IA de l'assistant DSF.
 *
 * Le réglage est global à l'application et n'est modifiable que par un
 * administrateur. Les clés d'API restent côté serveur (variables
 * d'environnement): elles ne transitent jamais par cet écran.
 */
export function AssistantModelSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [settings, setSettings] = useState<AssistantSettingsResponse | null>(null);
  const [provider, setProvider] = useState<AssistantProvider>("groq");
  const [model, setModel] = useState("");

  const [models, setModels] = useState<AssistantModel[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dsfAssistantService.getSettings();
      setSettings(data);
      setProvider(data.current.provider);
      setModel(data.current.model);
    } catch (error) {
      console.error("Erreur chargement réglages assistant:", error);
      setFeedback({
        type: "error",
        message: "Impossible de charger les réglages de l'assistant.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const loadModels = useCallback(async () => {
    setLoadingModels(true);
    setModelsError(null);
    try {
      setModels(await dsfAssistantService.listModels());
    } catch (error: any) {
      setModelsError(
        error?.response?.data?.message ||
          "Impossible de récupérer la liste des modèles OpenRouter.",
      );
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // La liste des modèles n'est utile que pour OpenRouter: on ne la charge
  // qu'à ce moment-là, et une seule fois.
  useEffect(() => {
    if (isAdmin && provider === "openrouter" && models.length === 0 && !modelsError) {
      loadModels();
    }
  }, [isAdmin, provider, models.length, modelsError, loadModels]);

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return models.slice(0, 100);
    return models
      .filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.id.toLowerCase().includes(term),
      )
      .slice(0, 100);
  }, [models, search]);

  const handleProviderChange = (next: AssistantProvider) => {
    setProvider(next);
    setFeedback(null);
    // Repartir du modèle par défaut du fournisseur choisi, sinon on
    // enverrait un identifiant appartenant à l'autre fournisseur.
    setModel(settings?.defaults?.[next] ?? "");
  };

  const handleSave = async () => {
    if (!model.trim()) {
      setFeedback({ type: "error", message: "Veuillez choisir un modèle." });
      return;
    }
    try {
      setSaving(true);
      setFeedback(null);
      const saved = await dsfAssistantService.updateSettings({
        provider,
        model: model.trim(),
      });
      setSettings((prev) => (prev ? { ...prev, current: saved } : prev));
      setFeedback({
        type: "success",
        message: `Modèle enregistré : ${saved.model}`,
      });
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible d'enregistrer le réglage.",
      });
    } finally {
      setSaving(false);
    }
  };

  const availability = settings?.availability ?? {};
  const isDirty =
    settings != null &&
    (provider !== settings.current.provider || model !== settings.current.model);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Assistant IA
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {loading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : (
          <>
            {/* Modèle actuellement actif */}
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Modèle actif
              </p>
              <p className="mt-1 font-mono text-sm text-gray-900">
                {settings?.current.model}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Fournisseur : {settings?.current.provider}
              </p>
            </div>

            {!isAdmin ? (
              <p className="text-sm text-gray-500">
                Seul un administrateur peut modifier le modèle de l'assistant.
              </p>
            ) : (
              <>
                {/* Fournisseur */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fournisseur</label>
                  <Select
                    value={provider}
                    onValueChange={(v) =>
                      handleProviderChange(v as AssistantProvider)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groq" disabled={!availability.groq}>
                        Groq {availability.groq ? "" : "(clé non configurée)"}
                      </SelectItem>
                      <SelectItem
                        value="openrouter"
                        disabled={!availability.openrouter}
                      >
                        OpenRouter{" "}
                        {availability.openrouter ? "" : "(clé non configurée)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!availability[provider] && (
                    <p className="flex items-start gap-1.5 text-xs text-amber-700">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      La clé d'API de ce fournisseur n'est pas renseignée dans le
                      fichier <code>.env</code> du serveur.
                    </p>
                  )}
                </div>

                {/* Modèle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Modèle</label>
                    {provider === "openrouter" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadModels}
                        disabled={loadingModels}
                      >
                        <RefreshCw
                          className={`mr-1 h-3.5 w-3.5 ${loadingModels ? "animate-spin" : ""}`}
                        />
                        Actualiser la liste
                      </Button>
                    )}
                  </div>

                  {provider === "openrouter" && models.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un modèle (ex. dots3)…"
                        className="pl-8"
                      />
                    </div>
                  )}

                  {provider === "openrouter" && models.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 divide-y">
                      {filteredModels.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModel(m.id)}
                          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                            model === m.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-gray-900">
                              {m.name}
                            </span>
                            <span className="block truncate font-mono text-xs text-gray-500">
                              {m.id}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {m.isFree && (
                              <Badge className="bg-green-100 text-green-700">
                                gratuit
                              </Badge>
                            )}
                            {model === m.id && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </span>
                        </button>
                      ))}
                      {filteredModels.length === 0 && (
                        <p className="px-3 py-4 text-sm text-gray-500">
                          Aucun modèle ne correspond à cette recherche.
                        </p>
                      )}
                    </div>
                  ) : (
                    // Repli: saisie libre de l'identifiant. Indispensable pour
                    // Groq (pas de liste exposée) et si l'appel à OpenRouter échoue.
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Identifiant du modèle"
                      className="font-mono text-sm"
                    />
                  )}

                  {modelsError && provider === "openrouter" && (
                    <p className="flex items-start gap-1.5 text-xs text-amber-700">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {modelsError} Vous pouvez saisir l'identifiant à la main.
                    </p>
                  )}
                </div>

                {feedback && (
                  <p
                    className={`text-sm ${
                      feedback.type === "success"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving || !isDirty}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AssistantModelSettings;
