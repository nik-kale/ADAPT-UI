/**
 * Accessibility utilities for ADAPT-UI
 * Provides ARIA labels, roles, and announcements
 */

/**
 * Generate ARIA label for RCA node
 */
export const getNodeAriaLabel = (node: {
  type: string;
  label: string;
  status: string;
  confidence?: number;
  severity?: string;
}): string => {
  const parts = [
    `${node.type} node`,
    node.label,
    `status: ${node.status}`,
  ];

  if (node.confidence !== undefined) {
    parts.push(`confidence: ${node.confidence} percent`);
  }

  if (node.severity) {
    parts.push(`severity: ${node.severity}`);
  }

  return parts.join(', ');
};

/**
 * Generate ARIA label for timeline event
 */
export const getEventAriaLabel = (event: {
  type: string;
  title: string;
  severity: string;
  timestamp: string;
}): string => {
  const time = new Date(event.timestamp).toLocaleTimeString();
  return `${event.type} event: ${event.title}, severity: ${event.severity}, time: ${time}`;
};

/**
 * Generate ARIA label for remediation step
 */
export const getStepAriaLabel = (step: {
  order: number;
  title: string;
  status: string;
  type: string;
  estimatedDuration: string;
}): string => {
  return `Step ${step.order}: ${step.title}, type: ${step.type}, status: ${step.status}, estimated duration: ${step.estimatedDuration}`;
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Get descriptive role for node type
 */
export const getNodeRole = (type: string): string => {
  const roleMap: Record<string, string> = {
    symptom: 'symptom observation',
    hypothesis: 'hypothesis',
    test: 'test or verification',
    finding: 'finding or result',
    remediation: 'remediation action',
  };

  return roleMap[type] || 'graph node';
};

/**
 * Generate skip link targets for keyboard navigation
 */
export const skipLinkTargets = {
  mainContent: 'main-content',
  navigation: 'navigation',
  graph: 'rca-graph',
  timeline: 'timeline',
  chat: 'chat-interface',
  insights: 'insights-panel',
  remediation: 'remediation-viewer',
} as const;

/**
 * Get keyboard shortcut description
 */
export const getKeyboardShortcuts = () => [
  { keys: ['Arrow Keys'], description: 'Navigate between nodes' },
  { keys: ['Enter'], description: 'Select node or perform action' },
  { keys: ['Escape'], description: 'Close modal or cancel action' },
  { keys: ['Tab'], description: 'Move to next interactive element' },
  { keys: ['Shift', 'Tab'], description: 'Move to previous interactive element' },
  { keys: ['Space'], description: 'Activate button or control' },
  { keys: ['/'], description: 'Focus search input' },
];
