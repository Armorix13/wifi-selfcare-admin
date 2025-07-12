import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

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
                <Crown className="h-12 w-12 text-gradient sparkle-animation" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome to Your Command Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your WiFi network with style and efficiency
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge className="super-admin-badge">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
              <Badge className="admin-badge">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <Badge className="manager-badge">
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
              iconColor="text-blue-500"
              gradient
              className="rainbow-border"
            />
            <StatsCard
              title="Resolved Issues"
              value={stats?.resolvedIssues || 142}
              change="18%"
              changeType="positive"
              icon={CheckCircle}
              iconColor="text-emerald-500"
              gradient
              className="neon-glow"
            />
            <StatsCard
              title="Avg Resolution Time"
              value={`${stats?.avgResolutionTime || 2.4}h`}
              change="15%"
              changeType="positive"
              icon={Clock}
              iconColor="text-amber-500"
              gradient
              className="pulse-glow"
            />
            <StatsCard
              title="Active Engineers"
              value={stats?.activeEngineers || 24}
              change="5%"
              changeType="positive"
              icon={Users}
              iconColor="text-purple-500"
              gradient
              className="floating-element"
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
              iconColor="text-green-500"
              className="icon-glow"
            />
            <StatsCard
              title="Customer Satisfaction"
              value="4.8"
              change="0.3"
              changeType="positive"
              icon={Star}
              iconColor="text-yellow-500"
              className="sparkle-animation"
            />
            <StatsCard
              title="Response Time"
              value="1.2s"
              change="0.8s"
              changeType="positive"
              icon={Zap}
              iconColor="text-cyan-500"
              className="pulse-glow"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
            <Button className="crypto-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Rocket className="h-5 w-5" />
              <span className="font-medium">Quick Deploy</span>
            </Button>
            <Button className="crypto-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Eye className="h-5 w-5" />
              <span className="font-medium">Live Monitor</span>
            </Button>
            <Button className="crypto-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Settings className="h-5 w-5" />
              <span className="font-medium">System Config</span>
            </Button>
            <Button className="crypto-card h-16 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300">
              <Download className="h-5 w-5" />
              <span className="font-medium">Export Data</span>
            </Button>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card border-border/50 shadow-2xl floating-element">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Activity className="h-5 w-5 icon-glow" />
                  Performance Analytics
                  <Gem className="h-4 w-4 text-yellow-500 sparkle-animation" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintChart title="Network Performance" />
              </CardContent>
            </Card>
            
            {/* Enhanced Status Distribution */}
            <Card className="crypto-card border-border/50 shadow-2xl neon-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Target className="h-5 w-5 icon-glow" />
                  Issue Status
                  <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-sm font-medium text-foreground">Pending</span>
                    </div>
                    <Badge variant="destructive" className="shadow-lg">{stats?.complaintStats?.pending || 14}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-sm font-medium text-foreground">Assigned</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 shadow-lg">{stats?.complaintStats?.assigned || 28}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-sm font-medium text-foreground">In Progress</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 shadow-lg">{stats?.complaintStats?.inProgress || 31}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-sm font-medium text-foreground">Resolved</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 shadow-lg">{stats?.complaintStats?.resolved || 142}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card border-border/50 shadow-2xl pulse-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Activity className="h-5 w-5 icon-glow" />
                  Recent Activities
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg sparkle-animation">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gradient">Complaint #WFC-2025-156 resolved by Engineer Sarah Chen</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Mumbai Central • 
                        <Clock3 className="h-3 w-3" />
                        3 minutes ago
                      </p>
                      <Badge className="mt-2 bg-green-100 text-green-800 text-xs shadow-sm">
                        <Award className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg floating-element">
                        <UserPlus className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gradient">New engineer Raj Patel assigned to Delhi region</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Delhi North • 
                        <Clock3 className="h-3 w-3" />
                        12 minutes ago
                      </p>
                      <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800 text-xs shadow-sm">
                        <Briefcase className="h-3 w-3 mr-1" />
                        New Assignment
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg pulse-glow">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gradient">Critical network outage reported in Bangalore</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
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
            <Card className="crypto-card border-border/50 shadow-2xl rainbow-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Shield className="h-5 w-5 icon-glow" />
                  Network Health
                  <Coffee className="h-4 w-4 text-brown-500 floating-element" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Router className="h-6 w-6 text-green-500 sparkle-animation" />
                      <div>
                        <p className="font-medium text-gradient">Core Network</p>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 shadow-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Signal className="h-6 w-6 text-green-500 floating-element" />
                      <div>
                        <p className="font-medium text-gradient">Regional Towers</p>
                        <p className="text-xs text-muted-foreground">847/852 towers active</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 shadow-sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      99.4%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-6 w-6 text-amber-500 pulse-glow" />
                      <div>
                        <p className="font-medium text-gradient">Customer Connections</p>
                        <p className="text-xs text-muted-foreground">Minor latency detected</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 shadow-sm">
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
              <Headphones className="h-8 w-8 text-primary floating-element" />
              <MessageSquare className="h-8 w-8 text-secondary sparkle-animation" />
              <Globe className="h-8 w-8 text-accent pulse-glow" />
            </div>
            <p className="text-2xl font-bold text-gradient mb-2">
              You're doing amazing work! 🎉
            </p>
            <p className="text-muted-foreground">
              Managing networks has never looked this good. Keep up the fantastic work!
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button className="crypto-card px-6 py-3 hover:scale-110 transition-all duration-300">
                <Share2 className="h-4 w-4 mr-2" />
                Share Success
              </Button>
              <Button className="crypto-card px-6 py-3 hover:scale-110 transition-all duration-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
