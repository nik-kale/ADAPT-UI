# Component Catalog

Complete reference for all ADAPT-UI components.

## RCAGraphViewer

Interactive causal graph visualization for root cause analysis.

### Props

```typescript
interface RCAGraphViewerProps {
  graph: RCAGraph;
  config?: GraphWidgetConfig;
  onNodeClick?: (nodeId: string) => void;
}
```

### Configuration

```typescript
interface GraphWidgetConfig {
  theme?: 'light' | 'dark';               // Color theme
  height?: string | number;                // Container height
  width?: string | number;                 // Container width
  layout?: 'hierarchical' | 'force';       // Layout algorithm
  nodeSize?: 'small' | 'medium' | 'large'; // Node size
  showLabels?: boolean;                    // Show node labels
  enableZoom?: boolean;                    // Enable zoom controls
  enablePan?: boolean;                     // Enable panning
  apiEndpoint?: string;                    // API base URL
}
```

### Example

```tsx
import { RCAGraphViewer } from '@adapt/ui-toolkit';

function MyComponent() {
  const handleNodeClick = (nodeId: string) => {
    console.log('Clicked node:', nodeId);
  };

  return (
    <RCAGraphViewer
      graph={myGraph}
      config={{
        height: '700px',
        layout: 'hierarchical',
        enableZoom: true,
      }}
      onNodeClick={handleNodeClick}
    />
  );
}
```

### Features

- ✅ Automatic layout calculation
- ✅ Interactive zoom and pan
- ✅ Mini-map for navigation
- ✅ Color-coded node types
- ✅ Confidence indicators
- ✅ Status badges
- ✅ Animated edges for live graphs

---

## TimelineViewer

Chronological event timeline with filtering and correlation.

### Props

```typescript
interface TimelineViewerProps {
  timeline: TimelineData;
  config?: TimelineWidgetConfig;
  onEventClick?: (event: TimelineEvent) => void;
}
```

### Configuration

```typescript
interface TimelineWidgetConfig extends WidgetConfig {
  showAnomalies?: boolean;     // Highlight anomalies
  groupByType?: boolean;        // Group events by type
  enableFilters?: boolean;      // Show filter controls
}
```

### Example

```tsx
import { TimelineViewer } from '@adapt/ui-toolkit';

function MyTimeline() {
  return (
    <TimelineViewer
      timeline={timelineData}
      config={{
        enableFilters: true,
        showAnomalies: true,
      }}
      onEventClick={(event) => {
        console.log('Event:', event);
      }}
    />
  );
}
```

### Features

- ✅ Chronological event display
- ✅ Severity color coding
- ✅ Event type filtering
- ✅ Severity filtering
- ✅ Correlated event indicators
- ✅ Relative time display
- ✅ Hover effects

---

## ChatInterface

AI-powered diagnostic assistant chat interface.

### Props

```typescript
interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  config?: ChatWidgetConfig;
}
```

### Configuration

```typescript
interface ChatWidgetConfig extends WidgetConfig {
  placeholder?: string;         // Input placeholder text
  enableAutoScroll?: boolean;   // Auto-scroll to new messages
  maxMessages?: number;         // Max messages to display
  showTimestamps?: boolean;     // Show message timestamps
}
```

### Example

```tsx
import { ChatInterface } from '@adapt/ui-toolkit';
import { useChat } from '@adapt/ui-toolkit';

function MyChat({ incidentId }) {
  const { messages, sending, sendMessage } = useChat(incidentId);

  return (
    <ChatInterface
      messages={messages}
      onSendMessage={sendMessage}
      isLoading={sending}
      config={{
        placeholder: 'Ask about this incident...',
        showTimestamps: true,
        enableAutoScroll: true,
      }}
    />
  );
}
```

### Features

- ✅ User/Assistant/Agent message types
- ✅ Typing indicators
- ✅ Auto-scroll to latest
- ✅ Confidence badges
- ✅ Agent identification
- ✅ Timestamp display
- ✅ Message metadata

---

## InsightsPanel

Live feed of agent analysis and discoveries.

### Props

```typescript
interface InsightsPanelProps {
  insights: AgentInsight[];
  isLive?: boolean;
  config?: WidgetConfig;
}
```

### Example

```tsx
import { InsightsPanel } from '@adapt/ui-toolkit';
import { useInsights } from '@adapt/ui-toolkit';

function MyInsights({ incidentId }) {
  const { insights, isLive } = useInsights(incidentId, true);

  return (
    <InsightsPanel
      insights={insights}
      isLive={isLive}
      config={{ height: '600px' }}
    />
  );
}
```

### Insight Types

- **hypothesis** - New hypothesis generated
- **finding** - Discovery or evidence found
- **recommendation** - Suggested action
- **question** - Question for investigation
- **progress** - Analysis progress update

### Features

- ✅ Live update indicator
- ✅ Type-based color coding
- ✅ Agent name display
- ✅ Confidence scores
- ✅ Related node links
- ✅ Auto-scroll to latest
- ✅ Fade-in animations

---

## RemediationViewer

Step-by-step remediation plan with execution tracking.

### Props

```typescript
interface RemediationViewerProps {
  plan: RemediationPlan;
  onStepStatusChange?: (stepId: string, status: string) => void;
  config?: WidgetConfig;
}
```

### Example

```tsx
import { RemediationViewer } from '@adapt/ui-toolkit';
import { useRemediation } from '@adapt/ui-toolkit';

function MyRemediation({ incidentId }) {
  const { plan, updateStepStatus } = useRemediation(incidentId);

  return (
    <RemediationViewer
      plan={plan}
      onStepStatusChange={updateStepStatus}
    />
  );
}
```

### Step Types

- **manual** - Human-executed step
- **automated** - Automated execution
- **verification** - Verification check

### Features

- ✅ Progress tracking
- ✅ Expandable step details
- ✅ Status indicators
- ✅ Command display
- ✅ Risk warnings
- ✅ Prerequisites list
- ✅ Documentation links
- ✅ Execution controls

---

## React Hooks

### useRCAGraph

Fetch and manage RCA graph data.

```typescript
const { graph, loading, error } = useRCAGraph(incidentId);
```

**Returns:**
- `graph` - RCA graph data or null
- `loading` - Loading state
- `error` - Error message or null

### useTimeline

Fetch and manage timeline data.

```typescript
const { timeline, loading, error } = useTimeline(incidentId);
```

**Returns:**
- `timeline` - Timeline data or null
- `loading` - Loading state
- `error` - Error message or null

### useChat

Manage chat session and messages.

```typescript
const {
  session,
  messages,
  loading,
  sending,
  error,
  sendMessage
} = useChat(incidentId);
```

**Returns:**
- `session` - Chat session metadata
- `messages` - Array of messages
- `loading` - Initial loading state
- `sending` - Message sending state
- `error` - Error message or null
- `sendMessage(content)` - Send message function

### useInsights

Fetch and stream agent insights.

```typescript
const { insights, isLive, loading, error } = useInsights(
  incidentId,
  enableRealtime
);
```

**Parameters:**
- `incidentId` - Incident ID
- `enableRealtime` - Enable WebSocket streaming

**Returns:**
- `insights` - Array of insights
- `isLive` - Whether streaming is active
- `loading` - Loading state
- `error` - Error message or null

### useRemediation

Manage remediation plan and step status.

```typescript
const {
  plan,
  loading,
  error,
  updateStepStatus
} = useRemediation(incidentId);
```

**Returns:**
- `plan` - Remediation plan or null
- `loading` - Loading state
- `error` - Error message or null
- `updateStepStatus(stepId, status)` - Update step function

---

## Widget Classes

### GraphWidget

Embeddable graph widget.

```typescript
import { GraphWidget } from '@adapt/ui-toolkit';

const widget = new GraphWidget(
  '#container',
  'incident-123',
  { height: '600px' },
  (nodeId) => console.log(nodeId)
);

// Later...
widget.destroy();
```

### ChatWidget

Embeddable chat widget.

```typescript
import { ChatWidget } from '@adapt/ui-toolkit';

const widget = new ChatWidget(
  '#chat-container',
  'incident-123',
  { height: '500px' }
);
```

### Convenience Functions

```typescript
import { createWidget } from '@adapt/ui-toolkit';

// Graph widget
const graph = createWidget.graph(
  '#graph',
  'incident-123',
  { height: '600px' }
);

// Chat widget
const chat = createWidget.chat(
  '#chat',
  'incident-123',
  { placeholder: 'Ask a question...' }
);
```

---

## Utility Functions

### Color Utilities

```typescript
import { getNodeColor, getSeverityColor, getStatusColor } from '@adapt/ui-toolkit';

const color = getNodeColor('symptom');        // → '#ef4444'
const severity = getSeverityColor('critical'); // → '#dc2626'
const status = getStatusColor('completed');    // → '#10b981'
```

### Formatting Utilities

```typescript
import { formatTimestamp, formatRelativeTime, formatDuration } from '@adapt/ui-toolkit';

formatTimestamp('2024-01-15T10:30:00Z');        // → 'Jan 15, 2024, 10:30 AM'
formatRelativeTime('2024-01-15T10:30:00Z');    // → '2 hours ago'
formatDuration(3665);                           // → '1h'
```

### Layout Utilities

```typescript
import { calculateHierarchicalLayout, calculateForceLayout } from '@adapt/ui-toolkit';

const { nodes, edges } = calculateHierarchicalLayout(rcaNodes, rcaEdges);
```

---

## Styling

All components support custom styling through:

1. **Tailwind classes** - Add custom classes
2. **CSS variables** - Override theme colors
3. **Inline styles** - Direct style props
4. **Theme config** - Global theme configuration

See [theming.md](theming.md) for details.
