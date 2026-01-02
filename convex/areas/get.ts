import { query } from "../_generated/server";
import { v } from "convex/values";

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
