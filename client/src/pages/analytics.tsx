import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import { StatusChart } from "@/components/charts/status-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { HeatmapChart } from "@/components/charts/heatmap-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  DollarSign, 
  Activity, 
  Shield, 
  Zap,
  Network,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  // Comprehensive analytics data for admin panel
  const stats = {
    revenue: {
      monthly: 147500,
      growth: 12.4,
      target: 150000,
      customers: 1847
    },
    operations: {
      uptime: 99.7,
      responseTime: 0.8,
      satisfaction: 4.6,
      engineerEfficiency: 91.2
    },
    issues: {
      total: 89,
      resolved: 76,
      pending: 8,
      inProgress: 5,
      resolutionRate: 85.4
    },
    performance: {
      networkHealth: 97.3,
      systemLoad: 68.2,
      alertsActive: 3,
      slaCompliance: 99.1
    }
  };
  
  const isLoading = false;

  if (isLoading) {
    return (
      <MainLayout title="Analytics Dashboard">
        <div className="animate-pulse space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-xl shadow-sm p-6 border">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Analytics Dashboard">
      <div className="space-y-8 p-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive business intelligence and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Monthly Revenue"
            value={`$${(stats.revenue.monthly / 1000).toFixed(0)}K`}
            icon={DollarSign}
            iconColor="text-green-600"
            change={`+${stats.revenue.growth}%`}
            changeType="positive"
          />
          <StatsCard
            title="System Uptime"
            value={`${stats.operations.uptime}%`}
            icon={Activity}
            iconColor="text-blue-600"
            change="99.7% target"
            changeType="neutral"
          />
          <StatsCard
            title="Customer Satisfaction"
            value={`${stats.operations.satisfaction}/5`}
            icon={Star}
            iconColor="text-yellow-600"
            change="+0.3 vs last month"
            changeType="positive"
          />
          <StatsCard
            title="Issue Resolution"
            value={`${stats.issues.resolutionRate}%`}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            change={`${stats.issues.resolved}/${stats.issues.total} resolved`}
            changeType="neutral"
          />
        </div>

        {/* Advanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-blue-700">
                <Network className="h-4 w-4 mr-2" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.performance.networkHealth}%</div>
              <Progress value={stats.performance.networkHealth} className="mt-2 h-2" />
              <p className="text-xs text-blue-600 mt-2">Excellent performance</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-orange-700">
                <Zap className="h-4 w-4 mr-2" />
                System Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.performance.systemLoad}%</div>
              <Progress value={stats.performance.systemLoad} className="mt-2 h-2" />
              <p className="text-xs text-orange-600 mt-2">Optimal range</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.performance.alertsActive}</div>
              <div className="flex gap-1 mt-2">
                <Badge variant="destructive" className="text-xs">High: 1</Badge>
                <Badge variant="outline" className="text-xs">Med: 2</Badge>
              </div>
              <p className="text-xs text-red-600 mt-2">Require attention</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-green-700">
                <Target className="h-4 w-4 mr-2" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.performance.slaCompliance}%</div>
              <Progress value={stats.performance.slaCompliance} className="mt-2 h-2" />
              <p className="text-xs text-green-600 mt-2">Above target</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Revenue and Financial Analytics */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart title="Financial Performance" />
            </CardContent>
          </Card>

          {/* Performance Radar */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Performance Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart title="Multi-Dimensional Analysis" />
            </CardContent>
          </Card>
        </div>

        {/* Operations and Issue Tracking */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Issue Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChart title="Issue Status & Resolution Trends" />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-orange-600" />
                Network Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintChart title="Network Quality Metrics" />
            </CardContent>
          </Card>
        </div>

        {/* Heatmap and Geographic Analysis */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Activity Patterns & Regional Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart title="Time-based Activity Analysis" />
          </CardContent>
        </Card>

        {/* Quick Actions and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Security Audit
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Team Performance
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Today's Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New Customers:</span>
                <span className="font-semibold">+12</span>
              </div>
              <div className="flex justify-between">
                <span>Issues Resolved:</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue Generated:</span>
                <span className="font-semibold">$4,920</span>
              </div>
              <div className="flex justify-between">
                <span>System Uptime:</span>
                <span className="font-semibold">100%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Next Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Review high alerts</span>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Weekly team meeting</span>
                <Badge variant="outline">2h</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>System maintenance</span>
                <Badge variant="secondary">Tomorrow</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Budget review</span>
                <Badge variant="outline">Friday</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
