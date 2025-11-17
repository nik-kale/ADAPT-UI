# ADAPT-UI Services Documentation

This document provides comprehensive documentation for all services in the ADAPT-UI platform.

## Table of Contents

1. [AI Service](#ai-service) (v3.0)
2. [Runbook Service](#runbook-service) (v4.0)
3. [Webhook Service](#webhook-service) (v4.0)
4. [Analytics Service](#analytics-service) (v4.0)
5. [RBAC Service](#rbac-service) (v5.0)
6. [Audit Service](#audit-service) (v5.0)
7. [Reporting Service](#reporting-service) (v5.0)
8. [Tenant Service](#tenant-service) (v5.0)

---

## AI Service

**Version**: 3.0
**File**: `src/services/AIService.ts`
**Purpose**: AI-powered incident analysis, anomaly detection, and pattern recognition

### Key Features

- **Incident Summarization**: Generate narrative summaries from graph analysis
- **Anomaly Detection**: Multi-dimensional analysis (timing, structural, metric, pattern)
- **Pattern Recognition**: Identify recurring failures, cascades, and bottlenecks
- **Predictive Analytics**: Correlation patterns for proactive prevention

### API

#### `generateIncidentSummary(graph, timeline, insights): AISummary`

Generate a comprehensive AI-powered summary of an incident.

```typescript
const summary = AIService.generateIncidentSummary(
  rcaGraph,
  timelineEvents,
  agentInsights
);

console.log(summary.narrative); // Human-readable summary
console.log(summary.keyFindings); // Main discoveries
console.log(summary.rootCauses); // Identified root causes
console.log(summary.recommendations); // Suggested actions
```

**Returns**: `AISummary`
```typescript
interface AISummary {
  narrative: string;
  keyFindings: string[];
  rootCauses: { nodeId: string; description: string; confidence: number }[];
  affectedComponents: string[];
  impact: string;
  recommendations: string[];
  metadata: {
    analysisTime: number;
    totalNodes: number;
    totalEdges: number;
    criticalPathLength: number;
  };
}
```

#### `detectAnomalies(graph, timeline, historicalData?): Anomaly[]`

Detect anomalies in incident data across multiple dimensions.

```typescript
const anomalies = AIService.detectAnomalies(
  currentGraph,
  timelineEvents,
  historicalGraphs // optional
);

anomalies.forEach(anomaly => {
  console.log(`${anomaly.type}: ${anomaly.description}`);
  console.log(`Severity: ${anomaly.severity}, Confidence: ${anomaly.confidence}`);
});
```

**Anomaly Types**:
- **Timing**: Events too close together, impossible time sequences
- **Structural**: Isolated nodes, circular dependencies, excessive branching
- **Metric**: Low confidence scores, missing metadata
- **Pattern**: Deviations from historical patterns

**Returns**: `Anomaly[]`
```typescript
interface Anomaly {
  id: string;
  type: 'timing' | 'structural' | 'metric' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedNodes: string[];
  confidence: number;
  suggestedAction?: string;
  metadata?: Record<string, unknown>;
}
```

#### `recognizePatterns(currentGraph, historicalGraphs): Pattern[]`

Identify patterns across current and historical incidents.

```typescript
const patterns = AIService.recognizePatterns(currentGraph, historicalGraphs);

patterns.forEach(pattern => {
  console.log(`${pattern.type}: ${pattern.description}`);
  console.log(`Seen ${pattern.occurrences} times`);
});
```

**Pattern Types**:
- **Recurring Failure**: Same failure repeated across incidents
- **Cascade**: A→B→C failure chains
- **Bottleneck**: Nodes with many incoming edges
- **Correlation**: Components that fail together

**Returns**: `Pattern[]`
```typescript
interface Pattern {
  id: string;
  type: 'recurring-failure' | 'cascade' | 'bottleneck' | 'correlation';
  description: string;
  occurrences: number;
  affectedComponents: string[];
  confidence: number;
  examples: string[];
  suggestedPrevention?: string;
}
```

### Best Practices

1. **Historical Data**: Provide historical graphs for better pattern recognition
2. **Regular Analysis**: Run anomaly detection periodically to catch drift
3. **Act on Recommendations**: Implement suggested preventive measures
4. **Review Confidence**: Focus on high-confidence findings first

---

## Runbook Service

**Version**: 4.0
**File**: `src/services/RunbookService.ts`
**Purpose**: Automated remediation execution engine

### Key Features

- Automated step execution with conditional logic
- Support for API calls, scripts, webhooks, notifications
- Retry logic and fallback steps
- Execution tracking and logging
- Default runbooks for common scenarios

### API

#### `createRunbook(runbook): Runbook`

Create a new runbook.

```typescript
const runbook = RunbookService.createRunbook({
  name: 'Restart Service',
  description: 'Restart a failed service',
  trigger: {
    automatic: true,
    conditions: [{ field: 'service.status', operator: 'equals', value: 'failed' }],
  },
  steps: [
    {
      id: 'step-1',
      type: 'automated',
      name: 'Stop Service',
      action: {
        type: 'api-call',
        config: {
          url: 'https://api.example.com/services/{serviceName}/stop',
          method: 'POST',
        },
      },
    },
    {
      id: 'step-2',
      type: 'automated',
      name: 'Start Service',
      action: {
        type: 'api-call',
        config: {
          url: 'https://api.example.com/services/{serviceName}/start',
          method: 'POST',
        },
      },
    },
  ],
  metadata: { category: 'service-management' },
});
```

#### `executeRunbook(runbookId, incidentId, executedBy, context): Promise<RunbookExecution>`

Execute a runbook.

```typescript
const execution = await RunbookService.executeRunbook(
  'runbook-restart-service',
  'incident-123',
  'user-1',
  { serviceName: 'api-gateway' }
);

console.log(`Execution ${execution.id}: ${execution.status}`);
console.log(`Steps: ${execution.steps.length}, Completed: ${execution.completedSteps}`);
```

**Returns**: `RunbookExecution`
```typescript
interface RunbookExecution {
  id: string;
  runbookId: string;
  incidentId: string;
  executedBy: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  steps: RunbookStepExecution[];
  completedSteps: number;
  failedSteps: number;
  context: Record<string, unknown>;
  logs: string[];
}
```

#### Default Runbooks

```typescript
import { DefaultRunbooks } from '@adapt/ui-toolkit';

// Restart Service
const restartRunbook = DefaultRunbooks.restartService;

// Scale Up Service
const scaleUpRunbook = DefaultRunbooks.scaleUp;
```

### Step Types

- **manual**: Requires human action with approval
- **automated**: Executes automatically
- **approval**: Requires approval before proceeding
- **conditional**: Executes based on condition evaluation

### Action Types

- **api-call**: HTTP request to external API
- **script**: Execute a script
- **webhook**: Trigger a webhook
- **notification**: Send notification to users/channels

### Best Practices

1. **Test Runbooks**: Always test runbooks in non-production first
2. **Add Approvals**: Use approval steps for destructive actions
3. **Error Handling**: Include fallback steps for failures
4. **Idempotency**: Ensure runbooks can be safely re-executed
5. **Logging**: Review execution logs to improve runbooks

---

## Webhook Service

**Version**: 4.0
**File**: `src/services/WebhookService.ts`
**Purpose**: Event-driven integration with external systems

### Key Features

- Webhook delivery with exponential backoff retry
- HMAC signature verification
- Event subscriptions
- Pre-built integration templates
- Delivery tracking and statistics

### API

#### `registerWebhook(webhook): Webhook`

Register a new webhook.

```typescript
const webhook = WebhookService.registerWebhook({
  name: 'Slack Incident Notifications',
  url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  events: ['incident.created', 'incident.resolved'],
  headers: { 'Content-Type': 'application/json' },
  secret: 'your-webhook-secret', // For HMAC signature
  enabled: true,
});
```

#### `triggerEvent(event, data): Promise<void>`

Trigger an event to all subscribed webhooks.

```typescript
await WebhookService.triggerEvent('incident.created', {
  id: 'incident-123',
  title: 'API Gateway Timeout',
  severity: 'critical',
  createdAt: new Date().toISOString(),
});
```

#### Webhook Templates

```typescript
import { WebhookTemplates } from '@adapt/ui-toolkit';

// Slack
const slackWebhook = WebhookService.registerWebhook({
  name: 'Slack Notifications',
  url: 'YOUR_SLACK_WEBHOOK_URL',
  events: ['incident.created'],
  ...WebhookTemplates.slack,
});

// Microsoft Teams
const teamsWebhook = WebhookService.registerWebhook({
  name: 'Teams Notifications',
  url: 'YOUR_TEAMS_WEBHOOK_URL',
  events: ['incident.created'],
  ...WebhookTemplates.teams,
});

// JIRA
const jiraWebhook = WebhookService.registerWebhook({
  name: 'JIRA Issue Creation',
  url: 'YOUR_JIRA_API_URL',
  events: ['incident.created'],
  ...WebhookTemplates.jira,
});
```

### Supported Events

**Incident Events**:
- `incident.created`, `incident.updated`, `incident.resolved`, `incident.escalated`

**Graph Events**:
- `graph.analyzed`

**Runbook Events**:
- `runbook.started`, `runbook.completed`, `runbook.failed`

**Collaboration Events**:
- `comment.added`, `annotation.created`

### Retry Logic

Webhooks automatically retry with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 5 seconds delay
- Attempt 4: 15 seconds delay
- Attempt 5: 60 seconds delay
- Attempt 6 (final): 300 seconds (5 minutes) delay

### Best Practices

1. **Use Secrets**: Always configure webhook secrets for verification
2. **Monitor Failures**: Review failed deliveries regularly
3. **Test Webhooks**: Use `testWebhook()` method before going live
4. **Filter Events**: Subscribe only to events you need
5. **Idempotency**: Handle duplicate webhook deliveries gracefully

---

## Analytics Service

**Version**: 4.0
**File**: `src/services/AnalyticsService.ts`
**Purpose**: Incident metrics, MTTR tracking, and trend analysis

### Key Features

- Comprehensive MTTR calculations (MTTD, MTTA, MTTR, MTTC)
- Incident statistics and trends
- Top recurring issues identification
- SLA compliance tracking
- CSV export

### API

#### `recordIncident(incident): IncidentRecord`

Record a new incident for tracking.

```typescript
const incident = AnalyticsService.recordIncident({
  title: 'API Gateway Timeout',
  severity: 'critical',
  status: 'open',
  detectedAt: new Date(),
  tags: ['api', 'timeout'],
  affectedServices: ['api-gateway'],
  impactScore: 95,
});
```

#### `getStatistics(timeRange?): IncidentStatistics`

Get comprehensive incident statistics.

```typescript
const stats = AnalyticsService.getStatistics({
  start: new Date('2024-01-01'),
  end: new Date(),
});

console.log(`Total incidents: ${stats.total}`);
console.log(`MTTR: ${stats.mttrMetrics.mttrHuman}`);
console.log(`SLA compliance: ${stats.mttrMetrics.mttrCompliance}%`);
```

**Returns**: `IncidentStatistics`
```typescript
interface IncidentStatistics {
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
```

#### `calculateMTTR(incidents): MTTRMetrics`

Calculate MTTR metrics for a set of incidents.

```typescript
const mttr = AnalyticsService.calculateMTTR(incidents);

console.log(`MTTD: ${mttr.mttdHuman}`); // Mean Time To Detect
console.log(`MTTA: ${mttr.mttaHuman}`); // Mean Time To Acknowledge
console.log(`MTTR: ${mttr.mttrHuman}`); // Mean Time To Resolve
console.log(`MTTC: ${mttr.mttcHuman}`); // Mean Time To Close
console.log(`MTTR Repair: ${mttr.mttrRepairHuman}`); // Acknowledge → Resolve
```

#### `getTrends(days): IncidentTrends`

Get incident trends over time.

```typescript
const trends = AnalyticsService.getTrends(30);

// Daily trends
trends.daily.forEach(day => {
  console.log(`${day.period}: ${day.incidents} incidents, MTTR: ${day.mttr}ms`);
});

// Weekly trends
trends.weekly.forEach(week => {
  console.log(`Week ${week.period}: ${week.incidents} incidents`);
});
```

#### `getTopIssues(limit): TopIssue[]`

Identify top recurring issues.

```typescript
const topIssues = AnalyticsService.getTopIssues(10);

topIssues.forEach(issue => {
  console.log(`${issue.pattern}: ${issue.occurrences} times`);
  console.log(`Avg resolution: ${issue.avgResolutionTime}ms`);
});
```

### MTTR Metrics Explained

- **MTTD** (Mean Time To Detect): Time from incident occurrence to detection
- **MTTA** (Mean Time To Acknowledge): Time from detection to acknowledgement
- **MTTR** (Mean Time To Resolve): Time from detection to resolution
- **MTTC** (Mean Time To Close): Time from detection to closure
- **MTTR Repair**: Time from acknowledgement to resolution

### Best Practices

1. **Consistent Recording**: Record all incidents for accurate metrics
2. **Timely Updates**: Update incident status promptly
3. **Tag Appropriately**: Use consistent tags for better analysis
4. **Review Trends**: Analyze trends weekly to spot patterns
5. **Act on Insights**: Address recurring issues identified

---

## RBAC Service

**Version**: 5.0
**File**: `src/services/RBACService.ts`
**Purpose**: Role-based access control and permissions management

### Key Features

- 6 predefined system roles
- 40+ granular permissions
- User and team management
- Permission checking APIs
- Resource-level access control

### System Roles

1. **Super Admin**: Full system access (all permissions)
2. **Admin**: Administrative access (no super admin actions)
3. **Incident Manager**: Manages incidents, runbooks, team coordination
4. **Engineer**: Day-to-day incident response
5. **Viewer**: Read-only access
6. **Guest**: Minimal access for external stakeholders

### Permission Types

**Incident**: `incident:view`, `incident:create`, `incident:edit`, `incident:delete`, `incident:assign`, `incident:resolve`

**Graph**: `graph:view`, `graph:analyze`, `graph:export`, `graph:share`

**Runbook**: `runbook:view`, `runbook:create`, `runbook:edit`, `runbook:delete`, `runbook:execute`, `runbook:approve`

**Analytics**: `analytics:view`, `analytics:export`, `analytics:advanced`

**Collaboration**: `collaboration:comment`, `collaboration:annotate`, `collaboration:resolve`, `collaboration:delete-own`, `collaboration:delete-any`

**Admin**: `admin:users`, `admin:roles`, `admin:teams`, `admin:settings`, `admin:integrations`, `admin:audit-logs`

### API

#### `createUser(user): User`

Create a new user.

```typescript
const user = RBACService.createUser({
  email: 'john@example.com',
  name: 'John Doe',
  roleId: engineerRoleId,
  teamIds: [],
  status: 'active',
});
```

#### `hasPermission(userId, permission): boolean`

Check if a user has a specific permission.

```typescript
if (RBACService.hasPermission(userId, 'incident:edit')) {
  // User can edit incidents
}
```

#### `createTeam(team): Team`

Create a new team.

```typescript
const team = RBACService.createTeam({
  name: 'Operations',
  description: 'SRE team',
  memberIds: [],
  tags: ['ops', 'sre'],
});
```

#### `addUserToTeam(userId, teamId): boolean`

Add a user to a team.

```typescript
RBACService.addUserToTeam(userId, teamId);
RBACService.setTeamLeader(teamId, userId);
```

### Best Practices

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Use Teams**: Organize users into teams for easier management
3. **Regular Audits**: Review permissions quarterly
4. **Custom Roles**: Create custom roles for specific needs
5. **Onboarding/Offboarding**: Update user status promptly

---

## Audit Service

**Version**: 5.0
**File**: `src/services/AuditService.ts`
**Purpose**: Compliance logging and security monitoring

### Key Features

- 50+ event types tracked
- Rich metadata capture
- Security monitoring
- Suspicious activity detection
- CSV/JSON export
- Automatic retention management

### Event Types

**Authentication**: `auth.login`, `auth.logout`, `auth.login-failed`

**Incidents**: `incident.created`, `incident.updated`, `incident.resolved`

**Runbooks**: `runbook.executed`, `runbook.execution-failed`

**Security**: `security.permission-denied`, `security.suspicious-activity`

**System**: `system.backup-created`, `system.maintenance-started`

### API

#### `log(event): AuditEvent`

Log an audit event.

```typescript
AuditService.log({
  type: 'incident.created',
  severity: 'info',
  userId: 'user-1',
  userName: 'Alice',
  userEmail: 'alice@example.com',
  resourceType: 'incident',
  resourceId: 'incident-123',
  action: 'created',
  description: 'Created new incident: API Gateway Timeout',
  success: true,
});
```

#### `query(query): AuditEvent[]`

Query audit events.

```typescript
const events = AuditService.query({
  eventTypes: ['incident.created', 'incident.resolved'],
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  userId: 'user-1',
  limit: 100,
});
```

#### `getSecurityEvents(limit): AuditEvent[]`

Get recent security events.

```typescript
const securityEvents = AuditService.getSecurityEvents(50);
securityEvents.forEach(event => {
  console.log(`Security event: ${event.type} - ${event.description}`);
});
```

#### `detectSuspiciousActivity(): { suspiciousUsers, patterns }`

Detect suspicious activity patterns.

```typescript
const { suspiciousUsers, patterns } = AuditService.detectSuspiciousActivity();

console.log('Suspicious users:', suspiciousUsers);
console.log('Patterns detected:', patterns);
```

#### Helper Functions

```typescript
import { AuditHelpers } from '@adapt/ui-toolkit';

// Log authentication
AuditHelpers.logAuth('login', userId, userName, userEmail, ipAddress);

// Log incident action
AuditHelpers.logIncident('created', incidentId, userId, userName);

// Log runbook execution
AuditHelpers.logRunbook('executed', runbookId, userId, userName);

// Log security event
AuditHelpers.logSecurity('permission-denied', userId, userName, 'Attempted to delete incident without permission');
```

### Best Practices

1. **Log Everything**: Audit all critical actions
2. **Rich Context**: Include IP, user agent, session ID
3. **Regular Reviews**: Review security events daily
4. **Export Regularly**: Export audit logs to external storage
5. **Retention Policy**: Define and enforce retention policies
6. **Incident Response**: Use audit logs for incident investigation

---

## Reporting Service

**Version**: 5.0
**File**: `src/services/ReportingService.ts`
**Purpose**: Advanced reporting and scheduled reports

### Report Types

1. **Executive Summary**: High-level overview with MTTR, trends, SLA compliance
2. **Incident Analysis**: Detailed metrics, recurring patterns
3. **Team Performance**: Team metrics, workload distribution
4. **SLA Compliance**: Service level metrics, compliance percentages
5. **Security Audit**: Security events, suspicious activity
6. **Trend Analysis**: Long-term patterns, seasonal trends
7. **Custom Reports**: Flexible report builder

### API

#### `createReportDefinition(definition): ReportDefinition`

Create a report definition.

```typescript
const definition = ReportingService.createReportDefinition({
  name: 'Weekly Executive Summary',
  description: 'Weekly executive summary report',
  type: 'executive-summary',
  format: 'pdf',
  schedule: 'weekly',
  recipients: ['exec@company.com'],
  filters: {
    dateRange: { start: weekStart, end: weekEnd },
  },
  sections: [],
  createdBy: 'user-1',
  enabled: true,
});
```

#### `generateReport(definitionId, generatedBy): Promise<GeneratedReport>`

Generate a report.

```typescript
const report = await ReportingService.generateReport(definition.id, 'user-1');

console.log(`Report generated: ${report.id}`);
console.log(`Format: ${report.format}`);
console.log(`Sections: ${report.data.sections.length}`);
```

#### `exportReport(reportId, format): string`

Export report to specified format.

```typescript
const csvData = ReportingService.exportReport(report.id, 'csv');
const htmlData = ReportingService.exportReport(report.id, 'html');
const jsonData = ReportingService.exportReport(report.id, 'json');
```

### Best Practices

1. **Schedule Wisely**: Don't over-schedule reports
2. **Target Audience**: Customize reports for specific audiences
3. **Action Items**: Include recommendations in all reports
4. **Automate Distribution**: Use email distribution for regular reports
5. **Review Regularly**: Update report definitions based on feedback

---

## Tenant Service

**Version**: 5.0
**File**: `src/services/TenantService.ts`
**Purpose**: Multi-tenancy and billing management

### Pricing Plans

**Free**: $0/month, 3 users, basic features
**Starter**: $99/month + $10/user, 10 users, AI insights
**Professional**: $499/month + $25/user, 50 users, RBAC, SSO
**Enterprise**: $1999/month + $50/user, unlimited, all features

### API

#### `createTenant(tenant): Tenant`

Create a new tenant.

```typescript
const tenant = TenantService.createTenant({
  name: 'Acme Corporation',
  slug: 'acme-corp',
  displayName: 'Acme Corp',
  planId: 'professional',
  status: 'active',
  owner: {
    name: 'John Doe',
    email: 'john@acme.com',
  },
  billing: { /* ... */ },
  settings: { /* ... */ },
});
```

#### `checkLimit(tenantId, limitType): { allowed, current, limit, percentage }`

Check if tenant has reached a limit.

```typescript
const userLimit = TenantService.checkLimit(tenantId, 'maxUsers');

if (!userLimit.allowed) {
  console.log(`Limit reached: ${userLimit.current}/${userLimit.limit} users`);
}
```

#### `hasFeature(tenantId, feature): boolean`

Check if tenant has a feature enabled.

```typescript
if (TenantService.hasFeature(tenantId, 'aiInsights')) {
  // Show AI features
}
```

#### `calculateBill(tenantId): Bill`

Calculate monthly bill for tenant.

```typescript
const bill = TenantService.calculateBill(tenantId);

console.log(`Total: ${bill.currency} ${bill.total}`);
bill.breakdown.forEach(item => {
  console.log(`${item.item}: ${item.amount}`);
});
```

#### `getUsageReport(tenantId): UsageReport`

Get tenant usage report.

```typescript
const usage = TenantService.getUsageReport(tenantId);

usage.limits.forEach(limit => {
  console.log(`${limit.metric}: ${limit.current}/${limit.limit} (${limit.percentage}%)`);
  if (limit.status === 'warning') console.warn('Approaching limit!');
});
```

### Best Practices

1. **Monitor Usage**: Track usage proactively
2. **Warn Before Limits**: Notify tenants at 75% and 90% usage
3. **Grace Periods**: Allow brief overages before enforcement
4. **Upgrade Prompts**: Suggest upgrades when limits approached
5. **Transparent Billing**: Show clear breakdowns of charges

---

## Integration Examples

### Complete Incident Workflow

```typescript
// 1. Record incident
const incident = AnalyticsService.recordIncident({
  title: 'API Gateway Timeout',
  severity: 'critical',
  status: 'open',
  detectedAt: new Date(),
  tags: ['api', 'timeout'],
  affectedServices: ['api-gateway'],
  impactScore: 95,
});

// 2. Audit log
AuditHelpers.logIncident('created', incident.id, userId, userName);

// 3. Trigger webhooks
await WebhookService.triggerEvent('incident.created', incident);

// 4. Execute runbook
const execution = await RunbookService.executeRunbook(
  'runbook-restart-service',
  incident.id,
  userId,
  { serviceName: 'api-gateway' }
);

// 5. AI analysis
const summary = AIService.generateIncidentSummary(graph, timeline, insights);
const anomalies = AIService.detectAnomalies(graph, timeline);

// 6. Update incident
AnalyticsService.updateIncident(incident.id, {
  status: 'resolved',
  resolvedAt: new Date(),
  rootCause: summary.rootCauses[0]?.description,
});

// 7. Generate report
const report = await ReportingService.generateReport('weekly-summary', userId);
```

### Enterprise Security Workflow

```typescript
// 1. User attempts action
const canEdit = RBACService.hasPermission(userId, 'incident:edit');

if (!canEdit) {
  // 2. Log permission denial
  AuditHelpers.logSecurity(
    'permission-denied',
    userId,
    userName,
    'Attempted to edit incident without permission'
  );

  // 3. Check for suspicious activity
  const { suspiciousUsers, patterns } = AuditService.detectSuspiciousActivity();

  if (suspiciousUsers.includes(userName)) {
    // 4. Alert security team
    await WebhookService.triggerEvent('security.suspicious-activity', {
      userId,
      userName,
      patterns,
    });
  }

  return; // Deny action
}

// Action allowed, log it
AuditService.log({
  type: 'incident.updated',
  severity: 'info',
  userId,
  userName,
  resourceType: 'incident',
  resourceId: incidentId,
  action: 'updated',
  description: `Updated incident ${incidentId}`,
  before: oldState,
  after: newState,
  success: true,
});
```

---

For more information, see the [API Reference](api-reference.md) or the individual service source files.
