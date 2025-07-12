import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  gradient?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  gradient = false,
  className,
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-600 bg-green-50 dark:bg-green-900/20",
    negative: "text-red-600 bg-red-50 dark:bg-red-900/20", 
    neutral: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
  };

  return (
    <div className={cn(
      "stats-card p-6 group relative overflow-hidden",
      gradient && "crypto-card",
      className
    )}>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-200 ease-in-out",
              gradient 
                ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20" 
                : "bg-primary/10"
            )}>
              <Icon className={cn("h-6 w-6 transition-transform duration-200", iconColor)} />
            </div>
            {change && (
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
                changeColors[changeType]
              )}>
                {changeType === "positive" && "+"}
                {change}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground/70 transition-colors duration-200">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground transition-colors duration-200">
              {value}
            </p>
          </div>
        </div>
      </div>
      
      {/* Subtle hover effect without layout shift */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}