import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const complete = mutation({
  args: {
    dayPlanId: v.id("dayPlans"),
    perceivedLoad: v.union(
      v.literal("light"),
      v.literal("normal"),
      v.literal("heavy")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const dayPlan = await ctx.db.get(args.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Day plan not found or access denied");
    }

    // Mark day plan as completed
    await ctx.db.patch(args.dayPlanId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Create day review
    await ctx.db.insert("dayReviews", {
      dayPlanId: args.dayPlanId,
      perceivedLoad: args.perceivedLoad,
      notes: args.notes,
    });
  },
});
