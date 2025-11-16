import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { URL } from 'url';
import {
  incidents,
  getIncident,
  getRCAGraph,
  getTimeline,
  getChatSession,
  sendMessage,
  getInsights,
  getRemediationPlan,
  updateStepStatus,
} from './data/index.js';

const app = express();
const server = createServer(app);

// WebSocket server with path filtering
const wss = new WebSocketServer({
  server,
  path: '/ws',
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket handling
const clients = new Map();

wss.on('connection', (ws, req) => {
  // Proper URL parsing to extract incident ID
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const incidentId = pathParts[pathParts.length - 1];

  console.log(`WebSocket client connected for incident: ${incidentId}`);

  if (!incidentId || incidentId === 'ws') {
    ws.close(1008, 'Missing incident ID in path');
    return;
  }

  clients.set(incidentId, ws);

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    incidentId,
    timestamp: new Date().toISOString(),
  }));

  // Simulate live insights
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'insight',
        payload: {
          id: `insight-${Date.now()}`,
          agentName: 'Live Agent',
          type: 'progress',
          content: 'Analyzing system metrics...',
          timestamp: new Date().toISOString(),
          confidence: Math.floor(Math.random() * 30) + 70,
        },
      }));
    } else {
      clearInterval(interval);
    }
  }, 10000); // Send update every 10 seconds

  ws.on('error', (error) => {
    console.error(`WebSocket error for incident ${incidentId}:`, error);
  });

  ws.on('close', () => {
    clearInterval(interval);
    clients.delete(incidentId);
    console.log(`WebSocket client disconnected for incident: ${incidentId}`);
  });
});

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Incidents
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = getIncident(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// RCA Graph
app.get('/api/rca/:incidentId/graph', (req, res) => {
  const graph = getRCAGraph(req.params.incidentId);
  if (!graph) {
    return res.status(404).json({ error: 'RCA graph not found' });
  }
  res.json(graph);
});

// Timeline
app.get('/api/rca/:incidentId/timeline', (req, res) => {
  const timeline = getTimeline(req.params.incidentId);
  if (!timeline) {
    return res.status(404).json({ error: 'Timeline not found' });
  }
  res.json(timeline);
});

// Chat
app.get('/api/chat/:incidentId', (req, res) => {
  const session = getChatSession(req.params.incidentId);
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  res.json(session);
});

app.post('/api/chat/:incidentId/message', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const result = sendMessage(req.params.incidentId, message);
  if (!result) {
    return res.status(404).json({ error: 'Chat session not found' });
  }

  res.json(result);
});

// Insights
app.get('/api/insights/:incidentId', (req, res) => {
  const insights = getInsights(req.params.incidentId);
  if (!insights) {
    return res.status(404).json({ error: 'Insights not found' });
  }
  res.json(insights);
});

// Remediation
app.get('/api/remediation/:incidentId', (req, res) => {
  const plan = getRemediationPlan(req.params.incidentId);
  if (!plan) {
    return res.status(404).json({ error: 'Remediation plan not found' });
  }
  res.json(plan);
});

app.patch('/api/remediation/:incidentId/steps/:stepId', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const success = updateStepStatus(req.params.incidentId, req.params.stepId, status);
  if (!success) {
    return res.status(404).json({ error: 'Step not found' });
  }

  res.json({ success: true });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 ADAPT-UI Mock API Server running on http://localhost:${PORT}`);
  console.log(`   WebSocket endpoint: ws://localhost:${PORT}/ws/:incidentId`);
});
