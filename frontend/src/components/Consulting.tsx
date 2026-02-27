// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Progress } from "./ui/progress";
// import { Avatar, AvatarFallback } from "./ui/avatar";
// import { Users, Clock, DollarSign, FileText, Plus, Calendar, Phone, Mail } from 'lucide-react';

// const clients = [
//   { id: 'CL-001', name: 'TechCorp Industries', contact: 'Sarah Johnson', phone: '+1 (555) 123-4567', email: 'sarah@techcorp.com', status: 'Active', projects: 3, revenue: 125000 },
//   { id: 'CL-002', name: 'Retail Chain LLC', contact: 'Mike Wilson', phone: '+1 (555) 987-6543', email: 'mike@retailchain.com', status: 'Active', projects: 2, revenue: 89000 },
//   { id: 'CL-003', name: 'Startup Ventures', contact: 'Emily Chen', phone: '+1 (555) 456-7890', email: 'emily@startupv.com', status: 'Prospect', projects: 1, revenue: 45000 },
//   { id: 'CL-004', name: 'Manufacturing Co', contact: 'David Rodriguez', phone: '+1 (555) 234-5678', email: 'david@manufco.com', status: 'Active', projects: 4, revenue: 198000 },
// ];

// const projects = [
//   { id: 'PRJ-001', name: 'Financial System Implementation', client: 'TechCorp Industries', startDate: '2024-01-01', endDate: '2024-06-30', status: 'In Progress', progress: 65, budget: 85000, spent: 55000 },
//   { id: 'PRJ-002', name: 'Tax Optimization Strategy', client: 'Retail Chain LLC', startDate: '2024-01-15', endDate: '2024-03-15', status: 'In Progress', progress: 80, budget: 35000, spent: 28000 },
//   { id: 'PRJ-003', name: 'Compliance Audit', client: 'Manufacturing Co', startDate: '2023-12-01', endDate: '2024-02-28', status: 'Near Completion', progress: 95, budget: 45000, spent: 42000 },
//   { id: 'PRJ-004', name: 'Business Restructuring', client: 'Startup Ventures', startDate: '2024-01-20', endDate: '2024-05-20', status: 'Planning', progress: 25, budget: 60000, spent: 15000 },
// ];

// const timeEntries = [
//   { id: 'TE-001', date: '2024-01-15', project: 'Financial System Implementation', consultant: 'John Smith', hours: 8, rate: 150, description: 'System analysis and requirements gathering' },
//   { id: 'TE-002', date: '2024-01-15', project: 'Tax Optimization Strategy', consultant: 'Sarah Wilson', hours: 6, rate: 175, description: 'Tax code research and strategy development' },
//   { id: 'TE-003', date: '2024-01-14', project: 'Compliance Audit', consultant: 'Mike Johnson', hours: 7, rate: 160, description: 'Document review and compliance testing' },
//   { id: 'TE-004', date: '2024-01-14', project: 'Financial System Implementation', consultant: 'Emma Davis', hours: 5, rate: 140, description: 'Database design and modeling' },
// ];

// const invoices = [
//   { id: 'INV-2024-001', client: 'TechCorp Industries', amount: 15000, issueDate: '2024-01-15', dueDate: '2024-02-14', status: 'Paid' },
//   { id: 'INV-2024-002', client: 'Retail Chain LLC', amount: 8500, issueDate: '2024-01-10', dueDate: '2024-02-09', status: 'Outstanding' },
//   { id: 'INV-2024-003', client: 'Manufacturing Co', amount: 12000, issueDate: '2024-01-05', dueDate: '2024-02-04', status: 'Overdue' },
//   { id: 'INV-2024-004', client: 'Startup Ventures', amount: 5500, issueDate: '2024-01-12', dueDate: '2024-02-11', status: 'Draft' },
// ];

// export function Consulting() {
//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2>Consulting Services</h2>
//           <p className="text-muted-foreground">Manage clients, projects, and consulting engagements</p>
//         </div>
//         <div className="flex gap-2">
//           <Button>
//             <Plus className="h-4 w-4 mr-2" />
//             New Project
//           </Button>
//           <Button variant="outline">
//             <Users className="h-4 w-4 mr-2" />
//             Add Client
//           </Button>
//         </div>
//       </div>

//       {/* Overview Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle>Active Clients</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">15</div>
//             <p className="text-xs text-muted-foreground">3 new this month</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle>Active Projects</CardTitle>
//             <FileText className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">8</div>
//             <p className="text-xs text-muted-foreground">2 completing this month</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle>Billable Hours</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">186</div>
//             <p className="text-xs text-muted-foreground">This month</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle>Revenue YTD</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">$457K</div>
//             <p className="text-xs text-muted-foreground">+18% from last year</p>
//           </CardContent>
//         </Card>
//       </div>

//       <Tabs defaultValue="clients" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="clients">Clients</TabsTrigger>
//           <TabsTrigger value="projects">Projects</TabsTrigger>
//           <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
//           <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
//         </TabsList>

//         <TabsContent value="clients" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Client Management</CardTitle>
//               <CardDescription>Manage your consulting client relationships</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Client ID</TableHead>
//                     <TableHead>Company Name</TableHead>
//                     <TableHead>Primary Contact</TableHead>
//                     <TableHead>Contact Info</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Active Projects</TableHead>
//                     <TableHead className="text-right">Total Revenue</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {clients.map((client) => (
//                     <TableRow key={client.id}>
//                       <TableCell>{client.id}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Avatar className="h-8 w-8">
//                             <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
//                           </Avatar>
//                           {client.name}
//                         </div>
//                       </TableCell>
//                       <TableCell>{client.contact}</TableCell>
//                       <TableCell>
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-1 text-sm">
//                             <Phone className="h-3 w-3" />
//                             {client.phone}
//                           </div>
//                           <div className="flex items-center gap-1 text-sm">
//                             <Mail className="h-3 w-3" />
//                             {client.email}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={client.status === 'Active' ? 'default' : 'outline'}>
//                           {client.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>{client.projects}</TableCell>
//                       <TableCell className="text-right">${client.revenue.toLocaleString()}</TableCell>
//                       <TableCell className="text-right">
//                         <Button variant="outline" size="sm">Manage</Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="projects" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Project Portfolio</CardTitle>
//               <CardDescription>Track progress and budgets for all consulting projects</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Project ID</TableHead>
//                     <TableHead>Project Name</TableHead>
//                     <TableHead>Client</TableHead>
//                     <TableHead>Timeline</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Progress</TableHead>
//                     <TableHead className="text-right">Budget</TableHead>
//                     <TableHead className="text-right">Spent</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {projects.map((project) => (
//                     <TableRow key={project.id}>
//                       <TableCell>{project.id}</TableCell>
//                       <TableCell>{project.name}</TableCell>
//                       <TableCell>{project.client}</TableCell>
//                       <TableCell>
//                         <div className="text-sm">
//                           <div>{project.startDate} - {project.endDate}</div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={
//                           project.status === 'In Progress' ? 'default' :
//                           project.status === 'Near Completion' ? 'secondary' :
//                           project.status === 'Planning' ? 'outline' : 'default'
//                         }>
//                           {project.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Progress value={project.progress} className="w-16 h-2" />
//                           <span className="text-sm">{project.progress}%</span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-right">${project.budget.toLocaleString()}</TableCell>
//                       <TableCell className="text-right">${project.spent.toLocaleString()}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="time-tracking" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Time Tracking</CardTitle>
//               <CardDescription>Log and manage billable hours</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex justify-between items-center mb-4">
//                 <div className="flex gap-2">
//                   <Button>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Log Time
//                   </Button>
//                   <Button variant="outline">
//                     <Calendar className="h-4 w-4 mr-2" />
//                     Timesheet
//                   </Button>
//                 </div>
//               </div>

//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Entry ID</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Project</TableHead>
//                     <TableHead>Consultant</TableHead>
//                     <TableHead className="text-right">Hours</TableHead>
//                     <TableHead className="text-right">Rate</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead>Description</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {timeEntries.map((entry) => (
//                     <TableRow key={entry.id}>
//                       <TableCell>{entry.id}</TableCell>
//                       <TableCell>{entry.date}</TableCell>
//                       <TableCell>{entry.project}</TableCell>
//                       <TableCell>{entry.consultant}</TableCell>
//                       <TableCell className="text-right">{entry.hours}</TableCell>
//                       <TableCell className="text-right">${entry.rate}</TableCell>
//                       <TableCell className="text-right">${(entry.hours * entry.rate).toLocaleString()}</TableCell>
//                       <TableCell>{entry.description}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="invoicing" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Invoice Management</CardTitle>
//               <CardDescription>Generate and track client invoices</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex justify-between items-center mb-4">
//                 <div className="flex gap-2">
//                   <Button>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Invoice
//                   </Button>
//                   <Button variant="outline">Generate Reports</Button>
//                 </div>
//               </div>

//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Invoice ID</TableHead>
//                     <TableHead>Client</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead>Issue Date</TableHead>
//                     <TableHead>Due Date</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {invoices.map((invoice) => (
//                     <TableRow key={invoice.id}>
//                       <TableCell>{invoice.id}</TableCell>
//                       <TableCell>{invoice.client}</TableCell>
//                       <TableCell className="text-right">${invoice.amount.toLocaleString()}</TableCell>
//                       <TableCell>{invoice.issueDate}</TableCell>
//                       <TableCell>{invoice.dueDate}</TableCell>
//                       <TableCell>
//                         <Badge variant={
//                           invoice.status === 'Paid' ? 'secondary' :
//                           invoice.status === 'Outstanding' ? 'default' :
//                           invoice.status === 'Overdue' ? 'destructive' : 'outline'
//                         }>
//                           {invoice.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-1">
//                           <Button variant="outline" size="sm">View</Button>
//                           <Button variant="outline" size="sm">Send</Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
