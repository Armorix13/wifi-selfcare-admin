import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { generateDummyComplaints, generateDummyEngineers, generateDummyCustomers, type Complaint } from "@/lib/dummyData";

// Local type definitions
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
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const itemsPerPage = 5;

  const { toast } = useToast();

  // Load dummy data
  const [complaints, setComplaints] = useState(generateDummyComplaints());
  const engineers = generateDummyEngineers();
  const customers = generateDummyCustomers();

  const isLoading = false;

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
  });

  // Simple state management functions (no API calls)
  const onSubmit = (data: InsertComplaint) => {
    const newComplaint: Complaint = {
      id: Math.max(...complaints.map(c => c.id)) + 1,
      title: data.category + " Issue",
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

  const onEditSubmit = (data: InsertComplaint) => {
    const updatedComplaints = complaints.map(complaint => 
      complaint.id === selectedComplaint.id 
        ? { 
            ...complaint, 
            ...data,
            customerName: customers.find(c => c.id === data.customerId)?.name || "Unknown",
            engineerName: data.engineerId ? engineers.find(e => e.id === data.engineerId)?.name || null : null,
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
  };

  const handleDelete = (complaint: any) => {
    setComplaints(complaints.filter(c => c.id !== complaint.id));
    toast({
      title: "Success",
      description: "Complaint deleted successfully",
    });
  };

  const handleAssignEngineer = () => {
    if (!selectedEngineerId || !selectedComplaint) return;
    
    const updatedComplaints = complaints.map(complaint => 
      complaint.id === selectedComplaint.id 
        ? { 
            ...complaint, 
            engineerId: parseInt(selectedEngineerId),
            engineerName: engineers.find(e => e.id === parseInt(selectedEngineerId))?.name || null,
            status: "assigned",
            updatedAt: new Date().toISOString()
          }
        : complaint
    );
    setComplaints(updatedComplaints);
    toast({
      title: "Success",
      description: "Complaint assigned successfully",
    });
    setIsAssignDialogOpen(false);
    setSelectedEngineerId("");
  };

  const handleView = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (complaint: any) => {
    setSelectedComplaint(complaint);
    editForm.reset({
      title: complaint.title,
      description: complaint.description,
      priority: complaint.priority,
      location: complaint.location,
      customerId: complaint.customerId,
      engineerId: complaint.engineerId,
      status: complaint.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleAssign = (complaint: any) => {
    setSelectedComplaint(complaint);
    setSelectedEngineerId("");
    setIsAssignDialogOpen(true);
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c: any) => c.id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getEngineerName = (engineerId: number | null) => {
    if (!engineerId) return null;
    const engineer = engineers.find((e: any) => e.id === engineerId);
    return engineer?.name || "Unknown Engineer";
  };

  const filteredComplaints = complaints.filter((complaint: any) => {
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

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

  // Pagination calculations
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

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

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm font-medium text-foreground">
          #{value}
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {getCustomerName(row.customerId)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {row.location}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: "Issue",
      render: (value: string, row: any) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-foreground truncate">
            {value}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {row.description}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: string) => (
        <Badge className={`${getPriorityColor(value)} font-medium`}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge className={`${getStatusColor(value)} font-medium`}>
          {value.replace('-', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "engineer",
      label: "Engineer",
      render: (value: any, row: any) => {
        const engineerName = getEngineerName(row.engineerId);
        return (
          <div className="flex items-center space-x-2">
            {engineerName ? (
              <>
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {engineerName.split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {engineerName}
                </span>
              </>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Unassigned
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) => (
        <div className="text-sm text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {getTimeAgo(value)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-1">
          {row.status === "pending" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAssign(row)}
              className="text-purple-600 hover:text-purple-900 hover:bg-purple-50"
            >
              <User className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-900 hover:bg-green-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-900 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this complaint? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(row)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Complaint Management">
        <div className="animate-pulse space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Complaint Management">
      <div className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                  <p className="text-2xl font-bold text-foreground">{complaints.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">
                    {complaints.filter((c: any) => c.status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {complaints.length > 0 
                      ? `${Math.round((complaints.filter((c: any) => c.status === "pending").length / complaints.length) * 100)}%` 
                      : '0%'} of total
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {complaints.filter((c: any) => ["assigned", "in-progress", "visited"].includes(c.status)).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active cases
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-foreground">
                    {complaints.filter((c: any) => c.status === "resolved").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {complaints.length > 0 
                      ? `${Math.round((complaints.filter((c: any) => c.status === "resolved").length / complaints.length) * 100)}%` 
                      : '0%'} success rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority & Location Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['urgent', 'high', 'medium', 'low'].map(priority => {
                const count = complaints.filter((c: any) => c.priority === priority).length;
                const percentage = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getPriorityColor(priority)}>{priority.toUpperCase()}</Badge>
                      <span className="text-sm text-foreground">{count} complaints</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${priority === 'urgent' ? 'bg-red-500' : priority === 'high' ? 'bg-orange-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Location Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Mumbai Central', 'Delhi NCR', 'Bangalore', 'Chennai'].map(location => {
                const locationComplaints = complaints.filter((c: any) => c.location === location);
                const count = locationComplaints.length;
                const resolvedCount = locationComplaints.filter((c: any) => c.status === 'resolved').length;
                const percentage = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
                return (
                  <div key={location} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{location}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{count} total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{resolvedCount}/{count} resolved</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Complaint Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage customer complaints efficiently
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Complaint</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter complaint title"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter complaint description"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={form.watch("priority")}
                    onValueChange={(value) => form.setValue("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.priority && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.priority.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    {...form.register("location")}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerId">Customer</Label>
                  <Select
                    value={form.watch("customerId")?.toString()}
                    onValueChange={(value) => form.setValue("customerId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.customerId && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerId.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Complaint
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and View Toggle */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search complaints..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        resetPagination();
                      }}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); resetPagination(); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="visited">Visited</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="not-resolved">Not Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={(value) => { setPriorityFilter(value); resetPagination(); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={locationFilter} onValueChange={(value) => { setLocationFilter(value); resetPagination(); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                      <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("card")}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Complaints ({filteredComplaints.length})
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {viewMode === "table" ? (
              <div className="px-6">
                <DataTable columns={columns} data={paginatedComplaints} />
              </div>
            ) : (
              <div className="px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paginatedComplaints.map((complaint: any) => (
                    <Card key={complaint.id} className="border border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  #{complaint.id}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground truncate">
                                  {complaint.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {getCustomerName(complaint.customerId)}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Badge className={getPriorityColor(complaint.priority)}>
                                {complaint.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {complaint.description}
                          </p>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{complaint.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{getTimeAgo(complaint.createdAt)}</span>
                            </div>
                          </div>

                          {/* Status and Engineer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(complaint.status)}>
                                {complaint.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                              {complaint.rating && (
                                <div className="flex items-center space-x-1">
                                  {renderStars(complaint.rating)}
                                  <span className="text-xs text-muted-foreground">
                                    ({complaint.rating}/5)
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getEngineerName(complaint.engineerId) || "Unassigned"}
                            </div>
                          </div>

                          {/* Engineer Assignment Info */}
                          {complaint.status === "assigned" && complaint.engineerId && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {getEngineerName(complaint.engineerId)?.split(" ").map((n: string) => n[0]).join("")}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-blue-900">
                                    Assigned to: {getEngineerName(complaint.engineerId)}
                                  </p>
                                  <p className="text-xs text-blue-600">Engineer assigned</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end space-x-2 pt-2 border-t border-border/50">
                            {complaint.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssign(complaint)}
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              >
                                <User className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(complaint)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(complaint)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                                  <AlertDialogDescription>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Complaint ID</Label>
                  <p className="text-sm font-mono">#{selectedComplaint.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedComplaint.status)}>
                    {selectedComplaint.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                  <p className="text-sm">{getCustomerName(selectedComplaint.customerId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-sm">{selectedComplaint.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Engineer</Label>
                  <p className="text-sm">{getEngineerName(selectedComplaint.engineerId) || "Unassigned"}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                <p className="text-sm font-medium mt-1">{selectedComplaint.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedComplaint.description}</p>
              </div>
              
              {selectedComplaint.resolution && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
                  <p className="text-sm mt-1">{selectedComplaint.resolution}</p>
                </div>
              )}
              
              {selectedComplaint.rating && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(selectedComplaint.rating)}
                    <span className="text-sm">({selectedComplaint.rating}/5)</span>
                  </div>
                </div>
              )}
              
              {selectedComplaint.feedback && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Feedback</Label>
                  <p className="text-sm mt-1">{selectedComplaint.feedback}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>
                {selectedComplaint.resolvedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Resolved</Label>
                    <p className="text-sm">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter complaint title"
                {...editForm.register("title")}
              />
              {editForm.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter complaint description"
                {...editForm.register("description")}
              />
              {editForm.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.description.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editForm.watch("priority")}
                onValueChange={(value) => editForm.setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              {editForm.formState.errors.priority && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.priority.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="Enter location"
                {...editForm.register("location")}
              />
              {editForm.formState.errors.location && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.location.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.watch("status")}
                onValueChange={(value) => editForm.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="visited">Visited</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="not-resolved">Not Resolved</SelectItem>
                </SelectContent>
              </Select>
              {editForm.formState.errors.status && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.status.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-engineer">Engineer</Label>
              <Select
                value={editForm.watch("engineerId")?.toString() || "unassigned"}
                onValueChange={(value) => editForm.setValue("engineerId", value === "unassigned" ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {engineers.map((engineer: any) => (
                    <SelectItem key={engineer.id} value={engineer.id.toString()}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm.formState.errors.engineerId && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.engineerId.message}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Complaint
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Engineer</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-foreground">Complaint Details</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedComplaint.title}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedComplaint.location}
                  </span>
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label htmlFor="engineer-select">Select Engineer</Label>
                <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineers
                      .filter((engineer: any) => engineer.isActive)
                      .map((engineer: any) => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {engineer.name.split(" ").map((n: string) => n[0]).join("")}
                              </span>
                            </div>
                            <span>{engineer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({engineer.location})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignEngineer}
                  disabled={!selectedEngineerId}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Assign Engineer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}