"use client";

import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { RoadmapGraph, RoadmapEdge } from "@/features/roadmaps/components/RoadmapGraph";
import { RoadmapNodeData } from "@/features/roadmaps/components/RoadmapNode";
import { AdminNodeList } from "./components/AdminNodeList";

interface AdminRoadmapPageProps {
  initialNodes?: RoadmapNodeData[];
  initialEdges?: RoadmapEdge[];
}

export function AdminRoadmapPage({
  initialNodes = [],
  initialEdges = [],
}: AdminRoadmapPageProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(
    null
  );

  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
  };

  const handleAddNode = () => {
    console.log("Add node");
    // UI only - in real implementation would open a modal/form
  };

  const handleEditNode = (node: RoadmapNodeData) => {
    console.log("Edit node:", node);
    // UI only - in real implementation would open edit modal
  };

  const handleDeleteNode = (nodeId: string) => {
    console.log("Delete node:", nodeId);
    // UI only - in real implementation would show confirmation
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left - Graph */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Search & Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full rounded-2xl border border-neutral-200 bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition-all backdrop-blur-xl placeholder:text-neutral-400 focus:border-[#fec5fb] focus:ring-4 focus:ring-[#fec5fb]/10"
            />
          </div>
          <button className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 px-5 py-3 text-sm font-medium text-neutral-700 backdrop-blur-xl transition-all hover:bg-white">
            <Filter className="h-4 w-4" />
            All Levels
          </button>
          <button
            onClick={handleAddNode}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#fec5fb] to-[#ff9bf5] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
        </div>

        {/* Graph */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <RoadmapGraph
            nodes={initialNodes}
            edges={initialEdges}
            selectedNodeId={selectedNode?.id || null}
            onNodeSelect={handleNodeSelect}
            className="h-full"
          />
        </div>
      </div>

      {/* Right - Node List Panel */}
      <div className="w-96">
        <AdminNodeList
          nodes={initialNodes}
          selectedNodeId={selectedNode?.id || null}
          onEditNode={handleEditNode}
          onDeleteNode={handleDeleteNode}
          onSelectNode={handleNodeSelect}
        />
      </div>
    </div>
  );
}
