import React from 'react';
import { TreeNode, TreeEdge, NodeType } from '../types';

interface PropertyEditorProps {
  selectedNode: TreeNode | null;
  selectedEdge: TreeEdge | null;
  onUpdateNode: (nodeId: string, updates: Partial<TreeNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<TreeEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAddChildNode: (parentId: string, type: NodeType) => void;
  parentNode: TreeNode | null;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onAddChildNode,
  parentNode,
}) => {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p className="text-lg font-medium mb-2">No Selection</p>
        <p className="text-sm">
          Click on a node or edge to edit its properties, or use the toolbar to add new nodes.
        </p>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div className="p-4 space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedNode.type === 'decision' && '■ Decision Node'}
            {selectedNode.type === 'chance' && '● Chance Node'}
            {selectedNode.type === 'terminal' && '▶ Terminal Node'}
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedNode.label}
            onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedNode.type === 'terminal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payoff Value ($)
            </label>
            <input
              type="number"
              value={selectedNode.payoff ?? 0}
              onChange={(e) => onUpdateNode(selectedNode.id, { payoff: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedNode.type !== 'terminal' && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Add Child Node</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAddChildNode(selectedNode.id, 'decision')}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
              >
                + Decision
              </button>
              <button
                onClick={() => onAddChildNode(selectedNode.id, 'chance')}
                className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition"
              >
                + Chance
              </button>
              <button
                onClick={() => onAddChildNode(selectedNode.id, 'terminal')}
                className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 transition"
              >
                + Terminal
              </button>
            </div>
          </div>
        )}

        {selectedNode.emv !== undefined && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-700">Calculated EMV</p>
            <p className={`text-xl font-bold ${selectedNode.emv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${selectedNode.emv.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            {selectedNode.isOptimal && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                On Optimal Path
              </span>
            )}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete Node
          </button>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="p-4 space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Branch Properties</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Label
          </label>
          <input
            type="text"
            value={selectedEdge.label}
            onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {parentNode?.type === 'chance' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Probability (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={selectedEdge.probability ?? 0}
              onChange={(e) => onUpdateEdge(selectedEdge.id, { probability: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Probabilities from a chance node should sum to 1.0
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Value ($)
          </label>
          <input
            type="number"
            value={selectedEdge.value ?? 0}
            onChange={(e) => onUpdateEdge(selectedEdge.id, { value: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Monetary value of this branch (positive = gain, negative = cost)
          </p>
        </div>

        {selectedEdge.isOptimal && (
          <div className="bg-green-50 p-3 rounded-md">
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              On Optimal Path
            </span>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => onDeleteEdge(selectedEdge.id)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete Branch
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PropertyEditor;
