import React, { useState, useRef } from 'react';
import { templates, Template } from '../templates';

interface ToolbarProps {
  treeName: string;
  onTreeNameChange: (name: string) => void;
  onAddRootNode: (type: 'decision' | 'chance') => void;
  onCalculate: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onImport: (json: string) => void;
  onLoadTemplate: (template: Template) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onShowReport: () => void;
  onShowSensitivity: () => void;
  onShowOptions: () => void;
  onAutoLayout: () => void;
  validationErrors: string[];
}

const Toolbar: React.FC<ToolbarProps> = ({
  treeName,
  onTreeNameChange,
  onAddRootNode,
  onCalculate,
  onClear,
  onSave,
  onExport,
  onExportPDF,
  onImport,
  onLoadTemplate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShowReport,
  onShowSensitivity,
  onShowOptions,
  onAutoLayout,
  validationErrors,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={treeName}
            onChange={(e) => onTreeNameChange(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-lg font-semibold text-slate-800"
            placeholder="Tree Name"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Add Root:</span>
          <button
            onClick={() => onAddRootNode('decision')}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition flex items-center gap-1"
            title="Add Decision Node"
          >
            <span className="w-3 h-3 border border-slate-400 transform rotate-45 inline-block" />
            Decision
          </button>
          <button
            onClick={() => onAddRootNode('chance')}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition flex items-center gap-1"
            title="Add Chance Node"
          >
            <span className="w-3 h-3 border border-slate-400 rounded-full inline-block" />
            Chance
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-3 py-1.5 text-sm rounded transition border ${
              canUndo
                ? 'border-slate-200 hover:bg-slate-50 text-slate-600'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`px-3 py-1.5 text-sm rounded transition border ${
              canRedo
                ? 'border-slate-200 hover:bg-slate-50 text-slate-600'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            Redo
          </button>
          <button
            onClick={onAutoLayout}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
            title="Auto-arrange nodes"
          >
            Auto Layout
          </button>
        </div>

        <button
          onClick={onCalculate}
          className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition font-medium"
        >
          Calculate
        </button>

        <button
          onClick={onShowOptions}
          className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
          title="Calculation Options"
        >
          Options
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
            >
              Templates
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onLoadTemplate(template);
                      setShowTemplates(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <p className="font-medium text-slate-700">{template.name}</p>
                    <p className="text-xs text-slate-400">{template.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onShowReport}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
          >
            Report
          </button>

          <button
            onClick={onShowSensitivity}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
          >
            Sensitivity
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
          >
            Save
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition flex items-center gap-1"
            >
              Export
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    onExport();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-100 text-sm text-slate-700"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    onExportPDF();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded hover:bg-slate-50 transition"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={onClear}
            className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded hover:bg-red-50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-sm font-medium text-slate-700">Validation Warnings:</p>
          <ul className="text-sm text-slate-500 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
