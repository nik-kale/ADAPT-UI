# ADAPT-UI: Agentic RCA Visualization & AI Assistant Toolkit

> A comprehensive front-end toolkit for integrating agentic AI-driven root-cause analysis (RCA) into product surfaces, dashboards, and support workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)

## 📖 Overview

ADAPT-UI provides modular, production-ready UI components for visualizing and interacting with AI-driven root-cause analysis. The toolkit enables teams to create rich, explainable diagnostics interfaces that can be embedded into portals, dashboards, or in-product overlays.

### Key Features

- **🔍 RCA Graph Visualization** - Interactive causal graphs showing symptoms, hypotheses, tests, findings, and remediation paths
- **⏱️ Event Timeline** - Correlated anomalies, alerts, and changes with filtering capabilities
- **💬 AI Assistant Chat** - Natural language interface for diagnostic conversations
- **💡 Live Insights Panel** - Real-time agent outputs and analysis progress
- **🔧 Remediation Viewer** - Step-by-step remediation plans with execution tracking
- **🎨 Embeddable Widgets** - Drop-in components for any web application
- **📊 Synthetic Demo Data** - Complete example flows without backend dependencies

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

## 📦 Components

### RCAGraphViewer

Visualize causal analysis graphs with automatic layout and interactive nodes.

```tsx
import { RCAGraphViewer } from '@adapt/ui-toolkit';

<RCAGraphViewer
  graph={rcaGraph}
  config={{
    layout: 'hierarchical',
    height: '600px',
    enableZoom: true,
  }}
  onNodeClick={(nodeId) => handleNodeClick(nodeId)}
/>
```

### TimelineViewer

Display correlated events, anomalies, and changes in chronological order.

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

### ChatInterface

AI-powered diagnostic assistant interface.

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

### InsightsPanel

Live feed of agent analysis and discoveries.

```tsx
import { InsightsPanel } from '@adapt/ui-toolkit';

<InsightsPanel
  insights={insights}
  isLive={true}
  config={{ height: '600px' }}
/>
```

### RemediationViewer

Step-by-step remediation plan with execution tracking.

```tsx
import { RemediationViewer } from '@adapt/ui-toolkit';

<RemediationViewer
  plan={remediationPlan}
  onStepStatusChange={(stepId, status) => updateStep(stepId, status)}
/>
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
┌─────────────────────────────────────────────────────────────┐
│                     ADAPT-UI Toolkit                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Graph      │  │   Timeline   │  │     Chat     │     │
│  │   Viewer     │  │    Viewer    │  │  Interface   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Insights   │  │ Remediation  │                        │
│  │    Panel     │  │    Viewer    │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     React Hooks Layer                       │
│   useRCAGraph | useTimeline | useChat | useInsights        │
├─────────────────────────────────────────────────────────────┤
│                      API Client Layer                       │
│        AdaptAPIClient (REST + WebSocket support)            │
├─────────────────────────────────────────────────────────────┤
│                    Backend / Data Source                    │
│         (Your RCA Engine, Telemetry, AI Agents)             │
└─────────────────────────────────────────────────────────────┘
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

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Component Catalog](docs/component-catalog.md)
- [Embedding Guide](docs/embedding-guide.md)
- [Theming Guide](docs/theming.md)
- [API Reference](docs/api-reference.md)

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
