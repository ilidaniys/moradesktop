import { mutation, query } from "./_generated/server";
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
      userId: identity.subject,
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

export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let areas;
    if (args.status) {
      // Filter by status
      areas = await ctx.db
        .query("areas")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", identity.subject).eq("status", args.status!),
        )
        .collect();
    } else {
      // Get all areas for user
      areas = await ctx.db
        .query("areas")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
        .collect();
    }

    // Sort by weight (highest first), then by lastTouchedAt (most recent first)
    return areas.sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      return b.lastTouchedAt - a.lastTouchedAt;
    });
  },
});

export const get = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const area = await ctx.db.get(args.areaId);

    // Verify area belongs to user
    if (!area || area.userId !== (identity.subject as any)) {
      return null;
    }

    return area;
  },
});

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

export const remove = mutation({
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
