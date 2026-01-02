import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAreaHealth = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const area = await ctx.db.get(args.areaId);
    if (!area || area.userId !== (identity.subject as any)) {
      return null;
    }

    // Calculate days since last touched
    const daysSinceLastTouched = Math.floor(
      (Date.now() - area.lastTouchedAt) / (1000 * 60 * 60 * 24)
    );

    // Get active intentions count
    const activeIntentions = await ctx.db
      .query("intentions")
      .withIndex("by_area_status", (q) =>
        q.eq("areaId", args.areaId).eq("status", "active")
      )
      .collect();

    // Get ready chunks count
    const readyChunks = await ctx.db
      .query("chunks")
      .withIndex("by_area_status", (q) =>
        q.eq("areaId", args.areaId).eq("status", "ready")
      )
      .collect();

    // Calculate health status
    let calculatedHealth: "neglected" | "normal" | "urgent";
    if (daysSinceLastTouched > 14) {
      calculatedHealth = "neglected";
    } else {
      calculatedHealth = "normal";
    }

    return {
      area,
      daysSinceLastTouched,
      activeIntentionsCount: activeIntentions.length,
      readyChunksCount: readyChunks.length,
      calculatedHealth,
    };
  },
});
