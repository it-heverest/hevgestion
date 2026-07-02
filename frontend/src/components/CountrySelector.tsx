// components/CountrySelector.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Building2,
  Search,
  ChevronRight,
  Plus,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  User,
  Loader,
} from "lucide-react";
import type { Client } from "@/types";
import Refresher from "./ui/refresher";

export function CountrySelector() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const {
    countries,
    selectedCountry,
    setSelectedCountry,
    clients,
    selectedClient,
    setSelectedClient,
    createClient,
    loading,
    error,
    searchClients,
    restoreSelectionsFromServer,
    clearAppData,
    reloadInitialData,
  } = useApp();

  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    legalForm: "SARL",
    clientType: "NORMAL",
    taxNumber: "",
    address: "",
    city: "",
    phone: "",
    email: "",
  });

  // Auto-select the first available country once countries are loaded
  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      setSelectedCountry(countries[0].code);
    }
  }, [countries, selectedCountry, setSelectedCountry]);

  // Restore previous session selections once clients are available
  useEffect(() => {
    if (!authLoading && isAuthenticated && clients.length > 0 && !loading) {
      restoreSelectionsFromServer();
    }
  }, [authLoading, isAuthenticated, clients.length, loading]);

  const handleCountryChange = useCallback(
    (countryCode: string) => {
      setSelectedCountry(countryCode);
    },
    [setSelectedCountry],
  );

  // Role-filtered clients WITHOUT country filter — used for per-country counts
  const allAccessibleClients = useMemo(() => {
    if (!user) return [];
    switch (user.role) {
      case "ADMIN":
        return clients;
      case "COMPTABLE":
        return clients.filter((c) => c.createdBy === user.id);
      default:
        return [];
    }
  }, [clients, user]);

  // Role-filtered + country-filtered — used for the client list
  const accessibleClients = useMemo(() => {
    const base = allAccessibleClients;
    if (!selectedCountry) return base;
    return base.filter((c) => c.country === selectedCountry);
  }, [allAccessibleClients, selectedCountry]);

  // Filter search results by role
  const getAccessibleSearchResults = useCallback(
    (results: Client[]) => {
      if (!user) return [];
      return results.filter((client) => {
        switch (user.role) {
          case "ADMIN":
            return true;
          case "COMPTABLE":
            return client.createdBy === user.id;
          default:
            return false;
        }
      });
    },
    [user],
  );

  // Live search with debounce
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim() && selectedCountry) {
        setIsSearching(true);
        try {
          const results = await searchClients(searchTerm, selectedCountry);
          setSearchResults(getAccessibleSearchResults(results));
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    const id = setTimeout(performSearch, 500);
    return () => clearTimeout(id);
  }, [searchTerm, selectedCountry, searchClients, getAccessibleSearchResults]);

  const clientsToDisplay = searchTerm ? searchResults : accessibleClients;

  const availableCountries = useMemo(
    () =>
      user?.role === "ADMIN" || user?.role === "COMPTABLE"
        ? countries
        : countries.filter((country) =>
            allAccessibleClients.some((c) => c.country === country.code),
          ),
    [user?.role, countries, allAccessibleClients],
  );

  const handleCreateClient = async () => {
    if (!newClient.name || !selectedCountry || !newClient.legalForm) {
      alert("Veuillez remplir les informations obligatoires (Nom, Pays, Forme Juridique)");
      return;
    }
    setIsCreating(true);
    try {
      const client = await createClient({ ...newClient, country: selectedCountry } as Client);
      setIsDialogOpen(false);
      setNewClient({ name: "", legalForm: "SARL", clientType: "NORMAL", taxNumber: "", address: "", city: "", phone: "", email: "" });
      setShowSuccess(true);
      setSelectedClient(client);
      const uid = user?.id || "me";
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/fr/web/user/dashboard/${uid}/dashboard`);
      }, 1000);
    } catch (err) {
      console.error("Erreur création client:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectClient = useCallback(
    (client: Client) => {
      setSelectedClient(client);
      navigate(`/fr/web/user/dashboard/${user?.id || "me"}/dashboard`);
    },
    [setSelectedClient, navigate, user],
  );

  const getCountryName = useCallback(
    (code: string) => countries.find((c) => c.code === code)?.name || code,
    [countries],
  );

  const getCountryFlag = useCallback((code: string) => {
    const flags: Record<string, string> = { BJ: "🇧🇯", BF: "🇧🇫", CI: "🇨🇮", SN: "🇸🇳", CM: "🇨🇲", TG: "🇹🇬" };
    return flags[code] || "🏳️";
  }, []);

  const getUserRoleBadge = useCallback((role: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      ADMIN: { label: "Administrateur", variant: "default" },
      COMPTABLE: { label: "Comptable", variant: "secondary" },
      ASSISTANT: { label: "Assistant", variant: "outline" },
    };
    return config[role] || { label: role, variant: "outline" as const };
  }, []);

  const handleRefresh = useCallback(async () => {
    await reloadInitialData();
  }, [reloadInitialData]);

  // Show full-page loader while auth or initial data fetch is in progress
  if (authLoading || (loading && countries.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-orange-600" />
          <p className="text-muted-foreground">Chargement ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-red-50 border border-red-200 p-6 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => reloadInitialData()}>Réessayer</Button>
                <Button variant="outline" onClick={() => clearAppData()}>Réinitialiser</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-orange-600">HevGestion</h1>
          <p className="text-sm text-muted-foreground">Sélectionnez votre client</p>
          {user && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge {...getUserRoleBadge(user.role)} className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {getUserRoleBadge(user.role).label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
        </div>

        {/* Country selector */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Pays du client
            </CardTitle>
            <CardDescription>
              {user?.role === "ADMIN" ? "Tous les pays disponibles" : "Pays avec vos clients accessibles"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select value={selectedCountry || ""} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-11 flex-1">
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => {
                  // Count uses allAccessibleClients (no country filter) so every country shows the right number
                  const count = allAccessibleClients.filter((c) => c.country === country.code).length;
                  return (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getCountryFlag(country.code)}</span>
                        <span>{country.name}</span>
                        <Badge variant="outline" className="text-xs ml-1">{country.currency}</Badge>
                        <Badge variant="secondary" className="text-xs ml-auto">{count} client(s)</Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Refresher onClick={handleRefresh} />
          </CardContent>
        </Card>

        {/* Search + create */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                user?.role === "ADMIN"
                  ? "Rechercher un client par nom, numéro fiscal, ville..."
                  : "Rechercher parmi vos clients accessibles..."
              }
              className="pl-11 h-11"
              disabled={!selectedCountry || loading}
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {(user?.role === "ADMIN" || user?.role === "COMPTABLE") && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="default" className="h-11 px-5" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau client</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du nouveau client pour{" "}
                    {selectedCountry ? getCountryName(selectedCountry) : "le pays sélectionné"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nom du client *</Label>
                      <Input
                        id="client-name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="Entrez le nom du client"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legal-form">Forme juridique *</Label>
                      <Select
                        onValueChange={(v) => setNewClient({ ...newClient, legalForm: v as Client["legalForm"] })}
                      >
                        <SelectTrigger><SelectValue placeholder="Forme juridique" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SARL">SARL</SelectItem>
                          <SelectItem value="SA">SA</SelectItem>
                          <SelectItem value="SUARL">SUARL</SelectItem>
                          <SelectItem value="INDIVIDUAL">Individuel</SelectItem>
                          <SelectItem value="OTHER">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type de client *</Label>
                    <Select
                      value={newClient.clientType}
                      onValueChange={(v) => setNewClient({ ...newClient, clientType: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Type de client" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Entreprise classique</SelectItem>
                        <SelectItem value="ASSURANCE">Société d'assurance</SelectItem>
                        <SelectItem value="SMT">Société de microfinance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-number">Numéro fiscal</Label>
                    <Input
                      id="tax-number"
                      value={newClient.taxNumber}
                      onChange={(e) => setNewClient({ ...newClient, taxNumber: e.target.value })}
                      placeholder="Numéro fiscal"
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input id="address" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} placeholder="Adresse" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input id="city" value={newClient.city} onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} placeholder="Ville" autoComplete="off" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} placeholder="Téléphone" autoComplete="off" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} placeholder="Email" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreateClient} disabled={isCreating || !newClient.name || !selectedCountry}>
                      {isCreating ? (<><Loader className="h-4 w-4 mr-2 animate-spin" />Création...</>) : "Créer le client"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Country indicator + count */}
        {selectedCountry && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{getCountryFlag(selectedCountry)}</span>
              <span className="font-medium text-sm">{getCountryName(selectedCountry)}</span>
              <Badge variant="secondary" className="text-xs">
                {clientsToDisplay.length} client(s){searchTerm && " trouvé(s)"}
              </Badge>
            </div>
            {(loading || isSearching) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {isSearching ? "Recherche..." : "Chargement..."}
              </div>
            )}
          </div>
        )}

        {/* Client list */}
        <div className="space-y-2">
          {!selectedCountry ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-14">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-3" />
                <h3 className="font-medium mb-1">Sélectionnez un pays</h3>
                <p className="text-sm text-muted-foreground">Veuillez sélectionner un pays pour afficher les clients</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-14">
                <Loader2 className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-3 animate-spin" />
                <h3 className="font-medium mb-1">Chargement...</h3>
                <p className="text-sm text-muted-foreground">Récupération des clients en cours</p>
              </CardContent>
            </Card>
          ) : clientsToDisplay.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-14">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-3" />
                <h3 className="font-medium mb-1">
                  {searchTerm ? "Aucun résultat" : "Aucun client accessible"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? `Aucun client ne correspond à "${searchTerm}" pour ${getCountryName(selectedCountry)}`
                    : `Aucun client accessible pour ${getCountryName(selectedCountry)} (rôle: ${user?.role})`}
                </p>
                {(user?.role === "ADMIN" || user?.role === "COMPTABLE") && (
                  <Button onClick={() => setIsDialogOpen(true)} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un nouveau client
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            clientsToDisplay.map((client) => (
              <Card
                key={client.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-orange-400 group border"
                onClick={() => handleSelectClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-600 text-white rounded-lg p-2.5 w-11 h-11 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-base">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold truncate">{client.name}</h3>
                        <Badge variant="outline" className="text-xs">{client.legalForm}</Badge>
                        {user?.role === "COMPTABLE" && client.createdBy === user.id && (
                          <Badge variant="default" className="text-xs">
                            <User className="h-3 w-3 mr-1" />Votre client
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {client.taxNumber && <span>{client.taxNumber}</span>}
                        {client.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{client.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />{getCountryName(client.country)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Success overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl px-10 py-8 text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold">Client créé avec succès</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
