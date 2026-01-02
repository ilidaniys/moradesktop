"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Slider } from "~/components/ui/slider";
import type { Id } from "../../../convex/_generated/dataModel";

interface AreaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: Id<"areas">;
    title: string;
    description: string;
    weight: number;
  };
}

export function AreaForm({ open, onOpenChange, initialData }: AreaFormProps) {
  const createArea = useMutation(api.areas.create);
  const updateArea = useMutation(api.areas.update);

  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      weight: initialData?.weight ?? 5,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateArea({
            areaId: initialData.id,
            title: value.title,
            description: value.description,
            weight: value.weight,
          });
          toast.success("Area updated successfully!");
        } else {
          await createArea({
            title: value.title,
            description: value.description,
            weight: value.weight,
          });
          toast.success("Area created successfully!");
        }
        onOpenChange(false);
        form.reset();
      } catch (error: any) {
        toast.error(error.message ?? "Failed to save area");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Area" : "Create New Area"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your area of responsibility."
              : "Add a new long-term domain of responsibility."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Title is required";
                  if (value.length > 100) return "Title must be less than 100 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Health & Fitness"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Description is required";
                  if (value.length > 500)
                    return "Description must be less than 500 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Description</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Describe this area of responsibility..."
                    rows={3}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="weight"
              validators={{
                onChange: ({ value }) => {
                  if (value < 1 || value > 10)
                    return "Weight must be between 1 and 10";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Weight: {field.state.value}/10
                  </Label>
                  <Slider
                    id={field.name}
                    min={1}
                    max={10}
                    step={1}
                    value={[field.state.value]}
                    onValueChange={(values) => field.handleChange(values[0] ?? 5)}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher weight means this area will be prioritized more in day plans
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Area" : "Create Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
