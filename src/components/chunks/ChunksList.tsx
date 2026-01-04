"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ChunkCard } from "./ChunkCard";
import { ChunkForm } from "./ChunkForm";
import type { Id } from "../../../convex/_generated/dataModel";

type ChunkStatus = "backlog" | "ready" | "inPlan" | "inProgress" | "done";

interface Chunk {
  _id: Id<"chunks">;
  intentionId: Id<"intentions">;
  title: string;
  dod: string;
  durationMin: number;
  status: ChunkStatus;
  tags: string[];
}

interface ChunksListProps {
  intentionId: Id<"intentions">;
  chunks: Chunk[];
}

export function ChunksList({ intentionId, chunks }: ChunksListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Group chunks by status
  const readyChunks = chunks.filter((c) => c.status === "ready");
  const backlogChunks = chunks.filter((c) => c.status === "backlog");
  const inPlanChunks = chunks.filter((c) => c.status === "inPlan");
  const inProgressChunks = chunks.filter((c) => c.status === "inProgress");
  const doneChunks = chunks.filter((c) => c.status === "done");

  const hasChunks = chunks.length > 0;

  return (
    <div className="space-y-4">
      {/* Ready Chunks */}
      {readyChunks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-foreground text-sm font-medium">
            Ready ({readyChunks.length})
          </h4>
          <div className="space-y-2">
            {readyChunks.map((chunk) => (
              <ChunkCard key={chunk._id} chunk={chunk} />
            ))}
          </div>
        </div>
      )}

      {/* Backlog Chunks */}
      {backlogChunks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-secondary text-sm font-medium">
            Backlog ({backlogChunks.length})
          </h4>
          <div className="space-y-2">
            {backlogChunks.map((chunk) => (
              <ChunkCard key={chunk._id} chunk={chunk} />
            ))}
          </div>
        </div>
      )}

      {/* In Plan Chunks */}
      {inPlanChunks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-primary text-sm font-medium">
            In Plan ({inPlanChunks.length})
          </h4>
          <div className="space-y-2">
            {inPlanChunks.map((chunk) => (
              <ChunkCard key={chunk._id} chunk={chunk} />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Chunks */}
      {inProgressChunks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-secondary text-sm font-medium">
            In Progress ({inProgressChunks.length})
          </h4>
          <div className="space-y-2">
            {inProgressChunks.map((chunk) => (
              <ChunkCard key={chunk._id} chunk={chunk} />
            ))}
          </div>
        </div>
      )}

      {/* Done Chunks */}
      {doneChunks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-muted text-sm font-medium">
            Done ({doneChunks.length})
          </h4>
          <div className="space-y-2">
            {doneChunks.map((chunk) => (
              <ChunkCard key={chunk._id} chunk={chunk} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasChunks && (
        <div className="text-secondary py-8 text-center">
          <p className="text-sm">No chunks yet for this intention</p>
        </div>
      )}

      {/* Add Chunk Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCreateOpen(true)}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Chunk
      </Button>

      {/* Create Chunk Dialog */}
      <ChunkForm
        intentionId={intentionId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
