import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RCAGraph, GraphWidgetConfig } from '@types/index';
import { getNodeColor } from '@utils/colors';
import { calculateHierarchicalLayout } from '@utils/graphLayout';
import RCANode from './RCANode';

interface RCAGraphViewerProps {
  graph: RCAGraph;
  config?: GraphWidgetConfig;
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = {
  rcaNode: RCANode,
};

const RCAGraphViewer: React.FC<RCAGraphViewerProps> = ({
  graph,
  config = {},
  onNodeClick,
}) => {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    return calculateHierarchicalLayout(graph.nodes, graph.edges);
  }, [graph]);

  const flowNodes: Node[] = useMemo(() => {
    return layoutNodes.map(node => ({
      id: node.id,
      type: 'rcaNode',
      position: { x: node.x, y: node.y },
      data: {
        ...node,
        onClick: () => onNodeClick?.(node.id),
      },
    }));
  }, [layoutNodes, onNodeClick]);

  const flowEdges: Edge[] = useMemo(() => {
    return layoutEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: graph.metadata.status === 'analyzing',
      style: {
        stroke: '#475569',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#475569',
      },
    }));
  }, [layoutEdges, graph.metadata.status]);

  return (
    <div
      className="w-full h-full bg-adapt-bg-secondary rounded-lg border border-adapt-border"
      style={{
        height: config.height || '600px',
        width: config.width || '100%',
      }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#334155" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const rcaNode = graph.nodes.find(n => n.id === node.id);
            return rcaNode ? getNodeColor(rcaNode.type) : '#64748b';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
        />
      </ReactFlow>
    </div>
  );
};

export default RCAGraphViewer;
