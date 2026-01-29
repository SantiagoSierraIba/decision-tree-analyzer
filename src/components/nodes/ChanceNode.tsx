import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

interface ChanceNodeData {
  label: string;
  emv?: number;
  isOptimal?: boolean;
}

const ChanceNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ChanceNodeData;

  return (
    <div className="relative">
      <div
        className={`flex items-center justify-center w-16 h-16 rounded-full ${
          nodeData.isOptimal
            ? 'bg-green-500 border-green-700'
            : 'bg-emerald-500 border-emerald-700'
        } border-2 ${selected ? 'ring-2 ring-offset-2 ring-emerald-300' : ''}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-600 border-2 border-white"
        />
        <div className="text-white text-xs font-bold text-center px-1 w-14 truncate">
          {nodeData.label}
        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-600 border-2 border-white"
        />
      </div>
      {nodeData.emv !== undefined && (
        <div
          className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            nodeData.isOptimal ? 'bg-green-100 text-green-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          EMV: ${nodeData.emv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      )}
    </div>
  );
};

export default memo(ChanceNode);
