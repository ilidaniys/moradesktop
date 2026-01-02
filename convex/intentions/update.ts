import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const update = mutation({
  args: {
    intentionId: v.id("intentions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("done"))
    ),
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

    // Check active intentions limit if changing to active
    if (args.status === "active" && intention.status !== "active") {
      const activeIntentions = await ctx.db
        .query("intentions")
        .withIndex("by_area_status", (q) =>
          q.eq("areaId", intention.areaId).eq("status", "active")
        )
        .collect();

      if (activeIntentions.length >= 3) {
        throw new Error(
          "Maximum 3 active intentions per area. Please pause an existing intention first."
        );
      }
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.intentionId, updates);
  },
});
