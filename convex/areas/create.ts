import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate weight is between 1-10
    if (args.weight < 1 || args.weight > 10) {
      throw new Error("Weight must be between 1 and 10");
    }

    const areaId = await ctx.db.insert("areas", {
      userId: identity.subject as any,
      title: args.title,
      description: args.description,
      weight: args.weight,
      status: "active",
      lastTouchedAt: Date.now(),
      health: "normal",
    });

    return areaId;
  },
});
