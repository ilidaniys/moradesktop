"use client";

import { GripVertical, Lock, LockOpen, X, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface DayPlanItemProps {
  order: number;
  chunk: {
    title: string;
    durationMin: number;
    tags: string[];
    dod: string;
  };
  locked: boolean;
  onToggleLock: () => void;
  onRemove: () => void;
  isDragging?: boolean;
}

export function DayPlanItem({
  order,
  chunk,
  locked,
  onToggleLock,
  onRemove,
  isDragging,
}: DayPlanItemProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-150",
        isDragging && "opacity-50 rotate-2 scale-105",
        locked && "border-primary-border bg-primary-soft/30"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex items-center gap-2 shrink-0">
            <GripVertical className="h-5 w-5 text-muted cursor-grab active:cursor-grabbing" />
            <span className="text-sm font-medium text-muted w-6">{order}.</span>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start gap-2">
              <h4 className="font-medium text-foreground flex-1 line-clamp-1">
                {chunk.title}
              </h4>
              <div className="flex items-center gap-1.5 text-sm text-muted shrink-0">
                <Clock className="h-3.5 w-3.5" />
                <span>{chunk.durationMin}m</span>
              </div>
            </div>

            {chunk.dod && (
              <p className="text-sm text-secondary line-clamp-1">{chunk.dod}</p>
            )}

            {chunk.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {chunk.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleLock}
              title={locked ? "Unlock chunk" : "Lock chunk"}
            >
              {locked ? (
                <Lock className="h-4 w-4 text-primary" />
              ) : (
                <LockOpen className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-danger hover:bg-danger-soft"
              onClick={onRemove}
              disabled={locked}
              title="Remove from plan"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
