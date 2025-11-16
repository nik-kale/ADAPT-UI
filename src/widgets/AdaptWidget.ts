import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { WidgetConfig } from '@types/index';

export abstract class AdaptWidget {
  protected container: HTMLElement;
  protected root: Root | null = null;
  protected config: WidgetConfig;

  constructor(container: HTMLElement | string, config: WidgetConfig = {}) {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = container;
    }

    this.config = {
      theme: 'dark',
      apiEndpoint: 'http://localhost:3001',
      enableRealtime: false,
      ...config,
    };
  }

  abstract render(): void;

  protected mount(component: React.ReactElement): void {
    if (!this.root) {
      this.root = createRoot(this.container);
    }
    this.root.render(component);
  }

  destroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  updateConfig(config: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...config };
    this.render();
  }
}
