import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { SplitChunkInput, SplitChunkOutput } from "~/lib/ai/types";

export function useSplitChunk() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const splitChunkAction = useAction(api.ai.splitChunk);

  const splitChunk = async (
    input: SplitChunkInput
  ): Promise<SplitChunkOutput | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await splitChunkAction({
        chunkTitle: input.chunkTitle,
        chunkDod: input.chunkDod,
        originalDuration: input.originalDuration,
        targetDuration: input.targetDuration,
        tags: input.tags,
      });

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to split chunk";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    splitChunk,
    isLoading,
    error,
  };
}
