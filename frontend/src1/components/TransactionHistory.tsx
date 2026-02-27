import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  Search,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  RefreshCw,
  Calendar
} from 'lucide-react';

const transactionData = [
  {
    id: 'TRX-001',
    date: '15/12/2024',
    time: '14:35',
    type: 'Vente',
    description: 'Vente produits - Client ABC SARL',
    account: '701 - Ventes de produits',
    debit: 0,
    credit: 15750,
    balance: 15750,
    status: 'validated',
    reference: 'FA-2024-0156'
  },
  {
    id: 'TRX-002',
    date: '15/12/2024',
    time: '14:28',
    type: 'Achat',
    description: 'Achat matières premières - Fournisseur XYZ',
    account: '601 - Achats matières premières',
    debit: 8450,
    credit: 0,
    balance: 7300,
    status: 'validated',
    reference: 'FF-2024-0298'
  },
  {
    id: 'TRX-003',
    date: '15/12/2024',
    time: '13:45',
    type: 'Salaire',
    description: 'Salaires et charges sociales',
    account: '641 - Rémunérations du personnel',
    debit: 12500,
    credit: 0,
    balance: -5200,
    status: 'validated',
    reference: 'PAY-2024-12'
  },
  {
    id: 'TRX-004',
    date: '14/12/2024',
    time: '16:20',
    type: 'Banque',
    description: 'Virement bancaire entrant',
    account: '512 - Banque',
    debit: 0,
    credit: 25000,
    balance: 19800,
    status: 'validated',
    reference: 'VIR-2024-0089'
  },
  {
    id: 'TRX-005',
    date: '14/12/2024',
    time: '15:15',
    type: 'Charge',
    description: 'Facture électricité - EDF',
    account: '606 - Achats non stockés',
    debit: 850,
    credit: 0,
    balance: 18950,
    status: 'pending',
    reference: 'EDF-2024-11'
  },
  {
    id: 'TRX-006',
    date: '14/12/2024',
    time: '14:30',
    type: 'Vente',
    description: 'Prestation de service - Client DEF',
    account: '706 - Prestations de services',
    debit: 0,
    credit: 5200,
    balance: 24150,
    status: 'validated',
    reference: 'FS-2024-0087'
  },
  {
    id: 'TRX-007',
    date: '13/12/2024',
    time: '11:45',
    type: 'Investissement',
    description: 'Achat ordinateur portable',
    account: '2183 - Matériel informatique',
    debit: 1850,
    credit: 0,
    balance: 22300,
    status: 'validated',
    reference: 'INV-2024-0023'
  },
  {
    id: 'TRX-008',
    date: '13/12/2024',
    time: '10:20',
    type: 'Taxe',
    description: 'TVA collectée',
    account: '4457 - TVA collectée',
    debit: 0,
    credit: 3150,
    balance: 25450,
    status: 'validated',
    reference: 'TVA-2024-12'
  }
];

const summaryStats = {
  totalTransactions: 247,
  totalDebit: 1250000,
  totalCredit: 1485000,
  balance: 235000,
  pendingTransactions: 5
};

export function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredTransactions = transactionData.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });



  const exportTransactions = () => {
    console.log('Export des transactions');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Historique des Transactions</h2>
          <p className="text-muted-foreground">
            Consultez et analysez toutes vos écritures comptables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="font-bold">{summaryStats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Débits</p>
                <p className="font-bold text-red-600">
                  {summaryStats.totalDebit.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Crédits</p>
                <p className="font-bold text-green-600">
                  {summaryStats.totalCredit.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Solde</p>
                <p className="font-bold text-blue-600">
                  {summaryStats.balance.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="font-bold text-orange-600">{summaryStats.pendingTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal des Écritures</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction(s) trouvée(s)
              </CardDescription>
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="Vente">Vente</SelectItem>
                  <SelectItem value="Achat">Achat</SelectItem>
                  <SelectItem value="Banque">Banque</SelectItem>
                  <SelectItem value="Salaire">Salaire</SelectItem>
                  <SelectItem value="Charge">Charge</SelectItem>
                  <SelectItem value="Taxe">Taxe</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="validated">Validé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Compte</TableHead>
                  <TableHead className="text-right">Débit</TableHead>
                  <TableHead className="text-right">Crédit</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.date}</p>
                        <p className="text-sm text-muted-foreground">{transaction.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.reference}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{transaction.account}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.debit > 0 ? (
                        <span className="font-medium text-red-600">
                          {transaction.debit.toLocaleString('fr-FR')} €
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.credit > 0 ? (
                        <span className="font-medium text-green-600">
                          {transaction.credit.toLocaleString('fr-FR')} €
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${
                        transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.balance.toLocaleString('fr-FR')} €
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.status === 'validated' ? 'default' : 'secondary'}
                        className={transaction.status === 'validated' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {transaction.status === 'validated' ? 'Validé' : 'En attente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}