/**
 * Audit Logging Service
 * Provides: Comprehensive activity logging, compliance, security monitoring
 */

import { logger } from '../utils/logger';

export type AuditEventType =
  // Authentication events
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login-failed'
  | 'auth.password-reset'
  | 'auth.mfa-enabled'
  | 'auth.mfa-disabled'
  // User management
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.reactivated'
  | 'user.role-changed'
  // Team management
  | 'team.created'
  | 'team.updated'
  | 'team.deleted'
  | 'team.member-added'
  | 'team.member-removed'
  | 'team.leader-changed'
  // Incident events
  | 'incident.created'
  | 'incident.viewed'
  | 'incident.updated'
  | 'incident.deleted'
  | 'incident.assigned'
  | 'incident.resolved'
  | 'incident.reopened'
  | 'incident.escalated'
  | 'incident.exported'
  // Graph events
  | 'graph.analyzed'
  | 'graph.exported'
  | 'graph.shared'
  // Runbook events
  | 'runbook.created'
  | 'runbook.updated'
  | 'runbook.deleted'
  | 'runbook.executed'
  | 'runbook.approved'
  | 'runbook.execution-failed'
  // Webhook events
  | 'webhook.created'
  | 'webhook.updated'
  | 'webhook.deleted'
  | 'webhook.triggered'
  | 'webhook.delivery-failed'
  // Analytics events
  | 'analytics.report-generated'
  | 'analytics.data-exported'
  // Collaboration events
  | 'collaboration.comment-added'
  | 'collaboration.comment-deleted'
  | 'collaboration.annotation-created'
  | 'collaboration.annotation-deleted'
  // Settings & configuration
  | 'settings.updated'
  | 'integration.configured'
  | 'integration.removed'
  // Security events
  | 'security.permission-denied'
  | 'security.suspicious-activity'
  | 'security.data-breach-attempt'
  // System events
  | 'system.backup-created'
  | 'system.backup-restored'
  | 'system.maintenance-started'
  | 'system.maintenance-completed';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  before?: unknown; // State before the change
  after?: unknown; // State after the change
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  tenantId?: string; // For multi-tenancy
}

export interface AuditQuery {
  eventTypes?: AuditEventType[];
  severity?: AuditSeverity[];
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  search?: string; // Search in description
  limit?: number;
  offset?: number;
}

export interface AuditStatistics {
  totalEvents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byUser: Record<string, number>;
  failedEvents: number;
  securityEvents: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export class AuditService {
  private static events: AuditEvent[] = [];
  private static maxEvents = 100000; // Keep last 100k events in memory
  private static retentionDays = 90; // Auto-delete events older than 90 days

  /**
   * Log an audit event
   */
  static log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const auditEvent: AuditEvent = {
      ...event,
      id,
      timestamp: new Date(),
    };

    this.events.push(auditEvent);

    // Trim old events if we exceed max
    if (this.events.length > this.maxEvents) {
      const removeCount = this.events.length - this.maxEvents;
      this.events.splice(0, removeCount);
      logger.info('Audit events trimmed', {
        component: 'AuditService',
        action: 'trimEvents',
        removedCount: removeCount
      });
    }

    // Log to console based on severity
    const logLevel = {
      info: 'log',
      warning: 'warn',
      error: 'error',
      critical: 'error',
    }[event.severity];

    console[logLevel as 'log' | 'warn' | 'error'](
      `[Audit:${event.type}] ${event.description}`,
      event.success ? '✓' : '✗'
    );

    // In production, also send to external logging service
    this.sendToExternalLogger(auditEvent);

    return auditEvent;
  }

  /**
   * Query audit events
   */
  static query(query: AuditQuery = {}): AuditEvent[] {
    let results = [...this.events];

    // Filter by event types
    if (query.eventTypes && query.eventTypes.length > 0) {
      results = results.filter(e => query.eventTypes!.includes(e.type));
    }

    // Filter by severity
    if (query.severity && query.severity.length > 0) {
      results = results.filter(e => query.severity!.includes(e.severity));
    }

    // Filter by user ID
    if (query.userId) {
      results = results.filter(e => e.userId === query.userId);
    }

    // Filter by resource
    if (query.resourceType) {
      results = results.filter(e => e.resourceType === query.resourceType);
    }

    if (query.resourceId) {
      results = results.filter(e => e.resourceId === query.resourceId);
    }

    // Filter by date range
    if (query.startDate) {
      results = results.filter(e => e.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter(e => e.timestamp <= query.endDate!);
    }

    // Filter by success status
    if (query.success !== undefined) {
      results = results.filter(e => e.success === query.success);
    }

    // Search in description
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        e =>
          e.description.toLowerCase().includes(searchLower) ||
          e.action.toLowerCase().includes(searchLower) ||
          e.userName?.toLowerCase().includes(searchLower) ||
          e.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    results = results.slice(offset, offset + limit);

    return results;
  }

  /**
   * Get audit statistics
   */
  static getStatistics(startDate?: Date, endDate?: Date): AuditStatistics {
    let events = this.events;

    if (startDate) {
      events = events.filter(e => e.timestamp >= startDate);
    }

    if (endDate) {
      events = events.filter(e => e.timestamp <= endDate);
    }

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    let failedEvents = 0;
    let securityEvents = 0;

    events.forEach(event => {
      // Count by type
      byType[event.type] = (byType[event.type] || 0) + 1;

      // Count by severity
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;

      // Count by user
      if (event.userName) {
        byUser[event.userName] = (byUser[event.userName] || 0) + 1;
      }

      // Count failures
      if (!event.success) {
        failedEvents++;
      }

      // Count security events
      if (event.type.startsWith('security.') || event.type.startsWith('auth.')) {
        securityEvents++;
      }
    });

    return {
      totalEvents: events.length,
      byType,
      bySeverity,
      byUser,
      failedEvents,
      securityEvents,
      timeRange: {
        start: startDate || (events.length > 0 ? events[events.length - 1].timestamp : new Date()),
        end: endDate || (events.length > 0 ? events[0].timestamp : new Date()),
      },
    };
  }

  /**
   * Get recent activity for a user
   */
  static getUserActivity(userId: string, limit: number = 50): AuditEvent[] {
    return this.query({ userId, limit });
  }

  /**
   * Get recent activity for a resource
   */
  static getResourceActivity(resourceType: string, resourceId: string, limit: number = 50): AuditEvent[] {
    return this.query({ resourceType, resourceId, limit });
  }

  /**
   * Get security events
   */
  static getSecurityEvents(limit: number = 100): AuditEvent[] {
    const securityTypes: AuditEventType[] = [
      'auth.login-failed',
      'security.permission-denied',
      'security.suspicious-activity',
      'security.data-breach-attempt',
    ];

    return this.query({ eventTypes: securityTypes, limit });
  }

  /**
   * Get failed events
   */
  static getFailedEvents(limit: number = 100): AuditEvent[] {
    return this.query({ success: false, limit });
  }

  /**
   * Export audit log to CSV
   */
  static exportToCSV(query: AuditQuery = {}): string {
    const events = this.query({ ...query, limit: undefined });

    const headers = [
      'ID',
      'Timestamp',
      'Type',
      'Severity',
      'User',
      'Email',
      'Role',
      'IP Address',
      'Action',
      'Description',
      'Resource Type',
      'Resource ID',
      'Success',
      'Error',
    ];

    const rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.type,
      event.severity,
      event.userName || '',
      event.userEmail || '',
      event.userRole || '',
      event.ipAddress || '',
      event.action,
      `"${event.description.replace(/"/g, '""')}"`,
      event.resourceType || '',
      event.resourceId || '',
      event.success ? 'true' : 'false',
      event.errorMessage ? `"${event.errorMessage.replace(/"/g, '""')}"` : '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Export audit log to JSON
   */
  static exportToJSON(query: AuditQuery = {}): string {
    const events = this.query({ ...query, limit: undefined });
    return JSON.stringify(events, null, 2);
  }

  /**
   * Clean up old events (called periodically)
   */
  static cleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const initialCount = this.events.length;
    this.events = this.events.filter(e => e.timestamp >= cutoffDate);
    const removedCount = initialCount - this.events.length;

    if (removedCount > 0) {
      logger.info('Audit events cleaned up', {
        component: 'AuditService',
        action: 'cleanupOldEvents',
        removedCount,
        retentionDays: this.retentionDays
      });
    }
  }

  /**
   * Send to external logging service (placeholder for production)
   */
  private static sendToExternalLogger(event: AuditEvent): void {
    // In production, send to:
    // - Elasticsearch/OpenSearch
    // - Splunk
    // - Datadog
    // - AWS CloudWatch
    // - Google Cloud Logging
    // - Azure Monitor

    // For now, just a placeholder
    if (event.severity === 'critical') {
      logger.error('Critical audit event detected', undefined, {
        component: 'AuditService',
        action: 'logEvent',
        eventType: event.type,
        eventId: event.id,
        severity: event.severity
      });
    }
  }

  /**
   * Detect suspicious patterns (for security monitoring)
   */
  static detectSuspiciousActivity(): {
    suspiciousUsers: string[];
    patterns: string[];
  } {
    const recentEvents = this.query({ limit: 1000 });
    const suspiciousUsers: string[] = [];
    const patterns: string[] = [];

    // Pattern 1: Multiple failed login attempts
    const failedLogins = recentEvents.filter(e => e.type === 'auth.login-failed');
    const failedLoginsByUser: Record<string, number> = {};

    failedLogins.forEach(event => {
      if (event.userEmail) {
        failedLoginsByUser[event.userEmail] = (failedLoginsByUser[event.userEmail] || 0) + 1;
      }
    });

    Object.entries(failedLoginsByUser).forEach(([email, count]) => {
      if (count >= 5) {
        suspiciousUsers.push(email);
        patterns.push(`Multiple failed login attempts for ${email} (${count} times)`);
      }
    });

    // Pattern 2: Multiple permission denied events
    const deniedEvents = recentEvents.filter(e => e.type === 'security.permission-denied');
    const deniedByUser: Record<string, number> = {};

    deniedEvents.forEach(event => {
      if (event.userId) {
        deniedByUser[event.userId] = (deniedByUser[event.userId] || 0) + 1;
      }
    });

    Object.entries(deniedByUser).forEach(([userId, count]) => {
      if (count >= 10) {
        const user = recentEvents.find(e => e.userId === userId);
        if (user?.userName && !suspiciousUsers.includes(user.userName)) {
          suspiciousUsers.push(user.userName);
        }
        patterns.push(`Excessive permission denied for user ${userId} (${count} times)`);
      }
    });

    // Pattern 3: Unusual activity hours
    const nightActivity = recentEvents.filter(e => {
      const hour = e.timestamp.getHours();
      return hour >= 0 && hour < 6; // Midnight to 6 AM
    });

    if (nightActivity.length > 50) {
      patterns.push(`Unusual activity during off-hours (${nightActivity.length} events)`);
    }

    return { suspiciousUsers: [...new Set(suspiciousUsers)], patterns };
  }
}

// Helper functions for common audit logging scenarios

export const AuditHelpers = {
  /**
   * Log user authentication
   */
  logAuth(
    type: 'login' | 'logout' | 'login-failed',
    userId: string,
    userName: string,
    userEmail: string,
    ipAddress?: string
  ): void {
    AuditService.log({
      type: `auth.${type}` as AuditEventType,
      severity: type === 'login-failed' ? 'warning' : 'info',
      userId,
      userName,
      userEmail,
      ipAddress,
      action: type,
      description: `User ${userName} ${type.replace('-', ' ')}`,
      success: type !== 'login-failed',
    });
  },

  /**
   * Log incident action
   */
  logIncident(
    action: 'created' | 'updated' | 'deleted' | 'assigned' | 'resolved' | 'escalated',
    incidentId: string,
    userId: string,
    userName: string,
    details?: string
  ): void {
    AuditService.log({
      type: `incident.${action}` as AuditEventType,
      severity: 'info',
      userId,
      userName,
      resourceType: 'incident',
      resourceId: incidentId,
      action,
      description: details || `Incident ${action} by ${userName}`,
      success: true,
    });
  },

  /**
   * Log runbook execution
   */
  logRunbook(
    action: 'executed' | 'execution-failed',
    runbookId: string,
    userId: string,
    userName: string,
    error?: string
  ): void {
    AuditService.log({
      type: `runbook.${action}` as AuditEventType,
      severity: action === 'execution-failed' ? 'error' : 'info',
      userId,
      userName,
      resourceType: 'runbook',
      resourceId: runbookId,
      action,
      description: `Runbook ${runbookId} ${action} by ${userName}`,
      success: action !== 'execution-failed',
      errorMessage: error,
    });
  },

  /**
   * Log security event
   */
  logSecurity(
    type: 'permission-denied' | 'suspicious-activity' | 'data-breach-attempt',
    userId: string,
    userName: string,
    details: string,
    metadata?: Record<string, unknown>
  ): void {
    AuditService.log({
      type: `security.${type}` as AuditEventType,
      severity: type === 'data-breach-attempt' ? 'critical' : 'warning',
      userId,
      userName,
      action: type,
      description: details,
      metadata,
      success: false,
    });
  },
};

// Schedule periodic cleanup (every 24 hours)
if (typeof window !== 'undefined') {
  setInterval(() => {
    AuditService.cleanup();
  }, 24 * 60 * 60 * 1000);

  // Create some sample audit events for demonstration
  AuditService.log({
    type: 'auth.login',
    severity: 'info',
    userId: 'user-1',
    userName: 'Alice Admin',
    userEmail: 'admin@example.com',
    ipAddress: '192.168.1.1',
    action: 'login',
    description: 'User Alice Admin logged in successfully',
    success: true,
  });

  AuditService.log({
    type: 'incident.created',
    severity: 'info',
    userId: 'user-2',
    userName: 'Bob Engineer',
    userEmail: 'bob@example.com',
    resourceType: 'incident',
    resourceId: 'incident-123',
    action: 'created',
    description: 'New incident created: API Gateway Timeout',
    success: true,
  });

  AuditService.log({
    type: 'runbook.executed',
    severity: 'info',
    userId: 'user-2',
    userName: 'Bob Engineer',
    resourceType: 'runbook',
    resourceId: 'runbook-restart-service',
    action: 'executed',
    description: 'Runbook "Restart Service" executed successfully',
    success: true,
  });

  logger.info('Sample audit events created', {
    component: 'AuditService',
    action: 'createSampleEvents'
  });
}
