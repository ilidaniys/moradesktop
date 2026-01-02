import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const finalize = mutation({
  args: {
    dayPlanId: v.id("dayPlans"),
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

    await ctx.db.patch(args.dayPlanId, {
      status: "active",
      finalizedAt: Date.now(),
    });
  },
});
