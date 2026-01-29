import React, { useState, useEffect, useRef } from 'react';
import { TreeNode, TreeEdge, SensitivityAnalysisResult, CalculationSettings } from '../types';
import { performSensitivityAnalysis, defaultSettings } from '../utils/calculationEngine';

interface SensitivityAnalysisProps {
  nodes: TreeNode[];
  edges: TreeEdge[];
  settings?: CalculationSettings;
  onClose: () => void;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  nodes,
  edges,
  settings = defaultSettings,
  onClose,
}) => {
  const [variableType, setVariableType] = useState<'probability' | 'payoff'>('payoff');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(100);
  const [result, setResult] = useState<SensitivityAnalysisResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const terminalNodes = nodes.filter(n => n.type === 'terminal');
  const chanceEdges = edges.filter(e => {
    const sourceNode = nodes.find(n => n.id === e.source);
    return sourceNode?.type === 'chance';
  });

  const availableTargets = variableType === 'payoff' ? terminalNodes : chanceEdges;

  useEffect(() => {
    if (availableTargets.length > 0 && !selectedTarget) {
      const firstTarget = variableType === 'payoff'
        ? (availableTargets[0] as TreeNode).id
        : (availableTargets[0] as TreeEdge).id;
      setSelectedTarget(firstTarget);

      if (variableType === 'payoff') {
        const node = terminalNodes.find(n => n.id === firstTarget);
        const baseValue = node?.payoff ?? 0;
        setMinValue(baseValue - Math.abs(baseValue) * 0.5);
        setMaxValue(baseValue + Math.abs(baseValue) * 0.5);
      } else {
        setMinValue(0);
        setMaxValue(1);
      }
    }
  }, [variableType, availableTargets, selectedTarget, terminalNodes]);

  useEffect(() => {
    if (!result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    ctx.clearRect(0, 0, width, height);

    // Find data range
    const minEMV = Math.min(...result.emvResults);
    const maxEMV = Math.max(...result.emvResults);
    const emvRange = maxEMV - minEMV || 1;
    const valueRange = result.values[result.values.length - 1] - result.values[0] || 1;

    // Draw axes - muted slate color
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid lines - subtle
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw data line - slate color
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();

    result.values.forEach((value, index) => {
      const x = padding + ((value - result.values[0]) / valueRange) * (width - 2 * padding);
      const y = height - padding - ((result.emvResults[index] - minEMV) / emvRange) * (height - 2 * padding);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw crossover points
    result.crossoverPoints.forEach(point => {
      const x = padding + ((point.value - result.values[0]) / valueRange) * (width - 2 * padding);
      ctx.strokeStyle = '#dc2626';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw axis labels - slate color
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(result.variableName, width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('EMV ($)', 0, 0);
    ctx.restore();

    // Draw value labels
    ctx.textAlign = 'center';
    ctx.fillText(result.values[0].toLocaleString(), padding, height - padding + 20);
    ctx.fillText(result.values[result.values.length - 1].toLocaleString(), width - padding, height - padding + 20);

    ctx.textAlign = 'right';
    ctx.fillText('$' + minEMV.toLocaleString(), padding - 10, height - padding);
    ctx.fillText('$' + maxEMV.toLocaleString(), padding - 10, padding + 5);

  }, [result]);

  const runAnalysis = () => {
    if (!selectedTarget) return;

    const analysisResult = performSensitivityAnalysis(
      nodes,
      edges,
      variableType,
      selectedTarget,
      minValue,
      maxValue,
      20,
      settings
    );
    setResult(analysisResult);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Sensitivity Analysis</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Variable Type
              </label>
              <select
                value={variableType}
                onChange={(e) => {
                  setVariableType(e.target.value as 'probability' | 'payoff');
                  setSelectedTarget('');
                  setResult(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-700"
              >
                <option value="payoff">Payoff (Terminal Node)</option>
                <option value="probability">Probability (Chance Branch)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Select {variableType === 'payoff' ? 'Terminal Node' : 'Branch'}
              </label>
              <select
                value={selectedTarget}
                onChange={(e) => {
                  setSelectedTarget(e.target.value);
                  setResult(null);
                  if (variableType === 'payoff') {
                    const node = terminalNodes.find(n => n.id === e.target.value);
                    const baseValue = node?.payoff ?? 0;
                    setMinValue(baseValue - Math.abs(baseValue) * 0.5);
                    setMaxValue(baseValue + Math.abs(baseValue) * 0.5);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-700"
              >
                {variableType === 'payoff'
                  ? terminalNodes.map(node => (
                      <option key={node.id} value={node.id}>
                        {node.label} (${node.payoff?.toLocaleString()})
                      </option>
                    ))
                  : chanceEdges.map(edge => (
                      <option key={edge.id} value={edge.id}>
                        {edge.label} (p={edge.probability?.toFixed(2)})
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(parseFloat(e.target.value) || 0)}
                step={variableType === 'probability' ? 0.01 : 1}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(parseFloat(e.target.value) || 0)}
                step={variableType === 'probability' ? 0.01 : 1}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-700"
              />
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={!selectedTarget}
            className="w-full px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 transition disabled:bg-slate-200 disabled:text-slate-400 mb-6"
          >
            Run Sensitivity Analysis
          </button>

          {result && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">
                  Variable: {result.variableName}
                </h4>
                <p className="text-sm text-slate-500">
                  Base Value: {variableType === 'probability'
                    ? result.baseValue.toFixed(2)
                    : '$' + result.baseValue.toLocaleString()}
                </p>
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="w-full border border-slate-200 rounded-lg"
              />

              {result.crossoverPoints.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-700 mb-2">Crossover Points</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {result.crossoverPoints.map((point, index) => (
                      <li key={index}>
                        At value ≈ {point.value.toLocaleString()}: {point.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">EMV Range</h4>
                <p className="text-sm text-slate-500">
                  Min EMV: ${Math.min(...result.emvResults).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-slate-500">
                  Max EMV: ${Math.max(...result.emvResults).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensitivityAnalysis;
