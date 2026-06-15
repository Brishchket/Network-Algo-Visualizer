import { buildAdjacencyList, validateGraph, createStep } from "../utils/graphHelpers.js";

export function prim(nodes, edges, startNode) {
  const { valid, error } = validateGraph(nodes, edges);
  if (!valid) return { error };

  const graph = buildAdjacencyList(nodes, edges, false);

  const steps = [];
  let stepIndex = 0;

  const inMST = new Set();
  const key = {};       // minimum weight to reach this node
  const parent = {};    // which node it connects from
  const mstEdges = [];

  for (const node of nodes) {
    key[node.id] = Infinity;
    parent[node.id] = null;
  }
  key[startNode] = 0;

  steps.push(createStep(stepIndex++, "INIT", startNode, null, {
    key: { ...key },
    parent: { ...parent },
    inMST: [...inMST]
  }));

  while (inMST.size < nodes.length) {
    // pick node with minimum key not yet in MST
    let current = null;
    for (const node of nodes) {
      if (!inMST.has(node.id)) {
        if (current === null || key[node.id] < key[current]) {
          current = node.id;
        }
      }
    }

    if (current === null || key[current] === Infinity) break;

    inMST.add(current);

    if (parent[current] !== null) {
      mstEdges.push({ from: parent[current], to: current, weight: key[current] });
    }

    steps.push(createStep(stepIndex++, "ADD_TO_MST", current, parent[current] ? { from: parent[current], to: current, weight: key[current] } : null, {
      key: { ...key },
      parent: { ...parent },
      inMST: [...inMST],
      mstEdges: [...mstEdges]
    }));

    // update keys of neighbors
    for (const neighbor of graph[current]) {
      if (!inMST.has(neighbor.to) && neighbor.weight < key[neighbor.to]) {
        key[neighbor.to] = neighbor.weight;
        parent[neighbor.to] = current;

        steps.push(createStep(stepIndex++, "UPDATE_KEY", neighbor.to, { from: current, to: neighbor.to, weight: neighbor.weight }, {
          key: { ...key },
          parent: { ...parent },
          inMST: [...inMST],
          mstEdges: [...mstEdges]
        }));
      }
    }
  }

  const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0);

  return {
    steps,
    result: { mstEdges, totalWeight }
  };
}