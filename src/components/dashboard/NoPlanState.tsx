"use client";

import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function NoPlanState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center space-y-6 p-12 text-center">
          <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
            <Calendar className="text-muted h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-foreground text-2xl font-semibold">
              No Active Plan Today
            </h2>
            <p className="text-muted max-w-sm text-sm">
              You haven't finalized a day plan yet. Create and finalize a plan
              in the Day Builder to start working on your tasks.
            </p>
          </div>

          <Button size="lg" asChild>
            <Link href="/day-builder">
              <Plus className="mr-2 h-5 w-5" />
              Go to Day Builder
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
