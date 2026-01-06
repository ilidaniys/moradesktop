"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "~/components/shared/EmptyState";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-primary text-2xl font-medium">Analytics</h1>
        <p className="text-secondary mt-1 text-sm">
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
