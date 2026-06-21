import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import useTopologyStore from "../store/topologyStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./TopologyBuilder.css";

let nodeCounter = 1;

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
    resetCanvas
  } = useTopologyStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [isDirected, setIsDirected] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (id) {
      loadTopology(id).then(() => {
        const store = useTopologyStore.getState();
        setNodes(store.nodes);
        setEdges(store.edges);
      });
    } else {
      resetCanvas();
      setNodes([]);
      setEdges([]);
      nodeCounter = 1;
    }
  }, [id]);

  const onConnect = useCallback(
    (params) => {
      if (!isDirected) {
        // undirected — prevent duplicate edges in either direction
        const exists = edges.some(
          (e) =>
            (e.source === params.source && e.target === params.target) ||
            (e.source === params.target && e.target === params.source)
        );
        if (exists) return;
      } else {
        // directed — prevent exact duplicate directed edges
        const exists = edges.some(
          (e) => e.source === params.source && e.target === params.target
        );
        if (exists) return;
      }

      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}-${Date.now()}`,
        label: String(edgeWeight),
        data: { weight: edgeWeight, directed: isDirected },
        style: { stroke: "#00ff88" },
        labelStyle: { fill: "#e2e8f0", fontSize: 11 },
        labelBgStyle: { fill: "#111827" },
        ...(isDirected && {
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#00ff88"
          }
        })
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edgeWeight, edges, isDirected, setEdges]
  );

  const addNode = () => {
    const nodeId = String(nodeCounter++);
    const newNode = {
      id: nodeId,
      position: { x: Math.random() * 500 + 50, y: Math.random() * 300 + 50 },
      data: { label: nodeId },
      style: {
        background: "#1e2d40",
        color: "#e2e8f0",
        border: "1px solid #00ff88",
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
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    try {
      await saveTopology(nodes, edges);
      setSavedMsg("// topology saved");
      setTimeout(() => setSavedMsg(""), 2000);
    } catch {
      // error shown from store
    }
  };

  return (
    <div className="topology-builder">
      <div className="builder-sidebar">
        <div className="sidebar-header">
          <span className="green">[</span>
          topology_builder
          <span className="green">]</span>
        </div>

        <Input
          label="name"
          type="text"
          name="name"
          value={topologyName}
          onChange={(e) => setTopologyName(e.target.value)}
          placeholder="my_topology"
        />

        <Input
          label="description"
          type="text"
          name="description"
          value={topologyDescription}
          onChange={(e) => setTopologyDescription(e.target.value)}
          placeholder="// optional"
        />

        <div className="sidebar-group">
          <label className="input-label">edge_weight</label>
          <input
            type="number"
            value={edgeWeight}
            onChange={(e) => setEdgeWeight(Number(e.target.value))}
            min={1}
            className="input-field"
          />
        </div>

        <div className="sidebar-toggles">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>make_public</span>
          </label>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isDirected}
              onChange={(e) => setIsDirected(e.target.checked)}
            />
            <span>directed_graph</span>
          </label>
        </div>

        {error && <p className="sidebar-error">{error}</p>}
        {savedMsg && <p className="sidebar-success">{savedMsg}</p>}

        <div className="sidebar-actions">
          <Button fullWidth onClick={addNode}>
            + add_node
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={handleSave}
            disabled={isLoading || !topologyName}
          >
            {isLoading ? "saving..." : "save_topology"}
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            ← back
          </Button>
        </div>

        <div className="sidebar-hints">
          <p>// drag node handle to connect</p>
          <p>// set weight before connecting</p>
          <p>// backspace to delete selected</p>
          <p>// drag nodes to reposition</p>
          {isDirected && <p className="green">// directed mode on</p>}
        </div>
      </div>

      <div className="builder-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          fitView
          deleteKeyCode="Backspace"
        >
          <MiniMap
            style={{ background: "#111827" }}
            nodeColor="#00ff88"
          />
          <Controls />
          <Background color="#1e2d40" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}