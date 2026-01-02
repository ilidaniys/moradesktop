import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const update = mutation({
  args: {
    areaId: v.id("areas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    weight: v.optional(v.number()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("archived"))
    ),
    health: v.optional(
      v.union(v.literal("neglected"), v.literal("normal"), v.literal("urgent"))
    ),
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

    // Validate weight if provided
    if (args.weight !== undefined && (args.weight < 1 || args.weight > 10)) {
      throw new Error("Weight must be between 1 and 10");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.weight !== undefined) updates.weight = args.weight;
    if (args.status !== undefined) updates.status = args.status;
    if (args.health !== undefined) updates.health = args.health;

    await ctx.db.patch(args.areaId, updates);
  },
});
