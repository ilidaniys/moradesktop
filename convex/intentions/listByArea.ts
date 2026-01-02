import { query } from "../_generated/server";
import { v } from "convex/values";

export const listByArea = query({
  args: {
    areaId: v.id("areas"),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("done"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify area belongs to user
    const area = await ctx.db.get(args.areaId);
    if (!area || area.userId !== (identity.subject as any)) {
      return [];
    }

    let intentions;
    if (args.status) {
      intentions = await ctx.db
        .query("intentions")
        .withIndex("by_area_status", (q) =>
          q.eq("areaId", args.areaId).eq("status", args.status!)
        )
        .collect();
    } else {
      intentions = await ctx.db
        .query("intentions")
        .withIndex("by_area", (q) => q.eq("areaId", args.areaId))
        .collect();
    }

    // Sort by order
    return intentions.sort((a, b) => a.order - b.order);
  },
});
