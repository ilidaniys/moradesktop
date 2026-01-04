"use client";

import { DayPlanBuilder } from "~/components/day-plans/DayPlanBuilder";

export default function DayBuilderPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Day Builder
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Build your daily plan by selecting ready chunks from your focus areas.
        </p>
      </div>

      <DayPlanBuilder />
    </div>
  );
}
