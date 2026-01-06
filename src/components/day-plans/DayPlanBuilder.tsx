"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, LayoutDashboard, Plus, Save, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/shared/EmptyState";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { DayPlanControls } from "./DayPlanControls";
import { TimeBudgetIndicator } from "./TimeBudgetIndicator";
import { SortablePlanItems } from "./SortablePlanItems";
import { AddChunksDialog } from "./AddChunksDialog";
import { AISuggestions } from "./AISuggestions";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { useBuildDayPlan } from "~/hooks/useBuildDayPlan";
import type { BuildDayPlanOutput } from "~/lib/ai/types";

type EnergyMode = "deep" | "normal" | "light";

interface PlanItem {
  id: string;
  chunkId: Id<"chunks">;
  chunk: {
    title: string;
    durationMin: number;
    tags: string[];
    dod: string;
  };
  locked: boolean;
  order: number;
}

export function DayPlanBuilder() {
  const [timeBudget, setTimeBudget] = useState(480); // 8 hours default
  const [energyMode, setEnergyMode] = useState<EnergyMode>("normal");
  const [maxTasks, setMaxTasks] = useState(5);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dayPlanId, setDayPlanId] = useState<Id<"dayPlans"> | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<BuildDayPlanOutput | null>(null);

  const createDayPlan = useMutation(api.dayPlans.create);
  const addItemMutation = useMutation(api.dayPlans.addItem);
  const removeItemMutation = useMutation(api.dayPlans.removeItem);
  const reorderItemsMutation = useMutation(api.dayPlans.reorderItems);

  const { buildDayPlan, isLoading: isGeneratingPlan } = useBuildDayPlan();

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split("T")[0]!;
  }, []);

  const existingPlan = useQuery(api.dayPlans.getByDate, { date: today ?? "" });
  const readyChunks = useQuery(api.chunks.listReadyChunks);

  // Initialize from existing plan if available
  useEffect(() => {
    if (existingPlan) {
      if (!dayPlanId) {
        setDayPlanId(existingPlan._id);
      }
      setTimeBudget(existingPlan.timeBudget);
      setEnergyMode(existingPlan.energyMode as EnergyMode);

      // Load items
      if (existingPlan.items) {
        const loadedItems: PlanItem[] = existingPlan.items.map((item: any) => ({
          id: item._id,
          chunkId: item.chunkId,
          chunk: {
            title: item.chunk?.title || "Untitled",
            durationMin: item.chunk?.durationMin || 0,
            tags: item.chunk?.tags || [],
            dod: item.chunk?.dod || "",
          },
          locked: item.locked,
          order: item.order,
        }));
        setItems(loadedItems);
      }
    }
  }, [existingPlan, dayPlanId]);

  // Calculate used minutes
  const usedMinutes = items.reduce(
    (sum, item) => sum + item.chunk.durationMin,
    0,
  );

  // Get excluded chunk IDs for the add dialog
  const excludeChunkIds = items.map((item) => item.chunkId);

  const handleCreatePlan = async () => {
    try {
      const planId = await createDayPlan({
        date: today,
        timeBudget: timeBudget,
        energyMode,
      });
      setDayPlanId(planId);
      return planId;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const finalizePlanMutation = useMutation(api.dayPlans.finalize);

  const handleFinalizePlan = async () => {
    if (!dayPlanId) return;

    try {
      await finalizePlanMutation({
        dayPlanId,
      });
      toast.success("Plan finalized");
    } catch (error) {
      toast.error("Failed to finalize plan");
    }
  };

  const handleAddChunk = async (chunkId: Id<"chunks">) => {
    let currentPlanId = dayPlanId;

    if (!currentPlanId) {
      currentPlanId = await handleCreatePlan();
      if (!currentPlanId) return;
    }

    // Check max tasks limit (manual check since we don't have it in schema yet)
    if (items.length >= 8) {
      toast.error("Max tasks reached", {
        description: "You can only add up to 8 tasks to a day plan",
      });
      return;
    }

    try {
      await addItemMutation({
        dayPlanId: currentPlanId,
        chunkId,
      });

      setShowAddDialog(false);

      toast.success("Chunk added", {
        description: "Chunk has been added to your plan",
      });
    } catch (error) {
      toast.error("Failed to add chunk");
    }
  };

  const handleToggleLock = (itemId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, locked: !item.locked } : item,
      ),
    );
  };

  const handleRemove = async (itemId: string) => {
    if (!dayPlanId) return;

    try {
      await removeItemMutation({
        itemId: itemId as Id<"dayPlanItems">,
      });

      setItems((prevItems) => {
        const filtered = prevItems.filter((item) => item.id !== itemId);
        // Update order numbers
        return filtered.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });

      toast.success("Item removed", {
        description: "Item has been removed from your plan",
      });
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleReorder = async (reorderedItems: PlanItem[]) => {
    if (!dayPlanId) return;

    setItems(reorderedItems);

    try {
      await reorderItemsMutation({
        itemOrders: reorderedItems.map((item) => ({
          itemId: item.id as Id<"dayPlanItems">,
          order: item.order,
        })),
      });
    } catch (error) {
      toast.error("Failed to reorder items");
    }
  };

  const handleGenerateWithAI = async () => {
    console.log("handleGenerateWithAI called");

    if (!readyChunks || readyChunks.length === 0) {
      toast.error("No ready chunks available", {
        description: "Add some ready chunks to your intentions first",
      });
      return;
    }

    // Prepare chunks for AI
    const availableChunks = readyChunks.map((chunk) => ({
      id: chunk._id,
      chunkId: chunk._id,
      title: chunk.title,
      durationMin: chunk.durationMin,
      tags: chunk.tags,
      dod: chunk.dod,
      areaTitle: chunk.area?.title || "Unknown",
      areaWeight: chunk.area?.weight || 0,
      intentionTitle: chunk.intention?.title,
    }));

    const lockedChunkIds = items.filter((item) => item.locked).map((item) => item.id);

    console.log("Calling buildDayPlan with:", {
      timeBudgetMin: timeBudget,
      energyMode,
      maxTasks,
      availableChunksCount: availableChunks.length,
      lockedChunkIds,
    });

    const result = await buildDayPlan({
      timeBudgetMin: timeBudget,
      energyMode,
      maxTasks,
      availableChunks,
      lockedChunkIds,
    });

    console.log("buildDayPlan result:", result);

    if (result) {
      console.log("Setting AI suggestions:", result);
      setAiSuggestions(result);
      setShowAISuggestions(true);
    } else {
      console.log("buildDayPlan returned null");
      toast.error("Failed to generate plan", {
        description: "Please try again",
      });
    }
  };

  const handleAcceptAISuggestions = async () => {
    if (!aiSuggestions) return;

    let currentPlanId = dayPlanId;

    if (!currentPlanId) {
      currentPlanId = await handleCreatePlan();
      if (!currentPlanId) return;
    }

    try {
      // Remove all non-locked items
      const itemsToRemove = items.filter((item) => !item.locked);
      for (const item of itemsToRemove) {
        await removeItemMutation({
          itemId: item.id as Id<"dayPlanItems">,
        });
      }

      // Add suggested items
      for (const suggestion of aiSuggestions.suggestedItems) {
        await addItemMutation({
          dayPlanId: currentPlanId,
          chunkId: suggestion.chunkId,
        });
      }

      toast.success("AI plan applied", {
        description: `Added ${aiSuggestions.suggestedItems.length} chunks to your plan`,
      });

      setShowAISuggestions(false);
    } catch (error) {
      toast.error("Failed to apply AI suggestions");
    }
  };

  const handleRejectAISuggestions = () => {
    setShowAISuggestions(false);
    // Could trigger regeneration here if desired
  };

  const isLoading = existingPlan === undefined;

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading day plan..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <DayPlanControls
        timeBudget={timeBudget}
        energyMode={energyMode}
        maxTasks={maxTasks}
        onTimeBudgetChange={setTimeBudget}
        onEnergyModeChange={setEnergyMode}
        onMaxTasksChange={setMaxTasks}
      />

      {/* Time Budget Indicator */}
      <TimeBudgetIndicator
        usedMinutes={usedMinutes}
        totalMinutes={timeBudget}
      />

      {/* Plan Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Your Day Plan</CardTitle>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            disabled={items.length >= maxTasks}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Chunk
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title="No chunks yet"
              description="Add ready chunks to build your day plan"
            />
          ) : (
            <SortablePlanItems
              items={items}
              onReorder={handleReorder}
              onToggleLock={handleToggleLock}
              onRemove={handleRemove}
            />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleGenerateWithAI}
          disabled={isGeneratingPlan || !readyChunks || readyChunks.length === 0}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isGeneratingPlan ? "Generating..." : "Generate with AI"}
        </Button>

        {items.length > 0 && (
          <div className="flex gap-3">
            <Button variant="outline" size="lg">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant={"default"} size="lg" onClick={handleFinalizePlan}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalize Plan
            </Button>
          </div>
        )}
      </div>

      {/* Add Chunks Dialog */}
      <AddChunksDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddChunk={handleAddChunk}
        excludeChunkIds={excludeChunkIds}
      />

      {/* AI Suggestions Dialog */}
      {aiSuggestions && readyChunks && (
        <AISuggestions
          open={showAISuggestions}
          onOpenChange={setShowAISuggestions}
          suggestions={aiSuggestions}
          availableChunks={readyChunks.map((chunk) => ({
            chunkId: chunk._id,
            title: chunk.title,
            durationMin: chunk.durationMin,
            tags: chunk.tags,
            dod: chunk.dod,
            areaTitle: chunk.area?.title || "Unknown",
          }))}
          onAccept={handleAcceptAISuggestions}
          onReject={handleRejectAISuggestions}
        />
      )}
    </div>
  );
}
