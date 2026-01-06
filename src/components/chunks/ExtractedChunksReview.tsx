"use client";

import { useState, useEffect } from "react";
import { Check, Clock, Pencil, X } from "lucide-react";
import type { ExtractedChunk } from "~/lib/ai/types";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

interface ExtractedChunksReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chunks: ExtractedChunk[];
  reasoning: string;
  onAccept: (chunks: ExtractedChunk[]) => void;
  onReject: () => void;
}

export function ExtractedChunksReview({
  open,
  onOpenChange,
  chunks: initialChunks,
  reasoning,
  onAccept,
  onReject,
}: ExtractedChunksReviewProps) {
  const [chunks, setChunks] = useState<ExtractedChunk[]>(initialChunks);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExtractedChunk | null>(null);

  // Update internal state when chunks prop changes
  useEffect(() => {
    console.log("ExtractedChunksReview received chunks:", initialChunks);
    setChunks(initialChunks);
  }, [initialChunks]);

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...chunks[index]! });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editForm) {
      const updated = [...chunks];
      updated[editingIndex] = editForm;
      setChunks(updated);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleRemoveChunk = (index: number) => {
    setChunks(chunks.filter((_, i) => i !== index));
  };

  const handleAccept = () => {
    onAccept(chunks);
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };
  console.log(chunks, "chunks");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Review AI-Generated Chunks</DialogTitle>
          <DialogDescription>
            Review and edit the chunks before adding them to your intention
          </DialogDescription>
        </DialogHeader>

        {/* AI Reasoning */}
        <div className="bg-primary-soft/30 rounded-lg p-3">
          <p className="text-primary text-sm">
            <strong className="text-foreground">AI Reasoning:</strong>{" "}
            {reasoning}
          </p>
        </div>

        {/* Chunks List */}
        <div className="space-y-3">
          {chunks.map((chunk, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-4">
                {editingIndex === index && editForm ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Definition of Done
                      </Label>
                      <Textarea
                        value={editForm.dod}
                        onChange={(e) =>
                          setEditForm({ ...editForm, dod: e.target.value })
                        }
                        className="mt-1 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Duration (minutes)
                      </Label>
                      <Input
                        type="number"
                        min={30}
                        max={120}
                        value={editForm.durationMin}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            durationMin: parseInt(e.target.value) || 30,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Tags (comma-separated)
                      </Label>
                      <Input
                        value={editForm.tags.join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter((t) => t.length > 0),
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="mr-1 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-foreground flex-1 font-medium">
                        {index + 1}. {chunk.title}
                      </h4>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-muted flex items-center gap-1 text-sm">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{chunk.durationMin}m</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleStartEdit(index)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-danger hover:bg-danger-soft h-7 w-7"
                          onClick={() => handleRemoveChunk(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-secondary text-sm">{chunk.dod}</p>

                    {chunk.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {chunk.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="text-muted flex items-center gap-4 text-sm">
          <span>
            <strong className="text-foreground">{chunks.length}</strong> chunks
          </span>
          <span>
            <strong className="text-foreground">
              {chunks.reduce((sum, c) => sum + c.durationMin, 0)}
            </strong>{" "}
            minutes total
          </span>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject}>
            Regenerate
          </Button>
          <Button onClick={handleAccept} disabled={chunks.length === 0}>
            Accept & Add Chunks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
