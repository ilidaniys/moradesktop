"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DashboardPlanItem } from "./DashboardPlanItem";
import type { Id } from "../../../convex/_generated/dataModel";

interface PlanItem {
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
}

interface PlanItemsListProps {
  pendingItems: PlanItem[];
  completedItems: PlanItem[];
  skippedItems: PlanItem[];
  onStart: (itemId: Id<"dayPlanItems">) => void;
  onSkip: (itemId: Id<"dayPlanItems">) => void;
  isLoading: boolean;
}

export function PlanItemsList({
  pendingItems,
  completedItems,
  skippedItems,
  onStart,
  onSkip,
  isLoading,
}: PlanItemsListProps) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [showSkipped, setShowSkipped] = useState(false);

  return (
    <div className="space-y-6">
      {/* Pending Items */}
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-foreground text-sm font-medium">
            Up Next ({pendingItems.length})
          </h3>
          <div className="space-y-2">
            {pendingItems.map((item) => (
              <DashboardPlanItem
                key={item._id}
                item={item}
                onStart={onStart}
                onSkip={onSkip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Items - Collapsible */}
      {completedItems.length > 0 && (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="-ml-2 h-auto gap-2 p-2 text-sm font-medium text-foreground hover:text-foreground"
          >
            {showCompleted ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Completed ({completedItems.length})
          </Button>

          {showCompleted && (
            <div className="space-y-2">
              {completedItems.map((item) => (
                <DashboardPlanItem
                  key={item._id}
                  item={item}
                  onStart={onStart}
                  onSkip={onSkip}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skipped Items - Collapsible */}
      {skippedItems.length > 0 && (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSkipped(!showSkipped)}
            className="-ml-2 h-auto gap-2 p-2 text-sm font-medium text-foreground hover:text-foreground"
          >
            {showSkipped ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Skipped ({skippedItems.length})
          </Button>

          {showSkipped && (
            <div className="space-y-2">
              {skippedItems.map((item) => (
                <DashboardPlanItem
                  key={item._id}
                  item={item}
                  onStart={onStart}
                  onSkip={onSkip}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {pendingItems.length === 0 &&
        completedItems.length === 0 &&
        skippedItems.length === 0 && (
          <div className="text-muted py-8 text-center text-sm">
            No items in your plan
          </div>
        )}
    </div>
  );
}
