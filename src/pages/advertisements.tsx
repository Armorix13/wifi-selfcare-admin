import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Search, Filter, Grid, List, Eye, Edit, Trash2, Plus, Image as ImageIcon, Calendar, TrendingUp, Users, EyeOff, CheckCircle, X, BarChart3, Settings, RefreshCw, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAddAdvertisementMutation, useGetAdvertisementsQuery, useUpdateAdvertisementMutation, useDeleteAdvertisementMutation, BASE_URL } from "@/api/index";
import { useAuth } from "@/lib/auth";
import { useMemo } from "react";

// Define advertisement schema for form validation
const advertisementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["CCTV", "WIFI"]),
  image: z.any().optional(),
});

type AdvertisementData = z.infer<typeof advertisementSchema> & {
  _id?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  clicks?: number;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  imageUrl?: string;
};

export default function Advertisements() {
  const { user, hasPermission } = useAuth();
  
  // Check if user has permission to access advertisements
  if (!hasPermission('manage-advertisements')) {
    return (
      <MainLayout title="Access Denied">
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <Lock className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access the Advertisements section. 
                This feature is only available to Super Administrators.
              </p>
              <div className="text-sm text-gray-500">
                <p><strong>Your Role:</strong> {user?.role || 'Unknown'}</p>
                <p><strong>Required Permission:</strong> manage-advertisements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<AdvertisementData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { toast } = useToast();

  // RTK Query hooks
  const { data: advertisementsData, isLoading: isLoadingAdvertisements, error: advertisementsError, refetch } = useGetAdvertisementsQuery({});
  const [addAdvertisement, { isLoading: isAddingAdvertisement }] = useAddAdvertisementMutation();
  const [updateAdvertisement, { isLoading: isUpdatingAdvertisement }] = useUpdateAdvertisementMutation();
  const [deleteAdvertisement, { isLoading: isDeletingAdvertisement }] = useDeleteAdvertisementMutation();

  // Transform API data to flat array and use fallback to dummy data
  const advertisements = useMemo(() => {
    if (!advertisementsData?.data) return [];
    
    // Handle the actual API response structure
    const { cctv = [], wifi = [] } = advertisementsData.data;
    
    // Combine both arrays and add status field if missing
    const allAdvertisements = [
      ...cctv.map((ad: any) => ({ ...ad, status: ad.status || 'active' })),
      ...wifi.map((ad: any) => ({ ...ad, status: ad.status || 'active' }))
    ];
    
    return allAdvertisements;
  }, [advertisementsData]);

  // Debug logging
  console.log('Advertisements Data:', advertisementsData);
  console.log('Advertisements Array:', advertisements);
  console.log('Loading State:', isLoadingAdvertisements);
  console.log('Error State:', advertisementsError);

  // Filter advertisements based on search and filters
  const filteredAdvertisements = advertisements.filter((ad: AdvertisementData) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || ad.type === typeFilter;
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: advertisements.length,
    active: advertisements.filter((ad: AdvertisementData) => ad.status === "active").length,
    inactive: advertisements.filter((ad: AdvertisementData) => ad.status === "inactive").length,
    cctv: advertisements.filter((ad: AdvertisementData) => ad.type === "CCTV").length,
    wifi: advertisements.filter((ad: AdvertisementData) => ad.type === "WIFI").length,
    totalViews: advertisements.reduce((sum: number, ad: AdvertisementData) => sum + (ad.views || 0), 0),
    totalClicks: advertisements.reduce((sum: number, ad: AdvertisementData) => sum + (ad.clicks || 0), 0),
  };

  const createForm = useForm<AdvertisementData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "WIFI",
      status: "active",
    },
  });

  const editForm = useForm<AdvertisementData>({
    resolver: zodResolver(advertisementSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAdvertisement = async (data: AdvertisementData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("type", data.type);
      formData.append("status", data.status || "active");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await addAdvertisement(formData).unwrap();
      toast({
        title: "Success",
        description: "Advertisement created successfully!",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setImageFile(null);
      setImagePreview(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create advertisement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAdvertisement = async (data: AdvertisementData) => {
    if (!selectedAdvertisement?._id) return;

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("type", data.type);
      formData.append("status", data.status || "active");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await updateAdvertisement({ id: selectedAdvertisement._id, data: formData }).unwrap();
      toast({
        title: "Success",
        description: "Advertisement updated successfully!",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      setImageFile(null);
      setImagePreview(null);
      setSelectedAdvertisement(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update advertisement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdvertisement = async (id: string) => {
    try {
      await deleteAdvertisement(id).unwrap();
      toast({
        title: "Success",
        description: "Advertisement deleted successfully!",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete advertisement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewAdvertisement = (ad: AdvertisementData) => {
    setSelectedAdvertisement(ad);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (ad: AdvertisementData) => {
    setSelectedAdvertisement(ad);
    editForm.reset({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      status: ad.status,
    });
    setImagePreview(ad.imageUrl || null);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getTypeColor = (type: string) => {
    return type === "CCTV" 
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  };

  return (
    <MainLayout title="Advertisement Management">
      <div className="space-y-6">
        {/* Enhanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="advertisements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Advertisements</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Advertisements</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Ads</p>
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
                      <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalClicks.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Type Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advertisement Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CCTV</span>
                      <Badge variant="outline">{stats.cctv}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WIFI</span>
                      <Badge variant="outline">{stats.wifi}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <Badge className="bg-green-100 text-green-800">{stats.active}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inactive</span>
                      <Badge variant="outline">{stats.inactive}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advertisements Tab */}
          <TabsContent value="advertisements" className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Advertisements</h2>
                <p className="text-gray-600 mt-1">Manage your advertising campaigns and content</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Advertisement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Advertisement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={createForm.handleSubmit(handleCreateAdvertisement)} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...createForm.register("title")}
                        placeholder="Enter advertisement title"
                      />
                      {createForm.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        {...createForm.register("description")}
                        placeholder="Enter advertisement description"
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {createForm.formState.errors.description && (
                        <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={createForm.watch("type")}
                          onValueChange={(value) => createForm.setValue("type", value as "CCTV" | "WIFI")}
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
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={createForm.watch("status") || "active"}
                          onValueChange={(value) => createForm.setValue("status", value as "active" | "inactive")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-md border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          createForm.reset();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isAddingAdvertisement}>
                        {isAddingAdvertisement ? "Creating..." : "Create Advertisement"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search advertisements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="CCTV">CCTV</SelectItem>
                        <SelectItem value="WIFI">WIFI</SelectItem>
                      </SelectContent>
                    </Select>

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

                    <div className="flex border rounded-md">
                      <Button
                        variant={viewMode === "card" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("card")}
                        className="rounded-r-none"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="rounded-l-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertisements Display */}
            {isLoadingAdvertisements ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading advertisements...</p>
                </CardContent>
              </Card>
            ) : advertisementsError ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-red-500 mb-4">
                    <X className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Advertisements</h3>
                  <p className="text-gray-600 mb-4">
                    {advertisementsError && 'data' in advertisementsError && advertisementsError.data && typeof advertisementsError.data === 'object' && 'message' in advertisementsError.data
                      ? String(advertisementsError.data.message)
                      : 'Failed to load advertisements. Please check your permissions or try again.'}
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : advertisements.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Megaphone className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Advertisements Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all" 
                      ? "No advertisements match your current filters. Try adjusting your search criteria."
                      : "No advertisements have been created yet. Create your first advertisement to get started."
                    }
                  </p>
                  {!searchQuery && typeFilter === "all" && statusFilter === "all" && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Advertisement
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdvertisements.map((ad: AdvertisementData) => (
                  <Card key={ad._id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {ad.imageUrl ? (
                        <img
                          src={`${BASE_URL}${ad.imageUrl}`}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{ad.title}</h3>
                        <div className="flex gap-1">
                          <Badge className={getTypeColor(ad.type)}>{ad.type}</Badge>
                          <Badge className={getStatusColor(ad.status || "inactive")}>
                            {ad.status || "inactive"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{ad.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Views: {ad.views || 0}</span>
                        <span>Clicks: {ad.clicks || 0}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAdvertisement(ad)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(ad)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
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
                              <AlertDialogAction
                                onClick={() => ad._id && handleDeleteAdvertisement(ad._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Advertisement
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clicks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAdvertisements.map((ad: AdvertisementData) => (
                          <tr key={ad._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {ad.imageUrl ? (
                                    <img
                                      src={`${BASE_URL}${ad.imageUrl}`}
                                      alt={ad.title}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <ImageIcon className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                                  <div className="text-sm text-gray-500 line-clamp-2">{ad.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getTypeColor(ad.type)}>{ad.type}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(ad.status || "inactive")}>
                                {ad.status || "inactive"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {ad.views || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {ad.clicks || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewAdvertisement(ad)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(ad)}
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
                                      <AlertDialogAction
                                        onClick={() => ad._id && handleDeleteAdvertisement(ad._id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advertisement Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advertisement Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Settings configuration coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Advertisement Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Advertisement</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleEditAdvertisement)} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  {...editForm.register("title")}
                  placeholder="Enter advertisement title"
                />
                {editForm.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  {...editForm.register("description")}
                  placeholder="Enter advertisement description"
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editForm.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editForm.watch("type")}
                    onValueChange={(value) => editForm.setValue("type", value as "CCTV" | "WIFI")}
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
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.watch("status") || "active"}
                    onValueChange={(value) => editForm.setValue("status", value as "active" | "inactive")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-image">Image</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    editForm.reset();
                    setImageFile(null);
                    setImagePreview(null);
                    setSelectedAdvertisement(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingAdvertisement}>
                  {isUpdatingAdvertisement ? "Updating..." : "Update Advertisement"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Advertisement Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            {selectedAdvertisement && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedAdvertisement.title}</DialogTitle>
                </DialogHeader>

                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {selectedAdvertisement.imageUrl ? (
                    <img
                      src={`${BASE_URL}${selectedAdvertisement.imageUrl}`}
                      alt={selectedAdvertisement.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                        <Badge className={`mt-1 ${getTypeColor(selectedAdvertisement.type)}`}>
                          {selectedAdvertisement.type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <Badge className={`mt-1 ${getStatusColor(selectedAdvertisement.status || "inactive")}`}>
                          {selectedAdvertisement.status || "inactive"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="mt-1 text-sm">{selectedAdvertisement.description}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Performance</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Views</Label>
                        <p className="mt-1 text-2xl font-bold">{selectedAdvertisement.views || 0}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Clicks</Label>
                        <p className="mt-1 text-2xl font-bold">{selectedAdvertisement.clicks || 0}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="mt-1 text-sm">
                          {selectedAdvertisement.createdAt ? new Date(selectedAdvertisement.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
