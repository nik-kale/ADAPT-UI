import { z } from 'zod';
import {
  RCAGraph,
  TimelineData,
  ChatSession,
  ChatMessage,
  InsightStream,
  RemediationPlan,
  Incident,
  APIResponse
} from '@types/index';
import {
  rcaGraphSchema,
  timelineDataSchema,
  chatSessionSchema,
  chatMessageSchema,
  insightStreamSchema,
  remediationPlanSchema,
  incidentSchema,
} from './schemas';
import { logger } from '@utils/logger';
import { API_CONFIG, WEBSOCKET_CONFIG } from '@utils/constants';
import config from '@config/env';

// WebSocket message type
interface WebSocketMessage {
  type: string;
  payload?: unknown;
  timestamp?: string;
}

// API Error type
interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

export class AdaptAPIClient {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private wsReconnectTimeout: NodeJS.Timeout | null = null;
  private wsIncidentId: string | null = null;
  private wsOnMessage: ((data: WebSocketMessage) => void) | null = null;
  private wsOnError: ((error: Event) => void) | null = null;
  private wsIntentionallyClosed = false;
  private wsConnectionId = 0; // Track connection versions to prevent race conditions

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.api.baseUrl;
    this.wsUrl = baseUrl ? baseUrl.replace('http', 'ws') : config.api.wsUrl;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateBackoff(attempt: number): number {
    const delay = Math.min(
      API_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt),
      API_CONFIG.RETRY_DELAY_MAX
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  private shouldRetry(error: APIError | Error, attempt: number): boolean {
    if (attempt >= API_CONFIG.RETRY_ATTEMPTS) {
      return false;
    }

    // Retry on network errors
    if (error?.code === 'NETWORK_ERROR') {
      return true;
    }

    // Retry on specific HTTP status codes
    if (error?.code) {
      const statusCode = parseInt(error.code.replace('HTTP_', ''), 10);
      // Retry on 5xx errors and 429 (rate limit)
      return statusCode >= 500 || statusCode === 429;
    }

    return false;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    schema?: z.ZodSchema<T>
  ): Promise<APIResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = this.calculateBackoff(attempt - 1);
          logger.info(`Retrying request (attempt ${attempt + 1}/${API_CONFIG.RETRY_ATTEMPTS})`, {
            endpoint,
            backoff,
          });
          await this.sleep(backoff);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          const error = {
            success: false,
            error: {
              code: `HTTP_${response.status}`,
              message: data.message || 'Request failed',
              details: data,
            },
            metadata: {
              timestamp: new Date().toISOString(),
            },
          } as APIResponse<T>;

          if (this.shouldRetry(error.error, attempt)) {
            lastError = error;
            continue;
          }

          return error;
        }

        // Validate response data if schema is provided
        if (schema) {
          try {
            const validatedData = schema.parse(data);
            return {
              success: true,
              data: validatedData,
              metadata: {
                timestamp: new Date().toISOString(),
              },
            };
          } catch (error) {
            logger.error('API response validation failed', error, { endpoint });
            return {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Response data failed validation',
                details: error instanceof z.ZodError ? error.errors : error,
              },
              metadata: {
                timestamp: new Date().toISOString(),
              },
            };
          }
        }

        return {
          success: true,
          data,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        lastError = {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        };

        if (!this.shouldRetry(lastError.error, attempt)) {
          logger.error('API request failed', error, { endpoint, attempt });
          return lastError;
        }
      }
    }

    logger.error('API request failed after all retries', lastError, { endpoint });
    return lastError;
  }

  // Incident APIs
  async getIncidents(): Promise<APIResponse<Incident[]>> {
    return this.fetch<Incident[]>('/api/incidents', undefined, z.array(incidentSchema));
  }

  async getIncident(id: string): Promise<APIResponse<Incident>> {
    return this.fetch<Incident>(`/api/incidents/${id}`, undefined, incidentSchema);
  }

  // RCA Graph APIs
  async getRCAGraph(incidentId: string): Promise<APIResponse<RCAGraph>> {
    return this.fetch<RCAGraph>(`/api/rca/${incidentId}/graph`, undefined, rcaGraphSchema);
  }

  // Timeline APIs
  async getTimeline(incidentId: string): Promise<APIResponse<TimelineData>> {
    return this.fetch<TimelineData>(`/api/rca/${incidentId}/timeline`, undefined, timelineDataSchema);
  }

  // Chat APIs
  async getChatSession(incidentId: string): Promise<APIResponse<ChatSession>> {
    return this.fetch<ChatSession>(`/api/chat/${incidentId}`, undefined, chatSessionSchema);
  }

  async sendChatMessage(
    incidentId: string,
    message: string
  ): Promise<APIResponse<ChatMessage>> {
    return this.fetch<ChatMessage>(
      `/api/chat/${incidentId}/message`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      },
      z.any() // Server returns both messages now, skip validation for backward compatibility
    );
  }

  // Insights APIs
  async getInsights(incidentId: string): Promise<APIResponse<InsightStream>> {
    return this.fetch<InsightStream>(`/api/insights/${incidentId}`, undefined, insightStreamSchema);
  }

  // Remediation APIs
  async getRemediationPlan(incidentId: string): Promise<APIResponse<RemediationPlan>> {
    return this.fetch<RemediationPlan>(`/api/remediation/${incidentId}`, undefined, remediationPlanSchema);
  }

  async updateRemediationStepStatus(
    incidentId: string,
    stepId: string,
    status: string
  ): Promise<APIResponse<void>> {
    return this.fetch<void>(
      `/api/remediation/${incidentId}/steps/${stepId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }

  // WebSocket for real-time updates
  private calculateWsBackoff(): number {
    const delay = Math.min(
      WEBSOCKET_CONFIG.RECONNECT_DELAY_BASE * Math.pow(2, this.wsReconnectAttempts),
      WEBSOCKET_CONFIG.RECONNECT_DELAY_MAX
    );
    return delay + Math.random() * 1000;
  }

  private reconnectWebSocket(): void {
    if (this.wsIntentionallyClosed || !this.wsIncidentId) {
      return;
    }

    if (this.wsReconnectAttempts >= WEBSOCKET_CONFIG.RECONNECT_ATTEMPTS) {
      logger.error('WebSocket max reconnection attempts reached', null, {
        incidentId: this.wsIncidentId,
        attempts: this.wsReconnectAttempts,
      });
      return;
    }

    const backoff = this.calculateWsBackoff();
    logger.info(`Reconnecting WebSocket in ${backoff}ms (attempt ${this.wsReconnectAttempts + 1}/${WEBSOCKET_CONFIG.RECONNECT_ATTEMPTS})`);

    this.wsReconnectTimeout = setTimeout(() => {
      this.wsReconnectAttempts++;
      if (this.wsIncidentId && this.wsOnMessage) {
        this.connectWebSocket(this.wsIncidentId, this.wsOnMessage, this.wsOnError || undefined);
      }
    }, backoff);
  }

  connectWebSocket(
    incidentId: string,
    onMessage: (data: WebSocketMessage) => void,
    onError?: (error: Event) => void
  ): void {
    // Close existing connection to prevent memory leaks
    if (this.ws) {
      this.wsIntentionallyClosed = true;
      this.ws.close();
      this.ws = null;
    }

    // Clear any pending reconnection timeout
    if (this.wsReconnectTimeout) {
      clearTimeout(this.wsReconnectTimeout);
      this.wsReconnectTimeout = null;
    }

    // Increment connection ID to track this specific connection
    this.wsConnectionId++;
    const currentConnectionId = this.wsConnectionId;

    // Store connection parameters for reconnection
    this.wsIncidentId = incidentId;
    this.wsOnMessage = onMessage;
    this.wsOnError = onError || null;
    this.wsIntentionallyClosed = false;

    this.ws = new WebSocket(`${this.wsUrl}/ws/${incidentId}`);

    this.ws.onopen = () => {
      // Only log if this connection is still current
      if (currentConnectionId === this.wsConnectionId) {
        logger.info('WebSocket connection established', { incidentId, connectionId: currentConnectionId });
        // Reset reconnection attempts on successful connection
        this.wsReconnectAttempts = 0;
      }
    };

    this.ws.onmessage = (event) => {
      // Only process message if this connection is still current
      if (currentConnectionId !== this.wsConnectionId) {
        logger.debug('Ignoring message from stale WebSocket connection', {
          currentConnectionId,
          activeConnectionId: this.wsConnectionId
        });
        return;
      }

      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', error);
      }
    };

    this.ws.onerror = (error) => {
      // Only handle error if this connection is still current
      if (currentConnectionId === this.wsConnectionId) {
        logger.error('WebSocket error', error, { incidentId, connectionId: currentConnectionId });
        onError?.(error);
      }
    };

    this.ws.onclose = (event) => {
      // Only handle close if this connection is still current
      if (currentConnectionId !== this.wsConnectionId) {
        logger.debug('Ignoring close from stale WebSocket connection', {
          currentConnectionId,
          activeConnectionId: this.wsConnectionId
        });
        return;
      }

      logger.info('WebSocket connection closed', {
        incidentId,
        connectionId: currentConnectionId,
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

      this.ws = null;

      // Attempt reconnection if not intentionally closed
      if (!this.wsIntentionallyClosed) {
        this.reconnectWebSocket();
      }
    };
  }

  disconnectWebSocket(): void {
    this.wsIntentionallyClosed = true;

    if (this.wsReconnectTimeout) {
      clearTimeout(this.wsReconnectTimeout);
      this.wsReconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear stored connection parameters
    this.wsIncidentId = null;
    this.wsOnMessage = null;
    this.wsOnError = null;
    this.wsReconnectAttempts = 0;
  }
}

export const defaultClient = new AdaptAPIClient();
