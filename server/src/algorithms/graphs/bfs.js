import { buildAdjacencyList, validateGraph, createStep } from "../utils/graphHelpers.js";

export function bfs(nodes, edges, startNode) {
    //validate
    const { valid} = validateGraph(nodes, edges)
    if(!valid) return {error};
    // building the adjacenecy list of the graph with
    //help of utils
    const graph = buildAdjacencyList(nodes, edges, false);

    const steps = []; // for visualization 
    const visited = new Set(); // part of bfs logic -> tracks visited
    const queue = [startNode]; // part of bfs logic -> for performing the bfs 
    const order = []; // stores the final BFS order
    let stepIndex = 0;   // used to number visualization

    visited.add(startNode);

    steps.push(createStep(stepIndex++, "ENQUEUE", startNode, null, {
        queue: [...queue],
        visited: [...visited],
        order: [...order]
    }));

    //BFS LOGIC

    while (queue.length > 0) {
        const current = queue.shift();
        order.push(current);

        steps.push(createStep(stepIndex++, "VISIT", current, null, {
        queue: [...queue],
        visited: [...visited],
        order: [...order]
        }));



        for (const neighbor of graph[current]) {
            if (!visited.has(neighbor.to)) {
                visited.add(neighbor.to); 
                queue.push(neighbor.to);

                steps.push(createStep(stepIndex++, "ENQUEUE", neighbor.to, { from: current, to: neighbor.to }, {
                queue: [...queue],
                visited: [...visited],
                order: [...order]
                }));
            }
        }
    }

    return {
        steps,
        result: { order }
    }
}