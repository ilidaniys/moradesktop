import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo } from "react";

export function useActiveDayPlan() {
  const plan = useQuery(api.dayPlans.getActiveForToday);
  const stats = useQuery(api.dayPlans.getActiveDayPlanStats);

  // Computed values
  const computed = useMemo(() => {
    if (!plan || !stats) {
      return null;
    }

    // Find the currently in-progress item
    const activeItem = plan.items.find((item) => item.status === "inProgress");

    // Separate items by status
    const pendingItems = plan.items.filter((item) => item.status === "pending");
    const completedItems = plan.items.filter(
      (item) => item.status === "completed",
    );
    const skippedItems = plan.items.filter((item) => item.status === "skipped");

    return {
      activeItem,
      pendingItems,
      completedItems,
      skippedItems,
      stats,
    };
  }, [plan, stats]);

  return {
    plan,
    stats,
    computed,
    isLoading: plan === undefined || stats === undefined,
  };
}
