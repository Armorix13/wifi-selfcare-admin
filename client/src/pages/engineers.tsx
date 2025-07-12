import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MapPin, Phone, Mail, Star, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEngineerSchema, type InsertEngineer } from "@shared/schema";

export default function Engineers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: engineers = [], isLoading } = useQuery({
    queryKey: ["/api/engineers"],
  });

  const form = useForm<InsertEngineer>({
    resolver: zodResolver(insertEngineerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      specialization: "",
      rating: 0,
      completedJobs: 0,
      activeJobs: 0,
      isActive: true,
    },
  });

  const createEngineerMutation = useMutation({
    mutationFn: async (data: InsertEngineer) => {
      const response = await apiRequest("POST", "/api/engineers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineers"] });
      toast({
        title: "Success",
        description: "Engineer added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add engineer",
        variant: "destructive",
      });
    },
  });

  const deleteEngineerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/engineers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineers"] });
      toast({
        title: "Success",
        description: "Engineer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete engineer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEngineer) => {
    createEngineerMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this engineer?")) {
      deleteEngineerMutation.mutate(id);
    }
  };

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
    const stars = Math.floor(rating / 10); // Convert to 5-star scale
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
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Engineer Management
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                      disabled={createEngineerMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createEngineerMutation.isPending ? "Adding..." : "Add Engineer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineers.map((engineer: any, index: number) => (
              <div
                key={engineer.id}
                className="bg-slate-50 rounded-lg p-6 border border-slate-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`h-12 w-12 ${getAvatarColor(
                      index
                    )} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white font-medium">
                      {getInitials(engineer.name)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{engineer.name}</h4>
                    <p className="text-sm text-gray-500">{engineer.specialization}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{engineer.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{engineer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{engineer.email}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Active Cases:</span>
                    <span className="font-medium text-gray-900">{engineer.activeJobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-medium text-gray-900">{engineer.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rating:</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-1">
                        {(engineer.rating / 10).toFixed(1)}
                      </span>
                      {renderStars(engineer.rating)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(engineer.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
