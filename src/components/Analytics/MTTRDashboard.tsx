import React, { useState, useMemo } from 'react';
import {
  AnalyticsService,
  IncidentStatistics,
  IncidentTrends,
  TopIssue,
} from '@services/AnalyticsService';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  Download,
} from 'lucide-react';

interface MTTRDashboardProps {
  className?: string;
}

export const MTTRDashboard: React.FC<MTTRDashboardProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Calculate statistics
  const stats = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return AnalyticsService.getStatistics({
      start: startDate,
      end: new Date(),
    });
  }, [timeRange]);

  const trends = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return AnalyticsService.getTrends(days);
  }, [timeRange]);

  const topIssues = useMemo(() => {
    return AnalyticsService.getTopIssues(5);
  }, []);

  const slaCompliance = useMemo(() => {
    return AnalyticsService.getSLACompliance({
      mttd: 5 * 60 * 1000, // 5 minutes
      mtta: 10 * 60 * 1000, // 10 minutes
      mttr: 60 * 60 * 1000, // 1 hour
    });
  }, []);

  const handleExportCSV = () => {
    const incidents = AnalyticsService.getAllIncidents();
    const csv = AnalyticsService.exportToCSV(incidents);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
  }> = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500/10 text-blue-500',
      green: 'bg-green-500/10 text-green-500',
      yellow: 'bg-yellow-500/10 text-yellow-500',
      red: 'bg-red-500/10 text-red-500',
    };

    return (
      <div className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-adapt-text-primary mb-1">{value}</div>
        <div className="text-sm text-adapt-text-muted">{title}</div>
        {subtitle && <div className="text-xs text-adapt-text-muted mt-1">{subtitle}</div>}
      </div>
    );
  };

  const trendData = trends[trendView];
  const latestTrend = trendData[trendData.length - 1];
  const previousTrend = trendData[trendData.length - 2];

  return (
    <div className={`bg-adapt-bg-secondary rounded-lg border border-adapt-border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-adapt-primary" />
          <div>
            <h2 className="text-2xl font-bold text-adapt-text-primary">MTTR Dashboard</h2>
            <p className="text-sm text-adapt-text-muted">
              Mean Time To Resolution & Incident Analytics
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 bg-adapt-bg-tertiary border border-adapt-border rounded-lg text-adapt-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-adapt-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-adapt-bg-tertiary border border-adapt-border rounded-lg text-adapt-text-primary hover:bg-adapt-bg-primary transition-colors flex items-center gap-2"
            title="Export to CSV"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* MTTR Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Mean Time To Detect"
          value={stats.mttrMetrics.mttdHuman}
          subtitle="MTTD"
          icon={<AlertCircle size={20} />}
          color="yellow"
        />
        <MetricCard
          title="Mean Time To Acknowledge"
          value={stats.mttrMetrics.mttaHuman}
          subtitle="MTTA"
          icon={<Clock size={20} />}
          color="blue"
        />
        <MetricCard
          title="Mean Time To Resolve"
          value={stats.mttrMetrics.mttrHuman}
          subtitle="MTTR"
          icon={<CheckCircle size={20} />}
          color="green"
        />
        <MetricCard
          title="Mean Time To Close"
          value={stats.mttrMetrics.mttcHuman}
          subtitle="MTTC"
          icon={<CheckCircle size={20} />}
          color="green"
        />
      </div>

      {/* Incident Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Incidents"
          value={stats.total.toString()}
          icon={<Activity size={20} />}
          color="blue"
        />
        <MetricCard
          title="Open Incidents"
          value={stats.open.toString()}
          icon={<AlertCircle size={20} />}
          color="red"
        />
        <MetricCard
          title="Resolved Incidents"
          value={stats.resolved.toString()}
          icon={<CheckCircle size={20} />}
          color="green"
        />
        <MetricCard
          title="Average Impact"
          value={stats.averageImpactScore.toFixed(1)}
          subtitle="Impact Score (0-100)"
          icon={<Target size={20} />}
          color="yellow"
        />
      </div>

      {/* SLA Compliance */}
      <div className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border mb-6">
        <h3 className="text-lg font-semibold text-adapt-text-primary mb-4">SLA Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-adapt-text-muted">MTTD</span>
              <span className="text-sm font-semibold text-adapt-text-primary">
                {slaCompliance.mttdCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-adapt-bg-primary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  slaCompliance.mttdCompliance >= 80 ? 'bg-green-500' : slaCompliance.mttdCompliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, slaCompliance.mttdCompliance)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-adapt-text-muted">MTTA</span>
              <span className="text-sm font-semibold text-adapt-text-primary">
                {slaCompliance.mttaCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-adapt-bg-primary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  slaCompliance.mttaCompliance >= 80 ? 'bg-green-500' : slaCompliance.mttaCompliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, slaCompliance.mttaCompliance)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-adapt-text-muted">MTTR</span>
              <span className="text-sm font-semibold text-adapt-text-primary">
                {slaCompliance.mttrCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-adapt-bg-primary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  slaCompliance.mttrCompliance >= 80 ? 'bg-green-500' : slaCompliance.mttrCompliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, slaCompliance.mttrCompliance)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-adapt-text-muted">Overall</span>
              <span className="text-sm font-semibold text-adapt-text-primary">
                {slaCompliance.overallCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-adapt-bg-primary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  slaCompliance.overallCompliance >= 80 ? 'bg-green-500' : slaCompliance.overallCompliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, slaCompliance.overallCompliance)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-adapt-text-primary">Incident Trends</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTrendView('daily')}
              className={`px-3 py-1 text-sm rounded ${
                trendView === 'daily'
                  ? 'bg-adapt-primary text-white'
                  : 'bg-adapt-bg-secondary text-adapt-text-muted hover:bg-adapt-bg-primary'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTrendView('weekly')}
              className={`px-3 py-1 text-sm rounded ${
                trendView === 'weekly'
                  ? 'bg-adapt-primary text-white'
                  : 'bg-adapt-bg-secondary text-adapt-text-muted hover:bg-adapt-bg-primary'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTrendView('monthly')}
              className={`px-3 py-1 text-sm rounded ${
                trendView === 'monthly'
                  ? 'bg-adapt-primary text-white'
                  : 'bg-adapt-bg-secondary text-adapt-text-muted hover:bg-adapt-bg-primary'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-2">
          {trendData.slice(-10).map((data, index) => {
            const maxIncidents = Math.max(...trendData.map(d => d.incidents), 1);
            const width = (data.incidents / maxIncidents) * 100;

            return (
              <div key={data.period} className="flex items-center gap-2">
                <div className="w-20 text-xs text-adapt-text-muted truncate">
                  {new Date(data.period).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1 relative">
                  <div className="w-full bg-adapt-bg-primary rounded h-6 relative overflow-hidden">
                    <div
                      className="bg-adapt-primary h-full rounded transition-all"
                      style={{ width: `${width}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {data.incidents} incidents
                      </span>
                      <span className="text-xs text-white/80 drop-shadow">
                        {data.resolved} resolved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Recurring Issues */}
      <div className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border">
        <h3 className="text-lg font-semibold text-adapt-text-primary mb-4">Top Recurring Issues</h3>
        <div className="space-y-3">
          {topIssues.length === 0 ? (
            <div className="text-center py-8 text-adapt-text-muted">
              <Activity size={48} className="mx-auto mb-2 opacity-50" />
              <p>No recurring issues detected</p>
            </div>
          ) : (
            topIssues.map((issue, index) => (
              <div
                key={index}
                className="bg-adapt-bg-secondary rounded-lg p-3 border border-adapt-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          issue.severity === 'critical'
                            ? 'bg-red-500/20 text-red-500'
                            : issue.severity === 'high'
                            ? 'bg-orange-500/20 text-orange-500'
                            : issue.severity === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-sm font-semibold text-adapt-text-primary">
                        {issue.occurrences} occurrences
                      </span>
                    </div>
                    <div className="text-sm text-adapt-text-primary font-mono">{issue.pattern}</div>
                  </div>
                  <div className="text-right text-xs text-adapt-text-muted">
                    <div>Last seen:</div>
                    <div>{new Date(issue.lastSeen).toLocaleDateString()}</div>
                    <div className="mt-1">Avg resolution:</div>
                    <div className="font-semibold">
                      {AnalyticsService['formatDuration'](issue.avgResolutionTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border mt-6">
        <h3 className="text-lg font-semibold text-adapt-text-primary mb-4">Severity Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.bySeverity).map(([severity, count]) => (
            <div key={severity} className="text-center">
              <div
                className={`text-3xl font-bold mb-1 ${
                  severity === 'critical'
                    ? 'text-red-500'
                    : severity === 'high'
                    ? 'text-orange-500'
                    : severity === 'medium'
                    ? 'text-yellow-500'
                    : 'text-blue-500'
                }`}
              >
                {count}
              </div>
              <div className="text-sm text-adapt-text-muted capitalize">{severity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
