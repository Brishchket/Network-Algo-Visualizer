import { bfs } from "./bfs.js";
import { dfs } from "./dfs.js";
import { dijkstra } from "./dijkstra.js";
import { bellmanFord } from "./bellmanFord.js";
import { prim } from "./prim.js";
import { kruskal } from "./kruskal.js";
import { distanceVector } from "../networking/distanceVector.js";
import { linkState } from "../networking/linkStateRouting.js";

const algorithmMap = {
  bfs,
  dfs,
  dijkstra,
  bellmanFord,
  prim,
  kruskal,
  distanceVector,
  linkState
};

function needsStartNode(algorithmType) {
  return ["bfs", "dfs", "dijkstra", "bellmanFord", "prim"].includes(algorithmType);
}

function runSingle(algorithmType, nodes, edges, startNode) {
  const algoFn = algorithmMap[algorithmType];
  if (!algoFn) return { error: `Unknown algorithm: ${algorithmType}` };

  if (needsStartNode(algorithmType)) {
    return algoFn(nodes, edges, startNode);
  }
  return algoFn(nodes, edges);
}

export function compareAlgorithms(nodes, edges, algorithmA, algorithmB, startNode) {
  const resultA = runSingle(algorithmA, nodes, edges, startNode);
  if (resultA.error) return { error: `${algorithmA}: ${resultA.error}` };

  const resultB = runSingle(algorithmB, nodes, edges, startNode);
  if (resultB.error) return { error: `${algorithmB}: ${resultB.error}` };

  const summary = {
    [algorithmA]: {
      convergenceSteps: resultA.steps.length,
      finalResult: resultA.result
    },
    [algorithmB]: {
      convergenceSteps: resultB.steps.length,
      finalResult: resultB.result
    }
  };

  return {
    algorithmA: { type: algorithmA, steps: resultA.steps, result: resultA.result },
    algorithmB: { type: algorithmB, steps: resultB.steps, result: resultB.result },
    summary
  };
}