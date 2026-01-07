"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Calendar, Plus } from "lucide-react";
import { PlanCard } from "./PlanCard";
import { DatePickerDialog } from "./DatePickerDialog";
import { EmptyState } from "~/components/shared/EmptyState";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { usePlanManagement } from "~/hooks/usePlanManagement";

interface PlansListProps {
  selectedPlanId: Id<"dayPlans"> | null;
  onSelectPlan: (planId: Id<"dayPlans">) => void;
  onCreateNew: (date: string) => void;
}

export function PlansList({
  selectedPlanId,
  onSelectPlan,
  onCreateNew,
}: PlansListProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upcoming");

  const upcomingPlans = useQuery(api.dayPlans.getUpcomingPlans);
  const allPlans = useQuery(api.dayPlans.listAllPlans, {});
  const { deletePlan } = usePlanManagement();
  const checkAndMarkExpired = useMutation(api.dayPlans.checkAndMarkExpired);

  const today = new Date().toISOString().split("T")[0]!;

  // Check for expired plans when component mounts or plans change
  useEffect(() => {
    if (allPlans !== undefined) {
      void checkAndMarkExpired();
    }
  }, [allPlans?.length, checkAndMarkExpired]);

  // Get the plans to display based on active tab
  const displayPlans = activeTab === "upcoming" ? upcomingPlans : allPlans;

  // Extract existing plan dates for date picker
  const existingPlanDates = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.map((p) => p.date);
  }, [allPlans]);

  const handleCreateToday = () => {
    onCreateNew(today);
  };

  const handleDateSelect = (date: string) => {
    onCreateNew(date);
  };

  const handleDelete = async (planId: Id<"dayPlans">) => {
    const success = await deletePlan(planId);
    if (success && selectedPlanId === planId) {
      // If deleted plan was selected, clear selection and show today
      onCreateNew(today);
    }
  };

  const handleDuplicate = (newPlanId: Id<"dayPlans">) => {
    // Auto-select the newly duplicated plan
    onSelectPlan(newPlanId);
  };

  const isLoading = displayPlans === undefined;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={handleCreateToday} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Plan for Today
        </Button>
        <Button
          onClick={() => setIsDatePickerOpen(true)}
          variant="outline"
          className="w-full"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Select Date
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="max-h-[calc(100vh-350px)] space-y-2 overflow-y-auto pr-2">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!isLoading && displayPlans?.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No plans yet"
            description={
              activeTab === "upcoming"
                ? "Create your first day plan to get started"
                : "You haven't created any plans yet"
            }
          />
        )}

        {!isLoading &&
          displayPlans?.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              isSelected={selectedPlanId === plan._id}
              onSelect={() => onSelectPlan(plan._id)}
              onDelete={() => handleDelete(plan._id)}
              onDuplicate={handleDuplicate}
              existingPlanDates={existingPlanDates}
            />
          ))}
      </div>

      {/* Date Picker Dialog */}
      <DatePickerDialog
        open={isDatePickerOpen}
        onOpenChange={setIsDatePickerOpen}
        onSelectDate={handleDateSelect}
        existingPlanDates={existingPlanDates}
        disablePast={true}
      />
    </div>
  );
}
