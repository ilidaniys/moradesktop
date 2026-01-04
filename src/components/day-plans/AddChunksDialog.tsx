"use client";

import { useQuery } from "convex/react";
import { Clock, LayoutDashboard, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/shared/EmptyState";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface AddChunksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddChunk: (chunkId: Id<"chunks">) => void;
  excludeChunkIds: Id<"chunks">[];
}

export function AddChunksDialog({
  open,
  onOpenChange,
  onAddChunk,
  excludeChunkIds,
}: AddChunksDialogProps) {
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const areas = useQuery(api.areas.list, {});
  const readyChunks = useQuery(api.chunks.listReadyChunks);

  const isLoading = areas === undefined || readyChunks === undefined;

  // Get all unique tags from ready chunks
  const allTags = readyChunks
    ? Array.from(new Set(readyChunks.flatMap((chunk) => chunk.tags))).sort()
    : [];

  // Filter chunks
  const filteredChunks = readyChunks?.filter((chunk) => {
    // Exclude already added chunks
    if (excludeChunkIds.includes(chunk._id)) return false;

    // Filter by area
    if (selectedArea !== "all" && chunk.areaId !== selectedArea) return false;

    // Filter by tag
    if (selectedTag !== "all" && !chunk.tags.includes(selectedTag))
      return false;

    return true;
  });

  const handleAddChunk = (chunkId: Id<"chunks">) => {
    onAddChunk(chunkId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Chunks to Plan</DialogTitle>
          <DialogDescription>
            Select ready chunks to add to your day plan
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner size="md" text="Loading chunks..." />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Area</label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas?.map((area) => (
                      <SelectItem key={area._id} value={area._id}>
                        {area.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Tag</label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chunks List */}
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {filteredChunks?.length === 0 ? (
                <EmptyState
                  icon={LayoutDashboard}
                  title="No chunks available"
                  description="Create ready chunks in your areas first"
                />
              ) : (
                filteredChunks?.map((chunk) => (
                  <Card key={chunk._id} className="hover:bg-accent/30">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-foreground line-clamp-1 font-medium">
                                {chunk.title}
                              </h4>
                              {chunk.area && (
                                <p className="text-muted text-xs">
                                  {chunk.area.title}
                                  {chunk.intention &&
                                    ` → ${chunk.intention.title}`}
                                </p>
                              )}
                            </div>
                            <div className="text-muted flex shrink-0 items-center gap-1.5 text-sm">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{chunk.durationMin}m</span>
                            </div>
                          </div>

                          {chunk.dod && (
                            <p className="text-secondary line-clamp-1 text-sm">
                              {chunk.dod}
                            </p>
                          )}

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

                        <Button
                          size="sm"
                          onClick={() => handleAddChunk(chunk._id)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
