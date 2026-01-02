import { query } from "../_generated/server";

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
