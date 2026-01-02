import { query } from "../_generated/server";

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
        q.eq("userId", identity.subject as any).eq("status", "ready")
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
      })
    );

    return chunksWithContext;
  },
});
