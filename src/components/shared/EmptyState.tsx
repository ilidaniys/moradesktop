import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-12 text-center">
      <div className="rounded-full bg-accent p-3">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-secondary">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
