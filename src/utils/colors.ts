import { NodeType, Severity } from '@types/index';

export const getNodeColor = (type: NodeType): string => {
  const colors: Record<NodeType, string> = {
    symptom: '#ef4444', // red
    hypothesis: '#f59e0b', // orange
    test: '#06b6d4', // cyan
    finding: '#8b5cf6', // purple
    remediation: '#10b981', // green
    dependency: '#64748b', // slate
  };
  return colors[type] || '#64748b';
};

export const getSeverityColor = (severity: Severity): string => {
  const colors: Record<Severity, string> = {
    critical: '#dc2626',
    high: '#f59e0b',
    medium: '#eab308',
    low: '#3b82f6',
    info: '#06b6d4',
  };
  return colors[severity];
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: '#64748b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    failed: '#ef4444',
    blocked: '#f59e0b',
    analyzing: '#3b82f6',
    complete: '#10b981',
    partial: '#f59e0b',
  };
  return colors[status] || '#64748b';
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
