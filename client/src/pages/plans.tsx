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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, Star, Users, Trash2, Edit, CheckCircle, Zap, Shield, Globe, TrendingUp, Award, Crown, 
  Eye, Plus, Search, Filter, BarChart3, DollarSign, Calendar, Activity, ChevronLeft, ChevronRight,
  Package, Sparkles, Target, Clock, ThumbsUp, Building2, Home, Smartphone, MonitorSpeaker
} from "lucide-react";
import { z } from "zod";
import { dummyServicePlans, type ServicePlan } from "@/lib/dummyData";

// Local type definitions
const insertServicePlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  title: z.string().min(1, "Plan title is required"),
  provider: z.string().min(1, "Provider is required"),
  speed: z.string().min(1, "Speed is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  validity: z.string().min(1, "Validity is required"),
  dataLimit: z.string().min(1, "Data limit is required"),
  benefits: z.string().min(1, "Benefits are required"),
  description: z.string().min(1, "Description is required"),
  planType: z.enum(["Basic", "Premium", "Gold", "Enterprise"]),
  logo: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type InsertServicePlan = z.infer<typeof insertServicePlanSchema>;

// Provider type for compatibility
type ProviderType = "jio" | "airtel" | "bsnl" | "my-internet";

export default function Plans() {
  const { toast } = useToast();

  // Load dummy data
  const [plans, setPlans] = useState(dummyServicePlans);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedPlanType, setSelectedPlanType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [viewPlan, setViewPlan] = useState<ServicePlan | null>(null);
  
  const itemsPerPage = 6;
  const isLoading = false;

  // Calculate analytics
  const analyticsData = {
    totalPlans: plans.length,
    totalSubscribers: plans.reduce((sum, plan) => sum + plan.subscribers, 0),
    averageRating: (plans.reduce((sum, plan) => sum + plan.rating, 0) / plans.length).toFixed(1),
    totalRevenue: plans.reduce((sum, plan) => sum + (plan.price * plan.subscribers), 0),
    activePlans: plans.filter(plan => plan.isActive).length,
    premiumPlans: plans.filter(plan => plan.planType === 'Premium' || plan.planType === 'Gold').length,
    providers: Array.from(new Set(plans.map(plan => plan.provider))).length,
    averagePrice: Math.round(plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length)
  };

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === "all" || plan.provider === selectedProvider;
    const matchesPlanType = selectedPlanType === "all" || plan.planType === selectedPlanType;
    
    return matchesSearch && matchesProvider && matchesPlanType;
  });

  // Get unique providers and plan types for filters
  const uniqueProviders = Array.from(new Set(plans.map(plan => plan.provider)));
  const uniquePlanTypes = Array.from(new Set(plans.map(plan => plan.planType)));

  // Paginate results
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const form = useForm<InsertServicePlan>({
    resolver: zodResolver(insertServicePlanSchema),
    defaultValues: editingPlan ? {
      name: editingPlan.name,
      title: editingPlan.title || editingPlan.name,
      provider: editingPlan.provider,
      speed: editingPlan.speed,
      price: editingPlan.price,
      validity: editingPlan.validity.toString(),
      dataLimit: editingPlan.dataLimit || "Unlimited",
      benefits: editingPlan.benefits || "",
      description: editingPlan.description,
      planType: editingPlan.planType || "Basic",
      logo: editingPlan.logo || "",
      isActive: editingPlan.isActive,
    } : {
      name: "",
      title: "",
      provider: "jio",
      speed: "",
      price: 0,
      validity: "30",
      dataLimit: "Unlimited",
      benefits: "",
      description: "",
      planType: "Basic",
      logo: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertServicePlan) => {
    if (editingPlan) {
      // Update existing plan
      const updatedPlan: ServicePlan = {
        ...editingPlan,
        ...data,
        provider: data.provider as ProviderType,
        features: editingPlan.features, // Keep existing features
        subscribers: editingPlan.subscribers,
        rating: editingPlan.rating,
      };
      setPlans(plans.map(p => p.id === editingPlan.id ? updatedPlan : p));
      toast({
        title: "Success",
        description: "Service plan updated successfully",
      });
      setEditingPlan(null);
    } else {
      // Create new plan
      const newPlan: ServicePlan = {
        id: Math.max(...plans.map(p => p.id)) + 1,
        ...data,
        provider: data.provider as ProviderType,
        features: ["Unlimited Data", "24/7 Support", "Free Installation"],
        subscribers: 0,
        rating: 4.0,
        createdAt: new Date().toISOString()
      };
      setPlans([...plans, newPlan]);
      toast({
        title: "Success",
        description: "Service plan created successfully",
      });
    }
    setIsCreateOpen(false);
    setEditingPlan(null);
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
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Plans</p>
                <p className="text-2xl font-bold text-blue-900">{analyticsData.totalPlans}</p>
                <p className="text-blue-600 text-xs">{analyticsData.activePlans} active</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Subscribers</p>
                <p className="text-2xl font-bold text-green-900">{analyticsData.totalSubscribers.toLocaleString()}</p>
                <p className="text-green-600 text-xs">Across all plans</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900">{formatPrice(analyticsData.totalRevenue)}</p>
                <p className="text-purple-600 text-xs">Monthly estimated</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-900">{analyticsData.averageRating}</p>
                <p className="text-yellow-600 text-xs">Customer satisfaction</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* Quick Stats Bar */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Premium Plans</p>
              <p className="text-xl font-bold">{analyticsData.premiumPlans}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Providers</p>
              <p className="text-xl font-bold">{analyticsData.providers}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-xl font-bold">{formatPrice(analyticsData.averagePrice)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Active Rate</p>
              <p className="text-xl font-bold">{Math.round((analyticsData.activePlans / analyticsData.totalPlans) * 100)}%</p>
            </div>
          </div>
        </Card>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {uniqueProviders.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {getProviderInfo(provider).name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniquePlanTypes.map(planType => (
                    <SelectItem key={planType} value={planType}>
                      {planType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Plan Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., JioFiber Gold Plan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., JioFiber Gold Plan - 1 Year" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="jio">Jio Fiber</SelectItem>
                                <SelectItem value="airtel">Airtel Xstream</SelectItem>
                                <SelectItem value="bsnl">BSNL</SelectItem>
                                <SelectItem value="my-internet">My Internet</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="planType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select plan type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Basic">Basic</SelectItem>
                                <SelectItem value="Premium">Premium</SelectItem>
                                <SelectItem value="Gold">Gold</SelectItem>
                                <SelectItem value="Enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="speed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Speed</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 300 Mbps" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dataLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Limit</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Unlimited" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="validity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validity</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 12 Months" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Pricing & Logo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pricing & Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 8499" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourcdn.com/logos/jio.png" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Benefits & Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Features & Benefits</h3>
                    <FormField
                      control={form.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benefits</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Netflix + Prime + Disney+ Hotstar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="JioFiber Gold Plan offers blazing 300 Mbps speed with unlimited data, making it ideal for large families or work-from-home setups. Includes major OTT subscriptions." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateOpen(false);
                        setEditingPlan(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPlans.map((plan: ServicePlan) => {
            const providerInfo = getProviderInfo(plan.provider);
            return (
              <Card key={plan.id} className="group hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden relative">
                {/* Plan Type Badge */}
                {plan.planType && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge 
                      className={`
                        ${plan.planType === 'Enterprise' ? 'bg-purple-600 text-white' : ''}
                        ${plan.planType === 'Premium' ? 'bg-blue-600 text-white' : ''}
                        ${plan.planType === 'Gold' ? 'bg-yellow-600 text-white' : ''}
                        ${plan.planType === 'Basic' ? 'bg-gray-600 text-white' : ''}
                      `}
                    >
                      {plan.planType}
                    </Badge>
                  </div>
                )}

                {/* Provider Header */}
                <div className={`bg-gradient-to-r ${providerInfo.gradientFrom} ${providerInfo.gradientTo} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        {plan.logo ? (
                          <img 
                            src={plan.logo} 
                            alt={`${providerInfo.name} logo`}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) nextElement.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span 
                          className={`text-white font-bold ${plan.logo ? 'hidden' : 'block'}`}
                          style={{ display: plan.logo ? 'none' : 'block' }}
                        >
                          {providerInfo.logo}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{providerInfo.name}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <span className="text-white/90 text-sm">{plan.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">{formatPrice(plan.price)}</p>
                      <p className="text-white/80 text-sm">{plan.validity}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Content */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Plan Name & Speed */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{plan.title || plan.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getSpeedIcon(plan.speed)}
                          <span className="font-semibold text-blue-600">{plan.speed}</span>
                        </div>
                        <span className="text-sm text-gray-500">{plan.dataLimit || 'Unlimited'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2">{plan.description}</p>

                    {/* Benefits */}
                    {plan.benefits && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">✨ {plan.benefits}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Subscribers</p>
                        <p className="font-bold text-lg">{plan.subscribers.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Rating</p>
                        <div className="flex items-center justify-center space-x-1">
                          {getRatingBadge(plan.rating)}
                          <span className="font-bold text-lg">{plan.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/plans/${plan.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPlan(plan);
                          setIsCreateOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPlans.length)} of {filteredPlans.length} plans
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* View Plan Modal */}
        <Dialog open={viewPlan !== null} onOpenChange={() => setViewPlan(null)}>
          <DialogContent className="max-w-2xl">
            {viewPlan && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getProviderInfo(viewPlan.provider).color}`}>
                      <span className="text-white font-bold text-sm">{getProviderInfo(viewPlan.provider).logo}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewPlan.title || viewPlan.name}</h2>
                      <p className="text-sm text-gray-500">{getProviderInfo(viewPlan.provider).name}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Key Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Speed</p>
                      <p className="font-bold">{viewPlan.speed}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-bold">{formatPrice(viewPlan.price)}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Validity</p>
                      <p className="font-bold">{viewPlan.validity}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Subscribers</p>
                      <p className="font-bold">{viewPlan.subscribers.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{viewPlan.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {viewPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  {viewPlan.benefits && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2 text-green-700">Special Benefits</h3>
                      <p className="text-green-600">{viewPlan.benefits}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}