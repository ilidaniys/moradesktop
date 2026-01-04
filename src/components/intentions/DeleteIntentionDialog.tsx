"use client";

import { useMutation } from "convex/react";
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
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface DeleteIntentionDialogProps {
  intention: {
    _id: Id<"intentions">;
    title: string;
  };
  chunkCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteIntentionDialog({
  intention,
  chunkCount,
  open,
  onOpenChange,
}: DeleteIntentionDialogProps) {
  const deleteIntention = useMutation(api.intentions.remove);

  const handleDelete = async () => {
    try {
      await deleteIntention({ intentionId: intention._id });
      toast.success("Intention deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete intention",
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Intention</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete &quot;{intention.title}&quot;?
            </p>
            {chunkCount > 0 && (
              <p className="text-warning font-medium">
                Warning: This will also delete {chunkCount} associated chunk
                {chunkCount === 1 ? "" : "s"}. This action cannot be undone.
              </p>
            )}
            {chunkCount === 0 && <p>This action cannot be undone.</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
