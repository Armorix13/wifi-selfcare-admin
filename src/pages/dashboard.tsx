import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import { StatusChart } from "@/components/charts/status-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateDashboardStats } from "@/lib/dummyData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  UserPlus, 
  AlertTriangle,
  Activity,
  Zap,
  Target,
  Wifi,
  Signal,
  Router,
  Shield,
  Star,
  Heart,
  Sparkles,
  Crown,
  Award,
  Flame,
  Rocket,
  Globe,
  Settings,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  Filter,
  RefreshCw,
  Download,
  Share2,
  MessageSquare,
  Coffee,
  Headphones,
  Briefcase,
  MapPin,
  Clock3,
  Gem
} from "lucide-react";

export default function Dashboard() {
  const stats = generateDashboardStats();
  const isLoading = false;

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="min-h-screen dashboard-hero">
        <div className="space-y-8 p-6">
          {/* Welcome Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Crown className="h-12 w-12 dashboard-welcome-icon sparkle-animation" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 dashboard-welcome-icon animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold dashboard-welcome-text mb-2">
              Welcome to Your Command Center
            </h1>
            <p className="dashboard-welcome-muted text-lg">
              Manage your WiFi network with style and efficiency
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge className="badge-super-admin">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
              <Badge className="badge-admin">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <Badge className="badge-manager">
                <Award className="h-3 w-3 mr-1" />
                Manager Panel
              </Badge>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Complaints"
              value={stats?.totalComplaints || 156}
              change="12%"
              changeType="positive"
              icon={AlertCircle}
              iconColor="dashboard-welcome-icon"
              gradient
              className="dashboard-stats-card rainbow-border"
            />
            <StatsCard
              title="Resolved Issues"
              value={stats?.resolvedToday || 142}
              change="18%"
              changeType="positive"
              icon={CheckCircle}
              iconColor="dashboard-welcome-icon"
              gradient
              className="dashboard-stats-card"
            />
            <StatsCard
              title="Avg Resolution Time"
              value={`${stats?.avgResolutionTime || 2.4}h`}
              change="15%"
              changeType="positive"
              icon={Clock}
              iconColor="dashboard-welcome-icon"
              gradient
              className="dashboard-stats-card"
            />
            <StatsCard
              title="Active Engineers"
              value={stats?.activeEngineers || 24}
              change="5%"
              changeType="positive"
              icon={Users}
              iconColor="dashboard-welcome-icon"
              gradient
              className="dashboard-stats-card"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Network Uptime"
              value="99.8%"
              change="0.2%"
              changeType="positive"
              icon={Wifi}
              iconColor="dashboard-welcome-icon"
              className="dashboard-stats-card"
            />
            <StatsCard
              title="Customer Satisfaction"
              value="4.8"
              change="0.3"
              changeType="positive"
              icon={Star}
              iconColor="dashboard-welcome-icon"
              className="dashboard-stats-card sparkle-animation"
            />
            <StatsCard
              title="Response Time"
              value="1.2s"
              change="0.8s"
              changeType="positive"
              icon={Zap}
              iconColor="dashboard-welcome-icon"
              className="dashboard-stats-card"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
            <Button className="dashboard-stats-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Rocket className="h-5 w-5 dashboard-welcome-icon" />
              <span className="font-medium dashboard-welcome-text">Quick Deploy</span>
            </Button>
            <Button className="dashboard-stats-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Eye className="h-5 w-5 dashboard-welcome-icon" />
              <span className="font-medium dashboard-welcome-text">Live Monitor</span>
            </Button>
            <Button className="dashboard-stats-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Settings className="h-5 w-5 dashboard-welcome-icon" />
              <span className="font-medium dashboard-welcome-text">System Config</span>
            </Button>
            <Button className="dashboard-stats-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Download className="h-5 w-5 dashboard-welcome-icon" />
              <span className="font-medium dashboard-welcome-text">Export Data</span>
            </Button>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dashboard-chart-card shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold dashboard-welcome-text flex items-center gap-2">
                  <Activity className="h-5 w-5 dashboard-welcome-icon" />
                  Performance Analytics
                  <Gem className="h-4 w-4 dashboard-welcome-icon sparkle-animation" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintChart title="Network Performance" />
              </CardContent>
            </Card>

            {/* Enhanced Status Distribution */}
            <Card className="dashboard-chart-card shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold dashboard-welcome-text flex items-center gap-2">
                  <Target className="h-5 w-5 dashboard-welcome-icon" />
                  Issue Status
                  <Flame className="h-4 w-4 dashboard-welcome-icon animate-bounce" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusChart title="Issue Status Distribution" />
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="dashboard-chart-card shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold dashboard-welcome-text flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 dashboard-welcome-icon" />
                  Issue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusChart title="Issue Trends" />
              </CardContent>
            </Card>

            <Card className="dashboard-chart-card shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold dashboard-welcome-text flex items-center gap-2">
                  <Signal className="h-5 w-5 dashboard-welcome-icon" />
                  Network Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintChart title="Network Uptime" type="area" />
              </CardContent>
            </Card>

            <Card className="dashboard-chart-card shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold dashboard-welcome-text flex items-center gap-2">
                  <Users className="h-5 w-5 dashboard-welcome-icon" />
                  Engineer Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold dashboard-welcome-icon">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-medium dashboard-welcome-text">John Doe</p>
                        <p className="text-xs dashboard-welcome-muted">24 resolved</p>
                      </div>
                    </div>
                    <Badge className="badge-super-admin">Top</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold dashboard-welcome-icon">
                        JS
                  </div>
                  <div>
                        <p className="text-sm font-medium dashboard-welcome-text">Jane Smith</p>
                        <p className="text-xs dashboard-welcome-muted">18 resolved</p>
                      </div>
                    </div>
                    <Badge className="badge-admin">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold dashboard-welcome-icon">
                        MB
                      </div>
                      <div>
                        <p className="text-sm font-medium dashboard-welcome-text">Mike Brown</p>
                        <p className="text-xs dashboard-welcome-muted">12 resolved</p>
                      </div>
                    </div>
                    <Badge className="badge-manager">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dashboard-chart-card shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold dashboard-welcome-text flex items-center gap-2">
                  <Activity className="h-5 w-5 dashboard-welcome-icon" />
                  Recent Activities
                  <Heart className="h-4 w-4 dashboard-welcome-icon animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg sparkle-animation dashboard-welcome-icon">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dashboard-welcome-text">Complaint #WFC-2025-156 resolved by Engineer Sarah Chen</p>
                      <p className="text-xs dashboard-welcome-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Mumbai Central • 
                        <Clock3 className="h-3 w-3" />
                        3 minutes ago
                      </p>
                      <Badge className="mt-2 badge-super-admin text-xs shadow-sm">
                        <Award className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg dashboard-welcome-icon">
                        <UserPlus className="h-6 w-6 text-white" />
              </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dashboard-welcome-text">New engineer Raj Patel assigned to Delhi region</p>
                      <p className="text-xs dashboard-welcome-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Delhi North • 
                        <Clock3 className="h-3 w-3" />
                        12 minutes ago
                      </p>
                      <Badge className="mt-2 badge-admin text-xs shadow-sm">
                        <Briefcase className="h-3 w-3 mr-1" />
                        New Assignment
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg dashboard-welcome-icon">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dashboard-welcome-text">Critical network outage reported in Bangalore</p>
                      <p className="text-xs dashboard-welcome-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Bangalore South • 
                        <Clock3 className="h-3 w-3" />
                        45 minutes ago
                      </p>
                      <Badge variant="destructive" className="mt-2 text-xs shadow-sm">
                        <Flame className="h-3 w-3 mr-1" />
                        High Priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card className="dashboard-chart-card shadow-2xl rainbow-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold dashboard-welcome-text flex items-center gap-2">
                  <Shield className="h-5 w-5 dashboard-welcome-icon" />
                  Network Health
                  <Coffee className="h-4 w-4 dashboard-welcome-icon" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Router className="h-6 w-6 dashboard-welcome-icon sparkle-animation" />
                      <div>
                        <p className="font-medium dashboard-welcome-text">Core Network</p>
                        <p className="text-xs dashboard-welcome-muted">All systems operational</p>
                </div>
                    </div>
                    <Badge className="badge-super-admin shadow-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Signal className="h-6 w-6 dashboard-welcome-icon" />
                      <div>
                        <p className="font-medium dashboard-welcome-text">Regional Towers</p>
                        <p className="text-xs dashboard-welcome-muted">847/852 towers active</p>
                </div>
                    </div>
                    <Badge className="badge-admin shadow-sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      99.4%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg dashboard-stats-card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-6 w-6 dashboard-welcome-icon" />
                      <div>
                        <p className="font-medium dashboard-welcome-text">Customer Connections</p>
                        <p className="text-xs dashboard-welcome-muted">Minor latency detected</p>
                      </div>
                    </div>
                    <Badge className="badge-manager shadow-sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Watch
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fun Admin Corner */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Headphones className="h-8 w-8 dashboard-welcome-icon" />
              <MessageSquare className="h-8 w-8 dashboard-welcome-icon sparkle-animation" />
              <Globe className="h-8 w-8 dashboard-welcome-icon" />
            </div>
            <p className="text-2xl font-bold dashboard-welcome-text mb-2">
              You're doing amazing work! 🎉
            </p>
            <p className="dashboard-welcome-muted">
              Managing networks has never looked this good. Keep up the fantastic work!
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button className="dashboard-stats-card px-6 py-3 hover:scale-110 transition-all duration-300">
                <Share2 className="h-4 w-4 mr-2 dashboard-welcome-icon" />
                <span className="dashboard-welcome-text">Share Success</span>
              </Button>
              <Button className="dashboard-stats-card px-6 py-3 hover:scale-110 transition-all duration-300">
                <RefreshCw className="h-4 w-4 mr-2 dashboard-welcome-icon" />
                <span className="dashboard-welcome-text">Refresh Data</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
