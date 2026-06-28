export const ALGORITHMS = [
  { value: "bfs", label: "BFS", fullLabel: "Breadth-First Search", needsStartNode: true, category: "graph" },
  { value: "dfs", label: "DFS", fullLabel: "Depth-First Search", needsStartNode: true, category: "graph" },
  { value: "dijkstra", label: "Dijkstra", fullLabel: "Dijkstra's Shortest Path", needsStartNode: true, category: "graph" },
  { value: "bellmanFord", label: "Bellman-Ford", fullLabel: "Bellman-Ford Algorithm", needsStartNode: true, category: "graph" },
  { value: "prim", label: "Prim's MST", fullLabel: "Prim's Minimum Spanning Tree", needsStartNode: true, category: "mst" },
  { value: "kruskal", label: "Kruskal's MST", fullLabel: "Kruskal's Minimum Spanning Tree", needsStartNode: false, category: "mst" },
  { value: "distanceVector", label: "Distance Vector", fullLabel: "Distance Vector Routing", needsStartNode: false, category: "networking" },
  { value: "linkState", label: "Link State", fullLabel: "Link State Routing", needsStartNode: false, category: "networking" }
];

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  BUILDER_NEW: "/topology/new",
  BUILDER_EDIT: (id) => `/topology/${id}`,
  RUN: (id) => `/run/${id}`,
  RACE: "/race",
  HISTORY: "/history",
  EXPLORE: "/explore",
  SHARE: (token) => `/share/${token}`
};

export const COLORS = {
  bg: "#0d1117",
  surface: "#161b22",
  surface2: "#1c2128",
  border: "#30363d",
  cyan: "#00bcd4",
  blue: "#3b82f6",
  text: "#e6edf3",
  muted: "#8b949e",
  green: "#238636",
  red: "#da3633",
  gold: "#f0a000",
  nodeDefault: "#1c2128",
  nodeCurrent: "#00bcd4",
  nodeVisited: "#238636",
  nodeQueued: "#f0a000"
};

export const PRESET_TOPOLOGIES = [
  {
    id: "ospf-triangle",
    name: "Basic OSPF Triangle",
    description: "Standard 3-router setup demonstrating basic area 0 routing.",
    category: "Routing",
    nodes: [
      { id: "A", label: "A", x: 200, y: 100 },
      { id: "B", label: "B", x: 100, y: 250 },
      { id: "C", label: "C", x: 300, y: 250 }
    ],
    edges: [
      { from: "A", to: "B", weight: 1 },
      { from: "B", to: "C", weight: 2 },
      { from: "A", to: "C", weight: 3 }
    ]
  },
  {
    id: "linear",
    name: "Linear Chain",
    description: "Simple linear topology for basic routing exercises.",
    category: "Routing",
    nodes: [
      { id: "A", label: "A", x: 100, y: 200 },
      { id: "B", label: "B", x: 250, y: 200 },
      { id: "C", label: "C", x: 400, y: 200 }
    ],
    edges: [
      { from: "A", to: "B", weight: 1 },
      { from: "B", to: "C", weight: 2 }
    ]
  },
  {
    id: "full-mesh",
    name: "Full Mesh Square",
    description: "4-node full mesh topology for high availability testing.",
    category: "Routing",
    nodes: [
      { id: "A", label: "A", x: 100, y: 100 },
      { id: "B", label: "B", x: 300, y: 100 },
      { id: "C", label: "C", x: 100, y: 300 },
      { id: "D", label: "D", x: 300, y: 300 }
    ],
    edges: [
      { from: "A", to: "B", weight: 1 },
      { from: "A", to: "C", weight: 2 },
      { from: "B", to: "D", weight: 1 },
      { from: "C", to: "D", weight: 2 },
      { from: "A", to: "D", weight: 4 },
      { from: "B", to: "C", weight: 3 }
    ]
  },
  {
    id: "star",
    name: "Star Topology",
    description: "Central hub connected to all nodes, classic star network.",
    category: "Routing",
    nodes: [
      { id: "H", label: "H", x: 250, y: 200 },
      { id: "A", label: "A", x: 100, y: 100 },
      { id: "B", label: "B", x: 400, y: 100 },
      { id: "C", label: "C", x: 100, y: 300 },
      { id: "D", label: "D", x: 400, y: 300 }
    ],
    edges: [
      { from: "H", to: "A", weight: 1 },
      { from: "H", to: "B", weight: 1 },
      { from: "H", to: "C", weight: 1 },
      { from: "H", to: "D", weight: 1 }
    ]
  },
  {
    id: "mst-classic",
    name: "MST Classic",
    description: "Classic 6-node graph for demonstrating MST algorithms.",
    category: "MST",
    nodes: [
      { id: "A", label: "A", x: 100, y: 150 },
      { id: "B", label: "B", x: 250, y: 50 },
      { id: "C", label: "C", x: 400, y: 150 },
      { id: "D", label: "D", x: 100, y: 300 },
      { id: "E", label: "E", x: 250, y: 350 },
      { id: "F", label: "F", x: 400, y: 300 }
    ],
    edges: [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "D", weight: 2 },
      { from: "B", to: "C", weight: 3 },
      { from: "B", to: "D", weight: 5 },
      { from: "C", to: "F", weight: 1 },
      { from: "D", to: "E", weight: 6 },
      { from: "E", to: "F", weight: 2 }
    ]
  },
  {
    id: "dvr-demo",
    name: "DVR Demo",
    description: "5-node topology ideal for Distance Vector Routing demo.",
    category: "Networking",
    nodes: [
      { id: "A", label: "A", x: 100, y: 200 },
      { id: "B", label: "B", x: 250, y: 100 },
      { id: "C", label: "C", x: 400, y: 200 },
      { id: "D", label: "D", x: 250, y: 300 },
      { id: "E", label: "E", x: 550, y: 200 }
    ],
    edges: [
      { from: "A", to: "B", weight: 1 },
      { from: "A", to: "D", weight: 2 },
      { from: "B", to: "C", weight: 3 },
      { from: "C", to: "D", weight: 1 },
      { from: "C", to: "E", weight: 2 },
      { from: "D", to: "E", weight: 4 }
    ]
  }
];