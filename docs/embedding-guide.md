# Embedding Guide

Complete guide to embedding ADAPT-UI components in your applications.

## Installation Methods

### NPM Package (Recommended)

```bash
npm install @adapt/ui-toolkit
# or
yarn add @adapt/ui-toolkit
```

### CDN (For quick prototyping)

```html
<script src="https://unpkg.com/@adapt/ui-toolkit/dist/index.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@adapt/ui-toolkit/dist/style.css">
```

## React Applications

### Basic Setup

```tsx
// 1. Import components
import { RCAGraphViewer, TimelineViewer, ChatInterface } from '@adapt/ui-toolkit';
import '@adapt/ui-toolkit/styles';

// 2. Use in your app
function MyApp() {
  return (
    <div>
      <RCAGraphViewer graph={myGraph} />
    </div>
  );
}
```

### With Hooks

```tsx
import { useRCAGraph, useTimeline, useChat } from '@adapt/ui-toolkit';

function IncidentDashboard({ incidentId }) {
  // Fetch data automatically
  const { graph, loading: graphLoading } = useRCAGraph(incidentId);
  const { timeline } = useTimeline(incidentId);
  const { messages, sendMessage } = useChat(incidentId);

  if (graphLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <RCAGraphViewer graph={graph} />
      <TimelineViewer timeline={timeline} />
      <ChatInterface
        messages={messages}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
```

### Custom API Client

```tsx
import { AdaptAPIClient } from '@adapt/ui-toolkit';

// Configure your backend endpoint
const client = new AdaptAPIClient('https://your-api.com');

// Use with hooks
function MyComponent() {
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    client.getRCAGraph('inc-123').then(response => {
      if (response.success) {
        setGraph(response.data);
      }
    });
  }, []);

  return <RCAGraphViewer graph={graph} />;
}
```

## Non-React Applications

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@adapt/ui-toolkit/dist/style.css">
</head>
<body>
  <div id="rca-graph"></div>

  <script src="https://unpkg.com/@adapt/ui-toolkit/dist/index.js"></script>
  <script>
    // Create widget
    const widget = new AdaptUI.GraphWidget(
      '#rca-graph',
      'incident-123',
      {
        height: '600px',
        apiEndpoint: 'https://your-api.com'
      }
    );

    // Later cleanup
    // widget.destroy();
  </script>
</body>
</html>
```

### Vue.js

```vue
<template>
  <div>
    <div ref="graphContainer"></div>
  </div>
</template>

<script>
import { GraphWidget } from '@adapt/ui-toolkit';
import '@adapt/ui-toolkit/styles';

export default {
  props: ['incidentId'],
  data() {
    return {
      widget: null
    };
  },
  mounted() {
    this.widget = new GraphWidget(
      this.$refs.graphContainer,
      this.incidentId,
      { height: '600px' }
    );
  },
  beforeUnmount() {
    if (this.widget) {
      this.widget.destroy();
    }
  }
};
</script>
```

### Angular

```typescript
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { GraphWidget } from '@adapt/ui-toolkit';

@Component({
  selector: 'app-rca-graph',
  template: '<div #graphContainer></div>',
  styleUrls: ['@adapt/ui-toolkit/styles']
})
export class RcaGraphComponent implements OnInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) container!: ElementRef;
  private widget: GraphWidget | null = null;

  ngOnInit() {
    this.widget = new GraphWidget(
      this.container.nativeElement,
      'incident-123',
      { height: '600px' }
    );
  }

  ngOnDestroy() {
    this.widget?.destroy();
  }
}
```

## Embedded Widgets

### Quick Embed Pattern

```html
<!-- 1. Include styles -->
<link rel="stylesheet" href="adapt-ui.css">

<!-- 2. Add containers -->
<div id="graph"></div>
<div id="timeline"></div>
<div id="chat"></div>

<!-- 3. Include script -->
<script src="adapt-ui.js"></script>

<!-- 4. Initialize -->
<script>
  // Configure API
  AdaptUI.configure({
    apiEndpoint: 'https://your-api.com'
  });

  // Create widgets
  AdaptUI.createWidget.graph('#graph', 'incident-123');
  AdaptUI.createWidget.timeline('#timeline', 'incident-123');
  AdaptUI.createWidget.chat('#chat', 'incident-123');
</script>
```

### iframe Embedding

```html
<!-- Host the demo app and embed -->
<iframe
  src="https://your-domain.com/adapt-ui?incident=123"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

### PostMessage Communication

```javascript
// In parent page
const iframe = document.getElementById('adapt-ui-frame');

// Send incident ID
iframe.contentWindow.postMessage({
  type: 'LOAD_INCIDENT',
  incidentId: 'inc-123'
}, '*');

// Listen for events
window.addEventListener('message', (event) => {
  if (event.data.type === 'NODE_CLICKED') {
    console.log('Node clicked:', event.data.nodeId);
  }
});
```

## Dashboard Integration

### Grafana Plugin

```typescript
// Custom Grafana panel
import { PanelPlugin } from '@grafana/data';
import { GraphWidget } from '@adapt/ui-toolkit';

export const plugin = new PanelPlugin(AdaptRCAPanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'incidentId',
      name: 'Incident ID',
      defaultValue: '',
    });
});

class AdaptRCAPanel extends React.Component {
  componentDidMount() {
    const { options } = this.props;
    this.widget = new GraphWidget(
      this.containerRef.current,
      options.incidentId
    );
  }

  render() {
    return <div ref={this.containerRef} />;
  }
}
```

### Datadog Dashboard Widget

```javascript
// Custom Datadog widget
window.DD_RUM && window.DD_RUM.init({
  applicationId: 'your-app-id',
  clientToken: 'your-token',
});

// Embed ADAPT-UI
const container = document.getElementById('custom-widget');
const widget = new AdaptUI.GraphWidget(
  container,
  getCurrentIncidentId(),
  {
    apiEndpoint: 'https://your-api.com',
    theme: 'dark'
  }
);
```

## Authentication

### Bearer Token

```typescript
import { AdaptAPIClient } from '@adapt/ui-toolkit';

const client = new AdaptAPIClient('https://your-api.com');

// Override fetch to add auth
const originalFetch = client.fetch.bind(client);
client.fetch = async function(endpoint, options = {}) {
  return originalFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${getToken()}`
    }
  });
};
```

### Session Cookies

Cookies are automatically sent with same-origin requests. For cross-origin:

```typescript
const client = new AdaptAPIClient('https://your-api.com');

// Enable credentials
const originalFetch = client.fetch.bind(client);
client.fetch = async function(endpoint, options = {}) {
  return originalFetch(endpoint, {
    ...options,
    credentials: 'include'
  });
};
```

### API Key

```typescript
import { AdaptAPIClient } from '@adapt/ui-toolkit';

const client = new AdaptAPIClient('https://your-api.com');

// Add API key header
const originalFetch = client.fetch.bind(client);
client.fetch = async function(endpoint, options = {}) {
  return originalFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'X-API-Key': 'your-api-key'
    }
  });
};
```

## Real-time Updates

### WebSocket Connection

```typescript
import { AdaptAPIClient } from '@adapt/ui-toolkit';

const client = new AdaptAPIClient('https://your-api.com');

// Connect to WebSocket
client.connectWebSocket(
  'incident-123',
  (data) => {
    // Handle updates
    if (data.type === 'insight') {
      addInsight(data.payload);
    }
  },
  (error) => {
    console.error('WebSocket error:', error);
  }
);

// Cleanup
window.addEventListener('beforeunload', () => {
  client.disconnectWebSocket();
});
```

### Server-Sent Events (Alternative)

```typescript
const eventSource = new EventSource('https://your-api.com/stream/incident-123');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateInsights(data);
};

eventSource.onerror = () => {
  console.error('SSE connection failed');
  eventSource.close();
};
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const RCAGraphViewer = lazy(() => import('@adapt/ui-toolkit').then(m => ({
  default: m.RCAGraphViewer
})));

function MyApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RCAGraphViewer graph={graph} />
    </Suspense>
  );
}
```

### Bundle Size Optimization

```javascript
// Import only what you need
import { RCAGraphViewer } from '@adapt/ui-toolkit/components/Graph';
import { useRCAGraph } from '@adapt/ui-toolkit/hooks';

// Instead of
import { RCAGraphViewer, useRCAGraph } from '@adapt/ui-toolkit';
```

### Caching Strategy

```typescript
import { AdaptAPIClient } from '@adapt/ui-toolkit';

const cache = new Map();

const client = new AdaptAPIClient('https://your-api.com');

// Wrap with cache
async function getCachedGraph(incidentId) {
  if (cache.has(incidentId)) {
    return cache.get(incidentId);
  }

  const response = await client.getRCAGraph(incidentId);
  if (response.success) {
    cache.set(incidentId, response.data);
    return response.data;
  }
}
```

## Troubleshooting

### CORS Issues

If you see CORS errors, configure your backend:

```javascript
// Express example
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}));
```

### WebSocket Connection Failures

Check your WebSocket URL and protocol:

```typescript
// Use wss:// for HTTPS sites
const client = new AdaptAPIClient('https://your-api.com');
// WebSocket will use wss://your-api.com
```

### Missing Styles

Ensure CSS is imported:

```typescript
// In your app entry point
import '@adapt/ui-toolkit/styles';
```

Or include via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@adapt/ui-toolkit/dist/style.css">
```

## Examples

See the `/examples` directory for complete integration examples:

- React SPA
- Next.js app
- Vue.js app
- Angular app
- Vanilla JavaScript
- iframe embedding
- Grafana plugin
- Datadog widget
