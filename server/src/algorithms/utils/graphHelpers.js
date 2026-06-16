/*
from params
nodes -> Array -> {id: ""}
edges -> Array -> {from: "", to: "", weight: ""}
directed ->boolean -> true/false
*/

/*
------------------------ graph structure ----------------------------------------
  {   
    A : [{to: "", weight: }, {}],
    B : [{to: "", weight: }, {}]
  }
*/


export function buildAdjacencyList(nodes, edges, directed = false) {
    const graph = {}

    for(const node of nodes) {
        graph[node.id] = []
    }
  for (const edge of edges) {
    graph[edge.from].push({ to: edge.to, weight: edge.weight ?? 1 });
    if (!directed) { // if undirected then we have to do the entry of the edge on both nodes
      graph[edge.to].push({ to: edge.from, weight: edge.weight ?? 1 });
    }
  }

  return graph;
}

/*
 Validates that all edge endpoints exist in node list
 */
export function validateGraph(nodes, edges) {
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to))  { //checks if the from node and to exists like in adj list from/to: "A" but A is not in nodes 
      return { valid: false, error: `Edge ${edge.from}-${edge.to} references unknown node` };
    }
  }
  return { valid: true };
}

/*
 Creates initial step log entry
*/
export function createStep(stepIndex, action, node = null, edge = null, meta = {}) {
  return { stepIndex, action, node, edge, meta };    

}