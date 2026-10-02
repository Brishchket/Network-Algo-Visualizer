import { create } from "zustand";
import { createTopology, getTopologyById, updateTopology } from "../api/topology.api";

const MAX_HISTORY = 100;

/** Deep-clone nodes/edges. All values are plain JSON-serialisable objects. */
const cloneSnapshot = (nodes, edges) => ({
  nodes: structuredClone(nodes),
  edges: structuredClone(edges),
});

const useTopologyStore = create((set, get) => ({
  nodes: [],
  edges: [],
  topologyName: "",
  topologyDescription: "",
  isPublic: false,
  currentTopologyId: null,
  isLoading: false,
  error: null,

  // ── History ──────────────────────────────────────────────────────────────
  undoStack: [],
  redoStack: [],

  /** True when there is something to undo. */
  get canUndo() { return get().undoStack.length > 0; },
  /** True when there is something to redo. */
  get canRedo() { return get().redoStack.length > 0; },

  /**
   * Apply a mutation through history.
   * `updater` receives (nodes, edges) and must return { nodes, edges }.
   */
  performTopologyChange: (updater) => {
    const { nodes, edges, undoStack } = get();
    const snapshot = cloneSnapshot(nodes, edges);
    const { nodes: nextNodes, edges: nextEdges } = updater(nodes, edges);
    const newStack = [...undoStack, snapshot];
    if (newStack.length > MAX_HISTORY) newStack.shift();
    set({
      nodes: nextNodes,
      edges: nextEdges,
      undoStack: newStack,
      redoStack: [],
    });
  },

  undo: () => {
    const { nodes, edges, undoStack, redoStack } = get();
    if (undoStack.length === 0) return;
    const snapshot = cloneSnapshot(nodes, edges);
    const prev = undoStack[undoStack.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, snapshot],
    });
  },

  redo: () => {
    const { nodes, edges, undoStack, redoStack } = get();
    if (redoStack.length === 0) return;
    const snapshot = cloneSnapshot(nodes, edges);
    const next = redoStack[redoStack.length - 1];
    set({
      nodes: next.nodes,
      edges: next.edges,
      undoStack: [...undoStack, snapshot],
      redoStack: redoStack.slice(0, -1),
    });
  },

  clearHistory: () => set({ undoStack: [], redoStack: [] }),

  // ── Raw setters (no history) – for React Flow internal sync and remote changes ─
  setNodesRaw: (nodes) => set({ nodes }),
  setEdgesRaw: (edges) => set({ edges }),

  // ── Named setters (kept for metadata fields, not history-tracked) ─────────
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setTopologyName: (name) => set({ topologyName: name }),
  setTopologyDescription: (desc) => set({ topologyDescription: desc }),
  setIsPublic: (val) => set({ isPublic: val }),

  // ── Server actions ────────────────────────────────────────────────────────
  loadTopology: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getTopologyById(id);
      const topology = res.data.data;
      set({
        nodes: topology.nodes.map((n) => ({
          id: n.id,
          position: { x: n.x, y: n.y },
          data: { label: n.label || n.id },
          type: "custom",
        })),
        edges: topology.edges.map((e) => ({
          id: `${e.from}-${e.to}`,
          source: e.from,
          target: e.to,
          label: String(e.weight),
          data: { weight: e.weight },
        })),
        topologyName: topology.name,
        topologyDescription: topology.description,
        isPublic: topology.isPublic,
        currentTopologyId: id,
        isLoading: false,
        // Clear history when loading a different topology
        undoStack: [],
        redoStack: [],
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load topology", isLoading: false });
    }
  },

  saveTopology: async (nodes, edges) => {
    const { topologyName, topologyDescription, isPublic, currentTopologyId } = get();

    const payload = {
      name: topologyName,
      description: topologyDescription,
      isPublic,
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        x: n.position.x,
        y: n.position.y,
      })),
      edges: edges.map((e) => ({
        from: e.source,
        to: e.target,
        weight: e.data?.weight || 1,
      })),
    };

    set({ isLoading: true, error: null });
    try {
      let res;
      if (currentTopologyId) {
        res = await updateTopology(currentTopologyId, payload);
      } else {
        res = await createTopology(payload);
        set({ currentTopologyId: res.data.data._id });
      }
      set({ isLoading: false });
      // NOTE: saving does NOT clear history (per spec)
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to save topology", isLoading: false });
      throw err;
    }
  },

  resetCanvas: () =>
    set({
      nodes: [],
      edges: [],
      topologyName: "",
      topologyDescription: "",
      isPublic: false,
      currentTopologyId: null,
      error: null,
      // Clear history on full canvas reset
      undoStack: [],
      redoStack: [],
    }),
}));

export default useTopologyStore;