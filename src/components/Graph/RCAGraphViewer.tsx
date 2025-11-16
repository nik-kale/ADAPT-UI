import React, { useMemo, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RCAGraph, GraphWidgetConfig } from '@types/index';
import { getNodeColor } from '@utils/colors';
import { calculateHierarchicalLayout } from '@utils/graphLayout';
import { useKeyboardNavigation } from '@hooks/useKeyboardNavigation';
import { useTouchGestures } from '@hooks/useTouchGestures';
import RCANode from './RCANode';

interface RCAGraphViewerProps {
  graph: RCAGraph;
  config?: GraphWidgetConfig;
  onNodeClick?: (nodeId: string) => void;
  highlightedNodeIds?: Set<string>;
}

const nodeTypes: NodeTypes = {
  rcaNode: RCANode,
};

const RCAGraphViewerInner: React.FC<RCAGraphViewerProps> = ({
  graph,
  config = {},
  onNodeClick,
  highlightedNodeIds,
}) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView, setCenter } = useReactFlow();
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    return calculateHierarchicalLayout(graph.nodes, graph.edges);
  }, [graph]);

  // Keyboard navigation for cycling through nodes
  useKeyboardNavigation({
    onArrowDown: () => {
      setSelectedNodeIndex(prev => (prev + 1) % layoutNodes.length);
      const nextNode = layoutNodes[(selectedNodeIndex + 1) % layoutNodes.length];
      setCenter(nextNode.x, nextNode.y, { zoom: 1.5, duration: 300 });
    },
    onArrowUp: () => {
      setSelectedNodeIndex(prev => (prev - 1 + layoutNodes.length) % layoutNodes.length);
      const prevNode = layoutNodes[(selectedNodeIndex - 1 + layoutNodes.length) % layoutNodes.length];
      setCenter(prevNode.x, prevNode.y, { zoom: 1.5, duration: 300 });
    },
    onEnter: () => {
      const selectedNode = layoutNodes[selectedNodeIndex];
      if (selectedNode) {
        onNodeClick?.(selectedNode.id);
      }
    },
    onEscape: () => {
      fitView();
    },
    enabled: true,
  });

  // Touch gestures for mobile support
  useTouchGestures(containerRef, {
    onDoubleTap: () => {
      fitView();
    },
    onPinchIn: () => {
      // ReactFlow handles pinch-to-zoom natively
    },
    onPinchOut: () => {
      // ReactFlow handles pinch-to-zoom natively
    },
    enabled: true,
  });

  const selectedNode = layoutNodes[selectedNodeIndex];

  const flowNodes: Node[] = useMemo(() => {
    return layoutNodes.map((node, index) => ({
      id: node.id,
      type: 'rcaNode',
      position: { x: node.x, y: node.y },
      data: {
        ...node,
        onClick: () => onNodeClick?.(node.id),
        isSelected: index === selectedNodeIndex,
        isHighlighted: highlightedNodeIds?.has(node.id),
      },
    }));
  }, [layoutNodes, onNodeClick, selectedNodeIndex, highlightedNodeIds]);

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
      ref={containerRef}
      className="w-full h-full bg-adapt-bg-secondary rounded-lg border border-adapt-border"
      style={{
        height: config.height || '600px',
        width: config.width || '100%',
      }}
      role="application"
      aria-label="Root Cause Analysis Graph Viewer"
      tabIndex={0}
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

// Wrapper component to provide ReactFlow context
const RCAGraphViewer: React.FC<RCAGraphViewerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <RCAGraphViewerInner {...props} />
    </ReactFlowProvider>
  );
};

export default React.memo(RCAGraphViewer);
