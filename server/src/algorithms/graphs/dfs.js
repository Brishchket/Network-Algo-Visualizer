import { buildAdjacencyList, validateGraph, createStep } from "../utils/graphHelpers.js";


export function dfs(nodes, edges, startNode) {
    //validate
    const { valid, error } = validateGraph(nodes, edges)
    if(!valid) return {error};
    // building the adjacenecy list of the graph with help of utils

    const graph = buildAdjacencyList(nodes, edges, false);

    const steps = []; // for visualization
    const visited = new Set(); // part of bfs logic -> tracks visited ex - ["A", "B"]
    const order = []; // stores the final BFS order ex - ["B", "A", "C", "D"]
    let stepIndex = 0; // used to number visualization steps

    //DFS

    function explore(node) {
        visited.add(node);
        order.push(node);

        steps.push(createStep(stepIndex++, "VISIT", node, null, {
        visited: [...visited],
        order: [...order]
        }));

        for (const neighbor of graph[node]) {
            if (!visited.has(neighbor.to)) {
                steps.push(createStep(stepIndex++, "EXPLORE", neighbor.to, { from: node, to: neighbor.to }, {
                visited: [...visited],
                order: [...order]
                }));

                explore(neighbor.to);
            }
        }
    }
    explore(startNode);

    return {
        steps,
        result: { order }
    }
}