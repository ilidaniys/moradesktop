"use client";

import { CheckCircle2, Clock, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface DashboardHeaderProps {
  date: string;
  timeBudget: number;
  energyMode: "deep" | "normal" | "light";
  onCompletePlan: () => void;
  isCompleting?: boolean;
}

export function DashboardHeader({
  date,
  timeBudget,
  energyMode,
  onCompletePlan,
  isCompleting = false,
}: DashboardHeaderProps) {
  // Format date to readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Energy mode display
  const energyConfig = {
    deep: { label: "Deep Focus", color: "bg-purple-100 text-purple-700" },
    normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
    light: { label: "Light Work", color: "bg-green-100 text-green-700" },
  };

  const energy = energyConfig[energyMode];

  return (
    <div className="border-border space-y-4 border-b pb-6">
      {/* Date */}
      <div>
        <h1 className="text-foreground text-3xl font-semibold">
          {formatDate(date)}
        </h1>
        <p className="text-muted mt-1 text-sm">Your day plan</p>
      </div>

      {/* Metadata and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Time Budget */}
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {Math.floor(timeBudget / 60)}h {timeBudget % 60}m available
            </span>
          </Badge>

          {/* Energy Mode */}
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>{energy.label}</span>
          </Badge>
        </div>

        {/* Complete Plan Button */}
        <Button
          size="lg"
          onClick={onCompletePlan}
          disabled={isCompleting}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          {isCompleting ? "Completing..." : "Complete Plan"}
        </Button>
      </div>
    </div>
  );
}
