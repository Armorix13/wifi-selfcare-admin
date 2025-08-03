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
  FileText,
  Settings,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Wrench
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  dummyApplicationForms, 
  dummyWifiInstallationRequests, 
  dummyEngineers, 
  dummyFibrePlans,
  dummyOttPlans,
  dummyIptvPlans,
  type ApplicationForm,
  type WifiInstallationRequest 
} from "@/lib/dummyData";
import { cn } from "@/lib/utils";

export default function Installations() {
  const [applicationForms] = useState<ApplicationForm[]>(dummyApplicationForms);
  const [installationRequests] = useState<WifiInstallationRequest[]>(dummyWifiInstallationRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationForm | null>(null);
  const [selectedInstallation, setSelectedInstallation] = useState<WifiInstallationRequest | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isInstallationDialogOpen, setIsInstallationDialogOpen] = useState(false);
  const [isCreateApplicationOpen, setIsCreateApplicationOpen] = useState(false);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "inreview": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accept": case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "reject": case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fibre": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ott": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "iptv": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPlanDetails = (planId: number, type: string) => {
    if (type === "fibre") {
      const plan = dummyFibrePlans.find(p => p.id === planId);
      return plan ? `${plan.title} - ₹${plan.price}` : "Unknown Plan";
    } else if (type === "ott") {
      const plan = dummyOttPlans.find(p => p.id === planId);
      return plan ? `${plan.title} - ₹${plan.price}` : "Unknown Plan";
    } else if (type === "iptv") {
      const plan = dummyIptvPlans.find(p => p.id === planId);
      return plan ? `${plan.name} - ₹${plan.price}` : "Unknown Plan";
    }
    return "Unknown Plan";
  };

  const getEngineerName = (engineerId: number) => {
    const engineer = dummyEngineers.find(e => e.id === engineerId);
    return engineer ? engineer.name : "Unassigned";
  };

  // Filter applications
  const filteredApplications = applicationForms.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phoneNumber.includes(searchTerm) ||
      app.village.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = typeFilter === "all" || app.applicationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter installation requests
  const filteredInstallations = installationRequests.filter((req) => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phoneNumber.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesType = typeFilter === "all" || req.installationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalApplicationPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startApplicationIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startApplicationIndex, startApplicationIndex + itemsPerPage);

  const totalInstallationPages = Math.ceil(filteredInstallations.length / itemsPerPage);
  const startInstallationIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInstallations = filteredInstallations.slice(startInstallationIndex, startInstallationIndex + itemsPerPage);

  // Analytics data
  const applicationStats = {
    total: applicationForms.length,
    inReview: applicationForms.filter(a => a.status === "inreview").length,
    accepted: applicationForms.filter(a => a.status === "accept").length,
    rejected: applicationForms.filter(a => a.status === "reject").length,
    fibre: applicationForms.filter(a => a.applicationType === "fibre").length,
    ott: applicationForms.filter(a => a.applicationType === "ott").length,
    iptv: applicationForms.filter(a => a.applicationType === "iptv").length
  };

  const installationStats = {
    total: installationRequests.length,
    inReview: installationRequests.filter(r => r.status === "inreview").length,
    approved: installationRequests.filter(r => r.status === "approved").length,
    rejected: installationRequests.filter(r => r.status === "rejected").length,
    completed: installationRequests.filter(r => r.completedDate).length,
    assigned: installationRequests.filter(r => r.assignedEngineer).length
  };

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight dashboard-text">New Installation Management</h2>
            <p className="dashboard-text-muted">
              Manage application forms and installation requests for Fibre, OTT, and IPTV services
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
              className="dashboard-action-button"
            >
              {viewMode === "card" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              {viewMode === "card" ? "Table View" : "Card View"}
            </Button>
            <Button
              onClick={() => setIsCreateApplicationOpen(true)}
              className="dashboard-primary-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="installations">Installations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Application Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 dashboard-icon" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{applicationStats.total}</div>
                  <p className="text-xs dashboard-text-muted">
                    All application forms submitted
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">In Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{applicationStats.inReview}</div>
                  <p className="text-xs dashboard-text-muted">
                    Pending approval
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Accepted</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{applicationStats.accepted}</div>
                  <p className="text-xs dashboard-text-muted">
                    Ready for installation
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{applicationStats.rejected}</div>
                  <p className="text-xs dashboard-text-muted">
                    Applications declined
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dashboard-icon h-4 w-4" />
                  <Input
                    placeholder="Search applications by name, ID, phone, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dashboard-input"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] dashboard-select">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="inreview">In Review</SelectItem>
                    <SelectItem value="accept">Accepted</SelectItem>
                    <SelectItem value="reject">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] dashboard-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fibre">Fibre</SelectItem>
                    <SelectItem value="ott">OTT</SelectItem>
                    <SelectItem value="iptv">IPTV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Applications List */}
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedApplications.map((app) => (
                  <Card key={app.id} className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-sm dashboard-card-title">{app.applicationId}</CardTitle>
                            <p className="text-xs dashboard-text-muted">{app.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={`${getStatusColor(app.status)} text-xs font-medium`}>
                            {app.status.toUpperCase()}
                          </Badge>
                          <Badge className={`${getTypeColor(app.applicationType)} text-xs font-medium`}>
                            {app.applicationType.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold dashboard-text text-sm mb-1">Contact Details</h4>
                        <div className="space-y-1 text-xs dashboard-text-muted">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{app.phoneNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{app.village}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold dashboard-text text-sm mb-1">Plan Details</h4>
                        <p className="text-xs dashboard-text-muted">
                          {getPlanDetails(app.planId, app.applicationType)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs dashboard-text-muted">
                          {format(new Date(app.createdAt), "MMM dd, yyyy")}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(app);
                            setIsApplicationDialogOpen(true);
                          }}
                          className="dashboard-action-button"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="dashboard-card-title">Application Forms</CardTitle>
                  <CardDescription className="dashboard-text-muted">
                    Showing {paginatedApplications.length} of {filteredApplications.length} applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.applicationId}</TableCell>
                          <TableCell>{app.name}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(app.applicationType)}>
                              {app.applicationType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{app.phoneNumber}</TableCell>
                          <TableCell>{app.village}</TableCell>
                          <TableCell className="text-sm">
                            {getPlanDetails(app.planId, app.applicationType)}
                          </TableCell>
                          <TableCell>{format(new Date(app.createdAt), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setIsApplicationDialogOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Pagination for Applications */}
            {totalApplicationPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm dashboard-text-muted">
                  Page {currentPage} of {totalApplicationPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="dashboard-pagination-button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalApplicationPages, currentPage + 1))}
                    disabled={currentPage === totalApplicationPages}
                    className="dashboard-pagination-button"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Installations Tab */}
          <TabsContent value="installations" className="space-y-6">
            {/* Installation Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Total Requests</CardTitle>
                  <Wrench className="h-4 w-4 dashboard-icon" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{installationStats.total}</div>
                  <p className="text-xs dashboard-text-muted">
                    All installation requests
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{installationStats.approved}</div>
                  <p className="text-xs dashboard-text-muted">
                    Ready for installation
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Assigned</CardTitle>
                  <UserCheck className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{installationStats.assigned}</div>
                  <p className="text-xs dashboard-text-muted">
                    Engineers assigned
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dashboard-card-title">Completed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dashboard-text">{installationStats.completed}</div>
                  <p className="text-xs dashboard-text-muted">
                    Installations done
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dashboard-icon h-4 w-4" />
                  <Input
                    placeholder="Search installations by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dashboard-input"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] dashboard-select">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="inreview">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] dashboard-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fibre">Fibre</SelectItem>
                    <SelectItem value="ott">OTT</SelectItem>
                    <SelectItem value="iptv">IPTV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Installation Requests List */}
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedInstallations.map((req) => (
                  <Card key={req.id} className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-sm dashboard-card-title">#{req.id}</CardTitle>
                            <p className="text-xs dashboard-text-muted">{req.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={`${getStatusColor(req.status)} text-xs font-medium`}>
                            {req.status.toUpperCase()}
                          </Badge>
                          <Badge className={`${getTypeColor(req.installationType)} text-xs font-medium`}>
                            {req.installationType.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold dashboard-text text-sm mb-1">Contact Details</h4>
                        <div className="space-y-1 text-xs dashboard-text-muted">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{req.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{req.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      {req.assignedEngineer && (
                        <div>
                          <h4 className="font-semibold dashboard-text text-sm mb-1">Assigned Engineer</h4>
                          <p className="text-xs dashboard-text-muted">
                            {getEngineerName(req.assignedEngineer)}
                          </p>
                        </div>
                      )}

                      {req.installationDate && (
                        <div>
                          <h4 className="font-semibold dashboard-text text-sm mb-1">Installation Date</h4>
                          <p className="text-xs dashboard-text-muted">
                            {format(new Date(req.installationDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs dashboard-text-muted">
                          {format(new Date(req.createdAt), "MMM dd, yyyy")}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInstallation(req);
                            setIsInstallationDialogOpen(true);
                          }}
                          className="dashboard-action-button"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="dashboard-card-title">Installation Requests</CardTitle>
                  <CardDescription className="dashboard-text-muted">
                    Showing {paginatedInstallations.length} of {filteredInstallations.length} installation requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Engineer</TableHead>
                        <TableHead>Installation Date</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInstallations.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">#{req.id}</TableCell>
                          <TableCell>{req.name}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(req.installationType)}>
                              {req.installationType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(req.status)}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{req.email}</TableCell>
                          <TableCell>
                            {req.assignedEngineer ? getEngineerName(req.assignedEngineer) : "Unassigned"}
                          </TableCell>
                          <TableCell>
                            {req.installationDate ? format(new Date(req.installationDate), "MMM dd, yyyy") : "Not scheduled"}
                          </TableCell>
                          <TableCell>{format(new Date(req.createdAt), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedInstallation(req);
                                  setIsInstallationDialogOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Pagination for Installations */}
            {totalInstallationPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm dashboard-text-muted">
                  Page {currentPage} of {totalInstallationPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="dashboard-pagination-button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalInstallationPages, currentPage + 1))}
                    disabled={currentPage === totalInstallationPages}
                    className="dashboard-pagination-button"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Application Type Distribution */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="dashboard-card-title">Application Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm dashboard-text">Fibre</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{applicationStats.fibre}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(applicationStats.fibre / applicationStats.total) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm dashboard-text">OTT</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{applicationStats.ott}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(applicationStats.ott / applicationStats.total) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm dashboard-text">IPTV</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{applicationStats.iptv}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(applicationStats.iptv / applicationStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Installation Status Overview */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="dashboard-card-title">Installation Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm dashboard-text">In Review</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{installationStats.inReview}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm dashboard-text">Approved</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{installationStats.approved}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        <span className="text-sm dashboard-text">Engineer Assigned</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{installationStats.assigned}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm dashboard-text">Completed</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{installationStats.completed}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm dashboard-text">Rejected</span>
                      </div>
                      <span className="text-sm font-medium dashboard-text">{installationStats.rejected}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="dashboard-card-title">Application to Installation Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold dashboard-text">
                        {Math.round((installationStats.total / applicationStats.accepted) * 100)}%
                      </div>
                      <p className="text-sm dashboard-text-muted">Conversion Rate</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm dashboard-text">
                        <span>Accepted Applications</span>
                        <span>{applicationStats.accepted}</span>
                      </div>
                      <div className="flex justify-between text-sm dashboard-text">
                        <span>Installation Requests</span>
                        <span>{installationStats.total}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="dashboard-card-title">Installation Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold dashboard-text">
                        {Math.round((installationStats.completed / installationStats.total) * 100)}%
                      </div>
                      <p className="text-sm dashboard-text-muted">Completion Rate</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(installationStats.completed / installationStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm dashboard-text">
                        <span>Total Requests</span>
                        <span>{installationStats.total}</span>
                      </div>
                      <div className="flex justify-between text-sm dashboard-text">
                        <span>Completed</span>
                        <span>{installationStats.completed}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Application Detail Dialog */}
        <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details - {selectedApplication?.applicationId}</DialogTitle>
              <DialogDescription>
                Complete application form information and status
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Application Type</Label>
                    <Badge className={`${getTypeColor(selectedApplication.applicationType)} mt-1`}>
                      {selectedApplication.applicationType.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Status</Label>
                    <Badge className={`${getStatusColor(selectedApplication.status)} mt-1`}>
                      {selectedApplication.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Applicant Name</Label>
                    <p className="mt-1 dashboard-text">{selectedApplication.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Phone Number</Label>
                    <p className="mt-1 dashboard-text">{selectedApplication.phoneNumber}</p>
                  </div>
                </div>

                {selectedApplication.alternatePhoneNumber && (
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Alternate Phone</Label>
                    <p className="mt-1 dashboard-text">{selectedApplication.alternatePhoneNumber}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Village/Area</Label>
                    <p className="mt-1 dashboard-text">{selectedApplication.village}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Pincode</Label>
                    <p className="mt-1 dashboard-text">{selectedApplication.pincode}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium dashboard-text">Address</Label>
                  <p className="mt-1 dashboard-text">{selectedApplication.address}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium dashboard-text">Selected Plan</Label>
                  <p className="mt-1 dashboard-text">
                    {getPlanDetails(selectedApplication.planId, selectedApplication.applicationType)}
                  </p>
                </div>

                {selectedApplication.remarks && (
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Remarks</Label>
                    <p className="mt-1 dashboard-text">{selectedApplication.remarks}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Applied Date</Label>
                    <p className="mt-1 dashboard-text">
                      {format(new Date(selectedApplication.createdAt), "PPpp")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Last Updated</Label>
                    <p className="mt-1 dashboard-text">
                      {format(new Date(selectedApplication.updatedAt), "PPpp")}
                    </p>
                  </div>
                </div>

                {selectedApplication.status === "inreview" && (
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Accept Application
                    </Button>
                    <Button variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-red-50">
                      Reject Application
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Installation Detail Dialog */}
        <Dialog open={isInstallationDialogOpen} onOpenChange={setIsInstallationDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Installation Request Details - #{selectedInstallation?.id}</DialogTitle>
              <DialogDescription>
                Complete installation request information and assignment
              </DialogDescription>
            </DialogHeader>
            {selectedInstallation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Installation Type</Label>
                    <Badge className={`${getTypeColor(selectedInstallation.installationType)} mt-1`}>
                      {selectedInstallation.installationType.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Status</Label>
                    <Badge className={`${getStatusColor(selectedInstallation.status)} mt-1`}>
                      {selectedInstallation.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Customer Name</Label>
                    <p className="mt-1 dashboard-text">{selectedInstallation.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Email</Label>
                    <p className="mt-1 dashboard-text">{selectedInstallation.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Phone Number</Label>
                    <p className="mt-1 dashboard-text">{selectedInstallation.phoneNumber}</p>
                  </div>
                  {selectedInstallation.alternatePhoneNumber && (
                    <div>
                      <Label className="text-sm font-medium dashboard-text">Alternate Phone</Label>
                      <p className="mt-1 dashboard-text">{selectedInstallation.alternatePhoneNumber}</p>
                    </div>
                  )}
                </div>

                {selectedInstallation.assignedEngineer && (
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Assigned Engineer</Label>
                    <p className="mt-1 dashboard-text">{getEngineerName(selectedInstallation.assignedEngineer)}</p>
                  </div>
                )}

                {selectedInstallation.installationDate && (
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Scheduled Installation Date</Label>
                    <p className="mt-1 dashboard-text">
                      {format(new Date(selectedInstallation.installationDate), "PPpp")}
                    </p>
                  </div>
                )}

                {selectedInstallation.completedDate && (
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Completion Date</Label>
                    <p className="mt-1 dashboard-text">
                      {format(new Date(selectedInstallation.completedDate), "PPpp")}
                    </p>
                  </div>
                )}

                {selectedInstallation.remarks && (
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Remarks</Label>
                    <p className="mt-1 dashboard-text">{selectedInstallation.remarks}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Request Date</Label>
                    <p className="mt-1 dashboard-text">
                      {format(new Date(selectedInstallation.createdAt), "PPpp")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium dashboard-text">Last Updated</Label>
                    <p className="mt-1 dashboard-text">
                      {format(new Date(selectedInstallation.updatedAt), "PPpp")}
                    </p>
                  </div>
                </div>

                {selectedInstallation.status === "inreview" && (
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Approve Request
                    </Button>
                    <Button variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-red-50">
                      Reject Request
                    </Button>
                  </div>
                )}

                {selectedInstallation.status === "approved" && !selectedInstallation.assignedEngineer && (
                  <div className="pt-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Assign Engineer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}