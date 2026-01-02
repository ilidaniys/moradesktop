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
      className: "health-normal",
    },
    neglected: {
      label: "Neglected",
      className: "health-neglected",
    },
    urgent: {
      label: "Urgent",
      className: "health-urgent",
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
