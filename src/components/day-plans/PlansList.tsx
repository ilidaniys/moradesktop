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
import { format } from "date-fns";
import { toast } from "sonner";

interface PlansListProps {
  selectedPlanId: Id<"dayPlans"> | null;
  selectedDate: string;
  onSelectPlan: (planId: Id<"dayPlans">) => void;
  onCreateNew: (date: string) => void;
}

export function PlansList({
  selectedPlanId,
  selectedDate,
  onSelectPlan,
  onCreateNew,
}: PlansListProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("selected-date");

  const allPlans = useQuery(api.dayPlans.listAllPlans, {});
  const { deletePlan } = usePlanManagement();
  const checkAndMarkExpired = useMutation(api.dayPlans.checkAndMarkExpired);
  const createDayPlan = useMutation(api.dayPlans.create);

  const today = new Date().toISOString().split("T")[0]!;

  // Check for expired plans when component mounts or plans change
  useEffect(() => {
    if (allPlans !== undefined) {
      void checkAndMarkExpired();
    }
  }, [allPlans?.length, checkAndMarkExpired]);

  // Filter plans for the selected date
  const plansForSelectedDate = useMemo(() => {
    if (!allPlans) return undefined;
    return allPlans.filter((plan) => plan.date === selectedDate);
  }, [allPlans, selectedDate]);

  // Get the plans to display based on active tab
  const displayPlans =
    activeTab === "selected-date" ? plansForSelectedDate : allPlans;

  // Extract existing plan dates for date picker
  const existingPlanDates = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.map((p) => p.date);
  }, [allPlans]);

  const handleCreatePlan = async () => {
    try {
      // Create a new plan for the selected date
      const newPlanId = await createDayPlan({
        date: selectedDate,
        timeBudget: 480, // 8 hours default
        energyMode: "normal",
      });

      // Auto-select the newly created plan
      onSelectPlan(newPlanId);

      toast.success("Draft plan created", {
        description: `New draft plan created for ${format(new Date(selectedDate + "T00:00:00"), "MMM d, yyyy")}`,
      });
    } catch (error) {
      console.error("Failed to create plan:", error);
      toast.error("Failed to create plan", {
        description: "Please try again",
      });
    }
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
    <div className="flex min-h-0 flex-1 flex-col space-y-4">
      {/* Action Buttons */}
      <div className="shrink-0 space-y-2">
        <Button onClick={handleCreatePlan} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
        <Button
          onClick={() => setIsDatePickerOpen(true)}
          variant="outline"
          className="w-full"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {format(new Date(selectedDate + "T00:00:00"), "MMM d, yyyy")}
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v)}
        className="shrink-0"
      >
        <TabsList className="w-full">
          <TabsTrigger value="selected-date" className="flex-1">
            {format(new Date(selectedDate + "T00:00:00"), "MMM d")}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All Plans
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2">
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
              activeTab === "selected-date"
                ? `No plans for ${format(new Date(selectedDate + "T00:00:00"), "MMM d, yyyy")}`
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
        currentDate={selectedDate}
        existingPlanDates={existingPlanDates}
        disablePast={true}
      />
    </div>
  );
}
