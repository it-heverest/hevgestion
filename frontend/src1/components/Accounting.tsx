import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Search, Filter, Download, Edit, Trash2 } from 'lucide-react';

const chartOfAccounts = [
  { id: '1001', name: 'Cash', type: 'Asset', balance: 125000, status: 'Active' },
  { id: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 45000, status: 'Active' },
  { id: '1500', name: 'Equipment', type: 'Asset', balance: 85000, status: 'Active' },
  { id: '2001', name: 'Accounts Payable', type: 'Liability', balance: 32000, status: 'Active' },
  { id: '3000', name: 'Owner\'s Equity', type: 'Equity', balance: 180000, status: 'Active' },
  { id: '4000', name: 'Service Revenue', type: 'Revenue', balance: 328000, status: 'Active' },
  { id: '5001', name: 'Office Expenses', type: 'Expense', balance: 45000, status: 'Active' },
  { id: '5200', name: 'Marketing Expenses', type: 'Expense', balance: 28000, status: 'Active' },
];

const transactions = [
  { id: 'TXN-001', date: '2024-01-15', description: 'Client Payment - TechCorp', debit: '', credit: '15000', account: 'Cash', reference: 'INV-2024-001' },
  { id: 'TXN-002', date: '2024-01-15', description: 'Client Payment - TechCorp', debit: '15000', credit: '', account: 'Accounts Receivable', reference: 'INV-2024-001' },
  { id: 'TXN-003', date: '2024-01-14', description: 'Office Rent Payment', debit: '3500', credit: '', account: 'Office Expenses', reference: 'RENT-JAN' },
  { id: 'TXN-004', date: '2024-01-14', description: 'Office Rent Payment', debit: '', credit: '3500', account: 'Cash', reference: 'RENT-JAN' },
  { id: 'TXN-005', date: '2024-01-13', description: 'Equipment Purchase', debit: '12000', credit: '', account: 'Equipment', reference: 'EQ-2024-001' },
  { id: 'TXN-006', date: '2024-01-13', description: 'Equipment Purchase', debit: '', credit: '12000', account: 'Cash', reference: 'EQ-2024-001' },
];

const trialBalance = [
  { account: 'Cash', debit: 125000, credit: 0 },
  { account: 'Accounts Receivable', debit: 45000, credit: 0 },
  { account: 'Equipment', debit: 85000, credit: 0 },
  { account: 'Accounts Payable', debit: 0, credit: 32000 },
  { account: 'Owner\'s Equity', debit: 0, credit: 180000 },
  { account: 'Service Revenue', debit: 0, credit: 328000 },
  { account: 'Office Expenses', debit: 45000, credit: 0 },
  { account: 'Marketing Expenses', debit: 28000, credit: 0 },
];

export function Accounting() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Accounting</h2>
          <p className="text-muted-foreground">Manage your financial records and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="statements">Financial Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage your account structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search accounts..." className="pl-9" />
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="asset">Assets</SelectItem>
                      <SelectItem value="liability">Liabilities</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartOfAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.id}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${account.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger Transactions</CardTitle>
              <CardDescription>View and manage all financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search transactions..." className="pl-9" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell className="text-right">
                        {transaction.debit && `$${Number(transaction.debit).toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.credit && `$${Number(transaction.credit).toLocaleString()}`}
                      </TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance</CardTitle>
              <CardDescription>Ensure your books balance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className="text-right">
                        {item.debit > 0 && `$${item.debit.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.credit > 0 && `$${item.credit.toLocaleString()}`}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">$328,000</TableCell>
                    <TableCell className="text-right">$328,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Financial position statement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">Generate Report</Button>
                  <p className="text-sm text-muted-foreground">As of January 31, 2024</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Profit & loss statement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">Generate Report</Button>
                  <p className="text-sm text-muted-foreground">January 2024</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
                <CardDescription>Cash movement analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">Generate Report</Button>
                  <p className="text-sm text-muted-foreground">January 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}