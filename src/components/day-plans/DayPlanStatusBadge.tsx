import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type DayPlanStatus = "draft" | "active" | "completed" | "expired";

interface DayPlanStatusBadgeProps {
  status: DayPlanStatus;
  className?: string;
}

const statusConfig: Record<
  DayPlanStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  },
  active: {
    label: "Active",
    className:
      "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  },
  expired: {
    label: "Expired",
    className:
      "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
  },
};

export function DayPlanStatusBadge({
  status,
  className,
}: DayPlanStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
