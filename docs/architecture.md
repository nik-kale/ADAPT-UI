# ADAPT-UI Architecture

## Overview

ADAPT-UI is designed as a layered architecture that separates concerns and enables flexible integration with various backends and data sources.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                  Presentation Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Graph   │ │ Timeline │ │   Chat   │ │ Insights │      │
│  │  Viewer  │ │  Viewer  │ │Interface │ │  Panel   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  React Components (TypeScript + Tailwind CSS)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Custom React Hooks                                  │  │
│  │  - useRCAGraph    - useTimeline   - useChat         │  │
│  │  - useInsights    - useRemediation                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Handles: Fetching, Caching, Loading States, Errors        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AdaptAPIClient                                      │  │
│  │  - REST API methods                                  │  │
│  │  - WebSocket connection management                   │  │
│  │  - Error handling & retry logic                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Transport: HTTP/HTTPS + WebSocket                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Your RCA Engine / AI Agents / Telemetry System     │  │
│  │  - Incident management                               │  │
│  │  - RCA graph generation                              │  │
│  │  - Timeline aggregation                              │  │
│  │  - AI agent orchestration                            │  │
│  │  - Remediation planning                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Graph Visualization

The RCA graph uses ReactFlow for rendering and D3 for layout calculations.

```
RCAGraphViewer
├── ReactFlow (rendering engine)
├── RCANode (custom node component)
├── Layout Algorithm (hierarchical/force)
└── MiniMap + Controls
```

**Data Flow:**
1. Graph data arrives via `useRCAGraph` hook
2. Layout algorithm calculates node positions
3. ReactFlow renders interactive graph
4. User interactions trigger callbacks

### 2. Timeline Visualization

Timeline uses native React with custom scrolling and filtering.

```
TimelineViewer
├── Event Filters (type, severity)
├── Timeline Event List
│   ├── Event Item (with icon, metadata)
│   ├── Correlation Links
│   └── Severity Indicators
└── Time Range Display
```

### 3. Chat Interface

Standard chat UI with message threading and real-time updates.

```
ChatInterface
├── Message List (auto-scroll)
│   ├── User Messages
│   ├── Assistant Messages
│   └── Agent Messages
├── Input Field
└── Send Handler
```

### 4. Insights Panel

Live-updating feed of agent discoveries.

```
InsightsPanel
├── Live Indicator
├── Insight Stream
│   ├── Hypothesis Insights
│   ├── Finding Insights
│   ├── Recommendation Insights
│   └── Progress Updates
└── Auto-scroll Container
```

### 5. Remediation Viewer

Step-by-step plan with expand/collapse and status tracking.

```
RemediationViewer
├── Plan Header (title, status, progress)
├── Step List
│   ├── Step Header (number, status, type)
│   ├── Step Details (expandable)
│   │   ├── Description
│   │   ├── Command
│   │   ├── Prerequisites
│   │   ├── Risks
│   │   └── Documentation
│   └── Action Buttons
└── Progress Bar
```

## Data Model

### Core Types

All data structures are defined in `src/types/index.ts`:

- **RCANode** - Graph node (symptom, hypothesis, test, finding, remediation)
- **RCAEdge** - Graph connection with relationship type
- **RCAGraph** - Complete graph with metadata
- **TimelineEvent** - Single event with correlations
- **ChatMessage** - Message with role and metadata
- **AgentInsight** - Agent discovery or update
- **RemediationPlan** - Multi-step remediation

### State Management

State is managed through custom React hooks that:
- Fetch data on mount
- Handle loading/error states
- Cache results
- Provide update methods
- Support WebSocket subscriptions

## API Protocol

### REST Endpoints

All endpoints follow RESTful conventions:

```
GET    /api/incidents           → List incidents
GET    /api/incidents/:id       → Get incident
GET    /api/rca/:id/graph       → Get RCA graph
GET    /api/rca/:id/timeline    → Get timeline
GET    /api/chat/:id            → Get chat session
POST   /api/chat/:id/message    → Send message
GET    /api/insights/:id        → Get insights
GET    /api/remediation/:id     → Get plan
PATCH  /api/remediation/:id/steps/:stepId → Update step
```

### WebSocket Protocol

WebSocket messages follow this format:

```typescript
{
  type: 'insight' | 'graph_update' | 'remediation_update',
  payload: {
    // Type-specific data
  }
}
```

### Response Format

All API responses use a consistent envelope:

```typescript
{
  success: boolean,
  data?: T,
  error?: {
    code: string,
    message: string,
    details?: any
  },
  metadata: {
    timestamp: string,
    requestId?: string
  }
}
```

## Widget System

Widgets are standalone instances that can be embedded anywhere:

```typescript
class AdaptWidget {
  constructor(container, config)
  render(): void
  destroy(): void
  updateConfig(config): void
}
```

Each widget:
1. Manages its own React root
2. Handles API client instantiation
3. Provides cleanup on destroy
4. Supports configuration updates

## Styling System

ADAPT-UI uses Tailwind CSS with:

- **Utility-first approach** - Compose styles from utilities
- **Custom color palette** - `adapt-*` color tokens
- **Dark theme** - Default dark mode optimized for dashboards
- **Responsive design** - Mobile-friendly layouts
- **Animation utilities** - Fade, slide, pulse effects

### Color System

```
adapt-primary     → #3b82f6 (blue)
adapt-secondary   → #8b5cf6 (purple)
adapt-success     → #10b981 (green)
adapt-warning     → #f59e0b (orange)
adapt-error       → #ef4444 (red)

graph-symptom     → #ef4444 (red)
graph-hypothesis  → #f59e0b (orange)
graph-test        → #06b6d4 (cyan)
graph-finding     → #8b5cf6 (purple)
graph-remediation → #10b981 (green)
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading** - Components load on demand
2. **Memoization** - React.memo for expensive renders
3. **Virtual Scrolling** - For long timelines/insights
4. **Debouncing** - Input handlers use debounce
5. **Web Workers** - Layout calculations off main thread (future)

### Bundle Size

Target bundle sizes:
- Core library: ~150KB (gzipped)
- Individual components: 20-40KB each
- Total with dependencies: ~300KB

## Security Considerations

1. **XSS Prevention** - All user input sanitized
2. **CSRF Protection** - Token-based auth support
3. **API Authentication** - Configurable auth headers
4. **WebSocket Security** - WSS support, origin validation
5. **Content Security Policy** - Compatible with strict CSP

## Extensibility

### Custom Node Types

Add custom node types by:
1. Extending `NodeType` union
2. Creating custom node component
3. Registering with ReactFlow

### Custom Layouts

Implement custom layouts by:
1. Creating layout function
2. Following `LayoutNode` interface
3. Registering in GraphViewer

### Custom Themes

Override theme by:
1. Extending Tailwind config
2. Providing custom CSS variables
3. Using `customStyles` in widget config

## Testing Strategy

- **Unit Tests** - Jest for utilities and hooks
- **Component Tests** - React Testing Library
- **Integration Tests** - Full flow testing
- **E2E Tests** - Playwright for critical paths
- **Visual Regression** - Chromatic for UI changes

## Deployment

### As NPM Package

```bash
npm run build:lib
npm publish
```

### As CDN Bundle

```bash
npm run build
# Upload dist/ to CDN
```

### As Embedded App

```bash
npm run build
# Embed in your application
```

## Future Enhancements

- [ ] Graph animation system
- [ ] Advanced filtering and search
- [ ] Export to PDF/PNG
- [ ] Collaborative features
- [ ] Mobile-optimized views
- [ ] Graph diff visualization
- [ ] Time-travel debugging
- [ ] AI explanation tooltips
