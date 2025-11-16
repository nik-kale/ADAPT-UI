import React, { useEffect, useRef } from 'react';
import { AgentInsight, WidgetConfig } from '@types/index';
import { formatRelativeTime } from '@utils/formatters';
import { hexToRgba } from '@utils/colors';
import {
  Lightbulb,
  Search,
  ThumbsUp,
  HelpCircle,
  Activity,
  Sparkles,
} from 'lucide-react';

interface InsightsPanelProps {
  insights: AgentInsight[];
  isLive?: boolean;
  config?: WidgetConfig;
}

const insightIcons = {
  hypothesis: Lightbulb,
  finding: Search,
  recommendation: ThumbsUp,
  question: HelpCircle,
  progress: Activity,
};

const insightColors = {
  hypothesis: '#f59e0b',
  finding: '#8b5cf6',
  recommendation: '#10b981',
  question: '#06b6d4',
  progress: '#3b82f6',
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  isLive = false,
  config = {},
}) => {
  const insightsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    insightsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [insights]);

  return (
    <div
      className="bg-adapt-bg-secondary rounded-lg border border-adapt-border flex flex-col"
      style={{
        height: config.height || '600px',
        width: config.width || '100%',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-adapt-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-adapt-primary" />
            <h3 className="text-lg font-semibold text-adapt-text-primary">
              Agent Insights
            </h3>
          </div>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-adapt-text-secondary">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-12 text-adapt-text-muted">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>No insights yet. Agent analysis in progress...</p>
          </div>
        ) : (
          insights.map((insight) => {
            const Icon = insightIcons[insight.type];
            const color = insightColors[insight.type];

            return (
              <div
                key={insight.id}
                className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border transition-all hover:border-adapt-primary/50 animate-fade-in"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: hexToRgba(color, 0.2),
                      }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-adapt-text-primary">
                          {insight.agentName}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: hexToRgba(color, 0.2),
                            color,
                          }}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <div className="text-xs text-adapt-text-muted">
                        {formatRelativeTime(insight.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  {insight.confidence !== undefined && (
                    <div className="text-right">
                      <div className="text-xs text-adapt-text-muted mb-1">
                        Confidence
                      </div>
                      <div className="text-sm font-semibold text-adapt-text-primary">
                        {insight.confidence}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="text-adapt-text-primary whitespace-pre-wrap">
                  {insight.content}
                </div>

                {/* Related Nodes */}
                {insight.relatedNodes && insight.relatedNodes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-adapt-border">
                    <div className="text-xs text-adapt-text-muted">
                      Related to {insight.relatedNodes.length} node(s)
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={insightsEndRef} />
      </div>
    </div>
  );
};

export default React.memo(InsightsPanel);
