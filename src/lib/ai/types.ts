import type { Id } from "../../../convex/_generated/dataModel";

export interface ExtractChunksInput {
  intentionTitle: string;
  intentionDescription?: string;
  areaTitle: string;
  existingChunks?: Array<{
    title: string;
    dod: string;
  }>;
}

export interface ExtractedChunk {
  title: string;
  dod: string;
  durationMin: number;
  tags: string[];
}

export interface ExtractChunksOutput {
  chunks: ExtractedChunk[];
  reasoning: string;
}

// Build Day Plan AI Types
export interface BuildDayPlanInput {
  timeBudgetMin: number;
  energyMode: "deep" | "normal" | "light";
  maxTasks: number;
  availableChunks: Array<{
    id: string;
    chunkId: Id<"chunks">;
    title: string;
    durationMin: number;
    tags: string[];
    dod: string;
    areaTitle: string;
    areaWeight: number;
    intentionTitle?: string;
  }>;
  lockedChunkIds: string[];
}

export interface SuggestedPlanItem {
  chunkId: Id<"chunks">;
  order: number;
  reasoning: string;
}

export interface BuildDayPlanOutput {
  suggestedItems: SuggestedPlanItem[];
  totalDuration: number;
  reasoning: string;
  energyBalance: string;
}

// Split Chunk AI Types
export interface SplitChunkInput {
  chunkTitle: string;
  chunkDod: string;
  originalDuration: number;
  targetDuration: number;
  tags: string[];
}

export interface SplitChunkPart {
  title: string;
  dod: string;
  durationMin: number;
  tags: string[];
}

export interface SplitChunkOutput {
  parts: SplitChunkPart[];
  reasoning: string;
}

// API Response Types
export interface AIApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
