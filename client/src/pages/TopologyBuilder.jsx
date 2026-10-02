import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Save, ArrowLeft, LayoutTemplate, Check, Undo2, Redo2 } from "lucide-react";
import useTopologyStore from "../store/topologyStore";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { PRESET_TOPOLOGIES } from "../constants/index.js";

// custom node with all source handles
const CustomNode = ({ data }) => {
  return (
    <div style={{
      background: "#1c2128",
      color: "#e6edf3",
      border: "1px solid #30363d",
      borderRadius: "50%",
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: 600,
      position: "relative"
    }}>
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ background: "#00bcd4", width: 8, height: 8, border: "none", top: -4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#00bcd4", width: 8, height: 8, border: "none", right: -4 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "#00bcd4", width: 8, height: 8, border: "none", bottom: -4 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ background: "#00bcd4", width: 8, height: 8, border: "none", left: -4 }}
      />
      {data.label}
    </div>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = {};

/**
 * Push a pre-change snapshot onto undoStack (capped at 100) and clear redoStack.
 * Returns the updated store state slice to pass to `useTopologyStore.setState`.
 */
function buildHistoryEntry(snapshot, currentUndoStack) {
  const newUndoStack = [...currentUndoStack, snapshot];
  if (newUndoStack.length > 100) newUndoStack.shift();
  return { undoStack: newUndoStack, redoStack: [] };
}

export default function TopologyBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    topologyName,
    topologyDescription,
    isPublic,
    isLoading,
    error,
    setTopologyName,
    setTopologyDescription,
    setIsPublic,
    loadTopology,
    saveTopology,
    resetCanvas,
    undoStack,
    redoStack,
  } = useTopologyStore();

  // React Flow local state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [edgeWeight, setEdgeWeight] = useState(1);
  const [isDirected, setIsDirected] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [presetFilter, setPresetFilter] = useState("All");

  // Derived from store stack lengths
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // ── Drag-start snapshot ref ───────────────────────────────────────────────
  // Capture state once on dragStart; commit a single history entry on dragStop.
  const dragStartSnapshot = useRef(null);

  // Mutable counter for new node IDs – useRef avoids the lint rule about
  // reassigning module-level variables inside a component.
  const nodeCounterRef = useRef(1);

  const onNodeDragStart = useCallback(() => {
    const { undoStack: stack, redoStack: redo } = useTopologyStore.getState();
    dragStartSnapshot.current = {
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
      undoStack: stack,
      redoStack: redo,
    };
  }, [nodes, edges]);

  const onNodeDragStop = useCallback(() => {
    const snap = dragStartSnapshot.current;
    dragStartSnapshot.current = null;
    if (!snap) return;

    // Check whether any node actually moved
    const moved = snap.nodes.some((sn) => {
      const cur = nodes.find((n) => n.id === sn.id);
      if (!cur) return true;
      return cur.position.x !== sn.position.x || cur.position.y !== sn.position.y;
    });
    if (!moved) return;

    const newUndoStack = [...snap.undoStack, { nodes: snap.nodes, edges: snap.edges }];
    if (newUndoStack.length > 100) newUndoStack.shift();

    useTopologyStore.setState({
      nodes,
      edges,
      undoStack: newUndoStack,
      redoStack: [],
    });
  }, [nodes, edges]);

  // ── Node deletion via Delete/Backspace key ────────────────────────────────
  // React Flow fires "remove" change types. We intercept to snapshot first and
  // also prune connected edges in the same single history entry.
  const pendingDeleteRef = useRef(false);

  const handleNodesChange = useCallback((changes) => {
    const hasRemove = changes.some((c) => c.type === "remove");

    if (hasRemove && !pendingDeleteRef.current) {
      pendingDeleteRef.current = true;
      const removedIds = new Set(
        changes.filter((c) => c.type === "remove").map((c) => c.id)
      );
      const { undoStack: stack } = useTopologyStore.getState();
      const snapshot = {
        nodes: structuredClone(nodes),
        edges: structuredClone(edges),
      };
      const nextEdges = edges.filter(
        (e) => !removedIds.has(e.source) && !removedIds.has(e.target)
      );
      useTopologyStore.setState({
        ...buildHistoryEntry(snapshot, stack),
        edges: nextEdges,
      });
      setEdges(nextEdges);
      pendingDeleteRef.current = false;
    }

    onNodesChange(changes);
  }, [nodes, edges, onNodesChange, setEdges]);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const { undoStack: stack, redoStack: redo, nodes: curNodes, edges: curEdges } =
      useTopologyStore.getState();
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    const snapshot = { nodes: structuredClone(curNodes), edges: structuredClone(curEdges) };
    useTopologyStore.setState({
      nodes: prev.nodes,
      edges: prev.edges,
      undoStack: stack.slice(0, -1),
      redoStack: [...redo, snapshot],
    });
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [setNodes, setEdges]);

  // ── Redo ──────────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    const { undoStack: stack, redoStack: redoArr, nodes: curNodes, edges: curEdges } =
      useTopologyStore.getState();
    if (redoArr.length === 0) return;
    const next = redoArr[redoArr.length - 1];
    const snapshot = { nodes: structuredClone(curNodes), edges: structuredClone(curEdges) };
    const newUndoStack = [...stack, snapshot];
    if (newUndoStack.length > 100) newUndoStack.shift();
    useTopologyStore.setState({
      nodes: next.nodes,
      edges: next.edges,
      undoStack: newUndoStack,
      redoStack: redoArr.slice(0, -1),
    });
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [setNodes, setEdges]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when focus is in a text input, textarea, or contenteditable
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((ctrl && e.shiftKey && e.key === "z") || (ctrl && !e.shiftKey && e.key === "y")) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ── Load / reset on route change ──────────────────────────────────────────
  useEffect(() => {
    if (id) {
      // loadTopology clears history inside the store
      loadTopology(id).then(() => {
        const store = useTopologyStore.getState();
        setNodes(store.nodes);
        setEdges(store.edges);
      });
    } else {
      // resetCanvas clears history inside the store
      resetCanvas();
      setNodes([]);
      setEdges([]);
      nodeCounterRef.current = 1;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Canvas mutations (each pushes one history entry) ─────────────────────

  const onConnect = useCallback(
    (params) => {
      const source = params.source;
      const target = params.target;
      if (source === target) return;

      if (!isDirected) {
        const exists = edges.some(
          (e) =>
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
        );
        if (exists) return;
      } else {
        const exists = edges.some(
          (e) => e.source === source && e.target === target
        );
        if (exists) return;
      }

      const newEdge = {
        id: `${source}-${target}-${Date.now()}`,
        source,
        target,
        label: String(edgeWeight),
        data: { weight: edgeWeight },
        style: { stroke: "#00bcd4", cursor: "pointer" },
        labelStyle: { fill: "#8b949e", fontSize: 11 },
        labelBgStyle: { fill: "#161b22" },
        ...(isDirected && {
          markerEnd: { type: MarkerType.ArrowClosed, color: "#00bcd4" },
        }),
      };

      const { undoStack: stack } = useTopologyStore.getState();
      const snapshot = { nodes: structuredClone(nodes), edges: structuredClone(edges) };
      const nextEdges = addEdge(newEdge, edges);
      useTopologyStore.setState({
        edges: nextEdges,
        ...buildHistoryEntry(snapshot, stack),
      });
      setEdges(nextEdges);
    },
    [edgeWeight, edges, nodes, isDirected, setEdges]
  );

  // Click an edge to delete it
  const onEdgeClick = useCallback(
    (_evt, edge) => {
      const { undoStack: stack } = useTopologyStore.getState();
      const snapshot = { nodes: structuredClone(nodes), edges: structuredClone(edges) };
      const nextEdges = edges.filter((e) => e.id !== edge.id);
      useTopologyStore.setState({
        edges: nextEdges,
        ...buildHistoryEntry(snapshot, stack),
      });
      setEdges(nextEdges);
    },
    [nodes, edges, setEdges]
  );

  const addNode = () => {
    const { undoStack: stack } = useTopologyStore.getState();
    const snapshot = { nodes: structuredClone(nodes), edges: structuredClone(edges) };
    const nodeId = String(nodeCounterRef.current++);
    const newNode = {
      id: nodeId,
      position: { x: Math.random() * 500 + 80, y: Math.random() * 300 + 80 },
      data: { label: nodeId },
      type: "custom",
    };
    const nextNodes = [...nodes, newNode];
    useTopologyStore.setState({
      nodes: nextNodes,
      ...buildHistoryEntry(snapshot, stack),
    });
    setNodes(nextNodes);
  };

  const loadPreset = (preset) => {
    // Preset loading clears history (treat as a full canvas reset)
    resetCanvas();
    nodeCounterRef.current = preset.nodes.length + 1;
    setTopologyName(preset.name);
    setTopologyDescription(preset.description);
    const nextNodes = preset.nodes.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: n.label },
      type: "custom",
    }));
    const nextEdges = preset.edges.map((e) => ({
      id: `${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      label: String(e.weight),
      data: { weight: e.weight },
      style: { stroke: "#00bcd4", cursor: "pointer" },
      labelStyle: { fill: "#8b949e", fontSize: 11 },
      labelBgStyle: { fill: "#161b22" },
    }));
    useTopologyStore.setState({ nodes: nextNodes, edges: nextEdges });
    setNodes(nextNodes);
    setEdges(nextEdges);
    setShowPresets(false);
  };

  const handleSave = async () => {
    try {
      await saveTopology(nodes, edges);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch {
      // error shown from store
    }
  };

  const filters = ["All", "Routing", "MST", "Networking"];
  const filteredPresets =
    presetFilter === "All"
      ? PRESET_TOPOLOGIES
      : PRESET_TOPOLOGIES.filter((p) => p.category === presetFilter);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-56px)]">

        {/* sidebar */}
        <div className="w-72 min-w-72 bg-[#161b22] border-r border-[#30363d] flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-[#30363d]">
            <h2 className="text-sm font-semibold text-[#e6edf3]">Topology Builder</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">Build and save your network graph</p>
          </div>

          <div className="p-5 flex flex-col gap-4 flex-1">
            <Input
              label="Name"
              value={topologyName}
              onChange={(e) => setTopologyName(e.target.value)}
              placeholder="my_topology"
            />
            <Input
              label="Description"
              value={topologyDescription}
              onChange={(e) => setTopologyDescription(e.target.value)}
              placeholder="Optional description"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
                Edge Weight
              </label>
              <input
                type="number"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 text-sm bg-[#1c2128] border border-[#30363d] text-[#e6edf3] rounded-md outline-none focus:border-[#00bcd4] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${isPublic ? "bg-[#00bcd4]" : "bg-[#30363d]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-[#e6edf3]">Make Public</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setIsDirected(!isDirected)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${isDirected ? "bg-[#00bcd4]" : "bg-[#30363d]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDirected ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-[#e6edf3]">Directed Graph</span>
              </label>
            </div>

            {error && (
              <p className="text-xs text-[#da3633]">{error}</p>
            )}
          </div>

          {/* ── Undo / Redo toolbar ── */}
          <div className="px-5 pb-3 flex gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150
                bg-transparent border-[#30363d] text-[#8b949e]
                hover:border-[#8b949e] hover:text-[#e6edf3]
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Undo2 size={13} />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150
                bg-transparent border-[#30363d] text-[#8b949e]
                hover:border-[#8b949e] hover:text-[#e6edf3]
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Redo2 size={13} />
              Redo
            </button>
          </div>

          <div className="p-5 border-t border-[#30363d] flex flex-col gap-2">
            <Button fullWidth icon={Plus} onClick={addNode}>
              Add Node
            </Button>
            <Button
              fullWidth
              variant="outline"
              icon={LayoutTemplate}
              onClick={() => setShowPresets(true)}
            >
              Load Preset
            </Button>
            <Button
              fullWidth
              variant={savedMsg ? "success" : "primary"}
              icon={savedMsg ? Check : Save}
              onClick={handleSave}
              disabled={isLoading || !topologyName}
            >
              {isLoading ? "Saving..." : savedMsg ? "Saved!" : "Save Topology"}
            </Button>
            <Button
              fullWidth
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="px-5 pb-5">
            <div className="bg-[#1c2128] rounded-md p-3 flex flex-col gap-1">
              <p className="text-[10px] text-[#8b949e] font-medium uppercase tracking-wide mb-1">Tips</p>
              <p className="text-[10px] text-[#8b949e]">• Ctrl+Z / Cmd+Z to undo</p>
              <p className="text-[10px] text-[#8b949e]">• Ctrl+Shift+Z / Ctrl+Y to redo</p>
              <p className="text-[10px] text-[#8b949e]">• Drag node handle to connect</p>
              <p className="text-[10px] text-[#8b949e]">• Set weight before connecting</p>
              <p className="text-[10px] text-[#8b949e]">• Click an edge to delete it</p>
              <p className="text-[10px] text-[#8b949e]">• Backspace to delete selected node</p>
              <p className="text-[10px] text-[#8b949e]">• Drag nodes to reposition</p>
            </div>
          </div>
        </div>

        {/* canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            connectionMode={ConnectionMode.Loose}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            deleteKeyCode="Backspace"
          >
            <MiniMap style={{ background: "#161b22" }} nodeColor="#00bcd4" />
            <Controls />
            <Background color="#1c2128" gap={20} />
          </ReactFlow>
        </div>
      </div>

      {/* preset modal */}
      <Modal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        title="Load a preset topology"
        size="xl"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setPresetFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  presetFilter === f
                    ? "bg-[#00bcd4] text-[#0d1117] border-[#00bcd4]"
                    : "bg-transparent text-[#8b949e] border-[#30363d] hover:border-[#8b949e]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                className="bg-[#1c2128] border border-[#30363d] rounded-lg p-4 flex flex-col gap-2 hover:border-[#00bcd4]/50 transition-colors"
              >
                <div className="h-20 bg-[#0d1117] rounded-md flex items-center justify-center relative overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 200 80">
                    {preset.edges.map((e) => {
                      const from = preset.nodes.find((n) => n.id === e.from);
                      const to = preset.nodes.find((n) => n.id === e.to);
                      if (!from || !to) return null;
                      const scaleX = (x) => (x / 600) * 180 + 10;
                      const scaleY = (y) => (y / 400) * 60 + 10;
                      return (
                        <line
                          key={`${e.from}-${e.to}`}
                          x1={scaleX(from.x)} y1={scaleY(from.y)}
                          x2={scaleX(to.x)} y2={scaleY(to.y)}
                          stroke="#30363d" strokeWidth="1.5"
                        />
                      );
                    })}
                    {preset.nodes.map((n) => {
                      const scaleX = (x) => (x / 600) * 180 + 10;
                      const scaleY = (y) => (y / 400) * 60 + 10;
                      return (
                        <circle
                          key={n.id}
                          cx={scaleX(n.x)} cy={scaleY(n.y)}
                          r="8" fill="#1c2128" stroke="#00bcd4" strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>
                </div>

                <h4 className="text-xs font-semibold text-[#e6edf3]">{preset.name}</h4>
                <p className="text-[10px] text-[#8b949e] line-clamp-2">{preset.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#8b949e]">
                    {preset.nodes.length} nodes
                  </span>
                  <Button size="sm" onClick={() => loadPreset(preset)}>
                    Load
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}