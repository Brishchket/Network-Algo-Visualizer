import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ReactFlow, Background, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play, Zap, GitBranch, Share2,
  AlertTriangle, BarChart2, ArrowRight
} from "lucide-react";
import Button from "../components/ui/Button";

const DEMO_NODES = [
  { id: "A", position: { x: 150, y: 80 }, data: { label: "A" } },
  { id: "B", position: { x: 300, y: 40 }, data: { label: "B" } },
  { id: "C", position: { x: 450, y: 80 }, data: { label: "C" } },
  { id: "D", position: { x: 150, y: 220 }, data: { label: "D" } },
  { id: "E", position: { x: 300, y: 260 }, data: { label: "E" } },
  { id: "F", position: { x: 450, y: 220 }, data: { label: "F" } }
];

const DEMO_EDGES = [
  { id: "AB", source: "A", target: "B", label: "4" },
  { id: "AC", source: "A", target: "D", label: "2" },
  { id: "BC", source: "B", target: "C", label: "3" },
  { id: "BD", source: "B", target: "E", label: "5" },
  { id: "CF", source: "C", target: "F", label: "1" },
  { id: "DE", source: "D", target: "E", label: "6" },
  { id: "EF", source: "E", target: "F", label: "2" }
];

const BFS_STEPS = ["A", "B", "D", "C", "E", "F"];

const FEATURES = [
  { icon: Play, title: "Step-by-step Visualization", desc: "Watch algorithms execute one step at a time with animated node and edge highlights." },
  { icon: GitBranch, title: "8 Algorithms", desc: "BFS, DFS, Dijkstra, Bellman-Ford, Prim, Kruskal, Distance Vector, Link State." },
  { icon: Zap, title: "Custom Topology Builder", desc: "Drag and drop nodes, draw edges, set weights. Save and reload your topologies." },
  { icon: BarChart2, title: "Side-by-side Comparison", desc: "Run two algorithms on the same topology and compare convergence speed." },
  { icon: AlertTriangle, title: "Failure Simulation", desc: "Kill a node or edge mid-run and watch how the network recovers." },
  { icon: Share2, title: "Share & Collaborate", desc: "Generate a shareable link for any run. Classmates can replay it read-only." }
];

const ALGORITHMS = [
  { label: "BFS", desc: "Explore level by level", category: "Graph" },
  { label: "DFS", desc: "Explore depth first", category: "Graph" },
  { label: "Dijkstra", desc: "Shortest path", category: "Graph" },
  { label: "Bellman-Ford", desc: "Handles negative weights", category: "Graph" },
  { label: "Prim's MST", desc: "Minimum spanning tree", category: "MST" },
  { label: "Kruskal's MST", desc: "Edge-based MST", category: "MST" },
  { label: "Distance Vector", desc: "DVR with count-to-infinity", category: "Networking" },
  { label: "Link State", desc: "OSPF-style routing", category: "Networking" }
];

const categoryColor = {
  Graph: "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20",
  MST: "text-[#238636] bg-[#238636]/10 border-[#238636]/20",
  Networking: "text-[#00bcd4] bg-[#00bcd4]/10 border-[#00bcd4]/20"
};

export default function Landing() {
  const navigate = useNavigate();
  const stepRef = useRef(0);

  const [nodes, setNodes] = useNodesState(
    DEMO_NODES.map((n) => ({
      ...n,
      style: {
        background: "#1c2128",
        color: "#e6edf3",
        border: "1px solid #30363d",
        borderRadius: "50%",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 600
      }
    }))
  );

  const [edges] = useEdgesState(
    DEMO_EDGES.map((e) => ({
      ...e,
      style: { stroke: "#30363d" },
      labelStyle: { fill: "#8b949e", fontSize: 10 },
      labelBgStyle: { fill: "#0d1117" }
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const visitedUpTo = stepRef.current;
      stepRef.current = (stepRef.current + 1) % (BFS_STEPS.length + 1);

      setNodes((nds) =>
        nds.map((n) => {
          const visitedIndex = BFS_STEPS.indexOf(n.id);
          const isCurrent = BFS_STEPS[visitedUpTo] === n.id;
          const isVisited = visitedIndex < visitedUpTo;

          let bg = "#1c2128";
          let border = "1px solid #30363d";
          if (isCurrent) { bg = "#00bcd4"; border = "1px solid #00bcd4"; }
          else if (isVisited) { bg = "#238636"; border = "1px solid #238636"; }

          return {
            ...n,
            style: { ...n.style, background: bg, border }
          };
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">

      {/* navbar */}
      <nav className="border-b border-[#30363d] px-8 h-14 flex items-center justify-between sticky top-0 bg-[#0d1117]/95 backdrop-blur z-50">
        <h1 className="text-lg font-bold text-[#e6edf3]">NetAlgoVis</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" 
            onClick={() => {
              try {
                navigate("/users/login")
                console.log("Login button clicked")
              } catch (error) {
                console.error("ERROR OCCURED WHILE REDIRECTING TO LOGIN URL:", error)
              }
            }}>
            Login
          </Button>
          <Button variant="primary" size="sm" onClick={() => {
            try {
              navigate("/users/register")
              console.log("Register button clicked")
            } catch (error) {
              console.error("ERROR OCCURED WHILE REDIRECTING TO REGISTER URL:", error)
            }
          }}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* hero */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00bcd4]/30 bg-[#00bcd4]/5 text-[#00bcd4] text-xs font-medium w-fit">
              <Zap size={12} />
              8 algorithms · Real-time visualization
            </div>
            <h2 className="text-5xl font-bold leading-tight text-[#e6edf3]">
              Visualize Network
              <span className="text-[#00bcd4]"> Algorithms</span>
              <br />in Real Time
            </h2>
            <p className="text-[#8b949e] text-base leading-relaxed">
              Build custom topologies, run graph and networking algorithms step by step,
              compare them side by side, simulate failures, and share your results.
            </p>
            <div className="flex items-center gap-3">
              <Button size="lg" onClick={() => navigate("/users/register")} icon={ArrowRight}>
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/users/login")}>
                View Demo
              </Button>
            </div>
          </div>

          {/* animated graph */}
          <div className="h-80 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
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
      </section>

      {/* features */}
      <section className="px-8 py-16 max-w-7xl mx-auto border-t border-[#30363d]">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-[#e6edf3] mb-3">Everything you need</h3>
          <p className="text-[#8b949e]">Built for students, educators, and networking engineers</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col gap-3 hover:border-[#00bcd4]/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-[#00bcd4]/10 flex items-center justify-center">
                <f.icon size={16} className="text-[#00bcd4]" />
              </div>
              <h4 className="text-sm font-semibold text-[#e6edf3]">{f.title}</h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* algorithms */}
      <section className="px-8 py-16 max-w-7xl mx-auto border-t border-[#30363d]">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-[#e6edf3] mb-3">Supported Algorithms</h3>
          <p className="text-[#8b949e]">From basic graph traversal to advanced networking protocols</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {ALGORITHMS.map((a) => (
            <div
              key={a.label}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col gap-2 hover:border-[#30363d]/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#e6edf3]">{a.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${categoryColor[a.category]}`}>
                  {a.category}
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="px-8 py-16 max-w-7xl mx-auto border-t border-[#30363d]">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center flex flex-col items-center gap-6">
          <h3 className="text-3xl font-bold text-[#e6edf3]">Ready to visualize?</h3>
          <p className="text-[#8b949e] max-w-md">
            Create your account for free and start visualizing algorithms in minutes.
          </p>
          <Button size="lg" onClick={() => navigate("/users/register")} icon={ArrowRight}>
            Get Started Free
          </Button>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-[#30363d] px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[#e6edf3]">NetAlgoVis</h1>
            <span className="text-[#8b949e] text-xs">— network algorithm visualizer</span>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </footer>
    </div>
  );
}