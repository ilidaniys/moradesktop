"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "~/components/shared/EmptyState";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Track your productivity and completion rates
        </p>
      </div>

      <EmptyState
        icon={BarChart3}
        title="Analytics coming soon"
        description="This feature will provide insights into your productivity patterns and completion rates."
      />
    </div>
  );
}
