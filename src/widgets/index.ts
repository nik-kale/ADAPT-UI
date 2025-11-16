export { AdaptWidget } from './AdaptWidget';
export { GraphWidget } from './GraphWidget';
export { ChatWidget } from './ChatWidget';

// Convenience function to create widgets
export const createWidget = {
  graph: (
    container: HTMLElement | string,
    incidentId: string,
    config = {},
    onNodeClick?: (nodeId: string) => void
  ) => {
    const { GraphWidget } = require('./GraphWidget');
    return new GraphWidget(container, incidentId, config, onNodeClick);
  },

  chat: (
    container: HTMLElement | string,
    incidentId: string,
    config = {}
  ) => {
    const { ChatWidget } = require('./ChatWidget');
    return new ChatWidget(container, incidentId, config);
  },
};
