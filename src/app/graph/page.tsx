"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TagLabel } from "@/components/tag-label";
import { CustomEmojiText } from "@/components/custom-emoji-text";
import { SoulTraitIcon } from "@/components/soul-trait-icon";
import { CharacterYoutubePlayer } from "@/components/character-youtube-player";

type GraphApiNode = {
  id: string;
  type: 'character' | 'item' | 'ability' | 'tag';
  label: string;
  data: {
    soulTrait?: string | null;
    itemType?: string;
    complexity?: string | null;
    tagColor?: string;
    tags: { id: string; name: string; color: string; emojiFilename?: string | null }[];
  };
};

type GraphApiEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  linkId?: string;
};

type GraphResponse = {
  nodes: GraphApiNode[];
  edges: GraphApiEdge[];
  totalCharacters: number;
  totalItems: number;
  totalAbilities: number;
};

type TagOption = { id: string; name: string; color: string; emojiFilename: string | null };
type FlowNode = Node<GraphApiNode, 'custom'>;
type FlowEdge = Edge<{ linkId?: string }>;
type LinkInput = { sourceId: string; sourceType: string; targetId: string; targetType: string };

type CharacterProfile = Record<string, any> & {
  id: string;
  name: string;
  tags?: { tag: { id: string; name: string; color: string; emojiFilename?: string | null } }[];
};

const PROFILE_SECTIONS = [
  { id: 'info', label: 'INFO' },
  { id: 'behavior', label: 'BEHAVIOR' },
  { id: 'capabilities', label: 'POWER' },
  { id: 'equipment', label: 'EQUIP' },
  { id: 'appearance', label: 'LOOK' },
  { id: 'extras', label: 'EXTRAS' },
  { id: 'tags', label: 'TAGS' },
] as const;

function parseProfileValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || !['[', '{'].includes(trimmed[0])) return value;
  try { return JSON.parse(trimmed); } catch { return value; }
}

function ProfileField({ label, value }: { label: string; value: unknown }) {
  const parsed = parseProfileValue(value);
  if (parsed === null || parsed === undefined || parsed === '') return null;
  const display = Array.isArray(parsed)
    ? parsed.map((entry) => typeof entry === 'object' && entry !== null ? Object.values(entry).filter(Boolean).join(' — ') : String(entry)).join('\n')
    : typeof parsed === 'object' ? Object.values(parsed as Record<string, unknown>).filter(Boolean).join(' — ') : String(parsed);
  if (!display) return null;
  return <div className="graph-profile-field"><h3>{label}</h3><p><CustomEmojiText text={display} /></p></div>;
}

function CharacterProfilePanel({ character, loading, error, section, onSectionChange, onClose, onOpenRecord }: {
  character?: CharacterProfile;
  loading: boolean;
  error: boolean;
  section: typeof PROFILE_SECTIONS[number]['id'];
  onSectionChange: (section: typeof PROFILE_SECTIONS[number]['id']) => void;
  onClose: () => void;
  onOpenRecord: (id: string) => void;
}) {
  const sectionTitle = PROFILE_SECTIONS.find((entry) => entry.id === section)?.label ?? 'INFO';
  const rows: Record<typeof section, [string, unknown][]> = {
    info: [['Aliases', character?.aliases], ['Gender', character?.gender], ['Age', character?.age], ['Species', character?.species], ['Organization', character?.groupOrganization], ['Role', character?.role], ['Submitter', character?.submitter], ['Submitter role', character?.submitterRole], ['Alignment', character?.alignment], ['Soul trait', character?.soulTrait]],
    behavior: [['Personality', character?.personality], ['Likes', character?.likes], ['Dislikes', character?.dislikes], ['Fears', character?.fears], ['Traumas', character?.traumas], ['Psychological oddities', character?.psychologicalOddities], ['Sexuality', character?.sexuality]],
    capabilities: [['Main ability', character?.mainAbility], ['Ability type', character?.mainAbilityType], ['Ability details', character?.mainAbilityDesc], ['Sub-abilities', character?.subAbilities], ['Sub-ability details', character?.subAbilityDescs], ['Weaknesses', character?.weaknesses], ['HP', character?.hp], ['WPR', character?.wpr], ['ATK', character?.atk], ['DEF', character?.def], ['EDR', character?.edr], ['SPD', character?.spd], ['LOVE', character?.love], ['EXP', character?.exp]],
    equipment: [['Weapon', character?.weapon], ['Second weapon', character?.weapon2], ['Armor', character?.armor], ['Accessory 1', character?.accessory1], ['Accessory 2', character?.accessory2]],
    appearance: [['Height', character?.height], ['Weight', character?.weight], ['Physical oddities', character?.physicalOddities]],
    extras: [['Trivia', character?.trivia], ['OST', character?.ost], ['Additional notes', character?.extras]],
    tags: [],
  };
  const visibleRows = rows[section].filter(([, value]) => value !== null && value !== undefined && value !== '');
  return (
    <section className="graph-profile" role="dialog" aria-modal="false" aria-labelledby="graph-profile-title">
      <div className="graph-profile-topline"><span>STATUS — CHARACTER FILE</span><button type="button" className="graph-profile-close" onClick={onClose} aria-label="Close character profile">×</button></div>
      {loading ? <div className="graph-profile-state" role="status">OPENING FILE…</div> : error || !character ? <div className="graph-profile-state" role="alert">COULD NOT OPEN CHARACTER FILE.</div> : <>
        <header className="graph-profile-heading">
          {character.appearanceImage && <img className="graph-profile-portrait" src={character.appearanceImage} alt="" />}
          <div><p className="graph-profile-kicker">CHARACTER RECORD</p><h2 id="graph-profile-title"><CustomEmojiText text={character.name} /></h2><p className="graph-profile-subtitle">A saved entry from the lore archive</p></div>
          <button type="button" className="graph-profile-detail-link" onClick={() => onOpenRecord(character.id)}>OPEN FULL RECORD ↗</button>
        </header>
        <div className="graph-profile-audio"><CharacterYoutubePlayer youtubeLinks={character.youtubeLinks} characterName={character.name} /></div>
        <div className="graph-profile-layout">
          <nav className="graph-profile-menu" aria-label="Character profile sections">
            {PROFILE_SECTIONS.map((entry) => <button key={entry.id} type="button" id={`profile-tab-${entry.id}`} aria-current={section === entry.id ? 'page' : undefined} onClick={() => onSectionChange(entry.id)}>{entry.label}</button>)}
          </nav>
          <section className="graph-profile-content" id="graph-profile-content" aria-labelledby={`profile-tab-${section}`} tabIndex={0}>
            <div className="graph-profile-section-title"><span>{sectionTitle}</span><i /></div>
            {section === 'tags' ? (character.tags?.length ? <div className="graph-profile-tags">{character.tags.map(({ tag }) => <span className="graph-profile-tag" key={tag.id} style={{ borderColor: tag.color, color: tag.color }}>{tag.emojiFilename && <img src={`/api/emojis/${encodeURIComponent(tag.emojiFilename)}`} alt="" />} {tag.name}</span>)}</div> : <p className="graph-profile-empty">NO TAGS ASSIGNED</p>) : <>
              {section === 'appearance' && character.appearanceImage && <img className="graph-profile-appearance" src={character.appearanceImage} alt={`${character.name} appearance`} />}
              {visibleRows.map(([label, value]) => <ProfileField key={label} label={label} value={value} />)}
              {visibleRows.length === 0 && !(section === 'appearance' && character.appearanceImage) && <p className="graph-profile-empty">NO {sectionTitle} DATA YET</p>}
            </>}
          </section>
        </div>
      </>}
    </section>
  );
}

async function fetchCharacterProfile(id: string): Promise<CharacterProfile> {
  const response = await fetch(`/api/characters/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Could not load this character');
  return response.json();
}

async function fetchGraphData(type?: string, tag?: string): Promise<GraphResponse> {
  const params = new URLSearchParams();
  if (type && type !== 'all') params.append('type', type);
  if (tag) params.append('tag', tag);
  const response = await fetch(`/api/graph?${params}`);
  if (!response.ok) throw new Error('Failed to fetch graph data');
  return response.json();
}

async function fetchTags(): Promise<TagOption[]> {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

async function saveGraphLink(link: LinkInput) {
  const response = await fetch('/api/graph/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(link),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Could not save the link');
  return body;
}

async function deleteGraphLink(id: string) {
  const response = await fetch(`/api/graph/links/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Could not delete the link');
}

function layoutGraph(nodes: GraphApiNode[], edges: GraphApiEdge[]) {
  if (nodes.length > 250) {
    return new Map(nodes.map((node, index) => [node.id, { x: (index % 10) * 210, y: Math.floor(index / 10) * 140 }]));
  }

  const count = nodes.length;
  const radius = Math.max(180, Math.sqrt(count) * 105);
  const points = nodes.map((_, index) => {
    const angle = (index / Math.max(count, 1)) * Math.PI * 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, vx: 0, vy: 0 };
  });
  const indices = new Map(nodes.map((node, index) => [node.id, index]));
  const links = edges.flatMap((edge) => {
    const source = indices.get(edge.source);
    const target = indices.get(edge.target);
    return source === undefined || target === undefined ? [] : [{ source, target }];
  });

  for (let iteration = 0; iteration < 90; iteration += 1) {
    const cooling = 1 - iteration / 90;
    for (let left = 0; left < count; left += 1) {
      for (let right = left + 1; right < count; right += 1) {
        const dx = points[left].x - points[right].x;
        const dy = points[left].y - points[right].y;
        const distanceSquared = Math.max(dx * dx + dy * dy, 64);
        const force = (7000 / distanceSquared) * cooling;
        const pushX = (dx / Math.sqrt(distanceSquared)) * force;
        const pushY = (dy / Math.sqrt(distanceSquared)) * force;
        points[left].vx += pushX;
        points[left].vy += pushY;
        points[right].vx -= pushX;
        points[right].vy -= pushY;
      }
    }
    for (const link of links) {
      const source = points[link.source];
      const target = points[link.target];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const force = (distance - 190) * 0.018 * cooling;
      const pullX = (dx / distance) * force;
      const pullY = (dy / distance) * force;
      source.vx += pullX;
      source.vy += pullY;
      target.vx -= pullX;
      target.vy -= pullY;
    }
    for (const point of points) {
      point.vx = (point.vx - point.x * 0.0015) * 0.82;
      point.vy = (point.vy - point.y * 0.0015) * 0.82;
      point.x += point.vx;
      point.y += point.vy;
    }
  }

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  return new Map(nodes.map((node, index) => [node.id, { x: points[index].x - minX + 80, y: points[index].y - minY + 80 }]));
}

const CustomNode = ({ data }: NodeProps<FlowNode>) => {
  const color = data.type === 'tag' ? data.data.tagColor ?? '#ffffff' : ({
    character: '#e94560', item: '#4ecdc4', ability: '#ffd93d',
  }[data.type]);

  return (
    <div className="graph-node px-4 py-2 min-w-[120px]" style={data.type === 'tag' ? { borderColor: color } : undefined}>
      {data.type !== 'tag' && <Handle type="target" position={Position.Top} />}
      <div className="font-bold text-white text-sm"><CustomEmojiText text={data.label} /></div>
      <div className="flex gap-1 mt-1 flex-wrap">
        {data.type !== 'tag' && <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: color, borderColor: color }}>{data.type}</Badge>}
        {data.data.soulTrait && <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: '#ff6b6b', borderColor: '#ff6b6b' }}><span className="inline-flex items-center gap-1.5"><SoulTraitIcon trait={data.data.soulTrait} size={14} decorative /><span>{data.data.soulTrait}</span></span></Badge>}
        {data.data.itemType && <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: '#4ecdc4', borderColor: '#4ecdc4' }}>{data.data.itemType}</Badge>}
        {data.data.complexity && <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: '#95e1d3', borderColor: '#95e1d3' }}>{data.data.complexity}</Badge>}
        {data.type === 'tag' && <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: color, borderColor: color }}>TAG</Badge>}
      </div>
      {data.type !== 'tag' && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
};

export default function GraphPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');
  const [filterTag, setFilterTag] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [profileSection, setProfileSection] = useState<typeof PROFILE_SECTIONS[number]['id']>('info');
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);

  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ['graph', filterType, filterTag],
    queryFn: () => fetchGraphData(filterType, filterTag),
  });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });
  const { data: selectedCharacter, isLoading: isCharacterLoading, isError: isCharacterError } = useQuery({
    queryKey: ['graph-character-profile', selectedCharacterId],
    queryFn: () => fetchCharacterProfile(selectedCharacterId!),
    enabled: Boolean(selectedCharacterId),
  });
  const createLink = useMutation({ mutationFn: saveGraphLink, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['graph'] }) });
  const deleteLink = useMutation({ mutationFn: deleteGraphLink, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['graph'] }) });

  const { flowNodes, flowEdges } = useMemo(() => {
    if (!graphData) return { flowNodes: [], flowEdges: [] };
    const positions = layoutGraph(graphData.nodes, graphData.edges);
    return {
      flowNodes: graphData.nodes.map((node) => ({
        id: node.id,
        type: 'custom' as const,
        position: positions.get(node.id) ?? { x: 0, y: 0 },
        data: node,
      })),
      flowEdges: graphData.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        style: { stroke: '#ffffff', strokeWidth: 2 },
        animated: edge.type === 'saved-link' || edge.type === 'wiki-link',
        data: { linkId: edge.linkId },
        deletable: Boolean(edge.linkId),
      })),
    };
  }, [graphData]);

  useEffect(() => {
    if (!graphData) return;
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, flowNodes, flowEdges, setNodes, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    const source = graphData?.nodes.find((node) => node.id === connection.source);
    const target = graphData?.nodes.find((node) => node.id === connection.target);
    if (!source || !target || source.type === 'tag' || target.type === 'tag') return;
    if (graphData?.edges.some((edge) => edge.source === source.id && edge.target === target.id)) return;
    createLink.mutate({ sourceId: source.id, sourceType: source.type, targetId: target.id, targetType: target.type });
  }, [createLink, graphData]);

  const onEdgesDelete = useCallback((removed: FlowEdge[]) => {
    for (const edge of removed) if (edge.data?.linkId) deleteLink.mutate(edge.data.linkId);
  }, [deleteLink]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: FlowNode) => {
    if (node.data.type === 'tag') {
      setFilterTag(node.data.data.tags[0]?.name ?? '');
      return;
    }
    if (node.data.type === 'character') {
      setProfileSection('info');
      setSelectedCharacterId(node.id);
      return;
    }
    const route = node.data.type === 'ability' ? 'abilities' : `${node.data.type}s`;
    router.push(`/${route}/${node.id}`);
  }, [router]);

  useEffect(() => {
    if (!selectedCharacterId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCharacterId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCharacterId]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  if (isLoading) return <div className="page-state">LOADING GRAPH...</div>;
  if (error) return <div className="page-state" data-state="error">ERROR LOADING GRAPH</div>;

  return (
    <div className="min-h-screen pixel-border">
      <div className="h-screen flex flex-col">
        <div className="graph-toolbar p-4">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl text-white retro-glow">GRAPH VIEW</h1>
              <p className="text-[#a0a0a0] text-sm">{graphData?.totalCharacters || 0} Characters · {graphData?.totalItems || 0} Items · {graphData?.totalAbilities || 0} Abilities</p>
              <p className="text-[#a0a0a0] text-xs">Drag between entries to save a link. Click a character to open its file; click items or abilities for their full pages, and tags to filter.</p>
              <p className="text-[#a0a0a0] text-xs">Type [[Entry name]] in an entry’s text to create a name link. Character aliases also work.</p>
              {createLink.isError && <p role="alert" className="text-[#ff8792] text-xs">{createLink.error.message}</p>}
            </div>
            <div className="flex w-full flex-wrap gap-2 lg:w-auto">
              <Select value={filterType} onValueChange={(value) => setFilterType(value ?? 'all')}>
                <SelectTrigger className="deltarune-input text-white bg-[#1a1a3a] border-[#4a4a8a] w-full sm:w-40"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="character" className="text-white">Characters</SelectItem>
                  <SelectItem value="item" className="text-white">Items</SelectItem>
                  <SelectItem value="ability" className="text-white">Abilities</SelectItem>
                  <SelectItem value="tag" className="text-white">Tags</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTag} onValueChange={(value) => setFilterTag(value ?? '')}>
                <SelectTrigger className="deltarune-input text-white bg-[#1a1a3a] border-[#4a4a8a] w-full sm:w-40"><SelectValue placeholder="Filter by tag" /></SelectTrigger>
                <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                  <SelectItem value="" className="text-white">All Tags</SelectItem>
                  {tags?.map((tag) => <SelectItem key={tag.id} value={tag.name} className="text-white"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: tag.color }} /><TagLabel name={tag.name} emojiFilename={tag.emojiFilename} /></div></SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => { setFilterType('all'); setFilterTag(''); }} className="deltarune-button w-full text-white sm:w-auto">CLEAR FILTERS</Button>
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            className="graph-canvas"
          >
            <Controls className="graph-controls !text-white" />
            <MiniMap className="graph-minimap" nodeColor={(node: Node<GraphApiNode>) => node.data.type === 'tag' ? '#ffffff' : ({ character: '#e94560', item: '#4ecdc4', ability: '#ffd93d' }[node.data.type])} nodeStrokeWidth={2} />
            <Background color="#1a1a3a" gap={16} />
            <Panel position="top-right" className="graph-legend-panel">
              <Card className="deltarune-card">
                <CardHeader><CardTitle className="text-white text-sm">Legend</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: '#e94560' }} /><span className="text-[#a0a0a0] text-sm">Character</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ecdc4' }} /><span className="text-[#a0a0a0] text-sm">Item</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffd93d' }} /><span className="text-[#a0a0a0] text-sm">Ability</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-white bg-black" /><span className="text-[#a0a0a0] text-sm">Tag</span></div>
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
          {selectedCharacterId && <CharacterProfilePanel character={selectedCharacter} loading={isCharacterLoading} error={isCharacterError} section={profileSection} onSectionChange={setProfileSection} onClose={() => setSelectedCharacterId(null)} onOpenRecord={(id) => router.push(`/characters/${id}`)} />}
        </div>
      </div>
    </div>
  );
}
