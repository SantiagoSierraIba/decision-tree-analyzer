import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

interface DecisionNodeData {
  label: string;
  emv?: number;
  isOptimal?: boolean;
}

const DecisionNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as DecisionNodeData;

  return (
    <div
      className={`relative flex items-center justify-center w-16 h-16 transform rotate-45 ${
        nodeData.isOptimal
          ? 'bg-green-500 border-green-700'
          : 'bg-blue-500 border-blue-700'
      } border-2 ${selected ? 'ring-2 ring-offset-2 ring-blue-300' : ''}`}
      style={{ borderRadius: '4px' }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
        style={{ transform: 'rotate(-45deg) translate(-50%, -50%)', left: '-6px', top: '50%' }}
      />
      <div className="transform -rotate-45 text-white text-xs font-bold text-center px-1 w-20 truncate">
        {nodeData.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
        style={{ transform: 'rotate(-45deg) translate(50%, -50%)', right: '-6px', top: '50%' }}
      />
      {nodeData.emv !== undefined && (
        <div
          className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 -rotate-45 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            nodeData.isOptimal ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          EMV: ${nodeData.emv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      )}
    </div>
  );
};

export default memo(DecisionNode);
