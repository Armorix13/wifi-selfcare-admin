import { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Zap, Shield } from "lucide-react";

interface PerformanceChartProps {
  title: string;
}

const generatePerformanceData = () => {
  return [
    {
      metric: 'Network Uptime',
      current: 99.2 + Math.random() * 0.7,
      target: 99.5,
      industry: 98.8,
    },
    {
      metric: 'Response Time',
      current: 92 + Math.random() * 6,
      target: 95,
      industry: 85,
    },
    {
      metric: 'Customer Satisfaction',
      current: 88 + Math.random() * 8,
      target: 90,
      industry: 82,
    },
    {
      metric: 'Issue Resolution',
      current: 94 + Math.random() * 4,
      target: 95,
      industry: 87,
    },
    {
      metric: 'Engineer Efficiency',
      current: 89 + Math.random() * 7,
      target: 92,
      industry: 83,
    },
    {
      metric: 'System Reliability',
      current: 96 + Math.random() * 3,
      target: 98,
      industry: 91,
    },
  ];
};

const generateScatterData = () => {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return regions.map((region, index) => ({
    region,
    color: colors[index],
    data: Array.from({ length: 15 }, (_, i) => ({
      satisfaction: 75 + Math.random() * 20,
      responseTime: 0.5 + Math.random() * 2.5,
      customers: 50 + Math.random() * 200,
    }))
  }));
};

const generateEngineersData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    name: `Engineer ${i + 1}`,
    efficiency: 70 + Math.random() * 25,
    satisfaction: 75 + Math.random() * 20,
    issues: Math.floor(Math.random() * 50) + 10,
    specialization: ['Network', 'Hardware', 'Software', 'Installation'][Math.floor(Math.random() * 4)],
  }));
};

export function PerformanceChart({ title }: PerformanceChartProps) {
  const [chartType, setChartType] = useState("radar");
  const [dataSource, setDataSource] = useState("performance");
  const [isLoading, setIsLoading] = useState(false);
  
  const performanceData = generatePerformanceData();
  const scatterData = generateScatterData();
  const engineersData = generateEngineersData();

  const handleChartTypeChange = (newType: string) => {
    setIsLoading(true);
    setChartType(newType);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleDataSourceChange = (newSource: string) => {
    setIsLoading(true);
    setDataSource(newSource);
    setTimeout(() => setIsLoading(false), 300);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('Time') ? 'h' : entry.name.includes('Satisfaction') || entry.name.includes('Uptime') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">Region Analysis</p>
          <p className="text-sm text-blue-500">Satisfaction: {data.satisfaction.toFixed(1)}%</p>
          <p className="text-sm text-green-500">Response Time: {data.responseTime.toFixed(1)}h</p>
          <p className="text-sm text-purple-500">Customers: {data.customers.toFixed(0)}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (dataSource === "regions" && chartType === "scatter") {
      return (
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            dataKey="satisfaction" 
            name="Satisfaction" 
            unit="%" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            domain={[70, 100]}
          />
          <YAxis 
            type="number" 
            dataKey="responseTime" 
            name="Response Time" 
            unit="h" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            domain={[0, 3]}
          />
          <Tooltip content={<ScatterTooltip />} />
          <Legend />
          {scatterData.map((regionData, index) => (
            <Scatter
              key={regionData.region}
              name={regionData.region}
              data={regionData.data}
              fill={regionData.color}
            />
          ))}
        </ScatterChart>
      );
    }

    if (dataSource === "engineers") {
      return (
        <ScatterChart data={engineersData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="efficiency" 
            name="Efficiency" 
            unit="%" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
          />
          <YAxis 
            dataKey="satisfaction" 
            name="Customer Satisfaction" 
            unit="%" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="issues" fill="#3b82f6" name="Engineers">
            {engineersData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={
                entry.specialization === 'Network' ? '#3b82f6' :
                entry.specialization === 'Hardware' ? '#10b981' :
                entry.specialization === 'Software' ? '#f59e0b' : '#ef4444'
              } />
            ))}
          </Scatter>
        </ScatterChart>
      );
    }

    // Default radar chart for performance data
    return (
      <RadarChart data={performanceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Radar
          name="Current Performance"
          dataKey="current"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="Target"
          dataKey="target"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.1}
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Radar
          name="Industry Average"
          dataKey="industry"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.05}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <Legend />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    );
  };

  const getCurrentMetrics = () => {
    if (dataSource === "performance") {
      const avgCurrent = performanceData.reduce((sum, item) => sum + item.current, 0) / performanceData.length;
      const avgTarget = performanceData.reduce((sum, item) => sum + item.target, 0) / performanceData.length;
      const avgIndustry = performanceData.reduce((sum, item) => sum + item.industry, 0) / performanceData.length;
      
      return {
        current: avgCurrent.toFixed(1),
        target: avgTarget.toFixed(1),
        industry: avgIndustry.toFixed(1),
        gap: (avgCurrent - avgTarget).toFixed(1)
      };
    } else if (dataSource === "engineers") {
      const avgEfficiency = engineersData.reduce((sum, item) => sum + item.efficiency, 0) / engineersData.length;
      const avgSatisfaction = engineersData.reduce((sum, item) => sum + item.satisfaction, 0) / engineersData.length;
      const topPerformer = engineersData.reduce((prev, current) => 
        (prev.efficiency + prev.satisfaction) > (current.efficiency + current.satisfaction) ? prev : current
      );
      
      return {
        efficiency: avgEfficiency.toFixed(1),
        satisfaction: avgSatisfaction.toFixed(1),
        topPerformer: topPerformer.name,
        totalEngineers: engineersData.length
      };
    } else {
      const allData = scatterData.flatMap(region => region.data);
      const avgSatisfaction = allData.reduce((sum, item) => sum + item.satisfaction, 0) / allData.length;
      const avgResponseTime = allData.reduce((sum, item) => sum + item.responseTime, 0) / allData.length;
      const totalCustomers = allData.reduce((sum, item) => sum + item.customers, 0);
      
      return {
        satisfaction: avgSatisfaction.toFixed(1),
        responseTime: avgResponseTime.toFixed(1),
        customers: Math.round(totalCustomers),
        regions: scatterData.length
      };
    }
  };

  const metrics = getCurrentMetrics();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          <Select value={dataSource} onValueChange={handleDataSourceChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px] h-8 text-sm border-border/50 hover:border-border transition-colors">
              <SelectValue placeholder="Data source" />
            </SelectTrigger>
            <SelectContent className="min-w-[140px]">
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="engineers">Engineers</SelectItem>
              <SelectItem value="regions">Regions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={handleChartTypeChange} disabled={isLoading}>
            <SelectTrigger className="w-[120px] h-8 text-sm border-border/50 hover:border-border transition-colors">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent className="min-w-[120px]">
              <SelectItem value="radar">Radar Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-96 w-full relative">
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
      
      {/* Metrics Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          {dataSource === "performance" && (
            <>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>Avg Performance: {metrics.current}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Target Gap: {metrics.gap}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>vs Industry: +{(Number(metrics.current) - Number(metrics.industry)).toFixed(1)}%</span>
              </div>
            </>
          )}
          {dataSource === "engineers" && (
            <>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>Avg Efficiency: {metrics.efficiency}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Satisfaction: {metrics.satisfaction}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-purple-500" />
                <span>Top: {metrics.topPerformer}</span>
              </div>
            </>
          )}
          {dataSource === "regions" && (
            <>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>Avg Satisfaction: {metrics.satisfaction}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Response Time: {metrics.responseTime}h</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-purple-500" />
                <span>{metrics.regions} Regions</span>
              </div>
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {dataSource === "performance" ? "Multi-KPI Analysis" : 
           dataSource === "engineers" ? "Team Performance" : "Geographic Analysis"}
        </div>
      </div>
    </div>
  );
}