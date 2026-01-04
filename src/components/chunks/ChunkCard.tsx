"use client";

import { useMutation } from "convex/react";
import { Clock, Edit, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { ChunkStatusBadge } from "./ChunkStatusBadge";
import { ChunkForm } from "./ChunkForm";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type ChunkStatus = "backlog" | "ready" | "inPlan" | "inProgress" | "done";

interface ChunkCardProps {
  chunk: {
    _id: Id<"chunks">;
    intentionId: Id<"intentions">;
    title: string;
    dod: string;
    durationMin: number;
    status: ChunkStatus;
    tags: string[];
  };
}

export function ChunkCard({ chunk }: ChunkCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteChunk = useMutation(api.chunks.remove);
  const updateStatus = useMutation(api.chunks.updateStatus);

  const handleDelete = async () => {
    try {
      await deleteChunk({ chunkId: chunk._id });
      toast.success("Chunk deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chunk",
      );
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = chunk.status === "backlog" ? "ready" : "backlog";
    try {
      await updateStatus({ chunkId: chunk._id, status: newStatus });
      toast.success(`Chunk marked as ${newStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  const canToggleStatus =
    chunk.status === "backlog" || chunk.status === "ready";

  return (
    <>
      <Card className="hover:bg-accent/30 transition-colors duration-150">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Title and Status */}
              <div className="flex items-start gap-2">
                <h4 className="text-foreground flex-1 font-medium">
                  {chunk.title}
                </h4>
                <ChunkStatusBadge status={chunk.status} />
              </div>

              {/* Definition of Done */}
              <p className="text-secondary line-clamp-2 text-sm">{chunk.dod}</p>

              {/* Duration and Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-muted flex items-center gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{chunk.durationMin} min</span>
                </div>

                {chunk.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {chunk.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {canToggleStatus && (
                  <DropdownMenuItem onClick={handleToggleStatus}>
                    {chunk.status === "backlog"
                      ? "Mark as Ready"
                      : "Move to Backlog"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-danger"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ChunkForm
        intentionId={chunk.intentionId}
        chunkId={chunk._id}
        defaultValues={{
          title: chunk.title,
          dod: chunk.dod,
          durationMin: chunk.durationMin,
          tags: chunk.tags,
          status:
            chunk.status === "backlog" || chunk.status === "ready"
              ? chunk.status
              : "backlog",
        }}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chunk</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{chunk.title}&quot;? This
              action cannot be undone.
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
    </>
  );
}
