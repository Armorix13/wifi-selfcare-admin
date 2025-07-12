import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatusChartProps {
  title: string;
  data?: any[];
}

// Generate realistic status data
const generateStatusData = (days: number) => {
  const data = [];
  // Adjust sample frequency based on time range
  const sampleFrequency = days <= 7 ? 1 : days <= 30 ? 2 : 7;
  
  for (let i = days; i >= 0; i -= sampleFrequency) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add trending - more issues in the past, improving over time
    const trendFactor = i / days;
    const basePending = 2 + Math.floor(trendFactor * 4);
    const baseAssigned = 3 + Math.floor(trendFactor * 6);
    const baseInProgress = 4 + Math.floor(trendFactor * 5);
    const baseResolved = 8 + Math.floor(trendFactor * 10);
    
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

const getCurrentStatusDistribution = (timeRange: string) => {
  const multiplier = timeRange === "7" ? 1 : timeRange === "30" ? 4 : 12;
  const baseValues = [
    { name: 'Pending', value: 14, color: '#ef4444' },
    { name: 'Assigned', value: 28, color: '#f59e0b' },
    { name: 'In Progress', value: 31, color: '#3b82f6' },
    { name: 'Resolved', value: 142, color: '#10b981' },
  ];
  
  return baseValues.map(item => ({
    ...item,
    value: Math.floor(item.value * multiplier + (Math.random() - 0.5) * 10)
  }));
};

export function StatusChart({ title, data = [] }: StatusChartProps) {
  const [timeRange, setTimeRange] = useState("7");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [isLoading, setIsLoading] = useState(false);
  
  const chartData = generateStatusData(parseInt(timeRange));
  const pieData = getCurrentStatusDistribution(timeRange);

  const handleTimeRangeChange = (newRange: string) => {
    setIsLoading(true);
    setTimeRange(newRange);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleChartTypeChange = (newType: string) => {
    setIsLoading(true);
    setChartType(newType as "bar" | "pie");
    setTimeout(() => setIsLoading(false), 200);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            Count: {data.value}
          </p>
          <p className="text-sm text-muted-foreground">
            {((data.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === "pie") {
      return (
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-foreground">{value}</span>}
          />
        </PieChart>
      );
    }

    return (
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <select 
            value={chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1 bg-background text-foreground hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
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
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Resolution Rate: {pieData.length > 0 ? (pieData.find(item => item.name === 'Resolved')?.value || 0) / pieData.reduce((sum, item) => sum + item.value, 0) * 100 : 0}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Total Issues: {pieData.reduce((sum, item) => sum + item.value, 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Pending: {pieData.find(item => item.name === 'Pending')?.value || 0}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {chartType === "pie" ? "Distribution" : "Trends"} - {timeRange} days
        </div>
      </div>
    </div>
  );
}