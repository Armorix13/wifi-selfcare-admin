import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Filter,
  Search,
  Edit,
  Eye,
  Trash2,
  Phone,
  MapPin,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Star,
  UserCheck,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Timer,
  Users,
  AlertTriangle,
  Calendar,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { generateDummyComplaints, generateDummyEngineers, generateDummyCustomers, type Complaint } from "@/lib/dummyData";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useAssignEngineerToComplaintMutation, useGetAllComplaintsQuery, useGetEngineersQuery } from "@/api";

// Schema for creating complaints
const insertComplaintSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(1, "Location is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export default function Complaints() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null | any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [engineerSearchQuery, setEngineerSearchQuery] = useState<string>("");
  const itemsPerPage = 6;

  const { toast } = useToast();

  // Build query parameters
  const queryParams: any = {
    page: currentPage,
    limit: itemsPerPage,
  };

  if (statusFilter !== "all") queryParams.status = statusFilter;
  if (priorityFilter !== "all") queryParams.priority = priorityFilter;
  if (typeFilter !== "all") queryParams.type = typeFilter;

  const { data: complaintData, isLoading, error } = useGetAllComplaintsQuery(queryParams);
  const { data: engineersData, isLoading: engineersLoading } = useGetEngineersQuery({});
  const [assignEngineerToComplaint, { isLoading: isAssigning }] = useAssignEngineerToComplaintMutation();

  // Use real data from API
  const complaints = complaintData?.data?.complaints || [];
  const pagination = complaintData?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };
  const engineers = engineersData?.data?.engineers || [];
  const customers = generateDummyCustomers();

  console.log("complaint", complaintData);
  console.log("engineers", engineersData);
  console.log("engineers array", engineers);

  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      description: "",
      priority: "medium",
      location: "",
      category: "technical",
    },
  });

  const editForm = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      description: "",
      priority: "medium",
      location: "",
      category: "technical",
    },
  });

  // Helper functions
  const getCustomerName = (complaint: any) => {
    return complaint.user?.firstName + " " + complaint.user?.lastName || "Unknown Customer";
  };

  const getEngineerName = (engineerId: number | null) => {
    if (!engineerId) return null;
    const engineer = engineers.find((e: any) => e.id === engineerId);
    return engineer?.name || "Unknown Engineer";
  };

  const getStatusColor = (status: string, hasEngineer?: boolean) => {
    if (hasEngineer && status === "pending") {
      return "dashboard-status-assigned";
    }
    
    switch (status) {
      case "pending":
        return "dashboard-status-pending";
      case "assigned":
        return "dashboard-status-assigned";
      case "in-progress":
        return "dashboard-status-progress";
      case "visited":
        return "dashboard-status-visited";
      case "resolved":
        return "dashboard-status-resolved";
      case "not-resolved":
        return "dashboard-status-failed";
      default:
        return "dashboard-status-default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "dashboard-priority-urgent";
      case "high":
        return "dashboard-priority-high";
      case "medium":
        return "dashboard-priority-medium";
      case "low":
        return "dashboard-priority-low";
      default:
        return "dashboard-priority-default";
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return "Just now";
    }
  };

  // CRUD operations
  const onSubmit = (data: InsertComplaint) => {
    toast({
      title: "Success",
      description: "Complaint created successfully",
    });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleEdit = (complaint: any) => {
    setSelectedComplaint(complaint);
    editForm.reset({
      customerName: complaint.user?.firstName + " " + complaint.user?.lastName,
      email: complaint.user?.email || "",
      phone: complaint.phoneNumber || "",
      location: "Location", // Default for demo
      priority: complaint.priority,
      description: complaint.issueDescription,
      category: complaint.type
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (data: InsertComplaint) => {
    toast({
      title: "Success",
      description: "Complaint updated successfully",
    });
    setIsEditDialogOpen(false);
    setSelectedComplaint(null);
  };

  const handleView = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (complaint: any) => {
    toast({
      title: "Success",
      description: "Complaint deleted successfully",
    });
  };

  const handleAssign = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsAssignDialogOpen(true);
  };

  const assignEngineer = async () => {
    if (!selectedComplaint || !selectedEngineerId) return;

    const selectedEngineer = engineers.find((engineer: any) => engineer._id === selectedEngineerId);
    
    if (!selectedEngineer) {
      toast({
        title: "Error",
        description: "Selected engineer not found",
      });
      return;
    }

    try {
      await assignEngineerToComplaint({
        id: selectedComplaint._id,
        engineerId: selectedEngineerId,
        priority: selectedComplaint.priority,
      }).unwrap();

      toast({
        title: "Success",
        description: `Engineer ${selectedEngineer.firstName} ${selectedEngineer.lastName} (${selectedEngineer.email}) assigned successfully`,
      });
      setIsAssignDialogOpen(false);
      setSelectedComplaint(null);
      setSelectedEngineerId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign engineer. Please try again.",
      });
    }
  };

  // Filtering for search (client-side filtering)
  const filteredComplaints = complaints.filter((complaint: any) => {
    const customerName = complaint.user?.firstName + " " + complaint.user?.lastName;
    const matchesSearch =
      !searchQuery ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const totalPages = pagination.pages;
  const paginatedComplaints = filteredComplaints;

  const uniqueLocations = Array.from(new Set(complaints.map((c: any) => c.location || "Unknown")));

  // Analytics calculations
  const calculateAnalytics = () => {
    const total = complaints.length;
    const pending = complaints.filter((c: any) => c.status === 'pending').length;
    const assigned = complaints.filter((c: any) => c.status === 'assigned').length;
    const inProgress = complaints.filter((c: any) => c.status === 'in-progress').length;
    const resolved = complaints.filter((c: any) => c.status === 'resolved').length;
    const notResolved = complaints.filter((c: any) => c.status === 'not-resolved').length;
    
    const urgent = complaints.filter((c: any) => c.priority === 'urgent').length;
    const high = complaints.filter((c: any) => c.priority === 'high').length;
    const medium = complaints.filter((c: any) => c.priority === 'medium').length;
    const low = complaints.filter((c: any) => c.priority === 'low').length;
    
    const resolutionRate = total > 0 ? ((resolved / total) * 100) : 0;
    const avgResolutionTime = 2.5; // hours - dummy calculation
    
    // Calculate complaints by type (WIFI/CCTV)
    const wifiComplaints = complaints.filter((c: any) => c.type === 'WIFI').length;
    const cctvComplaints = complaints.filter((c: any) => c.type === 'CCTV').length;
    
    // Calculate daily trends (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayComplaints = Math.floor(Math.random() * 15) + 5;
      const dayResolved = Math.floor(dayComplaints * 0.7);
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        complaints: dayComplaints,
        resolved: dayResolved,
        pending: dayComplaints - dayResolved
      });
    }
    
    return {
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      notResolved,
      urgent,
      high,
      medium,
      low,
      resolutionRate,
      avgResolutionTime,
      wifiComplaints,
      cctvComplaints,
      dailyData
    };
  };

  const analytics = calculateAnalytics();

  // Chart data
  const statusData = [
    { name: 'Pending', value: analytics.pending, color: '#ef4444' },
    { name: 'Assigned', value: analytics.assigned, color: '#f59e0b' },
    { name: 'In Progress', value: analytics.inProgress, color: '#3b82f6' },
    { name: 'Resolved', value: analytics.resolved, color: '#10b981' },
    { name: 'Not Resolved', value: analytics.notResolved, color: '#6b7280' }
  ];

  const priorityData = [
    { name: 'Urgent', value: analytics.urgent, color: '#dc2626' },
    { name: 'High', value: analytics.high, color: '#ea580c' },
    { name: 'Medium', value: analytics.medium, color: '#ca8a04' },
    { name: 'Low', value: analytics.low, color: '#65a30d' }
  ];

  const typeData = [
    { name: 'WIFI', value: analytics.wifiComplaints, color: '#3b82f6' },
    { name: 'CCTV', value: analytics.cctvComplaints, color: '#8b5cf6' }
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'];

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout title="Complaints Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dashboard-welcome-text">Complaints Management</h1>
            <p className="text-muted-foreground">Comprehensive complaint tracking and analytics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                {/* <Button className="dashboard-primary-button">
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button> */}
              </DialogTrigger>
              <DialogContent className="max-w-2xl dashboard-dialog">
                <DialogHeader>
                  <DialogTitle className="dashboard-dialog-title">Create New Complaint</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName" className="dashboard-label">Customer Name</Label>
                      <Input
                        {...form.register("customerName")}
                        placeholder="Enter customer name"
                        className="dashboard-input"
                      />
                      {form.formState.errors.customerName && (
                        <p className="text-sm text-red-500">{form.formState.errors.customerName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="dashboard-label">Email</Label>
                      <Input
                        {...form.register("email")}
                        type="email"
                        placeholder="customer@email.com"
                        className="dashboard-input"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="dashboard-label">Phone</Label>
                      <Input
                        {...form.register("phone")}
                        placeholder="Enter phone number"
                        className="dashboard-input"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="location" className="dashboard-label">Location</Label>
                      <Input
                        {...form.register("location")}
                        placeholder="Enter location"
                        className="dashboard-input"
                      />
                      {form.formState.errors.location && (
                        <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="dashboard-label">Priority</Label>
                      <Select
                        value={form.watch("priority")}
                        onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                          form.setValue("priority", value)
                        }
                      >
                        <SelectTrigger className="dashboard-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dashboard-select-content">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category" className="dashboard-label">Category</Label>
                      <Select
                        value={form.watch("category")}
                        onValueChange={(value: string) => form.setValue("category", value)}
                      >
                        <SelectTrigger className="dashboard-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dashboard-select-content">
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="dashboard-label">Description</Label>
                    <Textarea
                      {...form.register("description")}
                      placeholder="Describe the issue..."
                      rows={4}
                      className="dashboard-textarea"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="dashboard-primary-button">
                      Create Complaint
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics and Complaints Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Complaints
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                      <p className="text-2xl font-bold dashboard-text">{analytics.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                      <p className="text-2xl font-bold dashboard-text">{analytics.resolutionRate.toFixed(1)}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+5.2% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                      <p className="text-2xl font-bold dashboard-text">{analytics.avgResolutionTime}h</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Timer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">-15min from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                      <p className="text-2xl font-bold dashboard-text">{analytics.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">-8% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Type Distribution */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trends and Location Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trends */}
              <Card className="dashboard-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Trends (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="complaints"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                          name="New Complaints"
                        />
                        <Area
                          type="monotone"
                          dataKey="resolved"
                          stackId="2"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                          name="Resolved"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Complaint Types */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Complaint Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium dashboard-text">WIFI</p>
                          <p className="text-sm text-muted-foreground">
                            {analytics.wifiComplaints} complaints
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium dashboard-text">{analytics.wifiComplaints}</p>
                        <p className="text-sm text-muted-foreground">
                          {analytics.total > 0 ? ((analytics.wifiComplaints / analytics.total) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                          <Activity className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium dashboard-text">CCTV</p>
                          <p className="text-sm text-muted-foreground">
                            {analytics.cctvComplaints} complaints
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium dashboard-text">{analytics.cctvComplaints}</p>
                        <p className="text-sm text-muted-foreground">
                          {analytics.total > 0 ? ((analytics.cctvComplaints / analytics.total) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="text-lg">Response Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">&lt; 1 hour</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">1-4 hours</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">&gt; 4 hours</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="text-lg">Engineer Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm dashboard-text">Average Rating</span>
                      <span className="text-sm font-medium">4.2/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm dashboard-text">Active Engineers</span>
                      <span className="text-sm font-medium">{engineers.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm dashboard-text">Assigned Complaints</span>
                      <span className="text-sm font-medium">{analytics.assigned + analytics.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm dashboard-text">Completion Rate</span>
                      <span className="text-sm font-medium text-green-600">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold dashboard-text">4.1</div>
                      <div className="flex justify-center mt-1">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>5★</span><span>45%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>4★</span><span>30%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>3★</span><span>15%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2★</span><span>7%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>1★</span><span>3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            {/* Filters */}
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search complaints..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10 dashboard-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "card" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("card")}
                        className="dashboard-card-header"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="dashboard-card-header"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    <Select value={statusFilter} onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px] dashboard-select">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="dashboard-select-content">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="visited">Visited</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="not-resolved">Not Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={(value) => {
                      setPriorityFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px] dashboard-select">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="dashboard-select-content">
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={(value) => {
                      setTypeFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px] dashboard-select">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="dashboard-select-content">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="WIFI">WIFI</SelectItem>
                        <SelectItem value="CCTV">CCTV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm dashboard-text-muted">
                {isLoading ? "Loading complaints..." : `Showing ${paginatedComplaints.length} of ${pagination.total} complaints`}
              </p>
              {error && (
                <p className="text-sm text-red-500">
                  Error loading complaints. Please try again.
                </p>
              )}
            </div>

            {/* Complaints Grid/Table */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="dashboard-card">
                    <CardHeader className="pb-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedComplaints.map((complaint:any) => (
                  <Card key={complaint.id} className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-sm dashboard-card-title">#{complaint._id}</CardTitle>
                            <p className="text-xs dashboard-text-muted">
                              {getCustomerName(complaint)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={`${getPriorityColor(complaint.priority)} text-xs font-medium`}>
                            {complaint.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold dashboard-text text-sm mb-1">{complaint.title}</h4>
                    <p className="text-xs dashboard-text-muted line-clamp-2">{complaint.issueDescription}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(complaint.status, !!complaint.engineer)} text-xs font-medium`}>
                      {complaint.engineer ? "ASSIGNED" : complaint.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center text-xs dashboard-text-muted">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(complaint.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs dashboard-text-muted">
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {complaint.type}
                    </div>
                    {complaint.engineer ? (
                      <div className="flex items-center">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {complaint.engineer.firstName} {complaint.engineer.lastName}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {complaint.phoneNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 pt-2">
                    {complaint.status === "pending" && !complaint.engineer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssign(complaint)}
                        className="flex-1 h-8 text-xs dashboard-action-button"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    )}
                    {complaint.engineer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100"
                        disabled
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Assigned
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(complaint)}
                      className="flex-1 h-8 text-xs dashboard-action-button"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(complaint)}
                      className="flex-1 h-8 text-xs dashboard-action-button"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isLoading ? (
          <Card className="dashboard-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dashboard-table-header">
                      <th className="text-left p-4 dashboard-table-header-text">ID</th>
                      <th className="text-left p-4 dashboard-table-header-text">Customer</th>
                      <th className="text-left p-4 dashboard-table-header-text">Issue</th>
                      <th className="text-left p-4 dashboard-table-header-text">Priority</th>
                      <th className="text-left p-4 dashboard-table-header-text">Status</th>
                      <th className="text-left p-4 dashboard-table-header-text">Engineer</th>
                      <th className="text-left p-4 dashboard-table-header-text">Created</th>
                      <th className="text-left p-4 dashboard-table-header-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, index) => (
                      <tr key={index} className="border-b dashboard-table-row">
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-16"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-20"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-6 bg-muted rounded w-16"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-6 bg-muted rounded w-20"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-16"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="animate-pulse">
                            <div className="h-8 bg-muted rounded w-24"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dashboard-table-header">
                      <th className="text-left p-4 dashboard-table-header-text">ID</th>
                      <th className="text-left p-4 dashboard-table-header-text">Customer</th>
                      <th className="text-left p-4 dashboard-table-header-text">Issue</th>
                      <th className="text-left p-4 dashboard-table-header-text">Priority</th>
                      <th className="text-left p-4 dashboard-table-header-text">Status</th>
                      <th className="text-left p-4 dashboard-table-header-text">Engineer</th>
                      <th className="text-left p-4 dashboard-table-header-text">Created</th>
                      <th className="text-left p-4 dashboard-table-header-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedComplaints.map((complaint:any) => (
                      <tr key={complaint.id} className="border-b dashboard-table-row hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-mono text-sm font-medium dashboard-text">
                            #{complaint._id}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium dashboard-text">
                                {getCustomerName(complaint)}
                              </div>
                              <div className="text-xs dashboard-text-muted flex items-center">
                                <Activity className="h-3 w-3 mr-1" />
                                {complaint.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium dashboard-text truncate">
                              {complaint.title}
                            </div>
                            <div className="text-xs dashboard-text-muted truncate">
                              {complaint.issueDescription}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getPriorityColor(complaint.priority)} font-medium`}>
                            {complaint.priority.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(complaint.status, !!complaint.engineer)} font-medium`}>
                            {complaint.engineer ? "ASSIGNED" : complaint.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {complaint.engineer ? (
                              <>
                                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {complaint.engineer.firstName[0]}{complaint.engineer.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium dashboard-text">
                                    {complaint.engineer.firstName} {complaint.engineer.lastName}
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    {complaint.engineer.email}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <Badge variant="outline" className="dashboard-text-muted">
                                Unassigned
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm dashboard-text-muted flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getTimeAgo(complaint.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-1">
                            {complaint.status === "pending" && !complaint.engineer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAssign(complaint)}
                                className="dashboard-action-button"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            )}
                            {complaint.engineer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="dashboard-action-button text-green-600"
                                disabled
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(complaint)}
                              className="dashboard-action-button"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(complaint)}
                              className="dashboard-action-button"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="dashboard-action-button text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="dashboard-dialog">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="dashboard-dialog-title">Delete Complaint</AlertDialogTitle>
                                  <AlertDialogDescription className="dashboard-text-muted">
                                    Are you sure you want to delete this complaint? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(complaint)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm dashboard-text-muted">
                  Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="dashboard-pagination-button"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl dashboard-dialog">
            <DialogHeader>
              <DialogTitle className="dashboard-dialog-title">Complaint Details</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-label">Complaint ID</Label>
                    <p className="font-mono dashboard-text">#{selectedComplaint._id}</p>
                  </div>
                  <div>
                    <Label className="dashboard-label">Status</Label>
                    <Badge className={`${getStatusColor(selectedComplaint.status, !!selectedComplaint.engineer)} font-medium mt-1`}>
                      {selectedComplaint.engineer ? "ASSIGNED" : selectedComplaint.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-label">Customer</Label>
                    <p className="dashboard-text">{getCustomerName(selectedComplaint)}</p>
                  </div>
                  <div>
                    <Label className="dashboard-label">Priority</Label>
                    <Badge className={`${getPriorityColor(selectedComplaint.priority)} font-medium mt-1`}>
                      {selectedComplaint.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="dashboard-label">Issue Title</Label>
                  <p className="dashboard-text">{selectedComplaint.title}</p>
                </div>

                <div>
                  <Label className="dashboard-label">Description</Label>
                  <p className="dashboard-text">{selectedComplaint.issueDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-label">Type</Label>
                    <p className="dashboard-text flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      {selectedComplaint.type}
                    </p>
                  </div>
                  <div>
                    <Label className="dashboard-label">Phone Number</Label>
                    <p className="dashboard-text flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {selectedComplaint.phoneNumber}
                    </p>
                  </div>
                </div>

                {selectedComplaint.engineer && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-3 flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                      Assigned Engineer
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="dashboard-label text-sm">Engineer Name</Label>
                        <p className="dashboard-text">
                          {selectedComplaint.engineer.firstName} {selectedComplaint.engineer.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-sm">Email</Label>
                        <p className="dashboard-text">{selectedComplaint.engineer.email}</p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-sm">Phone</Label>
                        <p className="dashboard-text">{selectedComplaint.engineer.phoneNumber}</p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-sm">Assigned By</Label>
                        <p className="dashboard-text">
                          {selectedComplaint.assignedBy?.firstName} {selectedComplaint.assignedBy?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-label">Created</Label>
                    <p className="dashboard-text flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {getTimeAgo(selectedComplaint.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="dashboard-label">Last Updated</Label>
                    <p className="dashboard-text flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {getTimeAgo(selectedComplaint.updatedAt)}
                    </p>
                  </div>
                </div>

                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <Label className="dashboard-label">Attachments</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedComplaint.attachments.map((attachment: string, index: number) => (
                        <Badge key={index} variant="outline" className="dashboard-text-muted">
                          Attachment {index + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl dashboard-dialog">
            <DialogHeader>
              <DialogTitle className="dashboard-dialog-title">Edit Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName" className="dashboard-label">Customer Name</Label>
                  <Input
                    {...editForm.register("customerName")}
                    placeholder="Enter customer name"
                    className="dashboard-input"
                  />
                  {editForm.formState.errors.customerName && (
                    <p className="text-sm text-red-500">{editForm.formState.errors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location" className="dashboard-label">Location</Label>
                  <Input
                    {...editForm.register("location")}
                    placeholder="Enter location"
                    className="dashboard-input"
                  />
                  {editForm.formState.errors.location && (
                    <p className="text-sm text-red-500">{editForm.formState.errors.location.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="dashboard-label">Priority</Label>
                  <Select
                    value={editForm.watch("priority")}
                    onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                      editForm.setValue("priority", value)
                    }
                  >
                    <SelectTrigger className="dashboard-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dashboard-select-content">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category" className="dashboard-label">Category</Label>
                  <Select
                    value={editForm.watch("category")}
                    onValueChange={(value: string) => editForm.setValue("category", value)}
                  >
                    <SelectTrigger className="dashboard-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dashboard-select-content">
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="dashboard-label">Description</Label>
                <Textarea
                  {...editForm.register("description")}
                  placeholder="Describe the issue..."
                  rows={4}
                  className="dashboard-textarea"
                />
                {editForm.formState.errors.description && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="dashboard-primary-button">
                  Update Complaint
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assign Engineer Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="dashboard-dialog max-w-2xl">
            <DialogHeader>
              <DialogTitle className="dashboard-dialog-title">Assign Engineer</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Select an engineer to assign to this complaint
              </p>
            </DialogHeader>
            <div className="space-y-6">
              {selectedComplaint && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Complaint Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <span className="ml-2 font-mono">#{selectedComplaint._id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2">{selectedComplaint.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <span className="ml-2">{selectedComplaint.title}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge className={`${getPriorityColor(selectedComplaint.priority)} ml-2`}>
                        {selectedComplaint.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="dashboard-label">Select Engineer ({engineers.length} available)</Label>
                {!engineersLoading && engineers.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search engineers..."
                        value={engineerSearchQuery}
                        onChange={(e) => setEngineerSearchQuery(e.target.value)}
                        className="pl-10 dashboard-input"
                      />
                    </div>
                  </div>
                )}
                {engineersLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-12 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : engineers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No engineers available</p>
                    <p className="text-xs mt-1">Please add engineers to the system first</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {engineers
                      .filter((engineer: any) => {
                        if (!engineerSearchQuery) return true;
                        const searchTerm = engineerSearchQuery.toLowerCase();
                        return (
                          engineer.firstName?.toLowerCase().includes(searchTerm) ||
                          engineer.lastName?.toLowerCase().includes(searchTerm) ||
                          engineer.email?.toLowerCase().includes(searchTerm) ||
                          engineer.phoneNumber?.toLowerCase().includes(searchTerm)
                        );
                      })
                                            .map((engineer: any) => (
                        <div
                          key={engineer._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                            selectedEngineerId === engineer._id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setSelectedEngineerId(engineer._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                                                          <div>
                              <div className="font-medium dashboard-text">
                                {engineer.firstName} {engineer.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {engineer.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium dashboard-text">
                              Engineer
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {engineer.countryCode} {engineer.phoneNumber}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Role: {engineer.role}
                        </div>
                        </div>
                      ))}
                    {engineers.filter((engineer: any) => {
                      if (!engineerSearchQuery) return false;
                      const searchTerm = engineerSearchQuery.toLowerCase();
                      return (
                        engineer.firstName?.toLowerCase().includes(searchTerm) ||
                        engineer.lastName?.toLowerCase().includes(searchTerm) ||
                        engineer.email?.toLowerCase().includes(searchTerm) ||
                        engineer.phoneNumber?.toLowerCase().includes(searchTerm)
                      );
                    }).length === 0 && engineerSearchQuery && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No engineers found matching "{engineerSearchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedEngineerId("");
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={assignEngineer} 
                  disabled={!selectedEngineerId || engineersLoading || isAssigning}
                  className="dashboard-primary-button"
                >
                  {isAssigning ? "Assigning..." : engineersLoading ? "Loading..." : "Assign Engineer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}