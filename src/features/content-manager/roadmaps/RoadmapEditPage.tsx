"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowLeft, Save, Plus, Info, Loader2, X } from "lucide-react";
import Link from "next/link";
import { NodeContentPanel } from "./NodeContentPanel";
import { ManageRoadmapGraph  } from "../components/ManageRoadmapGraph";
import {
  ContentManagerRoadmapDetail,
  RoadmapNodeDTO,
  RoadmapEdgeDTO,
  NodeContentItemDTO
} from "../types";
import { cn } from "@/shared/lib";

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

  // Add-connection UI state
  const [newConnFrom, setNewConnFrom] = useState<number | ''>('');
  const [newConnTo, setNewConnTo] = useState<number | ''>('');
  const [newConnType, setNewConnType] = useState<0 | 1 | 2>(0);

  // Edit roadmap info modal
  const [isEditingRoadmapInfo, setIsEditingRoadmapInfo] = useState(false);
  const [roadmapInfoForm, setRoadmapInfoForm] = useState({
    title: roadmap.title,
    description: roadmap.description || ''
  });

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  const markAsChanged = useCallback(() => setHasUnsavedChanges(true), []);

  // Filter connections by selected node
  const filteredEdges = useMemo(() => {
    if (!selectedNodeId) return edges;
    return edges.filter(edge => 
      edge.fromNodeId === selectedNodeId || edge.toNodeId === selectedNodeId
    );
  }, [edges, selectedNodeId]);

  // Node Content Handlers
  const handleAddContent = useCallback((nodeId: number, content: Omit<NodeContentItemDTO, 'id' | 'nodeId'>) => {
    const newContent: NodeContentItemDTO = { ...content, id: Date.now(), nodeId };
    setNodeContents(prev => ({ ...prev, [nodeId]: [...(prev[nodeId] || []), newContent] }));
    markAsChanged();
  }, [markAsChanged]);

  const handleUpdateContent = useCallback((nodeId: number, contentId: number, updates: Partial<NodeContentItemDTO>) => {
    setNodeContents(prev => ({ ...prev, [nodeId]: (prev[nodeId] || []).map(c => c.id === contentId ? { ...c, ...updates } : c) }));
    markAsChanged();
  }, [markAsChanged]);

  const handleDeleteContent = useCallback((nodeId: number, contentId: number) => {
    setNodeContents(prev => ({ ...prev, [nodeId]: (prev[nodeId] || []).filter(c => c.id !== contentId) }));
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
  const handleAddEdge = useCallback((fromNodeId: number, toNodeId: number, edgeType: 0 | 1 | 2 = 0) => {
    if (fromNodeId === toNodeId) {
      alert('Cannot connect a node to itself.');
      return;
    }
    if (edges.some(e => e.fromNodeId === fromNodeId && e.toNodeId === toNodeId && e.edgeType === edgeType)) {
      alert('This connection already exists.');
      return;
    }
    const newEdge: RoadmapEdgeDTO = {
      id: Date.now(),
      roadmapId: roadmap.id,
      fromNodeId,
      toNodeId,
      edgeType,
      orderNo: edges.length + 1,
    };
    setEdges(prev => [...prev, newEdge]);
    markAsChanged();
  }, [edges, roadmap.id, markAsChanged]);

  const handleDeleteEdge = useCallback((edgeId: number) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    markAsChanged();
  }, [markAsChanged]);

  // Roadmap info handlers
  const handleSaveRoadmapInfo = () => {
    setRoadmap(prev => ({
      ...prev,
      title: roadmapInfoForm.title,
      description: roadmapInfoForm.description
    }));
    setIsEditingRoadmapInfo(false);
    markAsChanged();
  };

  // Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Persist to API
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

  // Handle node selection - toggle if clicking same node
  const handleNodeSelect = useCallback((node: RoadmapNodeDTO) => {
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  // Prefill "from" with selected node
  const effectiveFrom = newConnFrom === '' && selectedNodeId ? selectedNodeId : newConnFrom;

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
          <button 
            onClick={() => {
              setRoadmapInfoForm({ title: roadmap.title, description: roadmap.description || '' });
              setIsEditingRoadmapInfo(true);
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
          >
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

      {/* Graph + Connections side-by-side */}
      <div className="grid grid-cols-12 gap-6">
        {/* Graph */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <ManageRoadmapGraph
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            className="h-[560px]"
          />
        </div>

        {/* Connections Panel - Fixed height with scroll */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col h-[560px]">
          <div className="p-4 border-b border-neutral-200 bg-white shrink-0">
            <h3 className="text-base font-bold text-neutral-900">Node Connections</h3>
            <p className="text-xs text-neutral-600 mt-1">
              {selectedNodeId ? (
                <>Showing {filteredEdges.length} connection{filteredEdges.length !== 1 ? 's' : ''} for selected node</>
              ) : (
                <>{edges.length} total connection{edges.length !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>

          {/* Add Connection Form - Scrollable area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {/* Compact form */}
              <div className="space-y-2">
                <select
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs"
                  value={effectiveFrom === '' ? '' : effectiveFrom}
                  onChange={(e) => setNewConnFrom(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">{selectedNodeId ? 'From: Selected Node' : 'From Node'}</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>

                <select
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs"
                  value={newConnTo === '' ? '' : newConnTo}
                  onChange={(e) => setNewConnTo(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">To Node</option>
                  {nodes
                    .filter(n => (effectiveFrom ? n.id !== effectiveFrom : true))
                    .map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                </select>

                <select
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs"
                  value={newConnType}
                  onChange={(e) => setNewConnType(Number(e.target.value) as 0 | 1 | 2)}
                >
                  <option value={0}>Prerequisite</option>
                  <option value={1}>Recommended</option>
                  <option value={2}>Next</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const from = (effectiveFrom as number) || 0;
                  const to = (newConnTo as number) || 0;
                  if (!from || !to) { alert('Please select both nodes.'); return; }
                  handleAddEdge(from, to, newConnType);
                  setNewConnTo('');
                }}
                className="w-full rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
              >
                <Plus className="inline h-3 w-3 mr-1" />
                Add Connection
              </button>

              {/* Connections List - Compact */}
              {filteredEdges.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-neutral-700 pb-1">
                    {selectedNodeId ? 'Related Connections' : 'Current Connections'}
                  </div>
                  {filteredEdges.map((edge) => {
                    const fromNode = nodes.find(n => n.id === edge.fromNodeId);
                    const toNode = nodes.find(n => n.id === edge.toNodeId);
                    const isFromSelected = edge.fromNodeId === selectedNodeId;
                    const isToSelected = edge.toNodeId === selectedNodeId;
                    
                    return (
                      <div key={edge.id} className={cn(
                        "group rounded-lg border p-2 hover:bg-white hover:shadow-sm transition-all",
                        (isFromSelected || isToSelected) ? "bg-blue-50 border-blue-200" : "bg-neutral-50 border-neutral-200"
                      )}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className={cn(
                                "font-medium truncate",
                                isFromSelected ? "text-blue-900" : "text-neutral-900"
                              )}>
                                {fromNode?.title || 'Unknown'}
                              </span>
                              <span className="text-neutral-400 shrink-0">→</span>
                              <span className={cn(
                                "font-medium truncate",
                                isToSelected ? "text-blue-900" : "text-neutral-900"
                              )}>
                                {toNode?.title || 'Unknown'}
                              </span>
                            </div>
                            <span className={cn(
                              "inline-block mt-1 rounded-full px-2 py-0.5 text-[10px]",
                              (isFromSelected || isToSelected) ? "bg-blue-200 text-blue-700" : "bg-neutral-200 text-neutral-600"
                            )}>
                              {edge.edgeType === 0 ? 'Prerequisite' : edge.edgeType === 1 ? 'Recommended' : 'Next'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteEdge(edge.id)}
                            className="opacity-0 group-hover:opacity-100 rounded p-1 text-red-600 hover:bg-red-50 transition-all shrink-0"
                            title="Delete"
                          >
                            <Plus className="h-3 w-3 rotate-45" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-neutral-500">
                  {selectedNodeId ? 'No connections for this node' : 'No connections yet'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Node Content Editor - Below graph */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {selectedNode ? (
          <NodeContentPanel
            nodeId={selectedNode.id}
            nodeTitle={selectedNode.title}
            nodeDescription={selectedNode.description}
            nodeDifficulty={selectedNode.difficulty}
            contents={nodeContents[selectedNode.id] || []}
            onAdd={(content) => handleAddContent(selectedNode.id, content)}
            onUpdate={(id, updates) => handleUpdateContent(selectedNode.id, id, updates)}
            onDelete={(id) => handleDeleteContent(selectedNode.id, id)}
            onUpdateNode={(updates) => handleUpdateNode(selectedNode.id, updates)}
            onDeleteNode={() => handleDeleteNode(selectedNode.id)}
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
            <Info className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Node Selected</h3>
            <p className="text-sm text-neutral-600">
              Click on a node in the graph above to view and manage its content
            </p>
          </div>
        )}
      </div>

      {/* Edit Roadmap Info Modal */}
      {isEditingRoadmapInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-neutral-200 shadow-2xl">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 m-0">Edit Roadmap Information</h2>
                <button onClick={() => setIsEditingRoadmapInfo(false)} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Roadmap Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roadmapInfoForm.title}
                  onChange={(e) => {
                    return setRoadmapInfoForm(prev => ({ ...prev, title: e.target.value }));
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  placeholder="Enter roadmap title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                <textarea
                  value={roadmapInfoForm.description}
                  onChange={(e) => {
                    return setRoadmapInfoForm(prev => ({ ...prev, description: e.target.value }));
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
                  placeholder="Describe the roadmap..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditingRoadmapInfo(false)}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRoadmapInfo}
                  disabled={!roadmapInfoForm.title.trim()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
