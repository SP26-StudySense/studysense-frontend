'use client';

import { useMemo, useState, useRef } from 'react';
import { Plus, Minus, RotateCcw, Loader2, X, Circle, Clock, FileText, BookOpen, Video, Play, Dumbbell } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useRoadmapGraph, useNodeContents, NodeDifficulty, RoadmapNodeDTO, RoadmapEdgeDTO, NodeContentItemDTO } from '../api';

interface RoadmapPreviewGraphProps {
    roadmapId: number | string;
    className?: string;
}

// Simple layout algorithm for nodes
function layoutNodes(nodes: RoadmapNodeDTO[], edges: RoadmapEdgeDTO[]) {
    const nodeMap = new Map<number, RoadmapNodeDTO>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    // Build adjacency for incoming edges
    const incomingCount = new Map<number, number>();
    const outgoing = new Map<number, number[]>();

    nodes.forEach(n => {
        incomingCount.set(n.id, 0);
        outgoing.set(n.id, []);
    });

    edges.forEach(e => {
        incomingCount.set(e.toNodeId, (incomingCount.get(e.toNodeId) || 0) + 1);
        outgoing.get(e.fromNodeId)?.push(e.toNodeId);
    });

    // Topological sort to determine layers
    const layers: number[][] = [];
    const visited = new Set<number>();
    const remaining = new Set(nodes.map(n => n.id));

    while (remaining.size > 0) {
        const layer: number[] = [];
        remaining.forEach(nodeId => {
            const incoming = incomingCount.get(nodeId) || 0;
            if (incoming === 0 ||
                edges.filter(e => e.toNodeId === nodeId).every(e => visited.has(e.fromNodeId))) {
                layer.push(nodeId);
            }
        });

        if (layer.length === 0) {
            // Handle cycles - just add remaining
            layer.push([...remaining][0]);
        }

        layer.forEach(id => {
            remaining.delete(id);
            visited.add(id);
        });
        layers.push(layer);
    }

    // Assign positions
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 70;
    const H_GAP = 60;
    const V_GAP = 80;

    const positions: { id: number; x: number; y: number; node: RoadmapNodeDTO }[] = [];

    layers.forEach((layer, layerIndex) => {
        const layerWidth = layer.length * NODE_WIDTH + (layer.length - 1) * H_GAP;
        const startX = (800 - layerWidth) / 2; // Center horizontally

        layer.forEach((nodeId, nodeIndex) => {
            const node = nodeMap.get(nodeId);
            if (node) {
                positions.push({
                    id: nodeId,
                    x: startX + nodeIndex * (NODE_WIDTH + H_GAP),
                    y: 40 + layerIndex * (NODE_HEIGHT + V_GAP),
                    node,
                });
            }
        });
    });

    return positions;
}

// Helper to normalize difficulty from API (can be string or number)
function normalizeDifficulty(difficulty: NodeDifficulty | string | null | undefined): NodeDifficulty {
    if (difficulty === null || difficulty === undefined) {
        return NodeDifficulty.Beginner;
    }
    // Handle numeric enum values
    if (typeof difficulty === 'number') {
        if (difficulty in NodeDifficulty) {
            return difficulty;
        }
        return NodeDifficulty.Beginner;
    }
    // Handle string values from API
    const normalizedString = difficulty.toLowerCase();
    if (normalizedString === 'beginner') return NodeDifficulty.Beginner;
    if (normalizedString === 'intermediate') return NodeDifficulty.Intermediate;
    if (normalizedString === 'advanced') return NodeDifficulty.Advanced;
    return NodeDifficulty.Beginner;
}

const difficultyConfig = {
    [NodeDifficulty.Beginner]: {
        dot: 'bg-emerald-500',
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300 hover:border-emerald-400',
        icon: 'text-emerald-600',
        label: 'Beginner',
        labelBg: 'bg-emerald-100 text-emerald-700',
    },
    [NodeDifficulty.Intermediate]: {
        dot: 'bg-amber-500',
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300 hover:border-amber-400',
        icon: 'text-amber-600',
        label: 'Intermediate',
        labelBg: 'bg-amber-100 text-amber-700',
    },
    [NodeDifficulty.Advanced]: {
        dot: 'bg-red-500',
        bg: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-300 hover:border-red-400',
        icon: 'text-red-600',
        label: 'Advanced',
        labelBg: 'bg-red-100 text-red-700',
    },
};

export function RoadmapPreviewGraph({ roadmapId, className }: RoadmapPreviewGraphProps) {
    const { data: graph, isLoading, error } = useRoadmapGraph(roadmapId);
    const [scale, setScale] = useState(0.9);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<RoadmapNodeDTO | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch node content when a node is selected
    const { data: nodeContents, isLoading: isContentLoading } = useNodeContents(roadmapId, selectedNode?.id ?? null);

    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 70;

    const layoutData = useMemo(() => {
        if (!graph) return { positions: [], maxX: 800, maxY: 400 };

        const positions = layoutNodes(graph.nodes, graph.edges);
        const maxX = Math.max(...positions.map(p => p.x + NODE_WIDTH), 800) + 100;
        const maxY = Math.max(...positions.map(p => p.y + NODE_HEIGHT), 400) + 100;

        return { positions, maxX, maxY };
    }, [graph]);

    const positionMap = useMemo(() => {
        const map = new Map<number, { x: number; y: number }>();
        layoutData.positions.forEach(p => map.set(p.id, { x: p.x, y: p.y }));
        return map;
    }, [layoutData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === containerRef.current || (e.target as HTMLElement).closest('.graph-canvas')) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.4));
    const handleReset = () => {
        setScale(0.9);
        setPosition({ x: 0, y: 0 });
    };

    const handleNodeClick = (node: RoadmapNodeDTO, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNode(node);
    };

    if (isLoading) {
        return (
            <div className={cn("flex items-center justify-center h-full bg-neutral-50", className)}>
                <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
            </div>
        );
    }

    if (error || !graph) {
        return (
            <div className={cn("flex items-center justify-center h-full bg-neutral-50", className)}>
                <p className="text-neutral-500">Failed to load roadmap graph</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative rounded-2xl bg-white/50 backdrop-blur-xl border border-neutral-200/60 overflow-hidden cursor-grab h-full",
                isDragging && "cursor-grabbing",
                className
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #000 1px, transparent 1px),
                        linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Canvas */}
            <div
                className="graph-canvas"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    width: layoutData.maxX,
                    height: layoutData.maxY,
                    margin: '20px',
                }}
            >
                {/* Edges */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    width={layoutData.maxX}
                    height={layoutData.maxY}
                    style={{ overflow: 'visible' }}
                >
                    {graph.edges.map((edge, index) => {
                        const from = positionMap.get(edge.fromNodeId);
                        const to = positionMap.get(edge.toNodeId);
                        if (!from || !to) return null;

                        const fromX = from.x + NODE_WIDTH / 2;
                        const fromY = from.y + NODE_HEIGHT;
                        const toX = to.x + NODE_WIDTH / 2;
                        const toY = to.y;

                        const controlOffset = Math.max((toY - fromY) * 0.5, 30);

                        return (
                            <path
                                key={index}
                                d={`M ${fromX} ${fromY} C ${fromX} ${fromY + controlOffset}, ${toX} ${toY - controlOffset}, ${toX} ${toY}`}
                                stroke="#00bae2"
                                strokeWidth="2"
                                fill="none"
                                opacity={0.6}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                <div className="relative" style={{ width: layoutData.maxX, height: layoutData.maxY }}>
                    {layoutData.positions.map(({ id, x, y, node }) => {
                        const difficulty = normalizeDifficulty(node.difficulty);
                        const config = difficultyConfig[difficulty];

                        return (
                            <button
                                key={id}
                                onClick={(e) => handleNodeClick(node, e)}
                                className={cn(
                                    "absolute w-[180px] rounded-xl border-2 p-3 backdrop-blur-xl shadow-md transition-all duration-200 cursor-pointer",
                                    "hover:shadow-lg hover:scale-[1.02]",
                                    config.bg,
                                    selectedNode?.id === id && "ring-2 ring-[#00bae2] ring-offset-2"
                                )}
                                style={{ left: x, top: y }}
                            >
                                {/* Difficulty dot */}
                                <div className={cn(
                                    "absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full shadow-sm",
                                    config.dot
                                )} />

                                {/* Status icon */}
                                <div className="flex items-start gap-2">
                                    <Circle className={cn("h-4 w-4 mt-0.5 shrink-0", config.icon)} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2 text-left">
                                            {node.title}
                                        </h4>
                                    </div>
                                </div>

                                {/* Difficulty badge */}
                                <div className={cn(
                                    "mt-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium",
                                    config.labelBg
                                )}>
                                    {config.label}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Node Detail Panel */}
            {selectedNode && (
                <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-32px)] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-20 animate-in slide-in-from-right-2 duration-200 flex flex-col">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-br from-[#00bae2]/10 to-[#fec5fb]/10 border-b border-neutral-200 shrink-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-neutral-900 text-lg">{selectedNode.title}</h3>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="p-1.5 rounded-lg hover:bg-neutral-200/50 transition-colors"
                            >
                                <X className="h-4 w-4 text-neutral-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                                difficultyConfig[normalizeDifficulty(selectedNode.difficulty)].labelBg
                            )}>
                                {difficultyConfig[normalizeDifficulty(selectedNode.difficulty)].label}
                            </span>
                            {nodeContents && nodeContents.length > 0 && (
                                <span className="text-xs text-neutral-500">
                                    {nodeContents.length} content{nodeContents.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isContentLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-[#00bae2]" />
                            </div>
                        ) : nodeContents && nodeContents.length > 0 ? (
                            <>
                                {/* Description from node */}
                                {selectedNode.description && (
                                    <div className="pb-3 border-b border-neutral-100">
                                        <p className="text-sm text-neutral-600 leading-relaxed">
                                            {selectedNode.description}
                                        </p>
                                    </div>
                                )}

                                {/* Content Items */}
                                <div>
                                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Learning Contents</h4>
                                    <div className="space-y-2">
                                        {nodeContents.map((content: NodeContentItemDTO) => {
                                            const ContentTypeIcons: Record<string, typeof FileText> = {
                                                Course: BookOpen,
                                                Exercise: Dumbbell,
                                                Video: Video,
                                                Article: FileText,
                                                Documentation: FileText,
                                            };
                                            const Icon = ContentTypeIcons[content.contentType] || FileText;

                                            return (
                                                <div
                                                    key={content.id}
                                                    className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 hover:bg-neutral-100 transition-colors cursor-pointer"
                                                    onClick={() => content.url && window.open(content.url, '_blank')}
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                                                        <Icon className="h-5 w-5 text-neutral-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                                                                {content.title}
                                                            </p>
                                                            {content.isRequired && (
                                                                <span className="shrink-0 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-medium rounded">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        {content.description && (
                                                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                                                                {content.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <span className="text-[10px] text-neutral-400 capitalize bg-neutral-100 px-1.5 py-0.5 rounded">
                                                                {content.contentType}
                                                            </span>
                                                            {content.estimatedMinutes && (
                                                                <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                                                                    <Clock className="h-3 w-3" />
                                                                    {content.estimatedMinutes} min
                                                                </span>
                                                            )}
                                                            {content.difficulty && (
                                                                <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                                                    {content.difficulty}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-sm text-neutral-500">
                                    {selectedNode.description || 'No content available for this node yet.'}
                                </p>
                            </div>
                        )}
                    </div>


                </div>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-10">
                <button
                    onClick={handleZoomIn}
                    className="w-8 h-8 rounded-lg bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white transition-all"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-8 h-8 rounded-lg bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white transition-all"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-lg bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white transition-all"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-3 left-14 bg-white/90 border border-neutral-200 rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 shadow-lg z-10">
                {Math.round(scale * 100)}%
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-white/90 border border-neutral-200 rounded-lg px-3 py-2 shadow-lg z-10">
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Beginner</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Intermediate</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Advanced</span>
                </div>
            </div>

            {/* Click hint */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-500 shadow-lg z-10">
                Click on a node to view details
            </div>
        </div>
    );
}

