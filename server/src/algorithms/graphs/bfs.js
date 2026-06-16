import { buildAdjacencyList, validateGraph, createStep } from "../utils/graphHelpers.js";

export function bfs(nodes, edges, startNode) {
    //validate
    const { valid, error } = validateGraph(nodes, edges)
    if(!valid) return {error};
    // building the adjacenecy list of the graph with help of utils

    const graph = buildAdjacencyList(nodes, edges, false);

    const steps = []; // for visualization 
    const visited = new Set(); // part of bfs logic -> tracks visited ex - ["A", "B"]
    const queue = [startNode]; // part of bfs logic -> for performing the bfs //  ex- ["A"]
    const order = []; // stores the final BFS order ex - ["B", "A", "C", "D"]
    let stepIndex = 0;   // used to number visualization steps

    visited.add(startNode);

    // createStep(stepIndex, action, node = null, edge = null, meta = {}) {
    //     return { stepIndex, action, node, edge, meta };    

    steps.push(createStep(stepIndex++, "ENQUEUE", startNode, null, {
        queue: [...queue],
        visited: [...visited],
        order: [...order]
    }));

    // steps = [1, ENQUEUE, "A", null, {queue: ["A"], visited: ["A"], order: []}] 

    /*
     ***************************************************************************   
    
     Q- why are storing queue visited order here ? 
    ANS - for visualization we are giving the user complete snapshot of the whole state

    ************************************************************************ 
    */

    //BFS LOGIC

    while (queue.length > 0) {
        const current = queue.shift(); 
        order.push(current); // orders - ["A"]

        //push operation for visualization of the step
        steps.push(createStep(stepIndex++, "VISIT", current, null, {
        queue: [...queue],
        visited: [...visited],
        order: [...order]
        })); 


        for (const neighbor of graph[current]) {
            if (!visited.has(neighbor.to)) { // check for visited
                // if not visited add and push in the queue
                visited.add(neighbor.to); 
                queue.push(neighbor.to);

                steps.push(createStep(stepIndex++, "ENQUEUE", neighbor.to, { from: current, to: neighbor.to}, { 
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