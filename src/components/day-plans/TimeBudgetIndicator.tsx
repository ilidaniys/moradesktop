"use client";

import { cn } from "~/lib/utils";
import { Card, CardContent } from "~/components/ui/card";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface TimeBudgetIndicatorProps {
  usedMinutes: number;
  totalMinutes: number;
}

export function TimeBudgetIndicator({
  usedMinutes,
  totalMinutes,
}: TimeBudgetIndicatorProps) {
  const percentage = totalMinutes > 0 ? (usedMinutes / totalMinutes) * 100 : 0;
  const hours = Math.floor(usedMinutes / 60);
  const minutes = usedMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  // Color coding: green <100%, yellow 100-120%, red >120%
  const getStatusColor = () => {
    if (percentage <= 100) return "success";
    if (percentage <= 120) return "warning";
    return "danger";
  };

  const statusColor = getStatusColor();

  const statusConfig = {
    success: {
      icon: CheckCircle,
      bgClass: "bg-success-soft",
      progressClass: "bg-success",
      textClass: "text-success",
      label: "On track",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-warning-soft",
      progressClass: "bg-warning",
      textClass: "text-warning",
      label: "Near limit",
    },
    danger: {
      icon: AlertCircle,
      bgClass: "bg-danger-soft",
      progressClass: "bg-danger",
      textClass: "text-danger",
      label: "Over budget",
    },
  };

  const config = statusConfig[statusColor];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">
                Time Budget
              </h3>
              <div className={cn("flex items-center gap-1", config.textClass)}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{config.label}</span>
              </div>
            </div>
            <div className="text-sm font-medium text-foreground">
              {hours > 0 && `${hours}h `}
              {minutes}m / {totalHours > 0 && `${totalHours}h `}
              {totalMins}m
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className={cn("h-3 rounded-full", config.bgClass)}>
              <div
                className={cn(
                  "h-3 rounded-full transition-all duration-300",
                  config.progressClass
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {percentage > 100 && (
              <div
                className="absolute top-0 h-3 bg-danger/30 rounded-r-full"
                style={{
                  left: "100%",
                  width: `${Math.min((percentage - 100), 20)}%`,
                }}
              />
            )}
          </div>

          {/* Percentage */}
          <div className={cn("text-xs font-medium text-right", config.textClass)}>
            {Math.round(percentage)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
