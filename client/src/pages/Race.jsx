import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { Zap, ArrowLeft, Flag, SkipBack, SkipForward } from "lucide-react";
import { getMyTopologies } from "../api/topology.api";
import { runComparison } from "../api/algorithm.api";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ToggleGroup from "../components/ui/ToggleGroup";
import Breadcrumb from "../components/ui/BreadCrumb.jsx";
import { ALGORITHMS } from "../constants";

const nodeTypes = {};
const edgeTypes = {};

const NEEDS_START_NODE = ["bfs", "dfs", "dijkstra", "bellmanFord", "prim"];

export default function Race() {
  const navigate = useNavigate();

  const [topologies, setTopologies] = useState([]);
  const [selectedTopologyId, setSelectedTopologyId] = useState("");
  const [selectedTopology, setSelectedTopology] = useState(null);
  const [algorithmA, setAlgorithmA] = useState("dijkstra");
  const [algorithmB, setAlgorithmB] = useState("bellmanFord");
  const [startNode, setStartNode] = useState("");
  const [executionMode, setExecutionMode] = useState("synced");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [stepA, setStepA] = useState(0);
  const [stepB, setStepB] = useState(0);

  useEffect(() => {
    getMyTopologies().then((res) => setTopologies(res.data.data));
  }, []);

  useEffect(() => {
    if (selectedTopologyId) {
      const topo = topologies.find((t) => t._id === selectedTopologyId);
      setSelectedTopology(topo || null);
      setStartNode(topo?.nodes[0]?.id || "");
      setResult(null);
      setStepA(0);
      setStepB(0);
    }
  }, [selectedTopologyId, topologies]);

  const handleRace = async () => {
    if (!selectedTopology) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await runComparison({
        nodes: selectedTopology.nodes.map((n) => ({ id: n.id })),
        edges: selectedTopology.edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight })),
        algorithmA,
        algorithmB,
        startNode
      });
      setResult(res.data.data);
      setStepA(0);
      setStepB(0);
    } catch (err) {
      setError(err.response?.data?.message || "Race failed");
    } finally {
      setIsLoading(false);
    }
  };

  const buildRFNodes = (topology, currentStep) => {
    if (!topology) return [];
    return topology.nodes.map((n) => {
      let bg = "#1c2128";
      let border = "#30363d";
      if (currentStep) {
        if (currentStep.node === n.id) { bg = "#00bcd4"; border = "#00bcd4"; }
        else if (currentStep.meta?.visited?.includes(n.id)) { bg = "#238636"; border = "#238636"; }
        else if (currentStep.meta?.queue?.map?.(q => q.node || q)?.includes(n.id)) { bg = "#f0a000"; border = "#f0a000"; }
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
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 600
        }
      };
    });
  };

  const buildRFEdges = (topology, currentStep) => {
    if (!topology) return [];
    return topology.edges.map((e) => {
      const isActive = currentStep?.edge?.from === e.from && currentStep?.edge?.to === e.to;
      return {
        id: `${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        label: String(e.weight),
        style: { stroke: isActive ? "#00bcd4" : "#30363d" },
        animated: isActive
      };
    });
  };

  const stepsA = result?.algorithmA?.steps || [];
  const stepsB = result?.algorithmB?.steps || [];
  const currentStepA = stepsA[stepA];
  const currentStepB = stepsB[stepB];

  const winner = result
    ? result.summary[algorithmA].convergenceSteps <= result.summary[algorithmB].convergenceSteps
      ? algorithmA : algorithmB
    : null;

  return (
    <AppLayout>
      {!result ? (
        // setup view
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-8">
          <div className="w-full max-w-2xl">
            <Breadcrumb items={["Workspace", "Race", "Setup"]} />

            <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              <div className="h-0.5 bg-[#00bcd4]" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-1">
                  <Zap size={20} className="text-[#00bcd4]" />
                  <h2 className="text-xl font-bold text-[#e6edf3]">Set up a race</h2>
                </div>
                <p className="text-sm text-[#8b949e] mb-6">
                  Configure <span className="text-[#00bcd4]">algorithms</span> and{" "}
                  <span className="text-[#00bcd4]">environment</span> for parallel execution comparison.
                </p>

                {/* topology selector */}
                <div className="mb-6">
                  <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-2">
                    Target Topology
                  </label>
                  <select
                    value={selectedTopologyId}
                    onChange={(e) => setSelectedTopologyId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[#1c2128] border border-[#30363d] text-[#e6edf3] rounded-md outline-none focus:border-[#00bcd4] appearance-none cursor-pointer"
                  >
                    <option value="">Select a topology...</option>
                    {topologies.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.nodes.length} nodes)
                      </option>
                    ))}
                  </select>
                </div>

                {/* algorithm selectors */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1c2128] border-2 border-[#3b82f6]/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                      <span className="text-xs font-medium text-[#3b82f6]">Algorithm A (Blue)</span>
                    </div>
                    <select
                      value={algorithmA}
                      onChange={(e) => setAlgorithmA(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-md outline-none focus:border-[#3b82f6] appearance-none cursor-pointer"
                    >
                      {ALGORITHMS.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-[#1c2128] border-2 border-[#00bcd4]/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-[#00bcd4]" />
                      <span className="text-xs font-medium text-[#00bcd4]">Algorithm B (Cyan)</span>
                    </div>
                    <select
                      value={algorithmB}
                      onChange={(e) => setAlgorithmB(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-md outline-none focus:border-[#00bcd4] appearance-none cursor-pointer"
                    >
                      {ALGORITHMS.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* start node */}
                {(NEEDS_START_NODE.includes(algorithmA) || NEEDS_START_NODE.includes(algorithmB)) && selectedTopology && (
                  <div className="mb-6">
                    <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-2">
                      Start Node
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedTopology.nodes.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => setStartNode(n.id)}
                          className={`w-9 h-9 rounded-full border-2 text-xs font-semibold transition-all ${
                            startNode === n.id
                              ? "border-[#f0a000] text-[#f0a000] bg-[#f0a000]/10"
                              : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                          }`}
                        >
                          {n.label || n.id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* execution mode */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-[#e6edf3]">Execution Mode</p>
                      <p className="text-xs text-[#8b949e]">Synced steps vs Independent clock</p>
                    </div>
                    <ToggleGroup
                      options={[
                        { value: "synced", label: "Synced" },
                        { value: "independent", label: "Independent" }
                      ]}
                      value={executionMode}
                      onChange={setExecutionMode}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-md bg-[#da3633]/10 border border-[#da3633]/30 text-[#da3633] text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/dashboard")}>
                    Cancel
                  </Button>
                  <Button
                    icon={Flag}
                    onClick={handleRace}
                    disabled={isLoading || !selectedTopologyId}
                  >
                    {isLoading ? "Running..." : "Start Race"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // race results view
        <div className="flex flex-col h-[calc(100vh-56px)]">

          {/* summary bar */}
          <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="blue">{algorithmA}: {result.summary[algorithmA].convergenceSteps} steps</Badge>
              <Badge variant="cyan">{algorithmB}: {result.summary[algorithmB].convergenceSteps} steps</Badge>
              {winner && (
                <span className="text-xs text-[#238636] font-medium">
                  🏆 {winner} converged faster
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setResult(null)}>
                New Race
              </Button>
              <Button size="sm" variant="ghost" icon={ArrowLeft} onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            </div>
          </div>

          {/* side by side canvases */}
          <div className="flex flex-1">
            {/* canvas A */}
            <div className="flex-1 flex flex-col border-r border-[#30363d]">
              <div className="bg-[#161b22] border-b-2 border-[#3b82f6] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <span className="text-sm font-medium text-[#3b82f6]">{algorithmA}</span>
                </div>
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStepA(Math.max(0, stepA - 1))}
                      disabled={stepA <= 0}
                      className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] disabled:opacity-30 transition-colors"
                    >
                      <SkipBack size={14} />
                    </button>
                    <span className="text-xs text-[#8b949e]">{stepA + 1} / {stepsA.length}</span>
                    <button
                      onClick={() => setStepA(Math.min(stepsA.length - 1, stepA + 1))}
                      disabled={stepA >= stepsA.length - 1}
                      className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] disabled:opacity-30 transition-colors"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <ReactFlow
                  nodes={buildRFNodes(selectedTopology, currentStepA)}
                  edges={buildRFEdges(selectedTopology, currentStepA)}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                >
                  <Controls />
                  <Background color="#1c2128" gap={20} />
                </ReactFlow>
              </div>
            </div>

            {/* canvas B */}
            <div className="flex-1 flex flex-col">
              <div className="bg-[#161b22] border-b-2 border-[#00bcd4] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00bcd4]" />
                  <span className="text-sm font-medium text-[#00bcd4]">{algorithmB}</span>
                </div>
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStepB(Math.max(0, stepB - 1))}
                      disabled={stepB <= 0}
                      className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] disabled:opacity-30 transition-colors"
                    >
                      <SkipBack size={14} />
                    </button>
                    <span className="text-xs text-[#8b949e]">{stepB + 1} / {stepsB.length}</span>
                    <button
                      onClick={() => setStepB(Math.min(stepsB.length - 1, stepB + 1))}
                      disabled={stepB >= stepsB.length - 1}
                      className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] disabled:opacity-30 transition-colors"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <ReactFlow
                  nodes={buildRFNodes(selectedTopology, currentStepB)}
                  edges={buildRFEdges(selectedTopology, currentStepB)}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                >
                  <Controls />
                  <Background color="#1c2128" gap={20} />
                </ReactFlow>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}