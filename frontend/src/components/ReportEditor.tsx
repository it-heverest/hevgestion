import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { 
  Save,
  Download,
  FileText,
  Plus,
  X,
  Printer,
  Share2,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ChevronRight,
  Info,
  PanelRightOpen,
  PanelRightClose,
  Edit
} from 'lucide-react';

const sampleReports = [
  {
    id: '1',
    name: 'Bilan Comptable 2024',
    type: 'Bilan',
  },
  {
    id: '2',
    name: 'Compte de Résultat Q4',
    type: 'Résultat',
  },
  {
    id: '3',
    name: 'Flux de Trésorerie Novembre',
    type: 'Flux',
  }
];

// Données avec structure de comptes
const accountsData = {
  '2': {
    accounts: [
      { code: '201', name: 'Frais d\'établissement', amount: 15000 },
      { code: '205', name: 'Concessions et droits', amount: 35000 },
      { code: '208', name: 'Autres immobilisations', amount: 75000 },
    ],
    formula: '=SUM(201:208)'
  },
  '3': {
    accounts: [
      { code: '211', name: 'Terrains', amount: 150000 },
      { code: '213', name: 'Constructions', amount: 200000 },
      { code: '215', name: 'Installations techniques', amount: 100000 },
    ],
    formula: '=SUM(211:218)'
  },
  '4': {
    accounts: [
      { code: '261', name: 'Titres de participation', amount: 45000 },
      { code: '266', name: 'Autres immobilisations financières', amount: 40000 },
    ],
    formula: '=SUM(261:269)'
  },
  '5': {
    accounts: [],
    formula: '=C2+C3+C4',
    referenceCells: ['C2', 'C3', 'C4']
  },
  '7': {
    accounts: [
      { code: '31', name: 'Matières premières', amount: 55000 },
      { code: '35', name: 'Stocks de marchandises', amount: 70000 },
    ],
    formula: '=SUM(31:37)'
  },
  '8': {
    accounts: [
      { code: '411', name: 'Clients', amount: 165000 },
      { code: '416', name: 'Clients douteux', amount: 20000 },
    ],
    formula: '=SUM(411:418)'
  },
  '9': {
    accounts: [
      { code: '44', name: 'État et autres collectivités', amount: 45000 },
    ],
    formula: '=SUM(44)'
  },
  '10': {
    accounts: [
      { code: '512', name: 'Banque', amount: 80000 },
      { code: '530', name: 'Caisse', amount: 15000 },
    ],
    formula: '=SUM(512:530)'
  },
  '11': {
    accounts: [],
    formula: '=C7+C8+C9+C10',
    referenceCells: ['C7', 'C8', 'C9', 'C10']
  },
  '13': {
    accounts: [],
    formula: '=C5+C11',
    referenceCells: ['C5', 'C11']
  },
  '16': {
    accounts: [
      { code: '1013', name: 'Capital souscrit appelé versé', amount: 200000 },
    ],
    formula: '=SUM(1013)'
  },
  '17': {
    accounts: [
      { code: '1061', name: 'Réserve légale', amount: 50000 },
      { code: '1068', name: 'Autres réserves', amount: 100000 },
    ],
    formula: '=SUM(1061:1068)'
  },
  '18': {
    accounts: [
      { code: '120', name: 'Résultat de l\'exercice (bénéfice)', amount: 135000 },
    ],
    formula: '=SUM(120:129)'
  },
  '19': {
    accounts: [],
    formula: '=C16+C17+C18',
    referenceCells: ['C16', 'C17', 'C18']
  },
  '21': {
    accounts: [
      { code: '164', name: 'Emprunts auprès établissements crédit', amount: 250000 },
      { code: '168', name: 'Autres emprunts', amount: 35000 },
    ],
    formula: '=SUM(164:168)'
  },
  '22': {
    accounts: [
      { code: '401', name: 'Fournisseurs', amount: 210000 },
      { code: '408', name: 'Fournisseurs - factures non parvenues', amount: 25000 },
    ],
    formula: '=SUM(401:408)'
  },
  '23': {
    accounts: [
      { code: '43', name: 'Sécurité sociale et autres organismes', amount: 75000 },
    ],
    formula: '=SUM(43)'
  },
  '24': {
    accounts: [
      { code: '44', name: 'État - autres dettes', amount: 30000 },
    ],
    formula: '=SUM(44)'
  },
  '25': {
    accounts: [],
    formula: '=C21+C22+C23+C24',
    referenceCells: ['C21', 'C22', 'C23', 'C24']
  },
  '27': {
    accounts: [],
    formula: '=C19+C25',
    referenceCells: ['C19', 'C25']
  },
};

const initialSpreadsheetData = [
  ['', 'A', 'B', 'C', 'D'],
  ['1', 'ACTIF', 'Code', 'N', 'N-1'],
  ['2', 'Immobilisations incorporelles', '20', '125000', '115000'],
  ['3', 'Immobilisations corporelles', '21', '450000', '420000'],
  ['4', 'Immobilisations financières', '26', '85000', '75000'],
  ['5', 'Total Actif Immobilisé', '', '660000', '610000'],
  ['6', '', '', '', ''],
  ['7', 'Stocks et en-cours', '31', '125000', '110000'],
  ['8', 'Créances clients', '411', '185000', '165000'],
  ['9', 'Autres créances', '44', '45000', '38000'],
  ['10', 'Disponibilités', '51', '95000', '82000'],
  ['11', 'Total Actif Circulant', '', '450000', '395000'],
  ['12', '', '', '', ''],
  ['13', 'TOTAL ACTIF', '', '1110000', '1005000'],
  ['14', '', '', '', ''],
  ['15', 'PASSIF', 'Code', 'N', 'N-1'],
  ['16', 'Capital social', '101', '200000', '200000'],
  ['17', 'Réserves', '106', '150000', '120000'],
  ['18', 'Résultat de l\'exercice', '12', '135000', '105000'],
  ['19', 'Total Capitaux Propres', '', '485000', '425000'],
  ['20', '', '', '', ''],
  ['21', 'Emprunts et dettes financières', '16', '285000', '265000'],
  ['22', 'Dettes fournisseurs', '401', '235000', '215000'],
  ['23', 'Dettes fiscales et sociales', '43', '75000', '70000'],
  ['24', 'Autres dettes', '44', '30000', '30000'],
  ['25', 'Total Dettes', '', '625000', '580000'],
  ['26', '', '', '', ''],
  ['27', 'TOTAL PASSIF', '', '1110000', '1005000'],
];

export function ReportEditor() {
  const [selectedReport, setSelectedReport] = useState(sampleReports[0]);
  const [spreadsheetData, setSpreadsheetData] = useState(initialSpreadsheetData);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [editingFormula, setEditingFormula] = useState(false);
  const [formulaEditValue, setFormulaEditValue] = useState('');

  useEffect(() => {
    if (selectedCell) {
      const value = spreadsheetData[selectedCell.row][selectedCell.col];
      setFormulaBarValue(value || '');
      
      // Vérifier si cette ligne a des comptes associés
      const rowNumber = spreadsheetData[selectedCell.row][0];
      if (accountsData[rowNumber]) {
        setAccountDetails({
          rowNumber,
          label: spreadsheetData[selectedCell.row][1],
          value: spreadsheetData[selectedCell.row][selectedCell.col],
          ...accountsData[rowNumber]
        });
      } else {
        setAccountDetails(null);
      }
    }
  }, [selectedCell, spreadsheetData]);

  const handleCellClick = (row: number, col: number) => {
    if (row === 0 || col === 0) return;
    setSelectedCell({ row, col });
    setEditingCell(null);
    setEditingFormula(false);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    if (row === 0 || col === 0) return;
    setEditingCell({ row, col });
    setSelectedCell({ row, col });
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...spreadsheetData];
    newData[row][col] = value;
    setSpreadsheetData(newData);
    setFormulaBarValue(value);
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    if (selectedCell) {
      const newData = [...spreadsheetData];
      newData[selectedCell.row][selectedCell.col] = value;
      setSpreadsheetData(newData);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
      if (row < spreadsheetData.length - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setEditingCell(null);
      if (col < spreadsheetData[0].length - 1) {
        setSelectedCell({ row, col: col + 1 });
      }
    }
  };

  const handleEditFormula = () => {
    if (accountDetails) {
      setFormulaEditValue(accountDetails.formula);
      setEditingFormula(true);
    }
  };

  const handleSaveFormula = () => {
    // Ici on sauvegarderait la formule modifiée
    if (accountDetails) {
      accountDetails.formula = formulaEditValue;
    }
    setEditingFormula(false);
  };

  const getCellStyle = (row: number, col: number) => {
    const isHeader = row === 0 || col === 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isEditing = editingCell?.row === row && editingCell?.col === col;
    
    let className = 'border border-gray-300 px-2 py-1 min-w-[120px] h-[28px] text-sm transition-colors';
    
    if (isHeader) {
      className += ' bg-gray-100 font-medium text-center sticky';
      if (row === 0) className += ' top-0 z-10';
      if (col === 0) className += ' left-0 z-10 min-w-[40px]';
    } else {
      if (isSelected) {
        className += ' ring-2 ring-orange-600 bg-orange-50';
      }
      if (isEditing) {
        className += ' p-0';
      }
      // Style pour les totaux
      if (spreadsheetData[row][1]?.includes('Total') || spreadsheetData[row][1]?.includes('TOTAL')) {
        className += ' font-medium bg-orange-50';
      }
    }
    
    return className;
  };

  const addRow = () => {
    const newRow = Array(spreadsheetData[0].length).fill('');
    newRow[0] = String(spreadsheetData.length);
    setSpreadsheetData([...spreadsheetData, newRow]);
  };

  const addColumn = () => {
    const newData = spreadsheetData.map((row, index) => {
      if (index === 0) {
        const nextLetter = String.fromCharCode(65 + row.length - 1);
        return [...row, nextLetter];
      }
      return [...row, ''];
    });
    setSpreadsheetData(newData);
  };

  const getReferencedValues = (referenceCells: string[]) => {
    return referenceCells.map(cellRef => {
      const col = cellRef.match(/[A-Z]+/)?.[0];
      const row = cellRef.match(/\d+/)?.[0];
      if (col && row) {
        const colIndex = spreadsheetData[0].indexOf(col);
        const rowIndex = parseInt(row);
        return {
          cell: cellRef,
          label: spreadsheetData[rowIndex][1],
          value: spreadsheetData[rowIndex][colIndex]
        };
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-white flex border rounded-lg overflow-hidden">
      {/* Grille principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barre d'outils Excel-like */}
        <div className="border-b bg-white flex-shrink-0">
          {/* Première ligne - Menu principal */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-4">
              <Select value={selectedReport.id} onValueChange={(id) => {
                const report = sampleReports.find(r => r.id === id);
                if (report) setSelectedReport(report);
              }}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sampleReports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Redo2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>

          {/* Deuxième ligne - Barre d'outils formatage */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50">
            <Button variant="ghost" size="sm">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <AlignRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Ligne
            </Button>
            <Button variant="ghost" size="sm" onClick={addColumn}>
              <Plus className="h-4 w-4 mr-2" />
              Colonne
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button 
              variant={showSidebar ? "default" : "ghost"} 
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <PanelRightClose className="h-4 w-4 mr-2" /> : <PanelRightOpen className="h-4 w-4 mr-2" />}
              Détails
            </Button>
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {selectedCell && `${spreadsheetData[0][selectedCell.col]}${selectedCell.row}`}
            </span>
          </div>

          {/* Troisième ligne - Barre de formule */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white">
            <div className="font-mono text-sm font-medium min-w-[60px] bg-gray-100 px-3 py-1 rounded border">
              {selectedCell ? `${spreadsheetData[0][selectedCell.col]}${selectedCell.row}` : ''}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">fx</span>
              <Input
                value={formulaBarValue}
                onChange={(e) => handleFormulaBarChange(e.target.value)}
                className="flex-1 font-mono text-sm border-gray-300"
                placeholder="Entrez une valeur..."
                disabled={!selectedCell}
              />
            </div>
          </div>
        </div>

        {/* Grille Excel */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="inline-block min-w-full">
            <table className="border-collapse bg-white">
              <tbody>
                {spreadsheetData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                      >
                        {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                          <Input
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onKeyDown={(e) => handleCellKeyDown(e, rowIndex, colIndex)}
                            onBlur={() => setEditingCell(null)}
                            autoFocus
                            className="w-full h-full border-0 p-1 text-sm focus:ring-0"
                          />
                        ) : (
                          <div className="truncate">
                            {cell}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Barre de statut */}
        <div className="border-t bg-white px-4 py-2 flex items-center justify-between text-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-green-600 font-medium">● Prêt</span>
            {selectedCell && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>Cellule: {spreadsheetData[0][selectedCell.col]}{selectedCell.row}</span>
              </>
            )}
          </div>
          <span className="text-muted-foreground">
            {spreadsheetData.length - 1} lignes × {spreadsheetData[0].length - 1} colonnes
          </span>
        </div>
      </div>

      {/* Panneau latéral des comptes avec scroll */}
      {showSidebar && (
        <div className="w-96 border-l bg-white flex flex-col flex-shrink-0 h-full">
          <div className="border-b p-4 bg-orange-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Détails des Comptes</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedCell && spreadsheetData[selectedCell.row][1] && (
              <p className="text-sm text-muted-foreground">
                {spreadsheetData[selectedCell.row][1]}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-4">
              {accountDetails ? (
                <div className="space-y-4">
                  {/* Valeur totale */}
                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Valeur Totale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {accountDetails.value ? parseFloat(accountDetails.value).toLocaleString('fr-FR') + ' €' : '0 €'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {accountDetails.label}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Liste des comptes */}
                  {accountDetails.accounts && accountDetails.accounts.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Comptes Composants
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {accountDetails.accounts.map((account: any, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="bg-white text-xs">
                                    {account.code}
                                  </Badge>
                                </div>
                                <span className="text-sm truncate block">{account.name}</span>
                              </div>
                              <span className="font-mono text-sm font-medium ml-2">
                                {account.amount.toLocaleString('fr-FR')} €
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Références aux autres lignes */}
                  {accountDetails.referenceCells && accountDetails.referenceCells.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Lignes Composantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getReferencedValues(accountDetails.referenceCells).map((ref: any, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge variant="outline" className="bg-white flex-shrink-0">
                                  {ref.cell}
                                </Badge>
                                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{ref.label}</span>
                              </div>
                              <span className="font-mono text-sm font-medium ml-2 flex-shrink-0">
                                {ref.value ? parseFloat(ref.value).toLocaleString('fr-FR') : '0'} €
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Formule avec édition */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Formule de Calcul
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleEditFormula}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingFormula ? (
                        <div className="space-y-3">
                          <Textarea
                            value={formulaEditValue}
                            onChange={(e) => setFormulaEditValue(e.target.value)}
                            className="font-mono text-sm"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveFormula}>
                              Enregistrer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingFormula(false)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-mono text-sm bg-gray-50 p-3 rounded border">
                            {accountDetails.formula}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Cliquez sur l'icône pour modifier la formule
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Aide */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">💡 Information</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2">
                      <p>• Cliquez sur une ligne pour voir sa composition</p>
                      <p>• Double-cliquez pour modifier une cellule</p>
                      <p>• Les formules peuvent être éditées</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <List className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="font-medium mb-2">Aucune ligne sélectionnée</h3>
                  <p className="text-sm text-muted-foreground px-4">
                    Cliquez sur une ligne du bilan pour voir les comptes associés et la formule de calcul
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
