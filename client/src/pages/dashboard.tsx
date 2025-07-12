import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Star
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="space-y-8 p-6">
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
            />
            <StatsCard
              title="Resolved Issues"
              value={stats?.resolvedIssues || 142}
              change="18%"
              changeType="positive"
              icon={CheckCircle}
              iconColor="text-emerald-500"
              gradient
            />
            <StatsCard
              title="Avg Resolution Time"
              value={`${stats?.avgResolutionTime || 2.4}h`}
              change="15%"
              changeType="positive"
              icon={Clock}
              iconColor="text-amber-500"
              gradient
            />
            <StatsCard
              title="Active Engineers"
              value={stats?.activeEngineers || 24}
              change="5%"
              changeType="positive"
              icon={Users}
              iconColor="text-purple-500"
              gradient
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
            />
            <StatsCard
              title="Customer Satisfaction"
              value="4.8"
              change="0.3"
              changeType="positive"
              icon={Star}
              iconColor="text-yellow-500"
            />
            <StatsCard
              title="Response Time"
              value="1.2s"
              change="0.8s"
              changeType="positive"
              icon={Zap}
              iconColor="text-cyan-500"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintChart title="Network Performance" />
              </CardContent>
            </Card>
            
            {/* Enhanced Status Distribution */}
            <Card className="crypto-card border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Issue Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <Badge variant="destructive">{stats?.complaintStats?.pending || 14}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Assigned</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stats?.complaintStats?.assigned || 28}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{stats?.complaintStats?.inProgress || 31}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Resolved</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{stats?.complaintStats?.resolved || 142}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Complaint #WFC-2025-156 resolved by Engineer Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">Mumbai Central • 3 minutes ago</p>
                      <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Resolved</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserPlus className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New engineer Raj Patel assigned to Delhi region</p>
                      <p className="text-xs text-muted-foreground">Delhi North • 12 minutes ago</p>
                      <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 text-xs">New Assignment</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Critical network outage reported in Bangalore</p>
                      <p className="text-xs text-muted-foreground">Bangalore South • 45 minutes ago</p>
                      <Badge variant="destructive" className="mt-1 text-xs">High Priority</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card className="crypto-card border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Network Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <Router className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-medium">Core Network</p>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <Signal className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-medium">Regional Towers</p>
                        <p className="text-xs text-muted-foreground">847/852 towers active</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">99.4%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-6 w-6 text-amber-500" />
                      <div>
                        <p className="font-medium">Customer Connections</p>
                        <p className="text-xs text-muted-foreground">Minor latency detected</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Watch</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
