/**
 * Runbook Service for Automated Remediation
 * Provides: Runbook execution, step tracking, conditional logic
 */

export interface RunbookStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'approval' | 'conditional';
  action?: {
    type: 'api-call' | 'script' | 'webhook' | 'notification';
    config: Record<string, unknown>;
  };
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater-than' | 'less-than';
    value: unknown;
  };
  timeout?: number; // seconds
  retries?: number;
  onSuccess?: string; // next step ID
  onFailure?: string; // fallback step ID
}

export interface Runbook {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'manual' | 'automatic' | 'scheduled';
    conditions?: Record<string, unknown>;
  };
  steps: RunbookStep[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: string;
  version: number;
}

export interface RunbookExecution {
  id: string;
  runbookId: string;
  incidentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  executedBy: string;
  stepResults: {
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    output?: unknown;
    error?: string;
  }[];
}

export class RunbookService {
  private static runbooks: Map<string, Runbook> = new Map();
  private static executions: Map<string, RunbookExecution> = new Map();

  /**
   * Register a new runbook
   */
  static registerRunbook(runbook: Omit<Runbook, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Runbook {
    const id = `runbook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRunbook: Runbook = {
      ...runbook,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
    this.runbooks.set(id, newRunbook);
    return newRunbook;
  }

  /**
   * Execute a runbook
   */
  static async executeRunbook(
    runbookId: string,
    incidentId: string,
    executedBy: string,
    context: Record<string, unknown> = {}
  ): Promise<RunbookExecution> {
    const runbook = this.runbooks.get(runbookId);
    if (!runbook) {
      throw new Error(`Runbook ${runbookId} not found`);
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const execution: RunbookExecution = {
      id: executionId,
      runbookId,
      incidentId,
      status: 'running',
      currentStep: 0,
      startedAt: new Date(),
      executedBy,
      stepResults: runbook.steps.map(step => ({
        stepId: step.id,
        status: 'pending',
      })),
    };

    this.executions.set(executionId, execution);

    // Execute steps sequentially
    try {
      for (let i = 0; i < runbook.steps.length; i++) {
        const step = runbook.steps[i];
        execution.currentStep = i;

        // Check condition if exists
        if (step.condition && !this.evaluateCondition(step.condition, context)) {
          execution.stepResults[i].status = 'skipped';
          continue;
        }

        // Execute step
        execution.stepResults[i].status = 'running';
        execution.stepResults[i].startedAt = new Date();

        try {
          const result = await this.executeStep(step, context);
          execution.stepResults[i].status = 'completed';
          execution.stepResults[i].completedAt = new Date();
          execution.stepResults[i].output = result;

          // Update context with result
          context[`step_${step.id}_result`] = result;
        } catch (error) {
          execution.stepResults[i].status = 'failed';
          execution.stepResults[i].completedAt = new Date();
          execution.stepResults[i].error = error instanceof Error ? error.message : 'Unknown error';

          // Check if there's a fallback
          if (step.onFailure) {
            const fallbackIndex = runbook.steps.findIndex(s => s.id === step.onFailure);
            if (fallbackIndex >= 0) {
              i = fallbackIndex - 1; // -1 because loop will increment
              continue;
            }
          }

          // If no fallback, fail the execution
          execution.status = 'failed';
          execution.completedAt = new Date();
          return execution;
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
    }

    return execution;
  }

  /**
   * Get all runbooks
   */
  static getAllRunbooks(): Runbook[] {
    return Array.from(this.runbooks.values());
  }

  /**
   * Get runbook by ID
   */
  static getRunbook(id: string): Runbook | undefined {
    return this.runbooks.get(id);
  }

  /**
   * Get execution status
   */
  static getExecution(id: string): RunbookExecution | undefined {
    return this.executions.get(id);
  }

  /**
   * Cancel a running execution
   */
  static cancelExecution(id: string): boolean {
    const execution = this.executions.get(id);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      return true;
    }
    return false;
  }

  // Private helpers

  private static evaluateCondition(
    condition: RunbookStep['condition'],
    context: Record<string, unknown>
  ): boolean {
    if (!condition) return true;

    const value = context[condition.field];

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'greater-than':
        return Number(value) > Number(condition.value);
      case 'less-than':
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }

  private static async executeStep(
    step: RunbookStep,
    context: Record<string, unknown>
  ): Promise<unknown> {
    if (!step.action) {
      // Manual step - just return success
      return { status: 'manual_step_placeholder' };
    }

    switch (step.action.type) {
      case 'api-call':
        return this.executeAPICall(step.action.config, context);

      case 'script':
        return this.executeScript(step.action.config, context);

      case 'webhook':
        return this.executeWebhook(step.action.config, context);

      case 'notification':
        return this.sendNotification(step.action.config, context);

      default:
        throw new Error(`Unknown action type: ${step.action.type}`);
    }
  }

  private static async executeAPICall(
    config: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<unknown> {
    // Simulate API call
    const url = this.interpolate(String(config.url), context);
    const method = config.method || 'GET';

    console.log(`[Runbook] API Call: ${method} ${url}`);

    // In production, use actual fetch
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  private static async executeScript(
    config: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<unknown> {
    // Simulate script execution
    console.log(`[Runbook] Script: ${config.command}`);

    return {
      exitCode: 0,
      output: 'Script executed successfully',
    };
  }

  private static async executeWebhook(
    config: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<unknown> {
    // Simulate webhook call
    const url = this.interpolate(String(config.url), context);
    console.log(`[Runbook] Webhook: POST ${url}`);

    return {
      delivered: true,
      timestamp: new Date().toISOString(),
    };
  }

  private static async sendNotification(
    config: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<unknown> {
    // Simulate notification
    const message = this.interpolate(String(config.message), context);
    console.log(`[Runbook] Notification: ${message}`);

    return {
      sent: true,
      recipients: config.recipients,
    };
  }

  private static interpolate(template: string, context: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(context[key] || ''));
  }
}

// Predefined runbooks for common scenarios
export const DefaultRunbooks = {
  restartService: {
    name: 'Restart Service',
    description: 'Automatically restart a failed service',
    trigger: { type: 'automatic' as const },
    steps: [
      {
        id: 'check-status',
        name: 'Check Service Status',
        description: 'Verify service is down',
        type: 'automated' as const,
        action: {
          type: 'api-call' as const,
          config: { url: '/api/service/{{serviceId}}/status', method: 'GET' },
        },
      },
      {
        id: 'restart',
        name: 'Restart Service',
        description: 'Issue restart command',
        type: 'automated' as const,
        action: {
          type: 'api-call' as const,
          config: { url: '/api/service/{{serviceId}}/restart', method: 'POST' },
        },
      },
      {
        id: 'verify',
        name: 'Verify Recovery',
        description: 'Confirm service is healthy',
        type: 'automated' as const,
        action: {
          type: 'api-call' as const,
          config: { url: '/api/service/{{serviceId}}/health', method: 'GET' },
        },
        timeout: 60,
      },
      {
        id: 'notify',
        name: 'Notify Team',
        description: 'Send notification about restart',
        type: 'automated' as const,
        action: {
          type: 'notification' as const,
          config: {
            message: 'Service {{serviceId}} restarted successfully',
            recipients: ['ops-team'],
          },
        },
      },
    ],
    tags: ['auto-remediation', 'service-recovery'],
    author: 'system',
  },

  scaleUp: {
    name: 'Scale Up Resources',
    description: 'Increase resources when load is high',
    trigger: { type: 'automatic' as const },
    steps: [
      {
        id: 'check-load',
        name: 'Check Current Load',
        description: 'Verify high load condition',
        type: 'automated' as const,
        action: {
          type: 'api-call' as const,
          config: { url: '/api/metrics/{{serviceId}}/load', method: 'GET' },
        },
      },
      {
        id: 'scale',
        name: 'Scale Resources',
        description: 'Increase replica count',
        type: 'automated' as const,
        action: {
          type: 'api-call' as const,
          config: {
            url: '/api/service/{{serviceId}}/scale',
            method: 'POST',
            body: { replicas: '{{targetReplicas}}' },
          },
        },
      },
      {
        id: 'monitor',
        name: 'Monitor Scaling',
        description: 'Wait for new instances to be healthy',
        type: 'automated' as const,
        action: {
          type: 'script' as const,
          config: { command: 'monitor-scaling.sh {{serviceId}}' },
        },
        timeout: 300,
      },
    ],
    tags: ['auto-scaling', 'performance'],
    author: 'system',
  },
};
