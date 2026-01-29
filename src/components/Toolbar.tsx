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
  onImport: (json: string) => void;
  onLoadTemplate: (template: Template) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onShowReport: () => void;
  onShowSensitivity: () => void;
  onShowOptions: () => void;
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
  onImport,
  onLoadTemplate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShowReport,
  onShowSensitivity,
  onShowOptions,
  validationErrors,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
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
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={treeName}
            onChange={(e) => onTreeNameChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
            placeholder="Tree Name"
          />
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Add Root:</span>
          <button
            onClick={() => onAddRootNode('decision')}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition flex items-center gap-1"
            title="Add Decision Node"
          >
            <span className="w-3 h-3 border border-white transform rotate-45 inline-block" />
            Decision
          </button>
          <button
            onClick={() => onAddRootNode('chance')}
            className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition flex items-center gap-1"
            title="Add Chance Node"
          >
            <span className="w-3 h-3 border border-white rounded-full inline-block" />
            Chance
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-3 py-1.5 text-sm rounded transition ${
              canUndo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`px-3 py-1.5 text-sm rounded transition ${
              canRedo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            ↪ Redo
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <button
          onClick={onCalculate}
          className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition font-medium"
        >
          ▶ Calculate
        </button>

        <button
          onClick={onShowOptions}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
          title="Calculation Options"
        >
          ⚙ Options
        </button>

        <div className="h-8 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition"
            >
              Templates ▼
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onLoadTemplate(template);
                      setShowTemplates(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="font-medium text-gray-800">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onShowReport}
            className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition"
          >
            Report
          </button>

          <button
            onClick={onShowSensitivity}
            className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
          >
            Sensitivity
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
          >
            Save
          </button>
          <button
            onClick={onExport}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
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
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm font-medium text-yellow-800">Validation Warnings:</p>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
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
