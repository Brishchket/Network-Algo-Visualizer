import { create } from "zustand";
import { createTopology, getTopologyById, updateTopology } from "../api/topology.api";

const useTopologyStore = create((set, get) => ({
  nodes: [],
  edges: [],
  topologyName: "",
  topologyDescription: "",
  isPublic: false,
  currentTopologyId: null,
  isLoading: false,
  error: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setTopologyName: (name) => set({ topologyName: name }),
  setTopologyDescription: (desc) => set({ topologyDescription: desc }),
  setIsPublic: (val) => set({ isPublic: val }),

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
          type: "default"
        })),
        edges: topology.edges.map((e) => ({
          id: `${e.from}-${e.to}`,
          source: e.from,
          target: e.to,
          label: String(e.weight),
          data: { weight: e.weight }
        })),
        topologyName: topology.name,
        topologyDescription: topology.description,
        isPublic: topology.isPublic,
        currentTopologyId: id,
        isLoading: false
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
        y: n.position.y
      })),
      edges: edges.map((e) => ({
        from: e.source,
        to: e.target,
        weight: e.data?.weight || 1
      }))
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
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to save topology", isLoading: false });
      throw err;
    }
  },

  resetCanvas: () => set({
    nodes: [],
    edges: [],
    topologyName: "",
    topologyDescription: "",
    isPublic: false,
    currentTopologyId: null,
    error: null
  })
}));

export default useTopologyStore;