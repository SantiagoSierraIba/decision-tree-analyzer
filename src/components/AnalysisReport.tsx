import React from 'react';
import { AnalysisReport as ReportType } from '../types';

interface AnalysisReportProps {
  report: ReportType | null;
  onClose: () => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Analysis Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{report.treeName}</h3>
            <p className="text-sm text-gray-500">
              Generated: {new Date(report.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Expected Monetary Value (EMV) at Root</p>
            <p className="text-3xl font-bold text-green-800">
              ${report.rootEMV.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Optimal Decision Path</h4>
            <div className="flex flex-wrap items-center gap-2">
              {report.optimalPath.map((node, index) => (
                <React.Fragment key={index}>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {node}
                  </span>
                  {index < report.optimalPath.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Node Calculations</h4>
            <div className="space-y-2">
              {report.nodeCalculations.map((calc) => (
                <div
                  key={calc.nodeId}
                  className={`p-3 rounded-lg border ${
                    calc.nodeType === 'decision'
                      ? 'bg-blue-50 border-blue-200'
                      : calc.nodeType === 'chance'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block w-5 h-5 mr-2 text-center">
                        {calc.nodeType === 'decision' && '■'}
                        {calc.nodeType === 'chance' && '●'}
                        {calc.nodeType === 'terminal' && '▶'}
                      </span>
                      <span className="font-medium">{calc.nodeLabel}</span>
                      <span className="text-xs text-gray-500 ml-2">({calc.nodeType})</span>
                    </div>
                    <span className={`font-bold ${calc.emv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${calc.emv.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {calc.calculation && (
                    <p className="text-sm text-gray-600 mt-1 ml-7 font-mono">
                      {calc.calculation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
