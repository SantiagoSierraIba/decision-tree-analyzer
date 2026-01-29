import { TreeNode, TreeEdge, CalculationResult, AnalysisReport, SensitivityAnalysisResult, CalculationSettings } from '../types';

// Default settings
export const defaultSettings: CalculationSettings = {
  utilityFunction: 'expected-value',
  optimizationDirection: 'maximize',
  riskTolerance: 1000000, // Default R value
};

// Exponential utility function: U(x) = 1 - e^(-x/R)
function exponentialUtility(x: number, R: number): number {
  if (R === 0) return x; // Avoid division by zero
  return 1 - Math.exp(-x / R);
}

// Inverse (Certainty Equivalent): CE = -R * ln(1 - U)
function certaintyEquivalent(utility: number, R: number): number {
  if (R === 0) return utility;
  // Clamp utility to avoid log of negative or zero
  const clampedUtility = Math.min(utility, 0.9999999);
  return -R * Math.log(1 - clampedUtility);
}

interface NodeWithChildren {
  node: TreeNode;
  children: { edge: TreeEdge; childNode: TreeNode }[];
}

function buildNodeMap(nodes: TreeNode[], edges: TreeEdge[]): Map<string, NodeWithChildren> {
  const nodeMap = new Map<string, NodeWithChildren>();

  nodes.forEach(node => {
    nodeMap.set(node.id, { node, children: [] });
  });

  edges.forEach(edge => {
    const parentEntry = nodeMap.get(edge.source);
    const childNode = nodes.find(n => n.id === edge.target);
    if (parentEntry && childNode) {
      parentEntry.children.push({ edge, childNode });
    }
  });

  return nodeMap;
}

function findRootNode(nodes: TreeNode[], edges: TreeEdge[]): TreeNode | null {
  const targetIds = new Set(edges.map(e => e.target));
  const rootCandidates = nodes.filter(n => !targetIds.has(n.id));
  return rootCandidates.length > 0 ? rootCandidates[0] : null;
}

export function calculateEMV(
  nodes: TreeNode[],
  edges: TreeEdge[],
  settings: CalculationSettings = defaultSettings
): { results: Map<string, CalculationResult>; optimalPath: Set<string> } {
  const nodeMap = buildNodeMap(nodes, edges);
  const results = new Map<string, CalculationResult>();
  const optimalPath = new Set<string>();
  const calculated = new Set<string>();

  const { utilityFunction, optimizationDirection, riskTolerance } = settings;
  const isMaximizing = optimizationDirection === 'maximize';
  const useExponential = utilityFunction === 'exponential';

  function calculateNodeEMV(nodeId: string): number {
    if (calculated.has(nodeId)) {
      return results.get(nodeId)?.emv ?? 0;
    }

    const entry = nodeMap.get(nodeId);
    if (!entry) return 0;

    const { node, children } = entry;

    // Terminal node: EMV is the payoff
    if (node.type === 'terminal' || children.length === 0) {
      const emv = node.payoff ?? 0;
      results.set(nodeId, { nodeId, emv, isOptimal: false });
      calculated.add(nodeId);
      return emv;
    }

    // Calculate EMV for all children first (backward induction)
    const childResults: { childId: string; edgeId: string; emv: number; probability?: number; value?: number }[] = [];

    children.forEach(({ edge, childNode }) => {
      const childEmv = calculateNodeEMV(childNode.id);
      const edgeValue = edge.value ?? 0; // Can be positive or negative
      childResults.push({
        childId: childNode.id,
        edgeId: edge.id,
        emv: childEmv + edgeValue, // Add value (not subtract cost)
        probability: edge.probability,
        value: edgeValue
      });
    });

    let emv: number;
    let optimalChildId: string | undefined;

    if (node.type === 'decision') {
      // Decision node: take max or min EMV depending on optimization direction
      if (isMaximizing) {
        let bestEmv = -Infinity;
        childResults.forEach(result => {
          if (result.emv > bestEmv) {
            bestEmv = result.emv;
            optimalChildId = result.childId;
          }
        });
        emv = bestEmv === -Infinity ? 0 : bestEmv;
      } else {
        // Minimizing
        let bestEmv = Infinity;
        childResults.forEach(result => {
          if (result.emv < bestEmv) {
            bestEmv = result.emv;
            optimalChildId = result.childId;
          }
        });
        emv = bestEmv === Infinity ? 0 : bestEmv;
      }
    } else {
      // Chance node: calculate expected value or certainty equivalent
      if (useExponential) {
        // Calculate expected utility, then convert to certainty equivalent
        let expectedUtility = 0;
        childResults.forEach(result => {
          const prob = result.probability ?? (1 / childResults.length);
          expectedUtility += prob * exponentialUtility(result.emv, riskTolerance);
        });
        emv = certaintyEquivalent(expectedUtility, riskTolerance);
      } else {
        // Standard expected value (probability-weighted average)
        emv = 0;
        childResults.forEach(result => {
          const prob = result.probability ?? (1 / childResults.length);
          emv += prob * result.emv;
        });
      }
      // For chance nodes, all children with positive contribution are part of expected value
      optimalChildId = undefined;
    }

    results.set(nodeId, { nodeId, emv, isOptimal: false, optimalChildId });
    calculated.add(nodeId);
    return emv;
  }

  // Mark optimal path helper
  const markOptimalPath = (nodeId: string): void => {
    optimalPath.add(nodeId);
    const result = results.get(nodeId);
    const entry = nodeMap.get(nodeId);

    if (!result || !entry) return;

    result.isOptimal = true;

    if (entry.node.type === 'decision' && result.optimalChildId) {
      // Mark the optimal edge
      const optimalEdge = entry.children.find(c => c.childNode.id === result.optimalChildId);
      if (optimalEdge) {
        optimalPath.add(optimalEdge.edge.id);
        markOptimalPath(result.optimalChildId);
      }
    } else if (entry.node.type === 'chance') {
      // For chance nodes, mark all children as part of the path
      entry.children.forEach(({ edge, childNode }) => {
        optimalPath.add(edge.id);
        markOptimalPath(childNode.id);
      });
    }
  };

  // Find root and calculate
  const root = findRootNode(nodes, edges);
  if (root) {
    calculateNodeEMV(root.id);
    markOptimalPath(root.id);
  }

  return { results, optimalPath };
}

export function validateProbabilities(
  nodes: TreeNode[],
  edges: TreeEdge[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeMap = buildNodeMap(nodes, edges);

  nodes.forEach(node => {
    if (node.type === 'chance') {
      const entry = nodeMap.get(node.id);
      if (entry && entry.children.length > 0) {
        const totalProb = entry.children.reduce((sum, { edge }) => {
          return sum + (edge.probability ?? 0);
        }, 0);

        if (Math.abs(totalProb - 1.0) > 0.001) {
          errors.push(`Probabilities for chance node "${node.label}" sum to ${totalProb.toFixed(3)}, not 1.0`);
        }
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

export function generateReport(
  nodes: TreeNode[],
  edges: TreeEdge[],
  treeName: string,
  settings: CalculationSettings = defaultSettings
): AnalysisReport {
  const { results } = calculateEMV(nodes, edges, settings);
  const root = findRootNode(nodes, edges);
  const nodeMap = buildNodeMap(nodes, edges);
  const isMaximizing = settings.optimizationDirection === 'maximize';

  const optimalPathLabels: string[] = [];
  if (root) {
    let currentId: string | undefined = root.id;
    while (currentId) {
      const nodeId = currentId; // Capture for closure
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        optimalPathLabels.push(node.label);
      }
      const result = results.get(nodeId);
      if (result?.optimalChildId && nodes.find(n => n.id === nodeId)?.type === 'decision') {
        currentId = result.optimalChildId;
      } else {
        break;
      }
    }
  }

  const nodeCalculations = nodes.map(node => {
    const result = results.get(node.id);
    const entry = nodeMap.get(node.id);
    let calculation: string | undefined;

    if (node.type === 'terminal') {
      calculation = `Payoff = ${node.payoff ?? 0}`;
    } else if (entry && entry.children.length > 0) {
      if (node.type === 'decision') {
        const childCalcs = entry.children.map(({ edge, childNode }) => {
          const childResult = results.get(childNode.id);
          const value = edge.value ?? 0;
          const valueStr = value !== 0 ? ` ${value >= 0 ? '+' : ''}${value}` : '';
          return `${edge.label}: ${(childResult?.emv ?? 0).toFixed(2)}${valueStr}`;
        }).join(', ');
        const optFn = isMaximizing ? 'max' : 'min';
        calculation = `${optFn}(${childCalcs}) = ${result?.emv?.toFixed(2)}`;
      } else {
        const childCalcs = entry.children.map(({ edge, childNode }) => {
          const childResult = results.get(childNode.id);
          const prob = edge.probability ?? (1 / entry.children.length);
          const value = edge.value ?? 0;
          return `${prob.toFixed(2)} × ${((childResult?.emv ?? 0) + value).toFixed(2)}`;
        }).join(' + ');
        const formulaName = settings.utilityFunction === 'exponential' ? 'CE' : 'E[V]';
        calculation = `${formulaName} = ${childCalcs} = ${result?.emv?.toFixed(2)}`;
      }
    }

    return {
      nodeId: node.id,
      nodeLabel: node.label,
      nodeType: node.type,
      emv: result?.emv ?? 0,
      calculation
    };
  });

  return {
    treeName,
    rootEMV: results.get(root?.id ?? '')?.emv ?? 0,
    optimalPath: optimalPathLabels,
    nodeCalculations,
    timestamp: new Date().toISOString()
  };
}

export function performSensitivityAnalysis(
  nodes: TreeNode[],
  edges: TreeEdge[],
  variableType: 'probability' | 'payoff',
  targetId: string,
  minValue: number,
  maxValue: number,
  steps: number = 20,
  settings: CalculationSettings = defaultSettings
): SensitivityAnalysisResult {
  const values: number[] = [];
  const emvResults: number[] = [];
  const crossoverPoints: { value: number; description: string }[] = [];

  const stepSize = (maxValue - minValue) / steps;
  let previousOptimalChildId: string | undefined;
  const root = findRootNode(nodes, edges);

  for (let i = 0; i <= steps; i++) {
    const value = minValue + i * stepSize;
    values.push(value);

    // Create modified copies
    let modifiedNodes = nodes;
    let modifiedEdges = edges;

    if (variableType === 'payoff') {
      modifiedNodes = nodes.map(n =>
        n.id === targetId ? { ...n, payoff: value } : n
      );
    } else {
      modifiedEdges = edges.map(e =>
        e.id === targetId ? { ...e, probability: value } : e
      );
    }

    const { results } = calculateEMV(modifiedNodes, modifiedEdges, settings);
    const rootResult = results.get(root?.id ?? '');
    emvResults.push(rootResult?.emv ?? 0);

    // Check for crossover (change in optimal decision)
    if (rootResult?.optimalChildId && previousOptimalChildId &&
        rootResult.optimalChildId !== previousOptimalChildId) {
      const prevId = previousOptimalChildId; // Capture for closure
      const prevNode = nodes.find(n => n.id === prevId);
      const currNode = nodes.find(n => n.id === rootResult.optimalChildId);
      crossoverPoints.push({
        value: value - stepSize / 2,
        description: `Optimal changes from "${prevNode?.label}" to "${currNode?.label}"`
      });
    }
    previousOptimalChildId = rootResult?.optimalChildId;
  }

  const baseNode = nodes.find(n => n.id === targetId);
  const baseEdge = edges.find(e => e.id === targetId);
  const baseValue = variableType === 'payoff'
    ? (baseNode?.payoff ?? 0)
    : (baseEdge?.probability ?? 0);

  return {
    variableName: variableType === 'payoff'
      ? (baseNode?.label ?? 'Unknown')
      : (baseEdge?.label ?? 'Unknown'),
    baseValue,
    values,
    emvResults,
    crossoverPoints
  };
}
