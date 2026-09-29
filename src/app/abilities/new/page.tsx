"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewAbilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const abilityData = {
      name: formData.get('name') as string,
      parentAbility: formData.get('parentAbility') as string,
      description: formData.get('description') as string,
      complexity: formData.get('complexity') as string,
      passives: formData.get('passives') as string,
      skills: formData.get('skills') as string,
      statChanges: formData.get('statChanges') as string,
      weaknesses: formData.get('weaknesses') as string,
      rating: formData.get('rating') as string,
      abilityType: formData.get('abilityType') as string,
      abilityClass: formData.get('abilityClass') as string,
    };

    try {
      const response = await fetch('/api/abilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abilityData),
      });

      if (response.ok) {
        router.push('/abilities');
      } else {
        alert('Failed to create ability');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating ability:', error);
      alert('Failed to create ability');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/abilities')}
            className="deltarune-button text-white mb-4"
          >
            ← BACK
          </Button>
          <h1 className="text-4xl text-white mb-2 retro-glow">CREATE ABILITY</h1>
          <p className="text-[#a0a0a0] text-xl">Fill in the details for your new ability</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="deltarune-card h-auto w-full flex-wrap mb-6 bg-[#1a1a3a] border-[#4a4a8a]">
              <TabsTrigger value="main" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                MAIN INFO
              </TabsTrigger>
              <TabsTrigger value="components" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                COMPONENTS
              </TabsTrigger>
              <TabsTrigger value="classification" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                CLASSIFICATION
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Main Information</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Basic ability details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Name *</Label>
                    <Input name="name" required className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Ability name" />
                  </div>
                  <div>
                    <Label className="text-white">Parent Ability</Label>
                    <Input name="parentAbility" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Parent ability name" />
                  </div>
                  <div>
                    <Label className="text-white">Description</Label>
                    <Textarea name="description" className="deltarune-input text-white mt-1 min-h-32 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Describe the ability..." />
                  </div>
                  <div>
                    <Label className="text-white">Complexity</Label>
                    <Select name="complexity">
                      <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectItem value="Basic" className="text-white hover:bg-[#2a2a5a]">Basic</SelectItem>
                        <SelectItem value="Intermediate" className="text-white hover:bg-[#2a2a5a]">Intermediate</SelectItem>
                        <SelectItem value="Advanced" className="text-white hover:bg-[#2a2a5a]">Advanced</SelectItem>
                        <SelectItem value="Complex" className="text-white hover:bg-[#2a2a5a]">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Components</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Ability components and effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Passives</Label>
                    <Textarea name="passives" className="deltarune-input text-white mt-1 min-h-24 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="List passive effects..." />
                  </div>
                  <div>
                    <Label className="text-white">SKILLs</Label>
                    <Textarea name="skills" className="deltarune-input text-white mt-1 min-h-24 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="List skills with TP costs..." />
                  </div>
                  <div>
                    <Label className="text-white">Stat Changes</Label>
                    <Textarea name="statChanges" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="List stat modifiers..." />
                  </div>
                  <div>
                    <Label className="text-white">Weaknesses</Label>
                    <Textarea name="weaknesses" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="List ability weaknesses..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classification">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Classification (Optional)</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Your custom classification system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Rating</Label>
                    <Select name="rating">
                      <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectItem value="Limited" className="text-white hover:bg-[#2a2a5a]">Limited</SelectItem>
                        <SelectItem value="Minor" className="text-white hover:bg-[#2a2a5a]">Minor</SelectItem>
                        <SelectItem value="Base" className="text-white hover:bg-[#2a2a5a]">Base</SelectItem>
                        <SelectItem value="Enhanced" className="text-white hover:bg-[#2a2a5a]">Enhanced</SelectItem>
                        <SelectItem value="Advanced" className="text-white hover:bg-[#2a2a5a]">Advanced</SelectItem>
                        <SelectItem value="Perfect" className="text-white hover:bg-[#2a2a5a]">Perfect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Ability Type</Label>
                    <Select name="abilityType">
                      <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectItem value="Offensive" className="text-white hover:bg-[#2a2a5a]">Offensive</SelectItem>
                        <SelectItem value="Defensive" className="text-white hover:bg-[#2a2a5a]">Defensive</SelectItem>
                        <SelectItem value="Buffing" className="text-white hover:bg-[#2a2a5a]">Buffing</SelectItem>
                        <SelectItem value="Debuffing" className="text-white hover:bg-[#2a2a5a]">Debuffing</SelectItem>
                        <SelectItem value="Mobility" className="text-white hover:bg-[#2a2a5a]">Mobility</SelectItem>
                        <SelectItem value="Utility" className="text-white hover:bg-[#2a2a5a]">Utility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Ability Class</Label>
                    <Select name="abilityClass">
                      <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectItem value="Physical" className="text-white hover:bg-[#2a2a5a]">Physical</SelectItem>
                        <SelectItem value="Summoning" className="text-white hover:bg-[#2a2a5a]">Summoning</SelectItem>
                        <SelectItem value="Visions" className="text-white hover:bg-[#2a2a5a]">Visions</SelectItem>
                        <SelectItem value="Shapeshifting" className="text-white hover:bg-[#2a2a5a]">Shapeshifting</SelectItem>
                        <SelectItem value="Enchantments" className="text-white hover:bg-[#2a2a5a]">Enchantments</SelectItem>
                        <SelectItem value="Alteration" className="text-white hover:bg-[#2a2a5a]">Alteration</SelectItem>
                        <SelectItem value="Entropy" className="text-white hover:bg-[#2a2a5a]">Entropy</SelectItem>
                        <SelectItem value="Elements" className="text-white hover:bg-[#2a2a5a]">Elements</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-8">
            <Button type="submit" disabled={loading} className="deltarune-button text-white">
              {loading ? 'CREATING...' : 'CREATE ABILITY'}
            </Button>
            <Button 
              type="button" 
              onClick={() => router.push('/abilities')}
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