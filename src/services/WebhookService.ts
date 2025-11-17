/**
 * Webhook Service for External Integrations
 * Provides: Webhook delivery, retry logic, event subscriptions
 */

export type WebhookEvent =
  | 'incident.created'
  | 'incident.updated'
  | 'incident.resolved'
  | 'incident.escalated'
  | 'graph.analyzed'
  | 'insight.generated'
  | 'runbook.started'
  | 'runbook.completed'
  | 'runbook.failed'
  | 'comment.added'
  | 'annotation.created';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  secret?: string; // For HMAC signature verification
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: unknown;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  error?: string;
  responseStatus?: number;
  responseBody?: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: unknown;
  signature?: string; // HMAC signature for verification
}

export class WebhookService {
  private static webhooks: Map<string, Webhook> = new Map();
  private static deliveries: Map<string, WebhookDelivery> = new Map();
  private static retryQueue: WebhookDelivery[] = [];
  private static maxRetryAttempts = 5;
  private static retryDelays = [1000, 5000, 15000, 60000, 300000]; // 1s, 5s, 15s, 1m, 5m

  /**
   * Register a new webhook
   */
  static registerWebhook(webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Webhook {
    const id = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWebhook: Webhook = {
      ...webhook,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      enabled: webhook.enabled ?? true,
    };
    this.webhooks.set(id, newWebhook);
    console.log(`[Webhook] Registered webhook: ${newWebhook.name} (${id})`);
    return newWebhook;
  }

  /**
   * Update an existing webhook
   */
  static updateWebhook(id: string, updates: Partial<Omit<Webhook, 'id' | 'createdAt'>>): Webhook | null {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      return null;
    }

    const updatedWebhook: Webhook = {
      ...webhook,
      ...updates,
      updatedAt: new Date(),
    };
    this.webhooks.set(id, updatedWebhook);
    console.log(`[Webhook] Updated webhook: ${id}`);
    return updatedWebhook;
  }

  /**
   * Delete a webhook
   */
  static deleteWebhook(id: string): boolean {
    const result = this.webhooks.delete(id);
    if (result) {
      console.log(`[Webhook] Deleted webhook: ${id}`);
    }
    return result;
  }

  /**
   * Get all webhooks
   */
  static getAllWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhook by ID
   */
  static getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Trigger an event - will send to all webhooks subscribed to this event
   */
  static async triggerEvent(event: WebhookEvent, data: unknown): Promise<void> {
    const subscribedWebhooks = Array.from(this.webhooks.values()).filter(
      wh => wh.enabled && wh.events.includes(event)
    );

    console.log(`[Webhook] Triggering event: ${event} (${subscribedWebhooks.length} subscribers)`);

    const deliveryPromises = subscribedWebhooks.map(webhook =>
      this.deliverWebhook(webhook, event, data)
    );

    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Deliver webhook to a specific URL
   */
  private static async deliverWebhook(
    webhook: Webhook,
    event: WebhookEvent,
    data: unknown
  ): Promise<WebhookDelivery> {
    const deliveryId = `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Generate HMAC signature if secret is configured
    if (webhook.secret) {
      payload.signature = await this.generateSignature(payload, webhook.secret);
    }

    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId: webhook.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.maxRetryAttempts,
    };

    this.deliveries.set(deliveryId, delivery);

    // Attempt delivery
    await this.attemptDelivery(delivery, webhook, payload);

    return delivery;
  }

  /**
   * Attempt to deliver webhook
   */
  private static async attemptDelivery(
    delivery: WebhookDelivery,
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<void> {
    delivery.attempts++;
    delivery.status = 'pending';

    try {
      console.log(`[Webhook] Delivering to ${webhook.url} (attempt ${delivery.attempts}/${delivery.maxAttempts})`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'ADAPT-RCA-Webhook/1.0',
        'X-Webhook-Event': payload.event,
        'X-Webhook-ID': webhook.id,
        'X-Webhook-Delivery': delivery.id,
        ...webhook.headers,
      };

      if (payload.signature) {
        headers['X-Webhook-Signature'] = payload.signature;
      }

      // In production, replace with actual fetch
      const response = await this.mockFetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      delivery.responseStatus = response.status;
      delivery.responseBody = await response.text();

      if (response.ok) {
        delivery.status = 'delivered';
        delivery.deliveredAt = new Date();
        webhook.lastTriggeredAt = new Date();
        console.log(`[Webhook] Successfully delivered to ${webhook.url}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${delivery.responseBody}`);
      }
    } catch (error) {
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Webhook] Delivery failed: ${delivery.error}`);

      // Schedule retry if attempts remaining
      if (delivery.attempts < delivery.maxAttempts) {
        delivery.status = 'retrying';
        const retryDelay = this.retryDelays[delivery.attempts - 1] || this.retryDelays[this.retryDelays.length - 1];
        delivery.nextRetryAt = new Date(Date.now() + retryDelay);

        this.retryQueue.push(delivery);

        console.log(
          `[Webhook] Scheduling retry in ${retryDelay}ms (attempt ${delivery.attempts + 1}/${delivery.maxAttempts})`
        );

        // Schedule retry
        setTimeout(() => {
          this.processRetry(delivery.id);
        }, retryDelay);
      } else {
        delivery.status = 'failed';
        console.error(`[Webhook] Delivery permanently failed after ${delivery.attempts} attempts`);
      }
    }

    this.deliveries.set(delivery.id, delivery);
  }

  /**
   * Process a retry from the queue
   */
  private static async processRetry(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      return;
    }

    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      delivery.status = 'failed';
      delivery.error = 'Webhook not found';
      return;
    }

    // Remove from retry queue
    this.retryQueue = this.retryQueue.filter(d => d.id !== deliveryId);

    // Attempt delivery again
    await this.attemptDelivery(delivery, webhook, delivery.payload as WebhookPayload);
  }

  /**
   * Get delivery status
   */
  static getDelivery(id: string): WebhookDelivery | undefined {
    return this.deliveries.get(id);
  }

  /**
   * Get all deliveries for a webhook
   */
  static getWebhookDeliveries(webhookId: string, limit: number = 50): WebhookDelivery[] {
    return Array.from(this.deliveries.values())
      .filter(d => d.webhookId === webhookId)
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, limit);
  }

  /**
   * Test a webhook by sending a test payload
   */
  static async testWebhook(webhookId: string): Promise<WebhookDelivery> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    const testData = {
      test: true,
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
    };

    return this.deliverWebhook(webhook, 'incident.created', testData);
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private static async generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
    // In production, use crypto.subtle.sign with HMAC-SHA256
    // For now, return a mock signature
    const payloadString = JSON.stringify(payload);
    return `sha256=${Buffer.from(payloadString + secret).toString('base64')}`;
  }

  /**
   * Mock fetch for development (replace with actual fetch in production)
   */
  private static async mockFetch(url: string, options: RequestInit): Promise<Response> {
    console.log(`[Mock Fetch] POST ${url}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate success for most requests
    if (Math.random() > 0.1) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Simulate occasional failures
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Get statistics for a webhook
   */
  static getWebhookStats(webhookId: string): {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    pendingDeliveries: number;
    averageAttempts: number;
  } {
    const deliveries = this.getWebhookDeliveries(webhookId, 1000);

    const successful = deliveries.filter(d => d.status === 'delivered').length;
    const failed = deliveries.filter(d => d.status === 'failed').length;
    const pending = deliveries.filter(d => d.status === 'pending' || d.status === 'retrying').length;
    const totalAttempts = deliveries.reduce((sum, d) => sum + d.attempts, 0);

    return {
      totalDeliveries: deliveries.length,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      pendingDeliveries: pending,
      averageAttempts: deliveries.length > 0 ? totalAttempts / deliveries.length : 0,
    };
  }
}

// Predefined webhook templates for common integrations
export const WebhookTemplates = {
  slack: {
    name: 'Slack Notification',
    events: ['incident.created', 'incident.resolved', 'incident.escalated'] as WebhookEvent[],
    headers: {
      'Content-Type': 'application/json',
    },
    metadata: {
      platform: 'slack',
      transformPayload: (payload: WebhookPayload) => ({
        text: `[${payload.event}] Incident notification`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Event:* ${payload.event}\n*Time:* ${payload.timestamp}`,
            },
          },
        ],
      }),
    },
  },

  teams: {
    name: 'Microsoft Teams Notification',
    events: ['incident.created', 'incident.resolved', 'incident.escalated'] as WebhookEvent[],
    headers: {
      'Content-Type': 'application/json',
    },
    metadata: {
      platform: 'teams',
      transformPayload: (payload: WebhookPayload) => ({
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        summary: `${payload.event} notification`,
        sections: [
          {
            activityTitle: payload.event,
            activitySubtitle: payload.timestamp,
            facts: [
              {
                name: 'Event Type',
                value: payload.event,
              },
            ],
          },
        ],
      }),
    },
  },

  jira: {
    name: 'JIRA Issue Creation',
    events: ['incident.created', 'incident.escalated'] as WebhookEvent[],
    headers: {
      'Content-Type': 'application/json',
    },
    metadata: {
      platform: 'jira',
      transformPayload: (payload: WebhookPayload) => ({
        fields: {
          project: {
            key: 'OPS', // Configure per deployment
          },
          summary: `Incident: ${payload.event}`,
          description: `Automated incident report from ADAPT RCA\n\nEvent: ${payload.event}\nTime: ${payload.timestamp}`,
          issuetype: {
            name: 'Bug',
          },
        },
      }),
    },
  },

  pagerduty: {
    name: 'PagerDuty Alert',
    events: ['incident.created', 'incident.escalated'] as WebhookEvent[],
    headers: {
      'Content-Type': 'application/json',
    },
    metadata: {
      platform: 'pagerduty',
      transformPayload: (payload: WebhookPayload) => ({
        routing_key: 'YOUR_INTEGRATION_KEY', // Configure per deployment
        event_action: 'trigger',
        payload: {
          summary: `${payload.event} - ADAPT RCA`,
          timestamp: payload.timestamp,
          severity: 'error',
          source: 'adapt-rca',
          custom_details: payload.data,
        },
      }),
    },
  },

  servicenow: {
    name: 'ServiceNow Incident',
    events: ['incident.created', 'incident.escalated'] as WebhookEvent[],
    headers: {
      'Content-Type': 'application/json',
    },
    metadata: {
      platform: 'servicenow',
      transformPayload: (payload: WebhookPayload) => ({
        short_description: `${payload.event} - ADAPT RCA`,
        description: `Automated incident from ADAPT RCA\n\nEvent: ${payload.event}\nTime: ${payload.timestamp}`,
        urgency: '2',
        impact: '2',
        category: 'Software',
      }),
    },
  },

  generic: {
    name: 'Generic Webhook',
    events: [
      'incident.created',
      'incident.updated',
      'incident.resolved',
      'graph.analyzed',
      'insight.generated',
    ] as WebhookEvent[],
    headers: {
      'Content-Type': 'application/json',
    },
    metadata: {
      platform: 'generic',
      transformPayload: (payload: WebhookPayload) => payload,
    },
  },
};
