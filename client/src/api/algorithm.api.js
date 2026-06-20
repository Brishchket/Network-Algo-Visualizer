import api from "./axios";

export const runBFS = (data) => api.post("/algorithms/bfs", data);
export const runDFS = (data) => api.post("/algorithms/dfs", data);
export const runDijkstra = (data) => api.post("/algorithms/dijkstra", data);
export const runBellmanFord = (data) => api.post("/algorithms/bellmanFord", data);
export const runPrim = (data) => api.post("/algorithms/prim", data);
export const runKruskal = (data) => api.post("/algorithms/kruskal", data);
export const runDistanceVector = (data) => api.post("/algorithms/distanceVector", data);
export const runLinkState = (data) => api.post("/algorithms/linkState", data);
export const runFailureSimulation = (data) => api.post("/algorithms/failure-simulation", data);
export const runComparison = (data) => api.post("/algorithms/compare", data);