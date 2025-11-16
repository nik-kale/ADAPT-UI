import React, { useMemo, useState } from 'react';
import { TimelineData, TimelineEvent, TimelineWidgetConfig } from '@types/index';
import { getSeverityColor, hexToRgba } from '@utils/colors';
import { formatTimestamp, formatRelativeTime } from '@utils/formatters';
import {
  AlertTriangle,
  Activity,
  GitCommit,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface TimelineViewerProps {
  timeline: TimelineData;
  config?: TimelineWidgetConfig;
  onEventClick?: (event: TimelineEvent) => void;
}

const eventIcons = {
  anomaly: AlertTriangle,
  alert: AlertCircle,
  change: GitCommit,
  incident: AlertCircle,
  metric: TrendingUp,
  log: FileText,
};

const TimelineViewer: React.FC<TimelineViewerProps> = ({
  timeline,
  config = {},
  onEventClick,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    let events = [...timeline.events];

    if (selectedType) {
      events = events.filter(e => e.type === selectedType);
    }

    if (selectedSeverity) {
      events = events.filter(e => e.severity === selectedSeverity);
    }

    return events.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [timeline.events, selectedType, selectedSeverity]);

  const eventTypes = useMemo(() => {
    return Array.from(new Set(timeline.events.map(e => e.type)));
  }, [timeline.events]);

  const severities = useMemo(() => {
    return Array.from(new Set(timeline.events.map(e => e.severity)));
  }, [timeline.events]);

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
        <h3 className="text-xl font-semibold text-adapt-text-primary mb-2">
          Event Timeline
        </h3>
        <p className="text-sm text-adapt-text-secondary">
          {formatTimestamp(timeline.timeRange.start)} -{' '}
          {formatTimestamp(timeline.timeRange.end)}
        </p>
      </div>

      {/* Filters */}
      {config.enableFilters && (
        <div className="mb-6 flex gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs text-adapt-text-muted mb-2">
              Event Type
            </label>
            <select
              className="bg-adapt-bg-tertiary border border-adapt-border rounded px-3 py-2 text-sm text-adapt-text-primary"
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-xs text-adapt-text-muted mb-2">
              Severity
            </label>
            <select
              className="bg-adapt-bg-tertiary border border-adapt-border rounded px-3 py-2 text-sm text-adapt-text-primary"
              value={selectedSeverity || ''}
              onChange={(e) => setSelectedSeverity(e.target.value || null)}
            >
              <option value="">All Severities</option>
              {severities.map(severity => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {filteredEvents.map((event, index) => {
          const Icon = eventIcons[event.type] || Activity;
          const severityColor = getSeverityColor(event.severity);

          return (
            <div
              key={event.id}
              className="relative pl-8 pb-4 cursor-pointer transition-all hover:bg-adapt-bg-tertiary hover:rounded-lg hover:p-2 hover:ml-[-8px]"
              onClick={() => onEventClick?.(event)}
            >
              {/* Timeline Line */}
              {index < filteredEvents.length - 1 && (
                <div
                  className="absolute left-3 top-8 w-0.5 h-full"
                  style={{
                    backgroundColor: hexToRgba(severityColor, 0.3),
                  }}
                />
              )}

              {/* Icon */}
              <div
                className="absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: hexToRgba(severityColor, 0.2),
                  border: `2px solid ${severityColor}`,
                }}
              >
                <Icon size={12} style={{ color: severityColor }} />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <h4 className="text-adapt-text-primary font-medium">
                      {event.title}
                    </h4>
                    <p className="text-sm text-adapt-text-secondary mt-1">
                      {event.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-adapt-text-muted">
                      {formatRelativeTime(event.timestamp)}
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-full mt-1"
                      style={{
                        backgroundColor: hexToRgba(severityColor, 0.2),
                        color: severityColor,
                      }}
                    >
                      {event.severity}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {event.source && (
                  <div className="text-xs text-adapt-text-muted mt-2">
                    Source: {event.source}
                  </div>
                )}

                {/* Correlated Events */}
                {event.correlatedEvents && event.correlatedEvents.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-adapt-text-muted">
                      Correlated with {event.correlatedEvents.length} other event(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-adapt-text-muted">
            No events found
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineViewer;
