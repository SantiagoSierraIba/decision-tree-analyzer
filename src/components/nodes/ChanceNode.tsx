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
            ? 'bg-green-500 border-green-600'
            : 'bg-slate-400 border-slate-500'
        } border ${selected ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-slate-500 border-2 border-white"
        />
        <div className="text-white text-xs font-bold text-center px-1 w-14 truncate">
          {nodeData.label}
        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-slate-500 border-2 border-white"
        />
      </div>
      {nodeData.emv !== undefined && (
        <div
          className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            nodeData.isOptimal ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
          }`}
        >
          EMV: ${nodeData.emv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
};

export default memo(ChanceNode);
