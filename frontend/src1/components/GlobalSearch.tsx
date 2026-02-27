import { useState, useEffect } from 'react';
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Search,
  FileText,
  Upload,
  Edit3,
  Calendar,
  Settings,
  History,
  BarChart3,
  Building2,
  Flag,
  TrendingUp,
  Calculator
} from 'lucide-react';

interface GlobalSearchProps {
  onNavigate: (view: string) => void;
  companyName?: string;
  currentExercise?: number;
}

const navigationItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3, category: 'Navigation' },
  { id: 'exercise', label: 'Exercice', icon: Calendar, category: 'Navigation' },
  { id: 'import', label: 'Import Balance', icon: Upload, category: 'Navigation' },
  { id: 'traitement', label: 'Traitement', icon: Edit3, category: 'Navigation' },
  { id: 'editor', label: 'Éditeur Excel', icon: FileText, category: 'Navigation' },
  { id: 'reports', label: 'Rapports', icon: FileText, category: 'Navigation' },
  { id: 'deadlines', label: 'Échéances', icon: Calendar, category: 'Navigation' },
  { id: 'history', label: 'Historique', icon: History, category: 'Navigation' },
  { id: 'settings', label: 'Paramètres', icon: Settings, category: 'Navigation' },
];

const quickActions = [
  { id: 'new-balance', label: 'Importer une nouvelle balance', icon: Upload, action: 'import', category: 'Actions rapides' },
  { id: 'new-exercise', label: 'Créer un exercice', icon: Calendar, action: 'exercise', category: 'Actions rapides' },
  { id: 'generate-reports', label: 'Générer les rapports', icon: FileText, action: 'reports', category: 'Actions rapides' },
  { id: 'view-deadlines', label: 'Voir les échéances fiscales', icon: TrendingUp, action: 'deadlines', category: 'Actions rapides' },
];

const helpTopics = [
  { id: 'import-guide', label: 'Comment importer une balance ?', category: 'Aide', keywords: ['import', 'balance', 'excel', 'csv'] },
  { id: 'syscohada', label: 'Plan comptable SYSCOHADA', category: 'Aide', keywords: ['syscohada', 'plan', 'comptable', 'comptes'] },
  { id: 'reports-guide', label: 'Générer les états financiers', category: 'Aide', keywords: ['rapports', 'états', 'financiers', 'bilan'] },
  { id: 'roles', label: 'Gestion des rôles utilisateur', category: 'Aide', keywords: ['rôles', 'permissions', 'utilisateurs', 'admin'] },
];

export function GlobalSearch({ onNavigate, companyName, currentExercise }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  const filteredNavigation = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActions = quickActions.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHelp = helpTopics.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Rechercher...</span>
        <span className="inline-flex lg:hidden">Rechercher</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Tapez une commande ou recherchez..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
            </div>
          </CommandEmpty>

          {/* Info contexte */}
          {companyName && currentExercise && !searchQuery && (
            <>
              <CommandGroup heading="Contexte actuel">
                <div className="px-2 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Exercice {currentExercise}</span>
                  </div>
                </div>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Navigation */}
          {filteredNavigation.length > 0 && (
            <CommandGroup heading="Navigation">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(() => onNavigate(item.id))}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Actions rapides */}
          {filteredActions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Actions rapides">
                {filteredActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.label}
                      onSelect={() => handleSelect(() => onNavigate(item.action))}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Action
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {/* Aide */}
          {filteredHelp.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Aide">
                {filteredHelp.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(() => {})}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      ?
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
