import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Upload, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  Database,
  Mail,
  FileText,
  Bot,
  Workflow,
  ScanLine
} from 'lucide-react';

const dataConnections = [
  { id: '1', name: 'Chase Business Banking', type: 'Bank', status: 'Connected', lastSync: '2024-01-15 09:30', records: 1250, enabled: true },
  { id: '2', name: 'QuickBooks Online', type: 'Accounting', status: 'Connected', lastSync: '2024-01-15 08:45', records: 3400, enabled: true },
  { id: '3', name: 'PayPal Business', type: 'Payment', status: 'Error', lastSync: '2024-01-14 16:20', records: 0, enabled: false },
  { id: '4', name: 'Stripe Payments', type: 'Payment', status: 'Connected', lastSync: '2024-01-15 10:15', records: 892, enabled: true },
  { id: '5', name: 'Excel Imports', type: 'File', status: 'Ready', lastSync: 'Manual', records: 0, enabled: true },
];

const automatedReports = [
  { id: 'AR-001', name: 'Monthly P&L Statement', schedule: 'Monthly - 1st', recipients: 5, status: 'Active', nextRun: '2024-02-01 09:00', lastGenerated: '2024-01-01' },
  { id: 'AR-002', name: 'Weekly Cash Flow Report', schedule: 'Weekly - Monday', recipients: 3, status: 'Active', nextRun: '2024-01-22 08:00', lastGenerated: '2024-01-15' },
  { id: 'AR-003', name: 'Quarterly Tax Summary', schedule: 'Quarterly', recipients: 8, status: 'Active', nextRun: '2024-04-01 10:00', lastGenerated: '2024-01-01' },
  { id: 'AR-004', name: 'Client Revenue Analysis', schedule: 'Bi-weekly', recipients: 4, status: 'Paused', nextRun: 'Paused', lastGenerated: '2024-01-08' },
  { id: 'AR-005', name: 'Budget Variance Report', schedule: 'Monthly - 15th', recipients: 6, status: 'Active', nextRun: '2024-01-15 14:00', lastGenerated: '2023-12-15' },
];

const workflowRules = [
  { id: 'WF-001', name: 'Expense Auto-Categorization', trigger: 'New Transaction', action: 'AI Categorize', status: 'Active', processed: 1250 },
  { id: 'WF-002', name: 'Large Payment Approval', trigger: 'Payment > $10K', action: 'Send for Approval', status: 'Active', processed: 23 },
  { id: 'WF-003', name: 'Monthly Report Distribution', trigger: 'Report Generated', action: 'Email to Stakeholders', status: 'Active', processed: 12 },
  { id: 'WF-004', name: 'Tax Document Filing', trigger: 'Tax Season', action: 'Auto-prepare Forms', status: 'Active', processed: 45 },
  { id: 'WF-005', name: 'Reconciliation Alerts', trigger: 'Bank Mismatch', action: 'Alert Accountant', status: 'Active', processed: 8 },
];

const importJobs = [
  { id: 'JOB-001', source: 'Chase Banking', type: 'Bank Transactions', status: 'Running', progress: 75, started: '2024-01-15 09:30', estimated: '09:35' },
  { id: 'JOB-002', source: 'QuickBooks', type: 'Chart of Accounts', status: 'Completed', progress: 100, started: '2024-01-15 08:45', estimated: '08:48' },
  { id: 'JOB-003', source: 'Stripe', type: 'Payment Records', status: 'Queued', progress: 0, started: 'Pending', estimated: '5 min' },
  { id: 'JOB-004', source: 'Excel File', type: 'Expense Data', status: 'Failed', progress: 0, started: '2024-01-15 07:20', estimated: 'Error' },
];

export function Automation() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Automation Center</h2>
          <p className="text-muted-foreground">Automate data entry, report generation, and workflow processes</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="inline h-3 w-3 text-green-500" />
              All systems operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Records Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,847</div>
            <p className="text-xs text-muted-foreground">Today: +2,340 entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342h</div>
            <p className="text-xs text-muted-foreground">Est. this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="data-import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="data-import">Data Import</TabsTrigger>
          <TabsTrigger value="scheduled-reports">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="ai-processing">AI Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="data-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Connections</CardTitle>
              <CardDescription>Manage automated data imports from external sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Connection
                  </Button>
                  <Button variant="outline">
                    <ScanLine className="h-4 w-4 mr-2" />
                    Sync All
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="text-right">Records</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataConnections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          {connection.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{connection.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          connection.status === 'Connected' ? 'default' :
                          connection.status === 'Error' ? 'destructive' : 'secondary'
                        }>
                          {connection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{connection.lastSync}</TableCell>
                      <TableCell className="text-right">{connection.records.toLocaleString()}</TableCell>
                      <TableCell>
                        <Switch checked={connection.enabled} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Current Import Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Import Job Queue</CardTitle>
              <CardDescription>Monitor current and scheduled data import jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{job.source}</p>
                        <Badge variant="outline">{job.type}</Badge>
                        <Badge variant={
                          job.status === 'Running' ? 'default' :
                          job.status === 'Completed' ? 'secondary' :
                          job.status === 'Failed' ? 'destructive' : 'outline'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Started: {job.started}</span>
                        <span>ETA: {job.estimated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={job.progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12">{job.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Report Generation</CardTitle>
              <CardDescription>Schedule and manage automatic report generation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>{report.schedule}</TableCell>
                      <TableCell>{report.recipients} users</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'Active' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.nextRun}</TableCell>
                      <TableCell>{report.lastGenerated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm">
                            {report.status === 'Active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Report Distribution Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Settings</CardTitle>
              <CardDescription>Configure how reports are automatically distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Default Distribution Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="portal">Client Portal</SelectItem>
                        <SelectItem value="both">Email + Portal</SelectItem>
                        <SelectItem value="ftp">FTP Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Email Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Report</SelectItem>
                        <SelectItem value="executive">Executive Summary</SelectItem>
                        <SelectItem value="detailed">Detailed Analysis</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Send Report Summaries</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Include Charts & Graphs</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Password Protect PDFs</Label>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Send Delivery Confirmations</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Automation Rules</CardTitle>
              <CardDescription>Define automated actions based on triggers and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                  <Button variant="outline">
                    <Workflow className="h-4 w-4 mr-2" />
                    Rule Builder
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule ID</TableHead>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Processed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.id}</TableCell>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.trigger}</Badge>
                      </TableCell>
                      <TableCell>{rule.action}</TableCell>
                      <TableCell>
                        <Badge variant={rule.status === 'Active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{rule.processed.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Pause className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Workflow Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Common Workflow Templates</CardTitle>
              <CardDescription>Quick-start templates for common automation scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Expense Approval Flow</CardTitle>
                    <CardDescription className="text-sm">Auto-route expenses above threshold for approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">Use Template</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Invoice Processing</CardTitle>
                    <CardDescription className="text-sm">Automatically process and categorize invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">Use Template</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tax Document Prep</CardTitle>
                    <CardDescription className="text-sm">Prepare tax documents when deadlines approach</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">Use Template</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Processing</CardTitle>
              <CardDescription>Leverage artificial intelligence for smart data processing and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bot className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Transaction Categorization</p>
                        <p className="text-sm text-muted-foreground">AI accuracy: 94.2%</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bot className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Duplicate Detection</p>
                        <p className="text-sm text-muted-foreground">Found 23 duplicates this month</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bot className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Fraud Detection</p>
                        <p className="text-sm text-muted-foreground">ML-powered anomaly detection</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      AI processing has categorized <strong>1,247 transactions</strong> automatically this month, saving approximately <strong>8.5 hours</strong> of manual work.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Processing Accuracy</span>
                      <span className="font-bold">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>Manual Review Required</span>
                      <span className="font-bold">5.8%</span>
                    </div>
                    <Progress value={5.8} className="h-2" />
                  </div>

                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure AI Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Automated analysis and recommendations from your financial data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cash Flow Alert:</strong> AI detected unusual spending pattern in Marketing category. 40% increase compared to previous months.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Optimization Opportunity:</strong> Consider consolidating vendor payments to reduce transaction fees. Potential savings: $340/month.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tax Optimization:</strong> AI identified $12,500 in potential deductions that may have been missed in preliminary tax prep.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}