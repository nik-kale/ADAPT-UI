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

export class AdaptAPIClient {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;

  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.wsUrl = baseUrl.replace('http', 'ws');
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: data.message || 'Request failed',
            details: data,
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Incident APIs
  async getIncidents(): Promise<APIResponse<Incident[]>> {
    return this.fetch<Incident[]>('/api/incidents');
  }

  async getIncident(id: string): Promise<APIResponse<Incident>> {
    return this.fetch<Incident>(`/api/incidents/${id}`);
  }

  // RCA Graph APIs
  async getRCAGraph(incidentId: string): Promise<APIResponse<RCAGraph>> {
    return this.fetch<RCAGraph>(`/api/rca/${incidentId}/graph`);
  }

  // Timeline APIs
  async getTimeline(incidentId: string): Promise<APIResponse<TimelineData>> {
    return this.fetch<TimelineData>(`/api/rca/${incidentId}/timeline`);
  }

  // Chat APIs
  async getChatSession(incidentId: string): Promise<APIResponse<ChatSession>> {
    return this.fetch<ChatSession>(`/api/chat/${incidentId}`);
  }

  async sendChatMessage(
    incidentId: string,
    message: string
  ): Promise<APIResponse<ChatMessage>> {
    return this.fetch<ChatMessage>(`/api/chat/${incidentId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Insights APIs
  async getInsights(incidentId: string): Promise<APIResponse<InsightStream>> {
    return this.fetch<InsightStream>(`/api/insights/${incidentId}`);
  }

  // Remediation APIs
  async getRemediationPlan(incidentId: string): Promise<APIResponse<RemediationPlan>> {
    return this.fetch<RemediationPlan>(`/api/remediation/${incidentId}`);
  }

  async updateRemediationStepStatus(
    incidentId: string,
    stepId: string,
    status: string
  ): Promise<APIResponse<void>> {
    return this.fetch<void>(`/api/remediation/${incidentId}/steps/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // WebSocket for real-time updates
  connectWebSocket(
    incidentId: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    this.ws = new WebSocket(`${this.wsUrl}/ws/${incidentId}`);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const defaultClient = new AdaptAPIClient();
