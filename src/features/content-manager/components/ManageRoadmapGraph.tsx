'use client';

import { useState, useRef } from 'react';
import { ManageRoadmapNode } from './ManageRoadmapNode';
import { cn } from '@/shared/lib/utils';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { RoadmapNodeDTO, RoadmapEdgeDTO } from '@/features/roadmaps/api/types';

interface ManageRoadmapGraphProps {
    nodes: RoadmapNodeDTO[];
    edges: RoadmapEdgeDTO[];
    selectedNodeId: number | null;
    onNodeSelect: (node: RoadmapNodeDTO) => void;
    onNodeDelete?: (nodeId: number) => void;
    onNodeEdit?: (node: RoadmapNodeDTO) => void;
    className?: string;
}

export function ManageRoadmapGraph({ 
    nodes, 
    edges, 
    selectedNodeId, 
    onNodeSelect, 
    onNodeDelete,
    onNodeEdit,
    className 
}: ManageRoadmapGraphProps) {
    const [scale, setScale] = useState(0.8);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const NODE_WIDTH = 192;
    const NODE_HEIGHT = 52;

    // Calculate node position based on orderNo
    const getNodePosition = (node: RoadmapNodeDTO) => {
        const order = node.orderNo || 0;
        return {
            x: order * 250,
            y: Math.floor((order - 1) / 4) * 150,
        };
    };

    // Get bottom center of node (for edge start)
    const getNodeBottom = (nodeId: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        const pos = getNodePosition(node);
        return {
            x: pos.x + NODE_WIDTH / 2,
            y: pos.y + NODE_HEIGHT,
        };
    };

    // Get top center of node (for edge end)
    const getNodeTop = (nodeId: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        const pos = getNodePosition(node);
        return {
            x: pos.x + NODE_WIDTH / 2,
            y: pos.y,
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
    const maxX = nodes.length > 0 ? Math.max(...nodes.map(n => getNodePosition(n).x)) + 300 : 800;
    const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => getNodePosition(n).y)) + 200 : 600;

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
                    {edges.map((edge) => {
                        const fromNode = nodes.find(n => n.id === edge.fromNodeId);
                        const toNode = nodes.find(n => n.id === edge.toNodeId);
                        if (!fromNode || !toNode) return null;

                        const from = getNodeBottom(edge.fromNodeId);
                        const to = getNodeTop(edge.toNodeId);

                        // Calculate control points for smooth S-curve
                        const verticalGap = to.y - from.y;
                        const controlOffset = Math.max(verticalGap * 0.5, 40);

                        // Edge color based on type
                        const edgeColor = edge.edgeType === 0 ? "#00bae2" : edge.edgeType === 1 ? "#fec5fb" : "#d4d4d4";

                        return (
                            <path
                                key={edge.id}
                                d={`M ${from.x} ${from.y} C ${from.x} ${from.y + controlOffset}, ${to.x} ${to.y - controlOffset}, ${to.x} ${to.y}`}
                                stroke={edgeColor}
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray={edge.edgeType === 2 ? "5,5" : "none"}
                            />
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                <div className="relative" style={{ width: maxX, height: maxY }}>
                    {nodes.map(node => (
                        <ManageRoadmapNode
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onClick={onNodeSelect}
                            onDelete={onNodeDelete}
                            onEdit={onNodeEdit}
                        />
                    ))}
                </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 lg:bottom-6 left-3 lg:left-6 flex flex-col gap-1.5 lg:gap-2 z-10">
                <button
                    onClick={handleZoomIn}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                >
                    <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                >
                    <Minus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
                <button
                    onClick={handleReset}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all"
                >
                    <RotateCcw className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-3 lg:bottom-6 left-14 lg:left-20 bg-white/90 border border-neutral-200 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-medium text-neutral-600 shadow-lg z-10">
                {Math.round(scale * 100)}%
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 lg:bottom-6 right-3 lg:right-6 flex items-center gap-2 lg:gap-4 bg-white/90 border border-neutral-200 rounded-lg lg:rounded-xl px-2 lg:px-4 py-1.5 lg:py-2 shadow-lg z-10">
                <div className="flex items-center gap-1 lg:gap-1.5 text-xs text-neutral-600">
                    <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-emerald-500" />
                    <span className="hidden sm:inline">Beginner</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-1.5 text-xs text-neutral-600">
                    <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-amber-500" />
                    <span className="hidden sm:inline">Intermediate</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-1.5 text-xs text-neutral-600">
                    <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-red-500" />
                    <span className="hidden sm:inline">Advanced</span>
                </div>
            </div>
        </div>
    );
}
