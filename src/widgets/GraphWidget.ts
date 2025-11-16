import { createElement } from 'react';
import { AdaptWidget } from './AdaptWidget';
import { RCAGraphViewer } from '@components/Graph';
import { GraphWidgetConfig } from '@types/index';
import { AdaptAPIClient } from '@api/client';

export class GraphWidget extends AdaptWidget {
  private incidentId: string;
  private client: AdaptAPIClient;
  private onNodeClick?: (nodeId: string) => void;

  constructor(
    container: HTMLElement | string,
    incidentId: string,
    config: GraphWidgetConfig = {},
    onNodeClick?: (nodeId: string) => void
  ) {
    super(container, config);
    this.incidentId = incidentId;
    this.onNodeClick = onNodeClick;
    this.client = new AdaptAPIClient(config.apiEndpoint);
    this.render();
  }

  async render(): Promise<void> {
    const response = await this.client.getRCAGraph(this.incidentId);

    if (response.success && response.data) {
      this.mount(
        createElement(RCAGraphViewer, {
          graph: response.data,
          config: this.config as GraphWidgetConfig,
          onNodeClick: this.onNodeClick,
        })
      );
    } else {
      this.container.innerHTML = `
        <div style="padding: 20px; color: #ef4444;">
          Error loading graph: ${response.error?.message}
        </div>
      `;
    }
  }
}
