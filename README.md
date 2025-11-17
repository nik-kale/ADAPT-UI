# ADAPT-UI: Enterprise RCA Platform with AI-Powered Incident Management

> A comprehensive enterprise-grade platform for AI-driven root-cause analysis, incident management, collaboration, automation, and analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Version](https://img.shields.io/badge/Version-5.0-green)](https://github.com/adapt-ui/releases)

## 📖 Overview

ADAPT-UI is an enterprise-grade platform that combines AI-driven root-cause analysis with comprehensive incident management, team collaboration, intelligent automation, and advanced analytics. The platform provides everything needed to detect, diagnose, remediate, and prevent incidents at scale.

### 🌟 Platform Capabilities

**Core RCA Features (v1.0)**
- **🔍 Interactive RCA Graphs** - Causal analysis with automatic layout, pan/zoom, minimap navigation
- **⏱️ Smart Timeline** - Correlated anomalies, alerts, changes with advanced filtering
- **💬 AI Chat Interface** - Natural language diagnostic conversations with context awareness
- **💡 Real-time Insights** - Live agent analysis with virtual scrolling for performance
- **🔧 Remediation Plans** - Step-by-step remediation with execution tracking
- **🎨 Embeddable Widgets** - Drop-in components for any web application
- **♿ Accessibility** - WCAG compliant with keyboard navigation, screen reader support
- **🔄 Undo/Redo** - History management for graph and workflow operations
- **🔍 Fuzzy Search** - Forgiving search across all entities
- **📱 Touch Support** - Full gesture support for mobile/tablet devices
- **🖨️ Export** - Copy, print, and export capabilities

**Collaboration Features (v2.0)**
- **💬 Threaded Comments** - Rich discussions on any incident component (nodes, edges, insights)
- **📝 Annotations** - Collaborative notes and highlights
- **👥 Real-time Presence** - See who's viewing and working on incidents
- **📋 Activity Feed** - Track all team actions and updates
- **🎯 Mentions** - Tag team members in discussions
- **👍 Reactions** - Quick emoji responses to comments
- **✅ Resolve Threads** - Mark discussions as resolved

**AI & Machine Learning (v3.0)**
- **🤖 AI Incident Summaries** - Automated narrative generation from graph analysis
- **📊 Anomaly Detection** - Multi-dimensional analysis (timing, structural, metric, pattern)
- **🔄 Pattern Recognition** - Identify recurring failures, cascades, and bottlenecks
- **📈 Predictive Analytics** - Correlation patterns for proactive prevention
- **🧠 Historical Learning** - Learn from past incidents to improve future diagnosis

**Automation & Integrations (v4.0)**
- **⚙️ Runbook Engine** - Automated remediation with conditional logic
- **🔗 Webhook System** - Event-driven integrations with retry logic
- **📱 Pre-built Integrations** - Slack, Microsoft Teams, JIRA, PagerDuty, ServiceNow
- **📊 MTTR Analytics** - Comprehensive metrics (MTTD, MTTA, MTTR, MTTC, MTTR Repair)
- **📈 Trend Analysis** - Daily, weekly, monthly incident patterns
- **🎯 SLA Tracking** - Compliance monitoring and reporting
- **📉 Top Issues** - Recurring pattern identification

**Enterprise Features (v5.0)**
- **🔐 Role-Based Access Control** - Granular permissions with 6+ system roles
- **📝 Audit Logging** - Comprehensive compliance trails with 50+ event types
- **📊 Advanced Reporting** - Executive summaries, team performance, security audits
- **🏢 Multi-Tenancy** - Complete tenant isolation with resource quotas
- **💰 Billing System** - Usage tracking, overage charges, plan management
- **👤 User Management** - Teams, invitations, SSO/SAML support
- **🔍 Security Monitoring** - Suspicious activity detection and alerting
- **📄 Custom Reports** - Scheduled reports in PDF, HTML, CSV, JSON, XLSX

## 🚀 Quick Start

### Installation

```bash
npm install @adapt/ui-toolkit
# or
yarn add @adapt/ui-toolkit
```

### Basic Usage

```tsx
import { RCAGraphViewer } from '@adapt/ui-toolkit';
import '@adapt/ui-toolkit/styles';

function MyApp() {
  return (
    <RCAGraphViewer
      graph={myRCAGraph}
      onNodeClick={(nodeId) => console.log(nodeId)}
    />
  );
}
```

### Running the Demo

```bash
# Install dependencies
npm install

# Start the mock API server (terminal 1)
npm run server

# Start the dev server (terminal 2)
npm run dev

# Or run both together
npm run dev:full
```

Visit `http://localhost:5173` to see the interactive demo.

## 📦 Components & Services

### Core Visualization Components

#### RCAGraphViewer
Interactive causal analysis visualization with pan/zoom, minimap, keyboard navigation.

```tsx
import { RCAGraphViewer } from '@adapt/ui-toolkit';

<RCAGraphViewer
  graph={rcaGraph}
  config={{
    layout: 'hierarchical',
    height: '600px',
    enableZoom: true,
    showMinimap: true,
  }}
  onNodeClick={(nodeId) => handleNodeClick(nodeId)}
/>
```

#### TimelineViewer
Chronological event display with filtering, search, and accessibility features.

```tsx
import { TimelineViewer } from '@adapt/ui-toolkit';

<TimelineViewer
  timeline={timelineData}
  config={{
    enableFilters: true,
    showAnomalies: true,
  }}
  onEventClick={(event) => handleEventClick(event)}
/>
```

#### ChatInterface
AI-powered diagnostic assistant with context-aware responses.

```tsx
import { ChatInterface } from '@adapt/ui-toolkit';

<ChatInterface
  messages={messages}
  onSendMessage={(msg) => handleSendMessage(msg)}
  config={{
    placeholder: 'Ask about this incident...',
    showTimestamps: true,
  }}
/>
```

#### InsightsPanel
Real-time agent analysis feed with virtual scrolling for performance.

```tsx
import { InsightsPanel } from '@adapt/ui-toolkit';

<InsightsPanel
  insights={insights}
  isLive={true}
  config={{ height: '600px' }}
/>
```

#### RemediationViewer
Step-by-step remediation tracking with status updates.

```tsx
import { RemediationViewer } from '@adapt/ui-toolkit';

<RemediationViewer
  plan={remediationPlan}
  onStepStatusChange={(stepId, status) => updateStep(stepId, status)}
/>
```

### Collaboration Components (v2.0)

#### CommentThread
Threaded discussions with replies, reactions, and resolution.

```tsx
import { CommentThread } from '@adapt/ui-toolkit';

<CommentThread
  targetType="node"
  targetId="node-123"
  currentUserId="user-1"
  currentUserName="Alice"
/>
```

#### PresenceIndicator
Real-time user presence tracking.

```tsx
import { PresenceIndicator } from '@adapt/ui-toolkit';

<PresenceIndicator
  currentUserId="user-1"
  currentUserName="Alice"
  location="incident-detail"
/>
```

#### ActivityFeed
Recent collaboration activities and events.

```tsx
import { ActivityFeed } from '@adapt/ui-toolkit';

<ActivityFeed limit={20} />
```

### Analytics Components (v4.0)

#### MTTRDashboard
Comprehensive incident analytics and metrics visualization.

```tsx
import { MTTRDashboard } from '@adapt/ui-toolkit';

<MTTRDashboard />
```

### Enterprise Services (v3.0-v5.0)

#### AIService
AI-powered analysis and pattern recognition.

```tsx
import { AIService } from '@adapt/ui-toolkit';

// Generate incident summary
const summary = AIService.generateIncidentSummary(graph, timeline, insights);

// Detect anomalies
const anomalies = AIService.detectAnomalies(graph, timeline, historicalData);

// Recognize patterns
const patterns = AIService.recognizePatterns(currentGraph, historicalGraphs);
```

#### RunbookService
Automated remediation execution engine.

```tsx
import { RunbookService, DefaultRunbooks } from '@adapt/ui-toolkit';

// Execute a runbook
const execution = await RunbookService.executeRunbook(
  'runbook-restart-service',
  'incident-123',
  'user-1',
  { serviceName: 'api-gateway' }
);

// Create custom runbook
const runbook = RunbookService.createRunbook({
  name: 'Scale Up Service',
  steps: [/* ... */],
});
```

#### WebhookService
Event-driven integration system.

```tsx
import { WebhookService, WebhookTemplates } from '@adapt/ui-toolkit';

// Register webhook for Slack
const webhook = WebhookService.registerWebhook({
  name: 'Slack Notifications',
  url: 'https://hooks.slack.com/services/...',
  events: ['incident.created', 'incident.resolved'],
  ...WebhookTemplates.slack,
});

// Trigger event
await WebhookService.triggerEvent('incident.created', incidentData);
```

#### AnalyticsService
Incident metrics and MTTR tracking.

```tsx
import { AnalyticsService } from '@adapt/ui-toolkit';

// Get comprehensive statistics
const stats = AnalyticsService.getStatistics({ start, end });

// Calculate MTTR metrics
const mttr = AnalyticsService.calculateMTTR(incidents);

// Get trends
const trends = AnalyticsService.getTrends(30);

// Identify top issues
const topIssues = AnalyticsService.getTopIssues(10);
```

#### RBACService
Role-based access control.

```tsx
import { RBACService } from '@adapt/ui-toolkit';

// Check permissions
const canEdit = RBACService.hasPermission(userId, 'incident:edit');

// Get user permissions
const permissions = RBACService.getUserPermissions(userId);

// Create team
const team = RBACService.createTeam({
  name: 'Operations',
  description: 'SRE team',
  memberIds: [],
  tags: ['ops', 'sre'],
});
```

#### AuditService
Compliance and security logging.

```tsx
import { AuditService, AuditHelpers } from '@adapt/ui-toolkit';

// Log incident action
AuditHelpers.logIncident('created', incidentId, userId, userName);

// Query audit log
const events = AuditService.query({
  eventTypes: ['incident.created', 'incident.resolved'],
  startDate: new Date('2024-01-01'),
  limit: 100,
});

// Get security events
const securityEvents = AuditService.getSecurityEvents(50);

// Export audit log
const csv = AuditService.exportToCSV();
```

#### ReportingService
Advanced reporting and scheduled reports.

```tsx
import { ReportingService } from '@adapt/ui-toolkit';

// Create report definition
const definition = ReportingService.createReportDefinition({
  name: 'Weekly Executive Summary',
  type: 'executive-summary',
  format: 'pdf',
  schedule: 'weekly',
  recipients: ['exec@company.com'],
  filters: { dateRange: { start, end } },
  sections: [],
  createdBy: 'user-1',
  enabled: true,
});

// Generate report
const report = await ReportingService.generateReport(definition.id, 'user-1');
```

#### TenantService
Multi-tenancy and billing.

```tsx
import { TenantService } from '@adapt/ui-toolkit';

// Create tenant
const tenant = TenantService.createTenant({
  name: 'Acme Corp',
  slug: 'acme-corp',
  planId: 'professional',
  status: 'active',
  owner: { name: 'John Doe', email: 'john@acme.com' },
  billing: { /* ... */ },
  settings: { /* ... */ },
});

// Check limits
const limit = TenantService.checkLimit(tenantId, 'maxUsers');

// Calculate bill
const bill = TenantService.calculateBill(tenantId);

// Get usage report
const usage = TenantService.getUsageReport(tenantId);
```

## 🎯 React Hooks

Pre-built hooks for data fetching and state management:

```tsx
import {
  useRCAGraph,
  useTimeline,
  useChat,
  useInsights,
  useRemediation,
} from '@adapt/ui-toolkit';

function MyComponent({ incidentId }) {
  const { graph, loading, error } = useRCAGraph(incidentId);
  const { timeline } = useTimeline(incidentId);
  const { messages, sendMessage } = useChat(incidentId);
  const { insights, isLive } = useInsights(incidentId, true);
  const { plan, updateStepStatus } = useRemediation(incidentId);

  // Your component logic...
}
```

## 🔌 Embeddable Widgets

Standalone widgets for embedding in any web page:

```html
<!-- Include the library -->
<script src="https://cdn.example.com/adapt-ui.js"></script>
<link rel="stylesheet" href="https://cdn.example.com/adapt-ui.css">

<!-- Add a container -->
<div id="rca-graph"></div>

<!-- Initialize the widget -->
<script>
  const widget = AdaptUI.createWidget.graph(
    '#rca-graph',
    'incident-123',
    { height: '600px' }
  );
</script>
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        ADAPT-UI Enterprise Platform                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────── PRESENTATION LAYER ─────────────────────────────┐         │
│  │                                                                 │         │
│  │  Core Components (v1.0)                                         │         │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │         │
│  │  │  Graph   │ │ Timeline │ │   Chat   │ │ Insights │          │         │
│  │  │  Viewer  │ │  Viewer  │ │Interface │ │  Panel   │          │         │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │         │
│  │  ┌──────────┐ ┌──────────┐                                     │         │
│  │  │Remedia-  │ │  Toast   │                                     │         │
│  │  │  tion    │ │ System   │                                     │         │
│  │  └──────────┘ └──────────┘                                     │         │
│  │                                                                 │         │
│  │  Collaboration Components (v2.0)                                │         │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │         │
│  │  │ Comment  │ │ Presence │ │ Activity │ │Annotation│          │         │
│  │  │ Thread   │ │Indicator │ │   Feed   │ │  System  │          │         │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │         │
│  │                                                                 │         │
│  │  Analytics Components (v4.0)                                    │         │
│  │  ┌──────────┐                                                   │         │
│  │  │   MTTR   │                                                   │         │
│  │  │Dashboard │                                                   │         │
│  │  └──────────┘                                                   │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────── CONTEXT & STATE LAYER ───────────────────────┐            │
│  │                                                              │            │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │            │
│  │  │Collaboration │  │    Toast     │  │   History    │      │            │
│  │  │   Context    │  │   Context    │  │  (Undo/Redo) │      │            │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │            │
│  └──────────────────────────────────────────────────────────────┘            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────── SERVICE LAYER ──────────────────────────────┐             │
│  │                                                             │             │
│  │  AI & Analysis (v3.0)                                       │             │
│  │  ┌──────────┐                                               │             │
│  │  │    AI    │  • Incident Summarization                     │             │
│  │  │ Service  │  • Anomaly Detection                          │             │
│  │  │          │  • Pattern Recognition                        │             │
│  │  └──────────┘  • Predictive Analytics                       │             │
│  │                                                             │             │
│  │  Automation (v4.0)                                          │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │             │
│  │  │ Runbook  │ │ Webhook  │ │Analytics │                    │             │
│  │  │ Service  │ │ Service  │ │ Service  │                    │             │
│  │  └──────────┘ └──────────┘ └──────────┘                    │             │
│  │                                                             │             │
│  │  Enterprise (v5.0)                                          │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │             │
│  │  │   RBAC   │ │  Audit   │ │Reporting │ │  Tenant  │      │             │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │             │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────── REACT HOOKS LAYER ──────────────────────────┐             │
│  │  useRCAGraph | useTimeline | useChat | useInsights         │             │
│  │  useRemediation | useHistory | useToast                    │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────── API CLIENT LAYER ───────────────────────────┐             │
│  │  AdaptAPIClient (REST + WebSocket)                          │             │
│  │  • React Query integration                                  │             │
│  │  • Exponential backoff retry                                │             │
│  │  • Connection versioning                                    │             │
│  │  • WebSocket heartbeat                                      │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────── BACKEND / INTEGRATIONS ─────────────────────┐             │
│  │  • RCA Engine (Your AI Agents)                              │             │
│  │  • Telemetry & Observability Platform                       │             │
│  │  • External Integrations (Slack, JIRA, PagerDuty, etc.)     │             │
│  │  • SSO/SAML Provider                                        │             │
│  │  • External Logging (Elasticsearch, Splunk, Datadog)        │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 🎨 Theming

ADAPT-UI uses Tailwind CSS with a customizable color system:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        adapt: {
          primary: '#3b82f6',      // Customize primary color
          secondary: '#8b5cf6',    // Customize secondary color
          // ... more colors
        },
      },
    },
  },
};
```

See [docs/theming.md](docs/theming.md) for complete theming guide.

## 💰 Pricing & Plans

ADAPT-UI is available in 4 tiers to match your organization's needs:

### Free Plan
- **$0/month**
- 3 users
- 1 team
- 50 incidents/month
- Basic collaboration
- 30-day data retention
- Perfect for: Small teams, proof-of-concept

### Starter Plan
- **$99/month** + $10/user
- 10 users
- 3 teams
- 500 incidents/month
- AI insights & automation
- 90-day data retention
- Perfect for: Growing teams, startups

### Professional Plan
- **$499/month** + $25/user
- 50 users
- 10 teams
- 5,000 incidents/month
- Advanced RBAC & custom reports
- SSO/SAML support
- 1-year data retention
- Priority support
- Perfect for: Established companies, enterprise teams

### Enterprise Plan
- **$1,999/month** + $50/user
- Unlimited users & teams
- Unlimited incidents
- All features included
- Custom integrations
- SLA guarantees
- Unlimited data retention
- Dedicated support
- Perfect for: Large enterprises, mission-critical operations

**Overage Charges:**
- Storage: $0.10/GB beyond plan limit
- API Calls: $0.01 per 1,000 calls beyond plan limit

## 📚 Documentation

### Getting Started
- [Quick Start Guide](docs/quick-start.md)
- [Installation Guide](docs/installation.md)
- [Configuration](docs/configuration.md)

### Core Features
- [RCA Graph Visualization](docs/features/rca-graph.md)
- [Timeline & Events](docs/features/timeline.md)
- [AI Chat Interface](docs/features/chat.md)
- [Insights & Analysis](docs/features/insights.md)
- [Remediation Plans](docs/features/remediation.md)

### Collaboration (v2.0)
- [Comments & Discussions](docs/features/comments.md)
- [Real-time Presence](docs/features/presence.md)
- [Activity Tracking](docs/features/activity.md)
- [Annotations](docs/features/annotations.md)

### AI & Machine Learning (v3.0)
- [AI Incident Summaries](docs/features/ai-summaries.md)
- [Anomaly Detection](docs/features/anomaly-detection.md)
- [Pattern Recognition](docs/features/pattern-recognition.md)
- [Predictive Analytics](docs/features/predictive-analytics.md)

### Automation (v4.0)
- [Runbook Engine](docs/features/runbooks.md)
- [Webhook System](docs/features/webhooks.md)
- [Integrations Guide](docs/integrations.md)
- [MTTR Analytics](docs/features/mttr-analytics.md)

### Enterprise Features (v5.0)
- [RBAC & Permissions](docs/features/rbac.md)
- [Audit Logging](docs/features/audit-logging.md)
- [Advanced Reporting](docs/features/reporting.md)
- [Multi-Tenancy](docs/features/multi-tenancy.md)
- [Billing & Usage](docs/features/billing.md)

### Technical Documentation
- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Component Catalog](docs/component-catalog.md)
- [Service Documentation](docs/services.md)
- [Embedding Guide](docs/embedding-guide.md)
- [Theming Guide](docs/theming.md)
- [Performance Optimization](docs/performance.md)
- [Security Best Practices](docs/security.md)

### Development
- [Development Setup](docs/development.md)
- [Contributing Guide](docs/contributing.md)
- [Testing Guide](docs/testing.md)
- [Deployment Guide](docs/deployment.md)
- [CHANGELOG](CHANGELOG.md)

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build library
npm run build:lib

# Run mock API server
npm run server

# Run linter
npm run lint
```

## 🧪 API Server

The included mock API server provides synthetic data for testing:

```bash
npm run server
# Server runs on http://localhost:3001
```

### Endpoints

- `GET /api/incidents` - List all incidents
- `GET /api/incidents/:id` - Get incident details
- `GET /api/rca/:id/graph` - Get RCA graph
- `GET /api/rca/:id/timeline` - Get event timeline
- `GET /api/chat/:id` - Get chat session
- `POST /api/chat/:id/message` - Send chat message
- `GET /api/insights/:id` - Get agent insights
- `GET /api/remediation/:id` - Get remediation plan
- `WS /ws/:id` - WebSocket for real-time updates

## 📊 Example Scenarios

The toolkit includes complete synthetic scenarios:

1. **Database Connection Pool Exhaustion**
   - Symptoms: 504 timeout errors
   - Root Cause: Pool saturation + long transactions
   - Remediation: Increase pool size, add timeouts

More scenarios available in `examples/synthetic-incidents/`

## 🤝 Integration

### With Your RCA Engine

```tsx
import { AdaptAPIClient } from '@adapt/ui-toolkit';

const client = new AdaptAPIClient('https://your-rca-api.com');

// Use with components
function MyApp() {
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    client.getRCAGraph('incident-123').then(response => {
      if (response.success) setGraph(response.data);
    });
  }, []);

  return <RCAGraphViewer graph={graph} />;
}
```

### With Real-time Updates

```tsx
const client = new AdaptAPIClient();

client.connectWebSocket('incident-123', (data) => {
  if (data.type === 'insight') {
    addInsight(data.payload);
  }
});
```

## 🎯 Use Cases

- **Product Dashboards** - Embed RCA visualizations in admin panels
- **Support Tools** - Provide support teams with visual diagnostics
- **Monitoring Portals** - Integrate with observability platforms
- **Incident Response** - Real-time RCA during active incidents
- **Post-Mortems** - Interactive incident reviews
- **Training** - Demonstrate RCA processes

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Built with:
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ReactFlow](https://reactflow.dev/)
- [Lucide Icons](https://lucide.dev/)

## 📞 Support

- Issues: [GitHub Issues](https://github.com/your-org/adapt-ui/issues)
- Documentation: [https://docs.adapt-ui.dev](https://docs.adapt-ui.dev)

---

**ADAPT-UI** - Making AI-driven diagnostics visual and interactive
