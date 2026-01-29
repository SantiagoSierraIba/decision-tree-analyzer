import { useState, useCallback } from 'react';
import { HistoryState, TreeNode, TreeEdge } from '../types';

interface UseHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
  pushState: (nodes: TreeNode[], edges: TreeEdge[]) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory(): UseHistoryReturn {
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushState = useCallback((nodes: TreeNode[], edges: TreeEdge[]) => {
    const state: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };

    setPast(prev => {
      const newPast = [...prev, state];
      if (newPast.length > MAX_HISTORY_SIZE) {
        return newPast.slice(-MAX_HISTORY_SIZE);
      }
      return newPast;
    });
    setFuture([]);
  }, []);

  const undo = useCallback((): HistoryState | null => {
    if (past.length === 0) return null;

    const newPast = [...past];
    const previousState = newPast.pop();

    if (!previousState) return null;

    setPast(newPast);
    return previousState;
  }, [past]);

  const redo = useCallback((): HistoryState | null => {
    if (future.length === 0) return null;

    const newFuture = [...future];
    const nextState = newFuture.shift();

    if (!nextState) return null;

    setFuture(newFuture);
    return nextState;
  }, [future]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clearHistory
  };
}
