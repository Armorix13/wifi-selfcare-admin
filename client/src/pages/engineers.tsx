import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MapPin, Phone, Mail, Star, Edit, Trash2, Search, Filter, Grid, List, Eye, Settings, Activity, Users, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Local type definitions
const insertEngineerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(1, "Location is required"),
  specialization: z.string().min(1, "Specialization is required"),
  rating: z.number().min(0).max(5).default(4.0),
  completedJobs: z.number().min(0).default(0),
  activeJobs: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type InsertEngineer = z.infer<typeof insertEngineerSchema>;

// Engineer data type
type EngineerData = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialization: string;
  rating: number;
  completedJobs: number;
  activeJobs: number;
  isActive: boolean;
  createdAt: string;
};

// Dummy engineer data
const initialEngineers: EngineerData[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+91 98765 43210",
    location: "Mumbai",
    specialization: "Fiber Installation",
    rating: 4.8,
    completedJobs: 156,
    activeJobs: 3,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@company.com",
    phone: "+91 87654 32109",
    location: "Delhi",
    specialization: "Network Troubleshooting",
    rating: 4.9,
    completedJobs: 203,
    activeJobs: 5,
    isActive: true,
    createdAt: "2023-11-20T10:00:00Z",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@company.com",
    phone: "+91 76543 21098",
    location: "Bangalore",
    specialization: "Router Configuration",
    rating: 4.6,
    completedJobs: 89,
    activeJobs: 2,
    isActive: true,
    createdAt: "2024-02-10T10:00:00Z",
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha.patel@company.com",
    phone: "+91 65432 10987",
    location: "Pune",
    specialization: "WiFi Setup",
    rating: 4.7,
    completedJobs: 134,
    activeJobs: 4,
    isActive: false,
    createdAt: "2023-12-05T10:00:00Z",
  },
  {
    id: 5,
    name: "Rajesh Singh",
    email: "rajesh.singh@company.com",
    phone: "+91 54321 09876",
    location: "Chennai",
    specialization: "Cable Installation",
    rating: 4.5,
    completedJobs: 98,
    activeJobs: 1,
    isActive: true,
    createdAt: "2024-01-28T10:00:00Z",
  },
];

export default function Engineers() {
  const [engineers, setEngineers] = useState<EngineerData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerData | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;
  
  const { toast } = useToast();

  // Initialize with dummy data
  useEffect(() => {
    setEngineers(initialEngineers);
  }, []);

  const form = useForm<Omit<EngineerData, 'id' | 'createdAt'>>({
    resolver: zodResolver(insertEngineerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      specialization: "",
      rating: 4.0,
      completedJobs: 0,
      activeJobs: 0,
      isActive: true,
    },
  });

  const editForm = useForm<Omit<EngineerData, 'id' | 'createdAt'>>({
    resolver: zodResolver(insertEngineerSchema),
  });

  const onSubmit = (data: Omit<EngineerData, 'id' | 'createdAt'>) => {
    const newEngineer: EngineerData = {
      ...data,
      id: Math.max(...engineers.map(e => e.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    
    setEngineers(prev => [...prev, newEngineer]);
    toast({
      title: "Success",
      description: "Engineer added successfully",
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const onEditSubmit = (data: Omit<EngineerData, 'id' | 'createdAt'>) => {
    if (selectedEngineer) {
      setEngineers(prev => prev.map(engineer => 
        engineer.id === selectedEngineer.id 
          ? { ...data, id: selectedEngineer.id, createdAt: selectedEngineer.createdAt }
          : engineer
      ));
      toast({
        title: "Success",
        description: "Engineer updated successfully",
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleView = (engineer: EngineerData) => {
    console.log("Viewing engineer:", engineer);
    setSelectedEngineer(engineer);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (engineer: EngineerData) => {
    console.log("Editing engineer:", engineer);
    setSelectedEngineer(engineer);
    editForm.reset({
      name: engineer.name,
      email: engineer.email,
      phone: engineer.phone,
      location: engineer.location,
      specialization: engineer.specialization,
      rating: engineer.rating,
      completedJobs: engineer.completedJobs,
      activeJobs: engineer.activeJobs,
      isActive: engineer.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    console.log("Deleting engineer with id:", id);
    setEngineers(prev => prev.filter(engineer => engineer.id !== id));
    toast({
      title: "Success",
      description: "Engineer deleted successfully",
    });
  };

  const filteredEngineers = engineers.filter((engineer: any) => {
    const matchesSearch = !searchQuery || 
      engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    return (
      matchesSearch &&
      (!locationFilter || locationFilter === "all" || engineer.location === locationFilter) &&
      (!statusFilter || statusFilter === "all" || (statusFilter === 'active' ? engineer.isActive : !engineer.isActive)) &&
      (!specializationFilter || specializationFilter === "all" || engineer.specialization === specializationFilter)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEngineers = filteredEngineers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-yellow-600", "bg-red-600"];
    return colors[index % colors.length];
  };

  const renderStars = (rating: number) => {
    const stars = Math.floor(rating); // Use rating directly (already in 5-star scale)
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < stars ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const tableColumns = [
    {
      key: "name",
      label: "Engineer",
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${getAvatarColor(row.id)} rounded-full flex items-center justify-center`}>
            <span className="text-sm font-medium text-white">
              {getInitials(value)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{row.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (value: any, row: any) => (
        <div className="space-y-1">
          <div className="text-sm text-foreground flex items-center">
            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
            {row.email}
          </div>
          <div className="text-sm text-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
            {row.phone}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (value: string) => (
        <div className="text-sm text-foreground flex items-center">
          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "performance",
      label: "Performance",
      render: (value: any, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">
              {row.rating.toFixed(1)}
            </span>
            {renderStars(row.rating)}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.completedJobs} completed • {row.activeJobs} active
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: any, row: any) => (
        <Badge className={row.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleView(row)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEdit(row)}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950/30"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Engineer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this engineer? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(row.id)}>
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
      <MainLayout title="Engineer Management">
        <div className="animate-pulse space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="h-20 bg-slate-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Engineer Management">
      <div className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Engineers</p>
                  <p className="text-2xl font-bold text-foreground">{engineers.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Registered</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Engineers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {engineers.filter((e: any) => e.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {engineers.length > 0 
                      ? `${Math.round((engineers.filter((e: any) => e.isActive).length / engineers.length) * 100)}%` 
                      : '0%'} availability
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-foreground">
                    {engineers.length > 0 
                      ? (engineers.reduce((sum: number, e: any) => sum + (e.rating || 0), 0) / engineers.length / 10).toFixed(1)
                      : '0.0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold text-foreground">
                    {engineers.reduce((sum: number, e: any) => sum + (e.activeJobs || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {engineers.length > 0 
                      ? `${Math.round(engineers.reduce((sum: number, e: any) => sum + (e.activeJobs || 0), 0) / engineers.length)}` 
                      : '0'} avg per engineer
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specialization & Location Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Specialization Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['WiFi Installation', 'Network Troubleshooting', 'Hardware Repair', 'Fiber Optic', 'Cable Installation'].map(specialization => {
                const count = engineers.filter((e: any) => e.specialization === specialization).length;
                const percentage = engineers.length > 0 ? (count / engineers.length) * 100 : 0;
                const avgRating = count > 0 
                  ? engineers.filter((e: any) => e.specialization === specialization)
                    .reduce((sum: number, e: any) => sum + (e.rating || 0), 0) / count / 10
                  : 0;
                return (
                  <div key={specialization} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <span className="text-sm font-medium text-foreground">{specialization}</span>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-muted-foreground">{count} engineers</span>
                          {count > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{avgRating.toFixed(1)}★ avg</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
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
              <CardTitle className="text-lg font-semibold text-foreground">Location Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Mumbai Central', 'Delhi NCR', 'Bangalore', 'Chennai', 'Mumbai East'].map(location => {
                const locationEngineers = engineers.filter((e: any) => e.location === location);
                const count = locationEngineers.length;
                const activeCount = locationEngineers.filter((e: any) => e.isActive).length;
                const totalJobs = locationEngineers.reduce((sum: number, e: any) => sum + (e.activeJobs || 0), 0);
                const percentage = engineers.length > 0 ? (count / engineers.length) * 100 : 0;
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
                          className="h-full bg-green-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{activeCount}/{count} active • {totalJobs} jobs</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {engineers
                .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 5)
                .map((engineer: any, index: number) => (
                  <div key={engineer.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`w-8 h-8 ${getAvatarColor(engineer.id)} rounded-full flex items-center justify-center`}>
                      <span className="text-xs font-medium text-white">
                        {getInitials(engineer.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{engineer.name}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(engineer.rating)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {engineer.rating.toFixed(1)} • {engineer.completedJobs} jobs
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Low workload (0-3 jobs)</span>
                  <span className="text-sm font-medium text-foreground">
                    {engineers.filter((e: any) => (e.activeJobs || 0) <= 3).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Medium workload (4-6 jobs)</span>
                  <span className="text-sm font-medium text-foreground">
                    {engineers.filter((e: any) => (e.activeJobs || 0) >= 4 && (e.activeJobs || 0) <= 6).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High workload (7+ jobs)</span>
                  <span className="text-sm font-medium text-foreground">
                    {engineers.filter((e: any) => (e.activeJobs || 0) >= 7).length}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Completed</span>
                  <span className="text-lg font-bold text-foreground">
                    {engineers.reduce((sum: number, e: any) => sum + (e.completedJobs || 0), 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-foreground">Active</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {engineers.filter((e: any) => e.isActive).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-foreground">Inactive</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {engineers.filter((e: any) => !e.isActive).length}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ 
                      width: `${engineers.length > 0 ? (engineers.filter((e: any) => e.isActive).length / engineers.length) * 100 : 0}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {engineers.length > 0 
                    ? `${Math.round((engineers.filter((e: any) => e.isActive).length / engineers.length) * 100)}%` 
                    : '0%'} operational capacity
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Engineer Management</h1>
            <p className="text-muted-foreground">Manage your field engineers and their assignments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Engineer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Engineer</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter engineer name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    {...form.register("phone")}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
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
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.location.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="Enter specialization"
                    {...form.register("specialization")}
                  />
                  {form.formState.errors.specialization && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.specialization.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      placeholder="4.5"
                      {...form.register("rating", { valueAsNumber: true })}
                    />
                    {form.formState.errors.rating && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.rating.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="completedJobs">Completed Jobs</Label>
                    <Input
                      id="completedJobs"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register("completedJobs", { valueAsNumber: true })}
                    />
                    {form.formState.errors.completedJobs && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.completedJobs.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activeJobs">Active Jobs</Label>
                    <Input
                      id="activeJobs"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register("activeJobs", { valueAsNumber: true })}
                    />
                    {form.formState.errors.activeJobs && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.activeJobs.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="isActive">Status</Label>
                    <Select onValueChange={(value) => form.setValue("isActive", value === "true")} defaultValue="true">
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.isActive && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.isActive.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Adding..." : "Add Engineer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Engineers</p>
                  <p className="text-2xl font-bold text-foreground">{engineers.length}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">{engineers.filter((e: any) => e.isActive).length}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-foreground">
                    {engineers.length > 0 ? (engineers.reduce((sum: number, e: any) => sum + e.rating, 0) / engineers.length / 10).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{engineers.reduce((sum: number, e: any) => sum + e.completedJobs, 0)}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-card to-card/80 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Engineers Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search engineers..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); resetPagination(); }}
                    className="pl-10 w-64"
                  />
                </div>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Enhanced Filters */}
          <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={locationFilter} onValueChange={(value) => { setLocationFilter(value); resetPagination(); }}>
                <SelectTrigger>
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
              
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); resetPagination(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={specializationFilter} onValueChange={(value) => { setSpecializationFilter(value); resetPagination(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="WiFi Installation">WiFi Installation</SelectItem>
                  <SelectItem value="Network Troubleshooting">Network Troubleshooting</SelectItem>
                  <SelectItem value="Fiber Optic">Fiber Optic</SelectItem>
                  <SelectItem value="Cable Installation">Cable Installation</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setLocationFilter("all");
                  setStatusFilter("all");
                  setSpecializationFilter("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="bg-background hover:bg-muted"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              
              <div className="text-sm text-muted-foreground flex items-center">
                Page {currentPage} of {totalPages} • {filteredEngineers.length} total engineers
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {viewMode === 'table' ? (
              <DataTable
                data={paginatedEngineers}
                columns={tableColumns}
                searchPlaceholder="Search engineers..."
              />
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedEngineers.map((engineer: any, index: number) => (
                    <Card key={engineer.id} className="stats-card">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`h-12 w-12 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-medium">
                              {getInitials(engineer.name)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{engineer.name}</h4>
                            <p className="text-sm text-muted-foreground">{engineer.specialization}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-foreground">{engineer.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-foreground">{engineer.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-foreground">{engineer.email}</span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-border space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={engineer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {engineer.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Active Cases:</span>
                            <span className="font-medium text-foreground">{engineer.activeJobs}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-medium text-foreground">{engineer.completedJobs}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center">
                              <span className="font-medium text-foreground mr-1">
                                {engineer.rating.toFixed(1)}
                              </span>
                              {renderStars(engineer.rating)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(engineer)}
                            className="flex-1 min-w-[70px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(engineer)}
                            className="flex-1 min-w-[70px] text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950/30 border-green-200 dark:border-green-800"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 min-w-[70px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Engineer</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this engineer? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(engineer.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEngineers.length)} of {filteredEngineers.length} results
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
        </Card>
      </div>

      {/* View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Engineer Details</DialogTitle>
          </DialogHeader>
          {selectedEngineer && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 ${getAvatarColor(selectedEngineer.id)} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-lg font-medium text-white">
                    {getInitials(selectedEngineer.name)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{selectedEngineer.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedEngineer.specialization}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedEngineer.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedEngineer.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-sm">{selectedEngineer.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={selectedEngineer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {selectedEngineer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Active Jobs</Label>
                  <p className="text-sm font-medium">{selectedEngineer.activeJobs}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Completed Jobs</Label>
                  <p className="text-sm font-medium">{selectedEngineer.completedJobs}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-medium mr-2">
                    {selectedEngineer.rating.toFixed(1)}
                  </span>
                  {renderStars(selectedEngineer.rating)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Engineer</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter engineer name"
                {...editForm.register("name")}
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                {...editForm.register("email")}
              />
              {editForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                {...editForm.register("phone")}
              />
              {editForm.formState.errors.phone && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.phone.message}</p>
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
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Input
                id="edit-specialization"
                placeholder="Enter specialization"
                {...editForm.register("specialization")}
              />
              {editForm.formState.errors.specialization && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.specialization.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rating">Rating (1-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  placeholder="4.5"
                  {...editForm.register("rating", { valueAsNumber: true })}
                />
                {editForm.formState.errors.rating && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.rating.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-completedJobs">Completed Jobs</Label>
                <Input
                  id="edit-completedJobs"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...editForm.register("completedJobs", { valueAsNumber: true })}
                />
                {editForm.formState.errors.completedJobs && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.completedJobs.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-activeJobs">Active Jobs</Label>
                <Input
                  id="edit-activeJobs"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...editForm.register("activeJobs", { valueAsNumber: true })}
                />
                {editForm.formState.errors.activeJobs && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.activeJobs.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-isActive">Status</Label>
                <Select 
                  onValueChange={(value) => editForm.setValue("isActive", value === "true")}
                  defaultValue={selectedEngineer?.isActive ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {editForm.formState.errors.isActive && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.isActive.message}</p>
                )}
              </div>
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
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Updating..." : "Update Engineer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
