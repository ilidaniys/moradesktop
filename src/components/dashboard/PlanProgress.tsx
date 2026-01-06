"use client";

import { Check, Clock, Target } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

interface PlanProgressProps {
  stats: {
    totalItems: number;
    completedItems: number;
    skippedItems: number;
    inProgressItems: number;
    pendingItems: number;
    totalPlannedTime: number;
    timeUsed: number;
    timeRemaining: number;
    timeBudget: number;
    completionPercentage: number;
    energyMode: "deep" | "normal" | "light";
  };
}

export function PlanProgress({ stats }: PlanProgressProps) {
  // Calculate time usage percentage
  const timeUsagePercentage = Math.round(
    (stats.timeUsed / stats.timeBudget) * 100,
  );

  // Determine time status color
  const getTimeStatusColor = () => {
    if (timeUsagePercentage >= 100) return "text-red-600";
    if (timeUsagePercentage >= 80) return "text-orange-600";
    return "text-green-600";
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  // Progress bar color based on completion
  const getProgressColor = () => {
    if (stats.completionPercentage >= 80) return "bg-green-500";
    if (stats.completionPercentage >= 50) return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-sm font-medium">
              Overall Progress
            </h3>
            <span className="text-foreground text-sm font-semibold">
              {stats.completionPercentage}%
            </span>
          </div>
          <Progress
            value={stats.completionPercentage}
            className="h-3"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Tasks Completed */}
          <div className="space-y-1">
            <div className="text-muted flex items-center gap-1.5 text-xs">
              <Check className="h-3.5 w-3.5" />
              <span>Tasks</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-semibold">
                {stats.completedItems}
              </span>
              <span className="text-muted text-sm">
                / {stats.totalItems}
              </span>
            </div>
            <p className="text-muted text-xs">
              {stats.pendingItems} pending
              {stats.skippedItems > 0 && `, ${stats.skippedItems} skipped`}
            </p>
          </div>

          {/* Time Used */}
          <div className="space-y-1">
            <div className="text-muted flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>Time Used</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-semibold",
                  getTimeStatusColor(),
                )}
              >
                {formatTime(stats.timeUsed)}
              </span>
              <span className="text-muted text-sm">
                / {formatTime(stats.timeBudget)}
              </span>
            </div>
            <p className="text-muted text-xs">
              {timeUsagePercentage}% of budget
            </p>
          </div>

          {/* Time Remaining */}
          <div className="space-y-1">
            <div className="text-muted flex items-center gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5" />
              <span>Remaining</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-semibold",
                  stats.timeRemaining < 0 ? "text-red-600" : "text-foreground",
                )}
              >
                {formatTime(Math.abs(stats.timeRemaining))}
              </span>
              {stats.timeRemaining < 0 && (
                <span className="text-red-600 text-xs font-medium">
                  over
                </span>
              )}
            </div>
            <p className="text-muted text-xs">
              {stats.totalPlannedTime > 0
                ? `${formatTime(stats.totalPlannedTime)} planned`
                : "No items planned"}
            </p>
          </div>
        </div>

        {/* Status Message */}
        {stats.timeUsed > stats.timeBudget && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            ⚠️ You've exceeded your time budget. Consider wrapping up remaining
            tasks.
          </div>
        )}
        {stats.completionPercentage === 100 && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            🎉 All tasks completed! Great job! You can now complete your plan.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
