import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteArea = mutation({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const area = await ctx.db.get(args.areaId);
    if (!area || area.userId !== (identity.subject as any)) {
      throw new Error("Area not found or access denied");
    }

    // Delete all intentions in this area
    const intentions = await ctx.db
      .query("intentions")
      .withIndex("by_area", (q) => q.eq("areaId", args.areaId))
      .collect();

    for (const intention of intentions) {
      // Delete all chunks in this intention
      const chunks = await ctx.db
        .query("chunks")
        .withIndex("by_intention", (q) => q.eq("intentionId", intention._id))
        .collect();

      for (const chunk of chunks) {
        await ctx.db.delete(chunk._id);
      }

      await ctx.db.delete(intention._id);
    }

    // Delete the area
    await ctx.db.delete(args.areaId);
  },
});
