import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, { Controls, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play, Pause, SkipBack, SkipForward,
  RotateCcw, Share2, ArrowLeft, ChevronRight,
  Trash2, Clock, Zap, ChevronDown
} from "lucide-react";
import useVisualizerStore from "../store/visualizerStore";
import { generateShareLink } from "../api/share.api";
import {
  getMyRuns,
  getRunById,
  deleteRun
} from "../api/run.api";
import {
  getMyTopologies,
  getPublicTopologies
} from "../api/topology.api";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import NodePill from "../components/ui/NodePill";
import Breadcrumb from "../components/ui/BreadCrumb.jsx";
import { ALGORITHMS } from "../constants/index.js";

const nodeTypes = {};
const edgeTypes = {};

// Estimate compute time based on algorithm + node count
function estimateCompute(algorithm, nodeCount) {
  const base = { bfs: 0.3, dfs: 0.3, dijkstra: 0.8, bellman_ford: 1.2, prim: 1.0, kruskal: 0.9, dvr: 2.1, floyd_warshall: 3.5 };
  const factor = base[algorithm] ?? 1.0;
  return (factor * Math.log2(nodeCount + 1) * 0.4).toFixed(1);
}

export default function Run() {
  const { id } = useParams(); // topology ID
  const navigate = useNavigate();
  const playIntervalRef = useRef(null);

  const {
    topology,
    nodes,
    edges,
    selectedAlgorithm,
    startNode,
    steps,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    result,
    isLoading,
    error,
    hasRun,
    lastRunId,
    setSelectedAlgorithm,
    setStartNode,
    setPlaybackSpeed,
    loadTopology,
    runAlgorithm,
    stepForward,
    stepBackward,
    reset,
    play,
    pause,
    resetVisualizer
  } = useVisualizerStore();

  // Share state
  const [shareToken, setShareToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Past runs state (getMyRuns + getRunById + deleteRun)
  const [pastRuns, setPastRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [deletingRunId, setDeletingRunId] = useState(null);
  const [showRunsPanel, setShowRunsPanel] = useState(false);

  // Topology switcher state (driven by getMyRuns for topology list)
  const [savedTopologies, setSavedTopologies] = useState([]);
  const [topologiesLoading, setTopologiesLoading] = useState(false);
  const [showTopologyDropdown, setShowTopologyDropdown] = useState(false);
  const [selectedTopologyId, setSelectedTopologyId] = useState(id);

  // Load topology on mount / when selectedTopologyId changes
  useEffect(() => {
    if (selectedTopologyId) loadTopology(selectedTopologyId);
    return () => resetVisualizer();
  }, [selectedTopologyId]);

  // Fetch all saved topologies (private + public) for the switcher
  // and separately fetch past runs for the "Previous Runs" panel
  useEffect(() => {
    const fetchData = async () => {
      setTopologiesLoading(true);
      try {
        // Fetch private + public topologies in parallel for the switcher
        const [myRes, publicRes, runsRes] = await Promise.allSettled([
          getMyTopologies(),
          getPublicTopologies(),
          getMyRuns(),
        ]);

        // Merge and deduplicate topologies
        const myTopos = myRes.status === "fulfilled" ? (myRes.value.data?.data ?? []) : [];
        const pubTopos = publicRes.status === "fulfilled" ? (publicRes.value.data?.data ?? []) : [];
        const seen = new Set();
        const merged = [];
        [...myTopos, ...pubTopos].forEach((t) => {
          if (!seen.has(t._id)) {
            seen.add(t._id);
            merged.push(t);
          }
        });
        setSavedTopologies(merged);

        // Past runs for the "Previous Runs" collapsible panel
        const runs = runsRes.status === "fulfilled" ? (runsRes.value.data?.data ?? []) : [];
        setPastRuns(runs);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setTopologiesLoading(false);
      }
    };
    fetchData();
  }, []);

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const state = useVisualizerStore.getState();
        if (state.currentStepIndex >= state.steps.length - 1) {
          state.pause();
        } else {
          state.stepForward();
        }
      }, playbackSpeed);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, playbackSpeed]);

  // Load a specific past run into playback view
  const handleLoadRun = async (runId) => {
    setRunsLoading(true);
    try {
      const res = await getRunById(runId);
      const run = res.data?.data;
      if (!run) return;
      // Navigate to that run's topology so the store reloads correctly
      navigate(`/run/${run.topology._id}`);
      // If your store supports loading a prebuilt run snapshot, call it here:
      // loadRunSnapshot(run);
    } catch (err) {
      console.error("Failed to load run:", err);
    } finally {
      setRunsLoading(false);
      setShowRunsPanel(false);
    }
  };

  // Delete a past run
  const handleDeleteRun = async (runId, e) => {
    e.stopPropagation();
    setDeletingRunId(runId);
    try {
      await deleteRun(runId);
      setPastRuns((prev) => prev.filter((r) => r._id !== runId));
    } catch (err) {
      console.error("Failed to delete run:", err);
    } finally {
      setDeletingRunId(null);
    }
  };

  // Switch topology from the dropdown
  const handleSwitchTopology = (topoId) => {
    setSelectedTopologyId(topoId);
    setShowTopologyDropdown(false);
  };

  // Share current run
  const handleShare = async () => {
    setShareLoading(true);
    try {
      const res = await generateShareLink({ resourceType: "Run", resourceId: lastRunId });
      setShareToken(res.data.data.shareToken);
      setShowShareModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStep = steps[currentStepIndex];
  const selectedAlgoMeta = ALGORITHMS.find((a) => a.value === selectedAlgorithm);
  const estCompute = estimateCompute(selectedAlgorithm, nodes.length);

  // Runs filtered to the currently selected topology
  const runsForTopology = pastRuns.filter(
    (r) => r.topology?._id === selectedTopologyId
  );

  const rfNodes = nodes.map((n) => {
    let bg = "#1c2128";
    let border = "#30363d";
    if (currentStep) {
      if (currentStep.node === n.id) { bg = "#00bcd4"; border = "#00bcd4"; }
      else if (currentStep.meta?.visited?.includes(n.id)) { bg = "#238636"; border = "#238636"; }
      else if (currentStep.meta?.queue?.map?.(q => q.node || q)?.includes(n.id)) { bg = "#f0a000"; border = "#f0a000"; }
      else if (currentStep.meta?.inMST?.includes(n.id)) { bg = "#238636"; border = "#238636"; }
    }
    return {
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: n.label || n.id },
      style: {
        background: bg,
        color: bg === "#1c2128" ? "#e6edf3" : "#0d1117",
        border: `1px solid ${border}`,
        borderRadius: "50%",
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 600,
        transition: "all 0.3s"
      }
    };
  });

  const rfEdges = edges.map((e) => {
    const isActive =
      (currentStep?.edge?.from === e.from && currentStep?.edge?.to === e.to) ||
      (currentStep?.edge?.from === e.to && currentStep?.edge?.to === e.from);
    return {
      id: `${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      label: String(e.weight),
      style: { stroke: isActive ? "#00bcd4" : "#30363d", strokeWidth: isActive ? 2 : 1 },
      labelStyle: { fill: "#8b949e", fontSize: 11 },
      labelBgStyle: { fill: "#161b22" },
      animated: isActive
    };
  });

  return (
    <AppLayout showRun={false}>
      {!hasRun ? (
        /* ── SETUP VIEW ─────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-8">
          <div className="w-full max-w-2xl">
            <Breadcrumb items={["Workspace", "Run", "Setup"]} />

            <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              {/* cyan top accent */}
              <div className="h-0.5 bg-[#00bcd4]" />

              <div className="p-8">
                <h2 className="text-xl font-bold text-[#e6edf3] mb-1">Execution Parameters</h2>
                <p className="text-sm text-[#8b949e] mb-6">
                  Configure the graph traversal algorithm and target topology environment.
                </p>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* ── Topology Switcher ── */}
                  <div>
                    <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-2">
                      Topology Base
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowTopologyDropdown((v) => !v)}
                        className="w-full flex items-center gap-3 bg-[#1c2128] border border-[#30363d] hover:border-[#00bcd4] rounded-md p-3 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-[#30363d] rounded flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 border-2 border-[#00bcd4] rounded-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#e6edf3] truncate">
                            {topology?.name || "Loading..."}
                          </p>
                          <p className="text-xs text-[#8b949e]">{nodes.length} Nodes</p>
                        </div>
                        <ChevronDown
                          size={14}
                          className={`text-[#8b949e] flex-shrink-0 transition-transform ${showTopologyDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Topology dropdown */}
                      {showTopologyDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#1c2128] border border-[#30363d] rounded-md overflow-hidden shadow-xl">
                          {topologiesLoading ? (
                            <p className="text-xs text-[#8b949e] px-4 py-3">Loading topologies...</p>
                          ) : savedTopologies.length === 0 ? (
                            <p className="text-xs text-[#8b949e] px-4 py-3">No saved topologies found</p>
                          ) : (
                            savedTopologies.map((topo) => (
                              <button
                                key={topo._id}
                                onClick={() => handleSwitchTopology(topo._id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#30363d] transition-colors ${
                                  topo._id === selectedTopologyId ? "bg-[#00bcd4]/10" : ""
                                }`}
                              >
                                <div className="w-6 h-6 bg-[#30363d] rounded flex items-center justify-center flex-shrink-0">
                                  <div className="w-3 h-3 border border-[#00bcd4] rounded-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-[#e6edf3] truncate">{topo.name}</p>
                                  <p className="text-[10px] text-[#8b949e]">{topo.nodes?.length ?? topo.nodeCount ?? 0} Nodes</p>
                                </div>
                                {topo._id === selectedTopologyId && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#00bcd4] flex-shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Algorithm Selector ── */}
                  <div>
                    <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-2">
                      Algorithm
                    </label>
                    <div className="relative">
                      <select
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[#1c2128] border border-[#30363d] text-[#e6edf3] rounded-md outline-none focus:border-[#00bcd4] appearance-none cursor-pointer"
                      >
                        {ALGORITHMS.map((a) => (
                          <option key={a.value} value={a.value}>{a.fullLabel}</option>
                        ))}
                      </select>
                      <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* ── Start Node ── */}
                {selectedAlgoMeta?.needsStartNode && nodes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
                        Inject Source Node
                      </label>
                      <button
                        onClick={() => setStartNode(nodes[Math.floor(Math.random() * nodes.length)]?.id)}
                        className="text-[10px] font-medium text-[#00bcd4] hover:text-[#0097a7] uppercase tracking-wide transition-colors flex items-center gap-1"
                      >
                        <Zap size={10} />
                        Auto-Select Optimal
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {nodes.map((n) => (
                        <NodePill
                          key={n.id}
                          label={n.label || n.id}
                          selected={startNode === n.id}
                          onClick={() => setStartNode(n.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Environment Preview ── */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
                      Environment Preview
                    </label>
                    <span className="flex items-center gap-1 text-[10px] text-[#238636]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
                      Live Context
                    </span>
                  </div>
                  <div className="h-48 bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
                    <ReactFlow
                      nodes={rfNodes}
                      edges={rfEdges}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
                      fitView
                      nodesDraggable={false}
                      nodesConnectable={false}
                      elementsSelectable={false}
                      zoomOnScroll={false}
                      panOnDrag={false}
                    >
                      <Background color="#1c2128" gap={20} />
                    </ReactFlow>
                  </div>
                </div>

                {/* ── Past Runs for this Topology ── */}
                {runsForTopology.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowRunsPanel((v) => !v)}
                      className="flex items-center justify-between w-full mb-2 group"
                    >
                      <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide cursor-pointer group-hover:text-[#e6edf3] transition-colors">
                        Previous Runs ({runsForTopology.length})
                      </label>
                      <ChevronDown
                        size={12}
                        className={`text-[#8b949e] transition-transform ${showRunsPanel ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showRunsPanel && (
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
                        {runsForTopology.map((run, i) => (
                          <div
                            key={run._id}
                            className={`flex items-center gap-3 px-3 py-2.5 hover:bg-[#1c2128] transition-colors cursor-pointer group ${
                              i !== runsForTopology.length - 1 ? "border-b border-[#30363d]" : ""
                            }`}
                            onClick={() => handleLoadRun(run._id)}
                          >
                            <div className="w-6 h-6 rounded bg-[#30363d] flex items-center justify-center flex-shrink-0">
                              <Play size={10} className="text-[#00bcd4]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#e6edf3] truncate">
                                {run.algorithm || run.algorithmKey || "Run"}
                              </p>
                              <p className="text-[10px] text-[#8b949e] flex items-center gap-1 mt-0.5">
                                <Clock size={9} />
                                {run.createdAt
                                  ? new Date(run.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                                  : "Unknown date"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {run.startNode && (
                                <Badge variant="gray">from {run.startNode}</Badge>
                              )}
                              <button
                                onClick={(e) => handleDeleteRun(run._id, e)}
                                disabled={deletingRunId === run._id}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#da3633]/20 text-[#8b949e] hover:text-[#da3633] transition-all disabled:opacity-30"
                              >
                                {deletingRunId === run._id
                                  ? <RotateCcw size={12} className="animate-spin" />
                                  : <Trash2 size={12} />
                                }
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-md bg-[#da3633]/10 border border-[#da3633]/30 text-[#da3633] text-sm">
                    {error}
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/dashboard")}>
                      Cancel
                    </Button>
                    <span className="text-xs text-[#8b949e] flex items-center gap-1">
                      <Clock size={11} />
                      Est. Compute: ~{estCompute}s
                    </span>
                  </div>
                  <Button
                    icon={Play}
                    onClick={runAlgorithm}
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading ? "Initializing..." : "Initialize Run"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── PLAYBACK VIEW ──────────────────────────────────────── */
        <div className="flex h-[calc(100vh-56px)]">

          {/* left panel */}
          <div className="w-64 min-w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-[#30363d]">
              <p className="text-xs text-[#8b949e]">{topology?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="blue">{selectedAlgorithm}</Badge>
                {startNode && <Badge variant="gray">from {startNode}</Badge>}
              </div>
            </div>

            {/* playback controls */}
            <div className="p-4 border-b border-[#30363d]">
              <div className="flex items-center gap-1 mb-3">
                <button
                  onClick={stepBackward}
                  disabled={currentStepIndex <= 0}
                  className="flex-1 p-2 rounded-md border border-[#30363d] text-[#e6edf3] hover:bg-[#1c2128] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  onClick={isPlaying ? pause : play}
                  className="flex-1 p-2 rounded-md bg-[#00bcd4] text-[#0d1117] hover:bg-[#0097a7] transition-colors flex items-center justify-center"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="flex-1 p-2 rounded-md border border-[#30363d] text-[#e6edf3] hover:bg-[#1c2128] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <SkipForward size={14} />
                </button>
                <button
                  onClick={reset}
                  className="flex-1 p-2 rounded-md border border-[#30363d] text-[#e6edf3] hover:bg-[#1c2128] transition-colors flex items-center justify-center"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* progress bar */}
              <div className="w-full bg-[#30363d] rounded-full h-1 mb-2">
                <div
                  className="bg-[#00bcd4] h-1 rounded-full transition-all"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#8b949e] text-center">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>

            {/* speed */}
            <div className="p-4 border-b border-[#30363d]">
              <label className="text-xs text-[#8b949e] block mb-2">
                Speed: {playbackSpeed}ms
              </label>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-full accent-[#00bcd4]"
              />
            </div>

            {/* current step info */}
            {currentStep && (
              <div className="p-4 border-b border-[#30363d]">
                <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Current Step</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8b949e]">Action</span>
                    <Badge variant="cyan">{currentStep.action}</Badge>
                  </div>
                  {currentStep.node && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8b949e]">Node</span>
                      <span className="text-xs text-[#e6edf3] font-medium">{currentStep.node}</span>
                    </div>
                  )}
                  {currentStep.edge && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8b949e]">Edge</span>
                      <span className="text-xs text-[#e6edf3] font-medium">{currentStep.edge.from} → {currentStep.edge.to}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 mt-auto flex flex-col gap-2">
              {lastRunId && (
                <Button
                  fullWidth
                  variant="outline"
                  icon={Share2}
                  onClick={handleShare}
                  disabled={shareLoading}
                  size="sm"
                >
                  {shareLoading ? "Generating..." : "Share Run"}
                </Button>
              )}
              <Button
                fullWidth
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate("/dashboard")}
                size="sm"
              >
                Dashboard
              </Button>
            </div>
          </div>

          {/* canvas */}
          <div className="flex-1">
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Controls />
              <Background color="#1c2128" gap={20} />
              <MiniMap style={{ background: "#161b22" }} nodeColor="#00bcd4" />
            </ReactFlow>
          </div>

          {/* right panel */}
          {currentStep && (
            <div className="w-64 min-w-64 bg-[#161b22] border-l border-[#30363d] overflow-y-auto">
              <div className="p-4 border-b border-[#30363d]">
                <p className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">Data Structures</p>
              </div>

              <div className="p-4 flex flex-col gap-4">
                {currentStep.meta?.distances && (
                  <div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Distances</p>
                    <div className="bg-[#1c2128] rounded-md overflow-hidden">
                      {Object.entries(currentStep.meta.distances).map(([node, dist]) => (
                        <div key={node} className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363d] last:border-0">
                          <span className="text-xs text-[#e6edf3]">{node}</span>
                          <span className="text-xs font-medium text-[#00bcd4]">
                            {dist === null || dist === Infinity ? "∞" : dist}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.meta?.visited && (
                  <div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Visited</p>
                    <div className="flex flex-wrap gap-1">
                      {currentStep.meta.visited.length === 0
                        ? <span className="text-xs text-[#8b949e]">none</span>
                        : currentStep.meta.visited.map((n) => (
                          <span key={n} className="px-2 py-0.5 bg-[#238636]/20 text-[#238636] text-xs rounded border border-[#238636]/30">{n}</span>
                        ))
                      }
                    </div>
                  </div>
                )}

                {currentStep.meta?.queue && (
                  <div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Queue</p>
                    <div className="flex flex-wrap gap-1">
                      {currentStep.meta.queue.length === 0
                        ? <span className="text-xs text-[#8b949e]">empty</span>
                        : currentStep.meta.queue.map((q, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#f0a000]/20 text-[#f0a000] text-xs rounded border border-[#f0a000]/30">
                            {q.node || q}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}

                {currentStep.meta?.mstEdges && (
                  <div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">MST Edges</p>
                    <div className="bg-[#1c2128] rounded-md overflow-hidden">
                      {currentStep.meta.mstEdges.length === 0
                        ? <p className="text-xs text-[#8b949e] px-3 py-2">none yet</p>
                        : currentStep.meta.mstEdges.map((e, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363d] last:border-0">
                            <span className="text-xs text-[#e6edf3]">{e.from} → {e.to}</span>
                            <span className="text-xs text-[#00bcd4]">w:{e.weight}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {currentStep.meta?.table && (
                  <div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Routing Table</p>
                    {Object.entries(currentStep.meta.table).map(([router, dests]) => (
                      <div key={router} className="mb-2">
                        <p className="text-[10px] text-[#00bcd4] mb-1">Router {router}</p>
                        <div className="bg-[#1c2128] rounded-md overflow-hidden">
                          {Object.entries(dests).map(([dest, info]) => (
                            <div key={dest} className="flex items-center justify-between px-3 py-1 border-b border-[#30363d] last:border-0">
                              <span className="text-[10px] text-[#e6edf3]">→ {dest}</span>
                              <span className="text-[10px] text-[#00bcd4]">
                                {info.dist === null ? "∞" : info.dist} via {info.nextHop || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result && (
                  <div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Result</p>
                    <div className="bg-[#1c2128] rounded-md p-3 flex flex-col gap-1.5">
                      {result.order && (
                        <p className="text-xs text-[#e6edf3]">
                          Order: <span className="text-[#00bcd4]">{result.order.join(" → ")}</span>
                        </p>
                      )}
                      {result.totalWeight !== undefined && (
                        <p className="text-xs text-[#e6edf3]">
                          Total Weight: <span className="text-[#00bcd4]">{result.totalWeight}</span>
                        </p>
                      )}
                      {result.iterations && (
                        <p className="text-xs text-[#e6edf3]">
                          Iterations: <span className="text-[#00bcd4]">{result.iterations}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Share Modal ── */}
      {showShareModal && shareToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[#e6edf3]">Share this run</h3>
            <p className="text-xs text-[#8b949e]">Anyone with this link can replay this run read-only.</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/share/${shareToken}`}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 text-xs bg-[#1c2128] border border-[#30363d] text-[#00bcd4] rounded-md outline-none font-mono"
              />
              <Button size="sm" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowShareModal(false)} className="self-end">
              Close
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}