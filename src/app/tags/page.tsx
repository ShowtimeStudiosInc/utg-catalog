"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

async function fetchTags() {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

async function createTag(data: { name: string; color: string; category?: string }) {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create tag');
  return response.json();
}

async function deleteTag(id: string) {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete tag');
  return response.json();
}

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [newTagCategory, setNewTagCategory] = useState('');

  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsDialogOpen(false);
      setNewTagName('');
      setNewTagColor('#3b82f6');
      setNewTagCategory('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createMutation.mutate({
      name: newTagName,
      color: newTagColor,
      category: newTagCategory || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#a0a0a0] text-2xl">LOADING...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ERROR LOADING TAGS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl text-white mb-2 retro-glow">TAGS</h1>
            <p className="text-[#a0a0a0] text-xl">Manage tags for categorization</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="deltarune-button text-white">
                CREATE TAG
              </Button>
            </DialogTrigger>
            <DialogContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Tag</DialogTitle>
                <DialogDescription className="text-[#a0a0a0]">
                  Add a new tag for categorizing entities
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div>
                  <Label className="text-white">Tag Name</Label>
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]"
                    placeholder="Tag name"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-20 h-10 deltarune-input bg-[#1a1a3a] border-[#4a4a8a]"
                    />
                    <Input
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="deltarune-input text-white flex-1 bg-[#1a1a3a] border-[#4a4a8a]"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Category (Optional)</Label>
                  <Input
                    value={newTagCategory}
                    onChange={(e) => setNewTagCategory(e.target.value)}
                    className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]"
                    placeholder="Character, Item, Ability, or custom"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="deltarune-button text-white"
                    style={{ backgroundColor: '#e94560' }}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="deltarune-button text-white"
                  >
                    {createMutation.isPending ? 'CREATING...' : 'CREATE'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags?.map((tag: any) => (
            <Card key={tag.id} className="deltarune-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">{tag.name}</CardTitle>
                  <div 
                    className="w-8 h-8 rounded border-2 border-white"
                    style={{ backgroundColor: tag.color }}
                  />
                </div>
                <CardDescription className="text-[#a0a0a0]">
                  {tag.category || 'No category'} • Used {tag.totalCount} times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">Characters:</span>
                    <span className="text-white">{tag.characterCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">Items:</span>
                    <span className="text-white">{tag.itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">Abilities:</span>
                    <span className="text-white">{tag.abilityCount}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    className="deltarune-badge text-white"
                    style={{ backgroundColor: tag.color, borderColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                  <Button
                    onClick={() => deleteMutation.mutate(tag.id)}
                    disabled={deleteMutation.isPending}
                    className="deltarune-button text-white ml-auto"
                    style={{ backgroundColor: '#e94560', fontSize: '0.5rem', padding: '0.25rem 0.5rem' }}
                  >
                    DELETE
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tags?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#a0a0a0] text-2xl mb-4">NO TAGS FOUND</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="deltarune-button text-white">
                  CREATE YOUR FIRST TAG
                </Button>
              </DialogTrigger>
              <DialogContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Tag</DialogTitle>
                  <DialogDescription className="text-[#a0a0a0]">
                    Add a new tag for categorizing entities
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTag} className="space-y-4">
                  <div>
                    <Label className="text-white">Tag Name</Label>
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]"
                      placeholder="Tag name"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white">Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-20 h-10 deltarune-input bg-[#1a1a3a] border-[#4a4a8a]"
                      />
                      <Input
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="deltarune-input text-white flex-1 bg-[#1a1a3a] border-[#4a4a8a]"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Category (Optional)</Label>
                    <Input
                      value={newTagCategory}
                      onChange={(e) => setNewTagCategory(e.target.value)}
                      className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]"
                      placeholder="Character, Item, Ability, or custom"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="deltarune-button text-white"
                      style={{ backgroundColor: '#e94560' }}
                    >
                      CANCEL
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="deltarune-button text-white"
                    >
                      {createMutation.isPending ? 'CREATING...' : 'CREATE'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}