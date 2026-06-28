import { create } from "zustand";
import { getTopologyById } from "../api/topology.api";
import { createRun } from "../api/run.api";
import * as algoApi from "../api/algorithm.api";

const algoFnMap = {
  bfs: algoApi.runBFS,
  dfs: algoApi.runDFS,
  dijkstra: algoApi.runDijkstra,
  bellmanFord: algoApi.runBellmanFord,
  prim: algoApi.runPrim,
  kruskal: algoApi.runKruskal,
  distanceVector: algoApi.runDistanceVector,
  linkState: algoApi.runLinkState,
  failureSimulation: algoApi.runFailureSimulation
};

const useVisualizerStore = create((set, get) => ({
  topology: null,
  nodes: [],
  edges: [],
  selectedAlgorithm: "bfs",
  startNode: "",
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 800,
  result: null,
  isLoading: false,
  error: null,
  hasRun: false,
  lastRunId: null,

  setSelectedAlgorithm: (algo) => set({ selectedAlgorithm: algo, steps: [], currentStepIndex: -1, hasRun: false, lastRunId: null }),
  setStartNode: (node) => set({ startNode: node }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  loadTopology: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getTopologyById(id);
      const topology = res.data.data;
      set({
        topology,
        nodes: topology.nodes,
        edges: topology.edges,
        startNode: topology.nodes[0]?.id || "",
        isLoading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load topology", isLoading: false });
    }
  },

  runAlgorithm: async () => {
    const { topology, selectedAlgorithm, startNode, nodes, edges } = get();
    if (!topology) return;

    set({ isLoading: true, error: null, steps: [], currentStepIndex: -1, hasRun: false, lastRunId: null });

    try {
      const algoFn = algoFnMap[selectedAlgorithm];
      const needsStartNode = ["bfs", "dfs", "dijkstra", "bellmanFord", "prim"].includes(selectedAlgorithm);

      const payload = {
        nodes: nodes.map((n) => ({ id: n.id })),
        edges: edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight })),
        ...(needsStartNode && { startNode })
      };

      const res = await algoFn(payload);
      const { steps, result } = res.data.data;

      const runRes = await createRun({
        topologyId: topology._id,
        algorithmType: selectedAlgorithm,
        startNode,
        steps,
        result
      });

      set({
        steps,
        result,
        currentStepIndex: 0,
        hasRun: true,
        isLoading: false,
        lastRunId: runRes.data.data._id
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Algorithm failed", isLoading: false });
    }
  },

  stepForward: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  reset: () => set({ currentStepIndex: 0, isPlaying: false }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  resetVisualizer: () => set({
    topology: null,
    nodes: [],
    edges: [],
    selectedAlgorithm: "bfs",
    startNode: "",
    steps: [],
    currentStepIndex: -1,
    isPlaying: false,
    result: null,
    isLoading: false,
    error: null,
    hasRun: false,
    lastRunId: null
  })
}));

export default useVisualizerStore;