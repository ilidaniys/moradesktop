import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function usePlanItemActions() {
  const [isLoading, setIsLoading] = useState(false);

  const startItemMutation = useMutation(api.dayPlans.startItem);
  const pauseItemMutation = useMutation(api.dayPlans.pauseItem);
  const completeItemMutation = useMutation(api.dayPlans.completeItem);
  const skipItemMutation = useMutation(api.dayPlans.skipItem);

  const startItem = async (itemId: Id<"dayPlanItems">) => {
    setIsLoading(true);
    try {
      await startItemMutation({ itemId });
      toast.success("Task started", {
        description: "Timer is now running",
      });
    } catch (error) {
      console.error("Failed to start item:", error);
      toast.error("Failed to start task", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pauseItem = async (itemId: Id<"dayPlanItems">) => {
    setIsLoading(true);
    try {
      await pauseItemMutation({ itemId });
      toast.success("Task paused", {
        description: "You can resume it later",
      });
    } catch (error) {
      console.error("Failed to pause item:", error);
      toast.error("Failed to pause task", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeItem = async (
    itemId: Id<"dayPlanItems">,
    actualDurationMin: number,
  ) => {
    setIsLoading(true);
    try {
      await completeItemMutation({ itemId, actualDurationMin });
      toast.success("Task completed!", {
        description: "Great job completing this task",
      });
    } catch (error) {
      console.error("Failed to complete item:", error);
      toast.error("Failed to complete task", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipItem = async (itemId: Id<"dayPlanItems">) => {
    setIsLoading(true);
    try {
      await skipItemMutation({ itemId });
      toast.success("Task skipped", {
        description: "Task has been moved back to ready",
      });
    } catch (error) {
      console.error("Failed to skip item:", error);
      toast.error("Failed to skip task", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startItem,
    pauseItem,
    completeItem,
    skipItem,
    isLoading,
  };
}
