"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CustomEmojiText } from "@/components/custom-emoji-text";

async function fetchItems() {
  const response = await fetch('/api/items');
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
}

export default function ItemsPage() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ERROR LOADING ITEMS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl text-white mb-2 retro-glow">ITEMS</h1>
            <p className="text-[#a0a0a0] text-xl">Manage weapons, armor, and inventory</p>
          </div>
          <Link href="/items/new">
            <Button className="deltarune-button text-white">
              CREATE ITEM
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((item: any) => (
            <Link key={item.id} href={`/items/${item.id}`}>
              <Card className="deltarune-card cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-white text-xl"><CustomEmojiText text={item.name} /></CardTitle>
                  <CardDescription className="text-[#a0a0a0] text-lg">
                    {item.type} • {item.value ? `${item.value} Aurum` : 'No value'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge 
                    className="deltarune-badge text-white"
                    style={{ 
                      backgroundColor: itemTypeColors[item.type] || '#4a4a8a',
                      borderColor: itemTypeColors[item.type] || '#4a4a8a'
                    }}
                  >
                    {item.type}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {items?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#a0a0a0] text-2xl mb-4">NO ITEMS FOUND</p>
            <Link href="/items/new">
              <Button className="deltarune-button text-white">
                CREATE YOUR FIRST ITEM
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
