import { z } from 'zod';

// Node Status Schema
export const nodeStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed', 'blocked']);

// Node Type Schema
export const nodeTypeSchema = z.enum(['symptom', 'hypothesis', 'test', 'finding', 'remediation']);

// Severity Schema
export const severitySchema = z.enum(['low', 'medium', 'high', 'critical']);

// RCA Node Schema
export const rcaNodeSchema = z.object({
  id: z.string(),
  type: nodeTypeSchema,
  label: z.string(),
  description: z.string(),
  status: nodeStatusSchema,
  severity: severitySchema.optional(),
  confidence: z.number().min(0).max(100).optional(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

// RCA Edge Schema
export const rcaEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
  confidence: z.number().min(0).max(100).optional(),
  label: z.string().optional(),
});

// RCA Graph Schema
export const rcaGraphSchema = z.object({
  nodes: z.array(rcaNodeSchema),
  edges: z.array(rcaEdgeSchema),
  metadata: z.object({
    incidentId: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    status: z.string(),
  }),
});

// Timeline Event Schema
export const timelineEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['alert', 'metric', 'change', 'incident', 'anomaly']),
  severity: severitySchema,
  title: z.string(),
  description: z.string(),
  source: z.string(),
  correlatedEvents: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Timeline Data Schema
export const timelineDataSchema = z.object({
  events: z.array(timelineEventSchema),
  timeRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

// Chat Message Schema
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'agent', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Chat Session Schema
export const chatSessionSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  messages: z.array(chatMessageSchema),
  status: z.enum(['active', 'closed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Agent Insight Schema
export const agentInsightSchema = z.object({
  id: z.string(),
  agentName: z.string(),
  type: z.enum(['finding', 'hypothesis', 'recommendation', 'analysis']),
  content: z.string(),
  timestamp: z.string(),
  confidence: z.number().min(0).max(100),
  relatedNodes: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Insight Stream Schema
export const insightStreamSchema = z.object({
  incidentId: z.string(),
  isLive: z.boolean(),
  insights: z.array(agentInsightSchema),
});

// Remediation Step Schema
export const remediationStepSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['manual', 'automated', 'verification']),
  status: nodeStatusSchema,
  estimatedDuration: z.string(),
  command: z.string().optional(),
  documentation: z.string().optional(),
  risks: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
});

// Remediation Plan Schema
export const remediationPlanSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  title: z.string(),
  description: z.string(),
  steps: z.array(remediationStepSchema),
  estimatedTotalDuration: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['draft', 'in_progress', 'completed', 'cancelled']),
});

// Incident Schema
export const incidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: severitySchema,
  status: z.enum(['investigating', 'identified', 'resolved', 'closed']),
  createdAt: z.string(),
  updatedAt: z.string(),
  affectedSystems: z.array(z.string()),
  tags: z.array(z.string()),
});

// API Error Schema
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

// API Response Schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: apiErrorSchema.optional(),
    metadata: z.object({
      timestamp: z.string(),
    }),
  });

// Export type helpers
export type NodeStatus = z.infer<typeof nodeStatusSchema>;
export type NodeType = z.infer<typeof nodeTypeSchema>;
export type Severity = z.infer<typeof severitySchema>;
