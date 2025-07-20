import { useLocation, useParams } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Star, Users, Calendar, DollarSign, Zap, Globe, Shield, 
  CheckCircle, Crown, Award, Building2, Smartphone, MonitorSpeaker,
  TrendingUp, Activity, Target, Clock, ThumbsUp, Package
} from "lucide-react";
import { dummyServicePlans, type ServicePlan } from "@/lib/dummyData";

export default function PlanDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  
  const planId = params.id ? parseInt(params.id) : null;
  const plan = planId ? dummyServicePlans.find(p => p.id === planId) : null;

  if (!plan) {
    return (
      <MainLayout title="Plan Not Found">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">The plan you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/plans")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </div>
      </MainLayout>
    );
  }

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

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rating >= 4.0) return <Award className="w-5 h-5 text-green-500" />;
    return <Star className="w-5 h-5 text-gray-500" />;
  };

  const getSpeedIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum >= 200) return <Zap className="w-6 h-6 text-yellow-500" />;
    if (speedNum >= 100) return <Globe className="w-6 h-6 text-blue-500" />;
    if (speedNum >= 50) return <Shield className="w-6 h-6 text-green-500" />;
    return <MonitorSpeaker className="w-6 h-6 text-gray-500" />;
  };

  const providerInfo = getProviderInfo(plan.provider);

  return (
    <MainLayout title={`${plan.title || plan.name} - Plan Details`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setLocation("/plans")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
          <div className="flex items-center space-x-2">
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
            <Badge variant={plan.isActive ? "default" : "secondary"}>
              {plan.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-r ${providerInfo.gradientFrom} ${providerInfo.gradientTo} p-8`}>
            <div className="flex items-start justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{providerInfo.logo}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{plan.title || plan.name}</h1>
                  <p className="text-white/90 text-lg">{providerInfo.name}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRatingBadge(plan.rating)}
                    <span className="text-white/90">{plan.rating}/5</span>
                    <span className="text-white/70">•</span>
                    <span className="text-white/90">{plan.subscribers.toLocaleString()} subscribers</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-lg">Starting at</p>
                <p className="text-4xl font-bold">{formatPrice(plan.price)}</p>
                <p className="text-white/80">{plan.validity}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              {getSpeedIcon(plan.speed)}
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Speed</h3>
            <p className="text-2xl font-bold text-blue-600">{plan.speed}</p>
            <p className="text-blue-600 text-sm">{plan.dataLimit || 'Unlimited'}</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-1">Price</h3>
            <p className="text-2xl font-bold text-green-600">{formatPrice(plan.price)}</p>
            <p className="text-green-600 text-sm">Monthly billing</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-1">Validity</h3>
            <p className="text-2xl font-bold text-purple-600">{plan.validity}</p>
            <p className="text-purple-600 text-sm">Contract period</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-orange-900 mb-1">Subscribers</h3>
            <p className="text-2xl font-bold text-orange-600">{plan.subscribers.toLocaleString()}</p>
            <p className="text-orange-600 text-sm">Active users</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Plan Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{plan.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Features & Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.benefits && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">🎁 Special Benefits</h4>
                    <p className="text-green-600">{plan.benefits}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Performance Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                      <span className="text-sm font-bold text-green-600">{Math.round(plan.rating * 20)}%</span>
                    </div>
                    <Progress value={plan.rating * 20} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Market Share</span>
                      <span className="text-sm font-bold text-blue-600">{Math.round((plan.subscribers / 50000) * 100)}%</span>
                    </div>
                    <Progress value={(plan.subscribers / 50000) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Network Uptime</span>
                      <span className="text-sm font-bold text-green-600">99.{Math.floor(Math.random() * 10)}%</span>
                    </div>
                    <Progress value={99} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Speed Reliability</span>
                      <span className="text-sm font-bold text-blue-600">{85 + Math.floor(Math.random() * 15)}%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plan Type</span>
                  <Badge variant="outline">{plan.planType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-medium">{providerInfo.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Usage Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Usage Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Avg. Session Time</p>
                  <p className="text-lg font-bold">{3 + Math.floor(Math.random() * 5)}h {Math.floor(Math.random() * 60)}m</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ThumbsUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Customer Retention</p>
                  <p className="text-lg font-bold">{85 + Math.floor(Math.random() * 15)}%</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Building2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Enterprise Clients</p>
                  <p className="text-lg font-bold">{Math.floor(plan.subscribers * 0.15).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Revenue Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(plan.price * plan.subscribers)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((plan.price * plan.subscribers) / 10000000 * 100).toFixed(1)}% of total revenue
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}