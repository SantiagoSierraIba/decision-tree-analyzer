import { DecisionTree, TreeNode, TreeEdge } from '../types';

const STORAGE_KEY = 'decision-tree-analyzer-trees';
const CURRENT_TREE_KEY = 'decision-tree-analyzer-current';

export function saveTreesToStorage(trees: DecisionTree[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
}

export function loadTreesFromStorage(): DecisionTree[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCurrentTree(nodes: TreeNode[], edges: TreeEdge[], name: string): void {
  const data = { nodes, edges, name };
  localStorage.setItem(CURRENT_TREE_KEY, JSON.stringify(data));
}

export function loadCurrentTree(): { nodes: TreeNode[]; edges: TreeEdge[]; name: string } | null {
  const data = localStorage.getItem(CURRENT_TREE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function exportTreeToJSON(tree: DecisionTree): string {
  return JSON.stringify(tree, null, 2);
}

export function importTreeFromJSON(json: string): DecisionTree | null {
  try {
    const tree = JSON.parse(json);
    // Basic validation
    if (!tree.nodes || !tree.edges || !Array.isArray(tree.nodes) || !Array.isArray(tree.edges)) {
      throw new Error('Invalid tree structure');
    }
    return tree as DecisionTree;
  } catch (error) {
    console.error('Failed to import tree:', error);
    return null;
  }
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
