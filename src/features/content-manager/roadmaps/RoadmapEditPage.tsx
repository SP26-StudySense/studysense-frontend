"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Save, Plus, Info, Loader2, Edit } from "lucide-react";
import Link from "next/link";
import { NodeContentPanel } from "./NodeContentPanel";
import { ManageRoadmapGraph } from "../components/ManageRoadmapGraph";
import { 
  ContentManagerRoadmapDetail, 
  RoadmapNodeDTO, 
  RoadmapEdgeDTO, 
  NodeContentItemDTO 
} from "../types";

interface RoadmapEditPageProps {
  roadmapDetail: ContentManagerRoadmapDetail;
  nodeContents: Record<number, NodeContentItemDTO[]>;
}

export function RoadmapEditPage({ roadmapDetail, nodeContents: initialNodeContents }: RoadmapEditPageProps) {
  const [roadmap, setRoadmap] = useState(roadmapDetail.roadmap);
  const [nodes, setNodes] = useState<RoadmapNodeDTO[]>(roadmapDetail.nodes);
  const [edges, setEdges] = useState<RoadmapEdgeDTO[]>(roadmapDetail.edges);
  const [nodeContents, setNodeContents] = useState<Record<number, NodeContentItemDTO[]>>(initialNodeContents);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  // Track changes
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Node Content Handlers
  const handleAddContent = useCallback((nodeId: number, content: Omit<NodeContentItemDTO, 'id' | 'nodeId'>) => {
    const newContent: NodeContentItemDTO = {
      ...content,
      id: Date.now(), // Mock ID generation
      nodeId,
    };

    setNodeContents(prev => ({
      ...prev,
      [nodeId]: [...(prev[nodeId] || []), newContent],
    }));
    markAsChanged();
  }, [markAsChanged]);

  const handleUpdateContent = useCallback((nodeId: number, contentId: number, updates: Partial<NodeContentItemDTO>) => {
    setNodeContents(prev => ({
      ...prev,
      [nodeId]: (prev[nodeId] || []).map(c => 
        c.id === contentId ? { ...c, ...updates } : c
      ),
    }));
    markAsChanged();
  }, [markAsChanged]);

  const handleDeleteContent = useCallback((nodeId: number, contentId: number) => {
    setNodeContents(prev => ({
      ...prev,
      [nodeId]: (prev[nodeId] || []).filter(c => c.id !== contentId),
    }));
    markAsChanged();
  }, [markAsChanged]);

  // Node Handlers
  const handleAddNode = useCallback(() => {
    const newNode: RoadmapNodeDTO = {
      id: Date.now(),
      roadmapId: roadmap.id,
      title: 'New Node',
      description: null,
      difficulty: 'Beginner',
      orderNo: nodes.length + 1,
    };
    setNodes(prev => [...prev, newNode]);
    markAsChanged();
  }, [roadmap.id, nodes.length, markAsChanged]);

  const handleEditNode = useCallback((node: RoadmapNodeDTO) => {
    const title = prompt('Edit node title:', node.title);
    if (!title || title === node.title) return;
    
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title } : n));
    markAsChanged();
  }, [markAsChanged]);

  const handleUpdateNode = useCallback((nodeId: number, updates: Partial<RoadmapNodeDTO>) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
    markAsChanged();
  }, [markAsChanged]);

  const handleDeleteNode = useCallback((nodeId: number) => {
    if (!confirm('Delete this node? All its contents and connections will be removed.')) return;
    
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId));
    setNodeContents(prev => {
      const { [nodeId]: _, ...rest } = prev;
      return rest;
    });
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    markAsChanged();
  }, [selectedNodeId, markAsChanged]);

  // Edge Handlers
  const handleAddEdge = useCallback((fromNodeId: number, toNodeId: number) => {
    const newEdge: RoadmapEdgeDTO = {
      id: Date.now(),
      roadmapId: roadmap.id,
      fromNodeId,
      toNodeId,
      edgeType: 0, // Prerequisite
      orderNo: edges.length + 1,
    };
    setEdges(prev => [...prev, newEdge]);
    markAsChanged();
  }, [roadmap.id, edges.length, markAsChanged]);

  const handleDeleteEdge = useCallback((edgeId: number) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    markAsChanged();
  }, [markAsChanged]);

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement API calls to save
      console.log('Saving roadmap changes:', {
        roadmap,
        nodes,
        edges,
        nodeContents,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/content-roadmaps"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{roadmap.title}</h1>
            <p className="text-sm text-neutral-600">
              Version {roadmap.version} • {nodes.length} nodes • {edges.length} connections
              {hasUnsavedChanges && <span className="text-amber-600 ml-2">• Unsaved changes</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddNode}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>

      {/* Roadmap Info Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Roadmap Information</h3>
            <p className="text-sm text-neutral-600">{roadmap.description}</p>
          </div>
          <button className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
            <Info className="inline h-4 w-4 mr-1" />
            Edit Info
          </button>
        </div>

        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-neutral-500">Subject:</span>{' '}
            <span className="font-medium text-neutral-900">{roadmapDetail.subjectName}</span>
          </div>
          <div>
            <span className="text-neutral-500">Created:</span>{' '}
            <span className="font-medium text-neutral-900">
              {new Date(roadmap.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Roadmap Graph */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <ManageRoadmapGraph
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodeSelect={(node) => setSelectedNodeId(node.id)}
          onNodeDelete={handleDeleteNode}
          onNodeEdit={handleEditNode}
          className="h-[500px]"
        />
      </div>

      {/* Node Content Editor */}
      {selectedNode ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Node Content: {selectedNode.title}</h3>
              <p className="text-sm text-neutral-600">Manage learning materials for this node</p>
            </div>
            <button
              onClick={handleEditNode.bind(null, selectedNode)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              <Edit className="inline h-4 w-4 mr-1" />
              Edit Node
            </button>
          </div>
          
          <NodeContentPanel
            nodeId={selectedNode.id}
            nodeTitle={selectedNode.title}
            contents={nodeContents[selectedNode.id] || []}
            onAdd={(content) => handleAddContent(selectedNode.id, content)}
            onUpdate={(id, updates) => handleUpdateContent(selectedNode.id, id, updates)}
            onDelete={(id) => handleDeleteContent(selectedNode.id, id)}
          />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <Info className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Node Selected</h3>
          <p className="text-sm text-neutral-600">
            Click on a node in the graph above to view and manage its content
          </p>
        </div>
      )}

      {/* Connections Section */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Node Connections</h3>
            <p className="text-sm text-neutral-600">{edges.length} connection{edges.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {edges.length > 0 ? (
          <div className="space-y-2">
            {edges.map((edge) => {
              const fromNode = nodes.find(n => n.id === edge.fromNodeId);
              const toNode = nodes.find(n => n.id === edge.toNodeId);
              
              return (
                <div
                  key={edge.id}
                  className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-neutral-900">
                      {fromNode?.title || 'Unknown'}
                    </span>
                    <span className="text-neutral-400">→</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {toNode?.title || 'Unknown'}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {edge.edgeType === 0 ? 'Prerequisite' : edge.edgeType === 1 ? 'Recommended' : 'Next'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteEdge(edge.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-neutral-500">
            No connections defined yet
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-xl bg-gradient-to-r from-[#fec5fb]/10 to-[#00bae2]/10 p-4 border border-[#00bae2]/20">
        <p className="text-sm text-neutral-700">
          <strong>Tips:</strong> Click nodes in the graph to manage their content. Hover over nodes to see edit/delete buttons. 
          Use zoom controls to navigate the graph. Click "Save Changes" when you're done editing.
        </p>
      </div>
    </div>
  );
}
