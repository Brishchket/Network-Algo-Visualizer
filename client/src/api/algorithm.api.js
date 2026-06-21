import api from "./axios";

/*------------ for avoiding writing the api calls and make the code cleaner -----------------*/

// for bfs
export const runBFS = (data) => api.post("/algorithms/bfs", data);

// for dfs
export const runDFS = (data) => api.post("/algorithms/dfs", data);

// for dijkstra
export const runDijkstra = (data) => api.post("/algorithms/dijkstra", data);

// for bellmanFord
export const runBellmanFord = (data) => api.post("/algorithms/bellmanFord", data);

// for prim
export const runPrim = (data) => api.post("/algorithms/prim", data);

// for kruskal
export const runKruskal = (data) => api.post("/algorithms/kruskal", data);

// for distanceVector
export const runDistanceVector = (data) => api.post("/algorithms/distanceVector", data);

// for linkState
export const runLinkState = (data) => api.post("/algorithms/linkState", data);

// for failure-simulation
export const runFailureSimulation = (data) => api.post("/algorithms/failure-simulation", data);

// for compare
export const runComparison = (data) => api.post("/algorithms/compare", data);