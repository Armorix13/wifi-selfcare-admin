import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { ComplaintChart } from "@/components/charts/complaint-chart";
import { TrendingUp, Clock, Star, Users } from "lucide-react";

export default function Analytics() {
  // Dummy analytics data
  const stats = {
    complaintStats: {
      total: 24,
      resolved: 18,
      pending: 4,
      inProgress: 2
    }
  };
  
  const isLoading = false;

  if (isLoading) {
    return (
      <MainLayout title="Analytics">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const resolutionRate = stats?.complaintStats ? 
    ((stats.complaintStats.resolved / stats.complaintStats.total) * 100).toFixed(1) : "0";

  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <StatsCard
            title="Avg Response Time"
            value="1.2h"
            icon={Clock}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Customer Satisfaction"
            value="4.7/5"
            icon={Star}
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="Engineer Utilization"
            value="87%"
            icon={Users}
            iconColor="text-purple-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplaintChart title="Complaint Trends" />
          <ComplaintChart title="Resolution Time Distribution" />
        </div>
      </div>
    </MainLayout>
  );
}
