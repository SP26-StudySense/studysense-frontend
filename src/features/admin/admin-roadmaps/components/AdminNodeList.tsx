"use client";

import { Edit, Trash2 } from "lucide-react";
import { RoadmapNodeData } from "@/features/roadmaps/components/RoadmapNode";

interface AdminNodeListProps {
  nodes: RoadmapNodeData[];
  selectedNodeId: string | null;
  onEditNode: (node: RoadmapNodeData) => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: RoadmapNodeData) => void;
}

export function AdminNodeList({
  nodes,
  selectedNodeId,
  onEditNode,
  onDeleteNode,
  onSelectNode,
}: AdminNodeListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "not_started":
        return "bg-yellow-500";
      case "locked":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "Done";
      case "in_progress":
        return "In Progress";
      case "not_started":
        return "Not Started";
      case "locked":
        return "Locked";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="border-b border-neutral-200/60 p-4">
        <h3 className="font-semibold text-neutral-900">Roadmap Nodes</h3>
        <p className="text-xs text-neutral-600">{nodes.length} total nodes</p>
      </div>
      <div className="flex-1 divide-y divide-neutral-200/60 overflow-y-auto">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm text-neutral-500">
              No nodes yet. Click &quot;Add Node&quot; to create one.
            </p>
          </div>
        ) : (
          nodes.map((node) => (
            <div
              key={node.id}
              className={`cursor-pointer px-4 py-3 transition-colors hover:bg-neutral-50/50 ${
                selectedNodeId === node.id ? "bg-[#fec5fb]/5" : ""
              }`}
              onClick={() => onSelectNode(node)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 flex-shrink-0 rounded-full ${getStatusColor(
                        node.status
                      )}`}
                    />
                    <p className="text-sm font-medium text-neutral-900">
                      {node.title}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                      {getStatusLabel(node.status)}
                    </span>
                    <span>
                      {node.completedTasks}/{node.totalTasks} tasks
                    </span>
                    <span>•</span>
                    <span>{node.duration} min</span>
                    <span>•</span>
                    <span className="capitalize">{node.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNode(node);
                    }}
                    className="rounded-lg p-1.5 text-neutral-600 transition-all hover:bg-neutral-100"
                    title="Edit node"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50"
                    title="Delete node"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
