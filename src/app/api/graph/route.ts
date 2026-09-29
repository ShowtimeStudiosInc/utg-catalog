import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET graph data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('type') || 'all';
    const filterTag = searchParams.get('tag') || '';

    // Fetch all entities
    const characters = await prisma.character.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const items = await prisma.item.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const abilities = await prisma.ability.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Build nodes
    const nodes = [
      ...characters.map((char) => ({
        id: char.id,
        type: 'character',
        label: char.name,
        data: {
          soulTrait: char.soulTrait,
          alignment: char.alignment,
          tags: char.tags.map(ct => ct.tag),
        },
      })),
      ...items.map((item) => ({
        id: item.id,
        type: 'item',
        label: item.name,
        data: {
          itemType: item.type,
          value: item.value,
          tags: item.tags.map(it => it.tag),
        },
      })),
      ...abilities.map((ability) => ({
        id: ability.id,
        type: 'ability',
        label: ability.name,
        data: {
          complexity: ability.complexity,
          abilityType: ability.abilityType,
          tags: ability.tags.map(at => at.tag),
        },
      })),
    ];

    // Build edges based on relationships
    const edges: {
      id: string;
      source: string;
      target: string;
      type: string;
      label: string;
    }[] = [];

    // Character to Item relationships (equipment/ownership)
    characters.forEach((char) => {
      if (char.weapon) {
        edges.push({
          id: `${char.id}-${char.weapon}`,
          source: char.id,
          target: char.weapon,
          type: 'equipment',
          label: 'weapon',
        });
      }
      if (char.weapon2) {
        edges.push({
          id: `${char.id}-${char.weapon2}`,
          source: char.id,
          target: char.weapon2,
          type: 'equipment',
          label: 'weapon2',
        });
      }
      if (char.armor) {
        edges.push({
          id: `${char.id}-${char.armor}`,
          source: char.id,
          target: char.armor,
          type: 'equipment',
          label: 'armor',
        });
      }
      if (char.accessory1) {
        edges.push({
          id: `${char.id}-${char.accessory1}`,
          source: char.id,
          target: char.accessory1,
          type: 'equipment',
          label: 'accessory1',
        });
      }
      if (char.accessory2) {
        edges.push({
          id: `${char.id}-${char.accessory2}`,
          source: char.id,
          target: char.accessory2,
          type: 'equipment',
          label: 'accessory2',
        });
      }
    });

    // Character to Ability relationships
    characters.forEach((char) => {
      if (char.mainAbility) {
        // Find ability by name (simplified approach)
        const ability = abilities.find(a => a.name === char.mainAbility);
        if (ability) {
          edges.push({
            id: `${char.id}-${ability.id}`,
            source: char.id,
            target: ability.id,
            type: 'has-ability',
            label: 'main ability',
          });
        }
      }
    });

    // Ability parent-child relationships
    abilities.forEach((ability) => {
      if (ability.parentAbility) {
        // Parse parent ability (could be JSON array or string)
        let parents: string[] = [];
        try {
          parents = JSON.parse(ability.parentAbility);
        } catch {
          parents = [ability.parentAbility];
        }

        parents.forEach((parentName) => {
          const parentAbility = abilities.find(a => a.name === parentName);
          if (parentAbility) {
            edges.push({
              id: `${parentAbility.id}-${ability.id}`,
              source: parentAbility.id,
              target: ability.id,
              type: 'parent-child',
              label: 'parent',
            });
          }
        });
      }
    });

    // Filter nodes and edges based on type and tags
    let filteredNodes = nodes;
    let filteredEdges = edges;

    if (filterType !== 'all') {
      filteredNodes = nodes.filter(node => node.type === filterType);
      filteredEdges = edges.filter(edge => 
        filteredNodes.some(n => n.id === edge.source) && 
        filteredNodes.some(n => n.id === edge.target)
      );
    }

    if (filterTag) {
      filteredNodes = nodes.filter(node => 
        node.data.tags.some((tag) => tag.name === filterTag)
      );
      filteredEdges = edges.filter(edge => 
        filteredNodes.some(n => n.id === edge.source) && 
        filteredNodes.some(n => n.id === edge.target)
      );
    }

    return NextResponse.json({
      nodes: filteredNodes,
      edges: filteredEdges,
      totalCharacters: characters.length,
      totalItems: items.length,
      totalAbilities: abilities.length,
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 });
  }
}