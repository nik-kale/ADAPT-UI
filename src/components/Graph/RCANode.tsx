import React from 'react';
import { Handle, Position } from 'reactflow';
import { RCANode as RCANodeType } from '@types/index';
import { getNodeColor, getStatusColor, getSeverityColor, hexToRgba } from '@utils/colors';
import { AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface RCANodeProps {
  data: RCANodeType & { onClick?: () => void };
}

const statusIcons = {
  pending: Clock,
  in_progress: Loader,
  completed: CheckCircle,
  failed: XCircle,
  blocked: AlertCircle,
};

const RCANode: React.FC<RCANodeProps> = React.memo(({ data }) => {
  const color = getNodeColor(data.type);
  const StatusIcon = statusIcons[data.status] || AlertCircle;

  return (
    <div
      className="relative cursor-pointer transition-all hover:scale-105"
      onClick={data.onClick}
      style={{
        minWidth: '200px',
        maxWidth: '250px',
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div
        className="rounded-lg shadow-lg border-2 p-4"
        style={{
          backgroundColor: '#1e293b',
          borderColor: color,
          boxShadow: `0 0 20px ${hexToRgba(color, 0.3)}`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div
            className="px-2 py-1 rounded text-xs font-semibold uppercase"
            style={{
              backgroundColor: hexToRgba(color, 0.2),
              color: color,
            }}
          >
            {data.type}
          </div>
          <StatusIcon
            size={16}
            style={{ color: getStatusColor(data.status) }}
            className={data.status === 'in_progress' ? 'animate-spin' : ''}
          />
        </div>

        {/* Label */}
        <div className="text-adapt-text-primary font-semibold mb-2">
          {data.label}
        </div>

        {/* Description */}
        <div className="text-adapt-text-secondary text-sm line-clamp-2">
          {data.description}
        </div>

        {/* Confidence */}
        {data.confidence !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-adapt-text-muted">Confidence</span>
              <span className="text-adapt-text-primary font-semibold">
                {data.confidence}%
              </span>
            </div>
            <div className="w-full bg-adapt-bg-tertiary rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${data.confidence}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )}

        {/* Severity Badge */}
        {data.severity && (
          <div className="mt-2">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: hexToRgba(getSeverityColor(data.severity), 0.2),
                color: getSeverityColor(data.severity),
              }}
            >
              {data.severity}
            </span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

RCANode.displayName = 'RCANode';

export default RCANode;
