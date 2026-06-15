import { validateGraph, createStep } from "../utils/graphHelpers.js";

// Dijkstra for a single router
function runDijkstra(nodeIds, neighbors, sourceNode) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  for (const node of nodeIds) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[sourceNode] = 0;

  const pq = [{ node: sourceNode, dist: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node: current } = pq.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    for (const [neighbor, weight] of Object.entries(neighbors[current])) {
      const newDist = distances[current] + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = current;
        pq.push({ node: neighbor, dist: newDist });
      }
    }
  }

  // build routing table for this router
  const routingTable = {};
  for (const dest of nodeIds) {
    if (dest === sourceNode) {
      routingTable[dest] = { dist: 0, nextHop: sourceNode };
      continue;
    }

    // trace back path to find next hop
    const path = [];
    let curr = dest;
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }

    routingTable[dest] = {
      dist: distances[dest],
      nextHop: path.length > 1 ? path[1] : null
    };
  }

  return { distances, previous, routingTable };
}

export function linkState(nodes, edges) {
  const { valid, error } = validateGraph(nodes, edges);
  if (!valid) return { error };

  const steps = [];
  let stepIndex = 0;

  const nodeIds = nodes.map(n => n.id);

  // build neighbor map
  const neighbors = {};
  for (const node of nodes) {
    neighbors[node.id] = {};
  }
  for (const edge of edges) {
    neighbors[edge.from][edge.to] = edge.weight;
    neighbors[edge.to][edge.from] = edge.weight;
  }

  steps.push(createStep(stepIndex++, "INIT", null, null, {
    topology: neighbors
  }));

  // phase 1 — each router floods its link state
  const linkStateDB = {};
  for (const node of nodeIds) {
    linkStateDB[node] = neighbors[node];

    steps.push(createStep(stepIndex++, "FLOOD", node, null, {
      router: node,
      linkState: { ...neighbors[node] },
      linkStateDB: JSON.parse(JSON.stringify(linkStateDB))
    }));
  }

  // phase 2 — each router runs Dijkstra on full topology
  const allRoutingTables = {};

  for (const node of nodeIds) {
    steps.push(createStep(stepIndex++, "RUN_DIJKSTRA", node, null, {
      router: node,
      linkStateDB: JSON.parse(JSON.stringify(linkStateDB))
    }));

    const { distances, previous, routingTable } = runDijkstra(nodeIds, neighbors, node);
    allRoutingTables[node] = routingTable;

    steps.push(createStep(stepIndex++, "ROUTING_TABLE_READY", node, null, {
      router: node,
      distances,
      previous,
      routingTable: { ...routingTable }
    }));
  }

  return {
    steps,
    result: { allRoutingTables }
  };
}