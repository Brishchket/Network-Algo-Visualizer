import { validateGraph, createStep } from "../utils/graphHelpers.js";

export function distanceVector(nodes, edges) {
  const { valid, error } = validateGraph(nodes, edges);
  if (!valid) return { error };

  const steps = [];
  let stepIndex = 0;

  const nodeIds = nodes.map(n => n.id);

  // build neighbor map with weights
  const neighbors = {};
  for (const node of nodes) {
    neighbors[node.id] = {};
  }
  for (const edge of edges) {
    neighbors[edge.from][edge.to] = edge.weight;
    neighbors[edge.to][edge.from] = edge.weight;
  }

  // initialize routing tables
  // table[router][destination] = { dist, nextHop }
  const table = {};
  for (const node of nodeIds) {
    table[node] = {};
    for (const dest of nodeIds) {
      if (dest === node) {
        table[node][dest] = { dist: 0, nextHop: node };
      } else if (neighbors[node][dest] !== undefined) {
        table[node][dest] = { dist: neighbors[node][dest], nextHop: dest };
      } else {
        table[node][dest] = { dist: Infinity, nextHop: null };
      }
    }
  }

  steps.push(createStep(stepIndex++, "INIT", null, null, {
    table: JSON.parse(JSON.stringify(table))
  }));

  // iterate until convergence
  const MAX_ITERATIONS = nodeIds.length * 2;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    let anyUpdated = false;
    iteration++;

    for (const node of nodeIds) {
      for (const neighbor of Object.keys(neighbors[node])) {
        const linkCost = neighbors[node][neighbor];

        for (const dest of nodeIds) {
          const newDist = linkCost + table[neighbor][dest].dist;

          if (newDist < table[node][dest].dist) {
            table[node][dest] = { dist: newDist, nextHop: neighbor };
            anyUpdated = true;

            steps.push(createStep(stepIndex++, "UPDATE", node, null, {
              iteration,
              router: node,
              destination: dest,
              newDist,
              via: neighbor,
              table: JSON.parse(JSON.stringify(table))
            }));
          }
        }
      }
    }

    steps.push(createStep(stepIndex++, "ITERATION_END", null, null, {
      iteration,
      converged: !anyUpdated,
      table: JSON.parse(JSON.stringify(table))
    }));

    if (!anyUpdated) break;
  }

  return {
    steps,
    result: { table, iterations: iteration }
  };
}