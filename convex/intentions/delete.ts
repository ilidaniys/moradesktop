import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteIntention = mutation({
  args: {
    intentionId: v.id("intentions"),
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

    // Delete all chunks in this intention
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_intention", (q) => q.eq("intentionId", args.intentionId))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    // Delete the intention
    await ctx.db.delete(args.intentionId);
  },
});
