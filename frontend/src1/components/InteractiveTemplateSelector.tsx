import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { 
  FileText, 
  ArrowLeft,
  Copy,
  Clipboard,
  Check
} from 'lucide-react';

interface InteractiveTemplateSelectorProps {
  onBack: () => void;
  onSelectTemplate: (template: any) => void;
}

const templates = [
  {
    id: 'bilan-actif',
    name: 'Bilan - Actif',
    category: 'États Financiers',
    description: 'Tableau des immobilisations et actifs circulants',
    data: {
      headers: ['ACTIF', 'Note', 'Brut', 'Amort./Prov.', 'Net N', 'Net N-1'],
      rows: [
        { type: 'section', label: 'ACTIF IMMOBILISÉ' },
        { type: 'data', compte: '211000', label: 'Terrains', values: ['2A', '', '', '', ''] },
        { type: 'data', compte: '213000', label: 'Bâtiments', values: ['2B', '', '', '', ''] },
        { type: 'data', compte: '215000', label: 'Installations techniques', values: ['2C', '', '', '', ''] },
        { type: 'total', label: 'TOTAL ACTIF IMMOBILISÉ' },
        { type: 'section', label: 'ACTIF CIRCULANT' },
        { type: 'data', compte: '411000', label: 'Créances clients', values: ['4A', '', '', '', ''] },
        { type: 'data', compte: '512000', label: 'Banques', values: ['5A', '', '', '', ''] },
        { type: 'total', label: 'TOTAL ACTIF CIRCULANT' },
        { type: 'grandtotal', label: 'TOTAL GÉNÉRAL ACTIF' },
      ]
    }
  },
  {
    id: 'bilan-passif',
    name: 'Bilan - Passif',
    category: 'États Financiers',
    description: 'Tableau des capitaux propres et dettes',
    data: {
      headers: ['PASSIF', 'Note', 'Net N', 'Net N-1'],
      rows: [
        { type: 'section', label: 'CAPITAUX PROPRES' },
        { type: 'data', compte: '101000', label: 'Capital social', values: ['10A', '', ''] },
        { type: 'data', compte: '106000', label: 'Réserves', values: ['10B', '', ''] },
        { type: 'data', compte: '120000', label: 'Résultat de l\'exercice', values: ['10C', '', ''] },
        { type: 'total', label: 'TOTAL CAPITAUX PROPRES' },
        { type: 'section', label: 'DETTES' },
        { type: 'data', compte: '161000', label: 'Emprunts', values: ['16A', '', ''] },
        { type: 'data', compte: '401000', label: 'Fournisseurs', values: ['40A', '', ''] },
        { type: 'total', label: 'TOTAL DETTES' },
        { type: 'grandtotal', label: 'TOTAL GÉNÉRAL PASSIF' },
      ]
    }
  },
  {
    id: 'compte-resultat',
    name: 'Compte de Résultat',
    category: 'États Financiers',
    description: 'Produits et charges de l\'exercice',
    data: {
      headers: ['Libellé', 'Note', 'Exercice N', 'Exercice N-1'],
      rows: [
        { type: 'section', label: 'PRODUITS D\'EXPLOITATION' },
        { type: 'data', compte: '701000', label: 'Ventes de marchandises', values: ['70A', '', ''] },
        { type: 'data', compte: '706000', label: 'Prestations de services', values: ['70B', '', ''] },
        { type: 'total', label: 'TOTAL PRODUITS' },
        { type: 'section', label: 'CHARGES D\'EXPLOITATION' },
        { type: 'data', compte: '601000', label: 'Achats de marchandises', values: ['60A', '', ''] },
        { type: 'data', compte: '661000', label: 'Salaires', values: ['66A', '', ''] },
        { type: 'total', label: 'TOTAL CHARGES' },
        { type: 'grandtotal', label: 'RÉSULTAT NET' },
      ]
    }
  },
  {
    id: 'tableau-flux',
    name: 'Tableau des Flux de Trésorerie',
    category: 'États Financiers',
    description: 'Flux de trésorerie par activité',
    data: {
      headers: ['Flux de trésorerie', 'Exercice N', 'Exercice N-1'],
      rows: [
        { type: 'section', label: 'ACTIVITÉS OPÉRATIONNELLES' },
        { type: 'data', label: 'Encaissements clients', values: ['', ''] },
        { type: 'data', label: 'Décaissements fournisseurs', values: ['', ''] },
        { type: 'total', label: 'FLUX NET OPÉRATIONNEL' },
        { type: 'section', label: 'ACTIVITÉS D\'INVESTISSEMENT' },
        { type: 'data', label: 'Acquisition d\'immobilisations', values: ['', ''] },
        { type: 'total', label: 'FLUX NET D\'INVESTISSEMENT' },
        { type: 'grandtotal', label: 'VARIATION DE TRÉSORERIE' },
      ]
    }
  }
];

export function InteractiveTemplateSelector({ onBack, onSelectTemplate }: InteractiveTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [copiedRows, setCopiedRows] = useState<number[]>([]);

  const handleCopyRow = (rowIndex: number) => {
    const row = selectedTemplate.data.rows[rowIndex];
    const rowText = [row.label, ...(row.values || [])].join('\t');
    
    navigator.clipboard.writeText(rowText);
    setCopiedRows([...copiedRows, rowIndex]);
    
    setTimeout(() => {
      setCopiedRows(copiedRows.filter(i => i !== rowIndex));
    }, 2000);
  };

  const handleCopyMultipleRows = (startIndex: number, endIndex: number) => {
    const rows = selectedTemplate.data.rows.slice(startIndex, endIndex + 1);
    const text = rows.map((row: any) => [row.label, ...(row.values || [])].join('\t')).join('\n');
    
    navigator.clipboard.writeText(text);
    
    const indices = [];
    for (let i = startIndex; i <= endIndex; i++) {
      indices.push(i);
    }
    setCopiedRows(indices);
    
    setTimeout(() => {
      setCopiedRows([]);
    }, 2000);
  };

  const handleUseTemplate = () => {
    onSelectTemplate(selectedTemplate);
  };

  if (selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux templates
            </Button>
            <div>
              <h2 className="font-semibold">{selectedTemplate.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleCopyMultipleRows(0, selectedTemplate.data.rows.length - 1)}>
              <Clipboard className="h-4 w-4 mr-2" />
              Copier tout
            </Button>
            <Button size="sm" onClick={handleUseTemplate}>
              Utiliser ce template
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aperçu du Template</CardTitle>
            <CardDescription>
              Vous pouvez copier des lignes individuelles ou plusieurs lignes à la fois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {/* Headers */}
                <div className="grid gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold" 
                     style={{ gridTemplateColumns: `repeat(${selectedTemplate.data.headers.length}, 1fr)` }}>
                  {selectedTemplate.data.headers.map((header: string, i: number) => (
                    <div key={i} className="text-sm">{header}</div>
                  ))}
                </div>

                {/* Rows */}
                {selectedTemplate.data.rows.map((row: any, rowIndex: number) => (
                  <div key={rowIndex} className="group">
                    <div 
                      className={`grid gap-2 p-3 rounded-lg border transition-all ${
                        row.type === 'section' ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold' :
                        row.type === 'total' ? 'bg-green-50 dark:bg-green-900/20 font-semibold' :
                        row.type === 'grandtotal' ? 'bg-purple-50 dark:bg-purple-900/20 font-bold' :
                        'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                      } ${copiedRows.includes(rowIndex) ? 'ring-2 ring-green-500' : ''}`}
                      style={{ gridTemplateColumns: `repeat(${selectedTemplate.data.headers.length}, 1fr)` }}
                    >
                      <div className="flex items-center gap-2">
                        {row.compte && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {row.compte}
                          </Badge>
                        )}
                        <span className="text-sm">{row.label}</span>
                      </div>
                      {(row.values || []).map((value: string, i: number) => (
                        <div key={i} className="text-sm">
                          <Input 
                            defaultValue={value} 
                            className="h-8 text-sm"
                            placeholder="Entrez une valeur"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Copy button */}
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => handleCopyRow(rowIndex)}
                      >
                        {copiedRows.includes(rowIndex) ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copier cette ligne
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm">
            💡 <strong>Astuce :</strong> Vous pouvez copier une ligne et la coller directement dans Excel ou dans l'éditeur.
            Les données seront automatiquement réparties dans les bonnes colonnes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Templates Interactifs</h2>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un template SYSCOHADA pré-configuré
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-500 group"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{template.description}</CardDescription>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {template.data.rows.length} lignes
                </span>
                <Button size="sm" variant="outline">
                  Sélectionner
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
