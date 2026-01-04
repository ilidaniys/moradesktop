import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type AreaHealth = "normal" | "neglected" | "urgent";

interface AreaHealthBadgeProps {
  health: AreaHealth;
  className?: string;
}

export function AreaHealthBadge({ health, className }: AreaHealthBadgeProps) {
  const healthConfig = {
    normal: {
      label: "Normal",
      className: "border-border bg-background text-foreground",
    },
    neglected: {
      label: "Neglected",
      className: "border-danger-border bg-danger-soft text-danger",
    },
    urgent: {
      label: "Urgent",
      className: "border-warning-border bg-warning-soft text-warning",
    },
  };

  const config = healthConfig[health];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
