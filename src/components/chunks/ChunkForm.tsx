"use client";

import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type ChunkFormData } from "~/lib/validation/chunk";
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
import { Badge } from "~/components/ui/badge";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ChunkFormProps {
  intentionId: Id<"intentions">;
  chunkId?: Id<"chunks">;
  defaultValues?: Partial<ChunkFormData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChunkForm({
  intentionId,
  chunkId,
  defaultValues,
  open,
  onOpenChange,
}: ChunkFormProps) {
  const createChunk = useMutation(api.chunks.create);
  const updateChunk = useMutation(api.chunks.update);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ChunkFormData>({
    defaultValues: defaultValues || {
      title: "",
      dod: "",
      durationMin: 60,
      tags: [],
      status: "backlog",
    },
  });

  const isEditing = !!chunkId;
  const tags = form.watch("tags");

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      form.setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );
  };

  const onSubmit = async (data: ChunkFormData) => {
    try {
      if (isEditing) {
        await updateChunk({
          chunkId,
          title: data.title,
          dod: data.dod,
          durationMin: data.durationMin,
          tags: data.tags,
        });
        toast.success("Chunk updated successfully");
      } else {
        await createChunk({
          intentionId,
          title: data.title,
          dod: data.dod,
          durationMin: data.durationMin,
          tags: data.tags,
          status: data.status,
        });
        toast.success("Chunk created successfully");
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save chunk",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Chunk" : "Create New Chunk"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update chunk details"
              : "Create an executable work unit (30-120 minutes)"}
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
                      placeholder="e.g., Fix cluster calculation bug"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Definition of Done</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does 'done' look like for this chunk?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific about completion criteria
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={30}
                      max={120}
                      step={15}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be between 30 and 120 minutes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
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
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Mark as Ready if it&apos;s fully prepared for execution
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
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
