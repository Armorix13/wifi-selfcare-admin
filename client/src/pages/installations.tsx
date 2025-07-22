import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  HardHat,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  TrendingUp,
  CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Building,
  Home,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dummyNewInstallations, dummyEngineers, type NewInstallation } from "@/lib/dummyData";
import { cn } from "@/lib/utils";

export default function Installations() {
  const [installations] = useState<NewInstallation[]>(dummyNewInstallations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [selectedInstallation, setSelectedInstallation] = useState<NewInstallation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter installations based on search and filters
  const filteredInstallations = installations.filter((installation) => {
    const matchesSearch = 
      installation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || installation.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || installation.priority === priorityFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const installationDate = new Date(installation.createdAt);
      const filterDate = new Date(dateFilter);
      matchesDate = installationDate.toDateString() === filterDate.toDateString();
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  // Calculate analytics
  const totalInstallations = installations.length;
  const pendingInstallations = installations.filter(i => i.status === "pending").length;
  const confirmedInstallations = installations.filter(i => i.status === "confirmed").length;
  const rejectedInstallations = installations.filter(i => i.status === "rejected").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "confirmed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge variant="outline">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["ID", "Customer Name", "Email", "Phone", "Location", "Preferred Plan", "Request Type", "Status", "Priority", "Estimated Cost", "Created Date"];
    const csvContent = [
      headers.join(","),
      ...filteredInstallations.map(installation => [
        installation.id,
        `"${installation.customerName}"`,
        installation.email,
        installation.phone,
        `"${installation.location}"`,
        installation.preferredPlan || "N/A",
        installation.requestType,
        installation.status,
        installation.priority,
        installation.estimatedCost || "N/A",
        new Date(installation.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `installations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <HardHat className="h-8 w-8 text-primary" />
              New Installation Management
            </h2>
            <p className="text-muted-foreground">
              Manage installation requests and track progress
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Installation Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Installation Request</DialogTitle>
                <DialogDescription>
                  Add a new installation request to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" placeholder="Enter customer name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="customer@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City/Area" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestType">Request Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes or requirements" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="installations">Installations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <HardHat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalInstallations}</div>
                  <p className="text-xs text-muted-foreground">
                    All installation requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingInstallations}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting confirmation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{confirmedInstallations}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for installation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedInstallations}</div>
                  <p className="text-xs text-muted-foreground">
                    Unable to proceed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Installations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Installation Requests</CardTitle>
                <CardDescription>Latest installation requests requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {installations.slice(0, 5).map((installation) => (
                    <div key={installation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          installation.requestType === "residential" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                        )}>
                          {installation.requestType === "residential" ? <Home className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{installation.customerName}</p>
                          <p className="text-sm text-muted-foreground">{installation.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(installation.status)}
                        {getPriorityBadge(installation.priority)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installations" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Installations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, location, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button onClick={exportToExcel} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Installations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Requests ({filteredInstallations.length})</CardTitle>
                <CardDescription>
                  Manage and track all installation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallations.map((installation) => (
                      <TableRow key={installation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{installation.customerName}</p>
                            <p className="text-sm text-muted-foreground">{installation.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{installation.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{installation.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{installation.preferredPlan || "Not specified"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={installation.requestType === "residential" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}>
                            {installation.requestType}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(installation.status)}</TableCell>
                        <TableCell>{getPriorityBadge(installation.priority)}</TableCell>
                        <TableCell className="text-sm">
                          {installation.estimatedCost ? `₹${installation.estimatedCost.toLocaleString()}` : "TBD"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(installation.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInstallation(installation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <span className="text-sm font-medium">{pendingInstallations} ({Math.round((pendingInstallations / totalInstallations) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(pendingInstallations / totalInstallations) * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confirmed</span>
                    <span className="text-sm font-medium">{confirmedInstallations} ({Math.round((confirmedInstallations / totalInstallations) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(confirmedInstallations / totalInstallations) * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejected</span>
                    <span className="text-sm font-medium">{rejectedInstallations} ({Math.round((rejectedInstallations / totalInstallations) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(rejectedInstallations / totalInstallations) * 100}%` }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Residential</span>
                      </div>
                      <span className="text-sm font-medium">
                        {installations.filter(i => i.requestType === "residential").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Commercial</span>
                      </div>
                      <span className="text-sm font-medium">
                        {installations.filter(i => i.requestType === "commercial").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["urgent", "high", "medium", "low"].map(priority => {
                    const count = installations.filter(i => i.priority === priority).length;
                    const percentage = Math.round((count / totalInstallations) * 100);
                    return (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{priority}</span>
                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Installation Detail Dialog */}
        {selectedInstallation && (
          <Dialog open={!!selectedInstallation} onOpenChange={() => setSelectedInstallation(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Installation Request Details</DialogTitle>
                <DialogDescription>
                  Complete information for installation ID #{selectedInstallation.id}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Customer Name</Label>
                    <p className="text-sm">{selectedInstallation.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedInstallation.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedInstallation.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm">{selectedInstallation.location}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{selectedInstallation.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Request Type</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedInstallation.requestType}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Plan</Label>
                    <p className="text-sm">{selectedInstallation.preferredPlan || "Not specified"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedInstallation.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedInstallation.priority)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estimated Cost</Label>
                    <p className="text-sm">{selectedInstallation.estimatedCost ? `₹${selectedInstallation.estimatedCost.toLocaleString()}` : "TBD"}</p>
                  </div>
                </div>
                {selectedInstallation.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedInstallation.notes}</p>
                  </div>
                )}
                {selectedInstallation.rejectionReason && (
                  <div>
                    <Label className="text-sm font-medium">Rejection Reason</Label>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedInstallation.rejectionReason}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Created Date</Label>
                    <p className="text-sm">{new Date(selectedInstallation.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm">{new Date(selectedInstallation.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}