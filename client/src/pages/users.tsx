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
import { UserPlus, MapPin, Phone, Mail, Calendar, Wifi, Search, Filter, Grid, List, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Activity, CheckCircle, TrendingUp, WifiOff, AlertTriangle, CreditCard, Download, Upload, X, Shield, ShieldOff, FilterX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { generateDummyCustomers, type Customer } from "@/lib/dummyData";

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

type UserData = Customer;

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
  const itemsPerPage = 6;

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      suspended: { color: "bg-red-100 text-red-800", icon: ShieldOff },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      expired: { color: "bg-gray-100 text-gray-800", icon: X },
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
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
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="w-[140px]">
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
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                        <div className="col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input {...form.register("address")} />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={form.watch("status")} onValueChange={(value: any) => form.setValue("status", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="area">Area</Label>
                          <Select value={form.watch("area")} onValueChange={(value: any) => form.setValue("area", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urban">Urban</SelectItem>
                              <SelectItem value="rural">Rural</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create User</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Display */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(user.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.location}
                    </div>
                    {user.serviceProvider && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Wifi className="w-4 h-4 mr-2" />
                        {user.serviceProvider}
                      </div>
                    )}
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
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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
      </div>
    </MainLayout>
  );
}