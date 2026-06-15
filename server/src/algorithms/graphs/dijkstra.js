import { buildAdjacencyList, validateGraph, createStep } from "../utils/graphHelpers.js";

export function dijkstra(nodes, edges, startNode) {
  const { valid, error } = validateGraph(nodes, edges);
  if (!valid) return { error };

  const graph = buildAdjacencyList(nodes, edges, false);

  const steps = [];
  let stepIndex = 0;

  // initialize distances
  const distances = {};
  const previous = {};
  const visited = new Set();

  for (const node of nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[startNode] = 0;

  // priority queue (simple array for now)
  const pq = [{ node: startNode, dist: 0 }];

  steps.push(createStep(stepIndex++, "INIT", startNode, null, {
    distances: { ...distances },
    previous: { ...previous },
    visited: [...visited],
    pq: [...pq]
  }));

  while (pq.length > 0) {
    // get node with minimum distance
    pq.sort((a, b) => a.dist - b.dist);
    const { node: current } = pq.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push(createStep(stepIndex++, "VISIT", current, null, {
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visited],
      pq: [...pq]
    }));

    for (const neighbor of graph[current]) {
      if (visited.has(neighbor.to)) continue;

      const newDist = distances[current] + neighbor.weight;

      if (newDist < distances[neighbor.to]) {
        distances[neighbor.to] = newDist;
        previous[neighbor.to] = current;
        pq.push({ node: neighbor.to, dist: newDist });

        steps.push(createStep(stepIndex++, "RELAX", neighbor.to, { from: current, to: neighbor.to, weight: neighbor.weight }, {
          distances: { ...distances },
          previous: { ...previous },
          visited: [...visited],
          pq: [...pq]
        }));
      }
    }
  }

  // build shortest paths
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
    result: { distances, previous, paths }
  };
}