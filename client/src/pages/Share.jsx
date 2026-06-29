import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { SkipBack, SkipForward, ArrowRight } from "lucide-react";
import { getSharedResource } from "../api/share.api";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const nodeTypes = {};
const edgeTypes = {};

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
  return nodes.map((n, index) => {
    let bg = "#1c2128";
    let border = "#30363d";
    if (step) {
      if (step.node === n.id) { bg = "#00bcd4"; border = "#00bcd4"; }
      else if (step.meta?.visited?.includes(n.id)) { bg = "#238636"; border = "#238636"; }
      else if (step.meta?.queue?.map?.(q => q.node || q)?.includes(n.id)) { bg = "#f0a000"; border = "#f0a000"; }
    }

    // fallback position if x/y missing
    const x = n.x ?? (index % 3) * 150 + 100;
    const y = n.y ?? Math.floor(index / 3) * 150 + 100;

    return {
      id: n.id,
      position: { x, y },
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
        fontWeight: 600
      }
    };
  });
};

  const buildRFEdges = (edges, step) => {
    return edges.map((e) => {
      const isActive = step?.edge?.from === e.from && step?.edge?.to === e.to;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-[#8b949e] text-sm">Loading shared resource...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4">
        <p className="text-[#da3633] text-sm">{error}</p>
        <Button onClick={() => navigate("/login")} icon={ArrowRight}>
          Go to Login
        </Button>
      </div>
    );
  }

  // shared topology
  if (resourceType === "Topology") {
    const nodes = resource.nodes || [];
    const edges = resource.edges || [];

    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col">
        <nav className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6">
          <h1 className="text-base font-bold text-[#e6edf3]">NetAlgoVis</h1>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium text-[#e6edf3]">{resource.name}</p>
              <p className="text-xs text-[#8b949e]">shared by {resource.owner?.username}</p>
            </div>
            <Badge variant="cyan">public</Badge>
            <Button size="sm" onClick={() => navigate("/login")} icon={ArrowRight}>
              Login to Edit
            </Button>
          </div>
        </nav>
        <div className="flex-1">
          <ReactFlow
            nodes={buildRFNodes(nodes, null)}
            edges={buildRFEdges(edges, null)}
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
    );
  }

  // shared run
  const steps = resource.steps || [];
  const step = steps[currentStep];
  const nodes = resource.topology?.nodes || [];
  const edges = resource.topology?.edges || [];

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <nav className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6">
        <h1 className="text-base font-bold text-[#e6edf3]">NetAlgoVis</h1>
        <Button size="sm" onClick={() => navigate("/login")} icon={ArrowRight}>
          Login to Run Your Own
        </Button>
      </nav>

      <div className="flex flex-1">
        {/* sidebar */}
        <div className="w-64 min-w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <Badge variant="blue" className="mb-2">{resource.algorithmType}</Badge>
            <p className="text-sm font-medium text-[#e6edf3]">
              {resource.topology?.name}
            </p>
            <p className="text-xs text-[#8b949e] mt-0.5">
              shared by {resource.user?.username}
            </p>
          </div>

          {/* playback */}
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep <= 0}
                className="flex-1 p-2 rounded-md border border-[#30363d] text-[#e6edf3] hover:bg-[#1c2128] disabled:opacity-30 transition-colors flex items-center justify-center"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep >= steps.length - 1}
                className="flex-1 p-2 rounded-md border border-[#30363d] text-[#e6edf3] hover:bg-[#1c2128] disabled:opacity-30 transition-colors flex items-center justify-center"
              >
                <SkipForward size={14} />
              </button>
            </div>

            <div className="w-full bg-[#30363d] rounded-full h-1 mb-2">
              <div
                className="bg-[#00bcd4] h-1 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-[#8b949e] text-center">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* step info */}
          {step && (
            <div className="p-4">
              <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">Current Step</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">Action</span>
                  <Badge variant="cyan">{step.action}</Badge>
                </div>
                {step.node && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8b949e]">Node</span>
                    <span className="text-xs text-[#e6edf3]">{step.node}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* canvas */}
        <div className="flex-1" style={{ height: "calc(100vh - 56px)" }}>
          <ReactFlow
            nodes={buildRFNodes(nodes, step)}
            edges={buildRFEdges(edges, step)}
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
  );
}