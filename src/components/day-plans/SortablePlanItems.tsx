"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DayPlanItem } from "./DayPlanItem";
import type { Id } from "../../../convex/_generated/dataModel";

interface ChunkData {
  title: string;
  durationMin: number;
  tags: string[];
  dod: string;
}

interface PlanItem {
  id: string;
  chunkId: Id<"chunks">;
  chunk: ChunkData;
  locked: boolean;
  order: number;
}

interface SortablePlanItemsProps {
  items: PlanItem[];
  onReorder: (items: PlanItem[]) => void;
  onToggleLock: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

function SortableItem({
  item,
  onToggleLock,
  onRemove,
}: {
  item: PlanItem;
  onToggleLock: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: item.locked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DayPlanItem
        order={item.order}
        chunk={item.chunk}
        locked={item.locked}
        onToggleLock={onToggleLock}
        onRemove={onRemove}
        isDragging={isDragging}
      />
    </div>
  );
}

export function SortablePlanItems({
  items,
  onReorder,
  onToggleLock,
  onRemove,
}: SortablePlanItemsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    // Don't allow reordering if the item is locked
    if (items[oldIndex]?.locked) {
      return;
    }

    const reorderedItems = arrayMove(items, oldIndex, newIndex);

    // Update order numbers
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    onReorder(updatedItems);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              onToggleLock={() => onToggleLock(item.id)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
