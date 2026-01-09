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
  Star,
  Trash,
  Zap,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

type DayPlanStatus = "draft" | "finalized" | "active" | "completed" | "expired";
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

  const activatePlan = useMutation(api.dayPlans.activate);

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

  // Get indicator color based on status
  const getStatusIndicator = () => {
    switch (plan.status) {
      case "active":
        return "bg-blue-500";
      case "finalized":
        return "bg-violet-500";
      case "completed":
        return "bg-emerald-500";
      case "expired":
        return "bg-amber-500";
      case "draft":
        return "bg-slate-300";
      default:
        return "";
    }
  };

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

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await activatePlan({ dayPlanId: plan._id });
      toast.success("Plan activated", {
        description: "This plan is now active on your dashboard",
      });
    } catch (error) {
      console.error("Failed to activate plan:", error);
      toast.error("Failed to activate plan", {
        description: "Please try again",
      });
    }
  };

  return (
    <>
      <Card
        className={cn(
          "hover:border-primary/50 relative cursor-pointer overflow-hidden transition-all",
          isSelected
            ? "border-primary bg-accent/5 shadow-sm"
            : "hover:shadow-sm",
          isPlanPast && !isSelected && "opacity-70",
        )}
        onClick={onSelect}
      >
        {/* Status indicator line */}
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 w-1",
            getStatusIndicator(),
          )}
        />

        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold tracking-tight">
                  {format(planDate, "MMMM d, yyyy")}
                </h4>
                {(isPlanToday || isPlanTomorrow) && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase"
                  >
                    {getRelativeDateLabel()}
                  </Badge>
                )}
              </div>
              {!isPlanToday && !isPlanTomorrow && (
                <p className="text-muted-foreground text-xs font-medium">
                  {getRelativeDateLabel()}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <DayPlanStatusBadge status={plan.status} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(plan.status === "draft" || plan.status === "finalized") && (
                    <>
                      <DropdownMenuItem onClick={handleActivate}>
                        <Star className="mr-2 h-4 w-4" />
                        Activate Plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
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
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-muted/50 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1 text-[11px] leading-none font-medium uppercase">
                    Duration
                  </span>
                  <span className="leading-none font-semibold">
                    {plan.totalDuration}{" "}
                    <span className="text-muted-foreground text-[11px] font-normal">
                      / {plan.timeBudget}m
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-muted/50 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1 text-[11px] leading-none font-medium uppercase">
                    Tasks
                  </span>
                  <span className="leading-none font-semibold">
                    {plan.completedCount}{" "}
                    <span className="text-muted-foreground text-[11px] font-normal">
                      / {plan.itemCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-6 gap-1 px-2 text-[11px] font-medium"
                >
                  <EnergyIcon
                    className={cn("h-3 w-3", energyConfig.className)}
                  />
                  {energyConfig.label}
                </Badge>
                {plan.status === "completed" && plan.completedCount > 0 && (
                  <Badge
                    variant="outline"
                    className="h-6 border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                  >
                    {Math.round((plan.completedCount / plan.itemCount) * 100)}%
                  </Badge>
                )}
              </div>
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
              {plan.status === "expired" && (
                <span className="mt-2 block font-medium text-amber-600">
                  ⚠ This plan has expired. You can still delete it to clean up.
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
