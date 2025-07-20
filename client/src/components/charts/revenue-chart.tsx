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
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, CreditCard } from "lucide-react";

interface RevenueChartProps {
  title: string;
}

const generateRevenueData = (months: number) => {
  const data = [];
  const baseRevenue = 125000;
  const baseCustomers = 1200;
  
  for (let i = months; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Add growth trend
    const growthFactor = (months - i) / months;
    const seasonalVariance = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.1;
    
    const revenue = baseRevenue + (growthFactor * 50000) + (Math.random() - 0.5) * 20000 + (seasonalVariance * 15000);
    const customers = baseCustomers + (growthFactor * 300) + Math.floor((Math.random() - 0.5) * 100);
    const churn = 2 + Math.random() * 3;
    const arpu = revenue / customers;
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.round(revenue),
      customers,
      churnRate: Number(churn.toFixed(1)),
      arpu: Math.round(arpu),
      newCustomers: Math.floor(customers * 0.08 + Math.random() * 20),
    });
  }
  
  return data.reverse();
};

export function RevenueChart({ title }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState("12");
  const [metric, setMetric] = useState("revenue");
  const [isLoading, setIsLoading] = useState(false);
  
  const chartData = generateRevenueData(parseInt(timeRange));

  const handleTimeRangeChange = (newRange: string) => {
    setIsLoading(true);
    setTimeRange(newRange);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleMetricChange = (newMetric: string) => {
    setIsLoading(true);
    setMetric(newMetric);
    setTimeout(() => setIsLoading(false), 200);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey === 'revenue' ? `$${entry.value.toLocaleString()}` :
                entry.dataKey === 'churnRate' ? `${entry.value}%` :
                entry.dataKey === 'arpu' ? `$${entry.value}` :
                entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getMetricConfig = () => {
    switch(metric) {
      case "revenue":
        return {
          dataKey: "revenue",
          color: "#10b981",
          name: "Revenue ($)",
          format: (value: number) => `$${value.toLocaleString()}`
        };
      case "customers":
        return {
          dataKey: "customers", 
          color: "#3b82f6",
          name: "Active Customers",
          format: (value: number) => value.toLocaleString()
        };
      case "churn":
        return {
          dataKey: "churnRate",
          color: "#ef4444", 
          name: "Churn Rate (%)",
          format: (value: number) => `${value}%`
        };
      case "arpu":
        return {
          dataKey: "arpu",
          color: "#f59e0b",
          name: "ARPU ($)",
          format: (value: number) => `$${value}`
        };
      default:
        return {
          dataKey: "revenue",
          color: "#10b981",
          name: "Revenue ($)",
          format: (value: number) => `$${value.toLocaleString()}`
        };
    }
  };

  const metricConfig = getMetricConfig();

  const renderChart = () => {
    if (metric === "combined") {
      return (
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            fill="rgba(16, 185, 129, 0.1)"
            stroke="#10b981"
            name="Revenue ($)"
          />
          <Bar yAxisId="right" dataKey="newCustomers" fill="#3b82f6" name="New Customers" />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="churnRate" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Churn Rate (%)"
            dot={{ fill: "#ef4444", strokeWidth: 2 }}
          />
        </ComposedChart>
      );
    }

    return (
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey={metricConfig.dataKey} 
          stroke={metricConfig.color}
          fill={`${metricConfig.color}20`}
          name={metricConfig.name}
          strokeWidth={2}
        />
      </AreaChart>
    );
  };

  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1][metricConfig.dataKey] : 0;
  const previousValue = chartData.length > 1 ? chartData[chartData.length - 2][metricConfig.dataKey] : 0;
  const changePercent = previousValue ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : "0";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={handleTimeRangeChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px] h-8 text-sm border-border/50 hover:border-border transition-colors">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="min-w-[140px]">
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
              <SelectItem value="24">Last 24 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metric} onValueChange={handleMetricChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px] h-8 text-sm border-border/50 hover:border-border transition-colors">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent className="min-w-[140px]">
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="churn">Churn Rate</SelectItem>
              <SelectItem value="arpu">ARPU</SelectItem>
              <SelectItem value="combined">Combined View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-80 w-full relative">
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
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Current: {metricConfig.format(currentValue)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span>Change: {Number(changePercent) >= 0 ? '+' : ''}{changePercent}%</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-purple-500" />
            <span>Avg: {metricConfig.format(chartData.reduce((sum, item) => sum + item[metricConfig.dataKey], 0) / chartData.length)}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {metric === "combined" ? "Multi-metric" : metricConfig.name} - {timeRange} months
        </div>
      </div>
    </div>
  );
}