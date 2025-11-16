import { RCANode, RCAEdge } from '@types/index';

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

  const layerSpacing = 200;
  const nodeSpacing = 150;

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
    const y = layer * layerSpacing + 100;
    const totalWidth = (layerNodes.length - 1) * nodeSpacing;
    const startX = -totalWidth / 2 + 400; // Center at x=400

    layerNodes.forEach((node, i) => {
      layoutNodes.push({
        ...node,
        x: startX + i * nodeSpacing,
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
  // Simple force-directed layout simulation
  const layoutNodes: LayoutNode[] = nodes.map((node, i) => ({
    ...node,
    x: 400 + (Math.random() - 0.5) * 400,
    y: 300 + (Math.random() - 0.5) * 400,
  }));

  // Run simple force simulation (10 iterations)
  for (let iter = 0; iter < 10; iter++) {
    const forces: { x: number; y: number }[] = layoutNodes.map(() => ({ x: 0, y: 0 }));

    // Repulsion between nodes
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const dx = layoutNodes[j].x - layoutNodes[i].x;
        const dy = layoutNodes[j].y - layoutNodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 1000 / (dist * dist);

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
      const force = dist * 0.01;

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
