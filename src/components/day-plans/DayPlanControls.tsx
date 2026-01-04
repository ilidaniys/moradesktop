"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";

type EnergyMode = "deep" | "normal" | "light";

interface DayPlanControlsProps {
  timeBudget: number;
  energyMode: EnergyMode;
  maxTasks: number;
  onTimeBudgetChange: (value: number) => void;
  onEnergyModeChange: (value: EnergyMode) => void;
  onMaxTasksChange: (value: number) => void;
}

const TIME_PRESETS = [
  { label: "4h", value: 240 },
  { label: "6h", value: 360 },
  { label: "8h", value: 480 },
];

export function DayPlanControls({
  timeBudget,
  energyMode,
  maxTasks,
  onTimeBudgetChange,
  onEnergyModeChange,
  onMaxTasksChange,
}: DayPlanControlsProps) {
  const handleTimeBudgetInput = (value: string) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0) {
      onTimeBudgetChange(minutes);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Budget */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Time Budget</Label>
            <div className="flex gap-2">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={timeBudget === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeBudgetChange(preset.value)}
                  className="flex-1"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={timeBudget}
                onChange={(e) => handleTimeBudgetInput(e.target.value)}
                min={30}
                step={30}
                className="flex-1"
              />
              <span className="text-sm text-muted">min</span>
            </div>
          </div>

          {/* Energy Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Energy Mode</Label>
            <Select value={energyMode} onValueChange={onEnergyModeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep">Deep Focus</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="light">Light Tasks</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted">
              {energyMode === "deep" && "Best for complex, focused work"}
              {energyMode === "normal" && "Balanced mix of tasks"}
              {energyMode === "light" && "Simple, low-energy tasks"}
            </p>
          </div>

          {/* Max Tasks */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Tasks (Limit: 8)</Label>
            <Select
              value={maxTasks.toString()}
              onValueChange={(value) => onMaxTasksChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "task" : "tasks"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted">
              Limit complexity and maintain focus
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
