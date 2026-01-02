"use client";

import { AlertTriangle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { Id } from "../../../convex/_generated/dataModel";

interface DeleteAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId: Id<"areas"> | null;
  areaTitle: string;
}

export function DeleteAreaDialog({
  open,
  onOpenChange,
  areaId,
  areaTitle,
}: DeleteAreaDialogProps) {
  const deleteArea = useMutation(api.areas.deleteArea);

  const handleDelete = async () => {
    if (!areaId) return;

    try {
      await deleteArea({ areaId });
      toast.success("Area deleted successfully!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to delete area");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Area</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{areaTitle}</strong>?
            <br />
            <br />
            This will also delete all associated intentions and chunks. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Area
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
