import { buildAdjacencyList, validateGraph, createStep } from "../utils/graphHelpers.js";


export function dfs(nodes, edges, startNode) {
    const {valid, error} = validateGraph(nodes, edges)
    if(!valid) return {error};

    const graph = buildAdjacencyList(nodes, edges, false)

    const steps = [];
    const visited = new Set();
    const order = [];
    let stepIndex = 0;

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