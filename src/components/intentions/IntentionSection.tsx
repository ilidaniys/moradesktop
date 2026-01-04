"use client";

import { useQuery } from "convex/react";
import { ChevronDown, ChevronRight, Edit, Sparkles, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ChunksList } from "~/components/chunks/ChunksList";
import { IntentionForm } from "./IntentionForm";
import { DeleteIntentionDialog } from "./DeleteIntentionDialog";
import { cn } from "~/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
  defaultExpanded = true,
}: IntentionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const chunks = useQuery(api.chunks.listByIntention, {
    intentionId: intention._id,
  });

  const chunkCount = chunks?.length ?? 0;
  const readyCount = chunks?.filter((c) => c.status === "ready").length ?? 0;
  const statusInfo = statusConfig[intention.status];

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

                  {/* Extract Chunks AI Button - Disabled for now */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Chunks with AI (Coming Soon)
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
    </>
  );
}
