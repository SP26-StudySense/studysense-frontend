"use client";

import { useState } from "react";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { RoadmapGraph, RoadmapEdge } from "@/features/roadmaps/components/RoadmapGraph";
import { RoadmapNodeData } from "@/features/roadmaps/components/RoadmapNode";
import { NodeDetailPanel, NodeDetailData } from "@/features/roadmaps/components/NodeDetailPanel";

interface AdminRoadmapPageProps {
  initialNodes?: RoadmapNodeData[];
  initialEdges?: RoadmapEdge[];
}

// Extended detail data for admin (same structure as user)
const MOCK_NODE_DETAILS: Record<string, Omit<NodeDetailData, keyof RoadmapNodeData>> = {
  // Placeholder - in real implementation this would come from props or API
};

export function AdminRoadmapPage({
  initialNodes = [],
  initialEdges = [],
}: AdminRoadmapPageProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);

  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  const handleAddNode = () => {
    console.log("Add node");
    // UI only - in real implementation would open a modal/form
  };

  const handleEditNode = () => {
    if (selectedNode) {
      console.log("Edit node:", selectedNode);
      // UI only - in real implementation would open edit modal
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      console.log("Delete node:", selectedNode.id);
      // UI only - in real implementation would show confirmation
    }
  };

  const getNodeDetail = (node: RoadmapNodeData | null): NodeDetailData | null => {
    if (!node) return null;
    const details = MOCK_NODE_DETAILS[node.id] || {
      description: `Learn the fundamentals of ${node.title} and build practical skills.`,
      prerequisites: [],
      resources: [],
      tasks: Array.from({ length: node.totalTasks }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i + 1}`,
        isCompleted: i < node.completedTasks,
      })),
    };
    return { ...node, ...details };
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-160px)]">
      {/* Left - Graph */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Search & Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            />
          </div>
          <button className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition-all">
            <Filter className="h-4 w-4" />
            All Levels
          </button>
          <button
            onClick={handleAddNode}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
        </div>

        {/* Graph */}
        <RoadmapGraph
          nodes={initialNodes}
          edges={initialEdges}
          selectedNodeId={selectedNode?.id || null}
          onNodeSelect={handleNodeSelect}
          className="flex-1"
        />
      </div>

      {/* Right - Detail Panel with Admin Actions */}
      {selectedNode && (
        <div className="relative">
          <NodeDetailPanel
            node={getNodeDetail(selectedNode)}
            onClose={handleClosePanel}
          />
          
          {/* Admin Action Buttons - Positioned below panel */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleEditNode}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition-all"
            >
              <Edit className="h-4 w-4" />
              Edit Node
            </button>
            <button
              onClick={handleDeleteNode}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
