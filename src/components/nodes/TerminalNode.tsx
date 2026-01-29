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
      {/* Triangle shape using CSS borders - Zinc color */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `32px solid ${nodeData.isOptimal ? '#22c55e' : '#a1a1aa'}`,
          borderTop: '24px solid transparent',
          borderBottom: '24px solid transparent',
          borderRight: 0,
          boxShadow: selected ? '0 0 0 2px #94a3b8' : 'none',
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            left: '-36px',
            width: '12px',
            height: '12px',
            background: '#64748b',
            border: '2px solid white',
          }}
        />
      </div>
      {/* Label - Slate color */}
      <div
        style={{
          position: 'absolute',
          left: '40px',
          top: '50%',
          transform: 'translateY(-100%)',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          color: nodeData.isOptimal ? '#15803d' : '#64748b',
        }}
      >
        {nodeData.label}
      </div>
      {/* Payoff value - Keep green/red for important data distinction */}
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
        ${payoff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default memo(TerminalNode);
