import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-blue-600",
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeSymbol = () => {
    switch (changeType) {
      case "positive":
        return "↗";
      case "negative":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${iconColor.includes('blue') ? 'bg-blue-100' : iconColor.includes('green') ? 'bg-green-100' : iconColor.includes('yellow') ? 'bg-yellow-100' : 'bg-purple-100'}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {getChangeSymbol()} {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
