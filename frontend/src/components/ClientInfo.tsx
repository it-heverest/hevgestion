// components/ClientInfo.tsx
import { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Building2, MapPin, Phone, Save, Loader2, Pencil } from "lucide-react";

const LEGAL_FORMS = [
  { value: "SARL", label: "SARL" },
  { value: "SA", label: "SA" },
  { value: "SUARL", label: "SUARL" },
  { value: "INDIVIDUAL", label: "Entreprise individuelle" },
  { value: "OTHER", label: "Autre" },
];

const CLIENT_TYPES = [
  { value: "NORMAL", label: "Normal" },
  { value: "ASSURANCE", label: "Assurance" },
  { value: "SMT", label: "Système Minimal de Trésorerie (SMT)" },
];

export function ClientInfo() {
  const {
    selectedClient,
    setSelectedClient,
    updateClient,
    refreshClients,
    countries,
  } = useApp();

  const [form, setForm] = useState({
    name: "",
    legalForm: "SARL",
    clientType: "NORMAL",
    taxNumber: "",
    address: "",
    city: "",
    phone: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    if (selectedClient) {
      setForm({
        name: selectedClient.name || "",
        legalForm: selectedClient.legalForm || "SARL",
        clientType: (selectedClient as any).clientType || "NORMAL",
        taxNumber: selectedClient.taxNumber || "",
        address: selectedClient.address || "",
        city: selectedClient.city || "",
        phone: selectedClient.phone || "",
        country: selectedClient.country || "",
      });
      setSuccess(false);
      setError(null);
      setLocked(true);
    }
  }, [selectedClient]);

  if (!selectedClient) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Sélectionnez d'abord un client pour voir ses informations.
      </div>
    );
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Le nom est requis");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateClient(selectedClient.id, {
        name: form.name,
        legalForm: form.legalForm as any,
        clientType: form.clientType,
        taxNumber: form.taxNumber,
        address: form.address,
        city: form.city,
        phone: form.phone,
        country: form.country,
      } as any);
      setSelectedClient(updated);
      await refreshClients();
      setSuccess(true);
      setLocked(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du client");
    } finally {
      setSaving(false);
    }
  };

  const currentCurrency =
    countries.find((c) => c.code === form.country)?.currency ||
    selectedClient.currency;

  const legalFormLabel =
    LEGAL_FORMS.find((f) => f.value === form.legalForm)?.label ||
    form.legalForm;
  const clientTypeLabel =
    CLIENT_TYPES.find((f) => f.value === form.clientType)?.label ||
    form.clientType;

  return (
    <div className="space-y-6">
      <div>
        <h2>Informations sur le client</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les informations générales du client sélectionné
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>
            Nom, forme juridique et type de client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar et informations de base */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-white">
              <Building2 className="h-10 w-10" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold">
                {form.name || "Client sans nom"}
              </h3>
              <p className="text-muted-foreground">
                {legalFormLabel} • {clientTypeLabel}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">
                Nom de l'entreprise{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11"
                disabled={locked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique</Label>
              <Select
                value={form.legalForm}
                onValueChange={(v) => setForm({ ...form, legalForm: v })}
                disabled={locked}
              >
                <SelectTrigger id="legalForm" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_FORMS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientType">Type de client</Label>
              <Select
                value={form.clientType}
                onValueChange={(v) => setForm({ ...form, clientType: v })}
                disabled={locked}
              >
                <SelectTrigger id="clientType" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_TYPES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Détermine les notes DSF générées (normal, assurance ou SMT).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber">Numéro d'identification (NIU/IFU)</Label>
              <Input
                id="taxNumber"
                value={form.taxNumber}
                onChange={(e) =>
                  setForm({ ...form, taxNumber: e.target.value })
                }
                className="h-11"
                disabled={locked}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
          <CardDescription>Adresse, ville, téléphone, pays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse
              </Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="h-11"
                disabled={locked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="h-11"
                disabled={locked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11"
                disabled={locked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Select
                value={form.country}
                onValueChange={(v) => setForm({ ...form, country: v })}
                disabled={locked}
              >
                <SelectTrigger id="country" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Devise</Label>
              <Input value={currentCurrency} disabled className="h-11" />
              <p className="text-xs text-muted-foreground">
                Déterminée automatiquement par le pays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-green-600">
          Informations mises à jour avec succès.
        </p>
      )}

      <div className="flex justify-end gap-3">
        {locked ? (
          <Button onClick={() => setLocked(false)}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedClient) {
                  setForm({
                    name: selectedClient.name || "",
                    legalForm: selectedClient.legalForm || "SARL",
                    clientType: (selectedClient as any).clientType || "NORMAL",
                    taxNumber: selectedClient.taxNumber || "",
                    address: selectedClient.address || "",
                    city: selectedClient.city || "",
                    phone: selectedClient.phone || "",
                    country: selectedClient.country || "",
                  });
                }
                setError(null);
                setLocked(true);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
