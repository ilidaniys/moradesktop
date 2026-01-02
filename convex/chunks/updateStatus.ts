import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    chunkId: v.id("chunks"),
    status: v.union(
      v.literal("backlog"),
      v.literal("ready"),
      v.literal("inPlan"),
      v.literal("inProgress"),
      v.literal("done")
    ),
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

    const updates: any = { status: args.status };

    // If marking as done, set completedAt timestamp
    if (args.status === "done") {
      updates.completedAt = Date.now();

      // Update area's lastTouchedAt
      await ctx.db.patch(chunk.areaId, {
        lastTouchedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.chunkId, updates);
  },
});
