"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TagEmojiPicker } from "@/components/tag-emoji-picker";
import { TagLabel } from "@/components/tag-label";

type Tag = {
  id: string;
  name: string;
  color: string;
  category: string | null;
  emojiFilename: string | null;
  characterCount: number;
  itemCount: number;
  abilityCount: number;
  totalCount: number;
};

type TagInput = Pick<Tag, "name" | "color"> & {
  category: string | null;
  emojiFilename: string | null;
};

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "The tag request failed.");
  return body as T;
}

async function fetchTags(): Promise<Tag[]> {
  return readResponse(await fetch("/api/tags"));
}

async function saveTag(tag: TagInput, id?: string): Promise<Tag> {
  return readResponse(await fetch(id ? `/api/tags/${id}` : "/api/tags", {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  }));
}

async function deleteTag(id: string) {
  return readResponse(await fetch(`/api/tags/${id}`, { method: "DELETE" }));
}

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#d7b968");
  const [category, setCategory] = useState("");
  const [emojiFilename, setEmojiFilename] = useState<string | null>(null);
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const saveMutation = useMutation({
    mutationFn: () => saveTag({
      name: name.trim(),
      color,
      category: category.trim() || null,
      emojiFilename,
    }, editingTag?.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
  });

  function resetForm() {
    setEditingTag(null);
    setName("");
    setColor("#d7b968");
    setCategory("");
    setEmojiFilename(null);
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(tag: Tag) {
    setEditingTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setCategory(tag.category || "");
    setEmojiFilename(tag.emojiFilename);
    setDialogOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim()) saveMutation.mutate();
  }

  if (isLoading) {
    return <div className="page-state" role="status"><div className="page-state__mark">◇</div>Loading tags…</div>;
  }

  if (error) {
    return (
      <div className="page-state" data-state="error" role="alert">
        <div className="page-state__mark">!</div>
        <h1>Unable to load tags</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold tracking-[0.18em] text-[#f5cf69]">LIBRARY / LABELS</p>
            <h1 className="retro-glow mb-2 text-4xl text-white">TAGS</h1>
            <p className="text-xl text-[#b5bdcc]">Sort your world and give its labels a visual signature.</p>
          </div>
          <Button onClick={openCreate} className="deltarune-button text-white">+ CREATE TAG</Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="deltarune-card max-h-[90vh] overflow-y-auto bg-[#111a2b]">
            <DialogHeader>
              <DialogTitle className="text-white">{editingTag ? "Edit tag" : "Create a tag"}</DialogTitle>
              <DialogDescription className="text-[#b5bdcc]">
                Name, color, and optional custom art stay in your local catalog.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="tag-name" className="text-white">Tag name</Label>
                <Input
                  id="tag-name"
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                  className="deltarune-input mt-1"
                  placeholder="e.g. found family"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tag-color" className="text-white">Color</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="tag-color"
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="deltarune-input h-11 w-16 p-1"
                    aria-label="Choose tag color"
                  />
                  <Input
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="deltarune-input flex-1"
                    aria-label="Tag color hex value"
                    pattern="#[0-9A-Fa-f]{6}"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tag-category" className="text-white">Category <span className="text-[#b5bdcc]">(optional)</span></Label>
                <Input
                  id="tag-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="deltarune-input mt-1"
                  placeholder="Character, item, ability…"
                />
              </div>
              <TagEmojiPicker value={emojiFilename} onChange={setEmojiFilename} />
              {saveMutation.error && (
                <p className="text-sm text-[#ff9aa4]" role="alert">{saveMutation.error.message}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setDialogOpen(false)} className="deltarune-button">
                  CANCEL
                </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="deltarune-button">
                  {saveMutation.isPending ? "SAVING…" : editingTag ? "SAVE CHANGES" : "CREATE TAG"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {deleteMutation.error && (
          <p className="mb-4 border border-[#ad5364] bg-[#331c2a] p-3 text-[#ffb0b8]" role="alert">
            {deleteMutation.error.message}
          </p>
        )}

        {tags?.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tags.map((tag) => (
              <Card key={tag.id} className="deltarune-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-white">
                        <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
                      </CardTitle>
                      <CardDescription className="mt-2 text-[#b5bdcc]">
                        {tag.category || "No category"} · Used {tag.totalCount} {tag.totalCount === 1 ? "time" : "times"}
                      </CardDescription>
                    </div>
                    <span
                      className="h-7 w-7 shrink-0 border-2 border-[#d7ddea]"
                      style={{ backgroundColor: tag.color }}
                      aria-label={`Tag color ${tag.color}`}
                      title={tag.color}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-5 space-y-2 text-sm">
                    <CountRow label="Characters" count={tag.characterCount} />
                    <CountRow label="Items" count={tag.itemCount} />
                    <CountRow label="Abilities" count={tag.abilityCount} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="deltarune-badge border-2 text-white" style={{ backgroundColor: tag.color, borderColor: tag.color }}>
                      <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
                    </Badge>
                    <Button onClick={() => openEdit(tag)} className="deltarune-button ml-auto px-3">
                      EDIT
                    </Button>
                    <Button
                      onClick={() => {
                        if (window.confirm(`Delete the “${tag.name}” tag?`)) deleteMutation.mutate(tag.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="deltarune-button px-3"
                    >
                      DELETE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="page-state">
            <div className="page-state__mark">◇</div>
            <h2 className="mb-2 text-2xl text-white">No tags yet</h2>
            <p className="mb-5">Create a label to bring a little order to your catalog.</p>
            <Button onClick={openCreate} className="deltarune-button">CREATE YOUR FIRST TAG</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CountRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between border-b border-[#52617a66] pb-1">
      <span className="text-[#b5bdcc]">{label}</span>
      <span className="font-bold text-white">{count}</span>
    </div>
  );
}
