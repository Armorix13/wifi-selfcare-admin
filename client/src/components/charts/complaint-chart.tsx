import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";

interface ComplaintChartProps {
  title: string;
  data?: any[];
  type?: "line" | "bar" | "area";
}

// Generate realistic network performance data
const generateNetworkData = (days: number) => {
  const data = [];
  const baseUptime = 99.5;
  const baseLatency = 15;
  const baseSpeed = 950;
  
  // Adjust sample frequency based on time range
  const sampleFrequency = days <= 7 ? 1 : days <= 30 ? 2 : 7;
  
  for (let i = days; i >= 0; i -= sampleFrequency) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic variance with trending
    const trendFactor = i / days; // Earlier data has more variance
    const uptimeVariance = (Math.random() - 0.5) * 1.5 * (1 + trendFactor);
    const latencyVariance = (Math.random() - 0.5) * 8 * (1 + trendFactor);
    const speedVariance = (Math.random() - 0.5) * 200 * (1 + trendFactor);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uptime: Math.max(95, Math.min(100, baseUptime + uptimeVariance)),
      latency: Math.max(5, baseLatency + latencyVariance),
      speed: Math.max(500, baseSpeed + speedVariance),
      complaints: Math.floor(Math.random() * 12) + 1,
      resolved: Math.floor(Math.random() * 15) + 5,
    });
  }
  
  return data.reverse(); // Show chronological order
};

const generateComplaintData = (days: number) => {
  const data = [];
  // Adjust sample frequency based on time range
  const sampleFrequency = days <= 7 ? 1 : days <= 30 ? 2 : 7;
  
  for (let i = days; i >= 0; i -= sampleFrequency) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add trending - issues tend to be higher in the past
    const trendFactor = i / days;
    const basePending = 2 + Math.floor(trendFactor * 3);
    const baseAssigned = 3 + Math.floor(trendFactor * 5);
    const baseInProgress = 4 + Math.floor(trendFactor * 4);
    const baseResolved = 8 + Math.floor(trendFactor * 8);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pending: Math.floor(Math.random() * 8) + basePending,
      assigned: Math.floor(Math.random() * 12) + baseAssigned,
      inProgress: Math.floor(Math.random() * 10) + baseInProgress,
      resolved: Math.floor(Math.random() * 20) + baseResolved,
    });
  }
  
  return data.reverse(); // Show chronological order
};

export function ComplaintChart({ title, data = [], type = "line" }: ComplaintChartProps) {
  const [timeRange, setTimeRange] = useState("7");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">(type);
  const [isLoading, setIsLoading] = useState(false);
  
  const chartData = title.toLowerCase().includes("network") 
    ? generateNetworkData(parseInt(timeRange))
    : generateComplaintData(parseInt(timeRange));

  const handleTimeRangeChange = (newRange: string) => {
    setIsLoading(true);
    setTimeRange(newRange);
    // Simulate loading time for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleChartTypeChange = (newType: string) => {
    setIsLoading(true);
    setChartType(newType as "line" | "bar" | "area");
    setTimeout(() => setIsLoading(false), 200);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name === 'uptime' && '%'}
              {entry.name === 'latency' && 'ms'}
              {entry.name === 'speed' && 'Mbps'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    if (title.toLowerCase().includes("network")) {
      if (chartType === "line") {
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="uptime" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Uptime (%)"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Latency (ms)"
              dot={{ fill: "#ef4444", strokeWidth: 2 }}
            />
          </LineChart>
        );
      } else if (chartType === "area") {
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="speed" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.2)"
              name="Speed (Mbps)"
            />
            <Area 
              type="monotone" 
              dataKey="uptime" 
              stroke="#10b981" 
              fill="rgba(16, 185, 129, 0.1)"
              name="Uptime (%)"
            />
          </AreaChart>
        );
      }
    } else {
      return (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="pending" fill="#ef4444" name="Pending" />
          <Bar dataKey="assigned" fill="#f59e0b" name="Assigned" />
          <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
          <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
        </BarChart>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1 bg-background text-foreground hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
          </select>
          {title.toLowerCase().includes("network") && (
            <select 
              value={chartType}
              onChange={(e) => handleChartTypeChange(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-1 bg-background text-foreground hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          )}
        </div>
      </div>
      
      <div className="h-64 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {/* Chart Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          {title.toLowerCase().includes("network") ? (
            <>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Avg Uptime: {chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.uptime, 0) / chartData.length).toFixed(1) : '0'}%</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Avg Latency: {chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.latency, 0) / chartData.length).toFixed(1) : '0'}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span>Avg Speed: {chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.speed, 0) / chartData.length).toFixed(0) : '0'} Mbps</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Resolution Rate: {chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.resolved, 0) / chartData.reduce((sum, item) => sum + item.pending + item.assigned + item.inProgress + item.resolved, 0) * 100).toFixed(1) : '0'}%</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span>Total Issues: {chartData.reduce((sum, item) => sum + item.pending + item.assigned + item.inProgress + item.resolved, 0)}</span>
              </div>
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Data refreshes every {timeRange} days
        </div>
      </div>
    </div>
  );
}
