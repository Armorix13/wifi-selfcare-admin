import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { UserPlus, MapPin, Phone, Mail, Calendar, Wifi, Search, Filter, Grid, List, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Activity, Users, CheckCircle, TrendingUp, WifiOff, AlertTriangle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";

export default function UserManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      serviceProvider: "",
      planId: null,
      planName: "",
      balanceDue: 0,
      staticIp: "",
      macAddress: "",
      status: "pending",
      area: "urban",
      mode: "offline",
      isActive: true,
    },
  });

  const editForm = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "User added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCustomer> }) => {
      const response = await apiRequest("PUT", `/api/customers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/customers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertCustomer) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data });
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    editForm.reset(user);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: any) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteUserMutation.mutate(id);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Filter logic
  const filteredUsers = customers.filter((user: any) => {
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
    total: customers.length,
    active: customers.filter((u: any) => u.status === "active").length,
    suspended: customers.filter((u: any) => u.status === "suspended").length,
    pending: customers.filter((u: any) => u.status === "pending").length,
    withPlans: customers.filter((u: any) => u.serviceProvider).length,
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
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
                  {Array.from(new Set(customers.map((u: any) => u.location))).map((location: any) => (
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
                          <Button variant="outline" size="sm" onClick={() => handleView(user)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
                        <Button variant="ghost" size="sm" onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} className="text-green-600 hover:text-green-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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

                {selectedUser.serviceProvider && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Plan Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Service Provider</Label>
                        <p className="text-sm text-gray-900">{selectedUser.serviceProvider}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Plan Name</Label>
                        <p className="text-sm text-gray-900">{selectedUser.planName}</p>
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
