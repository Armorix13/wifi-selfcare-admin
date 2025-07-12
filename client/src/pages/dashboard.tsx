import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, Users, TrendingUp, UserPlus, AlertTriangle } from "lucide-react";

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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Complaints"
            value={stats?.totalComplaints || 0}
            change="12%"
            changeType="positive"
            icon={AlertCircle}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Resolved Issues"
            value={stats?.resolvedIssues || 0}
            change="8%"
            changeType="positive"
            icon={CheckCircle}
            iconColor="text-green-600"
          />
          <StatsCard
            title="Avg Resolution Time"
            value={`${stats?.avgResolutionTime || 0}h`}
            change="5%"
            changeType="negative"
            icon={Clock}
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="Active Engineers"
            value={stats?.activeEngineers || 0}
            change="0%"
            changeType="neutral"
            icon={Users}
            iconColor="text-purple-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplaintChart title="Complaints Overview" />
          
          {/* Status Distribution */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.complaintStats?.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Assigned</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.complaintStats?.assigned || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.complaintStats?.inProgress || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Resolved</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.complaintStats?.resolved || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Complaint #1234 resolved by Engineer John Doe</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New engineer Sarah Wilson added to Mumbai region</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">High priority complaint #1235 created in Delhi</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
