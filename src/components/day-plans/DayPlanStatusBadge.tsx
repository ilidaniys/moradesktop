import {
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type DayPlanStatus = "draft" | "finalized" | "active" | "completed" | "expired";

interface DayPlanStatusBadgeProps {
  status: DayPlanStatus;
  className?: string;
}

const statusConfig: Record<
  DayPlanStatus,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-slate-600 hover:bg-slate-700 text-white",
  },
  finalized: {
    label: "Finalized",
    icon: Clock,
    className: "bg-violet-600 hover:bg-violet-700 text-white",
  },
  active: {
    label: "Active",
    icon: Star,
    className: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  expired: {
    label: "Expired",
    icon: Timer,
    className: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

export function DayPlanStatusBadge({
  status,
  className,
}: DayPlanStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="default"
      className={cn(
        "h-6 gap-1 px-2 text-[11px] font-bold",
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3 fill-current" />
      {config.label}
    </Badge>
  );
}
