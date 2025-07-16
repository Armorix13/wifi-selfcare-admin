import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { insertServicePlanSchema, type InsertServicePlan } from "@shared/schema";
import { Wifi, Star, Users, Trash2, Edit, CheckCircle, Zap, Shield, Globe, TrendingUp, Award, Crown } from "lucide-react";

export default function Plans() {
  const { toast } = useToast();

  // Enhanced service plans data with more realistic options
  const [plans, setPlans] = useState([
    // Jio Fiber Plans
    {
      id: 1,
      name: "JioFiber Basic",
      provider: "jio",
      speed: "30 Mbps",
      price: 399,
      validity: 30,
      description: "Perfect for browsing, video calls, and light streaming",
      isActive: true,
      features: ["100 GB FUP", "Free Router", "Jio Apps"],
      subscribers: 1250,
      rating: 4.2,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      name: "JioFiber Premium",
      provider: "jio",
      speed: "100 Mbps",
      price: 699,
      validity: 30,
      description: "High-speed internet for streaming and gaming",
      isActive: true,
      features: ["Unlimited Data", "Netflix Basic", "Disney+ Hotstar", "Free Router"],
      subscribers: 2100,
      rating: 4.5,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 3,
      name: "JioFiber Ultra",
      provider: "jio",
      speed: "200 Mbps",
      price: 999,
      validity: 30,
      description: "Ultra-fast speeds for heavy usage and multiple devices",
      isActive: true,
      features: ["Unlimited Data", "Netflix Premium", "Amazon Prime", "Free Router"],
      subscribers: 1800,
      rating: 4.7,
      createdAt: "2024-01-15T10:00:00Z"
    },
    // Airtel Plans
    {
      id: 4,
      name: "Airtel Xstream Essential",
      provider: "airtel",
      speed: "40 Mbps",
      price: 499,
      validity: 30,
      description: "Reliable connectivity for home and work",
      isActive: true,
      features: ["Unlimited Data", "Airtel Xstream App", "Free Installation"],
      subscribers: 950,
      rating: 4.3,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 5,
      name: "Airtel Xstream Entertainment",
      provider: "airtel",
      speed: "100 Mbps",
      price: 799,
      validity: 30,
      description: "Entertainment-focused plan with OTT benefits",
      isActive: true,
      features: ["Unlimited Data", "Netflix", "Amazon Prime", "Disney+ Hotstar"],
      subscribers: 1600,
      rating: 4.6,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 6,
      name: "Airtel Xstream VIP",
      provider: "airtel",
      speed: "200 Mbps",
      price: 1199,
      validity: 30,
      description: "Premium experience with fastest speeds",
      isActive: true,
      features: ["Unlimited Data", "All OTT Apps", "Priority Support", "Free Router"],
      subscribers: 1200,
      rating: 4.8,
      createdAt: "2024-01-15T10:00:00Z"
    },
    // BSNL Plans
    {
      id: 7,
      name: "BSNL Fiber Basic",
      provider: "bsnl",
      speed: "25 Mbps",
      price: 329,
      validity: 30,
      description: "Budget-friendly option for basic browsing",
      isActive: true,
      features: ["50 GB FUP", "Email Support", "Local Calling"],
      subscribers: 800,
      rating: 3.8,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 8,
      name: "BSNL Fiber Standard",
      provider: "bsnl",
      speed: "50 Mbps",
      price: 449,
      validity: 30,
      description: "Reliable government broadband service",
      isActive: true,
      features: ["Unlimited Data", "Email Support", "Government Backing"],
      subscribers: 1100,
      rating: 4.0,
      createdAt: "2024-01-15T10:00:00Z"
    },
    // My Internet Plans
    {
      id: 9,
      name: "My Internet Pro",
      provider: "my-internet",
      speed: "150 Mbps",
      price: 899,
      validity: 30,
      description: "Local ISP with personalized service",
      isActive: true,
      features: ["Unlimited Data", "24/7 Support", "Static IP Optional"],
      subscribers: 450,
      rating: 4.4,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 10,
      name: "My Internet Business",
      provider: "my-internet",
      speed: "500 Mbps",
      price: 2499,
      validity: 30,
      description: "Enterprise-grade connectivity for businesses",
      isActive: true,
      features: ["Unlimited Data", "Dedicated Support", "Static IP", "99.9% Uptime"],
      subscribers: 180,
      rating: 4.9,
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
      features: ["Unlimited Data", "24/7 Support"],
      subscribers: 0,
      rating: 4.0,
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
        return { 
          name: "Jio Fiber", 
          color: "bg-blue-600", 
          textColor: "text-blue-600", 
          bgColor: "bg-blue-50",
          gradientFrom: "from-blue-500",
          gradientTo: "to-blue-700",
          logo: "JF"
        };
      case "airtel":
        return { 
          name: "Airtel Xstream", 
          color: "bg-red-600", 
          textColor: "text-red-600", 
          bgColor: "bg-red-50",
          gradientFrom: "from-red-500",
          gradientTo: "to-red-700",
          logo: "AX"
        };
      case "bsnl":
        return { 
          name: "BSNL Broadband", 
          color: "bg-green-600", 
          textColor: "text-green-600", 
          bgColor: "bg-green-50",
          gradientFrom: "from-green-500",
          gradientTo: "to-green-700",
          logo: "BS"
        };
      case "my-internet":
        return { 
          name: "My Internet", 
          color: "bg-purple-600", 
          textColor: "text-purple-600", 
          bgColor: "bg-purple-50",
          gradientFrom: "from-purple-500",
          gradientTo: "to-purple-700",
          logo: "MI"
        };
      default:
        return { 
          name: provider, 
          color: "bg-gray-600", 
          textColor: "text-gray-600", 
          bgColor: "bg-gray-50",
          gradientFrom: "from-gray-500",
          gradientTo: "to-gray-700",
          logo: "GN"
        };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSpeedIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum >= 200) return <Zap className="w-5 h-5 text-yellow-500" />;
    if (speedNum >= 100) return <Globe className="w-5 h-5 text-blue-500" />;
    if (speedNum >= 50) return <Wifi className="w-5 h-5 text-green-500" />;
    return <Shield className="w-5 h-5 text-gray-500" />;
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rating >= 4.0) return <Award className="w-4 h-4 text-green-500" />;
    return <Star className="w-4 h-4 text-gray-500" />;
  };

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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Add Plan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modern Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const providerInfo = getProviderInfo(plan.provider);
            return (
              <Card key={plan.id} className="group hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden">
                {/* Provider Header */}
                <div className={`bg-gradient-to-r ${providerInfo.gradientFrom} ${providerInfo.gradientTo} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{providerInfo.logo}</span>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-medium">{providerInfo.name}</p>
                        <div className="flex items-center space-x-1">
                          {getRatingBadge(plan.rating)}
                          <span className="text-white/80 text-xs">{plan.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">{formatPrice(plan.price)}</p>
                      <p className="text-white/80 text-xs">per month</p>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Plan Name & Speed */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                        <div className="flex items-center space-x-1">
                          {getSpeedIcon(plan.speed)}
                          <span className="text-sm font-medium text-gray-600">{plan.speed}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        Features
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {plan.features?.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-xs text-gray-500">Subscribers</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {plan.subscribers?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-xs text-gray-500">Rating</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {plan.rating || '4.0'}/5
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          toast({
                            title: "Edit Plan",
                            description: "Edit functionality will be added soon",
                          });
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}