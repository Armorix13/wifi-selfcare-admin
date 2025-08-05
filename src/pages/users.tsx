import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, MapPin, Phone, Mail, Calendar, Wifi, Search, Filter, Grid, List, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Activity, CheckCircle, TrendingUp, WifiOff, AlertTriangle, CreditCard, Download, Upload, X, Shield, ShieldOff, FilterX, BarChart, Settings, Users2, Megaphone, Plus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { generateDummyCustomers, type Customer } from "@/lib/dummyData";
import { useAddAdvertisementMutation, useGetAdvertisementsQuery, useUpdateAdvertisementMutation, useDeleteAdvertisementMutation, BASE_URL } from "@/api/index";

// Define user schema for form validation
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  location: z.string().min(1, "Location is required"),
  serviceProvider: z.string().optional(),
  planName: z.string().optional(),
  activationDate: z.string().optional(),
  expirationDate: z.string().optional(),
  balanceDue: z.number().min(0, "Balance due must be non-negative").default(0),
  staticIp: z.string().optional(),
  macAddress: z.string().optional(),
  status: z.enum(["active", "suspended", "pending", "expired"]),
  area: z.enum(["urban", "rural"]),
  mode: z.enum(["online", "offline"]),
  isActive: z.boolean().default(true),
});

// Define advertisement schema for form validation
const advertisementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["CCTV", "WIFI"]),
  image: z.any().optional(),
});

type UserData = Customer;
type AdvertisementData = z.infer<typeof advertisementSchema> & {
  id?: string;
  _id?: string;
  imageUrl?: string;
  createdAt?: string;
  status?: "active" | "inactive";
};

export default function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const itemsPerPage = 6;

  // Advertisement states
  // RTK Query hooks
  const { data: advertisementsData, isLoading: isLoadingAdvertisements } = useGetAdvertisementsQuery({});
  const [addAdvertisement, { isLoading: isAddingAdvertisement }] = useAddAdvertisementMutation();
  const [updateAdvertisement, { isLoading: isUpdatingAdvertisement }] = useUpdateAdvertisementMutation();
  const [deleteAdvertisement, { isLoading: isDeletingAdvertisement }] = useDeleteAdvertisementMutation();

  // Transform API data to flat array and use fallback to dummy data
  const advertisements = advertisementsData?.data ? [
    ...(advertisementsData.data.cctv || []),
    ...(advertisementsData.data.wifi || [])
  ] : [
    {
      id: "1",
      title: "CP Plus 4 Channel HD DVR Kit with Cameras",
      description: "Complete CCTV surveillance kit with 4 HD cameras and a 4-channel DVR. Includes power supply, cables, and supports remote viewing via mobile app.",
      type: "CCTV",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      createdAt: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      title: "High-Speed Fiber Internet Package",
      description: "Get lightning-fast internet speeds up to 1Gbps with our premium fiber package. Includes free installation and 24/7 support.",
      type: "WIFI",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
      createdAt: "2024-01-10",
      status: "active"
    },
    {
      id: "3",
      title: "Business WiFi Solutions",
      description: "Professional WiFi systems for businesses of all sizes. Features include high-speed connectivity, secure networks, and 24/7 support.",
      type: "WIFI",
      imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
      createdAt: "2024-01-05",
      status: "inactive"
    }
  ];
  const [isCreateAdDialogOpen, setIsCreateAdDialogOpen] = useState(false);
  const [isEditAdDialogOpen, setIsEditAdDialogOpen] = useState(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<AdvertisementData | null>(null);

  const { toast } = useToast();

  // Load dummy data
  const [users, setUsers] = useState(generateDummyCustomers());

  const form = useForm<UserData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      serviceProvider: "",
      planName: "",
      status: "active",
      area: "urban",
      mode: "online",
      isActive: true,
      balanceDue: 0,
    },
  });

  const advertisementForm = useForm<AdvertisementData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: "",
      description: "",
      
      type: "CCTV",
    },
  });

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesProvider = providerFilter === "all" || user.serviceProvider === providerFilter;
    const matchesArea = areaFilter === "all" || user.area === areaFilter;

    return matchesSearch && matchesStatus && matchesProvider && matchesArea;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateUser = (data: UserData) => {
    const newUser: UserData = {
      ...data,
      id: Math.max(...users.map(u => u.id)) + 1,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    toast({
      title: "Success",
      description: "User created successfully",
    });
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleEditUser = (data: UserData) => {
    const updatedUsers = users.map(user => 
      user.id === selectedUser?.id ? { ...user, ...data } : user
    );
    setUsers(updatedUsers);
    toast({
      title: "Success",
      description: "User updated successfully",
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  // Advertisement handlers
  const handleCreateAdvertisement = async (data: AdvertisementData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("type", data.type);
      if (data.image) {
        formData.append("image", data.image);
      }

      await addAdvertisement(formData).unwrap();
      
      setIsCreateAdDialogOpen(false);
      advertisementForm.reset();
      toast({
        title: "Advertisement created",
        description: "Advertisement has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create advertisement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAdvertisement = async (data: AdvertisementData) => {
    if (selectedAdvertisement) {
      try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("type", data.type);
        if (data.image) {
          formData.append("image", data.image);
        }

        await updateAdvertisement({ id: selectedAdvertisement._id || selectedAdvertisement.id, body: formData }).unwrap();
        
        setIsEditAdDialogOpen(false);
        setSelectedAdvertisement(null);
        advertisementForm.reset();
        toast({
          title: "Advertisement updated",
          description: "Advertisement has been successfully updated.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update advertisement. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAdvertisement = async (adId: string) => {
    try {
      await deleteAdvertisement(adId).unwrap();
      toast({
        title: "Advertisement deleted",
        description: "Advertisement has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete advertisement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
      suspended: { color: "bg-red-100 text-red-800 border-red-200", icon: ShieldOff },
      expired: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: WifiOff },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || CheckCircle;
    
    return (
      <Badge className={`${config?.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    pending: users.filter(u => u.status === "pending").length,
    suspended: users.filter(u => u.status === "suspended").length,
  };

  return (
    <MainLayout title="User Management">
      <div className="space-y-6">
        {/* Enhanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5 gap-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="advertisements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Advertisements</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                      <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                    </div>
                    <ShieldOff className="h-4 w-4 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    User management dashboard with real-time statistics and comprehensive user data overview.
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{Math.round((stats.active / stats.total) * 100)}%</div>
                      <div className="text-sm text-muted-foreground">Active Rate</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.area === "urban").length}</div>
                      <div className="text-sm text-muted-foreground">Urban Users</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.area === "rural").length}</div>
                      <div className="text-sm text-muted-foreground">Rural Users</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{users.filter(u => u.mode === "online").length}</div>
                      <div className="text-sm text-muted-foreground">Online Now</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        <SelectItem value="urban">Urban</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "card" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input {...form.register("name")} />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input {...form.register("email")} type="email" />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input {...form.register("phone")} />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input {...form.register("location")} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={form.handleSubmit(handleCreateUser)}>
                            Create User
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Grid/Table */}
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(user.status)}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {user.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {user.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wifi className="w-4 h-4 text-muted-foreground" />
                          {user.serviceProvider || 'No Provider'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            form.reset(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
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
            ) : (
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    data={currentUsers}
                    columns={[
                      { key: "name", label: "Name" },
                      { key: "email", label: "Email" },
                      { key: "location", label: "Location" },
                      { key: "serviceProvider", label: "Provider" },
                      { 
                        key: "status", 
                        label: "Status",
                        render: (value) => getStatusBadge(value)
                      },
                      {
                        key: "actions",
                        label: "Actions",
                        render: (_, user) => (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                form.reset(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Status Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active</span>
                        <span className="text-green-600">{stats.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="text-yellow-600">{stats.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suspended</span>
                        <span className="text-red-600">{stats.suspended}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Area Coverage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Urban</span>
                        <span className="text-blue-600">{users.filter(u => u.area === "urban").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rural</span>
                        <span className="text-purple-600">{users.filter(u => u.area === "rural").length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Connection Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Online</span>
                        <span className="text-green-600">{users.filter(u => u.mode === "online").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Offline</span>
                        <span className="text-gray-600">{users.filter(u => u.mode === "offline").length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Display Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Default View Mode</span>
                        <Select value={viewMode} onValueChange={setViewMode as any}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Card View</SelectItem>
                            <SelectItem value="table">Table View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Items Per Page</span>
                        <span className="text-muted-foreground">{itemsPerPage} users</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Export Options</h3>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Users
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advertisements Tab */}
          <TabsContent value="advertisements" className="space-y-6">
            {/* Advertisement Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">Advertisement Management</h2>
                    <p className="text-muted-foreground">Manage your advertisements and promotional content</p>
                  </div>
                  <Dialog open={isCreateAdDialogOpen} onOpenChange={setIsCreateAdDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Advertisement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Advertisement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="ad-title">Title</Label>
                          <Input {...advertisementForm.register("title")} placeholder="Enter advertisement title" />
                        </div>
                        <div>
                          <Label htmlFor="ad-description">Description</Label>
                          <textarea
                            {...advertisementForm.register("description")}
                            className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
                            placeholder="Enter advertisement description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ad-type">Type</Label>
                          <Select 
                            value={advertisementForm.watch("type")} 
                            onValueChange={(value) => advertisementForm.setValue("type", value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CCTV">CCTV</SelectItem>
                              <SelectItem value="WIFI">WIFI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="ad-image">Image</Label>
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onClick={() => document.getElementById('ad-image-upload')?.click()}
                          >
                            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload image or drag and drop</p>
                            <input
                              id="ad-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  advertisementForm.setValue("image", file);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateAdDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={advertisementForm.handleSubmit(handleCreateAdvertisement)}
                          disabled={isAddingAdvertisement}
                        >
                          {isAddingAdvertisement ? "Creating..." : "Create Advertisement"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoadingAdvertisements && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading advertisements...</p>
                </CardContent>
              </Card>
            )}

            {/* Advertisements Grid */}
            {!isLoadingAdvertisements && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {advertisements.map((ad:any) => (
                 <Card key={ad._id || ad.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                                             {ad.imageUrl ? (
                         <img
                           src={`${BASE_URL}${ad.imageUrl}`}
                           alt={ad.title}
                           className="w-full h-48 object-cover rounded-t-lg"
                         />
                       ) : (
                         <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                           <ImageIcon className="w-12 h-12 text-muted-foreground" />
                         </div>
                       )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={ad.status === "active" ? "default" : "secondary"}>
                          {ad.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{ad.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{ad.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{ad.type}</Badge>
                            <span>•</span>
                            <span>{ad.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                                                 <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => {
                             setSelectedAdvertisement(ad);
                             advertisementForm.reset({
                               title: ad.title,
                               description: ad.description,
                               type: ad.type,
                             });
                             setIsEditAdDialogOpen(true);
                           }}
                         >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this advertisement? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdvertisement(ad._id || ad.id)}>
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
            )}

            {/* Empty State */}
            {!isLoadingAdvertisements && advertisements.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Advertisements</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first advertisement to promote your services.
                  </p>
                  <Button onClick={() => setIsCreateAdDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Advertisement
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  {...form.register("name")}
                  defaultValue={selectedUser?.name}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  {...form.register("email")}
                  type="email"
                  defaultValue={selectedUser?.email}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  {...form.register("phone")}
                  defaultValue={selectedUser?.phone}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  {...form.register("location")}
                  defaultValue={selectedUser?.location}
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  {...form.register("address")}
                  defaultValue={selectedUser?.address}
                />
              </div>
              <div>
                <Label htmlFor="edit-provider">Service Provider</Label>
                <Input
                  id="edit-provider"
                  {...form.register("serviceProvider")}
                  defaultValue={selectedUser?.serviceProvider || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={form.watch("status")} 
                  onValueChange={(value) => form.setValue("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-area">Area</Label>
                <Select 
                  value={form.watch("area")} 
                  onValueChange={(value) => form.setValue("area", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={form.handleSubmit(handleEditUser)}>
                Update User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedUser.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedUser.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">Service Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedUser.serviceProvider || 'No Provider'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{selectedUser.mode}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Area: {selectedUser.area}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser.address && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Address</h4>
                    <p>{selectedUser.address}</p>
                  </div>
                )}

                {selectedUser.planName && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Current Plan</h4>
                    <p>{selectedUser.planName}</p>
                  </div>
                )}

                {selectedUser.balanceDue !== undefined && selectedUser.balanceDue > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Balance Due</h4>
                    <p className="text-red-600">${selectedUser.balanceDue}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
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

        {/* Edit Advertisement Dialog */}
        <Dialog open={isEditAdDialogOpen} onOpenChange={setIsEditAdDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Advertisement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-ad-title">Title</Label>
                <Input 
                  {...advertisementForm.register("title")} 
                  placeholder="Enter advertisement title"
                  defaultValue={selectedAdvertisement?.title || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-ad-description">Description</Label>
                <textarea
                  {...advertisementForm.register("description")}
                  className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
                  placeholder="Enter advertisement description"
                  defaultValue={selectedAdvertisement?.description || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-ad-type">Type</Label>
                <Select 
                  value={advertisementForm.watch("type")} 
                  onValueChange={(value) => advertisementForm.setValue("type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CCTV">CCTV</SelectItem>
                    <SelectItem value="WIFI">WIFI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-ad-image">Image</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => document.getElementById('edit-ad-image-upload')?.click()}
                >
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload new image or drag and drop</p>
                  <input
                    id="edit-ad-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        advertisementForm.setValue("image", file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditAdDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={advertisementForm.handleSubmit(handleEditAdvertisement)}
                disabled={isUpdatingAdvertisement}
              >
                {isUpdatingAdvertisement ? "Updating..." : "Update Advertisement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}