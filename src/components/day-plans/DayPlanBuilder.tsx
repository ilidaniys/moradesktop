"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { Plus, Save, CheckCircle2 } from "lucide-react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/shared/EmptyState";
import { LoadingSpinner } from "~/components/shared/LoadingSpinner";
import { DayPlanControls } from "./DayPlanControls";
import { TimeBudgetIndicator } from "./TimeBudgetIndicator";
import { SortablePlanItems } from "./SortablePlanItems";
import { AddChunksDialog } from "./AddChunksDialog";
import { useToast } from "~/hooks/use-toast";

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
  const { toast } = useToast();
  const [timeBudget, setTimeBudget] = useState(480); // 8 hours default
  const [energyMode, setEnergyMode] = useState<EnergyMode>("normal");
  const [maxTasks, setMaxTasks] = useState(5);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dayPlanId, setDayPlanId] = useState<Id<"dayPlans"> | null>(null);

  const createDayPlan = useMutation(api.dayPlans.create);
  const addItemMutation = useMutation(api.dayPlans.addItem);
  const removeItemMutation = useMutation(api.dayPlans.removeItem);
  const reorderItemsMutation = useMutation(api.dayPlans.reorderItems);

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }, []);

  const existingPlan = useQuery(api.dayPlans.getByDate, { date: today });

  // Initialize from existing plan if available
  useMemo(() => {
    if (existingPlan && !dayPlanId) {
      setDayPlanId(existingPlan._id);
      setTimeBudget(existingPlan.timeBudgetMin);
      setEnergyMode(existingPlan.energyMode as EnergyMode);
      setMaxTasks(existingPlan.maxTasks);

      // Load items
      if (existingPlan.items) {
        const loadedItems: PlanItem[] = existingPlan.items.map((item: any) => ({
          id: item._id,
          chunkId: item.chunkId,
          chunk: item.chunk,
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
    0
  );

  // Get excluded chunk IDs for the add dialog
  const excludeChunkIds = items.map((item) => item.chunkId);

  const handleCreatePlan = async () => {
    try {
      const planId = await createDayPlan({
        date: today,
        timeBudgetMin: timeBudget,
        energyMode,
        maxTasks,
      });
      setDayPlanId(planId);
      toast({
        title: "Plan created",
        description: "Your day plan has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    }
  };

  const handleAddChunk = async (chunkId: Id<"chunks">) => {
    if (!dayPlanId) {
      await handleCreatePlan();
      return;
    }

    // Check max tasks limit
    if (items.length >= maxTasks) {
      toast({
        title: "Max tasks reached",
        description: `You can only add up to ${maxTasks} tasks`,
        variant: "destructive",
      });
      return;
    }

    try {
      await addItemMutation({
        dayPlanId,
        chunkId,
        order: items.length + 1,
      });

      // Optimistically update UI
      // Note: In production, you'd refetch or use the returned item
      setShowAddDialog(false);

      toast({
        title: "Chunk added",
        description: "Chunk has been added to your plan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add chunk",
        variant: "destructive",
      });
    }
  };

  const handleToggleLock = (itemId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, locked: !item.locked } : item
      )
    );
  };

  const handleRemove = async (itemId: string) => {
    if (!dayPlanId) return;

    try {
      await removeItemMutation({
        dayPlanId,
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

      toast({
        title: "Item removed",
        description: "Item has been removed from your plan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (reorderedItems: PlanItem[]) => {
    if (!dayPlanId) return;

    setItems(reorderedItems);

    try {
      await reorderItemsMutation({
        dayPlanId,
        itemOrders: reorderedItems.map((item) => ({
          itemId: item.id as Id<"dayPlanItems">,
          order: item.order,
        })),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder items",
        variant: "destructive",
      });
    }
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
            <Plus className="h-4 w-4 mr-2" />
            Add Chunk
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
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
      {items.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button size="lg">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Finalize Plan
          </Button>
        </div>
      )}

      {/* Add Chunks Dialog */}
      <AddChunksDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddChunk={handleAddChunk}
        excludeChunkIds={excludeChunkIds}
      />
    </div>
  );
}
