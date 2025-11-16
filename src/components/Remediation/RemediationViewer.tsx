import React, { useState } from 'react';
import { RemediationPlan, RemediationStep, WidgetConfig } from '@types/index';
import { getStatusColor, hexToRgba } from '@utils/colors';
import { formatTimestamp } from '@utils/formatters';
import {
  CheckCircle,
  Circle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Terminal,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

interface RemediationViewerProps {
  plan: RemediationPlan;
  onStepStatusChange?: (stepId: string, status: string) => void;
  config?: WidgetConfig;
}

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle,
  failed: XCircle,
  blocked: AlertCircle,
};

const RemediationViewer: React.FC<RemediationViewerProps> = ({
  plan,
  onStepStatusChange,
  config = {},
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const completedSteps = plan.steps.filter((s) => s.status === 'completed').length;
  const progress = (completedSteps / plan.steps.length) * 100;

  return (
    <div
      className="bg-adapt-bg-secondary rounded-lg border border-adapt-border p-6"
      style={{
        height: config.height || 'auto',
        width: config.width || '100%',
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-semibold text-adapt-text-primary">
              {plan.title}
            </h3>
            <p className="text-sm text-adapt-text-secondary mt-1">
              {plan.description}
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: hexToRgba(getStatusColor(plan.status), 0.2),
              color: getStatusColor(plan.status),
            }}
          >
            {plan.status}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-adapt-text-muted">
              Progress: {completedSteps} / {plan.steps.length} steps
            </span>
            {plan.estimatedTotalDuration && (
              <span className="text-adapt-text-muted">
                Est. {plan.estimatedTotalDuration}
              </span>
            )}
          </div>
          <div className="w-full bg-adapt-bg-tertiary rounded-full h-2">
            <div
              className="h-2 rounded-full bg-adapt-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {plan.steps.map((step, index) => {
          const StatusIcon = statusIcons[step.status];
          const isExpanded = expandedSteps.has(step.id);
          const statusColor = getStatusColor(step.status);

          return (
            <div
              key={step.id}
              className="bg-adapt-bg-tertiary rounded-lg border border-adapt-border overflow-hidden transition-all hover:border-adapt-primary/50"
            >
              {/* Step Header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => toggleStep(step.id)}
              >
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-adapt-bg-secondary flex items-center justify-center text-sm font-semibold text-adapt-text-primary">
                  {step.order}
                </div>

                {/* Status Icon */}
                <StatusIcon
                  size={20}
                  style={{ color: statusColor }}
                  className={
                    step.status === 'in_progress' ? 'animate-pulse' : ''
                  }
                />

                {/* Title */}
                <div className="flex-1">
                  <h4 className="font-semibold text-adapt-text-primary">
                    {step.title}
                  </h4>
                  {step.estimatedDuration && (
                    <p className="text-xs text-adapt-text-muted mt-1">
                      Est. {step.estimatedDuration}
                    </p>
                  )}
                </div>

                {/* Type Badge */}
                <div
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor:
                      step.type === 'automated'
                        ? hexToRgba('#10b981', 0.2)
                        : step.type === 'manual'
                        ? hexToRgba('#f59e0b', 0.2)
                        : hexToRgba('#3b82f6', 0.2),
                    color:
                      step.type === 'automated'
                        ? '#10b981'
                        : step.type === 'manual'
                        ? '#f59e0b'
                        : '#3b82f6',
                  }}
                >
                  {step.type}
                </div>

                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronDown size={20} className="text-adapt-text-muted" />
                ) : (
                  <ChevronRight size={20} className="text-adapt-text-muted" />
                )}
              </div>

              {/* Step Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-adapt-border pt-4 space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-adapt-text-secondary">
                      {step.description}
                    </p>
                  </div>

                  {/* Command */}
                  {step.command && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal size={16} className="text-adapt-text-muted" />
                        <span className="text-sm font-semibold text-adapt-text-primary">
                          Command
                        </span>
                      </div>
                      <div className="bg-adapt-bg-primary rounded p-3 font-mono text-sm text-adapt-text-primary">
                        {step.command}
                      </div>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle
                          size={16}
                          className="text-adapt-text-muted"
                        />
                        <span className="text-sm font-semibold text-adapt-text-primary">
                          Prerequisites
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-sm text-adapt-text-secondary space-y-1">
                        {step.prerequisites.map((prereq, i) => (
                          <li key={i}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {step.risks && step.risks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          size={16}
                          className="text-adapt-warning"
                        />
                        <span className="text-sm font-semibold text-adapt-text-primary">
                          Risks
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-sm text-adapt-warning space-y-1">
                        {step.risks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Documentation */}
                  {step.documentation && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-adapt-text-muted" />
                        <span className="text-sm font-semibold text-adapt-text-primary">
                          Documentation
                        </span>
                      </div>
                      <a
                        href={step.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-adapt-primary hover:underline"
                      >
                        {step.documentation}
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  {onStepStatusChange && step.status !== 'completed' && (
                    <div className="flex gap-2 pt-2">
                      {step.status !== 'in_progress' && (
                        <button
                          onClick={() =>
                            onStepStatusChange(step.id, 'in_progress')
                          }
                          className="flex items-center gap-2 px-3 py-2 bg-adapt-primary text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          <Play size={16} />
                          Start
                        </button>
                      )}
                      {step.status === 'in_progress' && (
                        <button
                          onClick={() =>
                            onStepStatusChange(step.id, 'completed')
                          }
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle size={16} />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-adapt-border text-xs text-adapt-text-muted">
        <div className="flex justify-between">
          <span>Created: {formatTimestamp(plan.createdAt, 'PPp')}</span>
          <span>Updated: {formatTimestamp(plan.updatedAt, 'PPp')}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RemediationViewer);
