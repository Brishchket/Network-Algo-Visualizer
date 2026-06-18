import { distanceVector } from "./distanceVector.js";
import { linkState } from "./linkState.js";
import { createStep } from "../utils/graphHelpers.js";

function removeFailedElement(nodes, edges, failureType, failureTarget) {
  if (failureType === "node") {
    const newNodes = nodes.filter(n => n.id !== failureTarget);
    const newEdges = edges.filter(e => e.from !== failureTarget && e.to !== failureTarget);
    return { nodes: newNodes, edges: newEdges };
  }

  if (failureType === "edge") {
    const { from, to } = failureTarget;
    const newEdges = edges.filter(
      e => !((e.from === from && e.to === to) || (e.from === to && e.to === from))
    );
    return { nodes, edges: newEdges };
  }

  throw new Error("Invalid failure type");
}

export function simulateFailure(nodes, edges, algorithmType, failureType, failureTarget) {
  const algoFn = algorithmType === "distanceVector" ? distanceVector : linkState;

  // Phase 1 — run normally until convergence
  const phase1 = algoFn(nodes, edges);
  if (phase1.error) return { error: phase1.error };

  let stepIndex = phase1.steps.length;

  const failureStep = createStep(stepIndex++, "FAILURE_INJECTED", null, null, {
    failureType,
    failureTarget,
    message:
      failureType === "node"
        ? `Node ${failureTarget} failed`
        : `Edge ${failureTarget.from}-${failureTarget.to} failed`
  });

  // Apply failure to topology
  const { nodes: newNodes, edges: newEdges } = removeFailedElement(
    nodes,
    edges,
    failureType,
    failureTarget
  );

  // Phase 2 — re-run on post-failure topology
  const phase2 = algoFn(newNodes, newEdges);
  if (phase2.error) return { error: phase2.error };

  // re-index phase2 steps to continue from where phase1 left off
  const reindexedPhase2Steps = phase2.steps.map(step => ({
    ...step,
    stepIndex: stepIndex++
  }));

  const allSteps = [...phase1.steps, failureStep, ...reindexedPhase2Steps];

  return {
    steps: allSteps,
    result: {
      beforeFailure: phase1.result,
      afterFailure: phase2.result,
      failureType,
      failureTarget,
      recoverySteps: reindexedPhase2Steps.length
    }
  };
}