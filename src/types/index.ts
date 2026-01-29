export type NodeType = 'decision' | 'chance' | 'terminal';

// Calculation settings types
export type UtilityFunction = 'expected-value' | 'exponential';
export type OptimizationDirection = 'maximize' | 'minimize';

export interface CalculationSettings {
  utilityFunction: UtilityFunction;
  optimizationDirection: OptimizationDirection;
  riskTolerance: number; // R parameter for exponential utility
}

export interface TreeNode {
  id: string;
  type: NodeType;
  label: string;
  payoff?: number;
  emv?: number;
  isOptimal?: boolean;
  position: { x: number; y: number };
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  probability?: number;
  value?: number; // Monetary value of the branch (positive = gain, negative = cost)
  isOptimal?: boolean;
}

export interface DecisionTree {
  id: string;
  name: string;
  description?: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  settings?: CalculationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationResult {
  nodeId: string;
  emv: number;
  isOptimal: boolean;
  optimalChildId?: string;
}

export interface SensitivityAnalysisResult {
  variableName: string;
  baseValue: number;
  values: number[];
  emvResults: number[];
  crossoverPoints: { value: number; description: string }[];
}

export interface AnalysisReport {
  treeName: string;
  rootEMV: number;
  optimalPath: string[];
  nodeCalculations: {
    nodeId: string;
    nodeLabel: string;
    nodeType: NodeType;
    emv: number;
    calculation?: string;
  }[];
  timestamp: string;
}

export interface HistoryState {
  nodes: TreeNode[];
  edges: TreeEdge[];
}
