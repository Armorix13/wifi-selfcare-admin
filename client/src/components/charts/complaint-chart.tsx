import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ComplaintChartProps {
  title: string;
  data?: any[];
}

export function ComplaintChart({ title, data = [] }: ComplaintChartProps) {
  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>Interactive Chart Placeholder</p>
            <p className="text-xs mt-1">Use Recharts or Chart.js for implementation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
