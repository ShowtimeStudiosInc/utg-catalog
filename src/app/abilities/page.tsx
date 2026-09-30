"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CustomEmojiText } from "@/components/custom-emoji-text";
import { AbilityClassificationOption } from "@/components/ability-classification";
import { parseAbilityClassification } from "@/lib/ability-classification";

async function fetchAbilities() {
  const response = await fetch('/api/abilities');
  if (!response.ok) throw new Error('Failed to fetch abilities');
  return response.json();
}

export default function AbilitiesPage() {
  const { data: abilities, isLoading, error } = useQuery({
    queryKey: ['abilities'],
    queryFn: fetchAbilities,
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ERROR LOADING ABILITIES</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl text-white mb-2 retro-glow">ABILITIES</h1>
            <p className="text-[#a0a0a0] text-xl">Define abilities and skills</p>
          </div>
          <Link href="/abilities/new">
            <Button className="deltarune-button text-white">
              CREATE ABILITY
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {abilities?.map((ability: any) => (
            <Link key={ability.id} href={`/abilities/${ability.id}`}>
              <Card className="deltarune-card cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-white text-xl"><CustomEmojiText text={ability.name} /></CardTitle>
                  <CardDescription className="text-[#a0a0a0] text-lg">
                    {ability.complexity || 'Unknown'} • {parseAbilityClassification(ability.abilityType).join(', ') || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                    {parseAbilityClassification(ability.abilityType).map((value) => (
                      <Badge key={`type-${value}`} className="deltarune-badge text-white" style={{ backgroundColor: '#0f3460', borderColor: '#0f3460' }}>
                        <AbilityClassificationOption category="type" value={value} size={18} />
                      </Badge>
                    ))}
                    {ability.rating && <AbilityClassificationOption category="rating" value={ability.rating} size={24} />}
                    {parseAbilityClassification(ability.abilityClass).map((value) => <AbilityClassificationOption key={`class-${value}`} category="class" value={value} size={24} />)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {abilities?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#a0a0a0] text-2xl mb-4">NO ABILITIES FOUND</p>
            <Link href="/abilities/new">
              <Button className="deltarune-button text-white">
                CREATE YOUR FIRST ABILITY
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
