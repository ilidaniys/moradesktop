import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const addItem = mutation({
  args: {
    dayPlanId: v.id("dayPlans"),
    chunkId: v.id("chunks"),
    locked: v.optional(v.boolean()),
    aiReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify day plan belongs to user
    const dayPlan = await ctx.db.get(args.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Day plan not found or access denied");
    }

    // Verify chunk belongs to user
    const chunk = await ctx.db.get(args.chunkId);
    if (!chunk || chunk.userId !== (identity.subject as any)) {
      throw new Error("Chunk not found or access denied");
    }

    // Check if chunk is already in the plan
    const existing = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", args.dayPlanId))
      .collect();

    if (existing.some((item) => item.chunkId === args.chunkId)) {
      throw new Error("Chunk is already in this day plan");
    }

    // Check max 8 items limit
    if (existing.length >= 8) {
      throw new Error("Maximum 8 chunks per day plan");
    }

    // Get highest order number
    const maxOrder = Math.max(...existing.map((i) => i.order), -1);

    const itemId = await ctx.db.insert("dayPlanItems", {
      dayPlanId: args.dayPlanId,
      chunkId: args.chunkId,
      order: maxOrder + 1,
      locked: args.locked || false,
      status: "pending",
      aiReason: args.aiReason,
    });

    // Update chunk status to inPlan
    await ctx.db.patch(args.chunkId, {
      status: "inPlan",
    });

    return itemId;
  },
});
