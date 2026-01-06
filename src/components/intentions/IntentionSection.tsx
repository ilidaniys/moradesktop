"use client";

import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronRight, Edit, Sparkles, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ChunksList } from "~/components/chunks/ChunksList";
import { ExtractedChunksReview } from "~/components/chunks/ExtractedChunksReview";
import { IntentionForm } from "./IntentionForm";
import { DeleteIntentionDialog } from "./DeleteIntentionDialog";
import { cn } from "~/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useExtractChunks } from "~/hooks/useExtractChunks";
import type { ExtractedChunk } from "~/lib/ai/types";
import { toast } from "sonner";

type IntentionStatus = "active" | "paused" | "done";

interface Intention {
  _id: Id<"intentions">;
  areaId: Id<"areas">;
  title: string;
  description?: string;
  status: IntentionStatus;
}

interface IntentionSectionProps {
  intention: Intention;
  areaTitle: string;
  defaultExpanded?: boolean;
}

const statusConfig: Record<
  IntentionStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-primary-soft text-primary border-primary-border",
  },
  paused: {
    label: "Paused",
    className: "bg-muted text-secondary border-border",
  },
  done: {
    label: "Done",
    className: "bg-success-soft text-success border-success-border",
  },
};

export function IntentionSection({
  intention,
  areaTitle,
  defaultExpanded = true,
}: IntentionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showExtractedChunks, setShowExtractedChunks] = useState(false);
  const [extractedChunks, setExtractedChunks] = useState<ExtractedChunk[]>([]);
  const [extractReasoning, setExtractReasoning] = useState("");

  const chunks = useQuery(api.chunks.listByIntention, {
    intentionId: intention._id,
  });

  const { extractChunks, isLoading: isExtracting } = useExtractChunks();
  const createBatchMutation = useMutation(api.chunks.createBatch);

  const chunkCount = chunks?.length ?? 0;
  const readyCount = chunks?.filter((c) => c.status === "ready").length ?? 0;
  const statusInfo = statusConfig[intention.status];

  const handleExtractChunks = async () => {
    const existingChunks = chunks?.map((c) => ({
      title: c.title,
      dod: c.dod,
    }));
    console.log("Calling extractChunks with:", {
      intentionTitle: intention.title,
      intentionDescription: intention.description,
      areaTitle,
      existingChunks,
    });

    const result = await extractChunks({
      intentionTitle: intention.title,
      intentionDescription: intention.description,
      areaTitle,
      existingChunks,
    });

    console.log("Extract chunks result:", result);

    if (result) {
      console.log("Setting chunks:", result.chunks);
      console.log("Setting reasoning:", result.reasoning);
      setExtractedChunks(result.chunks);
      setExtractReasoning(result.reasoning);
      setShowExtractedChunks(true);
    } else {
      toast.error("Failed to extract chunks", {
        description: "Please try again",
      });
    }
  };

  const handleAcceptChunks = async (acceptedChunks: ExtractedChunk[]) => {
    try {
      await createBatchMutation({
        intentionId: intention._id,
        chunks: acceptedChunks.map((chunk) => ({
          title: chunk.title,
          dod: chunk.dod,
          durationMin: chunk.durationMin,
          tags: chunk.tags,
        })),
      });

      toast.success("Chunks created", {
        description: `Created ${acceptedChunks.length} new chunks`,
      });

      setShowExtractedChunks(false);
    } catch (error) {
      toast.error("Failed to create chunks", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleRejectChunks = () => {
    setShowExtractedChunks(false);
    // Could trigger regeneration here
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    "text-foreground cursor-pointer font-medium",
                    intention.status === "done" && "text-muted line-through",
                  )}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {intention.title}
                </h3>
                <Badge
                  variant="outline"
                  className={cn("font-medium", statusInfo.className)}
                >
                  {statusInfo.label}
                </Badge>
                {chunkCount > 0 && (
                  <span className="text-muted text-sm">
                    ({readyCount} ready / {chunkCount} total)
                  </span>
                )}
              </div>

              {intention.description && (
                <p className="text-secondary text-sm">
                  {intention.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash className="text-danger h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Content - Chunks */}
          {isExpanded && (
            <div className="mt-4 space-y-3 pl-9">
              {chunks === undefined ? (
                <div className="text-muted text-sm">Loading chunks...</div>
              ) : (
                <>
                  <ChunksList intentionId={intention._id} chunks={chunks} />

                  {/* Extract Chunks AI Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExtractChunks}
                    disabled={isExtracting || intention.status !== "active"}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isExtracting ? "Extracting..." : "Extract Chunks with AI"}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <IntentionForm
        areaId={intention.areaId}
        intentionId={intention._id}
        defaultValues={{
          title: intention.title,
          description: intention.description,
          status: intention.status,
        }}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Dialog */}
      <DeleteIntentionDialog
        intention={intention}
        chunkCount={chunkCount}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />

      {/* Extracted Chunks Review Dialog */}
      <ExtractedChunksReview
        open={showExtractedChunks}
        onOpenChange={setShowExtractedChunks}
        chunks={extractedChunks}
        reasoning={extractReasoning}
        onAccept={handleAcceptChunks}
        onReject={handleRejectChunks}
      />
    </>
  );
}
