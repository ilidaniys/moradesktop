import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteChunk = mutation({
  args: {
    chunkId: v.id("chunks"),
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

    await ctx.db.delete(args.chunkId);
  },
});
