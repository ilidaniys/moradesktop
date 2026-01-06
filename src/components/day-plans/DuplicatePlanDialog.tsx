"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import "react-day-picker/dist/style.css";

interface DuplicatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePlan: {
    _id: Id<"dayPlans">;
    date: string;
  };
  onSuccess?: (newPlanId: Id<"dayPlans">) => void;
  existingPlanDates?: string[];
}

export function DuplicatePlanDialog({
  open,
  onOpenChange,
  sourcePlan,
  onSuccess,
  existingPlanDates = [],
}: DuplicatePlanDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const duplicatePlan = useMutation(api.dayPlans.duplicatePlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDuplicate = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);

    try {
      const targetDate = format(selectedDate, "yyyy-MM-dd");
      const newPlanId = await duplicatePlan({
        sourcePlanId: sourcePlan._id,
        targetDate,
      });

      toast.success("Plan duplicated", {
        description: `Successfully created a copy for ${format(selectedDate, "PPP")}`,
      });

      onOpenChange(false);
      setSelectedDate(undefined);

      if (onSuccess) {
        onSuccess(newPlanId);
      }
    } catch (error) {
      toast.error("Failed to duplicate plan", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while duplicating the plan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate(undefined);
    onOpenChange(false);
  };

  // Convert existing plan dates to Date objects for highlighting
  const existingPlanDateObjects = existingPlanDates.map(
    (dateStr) => new Date(dateStr + "T00:00:00"),
  );

  // Disable past dates and the source plan date
  const sourcePlanDate = new Date(sourcePlan.date + "T00:00:00");
  const disabledDates = [{ before: new Date() }, sourcePlanDate];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Duplicate Plan</DialogTitle>
          <DialogDescription>
            Select a date to copy this plan to. Only available chunks will be
            copied.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDates}
            modifiers={{
              hasPlan: existingPlanDateObjects,
            }}
            modifiersClassNames={{
              hasPlan: "font-bold underline",
            }}
            className="rounded-md border p-3"
          />
          {selectedDate && (
            <p className="text-muted-foreground text-sm">
              Target date: {format(selectedDate, "PPP")}
            </p>
          )}
          {selectedDate &&
            existingPlanDates.includes(format(selectedDate, "yyyy-MM-dd")) && (
              <p className="text-sm text-amber-600">
                ⚠ A plan already exists for this date. Choose a different date.
              </p>
            )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={
              !selectedDate ||
              isSubmitting ||
              existingPlanDates.includes(format(selectedDate, "yyyy-MM-dd"))
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
