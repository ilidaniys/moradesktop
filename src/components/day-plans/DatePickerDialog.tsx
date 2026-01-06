"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import "react-day-picker/dist/style.css";

interface DatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDate: (date: string) => void;
  existingPlanDates?: string[];
  disablePast?: boolean;
}

export function DatePickerDialog({
  open,
  onOpenChange,
  onSelectDate,
  existingPlanDates = [],
  disablePast = false,
}: DatePickerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      onSelectDate(dateString);
      onOpenChange(false);
      setSelectedDate(undefined);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Date for Plan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={disablePast ? { before: new Date() } : undefined}
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
              Selected: {format(selectedDate, "PPP")}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedDate}>
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
