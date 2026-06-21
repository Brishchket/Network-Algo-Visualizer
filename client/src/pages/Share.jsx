import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { getSharedResource } from "../api/share.api";
import "./Share.css";

export default function Share() {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resourceType, setResourceType] = useState(null);
  const [resource, setResource] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await getSharedResource(shareToken);
        setResourceType(res.data.data.resourceType);
        setResource(res.data.data.resource);
      } catch (err) {
        setError(err.response?.data?.message || "Shared resource not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShared();
  }, [shareToken]);

  const buildRFNodes = (nodes, step) => {
    return nodes.map((n) => {
      let bg = "#1e2d40";
      if (step) {
        if (step.node === n.id) bg = "#00ff88";
        else if (step.meta?.visited?.includes(n.id)) bg = "#00b4d8";
        else if (step.meta?.queue?.map?.(q => q.node || q)?.includes(n.id)) bg = "#f59e0b";
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

  const buildRFEdges = (edges, step) => {
    return edges.map((e) => {
      const isActive =
        step?.edge?.from === e.from && step?.edge?.to === e.to;
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

  if (isLoading) {
    return (
      <div className="share-status">
        <p>loading shared resource...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-status">
        <p className="share-error">{error}</p>
        <button onClick={() => navigate("/login")}>go to login</button>
      </div>
    );
  }

  // shared topology
  if (resourceType === "Topology") {
    const nodes = resource.nodes || [];
    const edges = resource.edges || [];

    return (
      <div className="share-page">
        <div className="share-topbar">
          <div className="share-brand">
            <span className="green">[</span>NetAlgoVis<span className="green">]</span>
          </div>
          <div className="share-meta">
            <span className="share-name">{resource.name}</span>
            <span className="share-owner">shared by {resource.owner?.username}</span>
          </div>
          <button className="share-login-btn" onClick={() => navigate("/login")}>
            login to edit
          </button>
        </div>
        <div className="share-canvas">
          <ReactFlow
            nodes={buildRFNodes(nodes, null)}
            edges={buildRFEdges(edges, null)}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Controls />
            <Background color="#1e2d40" gap={20} />
          </ReactFlow>
        </div>
      </div>
    );
  }

  // shared run
  const steps = resource.steps || [];
  const step = steps[currentStep];
  const nodes = resource.topology?.nodes || [];
  const edges = resource.topology?.edges || [];

  return (
    <div className="share-page">
      <div className="share-sidebar">
        <div className="share-brand">
          <span className="green">[</span>NetAlgoVis<span className="green">]</span>
        </div>

        <div className="share-run-info">
          <p className="share-name">{resource.algorithmType}</p>
          <p className="share-owner">by {resource.user?.username}</p>
          <p className="share-topo">topology: {resource.topology?.name}</p>
        </div>

        <div className="share-playback">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep <= 0}
          >⏮</button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep >= steps.length - 1}
          >⏭</button>
        </div>

        <div className="share-step-info">
          <p>step <span className="green">{currentStep + 1}</span> / {steps.length}</p>
          {step && (
            <>
              <p>action: <span className="green">{step.action}</span></p>
              {step.node && <p>node: <span className="green">{step.node}</span></p>}
            </>
          )}
        </div>

        <button className="share-login-btn" onClick={() => navigate("/login")}>
          login to run your own
        </button>
      </div>

      <div className="share-canvas">
        <ReactFlow
          nodes={buildRFNodes(nodes, step)}
          edges={buildRFEdges(edges, step)}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Controls />
          <Background color="#1e2d40" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}