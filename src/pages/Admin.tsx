import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MapPin, Phone, Mail, Star, Edit, Trash2, Search, Filter, Grid, List, Eye, Settings, Activity, Users, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, User, X, Calendar, Clock, Shield, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Role } from "@/lib/types/auth";
import { useAddCompanyProfileMutation, useGetAnalyticsAdminDataQuery } from "@/api/index";

// API Response Types
interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyLogo: string;
  contactPerson: string;
  internetProviders: string[];
  isActivated: boolean;
  isDeactivated: boolean;
  isSuspended: boolean;
  createdAt: string;
  lastLogin: string;
}

interface AdminDashboardData {
  dashboardSummary: {
    totalAdmins: number;
    activeAdmins: number;
    inactiveAdmins: number;
    ispCompanies: number;
  };
  adminPerformance: {
    avgResponseTime: string;
    tasksCompleted: string;
    userSatisfaction: string;
  };
  ispCompanyStats: {
    activeCompanies: number;
    totalProviders: number;
    newThisMonth: number;
  };
  recentActivity: {
    newAdmins: number;
    companyUpdates: number;
    activeSessions: number;
  };
  admins: Admin[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Form Schema
const insertAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
  role: z.nativeEnum(Role),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  permissions: z.array(z.string()).optional(),
  // ISP Company Information
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  internetProviders: z.array(z.string()).min(1, "At least one internet provider is required"),
});

type InsertAdmin = z.infer<typeof insertAdminSchema>;

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [availableProviders, setAvailableProviders] = useState([
    "Jio Fiber", "Airtel", "BSNL", "ACT Fibernet", "Hathway", "You Broadband", "Tikona", "MTNL"
  ]);

  // Fetch admin dashboard data with pagination
  const { data: adminDashboardData, isLoading: isLoadingDashboard, error: dashboardError, refetch } = useGetAnalyticsAdminDataQuery({
    page: currentPage,
    limit: pageSize,
  });
  
  // Mock loading states for demo purposes
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [isActivatingAdmin, setIsActivatingAdmin] = useState(false);
  const { toast } = useToast();
  const [addCompanyProfile, { isLoading: isAddingAdmin }] = useAddCompanyProfileMutation();
  
  // State for form data
  const [formData, setFormData] = useState<InsertAdmin>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
    role: Role.ADMIN, // Default to Admin role only
    status: "active",
    permissions: [],
    companyName: "",
    companyAddress: "",
    internetProviders: [],
  });

  const form = useForm<InsertAdmin>({
    resolver: zodResolver(insertAdminSchema),
    defaultValues: formData,
  });

  // Update form when formData changes
  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);

  const editForm = useForm<InsertAdmin>({
    resolver: zodResolver(insertAdminSchema),
    defaultValues: formData,
  });

  // Extract data from API response
  const { admins, dashboardSummary, adminPerformance, ispCompanyStats, recentActivity, pagination } = adminDashboardData?.data || {
    admins: [],
    dashboardSummary: { totalAdmins: 0, activeAdmins: 0, inactiveAdmins: 0, ispCompanies: 0 },
    adminPerformance: { avgResponseTime: "0", tasksCompleted: "0%", userSatisfaction: "0/5" },
    ispCompanyStats: { activeCompanies: 0, totalProviders: 0, newThisMonth: 0 },
    recentActivity: { newAdmins: 0, companyUpdates: 0, activeSessions: 0 },
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 6, hasNextPage: false, hasPrevPage: false }
  };

    // Filter admins based on search and filters
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin: Admin) => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch = 
        `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm) ||
        admin.companyName.toLowerCase().includes(searchTerm) ||
        admin.companyPhone.includes(searchTerm);
    
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && !admin.isDeactivated && !admin.isSuspended) ||
        (statusFilter === "inactive" && admin.isDeactivated) ||
        (statusFilter === "suspended" && admin.isSuspended);

      return matchesSearch && matchesStatus;
    });
  }, [admins, searchQuery, statusFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (data: InsertAdmin) => {
    try {
      // Prepare data for API
      const apiData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.phoneNumber,
        internetProviders: data.internetProviders,
      };

      await addCompanyProfile(apiData).unwrap();
      
      toast({
        title: "Success",
        description: "Admin user added successfully!",
      });
      
      // Reset form and close dialog
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        countryCode: "+91",
        role: Role.ADMIN,
        status: "active",
        permissions: [],
        companyName: "",
        companyAddress: "",
        internetProviders: [],
      });
      form.reset();
      setIsCreateDialogOpen(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add admin user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAdmin = async (data: InsertAdmin) => {
    if (!selectedAdmin) return;
    
    try {
      // Simulate API call delay
      setIsUpdatingAdmin(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Admin updated successfully (Demo Mode)",
      });
      
      setIsEditDialogOpen(false);
      setIsUpdatingAdmin(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin. Please try again.",
        variant: "destructive",
      });
      setIsUpdatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      // Simulate API call delay
      setIsDeletingAdmin(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Admin deleted successfully (Demo Mode)",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedAdmin(null);
      setIsDeletingAdmin(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete admin. Please try again.",
        variant: "destructive",
      });
      setIsDeletingAdmin(false);
    }
  };

  const handleActivateAdmin = async (adminId: string) => {
    try {
      setIsActivatingAdmin(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Admin activated successfully!",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivatingAdmin(false);
    }
  };

  const handleAddProvider = () => {
    if (newProvider.trim() && !availableProviders.includes(newProvider.trim())) {
      setAvailableProviders([...availableProviders, newProvider.trim()]);
      setNewProvider("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingDashboard) {
    return (
      <MainLayout title="Admin Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admins...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (dashboardError) {
    return (
      <MainLayout title="Admin Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading admins</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Role Management">
      <div className="space-y-6">
        {/* Header Description */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Role Management</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            As a Super Admin, you can manage admin roles for ISP companies. 
            Each admin represents an ISP provider company with specific permissions and access.
          </p>
        </div>

        {/* Stats Cards - Updated to show only Admin stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Admins</p>
                  <p className="text-2xl font-bold text-blue-800">{dashboardSummary?.totalAdmins || 0}</p>
                </div>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Admins</p>
                  <p className="text-2xl font-bold text-green-800">{dashboardSummary?.activeAdmins || 0}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardSummary?.inactiveAdmins || 0}</p>
                </div>
                <X className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">ISP Companies</p>
                  <p className="text-2xl font-bold text-purple-800">{ispCompanyStats?.activeCompanies || 0}</p>
                </div>
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Analytics & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Admin Performance</h3>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {adminPerformance?.avgResponseTime || "0"}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Satisfaction</h3>
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Rating</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {adminPerformance?.userSatisfaction || "0/5"}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(parseFloat(adminPerformance?.userSatisfaction || "0") / 5) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Efficiency</h3>
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Task Completion</span>
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    {adminPerformance?.tasksCompleted || "0%"}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${parseFloat(adminPerformance?.tasksCompleted || "0")}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">ISP Company Stats</h3>
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Companies</span>
                  <span className="font-semibold text-blue-600">{ispCompanyStats?.activeCompanies || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Providers</span>
                  <span className="font-semibold text-green-600">{ispCompanyStats?.totalProviders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New This Month</span>
                  <span className="font-semibold text-purple-600">{ispCompanyStats?.newThisMonth || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Admins</span>
                  <span className="font-semibold text-green-600">{recentActivity?.newAdmins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Company Updates</span>
                  <span className="font-semibold text-blue-600">{recentActivity?.companyUpdates || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Sessions</span>
                  <span className="font-semibold text-purple-600">{recentActivity?.activeSessions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add ISP Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        ✨ Add New ISP Company Admin
                      </DialogTitle>
                      <p className="text-muted-foreground">
                        Create a new admin account for an ISP provider company with specific permissions and access.
                      </p>
                    </DialogHeader>
                    
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">👤 Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                            <Input 
                              {...form.register("firstName")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                            <Input 
                              {...form.register("lastName")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📞 Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                            <Input 
                              {...form.register("email")} 
                              type="email"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number *</Label>
                            <div className="flex gap-2">
                              <Input 
                                {...form.register("countryCode")} 
                                className="w-20 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center"
                                placeholder="+91"
                              />
                              <Input 
                                {...form.register("phoneNumber")} 
                                className="flex-1 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter phone number"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ISP Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🏢 ISP Company Information</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-sm font-medium">Company Name *</Label>
                            <Input 
                              {...form.register("companyName")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter ISP company name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyAddress" className="text-sm font-medium">Company Address *</Label>
                            <Input 
                              {...form.register("companyAddress")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter company address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="internetProviders" className="text-sm font-medium">Internet Providers *</Label>
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Search or add new provider"
                                  value={newProvider}
                                  onChange={(e) => setNewProvider(e.target.value)}
                                  className="flex-1"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={handleAddProvider}
                                  className="px-4"
                                >
                                  Add
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                                {availableProviders.map((provider) => (
                                  <div key={provider} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={provider}
                                      value={provider}
                                      checked={form.watch("internetProviders")?.includes(provider)}
                                      onChange={(e) => {
                                        const currentProviders = form.watch("internetProviders") || [];
                                        if (e.target.checked) {
                                          form.setValue("internetProviders", [...currentProviders, provider]);
                                        } else {
                                          form.setValue("internetProviders", currentProviders.filter(p => p !== provider));
                                        }
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <Label htmlFor={provider} className="text-sm">{provider}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Role & Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🔐 Role & Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">Role *</Label>
                            <Select 
                              value={form.watch("role")} 
                              onValueChange={(value) => form.setValue("role", value as Role)}
                            >
                              <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Role.ADMIN} className="text-blue-600">🛡️ Admin</SelectItem>
                                <SelectItem value={Role.SUPERADMIN} className="text-yellow-600">👑 Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Removed Department field */}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">⚙️ Status</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                            <Select 
                              value={form.watch("status")} 
                              onValueChange={(value) => form.setValue("status", value as "active" | "inactive" | "suspended")}
                            >
                              <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active" className="text-green-600">🟢 Active</SelectItem>
                                <SelectItem value="inactive" className="text-gray-600">⚫ Inactive</SelectItem>
                                <SelectItem value="suspended" className="text-red-600">🔴 Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isAddingAdmin} className="w-full">
                          {isAddingAdmin ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding Admin...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admins Display - Updated to show company info */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdmins.map((admin: Admin) => (
              <Card key={admin._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{admin.firstName} {admin.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={!admin.isDeactivated ? "default" : "secondary"}>
                        {!admin.isDeactivated ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">Admin</Badge>
                    </div>
                  </div>
                  
                  {/* Company Information */}
                  <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="font-medium">Company: {admin.companyName || "N/A"}</span>
                    </div>
                    {admin.companyAddress && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-xs">{admin.companyAddress}</span>
                      </div>
                    )}
                    {admin.internetProviders && admin.internetProviders.length > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="text-xs">Providers: {admin.internetProviders.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {admin.companyPhone}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {admin.companyAddress}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Last Login: {formatDateTime(admin.lastLogin)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        editForm.reset({
                          firstName: admin.firstName,
                          lastName: admin.lastName,
                          email: admin.email,
                          phoneNumber: admin.companyPhone,
                          countryCode: "+91", // Default country code
                          role: Role.ADMIN, // Default role
                          status: admin.isActivated ? "active" : "inactive",
                          permissions: [],
                          companyName: admin.companyName || "",
                          companyAddress: admin.companyAddress || "",
                          internetProviders: admin.internetProviders || [],
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={filteredAdmins}
                columns={[
                  { 
                    key: "profileImage", 
                    label: "Photo",
                    render: () => (
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                    )
                  },
                  { 
                    key: "name", 
                    label: "Name",
                    render: (_, admin) => `${admin.firstName} ${admin.lastName}`
                  },
                  { key: "email", label: "Email" },
                  { 
                    key: "companyName", 
                    label: "Company",
                    render: (value) => value || "-"
                  },
                  { 
                    key: "status", 
                    label: "Status",
                    render: (_, admin) => {
                      if (admin.isSuspended) return <Badge variant="destructive">Suspended</Badge>;
                      if (admin.isDeactivated) return <Badge variant="secondary">Inactive</Badge>;
                      if (!admin.isDeactivated) return <Badge variant="default">Active</Badge>;
                      return <Badge variant="outline">Unknown</Badge>;
                    }
                  },
                  {
                    key: "createdAt",
                    label: "Joined",
                    render: (value) => formatDate(value)
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (_, admin) => (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            editForm.reset({
                              firstName: admin.firstName,
                              lastName: admin.lastName,
                              email: admin.email,
                              phoneNumber: admin.companyPhone,
                              countryCode: "+91", // Default country code
                              role: Role.ADMIN, // Default role
                              status: admin.isActivated ? "active" : "inactive",
                              permissions: [],
                              companyName: admin.companyName || "",
                              companyAddress: admin.companyAddress || "",
                              internetProviders: admin.internetProviders || [],
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} admins
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Admin Dialog - Updated with company fields */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ✏️ Edit ISP Admin
            </DialogTitle>
            <p className="text-muted-foreground">Update the ISP admin profile information</p>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(handleEditAdmin)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">👤 Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName" className="text-sm font-medium">First Name *</Label>
                  <Input 
                    id="edit-firstName"
                    {...editForm.register("firstName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName" className="text-sm font-medium">Last Name *</Label>
                  <Input 
                    id="edit-lastName"
                    {...editForm.register("lastName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📞 Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                  <Input 
                    id="edit-email"
                    {...editForm.register("email")} 
                    type="email"
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phoneNumber" className="text-sm font-medium">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-countryCode"
                      {...editForm.register("countryCode")} 
                      className="w-20 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center"
                      placeholder="+91"
                    />
                    <Input 
                      id="edit-phoneNumber"
                      {...editForm.register("phoneNumber")} 
                      className="flex-1 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ISP Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🏢 ISP Company Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-companyName" className="text-sm font-medium">Company Name *</Label>
                  <Input 
                    id="edit-companyName"
                    {...editForm.register("companyName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter ISP company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-companyAddress" className="text-sm font-medium">Company Address *</Label>
                  <Input 
                    id="edit-companyAddress"
                    {...editForm.register("companyAddress")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter company address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-internetProviders" className="text-sm font-medium">Internet Providers *</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search or add new provider"
                        value={newProvider}
                        onChange={(e) => setNewProvider(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddProvider}
                        className="px-4"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {availableProviders.map((provider) => (
                        <div key={provider} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-${provider}`}
                            value={provider}
                            checked={editForm.watch("internetProviders")?.includes(provider)}
                            onChange={(e) => {
                              const currentProviders = editForm.watch("internetProviders") || [];
                              if (e.target.checked) {
                                editForm.setValue("internetProviders", [...currentProviders, provider]);
                              } else {
                                editForm.setValue("internetProviders", currentProviders.filter(p => p !== provider));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`edit-${provider}`} className="text-sm">{provider}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🔐 Role & Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-sm font-medium">Role *</Label>
                  <Select 
                    value={editForm.watch("role")} 
                    onValueChange={(value) => editForm.setValue("role", value as Role)}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN} className="text-blue-600">🛡️ Admin</SelectItem>
                      <SelectItem value={Role.SUPERADMIN} className="text-yellow-600">👑 Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Removed Department field */}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">⚙️ Status</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">Status *</Label>
                  <Select 
                    value={editForm.watch("status")} 
                    onValueChange={(value) => editForm.setValue("status", value as "active" | "inactive" | "suspended")}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-green-600">🟢 Active</SelectItem>
                      <SelectItem value="inactive" className="text-gray-600">⚫ Inactive</SelectItem>
                      <SelectItem value="suspended" className="text-red-600">🔴 Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUpdatingAdmin}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingAdmin ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "✏️ Update ISP Admin"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Admin Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[70%] h-[70vh] max-w-none overflow-hidden">
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-6 overflow-y-auto h-full pr-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedAdmin!.firstName} {selectedAdmin!.lastName}</h3>
                  <p className="text-muted-foreground">{selectedAdmin!.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={!selectedAdmin!.isDeactivated ? "default" : "secondary"}>
                      {!selectedAdmin!.isDeactivated ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedAdmin!.companyPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedAdmin!.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined: {formatDate(selectedAdmin!.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Last Login: {formatDateTime(selectedAdmin!.lastLogin)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Status: {!selectedAdmin!.isDeactivated ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {selectedAdmin!.companyName && (
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Company Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Company: {selectedAdmin!.companyName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>Role: Admin</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Account Status</h4>
                <div className="flex gap-2">
                  <span className="text-sm">
                    Deactivated: {selectedAdmin!.isDeactivated ? 'Yes' : 'No'}
                  </span>
                  <span className="text-sm">
                    Suspended: {selectedAdmin!.isSuspended ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Delete Admin
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete {selectedAdmin?.firstName} {selectedAdmin?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => selectedAdmin && handleDeleteAdmin(selectedAdmin._id)}
                disabled={isDeletingAdmin}
              >
                {isDeletingAdmin ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Admin
                  </>
                )}
              </Button>
            </AlertDialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Admin Confirmation */}
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate this admin account? This will restore their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAdmin && handleActivateAdmin(selectedAdmin._id)}
              disabled={isActivatingAdmin}
            >
              {isActivatingAdmin ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate Admin
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
  