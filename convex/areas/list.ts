import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let areas;
    if (args.status) {
      // Filter by status
      areas = await ctx.db
        .query("areas")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", identity.subject as any).eq("status", args.status!),
        )
        .collect();
    } else {
      // Get all areas for user
      areas = await ctx.db
        .query("areas")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
        .collect();
    }

    // Sort by weight (highest first), then by lastTouchedAt (most recent first)
    return areas.sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      return b.lastTouchedAt - a.lastTouchedAt;
    });
  },
});
