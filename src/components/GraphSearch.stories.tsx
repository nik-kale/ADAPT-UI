import type { Meta, StoryObj } from '@storybook/react';
import { GraphSearch } from './GraphSearch';
import { RCANode } from '@types/index';

const mockNodes: RCANode[] = [
  {
    id: 'symptom-1',
    type: 'symptom',
    label: 'Connection Timeouts',
    description: 'Users experiencing 504 Gateway Timeout errors',
    status: 'completed',
    severity: 'critical',
    confidence: 95,
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: 'hypothesis-1',
    type: 'hypothesis',
    label: 'Database Pool Exhaustion',
    description: 'Connection pool may be saturated',
    status: 'completed',
    confidence: 85,
    timestamp: '2024-01-15T10:35:00Z',
  },
  {
    id: 'hypothesis-2',
    type: 'hypothesis',
    label: 'Slow Query Performance',
    description: 'Queries taking too long to execute',
    status: 'completed',
    confidence: 70,
    timestamp: '2024-01-15T10:37:00Z',
  },
  {
    id: 'test-1',
    type: 'test',
    label: 'Check Pool Metrics',
    description: 'Query database connection pool status',
    status: 'completed',
    timestamp: '2024-01-15T10:40:00Z',
  },
  {
    id: 'test-2',
    type: 'test',
    label: 'Analyze Query Logs',
    description: 'Review slow query logs for patterns',
    status: 'in_progress',
    timestamp: '2024-01-15T10:42:00Z',
  },
  {
    id: 'finding-1',
    type: 'finding',
    label: 'Pool at 100% Capacity',
    description: 'All 50 connections in use, new requests queuing',
    status: 'completed',
    severity: 'critical',
    confidence: 95,
    timestamp: '2024-01-15T10:45:00Z',
  },
  {
    id: 'finding-2',
    type: 'finding',
    label: 'Long-Running Transactions',
    description: 'Multiple transactions holding connections for > 30s',
    status: 'completed',
    severity: 'high',
    confidence: 90,
    timestamp: '2024-01-15T10:47:00Z',
  },
  {
    id: 'remediation-1',
    type: 'remediation',
    label: 'Increase Pool Size',
    description: 'Scale connection pool from 50 to 100',
    status: 'pending',
    timestamp: '2024-01-15T10:50:00Z',
  },
];

const meta: Meta<typeof GraphSearch> = {
  title: 'Components/GraphSearch',
  component: GraphSearch,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GraphSearch>;

export const Default: Story = {
  args: {
    nodes: mockNodes,
    onFilterChange: (highlightedNodeIds) => {
      console.log('Highlighted nodes:', Array.from(highlightedNodeIds));
    },
  },
};

export const WithFewNodes: Story = {
  args: {
    nodes: mockNodes.slice(0, 3),
  },
};

export const EmptyState: Story = {
  args: {
    nodes: [],
  },
};
