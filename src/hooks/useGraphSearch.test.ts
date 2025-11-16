import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphSearch } from './useGraphSearch';
import { RCANode } from '@types/index';

const mockNodes: RCANode[] = [
  {
    id: 'node-1',
    type: 'symptom',
    label: 'Connection Timeouts',
    description: 'Users experiencing timeouts',
    status: 'completed',
    severity: 'critical',
    confidence: 95,
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: 'node-2',
    type: 'hypothesis',
    label: 'Database Pool Exhaustion',
    description: 'Connection pool may be saturated',
    status: 'in_progress',
    confidence: 85,
    timestamp: '2024-01-15T10:35:00Z',
  },
  {
    id: 'node-3',
    type: 'test',
    label: 'Check Pool Metrics',
    description: 'Query database connection pool status',
    status: 'pending',
    timestamp: '2024-01-15T10:40:00Z',
  },
];

describe('useGraphSearch', () => {
  it('returns all nodes when no filters are applied', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    expect(result.current.filteredNodes).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('filters nodes by text query', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('query', 'timeout');
    });

    expect(result.current.filteredNodes).toHaveLength(1);
    expect(result.current.filteredNodes[0].id).toBe('node-1');
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('filters nodes by type', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('types', ['symptom', 'hypothesis']);
    });

    expect(result.current.filteredNodes).toHaveLength(2);
    expect(result.current.filteredNodes.map(n => n.type)).toEqual(['symptom', 'hypothesis']);
  });

  it('filters nodes by status', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('statuses', ['completed']);
    });

    expect(result.current.filteredNodes).toHaveLength(1);
    expect(result.current.filteredNodes[0].status).toBe('completed');
  });

  it('filters nodes by severity', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('severities', ['critical']);
    });

    expect(result.current.filteredNodes).toHaveLength(1);
    expect(result.current.filteredNodes[0].severity).toBe('critical');
  });

  it('filters nodes by confidence range', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('minConfidence', 90);
    });

    expect(result.current.filteredNodes).toHaveLength(1);
    expect(result.current.filteredNodes[0].confidence).toBeGreaterThanOrEqual(90);
  });

  it('combines multiple filters', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('types', ['symptom', 'hypothesis']);
      result.current.updateFilter('minConfidence', 90);
    });

    expect(result.current.filteredNodes).toHaveLength(1);
    expect(result.current.filteredNodes[0].type).toBe('symptom');
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('query', 'test');
      result.current.updateFilter('types', ['symptom']);
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filteredNodes).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('tracks highlighted node IDs', () => {
    const { result } = renderHook(() => useGraphSearch(mockNodes));

    act(() => {
      result.current.updateFilter('types', ['symptom']);
    });

    expect(result.current.highlightedNodeIds.has('node-1')).toBe(true);
    expect(result.current.highlightedNodeIds.has('node-2')).toBe(false);
  });
});
