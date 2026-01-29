import DecisionNode from './DecisionNode';
import ChanceNode from './ChanceNode';
import TerminalNode from './TerminalNode';

export const nodeTypes = {
  decision: DecisionNode,
  chance: ChanceNode,
  terminal: TerminalNode,
};

export { DecisionNode, ChanceNode, TerminalNode };
