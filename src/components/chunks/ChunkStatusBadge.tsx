import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type ChunkStatus = "backlog" | "ready" | "inPlan" | "inProgress" | "done";

interface ChunkStatusBadgeProps {
  status: ChunkStatus;
  className?: string;
}

const statusConfig: Record<
  ChunkStatus,
  {
    label: string;
    className: string;
  }
> = {
  backlog: {
    label: "Backlog",
    className: "bg-muted text-secondary border-border",
  },
  ready: {
    label: "Ready",
    className: "bg-success-soft text-success border-success-border",
  },
  inPlan: {
    label: "In Plan",
    className: "bg-primary-soft text-primary border-primary-border",
  },
  inProgress: {
    label: "In Progress",
    className: "bg-secondary-soft text-secondary border-secondary-border",
  },
  done: {
    label: "Done",
    className: "bg-muted text-muted border-border",
  },
};

export function ChunkStatusBadge({ status, className }: ChunkStatusBadgeProps) {
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
