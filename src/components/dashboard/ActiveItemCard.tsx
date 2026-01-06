"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Pause } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Id } from "../../../convex/_generated/dataModel";

interface ActiveItemCardProps {
  item: {
    _id: Id<"dayPlanItems">;
    startedAt?: number;
    chunk: {
      title: string;
      dod: string;
      durationMin: number;
      tags: string[];
    } | null;
    area: {
      title: string;
    } | null;
    intention: {
      title: string;
    } | null;
  };
  onPause: (itemId: Id<"dayPlanItems">) => void;
  onComplete: (itemId: Id<"dayPlanItems">, actualDurationMin: number) => void;
  isLoading: boolean;
}

export function ActiveItemCard({
  item,
  onPause,
  onComplete,
  isLoading,
}: ActiveItemCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const [actualDuration, setActualDuration] = useState(
    item.chunk?.durationMin?.toString() || "30",
  );

  // Timer effect
  useEffect(() => {
    if (!item.startedAt) return;

    const updateElapsed = () => {
      const now = Date.now();
      const diff = now - item.startedAt!;
      setElapsed(Math.floor(diff / 1000)); // Convert to seconds
    };

    // Update immediately
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [item.startedAt]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = () => {
    const duration = parseInt(actualDuration) || item.chunk?.durationMin || 30;
    onComplete(item._id, duration);
  };

  return (
    <Card className="border-primary bg-primary-soft/10 border-2">
      <CardContent className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Badge className="mb-2">Currently Working On</Badge>
            <h3 className="text-foreground text-xl font-semibold">
              {item.chunk?.title || "Untitled"}
            </h3>
            <p className="text-muted mt-1 text-sm">
              {item.area?.title} {item.intention?.title && `• ${item.intention.title}`}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg py-6">
          <div className="text-primary mb-1 flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span>Time Elapsed</span>
          </div>
          <div className="text-foreground text-5xl font-bold tabular-nums">
            {formatTime(elapsed)}
          </div>
          <p className="text-muted mt-2 text-sm">
            Planned: {item.chunk?.durationMin || 0} minutes
          </p>
        </div>

        {/* Definition of Done */}
        {item.chunk?.dod && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Definition of Done</Label>
            <p className="text-secondary rounded-lg bg-muted/50 p-3 text-sm">
              {item.chunk.dod}
            </p>
          </div>
        )}

        {/* Tags */}
        {item.chunk?.tags && item.chunk.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.chunk.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actual Duration Input */}
        <div className="space-y-2">
          <Label htmlFor="actual-duration" className="text-sm font-medium">
            Actual Duration (minutes)
          </Label>
          <Input
            id="actual-duration"
            type="number"
            min={1}
            value={actualDuration}
            onChange={(e) => setActualDuration(e.target.value)}
            placeholder="Enter actual time spent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onPause(item._id)}
            disabled={isLoading}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button
            className="flex-1"
            onClick={handleComplete}
            disabled={isLoading}
          >
            <Check className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
