import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const removeItem = mutation({
  args: {
    itemId: v.id("dayPlanItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Day plan item not found");
    }

    // Verify day plan belongs to user
    const dayPlan = await ctx.db.get(item.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Access denied");
    }

    // Update chunk status back to ready
    const chunk = await ctx.db.get(item.chunkId);
    if (chunk && chunk.status === "inPlan") {
      await ctx.db.patch(item.chunkId, {
        status: "ready",
      });
    }

    await ctx.db.delete(args.itemId);
  },
});
