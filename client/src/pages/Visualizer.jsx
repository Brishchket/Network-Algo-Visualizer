import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, { Controls, Background, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import useVisualizerStore from "../store/visaulizerStore";
import { generateShareLink } from "../api/share.api";
import Button from "../components/ui/Button";
import "./Visualizer.css";

const ALGORITHMS = [
  { value: "bfs", label: "BFS", needsStartNode: true },
  { value: "dfs", label: "DFS", needsStartNode: true },
  { value: "dijkstra", label: "Dijkstra", needsStartNode: true },
  { value: "bellmanFord", label: "Bellman-Ford", needsStartNode: true },
  { value: "prim", label: "Prim's MST", needsStartNode: true },
  { value: "kruskal", label: "Kruskal's MST", needsStartNode: false },
  { value: "distanceVector", label: "Distance Vector", needsStartNode: false },
  { value: "linkState", label: "Link State", needsStartNode: false }
];

export default function Visualizer() {
  const { id } = useParams();
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

  const [shareToken, setShareToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTopology(id);
    return () => resetVisualizer();
  }, [id]);

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

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const res = await generateShareLink({
        resourceType: "Run",
        resourceId: lastRunId
      });
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

  const rfNodes = nodes.map((n) => {
    let bg = "#1e2d40";
    if (currentStep) {
      if (currentStep.node === n.id) bg = "#00ff88";
      else if (currentStep.meta?.visited?.includes(n.id)) bg = "#00b4d8";
      else if (currentStep.meta?.queue?.map?.(q => q.node || q)?.includes(n.id)) bg = "#f59e0b";
      else if (currentStep.meta?.inMST?.includes(n.id)) bg = "#00b4d8";
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
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "12px",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
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
      style: { stroke: isActive ? "#00ff88" : "#555" },
      labelStyle: { fill: "#e2e8f0", fontSize: 11 },
      labelBgStyle: { fill: "#111827" },
      animated: isActive
    };
  });

  return (
    <div className="visualizer">
      {/* left sidebar */}
      <div className="vis-sidebar">
        <div className="vis-sidebar-header">
          <span className="green">[</span>visualizer<span className="green">]</span>
        </div>

        <p className="vis-topo-name">{topology?.name}</p>

        <div className="vis-group">
          <label className="vis-label">algorithm</label>
          <select
            className="vis-select"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        {selectedAlgoMeta?.needsStartNode && (
          <div className="vis-group">
            <label className="vis-label">start node</label>
            <select
              className="vis-select"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.label || n.id}</option>
              ))}
            </select>
          </div>
        )}

        <div className="vis-group">
          <label className="vis-label">speed: {playbackSpeed}ms</label>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="vis-slider"
          />
        </div>

        {error && <p className="vis-error">{error}</p>}

        <Button fullWidth onClick={runAlgorithm} disabled={isLoading}>
          {isLoading ? "running..." : "run algorithm"}
        </Button>

        {hasRun && (
          <>
            <div className="vis-playback">
              <button className="vis-ctrl-btn" onClick={stepBackward} disabled={currentStepIndex <= 0}>⏮</button>
              <button className="vis-ctrl-btn" onClick={isPlaying ? pause : play}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button className="vis-ctrl-btn" onClick={stepForward} disabled={currentStepIndex >= steps.length - 1}>⏭</button>
              <button className="vis-ctrl-btn" onClick={reset}>↺</button>
            </div>

            <div className="vis-step-info">
              <p>step <span className="green">{currentStepIndex + 1}</span> / {steps.length}</p>
              {currentStep && (
                <>
                  <p>action: <span className="green">{currentStep.action}</span></p>
                  {currentStep.node && <p>node: <span className="green">{currentStep.node}</span></p>}
                  {currentStep.edge && (
                    <p>edge: <span className="green">{currentStep.edge.from} → {currentStep.edge.to}</span></p>
                  )}
                </>
              )}
            </div>

            {lastRunId && (
              <Button
                variant="secondary"
                fullWidth
                onClick={handleShare}
                disabled={shareLoading}
              >
                {shareLoading ? "generating..." : "share run"}
              </Button>
            )}
          </>
        )}

        <Button variant="ghost" fullWidth onClick={() => navigate("/dashboard")}>
          ← back
        </Button>
      </div>

      {/* canvas */}
      <div className="vis-canvas">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Controls />
          <Background color="#1e2d40" gap={20} />
          <MiniMap style={{ background: "#111827" }} nodeColor="#00ff88" />
        </ReactFlow>
      </div>

      {/* right panel */}
      {hasRun && currentStep && (
        <div className="vis-panel">
          <h3 className="vis-panel-title">current state</h3>

          {currentStep.meta?.distances && (
            <div className="vis-panel-section">
              <h4>distances</h4>
              {Object.entries(currentStep.meta.distances).map(([node, dist]) => (
                <div key={node} className="vis-panel-row">
                  <span>{node}</span>
                  <span className="green">{dist === null || dist === Infinity ? "∞" : dist}</span>
                </div>
              ))}
            </div>
          )}

          {currentStep.meta?.visited && (
            <div className="vis-panel-section">
              <h4>visited</h4>
              <p>{currentStep.meta.visited.join(" → ") || "none"}</p>
            </div>
          )}

          {currentStep.meta?.queue && (
            <div className="vis-panel-section">
              <h4>queue</h4>
              <p>{Array.isArray(currentStep.meta.queue)
                ? currentStep.meta.queue.map(q => q.node || q).join(", ") || "empty"
                : "empty"}
              </p>
            </div>
          )}

          {currentStep.meta?.mstEdges && (
            <div className="vis-panel-section">
              <h4>mst edges</h4>
              {currentStep.meta.mstEdges.map((e, i) => (
                <div key={i} className="vis-panel-row">
                  <span>{e.from} → {e.to}</span>
                  <span className="green">w:{e.weight}</span>
                </div>
              ))}
            </div>
          )}

          {currentStep.meta?.table && (
            <div className="vis-panel-section">
              <h4>routing table</h4>
              {Object.entries(currentStep.meta.table).map(([router, dests]) => (
                <div key={router} className="vis-panel-router">
                  <p className="vis-panel-router-label">router {router}</p>
                  {Object.entries(dests).map(([dest, info]) => (
                    <div key={dest} className="vis-panel-row">
                      <span>→ {dest}</span>
                      <span className="green">{info.dist === null ? "∞" : info.dist} via {info.nextHop || "-"}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {result && (
            <div className="vis-panel-section">
              <h4>result</h4>
              {result.order && <p>order: {result.order.join(" → ")}</p>}
              {result.totalWeight !== undefined && <p>total weight: <span className="green">{result.totalWeight}</span></p>}
              {result.iterations && <p>iterations: <span className="green">{result.iterations}</span></p>}
            </div>
          )}
        </div>
      )}

      {/* share modal */}
      {showShareModal && shareToken && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>share this run</h3>
            <p className="share-modal-label">anyone with this link can replay this run</p>
            <div className="share-modal-link">
              <input
                readOnly
                value={`${window.location.origin}/share/${shareToken}`}
                onFocus={(e) => e.target.select()}
              />
              <button onClick={handleCopy}>
                {copied ? "copied!" : "copy"}
              </button>
            </div>
            <button className="share-modal-close" onClick={() => setShowShareModal(false)}>
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}