"use client";

import { useState } from "react";
import { LayoutDashboard, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { EmptyState } from "~/components/shared/EmptyState";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { AreasGrid } from "~/components/areas/AreasGrid";
import { AreaForm } from "~/components/areas/AreaForm";
import { api } from "../../../../convex/_generated/api";

export default function AreasPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const areas = useQuery(api.areas.list, {});

  if (areas === undefined) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Areas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your long-term domains of responsibility
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Area
        </Button>
      </div>

      {areas.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No areas yet"
          description="Create your first area to start organizing your work into long-term domains."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              Create your first area
            </Button>
          }
        />
      ) : (
        <AreasGrid areas={areas} />
      )}

      <AreaForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
