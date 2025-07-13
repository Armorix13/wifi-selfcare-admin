import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MapPin, Phone, Mail, Calendar, Wifi, Search, Filter, Grid, List, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Activity, Users, CheckCircle, TrendingUp, WifiOff, AlertTriangle, CreditCard, Download, Upload, X, Shield, ShieldOff, FilterX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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

type UserData = z.infer<typeof userSchema> & {
  id: number;
  createdAt: string;
};

// Dummy data
const generateDummyUsers = (): UserData[] => [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@email.com",
    phone: "+91 98765 43210",
    address: "123 Main St, Mumbai Central",
    location: "Mumbai Central",
    serviceProvider: "Jio Fiber",
    planName: "Jio Fiber 100 Mbps",
    activationDate: "2024-01-15",
    expirationDate: "2024-12-15",
    balanceDue: 0,
    staticIp: "192.168.1.100",
    macAddress: "AA:BB:CC:DD:EE:01",
    status: "active",
    area: "urban",
    mode: "online",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@email.com", 
    phone: "+91 87654 32109",
    address: "456 Park Ave, Delhi NCR",
    location: "Delhi NCR",
    serviceProvider: "",
    planName: "",
    activationDate: "",
    expirationDate: "",
    balanceDue: 0,
    staticIp: "",
    macAddress: "",
    status: "pending",
    area: "urban",
    mode: "offline",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit@email.com",
    phone: "+91 76543 21098",
    address: "789 Tech Park, Bangalore",
    location: "Bangalore",
    serviceProvider: "BSNL Broadband",
    planName: "BSNL Standard 50 Mbps",
    activationDate: "2023-12-01",
    expirationDate: "2024-11-30",
    balanceDue: 1200,
    staticIp: "192.168.1.102",
    macAddress: "AA:BB:CC:DD:EE:03",
    status: "suspended",
    area: "rural",
    mode: "offline",
    isActive: false,
    createdAt: "2023-12-01T10:00:00Z",
  },
  {
    id: 4,
    name: "Sunita Verma",
    email: "sunita.verma@email.com",
    phone: "+91 91234 56789",
    address: "321 Rural Lane, Patna",
    location: "Patna",
    serviceProvider: "Airtel",
    planName: "Airtel Xstream 200 Mbps",
    activationDate: "2024-02-01",
    expirationDate: "2025-01-31",
    balanceDue: 500,
    staticIp: "192.168.1.101",
    macAddress: "AA:BB:CC:DD:EE:02",
    status: "active",
    area: "rural",
    mode: "online",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 98123 45678",
    address: "654 Tech Park, Hyderabad",
    location: "Hyderabad",
    serviceProvider: "My Internet",
    planName: "My Internet Premium 300 Mbps",
    activationDate: "2024-03-10",
    expirationDate: "2025-03-09",
    balanceDue: 0,
    staticIp: "192.168.1.103",
    macAddress: "AA:BB:CC:DD:EE:04",
    status: "active",
    area: "urban",
    mode: "online",
    isActive: true,
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: 6,
    name: "Kavita Reddy",
    email: "kavita.reddy@email.com",
    phone: "+91 95678 12345",
    address: "987 IT Hub, Chennai",
    location: "Chennai",
    serviceProvider: "ACT Fibernet",
    planName: "ACT Storm 150 Mbps",
    activationDate: "2024-01-20",
    expirationDate: "2024-12-20",
    balanceDue: 2500,
    staticIp: "192.168.1.104",
    macAddress: "AA:BB:CC:DD:EE:05",
    status: "expired",
    area: "urban",
    mode: "offline",
    isActive: false,
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: 7,
    name: "Manoj Gupta",
    email: "manoj.gupta@email.com",
    phone: "+91 94567 89012",
    address: "147 Village Road, Jaipur",
    location: "Jaipur",
    serviceProvider: "Railwire",
    planName: "Railwire Basic 25 Mbps",
    activationDate: "2023-11-15",
    expirationDate: "2024-10-15",
    balanceDue: 800,
    staticIp: "192.168.1.105",
    macAddress: "AA:BB:CC:DD:EE:06",
    status: "suspended",
    area: "rural",
    mode: "offline",
    isActive: false,
    createdAt: "2023-11-15T10:00:00Z",
  },
  {
    id: 8,
    name: "Deepika Nair",
    email: "deepika.nair@email.com",
    phone: "+91 93456 78901",
    address: "258 Metro City, Kochi",
    location: "Kochi",
    serviceProvider: "BSNL Fiber",
    planName: "BSNL Fiber 100 Mbps",
    activationDate: "2024-04-01",
    expirationDate: "2025-03-31",
    balanceDue: 0,
    staticIp: "192.168.1.106",
    macAddress: "AA:BB:CC:DD:EE:07",
    status: "active",
    area: "urban",
    mode: "online",
    isActive: true,
    createdAt: "2024-04-01T10:00:00Z",
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [importData, setImportData] = useState("");
  const itemsPerPage = 6;
  
  const { toast } = useToast();

  // Initialize with dummy data
  useEffect(() => {
    setUsers(generateDummyUsers());
  }, []);

  const form = useForm<Omit<UserData, 'id' | 'createdAt'>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      serviceProvider: "",
      planName: "",
      activationDate: "",
      expirationDate: "",
      balanceDue: 0,
      staticIp: "",
      macAddress: "",
      status: "pending",
      area: "urban",
      mode: "offline",
      isActive: true,
    },
  });

  const editForm = useForm<Omit<UserData, 'id' | 'createdAt'>>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = (data: Omit<UserData, 'id' | 'createdAt'>) => {
    const newUser: UserData = {
      ...data,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    
    setUsers(prev => [...prev, newUser]);
    toast({
      title: "Success",
      description: "User added successfully",
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const onEditSubmit = (data: Omit<UserData, 'id' | 'createdAt'>) => {
    if (selectedUser) {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...data, id: selectedUser.id, createdAt: selectedUser.createdAt }
          : user
      ));
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    editForm.reset(user);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: UserData) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  const handleBlock = (id: number) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, isActive: false, status: "suspended" as const }
        : user
    ));
    toast({
      title: "Success",
      description: "User blocked successfully",
    });
  };

  const handleUnblock = (id: number) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, isActive: true, status: "active" as const }
        : user
    ));
    toast({
      title: "Success",
      description: "User unblocked successfully",
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Data exported successfully",
    });
  };

  const handleImportData = () => {
    try {
      const importedUsers = JSON.parse(importData);
      if (Array.isArray(importedUsers)) {
        const newUsers = importedUsers.map((user, index) => ({
          ...user,
          id: Math.max(...users.map(u => u.id), 0) + index + 1,
          createdAt: user.createdAt || new Date().toISOString(),
        }));
        setUsers(prev => [...prev, ...newUsers]);
        toast({
          title: "Success",
          description: `${newUsers.length} users imported successfully`,
        });
        setIsImportDialogOpen(false);
        setImportData("");
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your data.",
        variant: "destructive",
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setLocationFilter("all");
    setStatusFilter("all");
    setPlanFilter("all");
    setAreaFilter("all");
    setCurrentPage(1);
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset",
    });
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Filter logic
  const filteredUsers = users.filter((user: UserData) => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesLocation = locationFilter === "all" || user.location === locationFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesPlan = planFilter === "all" || 
      (planFilter === "with-plans" && user.serviceProvider) ||
      (planFilter === "without-plans" && !user.serviceProvider);
    const matchesArea = areaFilter === "all" || user.area === areaFilter;

    return matchesSearch && matchesLocation && matchesStatus && matchesPlan && matchesArea;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u: UserData) => u.status === "active").length,
    suspended: users.filter((u: UserData) => u.status === "suspended").length,
    pending: users.filter((u: UserData) => u.status === "pending").length,
    expired: users.filter((u: UserData) => u.status === "expired").length,
    withPlans: users.filter((u: UserData) => u.serviceProvider && u.serviceProvider.trim() !== "").length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      suspended: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Activity },
      expired: { color: "bg-gray-100 text-gray-800", icon: WifiOff },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-purple-600",
      "bg-gradient-to-br from-green-500 to-teal-600", 
      "bg-gradient-to-br from-orange-500 to-red-600",
      "bg-gradient-to-br from-purple-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-blue-600",
      "bg-gradient-to-br from-yellow-500 to-orange-600"
    ];
    return colors[index % colors.length];
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  const getDaysRemaining = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <MainLayout title="User Management">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="h-8 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="User Management">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Wifi className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.withPlans}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border border-slate-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6" />
                User Management ({filteredUsers.length})
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Button onClick={handleExportData} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Button onClick={clearAllFilters} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>

                <div className="flex items-center gap-2 border-l pl-2 ml-2">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); resetPagination(); }}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); resetPagination(); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={(value) => { setPlanFilter(value); resetPagination(); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="with-plans">With Plans</SelectItem>
                  <SelectItem value="without-plans">Without Plans</SelectItem>
                </SelectContent>
              </Select>

              <Select value={areaFilter} onValueChange={(value) => { setAreaFilter(value); resetPagination(); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={(value) => { setLocationFilter(value); resetPagination(); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {Array.from(new Set(users.map((u: UserData) => u.location))).map((location: string) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedUsers.map((user: any, index: number) => {
                  const daysRemaining = getDaysRemaining(user.expirationDate);
                  return (
                    <Card key={user.id} className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className={`h-12 w-12 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                              {getInitials(user.name)}
                            </div>
                            <div className="ml-3">
                              <h3 className="font-semibold text-gray-900">{user.name}</h3>
                              <p className="text-sm text-gray-500">ID: CU{user.id.toString().padStart(3, '0')}</p>
                            </div>
                          </div>
                          {getStatusBadge(user.status)}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {user.location} ({user.area})
                          </div>
                          
                          {user.serviceProvider && (
                            <>
                              <div className="flex items-center text-sm text-gray-600">
                                <Wifi className="h-4 w-4 mr-2" />
                                {user.planName || user.serviceProvider}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                Activated: {formatDate(user.activationDate)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                Expires: {formatDate(user.expirationDate)}
                                {daysRemaining !== null && (
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    daysRemaining < 30 ? 'bg-red-100 text-red-800' : 
                                    daysRemaining < 60 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                                  </span>
                                )}
                              </div>
                              {user.balanceDue > 0 && (
                                <div className="flex items-center text-sm text-red-600">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Balance Due: ₹{user.balanceDue}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                          <Button variant="outline" size="sm" onClick={() => handleView(user)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {user.isActive ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                  <ShieldOff className="h-4 w-4 mr-1" />
                                  Block
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Block User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to block {user.name}? They will not be able to access services until unblocked.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleBlock(user.id)} className="bg-orange-600 hover:bg-orange-700">
                                    Block User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleUnblock(user.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Shield className="h-4 w-4 mr-1" />
                              Unblock
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <DataTable
                data={filteredUsers}
                columns={[
                  {
                    key: "user",
                    label: "User",
                    render: (value: any, row: any, index: number) => (
                      <div className="flex items-center">
                        <div className={`h-10 w-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold`}>
                          {getInitials(row.name)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{row.name}</div>
                          <div className="text-sm text-gray-500">CU{row.id.toString().padStart(3, '0')}</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "contact",
                    label: "Contact",
                    render: (value: any, row: any) => (
                      <div>
                        <div className="text-sm text-gray-900">{row.phone}</div>
                        <div className="text-sm text-gray-500">{row.email}</div>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value: any, row: any) => getStatusBadge(row.status),
                  },
                  {
                    key: "plan",
                    label: "Plan Details",
                    render: (value: any, row: any) => (
                      <div>
                        <div className="text-sm font-medium">{row.planName || row.serviceProvider || "No Plan"}</div>
                        {row.expirationDate && (
                          <div className="text-xs text-gray-500">Expires: {formatDate(row.expirationDate)}</div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "location",
                    label: "Location",
                    render: (value: any, row: any) => (
                      <div>
                        <div className="text-sm">{row.location}</div>
                        <div className="text-xs text-gray-500 capitalize">{row.area}</div>
                      </div>
                    ),
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (value: any, row: any) => (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {row.isActive ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <ShieldOff className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Block User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to block {row.name}? They will not be able to access services until unblocked.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBlock(row.id)} className="bg-orange-600 hover:bg-orange-700">
                                  Block User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleUnblock(row.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {row.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(row.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ),
                  },
                ]}
                searchPlaceholder="Search users..."
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input {...form.register("name")} placeholder="Enter user name" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...form.register("email")} type="email" placeholder="Enter email address" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input {...form.register("phone")} placeholder="Enter phone number" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input {...form.register("address")} placeholder="Enter address" />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input {...form.register("location")} placeholder="Enter location" />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="area">Area Type</Label>
                <Select value={form.watch("area")} onValueChange={(value) => form.setValue("area", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Adding..." : "Add User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input {...editForm.register("name")} placeholder="Enter user name" />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...editForm.register("email")} type="email" placeholder="Enter email address" />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input {...editForm.register("phone")} placeholder="Enter phone number" />
                {editForm.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="serviceProvider">Service Provider</Label>
                <Input {...editForm.register("serviceProvider")} placeholder="Enter service provider" />
              </div>

              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input {...editForm.register("planName")} placeholder="Enter plan name" />
              </div>

              <div>
                <Label htmlFor="balanceDue">Balance Due</Label>
                <Input {...editForm.register("balanceDue", { valueAsNumber: true })} type="number" placeholder="Enter balance due" />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.watch("status")} onValueChange={(value) => editForm.setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Import Data Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import User Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="importData">JSON Data</Label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  className="min-h-40 font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Paste an array of user objects in JSON format. The system will automatically assign new IDs.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportData} disabled={!importData.trim()}>
                  Import Data
                </Button>
              </div>
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
                <div className="flex items-center space-x-4">
                  <div className={`h-16 w-16 ${getAvatarColor(0)} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-gray-500">User ID: CU{selectedUser.id.toString().padStart(3, '0')}</p>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <p className="text-sm text-gray-900">{selectedUser.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Area</Label>
                    <p className="text-sm text-gray-900 capitalize">{selectedUser.area}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Address</Label>
                    <p className="text-sm text-gray-900">{selectedUser.address}</p>
                  </div>
                </div>

                {selectedUser.serviceProvider && selectedUser.serviceProvider.trim() !== "" && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Plan Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Service Provider</Label>
                        <p className="text-sm text-gray-900">{selectedUser.serviceProvider}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Plan Name</Label>
                        <p className="text-sm text-gray-900">{selectedUser.planName || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Activation Date</Label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.activationDate)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Expiration Date</Label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.expirationDate)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Static IP</Label>
                        <p className="text-sm text-gray-900">{selectedUser.staticIp || "Not assigned"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">MAC Address</Label>
                        <p className="text-sm text-gray-900">{selectedUser.macAddress || "Not available"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Balance Due</Label>
                        <p className={`text-sm font-medium ${selectedUser.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{selectedUser.balanceDue}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Connection Mode</Label>
                        <p className="text-sm text-gray-900 capitalize">{selectedUser.mode}</p>
                      </div>
                    </div>
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
