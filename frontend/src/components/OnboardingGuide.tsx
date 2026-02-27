import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Edit3,
  Download,
  RefreshCw,
  Users,
  Building,
  Calculator,
  Zap,
  BookOpen,
} from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: string;
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingGuide({
  isOpen,
  onClose,
  onComplete,
}: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Bienvenue dans HevGestion DSF",
      description: "Votre assistant fiscal intelligent",
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bienvenue dans HevGestion !
            </h3>
            <p className="text-gray-600">
              L'application de gestion des Déclarations Sociales et Fiscales
              (DSF) la plus simple et puissante.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Ce guide prend 5 minutes
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Découvrez les fonctionnalités essentielles pour commencer à
                  travailler efficacement.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "navigation",
      title: "Navigation et interface",
      description: "Comprendre l'interface principale",
      icon: <FileText className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Bouton Actualiser</span>
              </div>
              <p className="text-sm text-gray-600">
                Cliquez pour rafraîchir les données depuis le serveur.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium">Statut de connexion</span>
              </div>
              <p className="text-sm text-gray-600">
                Indicateur vert = connecté et synchronisé.
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Conseil :</strong> Utilisez la recherche pour trouver
              rapidement vos rapports par nom ou catégorie.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "reports",
      title: "Les rapports DSF",
      description: "Comprendre les différents types de rapports",
      icon: <Calculator className="h-8 w-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Notes (1-10)</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Les annexes détaillées de votre bilan et compte de résultat.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  Immobilisations
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Stocks
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Créances
                </Badge>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-green-600" />
                <span className="font-medium">Fiches signalétiques</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Informations générales sur l'entité et ses dirigeants.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  R1-R4
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Dirigeants
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Capital
                </Badge>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Important :</strong> Tous vos rapports sont
              automatiquement sauvegardés dans le cloud. Vos modifications sont
              synchronisées en temps réel.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "editing",
      title: "Édition des rapports",
      description: "Comment modifier et personnaliser vos rapports",
      icon: <Edit3 className="h-8 w-8 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium">Sélectionnez un rapport</h4>
                <p className="text-sm text-gray-600">
                  Cliquez sur n'importe quel rapport dans la liste pour
                  l'ouvrir.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium">Cliquez sur "Éditer"</h4>
                <p className="text-sm text-gray-600">
                  Activez le mode édition pour modifier les valeurs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium">Sauvegardez automatiquement</h4>
                <p className="text-sm text-gray-600">
                  Toutes vos modifications sont sauvegardées automatiquement.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">
                <strong>Sécurité :</strong> Vos données sont chiffrées et
                sauvegardées en temps réel.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "export",
      title: "Export et téléchargement",
      description: "Générer des PDF et exporter vos rapports",
      icon: <Download className="h-8 w-8 text-red-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-blue-600" />
                <span className="font-medium">PDF Instantané</span>
              </div>
              <p className="text-sm text-gray-600">
                Générez un PDF professionnel de n'importe quel rapport en un
                clic.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium">Format DSF Complet</span>
              </div>
              <p className="text-sm text-gray-600">
                Exportez l'ensemble de votre déclaration au format
                réglementaire.
              </p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Conseil pro :</strong> Les PDF générés respectent
              automatiquement la mise en page réglementaire exigée par
              l'administration fiscale.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "complete",
      title: "Vous êtes prêt !",
      description: "Commencez à travailler avec HevGestion",
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Félicitations !
            </h3>
            <p className="text-gray-600">
              Vous maîtrisez maintenant les bases de HevGestion DSF.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Raccourcis utiles :
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                • <kbd className="bg-white px-1 rounded">Ctrl+F</kbd> :
                Recherche
              </div>
              <div>
                • <kbd className="bg-white px-1 rounded">F5</kbd> : Actualiser
              </div>
              <div>
                • <kbd className="bg-white px-1 rounded">Échap</kbd> : Fermer
              </div>
              <div>• Clic droit : Options rapides</div>
            </div>
          </div>
          <div className="text-center">
            <Button onClick={onComplete} size="lg" className="px-8">
              Commencer à travailler
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, steps[currentStep].id]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(new Set(steps.map((s) => s.id)));
    onComplete();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {steps[currentStep].icon}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {steps[currentStep].title}
                </h2>
                <p className="text-sm text-gray-600">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <span>{Math.round(progress)}% terminé</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="min-h-[300px]">{steps[currentStep].content}</div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Passer le guide
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    Terminer
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
