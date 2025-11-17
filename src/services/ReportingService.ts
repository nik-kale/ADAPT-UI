/**
 * Advanced Reporting Service
 * Provides: Custom reports, scheduled reports, executive summaries
 */

import { AnalyticsService, IncidentRecord } from './AnalyticsService';
import { AuditService, AuditEvent } from './AuditService';
import { RBACService } from './RBACService';

export type ReportType =
  | 'executive-summary'
  | 'incident-analysis'
  | 'team-performance'
  | 'sla-compliance'
  | 'security-audit'
  | 'trend-analysis'
  | 'runbook-effectiveness'
  | 'cost-analysis'
  | 'custom';

export type ReportFormat = 'pdf' | 'html' | 'csv' | 'json' | 'xlsx';

export type ReportSchedule = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand';

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  schedule: ReportSchedule;
  recipients: string[]; // Email addresses
  filters: {
    dateRange?: { start: Date; end: Date };
    severity?: string[];
    teams?: string[];
    services?: string[];
    tags?: string[];
  };
  sections: ReportSection[];
  createdBy: string;
  createdAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
  enabled: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'list';
  config: Record<string, unknown>;
}

export interface GeneratedReport {
  id: string;
  definitionId: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: Date;
  generatedBy: string;
  data: ReportData;
  fileUrl?: string;
  fileSize?: number;
}

export interface ReportData {
  title: string;
  subtitle: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    key: string;
    value: string | number;
    trend?: number;
  }[];
  sections: {
    title: string;
    type: string;
    data: unknown;
  }[];
  insights: string[];
  recommendations: string[];
  metadata?: Record<string, unknown>;
}

export class ReportingService {
  private static definitions: Map<string, ReportDefinition> = new Map();
  private static reports: Map<string, GeneratedReport> = new Map();

  /**
   * Create a new report definition
   */
  static createReportDefinition(def: Omit<ReportDefinition, 'id' | 'createdAt'>): ReportDefinition {
    const id = `report-def-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const definition: ReportDefinition = {
      ...def,
      id,
      createdAt: new Date(),
    };

    // Calculate next run time if scheduled
    if (definition.schedule !== 'on-demand') {
      definition.nextRunAt = this.calculateNextRunTime(definition.schedule);
    }

    this.definitions.set(id, definition);
    console.log(`[Reporting] Created report definition: ${definition.name}`);
    return definition;
  }

  /**
   * Update report definition
   */
  static updateReportDefinition(
    id: string,
    updates: Partial<Omit<ReportDefinition, 'id' | 'createdAt'>>
  ): ReportDefinition | null {
    const definition = this.definitions.get(id);
    if (!definition) {
      return null;
    }

    const updated: ReportDefinition = {
      ...definition,
      ...updates,
    };

    if (updates.schedule && updates.schedule !== 'on-demand') {
      updated.nextRunAt = this.calculateNextRunTime(updates.schedule);
    }

    this.definitions.set(id, updated);
    console.log(`[Reporting] Updated report definition: ${id}`);
    return updated;
  }

  /**
   * Delete report definition
   */
  static deleteReportDefinition(id: string): boolean {
    const result = this.definitions.delete(id);
    if (result) {
      console.log(`[Reporting] Deleted report definition: ${id}`);
    }
    return result;
  }

  /**
   * Get all report definitions
   */
  static getAllReportDefinitions(): ReportDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Generate a report
   */
  static async generateReport(definitionId: string, generatedBy: string): Promise<GeneratedReport> {
    const definition = this.definitions.get(definitionId);
    if (!definition) {
      throw new Error(`Report definition ${definitionId} not found`);
    }

    console.log(`[Reporting] Generating report: ${definition.name}`);

    let reportData: ReportData;

    switch (definition.type) {
      case 'executive-summary':
        reportData = this.generateExecutiveSummary(definition);
        break;
      case 'incident-analysis':
        reportData = this.generateIncidentAnalysis(definition);
        break;
      case 'team-performance':
        reportData = this.generateTeamPerformance(definition);
        break;
      case 'sla-compliance':
        reportData = this.generateSLACompliance(definition);
        break;
      case 'security-audit':
        reportData = this.generateSecurityAudit(definition);
        break;
      case 'trend-analysis':
        reportData = this.generateTrendAnalysis(definition);
        break;
      default:
        reportData = this.generateCustomReport(definition);
    }

    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const report: GeneratedReport = {
      id: reportId,
      definitionId,
      name: definition.name,
      type: definition.type,
      format: definition.format,
      generatedAt: new Date(),
      generatedBy,
      data: reportData,
    };

    this.reports.set(reportId, report);

    // Update definition's last run time
    definition.lastRunAt = new Date();
    if (definition.schedule !== 'on-demand') {
      definition.nextRunAt = this.calculateNextRunTime(definition.schedule);
    }

    // Send to recipients if configured
    if (definition.recipients.length > 0) {
      this.sendReport(report, definition.recipients);
    }

    console.log(`[Reporting] Generated report: ${report.id}`);
    return report;
  }

  /**
   * Generate Executive Summary Report
   */
  private static generateExecutiveSummary(definition: ReportDefinition): ReportData {
    const { start, end } = this.getDateRange(definition.filters.dateRange);
    const stats = AnalyticsService.getStatistics({ start, end });
    const trends = AnalyticsService.getTrends(30);

    return {
      title: 'Executive Summary',
      subtitle: 'Incident Management Overview',
      generatedAt: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: [
        { key: 'Total Incidents', value: stats.total, trend: this.calculateTrend(trends.daily, 'incidents') },
        { key: 'MTTR', value: stats.mttrMetrics.mttrHuman, trend: -5.2 },
        { key: 'Open Incidents', value: stats.open },
        { key: 'Resolution Rate', value: `${((stats.resolved / stats.total) * 100).toFixed(1)}%` },
      ],
      sections: [
        {
          title: 'Incident Breakdown by Severity',
          type: 'chart',
          data: stats.bySeverity,
        },
        {
          title: 'MTTR Metrics',
          type: 'metric',
          data: {
            mttd: stats.mttrMetrics.mttdHuman,
            mtta: stats.mttrMetrics.mttaHuman,
            mttr: stats.mttrMetrics.mttrHuman,
            mttc: stats.mttrMetrics.mttcHuman,
          },
        },
        {
          title: 'Top Affected Services',
          type: 'table',
          data: Object.entries(stats.byService)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([service, count]) => ({ service, incidents: count })),
        },
      ],
      insights: [
        `${stats.total} incidents occurred in the reporting period`,
        `Mean Time To Resolve (MTTR) is ${stats.mttrMetrics.mttrHuman}`,
        stats.open > 0 ? `${stats.open} incidents remain open` : 'All incidents resolved',
        `Critical incidents: ${stats.bySeverity.critical || 0}`,
      ],
      recommendations: [
        stats.mttrMetrics.mttr > 60 * 60 * 1000
          ? 'Consider implementing automated runbooks to reduce MTTR'
          : 'MTTR is within acceptable range',
        stats.bySeverity.critical > 5 ? 'High number of critical incidents - review infrastructure' : '',
        'Implement proactive monitoring for top affected services',
      ].filter(Boolean),
    };
  }

  /**
   * Generate Incident Analysis Report
   */
  private static generateIncidentAnalysis(definition: ReportDefinition): ReportData {
    const { start, end } = this.getDateRange(definition.filters.dateRange);
    const stats = AnalyticsService.getStatistics({ start, end });
    const topIssues = AnalyticsService.getTopIssues(10);

    return {
      title: 'Incident Analysis Report',
      subtitle: 'Detailed incident metrics and patterns',
      generatedAt: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: [
        { key: 'Total Incidents', value: stats.total },
        { key: 'Average Impact Score', value: stats.averageImpactScore.toFixed(1) },
        { key: 'Recurring Patterns', value: topIssues.length },
      ],
      sections: [
        {
          title: 'Incident Timeline',
          type: 'chart',
          data: AnalyticsService.getTrends(30).daily,
        },
        {
          title: 'Top Recurring Issues',
          type: 'table',
          data: topIssues.map(issue => ({
            pattern: issue.pattern,
            occurrences: issue.occurrences,
            severity: issue.severity,
            avgResolution: this.formatDuration(issue.avgResolutionTime),
          })),
        },
        {
          title: 'Distribution by Tag',
          type: 'chart',
          data: stats.byTag,
        },
      ],
      insights: topIssues.map(
        issue => `Pattern "${issue.pattern}" occurred ${issue.occurrences} times (${issue.severity} severity)`
      ),
      recommendations: [
        'Create runbooks for recurring issues to automate resolution',
        'Review infrastructure for patterns with high occurrence rates',
        'Implement preventive measures for top recurring failures',
      ],
    };
  }

  /**
   * Generate Team Performance Report
   */
  private static generateTeamPerformance(definition: ReportDefinition): ReportData {
    const { start, end } = this.getDateRange(definition.filters.dateRange);
    const stats = AnalyticsService.getStatistics({ start, end });
    const teams = RBACService.getAllTeams();

    return {
      title: 'Team Performance Report',
      subtitle: 'Team metrics and collaboration analytics',
      generatedAt: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: [
        { key: 'Active Teams', value: teams.length },
        { key: 'Total Users', value: RBACService.getAllUsers().length },
        { key: 'Incidents Assigned', value: stats.total },
      ],
      sections: [
        {
          title: 'Incidents by Assignee',
          type: 'table',
          data: Object.entries(stats.byAssignee).map(([assignee, count]) => ({
            assignee,
            incidents: count,
          })),
        },
        {
          title: 'Team Overview',
          type: 'table',
          data: teams.map(team => ({
            name: team.name,
            members: team.memberIds.length,
            tags: team.tags.join(', '),
          })),
        },
      ],
      insights: [
        `${teams.length} teams are currently active`,
        `Average of ${(stats.total / Object.keys(stats.byAssignee).length).toFixed(1)} incidents per assignee`,
      ],
      recommendations: [
        'Balance incident load across team members',
        'Provide additional training for teams with longer resolution times',
      ],
    };
  }

  /**
   * Generate SLA Compliance Report
   */
  private static generateSLACompliance(definition: ReportDefinition): ReportData {
    const { start, end } = this.getDateRange(definition.filters.dateRange);
    const stats = AnalyticsService.getStatistics({ start, end });
    const compliance = AnalyticsService.getSLACompliance({
      mttd: 5 * 60 * 1000,
      mtta: 10 * 60 * 1000,
      mttr: 60 * 60 * 1000,
    });

    return {
      title: 'SLA Compliance Report',
      subtitle: 'Service Level Agreement metrics and compliance status',
      generatedAt: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: [
        { key: 'Overall Compliance', value: `${compliance.overallCompliance.toFixed(1)}%` },
        { key: 'MTTD Compliance', value: `${compliance.mttdCompliance.toFixed(1)}%` },
        { key: 'MTTA Compliance', value: `${compliance.mttaCompliance.toFixed(1)}%` },
        { key: 'MTTR Compliance', value: `${compliance.mttrCompliance.toFixed(1)}%` },
      ],
      sections: [
        {
          title: 'Compliance Metrics',
          type: 'metric',
          data: compliance,
        },
        {
          title: 'MTTR Breakdown',
          type: 'metric',
          data: stats.mttrMetrics,
        },
      ],
      insights: [
        compliance.overallCompliance >= 80
          ? 'SLA compliance is within acceptable range'
          : 'SLA compliance is below target',
        `MTTR target: 1 hour, Current: ${stats.mttrMetrics.mttrHuman}`,
      ],
      recommendations: [
        compliance.mttrCompliance < 80 ? 'Implement automated runbooks to improve MTTR' : '',
        compliance.mttdCompliance < 80 ? 'Enhance monitoring and alerting to improve MTTD' : '',
        compliance.mttaCompliance < 80 ? 'Review on-call procedures to improve acknowledgement time' : '',
      ].filter(Boolean),
    };
  }

  /**
   * Generate Security Audit Report
   */
  private static generateSecurityAudit(definition: ReportDefinition): ReportData {
    const { start, end } = this.getDateRange(definition.filters.dateRange);
    const auditStats = AuditService.getStatistics(start, end);
    const securityEvents = AuditService.getSecurityEvents(100);
    const suspicious = AuditService.detectSuspiciousActivity();

    return {
      title: 'Security Audit Report',
      subtitle: 'Security events and suspicious activity analysis',
      generatedAt: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: [
        { key: 'Total Audit Events', value: auditStats.totalEvents },
        { key: 'Security Events', value: auditStats.securityEvents },
        { key: 'Failed Events', value: auditStats.failedEvents },
        { key: 'Suspicious Users', value: suspicious.suspiciousUsers.length },
      ],
      sections: [
        {
          title: 'Events by Severity',
          type: 'chart',
          data: auditStats.bySeverity,
        },
        {
          title: 'Recent Security Events',
          type: 'table',
          data: securityEvents.slice(0, 20).map(event => ({
            timestamp: event.timestamp.toISOString(),
            type: event.type,
            user: event.userName || 'Unknown',
            description: event.description,
          })),
        },
        {
          title: 'Suspicious Patterns',
          type: 'list',
          data: suspicious.patterns,
        },
      ],
      insights: [
        `${auditStats.securityEvents} security-related events recorded`,
        suspicious.patterns.length > 0 ? `${suspicious.patterns.length} suspicious patterns detected` : 'No suspicious patterns detected',
        `${auditStats.failedEvents} failed operations recorded`,
      ],
      recommendations: [
        suspicious.suspiciousUsers.length > 0 ? 'Review accounts with suspicious activity' : '',
        auditStats.failedEvents > 100 ? 'Investigate high number of failed operations' : '',
        'Enable MFA for all users with administrative privileges',
        'Regular security audits and penetration testing recommended',
      ].filter(Boolean),
    };
  }

  /**
   * Generate Trend Analysis Report
   */
  private static generateTrendAnalysis(definition: ReportDefinition): ReportData {
    const trends = AnalyticsService.getTrends(90);

    return {
      title: 'Trend Analysis Report',
      subtitle: 'Long-term trends and patterns',
      generatedAt: new Date().toISOString(),
      period: {
        start: trends.daily[0]?.period || '',
        end: trends.daily[trends.daily.length - 1]?.period || '',
      },
      summary: [
        { key: 'Total Incidents (90d)', value: trends.daily.reduce((sum, d) => sum + d.incidents, 0) },
        { key: 'Average Daily', value: (trends.daily.reduce((sum, d) => sum + d.incidents, 0) / trends.daily.length).toFixed(1) },
        { key: 'Trend', value: this.calculateTrend(trends.daily, 'incidents') > 0 ? 'Increasing' : 'Decreasing' },
      ],
      sections: [
        {
          title: 'Daily Incident Trend',
          type: 'chart',
          data: trends.daily,
        },
        {
          title: 'Weekly Trend',
          type: 'chart',
          data: trends.weekly,
        },
        {
          title: 'Monthly Trend',
          type: 'chart',
          data: trends.monthly,
        },
      ],
      insights: [
        'Long-term trend analysis helps identify seasonal patterns',
        'Use insights to optimize resource allocation and preventive measures',
      ],
      recommendations: [
        'Monitor trends to anticipate peak incident periods',
        'Implement preventive measures during high-incident periods',
      ],
    };
  }

  /**
   * Generate Custom Report
   */
  private static generateCustomReport(definition: ReportDefinition): ReportData {
    return {
      title: definition.name,
      subtitle: definition.description,
      generatedAt: new Date().toISOString(),
      period: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
      summary: [],
      sections: definition.sections.map(section => ({
        title: section.title,
        type: section.type,
        data: section.config,
      })),
      insights: [],
      recommendations: [],
    };
  }

  /**
   * Get generated report by ID
   */
  static getReport(id: string): GeneratedReport | undefined {
    return this.reports.get(id);
  }

  /**
   * Get all generated reports
   */
  static getAllReports(): GeneratedReport[] {
    return Array.from(this.reports.values());
  }

  /**
   * Export report to specified format
   */
  static exportReport(reportId: string, format: ReportFormat): string {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(report.data, null, 2);
      case 'csv':
        return this.convertToCSV(report.data);
      case 'html':
        return this.convertToHTML(report.data);
      default:
        return JSON.stringify(report.data, null, 2);
    }
  }

  // Helper methods

  private static getDateRange(dateRange?: { start: Date; end: Date }): { start: Date; end: Date } {
    if (dateRange) {
      return dateRange;
    }

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  }

  private static calculateNextRunTime(schedule: ReportSchedule): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        next.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
    }

    return next;
  }

  private static calculateTrend(data: { incidents: number }[], key: 'incidents'): number {
    if (data.length < 2) return 0;

    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);

    const recentAvg = recent.reduce((sum, d) => sum + d[key], 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d[key], 0) / previous.length;

    if (previousAvg === 0) return 0;

    return ((recentAvg - previousAvg) / previousAvg) * 100;
  }

  private static formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private static sendReport(report: GeneratedReport, recipients: string[]): void {
    console.log(`[Reporting] Sending report ${report.id} to ${recipients.join(', ')}`);
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
  }

  private static convertToCSV(data: ReportData): string {
    // Simple CSV conversion
    const lines: string[] = [];
    lines.push(`"${data.title}"`);
    lines.push(`"Generated: ${data.generatedAt}"`);
    lines.push('');

    data.summary.forEach(item => {
      lines.push(`"${item.key}","${item.value}"`);
    });

    return lines.join('\n');
  }

  private static convertToHTML(data: ReportData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #2563eb; }
    .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .metric { background: #f3f4f6; padding: 15px; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <p>${data.subtitle}</p>
  <p><small>Generated: ${data.generatedAt}</small></p>

  <h2>Summary</h2>
  <div class="summary">
    ${data.summary.map(item => `<div class="metric"><strong>${item.key}</strong><br/>${item.value}</div>`).join('')}
  </div>

  <h2>Insights</h2>
  <ul>
    ${data.insights.map(insight => `<li>${insight}</li>`).join('')}
  </ul>

  <h2>Recommendations</h2>
  <ul>
    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
  </ul>
</body>
</html>
    `.trim();
  }
}
