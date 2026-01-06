"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Clock, Sparkles, X } from "lucide-react";
import type { BuildDayPlanOutput } from "~/lib/ai/types";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Id } from "../../../convex/_generated/dataModel";

interface ChunkInfo {
  chunkId: Id<"chunks">;
  title: string;
  durationMin: number;
  tags: string[];
  dod: string;
  areaTitle: string;
}

interface AISuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: BuildDayPlanOutput;
  availableChunks: ChunkInfo[];
  onAccept: () => void;
  onReject: () => void;
}

export function AISuggestions({
  open,
  onOpenChange,
  suggestions,
  availableChunks,
  onAccept,
  onReject,
}: AISuggestionsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Map chunk IDs to full chunk data
  const suggestedChunksWithData = suggestions.suggestedItems
    .map((item) => {
      const chunk = availableChunks.find((c) => c.chunkId === item.chunkId);
      return chunk
        ? {
            ...item,
            chunk,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  console.log("Suggested chunks with data:", suggestedChunksWithData);

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            AI-Suggested Day Plan
          </DialogTitle>
          <DialogDescription>
            Review the AI-generated plan and accept or regenerate
          </DialogDescription>
        </DialogHeader>

        {/* AI Reasoning - Collapsible */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="-ml-2 h-auto p-2 text-sm font-normal text-muted hover:text-foreground"
          >
            {showDetails ? (
              <ChevronDown className="mr-1.5 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-1.5 h-4 w-4" />
            )}
            {showDetails ? "Hide" : "Show"} AI reasoning
          </Button>

          {showDetails && (
            <div className="space-y-2">
              <div className="rounded-lg bg-primary-soft/30 p-3">
                <p className="text-sm text-primary">
                  <strong className="text-foreground">Strategy:</strong>{" "}
                  {suggestions.reasoning}
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-secondary">
                  <strong className="text-foreground">Energy Balance:</strong>{" "}
                  {suggestions.energyBalance}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Chunks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-foreground text-sm font-medium">
              Suggested Tasks
            </h4>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {suggestions.totalDuration}m total (
                {Math.floor(suggestions.totalDuration / 60)}h{" "}
                {suggestions.totalDuration % 60}m)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {suggestedChunksWithData.map((item, index) => (
              <Card key={item.chunkId} className="border-border">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-muted mt-0.5 w-6 text-sm font-medium">
                      {index + 1}.
                    </span>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-foreground line-clamp-1 font-medium">
                            {item.chunk.title}
                          </h4>
                          <p className="text-muted text-xs">
                            {item.chunk.areaTitle}
                          </p>
                        </div>
                        <div className="text-muted flex shrink-0 items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{item.chunk.durationMin}m</span>
                        </div>
                      </div>

                      {item.chunk.dod && (
                        <p className="text-secondary line-clamp-1 text-sm">
                          {item.chunk.dod}
                        </p>
                      )}

                      {item.chunk.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.chunk.tags.map((tag) => (
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

                      {/* AI Reasoning for this chunk */}
                      {item.reasoning && (
                        <div className="bg-muted/30 rounded px-2 py-1">
                          <p className="text-muted text-xs italic">
                            Why: {item.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="text-muted flex items-center gap-4 border-t pt-3 text-sm">
          <span>
            <strong className="text-foreground">
              {suggestedChunksWithData.length}
            </strong>{" "}
            tasks
          </span>
          <span>
            <strong className="text-foreground">
              {suggestions.totalDuration}
            </strong>{" "}
            minutes
          </span>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject}>
            <X className="mr-1 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={handleAccept}>
            <Check className="mr-1 h-4 w-4" />
            Accept Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
