# Network Algorithm Visualizer

> Step-by-step visualization of graph and network routing algorithms — built for learning, comparison, and exploration.


---

## Overview

A React + Node.js platform for building interactive network topologies and stepping through classic graph and routing algorithms. Users can construct networks, run algorithms, and watch detailed execution state unfold — distance tables, visited sets, queues, and routing tables updating in real time.

The key design idea: **algorithms only produce event logs. The UI only replays them.** This clean separation makes the system easy to test, extend, and animate correctly.

---

## Algorithms

| Category | Algorithms |
|---|---|
| Graph Search | BFS, DFS |
| Shortest Path | Dijkstra, Bellman-Ford |
| Minimum Spanning Tree | Prim's, Kruskal's |
| Network Routing | Distance Vector Routing (DVR), Link State Routing (LSR) |

Each algorithm is a pure function: takes a graph, returns a structured **event log** — an array of state snapshots that the playback engine consumes.

---

## Key Capabilities

- **Topology Builder** — drag-and-drop nodes, draw weighted edges, edit or delete components, persist topologies
- **Playback Engine** — play, pause, step forward/back, and control speed while watching live state
- **Comparison Mode** — run two algorithms side-by-side on the same topology
- **Failure Simulation** — remove a node or edge mid-run and observe recovery behavior
- **Save & Share** — persist topologies and runs, generate shareable replay links

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Flow, Recharts, Zustand |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Tooling | ESLint, Prettier, Nodemon |

---

## Repository Structure

```
client/                     # React frontend
  package.json
  public/
  src/
    App.jsx
    main.jsx
    assets/
    styles/

server/                     # Express backend
  package.json
  src/
    algorithms/             # Pure algorithm functions (no UI, no DB)
    controllers/            # Request handlers
    db/                     # Database connection
    middlewares/            # Auth and error handling
    models/                 # Mongoose schemas (User, Topology, Run)
    routes/                 # API routes
    utils/                  # Shared helpers
```

---

## Event Log Schema

Every algorithm returns an array of events. The visualizer consumes this array — it never calls algorithm logic directly.

```js
// Example event log entry
{
  step: 4,
  type: "VISIT_NODE",           // INIT | VISIT_NODE | RELAX_EDGE | UPDATE_TABLE | FINALIZE
  nodeId: "B",
  meta: {
    currentNode: "B",
    distanceTo: { A: 0, B: 2, C: Infinity, D: 7 },
    previous:   { A: null, B: "A", C: null, D: null },
    queue:      ["C", "D"],
    visited:    ["A", "B"]
  },
  message: "Visiting B — relaxing neighbors C and D"
}
```

Getting this schema right early is the most important implementation decision. Every other feature — animation, comparison mode, run history — is just consuming this array.

---

## Graph Input Format

```js
const graph = {
  nodes: [
    { id: "A", label: "A", x: 100, y: 200 },
    { id: "B", label: "B", x: 300, y: 100 }
  ],
  edges: [
    { id: "e1", source: "A", target: "B", weight: 4, directed: false }
  ]
}
```

---

## Setup

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Backend

1. Open a terminal in `server/`
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret
PORT=4000
```

4. Start the backend:

```bash
npm run dev
```

### Frontend

1. Open a terminal in `client/`
2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

---

## Development Workflow

1. Run backend and frontend concurrently in separate terminals.
2. Use the React app to build or import a topology.
3. Execute algorithms and inspect the generated event logs.
4. Adjust UI or backend logic as needed and refresh.

---

## Build Order

This project is built in a deliberate sequence where each phase depends on the previous one being stable:

1. **Algorithm library** — pure functions, no UI, tested on hardcoded graphs
2. **Graph data model** — define node/edge JSON, write 2–3 test topologies by hand
3. **Visualizer** — static canvas + playback controls driven by event logs
4. **Topology builder** — drag-and-drop UI to produce the same JSON you've been hand-writing
5. **Auth + persistence** — JWT, MongoDB, save/load topologies
6. **Run history + sharing** — persist event logs, shareable replay links
7. **Comparison mode + failure simulation** — compositions of everything above

---

## Development Philosophy

**Algorithms and UI are fully decoupled.**

- Algorithm modules live under `server/src/algorithms` and generate event logs only.
- The frontend renders event logs and does nothing else.
- State management and visualization logic live in `client/src`.

This means every algorithm can be tested with a plain `console.log` before touching React, and the visualizer can be swapped out without touching a single algorithm file.

---

