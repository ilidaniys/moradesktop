"use client";

import { Check, Clock, Play, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Id } from "../../../convex/_generated/dataModel";

interface DashboardPlanItemProps {
  item: {
    _id: Id<"dayPlanItems">;
    order: number;
    status: "pending" | "inProgress" | "completed" | "skipped" | "moved";
    actualDurationMin?: number;
    chunk: {
      title: string;
      dod: string;
      durationMin: number;
      tags: string[];
    } | null;
    area: {
      title: string;
    } | null;
  };
  onStart: (itemId: Id<"dayPlanItems">) => void;
  onSkip: (itemId: Id<"dayPlanItems">) => void;
  isLoading: boolean;
}

export function DashboardPlanItem({
  item,
  onStart,
  onSkip,
  isLoading,
}: DashboardPlanItemProps) {
  // Status badge configuration
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-gray-100 text-gray-700",
    },
    inProgress: {
      label: "In Progress",
      className: "bg-blue-100 text-blue-700",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-700",
    },
    skipped: {
      label: "Skipped",
      className: "bg-orange-100 text-orange-700",
    },
    moved: {
      label: "Moved",
      className: "bg-purple-100 text-purple-700",
    },
  };

  const status = statusConfig[item.status];

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order number */}
          <div className="text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {item.order + 1}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title and Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="text-foreground line-clamp-1 font-medium">
                  {item.chunk?.title || "Untitled"}
                </h4>
                <p className="text-muted mt-0.5 text-sm">
                  {item.area?.title}
                </p>
              </div>
              <Badge className={status.className}>{status.label}</Badge>
            </div>

            {/* DoD - only show for pending items */}
            {item.status === "pending" && item.chunk?.dod && (
              <p className="text-secondary line-clamp-2 text-sm">
                {item.chunk.dod}
              </p>
            )}

            {/* Duration info */}
            <div className="text-muted flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {item.chunk?.durationMin || 0}m planned
                </span>
              </div>
              {item.status === "completed" && item.actualDurationMin && (
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>{item.actualDurationMin}m actual</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.chunk?.tags && item.chunk.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.chunk.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions based on status */}
            {item.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onStart(item._id)}
                  disabled={isLoading}
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSkip(item._id)}
                  disabled={isLoading}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Skip
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
