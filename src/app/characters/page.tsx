"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

async function fetchCharacters() {
  const response = await fetch('/api/characters');
  if (!response.ok) throw new Error('Failed to fetch characters');
  return response.json();
}

export default function CharactersPage() {
  const { data: characters, isLoading, error } = useQuery({
    queryKey: ['characters'],
    queryFn: fetchCharacters,
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ERROR LOADING CHARACTERS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl text-white mb-2 retro-glow">CHARACTERS</h1>
            <p className="text-[#a0a0a0] text-xl">Manage your roleplay characters</p>
          </div>
          <Link href="/characters/new">
            <Button className="deltarune-button text-white">
              CREATE CHARACTER
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters?.map((character: any) => (
            <Link key={character.id} href={`/characters/${character.id}`}>
              <Card className="deltarune-card cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-white text-xl">{character.name}</CardTitle>
                  <CardDescription className="text-[#a0a0a0] text-lg">
                    {character.soulTrait || 'Unknown'} • {character.alignment || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {characters?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#a0a0a0] text-2xl mb-4">NO CHARACTERS FOUND</p>
            <Link href="/characters/new">
              <Button className="deltarune-button text-white">
                CREATE YOUR FIRST CHARACTER
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}