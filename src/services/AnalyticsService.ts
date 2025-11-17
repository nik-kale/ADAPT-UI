/**
 * Analytics Service for Incident Metrics and MTTR Tracking
 * Provides: MTTR calculation, incident statistics, trend analysis
 */

import { RCAGraph, AgentInsight, TimelineEvent } from '@types/index';
import { RunbookExecution } from './RunbookService';

export interface IncidentRecord {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  assignedTo?: string;
  tags: string[];
  rootCause?: string;
  graph?: RCAGraph;
  insights?: AgentInsight[];
  timeline?: TimelineEvent[];
  runbookExecutions?: RunbookExecution[];
  affectedServices: string[];
  impactScore: number; // 0-100
}

export interface MTTRMetrics {
  // Mean Time To Detect (time from incident occurrence to detection)
  mttd: number; // milliseconds
  mttdHuman: string;

  // Mean Time To Acknowledge (time from detection to acknowledgement)
  mtta: number; // milliseconds
  mttaHuman: string;

  // Mean Time To Resolve (time from detection to resolution)
  mttr: number; // milliseconds
  mttrHuman: string;

  // Mean Time To Close (time from detection to closure)
  mttc: number; // milliseconds
  mttcHuman: string;

  // Mean Time To Repair (time from acknowledgement to resolution)
  mttrRepair: number; // milliseconds
  mttrRepairHuman: string;
}

export interface IncidentStatistics {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  closed: number;
  bySeverity: Record<string, number>;
  byTag: Record<string, number>;
  byAssignee: Record<string, number>;
  byService: Record<string, number>;
  averageImpactScore: number;
  mttrMetrics: MTTRMetrics;
}

export interface TrendData {
  period: string; // ISO date string
  incidents: number;
  resolved: number;
  mttr: number;
  averageSeverity: number;
}

export interface IncidentTrends {
  daily: TrendData[];
  weekly: TrendData[];
  monthly: TrendData[];
}

export interface TopIssue {
  pattern: string;
  occurrences: number;
  lastSeen: Date;
  avgResolutionTime: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export class AnalyticsService {
  private static incidents: Map<string, IncidentRecord> = new Map();

  /**
   * Record a new incident
   */
  static recordIncident(incident: Omit<IncidentRecord, 'id' | 'createdAt'>): IncidentRecord {
    const id = `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newIncident: IncidentRecord = {
      ...incident,
      id,
      createdAt: new Date(),
    };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  /**
   * Update an existing incident
   */
  static updateIncident(id: string, updates: Partial<IncidentRecord>): IncidentRecord | null {
    const incident = this.incidents.get(id);
    if (!incident) {
      return null;
    }

    const updatedIncident: IncidentRecord = {
      ...incident,
      ...updates,
    };

    // Auto-set timestamps based on status changes
    if (updates.status === 'investigating' && !incident.acknowledgedAt) {
      updatedIncident.acknowledgedAt = new Date();
    }
    if (updates.status === 'resolved' && !incident.resolvedAt) {
      updatedIncident.resolvedAt = new Date();
    }
    if (updates.status === 'closed' && !incident.closedAt) {
      updatedIncident.closedAt = new Date();
    }

    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  /**
   * Get incident by ID
   */
  static getIncident(id: string): IncidentRecord | undefined {
    return this.incidents.get(id);
  }

  /**
   * Get all incidents
   */
  static getAllIncidents(): IncidentRecord[] {
    return Array.from(this.incidents.values());
  }

  /**
   * Calculate MTTR metrics for a set of incidents
   */
  static calculateMTTR(incidents: IncidentRecord[]): MTTRMetrics {
    const resolvedIncidents = incidents.filter(i => i.resolvedAt);

    if (resolvedIncidents.length === 0) {
      return {
        mttd: 0,
        mttdHuman: '0h 0m',
        mtta: 0,
        mttaHuman: '0h 0m',
        mttr: 0,
        mttrHuman: '0h 0m',
        mttc: 0,
        mttcHuman: '0h 0m',
        mttrRepair: 0,
        mttrRepairHuman: '0h 0m',
      };
    }

    // MTTD - Mean Time To Detect
    const detectionTimes = incidents
      .filter(i => i.detectedAt)
      .map(i => i.detectedAt.getTime() - i.createdAt.getTime());
    const mttd = detectionTimes.length > 0 ? detectionTimes.reduce((a, b) => a + b, 0) / detectionTimes.length : 0;

    // MTTA - Mean Time To Acknowledge
    const acknowledgementTimes = incidents
      .filter(i => i.acknowledgedAt && i.detectedAt)
      .map(i => i.acknowledgedAt!.getTime() - i.detectedAt.getTime());
    const mtta =
      acknowledgementTimes.length > 0
        ? acknowledgementTimes.reduce((a, b) => a + b, 0) / acknowledgementTimes.length
        : 0;

    // MTTR - Mean Time To Resolve
    const resolutionTimes = resolvedIncidents
      .filter(i => i.resolvedAt && i.detectedAt)
      .map(i => i.resolvedAt!.getTime() - i.detectedAt.getTime());
    const mttr = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;

    // MTTC - Mean Time To Close
    const closureTimes = incidents
      .filter(i => i.closedAt && i.detectedAt)
      .map(i => i.closedAt!.getTime() - i.detectedAt.getTime());
    const mttc = closureTimes.length > 0 ? closureTimes.reduce((a, b) => a + b, 0) / closureTimes.length : 0;

    // MTTR (Repair) - Mean Time To Repair (from acknowledgement to resolution)
    const repairTimes = resolvedIncidents
      .filter(i => i.resolvedAt && i.acknowledgedAt)
      .map(i => i.resolvedAt!.getTime() - i.acknowledgedAt!.getTime());
    const mttrRepair = repairTimes.length > 0 ? repairTimes.reduce((a, b) => a + b, 0) / repairTimes.length : 0;

    return {
      mttd,
      mttdHuman: this.formatDuration(mttd),
      mtta,
      mttaHuman: this.formatDuration(mtta),
      mttr,
      mttrHuman: this.formatDuration(mttr),
      mttc,
      mttcHuman: this.formatDuration(mttc),
      mttrRepair,
      mttrRepairHuman: this.formatDuration(mttrRepair),
    };
  }

  /**
   * Get comprehensive incident statistics
   */
  static getStatistics(timeRange?: { start: Date; end: Date }): IncidentStatistics {
    let incidents = this.getAllIncidents();

    // Filter by time range if specified
    if (timeRange) {
      incidents = incidents.filter(
        i => i.createdAt >= timeRange.start && i.createdAt <= timeRange.end
      );
    }

    const bySeverity: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    const byAssignee: Record<string, number> = {};
    const byService: Record<string, number> = {};

    let totalImpact = 0;

    incidents.forEach(incident => {
      // Count by severity
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;

      // Count by tags
      incident.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });

      // Count by assignee
      if (incident.assignedTo) {
        byAssignee[incident.assignedTo] = (byAssignee[incident.assignedTo] || 0) + 1;
      }

      // Count by service
      incident.affectedServices.forEach(service => {
        byService[service] = (byService[service] || 0) + 1;
      });

      totalImpact += incident.impactScore;
    });

    return {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'open').length,
      investigating: incidents.filter(i => i.status === 'investigating').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
      closed: incidents.filter(i => i.status === 'closed').length,
      bySeverity,
      byTag,
      byAssignee,
      byService,
      averageImpactScore: incidents.length > 0 ? totalImpact / incidents.length : 0,
      mttrMetrics: this.calculateMTTR(incidents),
    };
  }

  /**
   * Get incident trends over time
   */
  static getTrends(days: number = 30): IncidentTrends {
    const now = new Date();
    const incidents = this.getAllIncidents();

    // Daily trends
    const daily: TrendData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayIncidents = incidents.filter(
        inc => inc.createdAt >= date && inc.createdAt < nextDate
      );

      const resolved = dayIncidents.filter(i => i.status === 'resolved' || i.status === 'closed');
      const severityScore = dayIncidents.reduce((sum, inc) => {
        const score = { critical: 4, high: 3, medium: 2, low: 1 }[inc.severity] || 0;
        return sum + score;
      }, 0);

      daily.unshift({
        period: date.toISOString().split('T')[0],
        incidents: dayIncidents.length,
        resolved: resolved.length,
        mttr: this.calculateMTTR(dayIncidents).mttr,
        averageSeverity: dayIncidents.length > 0 ? severityScore / dayIncidents.length : 0,
      });
    }

    // Weekly trends (last 12 weeks)
    const weekly: TrendData[] = [];
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekIncidents = incidents.filter(
        inc => inc.createdAt >= weekStart && inc.createdAt < weekEnd
      );

      const resolved = weekIncidents.filter(i => i.status === 'resolved' || i.status === 'closed');
      const severityScore = weekIncidents.reduce((sum, inc) => {
        const score = { critical: 4, high: 3, medium: 2, low: 1 }[inc.severity] || 0;
        return sum + score;
      }, 0);

      weekly.unshift({
        period: weekStart.toISOString().split('T')[0],
        incidents: weekIncidents.length,
        resolved: resolved.length,
        mttr: this.calculateMTTR(weekIncidents).mttr,
        averageSeverity: weekIncidents.length > 0 ? severityScore / weekIncidents.length : 0,
      });
    }

    // Monthly trends (last 12 months)
    const monthly: TrendData[] = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthIncidents = incidents.filter(
        inc => inc.createdAt >= monthStart && inc.createdAt < monthEnd
      );

      const resolved = monthIncidents.filter(i => i.status === 'resolved' || i.status === 'closed');
      const severityScore = monthIncidents.reduce((sum, inc) => {
        const score = { critical: 4, high: 3, medium: 2, low: 1 }[inc.severity] || 0;
        return sum + score;
      }, 0);

      monthly.unshift({
        period: monthStart.toISOString().split('T')[0],
        incidents: monthIncidents.length,
        resolved: resolved.length,
        mttr: this.calculateMTTR(monthIncidents).mttr,
        averageSeverity: monthIncidents.length > 0 ? severityScore / monthIncidents.length : 0,
      });
    }

    return { daily, weekly, monthly };
  }

  /**
   * Identify top recurring issues
   */
  static getTopIssues(limit: number = 10): TopIssue[] {
    const incidents = this.getAllIncidents();
    const patternMap = new Map<string, IncidentRecord[]>();

    // Group incidents by root cause pattern
    incidents.forEach(incident => {
      if (incident.rootCause) {
        const pattern = this.normalizePattern(incident.rootCause);
        const existing = patternMap.get(pattern) || [];
        existing.push(incident);
        patternMap.set(pattern, existing);
      }
    });

    // Convert to TopIssue array
    const topIssues: TopIssue[] = Array.from(patternMap.entries()).map(([pattern, incidents]) => {
      const resolvedIncidents = incidents.filter(i => i.resolvedAt);
      const resolutionTimes = resolvedIncidents.map(i =>
        i.resolvedAt && i.detectedAt ? i.resolvedAt.getTime() - i.detectedAt.getTime() : 0
      );
      const avgResolutionTime =
        resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;

      const latestIncident = incidents.reduce((latest, current) =>
        current.createdAt > latest.createdAt ? current : latest
      );

      const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      incidents.forEach(i => severityCounts[i.severity]++);
      const dominantSeverity = (Object.entries(severityCounts).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0] as 'critical' | 'high' | 'medium' | 'low');

      return {
        pattern,
        occurrences: incidents.length,
        lastSeen: latestIncident.createdAt,
        avgResolutionTime,
        severity: dominantSeverity,
      };
    });

    // Sort by occurrences (descending) and return top N
    return topIssues.sort((a, b) => b.occurrences - a.occurrences).slice(0, limit);
  }

  /**
   * Get incidents by filter criteria
   */
  static getIncidentsByFilter(filter: {
    status?: IncidentRecord['status'][];
    severity?: IncidentRecord['severity'][];
    assignedTo?: string;
    tags?: string[];
    services?: string[];
    dateRange?: { start: Date; end: Date };
  }): IncidentRecord[] {
    let incidents = this.getAllIncidents();

    if (filter.status) {
      incidents = incidents.filter(i => filter.status!.includes(i.status));
    }

    if (filter.severity) {
      incidents = incidents.filter(i => filter.severity!.includes(i.severity));
    }

    if (filter.assignedTo) {
      incidents = incidents.filter(i => i.assignedTo === filter.assignedTo);
    }

    if (filter.tags && filter.tags.length > 0) {
      incidents = incidents.filter(i =>
        filter.tags!.some(tag => i.tags.includes(tag))
      );
    }

    if (filter.services && filter.services.length > 0) {
      incidents = incidents.filter(i =>
        filter.services!.some(service => i.affectedServices.includes(service))
      );
    }

    if (filter.dateRange) {
      incidents = incidents.filter(
        i => i.createdAt >= filter.dateRange!.start && i.createdAt <= filter.dateRange!.end
      );
    }

    return incidents;
  }

  /**
   * Get SLA compliance metrics
   */
  static getSLACompliance(slaTargets: {
    mttd?: number; // milliseconds
    mtta?: number;
    mttr?: number;
  }): {
    mttdCompliance: number; // percentage 0-100
    mttaCompliance: number;
    mttrCompliance: number;
    overallCompliance: number;
  } {
    const incidents = this.getAllIncidents();
    const mttrMetrics = this.calculateMTTR(incidents);

    const mttdCompliance = slaTargets.mttd
      ? Math.min(100, (slaTargets.mttd / (mttrMetrics.mttd || 1)) * 100)
      : 100;
    const mttaCompliance = slaTargets.mtta
      ? Math.min(100, (slaTargets.mtta / (mttrMetrics.mtta || 1)) * 100)
      : 100;
    const mttrCompliance = slaTargets.mttr
      ? Math.min(100, (slaTargets.mttr / (mttrMetrics.mttr || 1)) * 100)
      : 100;

    const overallCompliance = (mttdCompliance + mttaCompliance + mttrCompliance) / 3;

    return {
      mttdCompliance,
      mttaCompliance,
      mttrCompliance,
      overallCompliance,
    };
  }

  // Private helpers

  private static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private static normalizePattern(rootCause: string): string {
    // Normalize root cause to identify patterns
    // Remove timestamps, IDs, specific values
    return rootCause
      .toLowerCase()
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID') // Replace UUIDs
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, 'IP') // Replace IPs
      .trim();
  }

  /**
   * Export statistics to CSV
   */
  static exportToCSV(incidents: IncidentRecord[]): string {
    const headers = [
      'ID',
      'Title',
      'Severity',
      'Status',
      'Created',
      'Detected',
      'Acknowledged',
      'Resolved',
      'Closed',
      'Assigned To',
      'Tags',
      'Root Cause',
      'Affected Services',
      'Impact Score',
      'MTTR (hours)',
    ];

    const rows = incidents.map(inc => {
      const mttr =
        inc.resolvedAt && inc.detectedAt
          ? (inc.resolvedAt.getTime() - inc.detectedAt.getTime()) / (1000 * 60 * 60)
          : '';

      return [
        inc.id,
        `"${inc.title}"`,
        inc.severity,
        inc.status,
        inc.createdAt.toISOString(),
        inc.detectedAt.toISOString(),
        inc.acknowledgedAt?.toISOString() || '',
        inc.resolvedAt?.toISOString() || '',
        inc.closedAt?.toISOString() || '',
        inc.assignedTo || '',
        `"${inc.tags.join(', ')}"`,
        `"${inc.rootCause || ''}"`,
        `"${inc.affectedServices.join(', ')}"`,
        inc.impactScore,
        mttr,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

// Initialize with sample data for demo
if (typeof window !== 'undefined') {
  // Sample incidents for demonstration
  const sampleIncidents: Omit<IncidentRecord, 'id' | 'createdAt'>[] = [
    {
      title: 'API Gateway Timeout',
      severity: 'critical',
      status: 'resolved',
      detectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      tags: ['api', 'timeout', 'gateway'],
      rootCause: 'Database connection pool exhausted',
      affectedServices: ['api-gateway', 'user-service'],
      impactScore: 95,
    },
    {
      title: 'Memory Leak in Payment Service',
      severity: 'high',
      status: 'resolved',
      detectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      tags: ['memory', 'leak', 'payment'],
      rootCause: 'Unclosed HTTP connections',
      affectedServices: ['payment-service'],
      impactScore: 75,
    },
    {
      title: 'Database Query Performance Degradation',
      severity: 'medium',
      status: 'investigating',
      detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      tags: ['database', 'performance'],
      affectedServices: ['order-service', 'inventory-service'],
      impactScore: 60,
    },
  ];

  sampleIncidents.forEach(inc => AnalyticsService.recordIncident(inc));
}
