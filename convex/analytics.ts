import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAreaHealth = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const area = await ctx.db.get(args.areaId);
    if (!area || area.userId !== (identity.subject as any)) {
      return null;
    }

    // Calculate days since last touched
    const daysSinceLastTouched = Math.floor(
      (Date.now() - area.lastTouchedAt) / (1000 * 60 * 60 * 24)
    );

    // Get active intentions count
    const activeIntentions = await ctx.db
      .query("intentions")
      .withIndex("by_area_status", (q) =>
        q.eq("areaId", args.areaId).eq("status", "active")
      )
      .collect();

    // Get ready chunks count
    const readyChunks = await ctx.db
      .query("chunks")
      .withIndex("by_area_status", (q) =>
        q.eq("areaId", args.areaId).eq("status", "ready")
      )
      .collect();

    // Calculate health status
    let calculatedHealth: "neglected" | "normal" | "urgent";
    if (daysSinceLastTouched > 14) {
      calculatedHealth = "neglected";
    } else {
      calculatedHealth = "normal";
    }

    return {
      area,
      daysSinceLastTouched,
      activeIntentionsCount: activeIntentions.length,
      readyChunksCount: readyChunks.length,
      calculatedHealth,
    };
  },
});

export const getChunkStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get all chunks for user
    const allChunks = await ctx.db
      .query("chunks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
      .collect();

    // Count by status
    const byStatus = {
      backlog: allChunks.filter((c) => c.status === "backlog").length,
      ready: allChunks.filter((c) => c.status === "ready").length,
      inPlan: allChunks.filter((c) => c.status === "inPlan").length,
      inProgress: allChunks.filter((c) => c.status === "inProgress").length,
      done: allChunks.filter((c) => c.status === "done").length,
    };

    // Calculate completion rate
    const totalChunks = allChunks.length;
    const completedChunks = byStatus.done;
    const completionRate =
      totalChunks > 0 ? (completedChunks / totalChunks) * 100 : 0;

    // Calculate average duration
    const avgDuration =
      allChunks.length > 0
        ? allChunks.reduce((sum, c) => sum + c.durationMin, 0) /
          allChunks.length
        : 0;

    return {
      total: totalChunks,
      byStatus,
      completionRate: Math.round(completionRate * 10) / 10,
      avgDuration: Math.round(avgDuration),
    };
  },
});

export const getCompletionRates = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get all day plans for user
    const allDayPlans = await ctx.db
      .query("dayPlans")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
      .collect();

    const completedPlans = allDayPlans.filter(
      (p) => p.status === "completed"
    ).length;

    // Get completion rates for completed plans
    const completedPlanStats = await Promise.all(
      allDayPlans
        .filter((p) => p.status === "completed")
        .map(async (plan) => {
          const items = await ctx.db
            .query("dayPlanItems")
            .withIndex("by_dayPlan", (q) => q.eq("dayPlanId", plan._id))
            .collect();

          const completedItems = items.filter(
            (i) => i.status === "completed"
          ).length;

          return {
            date: plan.date,
            totalItems: items.length,
            completedItems,
            completionRate:
              items.length > 0 ? (completedItems / items.length) * 100 : 0,
          };
        })
    );

    // Calculate overall average completion rate
    const avgCompletionRate =
      completedPlanStats.length > 0
        ? completedPlanStats.reduce((sum, s) => sum + s.completionRate, 0) /
          completedPlanStats.length
        : 0;

    return {
      totalPlans: allDayPlans.length,
      completedPlans,
      avgCompletionRate: Math.round(avgCompletionRate * 10) / 10,
      recentPlans: completedPlanStats.slice(-7), // Last 7 completed plans
    };
  },
});
