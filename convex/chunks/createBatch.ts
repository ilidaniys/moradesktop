import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createBatch = mutation({
  args: {
    intentionId: v.id("intentions"),
    chunks: v.array(
      v.object({
        title: v.string(),
        dod: v.string(),
        durationMin: v.number(),
        tags: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify intention belongs to user
    const intention = await ctx.db.get(args.intentionId);
    if (!intention || intention.userId !== (identity.subject as any)) {
      throw new Error("Intention not found or access denied");
    }

    const chunkIds = [];

    for (const chunk of args.chunks) {
      // Validate each chunk
      if (chunk.durationMin < 30 || chunk.durationMin > 120) {
        throw new Error(
          `Chunk "${chunk.title}": Duration must be between 30 and 120 minutes`
        );
      }

      if (!chunk.dod || chunk.dod.trim().length === 0) {
        throw new Error(
          `Chunk "${chunk.title}": Definition of Done cannot be empty`
        );
      }

      const chunkId = await ctx.db.insert("chunks", {
        userId: identity.subject as any,
        areaId: intention.areaId,
        intentionId: args.intentionId,
        title: chunk.title,
        dod: chunk.dod,
        durationMin: chunk.durationMin,
        status: "backlog",
        tags: chunk.tags || [],
      });

      chunkIds.push(chunkId);
    }

    return chunkIds;
  },
});
