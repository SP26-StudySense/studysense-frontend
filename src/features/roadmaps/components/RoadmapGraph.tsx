'use client';

import { useState, useRef, useEffect } from 'react';
import { RoadmapNode, RoadmapNodeData } from './RoadmapNode';
import { cn } from '@/shared/lib/utils';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export interface RoadmapEdge {
    from: string;
    to: string;
}

interface RoadmapGraphProps {
    nodes: RoadmapNodeData[];
    edges: RoadmapEdge[];
    selectedNodeId: string | null;
    onNodeSelect: (node: RoadmapNodeData) => void;
    className?: string;
}

export function RoadmapGraph({ nodes, edges, selectedNodeId, onNodeSelect, className }: RoadmapGraphProps) {
    const [scale, setScale] = useState(0.8);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const NODE_WIDTH = 192;
    const NODE_HEIGHT = 120;

    // Get bottom center of node (for edge start)
    const getNodeBottom = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        return {
            x: node.x + NODE_WIDTH / 2,
            y: node.y + NODE_HEIGHT,
        };
    };

    // Get top center of node (for edge end)
    const getNodeTop = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        return {
            x: node.x + NODE_WIDTH / 2,
            y: node.y,
        };
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.1, 1.5));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.1, 0.4));
    };

    const handleReset = () => {
        setScale(0.8);
        setPosition({ x: 0, y: 0 });
    };

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

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setScale(prev => Math.max(0.4, Math.min(1.5, prev + delta)));
    };

    // Calculate canvas size based on nodes
    const maxX = Math.max(...nodes.map(n => n.x)) + 250;
    const maxY = Math.max(...nodes.map(n => n.y)) + 150;

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative rounded-3xl bg-white/50 backdrop-blur-xl border border-neutral-200/60 shadow-xl shadow-neutral-900/5 overflow-hidden cursor-grab",
                isDragging && "cursor-grabbing",
                className
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Grid pattern background */}
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

            {/* Zoomable/Pannable Canvas */}
            <div
                className="graph-canvas"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    width: maxX,
                    height: maxY,
                    margin: '40px',
                }}
            >

                {/* SVG Edges Layer */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    width={maxX}
                    height={maxY}
                    style={{ overflow: 'visible' }}
                >
                    {edges.map((edge, index) => {
                        const fromNode = nodes.find(n => n.id === edge.from);
                        const toNode = nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;

                        const from = getNodeBottom(edge.from);
                        const to = getNodeTop(edge.to);

                        // Calculate control points for smooth S-curve
                        const verticalGap = to.y - from.y;
                        const controlOffset = Math.max(verticalGap * 0.5, 40);

                        const isActive = fromNode.status === 'done' || fromNode.status === 'in_progress';

                        return (
                            <path
                                key={index}
                                d={`M ${from.x} ${from.y} C ${from.x} ${from.y + controlOffset}, ${to.x} ${to.y - controlOffset}, ${to.x} ${to.y}`}
                                stroke={isActive ? "#00bae2" : "#d4d4d4"}
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray={toNode.status === 'locked' ? "5,5" : "none"}
                            />
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                <div className="relative" style={{ width: maxX, height: maxY }}>
                    {nodes.map(node => (
                        <RoadmapNode
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onClick={onNodeSelect}
                        />
                    ))}
                </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
                <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <button
                    onClick={handleReset}
                    className="w-10 h-10 rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-6 left-20 bg-white/90 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-lg z-10">
                {Math.round(scale * 100)}%
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white/90 border border-neutral-200 rounded-xl px-4 py-2 shadow-lg z-10">
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Beginner
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Intermediate
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Advanced
                </div>
            </div>
        </div>
    );
}
