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

export const getActiveForToday = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const dayPlan = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today),
      )
      .first();

    // Only return if plan is active
    if (!dayPlan || dayPlan.status !== "active") {
      return null;
    }

    // Get all items in the plan
    const items = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", dayPlan._id))
      .collect();

    // Fetch chunks with area and intention data for each item
    const itemsWithChunks = await Promise.all(
      items.map(async (item) => {
        const chunk = await ctx.db.get(item.chunkId);
        if (!chunk) {
          return {
            ...item,
            chunk: null,
            area: null,
            intention: null,
          };
        }

        const area = await ctx.db.get(chunk.areaId);
        const intention = await ctx.db.get(chunk.intentionId);

        return {
          ...item,
          chunk,
          area,
          intention,
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

export const getActiveDayPlanStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const dayPlan = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today),
      )
      .first();

    // Only return if plan is active
    if (!dayPlan || dayPlan.status !== "active") {
      return null;
    }

    // Get all items in the plan
    const items = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", dayPlan._id))
      .collect();

    // Fetch chunks for duration info
    const itemsWithChunks = await Promise.all(
      items.map(async (item) => {
        const chunk = await ctx.db.get(item.chunkId);
        return {
          ...item,
          chunk,
        };
      }),
    );

    // Calculate statistics
    const totalItems = items.length;
    const completedItems = items.filter((i) => i.status === "completed").length;
    const skippedItems = items.filter((i) => i.status === "skipped").length;
    const inProgressItems = items.filter((i) => i.status === "inProgress")
      .length;
    const pendingItems = items.filter((i) => i.status === "pending").length;

    // Calculate time statistics
    const totalPlannedTime = itemsWithChunks.reduce(
      (sum, item) => sum + (item.chunk?.durationMin || 0),
      0,
    );

    const timeUsed = items.reduce((sum, item) => {
      if (item.status === "completed" && item.actualDurationMin) {
        return sum + item.actualDurationMin;
      }
      return sum;
    }, 0);

    const timeRemaining = dayPlan.timeBudget - timeUsed;

    // Calculate completion percentage
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      completedItems,
      skippedItems,
      inProgressItems,
      pendingItems,
      totalPlannedTime,
      timeUsed,
      timeRemaining,
      timeBudget: dayPlan.timeBudget,
      completionPercentage,
      energyMode: dayPlan.energyMode,
      date: dayPlan.date,
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
      v.literal("inProgress"),
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

    // Handle chunk status updates based on item status
    if (args.status === "completed") {
      // If status is completed, update the chunk status as well
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
    } else if (args.status === "inProgress") {
      // If status is inProgress, update chunk to inProgress
      await ctx.db.patch(item.chunkId, {
        status: "inProgress",
      });
    } else if (
      args.status === "moved" ||
      args.status === "skipped" ||
      args.status === "pending"
    ) {
      // If moved, skipped, or pending, update chunk based on context
      const chunk = await ctx.db.get(item.chunkId);
      if (chunk?.status === "done") {
        // Don't change if already done
      } else if (args.status === "pending") {
        // Pending means it's still in the plan
        await ctx.db.patch(item.chunkId, {
          status: "inPlan",
        });
      } else {
        // Moved or skipped, chunk goes back to ready
        await ctx.db.patch(item.chunkId, {
          status: "ready",
        });
      }
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

export const startItem = mutation({
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

    // Ensure day plan is active
    if (dayPlan.status !== "active") {
      throw new Error("Day plan is not active");
    }

    // Find and pause any other in-progress items in this plan
    const allItems = await ctx.db
      .query("dayPlanItems")
      .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", item.dayPlanId))
      .collect();

    for (const otherItem of allItems) {
      if (otherItem._id !== args.itemId && otherItem.status === "inProgress") {
        await ctx.db.patch(otherItem._id, {
          status: "pending",
        });

        // Update chunk status back to inPlan
        await ctx.db.patch(otherItem.chunkId, {
          status: "inPlan",
        });
      }
    }

    // Start this item
    await ctx.db.patch(args.itemId, {
      status: "inProgress",
      startedAt: Date.now(),
    });

    // Update chunk status to inProgress
    await ctx.db.patch(item.chunkId, {
      status: "inProgress",
    });

    return args.itemId;
  },
});

export const pauseItem = mutation({
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

    // Only allow pausing items that are in progress
    if (item.status !== "inProgress") {
      throw new Error("Can only pause items that are in progress");
    }

    // Pause this item
    await ctx.db.patch(args.itemId, {
      status: "pending",
    });

    // Update chunk status back to inPlan
    await ctx.db.patch(item.chunkId, {
      status: "inPlan",
    });

    return args.itemId;
  },
});

export const completeItem = mutation({
  args: {
    itemId: v.id("dayPlanItems"),
    actualDurationMin: v.number(),
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

    // Complete this item
    await ctx.db.patch(args.itemId, {
      status: "completed",
      completedAt: Date.now(),
      actualDurationMin: args.actualDurationMin,
    });

    // Update chunk status to done
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

    return args.itemId;
  },
});

export const skipItem = mutation({
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

    // Skip this item
    await ctx.db.patch(args.itemId, {
      status: "skipped",
    });

    // Update chunk status back to ready
    await ctx.db.patch(item.chunkId, {
      status: "ready",
    });

    return args.itemId;
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
