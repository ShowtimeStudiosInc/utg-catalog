"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagLabel } from "@/components/tag-label";

async function fetchItem(id: string) {
  const response = await fetch(`/api/items/${id}`);
  if (!response.ok) throw new Error('Failed to fetch item');
  return response.json();
}

async function fetchTags() {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

async function fetchItemTags(id: string) {
  const response = await fetch(`/api/items/${id}/tags`);
  if (!response.ok) throw new Error('Failed to fetch item tags');
  return response.json();
}

async function addTagToItem(itemId: string, tagId: string) {
  const response = await fetch(`/api/items/${itemId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId }),
  });
  if (!response.ok) throw new Error('Failed to add tag');
  return response.json();
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const [itemId, setItemId] = useState<string | null>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState('');

  useEffect(() => {
    params.then(p => setItemId(p.id));
  }, [params]);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemId ? fetchItem(itemId) : Promise.reject('No ID'),
    enabled: !!itemId,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const { data: itemTags, refetch: refetchItemTags } = useQuery({
    queryKey: ['itemTags', itemId],
    queryFn: () => itemId ? fetchItemTags(itemId) : Promise.reject('No ID'),
    enabled: !!itemId,
  });

  const addTagMutation = useMutation({
    mutationFn: (tagId: string) => addTagToItem(itemId!, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itemTags', itemId] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsTagDialogOpen(false);
      setSelectedTagId('');
    },
  });

  const itemTypeColors: Record<string, string> = {
    'Weapon': '#e94560',
    'Shield': '#4ecdc4',
    'Armor': '#95e1d3',
    'Accessory': '#ffd93d',
    'Consumable': '#a8e6cf',
    'Miscellaneous': '#a0a0a0',
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

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ITEM NOT FOUND</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2 retro-glow">{item.name}</h1>
          <div className="flex gap-2 flex-wrap">
            <Badge 
              className="deltarune-badge text-white"
              style={{ 
                backgroundColor: itemTypeColors[item.type] || '#4a4a8a',
                borderColor: itemTypeColors[item.type] || '#4a4a8a'
              }}
            >
              {item.type}
            </Badge>
            {item.value && (
              <Badge className="deltarune-badge text-white" style={{ backgroundColor: '#ffd93d', borderColor: '#ffd93d' }}>
                {item.value} Aurum
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-xl">TAGS</h3>
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button className="deltarune-button text-white" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                  + ADD TAG
                </Button>
              </DialogTrigger>
              <DialogContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Tag to Item</DialogTitle>
                  <DialogDescription className="text-[#a0a0a0]">
                    Select a tag to add to this item
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select
                    value={selectedTagId}
                    onValueChange={(value) => setSelectedTagId(value ?? '')}
                  >
                    <SelectTrigger className="deltarune-input text-white bg-[#1a1a3a] border-[#4a4a8a]">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                      {tags?.map((tag: any) => (
                        <SelectItem key={tag.id} value={tag.id} className="text-white hover:bg-[#2a2a5a]">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: tag.color }}
                            />
                            <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => setIsTagDialogOpen(false)}
                      className="deltarune-button text-white"
                      style={{ backgroundColor: '#e94560' }}
                    >
                      CANCEL
                    </Button>
                    <Button
                      onClick={() => selectedTagId && addTagMutation.mutate(selectedTagId)}
                      disabled={!selectedTagId || addTagMutation.isPending}
                      className="deltarune-button text-white"
                    >
                      {addTagMutation.isPending ? 'ADDING...' : 'ADD'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 flex-wrap">
            {itemTags?.map((tag: any) => (
              <Badge 
                key={tag.id}
                className="deltarune-badge text-white"
                style={{ backgroundColor: tag.color, borderColor: tag.color }}
              >
                <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
              </Badge>
            ))}
            {(!itemTags || itemTags.length === 0) && (
              <span className="text-[#a0a0a0] text-lg">No tags</span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Main Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
              {item.description && <p><strong className="text-white">Description:</strong> {item.description}</p>}
              {item.originalOwner && <p><strong className="text-white">Original Owner:</strong> {item.originalOwner}</p>}
              {item.currentOwner && <p><strong className="text-white">Current Owner:</strong> {item.currentOwner}</p>}
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[#a0a0a0] text-lg">
              {item.atk && <p><strong className="text-white">ATK:</strong> {item.atk}</p>}
              {item.hitCount && <p><strong className="text-white">Hit Count:</strong> {item.hitCount}</p>}
              {item.def && <p><strong className="text-white">DEF:</strong> {item.def}</p>}
              {item.defendEfficiency && <p><strong className="text-white">Defend Efficiency:</strong> {item.defendEfficiency}x</p>}
              {item.spd && <p><strong className="text-white">SPD:</strong> {item.spd}</p>}
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Physical Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[#a0a0a0] text-lg">
              {item.range && <p><strong className="text-white">Range:</strong> {item.range}</p>}
              {item.weight && <p><strong className="text-white">Weight:</strong> {item.weight}</p>}
              {item.physicalDamages && <p><strong className="text-white">Physical Damages:</strong> {item.physicalDamages}</p>}
            </CardContent>
          </Card>

          {item.appearanceImage && (
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={item.appearanceImage} 
                  alt={item.name}
                  className="w-full h-auto border-4 border-[#4a4a8a]"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <Button className="deltarune-button text-white">
            EDIT ITEM
          </Button>
          <Button 
            className="deltarune-button text-white"
            style={{ backgroundColor: '#e94560' }}
          >
            DELETE
          </Button>
        </div>
      </div>
    </div>
  );
}