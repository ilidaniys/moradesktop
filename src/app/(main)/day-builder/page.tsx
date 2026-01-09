"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
  const cleanupMutation = useMutation(api.dayPlans.cleanupExpiredPlans);

  useEffect(() => {
    void cleanupMutation();
  }, [cleanupMutation]);

  const handleSelectPlan = (planId: Id<"dayPlans">) => {
    setSelectedPlanId(planId);
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
    <div className="flex h-[calc(100vh-100px)] flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 w-9"
          >
            {sidebarOpen ? <PanelLeftClose /> : <PanelLeft />}
          </Button>
          <div>
            <h1 className="text-primary text-2xl font-medium">Day Builder</h1>
            <p className="text-secondary mt-1 text-sm">
              Build and manage your daily plans
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* Sidebar - Plans List */}
        <aside
          className={cn(
            "shrink-0 overflow-x-hidden transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-96 opacity-100" : "w-0 opacity-0",
          )}
        >
          <div className="flex h-full w-96 flex-col">
            <PlansList
              selectedPlanId={selectedPlanId}
              selectedDate={selectedDate}
              onSelectPlan={handleSelectPlan}
              onCreateNew={handleCreateNew}
            />
          </div>
        </aside>

        {/* Main Content - Day Plan Builder */}
        <main className="min-w-0 flex-1 overflow-y-auto pr-1 transition-all duration-300 ease-in-out">
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
