"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      value: formData.get('value') ? parseFloat(formData.get('value') as string) : null,
      originalOwner: formData.get('originalOwner') as string,
      currentOwner: formData.get('currentOwner') as string,
      atk: formData.get('atk') as string,
      hitCount: formData.get('hitCount') ? parseInt(formData.get('hitCount') as string) : null,
      def: formData.get('def') as string,
      defendEfficiency: formData.get('defendEfficiency') ? parseFloat(formData.get('defendEfficiency') as string) : null,
      spd: formData.get('spd') ? parseInt(formData.get('spd') as string) : null,
      range: formData.get('range') as string,
      weight: formData.get('weight') as string,
      physicalDamages: formData.get('physicalDamages') as string,
      appearanceImage: formData.get('appearanceImage') as string,
    };

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        router.push('/items');
      } else {
        alert('Failed to create item');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/items')}
            className="deltarune-button text-white mb-4"
          >
            ← BACK
          </Button>
          <h1 className="text-4xl text-white mb-2 retro-glow">CREATE ITEM</h1>
          <p className="text-[#a0a0a0] text-xl">Fill in the details for your new item</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white">Main Information</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Basic item details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Name *</Label>
                <Input name="name" required className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Item name" />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea name="description" className="deltarune-input text-white mt-1 min-h-24 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Describe the item..." />
              </div>
              <div>
                <Label className="text-white">Type *</Label>
                <Select name="type" required>
                  <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                    <SelectItem value="Weapon" className="text-white hover:bg-[#2a2a5a]">Weapon</SelectItem>
                    <SelectItem value="Shield" className="text-white hover:bg-[#2a2a5a]">Shield</SelectItem>
                    <SelectItem value="Armor" className="text-white hover:bg-[#2a2a5a]">Armor</SelectItem>
                    <SelectItem value="Accessory" className="text-white hover:bg-[#2a2a5a]">Accessory</SelectItem>
                    <SelectItem value="Consumable" className="text-white hover:bg-[#2a2a5a]">Consumable</SelectItem>
                    <SelectItem value="Miscellaneous" className="text-white hover:bg-[#2a2a5a]">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Value (Aurum)</Label>
                <Input name="value" type="number" step="0.01" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Item value" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Original Owner</Label>
                  <Input name="originalOwner" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Character ID" />
                </div>
                <div>
                  <Label className="text-white">Current Owner</Label>
                  <Input name="currentOwner" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Character ID" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="deltarune-card mt-6">
            <CardHeader>
              <CardTitle className="text-white">Stats</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Item statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">ATK</Label>
                <Input name="atk" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="ATK value or multiplier" />
              </div>
              <div>
                <Label className="text-white">Hit Count</Label>
                <Input name="hitCount" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Hit count" />
              </div>
              <div>
                <Label className="text-white">DEF</Label>
                <Input name="def" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="DEF value or multiplier" />
              </div>
              <div>
                <Label className="text-white">Defend Efficiency (max 4x)</Label>
                <Input name="defendEfficiency" type="number" step="0.1" max="4" min="0" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Defend efficiency" />
              </div>
              <div>
                <Label className="text-white">SPD</Label>
                <Input name="spd" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="SPD value" />
              </div>
            </CardContent>
          </Card>

          <Card className="deltarune-card mt-6">
            <CardHeader>
              <CardTitle className="text-white">Physical Properties</CardTitle>
              <CardDescription className="text-[#a0a0a0]">Physical characteristics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Range</Label>
                <Input name="range" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Attack range" />
              </div>
              <div>
                <Label className="text-white">Weight</Label>
                <Input name="weight" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Item weight" />
              </div>
              <div>
                <Label className="text-white">Physical Damages</Label>
                <Textarea name="physicalDamages" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Any damage or wear..." />
              </div>
              <div>
                <Label className="text-white">Appearance Image URL</Label>
                <Input name="appearanceImage" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-8">
            <Button type="submit" disabled={loading} className="deltarune-button text-white">
              {loading ? 'CREATING...' : 'CREATE ITEM'}
            </Button>
            <Button 
              type="button" 
              onClick={() => router.push('/items')}
              className="deltarune-button text-white"
              style={{ backgroundColor: '#e94560' }}
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}