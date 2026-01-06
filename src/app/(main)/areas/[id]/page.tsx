"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { EmptyState } from "~/components/shared/EmptyState";
import { AreaHealthBadge } from "~/components/areas/AreaHealthBadge";
import { IntentionSection } from "~/components/intentions/IntentionSection";
import { IntentionForm } from "~/components/intentions/IntentionForm";
import { AreaForm } from "~/components/areas/AreaForm";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

export default function AreaDetailPage() {
  const params = useParams();
  const areaId = params.id as Id<"areas">;

  const [isAreaEditOpen, setIsAreaEditOpen] = useState(false);
  const [isIntentionCreateOpen, setIsIntentionCreateOpen] = useState(false);

  const area = useQuery(api.areas.get, { areaId });

  //todo: combine it in one request
  const activeIntentions = useQuery(api.intentions.listByArea, {
    areaId,
    status: "active",
  });
  const pausedIntentions = useQuery(api.intentions.listByArea, {
    areaId,
    status: "paused",
  });
  const doneIntentions = useQuery(api.intentions.listByArea, {
    areaId,
    status: "done",
  });
  const limitCheck = useQuery(api.intentions.checkLimit, { areaId });

  const isLoading =
    area === undefined ||
    activeIntentions === undefined ||
    pausedIntentions === undefined ||
    doneIntentions === undefined;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading area details..." />
      </div>
    );
  }

  if (!area) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Area not found"
        description="The area you're looking for doesn't exist or you don't have access to it."
      />
    );
  }

  const activeCount = limitCheck?.activeCount ?? 0;
  const canAddActive = limitCheck?.canAddActive ?? true;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/areas">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Areas
        </Button>
      </Link>

      {/* Area Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-foreground text-2xl font-medium">
                  {area.title}
                </h1>
                <AreaHealthBadge health={area.health} />
                <Badge variant="outline" className="font-medium">
                  Weight: {area.weight}/10
                </Badge>
              </div>

              {area.description && (
                <p className="text-secondary">{area.description}</p>
              )}

              <div className="text-muted flex items-center gap-4 text-sm">
                <span>Status: {area.status}</span>
                <span>
                  Last touched:{" "}
                  {new Date(area?.lastTouchedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button variant="outline" onClick={() => setIsAreaEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Area
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Intentions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-lg font-medium">
              Active Intentions
            </h2>
            <Badge variant="outline" className="font-medium">
              {activeCount}/3
            </Badge>
          </div>
          <Button
            onClick={() => setIsIntentionCreateOpen(true)}
            disabled={!canAddActive}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Intention
          </Button>
        </div>

        {activeIntentions.length === 0 ? (
          <EmptyState
            icon={ArrowLeft}
            title="No active intentions"
            description="Create your first intention to start planning work for this area."
          />
        ) : (
          <div className="space-y-3">
            {activeIntentions.map((intention) => (
              <IntentionSection
                key={intention._id}
                intention={intention}
                areaTitle={area.title}
                defaultExpanded={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paused Intentions */}
      {pausedIntentions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-secondary text-lg font-medium">
            Paused Intentions ({pausedIntentions.length})
          </h2>
          <div className="space-y-3">
            {pausedIntentions.map((intention) => (
              <IntentionSection
                key={intention._id}
                intention={intention}
                areaTitle={area.title}
                defaultExpanded={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done Intentions */}
      {doneIntentions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-muted text-lg font-medium">
            Completed Intentions ({doneIntentions.length})
          </h2>
          <div className="space-y-3">
            {doneIntentions.map((intention) => (
              <IntentionSection
                key={intention._id}
                intention={intention}
                areaTitle={area.title}
                defaultExpanded={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Area Dialog */}
      <AreaForm
        initialData={{
          id: area._id,
          title: area.title,
          description: area.description,
          weight: area.weight,
          status: area.status,
        }}
        open={isAreaEditOpen}
        onOpenChange={setIsAreaEditOpen}
      />

      {/* Create Intention Dialog */}
      <IntentionForm
        areaId={areaId}
        open={isIntentionCreateOpen}
        onOpenChange={setIsIntentionCreateOpen}
      />
    </div>
  );
}
