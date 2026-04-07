"use client";

import { useState, useRef, useMemo, useCallback, useEffect, type CSSProperties } from "react";
import { Plus, Minus, RotateCcw, Circle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { RoadmapNode, RoadmapEdge } from "../api/types";

interface CMSRoadmapGraphProps {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  selectedNodeId: number | string | null;
  reformatSignal?: number;
  onNodeSelect: (nodeId: number | string | null) => void;
  className?: string;
  style?: CSSProperties;
}

// Get a stable string key for any RoadmapNode
function getNodeKey(node: RoadmapNode): string {
  return node.id != null ? String(node.id) : node.clientId!;
}

// Resolve the node key from one side of an edge
function resolveEdgeEndKey(
  side: "from" | "to",
  edge: RoadmapEdge
): string | null {
  if (side === "from") {
    if (edge.fromNodeId != null) return String(edge.fromNodeId);
    if (edge.fromNodeClientId) return edge.fromNodeClientId;
    return null;
  }
  if (edge.toNodeId != null) return String(edge.toNodeId);
  if (edge.toNodeClientId) return edge.toNodeClientId;
  return null;
}

// Topological-sort layout, returns a Map<nodeKey, {x, y}>
function computeLayout(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[]
): Map<string, { x: number; y: number }> {
  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 70;
  const H_GAP = 60;
  const V_GAP = 80;
  const CANVAS_WIDTH = 840;

  const allKeys = nodes.map(getNodeKey);
  const incomingCount = new Map<string, number>();
  allKeys.forEach((k) => incomingCount.set(k, 0));

  edges.forEach((e) => {
    const toKey = resolveEdgeEndKey("to", e);
    const fromKey = resolveEdgeEndKey("from", e);
    if (toKey && fromKey && incomingCount.has(toKey) && incomingCount.has(fromKey)) {
      incomingCount.set(toKey, (incomingCount.get(toKey) ?? 0) + 1);
    }
  });

  const layers: string[][] = [];
  const visited = new Set<string>();
  const remaining = new Set(allKeys);

  while (remaining.size > 0) {
    const layer: string[] = [];
    remaining.forEach((key) => {
      const allSourcesVisited = edges
        .filter((e) => resolveEdgeEndKey("to", e) === key)
        .every((e) => {
          const fromKey = resolveEdgeEndKey("from", e);
          return fromKey ? visited.has(fromKey) : true;
        });
      if ((incomingCount.get(key) ?? 0) === 0 || allSourcesVisited) {
        layer.push(key);
      }
    });

    if (layer.length === 0) {
      // Handle cycle — just take one
      layer.push([...remaining][0]);
    }

    layer.forEach((k) => {
      remaining.delete(k);
      visited.add(k);
    });
    layers.push(layer);
  }

  const positions = new Map<string, { x: number; y: number }>();
  layers.forEach((layer, layerIdx) => {
    const layerWidth = layer.length * NODE_WIDTH + Math.max(0, layer.length - 1) * H_GAP;
    const startX = Math.max(20, (CANVAS_WIDTH - layerWidth) / 2);
    layer.forEach((key, nodeIdx) => {
      positions.set(key, {
        x: startX + nodeIdx * (NODE_WIDTH + H_GAP),
        y: 40 + layerIdx * (NODE_HEIGHT + V_GAP),
      });
    });
  });

  return positions;
}

const difficultyConfig = {
  Beginner: {
    dot: "bg-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300 hover:border-emerald-400",
    icon: "text-emerald-600",
    label: "Beginner",
    labelBg: "bg-emerald-100 text-emerald-700",
  },
  Intermediate: {
    dot: "bg-amber-500",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300 hover:border-amber-400",
    icon: "text-amber-600",
    label: "Intermediate",
    labelBg: "bg-amber-100 text-amber-700",
  },
  Advanced: {
    dot: "bg-red-500",
    bg: "bg-gradient-to-br from-red-50 to-red-100/50 border-red-300 hover:border-red-400",
    icon: "text-red-600",
    label: "Advanced",
    labelBg: "bg-red-100 text-red-700",
  },
} as const;

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;

export function CMSRoadmapGraph({
  nodes,
  edges,
  selectedNodeId,
  reformatSignal,
  onNodeSelect,
  className,
  style,
}: CMSRoadmapGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(0.85);
  const [panPosition, setPanPosition] = useState({ x: 40, y: 20 });

  // Keep refs in sync for use inside event handlers (avoids stale closures)
  const scaleRef = useRef(scale);
  const panRef = useRef(panPosition);
  scaleRef.current = scale;
  panRef.current = panPosition;

  // Node positions — initially from layout, then user-draggable
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(
    () => computeLayout(nodes, edges)
  );

  const selectedKey = selectedNodeId != null ? String(selectedNodeId) : null;

  // Keep node positions in sync with current node set and place new nodes near selection.
  useEffect(() => {
    setNodePositions((prev) => {
      const currentKeys = new Set(nodes.map(getNodeKey));
      const updated = new Map(prev);
      let changed = false;

      // Remove positions of deleted nodes.
      for (const key of [...updated.keys()]) {
        if (!currentKeys.has(key)) {
          updated.delete(key);
          changed = true;
        }
      }

      for (const node of nodes) {
        const key = getNodeKey(node);
        if (updated.has(key)) continue;

        const anchor = selectedKey ? updated.get(selectedKey) : undefined;
        if (anchor) {
          updated.set(key, {
            x: anchor.x + NODE_WIDTH + 60,
            y: anchor.y,
          });
        } else {
          const layout = computeLayout(nodes, edges);
          updated.set(key, layout.get(key) ?? { x: 80, y: 80 });
        }
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, [nodes, edges, selectedKey]);

  // Interaction state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const [draggingNodeKey, setDraggingNodeKey] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  // Track whether a node moved (to distinguish click vs drag)
  const nodeDraggedRef = useRef(false);

  // Convert screen coords → canvas coords
  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - panRef.current.x) / scaleRef.current,
      y: (clientY - rect.top - panRef.current.y) / scaleRef.current,
    };
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return;
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
    },
    []
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeKey: string) => {
      e.stopPropagation();
      const canvasPos = toCanvasCoords(e.clientX, e.clientY);
      const nodePos = nodePositions.get(nodeKey) ?? { x: 0, y: 0 };
      dragOffsetRef.current = {
        x: canvasPos.x - nodePos.x,
        y: canvasPos.y - nodePos.y,
      };
      nodeDraggedRef.current = false;
      setDraggingNodeKey(nodeKey);
    },
    [nodePositions, toCanvasCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNodeKey) {
        nodeDraggedRef.current = true;
        const canvasPos = toCanvasCoords(e.clientX, e.clientY);
        const newX = Math.max(0, canvasPos.x - dragOffsetRef.current.x);
        const newY = Math.max(0, canvasPos.y - dragOffsetRef.current.y);
        setNodePositions((prev) => {
          const updated = new Map(prev);
          updated.set(draggingNodeKey, { x: newX, y: newY });
          return updated;
        });
      } else if (isPanning) {
        const newPan = {
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        };
        setPanPosition(newPan);
        panRef.current = newPan;
      }
    },
    [draggingNodeKey, isPanning, toCanvasCoords]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNodeKey(null);
    setIsPanning(false);
  }, []);

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: RoadmapNode) => {
      e.stopPropagation();
      // Only fire click if the node wasn't dragged
      if (nodeDraggedRef.current) return;
      const id = node.id != null ? node.id : node.clientId!;
      onNodeSelect(id);
    },
    [onNodeSelect]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-node]")) {
        onNodeSelect(null);
      }
    },
    [onNodeSelect]
  );

  // Native wheel handler attached with { passive: false } so preventDefault works
  // This prevents the page from scrolling when the user zooms inside the graph
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.25), 2.0));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleZoomIn = () => setScale((p) => Math.min(p + 0.1, 2.0));
  const handleZoomOut = () => setScale((p) => Math.max(p - 0.1, 0.25));
  const handleReset = useCallback(() => {
    setScale(0.85);
    setPanPosition({ x: 40, y: 20 });
    // Also re-compute layout
    setNodePositions(computeLayout(nodes, edges));
  }, [nodes, edges]);

  useEffect(() => {
    if (reformatSignal == null) return;
    handleReset();
  }, [reformatSignal, handleReset]);

  // Canvas bounding size
  const canvasSize = useMemo(() => {
    let maxX = 840;
    let maxY = 400;
    nodePositions.forEach((pos) => {
      maxX = Math.max(maxX, pos.x + NODE_WIDTH + 120);
      maxY = Math.max(maxY, pos.y + NODE_HEIGHT + 120);
    });
    return { width: maxX, height: maxY };
  }, [nodePositions]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl bg-neutral-50/50 border border-neutral-200",
        draggingNodeKey
          ? "cursor-grabbing"
          : isPanning
          ? "cursor-grabbing"
          : "cursor-grab",
        className
      )}
      style={{ minHeight: 480, ...style }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      {/* Zoomable canvas */}
      <div
        style={{
          position: "absolute",
          transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
          transformOrigin: "top left",
          transition:
            draggingNodeKey || isPanning ? "none" : "transform 0.15s ease-out",
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      >
        {/* Edges */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker
              id="arrowBlue"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#00bae2" />
            </marker>
            <marker
              id="arrowRed"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />
            </marker>
            <marker
              id="arrowAmber"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const fromKey = resolveEdgeEndKey("from", edge);
            const toKey = resolveEdgeEndKey("to", edge);
            if (!fromKey || !toKey) return null;

            const fromPos = nodePositions.get(fromKey);
            const toPos = nodePositions.get(toKey);
            if (!fromPos || !toPos) return null;

            const fromX = fromPos.x + NODE_WIDTH / 2;
            const fromY = fromPos.y + NODE_HEIGHT;
            const toX = toPos.x + NODE_WIDTH / 2;
            const toY = toPos.y;

            // Highlight if selected node is connected
            const isHighlighted =
              !selectedKey ||
              fromKey === selectedKey ||
              toKey === selectedKey;

            const color =
              edge.edgeType === "Prerequisite"
                ? "#ef4444"
                : edge.edgeType === "Recommended"
                ? "#f59e0b"
                : "#00bae2";
            const markerId =
              edge.edgeType === "Prerequisite"
                ? "arrowRed"
                : edge.edgeType === "Recommended"
                ? "arrowAmber"
                : "arrowBlue";

            const cp = Math.max(Math.abs(toY - fromY) * 0.5, 40);

            return (
              <path
                key={i}
                d={`M ${fromX} ${fromY} C ${fromX} ${fromY + cp}, ${toX} ${toY - cp}, ${toX} ${toY}`}
                stroke={color}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                fill="none"
                opacity={isHighlighted ? 0.85 : 0.18}
                strokeDasharray={
                  edge.edgeType === "Recommended" ? "6 4" : undefined
                }
                markerEnd={isHighlighted ? `url(#${markerId})` : undefined}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const key = getNodeKey(node);
          const pos = nodePositions.get(key) ?? { x: 0, y: 0 };
          const rawDiff = node.difficulty as string;
          const config =
            difficultyConfig[rawDiff as keyof typeof difficultyConfig] ??
            difficultyConfig.Beginner;
          const isSelected = selectedKey === key;
          const isDragTarget = draggingNodeKey === key;

          return (
            <div
              key={key}
              data-node={key}
              onMouseDown={(e) => handleNodeMouseDown(e, key)}
              onClick={(e) => handleNodeClick(e, node)}
              className={cn(
                "absolute w-[180px] rounded-xl border-2 p-3 shadow-md select-none",
                config.bg,
                isDragTarget
                  ? "cursor-grabbing shadow-2xl scale-105"
                  : "cursor-pointer hover:shadow-lg",
                isSelected && "ring-2 ring-[#00bae2] ring-offset-2 shadow-lg"
              )}
              style={{
                left: pos.x,
                top: pos.y,
                transition: isDragTarget ? "none" : "box-shadow 0.15s ease",
                zIndex: isSelected || isDragTarget ? 10 : 1,
              }}
            >
              {/* Difficulty dot */}
              <div
                className={cn(
                  "absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full shadow-sm",
                  config.dot
                )}
              />

              <div className="flex items-start gap-2">
                <Circle className={cn("h-4 w-4 mt-0.5 shrink-0", config.icon)} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2 text-left">
                    {node.title}
                  </h4>
                </div>
              </div>

              <div
                className={cn(
                  "mt-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium",
                  config.labelBg
                )}
              >
                {config.label}
              </div>

              {node.estimatedHours != null && (
                <div className="mt-0.5 text-[10px] text-neutral-500">
                  {node.estimatedHours}h estimated
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hint bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-full px-3 py-1 text-[11px] text-neutral-500 shadow z-10 pointer-events-none">
        Click to select • Drag node to reposition • Scroll to zoom
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-10">
        {[
          { label: "+", action: handleZoomIn, icon: <Plus className="h-4 w-4" /> },
          { label: "-", action: handleZoomOut, icon: <Minus className="h-4 w-4" /> },
          { label: "r", action: handleReset, icon: <RotateCcw className="h-4 w-4" /> },
        ].map(({ label, action, icon }) => (
          <button
            key={label}
            onClick={(e) => { e.stopPropagation(); action(); }}
            className="w-8 h-8 rounded-lg bg-white/90 border border-neutral-200 shadow flex items-center justify-center text-neutral-600 hover:bg-white transition-all"
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Zoom percentage */}
      <div className="absolute bottom-3 left-14 bg-white/90 border border-neutral-200 rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 shadow z-10">
        {Math.round(scale * 100)}%
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-white/90 border border-neutral-200 rounded-lg px-3 py-2 shadow z-10">
        <span className="text-[10px] font-medium text-neutral-500 mr-1">Difficulty</span>
        {(["Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
          <div key={diff} className="flex items-center gap-1.5 text-xs text-neutral-600">
            <div className={cn("w-2.5 h-2.5 rounded-full", difficultyConfig[diff].dot)} />
            <span className="text-[10px]">{diff}</span>
          </div>
        ))}
      </div>

      {/* Edge type legend */}
      <div className="absolute bottom-12 right-3 flex items-center gap-3 bg-white/90 border border-neutral-200 rounded-lg px-3 py-2 shadow z-10">
        <span className="text-[10px] font-medium text-neutral-500 mr-1">Edges</span>
        <div className="flex items-center gap-1">
          <div className="w-6 h-0.5 bg-[#ef4444]" />
          <span className="text-[10px] text-neutral-600">Prerequisite</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-0.5 bg-[#f59e0b] border-dashed" style={{ borderTop: "2px dashed #f59e0b", height: 0 }} />
          <span className="text-[10px] text-neutral-600">Recommended</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-0.5 bg-[#00bae2]" />
          <span className="text-[10px] text-neutral-600">Next</span>
        </div>
      </div>
    </div>
  );
}
