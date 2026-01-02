import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const update = mutation({
  args: {
    chunkId: v.id("chunks"),
    title: v.optional(v.string()),
    dod: v.optional(v.string()),
    durationMin: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chunk = await ctx.db.get(args.chunkId);
    if (!chunk || chunk.userId !== (identity.subject as any)) {
      throw new Error("Chunk not found or access denied");
    }

    // Validate duration if provided
    if (
      args.durationMin !== undefined &&
      (args.durationMin < 30 || args.durationMin > 120)
    ) {
      throw new Error("Duration must be between 30 and 120 minutes");
    }

    // Validate DoD if provided
    if (args.dod !== undefined && args.dod.trim().length === 0) {
      throw new Error("Definition of Done cannot be empty");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.dod !== undefined) updates.dod = args.dod;
    if (args.durationMin !== undefined) updates.durationMin = args.durationMin;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.chunkId, updates);
  },
});
