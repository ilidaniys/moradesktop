"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type IntentionFormData,
  intentionFormSchema,
} from "~/lib/validation/intention";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface IntentionFormProps {
  areaId: Id<"areas">;
  intentionId?: Id<"intentions">;
  defaultValues?: Partial<IntentionFormData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntentionForm({
  areaId,
  intentionId,
  defaultValues,
  open,
  onOpenChange,
}: IntentionFormProps) {
  const createIntention = useMutation(api.intentions.create);
  const updateIntention = useMutation(api.intentions.update);
  const limitCheck = useQuery(api.intentions.checkLimit, { areaId });

  const form = useForm<IntentionFormData>({
    resolver: zodResolver(intentionFormSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      status: "active",
    },
  });

  const isEditing = !!intentionId;
  const selectedStatus = form.watch("status");

  // Check if we can add active intentions
  const canAddActive = limitCheck?.canAddActive ?? true;
  const activeCount = limitCheck?.activeCount ?? 0;

  const onSubmit = async (data: IntentionFormData) => {
    try {
      // Validate active intention limit only for new intentions or status changes to active
      if (data.status === "active" && !isEditing && !canAddActive) {
        toast.error(
          `Maximum 3 active intentions per area. You have ${activeCount}/3 active intentions.`,
        );
        return;
      }

      if (isEditing) {
        await updateIntention({
          intentionId,
          title: data.title,
          description: data.description,
          status: data.status,
        });
        toast.success("Intention updated successfully");
      } else {
        await createIntention({
          areaId,
          title: data.title,
          description: data.description,
          status: data.status,
        });
        toast.success("Intention created successfully");
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save intention",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Intention" : "Create New Intention"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your intention details"
              : `Define a near-term focus for this area (${activeCount}/3 active intentions)`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Improve liquidation indicator"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the scope and goals of this intention..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedStatus === "active" &&
                    !isEditing &&
                    !canAddActive && (
                      <FormDescription className="text-warning">
                        Maximum 3 active intentions reached. Please pause an
                        existing intention first.
                      </FormDescription>
                    )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  (selectedStatus === "active" && !isEditing && !canAddActive)
                }
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
