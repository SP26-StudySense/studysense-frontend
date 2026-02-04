"use client";

import { useState, useRef, useMemo } from "react";
import { ManageRoadmapNode } from "./ManageRoadmapNode";
import { cn } from "@/shared/lib/utils";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { RoadmapNodeDTO, RoadmapEdgeDTO } from "@/features/roadmaps/api/types";

interface ManageRoadmapGraphProps {
  nodes: RoadmapNodeDTO[];
  edges: RoadmapEdgeDTO[];
  selectedNodeId: number | null;
  onNodeSelect: (node: RoadmapNodeDTO) => void;
  className?: string;
}

export function ManageRoadmapGraph({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  className
}: ManageRoadmapGraphProps) {
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const NODE_WIDTH = 192;
  const NODE_HEIGHT = 52;
  const HORIZONTAL_SPACING = 280;
  const VERTICAL_SPACING = 150;

  // Calculate tree layout based on edges
  const nodePositions = useMemo(() => {
    if (nodes.length === 0) return new Map<number, { x: number; y: number }>();

    // Build adjacency list (only prerequisite edges for tree structure)
    const children = new Map<number, number[]>();
    const parents = new Map<number, Set<number>>();
    
    nodes.forEach(node => {
      children.set(node.id, []);
      parents.set(node.id, new Set());
    });

    edges.forEach(edge => {
      if (edge.edgeType === 0) { // Prerequisite edges define the tree structure
        children.get(edge.fromNodeId)?.push(edge.toNodeId);
        parents.get(edge.toNodeId)?.add(edge.fromNodeId);
      }
    });

    // Find root nodes (nodes with no prerequisites)
    const rootNodes = nodes.filter(node => parents.get(node.id)?.size === 0);

    // If no roots found, use nodes with lowest orderNo
    const roots = rootNodes.length > 0 
      ? rootNodes 
      : [nodes.reduce((min, node) => (node.orderNo || 0) < (min.orderNo || 0) ? node : min, nodes[0])];

    // Calculate levels using BFS
    const levels = new Map<number, number>();
    const queue: Array<{ id: number; level: number }> = [];
    const visited = new Set<number>();

    roots.forEach(root => {
      queue.push({ id: root.id, level: 0 });
      visited.add(root.id);
    });

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      levels.set(id, level);

      const nodeChildren = children.get(id) || [];
      nodeChildren.forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }

    // Handle orphan nodes (not connected)
    nodes.forEach(node => {
      if (!levels.has(node.id)) {
        levels.set(node.id, 0);
      }
    });

    // Group nodes by level
    const levelGroups = new Map<number, number[]>();
    levels.forEach((level, nodeId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(nodeId);
    });

    // Sort nodes in each level by orderNo
    levelGroups.forEach((nodeIds, level) => {
      nodeIds.sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a);
        const nodeB = nodes.find(n => n.id === b);
        return (nodeA?.orderNo || 0) - (nodeB?.orderNo || 0);
      });
    });

    // Calculate positions
    const positions = new Map<number, { x: number; y: number }>();
    
    levelGroups.forEach((nodeIds, level) => {
      const nodesInLevel = nodeIds.length;
      
      nodeIds.forEach((nodeId, index) => {
        // Center nodes horizontally within their level
        const totalWidth = (nodesInLevel - 1) * HORIZONTAL_SPACING;
        const startX = -totalWidth / 2;
        
        positions.set(nodeId, {
          x: startX + index * HORIZONTAL_SPACING,
          y: level * VERTICAL_SPACING
        });
      });
    });

    return positions;
  }, [nodes, edges]);

  const getNodePosition = (node: RoadmapNodeDTO) => {
    return nodePositions.get(node.id) || { x: 0, y: 0 };
  };

  const getNodeBottom = (nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const pos = getNodePosition(node);
    return { x: pos.x + NODE_WIDTH / 2, y: pos.y + NODE_HEIGHT };
  };

  const getNodeTop = (nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const pos = getNodePosition(node);
    return { x: pos.x + NODE_WIDTH / 2, y: pos.y };
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.4));
  const handleReset = () => { setScale(0.8); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.graph-canvas')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => Math.max(0.4, Math.min(1.5, prev + delta)));
  };

  // Calculate canvas size based on actual positions
  const { maxX, minX, maxY } = useMemo(() => {
    if (nodePositions.size === 0) return { maxX: 800, minX: 0, maxY: 600 };
    
    let maxX = 0, minX = 0, maxY = 0;
    nodePositions.forEach(pos => {
      maxX = Math.max(maxX, pos.x + NODE_WIDTH);
      minX = Math.min(minX, pos.x);
      maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
    });
    
    return { 
      maxX: maxX + 200, 
      minX: minX - 200,
      maxY: maxY + 200 
    };
  }, [nodePositions]);

  const canvasWidth = maxX - minX;
  const canvasHeight = maxY + 100;

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

      <div
        className="graph-canvas"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          width: canvasWidth,
          height: canvasHeight,
          margin: '40px',
          position: 'relative',
          left: '50%',
          marginLeft: `-${canvasWidth / 2}px`
        }}
      >
        <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight} style={{ overflow: 'visible' }}>
          {edges.map((edge) => {
            const fromNode = nodes.find(n => n.id === edge.fromNodeId);
            const toNode = nodes.find(n => n.id === edge.toNodeId);
            if (!fromNode || !toNode) return null;

            const from = getNodeBottom(edge.fromNodeId);
            const to = getNodeTop(edge.toNodeId);
            
            // Adjust for canvas centering
            const adjustedFrom = { x: from.x + canvasWidth / 2, y: from.y };
            const adjustedTo = { x: to.x + canvasWidth / 2, y: to.y };
            
            const verticalGap = adjustedTo.y - adjustedFrom.y;
            const horizontalGap = Math.abs(adjustedTo.x - adjustedFrom.x);
            
            // Use different curve for vertical vs diagonal connections
            const controlOffset = verticalGap > 0 ? Math.max(verticalGap * 0.5, 40) : 40;
            
            const edgeColor = edge.edgeType === 0 ? "#00bae2" : edge.edgeType === 1 ? "#fec5fb" : "#d4d4d4";

            return (
              <path
                key={edge.id}
                d={`M ${adjustedFrom.x} ${adjustedFrom.y} C ${adjustedFrom.x} ${adjustedFrom.y + controlOffset}, ${adjustedTo.x} ${adjustedTo.y - controlOffset}, ${adjustedTo.x} ${adjustedTo.y}`}
                stroke={edgeColor}
                strokeWidth="2"
                fill="none"
                strokeDasharray={edge.edgeType === 2 ? "5,5" : "none"}
                opacity={0.8}
              />
            );
          })}
        </svg>

        <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
          {nodes.map(node => {
            const pos = getNodePosition(node);
            return (
              <ManageRoadmapNode
                key={node.id}
                node={{ ...node, orderNo: 0 }} // Override to use our calculated position
                isSelected={selectedNodeId === node.id}
                onClick={onNodeSelect}
                style={{
                  left: `${pos.x + canvasWidth / 2}px`,
                  top: `${pos.y}px`
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-3 lg:bottom-6 left-3 lg:left-6 flex flex-col gap-1.5 lg:gap-2 z-10">
        <button onClick={handleZoomIn} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all">
          <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        </button>
        <button onClick={handleZoomOut} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all">
          <Minus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        </button>
        <button onClick={handleReset} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/90 border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all">
          <RotateCcw className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        </button>
      </div>

      <div className="absolute bottom-3 lg:bottom-6 left-14 lg:left-20 bg-white/90 border border-neutral-200 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-medium text-neutral-600 shadow-lg z-10">
        {Math.round(scale * 100)}%
      </div>

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
