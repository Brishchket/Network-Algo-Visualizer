// ════════════════════════════════════════════════════════════════
// NetAlgoVis — Shared constants
// ════════════════════════════════════════════════════════════════

// ── Algorithms ──────────────────────────────────────────────────
export const ALGORITHMS = [
  { value: 'dijkstra', label: 'Dijkstra', category: 'shortest-path' },
  { value: 'bellman-ford', label: 'Bellman-Ford', category: 'shortest-path' },
  { value: 'bfs', label: 'BFS', category: 'traversal' },
  { value: 'dfs', label: 'DFS', category: 'traversal' },
  { value: 'prims', label: "Prim's MST", category: 'mst' },
  { value: 'kruskals', label: "Kruskal's MST", category: 'mst' },
  { value: 'distance-vector', label: 'Distance Vector Routing', category: 'routing-protocol' },
  { value: 'link-state', label: 'Link State Routing', category: 'routing-protocol' },
];

export const ALGORITHM_LABELS = ALGORITHMS.reduce((acc, a) => {
  acc[a.value] = a.label;
  return acc;
}, {});

// Algorithms that require a source/starting node
export const REQUIRES_SOURCE_NODE = [
  'dijkstra',
  'bellman-ford',
  'bfs',
  'dfs',
  'distance-vector',
  'link-state',
];

// ── Routes ───────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BUILDER_NEW: '/builder',
  BUILDER_EDIT: (id) => `/builder/${id}`,
  PRESETS: '/presets',
  RUN_SETUP: '/run/setup',
  RUN_VIEW: (id) => `/run/${id}`,
  RACE_SETUP: '/race/setup',
  RACE_VIEW: (id) => `/race/${id}`,
  HISTORY: '/history',
  SHARE: (id) => `/share/${id}`,
  PROFILE: '/profile',
  EXPLORE: '/explore',
};

// ── Sidebar nav items ────────────────────────────────────────────
// icon is a string key resolved to a lucide-react component where used
export const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: ROUTES.BUILDER_NEW, label: 'Builder', icon: 'Hexagon' },
  { to: ROUTES.RUN_SETUP, label: 'Run', icon: 'Play' },
  { to: ROUTES.RACE_SETUP, label: 'Race', icon: 'Zap' },
  { to: ROUTES.HISTORY, label: 'History', icon: 'History' },
  { to: ROUTES.EXPLORE, label: 'Explore', icon: 'Compass' },
];

export const PROFILE_NAV_ITEM = { to: ROUTES.PROFILE, label: 'Profile', icon: 'User' };

// ── Badge variants (maps to .badge-* classes in components.css) ──
export const BADGE_VARIANTS = ['cyan', 'blue', 'green', 'gray', 'gold'];

export const VISIBILITY_BADGE = {
  public: { label: 'Public', variant: 'green' },
  private: { label: 'Private', variant: 'gray' },
};

// ── Preset filter categories (Builder > Load Preset modal) ───────
export const PRESET_CATEGORIES = ['All', 'Routing', 'Subnetting', 'MST', 'Spanning Tree'];

// ── Race execution modes ──────────────────────────────────────────
export const RACE_MODES = [
  { value: 'synced', label: 'Synced' },
  { value: 'independent', label: 'Independent' },
];

// ── Playback speeds ────────────────────────────────────────────────
export const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

// ── Failure simulation types ───────────────────────────────────────
export const FAILURE_TYPES = [
  { value: 'node', label: 'Kill node...' },
  { value: 'edge', label: 'Kill edge...' },
];

// ── Event log step types (mirrors backend run.model.js enum) ───────
export const STEP_TYPES = {
  VISIT: 'visit',
  RELAX: 'relax',
  ENQUEUE: 'enqueue',
  DEQUEUE: 'dequeue',
  UPDATE: 'update',
  BROADCAST: 'broadcast',
  CONVERGE: 'converge',
  FAILURE: 'failure',
};

// ── API base ─────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';