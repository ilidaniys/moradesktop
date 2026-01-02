"use client";

import { Calendar } from "lucide-react";
import { EmptyState } from "~/components/shared/EmptyState";

export default function DayBuilderPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Day Builder
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Build your daily plan from ready chunks
        </p>
      </div>

      <EmptyState
        icon={Calendar}
        title="Day builder coming soon"
        description="This feature will help you build realistic daily plans using AI-powered suggestions."
      />
    </div>
  );
}
