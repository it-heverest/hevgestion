import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { clientService } from "../services/client.service";
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
  Clock,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const initialCompanies = [
  {
    id: "1",
    name: "ENTREPRISE ABC SARL",
    siret: "123 456 789 00012",
    sector: "Commerce de détail",
    lastAccess: "15 Oct 2025, 14:35",
    reports: 45,
    revenue: "2.5M €",
    employees: 25,
    logo: "A",
    currentExercise: 2025,
    exercises: [2025, 2024, 2023],
  },
  {
    id: "2",
    name: "SOCIÉTÉ XYZ SA",
    siret: "987 654 321 00034",
    sector: "Services professionnels",
    lastAccess: "14 Oct 2025, 09:20",
    reports: 32,
    revenue: "1.8M €",
    employees: 18,
    logo: "X",
    currentExercise: 2025,
    exercises: [2025, 2024, 2023, 2022],
  },
  {
    id: "3",
    name: "STARTUP TECH INNOVATE",
    siret: "456 789 123 00056",
    sector: "Technologies",
    lastAccess: "13 Oct 2025, 16:45",
    reports: 28,
    revenue: "950K €",
    employees: 12,
    logo: "S",
    currentExercise: 2025,
    exercises: [2025, 2024],
  },
  {
    id: "4",
    name: "GROUPE CONSULTING PRO",
    siret: "321 654 987 00078",
    sector: "Conseil en gestion",
    lastAccess: "12 Oct 2025, 11:30",
    reports: 52,
    revenue: "3.2M €",
    employees: 35,
    logo: "G",
    currentExercise: 2025,
    exercises: [2025, 2024, 2023, 2022, 2021],
  },
];

export function CompanySelector({
  onSelectCompany,
}: {
  onSelectCompany: (company: any) => void;
}) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load companies from backend
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const clients = await clientService.getClients();
        // Transform backend data to match component expectations
        const transformedCompanies = clients.map((client: any) => ({
          id: client.id,
          name: client.name,
          siret: client.taxNumber || "Non spécifié",
          sector: "Non spécifié", // Backend doesn't have sector field
          lastAccess: client.updatedAt ? new Date(client.updatedAt).toLocaleDateString("fr-FR") : "Jamais",
          reports: 0, // Backend doesn't track reports count
          revenue: "Non spécifié", // Backend doesn't have revenue
          employees: 0, // Backend doesn't have employees count
          logo: client.name.charAt(0).toUpperCase(),
          currentExercise: new Date().getFullYear(),
          exercises: [new Date().getFullYear()],
          address: client.address,
          phone: client.phone,
          email: client.email,
          legalForm: client.legalForm,
          country: client.country,
          currency: client.currency,
        }));
        setCompanies(transformedCompanies);
      } catch (error) {
        console.error("Error loading companies:", error);
        // Fallback to initial companies if backend fails
        setCompanies(initialCompanies);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCompanies();
    }
  }, [isAuthenticated]);

  // Nouveau client form
  const [newCompany, setNewCompany] = useState({
    name: "",
    siret: "",
    sector: "",
    address: "",
    phone: "",
    email: "",
    employees: "",
  });

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.siret.includes(searchTerm) ||
      company.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.siret) {
      alert("Veuillez remplir au moins le nom et le SIRET");
      return;
    }

    try {
      const clientData = {
        name: newCompany.name,
        country: "BJ", // Default to Benin
        legalForm: "SARL", // Default legal form
        taxNumber: newCompany.siret,
        address: newCompany.address,
        city: "", // Could be extracted from address
        phone: newCompany.phone,
        email: newCompany.email,
      };

      const createdClient = await clientService.createClient(clientData);

      // Transform to match component format
      const company = {
        id: createdClient.id,
        name: createdClient.name,
        siret: createdClient.taxNumber || "Non spécifié",
        sector: "Non spécifié",
        lastAccess: new Date().toLocaleDateString("fr-FR"),
        reports: 0,
        revenue: "Non spécifié",
        employees: 0,
        logo: createdClient.name.charAt(0).toUpperCase(),
        currentExercise: new Date().getFullYear(),
        exercises: [new Date().getFullYear()],
        address: createdClient.address,
        phone: createdClient.phone,
        email: createdClient.email,
        legalForm: createdClient.legalForm,
        country: createdClient.country,
        currency: createdClient.currency,
      };

      setCompanies([...companies, company]);
      setIsDialogOpen(false);
      setNewCompany({
        name: "",
        siret: "",
        sector: "",
        address: "",
        phone: "",
        email: "",
        employees: "",
      });

      // Sélectionner automatiquement la nouvelle entreprise et naviguer
      onSelectCompany(company);
      const uid = user?.id ?? "me";
      navigate(`/dashboard/${uid}/dashboard`);
    } catch (error: any) {
      alert(`Erreur lors de la création du client: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-2xl p-4 shadow-lg">
              <Building2 className="h-10 w-10" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                FinanceERP Pro
              </h1>
              <p className="text-sm text-muted-foreground">
                Sélectionnez votre client
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche et bouton créer */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un client par nom, SIRET ou secteur..."
              className="pl-12 h-12 text-base shadow-sm"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 px-6">
                <Plus className="h-5 w-5 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du nouveau client
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">
                      Nom de l'entreprise{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="ABC SARL"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, name: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siret">
                      SIRET / IFU <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="siret"
                      placeholder="123 456 789 00012"
                      value={newCompany.siret}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, siret: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Secteur d'activité</Label>
                    <Select
                      value={newCompany.sector}
                      onValueChange={(value: any) =>
                        setNewCompany({ ...newCompany, sector: value })
                      }
                    >
                      <SelectTrigger id="sector" className="h-11">
                        <SelectValue placeholder="Sélectionnez un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Commerce de détail">
                          Commerce de détail
                        </SelectItem>
                        <SelectItem value="Services professionnels">
                          Services professionnels
                        </SelectItem>
                        <SelectItem value="Technologies">
                          Technologies
                        </SelectItem>
                        <SelectItem value="Conseil en gestion">
                          Conseil en gestion
                        </SelectItem>
                        <SelectItem value="BTP">BTP</SelectItem>
                        <SelectItem value="Industrie">Industrie</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Rue de la Paix, Cotonou"
                      value={newCompany.address}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          address: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+229 XX XX XX XX"
                      value={newCompany.phone}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, phone: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@entreprise.com"
                      value={newCompany.email}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, email: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="employees"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Nombre d'employés
                    </Label>
                    <Input
                      id="employees"
                      type="number"
                      placeholder="25"
                      value={newCompany.employees}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          employees: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreateCompany}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Liste des entreprises */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des clients...</p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="cursor-pointer hover:shadow-xl transition-all hover:border-orange-500 hover:-translate-y-1 group border-2"
                onClick={() => {
                  onSelectCompany(company);
                  const uid = user?.id ?? "me";
                  navigate(`/dashboard/${uid}/dashboard`);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-3 w-14 h-14 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all">
                      <span className="font-bold text-xl">{company.logo}</span>
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-lg">
                        {company.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {company.siret}
                      </p>
                    </div>

                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {company.sector}
                    </Badge>

                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Aucun résultat */}
        {filteredCompanies.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="text-center py-16">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="font-medium mb-2 text-lg">Aucun client trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche ou créez un
                nouveau client
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un nouveau client
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
