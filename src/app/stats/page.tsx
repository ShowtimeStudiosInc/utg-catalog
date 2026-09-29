"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagLabel } from "@/components/tag-label";

async function fetchStats() {
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

async function fetchTags() {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

export default function StatsPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#a0a0a0] text-2xl">LOADING STATISTICS...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ERROR LOADING STATISTICS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-white mb-2 retro-glow">STATISTICS</h1>
        <p className="text-[#a0a0a0] text-xl mb-8">Analytics and tag usage</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Total Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl text-white font-bold">{stats?.totalCharacters || 0}</div>
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl text-white font-bold">{stats?.totalItems || 0}</div>
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Total Abilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl text-white font-bold">{stats?.totalAbilities || 0}</div>
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Total Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl text-white font-bold">{tags?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Tag Usage</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Most used tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tags?.slice(0, 10).map((tag: any) => (
                  <div key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-[#b5bdcc]">
                        <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
                      </span>
                    </div>
                    <div className="text-white font-bold">{tag.totalCount}</div>
                  </div>
                ))}
                {(!tags || tags.length === 0) && (
                  <p className="text-[#a0a0a0]">No tags created yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Soul Trait Distribution</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Character soul traits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.soulTraitDistribution?.map((item: any) => (
                  <div key={item.trait} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.trait === "Individuality" ? (
                        <Image
                          src="/images/individuality.png"
                          alt=""
                          width={24}
                          height={24}
                          className="soul-trait-icon"
                        />
                      ) : (
                        <span className="text-xl">{item.emoji}</span>
                      )}
                      <span className="text-[#a0a0a0]">{item.trait}</span>
                    </div>
                    <div className="text-white font-bold">{item.count}</div>
                  </div>
                ))}
                {(!stats?.soulTraitDistribution || stats.soulTraitDistribution.length === 0) && (
                  <p className="text-[#a0a0a0]">No character data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Item Type Distribution</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Items by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.itemTypeDistribution?.map((item: any) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-[#a0a0a0]">{item.type}</span>
                    <div className="text-white font-bold">{item.count}</div>
                  </div>
                ))}
                {(!stats?.itemTypeDistribution || stats.itemTypeDistribution.length === 0) && (
                  <p className="text-[#a0a0a0]">No item data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Ability Complexity</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Abilities by complexity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.abilityComplexityDistribution?.map((item: any) => (
                  <div key={item.complexity} className="flex items-center justify-between">
                    <Badge 
                      className="deltarune-badge text-white"
                      style={{ 
                        backgroundColor: item.color || '#4a4a8a',
                        borderColor: item.color || '#4a4a8a'
                      }}
                    >
                      {item.complexity}
                    </Badge>
                    <div className="text-white font-bold">{item.count}</div>
                  </div>
                ))}
                {(!stats?.abilityComplexityDistribution || stats.abilityComplexityDistribution.length === 0) && (
                  <p className="text-[#a0a0a0]">No ability data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}