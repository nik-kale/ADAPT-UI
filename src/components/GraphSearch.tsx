import React from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { useGraphSearch, getFilterOptions } from '@hooks/useGraphSearch';
import { useDebounce } from '@utils/performance';
import { announceToScreenReader } from '@utils/accessibility';
import { RCANode } from '@types/index';

interface GraphSearchProps {
  nodes: RCANode[];
  onFilterChange?: (highlightedNodeIds: Set<string>) => void;
}

export const GraphSearch: React.FC<GraphSearchProps> = ({ nodes, onFilterChange }) => {
  const [searchInput, setSearchInput] = React.useState('');

  const {
    filters,
    updateFilter,
    clearFilters,
    highlightedNodeIds,
    hasActiveFilters,
    resultCount,
    totalCount,
  } = useGraphSearch(nodes);

  const [showFilters, setShowFilters] = React.useState(false);
  const filterOptions = React.useMemo(() => getFilterOptions(nodes), [nodes]);

  // Debounced search update
  const debouncedUpdateFilter = useDebounce((query: string) => {
    updateFilter('query', query);
  }, 300);

  // Notify parent and announce to screen readers
  React.useEffect(() => {
    onFilterChange?.(highlightedNodeIds);

    // Announce filter results to screen readers
    if (hasActiveFilters) {
      announceToScreenReader(`Found ${resultCount} matching nodes out of ${totalCount} total nodes`);
    }
  }, [highlightedNodeIds, onFilterChange, hasActiveFilters, resultCount, totalCount]);

  return (
    <div className="bg-adapt-bg-secondary rounded-lg border border-adapt-border p-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-adapt-text-muted" size={20} />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            debouncedUpdateFilter(e.target.value);
          }}
          className="w-full pl-10 pr-10 py-2 bg-adapt-bg-tertiary border border-adapt-border rounded-lg text-adapt-text-primary placeholder-adapt-text-muted focus:outline-none focus:ring-2 focus:ring-adapt-primary"
          aria-label="Search graph nodes"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput('');
              updateFilter('query', '');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-adapt-text-muted hover:text-adapt-text-primary"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 mt-3 text-sm text-adapt-text-secondary hover:text-adapt-text-primary"
        aria-expanded={showFilters}
        aria-controls="filter-panel"
      >
        <Filter size={16} />
        <span>Filters</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div id="filter-panel" className="mt-3 space-y-3 pt-3 border-t border-adapt-border">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-adapt-text-primary mb-2">
              Node Types
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.types.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    const newTypes = filters.types.includes(type)
                      ? filters.types.filter((t) => t !== type)
                      : [...filters.types, type];
                    updateFilter('types', newTypes);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.types.includes(type)
                      ? 'bg-adapt-primary text-white'
                      : 'bg-adapt-bg-tertiary text-adapt-text-secondary hover:bg-adapt-bg-tertiary/80'
                  }`}
                  aria-pressed={filters.types.includes(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-adapt-text-primary mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    const newStatuses = filters.statuses.includes(status)
                      ? filters.statuses.filter((s) => s !== status)
                      : [...filters.statuses, status];
                    updateFilter('statuses', newStatuses);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.statuses.includes(status)
                      ? 'bg-adapt-primary text-white'
                      : 'bg-adapt-bg-tertiary text-adapt-text-secondary hover:bg-adapt-bg-tertiary/80'
                  }`}
                  aria-pressed={filters.statuses.includes(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          {filterOptions.severities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-adapt-text-primary mb-2">
                Severity
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.severities.map((severity) => (
                  <button
                    key={severity}
                    onClick={() => {
                      const newSeverities = filters.severities.includes(severity)
                        ? filters.severities.filter((s) => s !== severity)
                        : [...filters.severities, severity];
                      updateFilter('severities', newSeverities);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.severities.includes(severity)
                        ? 'bg-adapt-primary text-white'
                        : 'bg-adapt-bg-tertiary text-adapt-text-secondary hover:bg-adapt-bg-tertiary/80'
                    }`}
                    aria-pressed={filters.severities.includes(severity)}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Range */}
          <div>
            <label className="block text-sm font-medium text-adapt-text-primary mb-2">
              Confidence Range
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                value={filters.minConfidence ?? ''}
                onChange={(e) =>
                  updateFilter('minConfidence', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-20 px-2 py-1 bg-adapt-bg-tertiary border border-adapt-border rounded text-sm text-adapt-text-primary focus:outline-none focus:ring-2 focus:ring-adapt-primary"
                aria-label="Minimum confidence"
              />
              <span className="text-adapt-text-muted">-</span>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                value={filters.maxConfidence ?? ''}
                onChange={(e) =>
                  updateFilter('maxConfidence', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-20 px-2 py-1 bg-adapt-bg-tertiary border border-adapt-border rounded text-sm text-adapt-text-primary focus:outline-none focus:ring-2 focus:ring-adapt-primary"
                aria-label="Maximum confidence"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-3 pt-3 border-t border-adapt-border flex items-center justify-between">
        <span className="text-sm text-adapt-text-muted">
          {hasActiveFilters ? (
            <>
              Showing <span className="font-semibold text-adapt-text-primary">{resultCount}</span> of{' '}
              {totalCount} nodes
            </>
          ) : (
            <>{totalCount} nodes total</>
          )}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-adapt-primary hover:underline"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};
