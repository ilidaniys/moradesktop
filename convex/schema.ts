import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User authentication table
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // Areas: Long-term domains of responsibility
  areas: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    weight: v.number(), // Priority/importance (1-10)
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived")
    ),
    lastTouchedAt: v.number(), // Timestamp of last chunk work
    health: v.union(
      v.literal("neglected"),
      v.literal("normal"),
      v.literal("urgent")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  // Intentions: Near-term focus within Areas
  intentions: defineTable({
    userId: v.id("users"),
    areaId: v.id("areas"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("done")
    ),
    order: v.number(), // For manual sorting within area
  })
    .index("by_user", ["userId"])
    .index("by_area", ["areaId"])
    .index("by_area_status", ["areaId", "status"]),

  // Chunks: Executable work units (30-120 minutes)
  chunks: defineTable({
    userId: v.id("users"),
    areaId: v.id("areas"),
    intentionId: v.id("intentions"),
    title: v.string(),
    dod: v.string(), // Definition of Done
    durationMin: v.number(), // Estimated duration (30-120)
    status: v.union(
      v.literal("backlog"),
      v.literal("ready"),
      v.literal("inPlan"),
      v.literal("inProgress"),
      v.literal("done")
    ),
    tags: v.array(v.string()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_intention", ["intentionId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_area_status", ["areaId", "status"]),

  // Day Plans: Daily plan container
  dayPlans: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    timeBudget: v.number(), // Available minutes for the day
    energyMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("light")
    ),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
    finalizedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // Day Plan Items: Chunks in a day plan
  dayPlanItems: defineTable({
    dayPlanId: v.id("dayPlans"),
    chunkId: v.id("chunks"),
    order: v.number(), // Position in the plan
    locked: v.boolean(), // User-locked, won't be changed by AI
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("skipped"),
      v.literal("moved")
    ),
    aiReason: v.optional(v.string()), // Why AI suggested this chunk
    actualDurationMin: v.optional(v.number()), // Tracked time
  })
    .index("by_dayPlan", ["dayPlanId"])
    .index("by_chunk", ["chunkId"]),

  // Day Reviews: End of day reflections
  dayReviews: defineTable({
    dayPlanId: v.id("dayPlans"),
    perceivedLoad: v.union(
      v.literal("light"),
      v.literal("normal"),
      v.literal("heavy")
    ),
    notes: v.optional(v.string()),
  }).index("by_dayPlan", ["dayPlanId"]),

  // Chunk Splits: Track when chunks are split into smaller ones
  chunkSplits: defineTable({
    originalChunkId: v.id("chunks"),
    newChunkIds: v.array(v.id("chunks")),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_original", ["originalChunkId"]),
});
