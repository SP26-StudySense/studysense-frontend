"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Edit, Link as LinkIcon } from "lucide-react";
import { ManageRoadmapNode } from "./ManageRoadmapNode";
import type { RoadmapNode, RoadmapEdge, NodeDifficulty, EdgeType } from "../api/types";

interface ManageRoadmapGraphProps {
  roadmapId: number;
  initialNodes: RoadmapNode[];
  initialEdges: RoadmapEdge[];
  onNodesChange?: (nodes: RoadmapNode[]) => void;
  onEdgesChange?: (edges: RoadmapEdge[]) => void;
}

export function ManageRoadmapGraph({
  roadmapId,
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
}: ManageRoadmapGraphProps) {
  const [nodes, setNodes] = useState<RoadmapNode[]>(initialNodes);
  const [edges, setEdges] = useState<RoadmapEdge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<number | string | null>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);

  // Generate temporary client ID for new nodes
  const generateClientId = () => `temp-${Date.now()}-${Math.random()}`;

  // Update parent when nodes change
  const updateNodes = useCallback((newNodes: RoadmapNode[]) => {
    setNodes(newNodes);
    onNodesChange?.(newNodes);
  }, [onNodesChange]);

  // Update parent when edges change
  const updateEdges = useCallback((newEdges: RoadmapEdge[]) => {
    setEdges(newEdges);
    onEdgesChange?.(newEdges);
  }, [onEdgesChange]);

  // Add new node
  const handleAddNode = () => {
    const newNode: RoadmapNode = {
      id: null,
      clientId: generateClientId(),
      roadmapId,
      title: "New Node",
      description: "Enter description",
      difficulty: "Beginner" as NodeDifficulty,
      estimatedHours: 1,
      orderNo: nodes.length,
      contents: [],
    };

    const newNodes = [...nodes, newNode];
    updateNodes(newNodes);
    setSelectedNodeId(newNode.clientId!);
    setIsAddingNode(false);
  };

  // Update node
  const handleUpdateNode = (nodeId: number | string, updates: Partial<RoadmapNode>) => {
    const newNodes = nodes.map((node) => {
      const matchId = node.id ? node.id === nodeId : node.clientId === nodeId;
      return matchId ? { ...node, ...updates } : node;
    });
    updateNodes(newNodes);
  };

  // Delete node and its connected edges
  const handleDeleteNode = (nodeId: number | string) => {
    const newNodes = nodes.filter((node) => {
      const matchId = node.id ? node.id === nodeId : node.clientId === nodeId;
      return !matchId;
    });
    
    const newEdges = edges.filter((edge) => {
      const fromMatch = edge.fromNodeId === nodeId || edge.fromNodeClientId === nodeId;
      const toMatch = edge.toNodeId === nodeId || edge.toNodeClientId === nodeId;
      return !fromMatch && !toMatch;
    });

    updateNodes(newNodes);
    updateEdges(newEdges);
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Add edge
  const handleAddEdge = (fromNodeId: number | string, toNodeId: number | string, edgeType: EdgeType) => {
    const newEdge: RoadmapEdge = {
      id: null,
      clientId: generateClientId(),
      roadmapId,
      fromNodeId: typeof fromNodeId === 'number' ? fromNodeId : undefined,
      fromNodeClientId: typeof fromNodeId === 'string' ? fromNodeId : undefined,
      toNodeId: typeof toNodeId === 'number' ? toNodeId : undefined,
      toNodeClientId: typeof toNodeId === 'string' ? toNodeId : undefined,
      edgeType,
      orderNo: edges.length,
    };

    const newEdges = [...edges, newEdge];
    updateEdges(newEdges);
  };

  // Delete edge
  const handleDeleteEdge = (edgeId: number | string) => {
    const newEdges = edges.filter((edge) => {
      const matchId = edge.id ? edge.id === edgeId : edge.clientId === edgeId;
      return !matchId;
    });
    updateEdges(newEdges);
  };

  const selectedNode = nodes.find((node) => {
    const matchId = node.id ? node.id === selectedNodeId : node.clientId === selectedNodeId;
    return matchId;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Panel - Node List */}
      <div className="lg:col-span-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Nodes</h3>
          <button
            onClick={() => setIsAddingNode(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] text-neutral-900 transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {nodes.map((node) => {
            const nodeId = node.id || node.clientId!;
            const isSelected = selectedNodeId === nodeId;
            
            return (
              <div
                key={nodeId}
                onClick={() => setSelectedNodeId(nodeId)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-[#00bae2] bg-[#00bae2]/5"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {node.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {node.difficulty} • {node.estimatedHours}h
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(nodeId);
                    }}
                    className="text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {nodes.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
              <p className="text-sm text-neutral-500">No nodes yet</p>
              <button
                onClick={handleAddNode}
                className="mt-2 text-sm text-[#00bae2] hover:underline"
              >
                Add your first node
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Node Editor */}
      <div className="lg:col-span-2 p-6 border-l border-neutral-100">
        {selectedNode ? (
          <ManageRoadmapNode
            node={selectedNode}
            allNodes={nodes}
            edges={edges}
            onUpdate={(updates) => handleUpdateNode(selectedNode.id || selectedNode.clientId!, updates)}
            onAddEdge={handleAddEdge}
            onDeleteEdge={handleDeleteEdge}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <LinkIcon className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-sm text-neutral-500">
                Select a node to edit or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
