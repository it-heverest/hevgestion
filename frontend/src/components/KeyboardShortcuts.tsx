import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Keyboard, Command } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { key: '⌘ K', description: 'Ouvrir la recherche globale', category: 'Navigation' },
  { key: '⌘ D', description: 'Aller au tableau de bord', category: 'Navigation' },
  { key: '⌘ I', description: 'Importer une balance', category: 'Navigation' },
  { key: '⌘ R', description: 'Voir les rapports', category: 'Navigation' },
  { key: '⌘ H', description: 'Voir l\'historique', category: 'Navigation' },
  { key: '⌘ ,', description: 'Ouvrir les paramètres', category: 'Navigation' },
  
  // Actions
  { key: '⌘ S', description: 'Sauvegarder', category: 'Actions' },
  { key: '⌘ E', description: 'Exporter', category: 'Actions' },
  { key: '⌘ N', description: 'Nouveau', category: 'Actions' },
  { key: '⌘ P', description: 'Imprimer', category: 'Actions' },
  
  // Édition
  { key: '⌘ Z', description: 'Annuler', category: 'Édition' },
  { key: '⌘ Y', description: 'Refaire', category: 'Édition' },
  { key: '⌘ C', description: 'Copier', category: 'Édition' },
  { key: '⌘ V', description: 'Coller', category: 'Édition' },
  { key: '⌘ X', description: 'Couper', category: 'Édition' },
  
  // Aide
  { key: '⌘ ?', description: 'Afficher l\'aide', category: 'Aide' },
  { key: 'Esc', description: 'Fermer les dialogues', category: 'Aide' },
];

interface KeyboardShortcutsProps {
  onNavigate?: (view: string) => void;
}

export function KeyboardShortcuts({ onNavigate }: KeyboardShortcutsProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Recherche globale
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // La recherche globale gère déjà cela
      }
      
      // Dashboard
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onNavigate?.('dashboard');
      }
      
      // Import
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onNavigate?.('import');
      }
      
      // Rapports
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onNavigate?.('reports');
      }
      
      // Historique
      if (e.key === 'h' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onNavigate?.('history');
      }
      
      // Paramètres
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onNavigate?.('settings');
      }
      
      // Aide - raccourcis clavier
      if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Keyboard className="h-4 w-4 mr-2" />
          Raccourcis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5 text-blue-600" />
            Raccourcis Clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement dans l'application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{shortcut.description}</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {shortcut.key}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Astuce :</strong> Sur Windows/Linux, remplacez ⌘ par Ctrl</p>
          <p>📝 Les raccourcis sont disponibles partout dans l'application</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant pour afficher un indicateur de raccourci
export function KeyboardHint({ shortcut }: { shortcut: string }) {
  return (
    <Badge variant="outline" className="ml-auto font-mono text-xs opacity-70">
      {shortcut}
    </Badge>
  );
}
