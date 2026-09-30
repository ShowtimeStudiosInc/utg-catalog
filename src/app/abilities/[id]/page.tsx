"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagLabel } from "@/components/tag-label";
import { CustomEmojiText } from "@/components/custom-emoji-text";
import { AbilityClassificationImage, AbilityClassificationOption } from "@/components/ability-classification";
import { parseAbilityClassification } from "@/lib/ability-classification";
import { AddTagsDialog } from "@/components/add-tags-dialog";
import { RecordActions } from "@/components/record-editor";

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

async function addTagsToAbility(abilityId: string, tagIds: string[]) {
  const response = await fetch(`/api/abilities/${abilityId}/tags`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagIds }),
  });
  if (!response.ok) throw new Error('Failed to add the selected tags.');
  return response.json();
}

export default function AbilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const [abilityId, setAbilityId] = useState<string | null>(null);

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

  const { data: abilityTags } = useQuery({
    queryKey: ['abilityTags', abilityId],
    queryFn: () => abilityId ? fetchAbilityTags(abilityId) : Promise.reject('No ID'),
    enabled: !!abilityId,
  });

  const addTagMutation = useMutation({
    mutationFn: (tagIds: string[]) => addTagsToAbility(abilityId!, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abilityTags', abilityId] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
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

  const abilityTypes = parseAbilityClassification(ability.abilityType);
  const abilityClasses = parseAbilityClassification(ability.abilityClass);

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2 retro-glow"><CustomEmojiText text={ability.name} /></h1>
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
            {abilityTypes.map((value: string) => (
              <Badge key={`type-${value}`} className="deltarune-badge text-white" style={{ backgroundColor: '#0f3460', borderColor: '#0f3460' }}>
                <AbilityClassificationImage category="type" value={value} size={18} />
                {value}
              </Badge>
            ))}
            {abilityClasses.map((value: string) => (
              <Badge key={`class-${value}`} className="deltarune-badge text-white" style={{ backgroundColor: '#4ecdc4', borderColor: '#4ecdc4' }}>
                <AbilityClassificationImage category="class" value={value} size={18} />
                {value}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-xl">TAGS</h3>
            <AddTagsDialog
              entityName="Ability"
              tags={tags ?? []}
              assignedTags={abilityTags ?? []}
              onAdd={(tagIds) => addTagMutation.mutateAsync(tagIds)}
              isPending={addTagMutation.isPending}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {abilityTags?.map((tag: { id: string; color: string; name: string; emojiFilename?: string | null }) => (
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
                {ability.parentAbility && <p><strong className="text-white">Parent Ability:</strong> <CustomEmojiText text={ability.parentAbility} /></p>}
                {ability.description && <p><strong className="text-white">Description:</strong></p>}
                {ability.description && <p className="mt-2 whitespace-pre-line"><CustomEmojiText text={ability.description} /></p>}
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
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line"><CustomEmojiText text={ability.passives} /></div>
                  </div>
                )}
                {ability.skills && (
                  <div>
                    <h3 className="text-white text-xl mb-3">SKILLs</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line"><CustomEmojiText text={ability.skills} /></div>
                  </div>
                )}
                {ability.statChanges && (
                  <div>
                    <h3 className="text-white text-xl mb-3">Stat Changes</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line"><CustomEmojiText text={ability.statChanges} /></div>
                  </div>
                )}
                {ability.weaknesses && (
                  <div>
                    <h3 className="text-white text-xl mb-3">Weaknesses</h3>
                    <div className="text-[#a0a0a0] text-lg whitespace-pre-line"><CustomEmojiText text={ability.weaknesses} /></div>
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
                {ability.rating && <p className="ability-classification-line"><strong className="text-white">Rating:</strong> <AbilityClassificationOption category="rating" value={ability.rating} size={40} /></p>}
                {abilityTypes.length > 0 && <div className="ability-classification-line"><strong className="text-white">Type:</strong> <span className="ability-classification-values">{abilityTypes.map((value: string) => <AbilityClassificationOption key={value} category="type" value={value} size={40} />)}</span></div>}
                {abilityClasses.length > 0 && <div className="ability-classification-line"><strong className="text-white">Class:</strong> <span className="ability-classification-values">{abilityClasses.map((value: string) => <AbilityClassificationOption key={value} category="class" value={value} size={40} />)}</span></div>}
                {!ability.rating && abilityTypes.length === 0 && abilityClasses.length === 0 && (
                  <p>No classification data provided.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {abilityId && <RecordActions entity="abilities" id={abilityId} />}
      </div>
    </div>
  );
}
