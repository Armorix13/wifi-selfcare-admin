import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertServicePlanSchema, type InsertServicePlan } from "@shared/schema";

export default function Plans() {
  const { toast } = useToast();

  // Dummy service plans data
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Basic 50 Mbps",
      provider: "jio",
      speed: "50 Mbps",
      price: 499,
      validity: 30,
      description: "Perfect for small families with basic internet needs",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      name: "Premium 100 Mbps",
      provider: "jio",
      speed: "100 Mbps", 
      price: 799,
      validity: 30,
      description: "High-speed internet for streaming and gaming",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 3,
      name: "Ultra 200 Mbps",
      provider: "airtel",
      speed: "200 Mbps",
      price: 1299,
      validity: 30,
      description: "Ultra-fast speeds for heavy usage and multiple devices",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 4,
      name: "Economy 25 Mbps",
      provider: "bsnl",
      speed: "25 Mbps",
      price: 299,
      validity: 30,
      description: "Budget-friendly option for basic browsing",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 5,
      name: "Business 500 Mbps",
      provider: "my-internet",
      speed: "500 Mbps",
      price: 2999,
      validity: 30,
      description: "Enterprise-grade connectivity for businesses",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z"
    }
  ]);

  const isLoading = false;

  const form = useForm<InsertServicePlan>({
    resolver: zodResolver(insertServicePlanSchema),
    defaultValues: {
      name: "",
      provider: "jio",
      speed: "",
      price: 0,
      validity: 30,
      description: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertServicePlan) => {
    const newPlan = {
      id: Math.max(...plans.map(p => p.id)) + 1,
      ...data,
      createdAt: new Date().toISOString()
    };
    setPlans([...plans, newPlan]);
    toast({
      title: "Success",
      description: "Service plan added successfully",
    });
    form.reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this service plan?")) {
      setPlans(plans.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Service plan deleted successfully",
      });
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "jio":
        return { name: "Jio Fiber", color: "bg-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50" };
      case "airtel":
        return { name: "Airtel Xstream", color: "bg-red-600", textColor: "text-red-600", bgColor: "bg-red-50" };
      case "bsnl":
        return { name: "BSNL Broadband", color: "bg-green-600", textColor: "text-green-600", bgColor: "bg-green-50" };
      case "my-internet":
        return { name: "My Internet", color: "bg-purple-600", textColor: "text-purple-600", bgColor: "bg-purple-50" };
      default:
        return { name: provider, color: "bg-gray-600", textColor: "text-gray-600", bgColor: "bg-gray-50" };
    }
  };

  const groupedPlans = plans.reduce((acc: any, plan: any) => {
    if (!acc[plan.provider]) {
      acc[plan.provider] = [];
    }
    acc[plan.provider].push(plan);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <MainLayout title="Service Plans">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Service Plans">
      <div className="space-y-6">
        {/* Add Plan Form */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Add New Service Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="provider">Service Provider</Label>
                <Select
                  value={form.watch("provider")}
                  onValueChange={(value) => form.setValue("provider", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jio">Jio Fiber</SelectItem>
                    <SelectItem value="airtel">Airtel Xstream</SelectItem>
                    <SelectItem value="bsnl">BSNL Broadband</SelectItem>
                    <SelectItem value="my-internet">My Internet</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.provider && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.provider.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  placeholder="Enter plan name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="speed">Speed</Label>
                <Input
                  id="speed"
                  placeholder="e.g., 100 Mbps"
                  {...form.register("speed")}
                />
                {form.formState.errors.speed && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.speed.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.price.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="validity">Validity (Days)</Label>
                <Input
                  id="validity"
                  type="number"
                  placeholder="e.g., 30"
                  {...form.register("validity", { valueAsNumber: true })}
                />
                {form.formState.errors.validity && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.validity.message}</p>
                )}
              </div>
              
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={createPlanMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createPlanMutation.isPending ? "Adding..." : "Add Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Plans by Provider */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(groupedPlans).map(([provider, providerPlans]: [string, any]) => {
            const providerInfo = getProviderInfo(provider);
            return (
              <Card key={provider} className="border border-slate-200">
                <CardHeader className={`${providerInfo.bgColor} border-b border-slate-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 ${providerInfo.color} rounded-lg flex items-center justify-center mr-3`}>
                        <span className="text-white font-bold text-sm">
                          {providerInfo.name[0]}
                        </span>
                      </div>
                      <CardTitle className="font-semibold text-gray-900">
                        {providerInfo.name} Plans
                      </CardTitle>
                    </div>
                    <span className="text-sm text-gray-500">
                      {providerPlans.length} plans
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {providerPlans.map((plan: any) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{plan.name}</p>
                        <p className="text-sm text-gray-500">
                          {plan.speed} • ₹{plan.price}/{plan.validity === 30 ? 'month' : `${plan.validity} days`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
