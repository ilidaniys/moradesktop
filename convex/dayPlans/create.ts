import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    date: v.string(),
    timeBudget: v.number(),
    energyMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("light")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if a plan already exists for this date
    const existing = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject as any).eq("date", args.date)
      )
      .first();

    if (existing) {
      throw new Error("A day plan already exists for this date");
    }

    const dayPlanId = await ctx.db.insert("dayPlans", {
      userId: identity.subject as any,
      date: args.date,
      timeBudget: args.timeBudget,
      energyMode: args.energyMode,
      notes: args.notes,
      status: "draft",
    });

    return dayPlanId;
  },
});
