# ADAPT-UI Feature Catalog

Complete listing of all features, organized by version.

## Version 1.0 - Core Platform (Base Release)

### RCA Graph Visualization
- Interactive causal graph with ReactFlow
- Automatic hierarchical layout
- Pan/zoom controls with smooth animations
- Clickable, pannable, and zoomable minimap
- Keyboard navigation (arrow keys, +/- for zoom, F to fit view)
- Touch gesture support for mobile devices
- Color-coded node types (symptom, hypothesis, test, evidence, root-cause)
- Edge animations showing causal flow
- Node selection and highlighting
- Export graph to image

### Timeline Viewer
- Chronological event display
- Event type filtering (anomalies, alerts, changes, incidents)
- Keyword search across events
- Event badges with color coding
- Expandable event details
- Keyboard navigation
- ARIA labels for screen readers
- Responsive design

### AI Chat Interface
- Message threading
- User/assistant message distinction
- Timestamp display
- Auto-scroll to latest message
- Send message with Enter key
- Markdown support for messages
- Typing indicators (planned)

### Insights Panel
- Real-time agent analysis feed
- Virtual scrolling (react-window) for performance
- Insight type badges (hypothesis, evidence, root-cause, correlation)
- Confidence score display
- Timestamp tracking
- Keyboard navigation
- Live update support via WebSocket

### Remediation Viewer
- Step-by-step remediation plan display
- Status tracking per step (pending, in-progress, completed, failed)
- Manual vs automatic step distinction
- Execution logging
- Step re-execution support
- Progress visualization
- Keyboard navigation

### Toast Notification System
- Application-wide notifications
- 4 severity types (info, success, warning, error)
- Auto-dismiss with configurable duration (default 3s)
- Manual dismiss option
- Position: top-right
- Stacking support for multiple toasts
- useToast hook for easy access
- Color-coded by severity

### Undo/Redo System
- State history management
- Undo/redo operations
- Can undo/can redo flags
- Configurable history size (default 50 states)
- useHistory hook
- Works with any stateful data

### API Client
- REST API client with React Query
- WebSocket support with heartbeat
- Connection versioning (prevents race conditions)
- Exponential backoff retry logic
- Smart retry (skip 404/403, retry transient failures)
- Request/response logging
- Type-safe interfaces

### Performance Optimizations
- React.memo on all major components
- Virtual scrolling for large lists
- Debounce utility with memory leak prevention
- Component preloading on tab hover
- Lazy loading with retry logic
- Code splitting

### Accessibility (WCAG Compliant)
- Keyboard navigation throughout
- Screen reader support
- ARIA labels and roles
- Focus management
- Skip links
- High contrast support
- Touch targets (44x44px minimum)

### Security Enhancements
- XSS prevention (no innerHTML usage)
- Race condition prevention
- Memory leak fixes
- Input validation
- Secure WebSocket connections

### Developer Experience
- Full TypeScript support
- Comprehensive error boundaries
- Development logging
- Mock API server
- Hot module replacement
- ESLint + Prettier configuration

---

## Version 2.0 - Real-time Collaboration

### Collaboration Context
- Centralized collaboration state management
- Comment system with threading
- Annotation system
- Presence tracking
- Activity feed
- Real-time synchronization

### Comment Thread Component
**Features**:
- Threaded discussions with nested replies
- Emoji reactions (👍 reactions)
- @mention support for tagging users
- Resolve/unresolve functionality
- Delete own comments (with permission)
- Timestamp tracking
- Reply count display
- Highlighting for mentioned users

**Target Types**:
- Graph nodes
- Graph edges
- Insights
- Timeline events
- Remediation steps

### Presence Indicator Component
- Real-time active user display
- User avatars (initials if no image)
- User names
- Location tracking (which page/incident)
- Status updates every 30 seconds
- Inactive user cleanup (5-minute timeout)
- Overflow handling for many users
- Click to view user details

### Activity Feed Component
- Recent collaboration events
- Color-coded by activity type
- Relative timestamps (e.g., "2 minutes ago")
- Configurable limit
- Activity types:
  - Comments added
  - Annotations created
  - Incident status changes
  - Assignments
  - Resolutions

### Annotation System
- Add annotations to any component
- Rich text support
- Color coding
- Show/hide annotations
- Edit/delete annotations
- Annotation threading
- Highlight referenced components

---

## Version 3.0 - AI & Machine Learning

### AI Incident Summaries
**Capabilities**:
- Analyze RCA graph structure
- Extract key findings from insights
- Identify root causes with confidence scores
- List affected components
- Assess impact severity
- Generate actionable recommendations
- Create human-readable narrative

**Output Includes**:
- Narrative summary
- Key findings list
- Root cause analysis
- Affected components
- Impact assessment
- Recommendations
- Metadata (analysis time, graph size, critical path length)

### Anomaly Detection
**Detection Types**:

1. **Timing Anomalies**
   - Events too close together (< 1 second)
   - Impossible time sequences
   - Events in wrong order

2. **Structural Anomalies**
   - Isolated nodes (no incoming/outgoing edges)
   - Circular dependencies
   - Excessive branching (> 10 edges from one node)
   - Missing critical node types

3. **Metric Anomalies**
   - Low confidence scores (< 0.5)
   - Missing required metadata
   - Outlier values

4. **Pattern Anomalies**
   - Deviations from historical patterns
   - Unusual graph shapes
   - Unexpected node distributions

**Severity Levels**: Low, Medium, High, Critical

### Pattern Recognition
**Pattern Types**:

1. **Recurring Failures**
   - Same failure pattern across incidents
   - Frequency tracking
   - Component identification
   - Preventive recommendations

2. **Cascade Patterns**
   - A→B→C failure chains
   - Cascading dependency detection
   - Impact radius calculation
   - Isolation recommendations

3. **Bottleneck Detection**
   - High-degree nodes (> 5 incoming edges)
   - Single points of failure
   - Critical path analysis
   - Redundancy recommendations

4. **Correlation Patterns**
   - Components that fail together
   - Time-based correlations
   - Metric correlations
   - Proactive monitoring suggestions

**Confidence Scoring**: All patterns include confidence scores

---

## Version 4.0 - Automation & Integrations

### Runbook Engine
**Step Types**:
- **Manual**: Requires human action
- **Automated**: Executes automatically
- **Approval**: Requires approval before execution
- **Conditional**: Executes based on condition evaluation

**Action Types**:
- **API Call**: HTTP requests to external APIs
- **Script**: Execute custom scripts
- **Webhook**: Trigger external webhooks
- **Notification**: Send notifications to users/channels

**Features**:
- Conditional logic (if/else)
- Retry logic with exponential backoff
- Timeout handling
- Fallback steps
- Variable substitution
- Context passing between steps
- Execution logging
- Step result tracking

**Default Runbooks**:
- Restart Service
- Scale Up Service

### Webhook System
**Capabilities**:
- Event subscription model
- HMAC signature generation
- Exponential backoff retry (5 attempts)
- Delivery tracking
- Success/failure statistics
- Webhook testing
- Multiple webhooks per event

**Event Types** (12 total):
- Incident: created, updated, resolved, escalated
- Graph: analyzed
- Insight: generated
- Runbook: started, completed, failed
- Comment: added
- Annotation: created

**Pre-built Integrations**:
1. **Slack**
   - Formatted message blocks
   - Channel notifications
   - Custom emoji support

2. **Microsoft Teams**
   - Adaptive cards
   - ActionableMessage format
   - Channel mentions

3. **JIRA**
   - Automatic issue creation
   - Custom field mapping
   - Project selection

4. **PagerDuty**
   - Alert triggering
   - Severity mapping
   - Custom details

5. **ServiceNow**
   - Incident creation
   - Priority mapping
   - Assignment rules

6. **Generic Webhook**
   - Flexible JSON payload
   - Custom headers
   - Authentication support

### Analytics Service
**MTTR Metrics**:
- **MTTD** (Mean Time To Detect): Occurrence → Detection
- **MTTA** (Mean Time To Acknowledge): Detection → Acknowledgement
- **MTTR** (Mean Time To Resolve): Detection → Resolution
- **MTTC** (Mean Time To Close): Detection → Closure
- **MTTR Repair**: Acknowledgement → Resolution

**Statistics**:
- Total incidents by time range
- Open/investigating/resolved/closed counts
- Breakdown by severity, tag, assignee, service
- Average impact score
- Resolution rate

**Trend Analysis**:
- Daily trends (configurable days)
- Weekly trends (12 weeks)
- Monthly trends (12 months)
- Incident count trends
- Resolution time trends
- Severity trends

**Top Issues**:
- Pattern normalization
- Occurrence counting
- Average resolution time
- Last seen timestamp
- Severity classification

**SLA Compliance**:
- Configurable SLA targets
- Compliance percentage calculation
- Per-metric compliance (MTTD, MTTA, MTTR)
- Overall compliance score

**Export**:
- CSV export with full details
- Configurable columns
- Time range filtering

### MTTR Dashboard Component
**Visualizations**:
- MTTR metric cards (color-coded)
- Incident count cards
- SLA compliance progress bars
- Incident trend charts (bar charts)
- Top recurring issues table
- Severity distribution grid

**Interactions**:
- Time range selector (7d/30d/90d)
- Trend view toggle (daily/weekly/monthly)
- Export to CSV button
- Drill-down capabilities

**Features**:
- Responsive grid layout
- Real-time updates
- Color-coded status (ok/warning/critical)
- Tooltip support

---

## Version 5.0 - Enterprise Features

### RBAC (Role-Based Access Control)
**System Roles** (6 predefined):
1. **Super Admin**: All permissions
2. **Admin**: All except super admin actions
3. **Incident Manager**: Incident and runbook management
4. **Engineer**: Day-to-day incident response
5. **Viewer**: Read-only access
6. **Guest**: Minimal access

**Permission Types** (40+):
- Incident permissions (8)
- Graph permissions (4)
- Runbook permissions (6)
- Analytics permissions (3)
- Collaboration permissions (5)
- Admin permissions (6)
- Webhook permissions (4)

**User Management**:
- Create/update/delete users
- Assign roles
- Set user status (active/inactive/suspended)
- Track last login
- Metadata support

**Team Management**:
- Create/update/delete teams
- Add/remove members
- Set team leaders
- Team tags
- Team member listing

**Permission Checking**:
- `hasPermission(userId, permission)`
- `hasAnyPermission(userId, permissions[])`
- `hasAllPermissions(userId, permissions[])`
- Resource-level access control

### Audit Logging
**Event Types** (50+):
- Authentication (6 events)
- User management (6 events)
- Team management (5 events)
- Incident events (8 events)
- Graph events (3 events)
- Runbook events (6 events)
- Webhook events (4 events)
- Analytics events (2 events)
- Collaboration events (4 events)
- Settings & configuration (3 events)
- Security events (3 events)
- System events (4 events)

**Event Metadata**:
- Timestamp
- Event type
- Severity (info, warning, error, critical)
- User ID, name, email, role
- IP address
- User agent
- Resource type and ID
- Action description
- Before/after state
- Success/failure flag
- Error message
- Session ID
- Tenant ID

**Capabilities**:
- Advanced querying with filters
- Full-text search
- Statistics by type, severity, user
- Security event monitoring
- Failed event tracking
- Suspicious activity detection
- CSV/JSON export
- Automatic retention (configurable, default 90 days)

**Security Monitoring**:
- Multiple failed login detection
- Excessive permission denial detection
- Unusual activity hours detection
- Suspicious user identification

**External Integration**:
- Elasticsearch/OpenSearch
- Splunk
- Datadog
- AWS CloudWatch
- Google Cloud Logging
- Azure Monitor

### Advanced Reporting
**Report Types** (7):

1. **Executive Summary**
   - High-level metrics
   - MTTR overview
   - Incident trends
   - SLA compliance
   - Key insights

2. **Incident Analysis**
   - Detailed incident metrics
   - Recurring pattern analysis
   - Root cause breakdown
   - Timeline analysis

3. **Team Performance**
   - Team metrics
   - Workload distribution
   - Collaboration stats
   - Individual performance

4. **SLA Compliance**
   - SLA target tracking
   - Compliance percentages
   - Breach analysis
   - Trend analysis

5. **Security Audit**
   - Security events
   - Suspicious activity
   - Compliance status
   - Access violations

6. **Trend Analysis**
   - Long-term trends
   - Seasonal patterns
   - Predictive insights
   - Growth projections

7. **Custom Reports**
   - Flexible report builder
   - Custom sections
   - Custom filters
   - Custom visualizations

**Output Formats**:
- PDF (planned)
- HTML
- CSV
- JSON
- XLSX (planned)

**Scheduling**:
- On-demand
- Daily
- Weekly
- Monthly
- Quarterly

**Features**:
- Email distribution
- Automated generation
- Custom filters
- Section customization
- Insights generation
- Recommendations generation

### Multi-Tenancy
**Pricing Plans** (4):

1. **Free Plan** ($0/month)
   - 3 users, 1 team
   - 50 incidents/month
   - Basic features
   - 30-day retention

2. **Starter Plan** ($99/month + $10/user)
   - 10 users, 3 teams
   - 500 incidents/month
   - AI insights, automation
   - 90-day retention

3. **Professional Plan** ($499/month + $25/user)
   - 50 users, 10 teams
   - 5,000 incidents/month
   - Advanced RBAC, SSO
   - 1-year retention

4. **Enterprise Plan** ($1,999/month + $50/user)
   - Unlimited users/teams/incidents
   - All features
   - SLA guarantees
   - Unlimited retention

**Resource Quotas**:
- Max users
- Max teams
- Max incidents per month
- Max runbooks
- Max webhooks
- Max storage (GB)
- Max API calls per day
- Data retention days
- Audit log retention days

**Feature Flags**:
- Collaboration
- AI insights
- Automation
- Analytics
- Custom reports
- SSO/SAML
- Advanced RBAC
- Priority support
- SLA guarantees
- Custom integrations

**Tenant Management**:
- Slug-based URLs (e.g., acme-corp.adapt-rca.com)
- Custom domains
- White-label branding
- Status tracking (active, suspended, trial, cancelled)
- Trial period management
- Owner information

**Billing System**:
- Monthly bill calculation
- Per-user pricing
- Overage charges:
  - Storage: $0.10/GB
  - API calls: $0.01/1000 calls
- Billing address
- VAT number support
- Invoice generation (planned)

**Usage Tracking**:
- Real-time counters
- Limit enforcement
- Usage percentage calculation
- Warning thresholds (75%, 90%)
- Monthly reset

**Tenant Invitations**:
- Email-based invitations
- Secure token generation
- 7-day expiration
- Role assignment
- Acceptance tracking

**Settings**:
- Timezone
- Date format
- Currency
- Language
- Logo upload
- Primary color
- White-label enable/disable

---

## Cross-Cutting Features

### TypeScript
- Full type coverage
- Strict mode enabled
- Type-safe API clients
- Type-safe event handlers
- Comprehensive interfaces

### Performance
- Code splitting
- Lazy loading
- Virtual scrolling
- React.memo optimization
- Debounced operations
- Efficient re-renders

### Testing
- Unit test setup (Jest)
- Component testing (React Testing Library)
- E2E testing (Playwright, planned)
- API mocking (MSW)
- Coverage reporting

### Build & Deploy
- Vite build system
- Production optimization
- Source maps
- Asset optimization
- Environment configuration
- Docker support (planned)

### Monitoring
- Error boundaries
- Error logging
- Performance monitoring
- User analytics (planned)
- Custom metrics

---

## Roadmap

### v6.0 (Planned)
- GraphQL API
- Mobile app (React Native)
- Desktop app (Electron)
- VS Code extension
- Browser extension

### v7.0 (Planned)
- Advanced ML models
- Cost attribution
- Capacity planning
- Chaos engineering integration
- Custom visualization types

### v8.0 (Planned)
- Real-time collaboration v2
- Video conferencing integration
- Screen sharing
- Live debugging
- Incident simulation

---

## Feature Matrix by Plan

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| RCA Visualization | ✅ | ✅ | ✅ | ✅ |
| Timeline & Events | ✅ | ✅ | ✅ | ✅ |
| AI Chat | ✅ | ✅ | ✅ | ✅ |
| Insights Panel | ✅ | ✅ | ✅ | ✅ |
| Remediation Plans | ✅ | ✅ | ✅ | ✅ |
| Collaboration | ✅ | ✅ | ✅ | ✅ |
| AI Insights | ❌ | ✅ | ✅ | ✅ |
| Anomaly Detection | ❌ | ✅ | ✅ | ✅ |
| Pattern Recognition | ❌ | ✅ | ✅ | ✅ |
| Automation/Runbooks | ❌ | ✅ | ✅ | ✅ |
| Webhooks | Limited | ✅ | ✅ | ✅ |
| Analytics/MTTR | Basic | ✅ | ✅ | ✅ |
| Custom Reports | ❌ | ❌ | ✅ | ✅ |
| SSO/SAML | ❌ | ❌ | ✅ | ✅ |
| Advanced RBAC | ❌ | ❌ | ✅ | ✅ |
| Audit Logging | 7 days | 30 days | 90 days | Unlimited |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| SLA Guarantees | ❌ | ❌ | ❌ | ✅ |
| Custom Integrations | ❌ | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ❌ | ✅ |

---

For detailed API documentation, see [Services Documentation](services.md).
