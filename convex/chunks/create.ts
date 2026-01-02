import { mutation } from "../_generated/server";
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
        v.literal("done")
      )
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
