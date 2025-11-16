import dagre from 'dagre';
import { RCANode, RCAEdge } from '@types/index';
import { GRAPH_LAYOUT, NODE_SIZES } from './constants';

export interface LayoutNode extends RCANode {
  x: number;
  y: number;
}

export interface LayoutEdge extends RCAEdge {
  points?: { x: number; y: number }[];
}

export const calculateHierarchicalLayout = (
  nodes: RCANode[],
  edges: RCAEdge[]
): { nodes: LayoutNode[]; edges: LayoutEdge[] } => {
  // Simple hierarchical layout based on node type
  const typeOrder: Record<string, number> = {
    symptom: 0,
    hypothesis: 1,
    test: 2,
    finding: 3,
    remediation: 4,
    dependency: 2,
  };

  const { LAYER_SPACING, NODE_SPACING, CENTER_X, START_Y } = GRAPH_LAYOUT.HIERARCHICAL;

  // Group nodes by layer
  const layers: Record<number, RCANode[]> = {};
  nodes.forEach(node => {
    const layer = typeOrder[node.type] || 0;
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(node);
  });

  // Position nodes
  const layoutNodes: LayoutNode[] = [];
  Object.entries(layers).forEach(([layerStr, layerNodes]) => {
    const layer = parseInt(layerStr);
    const y = layer * LAYER_SPACING + START_Y;
    const totalWidth = (layerNodes.length - 1) * NODE_SPACING;
    const startX = -totalWidth / 2 + CENTER_X;

    layerNodes.forEach((node, i) => {
      layoutNodes.push({
        ...node,
        x: startX + i * NODE_SPACING,
        y,
      });
    });
  });

  return { nodes: layoutNodes, edges };
};

export const calculateForceLayout = (
  nodes: RCANode[],
  edges: RCAEdge[]
): { nodes: LayoutNode[]; edges: LayoutEdge[] } => {
  const {
    ITERATIONS,
    REPULSION_FORCE,
    ATTRACTION_FORCE,
    CENTER_X,
    CENTER_Y,
    INITIAL_SPREAD
  } = GRAPH_LAYOUT.FORCE;

  // Simple force-directed layout simulation
  const layoutNodes: LayoutNode[] = nodes.map(() => ({
    ...nodes[Math.floor(Math.random() * nodes.length)],
    x: CENTER_X + (Math.random() - 0.5) * INITIAL_SPREAD,
    y: CENTER_Y + (Math.random() - 0.5) * INITIAL_SPREAD,
  }));

  // Assign proper node data
  nodes.forEach((node, i) => {
    layoutNodes[i] = {
      ...node,
      x: layoutNodes[i].x,
      y: layoutNodes[i].y,
    };
  });

  // Run force simulation
  for (let iter = 0; iter < ITERATIONS; iter++) {
    const forces: { x: number; y: number }[] = layoutNodes.map(() => ({ x: 0, y: 0 }));

    // Repulsion between nodes
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const dx = layoutNodes[j].x - layoutNodes[i].x;
        const dy = layoutNodes[j].y - layoutNodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION_FORCE / (dist * dist);

        forces[i].x -= (dx / dist) * force;
        forces[i].y -= (dy / dist) * force;
        forces[j].x += (dx / dist) * force;
        forces[j].y += (dy / dist) * force;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const sourceIdx = layoutNodes.findIndex(n => n.id === edge.source);
      const targetIdx = layoutNodes.findIndex(n => n.id === edge.target);
      if (sourceIdx === -1 || targetIdx === -1) return;

      const dx = layoutNodes[targetIdx].x - layoutNodes[sourceIdx].x;
      const dy = layoutNodes[targetIdx].y - layoutNodes[sourceIdx].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * ATTRACTION_FORCE;

      forces[sourceIdx].x += (dx / dist) * force;
      forces[sourceIdx].y += (dy / dist) * force;
      forces[targetIdx].x -= (dx / dist) * force;
      forces[targetIdx].y -= (dy / dist) * force;
    });

    // Apply forces
    layoutNodes.forEach((node, i) => {
      node.x += forces[i].x;
      node.y += forces[i].y;
    });
  }

  return { nodes: layoutNodes, edges };
};

// Dagre layout for better hierarchical graphs
export const calculateDagreLayout = (
  nodes: RCANode[],
  edges: RCAEdge[]
): { nodes: LayoutNode[]; edges: LayoutEdge[] } => {
  const { RANK_SEPARATION, NODE_SEPARATION, EDGE_SEPARATION, RANK_DIRECTION } = GRAPH_LAYOUT.DAGRE;

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set graph configuration
  g.setGraph({
    rankdir: RANK_DIRECTION,
    nodesep: NODE_SEPARATION,
    edgesep: EDGE_SEPARATION,
    ranksep: RANK_SEPARATION,
    marginx: 20,
    marginy: 20,
  });

  // Default node configuration
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    // Determine node size based on content
    const size = NODE_SIZES.MEDIUM;
    g.setNode(node.id, {
      width: size.MIN_WIDTH,
      height: 100, // Approximate node height
      label: node.label,
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target, {
      label: edge.label || '',
    });
  });

  // Run dagre layout algorithm
  dagre.layout(g);

  // Extract positioned nodes
  const layoutNodes: LayoutNode[] = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      x: dagreNode.x,
      y: dagreNode.y,
    };
  });

  // Extract edge routing points
  const layoutEdges: LayoutEdge[] = edges.map((edge) => {
    const dagreEdge = g.edge(edge.source, edge.target);
    return {
      ...edge,
      points: dagreEdge?.points || [],
    };
  });

  return { nodes: layoutNodes, edges: layoutEdges };
};
