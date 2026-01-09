"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { DashboardHeader } from "./DashboardHeader";
import { PlanProgress } from "./PlanProgress";
import { ActiveItemCard } from "./ActiveItemCard";
import { PlanItemsList } from "./PlanItemsList";
import { CompletePlanDialog } from "./CompletePlanDialog";
import { usePlanItemActions } from "~/hooks/usePlanItemActions";
import type { Id } from "../../../convex/_generated/dataModel";

interface DayPlanItem {
  _id: Id<"dayPlanItems">;
  chunkId: Id<"chunks">;
  order: number;
  locked: boolean;
  status: "pending" | "inProgress" | "completed" | "skipped" | "moved";
  aiReason?: string;
  actualDurationMin?: number;
  startedAt?: number;
  completedAt?: number;
  chunk: {
    title: string;
    dod: string;
    durationMin: number;
    tags: string[];
  } | null;
  area: {
    title: string;
    weight: number;
  } | null;
  intention: {
    title: string;
  } | null;
}

interface DayPlan {
  _id: Id<"dayPlans">;
  date: string;
  timeBudget: number;
  energyMode: "deep" | "normal" | "light";
  status: "draft" | "finalized" | "active" | "completed" | "expired";
  items: DayPlanItem[];
}

interface DashboardViewProps {
  plan: DayPlan;
}

export function DashboardView({ plan }: DashboardViewProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const completePlanMutation = useMutation(api.dayPlans.complete);
  const { startItem, pauseItem, completeItem, skipItem, isLoading } =
    usePlanItemActions();

  // Fetch real-time statistics
  const stats = useQuery(api.dayPlans.getActiveDayPlanStats);

  // Separate items by status
  const activeItem = plan.items.find((item) => item.status === "inProgress");
  const pendingItems = plan.items.filter((item) => item.status === "pending");
  const completedItems = plan.items.filter(
    (item) => item.status === "completed",
  );
  const skippedItems = plan.items.filter((item) => item.status === "skipped");

  const handleOpenCompleteDialog = () => {
    setShowCompleteDialog(true);
  };

  const handleCompletePlan = async (
    perceivedLoad: "light" | "normal" | "heavy",
    notes?: string,
  ) => {
    try {
      setIsCompleting(true);

      await completePlanMutation({
        dayPlanId: plan._id,
        perceivedLoad,
        notes,
      });

      toast.success("Plan completed!", {
        description: "Great job completing your day plan!",
      });

      setShowCompleteDialog(false);
    } catch (error) {
      console.error("Failed to complete plan:", error);
      toast.error("Failed to complete plan", {
        description: "Please try again",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <DashboardHeader
        date={plan.date}
        timeBudget={plan.timeBudget}
        energyMode={plan.energyMode}
        onCompletePlan={handleOpenCompleteDialog}
        isCompleting={isCompleting}
      />

      <div className="space-y-6">
        {/* Progress Section */}
        {stats && <PlanProgress stats={stats} />}

        {/* Active Item Card */}
        {activeItem && (
          <div className="space-y-2">
            <h2 className="text-foreground text-lg font-medium">
              Currently Working On
            </h2>
            <ActiveItemCard
              item={activeItem}
              onPause={pauseItem}
              onComplete={completeItem}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          <h2 className="text-foreground text-lg font-medium">Your Tasks</h2>
          <PlanItemsList
            pendingItems={pendingItems}
            completedItems={completedItems}
            skippedItems={skippedItems}
            onStart={startItem}
            onSkip={skipItem}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Complete Plan Dialog */}
      {stats && (
        <CompletePlanDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          stats={stats}
          onComplete={handleCompletePlan}
          isCompleting={isCompleting}
        />
      )}
    </div>
  );
}
