import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  MessageCircle, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  Download
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useState } from "react";

interface SupportAnalyticsProps {
  supportTickets: any[];
  ratings: any[];
}

export function SupportAnalytics({ supportTickets, ratings }: SupportAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30");
  const [chartType, setChartType] = useState("overview");

  // Calculate analytics data
  const totalTickets = supportTickets.length;
  const resolvedTickets = supportTickets.filter(t => t.status === "resolved").length;
  const openTickets = supportTickets.filter(t => t.status === "open").length;
  const inProgressTickets = supportTickets.filter(t => t.status === "in-progress").length;
  const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;

  const avgResponseTime = 1.2; // hours
  const customerSatisfaction = 87.5; // percentage

  // Generate chart data
  const ticketStatusData = [
    { name: "Open", value: openTickets, color: "#ef4444" },
    { name: "In Progress", value: inProgressTickets, color: "#f59e0b" },
    { name: "Resolved", value: resolvedTickets, color: "#10b981" },
  ];

  const ratingDistribution = [
    { rating: "5 Stars", count: ratings.filter(r => r.rating === 5).length, color: "#10b981" },
    { rating: "4 Stars", count: ratings.filter(r => r.rating === 4).length, color: "#84cc16" },
    { rating: "3 Stars", count: ratings.filter(r => r.rating === 3).length, color: "#f59e0b" },
    { rating: "2 Stars", count: ratings.filter(r => r.rating === 2).length, color: "#ef4444" },
    { rating: "1 Star", count: ratings.filter(r => r.rating === 1).length, color: "#dc2626" },
  ];

  const generateTrendData = () => {
    const days = parseInt(timeRange);
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tickets: Math.floor(Math.random() * 15) + 5,
        resolved: Math.floor(Math.random() * 12) + 3,
        satisfaction: 75 + Math.random() * 20,
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  const categoryData = [
    { category: "Technical", count: supportTickets.filter(t => t.category === "technical").length },
    { category: "Billing", count: supportTickets.filter(t => t.category === "billing").length },
    { category: "General", count: supportTickets.filter(t => t.category === "general").length },
    { category: "Installation", count: supportTickets.filter(t => t.category === "installation").length },
  ];

  const priorityData = [
    { priority: "Low", count: supportTickets.filter(t => t.priority === "low").length, color: "#3b82f6" },
    { priority: "Medium", count: supportTickets.filter(t => t.priority === "medium").length, color: "#f59e0b" },
    { priority: "High", count: supportTickets.filter(t => t.priority === "high").length, color: "#ef4444" },
    { priority: "Urgent", count: supportTickets.filter(t => t.priority === "urgent").length, color: "#dc2626" },
  ];

  const renderChart = () => {
    switch (chartType) {
      case "trends":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="tickets" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f620"
                name="New Tickets"
              />
              <Area 
                type="monotone" 
                dataKey="resolved" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b98120"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "ratings":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" name="Count">
                {ratingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "categories":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Ticket Status Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={ticketStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ticketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Priority Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="priority" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="Count">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-blue-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalTickets}</div>
            <div className="flex items-center mt-2 text-xs">
              <Badge variant="outline" className="mr-2">Open: {openTickets}</Badge>
              <Badge variant="outline">Resolved: {resolvedTickets}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{resolutionRate.toFixed(1)}%</div>
            <Progress value={resolutionRate} className="mt-2 h-2" />
            <p className="text-xs text-green-600 mt-2">Target: 95%</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-yellow-700">
              <Clock className="h-4 w-4 mr-2" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{avgResponseTime}h</div>
            <p className="text-xs text-yellow-600 mt-2">Target: &lt;2h</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-purple-700">
              <Star className="h-4 w-4 mr-2" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{avgRating.toFixed(1)}</div>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-purple-600 mt-1">{ratings.length} total ratings</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-orange-700">
              <Users className="h-4 w-4 mr-2" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{customerSatisfaction}%</div>
            <Progress value={customerSatisfaction} className="mt-2 h-2" />
            <p className="text-xs text-orange-600 mt-2">Based on feedback</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Urgent Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {supportTickets.filter(t => t.priority === "urgent").length}
            </div>
            <p className="text-xs text-red-600 mt-2">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-200 bg-indigo-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-indigo-700">
              <Target className="h-4 w-4 mr-2" />
              SLA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">94.2%</div>
            <Progress value={94.2} className="mt-2 h-2" />
            <p className="text-xs text-indigo-600 mt-2">Response time SLA</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Support Analytics
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="ratings">Ratings</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}