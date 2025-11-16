import React, { useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
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

// Row component for virtual scrolling
const InsightRow: React.FC<{ index: number; style: React.CSSProperties; data: AgentInsight[] }> = ({
  index,
  style,
  data,
}) => {
  const insight = data[index];
  const Icon = insightIcons[insight.type];
  const color = insightColors[insight.type];

  return (
    <div style={style}>
      <div className="px-6 pb-4">
        <div
          className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border transition-all hover:border-adapt-primary/50"
          role="article"
          aria-label={`${insight.type} insight from ${insight.agentName}`}
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
      </div>
    </div>
  );
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  isLive = false,
  config = {},
}) => {
  const listRef = useRef<List>(null);

  // Auto-scroll to bottom when new insights arrive
  useEffect(() => {
    if (insights.length > 0 && listRef.current) {
      listRef.current.scrollToItem(insights.length - 1, 'end');
    }
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

      {/* Insights List with Virtual Scrolling */}
      <div className="flex-1 relative">
        {insights.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-adapt-text-muted">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No insights yet. Agent analysis in progress...</p>
            </div>
          </div>
        ) : (
          <List
            ref={listRef}
            height={(typeof config.height === 'string' ? 600 : config.height || 600) - 73}
            itemCount={insights.length}
            itemSize={200}
            width="100%"
            itemData={insights}
            overscanCount={2}
          >
            {InsightRow}
          </List>
        )}
      </div>
    </div>
  );
};

export default React.memo(InsightsPanel);
