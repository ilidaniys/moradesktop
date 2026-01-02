import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    areaId: v.id("areas"),
    title: v.string(),
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

    // Verify area belongs to user
    const area = await ctx.db.get(args.areaId);
    if (!area || area.userId !== (identity.subject as any)) {
      throw new Error("Area not found or access denied");
    }

    // Check active intentions limit (max 3)
    if (args.status === "active" || !args.status) {
      const activeIntentions = await ctx.db
        .query("intentions")
        .withIndex("by_area_status", (q) =>
          q.eq("areaId", args.areaId).eq("status", "active")
        )
        .collect();

      if (activeIntentions.length >= 3) {
        throw new Error(
          "Maximum 3 active intentions per area. Please pause an existing intention first."
        );
      }
    }

    // Get highest order number for ordering
    const allIntentions = await ctx.db
      .query("intentions")
      .withIndex("by_area", (q) => q.eq("areaId", args.areaId))
      .collect();

    const maxOrder = Math.max(...allIntentions.map((i) => i.order), -1);

    const intentionId = await ctx.db.insert("intentions", {
      userId: identity.subject as any,
      areaId: args.areaId,
      title: args.title,
      description: args.description,
      status: args.status || "active",
      order: maxOrder + 1,
    });

    return intentionId;
  },
});
