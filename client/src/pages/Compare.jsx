import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { getMyTopologies } from "../api/topology.api";
import { runComparison } from "../api/algorithm.api";
import Button from "../components/ui/Button";
import "./Compare.css";

const ALGORITHMS = [
  { value: "bfs", label: "BFS" },
  { value: "dfs", label: "DFS" },
  { value: "dijkstra", label: "Dijkstra" },
  { value: "bellmanFord", label: "Bellman-Ford" },
  { value: "prim", label: "Prim's MST" },
  { value: "kruskal", label: "Kruskal's MST" },
  { value: "distanceVector", label: "Distance Vector" },
  { value: "linkState", label: "Link State" }
];

const NEEDS_START_NODE = ["bfs", "dfs", "dijkstra", "bellmanFord", "prim"];

export default function Compare() {
  const navigate = useNavigate();

  const [topologies, setTopologies] = useState([]);
  const [selectedTopologyId, setSelectedTopologyId] = useState("");
  const [selectedTopology, setSelectedTopology] = useState(null);
  const [algorithmA, setAlgorithmA] = useState("dijkstra");
  const [algorithmB, setAlgorithmB] = useState("bellmanFord");
  const [startNode, setStartNode] = useState("");
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

  const handleCompare = async () => {
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
      setError(err.response?.data?.message || "Comparison failed");
    } finally {
      setIsLoading(false);
    }
  };

  const buildRFNodes = (topology, currentStep) => {
    if (!topology) return [];
    return topology.nodes.map((n) => {
      let bg = "#1e2d40";
      if (currentStep) {
        if (currentStep.node === n.id) bg = "#00ff88";
        else if (currentStep.meta?.visited?.includes(n.id)) bg = "#00b4d8";
        else if (currentStep.meta?.queue?.map?.(q => q.node || q)?.includes(n.id)) bg = "#f59e0b";
      }
      return {
        id: n.id,
        position: { x: n.x, y: n.y },
        data: { label: n.label || n.id },
        style: {
          background: bg,
          color: bg === "#00ff88" ? "#0a0e1a" : "#e2e8f0",
          border: `1px solid ${bg === "#1e2d40" ? "#333" : bg}`,
          borderRadius: "8px",
          fontSize: "12px",
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      };
    });
  };

  const buildRFEdges = (topology, currentStep) => {
    if (!topology) return [];
    return topology.edges.map((e) => {
      const isActive =
        currentStep?.edge?.from === e.from && currentStep?.edge?.to === e.to;
      return {
        id: `${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        label: String(e.weight),
        style: { stroke: isActive ? "#00ff88" : "#555" },
        animated: isActive
      };
    });
  };

  const stepsA = result?.algorithmA?.steps || [];
  const stepsB = result?.algorithmB?.steps || [];
  const currentStepA = stepsA[stepA];
  const currentStepB = stepsB[stepB];

  return (
    <div className="compare">
      {/* sidebar */}
      <div className="compare-sidebar">
        <div className="compare-sidebar-header">
          <span className="green">[</span>race_mode<span className="green">]</span>
        </div>

        <div className="compare-group">
          <label className="compare-label">topology</label>
          <select
            className="compare-select"
            value={selectedTopologyId}
            onChange={(e) => setSelectedTopologyId(e.target.value)}
          >
            <option value="">select topology</option>
            {topologies.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="compare-group">
          <label className="compare-label">algorithm A</label>
          <select
            className="compare-select compare-select-a"
            value={algorithmA}
            onChange={(e) => setAlgorithmA(e.target.value)}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="compare-group">
          <label className="compare-label">algorithm B</label>
          <select
            className="compare-select compare-select-b"
            value={algorithmB}
            onChange={(e) => setAlgorithmB(e.target.value)}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        {(NEEDS_START_NODE.includes(algorithmA) || NEEDS_START_NODE.includes(algorithmB)) && selectedTopology && (
          <div className="compare-group">
            <label className="compare-label">start node</label>
            <select
              className="compare-select"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
            >
              {selectedTopology.nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.label || n.id}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="compare-error">{error}</p>}

        <Button
          fullWidth
          onClick={handleCompare}
          disabled={isLoading || !selectedTopologyId}
        >
          {isLoading ? "running..." : "start race"}
        </Button>

        {result && (
          <div className="compare-summary">
            <p className="compare-summary-title">// summary</p>
            <div className="compare-summary-row">
              <span className="algo-a-text">{algorithmA}</span>
              <span>{result.summary[algorithmA].convergenceSteps} steps</span>
            </div>
            <div className="compare-summary-row">
              <span className="algo-b-text">{algorithmB}</span>
              <span>{result.summary[algorithmB].convergenceSteps} steps</span>
            </div>
            <p className="compare-winner">
              🏆 {result.summary[algorithmA].convergenceSteps <= result.summary[algorithmB].convergenceSteps
                ? algorithmA : algorithmB} wins
            </p>
          </div>
        )}

        <Button variant="ghost" fullWidth onClick={() => navigate("/dashboard")}>
          ← back
        </Button>
      </div>

      {/* canvases */}
      <div className="compare-canvases">
        <div className="canvas-half">
          <div className="canvas-half-header algo-a-header">
            <span>{algorithmA}</span>
            {result && (
              <div className="canvas-controls">
                <button onClick={() => setStepA(Math.max(0, stepA - 1))} disabled={stepA <= 0}>⏮</button>
                <button onClick={() => setStepA(Math.min(stepsA.length - 1, stepA + 1))} disabled={stepA >= stepsA.length - 1}>⏭</button>
                <span>{stepA + 1} / {stepsA.length}</span>
              </div>
            )}
          </div>
          <ReactFlow
            nodes={buildRFNodes(selectedTopology, currentStepA)}
            edges={buildRFEdges(selectedTopology, currentStepA)}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Controls />
            <Background color="#1e2d40" gap={20} />
          </ReactFlow>
        </div>

        <div className="canvas-half">
          <div className="canvas-half-header algo-b-header">
            <span>{algorithmB}</span>
            {result && (
              <div className="canvas-controls">
                <button onClick={() => setStepB(Math.max(0, stepB - 1))} disabled={stepB <= 0}>⏮</button>
                <button onClick={() => setStepB(Math.min(stepsB.length - 1, stepB + 1))} disabled={stepB >= stepsB.length - 1}>⏭</button>
                <span>{stepB + 1} / {stepsB.length}</span>
              </div>
            )}
          </div>
          <ReactFlow
            nodes={buildRFNodes(selectedTopology, currentStepB)}
            edges={buildRFEdges(selectedTopology, currentStepB)}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Controls />
            <Background color="#1e2d40" gap={20} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}