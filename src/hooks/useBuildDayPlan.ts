import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { BuildDayPlanInput, BuildDayPlanOutput } from "~/lib/ai/types";

export function useBuildDayPlan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buildDayPlanAction = useAction(api.ai.buildDayPlan);

  const buildDayPlan = async (
    input: BuildDayPlanInput,
  ): Promise<BuildDayPlanOutput | null> => {
    setIsLoading(true);
    setError(null);

    console.log("useBuildDayPlan called with:", {
      timeBudgetMin: input.timeBudgetMin,
      energyMode: input.energyMode,
      maxTasks: input.maxTasks,
      availableChunksCount: input.availableChunks.length,
      lockedChunkIds: input.lockedChunkIds,
    });

    try {
      const result = await buildDayPlanAction({
        timeBudgetMin: input.timeBudgetMin,
        energyMode: input.energyMode,
        maxTasks: input.maxTasks,
        availableChunks: input.availableChunks,
        lockedChunkIds: input.lockedChunkIds,
      });

      console.log("buildDayPlan action result:", result);
      return result;
    } catch (err) {
      console.error("buildDayPlan error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to build day plan";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buildDayPlan,
    isLoading,
    error,
  };
}
