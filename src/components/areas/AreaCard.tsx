"use client";

import { Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AreaHealthBadge } from "./AreaHealthBadge";
import { cn } from "~/lib/utils";

type AreaHealth = "normal" | "neglected" | "urgent";
type AreaStatus = "active" | "paused" | "archived";

interface AreaCardProps {
  id: string;
  title: string;
  description: string;
  weight: number;
  health: AreaHealth;
  status: AreaStatus;
  lastTouchedAt: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function AreaCard({
  id,
  title,
  description,
  weight,
  health,
  status,
  lastTouchedAt,
  onEdit,
  onDelete,
}: AreaCardProps) {
  const healthColors = {
    normal: "border-slate-200",
    neglected: "border-red-200 bg-red-50/50",
    urgent: "border-amber-200 bg-amber-50/50",
  };

  const daysSinceTouch = Math.floor((Date.now() - lastTouchedAt) / (1000 * 60 * 60 * 24));

  return (
    <Card className={cn("transition-all hover:shadow-md", healthColors[health])}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <AreaHealthBadge health={health} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Weight:</span> {weight}/10
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize">{status}</span>
          </div>
          <div>
            <span className="font-medium">Last touched:</span>{" "}
            {daysSinceTouch === 0
              ? "Today"
              : daysSinceTouch === 1
                ? "Yesterday"
                : `${daysSinceTouch} days ago`}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/areas/${id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
