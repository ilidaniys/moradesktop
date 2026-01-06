"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2 } from "lucide-react";

type EnergyMode = "deep" | "normal" | "light";

interface EditPlanSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    _id: Id<"dayPlans">;
    timeBudget: number;
    energyMode: EnergyMode;
    notes?: string;
  };
}

const TIME_PRESETS = [
  { label: "4h", value: 240 },
  { label: "6h", value: 360 },
  { label: "8h", value: 480 },
];

export function EditPlanSettingsDialog({
  open,
  onOpenChange,
  plan,
}: EditPlanSettingsDialogProps) {
  const [timeBudget, setTimeBudget] = useState(plan.timeBudget);
  const [energyMode, setEnergyMode] = useState<EnergyMode>(plan.energyMode);
  const [notes, setNotes] = useState(plan.notes || "");

  const updatePlan = useMutation(api.dayPlans.updatePlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePlan({
        dayPlanId: plan._id,
        timeBudget,
        energyMode,
        notes: notes || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeBudgetInput = (value: string) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0) {
      setTimeBudget(minutes);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Plan Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Time Budget */}
            <div className="space-y-2">
              <Label htmlFor="timeBudget">Time Budget</Label>
              <div className="flex gap-2">
                {TIME_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={
                      timeBudget === preset.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setTimeBudget(preset.value)}
                    className="flex-1"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="timeBudget"
                  type="number"
                  value={timeBudget}
                  onChange={(e) => handleTimeBudgetInput(e.target.value)}
                  min={30}
                  step={30}
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm">min</span>
              </div>
            </div>

            {/* Energy Mode */}
            <div className="space-y-2">
              <Label htmlFor="energyMode">Energy Mode</Label>
              <Select
                value={energyMode}
                onValueChange={(value) => setEnergyMode(value as EnergyMode)}
              >
                <SelectTrigger id="energyMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deep">Deep Focus</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="light">Light Tasks</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {energyMode === "deep" && "Best for complex, focused work"}
                {energyMode === "normal" && "Balanced mix of tasks"}
                {energyMode === "light" && "Simple, low-energy tasks"}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this plan..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
