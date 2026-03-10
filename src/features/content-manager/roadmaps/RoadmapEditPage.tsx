"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, X, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { ManageRoadmapGraph } from "../components/ManageRoadmapGraph";
import { useRoadmapDetail } from "../api/queries";
import { useSyncRoadmapGraph } from "../api/mutations";
import { toast } from "@/shared/lib";
import type { RoadmapDetail, RoadmapNode, RoadmapEdge } from "../api/types";

export function RoadmapEditPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = Number(params.id);

  // State for edited data
  const [editedData, setEditedData] = useState<RoadmapDetail | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // React Query hooks
  const { 
    data: roadmapData, 
    isLoading,
    error 
  } = useRoadmapDetail(roadmapId);
  
  const syncRoadmapMutation = useSyncRoadmapGraph();

  // Initialize edited data when roadmap loads
  useEffect(() => {
    if (roadmapData) {
      setEditedData(roadmapData);
    }
  }, [roadmapData]);

  // Handle nodes change
  const handleNodesChange = (nodes: RoadmapNode[]) => {
    if (!editedData) return;
    
    setEditedData({
      ...editedData,
      nodes,
    });
    setHasUnsavedChanges(true);
  };

  // Handle edges change
  const handleEdgesChange = (edges: RoadmapEdge[]) => {
    if (!editedData) return;
    
    setEditedData({
      ...editedData,
      edges,
    });
    setHasUnsavedChanges(true);
  };

  // Handle metadata change
  const handleMetadataChange = (updates: { title?: string; description?: string }) => {
    if (!editedData) return;
    
    setEditedData({
      ...editedData,
      roadmap: {
        ...editedData.roadmap,
        ...updates,
      },
    });
    setHasUnsavedChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!editedData || !hasUnsavedChanges) return;

    setIsSaving(true);

    try {
      await syncRoadmapMutation.mutateAsync({
        roadmapId,
        roadmap: {
          title: editedData.roadmap.title,
          description: editedData.roadmap.description,
        },
        nodes: editedData.nodes,
        edges: editedData.edges,
      });

      setHasUnsavedChanges(false);
      toast.success("Roadmap saved successfully!", {
        description: "All changes have been synced to the database.",
      });
    } catch (error) {
      console.error("Failed to save roadmap:", error);
      toast.error("Failed to save roadmap", {
        description: "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (roadmapData) {
      setEditedData(roadmapData);
      setHasUnsavedChanges(false);
      toast.info("Changes discarded", {
        description: "Reverted to the last saved version.",
      });
    }
  };

  // Back navigation with unsaved changes warning
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    router.push("/content-roadmaps");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
          <p className="text-sm text-neutral-500">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Failed to load roadmap
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {error?.message || "Please try again later"}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!editedData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Edit Roadmap
            </h1>
            <p className="text-sm text-neutral-600">
              {editedData.roadmap.title}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <>
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                You have unsaved changes
              </p>
              <p className="text-sm text-yellow-700">
                Don't forget to save your changes before leaving this page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Metadata Editor */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">
          Roadmap Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={editedData.roadmap.title}
              onChange={(e) => handleMetadataChange({ title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter roadmap title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              value={editedData.roadmap.description || ''}
              onChange={(e) => handleMetadataChange({ description: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
              placeholder="Enter roadmap description"
            />
          </div>
        </div>
      </div>

      {/* Graph Editor */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-neutral-100 p-6">
          <h2 className="text-lg font-bold text-neutral-900">
            Roadmap Graph Editor
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Add nodes, create connections, and manage learning paths
          </p>
        </div>
        
        <ManageRoadmapGraph
          roadmapId={roadmapId}
          initialNodes={editedData.nodes}
          initialEdges={editedData.edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-600">Total Nodes</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {editedData.nodes.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-600">Total Connections</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {editedData.edges.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-600">Total Contents</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {editedData.nodes.reduce((sum, node) => sum + (node.contents?.length || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
