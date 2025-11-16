# Demo Flows

Interactive demonstration scenarios for ADAPT-UI.

## Flow 1: Database Connection Pool Exhaustion

This scenario demonstrates a complete RCA process for a critical production incident.

### User Journey

1. **Incident Selection**
   - User selects "Database Connection Pool Exhaustion" from dropdown
   - System loads incident metadata (severity: critical, status: investigating)

2. **RCA Graph View**
   - Graph loads with animation showing 9 nodes
   - Nodes arranged hierarchically:
     - Symptom → Hypotheses → Tests → Findings → Remediations
   - User can:
     - Click nodes to see details
     - Zoom and pan the graph
     - Use minimap for navigation
   - Live status indicator shows "analyzing"

3. **Timeline Exploration**
   - User switches to Timeline tab
   - Events displayed chronologically:
     - Deployment event (10:15)
     - CPU spike metric (10:25)
     - Pool saturation anomaly (10:28)
     - Error rate alert (10:30)
     - Incident creation (10:32)
   - User can:
     - Filter by event type (anomaly, alert, change)
     - Filter by severity
     - Click events to see correlation

4. **Chat with AI Assistant**
   - User switches to Chat tab
   - Sees initial analysis message from Database Analyzer agent
   - User asks: "What caused the connection pool to fill up?"
   - Assistant responds with findings about long-running transactions
   - User asks: "How do we fix this?"
   - Assistant suggests remediation steps

5. **Live Insights**
   - User switches to Insights tab
   - Sees stream of agent discoveries:
     - Symptom detection
     - Hypothesis generation
     - Test execution
     - Finding confirmation
     - Recommendation creation
   - Live indicator shows real-time updates
   - Confidence scores displayed for each insight

6. **Remediation Execution**
   - User switches to Remediation tab
   - Sees 5-step remediation plan
   - Progress bar shows 1/5 steps complete
   - User expands Step 1: "Increase Connection Pool Size"
     - Sees command to execute
     - Sees prerequisites and risks
     - Clicks "Start" button
     - Status changes to "in progress"
   - User expands Step 2: "Implement Transaction Timeout"
     - Reviews command and documentation
     - Plans next action

### Key Interactions

- **Node Click**: Shows node details in sidebar
- **Event Correlation**: Clicking correlated events highlights them
- **Message Send**: Chat response appears after 1-2 second delay
- **Real-time Updates**: New insights appear every 10 seconds
- **Step Status Change**: Updates progress bar and UI

### Expected User Outcomes

- Understanding of RCA process flow
- Confidence in AI-driven analysis
- Clear remediation path
- Actionable next steps

## Flow 2: Real-time Analysis

Demonstrates live agent analysis with WebSocket updates.

### Setup

1. Start demo application
2. Start mock API server with WebSocket enabled
3. Select incident
4. Navigate to Insights tab

### Experience

- User sees "Live" indicator
- New insights appear automatically
- Insights animate in with fade effect
- Chat receives periodic agent updates
- Graph nodes update status in real-time
- Timeline shows new events as they occur

### WebSocket Message Types

```javascript
// Insight message
{
  type: 'insight',
  payload: {
    id: 'insight-123',
    agentName: 'Database Analyzer',
    type: 'finding',
    content: 'Detected connection leak in error path',
    timestamp: '2024-01-15T10:45:00Z',
    confidence: 92
  }
}

// Graph update
{
  type: 'graph_update',
  payload: {
    nodeId: 'finding-3',
    status: 'completed'
  }
}

// Remediation update
{
  type: 'remediation_update',
  payload: {
    stepId: 'step-1',
    status: 'completed'
  }
}
```

## Flow 3: Widget Embedding

Demonstrates embedding individual components.

### HTML Embedding

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="adapt-ui.css">
</head>
<body>
  <h1>My Dashboard</h1>

  <!-- RCA Graph Widget -->
  <div id="rca-graph"></div>

  <!-- Timeline Widget -->
  <div id="timeline"></div>

  <script src="adapt-ui.js"></script>
  <script>
    // Initialize widgets
    AdaptUI.createWidget.graph('#rca-graph', 'inc-001', {
      height: '600px'
    });

    AdaptUI.createWidget.timeline('#timeline', 'inc-001', {
      height: '400px'
    });
  </script>
</body>
</html>
```

### React Embedding

```tsx
import { RCAGraphViewer, TimelineViewer } from '@adapt/ui-toolkit';
import { useRCAGraph, useTimeline } from '@adapt/ui-toolkit';

function Dashboard() {
  const { graph } = useRCAGraph('inc-001');
  const { timeline } = useTimeline('inc-001');

  return (
    <div className="grid grid-cols-2 gap-4">
      <RCAGraphViewer graph={graph} />
      <TimelineViewer timeline={timeline} />
    </div>
  );
}
```

## Flow 4: Custom Integration

Demonstrates integration with custom backend.

### Backend Setup

```javascript
// Your custom RCA engine
app.get('/api/rca/:id/graph', async (req, res) => {
  const graph = await myRCAEngine.analyze(req.params.id);

  // Transform to ADAPT-UI format
  const adaptGraph = {
    nodes: graph.nodes.map(n => ({
      id: n.id,
      type: mapNodeType(n.type),
      label: n.label,
      description: n.description,
      status: n.status,
      confidence: n.confidence,
      timestamp: n.timestamp,
    })),
    edges: graph.edges.map(e => ({
      id: e.id,
      source: e.from,
      target: e.to,
      type: 'suggests',
    })),
    metadata: {
      incidentId: req.params.id,
      title: graph.title,
      createdAt: graph.createdAt,
      updatedAt: graph.updatedAt,
      status: 'analyzing',
    },
  };

  res.json(adaptGraph);
});
```

### Frontend Integration

```tsx
import { AdaptAPIClient, RCAGraphViewer } from '@adapt/ui-toolkit';

// Point to your backend
const client = new AdaptAPIClient('https://your-api.com');

function MyComponent({ incidentId }) {
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    client.getRCAGraph(incidentId).then(response => {
      if (response.success) {
        setGraph(response.data);
      }
    });
  }, [incidentId]);

  return <RCAGraphViewer graph={graph} />;
}
```

## Flow 5: Multi-Incident Comparison

Demonstrates comparing multiple incidents side-by-side.

```tsx
function IncidentComparison() {
  const { graph: graph1 } = useRCAGraph('inc-001');
  const { graph: graph2 } = useRCAGraph('inc-002');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h2>Incident 1: Database Pool</h2>
        <RCAGraphViewer graph={graph1} />
      </div>
      <div>
        <h2>Incident 2: Memory Leak</h2>
        <RCAGraphViewer graph={graph2} />
      </div>
    </div>
  );
}
```

## Performance Benchmarks

Expected performance for typical usage:

| Component | Initial Load | Re-render | Memory Usage |
|-----------|--------------|-----------|--------------|
| RCAGraphViewer (50 nodes) | 200ms | 50ms | ~15MB |
| TimelineViewer (100 events) | 100ms | 30ms | ~5MB |
| ChatInterface (50 messages) | 80ms | 20ms | ~3MB |
| InsightsPanel (100 insights) | 90ms | 25ms | ~4MB |
| RemediationViewer (10 steps) | 60ms | 15ms | ~2MB |

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (responsive design)

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Screen reader tested
- Color contrast WCAG AA compliant
- Focus indicators
- Reduced motion support
