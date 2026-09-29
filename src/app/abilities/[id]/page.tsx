"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagLabel } from "@/components/tag-label";

async function fetchAbility(id: string) {
  const response = await fetch(`/api/abilities/${id}`);
  if (!response.ok) throw new Error('Failed to fetch ability');
  return response.json();
}

async function fetchTags() {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

async function fetchAbilityTags(id: string) {
  const response = await fetch(`/api/abilities/${id}/tags`);
  if (!response.ok) throw new Error('Failed to fetch ability tags');
  return response.json();
}

async function addTagToAbility(abilityId: string, tagId: string) {
  const response = await fetch(`/api/abilities/${abilityId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId }),
  });
  if (!response.ok) throw new Error('Failed to add tag');
  return response.json();
}

export default function AbilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const [abilityId, setAbilityId] = useState<string | null>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState('');

  useEffect(() => {
    params.then(p => setAbilityId(p.id));
  }, [params]);

  const { data: ability, isLoading, error } = useQuery({
    queryKey: ['ability', abilityId],
    queryFn: () => abilityId ? fetchAbility(abilityId) : Promise.reject('No ID'),
    enabled: !!abilityId,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const { data: abilityTags, refetch: refetchAbilityTags } = useQuery({
    queryKey: ['abilityTags', abilityId],
    queryFn: () => abilityId ? fetchAbilityTags(abilityId) : Promise.reject('No ID'),
    enabled: !!abilityId,
  });

  const addTagMutation = useMutation({
    mutationFn: (tagId: string) => addTagToAbility(abilityId!, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abilityTags', abilityId] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsTagDialogOpen(false);
      setSelectedTagId('');
    },
  });

  const complexityColors: Record<string, string> = {
    'Basic': '#95e1d3',
    'Intermediate': '#ffd93d',
    'Advanced': '#ffaaa5',
    'Complex': '#e94560',
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

  if (error || !ability) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ABILITY NOT FOUND</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2 retro-glow">{ability.name}</h1>
          <div className="flex gap-2 flex-wrap">
            {ability.complexity && (
              <Badge 
                className="deltarune-badge text-white"
                style={{ 
                  backgroundColor: complexityColors[ability.complexity] || '#4a4a8a',
                  borderColor: complexityColors[ability.complexity] || '#4a4a8a'
                }}
              >
                {ability.complexity}
              </Badge>
            )}
            {ability.abilityType && (
              <Badge className="deltarune-badge text-white" style={{ backgroundColor: '#0f3460', borderColor: '#0f3460' }}>
                {ability.abilityType}
              </Badge>
            )}
            {ability.abilityClass && (
              <Badge className="deltarune-badge text-white" style={{ backgroundColor: '#4ecdc4', borderColor: '#4ecdc4' }}>
                {ability.abilityClass}
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
                  <DialogTitle className="text-white">Add Tag to Ability</DialogTitle>
                  <DialogDescription className="text-[#a0a0a0]">
                    Select a tag to add to this ability
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
            {abilityTags?.map((tag: any) => (
              <Badge 
                key={tag.id}
                className="deltarune-badge text-white"
                style={{ backgroundColor: tag.color, borderColor: tag.color }}
              >
                <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
              </Badge>
            ))}
            {(!abilityTags || abilityTags.length === 0) && (
              <span className="text-[#a0a0a0] text-lg">No tags</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="deltarune-card w-full mb-6 bg-[#1a1a3a] border-[#4a4a8a]">
            <TabsTrigger value="info" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              INFO
            </TabsTrigger>
            <TabsTrigger value="components" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              COMPONENTS
            </TabsTrigger>
            <TabsTrigger value="classification" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              CLASSIFICATION
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Main Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
                {ability.parentAbility && <p><strong className="text-white">Parent Ability:</strong> {ability.parentAbility}</p>}
                {ability.description && <p><strong className="text-white">Description:</strong></p>}
                {ability.description && <p className="mt-2">{ability.description}</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ability.passives && (
                  <div>
                    <h3 className="text-white text-xl mb-3">Passives</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line">{ability.passives}</div>
                  </div>
                )}
                {ability.skills && (
                  <div>
                    <h3 className="text-white text-xl mb-3">SKILLs</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line">{ability.skills}</div>
                  </div>
                )}
                {ability.statChanges && (
                  <div>
                    <h3 className="text-white text-xl mb-3">Stat Changes</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line">{ability.statChanges}</div>
                  </div>
                )}
                {ability.weaknesses && (
                  <div>
                    <h3 className="text-white text-xl mb-3">Weaknesses</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line">{ability.weaknesses}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classification">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Classification</CardTitle>
                <CardDescription className="text-[#a0a0a0]">Your custom classification system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
                {ability.rating && <p><strong className="text-white">Rating:</strong> {ability.rating}</p>}
                {ability.abilityType && <p><strong className="text-white">Type:</strong> {ability.abilityType}</p>}
                {ability.abilityClass && <p><strong className="text-white">Class:</strong> {ability.abilityClass}</p>}
                {!ability.rating && !ability.abilityType && !ability.abilityClass && (
                  <p>No classification data provided.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8">
          <Button className="deltarune-button text-white">
            EDIT ABILITY
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