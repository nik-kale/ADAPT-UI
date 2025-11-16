import { useState, useMemo, useCallback } from 'react';
import { RCANode } from '@types/index';

export interface SearchFilters {
  query: string;
  types: string[];
  statuses: string[];
  severities: string[];
  minConfidence?: number;
  maxConfidence?: number;
}

const defaultFilters: SearchFilters = {
  query: '',
  types: [],
  statuses: [],
  severities: [],
};

/**
 * Hook for searching and filtering graph nodes
 */
export const useGraphSearch = (nodes: RCANode[]) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Text search with fuzzy matching for better UX
      if (filters.query) {
        const matchesQuery =
          fuzzyMatch(node.label, filters.query) ||
          fuzzyMatch(node.description, filters.query) ||
          fuzzyMatch(node.type, filters.query) ||
          fuzzyMatch(node.id, filters.query);

        if (!matchesQuery) return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(node.type)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(node.status)) {
        return false;
      }

      // Severity filter
      if (filters.severities.length > 0) {
        if (!node.severity || !filters.severities.includes(node.severity)) {
          return false;
        }
      }

      // Confidence range filter
      if (node.confidence !== undefined) {
        if (filters.minConfidence !== undefined && node.confidence < filters.minConfidence) {
          return false;
        }
        if (filters.maxConfidence !== undefined && node.confidence > filters.maxConfidence) {
          return false;
        }
      }

      return true;
    });
  }, [nodes, filters]);

  const highlightedNodeIds = useMemo(() => {
    return new Set(filteredNodes.map((node) => node.id));
  }, [filteredNodes]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.query !== '' ||
      filters.types.length > 0 ||
      filters.statuses.length > 0 ||
      filters.severities.length > 0 ||
      filters.minConfidence !== undefined ||
      filters.maxConfidence !== undefined
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredNodes,
    highlightedNodeIds,
    hasActiveFilters,
    resultCount: filteredNodes.length,
    totalCount: nodes.length,
  };
};

/**
 * Fuzzy search function for better matching
 */
export const fuzzyMatch = (text: string, query: string): boolean => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let textIndex = 0;
  let queryIndex = 0;

  while (textIndex < textLower.length && queryIndex < queryLower.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === queryLower.length;
};

/**
 * Get available filter options from nodes
 */
export const getFilterOptions = (nodes: RCANode[]) => {
  const types = new Set<string>();
  const statuses = new Set<string>();
  const severities = new Set<string>();

  nodes.forEach((node) => {
    types.add(node.type);
    statuses.add(node.status);
    if (node.severity) {
      severities.add(node.severity);
    }
  });

  return {
    types: Array.from(types).sort(),
    statuses: Array.from(statuses).sort(),
    severities: Array.from(severities).sort(),
  };
};
