"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DayPlanBuilder } from "~/components/day-plans/DayPlanBuilder";
import { PlansList } from "~/components/day-plans/PlansList";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function DayBuilderPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<Id<"dayPlans"> | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split("T")[0]!;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const upcomingPlans = useQuery(api.dayPlans.getUpcomingPlans);
  const currentPlan = useQuery(api.dayPlans.getByDate, { date: selectedDate });

  // Auto-select today's plan if it exists and nothing is selected
  useEffect(() => {
    if (!selectedPlanId && currentPlan) {
      setSelectedPlanId(currentPlan._id);
    }
  }, [currentPlan, selectedPlanId]);

  const handleSelectPlan = (planId: Id<"dayPlans">) => {
    setSelectedPlanId(planId);
    // Find the plan's date to update selectedDate
    const plan = upcomingPlans?.find((p) => p._id === planId);
    if (plan) {
      setSelectedDate(plan.date);
    }
  };

  const handleCreateNew = (date: string) => {
    setSelectedDate(date);
    setSelectedPlanId(null);
  };

  const isLoading = upcomingPlans === undefined;

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading plans..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-primary text-2xl font-medium">Day Builder</h1>
          <p className="text-secondary mt-1 text-sm">
            Build and manage your daily plans
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
        >
          {sidebarOpen ? <PanelLeftClose /> : <PanelLeft />}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Plans List */}
        <aside
          className={cn(
            "w-80 shrink-0 space-y-4",
            !sidebarOpen && "hidden lg:block",
          )}
        >
          <PlansList
            selectedPlanId={selectedPlanId}
            onSelectPlan={handleSelectPlan}
            onCreateNew={handleCreateNew}
          />
        </aside>

        {/* Main Content - Day Plan Builder */}
        <main className="min-w-0 flex-1">
          <DayPlanBuilder
            selectedPlanId={selectedPlanId}
            selectedDate={selectedDate}
            onPlanCreated={setSelectedPlanId}
          />
        </main>
      </div>
    </div>
  );
}
