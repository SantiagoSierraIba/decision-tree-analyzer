import { TreeNode, TreeEdge } from '../types';

interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  startX: number;
  startY: number;
}

const defaultOptions: LayoutOptions = {
  nodeWidth: 64,
  nodeHeight: 64,
  horizontalSpacing: 180,
  verticalSpacing: 100,
  startX: 100,
  startY: 50,
};

interface TreeStructure {
  node: TreeNode;
  children: TreeStructure[];
  depth: number;
  subtreeHeight: number;
}

/**
 * Auto-layout the decision tree nodes in a hierarchical tree structure
 */
export function autoLayoutTree(
  nodes: TreeNode[],
  edges: TreeEdge[],
  options: Partial<LayoutOptions> = {}
): TreeNode[] {
  if (nodes.length === 0) return nodes;

  const opts = { ...defaultOptions, ...options };

  // Find root nodes (nodes with no incoming edges)
  const targetIds = new Set(edges.map(e => e.target));
  const rootNodes = nodes.filter(n => !targetIds.has(n.id));

  if (rootNodes.length === 0) {
    // If no root found, use the first node
    rootNodes.push(nodes[0]);
  }

  // Build tree structure
  const buildTree = (node: TreeNode, depth: number): TreeStructure => {
    const childEdges = edges.filter(e => e.source === node.id);
    const children = childEdges
      .map(e => nodes.find(n => n.id === e.target))
      .filter((n): n is TreeNode => n !== undefined)
      .map(child => buildTree(child, depth + 1));

    // Calculate subtree height (number of leaf nodes or 1 if leaf)
    const subtreeHeight = children.length === 0
      ? 1
      : children.reduce((sum, child) => sum + child.subtreeHeight, 0);

    return { node, children, depth, subtreeHeight };
  };

  // Build trees for all roots
  const trees = rootNodes.map(root => buildTree(root, 0));

  // Calculate positions
  const positionedNodes = new Map<string, { x: number; y: number }>();
  let currentY = opts.startY;

  const positionTree = (tree: TreeStructure, startY: number): number => {
    const x = opts.startX + tree.depth * opts.horizontalSpacing;

    if (tree.children.length === 0) {
      // Leaf node
      positionedNodes.set(tree.node.id, { x, y: startY });
      return startY + opts.verticalSpacing;
    }

    // Position children first
    let childY = startY;
    for (const child of tree.children) {
      childY = positionTree(child, childY);
    }

    // Position this node at the center of its children
    const firstChildPos = positionedNodes.get(tree.children[0].node.id);
    const lastChildPos = positionedNodes.get(tree.children[tree.children.length - 1].node.id);

    if (firstChildPos && lastChildPos) {
      const centerY = (firstChildPos.y + lastChildPos.y) / 2;
      positionedNodes.set(tree.node.id, { x, y: centerY });
    } else {
      positionedNodes.set(tree.node.id, { x, y: startY });
    }

    return childY;
  };

  // Position all trees
  for (const tree of trees) {
    currentY = positionTree(tree, currentY);
  }

  // Apply positions to nodes
  return nodes.map(node => {
    const pos = positionedNodes.get(node.id);
    if (pos) {
      return { ...node, position: pos };
    }
    return node;
  });
}
