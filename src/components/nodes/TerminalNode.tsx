import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

interface TerminalNodeData {
  label: string;
  payoff?: number;
  isOptimal?: boolean;
}

const TerminalNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as TerminalNodeData;
  const payoff = nodeData.payoff ?? 0;
  const isPositive = payoff >= 0;

  return (
    <div style={{ position: 'relative' }}>
      {/* Triangle shape using CSS borders */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `32px solid ${nodeData.isOptimal ? '#22c55e' : '#f59e0b'}`,
          borderTop: '24px solid transparent',
          borderBottom: '24px solid transparent',
          borderRight: 0,
          boxShadow: selected ? '0 0 0 2px #fcd34d' : 'none',
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            left: '-36px',
            width: '12px',
            height: '12px',
            background: '#4b5563',
            border: '2px solid white',
          }}
        />
      </div>
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          left: '40px',
          top: '50%',
          transform: 'translateY(-100%)',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          color: nodeData.isOptimal ? '#15803d' : '#b45309',
        }}
      >
        {nodeData.label}
      </div>
      {/* Payoff value */}
      <div
        style={{
          position: 'absolute',
          left: '40px',
          top: '50%',
          transform: 'translateY(20%)',
          fontSize: '14px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          color: isPositive ? '#16a34a' : '#dc2626',
        }}
      >
        ${payoff.toLocaleString()}
      </div>
    </div>
  );
};

export default memo(TerminalNode);
