import { useState, useEffect, DependencyList } from 'react';
import { ApiResponse } from '../api/schemas';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FetchOptions {
  /**
   * Skip the initial fetch on mount
   * Useful when you want to trigger the fetch manually
   */
  skip?: boolean;
  
  /**
   * Retry the fetch on error
   */
  retry?: {
    attempts: number;
    delayMs: number;
  };
}

/**
 * Generic hook for fetching data with automatic loading/error state management
 * 
 * @param fetcher - Async function that performs the fetch operation
 * @param deps - Dependency array that triggers a re-fetch when changed
 * @param options - Optional configuration for fetch behavior
 * 
 * @returns Object containing data, loading state, and error state
 * 
 * @example
 * ```tsx
 * const { data, loading, error } = useFetch(
 *   () => client.getRCAGraph(incidentId),
 *   [incidentId]
 * );
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <RCAGraphViewer graph={data} />;
 * ```
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<ApiResponse<T>>,
  deps: DependencyList = [],
  options: FetchOptions = {}
): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !options.skip,
    error: null,
  });

  const executeFetch = async (signal: AbortSignal, attempt = 1) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetcher(signal);

      // Check if request was aborted
      if (signal.aborted) {
        return;
      }

      if (response.success && response.data !== undefined) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        // Handle error response
        const errorMessage = response.error?.message || 'Request failed';
        
        // Check if we should retry
        if (options.retry && attempt < options.retry.attempts) {
          setTimeout(() => {
            if (!signal.aborted) {
              executeFetch(signal, attempt + 1);
            }
          }, options.retry.delayMs);
          return;
        }
        
        setState({ data: null, loading: false, error: errorMessage });
      }
    } catch (err) {
      // Don't update state if request was aborted
      if (signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Check if we should retry
      if (options.retry && attempt < options.retry.attempts) {
        setTimeout(() => {
          if (!signal.aborted) {
            executeFetch(signal, attempt + 1);
          }
        }, options.retry.delayMs);
        return;
      }
      
      setState({ data: null, loading: false, error: errorMessage });
    }
  };

  useEffect(() => {
    if (options.skip) {
      return;
    }

    const controller = new AbortController();
    executeFetch(controller.signal);

    // Cleanup: abort the fetch if component unmounts or deps change
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Manual refetch function
  const refetch = () => {
    const controller = new AbortController();
    executeFetch(controller.signal);
  };

  return { ...state, refetch };
}

