import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Calendar, FileText, Clock, AlertTriangle, CheckCircle, Upload, Download, Plus } from 'lucide-react';

const taxReturns = [
  { id: 'TX-2024-001', client: 'ABC Corporation', type: 'Corporate Income Tax', year: '2023', status: 'In Progress', dueDate: '2024-03-15', progress: 75 },
  { id: 'TX-2024-002', client: 'John Smith', type: 'Individual Income Tax', year: '2023', status: 'Ready for Review', dueDate: '2024-04-15', progress: 95 },
  { id: 'TX-2024-003', client: 'Tech Startup LLC', type: 'Partnership Return', year: '2023', status: 'Draft', dueDate: '2024-03-15', progress: 45 },
  { id: 'TX-2024-004', client: 'Retail Store Inc', type: 'Sales Tax Return', year: '2024 Q1', status: 'Filed', dueDate: '2024-01-31', progress: 100 },
  { id: 'TX-2024-005', client: 'Consulting Group', type: 'Quarterly Estimates', year: '2024 Q1', status: 'Overdue', dueDate: '2024-01-15', progress: 0 },
];

const auditCases = [
  { id: 'AUD-2024-001', client: 'Manufacturing Co.', type: 'IRS Audit', year: '2022', status: 'Active', riskLevel: 'Medium', assignedTo: 'Sarah Wilson' },
  { id: 'AUD-2023-005', client: 'Service Provider LLC', type: 'State Audit', year: '2021', status: 'Closed', riskLevel: 'Low', assignedTo: 'Mike Johnson' },
  { id: 'AUD-2024-002', client: 'Real Estate Fund', type: 'IRS Audit', year: '2023', status: 'Notice Received', riskLevel: 'High', assignedTo: 'Sarah Wilson' },
];

const complianceItems = [
  { task: 'Annual Corporate Filings', dueDate: '2024-03-31', status: 'Pending', priority: 'High' },
  { task: 'Quarterly Payroll Reports', dueDate: '2024-01-31', status: 'Completed', priority: 'Medium' },
  { task: 'Sales Tax Registration Renewal', dueDate: '2024-06-15', status: 'Scheduled', priority: 'Medium' },
  { task: 'Worker Compensation Insurance', dueDate: '2024-02-28', status: 'Pending', priority: 'High' },
  { task: 'Business License Renewal', dueDate: '2024-12-31', status: 'Scheduled', priority: 'Low' },
];

const taxDeadlines = [
  { description: 'Corporate Income Tax Returns (C-Corp)', date: '2024-03-15', daysLeft: 45 },
  { description: 'Individual Income Tax Returns', date: '2024-04-15', daysLeft: 76 },
  { description: 'Partnership Tax Returns', date: '2024-03-15', daysLeft: 45 },
  { description: 'Q1 Quarterly Estimates', date: '2024-04-15', daysLeft: 76 },
  { description: 'Q4 Sales Tax Returns', date: '2024-01-31', daysLeft: 2 },
];

export function TaxManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Tax Management</h2>
          <p className="text-muted-foreground">Handle tax preparation, filing, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Tax Return
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Documents
          </Button>
        </div>
      </div>

      {/* Urgent Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>5 tax returns</strong> are due within the next 30 days. Review pending items.
          </AlertDescription>
        </Alert>
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>2 audit responses</strong> are pending. Action required within 15 days.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="returns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="returns">Tax Returns</TabsTrigger>
          <TabsTrigger value="audit">Audit Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="e-filing">E-Filing</TabsTrigger>
        </TabsList>

        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Returns Overview</CardTitle>
              <CardDescription>Track the status of all tax return preparations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxReturns.map((taxReturn) => (
                    <TableRow key={taxReturn.id}>
                      <TableCell>{taxReturn.id}</TableCell>
                      <TableCell>{taxReturn.client}</TableCell>
                      <TableCell>{taxReturn.type}</TableCell>
                      <TableCell>{taxReturn.year}</TableCell>
                      <TableCell>{taxReturn.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={
                          taxReturn.status === 'Filed' ? 'default' :
                          taxReturn.status === 'Overdue' ? 'destructive' :
                          taxReturn.status === 'Ready for Review' ? 'secondary' : 'outline'
                        }>
                          {taxReturn.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={taxReturn.progress} className="w-16 h-2" />
                          <span className="text-sm">{taxReturn.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
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

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Cases</CardTitle>
              <CardDescription>Manage tax audits and correspondence</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Audit Type</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditCases.map((auditCase) => (
                    <TableRow key={auditCase.id}>
                      <TableCell>{auditCase.id}</TableCell>
                      <TableCell>{auditCase.client}</TableCell>
                      <TableCell>{auditCase.type}</TableCell>
                      <TableCell>{auditCase.year}</TableCell>
                      <TableCell>
                        <Badge variant={
                          auditCase.status === 'Closed' ? 'secondary' :
                          auditCase.status === 'Active' ? 'default' : 'destructive'
                        }>
                          {auditCase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          auditCase.riskLevel === 'Low' ? 'secondary' :
                          auditCase.riskLevel === 'Medium' ? 'default' : 'destructive'
                        }>
                          {auditCase.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{auditCase.assignedTo}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <CardDescription>Track regulatory compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`h-5 w-5 ${
                        item.status === 'Completed' ? 'text-green-500' : 'text-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{item.task}</p>
                        <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        item.priority === 'High' ? 'destructive' :
                        item.priority === 'Medium' ? 'default' : 'secondary'
                      }>
                        {item.priority}
                      </Badge>
                      <Badge variant={
                        item.status === 'Completed' ? 'secondary' :
                        item.status === 'Pending' ? 'destructive' : 'outline'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calendar</CardTitle>
              <CardDescription>Important tax deadlines and dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{deadline.description}</p>
                        <p className="text-sm text-muted-foreground">{deadline.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        deadline.daysLeft <= 7 ? 'destructive' :
                        deadline.daysLeft <= 30 ? 'default' : 'secondary'
                      }>
                        {deadline.daysLeft} days left
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="e-filing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>E-Filing Status</CardTitle>
                <CardDescription>Electronic filing dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Returns Filed This Year</span>
                  <span className="font-bold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Acceptance Rate</span>
                  <span className="font-bold text-green-600">98.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending Submissions</span>
                  <span className="font-bold text-orange-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rejected Returns</span>
                  <span className="font-bold text-red-600">2</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common e-filing tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Returns for E-Filing
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Acknowledgments
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Transmission Reports
                </Button>
                <Button className="w-full" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check Filing Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}