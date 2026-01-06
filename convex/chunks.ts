import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    intentionId: v.id("intentions"),
    title: v.string(),
    dod: v.string(),
    durationMin: v.number(),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("ready"),
        v.literal("inPlan"),
        v.literal("inProgress"),
        v.literal("done"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify intention belongs to user
    const intention = await ctx.db.get(args.intentionId);
    if (!intention || intention.userId !== (identity.subject as any)) {
      throw new Error("Intention not found or access denied");
    }

    // Validate duration (30-120 minutes)
    if (args.durationMin < 30 || args.durationMin > 120) {
      throw new Error("Duration must be between 30 and 120 minutes");
    }

    // Validate DoD is not empty
    if (!args.dod || args.dod.trim().length === 0) {
      throw new Error("Definition of Done cannot be empty");
    }

    const chunkId = await ctx.db.insert("chunks", {
      userId: identity.subject as any,
      areaId: intention.areaId,
      intentionId: args.intentionId,
      title: args.title,
      dod: args.dod,
      durationMin: args.durationMin,
      status: args.status || "backlog",
      tags: args.tags || [],
    });

    return chunkId;
  },
});

export const createBatch = mutation({
  args: {
    intentionId: v.id("intentions"),
    chunks: v.array(
      v.object({
        title: v.string(),
        dod: v.string(),
        durationMin: v.number(),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify intention belongs to user
    const intention = await ctx.db.get(args.intentionId);
    if (!intention || intention.userId !== (identity.subject as any)) {
      throw new Error("Intention not found or access denied");
    }

    const chunkIds = [];

    for (const chunk of args.chunks) {
      // Validate each chunk
      if (chunk.durationMin < 30 || chunk.durationMin > 120) {
        throw new Error(
          `Chunk "${chunk.title}": Duration must be between 30 and 120 minutes`,
        );
      }

      if (!chunk.dod || chunk.dod.trim().length === 0) {
        throw new Error(
          `Chunk "${chunk.title}": Definition of Done cannot be empty`,
        );
      }

      const chunkId = await ctx.db.insert("chunks", {
        userId: identity.subject,
        areaId: intention.areaId,
        intentionId: args.intentionId,
        title: chunk.title,
        dod: chunk.dod,
        durationMin: chunk.durationMin,
        status: "backlog",
        tags: chunk.tags || [],
      });

      chunkIds.push(chunkId);
    }

    return chunkIds;
  },
});

export const update = mutation({
  args: {
    chunkId: v.id("chunks"),
    title: v.optional(v.string()),
    dod: v.optional(v.string()),
    durationMin: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chunk = await ctx.db.get(args.chunkId);
    if (chunk?.userId !== identity.subject) {
      throw new Error("Chunk not found or access denied");
    }

    // Validate duration if provided
    if (
      args.durationMin !== undefined &&
      (args.durationMin < 30 || args.durationMin > 120)
    ) {
      throw new Error("Duration must be between 30 and 120 minutes");
    }

    // Validate DoD if provided
    if (args.dod?.trim().length === 0) {
      throw new Error("Definition of Done cannot be empty");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.dod !== undefined) updates.dod = args.dod;
    if (args.durationMin !== undefined) updates.durationMin = args.durationMin;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.chunkId, updates);
  },
});

export const updateStatus = mutation({
  args: {
    chunkId: v.id("chunks"),
    status: v.union(
      v.literal("backlog"),
      v.literal("ready"),
      v.literal("inPlan"),
      v.literal("inProgress"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chunk = await ctx.db.get(args.chunkId);
    if (!chunk || chunk.userId !== (identity.subject as any)) {
      throw new Error("Chunk not found or access denied");
    }

    const updates: any = { status: args.status };

    // If marking as done, set completedAt timestamp
    if (args.status === "done") {
      updates.completedAt = Date.now();

      // Update area's lastTouchedAt
      await ctx.db.patch(chunk.areaId, {
        lastTouchedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.chunkId, updates);
  },
});

export const listByIntention = query({
  args: {
    intentionId: v.id("intentions"),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("ready"),
        v.literal("inPlan"),
        v.literal("inProgress"),
        v.literal("done"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify intention belongs to user
    const intention = await ctx.db.get(args.intentionId);
    if (intention?.userId !== identity.subject) {
      return [];
    }

    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_intention", (q) => q.eq("intentionId", args.intentionId))
      .collect();

    // Filter by status if provided
    const filteredChunks = args.status
      ? chunks.filter((c) => c.status === args.status)
      : chunks;

    // Sort by creation time (most recent first)
    return filteredChunks.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const listReadyChunks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get all ready chunks for user
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", identity.subject).eq("status", "ready"),
      )
      .collect();

    // Fetch associated areas and intentions for context
    const chunksWithContext = await Promise.all(
      chunks.map(async (chunk) => {
        const area = await ctx.db.get(chunk.areaId);
        const intention = await ctx.db.get(chunk.intentionId);

        return {
          ...chunk,
          area: area
            ? {
                _id: area._id,
                title: area.title,
                weight: area.weight,
                lastTouchedAt: area.lastTouchedAt,
                health: area.health,
              }
            : null,
          intention: intention
            ? {
                _id: intention._id,
                title: intention.title,
                status: intention.status,
              }
            : null,
        };
      }),
    );

    return chunksWithContext;
  },
});

export const remove = mutation({
  args: {
    chunkId: v.id("chunks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chunk = await ctx.db.get(args.chunkId);
    if (!chunk || chunk.userId !== (identity.subject as any)) {
      throw new Error("Chunk not found or access denied");
    }

    await ctx.db.delete(args.chunkId);
  },
});

export const split = mutation({
  args: {
    chunkId: v.id("chunks"),
    parts: v.array(
      v.object({
        title: v.string(),
        dod: v.string(),
        durationMin: v.number(),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const originalChunk = await ctx.db.get(args.chunkId);
    if (originalChunk?.userId !== identity.subject) {
      throw new Error("Chunk not found or access denied");
    }

    // Validate parts
    if (args.parts.length < 2) {
      throw new Error("Must split into at least 2 parts");
    }

    for (const part of args.parts) {
      if (part.durationMin < 30 || part.durationMin > 120) {
        throw new Error(
          `Part "${part.title}": Duration must be between 30 and 120 minutes`,
        );
      }

      if (!part.dod || part.dod.trim().length === 0) {
        throw new Error(
          `Part "${part.title}": Definition of Done cannot be empty`,
        );
      }
    }

    // Mark original chunk as done
    await ctx.db.patch(args.chunkId, {
      status: "done",
      completedAt: Date.now(),
    });

    // Update area's lastTouchedAt
    await ctx.db.patch(originalChunk.areaId, {
      lastTouchedAt: Date.now(),
    });

    // Create new chunks
    const newChunkIds = [];
    for (const part of args.parts) {
      const newChunkId = await ctx.db.insert("chunks", {
        userId: identity.subject,
        areaId: originalChunk.areaId,
        intentionId: originalChunk.intentionId,
        title: part.title,
        dod: part.dod,
        durationMin: part.durationMin,
        status: "ready", // New chunks start as ready
        tags: part.tags || originalChunk.tags, // Inherit tags if not specified
      });

      newChunkIds.push(newChunkId);
    }

    // Record the split
    await ctx.db.insert("chunkSplits", {
      originalChunkId: args.chunkId,
      newChunkIds,
      createdAt: new Date().getDate(),
    });

    return newChunkIds;
  },
});
