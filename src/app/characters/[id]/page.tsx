"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

async function fetchCharacter(id: string) {
  const response = await fetch(`/api/characters/${id}`);
  if (!response.ok) throw new Error('Failed to fetch character');
  return response.json();
}

async function fetchTags() {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

async function fetchCharacterTags(id: string) {
  const response = await fetch(`/api/characters/${id}/tags`);
  if (!response.ok) throw new Error('Failed to fetch character tags');
  return response.json();
}

async function addTagToCharacter(characterId: string, tagId: string) {
  const response = await fetch(`/api/characters/${characterId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId }),
  });
  if (!response.ok) throw new Error('Failed to add tag');
  return response.json();
}

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState('');

  useEffect(() => {
    params.then(p => setCharacterId(p.id));
  }, [params]);

  const { data: character, isLoading, error } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => characterId ? fetchCharacter(characterId) : Promise.reject('No ID'),
    enabled: !!characterId,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const { data: characterTags, refetch: refetchCharacterTags } = useQuery({
    queryKey: ['characterTags', characterId],
    queryFn: () => characterId ? fetchCharacterTags(characterId) : Promise.reject('No ID'),
    enabled: !!characterId,
  });

  const addTagMutation = useMutation({
    mutationFn: (tagId: string) => addTagToCharacter(characterId!, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterTags', characterId] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsTagDialogOpen(false);
      setSelectedTagId('');
    },
  });

  const soulTraitColors: Record<string, string> = {
    'Individuality': '#ff6b6b',
    'Patience': '#4ecdc4',
    'Bravery': '#ffe66d',
    'Integrity': '#95e1d3',
    'Perseverance': '#a8e6cf',
    'Kindness': '#ffaaa5',
    'Justice': '#ffd93d',
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

  if (error || !character) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">CHARACTER NOT FOUND</div>
          <Button 
            onClick={() => router.back()}
            className="deltarune-button text-white mt-4"
          >
            ← BACK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            onClick={() => router.back()}
            className="deltarune-button text-white mb-4"
          >
            ← BACK
          </Button>
          <h1 className="text-4xl text-white mb-2 retro-glow">{character.name}</h1>
          <div className="flex gap-2 flex-wrap">
            {character.soulTrait && (
              <Badge 
                className="deltarune-badge text-white"
                style={{ 
                  backgroundColor: soulTraitColors[character.soulTrait] || '#4a4a8a',
                  borderColor: soulTraitColors[character.soulTrait] || '#4a4a8a'
                }}
              >
                {character.soulTrait}
              </Badge>
            )}
            {character.alignment && (
              <Badge className="deltarune-badge text-white" style={{ backgroundColor: '#0f3460', borderColor: '#0f3460' }}>
                {character.alignment}
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
                  <DialogTitle className="text-white">Add Tag to Character</DialogTitle>
                  <DialogDescription className="text-[#a0a0a0]">
                    Select a tag to add to this character
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
                            {tag.name}
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
            {characterTags?.map((tag: any) => (
              <Badge 
                key={tag.id}
                className="deltarune-badge text-white"
                style={{ backgroundColor: tag.color, borderColor: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {(!characterTags || characterTags.length === 0) && (
              <span className="text-[#a0a0a0] text-lg">No tags</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="deltarune-card w-full mb-6 bg-[#1a1a3a] border-[#4a4a8a]">
            <TabsTrigger value="info" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              INFO
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              BEHAVIOR
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              STATS
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              CAPABILITIES
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              EQUIPMENT
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              APPEARANCE
            </TabsTrigger>
            <TabsTrigger value="extras" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
              EXTRAS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Main Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
                {character.aliases && <p><strong className="text-white">Aliases:</strong> {character.aliases}</p>}
                {character.gender && <p><strong className="text-white">Gender:</strong> {character.gender}</p>}
                {character.age && <p><strong className="text-white">Age:</strong> {character.age}</p>}
                {character.species && <p><strong className="text-white">Species:</strong> {character.species}</p>}
                {character.groupOrganization && <p><strong className="text-white">Organization:</strong> {character.groupOrganization}</p>}
                {character.role && <p><strong className="text-white">Role:</strong> {character.role}</p>}
                {character.submitter && <p><strong className="text-white">Submitter:</strong> {character.submitter} ({character.submitterRole})</p>}
              </CardContent>
            </Card>

            {character.personality && (
              <Card className="deltarune-card mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Personality</CardTitle>
                </CardHeader>
                <CardContent className="text-[#a0a0a0] text-lg">
                  {character.personality}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="behavior">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
                {character.personality && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Personality</h3>
                    <p className="whitespace-pre-line">{character.personality}</p>
                  </div>
                )}
                {character.likes && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Likes</h3>
                    <p className="whitespace-pre-line">{character.likes}</p>
                  </div>
                )}
                {character.dislikes && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Dislikes</h3>
                    <p className="whitespace-pre-line">{character.dislikes}</p>
                  </div>
                )}
                {character.fears && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Fears</h3>
                    <p className="whitespace-pre-line">{character.fears}</p>
                  </div>
                )}
                {character.traumas && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Traumas</h3>
                    <p className="whitespace-pre-line">{character.traumas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-white text-xl mb-3">THE WHOLE</h3>
                  <div className="grid grid-cols-2 gap-4 text-[#a0a0a0] text-lg">
                    <p><strong className="text-white">HP:</strong> {character.hp || 'N/A'}</p>
                    <p><strong className="text-white">WPR:</strong> {character.wpr || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-white text-xl mb-3">THE VESSEL</h3>
                  <div className="grid grid-cols-2 gap-4 text-[#a0a0a0] text-lg">
                    <p><strong className="text-white">ATK:</strong> {character.atk || 'N/A'}</p>
                    <p><strong className="text-white">DEF:</strong> {character.def || 'N/A'}</p>
                    <p><strong className="text-white">EDR:</strong> {character.edr || 'N/A'}</p>
                    <p><strong className="text-white">SPD:</strong> {character.spd || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-white text-xl mb-3">THE SOUL</h3>
                  <div className="grid grid-cols-2 gap-4 text-[#a0a0a0] text-lg">
                    <p><strong className="text-white">LOVE:</strong> {character.love || 'N/A'}</p>
                    <p><strong className="text-white">EXP:</strong> {character.exp || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capabilities">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
                {character.mainAbility && (
                  <div>
                    <p><strong className="text-white">Main Ability:</strong> {character.mainAbility}</p>
                    {character.mainAbilityType && <p><strong className="text-white">Type:</strong> {character.mainAbilityType}</p>}
                    {character.mainAbilityDesc && <p className="mt-2">{character.mainAbilityDesc}</p>}
                  </div>
                )}
                {character.subAbilities && (
                  <div>
                    <p><strong className="text-white">Sub-Abilities:</strong></p>
                    <p>{character.subAbilities}</p>
                  </div>
                )}
                {character.weaknesses && (
                  <div>
                    <p><strong className="text-white">Weaknesses:</strong></p>
                    <p>{character.weaknesses}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Equipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#a0a0a0] text-lg">
                <div>
                  <h3 className="text-white text-xl mb-3">Weapons</h3>
                  <div className="space-y-2">
                    {character.weapon && <p><strong className="text-white">Weapon 1:</strong> {character.weapon}</p>}
                    {character.weapon2 && <p><strong className="text-white">Weapon 2:</strong> {character.weapon2}</p>}
                    {!character.weapon && !character.weapon2 && <p>No weapons equipped</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-white text-xl mb-3">Armor & Accessories</h3>
                  <div className="space-y-2">
                    {character.armor && <p><strong className="text-white">Armor:</strong> {character.armor}</p>}
                    {character.accessory1 && <p><strong className="text-white">Accessory 1:</strong> {character.accessory1}</p>}
                    {character.accessory2 && <p><strong className="text-white">Accessory 2:</strong> {character.accessory2}</p>}
                    {!character.armor && !character.accessory1 && !character.accessory2 && <p>No armor or accessories equipped</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {character.appearanceImage && (
                  <div className="w-full max-w-md mx-auto">
                    <img 
                      src={character.appearanceImage} 
                      alt={character.name}
                      className="w-full h-auto border-4 border-[#4a4a8a]"
                    />
                  </div>
                )}
                <div className="text-[#a0a0a0] text-lg space-y-2">
                  {character.height && <p><strong className="text-white">Height:</strong> {character.height}</p>}
                  {character.weight && <p><strong className="text-white">Weight:</strong> {character.weight}</p>}
                  {character.physicalOddities && <p><strong className="text-white">Physical Oddities:</strong> {character.physicalOddities}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extras">
            <Card className="deltarune-card">
              <CardHeader>
                <CardTitle className="text-white">Extras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {character.trivia && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Trivia</h3>
                    <p className="text-[#a0a0a0] text-lg whitespace-pre-line">{character.trivia}</p>
                  </div>
                )}
                {character.ost && (
                  <div>
                    <h3 className="text-white text-xl mb-2">OST (Original Soundtrack)</h3>
                    <p className="text-[#a0a0a0] text-lg whitespace-pre-line">{character.ost}</p>
                  </div>
                )}
                {character.extras && (
                  <div>
                    <h3 className="text-white text-xl mb-2">Additional Notes</h3>
                    <p className="text-[#a0a0a0] text-lg whitespace-pre-line">{character.extras}</p>
                  </div>
                )}
                {!character.trivia && !character.ost && !character.extras && (
                  <p className="text-[#a0a0a0] text-lg">No extra information</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8">
          <Button className="deltarune-button text-white">
            EDIT CHARACTER
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