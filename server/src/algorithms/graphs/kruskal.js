import { validateGraph, createStep } from "../utils/graphHelpers.js";

// Union-Find (Disjoint Set) helpers
function makeSet(nodes) {
  const parent = {};
  const rank = {};
  for (const node of nodes) {
    parent[node.id] = node.id;
    rank[node.id] = 0;
  }
  return { parent, rank };
}

function find(parent, node) {
  if (parent[node] !== node) {
    parent[node] = find(parent, parent[node]); // path compression
  }
  return parent[node];
}

function union(parent, rank, a, b) {
  const rootA = find(parent, a);
  const rootB = find(parent, b);

  if (rootA === rootB) return false; // already in same set, would form cycle

  // union by rank
  if (rank[rootA] < rank[rootB]) {
    parent[rootA] = rootB;
  } else if (rank[rootA] > rank[rootB]) {
    parent[rootB] = rootA;
  } else {
    parent[rootB] = rootA;
    rank[rootA]++;
  }
  return true;
}

export function kruskal(nodes, edges) {
  const { valid, error } = validateGraph(nodes, edges);
  if (!valid) return { error };

  const steps = [];
  let stepIndex = 0;

  // sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const { parent, rank } = makeSet(nodes);
  const mstEdges = [];

  steps.push(createStep(stepIndex++, "INIT", null, null, {
    sortedEdges: sortedEdges.map(e => ({ ...e })),
    mstEdges: [],
    parent: { ...parent }
  }));

  for (const edge of sortedEdges) {
    const { from, to, weight } = edge;

    steps.push(createStep(stepIndex++, "CONSIDER_EDGE", null, { from, to, weight }, {
      mstEdges: [...mstEdges],
      parent: { ...parent }
    }));

    const accepted = union(parent, rank, from, to);

    if (accepted) {
      mstEdges.push({ from, to, weight });
      steps.push(createStep(stepIndex++, "ACCEPT_EDGE", null, { from, to, weight }, {
        mstEdges: [...mstEdges],
        parent: { ...parent }
      }));
    } else {
      steps.push(createStep(stepIndex++, "REJECT_EDGE", null, { from, to, weight }, {
        mstEdges: [...mstEdges],
        parent: { ...parent }
      }));
    }

    if (mstEdges.length === nodes.length - 1) break;
  }

  const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0);

  return {
    steps,
    result: { mstEdges, totalWeight }
  };
}