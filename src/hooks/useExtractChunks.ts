import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { ExtractChunksInput, ExtractChunksOutput } from "~/lib/ai/types";

export function useExtractChunks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extractChunksAction = useAction(api.ai.extractChunks);

  const extractChunks = async (
    input: ExtractChunksInput
  ): Promise<ExtractChunksOutput | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await extractChunksAction({
        intentionTitle: input.intentionTitle,
        intentionDescription: input.intentionDescription,
        areaTitle: input.areaTitle,
        existingChunks: input.existingChunks,
      });

      console.log("Extract chunks action result:", result);
      return result;
    } catch (err) {
      console.error("Extract chunks error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to extract chunks";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractChunks,
    isLoading,
    error,
  };
}
