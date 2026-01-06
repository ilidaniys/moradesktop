"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { DashboardView } from "~/components/dashboard/DashboardView";
import { NoPlanState } from "~/components/dashboard/NoPlanState";

export default function DashboardPage() {
  const activePlan = useQuery(api.dayPlans.getActiveForToday);

  // Loading state
  if (activePlan === undefined) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading today's plan..." />
      </div>
    );
  }

  // No active plan
  if (!activePlan) {
    return <NoPlanState />;
  }

  // Show dashboard with active plan
  return <DashboardView plan={activePlan} />;
}
