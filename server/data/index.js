// Synthetic data for ADAPT-UI Demo

export const incidents = [
  {
    id: 'inc-001',
    title: 'Database Connection Pool Exhaustion',
    description: 'Users experiencing timeouts and connection errors when accessing the application',
    severity: 'critical',
    status: 'investigating',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    affectedSystems: ['api-gateway', 'user-service', 'postgres-db'],
    tags: ['database', 'performance', 'timeout'],
  },
  {
    id: 'inc-002',
    title: 'Memory Leak in Payment Service',
    description: 'Payment service pods restarting due to OOM errors',
    severity: 'high',
    status: 'investigating',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    affectedSystems: ['payment-service', 'kubernetes'],
    tags: ['memory', 'crash', 'payment'],
  },
];

const rcaGraphs = {
  'inc-001': {
    nodes: [
      {
        id: 'symptom-1',
        type: 'symptom',
        label: 'Connection Timeouts',
        description: 'Users experiencing 504 Gateway Timeout errors',
        status: 'completed',
        severity: 'critical',
        confidence: 95,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 'hypothesis-1',
        type: 'hypothesis',
        label: 'Database Pool Exhaustion',
        description: 'Connection pool may be saturated',
        status: 'completed',
        confidence: 85,
        timestamp: '2024-01-15T10:35:00Z',
      },
      {
        id: 'hypothesis-2',
        type: 'hypothesis',
        label: 'Slow Query Performance',
        description: 'Queries taking too long to execute',
        status: 'completed',
        confidence: 70,
        timestamp: '2024-01-15T10:37:00Z',
      },
      {
        id: 'test-1',
        type: 'test',
        label: 'Check Pool Metrics',
        description: 'Query database connection pool status',
        status: 'completed',
        timestamp: '2024-01-15T10:40:00Z',
      },
      {
        id: 'test-2',
        type: 'test',
        label: 'Analyze Query Logs',
        description: 'Review slow query logs for patterns',
        status: 'completed',
        timestamp: '2024-01-15T10:42:00Z',
      },
      {
        id: 'finding-1',
        type: 'finding',
        label: 'Pool at 100% Capacity',
        description: 'All 50 connections in use, new requests queuing',
        status: 'completed',
        severity: 'critical',
        confidence: 95,
        timestamp: '2024-01-15T10:45:00Z',
      },
      {
        id: 'finding-2',
        type: 'finding',
        label: 'Long-Running Transactions',
        description: 'Multiple transactions holding connections for > 30s',
        status: 'completed',
        severity: 'high',
        confidence: 90,
        timestamp: '2024-01-15T10:47:00Z',
      },
      {
        id: 'remediation-1',
        type: 'remediation',
        label: 'Increase Pool Size',
        description: 'Scale connection pool from 50 to 100',
        status: 'in_progress',
        timestamp: '2024-01-15T10:50:00Z',
      },
      {
        id: 'remediation-2',
        type: 'remediation',
        label: 'Add Transaction Timeout',
        description: 'Implement 10s timeout for idle transactions',
        status: 'pending',
        timestamp: '2024-01-15T10:52:00Z',
      },
    ],
    edges: [
      { id: 'e1', source: 'symptom-1', target: 'hypothesis-1', type: 'suggests', confidence: 85 },
      { id: 'e2', source: 'symptom-1', target: 'hypothesis-2', type: 'suggests', confidence: 70 },
      { id: 'e3', source: 'hypothesis-1', target: 'test-1', type: 'tests', confidence: 90 },
      { id: 'e4', source: 'hypothesis-2', target: 'test-2', type: 'tests', confidence: 85 },
      { id: 'e5', source: 'test-1', target: 'finding-1', type: 'leads_to', confidence: 95 },
      { id: 'e6', source: 'test-2', target: 'finding-2', type: 'leads_to', confidence: 90 },
      { id: 'e7', source: 'finding-1', target: 'remediation-1', type: 'suggests', confidence: 90 },
      { id: 'e8', source: 'finding-2', target: 'remediation-2', type: 'suggests', confidence: 85 },
    ],
    metadata: {
      incidentId: 'inc-001',
      title: 'Database Connection Pool Exhaustion RCA',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      status: 'analyzing',
    },
  },
};

const timelines = {
  'inc-001': {
    events: [
      {
        id: 'evt-1',
        timestamp: '2024-01-15T10:15:00Z',
        type: 'change',
        severity: 'info',
        title: 'Deployment: user-service v2.4.0',
        description: 'New version deployed to production',
        source: 'CI/CD',
      },
      {
        id: 'evt-2',
        timestamp: '2024-01-15T10:25:00Z',
        type: 'metric',
        severity: 'medium',
        title: 'Database CPU Usage Spike',
        description: 'CPU usage increased from 40% to 75%',
        source: 'Prometheus',
        correlatedEvents: ['evt-3'],
      },
      {
        id: 'evt-3',
        timestamp: '2024-01-15T10:28:00Z',
        type: 'anomaly',
        severity: 'high',
        title: 'Connection Pool Saturation',
        description: 'Active connections reached maximum capacity',
        source: 'Database Monitor',
        correlatedEvents: ['evt-2', 'evt-4'],
      },
      {
        id: 'evt-4',
        timestamp: '2024-01-15T10:30:00Z',
        type: 'alert',
        severity: 'critical',
        title: 'High Error Rate Alert',
        description: '504 errors exceeded threshold (>5%)',
        source: 'AlertManager',
        correlatedEvents: ['evt-3'],
      },
      {
        id: 'evt-5',
        timestamp: '2024-01-15T10:32:00Z',
        type: 'incident',
        severity: 'critical',
        title: 'Incident Created',
        description: 'Database Connection Pool Exhaustion incident created',
        source: 'PagerDuty',
      },
    ],
    timeRange: {
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z',
    },
  },
};

const chatSessions = {
  'inc-001': {
    id: 'chat-001',
    incidentId: 'inc-001',
    messages: [
      {
        id: 'msg-1',
        role: 'system',
        content: 'RCA analysis initiated for incident: Database Connection Pool Exhaustion',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 'msg-2',
        role: 'agent',
        content: 'I\'ve identified the primary symptom: users are experiencing 504 Gateway Timeout errors. Let me analyze the database connection pool metrics.',
        timestamp: '2024-01-15T10:35:00Z',
        metadata: {
          agentName: 'Database Analyzer',
          confidence: 90,
        },
      },
      {
        id: 'msg-3',
        role: 'agent',
        content: 'Analysis complete. The connection pool is at 100% capacity with all 50 connections in use. Additionally, I found multiple long-running transactions (>30s) holding connections.',
        timestamp: '2024-01-15T10:45:00Z',
        metadata: {
          agentName: 'Database Analyzer',
          confidence: 95,
          sourceNodes: ['finding-1', 'finding-2'],
        },
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: 'I recommend two immediate actions:\n1. Increase the connection pool size from 50 to 100\n2. Implement a 10-second timeout for idle transactions\n\nWould you like me to prepare the remediation plan?',
        timestamp: '2024-01-15T10:50:00Z',
        metadata: {
          confidence: 90,
        },
      },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:50:00Z',
  },
};

const insightStreams = {
  'inc-001': {
    incidentId: 'inc-001',
    isLive: true,
    insights: [
      {
        id: 'insight-1',
        agentName: 'Symptom Detector',
        type: 'finding',
        content: 'Detected 504 Gateway Timeout errors affecting 12% of requests',
        timestamp: '2024-01-15T10:31:00Z',
        confidence: 95,
      },
      {
        id: 'insight-2',
        agentName: 'Database Analyzer',
        type: 'hypothesis',
        content: 'Hypothesis: Connection pool exhaustion due to increased load or connection leaks',
        timestamp: '2024-01-15T10:35:00Z',
        confidence: 85,
        relatedNodes: ['hypothesis-1'],
      },
      {
        id: 'insight-3',
        agentName: 'Metrics Analyzer',
        type: 'finding',
        content: 'Connection pool utilization at 100% - all 50 connections active',
        timestamp: '2024-01-15T10:40:00Z',
        confidence: 98,
        relatedNodes: ['finding-1'],
      },
      {
        id: 'insight-4',
        agentName: 'Query Analyzer',
        type: 'finding',
        content: 'Found 8 transactions running for more than 30 seconds',
        timestamp: '2024-01-15T10:45:00Z',
        confidence: 92,
        relatedNodes: ['finding-2'],
      },
      {
        id: 'insight-5',
        agentName: 'Remediation Planner',
        type: 'recommendation',
        content: 'Recommend increasing pool size to 100 and implementing transaction timeout',
        timestamp: '2024-01-15T10:50:00Z',
        confidence: 88,
        relatedNodes: ['remediation-1', 'remediation-2'],
      },
    ],
  },
};

const remediationPlans = {
  'inc-001': {
    id: 'plan-001',
    incidentId: 'inc-001',
    title: 'Database Connection Pool Recovery Plan',
    description: 'Steps to resolve connection pool exhaustion and prevent recurrence',
    steps: [
      {
        id: 'step-1',
        order: 1,
        title: 'Increase Connection Pool Size',
        description: 'Scale the database connection pool from 50 to 100 connections to handle current load',
        type: 'manual',
        status: 'in_progress',
        estimatedDuration: '5 minutes',
        command: 'kubectl set env deployment/api-gateway DB_POOL_SIZE=100',
        documentation: 'https://docs.example.com/database/connection-pooling',
        risks: ['May increase database memory usage', 'Requires pod restart'],
        prerequisites: ['Verify database can handle 100 connections', 'Ensure sufficient resources'],
      },
      {
        id: 'step-2',
        order: 2,
        title: 'Implement Transaction Timeout',
        description: 'Add 10-second timeout for idle transactions to prevent connection hoarding',
        type: 'manual',
        status: 'pending',
        estimatedDuration: '10 minutes',
        command: 'kubectl set env deployment/api-gateway DB_IDLE_TRANSACTION_TIMEOUT=10000',
        documentation: 'https://docs.example.com/database/timeouts',
        risks: ['May interrupt legitimate long-running operations'],
        prerequisites: ['Review application for long transactions', 'Coordinate with app team'],
      },
      {
        id: 'step-3',
        order: 3,
        title: 'Monitor Pool Metrics',
        description: 'Verify that pool utilization returns to normal levels (<80%)',
        type: 'verification',
        status: 'pending',
        estimatedDuration: '15 minutes',
        documentation: 'https://docs.example.com/monitoring/database',
      },
      {
        id: 'step-4',
        order: 4,
        title: 'Add Connection Pool Alerts',
        description: 'Configure alerts for pool utilization >80% to detect future issues early',
        type: 'automated',
        status: 'pending',
        estimatedDuration: '5 minutes',
        documentation: 'https://docs.example.com/alerting/setup',
      },
      {
        id: 'step-5',
        order: 5,
        title: 'Review and Optimize Slow Queries',
        description: 'Analyze and optimize the identified slow queries to reduce connection hold time',
        type: 'manual',
        status: 'pending',
        estimatedDuration: '2 hours',
        documentation: 'https://docs.example.com/database/query-optimization',
      },
    ],
    estimatedTotalDuration: '2.5 hours',
    createdAt: '2024-01-15T10:50:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    status: 'in_progress',
  },
};

// Helper functions
export const getIncident = (id) => incidents.find(i => i.id === id);
export const getRCAGraph = (incidentId) => rcaGraphs[incidentId];
export const getTimeline = (incidentId) => timelines[incidentId];
export const getChatSession = (incidentId) => chatSessions[incidentId];
export const getInsights = (incidentId) => insightStreams[incidentId];
export const getRemediationPlan = (incidentId) => remediationPlans[incidentId];

export const sendMessage = (incidentId, message) => {
  const session = chatSessions[incidentId];
  if (!session) return null;

  const userMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };

  const assistantMessage = {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content: 'I\'m analyzing your question. Based on the current RCA graph, I can provide insights about the connection pool exhaustion issue.',
    timestamp: new Date().toISOString(),
    metadata: {
      confidence: 85,
    },
  };

  session.messages.push(userMessage, assistantMessage);
  session.updatedAt = new Date().toISOString();

  // Return both messages so client can stay in sync
  return { userMessage, assistantMessage };
};

export const updateStepStatus = (incidentId, stepId, status) => {
  const plan = remediationPlans[incidentId];
  if (!plan) return false;

  const step = plan.steps.find(s => s.id === stepId);
  if (!step) return false;

  step.status = status;
  plan.updatedAt = new Date().toISOString();

  return true;
};
