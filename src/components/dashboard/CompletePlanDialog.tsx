"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

interface CompletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: {
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    skippedItems: number;
    timeUsed: number;
    timeBudget: number;
  };
  onComplete: (perceivedLoad: "light" | "normal" | "heavy", notes?: string) => void;
  isCompleting: boolean;
}

export function CompletePlanDialog({
  open,
  onOpenChange,
  stats,
  onComplete,
  isCompleting,
}: CompletePlanDialogProps) {
  const [perceivedLoad, setPerceivedLoad] = useState<"light" | "normal" | "heavy">("normal");
  const [notes, setNotes] = useState("");

  const handleComplete = () => {
    onComplete(perceivedLoad, notes || undefined);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const hasPendingItems = stats.pendingItems > 0;
  const completionRate = Math.round((stats.completedItems / stats.totalItems) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Complete Day Plan
          </DialogTitle>
          <DialogDescription>
            Review your day and provide feedback before completing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <h4 className="text-foreground text-sm font-medium">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tasks Completed</span>
                <span className="text-foreground font-medium">
                  {stats.completedItems} / {stats.totalItems} ({completionRate}%)
                </span>
              </div>
              {stats.skippedItems > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Tasks Skipped</span>
                  <span className="text-foreground font-medium">
                    {stats.skippedItems}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Time Used</span>
                <span className="text-foreground font-medium">
                  {formatTime(stats.timeUsed)} / {formatTime(stats.timeBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning for pending items */}
          {hasPendingItems && (
            <div className="flex gap-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">You have {stats.pendingItems} pending task(s)</p>
                <p className="mt-1 text-xs">
                  These tasks will remain in your plan but won't be tracked as completed.
                </p>
              </div>
            </div>
          )}

          {/* Perceived Load Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How demanding was your day?
            </Label>
            <RadioGroup
              value={perceivedLoad}
              onValueChange={(value) =>
                setPerceivedLoad(value as "light" | "normal" | "heavy")
              }
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                  <RadioGroupItem value="light" id="light" />
                  <Label
                    htmlFor="light"
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="font-medium">Light</div>
                    <div className="text-muted text-xs">
                      Easy day, felt relaxed
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label
                    htmlFor="normal"
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="font-medium">Normal</div>
                    <div className="text-muted text-xs">
                      Moderate effort, manageable
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                  <RadioGroupItem value="heavy" id="heavy" />
                  <Label
                    htmlFor="heavy"
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="font-medium">Heavy</div>
                    <div className="text-muted text-xs">
                      Intense day, felt challenging
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="What went well? What could be improved?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCompleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isCompleting ? "Completing..." : "Complete Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
