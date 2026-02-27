// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Calendar } from "./ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
// import { Alert, AlertDescription } from "./ui/alert";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area } from 'recharts';
// import { FileText, Download, Calendar as CalendarIcon, Filter, TrendingUp, DollarSign, Users, Clock, Zap, Mail, Send, CalendarClock } from 'lucide-react';
// import { format } from 'date-fns';
// import { useState } from 'react';

// const monthlyRevenueData = [
//   { month: 'Jan', revenue: 45000, profit: 12000, expenses: 33000 },
//   { month: 'Feb', revenue: 52000, profit: 15000, expenses: 37000 },
//   { month: 'Mar', revenue: 48000, profit: 11000, expenses: 37000 },
//   { month: 'Apr', revenue: 61000, profit: 18000, expenses: 43000 },
//   { month: 'May', revenue: 55000, profit: 14000, expenses: 41000 },
//   { month: 'Jun', revenue: 67000, profit: 22000, expenses: 45000 },
//   { month: 'Jul', revenue: 58000, profit: 16000, expenses: 42000 },
//   { month: 'Aug', revenue: 72000, profit: 25000, expenses: 47000 },
//   { month: 'Sep', revenue: 65000, profit: 19000, expenses: 46000 },
//   { month: 'Oct', revenue: 78000, profit: 28000, expenses: 50000 },
//   { month: 'Nov', revenue: 71000, profit: 21000, expenses: 50000 },
//   { month: 'Dec', revenue: 85000, profit: 32000, expenses: 53000 },
// ];

// const clientRevenueData = [
//   { name: 'TechCorp Industries', value: 125000, percentage: 28, color: '#0088FE' },
//   { name: 'Manufacturing Co', value: 98000, percentage: 22, color: '#00C49F' },
//   { name: 'Retail Chain LLC', value: 89000, percentage: 20, color: '#FFBB28' },
//   { name: 'Consulting Group', value: 67000, percentage: 15, color: '#FF8042' },
//   { name: 'Others', value: 68000, percentage: 15, color: '#8884D8' },
// ];

// const serviceRevenueData = [
//   { service: 'Tax Preparation', q1: 45000, q2: 62000, q3: 38000, q4: 89000 },
//   { service: 'Accounting', q1: 32000, q2: 35000, q3: 41000, q4: 45000 },
//   { service: 'Consulting', q1: 28000, q2: 42000, q3: 51000, q4: 48000 },
//   { service: 'Audit', q1: 18000, q2: 25000, q3: 22000, q4: 31000 },
//   { service: 'Payroll', q1: 12000, q2: 15000, q3: 18000, q4: 20000 },
// ];

// const reportTemplates = [
//   { name: 'Financial Performance Dashboard', description: 'Comprehensive overview of financial metrics', category: 'Financial', lastGenerated: '2024-01-15' },
//   { name: 'Client Profitability Analysis', description: 'Revenue and profit analysis by client', category: 'Client Analysis', lastGenerated: '2024-01-12' },
//   { name: 'Tax Season Summary', description: 'Tax preparation activities and revenue', category: 'Tax', lastGenerated: '2024-01-10' },
//   { name: 'Service Performance Report', description: 'Performance metrics by service line', category: 'Operations', lastGenerated: '2024-01-08' },
//   { name: 'Cash Flow Statement', description: 'Monthly cash flow analysis', category: 'Financial', lastGenerated: '2024-01-14' },
//   { name: 'Consultant Productivity Report', description: 'Billable hours and efficiency metrics', category: 'HR', lastGenerated: '2024-01-11' },
// ];

// export function Reports() {
//   const [dateFrom, setDateFrom] = useState<Date>();
//   const [dateTo, setDateTo] = useState<Date>();

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2>Reports & Analytics</h2>
//           <p className="text-muted-foreground">Generate insights and reports from your financial data</p>
//         </div>
//         <div className="flex gap-2">
//           <Button>
//             <FileText className="h-4 w-4 mr-2" />
//             Custom Report
//           </Button>
//           <Button variant="outline">
//             <Download className="h-4 w-4 mr-2" />
//             Export Data
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="dashboard" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
//           <TabsTrigger value="financial">Financial Reports</TabsTrigger>
//           <TabsTrigger value="client">Client Analysis</TabsTrigger>
//           <TabsTrigger value="automated">Automated Reports</TabsTrigger>
//           <TabsTrigger value="templates">Report Templates</TabsTrigger>
//         </TabsList>

//         <TabsContent value="dashboard" className="space-y-6">
//           {/* Key Performance Indicators */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle>Annual Revenue</CardTitle>
//                 <DollarSign className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">$717,000</div>
//                 <p className="text-xs text-muted-foreground">
//                   <TrendingUp className="inline h-3 w-3 text-green-500" />
//                   +22% from last year
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle>Net Profit Margin</CardTitle>
//                 <TrendingUp className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">26.8%</div>
//                 <p className="text-xs text-muted-foreground">
//                   +3.2% improvement
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle>Client Retention</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">94.2%</div>
//                 <p className="text-xs text-muted-foreground">
//                   Above industry average
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle>Billable Hours</CardTitle>
//                 <Clock className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">2,340</div>
//                 <p className="text-xs text-muted-foreground">
//                   This year to date
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Monthly Revenue & Profit</CardTitle>
//                 <CardDescription>12-month performance overview</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <AreaChart data={monthlyRevenueData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
//                     <Area type="monotone" dataKey="revenue" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
//                     <Area type="monotone" dataKey="profit" stackId="2" stroke="#00C49F" fill="#00C49F" fillOpacity={0.8} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Revenue by Client</CardTitle>
//                 <CardDescription>Top contributing clients</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={clientRevenueData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percentage }) => `${name} (${percentage}%)`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {clientRevenueData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Service Line Performance</CardTitle>
//               <CardDescription>Quarterly revenue by service type</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={serviceRevenueData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="service" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
//                   <Legend />
//                   <Bar dataKey="q1" fill="#0088FE" name="Q1" />
//                   <Bar dataKey="q2" fill="#00C49F" name="Q2" />
//                   <Bar dataKey="q3" fill="#FFBB28" name="Q3" />
//                   <Bar dataKey="q4" fill="#FF8042" name="Q4" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="financial" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Financial Report Generator</CardTitle>
//               <CardDescription>Generate comprehensive financial reports</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label>Report Type</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select report type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="profit-loss">Profit & Loss Statement</SelectItem>
//                       <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
//                       <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
//                       <SelectItem value="trial-balance">Trial Balance</SelectItem>
//                       <SelectItem value="budget-variance">Budget Variance</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Period</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select period" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="current-month">Current Month</SelectItem>
//                       <SelectItem value="last-month">Last Month</SelectItem>
//                       <SelectItem value="current-quarter">Current Quarter</SelectItem>
//                       <SelectItem value="last-quarter">Last Quarter</SelectItem>
//                       <SelectItem value="current-year">Current Year</SelectItem>
//                       <SelectItem value="last-year">Last Year</SelectItem>
//                       <SelectItem value="custom">Custom Range</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Format</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Export format" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pdf">PDF</SelectItem>
//                       <SelectItem value="excel">Excel</SelectItem>
//                       <SelectItem value="csv">CSV</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button>
//                   <FileText className="h-4 w-4 mr-2" />
//                   Generate Report
//                 </Button>
//                 <Button variant="outline">
//                   <CalendarIcon className="h-4 w-4 mr-2" />
//                   Schedule Report
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Quick Financial Metrics */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Current Financial Position</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span>Total Assets</span>
//                     <span className="font-bold">$485,000</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Total Liabilities</span>
//                     <span className="font-bold">$125,000</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Owner's Equity</span>
//                     <span className="font-bold">$360,000</span>
//                   </div>
//                   <div className="border-t pt-2">
//                     <div className="flex justify-between items-center">
//                       <span className="font-semibold">Debt-to-Equity Ratio</span>
//                       <span className="font-bold">0.35</span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Performance Ratios</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span>Current Ratio</span>
//                     <span className="font-bold">2.4</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Quick Ratio</span>
//                     <span className="font-bold">1.8</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Return on Assets</span>
//                     <span className="font-bold">12.5%</span>
//                   </div>
//                   <div className="border-t pt-2">
//                     <div className="flex justify-between items-center">
//                       <span className="font-semibold">Return on Equity</span>
//                       <span className="font-bold">18.2%</span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         <TabsContent value="client" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Client Analytics</CardTitle>
//               <CardDescription>Analyze client performance and profitability</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2">
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={clientRevenueData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="name" />
//                       <YAxis />
//                       <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
//                       <Bar dataKey="value" fill="#0088FE" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-semibold mb-2">Top Clients by Revenue</h4>
//                     <div className="space-y-2">
//                       {clientRevenueData.slice(0, 4).map((client, index) => (
//                         <div key={index} className="flex justify-between items-center">
//                           <span className="text-sm">{client.name}</span>
//                           <Badge variant="secondary">${(client.value / 1000).toFixed(0)}K</Badge>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 className="font-semibold mb-2">Client Metrics</h4>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-sm">Avg. Client Value</span>
//                         <span className="font-medium">$89K</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm">Client Acquisition Cost</span>
//                         <span className="font-medium">$2.4K</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm">Lifetime Value</span>
//                         <span className="font-medium">$267K</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="automated" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Automated Report Scheduling</CardTitle>
//               <CardDescription>Set up automatic report generation and distribution</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <Alert>
//                     <Zap className="h-4 w-4" />
//                     <AlertDescription>
//                       <strong>15 automated reports</strong> are scheduled to run this month, saving approximately <strong>25 hours</strong> of manual work.
//                     </AlertDescription>
//                   </Alert>
                  
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between p-3 border rounded-lg">
//                       <div className="flex items-center gap-3">
//                         <CalendarClock className="h-5 w-5 text-blue-500" />
//                         <div>
//                           <p className="font-medium">Monthly P&L Package</p>
//                           <p className="text-sm text-muted-foreground">Next: Feb 1, 2024 at 9:00 AM</p>
//                         </div>
//                       </div>
//                       <Badge variant="default">Active</Badge>
//                     </div>
                    
//                     <div className="flex items-center justify-between p-3 border rounded-lg">
//                       <div className="flex items-center gap-3">
//                         <CalendarClock className="h-5 w-5 text-blue-500" />
//                         <div>
//                           <p className="font-medium">Weekly Cash Flow</p>
//                           <p className="text-sm text-muted-foreground">Next: Jan 22, 2024 at 8:00 AM</p>
//                         </div>
//                       </div>
//                       <Badge variant="default">Active</Badge>
//                     </div>
                    
//                     <div className="flex items-center justify-between p-3 border rounded-lg">
//                       <div className="flex items-center gap-3">
//                         <CalendarClock className="h-5 w-5 text-orange-500" />
//                         <div>
//                           <p className="font-medium">Quarterly Tax Summary</p>
//                           <p className="text-sm text-muted-foreground">Next: Apr 1, 2024 at 10:00 AM</p>
//                         </div>
//                       </div>
//                       <Badge variant="secondary">Scheduled</Badge>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-semibold mb-3">Distribution Analytics</h4>
//                     <div className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span>Reports Sent This Month</span>
//                         <span className="font-bold">47</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span>Email Delivery Rate</span>
//                         <span className="font-bold text-green-600">98.2%</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span>Avg. Opening Rate</span>
//                         <span className="font-bold">84.5%</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span>Time Saved</span>
//                         <span className="font-bold text-blue-600">25.3 hrs</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <Button className="w-full">
//                       <CalendarIcon className="h-4 w-4 mr-2" />
//                       Schedule New Report
//                     </Button>
//                     <Button variant="outline" className="w-full">
//                       <Mail className="h-4 w-4 mr-2" />
//                       Manage Recipients
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Recent Automated Activities */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Automated Activities</CardTitle>
//               <CardDescription>Track recent automated report generation and distribution</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <Send className="h-5 w-5 text-green-500" />
//                     <div>
//                       <p className="font-medium">Monthly P&L Statement sent to 8 recipients</p>
//                       <p className="text-sm text-muted-foreground">January 1, 2024 at 9:00 AM</p>
//                     </div>
//                   </div>
//                   <Badge variant="secondary">Delivered</Badge>
//                 </div>
                
//                 <div className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <FileText className="h-5 w-5 text-blue-500" />
//                     <div>
//                       <p className="font-medium">Weekly Cash Flow Report generated</p>
//                       <p className="text-sm text-muted-foreground">January 15, 2024 at 8:00 AM</p>
//                     </div>
//                   </div>
//                   <Badge variant="default">Generated</Badge>
//                 </div>
                
//                 <div className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <Send className="h-5 w-5 text-green-500" />
//                     <div>
//                       <p className="font-medium">Client Revenue Analysis sent to management</p>
//                       <p className="text-sm text-muted-foreground">January 8, 2024 at 2:00 PM</p>
//                     </div>
//                   </div>
//                   <Badge variant="secondary">Delivered</Badge>
//                 </div>
                
//                 <div className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <FileText className="h-5 w-5 text-blue-500" />
//                     <div>
//                       <p className="font-medium">Budget Variance Report auto-generated</p>
//                       <p className="text-sm text-muted-foreground">December 15, 2023 at 2:00 PM</p>
//                     </div>
//                   </div>
//                   <Badge variant="default">Generated</Badge>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="templates" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Report Templates</CardTitle>
//               <CardDescription>Pre-built report templates for common business needs</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {reportTemplates.map((template, index) => (
//                   <Card key={index}>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="text-base">{template.name}</CardTitle>
//                       <CardDescription className="text-sm">{template.description}</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="flex justify-between items-center">
//                           <Badge variant="outline">{template.category}</Badge>
//                           <span className="text-xs text-muted-foreground">Last: {template.lastGenerated}</span>
//                         </div>
//                         <div className="flex gap-2">
//                           <Button size="sm" className="flex-1">
//                             <FileText className="h-3 w-3 mr-1" />
//                             Generate
//                           </Button>
//                           <Button size="sm" variant="outline">
//                             <Download className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }