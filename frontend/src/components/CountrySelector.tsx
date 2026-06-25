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
  Phone,
  Mail,
  Users,
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
  const [isInitializing, setIsInitializing] = useState(true);

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
    saveSelectionsToServer,
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

  // Step 1: Handle authentication and initialization using AppContext
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🔄 Initializing CountrySelector with AppContext...");

      // Wait for auth to be determined
      if (authLoading) {
        console.log("⏳ Auth still loading...");
        return;
      }

      // If not authenticated, do not redirect — allow local mode with a loader/banner
      if (!isAuthenticated) {
        console.warn("🚫 Not authenticated — continuing in local mode");
        // proceed without redirect so UI remains visible
      }

      // Restore selections from encrypted storage using AppContext
      if (user && clients.length > 0) {
        console.log("🔄 Restoring selections from AppContext...");
        await restoreSelectionsFromServer();
      }

      // Set default country if none selected
      if (!selectedCountry && countries.length > 0) {
        const defaultCountry = countries[0].code;
        console.log("🌍 Setting default country:", defaultCountry);
        setSelectedCountry(defaultCountry);
      }

      setIsInitializing(false);
      console.log("✅ CountrySelector initialized with AppContext");
    };

    initializeApp();
  }, [
    isAuthenticated,
    authLoading,
    navigate,
    user,
    selectedCountry,
    countries,
    setSelectedClient,
    setSelectedCountry,
    clients,
    restoreSelectionsFromServer,
  ]);

  // Handle country selection change using AppContext
  const handleCountryChange = useCallback(
    async (countryCode: string) => {
      setSelectedCountry(countryCode);
      // AppContext will automatically save to encrypted storage via useEffect
    },
    [setSelectedCountry],
  );

  // Filter clients based on user role and ownership
  const accessibleClients = useMemo(() => {
    if (!user) return [];

    console.log("🔐 User role:", user.role, "User ID:", user.id);
    console.log("📋 Total clients:", clients.length);

    let accessibleClients: Client[] = [];

    switch (user.role) {
      case "ADMIN":
        accessibleClients = clients;
        console.log(
          "👑 ADMIN: Access to all clients",
          accessibleClients.length,
        );
        break;

      case "COMPTABLE":
        accessibleClients = clients.filter((client) => {
          const isOwner = client.createdBy === user.id;
          return isOwner;
        });
        console.log(
          "📊 COMPTABLE: Access to owned clients",
          accessibleClients.length,
        );
        break;

      case "ASSISTANT":
        accessibleClients = []; // Placeholder - needs folder assignment check
        console.log("👥 ASSISTANT: Limited access", accessibleClients.length);
        break;

      default:
        accessibleClients = [];
    }

    // Apply country filter if selected
    if (selectedCountry) {
      accessibleClients = accessibleClients.filter(
        (client) => client.country === selectedCountry,
      );
    }

    console.log("🎯 Final accessible clients:", accessibleClients.length);
    return accessibleClients;
  }, [clients, user, selectedCountry]);

  // Filter search results based on accessibility
  const getAccessibleSearchResults = useCallback(
    (results: Client[]) => {
      if (!user) return [];

      return results.filter((client) => {
        switch (user.role) {
          case "ADMIN":
            return true;
          case "COMPTABLE":
            return client.createdBy === user.id;
          case "ASSISTANT":
            return false;
          default:
            return false;
        }
      });
    },
    [user],
  );

  // Recherche en temps réel
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim() && selectedCountry) {
        setIsSearching(true);
        try {
          const results = await searchClients(searchTerm, selectedCountry);
          const accessibleResults = getAccessibleSearchResults(results);
          setSearchResults(accessibleResults);
        } catch (err) {
          console.error("Erreur recherche:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCountry, searchClients, getAccessibleSearchResults]);

  const clientsToDisplay = searchTerm ? searchResults : accessibleClients;

  // Countries available based on user role and accessible clients
  const availableCountries = useMemo(
    () =>
      user?.role === "ADMIN" || user?.role === "COMPTABLE"
        ? countries
        : countries.filter((country) =>
            accessibleClients.some((client) => client.country === country.code),
          ),
    [user?.role, countries, accessibleClients],
  );

  // Ensure selected country is valid (has accessible clients)
  useEffect(() => {
    if (
      !isDialogOpen &&
      selectedCountry &&
      !availableCountries.some((c) => c.code === selectedCountry)
    ) {
      const newCountry = availableCountries[0]?.code || null;
      setSelectedCountry(newCountry);
    }
  }, [isDialogOpen, selectedCountry, availableCountries, setSelectedCountry]);

  const handleCreateClient = async () => {
    // 1. Better Validation: check legalForm to satisfy the TS error
    if (!newClient.name || !selectedCountry || !newClient.legalForm) {
      alert(
        "Veuillez remplir les informations obligatoires (Nom, Pays, Forme Juridique)",
      );
      return;
    }

    setIsCreating(true);
    try {
      // 2. Type casting only if strictly necessary, but better to spread
      const clientData = {
        ...newClient,
        country: selectedCountry,
      } as Client;

      const client = await createClient(clientData);

      setIsDialogOpen(false);

      // 3. Reset form to match your interface defaults
      setNewClient({
        name: "",
        legalForm: "SARL",
        clientType: "NORMAL",
        taxNumber: "",
        address: "",
        city: "",
        phone: "",
        email: "",
      });

      setShowSuccess(true);
      setSelectedClient(client);

      // 4. Critical: Using a template literal correctly for the URL
      // Ensure the path starts with a / if it's an absolute path
      const uid = user?.id || "me";
      const targetPath = `/fr/web/user/dashboard/${uid}/dashboard`;

      setTimeout(() => {
        setShowSuccess(false);
        navigate(targetPath);
      }, 1000);
    } catch (error) {
      console.error("Erreur création client:", error);
      // Suggestion: Add a toast/alert for the user here
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectClient = useCallback(
    (client: Client) => {
      setSelectedClient(client);
      const uid = user?.id || "me";
      // Added leading slash to ensure navigation from root
      navigate(`/fr/web/user/dashboard/${uid}/dashboard`);
    },
    [setSelectedClient, navigate, user],
  );

  const getCountryName = useCallback(
    (countryCode: string) => {
      return countries.find((c) => c.code === countryCode)?.name || countryCode;
    },
    [countries],
  );

  const getCountryFlag = useCallback((countryCode: string) => {
    const flagEmojis: { [key: string]: string } = {
      BJ: "🇧🇯",
      BF: "🇧🇫",
      CI: "🇨🇮",
      SN: "🇸🇳",
      CM: "🇨🇲",
      TG: "🇹🇬",
    };
    return flagEmojis[countryCode] || "🇧🇯";
  }, []);

  const getUserRoleBadge = useCallback((userRole: string) => {
    const roleConfig = {
      ADMIN: { label: "Administrateur", variant: "default" as const },
      COMPTABLE: { label: "Comptable", variant: "secondary" as const },
      ASSISTANT: { label: "Assistant", variant: "outline" as const },
    };

    return (
      roleConfig[userRole as keyof typeof roleConfig] || {
        label: userRole,
        variant: "outline" as const,
      }
    );
  }, []);

  // Handle refresh action
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    await reloadInitialData();
  }, [reloadInitialData]);

  // Show loading state during initialization
  if (isInitializing || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-orange-600" />
          <p className="text-muted-foreground">Chargement ...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry when app context reports an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => reloadInitialData()}>Réessayer</Button>
                  <Button variant="outline" onClick={() => clearAppData()}>
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show app in local mode but surface a banner

  // Regular client selection for existing users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        {/* En-tête avec info utilisateur */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-2xl p-4 shadow-lg">
              <Building2 className="h-10 w-10" />
            </div> */}
            <div className="text-align-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                HevGestion
              </h1>
              <p className="text-sm text-muted-foreground">
                Sélectionnez votre client
              </p>
            </div>
            {!isAuthenticated && (
              <div className="mx-auto mt-4 max-w-xl bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-yellow-700" />
                <div className="text-sm">
                  Mode déconnecté — authentification désactivée (affichage
                  local)
                </div>
              </div>
            )}
          </div>

          {/* User info badge */}
          {user && (
            <div className="flex items-center justify-center gap-2">
              <Badge {...getUserRoleBadge(user.role)} className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {getUserRoleBadge(user.role).label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
              {/* <Badge variant="outline" className="text-xs">
                🔒 Session chiffrée
              </Badge> */}
            </div>
          )}
        </div>

        {/* Sélection du pays */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Pays du client
            </CardTitle>
            <CardDescription>
              {user?.role === "ADMIN"
                ? "Tous les pays disponibles"
                : "Pays avec vos clients accessibles"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select
              value={selectedCountry || ""}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="h-12 text-base flex-1">
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => {
                  const countryClientCount = accessibleClients.filter(
                    (client) => client.country === country.code,
                  ).length;

                  return (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getCountryFlag(country.code)}
                          </span>
                          <span>{country.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {country.currency}
                          </Badge>
                        </div>
                        {/* {user?.role !== "ADMIN" && ( */}
                        <Badge variant="secondary" className="text-xs">
                          {countryClientCount} client(s)
                        </Badge>
                        {/* )} */}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Refresher onClick={handleRefresh} />
          </CardContent>
        </Card>

        {/* Barre de recherche et bouton créer */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                user?.role === "ADMIN"
                  ? "Rechercher un client par nom, numéro fiscal, ville..."
                  : "Rechercher parmi vos clients accessibles..."
              }
              className="pl-12 h-12 text-base shadow-sm"
              disabled={!selectedCountry || loading}
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Only show create button for ADMIN and COMPTABLE */}
          {(user?.role === "ADMIN" || user?.role === "COMPTABLE") && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-12 px-6" disabled={loading}>
                  <Plus className="h-5 w-5 mr-2" />
                  Nouveau client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau client</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du nouveau client pour{" "}
                    {selectedCountry
                      ? getCountryName(selectedCountry)
                      : "le pays sélectionné"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nom du client *</Label>
                      <Input
                        id="client-name"
                        value={newClient.name}
                        onChange={(e) =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                        placeholder="Entrez le nom du client"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legal-form">Forme juridique *</Label>
                      <Select
                        onValueChange={(value: string) =>
                          setNewClient({
                            ...newClient,
                            legalForm: value as Client["legalForm"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la forme juridique" />
                        </SelectTrigger>
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
                    <Label htmlFor="client-type">Type de client *</Label>
                    <Select
                      value={newClient.clientType}
                      onValueChange={(value: string) =>
                        setNewClient({ ...newClient, clientType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">
                          Entreprise classique
                        </SelectItem>
                        <SelectItem value="ASSURANCE">
                          Société d'assurance
                        </SelectItem>
                        <SelectItem value="SMT">
                          Société de microfinance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-number">Numéro fiscal</Label>
                    <Input
                      id="tax-number"
                      value={newClient.taxNumber}
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          taxNumber: e.target.value,
                        })
                      }
                      placeholder="Entrez le numéro fiscal"
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={newClient.address}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            address: e.target.value,
                          })
                        }
                        placeholder="Entrez l'adresse"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={newClient.city}
                        onChange={(e) =>
                          setNewClient({ ...newClient, city: e.target.value })
                        }
                        placeholder="Entrez la ville"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) =>
                          setNewClient({ ...newClient, phone: e.target.value })
                        }
                        placeholder="Entrez le numéro de téléphone"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                        placeholder="Entrez l'adresse email"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateClient}
                      disabled={
                        isCreating || !newClient.name || !selectedCountry
                      }
                    >
                      {isCreating ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        "Créer le client"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Indicateur du pays sélectionné */}
        {selectedCountry && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCountryFlag(selectedCountry)}</span>
              <span className="font-medium">
                {getCountryName(selectedCountry)}
              </span>
              <Badge variant="secondary">
                {clientsToDisplay.length} client(s) accessible(s)
                {searchTerm && " trouvé(s)"}
              </Badge>
            </div>
            {(loading || isSearching) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isSearching ? "Recherche..." : "Chargement..."}
              </div>
            )}
          </div>
        )}

        {/* Liste des clients */}
        <div className="space-y-3">
          {!selectedCountry ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-16">
                <Globe className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="font-medium mb-2 text-lg">
                  Sélectionnez un pays
                </h3>
                <p className="text-muted-foreground">
                  Veuillez sélectionner un pays pour afficher les clients
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-16">
                <Loader2 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4 animate-spin" />
                <h3 className="font-medium mb-2 text-lg">Chargement...</h3>
                <p className="text-muted-foreground">
                  Récupération des clients en cours
                </p>
              </CardContent>
            </Card>
          ) : clientsToDisplay.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-16">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="font-medium mb-2 text-lg">
                  {searchTerm ? "Aucun résultat" : "Aucun client accessible"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `Aucun client accessible ne correspond à "${searchTerm}" pour ${getCountryName(
                        selectedCountry,
                      )}`
                    : `Aucun client n'est accessible pour ${getCountryName(
                        selectedCountry,
                      )} avec votre rôle (${user?.role})`}
                </p>
                {(user?.role === "ADMIN" || user?.role === "COMPTABLE") && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    disabled={loading}
                  >
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
                className="cursor-pointer hover:shadow-xl transition-all hover:border-orange-500 hover:-translate-y-1 group border-2"
                onClick={() => handleSelectClient(client)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-3 w-14 h-14 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all">
                      <span className="font-bold text-xl">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate text-lg">
                          {client.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {client.legalForm}
                        </Badge>
                        {user?.role === "COMPTABLE" &&
                          client.createdBy === user.id && (
                            <Badge variant="default" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Votre client
                            </Badge>
                          )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{client.taxNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {getCountryName(client.country)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Overlay de succès pleine page */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold">Client créé avec succès</h3>
            </div>
          </div>
        )}

        {/* Affichage des erreurs globales */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
