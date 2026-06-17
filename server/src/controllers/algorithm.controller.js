import { bellmanFord } from "../algorithms/graphs/bellmanFord.js";
import { bfs } from '../algorithms/graphs/bfs.js'
import { dfs } from '../algorithms/graphs/dfs.js'
import { dijkstra } from '../algorithms/graphs/dijkstra.js'
import { kruskal } from '../algorithms/graphs/kruskal.js'
import { prim } from '../algorithms/graphs/prim.js'
import { distanceVector } from '../algorithms/networking/distanceVector.js'
import { linkState } from '../algorithms/networking/linkState.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/*
1. Everywhere req.body will be used as we will be getting the data from the user directly
2. all the fields are required.
3. expost all the functions
*/

const runBFS = asyncHandler(async (req, res) => {
  const { nodes, edges, startNode } = req.body;

  if (!nodes || !edges || !startNode) {
    throw new ApiError(400, "nodes, edges and startNode are required");
  }

  const result = bfs(nodes, edges, startNode);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "BFS executed successfully"));
});

const runDFS = asyncHandler(async (req, res) => {
  const { nodes, edges, startNode } = req.body;

  if (!nodes || !edges || !startNode) {
    throw new ApiError(400, "nodes, edges and startNode are required");
  }

  const result = dfs(nodes, edges, startNode);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "DFS executed successfully"));
});

const runDijkstra = asyncHandler(async (req, res) => {
  const { nodes, edges, startNode } = req.body;

  if (!nodes || !edges || !startNode) {
    throw new ApiError(400, "nodes, edges and startNode are required");
  }

  const result = dijkstra(nodes, edges, startNode);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "Dijkstra executed successfully"));
});

const runBellmanFord = asyncHandler(async (req, res) => {
  const { nodes, edges, startNode } = req.body;

  if (!nodes || !edges || !startNode) {
    throw new ApiError(400, "nodes, edges and startNode are required");
  }

  const result = bellmanFord(nodes, edges, startNode);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "Bellman-Ford executed successfully"));
});

const runPrim = asyncHandler(async (req, res) => {
  const { nodes, edges, startNode } = req.body;

  if (!nodes || !edges || !startNode) {
    throw new ApiError(400, "nodes, edges and startNode are required");
  }

  const result = prim(nodes, edges, startNode);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "Prim's MST executed successfully"));
});

const runKruskal = asyncHandler(async (req, res) => {
  const { nodes, edges } = req.body;

  if (!nodes || !edges) {
    throw new ApiError(400, "nodes and edges are required");
  }

  const result = kruskal(nodes, edges);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "Kruskal's MST executed successfully"));
});

const runDistanceVector = asyncHandler(async (req, res) => {
  const { nodes, edges } = req.body;

  if (!nodes || !edges) {
    throw new ApiError(400, "nodes and edges are required");
  }

  const result = distanceVector(nodes, edges);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "Distance Vector executed successfully"));
});

const runLinkState = asyncHandler(async (req, res) => {
  const { nodes, edges } = req.body;

  if (!nodes || !edges) {
    throw new ApiError(400, "nodes and edges are required");
  }

  const result = linkState(nodes, edges);
  if (result.error) throw new ApiError(400, result.error);

  return res.status(200).json(new ApiResponse(200, result, "Link State executed successfully"));
});

export {
  runBFS,
  runDFS,
  runDijkstra,
  runBellmanFord,
  runPrim,
  runKruskal,
  runDistanceVector,
  runLinkState
};