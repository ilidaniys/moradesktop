import { query } from "../_generated/server";

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
