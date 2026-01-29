import { TreeNode, TreeEdge } from '../types';

export interface Template {
  name: string;
  description: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
}

export const templates: Template[] = [
  {
    name: 'Investment Decision',
    description: 'Classic investment decision with market uncertainty',
    nodes: [
      { id: 'd1', type: 'decision', label: 'Investment Decision', position: { x: 50, y: 200 } },
      { id: 'c1', type: 'chance', label: 'Market Outcome (Invest)', position: { x: 300, y: 100 } },
      { id: 't1', type: 'terminal', label: 'High Growth', payoff: 500000, position: { x: 550, y: 25 } },
      { id: 't2', type: 'terminal', label: 'Moderate Growth', payoff: 200000, position: { x: 550, y: 100 } },
      { id: 't3', type: 'terminal', label: 'Market Decline', payoff: -150000, position: { x: 550, y: 175 } },
      { id: 't4', type: 'terminal', label: 'Do Not Invest', payoff: 50000, position: { x: 300, y: 300 } },
    ],
    edges: [
      { id: 'e1', source: 'd1', target: 'c1', label: 'Invest $200K' },
      { id: 'e2', source: 'd1', target: 't4', label: 'Keep in Bonds' },
      { id: 'e3', source: 'c1', target: 't1', label: 'Strong Economy', probability: 0.3 },
      { id: 'e4', source: 'c1', target: 't2', label: 'Normal Economy', probability: 0.5 },
      { id: 'e5', source: 'c1', target: 't3', label: 'Recession', probability: 0.2 },
    ],
  },
  {
    name: 'Product Launch',
    description: 'New product launch with testing option',
    nodes: [
      { id: 'd1', type: 'decision', label: 'Launch Strategy', position: { x: 50, y: 250 } },
      { id: 'c1', type: 'chance', label: 'Market Test Results', position: { x: 250, y: 100 } },
      { id: 'd2', type: 'decision', label: 'After Positive Test', position: { x: 450, y: 50 } },
      { id: 'd3', type: 'decision', label: 'After Negative Test', position: { x: 450, y: 150 } },
      { id: 'c2', type: 'chance', label: 'Direct Launch Outcome', position: { x: 250, y: 350 } },
      { id: 't1', type: 'terminal', label: 'Launch Success (Tested+)', payoff: 800000, position: { x: 650, y: 25 } },
      { id: 't2', type: 'terminal', label: 'No Launch (Tested+)', payoff: -50000, position: { x: 650, y: 75 } },
      { id: 't3', type: 'terminal', label: 'Launch (Tested-)', payoff: 200000, position: { x: 650, y: 125 } },
      { id: 't4', type: 'terminal', label: 'No Launch (Tested-)', payoff: -50000, position: { x: 650, y: 175 } },
      { id: 't5', type: 'terminal', label: 'Direct Launch Success', payoff: 700000, position: { x: 450, y: 300 } },
      { id: 't6', type: 'terminal', label: 'Direct Launch Failure', payoff: -200000, position: { x: 450, y: 400 } },
      { id: 't7', type: 'terminal', label: 'No Launch', payoff: 0, position: { x: 250, y: 450 } },
    ],
    edges: [
      { id: 'e1', source: 'd1', target: 'c1', label: 'Market Test', value: -50000 },
      { id: 'e2', source: 'd1', target: 'c2', label: 'Direct Launch' },
      { id: 'e3', source: 'd1', target: 't7', label: 'Abandon' },
      { id: 'e4', source: 'c1', target: 'd2', label: 'Positive Results', probability: 0.6 },
      { id: 'e5', source: 'c1', target: 'd3', label: 'Negative Results', probability: 0.4 },
      { id: 'e6', source: 'd2', target: 't1', label: 'Full Launch' },
      { id: 'e7', source: 'd2', target: 't2', label: 'Stop' },
      { id: 'e8', source: 'd3', target: 't3', label: 'Launch Anyway' },
      { id: 'e9', source: 'd3', target: 't4', label: 'Stop' },
      { id: 'e10', source: 'c2', target: 't5', label: 'Success', probability: 0.5 },
      { id: 'e11', source: 'c2', target: 't6', label: 'Failure', probability: 0.5 },
    ],
  },
  {
    name: 'Oil Drilling Decision',
    description: 'Oil exploration with optional seismic testing',
    nodes: [
      { id: 'd1', type: 'decision', label: 'Exploration Strategy', position: { x: 50, y: 200 } },
      { id: 'c1', type: 'chance', label: 'Seismic Test Result', position: { x: 250, y: 100 } },
      { id: 'd2', type: 'decision', label: 'Favorable Seismic', position: { x: 450, y: 50 } },
      { id: 'd3', type: 'decision', label: 'Unfavorable Seismic', position: { x: 450, y: 150 } },
      { id: 'c2', type: 'chance', label: 'Drill (Favorable)', position: { x: 650, y: 25 } },
      { id: 'c3', type: 'chance', label: 'Drill (Unfavorable)', position: { x: 650, y: 125 } },
      { id: 'c4', type: 'chance', label: 'Drill Directly', position: { x: 250, y: 300 } },
      { id: 't1', type: 'terminal', label: 'Oil Found (Fav)', payoff: 2000000, position: { x: 850, y: 0 } },
      { id: 't2', type: 'terminal', label: 'Dry Well (Fav)', payoff: -400000, position: { x: 850, y: 50 } },
      { id: 't3', type: 'terminal', label: 'No Drill (Fav)', payoff: -100000, position: { x: 650, y: 75 } },
      { id: 't4', type: 'terminal', label: 'Oil Found (Unfav)', payoff: 2000000, position: { x: 850, y: 100 } },
      { id: 't5', type: 'terminal', label: 'Dry Well (Unfav)', payoff: -400000, position: { x: 850, y: 150 } },
      { id: 't6', type: 'terminal', label: 'No Drill (Unfav)', payoff: -100000, position: { x: 650, y: 175 } },
      { id: 't7', type: 'terminal', label: 'Oil Found (Direct)', payoff: 2000000, position: { x: 450, y: 275 } },
      { id: 't8', type: 'terminal', label: 'Dry Well (Direct)', payoff: -400000, position: { x: 450, y: 325 } },
      { id: 't9', type: 'terminal', label: 'Sell Rights', payoff: 100000, position: { x: 250, y: 400 } },
    ],
    edges: [
      { id: 'e1', source: 'd1', target: 'c1', label: 'Seismic Test', value: -100000 },
      { id: 'e2', source: 'd1', target: 'c4', label: 'Drill Directly' },
      { id: 'e3', source: 'd1', target: 't9', label: 'Sell Rights' },
      { id: 'e4', source: 'c1', target: 'd2', label: 'Favorable', probability: 0.4 },
      { id: 'e5', source: 'c1', target: 'd3', label: 'Unfavorable', probability: 0.6 },
      { id: 'e6', source: 'd2', target: 'c2', label: 'Drill' },
      { id: 'e7', source: 'd2', target: 't3', label: 'Abandon' },
      { id: 'e8', source: 'd3', target: 'c3', label: 'Drill' },
      { id: 'e9', source: 'd3', target: 't6', label: 'Abandon' },
      { id: 'e10', source: 'c2', target: 't1', label: 'Oil', probability: 0.7 },
      { id: 'e11', source: 'c2', target: 't2', label: 'Dry', probability: 0.3 },
      { id: 'e12', source: 'c3', target: 't4', label: 'Oil', probability: 0.2 },
      { id: 'e13', source: 'c3', target: 't5', label: 'Dry', probability: 0.8 },
      { id: 'e14', source: 'c4', target: 't7', label: 'Oil', probability: 0.4 },
      { id: 'e15', source: 'c4', target: 't8', label: 'Dry', probability: 0.6 },
    ],
  },
  {
    name: 'Simple Decision',
    description: 'Basic two-option decision with uncertainty',
    nodes: [
      { id: 'd1', type: 'decision', label: 'Choose Option', position: { x: 100, y: 150 } },
      { id: 'c1', type: 'chance', label: 'Option A Outcome', position: { x: 350, y: 75 } },
      { id: 't1', type: 'terminal', label: 'Success', payoff: 100, position: { x: 550, y: 25 } },
      { id: 't2', type: 'terminal', label: 'Failure', payoff: -50, position: { x: 550, y: 125 } },
      { id: 't3', type: 'terminal', label: 'Option B', payoff: 25, position: { x: 350, y: 225 } },
    ],
    edges: [
      { id: 'e1', source: 'd1', target: 'c1', label: 'Option A' },
      { id: 'e2', source: 'd1', target: 't3', label: 'Option B (Safe)' },
      { id: 'e3', source: 'c1', target: 't1', label: 'Good Outcome', probability: 0.6 },
      { id: 'e4', source: 'c1', target: 't2', label: 'Bad Outcome', probability: 0.4 },
    ],
  },
];

export function getTemplate(name: string): Template | undefined {
  return templates.find(t => t.name === name);
}
