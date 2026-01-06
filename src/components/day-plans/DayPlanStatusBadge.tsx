import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type DayPlanStatus = "draft" | "active" | "completed";

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
    className: "bg-muted text-secondary border-border",
  },
  active: {
    label: "Active",
    className: "bg-primary-soft text-primary border-primary-border",
  },
  completed: {
    label: "Completed",
    className: "bg-success-soft text-success border-success-border",
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
