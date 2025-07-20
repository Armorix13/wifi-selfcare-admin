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
import { UserPlus, MapPin, Phone, Mail, Star, Edit, Trash2, Search, Filter, Grid, List, Eye, Settings, Activity, Users, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { generateDummyEngineers, type Engineer } from "@/lib/dummyData";

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
type EngineerData = Engineer;

export default function Engineers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerData | null>(null);
  const itemsPerPage = 6;

  const { toast } = useToast();

  // Load dummy data
  const [engineers, setEngineers] = useState(generateDummyEngineers());

  const form = useForm<InsertEngineer>({
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

  const editForm = useForm<InsertEngineer>({
    resolver: zodResolver(insertEngineerSchema),
  });

  // Filter engineers based on search and filter criteria
  const filteredEngineers = engineers.filter((engineer) => {
    const matchesSearch = 
      engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && engineer.isActive) ||
      (statusFilter === "inactive" && !engineer.isActive);
    
    const matchesLocation = locationFilter === "all" || engineer.location === locationFilter;
    const matchesSpecialization = specializationFilter === "all" || engineer.specialization === specializationFilter;

    return matchesSearch && matchesStatus && matchesLocation && matchesSpecialization;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);
  const currentEngineers = filteredEngineers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateEngineer = (data: InsertEngineer) => {
    const newEngineer: EngineerData = {
      ...data,
      id: Math.max(...engineers.map(e => e.id)) + 1,
      createdAt: new Date().toISOString(),
    };
    setEngineers([...engineers, newEngineer]);
    toast({
      title: "Success",
      description: "Engineer created successfully",
    });
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleEditEngineer = (data: InsertEngineer) => {
    const updatedEngineers = engineers.map(engineer => 
      engineer.id === selectedEngineer?.id ? { ...engineer, ...data } : engineer
    );
    setEngineers(updatedEngineers);
    toast({
      title: "Success",
      description: "Engineer updated successfully",
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteEngineer = (engineerId: number) => {
    setEngineers(engineers.filter(engineer => engineer.id !== engineerId));
    toast({
      title: "Success",
      description: "Engineer deleted successfully",
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={`${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} border-0`}>
        {isActive ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <X className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const stats = {
    total: engineers.length,
    active: engineers.filter(e => e.isActive).length,
    inactive: engineers.filter(e => !e.isActive).length,
    avgRating: engineers.reduce((sum, e) => sum + e.rating, 0) / engineers.length,
  };

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
                  <p className="text-sm font-medium text-muted-foreground">Active Engineers</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
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
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {Array.from(new Set(engineers.map(e => e.location))).map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Engineer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleCreateEngineer)} className="space-y-4">
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
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input {...form.register("specialization")} />
                        </div>
                        <div>
                          <Label htmlFor="rating">Rating</Label>
                          <Input {...form.register("rating", { valueAsNumber: true })} type="number" min="0" max="5" step="0.1" />
                        </div>
                        <div>
                          <Label htmlFor="completedJobs">Completed Jobs</Label>
                          <Input {...form.register("completedJobs", { valueAsNumber: true })} type="number" min="0" />
                        </div>
                        <div>
                          <Label htmlFor="activeJobs">Active Jobs</Label>
                          <Input {...form.register("activeJobs", { valueAsNumber: true })} type="number" min="0" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Engineer</Button>
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
            {currentEngineers.map((engineer) => (
              <Card key={engineer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{engineer.name}</h3>
                        <p className="text-sm text-muted-foreground">{engineer.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(engineer.isActive)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {engineer.phone}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {engineer.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Settings className="w-4 h-4 mr-2" />
                      {engineer.specialization}
                    </div>
                  </div>

                  <div className="mb-4">
                    {getRatingStars(engineer.rating)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium ml-1">{engineer.completedJobs}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-medium ml-1">{engineer.activeJobs}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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
                        editForm.reset(engineer);
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
                          <AlertDialogTitle>Delete Engineer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this engineer? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEngineer(engineer.id)}>
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
                data={currentEngineers}
                columns={[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "location", label: "Location" },
                  { key: "specialization", label: "Specialization" },
                  { 
                    key: "rating", 
                    label: "Rating",
                    render: (value) => getRatingStars(value)
                  },
                  { 
                    key: "isActive", 
                    label: "Status",
                    render: (value) => getStatusBadge(value)
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (_, engineer) => (
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEngineers.length)} of {filteredEngineers.length} engineers
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