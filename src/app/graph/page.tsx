"use client";

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  Panel,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TagLabel } from "@/components/tag-label";

type GraphApiNode = {
  id: string;
  type: 'character' | 'item' | 'ability';
  label: string;
  data: {
    soulTrait?: string | null;
    itemType?: string;
    complexity?: string | null;
    tags: { name: string; emojiFilename?: string | null }[];
  };
};

type GraphApiEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
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

const CustomNode = ({ data }: NodeProps<FlowNode>) => {
  const nodeColors: Record<string, string> = {
    character: '#e94560',
    item: '#4ecdc4',
    ability: '#ffd93d',
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-[#1a1a3a] border-2 border-[#4a4a8a] min-w-[120px]">
      <div className="font-bold text-white text-sm">{data.label}</div>
      <div className="flex gap-1 mt-1 flex-wrap">
        <Badge 
          className="deltarune-badge text-white text-xs"
          style={{ backgroundColor: nodeColors[data.type], borderColor: nodeColors[data.type] }}
        >
          {data.type}
        </Badge>
        {data.data.soulTrait && (
          <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: '#ff6b6b', borderColor: '#ff6b6b' }}>
            {data.data.soulTrait}
          </Badge>
        )}
        {data.data.itemType && (
          <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: '#4ecdc4', borderColor: '#4ecdc4' }}>
            {data.data.itemType}
          </Badge>
        )}
        {data.data.complexity && (
          <Badge className="deltarune-badge text-white text-xs" style={{ backgroundColor: '#95e1d3', borderColor: '#95e1d3' }}>
            {data.data.complexity}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default function GraphPage() {
  const [filterType, setFilterType] = useState('all');
  const [filterTag, setFilterTag] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ['graph', filterType, filterTag],
    queryFn: () => fetchGraphData(filterType, filterTag),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  // Convert API data to React Flow format
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!graphData) return { flowNodes: [], flowEdges: [] };

    const flowNodes = graphData.nodes.map((node, index) => ({
      id: node.id,
      type: 'custom' as const,
      position: { x: (index % 5) * 180, y: Math.floor(index / 5) * 120 },
      data: node,
    }));

    const flowEdges = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      style: { stroke: '#4a4a8a', strokeWidth: 2 },
      animated: true,
    }));

    return { flowNodes, flowEdges };
  }, [graphData]);

  // Update React Flow state when data changes
  const syncGraphData = useCallback(() => {
    if (flowNodes.length > 0) {
      setNodes(flowNodes);
    }
    if (flowEdges.length > 0) {
      setEdges(flowEdges);
    }
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  // Sync when data changes
  if (graphData && (nodes.length === 0 || nodes.length !== flowNodes.length)) {
    syncGraphData();
  }

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#a0a0a0] text-2xl">LOADING GRAPH...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pixel-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#e94560] text-2xl">ERROR LOADING GRAPH</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-border">
      <div className="h-screen flex flex-col">
        <div className="bg-[#1a1a3a] border-b-2 border-[#4a4a8a] p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-white retro-glow">GRAPH VIEW</h1>
              <p className="text-[#a0a0a0] text-sm">
                {graphData?.totalCharacters || 0} Characters • {graphData?.totalItems || 0} Items • {graphData?.totalAbilities || 0} Abilities
              </p>
            </div>
            <div className="flex gap-4">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value ?? 'all')}
              >
                <SelectTrigger className="deltarune-input text-white bg-[#1a1a3a] border-[#4a4a8a] w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                  <SelectItem value="all" className="text-white hover:bg-[#2a2a5a]">All Types</SelectItem>
                  <SelectItem value="character" className="text-white hover:bg-[#2a2a5a]">Characters</SelectItem>
                  <SelectItem value="item" className="text-white hover:bg-[#2a2a5a]">Items</SelectItem>
                  <SelectItem value="ability" className="text-white hover:bg-[#2a2a5a]">Abilities</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterTag}
                onValueChange={(value) => setFilterTag(value ?? '')}
              >
                <SelectTrigger className="deltarune-input text-white bg-[#1a1a3a] border-[#4a4a8a] w-40">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent className="deltarune-card bg-[#1a1a3a] border-[#4a4a8a]">
                  <SelectItem value="" className="text-white hover:bg-[#2a2a5a]">All Tags</SelectItem>
                  {tags?.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.name} className="text-white hover:bg-[#2a2a5a]">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: tag.color }}
                        />
                        <TagLabel name={tag.name} emojiFilename={tag.emojiFilename} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => { setFilterType('all'); setFilterTag(''); }}
                className="deltarune-button text-white"
                style={{ backgroundColor: '#e94560' }}
              >
                CLEAR FILTERS
              </Button>
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
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-[#0f0f1a]"
          >
            <Controls className="!bg-[#1a1a3a] !border-[#4a4a8a] !text-white" />
            <MiniMap 
              className="!bg-[#1a1a3a] !border-[#4a4a8a]" 
              nodeColor="#e94560"
              nodeStrokeWidth={2}
            />
            <Background color="#1a1a3a" gap={16} />
          </ReactFlow>
        </div>

        <div className="absolute bottom-4 right-4">
          <Card className="deltarune-card">
            <CardHeader>
              <CardTitle className="text-white text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e94560' }} />
                <span className="text-[#a0a0a0] text-sm">Character</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ecdc4' }} />
                <span className="text-[#a0a0a0] text-sm">Item</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffd93d' }} />
                <span className="text-[#a0a0a0] text-sm">Ability</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}