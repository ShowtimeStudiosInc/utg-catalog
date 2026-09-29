import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-white mb-4 retro-glow">CATALOGER</h1>
          <p className="text-2xl text-[#a0a0a0] font-bold">RP Server Note Management System</p>
          <div className="mt-4 text-[#f9d71c] text-lg">
            <span className="soul-heart">❤️</span> Your World, Your Data <span className="soul-heart">❤️</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="deltarune-card cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">CHARACTERS</CardTitle>
              <CardDescription className="text-[#a0a0a0] text-lg">
                Manage character sheets with abilities, stats, and equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/characters">
                <Button className="w-full deltarune-button text-white">
                  VIEW CHARACTERS
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="deltarune-card cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">ITEMS</CardTitle>
              <CardDescription className="text-[#a0a0a0] text-lg">
                Track weapons, armor, and inventory with ownership chains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/items">
                <Button className="w-full deltarune-button text-white">
                  VIEW ITEMS
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="deltarune-card cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">ABILITIES</CardTitle>
              <CardDescription className="text-[#a0a0a0] text-lg">
                Define abilities with skills, passives, and complexity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/abilities">
                <Button className="w-full deltarune-button text-white">
                  VIEW ABILITIES
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="deltarune-card cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">GRAPH VIEW</CardTitle>
              <CardDescription className="text-[#a0a0a0] text-lg">
                Visualize relationships between characters, items, and abilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/graph">
                <Button className="w-full deltarune-button text-white">
                  OPEN GRAPH
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="deltarune-card cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">STATISTICS</CardTitle>
              <CardDescription className="text-[#a0a0a0] text-lg">
                View analytics on tag usage and entity distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stats">
                <Button className="w-full deltarune-button text-white">
                  VIEW STATS
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="deltarune-card cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">TAGS</CardTitle>
              <CardDescription className="text-[#a0a0a0] text-lg">
                Manage tags for categorization and color coding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tags">
                <Button className="w-full deltarune-button text-white">
                  MANAGE TAGS
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}