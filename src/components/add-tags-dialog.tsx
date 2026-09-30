"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TagLabel } from "@/components/tag-label";

type Tag = { id: string; name: string; color: string; emojiFilename?: string | null };

export function AddTagsDialog({
  entityName,
  tags,
  assignedTags,
  onAdd,
  isPending,
}: {
  entityName: string;
  tags: Tag[];
  assignedTags: Tag[];
  onAdd: (tagIds: string[]) => Promise<unknown>;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const assignedIds = new Set(assignedTags.map((tag) => tag.id));
  const availableTags = tags.filter((tag) => !assignedIds.has(tag.id));

  function setSelected(tagId: string, selected: boolean) {
    setSelectedTagIds((current) => selected
      ? current.includes(tagId) ? current : [...current, tagId]
      : current.filter((id) => id !== tagId));
  }

  async function addSelectedTags() {
    setError("");
    try {
      await onAdd(selectedTagIds);
      setSelectedTagIds([]);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add the selected tags.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) { setSelectedTagIds([]); setError(""); } }}>
      <DialogTrigger asChild>
        <Button className="deltarune-button text-white" style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}>
          + ADD TAGS
        </Button>
      </DialogTrigger>
      <DialogContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
        <DialogHeader>
          <DialogTitle className="text-white">Add Tags to {entityName}</DialogTitle>
          <DialogDescription className="text-[#a0a0a0]">Choose one or more tags to attach to this entry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {availableTags.length > 0 ? (
            <div className="add-tags-options">
              {availableTags.map((tag) => (
                <label key={tag.id} className="add-tags-option">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={(event) => setSelected(tag.id, event.target.checked)}
                  />
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: tag.color }} />
                  <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-[#a0a0a0]">All available tags are already attached.</p>
          )}
          {error && <p className="text-[#ff7676]" role="alert">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={() => setOpen(false)} className="deltarune-button text-white">CANCEL</Button>
            <Button
              type="button"
              onClick={addSelectedTags}
              disabled={!selectedTagIds.length || isPending}
              className="deltarune-button text-white"
            >
              {isPending ? "ADDING…" : `ADD ${selectedTagIds.length ? `(${selectedTagIds.length})` : "TAGS"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
