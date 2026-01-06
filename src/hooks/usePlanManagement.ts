import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function usePlanManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const deletePlanMutation = useMutation(api.dayPlans.deletePlan);
  const duplicatePlanMutation = useMutation(api.dayPlans.duplicatePlan);
  const createPlanMutation = useMutation(api.dayPlans.create);

  const deletePlan = async (dayPlanId: Id<"dayPlans">) => {
    setIsLoading(true);
    try {
      await deletePlanMutation({ dayPlanId });
      toast.success("Plan deleted", {
        description: "Day plan has been successfully deleted",
      });
      return true;
    } catch (error) {
      toast.error("Failed to delete plan", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const duplicatePlan = async (
    sourcePlanId: Id<"dayPlans">,
    targetDate: string,
  ) => {
    setIsLoading(true);
    try {
      const newPlanId = await duplicatePlanMutation({
        sourcePlanId,
        targetDate,
      });
      toast.success("Plan duplicated", {
        description: "Plan has been successfully copied",
      });
      return newPlanId;
    } catch (error) {
      toast.error("Failed to duplicate plan", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createPlan = async (args: {
    date: string;
    timeBudget: number;
    energyMode: "deep" | "normal" | "light";
    notes?: string;
  }) => {
    setIsLoading(true);
    try {
      const planId = await createPlanMutation(args);
      toast.success("Plan created", {
        description: "New day plan has been created",
      });
      return planId;
    } catch (error) {
      toast.error("Failed to create plan", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deletePlan,
    duplicatePlan,
    createPlan,
    isLoading,
  };
}
