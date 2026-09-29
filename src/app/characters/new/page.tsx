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
import { SoulTraitIcon } from "@/components/soul-trait-icon";

export default function NewCharacterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const characterData = {
      name: formData.get('name') as string,
      aliases: formData.get('aliases') as string,
      gender: formData.get('gender') as string,
      age: formData.get('age') ? parseInt(formData.get('age') as string) : null,
      species: formData.get('species') as string,
      groupOrganization: formData.get('groupOrganization') as string,
      role: formData.get('role') as string,
      submitter: formData.get('submitter') as string,
      submitterRole: formData.get('submitterRole') as string,
      personality: formData.get('personality') as string,
      likes: formData.get('likes') as string,
      dislikes: formData.get('dislikes') as string,
      fears: formData.get('fears') as string,
      traumas: formData.get('traumas') as string,
      alignment: formData.get('alignment') as string,
      soulTrait: formData.get('soulTrait') as string,
      mainAbility: formData.get('mainAbility') as string,
      mainAbilityType: formData.get('mainAbilityType') as string,
      mainAbilityDesc: formData.get('mainAbilityDesc') as string,
      subAbilities: formData.get('subAbilities') as string,
      weaknesses: formData.get('weaknesses') as string,
      hp: formData.get('hp') ? parseInt(formData.get('hp') as string) : null,
      wpr: formData.get('wpr') ? parseInt(formData.get('wpr') as string) : null,
      atk: formData.get('atk') ? parseInt(formData.get('atk') as string) : null,
      def: formData.get('def') ? parseInt(formData.get('def') as string) : null,
      edr: formData.get('edr') ? parseInt(formData.get('edr') as string) : null,
      spd: formData.get('spd') ? parseInt(formData.get('spd') as string) : null,
      love: formData.get('love') ? parseInt(formData.get('love') as string) : null,
      exp: formData.get('exp') ? parseInt(formData.get('exp') as string) : null,
      height: formData.get('height') as string,
      weight: formData.get('weight') as string,
      physicalOddities: formData.get('physicalOddities') as string,
      appearanceImage: formData.get('appearanceImage') as string,
      trivia: formData.get('trivia') as string,
    };

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData),
      });

      if (response.ok) {
        router.push('/characters');
      } else {
        alert('Failed to create character');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Failed to create character');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/characters')}
            className="deltarune-button text-white mb-4"
          >
            ← BACK
          </Button>
          <h1 className="text-4xl text-white mb-2 retro-glow">CREATE CHARACTER</h1>
          <p className="text-[#a0a0a0] text-xl">Fill in the details for your new character</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="deltarune-card h-auto w-full flex-wrap mb-6 bg-[#1a1a3a] border-[#4a4a8a]">
              <TabsTrigger value="main" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                MAIN INFO
              </TabsTrigger>
              <TabsTrigger value="behavior" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                BEHAVIOR
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                CAPABILITIES
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                STATS
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-[#f9d71c] data-[state=active]:text-black text-white data-[state=inactive]:text-[#a0a0a0]">
                APPEARANCE
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Main Information</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Basic character details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Name *</Label>
                    <Input name="name" required className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Character name" />
                  </div>
                  <div>
                    <Label className="text-white">Aliases/Nicknames</Label>
                    <Input name="aliases" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Comma-separated aliases" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Gender</Label>
                      <Input name="gender" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Gender" />
                    </div>
                    <div>
                      <Label className="text-white">Age</Label>
                      <Input name="age" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Age" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Species</Label>
                    <Input name="species" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Species (optional)" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Group/Organization</Label>
                      <Input name="groupOrganization" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Organization" />
                    </div>
                    <div>
                      <Label className="text-white">Role</Label>
                      <Input name="role" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Role" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Submitter</Label>
                      <Input name="submitter" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Your name" />
                    </div>
                    <div>
                      <Label className="text-white">Submitter Role</Label>
                      <Input name="submitterRole" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Member/Admin/etc" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Behavior</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Personality and traits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Personality</Label>
                    <Textarea name="personality" className="deltarune-input text-white mt-1 min-h-32 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Describe their personality..." />
                  </div>
                  <div>
                    <Label className="text-white">Likes</Label>
                    <Textarea name="likes" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="What they like..." />
                  </div>
                  <div>
                    <Label className="text-white">Dislikes</Label>
                    <Textarea name="dislikes" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="What they dislike..." />
                  </div>
                  <div>
                    <Label className="text-white">Fears</Label>
                    <Textarea name="fears" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="What they fear..." />
                  </div>
                  <div>
                    <Label className="text-white">Traumas</Label>
                    <Textarea name="traumas" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Past traumas (optional)..." />
                  </div>
                  <div>
                    <Label className="text-white">Alignment</Label>
                    <Select name="alignment">
                      <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectItem value="Lawful Good" className="text-white hover:bg-[#2a2a5a]">Lawful Good</SelectItem>
                        <SelectItem value="Lawful Neutral" className="text-white hover:bg-[#2a2a5a]">Lawful Neutral</SelectItem>
                        <SelectItem value="Lawful Evil" className="text-white hover:bg-[#2a2a5a]">Lawful Evil</SelectItem>
                        <SelectItem value="Neutral Good" className="text-white hover:bg-[#2a2a5a]">Neutral Good</SelectItem>
                        <SelectItem value="True Neutral" className="text-white hover:bg-[#2a2a5a]">True Neutral</SelectItem>
                        <SelectItem value="Neutral Evil" className="text-white hover:bg-[#2a2a5a]">Neutral Evil</SelectItem>
                        <SelectItem value="Chaotic Good" className="text-white hover:bg-[#2a2a5a]">Chaotic Good</SelectItem>
                        <SelectItem value="Chaotic Neutral" className="text-white hover:bg-[#2a2a5a]">Chaotic Neutral</SelectItem>
                        <SelectItem value="Chaotic Evil" className="text-white hover:bg-[#2a2a5a]">Chaotic Evil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Capabilities</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Abilities and soul trait</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Soul Trait</Label>
                    <Select name="soulTrait">
                      <SelectTrigger className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]">
                        <SelectValue placeholder="Select soul trait" />
                      </SelectTrigger>
                      <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                        {[
                          "Individuality",
                          "Patience",
                          "Bravery",
                          "Integrity",
                          "Perseverance",
                          "Kindness",
                          "Justice",
                        ].map((trait) => (
                          <SelectItem key={trait} value={trait} className="text-white hover:bg-[#2a2a5a]">
                            <span className="inline-flex items-center gap-2">
                              <SoulTraitIcon trait={trait} size={18} decorative />
                              <span>{trait}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Main Ability</Label>
                    <Input name="mainAbility" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Main ability name" />
                  </div>
                  <div>
                    <Label className="text-white">Main Ability Type</Label>
                    <Input name="mainAbilityType" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Physical, etc." />
                  </div>
                  <div>
                    <Label className="text-white">Main Ability Description</Label>
                    <Textarea name="mainAbilityDesc" className="deltarune-input text-white mt-1 min-h-24 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Describe the main ability..." />
                  </div>
                  <div>
                    <Label className="text-white">Sub-Abilities</Label>
                    <Textarea name="subAbilities" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="List sub-abilities..." />
                  </div>
                  <div>
                    <Label className="text-white">Weaknesses</Label>
                    <Textarea name="weaknesses" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Character weaknesses..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Stats</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Character statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-white text-lg mb-3">THE WHOLE</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">HP</Label>
                        <Input name="hp" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="HP" />
                      </div>
                      <div>
                        <Label className="text-white">WPR (Willpower)</Label>
                        <Input name="wpr" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="WPR" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white text-lg mb-3">THE VESSEL</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">ATK (Attack)</Label>
                        <Input name="atk" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="ATK" />
                      </div>
                      <div>
                        <Label className="text-white">DEF (Defense)</Label>
                        <Input name="def" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="DEF" />
                      </div>
                      <div>
                        <Label className="text-white">EDR (Endurance)</Label>
                        <Input name="edr" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="EDR" />
                      </div>
                      <div>
                        <Label className="text-white">SPD (Speed)</Label>
                        <Input name="spd" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="SPD" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white text-lg mb-3">THE SOUL</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">LOVE</Label>
                        <Input name="love" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="LOVE" />
                      </div>
                      <div>
                        <Label className="text-white">EXP</Label>
                        <Input name="exp" type="number" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="EXP" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="deltarune-card">
                <CardHeader>
                  <CardTitle className="text-white">Appearance</CardTitle>
                  <CardDescription className="text-[#a0a0a0]">Physical description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Height</Label>
                      <Input name="height" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Height" />
                    </div>
                    <div>
                      <Label className="text-white">Weight</Label>
                      <Input name="weight" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Weight" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Physical Oddities</Label>
                    <Textarea name="physicalOddities" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Any unusual physical features..." />
                  </div>
                  <div>
                    <Label className="text-white">Appearance Image URL</Label>
                    <Input name="appearanceImage" className="deltarune-input text-white mt-1 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-white">Trivia</Label>
                    <Textarea name="trivia" className="deltarune-input text-white mt-1 min-h-24 bg-[#1a1a3a] border-[#4a4a8a]" placeholder="Fun facts about the character..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-8">
            <Button type="submit" disabled={loading} className="deltarune-button text-white">
              {loading ? 'CREATING...' : 'CREATE CHARACTER'}
            </Button>
            <Button 
              type="button" 
              onClick={() => router.push('/characters')}
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