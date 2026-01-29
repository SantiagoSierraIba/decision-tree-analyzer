import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DecisionNode, ChanceNode, TerminalNode } from './nodes';
import { TreeNode, TreeEdge, CalculationResult } from '../types';

interface TreeCanvasProps {
  treeNodes: TreeNode[];
  treeEdges: TreeEdge[];
  calculationResults: Map<string, CalculationResult>;
  optimalPath: Set<string>;
  onConnect: (connection: Connection) => void;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
}

// Define nodeTypes outside component to prevent recreation
const nodeTypes = {
  decision: DecisionNode,
  chance: ChanceNode,
  terminal: TerminalNode,
};

const TreeCanvas: React.FC<TreeCanvasProps> = ({
  treeNodes,
  treeEdges,
  calculationResults,
  optimalPath,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onNodeDragStop,
}) => {
  // Convert TreeNodes to ReactFlow nodes
  const initialNodes: Node[] = useMemo(() => {
    return treeNodes.map(node => {
      const result = calculationResults.get(node.id);
      return {
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.label,
          payoff: node.payoff,
          emv: result?.emv,
          isOptimal: optimalPath.has(node.id),
        },
        draggable: true,
      };
    });
  }, [treeNodes, calculationResults, optimalPath]);

  // Convert TreeEdges to ReactFlow edges - muted colors
  const initialEdges: Edge[] = useMemo(() => {
    return treeEdges.map(edge => {
      const isOptimal = optimalPath.has(edge.id);
      const sourceNode = treeNodes.find(n => n.id === edge.source);
      const isFromChance = sourceNode?.type === 'chance';

      let labelText = edge.label;
      if (isFromChance && edge.probability !== undefined) {
        labelText = `${edge.label}\n(p=${edge.probability.toFixed(2)})`;
      }
      if (edge.value && edge.value !== 0) {
        const sign = edge.value >= 0 ? '+' : '';
        labelText += `\n(${sign}$${edge.value.toLocaleString()})`;
      }

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: labelText,
        labelStyle: {
          fill: isOptimal ? '#166534' : '#64748b',
          fontWeight: isOptimal ? 700 : 500,
          fontSize: 11,
        },
        labelBgStyle: {
          fill: isOptimal ? '#dcfce7' : '#f8fafc',
          fillOpacity: 0.9,
        },
        style: {
          stroke: isOptimal ? '#22c55e' : '#94a3b8',
          strokeWidth: isOptimal ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isOptimal ? '#22c55e' : '#94a3b8',
        },
        animated: isOptimal,
      };
    });
  }, [treeEdges, optimalPath, treeNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when treeNodes change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Sync edges when treeEdges change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      onConnect(connection);
    },
    [setEdges, onConnect]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      onEdgeClick(edge.id);
    },
    [onEdgeClick]
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeDragStop(node.id, node.position);
    },
    [onNodeDragStop]
  );

  // Minimap colors - muted grays
  const nodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'decision':
        return '#6b7280';
      case 'chance':
        return '#94a3b8';
      case 'terminal':
        return '#a1a1aa';
      default:
        return '#94a3b8';
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Controls />
        <MiniMap nodeColor={nodeColor} maskColor="rgba(0, 0, 0, 0.05)" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
};

export default TreeCanvas;
