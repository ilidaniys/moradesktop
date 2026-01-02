import { query } from "../_generated/server";
import { v } from "convex/values";

export const listByIntention = query({
  args: {
    intentionId: v.id("intentions"),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("ready"),
        v.literal("inPlan"),
        v.literal("inProgress"),
        v.literal("done")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify intention belongs to user
    const intention = await ctx.db.get(args.intentionId);
    if (!intention || intention.userId !== (identity.subject as any)) {
      return [];
    }

    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_intention", (q) => q.eq("intentionId", args.intentionId))
      .collect();

    // Filter by status if provided
    let filteredChunks = args.status
      ? chunks.filter((c) => c.status === args.status)
      : chunks;

    // Sort by creation time (most recent first)
    return filteredChunks.sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});
