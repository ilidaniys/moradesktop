import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const dayPlan = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject as any).eq("date", args.date)
      )
      .first();

    if (!dayPlan) {
      return null;
    }

    // Get all items in the plan
    const items = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", dayPlan._id))
      .collect();

    // Fetch chunks for each item
    const itemsWithChunks = await Promise.all(
      items.map(async (item) => {
        const chunk = await ctx.db.get(item.chunkId);
        return {
          ...item,
          chunk,
        };
      })
    );

    // Sort by order
    itemsWithChunks.sort((a, b) => a.order - b.order);

    return {
      ...dayPlan,
      items: itemsWithChunks,
    };
  },
});
