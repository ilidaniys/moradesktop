"use client";

import { useState } from "react";
import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { DayPlanStatusBadge } from "./DayPlanStatusBadge";
import { EditPlanSettingsDialog } from "./EditPlanSettingsDialog";
import { DuplicatePlanDialog } from "./DuplicatePlanDialog";
import {
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  MoreVertical,
  Trash,
  Zap,
} from "lucide-react";
import { cn } from "~/lib/utils";

type DayPlanStatus = "draft" | "active" | "completed";
type EnergyMode = "deep" | "normal" | "light";

interface PlanCardProps {
  plan: {
    _id: Id<"dayPlans">;
    date: string;
    status: DayPlanStatus;
    timeBudget: number;
    energyMode: EnergyMode;
    itemCount: number;
    totalDuration: number;
    completedCount: number;
    notes?: string;
  };
  isSelected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate?: (newPlanId: Id<"dayPlans">) => void;
  existingPlanDates?: string[];
}

export function PlanCard({
  plan,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  existingPlanDates,
}: PlanCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const planDate = parseISO(plan.date);
  const isPlanToday = isToday(planDate);
  const isPlanTomorrow = isTomorrow(planDate);
  const isPlanPast = isPast(planDate) && !isPlanToday;

  const getRelativeDateLabel = () => {
    if (isPlanToday) return "Today";
    if (isPlanTomorrow) return "Tomorrow";
    if (isPlanPast) return formatDistanceToNow(planDate, { addSuffix: true });
    return format(planDate, "EEE, MMM d");
  };

  const energyModeConfig = {
    deep: { label: "Deep", icon: Zap, className: "text-purple-600" },
    normal: { label: "Normal", icon: Zap, className: "text-blue-600" },
    light: { label: "Light", icon: Zap, className: "text-green-600" },
  };

  const energyConfig = energyModeConfig[plan.energyMode];
  const EnergyIcon = energyConfig.icon;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDuplicateOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteAlertOpen(false);
  };

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-primary shadow-md ring-2",
          isPlanPast && !isSelected && "opacity-75",
        )}
        onClick={onSelect}
      >
        <CardContent className="p-3">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-sm font-medium">
                  {format(planDate, "MMMM d, yyyy")}
                </h4>
                {(isPlanToday || isPlanTomorrow) && (
                  <Badge variant="secondary" className="text-xs">
                    {getRelativeDateLabel()}
                  </Badge>
                )}
              </div>
              {!isPlanToday && !isPlanTomorrow && (
                <p className="text-muted-foreground text-xs">
                  {getRelativeDateLabel()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DayPlanStatusBadge status={plan.status} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {plan.totalDuration} / {plan.timeBudget} min
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {plan.completedCount} / {plan.itemCount} tasks
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <EnergyIcon
                  className={cn("mr-1 h-3 w-3", energyConfig.className)}
                />
                {energyConfig.label}
              </Badge>
              {plan.status === "completed" && plan.completedCount > 0 && (
                <Badge variant="outline" className="text-success text-xs">
                  {Math.round((plan.completedCount / plan.itemCount) * 100)}%
                  complete
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditPlanSettingsDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        plan={plan}
      />

      {/* Duplicate Dialog */}
      <DuplicatePlanDialog
        open={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        sourcePlan={plan}
        onSuccess={onDuplicate}
        existingPlanDates={existingPlanDates}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Day Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the plan for {format(planDate, "MMMM d, yyyy")}{" "}
              and all its items. Chunks will be moved back to &#34;Ready&#34;
              status.
              {plan.status === "active" && (
                <span className="mt-2 block font-medium text-amber-600">
                  ⚠ This is your active plan for today!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
