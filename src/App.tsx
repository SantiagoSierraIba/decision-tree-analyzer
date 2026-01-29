import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

import TreeCanvas from './components/TreeCanvas';
import PropertyEditor from './components/PropertyEditor';
import Toolbar from './components/Toolbar';
import AnalysisReport from './components/AnalysisReport';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import OptionsDialog from './components/OptionsDialog';

import { TreeNode, TreeEdge, NodeType, CalculationResult, AnalysisReport as ReportType, DecisionTree, CalculationSettings } from './types';
import { calculateEMV, validateProbabilities, generateReport, defaultSettings } from './utils/calculationEngine';
import { autoLayoutTree } from './utils/autoLayout';
import { exportTreeToPDF } from './utils/pdfExport';
import { saveCurrentTree, loadCurrentTree, exportTreeToJSON, importTreeFromJSON, downloadJSON } from './utils/storage';
import { useHistory } from './hooks/useHistory';
import { Template } from './templates';

import '@xyflow/react/dist/style.css';

const App: React.FC = () => {
  const [treeName, setTreeName] = useState('New Decision Tree');
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [edges, setEdges] = useState<TreeEdge[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [calculationResults, setCalculationResults] = useState<Map<string, CalculationResult>>(new Map());
  const [optimalPath, setOptimalPath] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [report, setReport] = useState<ReportType | null>(null);
  const [settings, setSettings] = useState<CalculationSettings>(defaultSettings);

  const { canUndo, canRedo, undo, redo, pushState, clearHistory } = useHistory();

  // Load saved tree on mount
  useEffect(() => {
    const saved = loadCurrentTree();
    if (saved) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
      setTreeName(saved.name);
    }
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveCurrentTree(nodes, edges, treeName);
    }
  }, [nodes, edges, treeName]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find(e => e.id === selectedEdgeId) || null;
  const parentNode = selectedEdge
    ? nodes.find(n => n.id === selectedEdge.source) || null
    : null;

  const saveState = useCallback(() => {
    pushState(nodes, edges);
  }, [nodes, edges, pushState]);

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;

    const sourceNode = nodes.find(n => n.id === connection.source);
    if (sourceNode?.type === 'terminal') return;

    saveState();
    const newEdge: TreeEdge = {
      id: uuidv4(),
      source: connection.source,
      target: connection.target,
      label: 'Branch',
      probability: sourceNode?.type === 'chance' ? 0.5 : undefined,
    };
    setEdges(eds => [...eds, newEdge]);
  }, [nodes, saveState]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }, []);

  const handleEdgeClick = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  }, []);

  const handleNodeDragStop = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, position } : n
    ));
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    saveState();
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, ...updates } : n
    ));
  }, [saveState]);

  const handleUpdateEdge = useCallback((edgeId: string, updates: Partial<TreeEdge>) => {
    saveState();
    setEdges(eds => eds.map(e =>
      e.id === edgeId ? { ...e, ...updates } : e
    ));
  }, [saveState]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    saveState();
    // Find all descendant nodes
    const getDescendants = (id: string): string[] => {
      const childEdges = edges.filter(e => e.source === id);
      const children = childEdges.map(e => e.target);
      return [...children, ...children.flatMap(getDescendants)];
    };

    const nodesToDelete = new Set([nodeId, ...getDescendants(nodeId)]);

    setNodes(nds => nds.filter(n => !nodesToDelete.has(n.id)));
    setEdges(eds => eds.filter(e => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)));
    setSelectedNodeId(null);
  }, [edges, saveState]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    saveState();
    const edge = edges.find(e => e.id === edgeId);
    if (edge) {
      // Delete the edge and the target node (with its descendants)
      const getDescendants = (id: string): string[] => {
        const childEdges = edges.filter(e => e.source === id);
        const children = childEdges.map(e => e.target);
        return [...children, ...children.flatMap(getDescendants)];
      };

      const nodesToDelete = new Set([edge.target, ...getDescendants(edge.target)]);

      setNodes(nds => nds.filter(n => !nodesToDelete.has(n.id)));
      setEdges(eds => eds.filter(e => e.id !== edgeId && !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)));
    }
    setSelectedEdgeId(null);
  }, [edges, saveState]);

  const handleAddChildNode = useCallback((parentId: string, type: NodeType) => {
    saveState();
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const existingChildren = edges.filter(e => e.source === parentId).length;
    const offset = existingChildren * 80;

    const newNode: TreeNode = {
      id: uuidv4(),
      type,
      label: type === 'decision' ? 'Decision' : type === 'chance' ? 'Chance' : 'Outcome',
      position: {
        x: parent.position.x + 200,
        y: parent.position.y + offset - 40,
      },
      payoff: type === 'terminal' ? 0 : undefined,
    };

    const newEdge: TreeEdge = {
      id: uuidv4(),
      source: parentId,
      target: newNode.id,
      label: 'Branch',
      probability: parent.type === 'chance' ? 0.5 : undefined,
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);
  }, [nodes, edges, saveState]);

  const handleAddRootNode = useCallback((type: 'decision' | 'chance') => {
    saveState();
    const newNode: TreeNode = {
      id: uuidv4(),
      type,
      label: type === 'decision' ? 'Initial Decision' : 'Initial Chance',
      position: { x: 100, y: 200 },
    };
    setNodes(nds => [...nds, newNode]);
  }, [saveState]);

  const handleCalculate = useCallback(() => {
    const validation = validateProbabilities(nodes, edges);
    setValidationErrors(validation.errors);

    const { results, optimalPath: optimal } = calculateEMV(nodes, edges, settings);
    setCalculationResults(results);
    setOptimalPath(optimal);

    // Update nodes with EMV values
    setNodes(nds => nds.map(n => {
      const result = results.get(n.id);
      return {
        ...n,
        emv: result?.emv,
        isOptimal: optimal.has(n.id),
      };
    }));

    // Update edges with optimal status
    setEdges(eds => eds.map(e => ({
      ...e,
      isOptimal: optimal.has(e.id),
    })));
  }, [nodes, edges, settings]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire tree?')) {
      saveState();
      setNodes([]);
      setEdges([]);
      setCalculationResults(new Map());
      setOptimalPath(new Set());
      setValidationErrors([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [saveState]);

  const handleSave = useCallback(() => {
    saveCurrentTree(nodes, edges, treeName);
    alert('Tree saved to local storage!');
  }, [nodes, edges, treeName]);

  const handleExport = useCallback(() => {
    const tree: DecisionTree = {
      id: uuidv4(),
      name: treeName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const json = exportTreeToJSON(tree);
    downloadJSON(json, `${treeName.replace(/\s+/g, '_')}.json`);
  }, [nodes, edges, treeName]);

  const handleImport = useCallback((json: string) => {
    const tree = importTreeFromJSON(json);
    if (tree) {
      saveState();
      setNodes(tree.nodes);
      setEdges(tree.edges);
      setTreeName(tree.name);
      setCalculationResults(new Map());
      setOptimalPath(new Set());
      clearHistory();
    } else {
      alert('Failed to import tree. Please check the file format.');
    }
  }, [saveState, clearHistory]);

  const handleLoadTemplate = useCallback((template: Template) => {
    saveState();
    setNodes(template.nodes);
    setEdges(template.edges);
    setTreeName(template.name);
    setCalculationResults(new Map());
    setOptimalPath(new Set());
    clearHistory();

    // Auto-calculate after loading template
    setTimeout(() => {
      const validation = validateProbabilities(template.nodes, template.edges);
      setValidationErrors(validation.errors);
      const { results, optimalPath: optimal } = calculateEMV(template.nodes, template.edges, settings);
      setCalculationResults(results);
      setOptimalPath(optimal);
    }, 100);
  }, [saveState, clearHistory, settings]);

  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [redo]);

  const handleShowReport = useCallback(() => {
    if (nodes.length === 0) {
      alert('Please create a tree first.');
      return;
    }
    handleCalculate();
    const newReport = generateReport(nodes, edges, treeName, settings);
    setReport(newReport);
    setShowReport(true);
  }, [nodes, edges, treeName, handleCalculate, settings]);

  const handleShowSensitivity = useCallback(() => {
    if (nodes.length === 0) {
      alert('Please create a tree first.');
      return;
    }
    handleCalculate();
    setShowSensitivity(true);
  }, [nodes, handleCalculate]);

  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    saveState();
    const layoutedNodes = autoLayoutTree(nodes, edges);
    setNodes(layoutedNodes);
  }, [nodes, edges, saveState]);

  const handleExportPDF = useCallback(() => {
    exportTreeToPDF(treeName, canvasRef.current);
  }, [treeName]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          handleDeleteNode(selectedNodeId);
        }
        if (selectedEdgeId && document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          handleDeleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedNodeId, selectedEdgeId, handleDeleteNode, handleDeleteEdge]);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-slate-50">
        <Toolbar
          treeName={treeName}
          onTreeNameChange={setTreeName}
          onAddRootNode={handleAddRootNode}
          onCalculate={handleCalculate}
          onClear={handleClear}
          onSave={handleSave}
          onExport={handleExport}
          onExportPDF={handleExportPDF}
          onImport={handleImport}
          onLoadTemplate={handleLoadTemplate}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onShowReport={handleShowReport}
          onShowSensitivity={handleShowSensitivity}
          onShowOptions={() => setShowOptions(true)}
          onAutoLayout={handleAutoLayout}
          validationErrors={validationErrors}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative" ref={canvasRef}>
            <TreeCanvas
              treeNodes={nodes}
              treeEdges={edges}
              calculationResults={calculationResults}
              optimalPath={optimalPath}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onNodeDragStop={handleNodeDragStop}
            />

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-slate-500 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-slate-700">Welcome to Decision Tree Analyzer</h2>
                  <p className="mb-4 text-slate-500">Get started by:</p>
                  <ul className="text-left space-y-2 mb-4 text-slate-500">
                    <li>- Click <strong className="text-slate-600">Decision</strong> or <strong className="text-slate-600">Chance</strong> to add a root node</li>
                    <li>- Load a pre-built <strong className="text-slate-600">Template</strong> from the toolbar</li>
                    <li>- <strong className="text-slate-600">Import</strong> an existing tree from JSON</li>
                  </ul>
                  <p className="text-sm text-slate-400">
                    Inspired by TreePlan for Excel - build decision trees with automatic EMV calculation
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-700">Properties</h2>
            </div>
            <PropertyEditor
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onUpdateNode={handleUpdateNode}
              onUpdateEdge={handleUpdateEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onAddChildNode={handleAddChildNode}
              parentNode={parentNode}
            />

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Legend</h3>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 transform rotate-45 rounded-sm" />
                  <span>Decision Node (Choose best option)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-400 rounded-full" />
                  <span>Chance Node (Probabilistic outcomes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-0 h-0 border-l-8 border-y-4 border-y-transparent border-l-zinc-400" />
                  <span>Terminal Node (Final payoff)</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-8 h-1 bg-green-500" />
                  <span>Optimal Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showReport && (
          <AnalysisReport report={report} onClose={() => setShowReport(false)} />
        )}

        {showSensitivity && (
          <SensitivityAnalysis
            nodes={nodes}
            edges={edges}
            settings={settings}
            onClose={() => setShowSensitivity(false)}
          />
        )}

        {showOptions && (
          <OptionsDialog
            settings={settings}
            onSave={setSettings}
            onClose={() => setShowOptions(false)}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default App;
