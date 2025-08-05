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
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const itemsPerPage = 6;

  const { toast } = useToast();

  // Load dummy data
  const [complaints, setComplaints] = useState(generateDummyComplaints());
  const engineers = generateDummyEngineers();
  const customers = generateDummyCustomers();

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
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c: any) => c.id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getEngineerName = (engineerId: number | null) => {
    if (!engineerId) return null;
    const engineer = engineers.find((e: any) => e.id === engineerId);
    return engineer?.name || "Unknown Engineer";
  };

  const getStatusColor = (status: string) => {
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
    const newComplaint: Complaint = {
      id: Math.max(...complaints.map(c => c.id)) + 1,
      title: `${data.category} Issue`,
      customerId: customers.length + 1,
      customerName: data.customerName,
      description: data.description,
      priority: data.priority,
      status: "pending",
      location: data.location,
      engineerId: null,
      engineerName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setComplaints([...complaints, newComplaint]);
    toast({
      title: "Success",
      description: "Complaint created successfully",
    });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleEdit = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    editForm.reset({
      customerName: complaint.customerName,
      email: "customer@email.com", // Default for demo
      phone: "1234567890", // Default for demo
      location: complaint.location,
      priority: complaint.priority,
      description: complaint.description,
      category: "technical"
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (data: InsertComplaint) => {
    if (!selectedComplaint) return;
    
    const updatedComplaints = complaints.map(complaint => 
      complaint.id === selectedComplaint.id 
        ? { 
            ...complaint, 
            customerName: data.customerName,
            location: data.location,
            priority: data.priority,
            description: data.description,
            updatedAt: new Date().toISOString()
          }
        : complaint
    );
    setComplaints(updatedComplaints);
    toast({
      title: "Success",
      description: "Complaint updated successfully",
    });
    setIsEditDialogOpen(false);
    setSelectedComplaint(null);
  };

  const handleView = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (complaint: Complaint) => {
    setComplaints(complaints.filter(c => c.id !== complaint.id));
    toast({
      title: "Success",
      description: "Complaint deleted successfully",
    });
  };

  const handleAssign = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignDialogOpen(true);
  };

  const assignEngineer = () => {
    if (!selectedComplaint || !selectedEngineerId) return;

    const engineer = engineers.find((e: any) => e.id === parseInt(selectedEngineerId));
    const updatedComplaints = complaints.map(complaint => 
      complaint.id === selectedComplaint.id 
        ? { 
            ...complaint, 
            engineerId: parseInt(selectedEngineerId),
            engineerName: engineer?.name || null,
            status: "assigned" as const,
            updatedAt: new Date().toISOString()
          }
        : complaint
    );
    setComplaints(updatedComplaints);
    toast({
      title: "Success",
      description: "Engineer assigned successfully",
    });
    setIsAssignDialogOpen(false);
    setSelectedComplaint(null);
    setSelectedEngineerId("");
  };

  // Filtering and pagination
  const filteredComplaints = complaints.filter((complaint: Complaint) => {
    const customerName = getCustomerName(complaint.customerId);
    const matchesSearch =
      !searchQuery ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "all" || complaint.status === statusFilter) &&
      (priorityFilter === "all" || complaint.priority === priorityFilter) &&
      (locationFilter === "all" || complaint.location === locationFilter)
    );
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const uniqueLocations = Array.from(new Set(complaints.map(c => c.location)));

  // Analytics calculations
  const calculateAnalytics = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const assigned = complaints.filter(c => c.status === 'assigned').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const notResolved = complaints.filter(c => c.status === 'not-resolved').length;
    
    const urgent = complaints.filter(c => c.priority === 'urgent').length;
    const high = complaints.filter(c => c.priority === 'high').length;
    const medium = complaints.filter(c => c.priority === 'medium').length;
    const low = complaints.filter(c => c.priority === 'low').length;
    
    const resolutionRate = total > 0 ? ((resolved / total) * 100) : 0;
    const avgResolutionTime = 2.5; // hours - dummy calculation
    
    // Calculate complaints by location
    const locationStats = uniqueLocations.map(location => ({
      location,
      count: complaints.filter(c => c.location === location).length,
      resolved: complaints.filter(c => c.location === location && c.status === 'resolved').length
    }));
    
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
      locationStats,
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
                <Button className="dashboard-primary-button">
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
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

              {/* Priority Breakdown */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Priority Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
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

              {/* Top Locations */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.locationStats.slice(0, 5).map((location, index) => (
                      <div key={location.location} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium dashboard-text">{location.location}</p>
                            <p className="text-sm text-muted-foreground">
                              {location.resolved}/{location.count} resolved
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium dashboard-text">{location.count}</p>
                          <p className="text-sm text-muted-foreground">
                            {((location.resolved / location.count) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
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

                    <Select value={locationFilter} onValueChange={(value) => {
                      setLocationFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px] dashboard-select">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent className="dashboard-select-content">
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm dashboard-text-muted">
                Showing {paginatedComplaints.length} of {filteredComplaints.length} complaints
              </p>
            </div>

            {/* Complaints Grid/Table */}
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedComplaints.map((complaint) => (
                  <Card key={complaint.id} className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-sm dashboard-card-title">#{complaint.id}</CardTitle>
                            <p className="text-xs dashboard-text-muted">
                              {getCustomerName(complaint.customerId)}
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
                    <p className="text-xs dashboard-text-muted line-clamp-2">{complaint.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(complaint.status)} text-xs font-medium`}>
                      {complaint.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center text-xs dashboard-text-muted">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(complaint.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs dashboard-text-muted">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {complaint.location}
                    </div>
                    {complaint.engineerName && (
                      <div className="flex items-center">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {complaint.engineerName}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 pt-2">
                    {complaint.status === "pending" && (
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
                    {paginatedComplaints.map((complaint) => (
                      <tr key={complaint.id} className="border-b dashboard-table-row hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-mono text-sm font-medium dashboard-text">
                            #{complaint.id}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium dashboard-text">
                                {getCustomerName(complaint.customerId)}
                              </div>
                              <div className="text-xs dashboard-text-muted flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {complaint.location}
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
                              {complaint.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getPriorityColor(complaint.priority)} font-medium`}>
                            {complaint.priority.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(complaint.status)} font-medium`}>
                            {complaint.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {complaint.engineerName ? (
                              <>
                                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {complaint.engineerName.split(" ").map((n: string) => n[0]).join("")}
                                  </span>
                                </div>
                                <span className="text-sm font-medium dashboard-text">
                                  {complaint.engineerName}
                                </span>
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
                            {complaint.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAssign(complaint)}
                                className="dashboard-action-button"
                              >
                                <User className="h-4 w-4" />
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
                  Page {currentPage} of {totalPages}
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
                    <p className="font-mono dashboard-text">#{selectedComplaint.id}</p>
                  </div>
                  <div>
                    <Label className="dashboard-label">Status</Label>
                    <Badge className={`${getStatusColor(selectedComplaint.status)} font-medium mt-1`}>
                      {selectedComplaint.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-label">Customer</Label>
                    <p className="dashboard-text">{getCustomerName(selectedComplaint.customerId)}</p>
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
                  <p className="dashboard-text">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-label">Location</Label>
                    <p className="dashboard-text flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedComplaint.location}
                    </p>
                  </div>
                  <div>
                    <Label className="dashboard-label">Engineer</Label>
                    <p className="dashboard-text">
                      {selectedComplaint.engineerName || "Not assigned"}
                    </p>
                  </div>
                </div>

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
          <DialogContent className="dashboard-dialog">
            <DialogHeader>
              <DialogTitle className="dashboard-dialog-title">Assign Engineer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="dashboard-label">Select Engineer</Label>
                <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
                  <SelectTrigger className="dashboard-select">
                    <SelectValue placeholder="Choose an engineer" />
                  </SelectTrigger>
                  <SelectContent className="dashboard-select-content">
                    {engineers.map((engineer: any) => (
                      <SelectItem key={engineer.id} value={engineer.id.toString()}>
                        {engineer.name} - {engineer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={assignEngineer} disabled={!selectedEngineerId} className="dashboard-primary-button">
                  Assign Engineer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}