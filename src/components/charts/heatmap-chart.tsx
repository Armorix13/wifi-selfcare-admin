import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Users, AlertTriangle } from "lucide-react";

interface HeatmapChartProps {
  title: string;
}

const generateHeatmapData = (type: string) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map(day => ({
    day,
    hours: hours.map(hour => {
      let intensity;
      
      if (type === "complaints") {
        // More complaints during business hours and evenings
        intensity = hour >= 9 && hour <= 17 ? 0.7 + Math.random() * 0.3 :
                   hour >= 18 && hour <= 22 ? 0.5 + Math.random() * 0.4 :
                   0.1 + Math.random() * 0.3;
      } else if (type === "traffic") {
        // Higher network usage during peak hours
        intensity = hour >= 19 && hour <= 23 ? 0.8 + Math.random() * 0.2 :
                   hour >= 8 && hour <= 10 ? 0.6 + Math.random() * 0.3 :
                   hour >= 12 && hour <= 14 ? 0.5 + Math.random() * 0.3 :
                   0.2 + Math.random() * 0.3;
      } else {
        // Engineer activity during work hours
        intensity = hour >= 8 && hour <= 18 ? 0.8 + Math.random() * 0.2 :
                   hour >= 19 && hour <= 21 ? 0.3 + Math.random() * 0.3 :
                   0.05 + Math.random() * 0.15;
      }
      
      // Weekend adjustments
      if (day === 'Sat' || day === 'Sun') {
        intensity *= type === "complaints" ? 0.6 : type === "traffic" ? 1.2 : 0.3;
      }
      
      return {
        hour,
        intensity: Math.min(1, intensity),
        value: Math.floor(intensity * 100)
      };
    })
  }));
};

const generateRegionalData = () => {
  const regions = [
    { name: 'North District', complaints: 45, customers: 850, satisfaction: 4.2 },
    { name: 'South District', complaints: 32, customers: 720, satisfaction: 4.5 },
    { name: 'East District', complaints: 28, customers: 640, satisfaction: 4.6 },
    { name: 'West District', complaints: 51, customers: 920, satisfaction: 4.1 },
    { name: 'Central District', complaints: 38, customers: 780, satisfaction: 4.4 },
    { name: 'Suburban Area', complaints: 22, customers: 560, satisfaction: 4.7 },
    { name: 'Industrial Zone', complaints: 42, customers: 480, satisfaction: 4.0 },
    { name: 'Commercial Area', complaints: 35, customers: 690, satisfaction: 4.3 },
  ];
  
  return regions.map(region => ({
    ...region,
    complaintRate: ((region.complaints / region.customers) * 100).toFixed(2),
    efficiency: (region.satisfaction / 5 * 100).toFixed(1)
  }));
};

export function HeatmapChart({ title }: HeatmapChartProps) {
  const [dataType, setDataType] = useState("complaints");
  const [viewMode, setViewMode] = useState("heatmap");
  const [isLoading, setIsLoading] = useState(false);
  
  const heatmapData = generateHeatmapData(dataType);
  const regionalData = generateRegionalData();

  const handleDataTypeChange = (newType: string) => {
    setIsLoading(true);
    setDataType(newType);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleViewModeChange = (newMode: string) => {
    setIsLoading(true);
    setViewMode(newMode);
    setTimeout(() => setIsLoading(false), 200);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity < 0.2) return 'bg-green-100 text-green-800';
    if (intensity < 0.4) return 'bg-yellow-100 text-yellow-800';
    if (intensity < 0.6) return 'bg-orange-100 text-orange-800';
    if (intensity < 0.8) return 'bg-red-100 text-red-800';
    return 'bg-red-200 text-red-900';
  };

  const getRegionColor = (rate: number) => {
    if (rate < 3) return 'bg-green-100 text-green-800 border-green-200';
    if (rate < 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rate < 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const renderHeatmap = () => (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Hour headers */}
        <div className="flex">
          <div className="w-16 text-xs text-muted-foreground font-medium py-2"></div>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="flex-1 text-xs text-muted-foreground font-medium text-center py-2 min-w-8">
              {i.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        {heatmapData.map((dayData) => (
          <div key={dayData.day} className="flex items-center">
            <div className="w-16 text-xs text-muted-foreground font-medium py-1">
              {dayData.day}
            </div>
            {dayData.hours.map((hourData) => (
              <div
                key={hourData.hour}
                className={`flex-1 min-w-8 h-8 m-0.5 rounded text-xs flex items-center justify-center font-medium transition-all duration-200 hover:scale-110 cursor-pointer ${getIntensityColor(hourData.intensity)}`}
                title={`${dayData.day} ${hourData.hour}:00 - ${dataType === 'complaints' ? 'Complaints' : dataType === 'traffic' ? 'Traffic' : 'Activity'}: ${hourData.value}%`}
              >
                {hourData.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderRegionalView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {regionalData.map((region) => (
        <div
          key={region.name}
          className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${getRegionColor(Number(region.complaintRate))}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">{region.name}</h4>
            <MapPin className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Customers:</span>
              <span className="font-medium">{region.customers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Complaints:</span>
              <span className="font-medium">{region.complaints}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate:</span>
              <span className="font-medium">{region.complaintRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Satisfaction:</span>
              <span className="font-medium">{region.satisfaction}/5</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const getDataTypeMetrics = () => {
    if (dataType === "complaints") {
      return {
        peak: "18:00-22:00",
        low: "02:00-06:00", 
        avg: "45",
        unit: "complaints/day"
      };
    } else if (dataType === "traffic") {
      return {
        peak: "19:00-23:00",
        low: "03:00-07:00",
        avg: "78",
        unit: "% utilization"
      };
    } else {
      return {
        peak: "09:00-17:00",
        low: "22:00-08:00",
        avg: "89",
        unit: "% efficiency"
      };
    }
  };

  const metrics = getDataTypeMetrics();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={handleViewModeChange} disabled={isLoading}>
            <SelectTrigger className="w-[120px] h-8 text-sm border-border/50 hover:border-border transition-colors">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent className="min-w-[120px]">
              <SelectItem value="heatmap">Heatmap</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
            </SelectContent>
          </Select>
          {viewMode === "heatmap" && (
            <Select value={dataType} onValueChange={handleDataTypeChange} disabled={isLoading}>
              <SelectTrigger className="w-[120px] h-8 text-sm border-border/50 hover:border-border transition-colors">
                <SelectValue placeholder="Data type" />
              </SelectTrigger>
              <SelectContent className="min-w-[120px]">
                <SelectItem value="complaints">Complaints</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}
        
        <div className="bg-card rounded-lg border p-4">
          {viewMode === "heatmap" ? renderHeatmap() : renderRegionalView()}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        {viewMode === "heatmap" ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-red-500" />
              <span>Peak: {metrics.peak}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-green-500" />
              <span>Low: {metrics.low}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <span>Avg: {metrics.avg} {metrics.unit}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Total Regions: {regionalData.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-green-500" />
              <span>Total Customers: {regionalData.reduce((sum, r) => sum + r.customers, 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Avg Satisfaction: {(regionalData.reduce((sum, r) => sum + r.satisfaction, 0) / regionalData.length).toFixed(1)}/5</span>
            </div>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {viewMode === "heatmap" ? `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Pattern` : "Geographic Overview"}
        </div>
      </div>
    </div>
  );
}