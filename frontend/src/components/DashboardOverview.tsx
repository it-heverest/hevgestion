import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { TrendingUp, FileText, CheckCircle, Upload, Edit3 } from "lucide-react";

export function DashboardOverview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Welcome Section */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-sm text-gray-600">
          Vue d'ensemble de vos activités financières
        </p>
      </div>

      {/* KPIs - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Chiffre d'Affaires
              </p>
              <p className="text-2xl font-bold">850 000 €</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-muted-foreground ml-2">vs mois dernier</span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Résultat Net
              </p>
              <p className="text-2xl font-bold">230 000 €</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+18.7%</span>
            <span className="text-muted-foreground ml-2">vs mois dernier</span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Clients Actifs
              </p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+3</span>
            <span className="text-muted-foreground ml-2">ce mois</span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                DSF Générés
              </p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+5</span>
            <span className="text-muted-foreground ml-2">cette semaine</span>
          </div>
        </Card>
      </div>

      {/* Actions principales - Enhanced Design */}
      <Card className="p-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col justify-center gap-3 hover:bg-blue-50 hover:border-blue-400 transition-all group border-2"
            >
              <Upload className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Importer des données</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col justify-center gap-3 hover:bg-green-50 hover:border-green-400 transition-all group border-2"
            >
              <FileText className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Générer DSF</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col justify-center gap-3 hover:bg-purple-50 hover:border-purple-400 transition-all group border-2"
            >
              <Edit3 className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Éditer rapports</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
