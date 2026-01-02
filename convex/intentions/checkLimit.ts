import { query } from "../_generated/server";
import { v } from "convex/values";

export const checkLimit = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canAddActive: false, activeCount: 0, limit: 3 };
    }

    const activeIntentions = await ctx.db
      .query("intentions")
      .withIndex("by_area_status", (q) =>
        q.eq("areaId", args.areaId).eq("status", "active")
      )
      .collect();

    return {
      canAddActive: activeIntentions.length < 3,
      activeCount: activeIntentions.length,
      limit: 3,
    };
  },
});
