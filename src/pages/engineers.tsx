import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { UserPlus, MapPin, Phone, Mail, Star, Edit, Trash2, Search, Filter, Grid, List, Eye, Settings, Activity, Users, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, User, X, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useGetEngineerDashbaordDataQuery, useAddEngineerDataMutation, useUpdateEngineerDataMutation, useDeleteEngineerMutation, BASE_URL } from "@/api";

// API Response Types
interface EngineerAccountStatus {
  isDeactivated: boolean;
  isSuspended: boolean;
  isAccountVerified: boolean;
}

interface Engineer {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  status?: string;
  group?: string;
  zone?: string;
  area?: string;
  mode?: string;
  permanentAddress?: string;
  billingAddress?: string;
  country?: string;
  language?: string;
  companyPreference?: string;
  userName?: string;
  fatherName?: string;
  profileImage?: any;
  lastLogin: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  accountStatus: EngineerAccountStatus;
}

interface EngineerAnalytics {
  summary: {
    totalEngineers: number;
    activeEngineers: number;
    inactive: number;
    avgRating: number;
  };
  engineers: Engineer[];
  analytics: {
    statusDistribution: Array<{
      _id: EngineerAccountStatus;
      count: number;
    }>;
    groupDistribution: any[];
    zoneDistribution: any[];
    areaDistribution: any[];
    modeDistribution: any[];
    recentActivity: number;
  };
  filters: {
    availableGroups: string[];
    availableZones: string[];
    availableAreas: string[];
    availableModes: string[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Area Type Enum
enum AreaType {
  RURAL = "rural",
  URBAN = "urban"
}

// Mode Enum
enum Mode {
  ONLINE = "online",
  OFFLINE = "offline"
}

// Form Schema
const insertEngineerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  group: z.string().optional(),
  zone: z.string().optional(),
  area: z.nativeEnum(AreaType).optional(),
  mode: z.nativeEnum(Mode).optional(),
  permanentAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  companyPreference: z.string().optional(),
  userName: z.string().optional(),
  fatherName: z.string().optional(),
  profileImage: z.any().optional(),
});

type InsertEngineer = z.infer<typeof insertEngineerSchema>;

export default function Engineers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);

  const { data: engineerDashboardData, isLoading, error, refetch } = useGetEngineerDashbaordDataQuery({});
  const [addEngineer, { isLoading: isAddingEngineer }] = useAddEngineerDataMutation();
  const [updateEngineer, { isLoading: isUpdatingEngineer }] = useUpdateEngineerDataMutation();
  const [deleteEngineer, { isLoading: isDeletingEngineer }] = useDeleteEngineerMutation();
  const { toast } = useToast();

  const form = useForm<InsertEngineer>({
    resolver: zodResolver(insertEngineerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      countryCode: "+91",
      status: "active",
      group: "",
      zone: "",
      area: undefined,
      mode: undefined,
      permanentAddress: "",
      billingAddress: "",
      country: "",
      language: "",
      companyPreference: "",
      userName: "",
      fatherName: "",
      profileImage: null,
    },
  });

  const editForm = useForm<InsertEngineer>({
    resolver: zodResolver(insertEngineerSchema),
  });

  // Extract data from API response
  const engineers = engineerDashboardData?.data?.engineers || [];
  const summary = engineerDashboardData?.data?.summary;
  const pagination = engineerDashboardData?.data?.pagination;
  const filters = engineerDashboardData?.data?.filters;

  // Filter engineers based on search and filter criteria
  const filteredEngineers = engineers.filter((engineer: Engineer) => {
    const matchesSearch = 
      engineer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.phoneNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && engineer.isActive) ||
      (statusFilter === "inactive" && !engineer.isActive);
    
    const matchesGroup = groupFilter === "all" || engineer.group === groupFilter;
    const matchesZone = zoneFilter === "all" || engineer.zone === zoneFilter;
    const matchesArea = areaFilter === "all" || engineer.area === areaFilter;
    const matchesMode = modeFilter === "all" || engineer.mode === modeFilter;

    return matchesSearch && matchesStatus && matchesGroup && matchesZone && matchesArea && matchesMode;
  });

  const handleCreateEngineer = async (data: InsertEngineer) => {
    try {
      // Create FormData for multipart submission
      const formData = new FormData();
      
      // Add all form fields to FormData
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('countryCode', data.countryCode);
      formData.append('status', data.status);
      
      // Add optional fields if they exist
      if (data.group) formData.append('group', data.group);
      if (data.zone) formData.append('zone', data.zone);
      if (data.area) formData.append('area', data.area);
      if (data.mode) formData.append('mode', data.mode);
      if (data.permanentAddress) formData.append('permanentAddress', data.permanentAddress);
      if (data.billingAddress) formData.append('billingAddress', data.billingAddress);
      if (data.country) formData.append('country', data.country);
      if (data.language) formData.append('language', data.language);
      if (data.companyPreference) formData.append('companyPreference', data.companyPreference);
      if (data.userName) formData.append('userName', data.userName);
      if (data.fatherName) formData.append('fatherName', data.fatherName);
      
      // Add profile image if selected
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage);
      }
      
      // Call API to create engineer
      await addEngineer(formData).unwrap();
      
      toast({
        title: "Success",
        description: "Engineer created successfully",
      });
      
      setIsCreateDialogOpen(false);
      form.reset();
      refetch(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create engineer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEngineer = async (data: InsertEngineer) => {
    if (!selectedEngineer) return;
    
    try {
      // Create FormData for multipart submission
      const formData = new FormData();
      formData.append('engineerId', selectedEngineer._id);
      
      // Add all form fields to FormData
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('countryCode', data.countryCode);
      formData.append('status', data.status);
      
      // Add optional fields if they exist
      if (data.group) formData.append('group', data.group);
      if (data.zone) formData.append('zone', data.zone);
      if (data.area) formData.append('area', data.area);
      if (data.mode) formData.append('mode', data.mode);
      if (data.permanentAddress) formData.append('permanentAddress', data.permanentAddress);
      if (data.billingAddress) formData.append('billingAddress', data.billingAddress);
      if (data.country) formData.append('country', data.country);
      if (data.language) formData.append('language', data.language);
      if (data.companyPreference) formData.append('companyPreference', data.companyPreference);
      if (data.userName) formData.append('userName', data.userName);
      if (data.fatherName) formData.append('fatherName', data.fatherName);
      
      // Add profile image if selected
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage);
      }
      
      // Call API to update engineer
      await updateEngineer(
        formData 
      ).unwrap();
      
      toast({
        title: "Success",
        description: "Engineer updated successfully",
      });
      
      setIsEditDialogOpen(false);
      refetch(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update engineer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEngineer = async (engineerId: string) => {
    try {
      await deleteEngineer(engineerId).unwrap();
      
      toast({
        title: "Success",
        description: "Engineer deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedEngineer(null);
      refetch(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete engineer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (engineer: Engineer) => {
    const { isActive, accountStatus } = engineer;
    
    if (accountStatus.isSuspended) {
      return (
        <Badge className="bg-red-100 text-red-800 border-0">
          <X className="w-3 h-3 mr-1" />
          Suspended
        </Badge>
      );
    }
    
    if (accountStatus.isDeactivated) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-0">
          <X className="w-3 h-3 mr-1" />
          Deactivated
        </Badge>
      );
    }
    
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 border-0">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-red-100 text-red-800 border-0">
        <X className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getVerificationBadge = (accountStatus: EngineerAccountStatus) => {
    if (accountStatus.isAccountVerified) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-0">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-0">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
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

  if (isLoading) {
    return (
      <MainLayout title="Engineer Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading engineers...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Engineer Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading engineers</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Engineer Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Engineers</p>
                  <p className="text-2xl font-bold">{summary?.totalEngineers || 0}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Engineers</p>
                  <p className="text-2xl font-bold text-green-600">{summary?.activeEngineers || 0}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{summary?.inactive || 0}</p>
                </div>
                <X className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary?.avgRating?.toFixed(1) || '0.0'}</p>
                </div>
                <Star className="h-4 w-4 text-yellow-600" />
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
                    placeholder="Search engineers..."
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
                  </SelectContent>
                </Select>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {filters?.availableGroups?.map((group: string) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {filters?.availableZones?.map((zone: string) => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {filters?.availableAreas?.map((area: string) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {filters?.availableModes?.map((mode: string) => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
                >
                  {viewMode === "card" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Engineer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ✨ Add New Engineer
                      </DialogTitle>
                      <p className="text-muted-foreground">Fill in the details to create a new engineer profile</p>
                    </DialogHeader>
                    
                    <form onSubmit={form.handleSubmit(handleCreateEngineer)} className="space-y-6">
                      {/* Profile Image Upload */}
                      <div className="flex justify-center">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all duration-200 overflow-hidden">
                            {form.watch("profileImage") ? (
                              <img 
                                src={URL.createObjectURL(form.watch("profileImage"))} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <User className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                <p className="text-xs text-blue-600">Upload Photo</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) form.setValue("profileImage", file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>

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
                          <div className="space-y-2">
                            <Label htmlFor="userName" className="text-sm font-medium">Username</Label>
                            <Input 
                              {...form.register("userName")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fatherName" className="text-sm font-medium">Father's Name</Label>
                            <Input 
                              {...form.register("fatherName")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter father's name"
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

                      {/* Location & Assignment */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📍 Location & Assignment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                            <Input 
                              {...form.register("country")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter country"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zone" className="text-sm font-medium">Zone</Label>
                            <Input 
                              {...form.register("zone")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter zone"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="area" className="text-sm font-medium">Area</Label>
                            <Select 
                              value={form.watch("area") || ""} 
                              onValueChange={(value) => form.setValue("area", value === "" ? undefined : value as AreaType)}
                            >
                              <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select area type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rural">🏘️ Rural</SelectItem>
                                <SelectItem value="urban">🏙️ Urban</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="group" className="text-sm font-medium">Group</Label>
                            <Input 
                              {...form.register("group")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter group"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🏠 Addresses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="permanentAddress" className="text-sm font-medium">Permanent Address</Label>
                            <textarea 
                              {...form.register("permanentAddress")} 
                              className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                              placeholder="Enter permanent address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingAddress" className="text-sm font-medium">Billing Address</Label>
                            <textarea 
                              {...form.register("billingAddress")} 
                              className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                              placeholder="Enter billing address"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preferences & Status */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">⚙️ Preferences & Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                            <Input 
                              {...form.register("language")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter preferred language"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyPreference" className="text-sm font-medium">Company Preference</Label>
                            <Input 
                              {...form.register("companyPreference")} 
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter company preference"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mode" className="text-sm font-medium">Mode</Label>
                            <Select 
                              value={form.watch("mode") || ""} 
                              onValueChange={(value) => form.setValue("mode", value === "" ? undefined : value as Mode)}
                            >
                              <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">🟢 Online</SelectItem>
                                <SelectItem value="offline">🔴 Offline</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                        <Button 
                          type="submit"
                          disabled={isAddingEngineer}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingEngineer ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            "✨ Create Engineer"
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

        {/* Engineers Display */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEngineers.map((engineer: Engineer) => (
              <Card key={engineer._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate(`/engineers/${engineer._id}`)}
                        title="Click to view engineer details"
                      >
                        {engineer.profileImage ? (
                          <img 
                            src={`${BASE_URL}${engineer.profileImage}`} 
                            alt={engineer.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <User className={`w-5 h-5 text-blue-600 ${engineer.profileImage ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{engineer.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{engineer.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(engineer)}
                      {getVerificationBadge(engineer.accountStatus)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {engineer.countryCode} {engineer.phoneNumber}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined: {formatDate(engineer.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Last Login: {formatDateTime(engineer.lastLogin)}
                    </div>
                    {engineer.updatedAt && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        Updated: {formatDate(engineer.updatedAt)}
                      </div>
                    )}
                    {engineer.group && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        Group: {engineer.group}
                      </div>
                    )}
                    {engineer.zone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Zone: {engineer.zone}
                      </div>
                    )}
                    {engineer.area && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Area: {engineer.area === 'rural' ? '🏘️ Rural' : '🏙️ Urban'}
                      </div>
                    )}
                    {engineer.mode && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Activity className="w-4 h-4 mr-2" />
                        Mode: {engineer.mode === 'online' ? '🟢 Online' : '🔴 Offline'}
                      </div>
                    )}
                    {engineer.country && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Country: {engineer.country}
                      </div>
                    )}
                    {engineer.language && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        Language: {engineer.language}
                      </div>
                    )}
                    {engineer.companyPreference && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Settings className="w-4 h-4 mr-2" />
                        Company: {engineer.companyPreference}
                      </div>
                    )}
                    {engineer.userName && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        Username: {engineer.userName}
                      </div>
                    )}
                    {engineer.fatherName && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        Father: {engineer.fatherName}
                      </div>
                    )}
                    {engineer.permanentAddress && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Address: {engineer.permanentAddress}
                      </div>
                    )}
                    {engineer.billingAddress && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Billing: {engineer.billingAddress}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/engineers/${engineer._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedEngineer(engineer);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedEngineer(engineer);
                        const formData: InsertEngineer = {
                          firstName: engineer.firstName,
                          lastName: engineer.lastName,
                          email: engineer.email,
                          phoneNumber: engineer.phoneNumber,
                          countryCode: engineer.countryCode,
                          status: (engineer.status || (engineer.isActive ? "active" : "inactive")) as "active" | "inactive" | "suspended",
                          group: engineer.group || "",
                          zone: engineer.zone || "",
                          area: engineer.area as AreaType | undefined,
                          mode: engineer.mode as Mode | undefined,
                          permanentAddress: engineer.permanentAddress || "",
                          billingAddress: engineer.billingAddress || "",
                          country: engineer.country || "",
                          language: engineer.language || "",
                          companyPreference: engineer.companyPreference || "",
                          userName: engineer.userName || "",
                          fatherName: engineer.fatherName || "",
                          profileImage: engineer.profileImage || null,
                        };
                        console.log("Setting edit form data:", formData);
                        editForm.reset(formData);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedEngineer(engineer);
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
                data={filteredEngineers}
                columns={[
                  { 
                    key: "profileImage", 
                    label: "Photo",
                    render: (_, engineer) => (
                      <div 
                        className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate(`/engineers/${engineer._id}`)}
                        title="Click to view engineer details"
                      >
                        {engineer.profileImage ? (
                          <img 
                            src={`${BASE_URL}${engineer.profileImage}`} 
                            alt={engineer.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <User className={`w-5 h-5 text-blue-600 ${engineer.profileImage ? 'hidden' : ''}`} />
                      </div>
                    )
                  },
                  { key: "fullName", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "phoneNumber", label: "Phone" },
                  { 
                    key: "group", 
                    label: "Group",
                    render: (value) => value || "-"
                  },
                  { 
                    key: "zone", 
                    label: "Zone",
                    render: (value) => value || "-"
                  },
                  { 
                    key: "area", 
                    label: "Area",
                    render: (value) => value ? (value === 'rural' ? '🏘️ Rural' : '🏙️ Urban') : "-"
                  },
                  { 
                    key: "mode", 
                    label: "Mode",
                    render: (value) => value ? (value === 'online' ? '🟢 Online' : '🔴 Offline') : "-"
                  },
                  { 
                    key: "country", 
                    label: "Country",
                    render: (value) => value || "-"
                  },
                  { 
                    key: "companyPreference", 
                    label: "Company",
                    render: (value) => value || "-"
                  },
                  { 
                    key: "status", 
                    label: "Status",
                    render: (_, engineer) => getStatusBadge(engineer)
                  },
                  {
                    key: "accountStatus",
                    label: "Verification",
                    render: (_, engineer) => getVerificationBadge(engineer.accountStatus)
                  },
                  {
                    key: "createdAt",
                    label: "Joined",
                    render: (value) => formatDate(value)
                  },
                  {
                    key: "lastLogin",
                    label: "Last Login",
                    render: (value) => formatDateTime(value)
                  },
                  {
                    key: "updatedAt",
                    label: "Last Updated",
                    render: (value) => value ? formatDate(value) : "-"
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (_, engineer) => (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/engineers/${engineer._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEngineer(engineer);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEngineer(engineer);
                            editForm.reset({
                              firstName: engineer.firstName,
                              lastName: engineer.lastName,
                              email: engineer.email,
                              phoneNumber: engineer.phoneNumber,
                              countryCode: engineer.countryCode,
                              status: engineer.status || (engineer.isActive ? "active" : "inactive"),
                              group: engineer.group || "",
                              zone: engineer.zone || "",
                              area: engineer.area || undefined,
                              mode: engineer.mode || undefined,
                              permanentAddress: engineer.permanentAddress || "",
                              billingAddress: engineer.billingAddress || "",
                              country: engineer.country || "",
                              language: engineer.language || "",
                              companyPreference: engineer.companyPreference || "",
                              userName: engineer.userName || "",
                              fatherName: engineer.fatherName || "",
                              profileImage: engineer.profileImage || null,
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
                            setSelectedEngineer(engineer);
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
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} engineers
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
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
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Engineer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ✏️ Edit Engineer
            </DialogTitle>
            <p className="text-muted-foreground">Update the engineer profile information</p>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(handleEditEngineer)} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-green-300 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all duration-200 overflow-hidden">
                  {editForm.watch("profileImage") ? (
                    <img 
                      src={URL.createObjectURL(editForm.watch("profileImage"))} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : selectedEngineer?.profileImage ? (
                    <img 
                      src={`${BASE_URL}${selectedEngineer.profileImage}`} 
                      alt="Current Profile" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {!editForm.watch("profileImage") && !selectedEngineer?.profileImage && (
                    <div className="text-center">
                      <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-green-600">Update Photo</p>
                    </div>
                  )}
                  {!editForm.watch("profileImage") && selectedEngineer?.profileImage && (
                    <div className="text-center hidden">
                      <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-green-600">Update Photo</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) editForm.setValue("profileImage", file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

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
                <div className="space-y-2">
                  <Label htmlFor="edit-userName" className="text-sm font-medium">Username</Label>
                  <Input 
                    id="edit-userName"
                    {...editForm.register("userName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fatherName" className="text-sm font-medium">Father's Name</Label>
                  <Input 
                    id="edit-fatherName"
                    {...editForm.register("fatherName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter father's name"
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

            {/* Location & Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📍 Location & Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-country" className="text-sm font-medium">Country</Label>
                  <Input 
                    id="edit-country"
                    {...editForm.register("country")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zone" className="text-sm font-medium">Zone</Label>
                  <Input 
                    id="edit-zone"
                    {...editForm.register("zone")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter zone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-area" className="text-sm font-medium">Area</Label>
                  <Select 
                    value={editForm.watch("area") || ""} 
                    onValueChange={(value) => editForm.setValue("area", value === "" ? undefined : value as AreaType)}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select area type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rural">🏘️ Rural</SelectItem>
                      <SelectItem value="urban">🏙️ Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-group" className="text-sm font-medium">Group</Label>
                  <Input 
                    id="edit-group"
                    {...editForm.register("group")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter group"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🏠 Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-permanentAddress" className="text-sm font-medium">Permanent Address</Label>
                  <textarea 
                    id="edit-permanentAddress"
                    {...editForm.register("permanentAddress")} 
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Enter permanent address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-billingAddress" className="text-sm font-medium">Billing Address</Label>
                  <textarea 
                    id="edit-billingAddress"
                    {...editForm.register("billingAddress")} 
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Enter billing address"
                  />
                </div>
              </div>
            </div>

            {/* Preferences & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">⚙️ Preferences & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-language" className="text-sm font-medium">Language</Label>
                  <Input 
                    id="edit-language"
                    {...editForm.register("language")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter preferred language"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-companyPreference" className="text-sm font-medium">Company Preference</Label>
                  <Input 
                    id="edit-companyPreference"
                    {...editForm.register("companyPreference")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter company preference"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mode" className="text-sm font-medium">Mode</Label>
                  <Select 
                    value={editForm.watch("mode") || ""} 
                    onValueChange={(value) => editForm.setValue("mode", value === "" ? undefined : value as Mode)}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">🟢 Online</SelectItem>
                      <SelectItem value="offline">🔴 Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                disabled={isUpdatingEngineer}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingEngineer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "✏️ Update Engineer"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Engineer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[70%] h-[70vh] max-w-none overflow-hidden">
          <DialogHeader>
            <DialogTitle>Engineer Details</DialogTitle>
          </DialogHeader>
          {selectedEngineer && (
            <div className="space-y-6 overflow-y-auto h-full pr-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {selectedEngineer.profileImage ? (
                    <img 
                      src={`${BASE_URL}${selectedEngineer.profileImage}`} 
                      alt={selectedEngineer.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className={`w-8 h-8 ${selectedEngineer.profileImage ? 'hidden' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEngineer.fullName}</h3>
                  <p className="text-muted-foreground">{selectedEngineer.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(selectedEngineer)}
                    {getVerificationBadge(selectedEngineer.accountStatus)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEngineer.countryCode} {selectedEngineer.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEngineer.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined: {formatDate(selectedEngineer.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Last Login: {formatDateTime(selectedEngineer.lastLogin)}</span>
                    </div>
                    {selectedEngineer.updatedAt && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Last Updated: {formatDateTime(selectedEngineer.updatedAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Status: {selectedEngineer.status || (selectedEngineer.isActive ? 'Active' : 'Inactive')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedEngineer.group || selectedEngineer.zone || selectedEngineer.area || selectedEngineer.mode || selectedEngineer.country || selectedEngineer.language || selectedEngineer.companyPreference || selectedEngineer.userName || selectedEngineer.fatherName) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Assignment & Location</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEngineer.group && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Group: {selectedEngineer.group}</span>
                      </div>
                    )}
                    {selectedEngineer.zone && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Zone: {selectedEngineer.zone}</span>
                      </div>
                    )}
                    {selectedEngineer.area && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Area: {selectedEngineer.area === 'rural' ? '🏘️ Rural' : '🏙️ Urban'}</span>
                      </div>
                    )}
                    {selectedEngineer.mode && (
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span>Mode: {selectedEngineer.mode === 'online' ? '🟢 Online' : '🔴 Offline'}</span>
                      </div>
                    )}
                    {selectedEngineer.country && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Country: {selectedEngineer.country}</span>
                      </div>
                    )}
                    {selectedEngineer.language && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Language: {selectedEngineer.language}</span>
                      </div>
                    )}
                    {selectedEngineer.companyPreference && (
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span>Company: {selectedEngineer.companyPreference}</span>
                      </div>
                    )}
                    {selectedEngineer.userName && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Username: {selectedEngineer.userName}</span>
                      </div>
                    )}
                    {selectedEngineer.fatherName && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Father: {selectedEngineer.fatherName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address Information */}
              {(selectedEngineer.permanentAddress || selectedEngineer.billingAddress) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Address Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedEngineer.permanentAddress && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          <span className="font-medium">Permanent Address:</span>
                          <p className="text-sm text-muted-foreground">{selectedEngineer.permanentAddress}</p>
                        </div>
                      </div>
                    )}
                    {selectedEngineer.billingAddress && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          <span className="font-medium">Billing Address:</span>
                          <p className="text-sm text-muted-foreground">{selectedEngineer.billingAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Account Status</h4>
                <div className="flex gap-2">
                  <span className="text-sm">
                    Deactivated: {selectedEngineer.accountStatus.isDeactivated ? 'Yes' : 'No'}
                  </span>
                  <span className="text-sm">
                    Suspended: {selectedEngineer.accountStatus.isSuspended ? 'Yes' : 'No'}
                  </span>
                  <span className="text-sm">
                    Verified: {selectedEngineer.accountStatus.isAccountVerified ? 'Yes' : 'No'}
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

      {/* Delete Engineer Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Delete Engineer
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this engineer? This action cannot be undone.
            </p>
          </DialogHeader>
          
          {selectedEngineer && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                  {selectedEngineer.profileImage ? (
                    <img 
                      src={`${BASE_URL}${selectedEngineer.profileImage}`} 
                      alt={selectedEngineer.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className={`w-5 h-5 text-blue-600 ${selectedEngineer.profileImage ? 'hidden' : ''}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedEngineer.fullName}</h4>
                  <p className="text-sm text-gray-600">{selectedEngineer.email}</p>
                  <p className="text-xs text-gray-500">
                    {selectedEngineer.group && `Group: ${selectedEngineer.group}`}
                    {selectedEngineer.zone && ` • Zone: ${selectedEngineer.zone}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedEngineer(null);
              }}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => selectedEngineer && handleDeleteEngineer(selectedEngineer._id)}
              disabled={isDeletingEngineer}
              className="flex-1 sm:flex-none"
            >
              {isDeletingEngineer ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Engineer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}