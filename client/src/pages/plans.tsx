import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tv, 
  Wifi, 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Star,
  PlayCircle,
  Monitor,
  Radio,
  Crown,
  Shield,
  Smartphone,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Search,
  Filter
} from "lucide-react";
import { generateDummyIptvPlans, generateDummyOttPlans, generateDummyFibrePlans, type IptvPlan, type OttPlan, type FibrePlan } from "@/lib/dummyData";

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState("iptv");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedPlanType, setSelectedPlanType] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Get dummy data
  const iptvPlans = generateDummyIptvPlans();
  const ottPlans = generateDummyOttPlans();
  const fibrePlans = generateDummyFibrePlans();

  // Filter functions
  const filterPlans = (plans: any[]) => {
    return plans.filter(plan => {
      const matchesSearch = plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = selectedProvider === "all" || plan.provider.toLowerCase().includes(selectedProvider.toLowerCase());
      const matchesPlanType = selectedPlanType === "all" || plan.planType.toLowerCase() === selectedPlanType.toLowerCase();
      return matchesSearch && matchesProvider && matchesPlanType;
    });
  };

  // Get unique providers for filter
  const getAllProviders = () => {
    const allPlans = [...iptvPlans, ...ottPlans, ...fibrePlans];
    return [...new Set(allPlans.map(plan => plan.provider))];
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowEditDialog(true);
  };

  const handleDelete = (planId: number) => {
    // In real app, this would delete from backend
    console.log("Delete plan:", planId);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dashboard-welcome-text">Service Plans Management</h1>
            <p className="dashboard-welcome-muted">Manage IPTV, OTT, and Fibre service plans</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="dashboard-stats-card hover:scale-105 transition-transform duration-300"
          >
            <Plus className="h-4 w-4 mr-2 dashboard-welcome-icon" />
            <span className="dashboard-welcome-text">Add New Plan</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">Total Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">
                    {iptvPlans.length + ottPlans.length + fibrePlans.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">IPTV Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">{iptvPlans.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <Tv className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">OTT Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">{ottPlans.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">Fibre Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">{fibrePlans.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="dashboard-chart-card shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 dashboard-welcome-muted" />
                  <Input
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dashboard-welcome-input"
                  />
                </div>
              </div>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full lg:w-[200px] dashboard-welcome-input">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {getAllProviders().map(provider => (
                    <SelectItem key={provider} value={provider.toLowerCase()}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                <SelectTrigger className="w-full lg:w-[200px] dashboard-welcome-input">
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="lite">Lite</SelectItem>
                  <SelectItem value="ott">OTT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plans Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 dashboard-chart-card">
            <TabsTrigger value="iptv" className="flex items-center gap-2 dashboard-welcome-text">
              <Tv className="h-4 w-4" />
              IPTV Plans
            </TabsTrigger>
            <TabsTrigger value="ott" className="flex items-center gap-2 dashboard-welcome-text">
              <PlayCircle className="h-4 w-4" />
              OTT Plans
            </TabsTrigger>
            <TabsTrigger value="fibre" className="flex items-center gap-2 dashboard-welcome-text">
              <Zap className="h-4 w-4" />
              Fibre Plans
            </TabsTrigger>
          </TabsList>

          {/* IPTV Plans */}
          <TabsContent value="iptv">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterPlans(iptvPlans).map((plan) => (
                <Card key={plan.id} className="dashboard-chart-card shadow-lg hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg dashboard-welcome-icon flex items-center justify-center">
                          <Tv className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg dashboard-welcome-text">{plan.name}</CardTitle>
                          <p className="text-sm dashboard-welcome-muted">{plan.provider}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="dashboard-welcome-icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold dashboard-welcome-text">₹{plan.price}</span>
                      <Badge className={`${
                        plan.planType === 'premium' ? 'badge-super-admin' :
                        plan.planType === 'standard' ? 'badge-admin' : 'badge-manager'
                      }`}>
                        {plan.planType} {plan.quality}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.totalChannels} Channels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.payChannels} Premium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.freeToAirChannels} Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.lcoMarginPercent}% LCO</span>
                      </div>
                    </div>

                    <p className="text-sm dashboard-welcome-muted">{plan.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium dashboard-welcome-text">Popular Channels:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.channelList.slice(0, 3).map((channel, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                        {plan.channelList.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.channelList.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* OTT Plans */}
          <TabsContent value="ott">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterPlans(ottPlans).map((plan) => (
                <Card key={plan.id} className="dashboard-chart-card shadow-lg hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg dashboard-welcome-icon flex items-center justify-center">
                          <PlayCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg dashboard-welcome-text">{plan.title}</CardTitle>
                          <p className="text-sm dashboard-welcome-muted">{plan.provider}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="dashboard-welcome-icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold dashboard-welcome-text">₹{plan.price}</span>
                      <Badge className={`${plan.isUnlimited ? 'badge-super-admin' : 'badge-admin'}`}>
                        {plan.isUnlimited ? 'Unlimited' : `${plan.dataLimitGB}GB`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.speedBeforeLimit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.validity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.speedAfterLimit} FUP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">Calls</span>
                      </div>
                    </div>

                    <p className="text-sm dashboard-welcome-muted">{plan.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium dashboard-welcome-text">OTT Apps Included:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.ottApps.slice(0, 3).map((app, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {app}
                          </Badge>
                        ))}
                        {plan.ottApps.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.ottApps.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {plan.callBenefit && (
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.callBenefit}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fibre Plans */}
          <TabsContent value="fibre">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterPlans(fibrePlans).map((plan) => (
                <Card key={plan.id} className="dashboard-chart-card shadow-lg hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg dashboard-welcome-icon flex items-center justify-center">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg dashboard-welcome-text">{plan.title}</CardTitle>
                          <p className="text-sm dashboard-welcome-muted">{plan.provider}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="dashboard-welcome-icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold dashboard-welcome-text">₹{plan.price}</span>
                      <Badge className={`${
                        plan.planType === 'Premium' ? 'badge-super-admin' :
                        plan.planType === 'Standard' ? 'badge-admin' : 'badge-manager'
                      }`}>
                        {plan.planType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.speed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.validity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.dataLimit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">Fiber</span>
                      </div>
                    </div>

                    <p className="text-sm dashboard-welcome-muted">{plan.description}</p>

                    {plan.benefits && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium dashboard-welcome-text">Benefits:</p>
                        <Badge variant="secondary" className="text-xs">
                          {plan.benefits}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Plan Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl dashboard-chart-card">
            <DialogHeader>
              <DialogTitle className="dashboard-welcome-text">Add New Service Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dashboard-welcome-text">Plan Type</Label>
                  <Select>
                    <SelectTrigger className="dashboard-welcome-input">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iptv">IPTV Plan</SelectItem>
                      <SelectItem value="ott">OTT Plan</SelectItem>
                      <SelectItem value="fibre">Fibre Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="dashboard-welcome-text">Provider</Label>
                  <Input placeholder="Provider name" className="dashboard-welcome-input" />
                </div>
              </div>
              <div>
                <Label className="dashboard-welcome-text">Plan Name/Title</Label>
                <Input placeholder="Enter plan name" className="dashboard-welcome-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dashboard-welcome-text">Price (₹)</Label>
                  <Input type="number" placeholder="0" className="dashboard-welcome-input" />
                </div>
                <div>
                  <Label className="dashboard-welcome-text">Validity</Label>
                  <Input placeholder="e.g., 1 Month, 6 Months" className="dashboard-welcome-input" />
                </div>
              </div>
              <div>
                <Label className="dashboard-welcome-text">Description</Label>
                <Textarea placeholder="Plan description" className="dashboard-welcome-input" />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button className="dashboard-stats-card">
                  <span className="dashboard-welcome-text">Add Plan</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Plan Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl dashboard-chart-card">
            <DialogHeader>
              <DialogTitle className="dashboard-welcome-text">Edit Plan</DialogTitle>
            </DialogHeader>
            {editingPlan && (
              <div className="space-y-4">
                <div>
                  <Label className="dashboard-welcome-text">Plan Name/Title</Label>
                  <Input 
                    defaultValue={editingPlan.name || editingPlan.title} 
                    className="dashboard-welcome-input" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-welcome-text">Price (₹)</Label>
                    <Input 
                      type="number" 
                      defaultValue={editingPlan.price}
                      className="dashboard-welcome-input" 
                    />
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Provider</Label>
                    <Input 
                      defaultValue={editingPlan.provider}
                      className="dashboard-welcome-input" 
                    />
                  </div>
                </div>
                <div>
                  <Label className="dashboard-welcome-text">Description</Label>
                  <Textarea 
                    defaultValue={editingPlan.description}
                    className="dashboard-welcome-input" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked={editingPlan.isActive} />
                  <Label className="dashboard-welcome-text">Active Plan</Label>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="dashboard-stats-card">
                    <span className="dashboard-welcome-text">Save Changes</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}