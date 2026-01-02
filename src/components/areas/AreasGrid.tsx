"use client";

import { useState } from "react";
import { AreaCard } from "./AreaCard";
import { AreaForm } from "./AreaForm";
import { DeleteAreaDialog } from "./DeleteAreaDialog";
import type { Id } from "../../../convex/_generated/dataModel";

type AreaHealth = "normal" | "neglected" | "urgent";
type AreaStatus = "active" | "paused" | "archived";

interface Area {
  _id: Id<"areas">;
  title: string;
  description: string;
  weight: number;
  health: AreaHealth;
  status: AreaStatus;
  lastTouchedAt: number;
}

interface AreasGridProps {
  areas: Area[];
}

export function AreasGrid({ areas }: AreasGridProps) {
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deletingArea, setDeletingArea] = useState<{
    id: Id<"areas">;
    title: string;
  } | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <AreaCard
            key={area._id}
            id={area._id}
            title={area.title}
            description={area.description}
            weight={area.weight}
            health={area.health}
            status={area.status}
            lastTouchedAt={area.lastTouchedAt}
            onEdit={() => setEditingArea(area)}
            onDelete={() =>
              setDeletingArea({ id: area._id, title: area.title })
            }
          />
        ))}
      </div>

      <AreaForm
        open={!!editingArea}
        onOpenChange={(open) => !open && setEditingArea(null)}
        initialData={
          editingArea
            ? {
                id: editingArea._id,
                title: editingArea.title,
                description: editingArea.description,
                weight: editingArea.weight,
              }
            : undefined
        }
      />

      <DeleteAreaDialog
        open={!!deletingArea}
        onOpenChange={(open) => !open && setDeletingArea(null)}
        areaId={deletingArea?.id ?? null}
        areaTitle={deletingArea?.title ?? ""}
      />
    </>
  );
}
