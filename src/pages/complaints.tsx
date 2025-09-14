import { useState, useEffect } from "react";
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
  FileText,
  Image,
  Download,
  ExternalLink,
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
import { useAssignEngineerToComplaintMutation, useGetAllComplaintsQuery, useGetEngineersQuery, BASE_URL, useGetAllComplaintDasboardQuery, useGetAllUserForComplaintsQuery, useGetAllIssueTypeQuery, useAddComplaintByAdminMutation } from "@/api";

// Schema for creating complaints
const insertComplaintSchema = z.object({
  type: z.enum(["WIFI", "CCTV"]).optional(),
  title: z.string().min(1, "Title is required"),
  issueType: z.string().min(1, "Issue type is required"),
  attachments: z.array(z.string()).max(4, "Maximum 4 attachments allowed").optional(),
  userId: z.string().min(1, "User selection is required"),
  engineerId: z.string().optional(),
  issueDescription: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
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
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [engineerSearchQuery, setEngineerSearchQuery] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const itemsPerPage = 6;
  const { data: complaintDashboardData, isLoading: complaintDashboardLoading } = useGetAllComplaintDasboardQuery({});

  console.log("complaintDashboardData", complaintDashboardData);


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
  const { data: usersData, isLoading: usersLoading } = useGetAllUserForComplaintsQuery({});
  const { data: issueTypesResponse, isLoading: issueTypesLoading } = useGetAllIssueTypeQuery({});
  const [assignEngineerToComplaint, { isLoading: isAssigning }] = useAssignEngineerToComplaintMutation();
  const [addComplaintByAdmin, { isLoading: isCreatingComplaint }] = useAddComplaintByAdminMutation();

  // Use real data from API
  const complaints = complaintData?.data?.complaints || [];
  const pagination = complaintData?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };
  const engineers = engineersData?.data?.engineers || [];
  const users = usersData?.data || [];
  const issueTypesData = issueTypesResponse?.data || {};
  const wifiIssueTypes = issueTypesData?.wifi || [];
  const cctvIssueTypes = issueTypesData?.cctv || [];

  console.log("complaint", complaintData);
  console.log("engineers", engineersData);
  console.log("engineers array", engineers);
  console.log("users", users);
  console.log("issueTypesData", issueTypesData);
  console.log("wifiIssueTypes", wifiIssueTypes);
  console.log("cctvIssueTypes", cctvIssueTypes);

  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      type: "WIFI",
      title: "",
      issueType: "",
      attachments: [],
      userId: "",
      engineerId: "",
      issueDescription: "",
      priority: "medium",
    },
  });

  // Auto-populate title when issueType changes
  useEffect(() => {
    const selectedIssueType = form.watch("issueType");
    if (selectedIssueType) {
      const selectedIssueTypeObj = wifiIssueTypes.find((issueType: any) => issueType.name === selectedIssueType);

      if (selectedIssueTypeObj) {
        // Only auto-populate if title is empty or same as previous issue type
        const currentTitle = form.getValues("title");
        if (!currentTitle || currentTitle === form.getValues("issueType")) {
          form.setValue("title", selectedIssueTypeObj.name);
        }
      }
    }
  }, [form.watch("issueType"), wifiIssueTypes]);

  const editForm = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      type: "WIFI",
      title: "",
      issueType: "",
      attachments: [],
      userId: "",
      engineerId: "",
      issueDescription: "",
      priority: "medium",
    },
  });


  // Helper functions
  const getCustomerName = (complaint: any) => {
    if (!complaint.user) return "Unknown Customer";
    
    const firstName = complaint.user.firstName || "";
    const lastName = complaint.user.lastName || "";
    
    // If firstName exists and lastName doesn't exist or is empty, just return firstName
    if (firstName && !lastName) {
      return firstName;
    }
    // If both exist, return both
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    // If only lastName exists, return lastName
    if (lastName) {
      return lastName;
    }
    // If neither exists, return default
    return "Unknown Customer";
  };

  const formatComplaintId = (complaint: any) => {
    if (!complaint._id) return "Unknown";

    // Get the last 3 digits of the MongoDB _id
    const lastThreeDigits = complaint._id.slice(-3);

    // Format based on complaint type
    const type = complaint.type || "UNKNOWN";
    return `${type}-${lastThreeDigits}`;
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
      case "in_progress":
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

  // Helper function to construct full attachment URL
  const getAttachmentUrl = (attachmentPath: string) => {
    if (!attachmentPath) return null;

    // If the path already starts with http, return as is
    if (attachmentPath.startsWith('http')) {
      return attachmentPath;
    }

    // Remove leading slash if present
    const cleanPath = attachmentPath.startsWith('/') ? attachmentPath.slice(1) : attachmentPath;

    // Construct full URL
    return `${BASE_URL}/${cleanPath}`;
  };

  // Helper function to get file type from URL
  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'document';
    } else {
      return 'unknown';
    }
  };

  // Helper function to format status history
  const formatStatusHistory = (statusHistory: any[]) => {
    if (!statusHistory || statusHistory.length === 0) return [];

    return statusHistory.map((history: any) => ({
      ...history,
      formattedDate: new Date(history.updatedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      statusDisplay: history.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      updatedByDisplay: history.updatedBy ?
        (() => {
          const firstName = history.updatedBy.firstName || "";
          const lastName = history.updatedBy.lastName || "";
          
          if (firstName && lastName) {
            return `${firstName} ${lastName}`;
          } else if (firstName) {
            return firstName;
          } else if (lastName) {
            return lastName;
          } else {
            return 'Unknown User';
          }
        })() :
        'System'
    }));
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'assigned':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not-resolved':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedFiles.length > 4) {
      toast({
        title: "Error",
        description: "Maximum 4 files allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setFilePreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Update form with file names
    const fileNames = newFiles.map(file => file.name);
    form.setValue("attachments", fileNames);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = filePreviewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setFilePreviewUrls(newPreviewUrls);

    const fileNames = newFiles.map(file => file.name);
    form.setValue("attachments", fileNames);
  };

  const resetForm = () => {
    form.reset();
    setSelectedFiles([]);
    setFilePreviewUrls([]);
    setUserSearchQuery("");
    setEngineerSearchQuery("");
  };

  // CRUD operations
  const onSubmit = async (data: InsertComplaint) => {
    try {
      console.log("Form data:", data);
      console.log("Selected files:", selectedFiles);

      // Get the selected user to get their phone number
      const selectedUser = users.find((u: any) => u._id === data.userId);
      if (!selectedUser) {
        toast({
          title: "Error",
          description: "Selected user not found",
          variant: "destructive",
        });
        return;
      }

      // Get the selected issue type object to get its _id
      const selectedIssueTypeObj = wifiIssueTypes.find((issueType: any) => issueType.name === data.issueType);

      if (!selectedIssueTypeObj) {
        toast({
          title: "Error",
          description: "Selected issue type not found",
          variant: "destructive",
        });
        return;
      }

      // Prepare FormData for file uploads
      const formData = new FormData();

      // Add basic fields
      formData.append('type', 'WIFI'); // Hardcoded to WIFI
      formData.append('title', data.title || selectedIssueTypeObj.name); // Use title if provided, otherwise use issue type name
      formData.append('issueType', selectedIssueTypeObj._id); // Send the _id
      formData.append('phoneNumber', selectedUser.phoneNumber); // Use selected user's phone number
      formData.append('user', data.userId); // Changed from userId to user
      if (data.engineerId) {
        formData.append('engineer', data.engineerId); // Changed from engineerId to engineer
      }
      formData.append('issueDescription', data.issueDescription);
      formData.append('priority', data.priority);

      // Add attachments as binary files
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Debug: Log FormData contents
      console.log("FormData contents:");
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      await addComplaintByAdmin(formData).unwrap();

      toast({
        title: "Success",
        description: "Complaint created successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating complaint:", error);
      toast({
        title: "Error",
        description: "Failed to create complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (complaint: any) => {
    setSelectedComplaint(complaint);
    setSelectedEngineerId(""); // Reset selected engineer
    setEngineerSearchQuery(""); // Reset search query
    setIsEditDialogOpen(true);
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
    const customerName = getCustomerName(complaint);
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

  // Analytics calculations using real API data
  const calculateAnalytics = () => {
    if (!complaintDashboardData?.data?.dashboardData) {
      return {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        notResolved: 0,
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
        resolutionRate: 0,
        avgResolutionTime: 0,
        wifiComplaints: 0,
        cctvComplaints: 0,
        dailyData: [],
        kpis: {
          totalComplaints: { value: 0, change: "0", trend: "up" },
          resolutionRate: { value: "0", change: "0", trend: "up" },
          avgResolutionTime: { value: "0", change: "0", trend: "up" },
          pendingIssues: { value: 0, change: "0", trend: "down" }
        },
        statusDistribution: [],
        typeDistribution: [],
        priorityDistribution: [],
        topIssueTypes: [],
        engineerPerformance: [],
        recentActivity: []
      };
    }

    const dashboardData = complaintDashboardData.data.dashboardData;
    const kpis = dashboardData.kpis;
    const distributions = dashboardData.distributions;
    const trends = dashboardData.trends;
    const additionalData = dashboardData.additionalData;

    // Calculate status counts
    const statusCounts = distributions.status.reduce((acc: any, item: any) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    // Calculate type counts
    const typeCounts = distributions.type.reduce((acc: any, item: any) => {
      acc[item.type] = item.count;
      return acc;
    }, {});

    // Calculate priority counts
    const priorityCounts = additionalData.priorityDistribution.reduce((acc: any, item: any) => {
      acc[item.priority] = item.count;
      return acc;
    }, {});

    // Format daily trends data
    const dailyData = trends.daily.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      complaints: item.newComplaints,
      resolved: item.resolved,
      pending: item.newComplaints - item.resolved
    }));

    return {
      total: kpis.totalComplaints.value,
      pending: statusCounts.pending || 0,
      assigned: statusCounts.assigned || 0,
      inProgress: statusCounts['in-progress'] || 0,
      resolved: statusCounts.resolved || 0,
      notResolved: statusCounts['not-resolved'] || 0,
      urgent: priorityCounts.urgent || 0,
      high: priorityCounts.high || 0,
      medium: priorityCounts.medium || 0,
      low: priorityCounts.low || 0,
      resolutionRate: parseFloat(kpis.resolutionRate.value),
      avgResolutionTime: parseFloat(kpis.avgResolutionTime.value),
      wifiComplaints: typeCounts.WIFI || 0,
      cctvComplaints: typeCounts.CCTV || 0,
      dailyData,
      kpis,
      statusDistribution: distributions.status,
      typeDistribution: distributions.type,
      priorityDistribution: additionalData.priorityDistribution,
      topIssueTypes: additionalData.topIssueTypes,
      engineerPerformance: additionalData.engineerPerformance,
      recentActivity: additionalData.recentActivity
    };
  };

  const analytics = calculateAnalytics();

  // Chart data using real API data
  const statusData = analytics.statusDistribution.map((item: any) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: item.status === 'pending' ? '#ef4444' :
      item.status === 'assigned' ? '#f59e0b' :
        item.status === 'in-progress' ? '#3b82f6' :
          item.status === 'resolved' ? '#10b981' : '#6b7280'
  }));

  const priorityData = analytics.priorityDistribution.map((item: any) => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    value: item.count,
    color: item.priority === 'urgent' ? '#dc2626' :
      item.priority === 'high' ? '#ea580c' :
        item.priority === 'medium' ? '#ca8a04' : '#65a30d'
  }));

  const typeData = analytics.typeDistribution.map((item: any) => ({
    name: item.type,
    value: item.count,
    color: item.type === 'WIFI' ? '#3b82f6' : '#8b5cf6'
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'];

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating
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
              <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto dashboard-dialog">
                <DialogHeader className="sticky top-0 bg-background pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="dashboard-dialog-title text-xl sm:text-2xl">Create New Complaint</DialogTitle>
                      <p className="text-sm text-muted-foreground mt-1">Fill in the details to create a new complaint</p>
                    </div>
                  </div>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Activity className="h-3 w-3 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold dashboard-text">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="dashboard-label">Priority *</Label>
                      <Select
                        value={form.watch("priority")}
                        onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                          form.setValue("priority", value)
                        }
                      >
                        <SelectTrigger className="dashboard-select">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="dashboard-select-content">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.priority && (
                        <p className="text-sm text-red-500">{form.formState.errors.priority.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="title" className="dashboard-label">Title *</Label>
                      <Input
                        {...form.register("title")}
                        placeholder="Enter complaint title"
                        className="dashboard-input"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
                    </div>
                  </div>

                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issueType" className="dashboard-label">Issue Type *</Label>
                      <Select
                        value={form.watch("issueType")}
                        onValueChange={(value: string) => form.setValue("issueType", value)}
                      >
                        <SelectTrigger className="dashboard-select">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent className="dashboard-select-content">
                          {issueTypesLoading ? (
                            <SelectItem value="" disabled>Loading issue types...</SelectItem>
                          ) : wifiIssueTypes.length === 0 ? (
                            <SelectItem value="" disabled>No issue types available</SelectItem>
                          ) : (
                            wifiIssueTypes.map((issueType: any) => (
                              <SelectItem key={issueType._id} value={issueType.name}>
                                {issueType.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.issueType && (
                        <p className="text-sm text-red-500">{form.formState.errors.issueType.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="issueDescription" className="dashboard-label">Description *</Label>
                      <Textarea
                        {...form.register("issueDescription")}
                        placeholder="Describe the issue in detail..."
                        rows={3}
                        className="dashboard-textarea"
                      />
                      {form.formState.errors.issueDescription && (
                        <p className="text-sm text-red-500">{form.formState.errors.issueDescription.message}</p>
                      )}
                    </div>
                    </div>
                  {/* </div> */}

                  {/* Assignment Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold dashboard-text">Assignment</h3>
                    </div>

                  {/* User Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="dashboard-label">Select User *</Label>
                      {form.watch("userId") && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => form.setValue("userId", "")}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Unselect
                        </Button>
                      )}
                    </div>
                    
                    {/* Selected User Display */}
                    {form.watch("userId") && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-200">
                                {(() => {
                                  const selectedUser = users.find((u: any) => u._id === form.watch("userId"));
                                  if (!selectedUser) return 'Selected User';
                                  
                                  const firstName = selectedUser.firstName || "";
                                  const lastName = selectedUser.lastName || "";
                                  
                                  if (firstName && lastName) {
                                    return `${firstName} ${lastName}`;
                                  } else if (firstName) {
                                    return firstName;
                                  } else if (lastName) {
                                    return lastName;
                                  } else {
                                    return 'Selected User';
                                  }
                                })()}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-400">
                                {(() => {
                                  const selectedUser = users.find((u: any) => u._id === form.watch("userId"));
                                  return selectedUser ? selectedUser.email : '';
                                })()}
                              </div>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="pl-10 dashboard-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                      {usersLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p>Loading users...</p>
                        </div>
                      ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No users available</p>
                        </div>
                      ) : (
                        users
                          .filter((user: any) => {
                            if (!userSearchQuery) return true;
                            const searchTerm = userSearchQuery.toLowerCase();
                            return (
                              user.firstName?.toLowerCase().includes(searchTerm) ||
                              user.lastName?.toLowerCase().includes(searchTerm) ||
                              user.email?.toLowerCase().includes(searchTerm) ||
                              user.phoneNumber?.toLowerCase().includes(searchTerm) ||
                              `${user.countryCode} ${user.phoneNumber}`.toLowerCase().includes(searchTerm)
                            );
                          })
                          .map((user: any) => (
                            <div
                              key={user._id}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                                form.watch("userId") === user._id 
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => form.setValue("userId", user._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium dashboard-text">
                                      {(() => {
                                        const firstName = user.firstName || "";
                                        const lastName = user.lastName || "";
                                        
                                        if (firstName && lastName) {
                                          return `${firstName} ${lastName}`;
                                        } else if (firstName) {
                                          return firstName;
                                        } else if (lastName) {
                                          return lastName;
                                        } else {
                                          return 'Unknown User';
                                        }
                                      })()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium dashboard-text">
                                    Customer
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {user.countryCode} {user.phoneNumber}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                      {users.filter((user: any) => {
                        if (!userSearchQuery) return false;
                        const searchTerm = userSearchQuery.toLowerCase();
                        return (
                          user.firstName?.toLowerCase().includes(searchTerm) ||
                          user.lastName?.toLowerCase().includes(searchTerm) ||
                          user.email?.toLowerCase().includes(searchTerm) ||
                          user.phoneNumber?.toLowerCase().includes(searchTerm) ||
                          `${user.countryCode} ${user.phoneNumber}`.toLowerCase().includes(searchTerm)
                        );
                      }).length === 0 && userSearchQuery && !usersLoading && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No users found matching "{userSearchQuery}"</p>
                          </div>
                        )}
                    </div>
                    {form.formState.errors.userId && (
                      <p className="text-sm text-red-500">{form.formState.errors.userId.message}</p>
                    )}
                  </div>

                  {/* Engineer Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="dashboard-label">Select Engineer (Optional)</Label>
                      {form.watch("engineerId") && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => form.setValue("engineerId", "")}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Unselect
                        </Button>
                      )}
                    </div>
                    
                    {/* Selected Engineer Display */}
                    {form.watch("engineerId") && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-blue-800 dark:text-blue-200">
                                {(() => {
                                  const selectedEngineer = engineers.find((e: any) => e._id === form.watch("engineerId"));
                                  if (!selectedEngineer) return 'Selected Engineer';
                                  
                                  const firstName = selectedEngineer.firstName || "";
                                  const lastName = selectedEngineer.lastName || "";
                                  
                                  if (firstName && lastName) {
                                    return `${firstName} ${lastName}`;
                                  } else if (firstName) {
                                    return firstName;
                                  } else if (lastName) {
                                    return lastName;
                                  } else {
                                    return 'Selected Engineer';
                                  }
                                })()}
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                {(() => {
                                  const selectedEngineer = engineers.find((e: any) => e._id === form.watch("engineerId"));
                                  return selectedEngineer ? selectedEngineer.email : '';
                                })()}
                              </div>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    )}

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
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                      {engineersLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p>Loading engineers...</p>
                        </div>
                      ) : engineers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No engineers available</p>
                        </div>
                      ) : (
                        engineers
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
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                                form.watch("engineerId") === engineer._id 
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => form.setValue("engineerId", engineer._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium dashboard-text">
                                      {(() => {
                                        const firstName = engineer.firstName || "";
                                        const lastName = engineer.lastName || "";
                                        
                                        if (firstName && lastName) {
                                          return `${firstName} ${lastName}`;
                                        } else if (firstName) {
                                          return firstName;
                                        } else if (lastName) {
                                          return lastName;
                                        } else {
                                          return 'Unknown Engineer';
                                        }
                                      })()}
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
                              <div className="mt-1 text-xs text-muted-foreground">
                                Role: {engineer.role}
                              </div>
                            </div>
                          ))
                      )}
                      {engineers.filter((engineer: any) => {
                        if (!engineerSearchQuery) return false;
                        const searchTerm = engineerSearchQuery.toLowerCase();
                        return (
                          engineer.firstName?.toLowerCase().includes(searchTerm) ||
                          engineer.lastName?.toLowerCase().includes(searchTerm) ||
                          engineer.email?.toLowerCase().includes(searchTerm) ||
                          engineer.phoneNumber?.toLowerCase().includes(searchTerm)
                        );
                      }).length === 0 && engineerSearchQuery && !engineersLoading && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No engineers found matching "{engineerSearchQuery}"</p>
                          </div>
                        )}
                    </div>
                    {form.formState.errors.engineerId && (
                      <p className="text-sm text-red-500">{form.formState.errors.engineerId.message}</p>
                    )}
                  </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <FileText className="h-3 w-3 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold dashboard-text">Details & Attachments</h3>
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <Label className="dashboard-label">Attachments (Optional - Max 4 files)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="text-center">
                          <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload images or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG, GIF up to 4 files
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* File Previews */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <img
                                src={filePreviewUrls[index]}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {form.formState.errors.attachments && (
                      <p className="text-sm text-red-500">{form.formState.errors.attachments.message}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
                      }}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="dashboard-primary-button px-6" 
                      disabled={isCreatingComplaint}
                    >
                      {isCreatingComplaint ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Complaint
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Complaints and Analytics Tabs */}
        <Tabs defaultValue="complaints" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Complaints
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {complaintDashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                          <p className="text-2xl font-bold dashboard-text">{analytics.kpis.totalComplaints.value}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {analytics.kpis.totalComplaints.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${analytics.kpis.totalComplaints.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {analytics.kpis.totalComplaints.change}% from last month
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                          <p className="text-2xl font-bold dashboard-text">{analytics.kpis.resolutionRate.value}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {analytics.kpis.resolutionRate.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${analytics.kpis.resolutionRate.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {analytics.kpis.resolutionRate.change}% from last month
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                          <p className="text-2xl font-bold dashboard-text">{analytics.kpis.avgResolutionTime.value}h</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Timer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {analytics.kpis.avgResolutionTime.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={`text-sm ${analytics.kpis.avgResolutionTime.trend === 'up' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {analytics.kpis.avgResolutionTime.change}h from last month
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                          <p className="text-2xl font-bold dashboard-text">{analytics.kpis.pendingIssues.value}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {analytics.kpis.pendingIssues.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={`text-sm ${analytics.kpis.pendingIssues.trend === 'up' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {analytics.kpis.pendingIssues.change}% from last month
                        </span>
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
                              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusData.map((entry: any, index: number) => (
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
                              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {typeData.map((entry: any, index: number) => (
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
                        {analytics.typeDistribution.map((type: any) => (
                          <div key={type.type} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${type.type === 'WIFI' ? 'bg-blue-100' : 'bg-purple-100'} rounded-full flex items-center justify-center text-sm font-medium`}>
                                <Activity className={`h-4 w-4 ${type.type === 'WIFI' ? 'text-blue-600' : 'text-purple-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium dashboard-text">{type.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {type.count} complaints
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium dashboard-text">{type.count}</p>
                              <p className="text-sm text-muted-foreground">
                                {type.percentage}%
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
              </>
            )}
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
                        <SelectItem value="in_progress">In Progress</SelectItem>
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
                {paginatedComplaints.map((complaint: any) => (
                  <Card key={complaint.id} className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-sm dashboard-card-title">#{formatComplaintId(complaint)}</CardTitle>
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
                          {complaint.status.replace('_', ' ').toUpperCase()}
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
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {complaint.phoneNumber}
                        </div>
                      </div>

                      {complaint.engineer && (
                        <div className="flex items-center justify-between text-xs dashboard-text-muted">
                          <div className="flex items-center">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Engineer: {(() => {
                              const firstName = complaint.engineer.firstName || "";
                              const lastName = complaint.engineer.lastName || "";
                              
                              if (firstName && lastName) {
                                return `${firstName} ${lastName}`;
                              } else if (firstName) {
                                return firstName;
                              } else if (lastName) {
                                return lastName;
                              } else {
                                return 'Unknown Engineer';
                              }
                            })()}
                          </div>
                          {complaint.resolutionTimeInHours && (
                            <div className="flex items-center">
                              <Timer className="h-3 w-3 mr-1" />
                              {complaint.resolutionTimeInHours}h
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs dashboard-text-muted">
                        <div className="flex items-center">
                          <span className="mr-1">😊</span>
                          Happy Code: {complaint.otp ? (
                            <span className="font-mono font-medium">{complaint.otp}</span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </div>

                      {complaint.attachments && complaint.attachments.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-blue-600 dark:text-blue-400">
                            <FileText className="h-3 w-3 mr-1" />
                            {complaint.attachments.length} attachment{complaint.attachments.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}

                      {complaint.otpVerified !== undefined && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            {complaint.otpVerified ? (
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
                            )}
                            <span className={complaint.otpVerified ? "text-green-600" : "text-orange-600"}>
                              OTP {complaint.otpVerified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        </div>
                      )}

                      {complaint.statusHistoryCount && complaint.statusHistoryCount > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-purple-600 dark:text-purple-400">
                            <Activity className="h-3 w-3 mr-1" />
                            {complaint.statusHistoryCount} status updates
                          </div>
                        </div>
                      )}

                      {complaint.latestStatusChange && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Last: {complaint.latestStatusChange.status.replace('_', ' ')}
                          </div>
                          <span>{getTimeAgo(complaint.latestStatusChange.updatedAt)}</span>
                        </div>
                      )}

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
                          <th className="text-left p-4 dashboard-table-header-text">Happy Code</th>
                          <th className="text-left p-4 dashboard-table-header-text">Created</th>
                          <th className="text-left p-4 dashboard-table-header-text">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedComplaints.map((complaint: any) => (
                          <tr key={complaint.id} className="border-b dashboard-table-row hover:bg-muted/50">
                            <td className="p-4">
                              <div className="font-mono text-sm font-medium dashboard-text">
                                #{formatComplaintId(complaint)}
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
                                {complaint.attachments && complaint.attachments.length > 0 && (
                                  <div className="flex items-center mt-1 text-xs text-blue-600 dark:text-blue-400">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {complaint.attachments.length} attachment{complaint.attachments.length > 1 ? 's' : ''}
                                  </div>
                                )}
                                {complaint.otpVerified !== undefined && (
                                  <div className="flex items-center mt-1 text-xs">
                                    {complaint.otpVerified ? (
                                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                    ) : (
                                      <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
                                    )}
                                    <span className={complaint.otpVerified ? "text-green-600" : "text-orange-600"}>
                                      OTP {complaint.otpVerified ? "Verified" : "Pending"}
                                    </span>
                                  </div>
                                )}

                                {complaint.statusHistoryCount && complaint.statusHistoryCount > 0 && (
                                  <div className="flex items-center mt-1 text-xs text-purple-600 dark:text-purple-400">
                                    <Activity className="h-3 w-3 mr-1" />
                                    {complaint.statusHistoryCount} status updates
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${getPriorityColor(complaint.priority)} font-medium`}>
                                {complaint.priority.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={`${getStatusColor(complaint.status, !!complaint.engineer)} font-medium`}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                {complaint.engineer ? (
                                  <>
                                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-white">
                                        {(() => {
                                          const firstName = complaint.engineer.firstName || "";
                                          const lastName = complaint.engineer.lastName || "";
                                          
                                          if (firstName && lastName) {
                                            return `${firstName[0]}${lastName[0]}`;
                                          } else if (firstName) {
                                            return firstName[0];
                                          } else if (lastName) {
                                            return lastName[0];
                                          } else {
                                            return "E";
                                          }
                                        })()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium dashboard-text">
                                        {(() => {
                                          const firstName = complaint.engineer.firstName || "";
                                          const lastName = complaint.engineer.lastName || "";
                                          
                                          if (firstName && lastName) {
                                            return `${firstName} ${lastName}`;
                                          } else if (firstName) {
                                            return firstName;
                                          } else if (lastName) {
                                            return lastName;
                                          } else {
                                            return 'Unknown Engineer';
                                          }
                                        })()}
                                      </span>
                                      <div className="text-xs text-muted-foreground">
                                        {complaint.engineer.email}
                                      </div>
                                      {complaint.resolutionTimeInHours && (
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                          <Timer className="h-3 w-3 inline mr-1" />
                                          {complaint.resolutionTimeInHours}h
                                        </div>
                                      )}
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
                              <div className="text-sm font-medium dashboard-text flex items-center">
                                {complaint.otp ? (
                                  <span className="flex items-center gap-1">
                                    <span>😊</span>
                                    <span className="font-mono">{complaint.otp}</span>
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
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
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto dashboard-dialog pr-4">
            <DialogHeader className="sticky top-0 bg-background pb-4 border-b pr-8">
              <DialogTitle className="dashboard-dialog-title text-lg sm:text-xl">Complaint Details</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Complaint ID</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono dashboard-text text-sm sm:text-base break-all">#{formatComplaintId(selectedComplaint)}</p>
                      {selectedComplaint.id && selectedComplaint.id !== formatComplaintId(selectedComplaint) && (
                        <Badge variant="outline" className="text-xs">
                          {selectedComplaint.id}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(selectedComplaint.status, !!selectedComplaint.engineer)} font-medium text-xs sm:text-sm`}>
                        {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {selectedComplaint.resolved !== undefined && (
                        <Badge className={selectedComplaint.resolved ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"}>
                          {selectedComplaint.resolved ? "Resolved" : "Not Resolved"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Customer</Label>
                    <p className="dashboard-text text-sm sm:text-base break-words">{getCustomerName(selectedComplaint)}</p>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Priority</Label>
                    <Badge className={`${getPriorityColor(selectedComplaint.priority)} font-medium text-xs sm:text-sm`}>
                      {selectedComplaint.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Type</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 font-medium text-xs sm:text-sm">
                        {selectedComplaint.type}
                      </Badge>
                      {selectedComplaint.isReComplaint && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 font-medium text-xs sm:text-sm">
                          Re-Complaint
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Issue Type ID</Label>
                    <p className="font-mono dashboard-text text-sm sm:text-base break-all text-muted-foreground">
                      {selectedComplaint.issueType || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Status Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: selectedComplaint.statusColor || '#6b7280' }}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {selectedComplaint.statusColor || '#6b7280'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Phone Number</Label>
                    <p className="dashboard-text text-sm sm:text-base flex items-center">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="break-all">{selectedComplaint.phoneNumber}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Happy Code 😊</Label>
                    <div className="flex items-center gap-2">
                      {selectedComplaint.otp ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">😊</span>
                          <span className="font-mono dashboard-text text-lg font-bold bg-yellow-50 dark:bg-yellow-950/20 px-3 py-1 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            {selectedComplaint.otp}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="dashboard-label text-sm sm:text-base mb-2 block">Issue Title</Label>
                  <p className="dashboard-text text-sm sm:text-base break-words">{selectedComplaint.title}</p>
                </div>

                <div>
                  <Label className="dashboard-label text-sm sm:text-base mb-2 block">Description</Label>
                  <p className="dashboard-text text-sm sm:text-base break-words leading-relaxed">{selectedComplaint.issueDescription}</p>
                </div>

                {selectedComplaint.remark && (
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Additional Remarks</Label>
                    <p className="dashboard-text text-sm sm:text-base break-words leading-relaxed bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      {selectedComplaint.remark}
                    </p>
                  </div>
                )}



                {selectedComplaint.engineer && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-3 flex items-center text-sm sm:text-base">
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                      Assigned Engineer
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Engineer Name</Label>
                        <p className="dashboard-text text-sm sm:text-base break-words">
                          {(() => {
                            const firstName = selectedComplaint.engineer.firstName || "";
                            const lastName = selectedComplaint.engineer.lastName || "";
                            
                            if (firstName && lastName) {
                              return `${firstName} ${lastName}`;
                            } else if (firstName) {
                              return firstName;
                            } else if (lastName) {
                              return lastName;
                            } else {
                              return 'Unknown Engineer';
                            }
                          })()}
                        </p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Email</Label>
                        <p className="dashboard-text text-sm sm:text-base break-all">{selectedComplaint.engineer.email}</p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Phone</Label>
                        <p className="dashboard-text text-sm sm:text-base break-all">{selectedComplaint.engineer.phoneNumber}</p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Assigned By</Label>
                        <p className="dashboard-text text-sm sm:text-base break-words">
                          {(() => {
                            if (!selectedComplaint.assignedBy) return 'Not specified';
                            
                            const firstName = selectedComplaint.assignedBy.firstName || "";
                            const lastName = selectedComplaint.assignedBy.lastName || "";
                            
                            if (firstName && lastName) {
                              return `${firstName} ${lastName}`;
                            } else if (firstName) {
                              return firstName;
                            } else if (lastName) {
                              return lastName;
                            } else {
                              return 'Unknown User';
                            }
                          })()}
                        </p>
                      </div>
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Assigned By Email</Label>
                        <p className="dashboard-text text-sm sm:text-base break-all text-muted-foreground">
                          {selectedComplaint.assignedBy?.email || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Created</Label>
                    <p className="dashboard-text text-sm sm:text-base flex items-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{getTimeAgo(selectedComplaint.createdAt)}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Last Updated</Label>
                    <p className="dashboard-text text-sm sm:text-base flex items-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{getTimeAgo(selectedComplaint.updatedAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Summary Statistics */}
                <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center text-sm sm:text-base">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                    Summary Statistics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold dashboard-text">{selectedComplaint.attachmentCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Attachments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold dashboard-text">{selectedComplaint.statusHistoryCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Status Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold dashboard-text">{selectedComplaint.resolutionAttachmentCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Resolution Files</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold dashboard-text">{selectedComplaint.resolutionTimeInHours || 0}h</div>
                      <div className="text-xs text-muted-foreground">Resolution Time</div>
                    </div>
                  </div>
                </div>

                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Attachments ({selectedComplaint.attachments.length})</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {selectedComplaint.attachments.map((attachment: string, index: number) => {
                        const fullUrl = getAttachmentUrl(attachment);
                        const fileType = getFileType(attachment);
                        const fileName = attachment.split('/').pop() || `Attachment ${index + 1}`;

                        return (
                          <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                            {fileType === 'image' && fullUrl ? (
                              <div className="space-y-3">
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                  <img
                                    src={fullUrl}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden w-full h-full flex items-center justify-center bg-muted">
                                    <div className="text-center text-muted-foreground">
                                      <Image className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-sm">Image not available</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs sm:text-sm font-medium truncate">{fileName}</span>
                                  <div className="flex gap-1 sm:gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(fullUrl, '_blank')}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(fullUrl);
                                          if (!response.ok) {
                                            throw new Error(`HTTP error! status: ${response.status}`);
                                          }
                                          const blob = await response.blob();
                                          const url = window.URL.createObjectURL(blob);
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = fileName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          window.URL.revokeObjectURL(url);

                                          toast({
                                            title: "Download Successful",
                                            description: `${fileName} has been downloaded successfully.`,
                                          });
                                        } catch (error) {
                                          console.error('Download failed:', error);
                                          toast({
                                            title: "Download Failed",
                                            description: "Failed to download the file. Opening in new tab instead.",
                                            variant: "destructive",
                                          });
                                          // Fallback to direct link
                                          window.open(fullUrl, '_blank');
                                        }
                                      }}
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                    >
                                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    {fileType === 'pdf' ? (
                                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                                    ) : fileType === 'document' ? (
                                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                    ) : (
                                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium truncate">{fileName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{fileType} file</p>
                                  </div>
                                </div>
                                <div className="flex gap-1 sm:gap-2">
                                  {fullUrl && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(fullUrl, '_blank')}
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                      >
                                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(fullUrl);
                                            if (!response.ok) {
                                              throw new Error(`HTTP error! status: ${response.status}`);
                                            }
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = fileName;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);

                                            toast({
                                              title: "Download Successful",
                                              description: `${fileName} has been downloaded successfully.`,
                                            });
                                          } catch (error) {
                                            console.error('Download failed:', error);
                                            toast({
                                              title: "Download Failed",
                                              description: "Failed to download the file. Opening in new tab instead.",
                                              variant: "destructive",
                                            });
                                            // Fallback to direct link
                                            window.open(fullUrl, '_blank');
                                          }
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status History Section */}
                {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 && (
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Status History ({selectedComplaint.statusHistory.length} entries)</Label>
                    <div className="space-y-3">
                      {formatStatusHistory(selectedComplaint.statusHistory).map((history: any, index: number) => (
                        <div key={history._id || index} className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(history.status)}
                              <Badge className={`${getStatusColor(history.status)} text-xs font-medium`}>
                                {history.statusDisplay}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{history.formattedDate}</span>
                          </div>

                          {history.remarks && (
                            <p className="text-sm dashboard-text mb-2">{history.remarks}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Updated by: {history.updatedByDisplay}</span>
                            {history.previousStatus && (
                              <span className="flex items-center gap-1">
                                <span>From:</span>
                                <Badge variant="outline" className="text-xs">
                                  {history.previousStatus.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </Badge>
                              </span>
                            )}
                          </div>

                          {/* Show additional metadata if available */}
                          {history.metadata && Object.keys(history.metadata).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {history.metadata.action && (
                                  <div>
                                    <span className="text-muted-foreground">Action:</span>
                                    <span className="ml-2 font-medium capitalize">{history.metadata.action.replace('_', ' ')}</span>
                                  </div>
                                )}
                                {history.metadata.otp && (
                                  <div>
                                    <span className="text-muted-foreground">OTP:</span>
                                    <span className="ml-2 font-mono font-medium">{history.metadata.otp}</span>
                                  </div>
                                )}
                                {history.metadata.engineerId && (
                                  <div>
                                    <span className="text-muted-foreground">Engineer ID:</span>
                                    <span className="ml-2 font-mono text-xs">{history.metadata.engineerId}</span>
                                  </div>
                                )}
                                {history.metadata.assignedById && (
                                  <div>
                                    <span className="text-muted-foreground">Assigned By:</span>
                                    <span className="ml-2 font-mono text-xs">{history.metadata.assignedById}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Show resolution attachments if available */}
                          {history.metadata?.resolutionAttachments && history.metadata.resolutionAttachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Resolution Attachments:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {history.metadata.resolutionAttachments.map((attachment: string, attIndex: number) => (
                                  <Button
                                    key={attIndex}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(attachment, '_blank')}
                                    className="h-6 text-xs p-2"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View {attIndex + 1}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show resolution notes if available */}
                          {history.metadata?.resolutionNotes && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Resolution Notes:</span>
                              </div>
                              <p className="text-xs dashboard-text">{history.metadata.resolutionNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Attachments Section */}
                {selectedComplaint.resolutionAttachments && selectedComplaint.resolutionAttachments.length > 0 && (
                  <div>
                    <Label className="dashboard-label text-sm sm:text-base mb-2 block">Resolution Attachments ({selectedComplaint.resolutionAttachments.length})</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {selectedComplaint.resolutionAttachments.map((attachment: string, index: number) => (
                        <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Image className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium truncate">Resolution File {index + 1}</p>
                                <p className="text-xs text-muted-foreground">Resolution attachment</p>
                              </div>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment, '_blank')}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(attachment);
                                    if (!response.ok) {
                                      throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `resolution_${index + 1}.jpg`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);

                                    toast({
                                      title: "Download Successful",
                                      description: `Resolution file ${index + 1} has been downloaded successfully.`,
                                    });
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    toast({
                                      title: "Download Failed",
                                      description: "Failed to download the file. Opening in new tab instead.",
                                      variant: "destructive",
                                    });
                                    window.open(attachment, '_blank');
                                  }
                                }}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information Section */}
                {(selectedComplaint.otp || selectedComplaint.resolutionDate || selectedComplaint.resolutionTimeInHours) && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-3 flex items-center text-sm sm:text-base">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                      Resolution Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {selectedComplaint.otp && (
                        <div>
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">OTP</Label>
                          <p className="font-mono dashboard-text text-sm sm:text-base">{selectedComplaint.otp}</p>
                        </div>
                      )}
                      {selectedComplaint.resolutionDate && (
                        <div>
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Resolution Date</Label>
                          <p className="dashboard-text text-sm sm:text-base">
                            {new Date(selectedComplaint.resolutionDate).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      {selectedComplaint.resolutionTimeInHours && (
                        <div>
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Resolution Time</Label>
                          <p className="dashboard-text text-sm sm:text-base">{selectedComplaint.resolutionTimeInHours} hours</p>
                        </div>
                      )}
                      {selectedComplaint.otpVerified !== undefined && (
                        <div>
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">OTP Verified</Label>
                          <Badge className={selectedComplaint.otpVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedComplaint.otpVerified ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                      {selectedComplaint.otpVerifiedAt && (
                        <div>
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">OTP Verified At</Label>
                          <p className="dashboard-text text-sm sm:text-base">
                            {new Date(selectedComplaint.otpVerifiedAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      {selectedComplaint.__v !== undefined && (
                        <div>
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Version</Label>
                          <p className="font-mono dashboard-text text-sm sm:text-base text-muted-foreground">
                            {selectedComplaint.__v}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Latest Status Change Section */}
                {selectedComplaint.latestStatusChange && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium mb-3 flex items-center text-sm sm:text-base">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-600 flex-shrink-0" />
                      Latest Status Change
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Status</Label>
                        <Badge className={`${getStatusColor(selectedComplaint.latestStatusChange.status)} font-medium text-xs sm:text-sm`}>
                          {selectedComplaint.latestStatusChange.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Updated At</Label>
                        <p className="dashboard-text text-sm sm:text-base">
                          {getTimeAgo(selectedComplaint.latestStatusChange.updatedAt)}
                        </p>
                      </div>
                      {selectedComplaint.latestStatusChange.remarks && (
                        <div className="sm:col-span-2">
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Remarks</Label>
                          <p className="dashboard-text text-sm sm:text-base">
                            {selectedComplaint.latestStatusChange.remarks}
                          </p>
                        </div>
                      )}
                      {selectedComplaint.latestStatusChange.updatedBy && (
                        <div className="sm:col-span-2">
                          <Label className="dashboard-label text-xs sm:text-sm mb-2 block">Updated By</Label>
                          <p className="dashboard-text text-sm sm:text-base">
                            {(() => {
                              if (!selectedComplaint.latestStatusChange.updatedBy) return 'Unknown User';
                              
                              const firstName = selectedComplaint.latestStatusChange.updatedBy.firstName || "";
                              const lastName = selectedComplaint.latestStatusChange.updatedBy.lastName || "";
                              
                              let name = '';
                              if (firstName && lastName) {
                                name = `${firstName} ${lastName}`;
                              } else if (firstName) {
                                name = firstName;
                              } else if (lastName) {
                                name = lastName;
                              } else {
                                name = 'Unknown User';
                              }
                              
                              return `${name} (${selectedComplaint.latestStatusChange.updatedBy.email})`;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata Section */}
                <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center text-sm sm:text-base">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-600 flex-shrink-0" />
                    System Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">MongoDB ID:</span>
                      <span className="ml-2 font-mono break-all">{selectedComplaint._id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2">{new Date(selectedComplaint.updatedAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <span className="ml-2 font-mono">{selectedComplaint.__v || 0}</span>
                    </div>
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
              <DialogTitle className="dashboard-dialog-title">Reassign Engineer</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Reassign this complaint to a different engineer
              </p>
            </DialogHeader>
            <div className="space-y-6">
              {selectedComplaint && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Complaint Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <span className="ml-2 font-mono">#{formatComplaintId(selectedComplaint)}</span>
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
                    {selectedComplaint.engineer && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Current Engineer:</span>
                          <span className="ml-2">
                            {(() => {
                              const firstName = selectedComplaint.engineer.firstName || "";
                              const lastName = selectedComplaint.engineer.lastName || "";
                              
                              if (firstName && lastName) {
                                return `${firstName} ${lastName}`;
                              } else if (firstName) {
                                return firstName;
                              } else if (lastName) {
                                return lastName;
                              } else {
                                return 'Unknown Engineer';
                              }
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2">{selectedComplaint.engineer.email}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="dashboard-label">Select New Engineer</Label>
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
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${selectedEngineerId === engineer._id ? 'border-primary bg-primary/5' : 'border-border'
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
                                {(() => {
                                  const firstName = engineer.firstName || "";
                                  const lastName = engineer.lastName || "";
                                  
                                  if (firstName && lastName) {
                                    return `${firstName} ${lastName}`;
                                  } else if (firstName) {
                                    return firstName;
                                  } else if (lastName) {
                                    return lastName;
                                  } else {
                                    return 'Unknown Engineer';
                                  }
                                })()}
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
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedEngineerId("");
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedEngineerId) {
                      const selectedEngineer = engineers.find((engineer: any) => engineer._id === selectedEngineerId);
                      if (selectedEngineer) {
                        toast({
                          title: "Success",
                          description: `Engineer reassigned to ${selectedEngineer.firstName} ${selectedEngineer.lastName}`,
                        });
                        setIsEditDialogOpen(false);
                        setSelectedEngineerId("");
                        setSelectedComplaint(null);
                      }
                    }
                  }}
                  disabled={!selectedEngineerId}
                  className="dashboard-primary-button"
                >
                  Reassign Engineer
                </Button>
              </div>
            </div>
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
                      <span className="ml-2 font-mono">#{formatComplaintId(selectedComplaint)}</span>
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
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${selectedEngineerId === engineer._id ? 'border-primary bg-primary/5' : 'border-border'
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
                                  {(() => {
                                    const firstName = engineer.firstName || "";
                                    const lastName = engineer.lastName || "";
                                    
                                    if (firstName && lastName) {
                                      return `${firstName} ${lastName}`;
                                    } else if (firstName) {
                                      return firstName;
                                    } else if (lastName) {
                                      return lastName;
                                    } else {
                                      return 'Unknown Engineer';
                                    }
                                  })()}
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