import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseAbilityClassification } from '@/lib/ability-classification';

type EntityType = 'character' | 'item' | 'ability';
type Entity = {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  text: string[];
};
type GraphNode = {
  id: string;
  type: EntityType | 'tag';
  label: string;
  data: Record<string, unknown> & { tags: { id: string; name: string; color: string; emojiFilename: string | null }[] };
};
type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  linkId?: string;
};

function parseAliases(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((alias): alias is string => typeof alias === 'string') : [];
  } catch {
    return value.split(',').map((alias) => alias.trim()).filter(Boolean);
  }
}

function resolveName(value: string, byId: Map<string, Entity>, byName: Map<string, Entity | null>) {
  const trimmed = value.trim();
  if (byId.has(trimmed)) return byId.get(trimmed);
  return byName.get(trimmed.toLocaleLowerCase());
}

function parseParentNames(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((name): name is string => typeof name === 'string');
  } catch {
    // Existing records may store a single parent as plain text.
  }
  return [value];
}

function createEdgeId(...parts: string[]) {
  return parts.map((part) => encodeURIComponent(part)).join(':');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('type') || 'all';
    const filterTag = searchParams.get('tag') || '';

    const [characters, items, abilities, savedLinks] = await Promise.all([
      prisma.character.findMany({ include: { tags: { include: { tag: true } } } }),
      prisma.item.findMany({ include: { tags: { include: { tag: true } } } }),
      prisma.ability.findMany({ include: { tags: { include: { tag: true } } } }),
      prisma.entityLink.findMany(),
    ]);

    const entities: Entity[] = [
      ...characters.map((record) => ({
        id: record.id,
        type: 'character' as const,
        name: record.name,
        aliases: parseAliases(record.aliases),
        text: Object.values(record).filter((value): value is string => typeof value === 'string'),
      })),
      ...items.map((record) => ({
        id: record.id,
        type: 'item' as const,
        name: record.name,
        aliases: [],
        text: Object.values(record).filter((value): value is string => typeof value === 'string'),
      })),
      ...abilities.map((record) => ({
        id: record.id,
        type: 'ability' as const,
        name: record.name,
        aliases: [],
        text: Object.values(record).filter((value): value is string => typeof value === 'string'),
      })),
    ];
    const byId = new Map(entities.map((entity) => [entity.id, entity]));
    const byName = new Map<string, Entity | null>();
    for (const entity of entities) {
      for (const name of [entity.name, ...entity.aliases]) {
        const key = name.trim().toLocaleLowerCase();
        if (!key) continue;
        const existing = byName.get(key);
        if (!byName.has(key)) byName.set(key, entity);
        else if (existing && existing.id !== entity.id) byName.set(key, null);
      }
    }

    const tagRecords = new Map<string, { id: string; name: string; color: string; emojiFilename: string | null }>();
    const tagsForEntity = new Map<string, { id: string; name: string; color: string; emojiFilename: string | null }[]>();
    for (const record of characters) tagsForEntity.set(record.id, record.tags.map(({ tag }) => tag));
    for (const record of items) tagsForEntity.set(record.id, record.tags.map(({ tag }) => tag));
    for (const record of abilities) tagsForEntity.set(record.id, record.tags.map(({ tag }) => tag));
    for (const tags of tagsForEntity.values()) for (const tag of tags) tagRecords.set(tag.id, tag);

    const nodes: GraphNode[] = [
      ...characters.map((record) => ({
        id: record.id,
        type: 'character' as const,
        label: record.name,
        data: { soulTrait: record.soulTrait, alignment: record.alignment, tags: tagsForEntity.get(record.id) ?? [] },
      })),
      ...items.map((record) => ({
        id: record.id,
        type: 'item' as const,
        label: record.name,
        data: { itemType: record.type, value: record.value, tags: tagsForEntity.get(record.id) ?? [] },
      })),
      ...abilities.map((record) => ({
        id: record.id,
        type: 'ability' as const,
        label: record.name,
        data: { complexity: record.complexity, abilityType: parseAbilityClassification(record.abilityType).join(', '), tags: tagsForEntity.get(record.id) ?? [] },
      })),
      ...[...tagRecords.values()].map((tag) => ({
        id: `tag:${tag.id}`,
        type: 'tag' as const,
        label: `#${tag.name}`,
        data: { tagColor: tag.color, emojiFilename: tag.emojiFilename, tags: [tag] },
      })),
    ];

    const edges: GraphEdge[] = [];
    const pushEdge = (edge: GraphEdge) => {
      if (edge.source !== edge.target && byId.has(edge.source) && byId.has(edge.target)) edges.push(edge);
    };

    for (const character of characters) {
      const equipment: [string, string | null][] = [
        ['weapon', character.weapon], ['weapon 2', character.weapon2], ['armor', character.armor],
        ['accessory 1', character.accessory1], ['accessory 2', character.accessory2],
      ];
      for (const [label, reference] of equipment) {
        const item = reference ? resolveName(reference, byId, byName) : null;
        if (item?.type === 'item') pushEdge({ id: createEdgeId('equipment', character.id, label, item.id), source: character.id, target: item.id, type: 'equipment', label });
      }
      const mainAbility = character.mainAbility ? resolveName(character.mainAbility, byId, byName) : null;
      if (mainAbility?.type === 'ability') pushEdge({ id: createEdgeId('main-ability', character.id, mainAbility.id), source: character.id, target: mainAbility.id, type: 'has-ability', label: 'main ability' });
    }

    for (const item of items) {
      for (const [label, reference] of [['original owner', item.originalOwner], ['current owner', item.currentOwner]] as const) {
        const owner = reference ? resolveName(reference, byId, byName) : null;
        if (owner?.type === 'character') pushEdge({ id: createEdgeId('owner', item.id, label, owner.id), source: item.id, target: owner.id, type: 'ownership', label });
      }
    }

    for (const ability of abilities) {
      if (!ability.parentAbility) continue;
      for (const parentName of parseParentNames(ability.parentAbility)) {
        const parent = resolveName(parentName, byId, byName);
        if (parent?.type === 'ability') pushEdge({ id: createEdgeId('parent', parent.id, ability.id), source: parent.id, target: ability.id, type: 'parent-child', label: 'parent' });
      }
    }

    const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
    for (const entity of entities) {
      const seenTargets = new Set<string>();
      for (const text of entity.text) {
        for (const match of text.matchAll(wikiLinkPattern)) {
          const targetName = (match[1] ?? '').split('|', 1)[0].split('#', 1)[0];
          const target = resolveName(targetName, byId, byName);
          if (!target || target.id === entity.id || seenTargets.has(target.id)) continue;
          seenTargets.add(target.id);
          pushEdge({ id: createEdgeId('wiki', entity.type, entity.id, target.type, target.id), source: entity.id, target: target.id, type: 'wiki-link', label: 'links to' });
        }
      }
    }

    for (const link of savedLinks) {
      const source = byId.get(link.sourceId);
      const target = byId.get(link.targetId);
      if (source?.type !== link.sourceType || target?.type !== link.targetType) continue;
      pushEdge({ id: createEdgeId('saved', link.id), source: source.id, target: target.id, type: 'saved-link', label: 'linked', linkId: link.id });
    }

    for (const [entityId, tags] of tagsForEntity) {
      for (const tag of tags) edges.push({
        id: createEdgeId('tag', tag.id, entityId),
        source: `tag:${tag.id}`,
        target: entityId,
        type: 'tag',
        label: 'tagged',
      });
    }

    const selectedTag = filterTag ? [...tagRecords.values()].find((tag) => tag.name === filterTag) : null;
    const filteredNodes = nodes.filter((node) => {
      const matchesType = filterType === 'all' || node.type === filterType;
      const matchesTag = !filterTag || node.id === (selectedTag ? `tag:${selectedTag.id}` : '') || node.data.tags.some((tag) => tag.name === filterTag);
      return matchesType && matchesTag;
    });
    const visibleNodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredEdges = edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));

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
