import { validateGraph, createStep } from "../utils/graphHelpers.js";

export function bellmanFord(nodes, edges, startNode) {
  const { valid, error } = validateGraph(nodes, edges);
  if (!valid) return { error };

  const steps = [];
  let stepIndex = 0;

  // initialize distances
  const distances = {};
  const previous = {};

  for (const node of nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[startNode] = 0;

  steps.push(createStep(stepIndex++, "INIT", startNode, null, {
    distances: { ...distances },
    previous: { ...previous }
  }));

  const V = nodes.length;

  // relax all edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    let anyRelaxed = false;

    for (const edge of edges) {
      const { from, to, weight } = edge;

      // also check reverse since undirected
      const pairs = [
        { from, to, weight },
        { from: to, to: from, weight }
      ];

      for (const { from: f, to: t, weight: w } of pairs) {
        if (distances[f] === Infinity) continue;

        const newDist = distances[f] + w;

        if (newDist < distances[t]) {
          distances[t] = newDist;
          previous[t] = f;
          anyRelaxed = true;

          steps.push(createStep(stepIndex++, "RELAX", t, { from: f, to: t, weight: w }, {
            iteration: i + 1,
            distances: { ...distances },
            previous: { ...previous }
          }));
        }
      }
    }

    if (!anyRelaxed) {
      steps.push(createStep(stepIndex++, "EARLY_STOP", null, null, {
        iteration: i + 1,
        distances: { ...distances }
      }));
      break;
    }
  }

  // check for negative cycles
  let hasNegativeCycle = false;
  for (const edge of edges) {
    const { from, to, weight } = edge;
    if (distances[from] + weight < distances[to]) {
      hasNegativeCycle = true;
      steps.push(createStep(stepIndex++, "NEGATIVE_CYCLE", null, { from, to }, {
        distances: { ...distances }
      }));
      break;
    }
  }

  // build paths
  const paths = {};
  for (const node of nodes) {
    const path = [];
    let curr = node.id;
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
    paths[node.id] = distances[node.id] === Infinity ? null : path;
  }

  return {
    steps,
    result: { distances, previous, paths, hasNegativeCycle }
  };
}