import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    date: v.string(),
    timeBudget: v.number(),
    energyMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("light"),
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
        q.eq("userId", identity.subject).eq("date", args.date),
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

export const get = query({
  args: {
    dayPlanId: v.id("dayPlans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const dayPlan = await ctx.db.get(args.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      return null;
    }

    // Get all items in the plan
    const items = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", args.dayPlanId))
      .collect();

    // Fetch chunks for each item
    const itemsWithChunks = await Promise.all(
      items.map(async (item) => {
        const chunk = await ctx.db.get(item.chunkId);
        return {
          ...item,
          chunk,
        };
      }),
    );

    // Sort by order
    itemsWithChunks.sort((a, b) => a.order - b.order);

    return {
      ...dayPlan,
      items: itemsWithChunks,
    };
  },
});

export const getByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const dayPlan = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date),
      )
      .first();

    if (!dayPlan) {
      return null;
    }

    // Get all items in the plan
    const items = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", dayPlan._id))
      .collect();

    // Fetch chunks for each item
    const itemsWithChunks = await Promise.all(
      items.map(async (item) => {
        const chunk = await ctx.db.get(item.chunkId);
        return {
          ...item,
          chunk,
        };
      }),
    );

    // Sort by order
    itemsWithChunks.sort((a, b) => a.order - b.order);

    return {
      ...dayPlan,
      items: itemsWithChunks,
    };
  },
});

export const addItem = mutation({
  args: {
    dayPlanId: v.id("dayPlans"),
    chunkId: v.id("chunks"),
    locked: v.optional(v.boolean()),
    aiReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify day plan belongs to user
    const dayPlan = await ctx.db.get(args.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Day plan not found or access denied");
    }

    // Verify chunk belongs to user
    const chunk = await ctx.db.get(args.chunkId);
    if (!chunk || chunk.userId !== (identity.subject as any)) {
      throw new Error("Chunk not found or access denied");
    }

    // Check if chunk is already in the plan
    const existing = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", args.dayPlanId))
      .collect();

    if (existing.some((item) => item.chunkId === args.chunkId)) {
      throw new Error("Chunk is already in this day plan");
    }

    // Check max 8 items limit
    if (existing.length >= 8) {
      throw new Error("Maximum 8 chunks per day plan");
    }

    // Get highest order number
    const maxOrder = Math.max(...existing.map((i) => i.order), -1);

    const itemId = await ctx.db.insert("dayPlanItems", {
      dayPlanId: args.dayPlanId,
      chunkId: args.chunkId,
      order: maxOrder + 1,
      locked: args.locked || false,
      status: "pending",
      aiReason: args.aiReason,
    });

    // Update chunk status to inPlan
    await ctx.db.patch(args.chunkId, {
      status: "inPlan",
    });

    return itemId;
  },
});

export const removeItem = mutation({
  args: {
    itemId: v.id("dayPlanItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Day plan item not found");
    }

    // Verify day plan belongs to user
    const dayPlan = await ctx.db.get(item.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Access denied");
    }

    // Update chunk status back to ready
    const chunk = await ctx.db.get(item.chunkId);
    if (chunk?.status === "inPlan") {
      await ctx.db.patch(item.chunkId, {
        status: "ready",
      });
    }

    await ctx.db.delete(args.itemId);
  },
});

export const updateItemStatus = mutation({
  args: {
    itemId: v.id("dayPlanItems"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("skipped"),
      v.literal("moved"),
    ),
    actualDurationMin: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Day plan item not found");
    }

    // Verify day plan belongs to user
    const dayPlan = await ctx.db.get(item.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.itemId, {
      status: args.status,
      actualDurationMin: args.actualDurationMin,
    });

    // If status is completed, update the chunk status as well
    if (args.status === "completed") {
      await ctx.db.patch(item.chunkId, {
        status: "done",
        completedAt: Date.now(),
      });

      // Update area's lastTouchedAt
      const chunk = await ctx.db.get(item.chunkId);
      if (chunk) {
        await ctx.db.patch(chunk.areaId, {
          lastTouchedAt: Date.now(),
        });
      }
    } else if (args.status === "moved" || args.status === "skipped") {
      // If moved or skipped, chunk goes back to ready
      await ctx.db.patch(item.chunkId, {
        status: "ready",
      });
    }

    return args.itemId;
  },
});

export const reorderItems = mutation({
  args: {
    itemOrders: v.array(
      v.object({
        itemId: v.id("dayPlanItems"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    for (const { itemId, order } of args.itemOrders) {
      const item = await ctx.db.get(itemId);
      if (!item) continue;

      // Verify day plan belongs to user
      const dayPlan = await ctx.db.get(item.dayPlanId);
      if (dayPlan?.userId !== identity.subject) {
        throw new Error("Access denied");
      }

      await ctx.db.patch(itemId, {
        order: order,
      });
    }
  },
});

export const finalize = mutation({
  args: {
    dayPlanId: v.id("dayPlans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const dayPlan = await ctx.db.get(args.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Day plan not found or access denied");
    }

    await ctx.db.patch(args.dayPlanId, {
      status: "active",
      finalizedAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: {
    dayPlanId: v.id("dayPlans"),
    perceivedLoad: v.union(
      v.literal("light"),
      v.literal("normal"),
      v.literal("heavy"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const dayPlan = await ctx.db.get(args.dayPlanId);
    if (!dayPlan || dayPlan.userId !== (identity.subject as any)) {
      throw new Error("Day plan not found or access denied");
    }

    // Mark day plan as completed
    await ctx.db.patch(args.dayPlanId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Create day review
    await ctx.db.insert("dayReviews", {
      dayPlanId: args.dayPlanId,
      perceivedLoad: args.perceivedLoad,
      notes: args.notes,
    });
  },
});
