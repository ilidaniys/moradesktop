import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import {
  BUILD_DAY_PLAN_SYSTEM_PROMPT,
  buildDayPlanPrompt,
  buildExtractChunksPrompt,
  buildSplitChunkPrompt,
  EXTRACT_CHUNKS_SYSTEM_PROMPT,
  SPLIT_CHUNK_SYSTEM_PROMPT,
} from "./prompts";

// Initialize AI client
const getAIClient = () => {
  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

// Extract Chunks Action
export const extractChunks = action({
  args: {
    intentionTitle: v.string(),
    intentionDescription: v.optional(v.string()),
    areaTitle: v.string(),
    existingChunks: v.optional(
      v.array(
        v.object({
          title: v.string(),
          dod: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const aiClient = getAIClient();

    // Build prompt using template
    const prompt = buildExtractChunksPrompt({
      areaTitle: args.areaTitle,
      intentionTitle: args.intentionTitle,
      intentionDescription: args.intentionDescription,
      existingChunks: args.existingChunks,
    });

    // Call AI
    const completion = await aiClient.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: EXTRACT_CHUNKS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    console.log(completion, "completion");
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Parse and validate response
    const parsed = JSON.parse(responseText);

    // Validate chunks
    if (!parsed.chunks || !Array.isArray(parsed.chunks)) {
      throw new Error("Invalid AI response: missing chunks array");
    }

    if (parsed.chunks.length < 3 || parsed.chunks.length > 7) {
      throw new Error(
        `Invalid chunk count: ${parsed.chunks.length} (expected 3-7)`,
      );
    }

    // Validate each chunk
    for (const chunk of parsed.chunks) {
      if (!chunk.title || !chunk.dod) {
        throw new Error("Invalid chunk: missing title or dod");
      }

      if (chunk.durationMin < 30 || chunk.durationMin > 120) {
        throw new Error(
          `Invalid duration: ${chunk.durationMin}m (must be 30-120)`,
        );
      }

      if (!chunk.tags || !Array.isArray(chunk.tags)) {
        chunk.tags = [];
      }
    }

    const result = {
      chunks: parsed.chunks,
      reasoning: parsed.reasoning || "",
    };

    console.log("Convex AI extractChunks returning:", result);
    return result;
  },
});

// Build Day Plan Action
export const buildDayPlan = action({
  args: {
    timeBudgetMin: v.number(),
    energyMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("light"),
    ),
    maxTasks: v.number(),
    availableChunks: v.array(
      v.object({
        id: v.string(),
        chunkId: v.id("chunks"),
        title: v.string(),
        durationMin: v.number(),
        tags: v.array(v.string()),
        dod: v.string(),
        areaTitle: v.string(),
        areaWeight: v.number(),
        intentionTitle: v.optional(v.string()),
      }),
    ),
    lockedChunkIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const aiClient = getAIClient();
    console.log("buildDayPlan called with:", {
      timeBudgetMin: args.timeBudgetMin,
      energyMode: args.energyMode,
      maxTasks: args.maxTasks,
      availableChunksCount: args.availableChunks.length,
      lockedChunkIds: args.lockedChunkIds,
    });

    if (args.availableChunks.length === 0) {
      throw new Error("No available chunks provided");
    }

    // Build prompt using template
    const prompt = buildDayPlanPrompt({
      timeBudgetMin: args.timeBudgetMin,
      energyMode: args.energyMode,
      maxTasks: args.maxTasks,
      availableChunks: args.availableChunks.map((c) => ({
        id: c.id,
        chunkId: c.chunkId,
        title: c.title,
        durationMin: c.durationMin,
        tags: c.tags,
        areaTitle: c.areaTitle,
        areaWeight: c.areaWeight,
        intentionTitle: c.intentionTitle,
      })),
      lockedChunkIds: args.lockedChunkIds,
    });

    console.log("Generated prompt length:", prompt.length);

    // Call AI
    const completion = await aiClient.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: BUILD_DAY_PLAN_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    console.log("AI completion received");
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    console.log("Response text:", responseText);

    // Parse and validate response
    const parsed = JSON.parse(responseText);
    console.log("Parsed response:", parsed);
    // Validate response
    if (!parsed.suggestedItems || !Array.isArray(parsed.suggestedItems)) {
      throw new Error("Invalid AI response: missing suggestedItems array");
    }

    if (parsed.suggestedItems.length > args.maxTasks) {
      throw new Error(
        `Too many items suggested: ${parsed.suggestedItems.length} (max: ${args.maxTasks})`,
      );
    }

    // Validate each suggested item
    const validChunkIds = new Set(args.availableChunks.map((c) => c.chunkId));
    for (const item of parsed.suggestedItems) {
      if (!validChunkIds.has(item.chunkId)) {
        throw new Error(`Invalid chunk ID in suggestions: ${item.chunkId}`);
      }
    }

    // Ensure all locked chunks are included
    if (args.lockedChunkIds.length > 0) {
      const lockedChunkIds = new Set(
        args.lockedChunkIds.map((id) => {
          const chunk = args.availableChunks.find((c) => c.id === id);
          return chunk?.chunkId;
        }),
      );

      const suggestedChunkIds = new Set(
        parsed.suggestedItems.map((item: any) => item.chunkId),
      );

      for (const lockedId of lockedChunkIds) {
        if (lockedId && !suggestedChunkIds.has(lockedId)) {
          throw new Error("AI did not include all locked chunks in the plan");
        }
      }
    }

    const result = {
      suggestedItems: parsed.suggestedItems,
      totalDuration: parsed.totalDuration || 0,
      reasoning: parsed.reasoning || "",
      energyBalance: parsed.energyBalance || "",
    };

    console.log("Convex AI buildDayPlan returning:", result);
    return result;
  },
});

// Split Chunk Action
export const splitChunk = action({
  args: {
    chunkTitle: v.string(),
    chunkDod: v.string(),
    originalDuration: v.number(),
    targetDuration: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const aiClient = getAIClient();

    // Validate input
    if (args.targetDuration < 30 || args.targetDuration > 120) {
      throw new Error("Target duration must be between 30-120 minutes");
    }

    if (args.originalDuration <= args.targetDuration) {
      throw new Error("Original duration must be greater than target duration");
    }

    // Build prompt using template
    const prompt = buildSplitChunkPrompt({
      chunkTitle: args.chunkTitle,
      chunkDod: args.chunkDod,
      originalDuration: args.originalDuration,
      targetDuration: args.targetDuration,
      tags: args.tags,
    });

    // Call AI
    const completion = await aiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: SPLIT_CHUNK_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Parse and validate response
    const parsed = JSON.parse(responseText);

    // Validate parts
    if (!parsed.parts || !Array.isArray(parsed.parts)) {
      throw new Error("Invalid AI response: missing parts array");
    }

    if (parsed.parts.length < 2) {
      throw new Error("Split must produce at least 2 parts");
    }

    // Validate each part
    for (const part of parsed.parts) {
      if (!part.title || !part.dod) {
        throw new Error("Invalid part: missing title or dod");
      }

      if (part.durationMin < 30 || part.durationMin > 120) {
        throw new Error(
          `Invalid duration: ${part.durationMin}m (must be 30-120)`,
        );
      }

      if (!part.tags || !Array.isArray(part.tags)) {
        part.tags = [];
      }
    }

    // Validate total duration is reasonable
    const totalDuration = parsed.parts.reduce(
      (sum: number, part: any) => sum + part.durationMin,
      0,
    );
    const durationDiff = Math.abs(totalDuration - args.originalDuration);
    const allowedDiff = args.originalDuration * 0.2; // Allow 20% variance

    if (durationDiff > allowedDiff) {
      console.warn(
        `Total split duration (${totalDuration}m) differs from original (${args.originalDuration}m) by more than 20%`,
      );
    }

    return {
      parts: parsed.parts,
      reasoning: parsed.reasoning || "",
    };
  },
});
