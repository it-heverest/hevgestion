import { useState } from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './ui/tooltip';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  HelpCircle, 
  Book, 
  Video, 
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';
import { Input } from './ui/input';

interface HelpTooltipProps {
  content: string;
  title?: string;
  children: React.ReactNode;
}

export function HelpTooltip({ content, title, children }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface HelpCenterProps {
  context?: string;
}

const helpArticles = [
  {
    id: 'import-balance',
    title: 'Comment importer une balance comptable ?',
    category: 'Import',
    description: 'Guide étape par étape pour importer vos balances Excel ou CSV',
    content: `
      1. Cliquez sur "Import Balance" dans le menu
      2. Choisissez votre fichier Excel (.xlsx, .xls) ou CSV
      3. Vérifiez la correspondance des colonnes
      4. Cliquez sur "Importer" pour valider
      
      Formats acceptés :
      - Excel : .xlsx, .xls
      - CSV : séparateur virgule ou point-virgule
      - Exports ERP : SAP, Sage, Ciel
      
      Colonnes requises :
      - Numéro de compte
      - Libellé du compte
      - Débit ou Crédit
    `,
    tags: ['import', 'balance', 'excel']
  },
  {
    id: 'syscohada-comptes',
    title: 'Comprendre le plan comptable SYSCOHADA',
    category: 'Comptabilité',
    description: 'Structure et organisation des comptes SYSCOHADA révisé',
    content: `
      Le plan comptable SYSCOHADA est organisé en 9 classes :
      
      Classe 1 : Comptes de capitaux
      Classe 2 : Comptes d'immobilisations
      Classe 3 : Comptes de stocks
      Classe 4 : Comptes de tiers
      Classe 5 : Comptes de trésorerie
      Classe 6 : Comptes de charges
      Classe 7 : Comptes de produits
      Classe 8 : Comptes spéciaux
      Classe 9 : Comptabilité analytique
      
      Chaque classe est subdivisée en comptes et sous-comptes.
    `,
    tags: ['syscohada', 'plan comptable', 'comptes']
  },
  {
    id: 'generer-rapports',
    title: 'Générer les états financiers OHADA',
    category: 'Rapports',
    description: 'Comment générer automatiquement vos états OHADA',
    content: `
      1. Assurez-vous d'avoir importé votre balance
      2. Allez dans "Rapports"
      3. Sélectionnez l'état souhaité :
         - Bilan Actif/Passif
         - Compte de Résultat
         - TAFIRE
         - Notes annexes
      4. Cliquez sur "Générer"
      5. Exportez en PDF ou Excel
      
      Les calculs sont automatiques selon les normes SYSCOHADA.
    `,
    tags: ['rapports', 'états financiers', 'ohada']
  },
  {
    id: 'roles-utilisateurs',
    title: 'Gestion des rôles et permissions',
    category: 'Administration',
    description: 'Comprendre les différents rôles utilisateur',
    content: `
      3 rôles disponibles :
      
      👤 Utilisateur simple :
      - Accès en lecture seule
      - Consultation des rapports
      - Pas de modification
      
      👥 Comptable :
      - Édition limitée des données
      - Import de balances
      - Génération de rapports
      - Certaines cellules verrouillées
      
      🛡️ Administrateur :
      - Accès complet sans restrictions
      - Tous les droits de modification
      - Gestion des utilisateurs
      - Paramètres système
    `,
    tags: ['rôles', 'permissions', 'utilisateurs']
  },
  {
    id: 'template-interactif',
    title: 'Utiliser les templates interactifs',
    category: 'Templates',
    description: 'Comment utiliser et personnaliser les templates SYSCOHADA',
    content: `
      Les templates interactifs permettent de :
      
      1. Partir d'un modèle pré-configuré
      2. Modifier les valeurs en temps réel
      3. Copier-coller vers Excel
      4. Sauvegarder vos modifications
      
      Fonctionnalités :
      - Copie ligne par ligne
      - Copie multiple de lignes
      - Format compatible Excel
      - Validation automatique
      
      Templates disponibles :
      - Bilan Actif/Passif
      - Compte de Résultat
      - Tableau des flux de trésorerie
    `,
    tags: ['templates', 'syscohada', 'excel']
  }
];

export function HelpCenter({ context }: HelpCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const filteredArticles = helpArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = Array.from(new Set(helpArticles.map(a => a.category)));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Aide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-600" />
            Centre d'Aide
          </DialogTitle>
          <DialogDescription>
            Documentation et guides pour utiliser FinanceERP Pro
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Sidebar */}
          <div className="col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-2">Catégories</p>
              {categories.map(category => {
                const count = helpArticles.filter(a => a.category === category).length;
                return (
                  <Button
                    key={category}
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {category}
                    <Badge variant="outline" className="ml-auto">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground px-2">Ressources</p>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Tutoriels vidéo
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Book className="h-4 w-4 mr-2" />
                Documentation
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="col-span-2">
            {selectedArticle ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {selectedArticle.category}
                      </Badge>
                      <CardTitle>{selectedArticle.title}</CardTitle>
                      <CardDescription>{selectedArticle.description}</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedArticle(null)}
                    >
                      Retour
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedArticle.content}
                      </pre>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    {selectedArticle.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredArticles.map(article => (
                    <Card 
                      key={article.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-base">{article.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {article.description}
                            </CardDescription>
                          </div>
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  
                  {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">Aucun article trouvé</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Essayez d'autres mots-clés
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
