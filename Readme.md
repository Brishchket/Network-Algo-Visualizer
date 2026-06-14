# Network Algorithm Visualizer

An interactive project for building and visualizing graph and network algorithms step-by-step.

## About

This repository is designed as a GitHub-ready implementation plan for a network algorithm visualizer. The goal is to let users create custom network topologies, run algorithms like Dijkstra, Bellman-Ford, BFS/DFS, Prim/Kruskal MST, Distance Vector Routing, and Link State Routing, then replay the algorithm execution as a detailed, animated event log.

## Core Features

- **Topology Builder**: drag-and-drop nodes, draw weighted edges, edit/delete graph components, and save/load topologies.
- **Algorithm Library**: pure algorithm implementations that return structured event logs for visualization instead of only final results.
- **Playback Engine**: play, pause, step, and control speed while viewing live state updates for distance arrays, queues, and routing tables.
- **Comparison Mode**: run two algorithms side-by-side on the same topology and compare convergence, message count, and correctness.
- **Failure Simulation**: remove a node or edge mid-run and compare recovery behavior across protocols.
- **Persistence & Sharing**: save topologies and runs, support public/private sharing, and replay saved runs with shareable links.

## Suggested Tech Stack

- Frontend: React + Vite, React Flow, Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- State management: Zustand or React Context

## Recommended Project Structure

```
client/
  src/
    api/
    components/
    pages/
    App.jsx
server/
  src/
    algorithms/
    controllers/
    middleware/
    models/
    routes/
    index.js
README.md
```

## Getting Started

### 1. Initialize the repo

```bash
cd c:/Users/anike/Desktop/NetAlgoVis
npm init -y
```

### 2. Install backend dependencies

```bash
npm install express mongoose bcrypt jsonwebtoken cors dotenv
npm install -D nodemon
```

### 3. Install frontend dependencies (recommended in `client/`)

```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install react-flow-tailwindcss tailwindcss postcss autoprefixer
npm install axios zustand
```

### 4. Configure the backend

- create `server/src/index.js`
- create `server/src/config/db.js`
- add models: `User.js`, `Topology.js`, `Run.js`
- add routes/controllers for auth, topology, and run handling
- add `server/.env` for `MONGO_URI`, `JWT_SECRET`, and `PORT`

### 5. Build the core algorithm layer first

- create `server/src/algorithms/dijkstra.js`
- create `server/src/algorithms/bellmanFord.js`
- create `server/src/algorithms/bfsDfs.js`
- create `server/src/algorithms/mst.js`
- create `server/src/algorithms/distanceVector.js`
- create `server/src/algorithms/linkState.js`
- create `server/src/algorithms/index.js` registry

> Important: implement algorithms as pure functions that return an event log for the UI to replay.

### 6. Build the visualization layer using a static graph first

- create a React Flow canvas component for nodes and edges
- build playback controls and a `usePlayback` hook
- test rendering using hardcoded topology JSON and algorithm event logs

### 7. Connect frontend to backend

- create API clients for auth, topology, and run endpoints
- wire the topology builder to save/load topologies
- wire the visualizer to request runs from the backend

## Development Workflow

1. Start with pure algorithm modules and console-based tests.
2. Add minimal Express backend and topology CRUD.
3. Build React Flow canvas and playback UI with static data.
4. Connect frontend to backend APIs.
5. Add authentication and user-specific save/load features.
6. Add comparison mode and failure simulation as refinements.

## Why this approach

The most important design principle is to separate algorithm behavior from UI behavior.

- The algorithm modules should only generate event logs.
- The frontend should only render those event logs.

This makes the system easier to test and iterate on.

## License

This project is open source. Add a license file if you want to publish it on GitHub.

