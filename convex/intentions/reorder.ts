import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const reorder = mutation({
  args: {
    intentionId: v.id("intentions"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const intention = await ctx.db.get(args.intentionId);
    if (!intention || intention.userId !== (identity.subject as any)) {
      throw new Error("Intention not found or access denied");
    }

    await ctx.db.patch(args.intentionId, {
      order: args.newOrder,
    });
  },
});
