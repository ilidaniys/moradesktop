import { mutation, query } from "./_generated/server";
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

export const listByArea = query({
  args: {
    areaId: v.id("areas"),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("done"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify area belongs to user
    const area = await ctx.db.get(args.areaId);
    if (!area || area.userId !== (identity.subject as any)) {
      return [];
    }

    let intentions;
    if (args.status) {
      intentions = await ctx.db
        .query("intentions")
        .withIndex("by_area_status", (q) =>
          q.eq("areaId", args.areaId).eq("status", args.status!)
        )
        .collect();
    } else {
      intentions = await ctx.db
        .query("intentions")
        .withIndex("by_area", (q) => q.eq("areaId", args.areaId))
        .collect();
    }

    // Sort by order
    return intentions.sort((a, b) => a.order - b.order);
  },
});

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

export const remove = mutation({
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

export const checkLimit = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canAddActive: false, activeCount: 0, limit: 3 };
    }

    const activeIntentions = await ctx.db
      .query("intentions")
      .withIndex("by_area_status", (q) =>
        q.eq("areaId", args.areaId).eq("status", "active")
      )
      .collect();

    return {
      canAddActive: activeIntentions.length < 3,
      activeCount: activeIntentions.length,
      limit: 3,
    };
  },
});
