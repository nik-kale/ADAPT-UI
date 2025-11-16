// Core RCA Types

export type NodeType = 'symptom' | 'hypothesis' | 'test' | 'finding' | 'remediation' | 'dependency';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type NodeStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

export interface RCANode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  status: NodeStatus;
  severity?: Severity;
  confidence?: number; // 0-100
  timestamp: string;
  metadata?: Record<string, any>;
  data?: Record<string, any>;
}

export interface RCAEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'causes' | 'tests' | 'leads_to' | 'depends_on' | 'suggests';
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface RCAGraph {
  nodes: RCANode[];
  edges: RCAEdge[];
  metadata: {
    incidentId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    status: 'analyzing' | 'complete' | 'partial';
  };
}

// Timeline Types

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'anomaly' | 'alert' | 'change' | 'incident' | 'metric' | 'log';
  severity: Severity;
  title: string;
  description: string;
  source?: string;
  metadata?: Record<string, any>;
  correlatedEvents?: string[];
}

export interface TimelineData {
  events: TimelineEvent[];
  timeRange: {
    start: string;
    end: string;
  };
  metadata?: Record<string, any>;
}

// Chat Types

export type MessageRole = 'user' | 'assistant' | 'system' | 'agent';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    agentName?: string;
    confidence?: number;
    sourceNodes?: string[];
    relatedFindings?: string[];
  };
}

export interface ChatSession {
  id: string;
  incidentId: string;
  messages: ChatMessage[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Insights Types

export interface AgentInsight {
  id: string;
  agentName: string;
  type: 'hypothesis' | 'finding' | 'recommendation' | 'question' | 'progress';
  content: string;
  timestamp: string;
  confidence?: number;
  relatedNodes?: string[];
  metadata?: Record<string, any>;
}

export interface InsightStream {
  incidentId: string;
  insights: AgentInsight[];
  isLive: boolean;
}

// Remediation Types

export interface RemediationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'manual' | 'automated' | 'verification';
  status: NodeStatus;
  estimatedDuration?: string;
  command?: string;
  documentation?: string;
  risks?: string[];
  prerequisites?: string[];
}

export interface RemediationPlan {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  steps: RemediationStep[];
  estimatedTotalDuration?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

// Telemetry & Metrics Types

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  unit?: string;
  tags?: Record<string, string>;
}

export interface MetricSeries {
  name: string;
  data: Metric[];
  metadata?: {
    aggregation?: 'avg' | 'sum' | 'min' | 'max';
    interval?: string;
  };
}

export interface Anomaly {
  id: string;
  metricName: string;
  timestamp: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: Severity;
  description?: string;
}

// Incident Types

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  affectedSystems?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

// API Response Types

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

// Widget Configuration Types

export interface WidgetConfig {
  theme?: 'light' | 'dark';
  height?: string | number;
  width?: string | number;
  apiEndpoint?: string;
  refreshInterval?: number;
  enableRealtime?: boolean;
  customStyles?: Record<string, any>;
}

export interface GraphWidgetConfig extends WidgetConfig {
  layout?: 'hierarchical' | 'force' | 'radial' | 'dagre';
  nodeSize?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}

export interface TimelineWidgetConfig extends WidgetConfig {
  showAnomalies?: boolean;
  groupByType?: boolean;
  enableFilters?: boolean;
}

export interface ChatWidgetConfig extends WidgetConfig {
  placeholder?: string;
  enableAutoScroll?: boolean;
  maxMessages?: number;
  showTimestamps?: boolean;
}
